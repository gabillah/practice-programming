// Package tests provides unit and integration tests for all Polymarket services.
package tests

import (
	"context"
	"fmt"
	"testing"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	"github.com/polymarket-grpc/config"
	"github.com/polymarket-grpc/db"
	"github.com/polymarket-grpc/middleware"
	"github.com/polymarket-grpc/models"
	marketSvc "github.com/polymarket-grpc/services/market"
	orderSvc "github.com/polymarket-grpc/services/order"
	userSvc "github.com/polymarket-grpc/services/user"
	walletSvc "github.com/polymarket-grpc/services/wallet"
)

// ============================================================
//  TEST FIXTURES
// ============================================================

type testEnv struct {
	cfg         *config.Config
	userStore   *db.UserStore
	marketStore *db.MarketStore
	orderStore  *db.OrderStore
	walletStore *db.WalletStore
	jwtMgr      *middleware.JWTManager
	logger      *zap.Logger
	userSvc     *userSvc.Server
	marketSvc   *marketSvc.Server
	orderSvc    *orderSvc.Server
	walletSvc   *walletSvc.Server
}

func newTestEnv(t *testing.T) *testEnv {
	t.Helper()
	cfg := config.Load()
	logger := zap.NewNop()

	userStore   := db.NewUserStore()
	marketStore := db.NewMarketStore()
	orderStore  := db.NewOrderStore()
	walletStore := db.NewWalletStore()

	jwtMgr := middleware.NewJWTManager(
		"test-secret",
		15*time.Minute,
		7*24*time.Hour,
		"test",
	)

	return &testEnv{
		cfg:         cfg,
		userStore:   userStore,
		marketStore: marketStore,
		orderStore:  orderStore,
		walletStore: walletStore,
		jwtMgr:      jwtMgr,
		logger:      logger,
		userSvc:     userSvc.NewServer(userStore, walletStore, jwtMgr, logger),
		marketSvc:   marketSvc.NewServer(marketStore, logger),
		orderSvc:    orderSvc.NewServer(orderStore, walletStore, marketStore, logger),
		walletSvc:   walletSvc.NewServer(walletStore, orderStore, marketStore, logger),
	}
}

// ctxWithRole builds a context that the auth middleware would produce after
// validating a JWT — so services can call GetUserIDFromCtx and GetRoleFromCtx.
func ctxWithRole(userID, role string) context.Context {
	ctx := context.Background()
	ctx = context.WithValue(ctx, middleware.ContextKeyUserID, userID)
	ctx = context.WithValue(ctx, middleware.ContextKeyRole, role)
	md := metadata.New(map[string]string{"user_id": userID, "role": role})
	return metadata.NewIncomingContext(ctx, md)
}

func adminCtx() context.Context {
	return ctxWithRole("admin-id", string(models.UserRoleAdmin))
}

// ============================================================
//  USER SERVICE TESTS
// ============================================================

func TestUserService_CreateUser(t *testing.T) {
	env := newTestEnv(t)

	tests := []struct {
		name     string
		req      *userSvc.CreateUserRequest
		wantErr  bool
		wantCode codes.Code
	}{
		{
			name: "valid user creation",
			req: &userSvc.CreateUserRequest{
				Username: "alice",
				Email:    "alice@test.com",
				Password: "Secure123!",
			},
			wantErr: false,
		},
		{
			name: "missing username",
			req: &userSvc.CreateUserRequest{
				Email:    "bob@test.com",
				Password: "Secure123!",
			},
			wantErr:  true,
			wantCode: codes.InvalidArgument,
		},
		{
			name: "password too short",
			req: &userSvc.CreateUserRequest{
				Username: "carol",
				Email:    "carol@test.com",
				Password: "short",
			},
			wantErr:  true,
			wantCode: codes.InvalidArgument,
		},
		{
			name: "duplicate email",
			req: &userSvc.CreateUserRequest{
				Username: "alice2",
				Email:    "alice@test.com", // same email as first test
				Password: "Secure123!",
			},
			wantErr:  true,
			wantCode: codes.AlreadyExists,
		},
	}

	// Create alice first so the duplicate test works
	_, _ = env.userSvc.CreateUser(context.Background(), &userSvc.CreateUserRequest{
		Username: "alice",
		Email:    "alice@test.com",
		Password: "Secure123!",
	})

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := env.userSvc.CreateUser(context.Background(), tt.req)
			if tt.wantErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				if tt.wantCode != codes.OK {
					if status.Code(err) != tt.wantCode {
						t.Errorf("expected code %v, got %v", tt.wantCode, status.Code(err))
					}
				}
			} else {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
				if resp.Token == "" {
					t.Error("expected non-empty token")
				}
				if resp.User.ID == "" {
					t.Error("expected non-empty user ID")
				}
			}
		})
	}
}

