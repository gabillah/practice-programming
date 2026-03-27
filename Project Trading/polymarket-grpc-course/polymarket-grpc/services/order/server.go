// Package order implements the OrderService gRPC server and a simple
// continuous double-auction matching engine.
package order

import (
	"context"
	"fmt"
	"math"
	"sort"
	"sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/polymarket-grpc/db"
	"github.com/polymarket-grpc/middleware"
	"github.com/polymarket-grpc/models"
)

// -----------------------------------------------------------------
//  Request / Response types
// -----------------------------------------------------------------

type PlaceOrderRequest struct {
	UserID   string
	MarketID string
	Side     models.OrderSide
	Type     models.OrderType
	Amount   float64
	Price    float64
	Outcome  models.MarketOutcome
}
type PlaceOrderResponse struct{ Order *OrderProto }

type GetOrderRequest struct{ ID string }
type GetOrderResponse struct{ Order *OrderProto }

type CancelOrderRequest struct {
	OrderID string
	UserID  string
}
type CancelOrderResponse struct{ Order *OrderProto }

type ListOrdersRequest struct {
	UserID   string
	MarketID string
	Status   models.OrderStatus
	Page     int
	PerPage  int
}
type ListOrdersResponse struct {
	Orders     []*OrderProto
	Page       int
	PerPage    int
	TotalPages int
	TotalItems int64
}

type GetOrderBookRequest struct{ MarketID string }

type OrderBookProto struct {
	MarketID  string
	Bids      []OrderBookEntryProto
	Asks      []OrderBookEntryProto
	Timestamp time.Time
}

type OrderBookEntryProto struct {
	Price    float64
	Quantity float64
}

type OrderUpdate struct {
	Order     *OrderProto
	EventType string // "created" | "filled" | "cancelled" | "rejected"
}

type OrderProto struct {
	ID        string
	UserID    string
	MarketID  string
	Side      models.OrderSide
	Type      models.OrderType
	Status    models.OrderStatus
	Amount    float64
	Price     float64
	Filled    float64
	Remaining float64
	Outcome   models.MarketOutcome
	CreatedAt time.Time
	UpdatedAt time.Time
}

// -----------------------------------------------------------------
//  Matching Engine
// -----------------------------------------------------------------

// MatchingEngine is a simple continuous double-auction engine.
// For a real system you'd use a price-time priority queue per market/outcome.
type MatchingEngine struct {
	mu      sync.Mutex
	store   *db.OrderStore
	wallets *db.WalletStore
	markets *db.MarketStore
	subs    map[string][]chan *OrderUpdate // market_id -> subscribers
	logger  *zap.Logger
}

func NewMatchingEngine(
	orderStore *db.OrderStore,
	walletStore *db.WalletStore,
	marketStore *db.MarketStore,
	logger *zap.Logger,
) *MatchingEngine {
	return &MatchingEngine{
		store:   orderStore,
		wallets: walletStore,
		markets: marketStore,
		subs:    make(map[string][]chan *OrderUpdate),
		logger:  logger,
	}
}

// Match attempts to fill an incoming order against resting orders.
func (e *MatchingEngine) Match(incoming *models.Order) ([]*models.Order, error) {
	e.mu.Lock()
	defer e.mu.Unlock()

	// Fetch resting orders for the same market / opposite side / same outcome
	oppSide := models.OrderSideSell
	if incoming.Side == models.OrderSideSell {
		oppSide = models.OrderSideBuy
	}

	restingOrders, _ := e.store.List("", incoming.MarketID, models.OrderStatusOpen, 1, 1000)
	var candidates []*models.Order
	for _, o := range restingOrders {
		if o.Side == oppSide && o.Outcome == incoming.Outcome {
			candidates = append(candidates, o)
		}
	}

	// Sort: buys descending price, sells ascending price
	sort.Slice(candidates, func(i, j int) bool {
		if incoming.Side == models.OrderSideBuy {
			return candidates[i].Price > candidates[j].Price
		}
		return candidates[i].Price < candidates[j].Price
	})

	matched := make([]*models.Order, 0)
	remaining := incoming.Amount

	for _, resting := range candidates {
		if remaining <= 0 {
			break
		}

		// Price check
		if incoming.Type == models.OrderTypeLimit {
			if incoming.Side == models.OrderSideBuy && incoming.Price < resting.Price {
				break
			}
			if incoming.Side == models.OrderSideSell && incoming.Price > resting.Price {
				break
			}
		}

		fillQty := math.Min(remaining, resting.Remaining)
		fillPrice := resting.Price // maker price

		// Update resting order
		resting.Filled += fillQty
		resting.Remaining -= fillQty
		if resting.Remaining <= 0.0001 {
			resting.Status = models.OrderStatusFilled
		}
		_, _ = e.store.Update(resting)

		// Settle wallets
		e.settleMatch(incoming.UserID, resting.UserID, fillQty, fillPrice, incoming.Side)

		remaining -= fillQty
		matched = append(matched, resting)

		e.logger.Info("order matched",
			zap.String("maker", resting.ID),
			zap.Float64("qty", fillQty),
			zap.Float64("price", fillPrice),
		)
	}

	incoming.Filled = incoming.Amount - remaining
	incoming.Remaining = remaining
	if remaining <= 0.0001 {
		incoming.Status = models.OrderStatusFilled
	} else if incoming.Filled > 0 {
		incoming.Status = models.OrderStatusOpen
	} else {
		incoming.Status = models.OrderStatusOpen
	}

	return matched, nil
}

