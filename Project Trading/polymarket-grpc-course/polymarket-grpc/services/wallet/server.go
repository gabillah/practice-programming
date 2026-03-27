// Package wallet implements the WalletService gRPC server and settlement logic.
package wallet

import (
	"context"
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

type GetWalletRequest struct{ UserID string }
type GetWalletResponse struct{ Wallet *WalletProto }

type DepositRequest struct {
	UserID    string
	Amount    float64
	Reference string
}
type DepositResponse struct {
	Wallet      *WalletProto
	Transaction *TransactionProto
}

type WithdrawRequest struct {
	UserID  string
	Amount  float64
	Address string
}
type WithdrawResponse struct {
	Wallet      *WalletProto
	Transaction *TransactionProto
}

type ListTransactionsRequest struct {
	UserID  string
	Type    models.TransactionType
	Page    int
	PerPage int
}
type ListTransactionsResponse struct {
	Transactions []*TransactionProto
	Page         int
	PerPage      int
	TotalPages   int
	TotalItems   int64
}

type SettleOrderRequest struct {
	OrderID        string
	MarketID       string
	WinningOutcome models.MarketOutcome
}
type SettleOrderResponse struct {
	Transactions []*TransactionProto
}

type WalletProto struct {
	ID            string
	UserID        string
	Balance       float64
	LockedBalance float64
	Currency      string
	UpdatedAt     time.Time
}

type TransactionProto struct {
	ID          string
	UserID      string
	WalletID    string
	Type        models.TransactionType
	Status      models.TransactionStatus
	Amount      float64
	Reference   string
	Description string
	CreatedAt   time.Time
}

// -----------------------------------------------------------------
//  Service
// -----------------------------------------------------------------

type Server struct {
	store       *db.WalletStore
	orderStore  *db.OrderStore
	marketStore *db.MarketStore
	logger      *zap.Logger
}

func NewServer(
	walletStore *db.WalletStore,
	orderStore *db.OrderStore,
	marketStore *db.MarketStore,
	logger *zap.Logger,
) *Server {
	return &Server{
		store:       walletStore,
		orderStore:  orderStore,
		marketStore: marketStore,
		logger:      logger,
	}
}

// GetWallet returns the wallet for the authenticated user.
func (s *Server) GetWallet(ctx context.Context, req *GetWalletRequest) (*GetWalletResponse, error) {
	callerID, _ := middleware.GetUserIDFromCtx(ctx)
	role, _ := middleware.GetRoleFromCtx(ctx)

	userID := req.UserID
	if userID == "" {
		userID = callerID
	}
	if userID != callerID && role != string(models.UserRoleAdmin) {
		return nil, status.Error(codes.PermissionDenied, "cannot access another user's wallet")
	}

	w := s.store.GetOrCreate(userID)
	return &GetWalletResponse{Wallet: walletToProto(w)}, nil
}

// Deposit credits funds to a user's wallet.
func (s *Server) Deposit(ctx context.Context, req *DepositRequest) (*DepositResponse, error) {
	if req.Amount <= 0 {
		return nil, status.Error(codes.InvalidArgument, "deposit amount must be positive")
	}

	callerID, _ := middleware.GetUserIDFromCtx(ctx)
	userID := req.UserID
	if userID == "" {
		userID = callerID
	}

	// Ensure wallet exists
	s.store.GetOrCreate(userID)

	w, tx, err := s.store.Deposit(userID, req.Amount, req.Reference)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "deposit failed: %v", err)
	}

	s.logger.Info("deposit processed",
		zap.String("user", userID),
		zap.Float64("amount", req.Amount),
		zap.String("tx_id", tx.ID),
	)

	return &DepositResponse{
		Wallet:      walletToProto(w),
		Transaction: txToProto(tx),
	}, nil
}

// Withdraw debits funds from a user's wallet.
func (s *Server) Withdraw(ctx context.Context, req *WithdrawRequest) (*WithdrawResponse, error) {
	if req.Amount <= 0 {
		return nil, status.Error(codes.InvalidArgument, "withdrawal amount must be positive")
	}
	if req.Address == "" {
		return nil, status.Error(codes.InvalidArgument, "withdrawal address required")
	}

	callerID, _ := middleware.GetUserIDFromCtx(ctx)
	userID := req.UserID
	if userID == "" {
		userID = callerID
	}

	w, tx, err := s.store.Withdraw(userID, req.Amount, req.Address)
	if err != nil {
		return nil, status.Errorf(codes.FailedPrecondition, "withdrawal failed: %v", err)
	}

	s.logger.Info("withdrawal processed",
		zap.String("user", userID),
		zap.Float64("amount", req.Amount),
		zap.String("address", req.Address),
	)

	return &WithdrawResponse{
		Wallet:      walletToProto(w),
		Transaction: txToProto(tx),
	}, nil
}

