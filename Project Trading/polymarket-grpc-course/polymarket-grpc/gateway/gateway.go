// Package gateway implements an HTTP/REST API gateway that translates
// HTTP requests into calls against the internal gRPC services.
// In production you would use grpc-gateway or Envoy instead.
package gateway

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc/metadata"

	"github.com/polymarket-grpc/middleware"
	"github.com/polymarket-grpc/models"
	"github.com/polymarket-grpc/services/market"
	"github.com/polymarket-grpc/services/order"
	"github.com/polymarket-grpc/services/user"
	"github.com/polymarket-grpc/services/wallet"
)

// Gateway is an HTTP server that delegates to the gRPC service implementations.
type Gateway struct {
	mux         *http.ServeMux
	userSvc     *user.Server
	marketSvc   *market.Server
	orderSvc    *order.Server
	walletSvc   *wallet.Server
	jwtMgr      *middleware.JWTManager
	logger      *zap.Logger
}

// New builds the gateway and registers all HTTP routes.
func New(
	userSvc *user.Server,
	marketSvc *market.Server,
	orderSvc *order.Server,
	walletSvc *wallet.Server,
	jwtMgr *middleware.JWTManager,
	logger *zap.Logger,
) *Gateway {
	g := &Gateway{
		mux:       http.NewServeMux(),
		userSvc:   userSvc,
		marketSvc: marketSvc,
		orderSvc:  orderSvc,
		walletSvc: walletSvc,
		jwtMgr:    jwtMgr,
		logger:    logger,
	}
	g.routes()
	return g
}

func (g *Gateway) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Authorization,Content-Type")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	start := time.Now()
	wrapped := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}
	g.mux.ServeHTTP(wrapped, r)
	g.logger.Info("http request",
		zap.String("method", r.Method),
		zap.String("path", r.URL.Path),
		zap.Int("status", wrapped.statusCode),
		zap.Duration("duration", time.Since(start)),
	)
}

// routes registers all REST endpoints.
func (g *Gateway) routes() {
	// Health
	g.mux.HandleFunc("/health", g.handleHealth)
	g.mux.HandleFunc("/ready",  g.handleHealth)

	// Users
	g.mux.HandleFunc("/api/v1/users/register", g.handleRegister)
	g.mux.HandleFunc("/api/v1/users/login",    g.handleLogin)
	g.mux.HandleFunc("/api/v1/users/",         g.auth(g.handleUser))

	// Markets
	g.mux.HandleFunc("/api/v1/markets",    g.auth(g.handleMarkets))
	g.mux.HandleFunc("/api/v1/markets/",   g.auth(g.handleMarket))

	// Orders
	g.mux.HandleFunc("/api/v1/orders",   g.auth(g.handleOrders))
	g.mux.HandleFunc("/api/v1/orders/",  g.auth(g.handleOrder))

	// Order book
	g.mux.HandleFunc("/api/v1/orderbook/", g.auth(g.handleOrderBook))

	// Wallet
	g.mux.HandleFunc("/api/v1/wallet",          g.auth(g.handleWallet))
	g.mux.HandleFunc("/api/v1/wallet/deposit",  g.auth(g.handleDeposit))
	g.mux.HandleFunc("/api/v1/wallet/withdraw", g.auth(g.handleWithdraw))
	g.mux.HandleFunc("/api/v1/transactions",    g.auth(g.handleTransactions))
}

// -----------------------------------------------------------------
//  Health
// -----------------------------------------------------------------

func (g *Gateway) handleHealth(w http.ResponseWriter, r *http.Request) {
	g.jsonOK(w, map[string]string{
		"status":    "ok",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

// -----------------------------------------------------------------
//  User handlers
// -----------------------------------------------------------------

func (g *Gateway) handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		g.methodNotAllowed(w)
		return
	}
	var req user.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		g.badRequest(w, "invalid JSON body")
		return
	}
	resp, err := g.userSvc.CreateUser(r.Context(), &req)
	if err != nil {
		g.grpcErr(w, err)
		return
	}
	g.jsonOK(w, resp)
}

func (g *Gateway) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		g.methodNotAllowed(w)
		return
	}
	var req user.AuthenticateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		g.badRequest(w, "invalid JSON body")
		return
	}
	resp, err := g.userSvc.Authenticate(r.Context(), &req)
	if err != nil {
		g.grpcErr(w, err)
		return
	}
	g.jsonOK(w, resp)
}