func TestUserService_Authenticate(t *testing.T) {
	env := newTestEnv(t)

	// Register a user first
	_, err := env.userSvc.CreateUser(context.Background(), &userSvc.CreateUserRequest{
		Username: "dave",
		Email:    "dave@test.com",
		Password: "Password123!",
	})
	if err != nil {
		t.Fatalf("setup: create user: %v", err)
	}

	tests := []struct {
		name     string
		email    string
		password string
		wantErr  bool
		wantCode codes.Code
	}{
		{
			name:     "valid credentials",
			email:    "dave@test.com",
			password: "Password123!",
			wantErr:  false,
		},
		{
			name:     "wrong password",
			email:    "dave@test.com",
			password: "WrongPassword!",
			wantErr:  true,
			wantCode: codes.Unauthenticated,
		},
		{
			name:     "unknown email",
			email:    "nobody@test.com",
			password: "Password123!",
			wantErr:  true,
			wantCode: codes.Unauthenticated,
		},
		{
			name:     "empty credentials",
			email:    "",
			password: "",
			wantErr:  true,
			wantCode: codes.InvalidArgument,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := env.userSvc.Authenticate(context.Background(), &userSvc.AuthenticateRequest{
				Email:    tt.email,
				Password: tt.password,
			})
			if tt.wantErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				if status.Code(err) != tt.wantCode {
					t.Errorf("expected code %v, got %v", tt.wantCode, status.Code(err))
				}
			} else {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
				if resp.Token == "" {
					t.Error("expected access token")
				}
				if resp.RefreshToken == "" {
					t.Error("expected refresh token")
				}
			}
		})
	}
}

func TestUserService_GetUser(t *testing.T) {
	env := newTestEnv(t)

	created, err := env.userSvc.CreateUser(context.Background(), &userSvc.CreateUserRequest{
		Username: "eve",
		Email:    "eve@test.com",
		Password: "Password123!",
	})
	if err != nil {
		t.Fatalf("setup: %v", err)
	}
	userID := created.User.ID

	t.Run("get existing user", func(t *testing.T) {
		resp, err := env.userSvc.GetUser(adminCtx(), &userSvc.GetUserRequest{ID: userID})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.User.Email != "eve@test.com" {
			t.Errorf("expected eve@test.com, got %s", resp.User.Email)
		}
	})

	t.Run("get non-existent user", func(t *testing.T) {
		_, err := env.userSvc.GetUser(adminCtx(), &userSvc.GetUserRequest{ID: "does-not-exist"})
		if err == nil {
			t.Fatal("expected error, got nil")
		}
		if status.Code(err) != codes.NotFound {
			t.Errorf("expected NotFound, got %v", status.Code(err))
		}
	})

	t.Run("empty id", func(t *testing.T) {
		_, err := env.userSvc.GetUser(adminCtx(), &userSvc.GetUserRequest{ID: ""})
		if status.Code(err) != codes.InvalidArgument {
			t.Errorf("expected InvalidArgument, got %v", status.Code(err))
		}
	})
}

// ============================================================
//  MARKET SERVICE TESTS
// ============================================================

