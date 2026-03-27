"""Networks CRUD Endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.fluid import NetworkModel, ProjectModel, FluidModel
from app.schemas.schemas import NetworkCreate, NetworkUpdate, NetworkResponse

router = APIRouter()


@router.get("/", response_model=List[NetworkResponse])
async def list_networks(
    project_id: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    q = select(NetworkModel)
    if project_id:
        q = q.where(NetworkModel.project_id == project_id)
    result = await db.execute(q.offset(skip).limit(limit).order_by(NetworkModel.updated_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=NetworkResponse, status_code=201)
async def create_network(data: NetworkCreate, db: AsyncSession = Depends(get_db)):
    # Validate project and fluid exist
    proj = await db.get(ProjectModel, data.project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    fluid = await db.get(FluidModel, data.fluid_id)
    if not fluid:
        raise HTTPException(status_code=404, detail="Fluid not found")

    network = NetworkModel(**data.model_dump())
    db.add(network)
    await db.flush()
    await db.refresh(network)
    return network


@router.get("/{network_id}", response_model=NetworkResponse)
async def get_network(network_id: str, db: AsyncSession = Depends(get_db)):
    network = await db.get(NetworkModel, network_id)
    if not network:
        raise HTTPException(status_code=404, detail="Network not found")
    return network


@router.patch("/{network_id}", response_model=NetworkResponse)
async def update_network(network_id: str, data: NetworkUpdate, db: AsyncSession = Depends(get_db)):
    network = await db.get(NetworkModel, network_id)
    if not network:
        raise HTTPException(status_code=404, detail="Network not found")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(network, key, value)
    await db.flush()
    await db.refresh(network)
    return network


@router.delete("/{network_id}", status_code=204)
async def delete_network(network_id: str, db: AsyncSession = Depends(get_db)):
    network = await db.get(NetworkModel, network_id)
    if not network:
        raise HTTPException(status_code=404, detail="Network not found")
    await db.delete(network)


@router.get("/{network_id}/topology")
async def get_network_topology(network_id: str, db: AsyncSession = Depends(get_db)):
    """Return full network topology: nodes + pipes."""
    from app.models.fluid import NodeModel, PipeModel
    network = await db.get(NetworkModel, network_id)
    if not network:
        raise HTTPException(status_code=404, detail="Network not found")

    nodes_res = await db.execute(select(NodeModel).where(NodeModel.network_id == network_id))
    pipes_res = await db.execute(select(PipeModel).where(PipeModel.network_id == network_id))

    nodes = nodes_res.scalars().all()
    pipes = pipes_res.scalars().all()

    return {
        "network_id": network_id,
        "n_nodes": len(nodes),
        "n_pipes": len(pipes),
        "nodes": [
            {
                "id": n.id, "label": n.label, "node_type": n.node_type,
                "x": n.x, "y": n.y, "elevation_m": n.elevation_m,
                "demand_m3s": n.demand_m3s, "fixed_head_m": n.fixed_head_m,
            }
            for n in nodes
        ],
        "pipes": [
            {
                "id": p.id, "label": p.label,
                "node_from_id": p.node_from_id, "node_to_id": p.node_to_id,
                "diameter_m": p.diameter_m, "length_m": p.length_m,
                "roughness_m": p.roughness_m, "minor_loss_K": p.minor_loss_K,
                "waypoints": p.waypoints,
            }
            for p in pipes
        ],
    }
