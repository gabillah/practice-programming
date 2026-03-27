package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"sync"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	authsvc "github.com/yourcompany/trading_market/server/internal/auth"
	marketsvc "github.com/yourcompany/trading_market/server/internal/market"
	ordersvc "github.com/yourcompany/trading_market/server/internal/orders"
	secsvc "github.com/yourcompany/trading_market/server/internal/securities"
	pb "github.com/yourcompany/trading_market/proto"
)

// ─────────────────────────────────────────────
// Server struct wiring all services
// ─────────────────────────────────────────────

type grpcServer struct {
	pb.UnimplementedMarketServiceServer
	pb.UnimplementedOrderServiceServer
	pb.UnimplementedTraderServiceServer

	engine   *marketsvc.Engine
	orders   *ordersvc.Store
	auth     *authsvc.Service
	registry *secsvc.Registry
}

// ─────────────────────────────────────────────
// MarketService handlers
// ─────────────────────────────────────────────

func (s *grpcServer) GetMarketStatus(_ context.Context, _ *pb.GetMarketStatusRequest) (*pb.GetMarketStatusResponse, error) {
	isOpen := s.engine.IsOpen()
	halted, haltReason := s.engine.HaltStatus()
	return &pb.GetMarketStatusResponse{
		Status: &pb.MarketStatus{
			IsOpen:                 isOpen,
			TradingHalted:          halted,
			HaltReason:             haltReason,
			OpenTime:               fmt.Sprintf("%02d:00", marketsvc.MarketOpenHour),
			CloseTime:              fmt.Sprintf("%02d:00", marketsvc.MarketCloseHour),
			Timezone:               marketsvc.MarketTimezone,
			CircuitBreakerThreshold: marketsvc.CircuitBreakerPct,
			LastUpdated:            timestamppb.Now(),
		},
	}, nil
}

func (s *grpcServer) ListSecurities(_ context.Context, _ *pb.ListSecuritiesRequest) (*pb.ListSecuritiesResponse, error) {
	secs := s.registry.List()
	out := make([]*pb.Security, len(secs))
	for i, sec := range secs {
		out[i] = secToProto(sec)
	}
	return &pb.ListSecuritiesResponse{Securities: out}, nil
}

func (s *grpcServer) GetSecurity(_ context.Context, req *pb.GetSecurityRequest) (*pb.GetSecurityResponse, error) {
	sec, err := s.registry.Get(req.Symbol)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, err.Error())
	}
	return &pb.GetSecurityResponse{Security: secToProto(sec)}, nil
}

func (s *grpcServer) GetPrice(_ context.Context, req *pb.GetPriceRequest) (*pb.GetPriceResponse, error) {
	p, err := s.engine.GetPrice(req.Symbol)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, err.Error())
	}
	return &pb.GetPriceResponse{Price: priceToProto(p)}, nil
}

func (s *grpcServer) SubscribePrices(req *pb.SubscribePricesRequest, stream pb.MarketService_SubscribePricesServer) error {
	channels, cleanup := s.engine.SubscribePrices(req.Symbols)
	defer cleanup() // closes all source channels → fan-in goroutines exit

	// Fan-in: merge all per-symbol channels into one merged channel.
	merged := make(chan *marketsvc.PriceData, 128)
	var wg sync.WaitGroup
	for _, ch := range channels {
		wg.Add(1)
		go func(c chan *marketsvc.PriceData) {
			defer wg.Done()
			for p := range c {
				merged <- p
			}
		}(ch)
	}
	// Close merged once all source goroutines finish.
	go func() { wg.Wait(); close(merged) }()

	for {
		select {
		case <-stream.Context().Done():
			return nil
		case p, ok := <-merged:
			if !ok {
				return nil // all source channels closed
			}
			if err := stream.Send(priceToProto(p)); err != nil {
				return err
			}
		}
	}
}

func (s *grpcServer) SubscribeTrades(req *pb.SubscribeTradesRequest, stream pb.MarketService_SubscribeTradesServer) error {
	ch, cleanup := s.engine.SubscribeTrades(req.Symbol)
	defer cleanup()

	for {
		select {
		case <-stream.Context().Done():
			return nil
		case t := <-ch:
			if err := stream.Send(tradeEventToProto(t)); err != nil {
				return err
			}
		}
	}
}