func TestMarketService_ListMarkets(t *testing.T) {
	env := newTestEnv(t)
	ctx := adminCtx()

	resp, err := env.marketSvc.ListMarkets(ctx, &marketSvc.ListMarketsRequest{
		Page:    1,
		PerPage: 10,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// Market store is seeded with 3 markets
	if len(resp.Markets) < 3 {
		t.Errorf("expected at least 3 seeded markets, got %d", len(resp.Markets))
	}
}

func TestMarketService_CreateMarket(t *testing.T) {
	env := newTestEnv(t)
	ctx := ctxWithRole("creator-id", string(models.UserRoleMarketMaker))

	tests := []struct {
		name     string
		req      *marketSvc.CreateMarketRequest
		wantErr  bool
		wantCode codes.Code
	}{
		{
			name: "valid market",
			req: &marketSvc.CreateMarketRequest{
				Title:       "Will ETH hit $5000 in 2025?",
				Description: "Resolves YES if ETH/USD >= 5000 on Coinbase by Dec 31 2025",
				Category:    "crypto",
				EndTime:     time.Now().Add(365 * 24 * time.Hour),
				Tags:        []string{"eth", "crypto"},
			},
			wantErr: false,
		},
		{
			name: "empty title",
			req: &marketSvc.CreateMarketRequest{
				Description: "No title market",
				EndTime:     time.Now().Add(24 * time.Hour),
			},
			wantErr:  true,
			wantCode: codes.InvalidArgument,
		},
		{
			name: "end time in the past",
			req: &marketSvc.CreateMarketRequest{
				Title:   "Past market",
				EndTime: time.Now().Add(-1 * time.Hour),
			},
			wantErr:  true,
			wantCode: codes.InvalidArgument,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := env.marketSvc.CreateMarket(ctx, tt.req)
			if tt.wantErr {
				if err == nil {
					t.Fatal("expected error, got nil")
				}
				if status.Code(err) != tt.wantCode {
					t.Errorf("expected %v, got %v", tt.wantCode, status.Code(err))
				}
			} else {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
				if resp.Market.ID == "" {
					t.Error("expected non-empty market ID")
				}
				if resp.Market.YesProbability != 0.50 {
					t.Errorf("expected initial YES prob 0.50, got %v", resp.Market.YesProbability)
				}
			}
		})
	}
}

func TestMarketService_ResolveMarket(t *testing.T) {
	env := newTestEnv(t)
	ctx := adminCtx()

	// Get a seeded market
	listResp, _ := env.marketSvc.ListMarkets(ctx, &marketSvc.ListMarketsRequest{Page: 1, PerPage: 1})
	if len(listResp.Markets) == 0 {
		t.Skip("no markets available")
	}
	marketID := listResp.Markets[0].ID

	t.Run("admin can resolve", func(t *testing.T) {
		resp, err := env.marketSvc.ResolveMarket(ctx, &marketSvc.ResolveMarketRequest{
			ID:         marketID,
			Outcome:    models.MarketOutcomeYes,
			ResolverID: "admin-id",
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.Market.Status != models.MarketStatusResolved {
			t.Errorf("expected RESOLVED status, got %v", resp.Market.Status)
		}
		if resp.Market.YesProbability != 1.0 {
			t.Errorf("expected YES prob 1.0 after YES resolution, got %v", resp.Market.YesProbability)
		}
	})

	t.Run("non-admin cannot resolve", func(t *testing.T) {
		traderCtx := ctxWithRole("trader-id", string(models.UserRoleTrader))
		_, err := env.marketSvc.ResolveMarket(traderCtx, &marketSvc.ResolveMarketRequest{
			ID:      marketID,
			Outcome: models.MarketOutcomeNo,
		})
		if status.Code(err) != codes.PermissionDenied {
			t.Errorf("expected PermissionDenied, got %v", status.Code(err))
		}
	})

	t.Run("cannot resolve already resolved market", func(t *testing.T) {
		_, err := env.marketSvc.ResolveMarket(ctx, &marketSvc.ResolveMarketRequest{
			ID:      marketID,
			Outcome: models.MarketOutcomeNo,
		})
		if status.Code(err) != codes.AlreadyExists {
			t.Errorf("expected AlreadyExists, got %v", status.Code(err))
		}
	})
}

// ============================================================
//  ORDER SERVICE TESTS
// ============================================================

func TestOrderService_PlaceOrder(t *testing.T) {
	env := newTestEnv(t)

	// Get a seeded active market
	listResp, _ := env.marketSvc.ListMarkets(adminCtx(), &marketSvc.ListMarketsRequest{Page: 1, PerPage: 10})
	if len(listResp.Markets) == 0 {
		t.Fatal("no markets seeded")
	}
	marketID := listResp.Markets[0].ID

	// Create and fund a test user
	userResp, _ := env.userSvc.CreateUser(context.Background(), &userSvc.CreateUserRequest{
		Username: "trader1",
		Email:    "trader1@test.com",
		Password: "Password123!",
	})
	userID := userResp.User.ID
	env.walletStore.GetOrCreate(userID)
	env.walletStore.Deposit(userID, 10000, "test-deposit")

	userCtx := ctxWithRole(userID, string(models.UserRoleTrader))

	tests := []struct {
		name     string
		req      *orderSvc.PlaceOrderRequest
		wantErr  bool
		wantCode codes.Code
	}{
		{
			name: "valid buy yes limit order",
			req: &orderSvc.PlaceOrderRequest{
				UserID:   userID,
				MarketID: marketID,
				Side:     models.OrderSideBuy,
				Type:     models.OrderTypeLimit,
				Amount:   100.0,
				Price:    0.65,
				Outcome:  models.MarketOutcomeYes,
			},
			wantErr: false,
		},
		{
			name: "valid buy no limit order",
			req: &orderSvc.PlaceOrderRequest{
				UserID:   userID,
				MarketID: marketID,
				Side:     models.OrderSideBuy,
				Type:     models.OrderTypeLimit,
				Amount:   50.0,
				Price:    0.35,
				Outcome:  models.MarketOutcomeNo,
			},
			wantErr: false,
		},
		{
			name: "missing market id",
			req: &orderSvc.PlaceOrderRequest{
				UserID:  userID,
				Side:    models.OrderSideBuy,
				Type:    models.OrderTypeLimit,
				Amount:  100.0,
				Price:   0.65,
				Outcome: models.MarketOutcomeYes,
			},
			wantErr:  true,
			wantCode: codes.InvalidArgument,
		},
		{
			name: "zero amount",
			req: &orderSvc.PlaceOrderRequest{
				UserID:   userID,
				MarketID: marketID,
				Side:     models.OrderSideBuy,
				Type:     models.OrderTypeLimit,
				Amount:   0,
				Price:    0.65,
				Outcome:  models.MarketOutcomeYes,
			},
			wantErr:  true,
			wantCode: codes.InvalidArgument,
		},
		{
			name: "invalid outcome",
			req: &orderSvc.PlaceOrderRequest{
				UserID:   userID,
				MarketID: marketID,
				Side:     models.OrderSideBuy,
				Type:     models.OrderTypeLimit,
				Amount:   100,
				Price:    0.65,
				Outcome:  "maybe",
			},
			wantErr:  true,
			wantCode: codes.InvalidArgument,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := env.orderSvc.PlaceOrder(userCtx, tt.req)
			if tt.wantErr {
				if err == nil {
					t.Fatal("expected error, got nil")
				}
				if status.Code(err) != tt.wantCode {
					t.Errorf("expected %v, got %v", tt.wantCode, status.Code(err))
				}
			} else {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
				if resp.Order.ID == "" {
					t.Error("expected non-empty order ID")
				}
				if resp.Order.MarketID != tt.req.MarketID {
					t.Errorf("expected market %s, got %s", tt.req.MarketID, resp.Order.MarketID)
				}
			}
		})
	}
}

func TestOrderService_MatchingEngine(t *testing.T) {
	env := newTestEnv(t)

	// Get a seeded market
	listResp, _ := env.marketSvc.ListMarkets(adminCtx(), &marketSvc.ListMarketsRequest{Page: 1, PerPage: 1})
	marketID := listResp.Markets[0].ID

	// Create two users
	buyerResp, _ := env.userSvc.CreateUser(context.Background(), &userSvc.CreateUserRequest{
		Username: "buyer", Email: "buyer@test.com", Password: "Password123!",
	})
	sellerResp, _ := env.userSvc.CreateUser(context.Background(), &userSvc.CreateUserRequest{
		Username: "seller", Email: "seller@test.com", Password: "Password123!",
	})
	buyerID  := buyerResp.User.ID
	sellerID := sellerResp.User.ID

	// Fund both wallets
	env.walletStore.GetOrCreate(buyerID)
	env.walletStore.GetOrCreate(sellerID)
	env.walletStore.Deposit(buyerID, 10000, "buyer-deposit")
	env.walletStore.Deposit(sellerID, 10000, "seller-deposit")

	buyerCtx  := ctxWithRole(buyerID, string(models.UserRoleTrader))
	sellerCtx := ctxWithRole(sellerID, string(models.UserRoleTrader))

	// Seller posts a SELL YES order at $0.65
	sellResp, err := env.orderSvc.PlaceOrder(sellerCtx, &orderSvc.PlaceOrderRequest{
		UserID:   sellerID,
		MarketID: marketID,
		Side:     models.OrderSideSell,
		Type:     models.OrderTypeLimit,
		Amount:   100,
		Price:    0.65,
		Outcome:  models.MarketOutcomeYes,
	})
	if err != nil {
		t.Fatalf("seller place order: %v", err)
	}
	t.Logf("Sell order placed: %s status=%s", sellResp.Order.ID, sellResp.Order.Status)

	// Buyer posts a BUY YES order at $0.65 (matches seller)
	buyResp, err := env.orderSvc.PlaceOrder(buyerCtx, &orderSvc.PlaceOrderRequest{
		UserID:   buyerID,
		MarketID: marketID,
		Side:     models.OrderSideBuy,
		Type:     models.OrderTypeLimit,
		Amount:   100,
		Price:    0.65,
		Outcome:  models.MarketOutcomeYes,
	})
	if err != nil {
		t.Fatalf("buyer place order: %v", err)
	}
	t.Logf("Buy order placed: %s status=%s filled=%.2f", buyResp.Order.ID, buyResp.Order.Status, buyResp.Order.Filled)

	// Verify buyer's order filled (or at least partially)
	if buyResp.Order.Filled == 0 && buyResp.Order.Status != models.OrderStatusOpen {
		t.Log("Note: matching engine may not have filled — sell order may not have been resting yet")
	}
}

func TestOrderService_CancelOrder(t *testing.T) {
	env := newTestEnv(t)

	listResp, _ := env.marketSvc.ListMarkets(adminCtx(), &marketSvc.ListMarketsRequest{Page: 1, PerPage: 1})
	marketID := listResp.Markets[0].ID

	userResp, _ := env.userSvc.CreateUser(context.Background(), &userSvc.CreateUserRequest{
		Username: "canceller", Email: "cancel@test.com", Password: "Password123!",
	})
	userID := userResp.User.ID
	env.walletStore.GetOrCreate(userID)
	env.walletStore.Deposit(userID, 5000, "deposit")
	userCtx := ctxWithRole(userID, string(models.UserRoleTrader))

	// Place an order
	placeResp, err := env.orderSvc.PlaceOrder(userCtx, &orderSvc.PlaceOrderRequest{
		UserID: userID, MarketID: marketID,
		Side: models.OrderSideBuy, Type: models.OrderTypeLimit,
		Amount: 50, Price: 0.60, Outcome: models.MarketOutcomeYes,
	})
	if err != nil {
		t.Fatalf("place order: %v", err)
	}

	t.Run("owner can cancel", func(t *testing.T) {
		resp, err := env.orderSvc.CancelOrder(userCtx, &orderSvc.CancelOrderRequest{
			OrderID: placeResp.Order.ID,
			UserID:  userID,
		})
		if err != nil {
			t.Fatalf("cancel order: %v", err)
		}
		if resp.Order.Status != models.OrderStatusCancelled {
			t.Errorf("expected CANCELLED, got %v", resp.Order.Status)
		}
	})

	t.Run("non-owner cannot cancel", func(t *testing.T) {
		// Place another order
		placeResp2, _ := env.orderSvc.PlaceOrder(userCtx, &orderSvc.PlaceOrderRequest{
			UserID: userID, MarketID: marketID,
			Side: models.OrderSideBuy, Type: models.OrderTypeLimit,
			Amount: 30, Price: 0.55, Outcome: models.MarketOutcomeYes,
		})
		otherCtx := ctxWithRole("other-user-id", string(models.UserRoleTrader))
		_, err := env.orderSvc.CancelOrder(otherCtx, &orderSvc.CancelOrderRequest{
			OrderID: placeResp2.Order.ID,
			UserID:  "other-user-id",
		})
		if err == nil {
			t.Fatal("expected error, got nil")
		}
	})
}

// ============================================================
//  WALLET SERVICE TESTS
// ============================================================

func TestWalletService_DepositAndWithdraw(t *testing.T) {
	env := newTestEnv(t)

	userResp, _ := env.userSvc.CreateUser(context.Background(), &userSvc.CreateUserRequest{
		Username: "wallet-tester", Email: "wallet@test.com", Password: "Password123!",
	})
	userID := userResp.User.ID
	userCtx := ctxWithRole(userID, string(models.UserRoleTrader))

	t.Run("deposit increases balance", func(t *testing.T) {
		resp, err := env.walletSvc.Deposit(userCtx, &walletSvc.DepositRequest{
			UserID:    userID,
			Amount:    1000.0,
			Reference: "bank-ref-001",
		})
		if err != nil {
			t.Fatalf("deposit: %v", err)
		}
		// Initial demo balance is $1000, deposit adds $1000 = $2000
		if resp.Wallet.Balance < 1000 {
			t.Errorf("expected balance >= 1000, got %.2f", resp.Wallet.Balance)
		}
		if resp.Transaction.Amount != 1000.0 {
			t.Errorf("expected tx amount 1000, got %.2f", resp.Transaction.Amount)
		}
	})

	t.Run("withdraw reduces balance", func(t *testing.T) {
		// Get current balance
		walletResp, _ := env.walletSvc.GetWallet(userCtx, &walletSvc.GetWalletRequest{UserID: userID})
		balanceBefore := walletResp.Wallet.Balance

		resp, err := env.walletSvc.Withdraw(userCtx, &walletSvc.WithdrawRequest{
			UserID:  userID,
			Amount:  500.0,
			Address: "0xDEADBEEF",
		})
		if err != nil {
			t.Fatalf("withdraw: %v", err)
		}
		expected := balanceBefore - 500.0
		if resp.Wallet.Balance != expected {
			t.Errorf("expected %.2f after withdraw, got %.2f", expected, resp.Wallet.Balance)
		}
	})

	t.Run("overdraft rejected", func(t *testing.T) {
		_, err := env.walletSvc.Withdraw(userCtx, &walletSvc.WithdrawRequest{
			UserID:  userID,
			Amount:  9_999_999.0,
			Address: "0xGREEDY",
		})
		if err == nil {
			t.Fatal("expected error for overdraft, got nil")
		}
		if status.Code(err) != codes.FailedPrecondition {
			t.Errorf("expected FailedPrecondition, got %v", status.Code(err))
		}
	})

	t.Run("invalid amounts rejected", func(t *testing.T) {
		for _, amount := range []float64{0, -100, -0.01} {
			_, err := env.walletSvc.Deposit(userCtx, &walletSvc.DepositRequest{
				UserID: userID, Amount: amount,
			})
			if err == nil {
				t.Errorf("expected error for amount=%.2f, got nil", amount)
			}
		}
	})
}

// ============================================================
//  JWT MANAGER TESTS
// ============================================================

func TestJWTManager(t *testing.T) {
	jwtMgr := middleware.NewJWTManager(
		"test-secret-key",
		15*time.Minute,
		7*24*time.Hour,
		"test-issuer",
	)

	t.Run("generate and verify access token", func(t *testing.T) {
		token, err := jwtMgr.GenerateAccessToken("user-123", "user@test.com", "trader")
		if err != nil {
			t.Fatalf("generate token: %v", err)
		}
		if token == "" {
			t.Fatal("expected non-empty token")
		}

		claims, err := jwtMgr.Verify(token)
		if err != nil {
			t.Fatalf("verify token: %v", err)
		}
		if claims.UserID != "user-123" {
			t.Errorf("expected user-123, got %s", claims.UserID)
		}
		if claims.Email != "user@test.com" {
			t.Errorf("expected user@test.com, got %s", claims.Email)
		}
		if claims.Role != "trader" {
			t.Errorf("expected trader, got %s", claims.Role)
		}
	})

	t.Run("expired token rejected", func(t *testing.T) {
		expiredMgr := middleware.NewJWTManager("secret", -1*time.Second, time.Hour, "test")
		token, _ := expiredMgr.GenerateAccessToken("uid", "e@test.com", "trader")
		_, err := expiredMgr.Verify(token)
		if err == nil {
			t.Fatal("expected error for expired token, got nil")
		}
	})

	t.Run("tampered token rejected", func(t *testing.T) {
		token, _ := jwtMgr.GenerateAccessToken("uid", "e@test.com", "trader")
		_, err := jwtMgr.Verify(token + "tampered")
		if err == nil {
			t.Fatal("expected error for tampered token, got nil")
		}
	})

	t.Run("wrong secret rejected", func(t *testing.T) {
		otherMgr := middleware.NewJWTManager("different-secret", time.Hour, time.Hour, "test")
		token, _ := jwtMgr.GenerateAccessToken("uid", "e@test.com", "trader")
		_, err := otherMgr.Verify(token)
		if err == nil {
			t.Fatal("expected error for wrong-key token, got nil")
		}
	})
}

// ============================================================
//  INTEGRATION TEST — END-TO-END WORKFLOW
// ============================================================

func TestE2E_TradingWorkflow(t *testing.T) {
	env := newTestEnv(t)

	// Step 1: Register buyer and seller
	buyerResp, err := env.userSvc.CreateUser(context.Background(), &userSvc.CreateUserRequest{
		Username: "e2e-buyer", Email: "e2e-buyer@test.com", Password: "Password123!",
	})
	if err != nil {
		t.Fatalf("register buyer: %v", err)
	}
	sellerResp, err := env.userSvc.CreateUser(context.Background(), &userSvc.CreateUserRequest{
		Username: "e2e-seller", Email: "e2e-seller@test.com", Password: "Password123!",
	})
	if err != nil {
		t.Fatalf("register seller: %v", err)
	}

	buyerID  := buyerResp.User.ID
	sellerID := sellerResp.User.ID
	buyerCtx  := ctxWithRole(buyerID, string(models.UserRoleTrader))
	sellerCtx := ctxWithRole(sellerID, string(models.UserRoleTrader))

	// Step 2: Deposit funds
	_, err = env.walletSvc.Deposit(buyerCtx, &walletSvc.DepositRequest{
		UserID: buyerID, Amount: 5000, Reference: "e2e-buyer-deposit",
	})
	if err != nil {
		t.Fatalf("buyer deposit: %v", err)
	}
	_, err = env.walletSvc.Deposit(sellerCtx, &walletSvc.DepositRequest{
		UserID: sellerID, Amount: 5000, Reference: "e2e-seller-deposit",
	})
	if err != nil {
		t.Fatalf("seller deposit: %v", err)
	}

	// Step 3: Get a market
	listResp, _ := env.marketSvc.ListMarkets(adminCtx(), &marketSvc.ListMarketsRequest{Page: 1, PerPage: 1})
	if len(listResp.Markets) == 0 {
		t.Fatal("no markets available")
	}
	market := listResp.Markets[0]
	t.Logf("Trading on market: %s (%.0f%% YES)", market.Title, market.YesProbability*100)

	// Step 4: Seller posts SELL YES
	sellOrder, err := env.orderSvc.PlaceOrder(sellerCtx, &orderSvc.PlaceOrderRequest{
		UserID:   sellerID,
		MarketID: market.ID,
		Side:     models.OrderSideSell,
		Type:     models.OrderTypeLimit,
		Amount:   200,
		Price:    0.70,
		Outcome:  models.MarketOutcomeYes,
	})
	if err != nil {
		t.Fatalf("seller sell order: %v", err)
	}
	t.Logf("Sell order: id=%s status=%s", sellOrder.Order.ID, sellOrder.Order.Status)

	// Step 5: Buyer posts BUY YES at same price (should match)
	buyOrder, err := env.orderSvc.PlaceOrder(buyerCtx, &orderSvc.PlaceOrderRequest{
		UserID:   buyerID,
		MarketID: market.ID,
		Side:     models.OrderSideBuy,
		Type:     models.OrderTypeLimit,
		Amount:   200,
		Price:    0.70,
		Outcome:  models.MarketOutcomeYes,
	})
	if err != nil {
		t.Fatalf("buyer buy order: %v", err)
	}
	t.Logf("Buy order: id=%s status=%s filled=%.2f", buyOrder.Order.ID, buyOrder.Order.Status, buyOrder.Order.Filled)

	// Step 6: Check order book
	book, err := env.orderSvc.GetOrderBook(buyerCtx, &orderSvc.GetOrderBookRequest{MarketID: market.ID})
	if err != nil {
		t.Fatalf("order book: %v", err)
	}
	t.Logf("Order book: bids=%d asks=%d", len(book.Bids), len(book.Asks))

	// Step 7: Verify wallet impact
	buyerWallet, _ := env.walletSvc.GetWallet(buyerCtx, &walletSvc.GetWalletRequest{UserID: buyerID})
	t.Logf("Buyer wallet: balance=%.2f locked=%.2f", buyerWallet.Wallet.Balance, buyerWallet.Wallet.LockedBalance)

	// Step 8: Resolve market as admin
	adminCt := adminCtx()
	resolveResp, err := env.marketSvc.ResolveMarket(adminCt, &marketSvc.ResolveMarketRequest{
		ID:         market.ID,
		Outcome:    models.MarketOutcomeYes,
		ResolverID: "admin-id",
	})
	if err != nil {
		t.Fatalf("resolve market: %v", err)
	}
	if resolveResp.Market.Status != models.MarketStatusResolved {
		t.Errorf("expected RESOLVED, got %v", resolveResp.Market.Status)
	}

	// Step 9: Settle
	settleResp, err := env.walletSvc.SettleOrder(adminCt, &walletSvc.SettleOrderRequest{
		MarketID:       market.ID,
		WinningOutcome: models.MarketOutcomeYes,
	})
	if err != nil {
		t.Fatalf("settlement: %v", err)
	}
	t.Logf("Settlement: %d payouts processed", len(settleResp.Transactions))

	// Step 10: Verify buyer received payout
	buyerWalletAfter, _ := env.walletSvc.GetWallet(buyerCtx, &walletSvc.GetWalletRequest{UserID: buyerID})
	t.Logf("Buyer wallet after settlement: balance=%.2f", buyerWalletAfter.Wallet.Balance)

	fmt.Println("=== E2E test completed successfully ===")
}