func (g *Gateway) handleUser(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/users/")
	switch r.Method {
	case http.MethodGet:
		resp, err := g.userSvc.GetUser(r.Context(), &user.GetUserRequest{ID: id})
		if err != nil {
			g.grpcErr(w, err)
			return
		}
		g.jsonOK(w, resp)
	case http.MethodPut:
		var req user.UpdateUserRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			g.badRequest(w, "invalid JSON")
			return
		}
		req.ID = id
		resp, err := g.userSvc.UpdateUser(r.Context(), &req)
		if err != nil {
			g.grpcErr(w, err)
			return
		}
		g.jsonOK(w, resp)
	case http.MethodDelete:
		_, err := g.userSvc.DeleteUser(r.Context(), &user.DeleteUserRequest{ID: id})
		if err != nil {
			g.grpcErr(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	default:
		g.methodNotAllowed(w)
	}
}

// -----------------------------------------------------------------
//  Market handlers
// -----------------------------------------------------------------

func (g *Gateway) handleMarkets(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		q := r.URL.Query()
		resp, err := g.marketSvc.ListMarkets(r.Context(), &market.ListMarketsRequest{
			Page:     parseInt(q.Get("page"), 1),
			PerPage:  parseInt(q.Get("per_page"), 20),
			Category: q.Get("category"),
		})
		if err != nil {
			g.grpcErr(w, err)
			return
		}
		g.jsonOK(w, resp)
	case http.MethodPost:
		var req market.CreateMarketRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			g.badRequest(w, "invalid JSON")
			return
		}
		resp, err := g.marketSvc.CreateMarket(r.Context(), &req)
		if err != nil {
			g.grpcErr(w, err)
			return
		}
		g.jsonCreated(w, resp)
	default:
		g.methodNotAllowed(w)
	}
}

func (g *Gateway) handleMarket(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/markets/")
	// Check if this is a resolve sub-path
	if strings.HasSuffix(id, "/resolve") {
		id = strings.TrimSuffix(id, "/resolve")
		if r.Method != http.MethodPost {
			g.methodNotAllowed(w)
			return
		}
		var req market.ResolveMarketRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			g.badRequest(w, "invalid JSON")
			return
		}
		req.ID = id
		resp, err := g.marketSvc.ResolveMarket(r.Context(), &req)
		if err != nil {
			g.grpcErr(w, err)
			return
		}
		g.jsonOK(w, resp)
		return
	}

	if r.Method != http.MethodGet {
		g.methodNotAllowed(w)
		return
	}
	resp, err := g.marketSvc.GetMarket(r.Context(), &market.GetMarketRequest{ID: id})
	if err != nil {
		g.grpcErr(w, err)
		return
	}
	g.jsonOK(w, resp)
}

// -----------------------------------------------------------------
//  Order handlers
// -----------------------------------------------------------------

func (g *Gateway) handleOrders(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		q := r.URL.Query()
		resp, err := g.orderSvc.ListOrders(r.Context(), &order.ListOrdersRequest{
			MarketID: q.Get("market_id"),
			Page:     parseInt(q.Get("page"), 1),
			PerPage:  parseInt(q.Get("per_page"), 20),
		})
		if err != nil {
			g.grpcErr(w, err)
			return
		}
		g.jsonOK(w, resp)
	case http.MethodPost:
		var req order.PlaceOrderRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			g.badRequest(w, "invalid JSON")
			return
		}
		resp, err := g.orderSvc.PlaceOrder(r.Context(), &req)
		if err != nil {
			g.grpcErr(w, err)
			return
		}
		g.jsonCreated(w, resp)
	default:
		g.methodNotAllowed(w)
	}
}

func (g *Gateway) handleOrder(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/v1/orders/")
	switch r.Method {
	case http.MethodGet:
		resp, err := g.orderSvc.GetOrder(r.Context(), &order.GetOrderRequest{ID: id})
		if err != nil {
			g.grpcErr(w, err)
			return
		}
		g.jsonOK(w, resp)
	case http.MethodDelete:
		callerID := r.Context().Value(middleware.ContextKeyUserID).(string)
		resp, err := g.orderSvc.CancelOrder(r.Context(), &order.CancelOrderRequest{
			OrderID: id,
			UserID:  callerID,
		})
		if err != nil {
			g.grpcErr(w, err)
			return
		}
		g.jsonOK(w, resp)
	default:
		g.methodNotAllowed(w)
	}
}

func (g *Gateway) handleOrderBook(w http.ResponseWriter, r *http.Request) {
	marketID := strings.TrimPrefix(r.URL.Path, "/api/v1/orderbook/")
	resp, err := g.orderSvc.GetOrderBook(r.Context(), &order.GetOrderBookRequest{MarketID: marketID})
	if err != nil {
		g.grpcErr(w, err)
		return
	}
	g.jsonOK(w, resp)
}

// -----------------------------------------------------------------
//  Wallet handlers
// -----------------------------------------------------------------

func (g *Gateway) handleWallet(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		g.methodNotAllowed(w)
		return
	}
	resp, err := g.walletSvc.GetWallet(r.Context(), &wallet.GetWalletRequest{})
	if err != nil {
		g.grpcErr(w, err)
		return
	}
	g.jsonOK(w, resp)
}

