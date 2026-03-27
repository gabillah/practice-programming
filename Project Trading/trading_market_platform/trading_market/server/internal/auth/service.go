package auth

import (
	"fmt"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const jwtSecret = "REPLACE_WITH_ENV_SECRET_KEY_32BYTES"

type TraderStatus int

const (
	StatusActive     TraderStatus = 1
	StatusSuspended  TraderStatus = 2
	StatusPendingKYC TraderStatus = 3
)

type Trader struct {
	TraderID  string
	Username  string
	Email     string
	PassHash  string
	FullName  string
	Country   string
	Balance   float64
	Status    TraderStatus
	CreatedAt time.Time
}

type Service struct {
	mu      sync.RWMutex
	traders map[string]*Trader // key: traderID
	byEmail map[string]*Trader // key: email
}

func NewService() *Service {
	return &Service{
		traders: make(map[string]*Trader),
		byEmail: make(map[string]*Trader),
	}
}

// Register creates a new trader account.
func (s *Service) Register(username, email, password, fullName, country string) (*Trader, string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.byEmail[email]; exists {
		return nil, "", fmt.Errorf("email already registered")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", fmt.Errorf("password hashing failed: %w", err)
	}

	t := &Trader{
		TraderID:  uuid.NewString(),
		Username:  username,
		Email:     email,
		PassHash:  string(hash),
		FullName:  fullName,
		Country:   country,
		Balance:   0,
		Status:    StatusPendingKYC,
		CreatedAt: time.Now(),
	}
	s.traders[t.TraderID] = t
	s.byEmail[t.Email]    = t

	token, err := generateJWT(t.TraderID)
	if err != nil {
		return nil, "", err
	}
	return t, token, nil
}

// Login authenticates and returns a JWT.
func (s *Service) Login(email, password string) (*Trader, string, error) {
	s.mu.RLock()
	t, ok := s.byEmail[email]
	s.mu.RUnlock()
	if !ok {
		return nil, "", fmt.Errorf("invalid credentials")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(t.PassHash), []byte(password)); err != nil {
		return nil, "", fmt.Errorf("invalid credentials")
	}
	token, err := generateJWT(t.TraderID)
	if err != nil {
		return nil, "", err
	}
	return t, token, nil
}

// GetTrader retrieves a trader by ID.
func (s *Service) GetTrader(traderID string) (*Trader, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	t, ok := s.traders[traderID]
	if !ok {
		return nil, fmt.Errorf("trader not found")
	}
	cp := *t
	return &cp, nil
}

// Deposit adds funds to a trader's balance.
func (s *Service) Deposit(traderID string, amount float64) (float64, error) {
	if amount <= 0 {
		return 0, fmt.Errorf("deposit amount must be positive")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	t, ok := s.traders[traderID]
	if !ok {
		return 0, fmt.Errorf("trader not found")
	}
	t.Balance += amount
	return t.Balance, nil
}

// ValidateToken parses a JWT and returns the traderID.
func ValidateToken(tokenStr string) (string, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(jwtSecret), nil
	})
	if err != nil || !token.Valid {
		return "", fmt.Errorf("invalid token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", fmt.Errorf("invalid claims")
	}
	traderID, ok := claims["sub"].(string)
	if !ok {
		return "", fmt.Errorf("missing subject")
	}
	return traderID, nil
}

func generateJWT(traderID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": traderID,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtSecret))
}
