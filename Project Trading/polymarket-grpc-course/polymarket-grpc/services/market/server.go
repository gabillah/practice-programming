// Package market implements the MarketService gRPC server.
package market

import (
	"context"
	"math/rand"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/polymarket-grpc/db"
	"github.com/polymarket-grpc/middleware"
	"github.com/polymarket-grpc/models"
)

// -----------------------------------------------------------------
//  Request / Response types (mirror generated protobuf messages)
// -----------------------------------------------------------------

type CreateMarketRequest struct {
	Title            string
	Description      string
	Category         string
	CreatorID        string
	ResolutionSource string
	EndTime          time.Time
	Tags             []string
	InitialLiquidity float64
}

type CreateMarketResponse struct{ Market *MarketProto }

type GetMarketRequest struct{ ID string }
type GetMarketResponse struct{ Market *MarketProto }

type ListMarketsRequest struct {
	Page        int
	PerPage     int
	Category    string
	Status      models.MarketStatus
	SearchQuery string
	SortBy      string
}

type ListMarketsResponse struct {
	Markets    []*MarketProto
	Page       int
	PerPage    int
	TotalPages int
	TotalItems int64
}

type ResolveMarketRequest struct {
	ID         string
	Outcome    models.MarketOutcome
	ResolverID string
}
type ResolveMarketResponse struct{ Market *MarketProto }

type MarketOddsUpdate struct {
	MarketID       string
	YesProbability float64
	NoProbability  float64
	Volume         float64
	Liquidity      float64
	Timestamp      time.Time
}

type MarketProto struct {
	ID               string
	Title            string
	Description      string
	Category         string
	Status           models.MarketStatus
	CreatorID        string
	YesProbability   float64
	NoProbability    float64
	Volume           float64
	Liquidity        float64
	ResolutionSource string
	EndTime          time.Time
	Tags             []string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// -----------------------------------------------------------------
//  Service
// -----------------------------------------------------------------

type Server struct {
	store  *db.MarketStore
	logger *zap.Logger
}

func NewServer(store *db.MarketStore, logger *zap.Logger) *Server {
	return &Server{store: store, logger: logger}
}

// CreateMarket creates a new prediction market.
func (s *Server) CreateMarket(ctx context.Context, req *CreateMarketRequest) (*CreateMarketResponse, error) {
	if req.Title == "" {
		return nil, status.Error(codes.InvalidArgument, "market title is required")
	}
	if req.EndTime.Before(time.Now()) {
		return nil, status.Error(codes.InvalidArgument, "end_time must be in the future")
	}

	callerID, _ := middleware.GetUserIDFromCtx(ctx)
	if req.CreatorID == "" {
		req.CreatorID = callerID
	}

	m := &models.Market{
		Title:            req.Title,
		Description:      req.Description,
		Category:         req.Category,
		CreatorID:        req.CreatorID,
		ResolutionSource: req.ResolutionSource,
		EndTime:          req.EndTime,
		Tags:             req.Tags,
		Liquidity:        req.InitialLiquidity,
	}

	created, err := s.store.Create(m)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create market: %v", err)
	}

	s.logger.Info("market created",
		zap.String("id", created.ID),
		zap.String("title", created.Title),
		zap.String("creator", created.CreatorID),
	)
	return &CreateMarketResponse{Market: modelToProto(created)}, nil
}

// GetMarket retrieves a single market by ID.
func (s *Server) GetMarket(ctx context.Context, req *GetMarketRequest) (*GetMarketResponse, error) {
	if req.ID == "" {
		return nil, status.Error(codes.InvalidArgument, "market id is required")
	}
	m, err := s.store.GetByID(req.ID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "%v", err)
	}
	return &GetMarketResponse{Market: modelToProto(m)}, nil
}

// ListMarkets returns a filtered, paginated list of markets.
func (s *Server) ListMarkets(ctx context.Context, req *ListMarketsRequest) (*ListMarketsResponse, error) {
	page, perPage := normalise(req.Page, req.PerPage)
	markets, total := s.store.List(page, perPage, req.Category, req.Status)

	protos := make([]*MarketProto, 0, len(markets))
	for _, m := range markets {
		protos = append(protos, modelToProto(m))
	}

	totalPages := int(total) / perPage
	if int(total)%perPage != 0 {
		totalPages++
	}

	return &ListMarketsResponse{
		Markets:    protos,
		Page:       page,
		PerPage:    perPage,
		TotalPages: totalPages,
		TotalItems: total,
	}, nil
}