func (g *Gateway) handleDeposit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		g.methodNotAllowed(w)
		return
	}
	var req wallet.DepositRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		g.badRequest(w, "invalid JSON")
		return
	}
	resp, err := g.walletSvc.Deposit(r.Context(), &req)
	if err != nil {
		g.grpcErr(w, err)
		return
	}
	g.jsonOK(w, resp)
}

func (g *Gateway) handleWithdraw(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		g.methodNotAllowed(w)
		return
	}
	var req wallet.WithdrawRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		g.badRequest(w, "invalid JSON")
		return
	}
	resp, err := g.walletSvc.Withdraw(r.Context(), &req)
	if err != nil {
		g.grpcErr(w, err)
		return
	}
	g.jsonOK(w, resp)
}

func (g *Gateway) handleTransactions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		g.methodNotAllowed(w)
		return
	}
	q := r.URL.Query()
	resp, err := g.walletSvc.ListTransactions(r.Context(), &wallet.ListTransactionsRequest{
		Type:    models.TransactionType(q.Get("type")),
		Page:    parseInt(q.Get("page"), 1),
		PerPage: parseInt(q.Get("per_page"), 20),
	})
	if err != nil {
		g.grpcErr(w, err)
		return
	}
	g.jsonOK(w, resp)
}

// -----------------------------------------------------------------
//  Auth middleware
// -----------------------------------------------------------------

// auth wraps a handler with JWT authentication.
func (g *Gateway) auth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			g.unauthorized(w, "missing Authorization header")
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := g.jwtMgr.Verify(tokenStr)
		if err != nil {
			g.unauthorized(w, fmt.Sprintf("invalid token: %v", err))
			return
		}

		ctx := context.WithValue(r.Context(), middleware.ContextKeyUserID, claims.UserID)
		ctx = context.WithValue(ctx, middleware.ContextKeyEmail, claims.Email)
		ctx = context.WithValue(ctx, middleware.ContextKeyRole, claims.Role)

		// Also inject into gRPC metadata so service methods can use GetUserIDFromCtx
		md := metadata.New(map[string]string{
			"user_id": claims.UserID,
			"role":    claims.Role,
		})
		ctx = metadata.NewIncomingContext(ctx, md)

		next(w, r.WithContext(ctx))
	}
}

// -----------------------------------------------------------------
//  Response helpers
// -----------------------------------------------------------------

type errorResponse struct {
	Error   string `json:"error"`
	Code    int    `json:"code"`
}

func (g *Gateway) jsonOK(w http.ResponseWriter, v interface{}) {
	g.jsonResponse(w, http.StatusOK, v)
}

func (g *Gateway) jsonCreated(w http.ResponseWriter, v interface{}) {
	g.jsonResponse(w, http.StatusCreated, v)
}

func (g *Gateway) jsonResponse(w http.ResponseWriter, code int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func (g *Gateway) badRequest(w http.ResponseWriter, msg string) {
	g.jsonResponse(w, http.StatusBadRequest, errorResponse{Error: msg, Code: http.StatusBadRequest})
}

func (g *Gateway) unauthorized(w http.ResponseWriter, msg string) {
	g.jsonResponse(w, http.StatusUnauthorized, errorResponse{Error: msg, Code: http.StatusUnauthorized})
}

func (g *Gateway) methodNotAllowed(w http.ResponseWriter) {
	g.jsonResponse(w, http.StatusMethodNotAllowed, errorResponse{Error: "method not allowed", Code: http.StatusMethodNotAllowed})
}

func (g *Gateway) grpcErr(w http.ResponseWriter, err error) {
	code := http.StatusInternalServerError
	msg := err.Error()

	if strings.Contains(msg, "InvalidArgument") {
		code = http.StatusBadRequest
	} else if strings.Contains(msg, "NotFound") {
		code = http.StatusNotFound
	} else if strings.Contains(msg, "AlreadyExists") {
		code = http.StatusConflict
	} else if strings.Contains(msg, "PermissionDenied") {
		code = http.StatusForbidden
	} else if strings.Contains(msg, "Unauthenticated") {
		code = http.StatusUnauthorized
	} else if strings.Contains(msg, "FailedPrecondition") {
		code = http.StatusUnprocessableEntity
	}

	g.jsonResponse(w, code, errorResponse{Error: msg, Code: code})
}

// -----------------------------------------------------------------
//  Misc helpers
// -----------------------------------------------------------------

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func parseInt(s string, def int) int {
	if s == "" {
		return def
	}
	var v int
	_, err := fmt.Sscan(s, &v)
	if err != nil || v < 1 {
		return def
	}
	return v
}