func (e *MatchingEngine) settleMatch(takerID, makerID string, qty, price float64, takerSide models.OrderSide) {
	cost := qty * price
	_ = cost

	if takerSide == models.OrderSideBuy {
		_, _ = e.wallets.SettleOrder(takerID, qty, price, models.TransactionTypeBuy)
		_, _ = e.wallets.SettleOrder(makerID, qty, price, models.TransactionTypeSell)
	} else {
		_, _ = e.wallets.SettleOrder(takerID, qty, price, models.TransactionTypeSell)
		_, _ = e.wallets.SettleOrder(makerID, qty, price, models.TransactionTypeBuy)
	}
}

// Subscribe returns a channel that receives OrderUpdates for a market.
func (e *MatchingEngine) Subscribe(marketID string) chan *OrderUpdate {
	e.mu.Lock()
	defer e.mu.Unlock()
	ch := make(chan *OrderUpdate, 64)
	e.subs[marketID] = append(e.subs[marketID], ch)
	return ch
}

// Unsubscribe removes a subscriber channel.
func (e *MatchingEngine) Unsubscribe(marketID string, ch chan *OrderUpdate) {
	e.mu.Lock()
	defer e.mu.Unlock()
	subs := e.subs[marketID]
	for i, s := range subs {
		if s == ch {
			e.subs[marketID] = append(subs[:i], subs[i+1:]...)
			close(ch)
			return
		}
	}
}

func (e *MatchingEngine) publish(marketID string, upd *OrderUpdate) {
	for _, ch := range e.subs[marketID] {
		select {
		case ch <- upd:
		default:
			// slow consumer — skip
		}
	}
}

// Update persists an order change (exposed so Server can call it).
func (e *MatchingEngine) Update(o *models.Order) (*models.Order, error) {
	return e.store.Update(o)
}

// -----------------------------------------------------------------
//  Server
// -----------------------------------------------------------------

type Server struct {
	store   *db.OrderStore
	wallets *db.WalletStore
	markets *db.MarketStore
	engine  *MatchingEngine
	logger  *zap.Logger
}

func NewServer(
	orderStore *db.OrderStore,
	walletStore *db.WalletStore,
	marketStore *db.MarketStore,
	logger *zap.Logger,
) *Server {
	engine := NewMatchingEngine(orderStore, walletStore, marketStore, logger)
	return &Server{
		store:   orderStore,
		wallets: walletStore,
		markets: marketStore,
		engine:  engine,
		logger:  logger,
	}
}

// PlaceOrder validates, persists, then runs the matching engine.
func (s *Server) PlaceOrder(ctx context.Context, req *PlaceOrderRequest) (*PlaceOrderResponse, error) {
	if err := s.validatePlaceOrder(req); err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "%v", err)
	}

	callerID, _ := middleware.GetUserIDFromCtx(ctx)
	if req.UserID == "" {
		req.UserID = callerID
	}

	// Verify market exists and is active
	m, err := s.markets.GetByID(req.MarketID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "market not found: %v", err)
	}
	if m.Status != models.MarketStatusActive {
		return nil, status.Errorf(codes.FailedPrecondition, "market is not active (status=%s)", m.Status)
	}

	// Lock funds before accepting order
	cost := req.Amount * req.Price
	if err := s.wallets.LockFunds(req.UserID, cost); err != nil {
		return nil, status.Errorf(codes.FailedPrecondition, "insufficient funds: %v", err)
	}

	order := &models.Order{
		UserID:   req.UserID,
		MarketID: req.MarketID,
		Side:     req.Side,
		Type:     req.Type,
		Amount:   req.Amount,
		Price:    req.Price,
		Outcome:  req.Outcome,
	}

	created, err := s.store.Create(order)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to persist order: %v", err)
	}

	// Run matching engine
	_, matchErr := s.engine.Match(created)
	if matchErr != nil {
		s.logger.Warn("matching engine error", zap.Error(matchErr))
	}

	// Persist final order state
	_, _ = s.store.Update(created)

	s.logger.Info("order placed",
		zap.String("id", created.ID),
		zap.String("user", created.UserID),
		zap.String("market", created.MarketID),
		zap.String("side", string(created.Side)),
		zap.Float64("amount", created.Amount),
		zap.Float64("price", created.Price),
	)

	return &PlaceOrderResponse{Order: modelToProto(created)}, nil
}

