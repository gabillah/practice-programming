package config

import (
	"os"
	"strconv"
	"time"
)

// Config holds all application configuration.
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Services ServicesConfig
	Log      LogConfig
}

type ServerConfig struct {
	Host            string
	GRPCPort        int
	HTTPPort        int
	ShutdownTimeout time.Duration
	MaxConnections  int
	TLSEnabled      bool
	CertFile        string
	KeyFile         string
}

type DatabaseConfig struct {
	Host     string
	Port     int
	Name     string
	User     string
	Password string
	SSLMode  string
	MaxConns int
	MinConns int
}

type JWTConfig struct {
	Secret          string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
	Issuer         string
}

type ServicesConfig struct {
	UserServiceAddr   string
	MarketServiceAddr string
	OrderServiceAddr  string
	WalletServiceAddr string
}

type LogConfig struct {
	Level  string
	Format string
}

// Load reads configuration from environment variables with defaults.
func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Host:            getEnv("SERVER_HOST", "0.0.0.0"),
			GRPCPort:        getEnvInt("GRPC_PORT", 50051),
			HTTPPort:        getEnvInt("HTTP_PORT", 8080),
			ShutdownTimeout: getEnvDuration("SHUTDOWN_TIMEOUT", 30*time.Second),
			MaxConnections:  getEnvInt("MAX_CONNECTIONS", 1000),
			TLSEnabled:      getEnvBool("TLS_ENABLED", false),
			CertFile:        getEnv("CERT_FILE", "certs/server.crt"),
			KeyFile:         getEnv("KEY_FILE", "certs/server.key"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvInt("DB_PORT", 5432),
			Name:     getEnv("DB_NAME", "polymarket"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
			MaxConns: getEnvInt("DB_MAX_CONNS", 25),
			MinConns: getEnvInt("DB_MIN_CONNS", 5),
		},
		JWT: JWTConfig{
			Secret:          getEnv("JWT_SECRET", "polymarket-super-secret-key-change-in-production"),
			AccessTokenTTL:  getEnvDuration("JWT_ACCESS_TTL", 15*time.Minute),
			RefreshTokenTTL: getEnvDuration("JWT_REFRESH_TTL", 7*24*time.Hour),
			Issuer:         getEnv("JWT_ISSUER", "polymarket-api"),
		},
		Services: ServicesConfig{
			UserServiceAddr:   getEnv("USER_SERVICE_ADDR", "localhost:50051"),
			MarketServiceAddr: getEnv("MARKET_SERVICE_ADDR", "localhost:50052"),
			OrderServiceAddr:  getEnv("ORDER_SERVICE_ADDR", "localhost:50053"),
			WalletServiceAddr: getEnv("WALLET_SERVICE_ADDR", "localhost:50054"),
		},
		Log: LogConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "json"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	v := os.Getenv(key)
	if v == "" {
		return defaultValue
	}
	i, err := strconv.Atoi(v)
	if err != nil {
		return defaultValue
	}
	return i
}

func getEnvBool(key string, defaultValue bool) bool {
	v := os.Getenv(key)
	if v == "" {
		return defaultValue
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return defaultValue
	}
	return b
}

func getEnvDuration(key string, defaultValue time.Duration) time.Duration {
	v := os.Getenv(key)
	if v == "" {
		return defaultValue
	}
	d, err := time.ParseDuration(v)
	if err != nil {
		return defaultValue
	}
	return d
}
