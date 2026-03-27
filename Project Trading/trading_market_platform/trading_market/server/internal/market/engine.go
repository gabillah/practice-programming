package market

import (
	"fmt"
	"sync"
	"time"
)

// TradingHours defines when the market is open (09:00 – 15:00 local time).
const (
	MarketOpenHour    = 9
	MarketCloseHour   = 15
	CircuitBreakerPct = -5.0 // halt if daily change drops below -5 %
	MarketTimezone    = "Asia/Jakarta" // change to your exchange timezone
)

// ─────────────────────────────────────────────
// Price book entry
// ─────────────────────────────────────────────

type PriceData struct {
	Symbol     string
	Bid        float64
	Ask        float64
	Last       float64
	Open       float64
	High       float64
	Low        float64
	Change     float64
	ChangePct  float64
	Volume     int64
	UpdatedAt  time.Time
}

func (p *PriceData) DailyChangePct() float64 {
	if p.Open == 0 {
		return 0
	}
	return ((p.Last - p.Open) / p.Open) * 100
}

// ─────────────────────────────────────────────
// Market Engine
// ─────────────────────────────────────────────

type Engine struct {
	mu sync.RWMutex

	prices         map[string]*PriceData
	tradingHalted  bool
	haltReason     string
	haltedAt       time.Time
	location       *time.Location

	// subscribers for streaming
	priceSubs map[string][]chan *PriceData
	tradeSubs map[string][]chan *TradeEvent
}

type TradeEvent struct {
	TradeID    string
	Symbol     string
	Price      float64
	Quantity   float64
	BuyerID    string
	SellerID   string
	ExecutedAt time.Time
}

func NewEngine() (*Engine, error) {
	loc, err := time.LoadLocation(MarketTimezone)
	if err != nil {
		// fallback to UTC+7 if timezone db not available
		loc = time.FixedZone("WIB", 7*60*60)
	}
	e := &Engine{
		prices:    make(map[string]*PriceData),
		priceSubs: make(map[string][]chan *PriceData),
		tradeSubs: make(map[string][]chan *TradeEvent),
		location:  loc,
	}
	e.seedPrices()
	return e, nil
}

// seedPrices initialises demo securities with opening prices.
func (e *Engine) seedPrices() {
	seeds := []struct {
		symbol string
		open   float64
	}{
		{"MYCO-A", 10_000},
		{"MYCO-B", 5_000},
		{"MYCO-C", 2_500},
		{"MYCO-D", 1_000},
	}
	for _, s := range seeds {
		e.prices[s.symbol] = &PriceData{
			Symbol:    s.symbol,
			Open:      s.open,
			Last:      s.open,
			Bid:       s.open - 10,
			Ask:       s.open + 10,
			High:      s.open,
			Low:       s.open,
			ChangePct: 0,
			UpdatedAt: time.Now(),
		}
	}
}

// ─────────────────────────────────────────────
// Market status helpers
// ─────────────────────────────────────────────

// IsOpen returns true when current time is within trading hours [09:00, 15:00).
func (e *Engine) IsOpen() bool {
	now := time.Now().In(e.location)
	// Express current time and boundaries in total minutes since midnight
	currentMinutes := now.Hour()*60 + now.Minute()
	openMinutes    := MarketOpenHour * 60      // 540
	closeMinutes   := MarketCloseHour * 60     // 900
	return currentMinutes >= openMinutes && currentMinutes < closeMinutes
}

// IsTradingAllowed returns true only when market is open AND not halted.
func (e *Engine) IsTradingAllowed() (bool, string) {
	if !e.IsOpen() {
		now := time.Now().In(e.location)
		return false, fmt.Sprintf(
			"Market is closed. Trading hours: %02d:00 – %02d:00 (%s). Current time: %s",
			MarketOpenHour, MarketCloseHour, e.location.String(), now.Format("15:04:05"),
		)
	}
	e.mu.RLock()
	defer e.mu.RUnlock()
	if e.tradingHalted {
		return false, e.haltReason
	}
	return true, ""
}

// checkCircuitBreaker evaluates if any security has breached the -5% threshold.
// If so, trading is halted for the remainder of the day.
func (e *Engine) checkCircuitBreaker(symbol string) {
	e.mu.Lock()
	defer e.mu.Unlock()

	if e.tradingHalted {
		return // already halted
	}

	p, ok := e.prices[symbol]
	if !ok {
		return
	}

	pct := p.DailyChangePct()
	if pct <= CircuitBreakerPct {
		e.tradingHalted = true
		e.haltedAt      = time.Now()
		e.haltReason    = fmt.Sprintf(
			"CIRCUIT BREAKER TRIGGERED: %s dropped %.2f%% (threshold %.0f%%). "+
				"Trading halted for the rest of the day.",
			symbol, pct, CircuitBreakerPct,
		)
		fmt.Printf("[CIRCUIT BREAKER] %s\n", e.haltReason)
	}
}