// ─────────────────────────────────────────────
// OrderService handlers
// ─────────────────────────────────────────────

func (s *grpcServer) PlaceOrder(_ context.Context, req *pb.PlaceOrderRequest) (*pb.PlaceOrderResponse, error) {
	allowed, reason := s.engine.IsTradingAllowed()
	if !allowed {
		return &pb.PlaceOrderResponse{
			Success: false,
			Message: reason,
		}, nil
	}

	if !s.registry.Exists(req.Symbol) {
		return nil, status.Errorf(codes.NotFound, "security %s not listed", req.Symbol)
	}

	side   := ordersvc.Side(req.Side)
	otype  := ordersvc.Type(req.Type)
	order, trades, err := s.orders.PlaceOrder(
		req.TraderId, req.Symbol, side, otype, req.Quantity, req.Price,
	)
	if err != nil {
		return nil, status.Errorf(codes.Internal, err.Error())
	}

	// Update market engine with trade prices
	for _, t := range trades {
		_ = s.engine.UpdatePrice(t.Symbol, t.Price, t.Price-10, t.Price+10, int64(t.Quantity))
		s.engine.PublishTrade(&marketsvc.TradeEvent{
			TradeID:    t.TradeID,
			Symbol:     t.Symbol,
			Price:      t.Price,
			Quantity:   t.Quantity,
			BuyerID:    t.BuyerID,
			SellerID:   t.SellerID,
			ExecutedAt: t.ExecutedAt,
		})
	}

	return &pb.PlaceOrderResponse{
		Order:   orderToProto(order),
		Success: true,
		Message: fmt.Sprintf("Order placed. %d trade(s) executed.", len(trades)),
	}, nil
}

func (s *grpcServer) CancelOrder(_ context.Context, req *pb.CancelOrderRequest) (*pb.CancelOrderResponse, error) {
	if err := s.orders.CancelOrder(req.OrderId, req.TraderId); err != nil {
		return &pb.CancelOrderResponse{Success: false, Message: err.Error()}, nil
	}
	return &pb.CancelOrderResponse{Success: true, Message: "Order cancelled"}, nil
}

func (s *grpcServer) GetOrder(_ context.Context, req *pb.GetOrderRequest) (*pb.GetOrderResponse, error) {
	o, err := s.orders.GetOrder(req.OrderId)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, err.Error())
	}
	return &pb.GetOrderResponse{Order: orderToProto(o)}, nil
}

func (s *grpcServer) ListOrders(_ context.Context, req *pb.ListOrdersRequest) (*pb.ListOrdersResponse, error) {
	list := s.orders.ListOrders(req.TraderId, ordersvc.Status(req.Status), req.Symbol)
	out := make([]*pb.Order, len(list))
	for i, o := range list {
		out[i] = orderToProto(o)
	}
	return &pb.ListOrdersResponse{Orders: out}, nil
}

// ─────────────────────────────────────────────
// TraderService handlers
// ─────────────────────────────────────────────

func (s *grpcServer) RegisterTrader(_ context.Context, req *pb.RegisterTraderRequest) (*pb.RegisterTraderResponse, error) {
	trader, token, err := s.auth.Register(req.Username, req.Email, req.Password, req.FullName, req.Country)
	if err != nil {
		return &pb.RegisterTraderResponse{Success: false, Message: err.Error()}, nil
	}
	return &pb.RegisterTraderResponse{
		Trader:  traderToProto(trader),
		Token:   token,
		Success: true,
		Message: "Registration successful. Please complete KYC verification.",
	}, nil
}

func (s *grpcServer) Login(_ context.Context, req *pb.LoginRequest) (*pb.LoginResponse, error) {
	trader, token, err := s.auth.Login(req.Email, req.Password)
	if err != nil {
		return &pb.LoginResponse{Success: false, Message: err.Error()}, nil
	}
	return &pb.LoginResponse{
		Token:   token,
		Trader:  traderToProto(trader),
		Success: true,
		Message: "Login successful",
	}, nil
}

func (s *grpcServer) GetTrader(_ context.Context, req *pb.GetTraderRequest) (*pb.GetTraderResponse, error) {
	trader, err := s.auth.GetTrader(req.TraderId)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, err.Error())
	}
	return &pb.GetTraderResponse{Trader: traderToProto(trader)}, nil
}