// ListTransactions returns the transaction history for a user.
func (s *Server) ListTransactions(ctx context.Context, req *ListTransactionsRequest) (*ListTransactionsResponse, error) {
	callerID, _ := middleware.GetUserIDFromCtx(ctx)
	role, _ := middleware.GetRoleFromCtx(ctx)

	userID := req.UserID
	if userID == "" {
		userID = callerID
	}
	if userID != callerID && role != string(models.UserRoleAdmin) {
		return nil, status.Error(codes.PermissionDenied, "cannot access another user's transactions")
	}

	page, perPage := normalise(req.Page, req.PerPage)
	txs, total := s.store.ListTransactions(userID, req.Type, page, perPage)

	protos := make([]*TransactionProto, 0, len(txs))
	for _, tx := range txs {
		protos = append(protos, txToProto(tx))
	}
	totalPages := int(total) / perPage
	if int(total)%perPage != 0 {
		totalPages++
	}
	return &ListTransactionsResponse{
		Transactions: protos,
		Page:         page,
		PerPage:      perPage,
		TotalPages:   totalPages,
		TotalItems:   total,
	}, nil
}

// SettleOrder distributes winnings to all position holders after market resolution.
func (s *Server) SettleOrder(ctx context.Context, req *SettleOrderRequest) (*SettleOrderResponse, error) {
	role, _ := middleware.GetRoleFromCtx(ctx)
	if role != string(models.UserRoleAdmin) {
		return nil, status.Error(codes.PermissionDenied, "only admins can trigger settlement")
	}

	// Fetch all filled orders for this market
	filledOrders, _ := s.orderStore.List("", req.MarketID, models.OrderStatusFilled, 1, 10000)

	settlements := make([]*TransactionProto, 0)
	for _, o := range filledOrders {
		if o.Outcome != req.WinningOutcome {
			continue // losing positions get nothing
		}
		// Payout: 1.0 per share won
		tx, err := s.store.SettleOrder(o.UserID, o.Filled, 1.0, models.TransactionTypePayout)
		if err != nil {
			s.logger.Warn("settlement failed for order",
				zap.String("order_id", o.ID),
				zap.Error(err),
			)
			continue
		}
		settlements = append(settlements, txToProto(tx))
		s.logger.Info("order settled",
			zap.String("order", o.ID),
			zap.String("user", o.UserID),
			zap.Float64("payout", o.Filled),
		)
	}

	return &SettleOrderResponse{Transactions: settlements}, nil
}

// StreamBalance streams wallet balance updates to the caller.
func (s *Server) StreamBalance(
	req *GetWalletRequest,
	stream interface {
		Send(*WalletProto) error
		Context() context.Context
	},
) error {
	callerID, _ := middleware.GetUserIDFromCtx(stream.Context())
	userID := req.UserID
	if userID == "" {
		userID = callerID
	}

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-stream.Context().Done():
			return nil
		case <-ticker.C:
			w := s.store.GetOrCreate(userID)
			if err := stream.Send(walletToProto(w)); err != nil {
				return err
			}
		}
	}
}

// -----------------------------------------------------------------
//  Helpers
// -----------------------------------------------------------------

func walletToProto(w *models.Wallet) *WalletProto {
	return &WalletProto{
		ID:            w.ID,
		UserID:        w.UserID,
		Balance:       w.Balance,
		LockedBalance: w.LockedBalance,
		Currency:      w.Currency,
		UpdatedAt:     w.UpdatedAt,
	}
}

func txToProto(tx *models.Transaction) *TransactionProto {
	return &TransactionProto{
		ID:          tx.ID,
		UserID:      tx.UserID,
		WalletID:    tx.WalletID,
		Type:        tx.Type,
		Status:      tx.Status,
		Amount:      tx.Amount,
		Reference:   tx.Reference,
		Description: tx.Description,
		CreatedAt:   tx.CreatedAt,
	}
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