// ResolveMarket settles a market with a winning outcome.
func (s *Server) ResolveMarket(ctx context.Context, req *ResolveMarketRequest) (*ResolveMarketResponse, error) {
	if req.ID == "" {
		return nil, status.Error(codes.InvalidArgument, "market id is required")
	}
	if req.Outcome != models.MarketOutcomeYes && req.Outcome != models.MarketOutcomeNo {
		return nil, status.Error(codes.InvalidArgument, "outcome must be YES or NO")
	}

	role, _ := middleware.GetRoleFromCtx(ctx)
	if role != string(models.UserRoleAdmin) {
		return nil, status.Error(codes.PermissionDenied, "only admins can resolve markets")
	}

	m, err := s.store.GetByID(req.ID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "%v", err)
	}
	if m.Status == models.MarketStatusResolved {
		return nil, status.Error(codes.AlreadyExists, "market is already resolved")
	}

	m.Status = models.MarketStatusResolved
	m.ResolvedOutcome = &req.Outcome
	if req.Outcome == models.MarketOutcomeYes {
		m.YesProbability = 1.0
		m.NoProbability = 0.0
	} else {
		m.YesProbability = 0.0
		m.NoProbability = 1.0
	}

	updated, err := s.store.Update(m)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to resolve market: %v", err)
	}

	s.logger.Info("market resolved",
		zap.String("id", updated.ID),
		zap.String("outcome", string(req.Outcome)),
	)
	return &ResolveMarketResponse{Market: modelToProto(updated)}, nil
}

// StreamMarketOdds is a server-streaming RPC that pushes live odds updates.
// It simulates random price movements as would occur from real trading activity.
func (s *Server) StreamMarketOdds(
	req *GetMarketRequest,
	stream interface {
		Send(*MarketOddsUpdate) error
		Context() context.Context
	},
) error {
	m, err := s.store.GetByID(req.ID)
	if err != nil {
		return status.Errorf(codes.NotFound, "%v", err)
	}

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	// Send initial state immediately
	if err := stream.Send(marketToOddsUpdate(m)); err != nil {
		return err
	}

	yesProb := m.YesProbability

	for {
		select {
		case <-stream.Context().Done():
			return nil
		case <-ticker.C:
			// Simulate random price walk
			delta := (rand.Float64() - 0.5) * 0.02
			yesProb = clamp(yesProb+delta, 0.01, 0.99)

			vol := rand.Float64() * 5000
			liq := m.Liquidity + rand.Float64()*1000 - 500

			if err := s.store.UpdateOdds(req.ID, yesProb, vol, liq); err != nil {
				s.logger.Warn("failed to persist odds update", zap.Error(err))
				continue
			}

			upd := &MarketOddsUpdate{
				MarketID:       req.ID,
				YesProbability: yesProb,
				NoProbability:  1 - yesProb,
				Volume:         vol,
				Liquidity:      liq,
				Timestamp:      time.Now(),
			}
			if err := stream.Send(upd); err != nil {
				return err
			}
		}
	}
}

// -----------------------------------------------------------------
//  Helpers
// -----------------------------------------------------------------

func modelToProto(m *models.Market) *MarketProto {
	return &MarketProto{
		ID:               m.ID,
		Title:            m.Title,
		Description:      m.Description,
		Category:         m.Category,
		Status:           m.Status,
		CreatorID:        m.CreatorID,
		YesProbability:   m.YesProbability,
		NoProbability:    m.NoProbability,
		Volume:           m.Volume,
		Liquidity:        m.Liquidity,
		ResolutionSource: m.ResolutionSource,
		EndTime:          m.EndTime,
		Tags:             m.Tags,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
	}
}

func marketToOddsUpdate(m *models.Market) *MarketOddsUpdate {
	return &MarketOddsUpdate{
		MarketID:       m.ID,
		YesProbability: m.YesProbability,
		NoProbability:  m.NoProbability,
		Volume:         m.Volume,
		Liquidity:      m.Liquidity,
		Timestamp:      time.Now(),
	}
}

func clamp(v, min, max float64) float64 {
	if v < min {
		return min
	}
	if v > max {
		return max
	}
	return v
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
