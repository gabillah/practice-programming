// Package db provides an in-memory data store that simulates a database.
// In production you would replace this with PostgreSQL using pgx or GORM.
package db

import (
	"fmt"
	"math"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/polymarket-grpc/models"
	"golang.org/x/crypto/bcrypt"
)

// ============================================================
//  USER STORE
// ============================================================

type UserStore struct {
	mu    sync.RWMutex
	users map[string]*models.User
	byEmail map[string]*models.User
}

func NewUserStore() *UserStore {
	s := &UserStore{
		users:   make(map[string]*models.User),
		byEmail: make(map[string]*models.User),
	}
	// Seed admin user
	s.seedAdmin()
	return s
}

func (s *UserStore) seedAdmin() {
	hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	admin := &models.User{
		ID:           uuid.New().String(),
		Username:     "admin",
		Email:        "admin@polymarket.io",
		PasswordHash: string(hash),
		Role:         models.UserRoleAdmin,
		IsActive:     true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	s.users[admin.ID] = admin
	s.byEmail[admin.Email] = admin
}

func (s *UserStore) Create(u *models.User) (*models.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.byEmail[u.Email]; exists {
		return nil, fmt.Errorf("email %s already registered", u.Email)
	}

	u.ID = uuid.New().String()
	u.CreatedAt = time.Now()
	u.UpdatedAt = time.Now()
	u.IsActive = true

	s.users[u.ID] = u
	s.byEmail[u.Email] = u
	return u, nil
}

func (s *UserStore) GetByID(id string) (*models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	u, ok := s.users[id]
	if !ok {
		return nil, fmt.Errorf("user %s not found", id)
	}
	return u, nil
}

func (s *UserStore) GetByEmail(email string) (*models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	u, ok := s.byEmail[email]
	if !ok {
		return nil, fmt.Errorf("user with email %s not found", email)
	}
	return u, nil
}

func (s *UserStore) Update(u *models.User) (*models.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.users[u.ID]
	if !ok {
		return nil, fmt.Errorf("user %s not found", u.ID)
	}
	existing.Username = u.Username
	existing.Email = u.Email
	existing.WalletAddress = u.WalletAddress
	existing.UpdatedAt = time.Now()
	return existing, nil
}

func (s *UserStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	u, ok := s.users[id]
	if !ok {
		return fmt.Errorf("user %s not found", id)
	}
	delete(s.byEmail, u.Email)
	delete(s.users, id)
	return nil
}

func (s *UserStore) List(page, perPage int) ([]*models.User, int64) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	all := make([]*models.User, 0, len(s.users))
	for _, u := range s.users {
		all = append(all, u)
	}

	total := int64(len(all))
	start := (page - 1) * perPage
	end := start + perPage
	if start >= len(all) {
		return []*models.User{}, total
	}
	if end > len(all) {
		end = len(all)
	}
	return all[start:end], total
}

// ============================================================
//  MARKET STORE
// ============================================================

type MarketStore struct {
	mu      sync.RWMutex
	markets map[string]*models.Market
}

func NewMarketStore() *MarketStore {
	s := &MarketStore{markets: make(map[string]*models.Market)}
	s.seedMarkets()
	return s
}

func (s *MarketStore) seedMarkets() {
	markets := []*models.Market{
		{
			ID:               uuid.New().String(),
			Title:            "Will Bitcoin reach $100,000 by end of 2025?",
			Description:      "This market resolves YES if BTC/USD price touches $100,000 before December 31, 2025 on Coinbase.",
			Category:         "crypto",
			Status:           models.MarketStatusActive,
			CreatorID:        "admin",
			YesProbability:   0.72,
			NoProbability:    0.28,
			Volume:           1_500_000,
			Liquidity:        250_000,
			ResolutionSource: "Coinbase BTC/USD",
			EndTime:          time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC),
			Tags:             []string{"bitcoin", "crypto", "price"},
			CreatedAt:        time.Now().Add(-30 * 24 * time.Hour),
			UpdatedAt:        time.Now(),
		},
		{
			ID:               uuid.New().String(),
			Title:            "Will the Fed cut rates at the next FOMC meeting?",
			Description:      "Resolves YES if the Federal Reserve cuts the federal funds rate at its next scheduled FOMC meeting.",
			Category:         "economics",
			Status:           models.MarketStatusActive,
			CreatorID:        "admin",
			YesProbability:   0.35,
			NoProbability:    0.65,
			Volume:           890_000,
			Liquidity:        120_000,
			ResolutionSource: "Federal Reserve press release",
			EndTime:          time.Now().Add(60 * 24 * time.Hour),
			Tags:             []string{"fed", "interest-rates", "macro"},
			CreatedAt:        time.Now().Add(-7 * 24 * time.Hour),
			UpdatedAt:        time.Now(),
		},
		{
			ID:               uuid.New().String(),
			Title:            "Will SpaceX launch Starship to orbit in 2025?",
			Description:      "Resolves YES if SpaceX successfully completes an orbital Starship flight in calendar year 2025.",
			Category:         "science",
			Status:           models.MarketStatusActive,
			CreatorID:        "admin",
			YesProbability:   0.88,
			NoProbability:    0.12,
			Volume:           420_000,
			Liquidity:        75_000,
			ResolutionSource: "SpaceX official announcement",
			EndTime:          time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC),
			Tags:             []string{"spacex", "starship", "space"},
			CreatedAt:        time.Now().Add(-14 * 24 * time.Hour),
			UpdatedAt:        time.Now(),
		},
	}
	for _, m := range markets {
		s.markets[m.ID] = m
	}
}

