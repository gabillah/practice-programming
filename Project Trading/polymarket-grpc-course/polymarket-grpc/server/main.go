// Command polymarket-server is the main entry point for the Polymarket gRPC
// prediction-market platform.
//
// It starts:
//   - An in-process gRPC server on :50051
//   - An HTTP/REST gateway on :8080 that delegates to the gRPC services
//
// Usage:
//
//	go run ./server/main.go
package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"github.com/polymarket-grpc/config"
	"github.com/polymarket-grpc/db"
	"github.com/polymarket-grpc/gateway"
	"github.com/polymarket-grpc/middleware"
	marketSvc "github.com/polymarket-grpc/services/market"
	orderSvc "github.com/polymarket-grpc/services/order"
	userSvc "github.com/polymarket-grpc/services/user"
	walletSvc "github.com/polymarket-grpc/services/wallet"
)

func main() {
	cfg := config.Load()

	// -----------------------------------------------------------------
	//  Logger
	// -----------------------------------------------------------------
	var logger *zap.Logger
	var err error
	if cfg.Log.Level == "debug" {
		logger, err = zap.NewDevelopment()
	} else {
		logger, err = zap.NewProduction()
	}
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to initialise logger: %v\n", err)
		os.Exit(1)
	}
	defer logger.Sync()

	logger.Info("starting Polymarket gRPC server",
		zap.String("grpc_port", fmt.Sprintf("%d", cfg.Server.GRPCPort)),
		zap.String("http_port", fmt.Sprintf("%d", cfg.Server.HTTPPort)),
	)

	// -----------------------------------------------------------------
	//  Data stores (in-memory; swap out for PostgreSQL in production)
	// -----------------------------------------------------------------
	userStore    := db.NewUserStore()
	marketStore  := db.NewMarketStore()
	orderStore   := db.NewOrderStore()
	walletStore  := db.NewWalletStore()

	// -----------------------------------------------------------------
	//  JWT manager
	// -----------------------------------------------------------------
	jwtMgr := middleware.NewJWTManager(
		cfg.JWT.Secret,
		cfg.JWT.AccessTokenTTL,
		cfg.JWT.RefreshTokenTTL,
		cfg.JWT.Issuer,
	)

	// -----------------------------------------------------------------
	//  Service implementations
	// -----------------------------------------------------------------
	userServer   := userSvc.NewServer(userStore, walletStore, jwtMgr, logger)
	marketServer := marketSvc.NewServer(marketStore, logger)
	orderServer  := orderSvc.NewServer(orderStore, walletStore, marketStore, logger)
	walletServer := walletSvc.NewServer(walletStore, orderStore, marketStore, logger)

	// -----------------------------------------------------------------
	//  gRPC server with interceptor chain
	// -----------------------------------------------------------------
	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			middleware.UnaryRecoveryInterceptor(logger),
			middleware.UnaryLoggingInterceptor(logger),
			middleware.UnaryAuthInterceptor(jwtMgr),
		),
		grpc.ChainStreamInterceptor(
			middleware.StreamLoggingInterceptor(logger),
			middleware.StreamAuthInterceptor(jwtMgr),
		),
	)

	// NOTE: When you run protoc and have the generated code, replace the
	// stubs below with the real registration calls, e.g.:
	//   pb.RegisterUserServiceServer(grpcServer, userServer)
	//   pb.RegisterMarketServiceServer(grpcServer, marketServer)
	//   pb.RegisterOrderServiceServer(grpcServer, orderServer)
	//   pb.RegisterWalletServiceServer(grpcServer, walletServer)

	// Enable gRPC server reflection (allows grpcurl and Evans CLI to introspect)
	reflection.Register(grpcServer)

	grpcLis, err := net.Listen("tcp", fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.GRPCPort))
	if err != nil {
		logger.Fatal("failed to listen for gRPC", zap.Error(err))
	}

	// -----------------------------------------------------------------
	//  HTTP gateway
	// -----------------------------------------------------------------
	gw := gateway.New(userServer, marketServer, orderServer, walletServer, jwtMgr, logger)
	httpServer := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.HTTPPort),
		Handler:      gw,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// -----------------------------------------------------------------
	//  Start servers in goroutines
	// -----------------------------------------------------------------
	errCh := make(chan error, 2)

	go func() {
		logger.Info("gRPC server listening", zap.String("addr", grpcLis.Addr().String()))
		if err := grpcServer.Serve(grpcLis); err != nil {
			errCh <- fmt.Errorf("gRPC server error: %w", err)
		}
	}()

	go func() {
		logger.Info("HTTP gateway listening", zap.String("addr", httpServer.Addr))
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errCh <- fmt.Errorf("HTTP gateway error: %w", err)
		}
	}()

	// -----------------------------------------------------------------
	//  Graceful shutdown on SIGINT / SIGTERM
	// -----------------------------------------------------------------
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-quit:
		logger.Info("received shutdown signal", zap.String("signal", sig.String()))
	case err := <-errCh:
		logger.Error("server error, shutting down", zap.Error(err))
	}

	logger.Info("shutting down gracefully...")

	// Stop gRPC (stops accepting new connections, drains in-flight RPCs)
	stopped := make(chan struct{})
	go func() {
		grpcServer.GracefulStop()
		close(stopped)
	}()

	// Shutdown HTTP gateway
	ctx, cancel := context.WithTimeout(context.Background(), cfg.Server.ShutdownTimeout)
	defer cancel()
	if err := httpServer.Shutdown(ctx); err != nil {
		logger.Error("HTTP gateway shutdown error", zap.Error(err))
	}

	select {
	case <-stopped:
	case <-ctx.Done():
		logger.Warn("gRPC graceful stop timed out — forcing")
		grpcServer.Stop()
	}

	logger.Info("server stopped cleanly")
}
