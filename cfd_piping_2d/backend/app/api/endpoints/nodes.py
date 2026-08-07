"""Nodes CRUD Endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.fluid import NodeModel, NetworkModel
from app.schemas.schemas import NodeCreate, NodeUpdate, NodeResponse

router = APIRouter()


@router.get("/", response_model=List[NodeResponse])
async def list_nodes(
    network_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(NodeModel).where(NodeModel.network_id == network_id))
    return result.scalars().all()


@router.post("/", response_model=NodeResponse, status_code=201)
async def create_node(data: NodeCreate, db: AsyncSession = Depends(get_db)):
    network = await db.get(NetworkModel, data.network_id)
    if not network:
        raise HTTPException(status_code=404, detail="Network not found")
    node = NodeModel(**data.model_dump())
    db.add(node)
    await db.flush()
    await db.refresh(node)
    return node


@router.post("/bulk", response_model=List[NodeResponse], status_code=201)
async def bulk_create_nodes(data: List[NodeCreate], db: AsyncSession = Depends(get_db)):
    """Create multiple nodes in one request."""
    nodes = [NodeModel(**d.model_dump()) for d in data]
    db.add_all(nodes)
    await db.flush()
    for n in nodes:
        await db.refresh(n)
    return nodes


@router.get("/{node_id}", response_model=NodeResponse)
async def get_node(node_id: str, db: AsyncSession = Depends(get_db)):
    node = await db.get(NodeModel, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node


@router.patch("/{node_id}", response_model=NodeResponse)
async def update_node(node_id: str, data: NodeUpdate, db: AsyncSession = Depends(get_db)):
    node = await db.get(NodeModel, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(node, key, value)
    await db.flush()
    await db.refresh(node)
    return node


@router.delete("/{node_id}", status_code=204)
async def delete_node(node_id: str, db: AsyncSession = Depends(get_db)):
    node = await db.get(NodeModel, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    await db.delete(node)
