# =============================================================================
# utils/config.py
# Application configuration — reads from environment / .env file
# =============================================================================

from __future__ import annotations

import os
from functools import lru_cache
from typing import List, Literal, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application settings.

    All values can be overridden via environment variables (case-insensitive)
    or a .env file placed at the project root.

    Example .env
    ------------
    APP_ENV=production
    DATABASE_URL=postgresql+asyncpg://user:pw@localhost/cfd
    SECRET_KEY=supersecretkey
    CORS_ORIGINS=["https://myapp.com"]
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────────────────────────
    APP_NAME: str = "CFD Pipe Flow Solver"
    APP_VERSION: str = "1.0.0"
    APP_ENV: Literal["development", "testing", "production"] = "development"
    DEBUG: bool = True

    # ── Server ─────────────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1  # uvicorn worker count (>1 in production)

    # ── Database ───────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite+aiosqlite:///./cfd_pipe_flow.db"
    DATABASE_ECHO: bool = False          # set True to log every SQL statement
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30            # seconds
    DB_POOL_RECYCLE: int = 1800          # recycle connections every 30 min

    # ── Security ───────────────────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_cfdsolver_secret_2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # ── CORS ───────────────────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # ── Solver limits ──────────────────────────────────────────────────────
    MAX_ITERATIONS_HARDY_CROSS: int = 500
    MAX_ITERATIONS_NEWTON_RAPHSON: int = 200
    MAX_ITERATIONS_WATER_HAMMER: int = 10_000
    DEFAULT_CONVERGENCE_TOLERANCE: float = 1e-6
    DEFAULT_RELAXATION_FACTOR: float = 0.5
    MAX_PIPES_PER_NETWORK: int = 2_000
    MAX_NODES_PER_NETWORK: int = 1_000
    MAX_INLINE_NETWORK_PIPES: int = 200

    # ── Result storage ─────────────────────────────────────────────────────
    RESULT_RETENTION_DAYS: int = 30          # auto-purge results older than N days
    MAX_HISTORY_RECORDS_PER_NETWORK: int = 50
    COMPRESS_RESULTS: bool = True            # gzip result blobs in DB

    # ── Export ─────────────────────────────────────────────────────────────
    EXPORT_CSV_DELIMITER: str = ","
    EXPORT_MAX_ROWS: int = 100_000

    # ── Logging ────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: Literal["json", "text"] = "text"
    LOG_FILE: Optional[str] = None           # e.g. "logs/app.log"
    LOG_ROTATION: str = "10 MB"
    LOG_RETENTION: str = "7 days"

    # ── Rate limiting (future) ─────────────────────────────────────────────
    RATE_LIMIT_ENABLED: bool = False
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # ── Feature flags ──────────────────────────────────────────────────────
    ENABLE_WATER_HAMMER: bool = True
    ENABLE_HEAT_TRANSFER: bool = True
    ENABLE_TWO_PHASE: bool = True
    ENABLE_NON_NEWTONIAN: bool = True
    ENABLE_COMPRESSIBLE: bool = True
    ENABLE_TURBULENCE_MODEL: bool = True

    # ── Validators ────────────────────────────────────────────────────────
    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        v = v.upper()
        if v not in allowed:
            raise ValueError(f"LOG_LEVEL must be one of {allowed}")
        return v

    @field_validator("DEFAULT_CONVERGENCE_TOLERANCE")
    @classmethod
    def validate_tolerance(cls, v: float) -> float:
        if not (1e-12 <= v <= 1e-2):
            raise ValueError("Convergence tolerance must be between 1e-12 and 1e-2")
        return v

    @field_validator("DEFAULT_RELAXATION_FACTOR")
    @classmethod
    def validate_relaxation(cls, v: float) -> float:
        if not (0.01 <= v <= 1.0):
            raise ValueError("Relaxation factor must be between 0.01 and 1.0")
        return v

    # ── Derived helpers ───────────────────────────────────────────────────
    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def is_testing(self) -> bool:
        return self.APP_ENV == "testing"

    @property
    def database_url_sync(self) -> str:
        """Return synchronous variant of the DB URL (for Alembic migrations)."""
        url = self.DATABASE_URL
        url = url.replace("sqlite+aiosqlite", "sqlite")
        url = url.replace("postgresql+asyncpg", "postgresql+psycopg2")
        return url

    def display_config(self) -> dict:
        """Return a sanitised dict safe to log at startup."""
        data = self.model_dump()
        # Mask sensitive fields
        for key in ("SECRET_KEY",):
            if key in data:
                data[key] = "***REDACTED***"
        return data


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Returns a cached singleton Settings instance.
    Called via FastAPI's Depends() or directly.
    """
    return Settings()


# ---------------------------------------------------------------------------
# Environment-specific overrides (used in tests)
# ---------------------------------------------------------------------------

def override_settings(**kwargs) -> Settings:
    """
    Create a fresh Settings object with specific overrides.
    Useful in pytest fixtures:

        app.dependency_overrides[get_settings] = lambda: override_settings(
            DATABASE_URL="sqlite+aiosqlite:///:memory:",
            DEBUG=True,
        )
    """
    get_settings.cache_clear()
    for key, val in kwargs.items():
        os.environ[key.upper()] = str(val)
    return get_settings()
