"""
API Router — All Endpoints
===========================
Assembles all sub-routers into the main API router.
"""

from fastapi import APIRouter

from app.api.endpoints import (
    fluids,
    projects,
    networks,
    nodes,
    pipes,
    simulations,
    analysis,
    canvas,
    diagnostics,
)

api_router = APIRouter()

api_router.include_router(fluids.router,      prefix="/fluids",      tags=["Fluids"])
api_router.include_router(projects.router,    prefix="/projects",    tags=["Projects"])
api_router.include_router(networks.router,    prefix="/networks",    tags=["Networks"])
api_router.include_router(nodes.router,       prefix="/nodes",       tags=["Nodes"])
api_router.include_router(pipes.router,       prefix="/pipes",       tags=["Pipes"])
api_router.include_router(simulations.router, prefix="/simulations", tags=["Simulations"])
api_router.include_router(analysis.router,    prefix="/analysis",    tags=["Analysis"])
api_router.include_router(canvas.router,      prefix="/canvas",      tags=["Canvas"])
api_router.include_router(diagnostics.router, prefix="/diagnostics", tags=["Diagnostics"])
