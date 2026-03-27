"""
FlowSim CFD - Main FastAPI Application
======================================
Computational Fluid Dynamics REST API for piping systems.
Implements full Navier-Stokes, Hardy-Cross, and energy equation solvers.

Author: FlowSim Engineering Team
Version: 2.0.0
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.database import engine, Base
from app.core.events import startup_event, shutdown_event

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("flowsim")


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Application lifespan manager."""
    logger.info("🚀 FlowSim CFD API starting up...")
    await startup_event()
    yield
    logger.info("🛑 FlowSim CFD API shutting down...")
    await shutdown_event()


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
        title=settings.PROJECT_NAME,
        description="""
## FlowSim CFD — Computational Fluid Dynamics for Piping Systems

A production-grade REST API for simulating fluid flow in complex pipe networks.

### Features
- **Hardy-Cross Iterative Solver** for pipe network pressure/flow distribution
- **Darcy-Weisbach** friction loss calculations with Colebrook-White equation
- **Minor Loss** modeling (valves, bends, contractions, expansions)
- **Compressible & Incompressible** flow support
- **Reynolds** number, friction factor, and turbulence intensity fields
- **2D/3D** velocity and pressure field export
- **Real-time WebSocket** simulation updates
- **Full CRUD** for pipe networks, fluids, and boundary conditions

### Physics Implemented
- Continuity equation (mass conservation)
- Navier-Stokes momentum equations
- Energy equation (Bernoulli + losses)
- Moody chart friction factor correlation
- Churchill & Swamee-Jain approximations
- Turbulence models (k-ε simplified)
        """,
        version="2.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
        lifespan=lifespan,
    )

    # -----------------------------------------------------------------------
    # Middleware
    # -----------------------------------------------------------------------
    application.add_middleware(GZipMiddleware, minimum_size=1000)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # -----------------------------------------------------------------------
    # Request timing middleware
    # -----------------------------------------------------------------------
    @application.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.perf_counter()
        response: Response = await call_next(request)
        process_time = time.perf_counter() - start_time
        response.headers["X-Process-Time"] = f"{process_time:.4f}s"
        response.headers["X-API-Version"] = "2.0.0"
        return response

    # -----------------------------------------------------------------------
    # Exception handlers
    # -----------------------------------------------------------------------
    @application.exception_handler(404)
    async def not_found_handler(request: Request, exc):
        return JSONResponse(
            status_code=404,
            content={
                "error": "Not Found",
                "message": f"Path {request.url.path} not found.",
                "docs": f"{settings.API_V1_STR}/docs",
            },
        )

    @application.exception_handler(500)
    async def internal_error_handler(request: Request, exc):
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "message": "An unexpected error occurred. Please try again.",
            },
        )

    # -----------------------------------------------------------------------
    # Routers
    # -----------------------------------------------------------------------
    application.include_router(api_router, prefix=settings.API_V1_STR)

    # -----------------------------------------------------------------------
    # Root endpoint
    # -----------------------------------------------------------------------
    @application.get("/", tags=["health"])
    async def root():
        return {
            "service": "FlowSim CFD API",
            "version": "2.0.0",
            "status": "operational",
            "docs": f"{settings.API_V1_STR}/docs",
        }

    @application.get("/health", tags=["health"])
    async def health_check():
        return {
            "status": "healthy",
            "database": "connected",
            "solver": "ready",
        }

    return application


app = create_application()