// GetOrder retrieves an order by ID.
func (s *Server) GetOrder(ctx context.Context, req *GetOrderRequest) (*GetOrderResponse, error) {
	if req.ID == "" {
		return nil, status.Error(codes.InvalidArgument, "order id required")
	}
	o, err := s.store.GetByID(req.ID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "%v", err)
	}
	// Ensure caller owns order or is admin
	callerID, _ := middleware.GetUserIDFromCtx(ctx)
	role, _ := middleware.GetRoleFromCtx(ctx)
	if o.UserID != callerID && role != string(models.UserRoleAdmin) {
		return nil, status.Error(codes.PermissionDenied, "access denied")
	}
	return &GetOrderResponse{Order: modelToProto(o)}, nil
}

// CancelOrder cancels an open order and releases locked funds.
func (s *Server) CancelOrder(ctx context.Context, req *CancelOrderRequest) (*CancelOrderResponse, error) {
	if req.OrderID == "" {
		return nil, status.Error(codes.InvalidArgument, "order id required")
	}
	callerID, _ := middleware.GetUserIDFromCtx(ctx)
	if req.UserID == "" {
		req.UserID = callerID
	}
	o, err := s.store.Cancel(req.OrderID, req.UserID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "%v", err)
	}
	s.logger.Info("order cancelled", zap.String("id", o.ID))
	return &CancelOrderResponse{Order: modelToProto(o)}, nil
}

// ListOrders returns filtered, paginated orders.
func (s *Server) ListOrders(ctx context.Context, req *ListOrdersRequest) (*ListOrdersResponse, error) {
	callerID, _ := middleware.GetUserIDFromCtx(ctx)
	role, _ := middleware.GetRoleFromCtx(ctx)

	// Non-admins can only see their own orders
	if role != string(models.UserRoleAdmin) {
		req.UserID = callerID
	}

	page, perPage := normalise(req.Page, req.PerPage)
	orders, total := s.store.List(req.UserID, req.MarketID, req.Status, page, perPage)

	protos := make([]*OrderProto, 0, len(orders))
	for _, o := range orders {
		protos = append(protos, modelToProto(o))
	}
	totalPages := int(total) / perPage
	if int(total)%perPage != 0 {
		totalPages++
	}
	return &ListOrdersResponse{
		Orders:     protos,
		Page:       page,
		PerPage:    perPage,
		TotalPages: totalPages,
		TotalItems: total,
	}, nil
}

// GetOrderBook returns the current level-2 order book for a market.
func (s *Server) GetOrderBook(ctx context.Context, req *GetOrderBookRequest) (*OrderBookProto, error) {
	if req.MarketID == "" {
		return nil, status.Error(codes.InvalidArgument, "market_id required")
	}
	book := s.store.GetOrderBook(req.MarketID)
	return orderBookToProto(book), nil
}

// StreamOrderBook streams order book snapshots as they change.
func (s *Server) StreamOrderBook(
	req *GetOrderBookRequest,
	stream interface {
		Send(*OrderBookProto) error
		Context() context.Context
	},
) error {
	if req.MarketID == "" {
		return status.Error(codes.InvalidArgument, "market_id required")
	}

	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-stream.Context().Done():
			return nil
		case <-ticker.C:
			book := s.store.GetOrderBook(req.MarketID)
			if err := stream.Send(orderBookToProto(book)); err != nil {
				return err
			}
		}
	}
}

// -----------------------------------------------------------------
//  Helpers
// -----------------------------------------------------------------

func (s *Server) validatePlaceOrder(req *PlaceOrderRequest) error {
	if req.MarketID == "" {
		return fmt.Errorf("market_id is required")
	}
	if req.Amount <= 0 {
		return fmt.Errorf("amount must be positive, got %.4f", req.Amount)
	}
	if req.Type == models.OrderTypeLimit && req.Price <= 0 {
		return fmt.Errorf("limit orders require a positive price")
	}
	if req.Outcome != models.MarketOutcomeYes && req.Outcome != models.MarketOutcomeNo {
		return fmt.Errorf("outcome must be YES or NO")
	}
	return nil
}

func modelToProto(o *models.Order) *OrderProto {
	return &OrderProto{
		ID:        o.ID,
		UserID:    o.UserID,
		MarketID:  o.MarketID,
		Side:      o.Side,
		Type:      o.Type,
		Status:    o.Status,
		Amount:    o.Amount,
		Price:     o.Price,
		Filled:    o.Filled,
		Remaining: o.Remaining,
		Outcome:   o.Outcome,
		CreatedAt: o.CreatedAt,
		UpdatedAt: o.UpdatedAt,
	}
}

func orderBookToProto(b *models.OrderBook) *OrderBookProto {
	p := &OrderBookProto{
		MarketID:  b.MarketID,
		Timestamp: b.Timestamp,
		Bids:      make([]OrderBookEntryProto, 0, len(b.Bids)),
		Asks:      make([]OrderBookEntryProto, 0, len(b.Asks)),
	}
	for _, e := range b.Bids {
		p.Bids = append(p.Bids, OrderBookEntryProto{Price: e.Price, Quantity: e.Quantity})
	}
	for _, e := range b.Asks {
		p.Asks = append(p.Asks, OrderBookEntryProto{Price: e.Price, Quantity: e.Quantity})
	}
	return p
}

func normalise(page, perPage int) (int, int) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	return page, perPage
}
