// Package user implements the UserService gRPC server.
package user

import (
	"context"
	"fmt"
	"time"

	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"

	"github.com/polymarket-grpc/db"
	"github.com/polymarket-grpc/middleware"
	"github.com/polymarket-grpc/models"

	// In a real project this would be the generated protobuf package.
	// We define the interface inline to keep the project self-contained.
)

// -----------------------------------------------------------------
//  Protobuf stubs (normally auto-generated from polymarket.proto)
// -----------------------------------------------------------------

// The real implementation would import the generated package, e.g.:
//   pb "github.com/polymarket-grpc/proto/polymarket"
// and embed pb.UnimplementedUserServiceServer.
// Here we define the request/response shapes manually so the project
// can be read without running protoc.

type CreateUserRequest struct {
	Username      string
	Email         string
	Password      string
	WalletAddress string
}

type CreateUserResponse struct {
	User  *UserProto
	Token string
}

type GetUserRequest struct{ ID string }
type GetUserResponse struct{ User *UserProto }

type UpdateUserRequest struct {
	ID            string
	Username      string
	Email         string
	WalletAddress string
}
type UpdateUserResponse struct{ User *UserProto }

type DeleteUserRequest struct{ ID string }

type AuthenticateRequest struct {
	Email    string
	Password string
}
type AuthenticateResponse struct {
	Token        string
	RefreshToken string
	User         *UserProto
}

type ListUsersRequest struct {
	Page    int
	PerPage int
}
type ListUsersResponse struct {
	Users      []*UserProto
	Page       int
	PerPage    int
	TotalPages int
	TotalItems int64
}

type UserProto struct {
	ID            string
	Username      string
	Email         string
	WalletAddress string
	Role          string
	IsActive      bool
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// -----------------------------------------------------------------
//  Service
// -----------------------------------------------------------------

// Server implements the UserService gRPC server.
type Server struct {
	store      *db.UserStore
	walletStore *db.WalletStore
	jwtMgr     *middleware.JWTManager
	logger     *zap.Logger
}

func NewServer(
	store *db.UserStore,
	walletStore *db.WalletStore,
	jwtMgr *middleware.JWTManager,
	logger *zap.Logger,
) *Server {
	return &Server{
		store:      store,
		walletStore: walletStore,
		jwtMgr:     jwtMgr,
		logger:     logger,
	}
}

// CreateUser registers a new user account and returns an access token.
func (s *Server) CreateUser(ctx context.Context, req *CreateUserRequest) (*CreateUserResponse, error) {
	if req.Email == "" || req.Password == "" || req.Username == "" {
		return nil, status.Error(codes.InvalidArgument, "username, email, and password are required")
	}
	if len(req.Password) < 8 {
		return nil, status.Error(codes.InvalidArgument, "password must be at least 8 characters")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to hash password: %v", err)
	}

	u := &models.User{
		Username:      req.Username,
		Email:         req.Email,
		PasswordHash:  string(hash),
		WalletAddress: req.WalletAddress,
		Role:          models.UserRoleTrader,
	}

	created, err := s.store.Create(u)
	if err != nil {
		return nil, status.Errorf(codes.AlreadyExists, "%v", err)
	}

	// Initialise wallet for new user
	s.walletStore.GetOrCreate(created.ID)

	token, err := s.jwtMgr.GenerateAccessToken(created.ID, created.Email, string(created.Role))
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to generate token: %v", err)
	}

	s.logger.Info("user created", zap.String("id", created.ID), zap.String("email", created.Email))

	return &CreateUserResponse{
		User:  modelToProto(created),
		Token: token,
	}, nil
}

// GetUser retrieves a user by ID.
func (s *Server) GetUser(ctx context.Context, req *GetUserRequest) (*GetUserResponse, error) {
	if req.ID == "" {
		return nil, status.Error(codes.InvalidArgument, "user id is required")
	}

	u, err := s.store.GetByID(req.ID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "%v", err)
	}
	return &GetUserResponse{User: modelToProto(u)}, nil
}

// UpdateUser updates mutable fields of a user profile.
func (s *Server) UpdateUser(ctx context.Context, req *UpdateUserRequest) (*UpdateUserResponse, error) {
	if req.ID == "" {
		return nil, status.Error(codes.InvalidArgument, "user id is required")
	}

	// Verify caller is updating their own profile (or is admin)
	callerID, _ := middleware.GetUserIDFromCtx(ctx)
	role, _ := middleware.GetRoleFromCtx(ctx)
	if callerID != req.ID && role != string(models.UserRoleAdmin) {
		return nil, status.Error(codes.PermissionDenied, "cannot update another user's profile")
	}

	u, err := s.store.GetByID(req.ID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "%v", err)
	}

	if req.Username != "" {
		u.Username = req.Username
	}
	if req.Email != "" {
		u.Email = req.Email
	}
	if req.WalletAddress != "" {
		u.WalletAddress = req.WalletAddress
	}

	updated, err := s.store.Update(u)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "update failed: %v", err)
	}
	return &UpdateUserResponse{User: modelToProto(updated)}, nil
}

