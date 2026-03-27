package orders

import (
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"
)

// ─────────────────────────────────────────────
// Domain types
// ─────────────────────────────────────────────

type Side   int
type Type   int
type Status int

const (
	SideBuy  Side = 1
	SideSell Side = 2

	TypeMarket Type = 1
	TypeLimit  Type = 2
	TypeStop   Type = 3

	StatusPending   Status = 1
	StatusOpen      Status = 2
	StatusFilled    Status = 3
	StatusPartial   Status = 4
	StatusCancelled Status = 5
	StatusRejected  Status = 6
)

type Order struct {
	OrderID      string
	TraderID     string
	Symbol       string
	Side         Side
	Type         Type
	Status       Status
	Quantity     float64
	Price        float64
	FilledQty    float64
	AvgFillPrice float64
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type Trade struct {
	TradeID    string
	Symbol     string
	Price      float64
	Quantity   float64
	BuyerID    string
	SellerID   string
	ExecutedAt time.Time
}

// ─────────────────────────────────────────────
// Order Book
// ─────────────────────────────────────────────

type Book struct {
	mu     sync.Mutex
	symbol string
	bids   []*Order // sorted descending by price
	asks   []*Order // sorted ascending  by price
	trades []*Trade
}

func newBook(symbol string) *Book {
	return &Book{symbol: symbol}
}

func (b *Book) addOrder(o *Order) []*Trade {
	b.mu.Lock()
	defer b.mu.Unlock()

	var matched []*Trade

	if o.Side == SideBuy {
		matched = b.matchBuy(o)
		if o.Status != StatusFilled {
			o.Status = StatusOpen
			b.bids = append(b.bids, o)
			sort.Slice(b.bids, func(i, j int) bool {
				return b.bids[i].Price > b.bids[j].Price
			})
		}
	} else {
		matched = b.matchSell(o)
		if o.Status != StatusFilled {
			o.Status = StatusOpen
			b.asks = append(b.asks, o)
			sort.Slice(b.asks, func(i, j int) bool {
				return b.asks[i].Price < b.asks[j].Price
			})
		}
	}
	return matched
}

func (b *Book) matchBuy(buy *Order) []*Trade {
	var trades []*Trade
	remaining := buy.Quantity - buy.FilledQty

	for len(b.asks) > 0 && remaining > 0 {
		ask := b.asks[0]
		if buy.Type == TypeLimit && buy.Price < ask.Price {
			break
		}
		fillQty := min64(remaining, ask.Quantity-ask.FilledQty)
		fillPrice := ask.Price

		trade := &Trade{
			TradeID:    uuid.NewString(),
			Symbol:     b.symbol,
			Price:      fillPrice,
			Quantity:   fillQty,
			BuyerID:    buy.TraderID,
			SellerID:   ask.TraderID,
			ExecutedAt: time.Now(),
		}
		trades = append(trades, trade)
		b.trades = append(b.trades, trade)

		// Update avg fill price BEFORE incrementing FilledQty
		updateAvgFill(buy, fillPrice, fillQty)
		updateAvgFill(ask, fillPrice, fillQty)

		ask.FilledQty += fillQty
		buy.FilledQty += fillQty
		remaining -= fillQty

		if ask.FilledQty >= ask.Quantity {
			ask.Status = StatusFilled
			ask.UpdatedAt = time.Now()
			b.asks = b.asks[1:]
		} else {
			ask.Status = StatusPartial
			ask.UpdatedAt = time.Now()
		}
	}

	if buy.FilledQty >= buy.Quantity {
		buy.Status = StatusFilled
	} else if buy.FilledQty > 0 {
		buy.Status = StatusPartial
	}
	buy.UpdatedAt = time.Now()
	return trades
}

func (b *Book) matchSell(sell *Order) []*Trade {
	var trades []*Trade
	remaining := sell.Quantity - sell.FilledQty

	for len(b.bids) > 0 && remaining > 0 {
		bid := b.bids[0]
		if sell.Type == TypeLimit && sell.Price > bid.Price {
			break
		}
		fillQty := min64(remaining, bid.Quantity-bid.FilledQty)
		fillPrice := bid.Price

		trade := &Trade{
			TradeID:    uuid.NewString(),
			Symbol:     b.symbol,
			Price:      fillPrice,
			Quantity:   fillQty,
			BuyerID:    bid.TraderID,
			SellerID:   sell.TraderID,
			ExecutedAt: time.Now(),
		}
		trades = append(trades, trade)
		b.trades = append(b.trades, trade)

		// Update avg fill price BEFORE incrementing FilledQty
		updateAvgFill(bid, fillPrice, fillQty)
		updateAvgFill(sell, fillPrice, fillQty)

		bid.FilledQty  += fillQty
		sell.FilledQty += fillQty
		remaining      -= fillQty

		if bid.FilledQty >= bid.Quantity {
			bid.Status = StatusFilled
			bid.UpdatedAt = time.Now()
			b.bids = b.bids[1:]
		} else {
			bid.Status = StatusPartial
			bid.UpdatedAt = time.Now()
		}
	}

	if sell.FilledQty >= sell.Quantity {
		sell.Status = StatusFilled
	} else if sell.FilledQty > 0 {
		sell.Status = StatusPartial
	}
	sell.UpdatedAt = time.Now()
	return trades
}

func (b *Book) cancel(orderID string) error {
	b.mu.Lock()
	defer b.mu.Unlock()

	for i, o := range b.bids {
		if o.OrderID == orderID {
			b.bids[i].Status = StatusCancelled
			b.bids[i].UpdatedAt = time.Now()
			b.bids = append(b.bids[:i], b.bids[i+1:]...)
			return nil
		}
	}
	for i, o := range b.asks {
		if o.OrderID == orderID {
			b.asks[i].Status = StatusCancelled
			b.asks[i].UpdatedAt = time.Now()
			b.asks = append(b.asks[:i], b.asks[i+1:]...)
			return nil
		}
	}
	return fmt.Errorf("order %s not found in book", orderID)
}

// ─────────────────────────────────────────────
// Order Store (all orders by ID)
// ─────────────────────────────────────────────

type Store struct {
	mu    sync.RWMutex
	orders map[string]*Order
	books  map[string]*Book
}

func NewStore() *Store {
	return &Store{
		orders: make(map[string]*Order),
		books:  make(map[string]*Book),
	}
}

func (s *Store) PlaceOrder(traderID, symbol string, side Side, otype Type, qty, price float64) (*Order, []*Trade, error) {
	o := &Order{
		OrderID:   uuid.NewString(),
		TraderID:  traderID,
		Symbol:    symbol,
		Side:      side,
		Type:      otype,
		Status:    StatusPending,
		Quantity:  qty,
		Price:     price,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	s.mu.Lock()
	book, ok := s.books[symbol]
	if !ok {
		book = newBook(symbol)
		s.books[symbol] = book
	}
	s.orders[o.OrderID] = o
	s.mu.Unlock()

	trades := book.addOrder(o)
	return o, trades, nil
}

func (s *Store) CancelOrder(orderID, traderID string) error {
	s.mu.Lock()
	o, ok := s.orders[orderID]
	if !ok {
		s.mu.Unlock()
		return fmt.Errorf("order %s not found", orderID)
	}
	if o.TraderID != traderID {
		s.mu.Unlock()
		return fmt.Errorf("order does not belong to trader")
	}
	if o.Status == StatusFilled || o.Status == StatusCancelled {
		s.mu.Unlock()
		return fmt.Errorf("order cannot be cancelled (status: %d)", o.Status)
	}
	book := s.books[o.Symbol]
	s.mu.Unlock()

	if book != nil {
		_ = book.cancel(orderID)
	}
	return nil
}

func (s *Store) GetOrder(orderID string) (*Order, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	o, ok := s.orders[orderID]
	if !ok {
		return nil, fmt.Errorf("order %s not found", orderID)
	}
	cp := *o
	return &cp, nil
}

func (s *Store) ListOrders(traderID string, status Status, symbol string) []*Order {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var out []*Order
	for _, o := range s.orders {
		if o.TraderID != traderID {
			continue
		}
		if status != 0 && o.Status != status {
			continue
		}
		if symbol != "" && o.Symbol != symbol {
			continue
		}
		cp := *o
		out = append(out, &cp)
	}
	return out
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

func updateAvgFill(o *Order, fillPrice, fillQty float64) {
	// Called BEFORE o.FilledQty is incremented by the caller.
	prevFilled := o.FilledQty
	newFilled  := prevFilled + fillQty
	if newFilled > 0 {
		o.AvgFillPrice = (o.AvgFillPrice*prevFilled + fillPrice*fillQty) / newFilled
	}
}

func min64(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
