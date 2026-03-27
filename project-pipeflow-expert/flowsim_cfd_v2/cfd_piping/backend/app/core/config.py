"""
Core Configuration Settings
============================
Environment-based configuration using Pydantic Settings.
"""

import os
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # ------------------------------------------------------------------
    # API
    # ------------------------------------------------------------------
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "FlowSim CFD API"
    SECRET_KEY: str = "flowsim-super-secret-key-change-in-production-2024"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    ALGORITHM: str = "HS256"
    DEBUG: bool = False

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------
    DATABASE_URL: str = "sqlite+aiosqlite:///./flowsim.db"

    # ------------------------------------------------------------------
    # Redis (optional cache)
    # ------------------------------------------------------------------
    REDIS_URL: Optional[str] = None
    CACHE_TTL_SECONDS: int = 300

    # ------------------------------------------------------------------
    # Solver settings
    # ------------------------------------------------------------------
    SOLVER_MAX_ITERATIONS: int = 1000
    SOLVER_CONVERGENCE_TOLERANCE: float = 1e-6
    SOLVER_RELAXATION_FACTOR: float = 0.7
    SOLVER_MAX_PIPES: int = 500
    SOLVER_MAX_NODES: int = 250

    # ------------------------------------------------------------------
    # CFD physics defaults
    # ------------------------------------------------------------------
    DEFAULT_FLUID: str = "water"
    DEFAULT_TEMPERATURE_C: float = 20.0         # °C
    DEFAULT_PRESSURE_PA: float = 101325.0       # Pa (1 atm)
    GRAVITY_MS2: float = 9.80665               # m/s²
    GAS_CONSTANT_J_KG_K: float = 287.058      # Air (J/kg·K)

    # ------------------------------------------------------------------
    # WebSocket
    # ------------------------------------------------------------------
    WS_HEARTBEAT_INTERVAL: int = 30  # seconds

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