// DeleteUser removes a user account.
func (s *Server) DeleteUser(ctx context.Context, req *DeleteUserRequest) (*emptypb.Empty, error) {
	if req.ID == "" {
		return nil, status.Error(codes.InvalidArgument, "user id is required")
	}
	role, _ := middleware.GetRoleFromCtx(ctx)
	if role != string(models.UserRoleAdmin) {
		return nil, status.Error(codes.PermissionDenied, "only admins can delete users")
	}
	if err := s.store.Delete(req.ID); err != nil {
		return nil, status.Errorf(codes.NotFound, "%v", err)
	}
	return &emptypb.Empty{}, nil
}

// Authenticate validates credentials and returns JWT tokens.
func (s *Server) Authenticate(ctx context.Context, req *AuthenticateRequest) (*AuthenticateResponse, error) {
	if req.Email == "" || req.Password == "" {
		return nil, status.Error(codes.InvalidArgument, "email and password required")
	}

	u, err := s.store.GetByEmail(req.Email)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password)); err != nil {
		return nil, status.Error(codes.Unauthenticated, "invalid credentials")
	}

	if !u.IsActive {
		return nil, status.Error(codes.PermissionDenied, "account is inactive")
	}

	accessToken, err := s.jwtMgr.GenerateAccessToken(u.ID, u.Email, string(u.Role))
	if err != nil {
		return nil, status.Errorf(codes.Internal, "token generation failed: %v", err)
	}
	refreshToken, err := s.jwtMgr.GenerateRefreshToken(u.ID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "refresh token generation failed: %v", err)
	}

	s.logger.Info("user authenticated", zap.String("id", u.ID))
	return &AuthenticateResponse{
		Token:        accessToken,
		RefreshToken: refreshToken,
		User:         modelToProto(u),
	}, nil
}

// ListUsers returns a paginated list of all users (admin only).
func (s *Server) ListUsers(ctx context.Context, req *ListUsersRequest) (*ListUsersResponse, error) {
	role, _ := middleware.GetRoleFromCtx(ctx)
	if role != string(models.UserRoleAdmin) {
		return nil, status.Error(codes.PermissionDenied, "only admins can list users")
	}

	page, perPage := normalise(req.Page, req.PerPage)
	users, total := s.store.List(page, perPage)

	protos := make([]*UserProto, 0, len(users))
	for _, u := range users {
		protos = append(protos, modelToProto(u))
	}

	totalPages := int(total) / perPage
	if int(total)%perPage != 0 {
		totalPages++
	}

	return &ListUsersResponse{
		Users:      protos,
		Page:       page,
		PerPage:    perPage,
		TotalPages: totalPages,
		TotalItems: total,
	}, nil
}

// WatchUser is a server-streaming RPC that emits profile updates.
// (In a real system this would be backed by a pub/sub or DB change-data-capture.)
func (s *Server) WatchUser(req *GetUserRequest, stream interface{ Send(*UserProto) error }) error {
	u, err := s.store.GetByID(req.ID)
	if err != nil {
		return status.Errorf(codes.NotFound, "%v", err)
	}

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	if err := stream.Send(modelToProto(u)); err != nil {
		return err
	}

	for {
		select {
		case <-ticker.C:
			u, err = s.store.GetByID(req.ID)
			if err != nil {
				return status.Errorf(codes.NotFound, "%v", err)
			}
			if err := stream.Send(modelToProto(u)); err != nil {
				return err
			}
		}
	}
}

// -----------------------------------------------------------------
//  Helpers
// -----------------------------------------------------------------

func modelToProto(u *models.User) *UserProto {
	return &UserProto{
		ID:            u.ID,
		Username:      u.Username,
		Email:         u.Email,
		WalletAddress: u.WalletAddress,
		Role:          string(u.Role),
		IsActive:      u.IsActive,
		CreatedAt:     u.CreatedAt,
		UpdatedAt:     u.UpdatedAt,
	}
}

// timestampProto converts time.Time to *timestamppb.Timestamp (used when
// wiring the generated proto types).
func timestampProto(t time.Time) *timestamppb.Timestamp {
	return timestamppb.New(t)
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

// ValidationError wraps a field name and message for structured errors.
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("validation error: field=%s, message=%s", e.Field, e.Message)
}
