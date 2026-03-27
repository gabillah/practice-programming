package models

import "time"

// ============================================================
//  USER DOMAIN MODEL
// ============================================================

type UserRole string

const (
	UserRoleTrader      UserRole = "trader"
	UserRoleMarketMaker UserRole = "market_maker"
	UserRoleAdmin       UserRole = "admin"
)

type User struct {
	ID            string    `json:"id"`
	Username      string    `json:"username"`
	Email         string    `json:"email"`
	PasswordHash  string    `json:"-"`
	WalletAddress string    `json:"wallet_address"`
	Role          UserRole  `json:"role"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ============================================================
//  MARKET DOMAIN MODEL
// ============================================================

type MarketStatus string

const (
	MarketStatusDraft     MarketStatus = "draft"
	MarketStatusActive    MarketStatus = "active"
	MarketStatusClosed    MarketStatus = "closed"
	MarketStatusResolved  MarketStatus = "resolved"
	MarketStatusCancelled MarketStatus = "cancelled"
)

type MarketOutcome string

const (
	MarketOutcomeYes MarketOutcome = "yes"
	MarketOutcomeNo  MarketOutcome = "no"
)

type Market struct {
	ID               string       `json:"id"`
	Title            string       `json:"title"`
	Description      string       `json:"description"`
	Category         string       `json:"category"`
	Status           MarketStatus `json:"status"`
	CreatorID        string       `json:"creator_id"`
	YesProbability   float64      `json:"yes_probability"`
	NoProbability    float64      `json:"no_probability"`
	Volume           float64      `json:"volume"`
	Liquidity        float64      `json:"liquidity"`
	ResolutionSource string       `json:"resolution_source"`
	EndTime          time.Time    `json:"end_time"`
	ResolvedOutcome  *MarketOutcome `json:"resolved_outcome,omitempty"`
	Tags             []string     `json:"tags"`
	CreatedAt        time.Time    `json:"created_at"`
	UpdatedAt        time.Time    `json:"updated_at"`
}

// ============================================================
//  ORDER DOMAIN MODEL
// ============================================================

type OrderSide string
type OrderType string
type OrderStatus string

const (
	OrderSideBuy  OrderSide = "buy"
	OrderSideSell OrderSide = "sell"

	OrderTypeMarket OrderType = "market"
	OrderTypeLimit  OrderType = "limit"

	OrderStatusPending   OrderStatus = "pending"
	OrderStatusOpen      OrderStatus = "open"
	OrderStatusFilled    OrderStatus = "filled"
	OrderStatusCancelled OrderStatus = "cancelled"
	OrderStatusRejected  OrderStatus = "rejected"
)

type Order struct {
	ID        string        `json:"id"`
	UserID    string        `json:"user_id"`
	MarketID  string        `json:"market_id"`
	Side      OrderSide     `json:"side"`
	Type      OrderType     `json:"type"`
	Status    OrderStatus   `json:"status"`
	Amount    float64       `json:"amount"`
	Price     float64       `json:"price"`
	Filled    float64       `json:"filled"`
	Remaining float64       `json:"remaining"`
	Outcome   MarketOutcome `json:"outcome"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
}

type OrderBookEntry struct {
	Price    float64 `json:"price"`
	Quantity float64 `json:"quantity"`
}

type OrderBook struct {
	MarketID  string           `json:"market_id"`
	Bids      []OrderBookEntry `json:"bids"`
	Asks      []OrderBookEntry `json:"asks"`
	Timestamp time.Time        `json:"timestamp"`
}

// ============================================================
//  WALLET / TRANSACTION DOMAIN MODEL
// ============================================================

type TransactionType string
type TransactionStatus string

const (
	TransactionTypeDeposit    TransactionType = "deposit"
	TransactionTypeWithdrawal TransactionType = "withdrawal"
	TransactionTypeBuy        TransactionType = "buy"
	TransactionTypeSell       TransactionType = "sell"
	TransactionTypePayout     TransactionType = "payout"
	TransactionTypeFee        TransactionType = "fee"

	TransactionStatusPending   TransactionStatus = "pending"
	TransactionStatusCompleted TransactionStatus = "completed"
	TransactionStatusFailed    TransactionStatus = "failed"
)

type Wallet struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	Balance       float64   `json:"balance"`
	LockedBalance float64   `json:"locked_balance"`
	Currency      string    `json:"currency"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Transaction struct {
	ID          string            `json:"id"`
	UserID      string            `json:"user_id"`
	WalletID    string            `json:"wallet_id"`
	Type        TransactionType   `json:"type"`
	Status      TransactionStatus `json:"status"`
	Amount      float64           `json:"amount"`
	Reference   string            `json:"reference"`
	Description string            `json:"description"`
	CreatedAt   time.Time         `json:"created_at"`
}

// ============================================================
//  PAGINATION
// ============================================================

type PaginationParams struct {
	Page    int
	PerPage int
}

type PaginatedResult[T any] struct {
	Items      []T
	Page       int
	PerPage    int
	TotalPages int
	TotalItems int64
}

func (p *PaginationParams) Offset() int {
	if p.Page < 1 {
		p.Page = 1
	}
	return (p.Page - 1) * p.PerPage
}

func (p *PaginationParams) Limit() int {
	if p.PerPage < 1 || p.PerPage > 100 {
		p.PerPage = 20
	}
	return p.PerPage
}