func (s *MarketStore) Create(m *models.Market) (*models.Market, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	m.ID = uuid.New().String()
	m.Status = models.MarketStatusActive
	m.YesProbability = 0.50
	m.NoProbability = 0.50
	m.Volume = 0
	m.CreatedAt = time.Now()
	m.UpdatedAt = time.Now()

	s.markets[m.ID] = m
	return m, nil
}

func (s *MarketStore) GetByID(id string) (*models.Market, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	m, ok := s.markets[id]
	if !ok {
		return nil, fmt.Errorf("market %s not found", id)
	}
	return m, nil
}

func (s *MarketStore) Update(m *models.Market) (*models.Market, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.markets[m.ID]; !ok {
		return nil, fmt.Errorf("market %s not found", m.ID)
	}
	m.UpdatedAt = time.Now()
	s.markets[m.ID] = m
	return m, nil
}

func (s *MarketStore) List(page, perPage int, category string, status models.MarketStatus) ([]*models.Market, int64) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	all := make([]*models.Market, 0)
	for _, m := range s.markets {
		if category != "" && m.Category != category {
			continue
		}
		if status != "" && m.Status != status {
			continue
		}
		all = append(all, m)
	}

	total := int64(len(all))
	start := (page - 1) * perPage
	end := start + perPage
	if start >= len(all) {
		return []*models.Market{}, total
	}
	if end > len(all) {
		end = len(all)
	}
	return all[start:end], total
}

func (s *MarketStore) UpdateOdds(id string, yesProb, volume, liquidity float64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	m, ok := s.markets[id]
	if !ok {
		return fmt.Errorf("market %s not found", id)
	}
	m.YesProbability = yesProb
	m.NoProbability = 1 - yesProb
	m.Volume += volume
	m.Liquidity = liquidity
	m.UpdatedAt = time.Now()
	return nil
}

// ============================================================
//  ORDER STORE
// ============================================================

type OrderStore struct {
	mu     sync.RWMutex
	orders map[string]*models.Order
}

func NewOrderStore() *OrderStore {
	return &OrderStore{orders: make(map[string]*models.Order)}
}

func (s *OrderStore) Create(o *models.Order) (*models.Order, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	o.ID = uuid.New().String()
	o.Status = models.OrderStatusPending
	o.Filled = 0
	o.Remaining = o.Amount
	o.CreatedAt = time.Now()
	o.UpdatedAt = time.Now()

	s.orders[o.ID] = o
	return o, nil
}

func (s *OrderStore) GetByID(id string) (*models.Order, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	o, ok := s.orders[id]
	if !ok {
		return nil, fmt.Errorf("order %s not found", id)
	}
	return o, nil
}

func (s *OrderStore) Cancel(id, userID string) (*models.Order, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	o, ok := s.orders[id]
	if !ok {
		return nil, fmt.Errorf("order %s not found", id)
	}
	if o.UserID != userID {
		return nil, fmt.Errorf("unauthorized: order belongs to different user")
	}
	if o.Status == models.OrderStatusFilled {
		return nil, fmt.Errorf("cannot cancel a filled order")
	}
	o.Status = models.OrderStatusCancelled
	o.UpdatedAt = time.Now()
	return o, nil
}

func (s *OrderStore) List(userID, marketID string, status models.OrderStatus, page, perPage int) ([]*models.Order, int64) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	all := make([]*models.Order, 0)
	for _, o := range s.orders {
		if userID != "" && o.UserID != userID {
			continue
		}
		if marketID != "" && o.MarketID != marketID {
			continue
		}
		if status != "" && o.Status != status {
			continue
		}
		all = append(all, o)
	}

	total := int64(len(all))
	start := (page - 1) * perPage
	end := start + perPage
	if start >= len(all) {
		return []*models.Order{}, total
	}
	if end > len(all) {
		end = len(all)
	}
	return all[start:end], total
}

func (s *OrderStore) GetOrderBook(marketID string) *models.OrderBook {
	s.mu.RLock()
	defer s.mu.RUnlock()

	bids := make(map[float64]float64)
	asks := make(map[float64]float64)

	for _, o := range s.orders {
		if o.MarketID != marketID || o.Status != models.OrderStatusOpen {
			continue
		}
		if o.Side == models.OrderSideBuy {
			bids[o.Price] += o.Remaining
		} else {
			asks[o.Price] += o.Remaining
		}
	}

	book := &models.OrderBook{
		MarketID:  marketID,
		Bids:      make([]models.OrderBookEntry, 0, len(bids)),
		Asks:      make([]models.OrderBookEntry, 0, len(asks)),
		Timestamp: time.Now(),
	}
	for price, qty := range bids {
		book.Bids = append(book.Bids, models.OrderBookEntry{Price: price, Quantity: qty})
	}
	for price, qty := range asks {
		book.Asks = append(book.Asks, models.OrderBookEntry{Price: price, Quantity: qty})
	}
	return book
}