// ResetDailyState resets halt flag and re-seeds open prices at market open.
// Call this at 09:00 each day via a scheduler.
func (e *Engine) ResetDailyState() {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.tradingHalted = false
	e.haltReason    = ""
	for _, p := range e.prices {
		p.Open = p.Last // last session close becomes new open
		p.High = p.Last
		p.Low  = p.Last
		p.Volume = 0
	}
	fmt.Println("[ENGINE] Daily state reset. Market open.")
}

// ─────────────────────────────────────────────
// Price & Trade updates
// ─────────────────────────────────────────────

// UpdatePrice sets a new last-trade price and notifies subscribers.
func (e *Engine) UpdatePrice(symbol string, last, bid, ask float64, qty int64) error {
	e.mu.Lock()
	p, ok := e.prices[symbol]
	if !ok {
		e.mu.Unlock()
		return fmt.Errorf("unknown symbol: %s", symbol)
	}
	p.Last      = last
	p.Bid       = bid
	p.Ask       = ask
	p.Volume   += qty
	p.UpdatedAt = time.Now()
	if last > p.High { p.High = last }
	if last < p.Low  { p.Low  = last }
	p.Change    = last - p.Open
	p.ChangePct = p.DailyChangePct()
	snapshot := *p
	e.mu.Unlock()

	// Circuit breaker check (outside lock to avoid deadlock)
	e.checkCircuitBreaker(symbol)

	// Fan-out to price subscribers
	e.mu.RLock()
	subs := e.priceSubs[symbol]
	e.mu.RUnlock()
	for _, ch := range subs {
		cp := snapshot // unique copy per send to avoid data race
		select {
		case ch <- &cp:
		default:
		}
	}
	return nil
}

// PublishTrade broadcasts a completed trade to subscribers.
func (e *Engine) PublishTrade(t *TradeEvent) {
	e.mu.RLock()
	subs := e.tradeSubs[t.Symbol]
	e.mu.RUnlock()
	for _, ch := range subs {
		select {
		case ch <- t:
		default:
		}
	}
}

// GetPrice returns a snapshot of the current price for a symbol.
func (e *Engine) GetPrice(symbol string) (*PriceData, error) {
	e.mu.RLock()
	defer e.mu.RUnlock()
	p, ok := e.prices[symbol]
	if !ok {
		return nil, fmt.Errorf("unknown symbol: %s", symbol)
	}
	cp := *p
	return &cp, nil
}

// AllPrices returns all current price snapshots.
func (e *Engine) AllPrices() []*PriceData {
	e.mu.RLock()
	defer e.mu.RUnlock()
	out := make([]*PriceData, 0, len(e.prices))
	for _, p := range e.prices {
		cp := *p
		out = append(out, &cp)
	}
	return out
}

// ─────────────────────────────────────────────
// Pub-Sub management
// ─────────────────────────────────────────────

func (e *Engine) SubscribePrices(symbols []string) (map[string]chan *PriceData, func()) {
	channels := make(map[string]chan *PriceData)
	e.mu.Lock()
	for _, sym := range symbols {
		ch := make(chan *PriceData, 64)
		channels[sym] = ch
		e.priceSubs[sym] = append(e.priceSubs[sym], ch)
	}
	e.mu.Unlock()

	cleanup := func() {
		e.mu.Lock()
		defer e.mu.Unlock()
		for sym, ch := range channels {
			subs := e.priceSubs[sym]
			for i, s := range subs {
				if s == ch {
					e.priceSubs[sym] = append(subs[:i], subs[i+1:]...)
					break
				}
			}
			close(ch)
		}
	}
	return channels, cleanup
}

func (e *Engine) SubscribeTrades(symbol string) (chan *TradeEvent, func()) {
	ch := make(chan *TradeEvent, 64)
	e.mu.Lock()
	e.tradeSubs[symbol] = append(e.tradeSubs[symbol], ch)
	e.mu.Unlock()

	cleanup := func() {
		e.mu.Lock()
		defer e.mu.Unlock()
		subs := e.tradeSubs[symbol]
		for i, s := range subs {
			if s == ch {
				e.tradeSubs[symbol] = append(subs[:i], subs[i+1:]...)
				break
			}
		}
		close(ch)
	}
	return ch, cleanup
}

// HaltStatus returns the current halt state.
func (e *Engine) HaltStatus() (bool, string) {
	e.mu.RLock()
	defer e.mu.RUnlock()
	return e.tradingHalted, e.haltReason
}
