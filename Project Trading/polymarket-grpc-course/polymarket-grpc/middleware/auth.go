// Package middleware provides gRPC interceptors for authentication,
// logging, rate limiting, and observability.
package middleware

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// ============================================================
//  JWT HELPERS
// ============================================================

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type JWTManager struct {
	secret          string
	accessTokenTTL  time.Duration
	refreshTokenTTL time.Duration
	issuer          string
}

func NewJWTManager(secret string, accessTTL, refreshTTL time.Duration, issuer string) *JWTManager {
	return &JWTManager{
		secret:          secret,
		accessTokenTTL:  accessTTL,
		refreshTokenTTL: refreshTTL,
		issuer:          issuer,
	}
}

func (j *JWTManager) GenerateAccessToken(userID, email, role string) (string, error) {
	claims := &Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    j.issuer,
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.accessTokenTTL)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secret))
}

func (j *JWTManager) GenerateRefreshToken(userID string) (string, error) {
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    j.issuer,
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.refreshTokenTTL)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secret))
}

func (j *JWTManager) Verify(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(
		tokenStr,
		&Claims{},
		func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return []byte(j.secret), nil
		},
	)
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}
	return claims, nil
}

// ============================================================
//  CONTEXT KEYS
// ============================================================

type contextKey string

const (
	ContextKeyUserID contextKey = "user_id"
	ContextKeyEmail  contextKey = "email"
	ContextKeyRole   contextKey = "role"
)

func GetUserIDFromCtx(ctx context.Context) (string, bool) {
	v, ok := ctx.Value(ContextKeyUserID).(string)
	return v, ok
}

func GetRoleFromCtx(ctx context.Context) (string, bool) {
	v, ok := ctx.Value(ContextKeyRole).(string)
	return v, ok
}

// ============================================================
//  AUTH INTERCEPTOR (UNARY)
// ============================================================

// publicMethods are gRPC full method names that do NOT require auth.
var publicMethods = map[string]bool{
	"/polymarket.UserService/CreateUser":    true,
	"/polymarket.UserService/Authenticate":  true,
}

func UnaryAuthInterceptor(jwtManager *JWTManager) grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		if publicMethods[info.FullMethod] {
			return handler(ctx, req)
		}

		ctx, err := authorize(ctx, jwtManager)
		if err != nil {
			return nil, err
		}
		return handler(ctx, req)
	}
}

// StreamAuthInterceptor enforces JWT on streaming RPCs.
func StreamAuthInterceptor(jwtManager *JWTManager) grpc.StreamServerInterceptor {
	return func(
		srv interface{},
		ss grpc.ServerStream,
		info *grpc.StreamServerInfo,
		handler grpc.StreamHandler,
	) error {
		ctx, err := authorize(ss.Context(), jwtManager)
		if err != nil {
			return err
		}
		// wrap the stream with the enriched context
		wrapped := &wrappedStream{ss, ctx}
		return handler(srv, wrapped)
	}
}

func authorize(ctx context.Context, jwtManager *JWTManager) (context.Context, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, status.Error(codes.Unauthenticated, "missing metadata")
	}

	values := md["authorization"]
	if len(values) == 0 {
		return nil, status.Error(codes.Unauthenticated, "missing authorization header")
	}

	tokenStr := strings.TrimPrefix(values[0], "Bearer ")
	claims, err := jwtManager.Verify(tokenStr)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "invalid token: %v", err)
	}

	ctx = context.WithValue(ctx, ContextKeyUserID, claims.UserID)
	ctx = context.WithValue(ctx, ContextKeyEmail, claims.Email)
	ctx = context.WithValue(ctx, ContextKeyRole, claims.Role)
	return ctx, nil
}

// wrappedStream replaces the embedded context.
type wrappedStream struct {
	grpc.ServerStream
	ctx context.Context
}

func (w *wrappedStream) Context() context.Context { return w.ctx }

// ============================================================
//  LOGGING INTERCEPTOR (UNARY)
// ============================================================

func UnaryLoggingInterceptor(logger *zap.Logger) grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {
		start := time.Now()
		resp, err := handler(ctx, req)
		duration := time.Since(start)

		fields := []zap.Field{
			zap.String("method", info.FullMethod),
			zap.Duration("duration", duration),
		}
		if userID, ok := GetUserIDFromCtx(ctx); ok {
			fields = append(fields, zap.String("user_id", userID))
		}
		if err != nil {
			fields = append(fields, zap.Error(err))
			logger.Error("gRPC call failed", fields...)
		} else {
			logger.Info("gRPC call succeeded", fields...)
		}
		return resp, err
	}
}

// StreamLoggingInterceptor logs streaming RPCs.
func StreamLoggingInterceptor(logger *zap.Logger) grpc.StreamServerInterceptor {
	return func(
		srv interface{},
		ss grpc.ServerStream,
		info *grpc.StreamServerInfo,
		handler grpc.StreamHandler,
	) error {
		start := time.Now()
		err := handler(srv, ss)
		logger.Info("gRPC stream finished",
			zap.String("method", info.FullMethod),
			zap.Duration("duration", time.Since(start)),
			zap.Bool("server_stream", info.IsServerStream),
			zap.Bool("client_stream", info.IsClientStream),
			zap.Error(err),
		)
		return err
	}
}

// ============================================================
//  RECOVERY INTERCEPTOR (PANIC HANDLER)
// ============================================================

func UnaryRecoveryInterceptor(logger *zap.Logger) grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (resp interface{}, err error) {
		defer func() {
			if r := recover(); r != nil {
				logger.Error("recovered from panic",
					zap.String("method", info.FullMethod),
					zap.Any("panic", r),
				)
				err = status.Errorf(codes.Internal, "internal server error")
			}
		}()
		return handler(ctx, req)
	}
}
