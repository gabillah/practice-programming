"""
==============================================================================
CFD PIPE FLOW SOLVER - Main FastAPI Application
==============================================================================
A full-featured Computational Fluid Dynamics (CFD) REST API for piping
network analysis, implementing:
  - Navier-Stokes equations (incompressible, steady-state)
  - Darcy-Weisbach pressure drop model
  - Hardy-Cross iterative network solver
  - k-epsilon turbulence model (simplified)
  - Minor/major loss calculations
  - Heat transfer in pipes (Dittus-Boelter correlation)
  - Compressible flow (Mach number regime detection)
  - Non-Newtonian fluid support (Power-law, Bingham plastic)
  - Two-phase flow (Lockhart-Martinelli)
  - Water hammer (transient analysis)
  - Cavitation index calculation

Author:  CFD Tutorial Course
Version: 1.0.0
License: MIT
==============================================================================
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import logging
import time
from contextlib import asynccontextmanager
from typing import Optional
import asyncio

# Internal modules
from api.routes import networks, nodes, pipes, solvers, materials, results, export
from api.routes import validation, templates, history, health
from models.database import init_db, close_db
from utils.logger import setup_logger
from utils.config import get_settings

# ─────────────────────────────────────────────
# Application Settings
# ─────────────────────────────────────────────
settings = get_settings()
logger = setup_logger(__name__)

# ─────────────────────────────────────────────
# Lifespan: startup / shutdown
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("🚀  CFD Pipe Flow Server starting up …")
    await init_db()
    logger.info("✅  Database initialised")
    yield
    logger.info("🛑  CFD Pipe Flow Server shutting down …")
    await close_db()


# ─────────────────────────────────────────────
# FastAPI App Instance
# ─────────────────────────────────────────────
app = FastAPI(
    title="CFD Pipe Flow Solver API",
    description="""
## Computational Fluid Dynamics REST API for Piping Networks

This API provides a complete backend for analysing fluid flow in complex piping
networks using industry-standard CFD methods.

### Key Capabilities

* **Network Topology** – nodes, pipe segments, fittings, valves, pumps
* **Steady-State Solver** – Hardy-Cross / Newton-Raphson for pressure & flow
* **Turbulence Models** – k-ε, k-ω, Mixing-Length
* **Heat Transfer** – Dittus-Boelter, Gnielinski correlations
* **Transient Analysis** – Water-hammer (Method of Characteristics)
* **Compressible Flow** – subsonic / choked-flow regimes
* **Non-Newtonian** – Power-law & Bingham-plastic rheology
* **Two-Phase Flow** – Lockhart-Martinelli, Friedel correlations
* **Visualisation Data** – colour-mapped velocity, pressure, temperature fields

### Physical Models

| Model                | Reference                          |
|----------------------|------------------------------------|
| Darcy-Weisbach       | ISO 4006, Moody Chart              |
| Colebrook-White      | ASHRAE Handbook of Fundamentals    |
| Swamee-Jain          | Explicit friction factor approx.   |
| Hardy-Cross          | ASME PTC 25                        |
| Dittus-Boelter       | ASHRAE / Incropera                 |
| Gnielinski           | VDI Heat Atlas                     |
| Lockhart-Martinelli  | Two-phase multiplier method        |
| Method of Characteristics | Streeter & Wylie (Water Hammer) |
    """,
    version="1.0.0",
    contact={
        "name": "CFD Tutorial Course",
        "email": "cfd@example.com",
    },
    license_info={"name": "MIT"},
    lifespan=lifespan,
)

# ─────────────────────────────────────────────
# CORS Middleware
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Request Timing Middleware
# ─────────────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    response.headers["X-Process-Time"] = f"{elapsed:.4f}s"
    return response


# ─────────────────────────────────────────────
# Router Registration
# ─────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(health.router,      prefix=API_PREFIX, tags=["Health"])
app.include_router(networks.router,    prefix=API_PREFIX, tags=["Networks"])
app.include_router(nodes.router,       prefix=API_PREFIX, tags=["Nodes"])
app.include_router(pipes.router,       prefix=API_PREFIX, tags=["Pipes"])
app.include_router(solvers.router,     prefix=API_PREFIX, tags=["Solvers"])
app.include_router(materials.router,   prefix=API_PREFIX, tags=["Materials"])
app.include_router(results.router,     prefix=API_PREFIX, tags=["Results"])
app.include_router(export.router,      prefix=API_PREFIX, tags=["Export"])
app.include_router(validation.router,  prefix=API_PREFIX, tags=["Validation"])
app.include_router(templates.router,   prefix=API_PREFIX, tags=["Templates"])
app.include_router(history.router,     prefix=API_PREFIX, tags=["History"])


# ─────────────────────────────────────────────
# Root Endpoint
# ─────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "CFD Pipe Flow Solver API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "online",
    }


@app.get("/api/v1/info", tags=["Root"])
async def api_info():
    return {
        "solver_methods": [
            "Hardy-Cross",
            "Newton-Raphson",
            "Gauss-Seidel",
            "Conjugate-Gradient",
        ],
        "turbulence_models": ["k-epsilon", "k-omega", "mixing-length", "laminar"],
        "fluid_types": ["Newtonian", "Power-Law", "Bingham-Plastic", "Herschel-Bulkley"],
        "flow_regimes": ["laminar", "transitional", "turbulent", "compressible"],
        "supported_fittings": [
            "elbow_90", "elbow_45", "tee_branch", "tee_straight",
            "reducer", "expander", "valve_gate", "valve_globe",
            "valve_ball", "valve_butterfly", "valve_check",
            "orifice", "venturi", "pump", "turbine",
        ],
        "heat_transfer_correlations": [
            "Dittus-Boelter",
            "Gnielinski",
            "Sieder-Tate",
            "Churchill-Bernstein",
        ],
        "two_phase_models": [
            "Lockhart-Martinelli",
            "Friedel",
            "Chisholm",
            "Homogeneous",
        ],
    }


# ─────────────────────────────────────────────
# Entry Point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info",
    )