func (s *grpcServer) Deposit(_ context.Context, req *pb.DepositRequest) (*pb.DepositResponse, error) {
	newBalance, err := s.auth.Deposit(req.TraderId, req.Amount)
	if err != nil {
		return &pb.DepositResponse{Success: false, Message: err.Error()}, nil
	}
	return &pb.DepositResponse{
		Success:    true,
		NewBalance: newBalance,
		Message:    fmt.Sprintf("Deposit of %.2f %s successful", req.Amount, req.Currency),
	}, nil
}

// ─────────────────────────────────────────────
// Proto conversion helpers
// ─────────────────────────────────────────────

func secToProto(s *secsvc.Security) *pb.Security {
	return &pb.Security{
		Symbol: s.Symbol, Name: s.Name, Description: s.Description,
		FaceValue: s.FaceValue, TotalSupply: s.TotalSupply,
		Currency: s.Currency, Sector: s.Sector,
	}
}

func priceToProto(p *marketsvc.PriceData) *pb.Price {
	return &pb.Price{
		Symbol: p.Symbol, Bid: p.Bid, Ask: p.Ask, Last: p.Last,
		Open: p.Open, High: p.High, Low: p.Low,
		Change: p.Change, ChangePct: p.ChangePct, Volume: p.Volume,
		Timestamp: timestamppb.New(p.UpdatedAt),
	}
}

func tradeEventToProto(t *marketsvc.TradeEvent) *pb.Trade {
	return &pb.Trade{
		TradeId: t.TradeID, Symbol: t.Symbol, Price: t.Price,
		Quantity: t.Quantity, BuyerId: t.BuyerID, SellerId: t.SellerID,
		ExecutedAt: timestamppb.New(t.ExecutedAt),
	}
}

func orderToProto(o *ordersvc.Order) *pb.Order {
	return &pb.Order{
		OrderId: o.OrderID, TraderId: o.TraderID, Symbol: o.Symbol,
		Side: pb.OrderSide(o.Side), Type: pb.OrderType(o.Type),
		Status: pb.OrderStatus(o.Status), Quantity: o.Quantity,
		Price: o.Price, FilledQty: o.FilledQty, AvgFillPrice: o.AvgFillPrice,
		CreatedAt: timestamppb.New(o.CreatedAt),
		UpdatedAt: timestamppb.New(o.UpdatedAt),
	}
}

func traderToProto(t *authsvc.Trader) *pb.Trader {
	return &pb.Trader{
		TraderId: t.TraderID, Username: t.Username, Email: t.Email,
		FullName: t.FullName, Balance: t.Balance, Country: t.Country,
		Status: pb.TraderStatus(t.Status),
		CreatedAt: timestamppb.New(t.CreatedAt),
	}
}

// ─────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────

func main() {
	engine, err := marketsvc.NewEngine()
	if err != nil {
		log.Fatalf("Failed to create market engine: %v", err)
	}

	srv := &grpcServer{
		engine:   engine,
		orders:   ordersvc.NewStore(),
		auth:     authsvc.NewService(),
		registry: secsvc.NewRegistry(),
	}

	// Daily reset scheduler: at 09:00 reset circuit breaker
	go func() {
		for {
			now := time.Now()
			loc, _ := time.LoadLocation(marketsvc.MarketTimezone)
			next := time.Date(now.Year(), now.Month(), now.Day(),
				marketsvc.MarketOpenHour, 0, 0, 0, loc)
			if now.After(next) {
				next = next.Add(24 * time.Hour)
			}
			time.Sleep(time.Until(next))
			engine.ResetDailyState()
		}
	}()

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	grpcSrv := grpc.NewServer()
	pb.RegisterMarketServiceServer(grpcSrv, srv)
	pb.RegisterOrderServiceServer(grpcSrv, srv)
	pb.RegisterTraderServiceServer(grpcSrv, srv)

	log.Printf("Trading Market gRPC server running on :50051")
	log.Printf("Trading hours: %02d:00 – %02d:00 %s", marketsvc.MarketOpenHour, marketsvc.MarketCloseHour, marketsvc.MarketTimezone)
	log.Printf("Circuit breaker threshold: %.0f%%", marketsvc.CircuitBreakerPct)

	if err := grpcSrv.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