// ============================================================
//  WALLET STORE
// ============================================================

type WalletStore struct {
	mu           sync.RWMutex
	wallets      map[string]*models.Wallet   // keyed by userID
	transactions map[string]*models.Transaction
}

func NewWalletStore() *WalletStore {
	return &WalletStore{
		wallets:      make(map[string]*models.Wallet),
		transactions: make(map[string]*models.Transaction),
	}
}

func (s *WalletStore) GetOrCreate(userID string) *models.Wallet {
	s.mu.Lock()
	defer s.mu.Unlock()

	w, ok := s.wallets[userID]
	if !ok {
		w = &models.Wallet{
			ID:        uuid.New().String(),
			UserID:    userID,
			Balance:   1000.00, // default starting balance for demo
			Currency:  "USD",
			UpdatedAt: time.Now(),
		}
		s.wallets[userID] = w
	}
	return w
}

func (s *WalletStore) Deposit(userID string, amount float64, ref string) (*models.Wallet, *models.Transaction, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	w := s.wallets[userID]
	if w == nil {
		return nil, nil, fmt.Errorf("wallet not found for user %s", userID)
	}
	w.Balance += amount
	w.UpdatedAt = time.Now()

	tx := &models.Transaction{
		ID:          uuid.New().String(),
		UserID:      userID,
		WalletID:    w.ID,
		Type:        models.TransactionTypeDeposit,
		Status:      models.TransactionStatusCompleted,
		Amount:      amount,
		Reference:   ref,
		Description: fmt.Sprintf("Deposit of $%.2f", amount),
		CreatedAt:   time.Now(),
	}
	s.transactions[tx.ID] = tx
	return w, tx, nil
}

func (s *WalletStore) Withdraw(userID string, amount float64, address string) (*models.Wallet, *models.Transaction, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	w := s.wallets[userID]
	if w == nil {
		return nil, nil, fmt.Errorf("wallet not found for user %s", userID)
	}
	if w.Balance < amount {
		return nil, nil, fmt.Errorf("insufficient balance: have $%.2f, need $%.2f", w.Balance, amount)
	}
	w.Balance -= amount
	w.UpdatedAt = time.Now()

	tx := &models.Transaction{
		ID:          uuid.New().String(),
		UserID:      userID,
		WalletID:    w.ID,
		Type:        models.TransactionTypeWithdrawal,
		Status:      models.TransactionStatusCompleted,
		Amount:      amount,
		Reference:   address,
		Description: fmt.Sprintf("Withdrawal of $%.2f to %s", amount, address),
		CreatedAt:   time.Now(),
	}
	s.transactions[tx.ID] = tx
	return w, tx, nil
}

func (s *WalletStore) LockFunds(userID string, amount float64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	w := s.wallets[userID]
	if w == nil {
		return fmt.Errorf("wallet not found for user %s", userID)
	}
	available := w.Balance - w.LockedBalance
	if available < amount {
		return fmt.Errorf("insufficient available balance: have $%.2f, need $%.2f", available, amount)
	}
	w.LockedBalance += amount
	w.UpdatedAt = time.Now()
	return nil
}

func (s *WalletStore) SettleOrder(userID string, orderAmount, price float64, txType models.TransactionType) (*models.Transaction, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	w := s.wallets[userID]
	if w == nil {
		return nil, fmt.Errorf("wallet not found for user %s", userID)
	}

	total := math.Round(orderAmount*price*100) / 100
	switch txType {
	case models.TransactionTypeBuy:
		if w.Balance < total {
			return nil, fmt.Errorf("insufficient balance")
		}
		w.Balance -= total
	case models.TransactionTypeSell, models.TransactionTypePayout:
		w.Balance += total
	}
	w.LockedBalance = math.Max(0, w.LockedBalance-total)
	w.UpdatedAt = time.Now()

	tx := &models.Transaction{
		ID:          uuid.New().String(),
		UserID:      userID,
		WalletID:    w.ID,
		Type:        txType,
		Status:      models.TransactionStatusCompleted,
		Amount:      total,
		Description: fmt.Sprintf("%s: %.2f shares @ $%.4f", txType, orderAmount, price),
		CreatedAt:   time.Now(),
	}
	s.transactions[tx.ID] = tx
	return tx, nil
}

func (s *WalletStore) ListTransactions(userID string, txType models.TransactionType, page, perPage int) ([]*models.Transaction, int64) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	all := make([]*models.Transaction, 0)
	for _, tx := range s.transactions {
		if tx.UserID != userID {
			continue
		}
		if txType != "" && tx.Type != txType {
			continue
		}
		all = append(all, tx)
	}

	total := int64(len(all))
	start := (page - 1) * perPage
	end := start + perPage
	if start >= len(all) {
		return []*models.Transaction{}, total
	}
	if end > len(all) {
		end = len(all)
	}
	return all[start:end], total
}
