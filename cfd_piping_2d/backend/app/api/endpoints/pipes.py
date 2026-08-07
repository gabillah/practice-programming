"""Pipes CRUD Endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.fluid import PipeModel, NetworkModel, NodeModel
from app.schemas.schemas import PipeCreate, PipeUpdate, PipeResponse

router = APIRouter()


@router.get("/", response_model=List[PipeResponse])
async def list_pipes(
    network_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PipeModel).where(PipeModel.network_id == network_id))
    return result.scalars().all()


@router.post("/", response_model=PipeResponse, status_code=201)
async def create_pipe(data: PipeCreate, db: AsyncSession = Depends(get_db)):
    # Validate FK
    network = await db.get(NetworkModel, data.network_id)
    if not network:
        raise HTTPException(status_code=404, detail="Network not found")
    node_from = await db.get(NodeModel, data.node_from_id)
    if not node_from:
        raise HTTPException(status_code=404, detail=f"Source node '{data.node_from_id}' not found")
    node_to = await db.get(NodeModel, data.node_to_id)
    if not node_to:
        raise HTTPException(status_code=404, detail=f"Destination node '{data.node_to_id}' not found")
    if data.node_from_id == data.node_to_id:
        raise HTTPException(status_code=422, detail="Pipe cannot connect a node to itself")

    pipe = PipeModel(**data.model_dump())
    db.add(pipe)
    await db.flush()
    await db.refresh(pipe)
    return pipe


@router.post("/bulk", response_model=List[PipeResponse], status_code=201)
async def bulk_create_pipes(data: List[PipeCreate], db: AsyncSession = Depends(get_db)):
    pipes = [PipeModel(**d.model_dump()) for d in data]
    db.add_all(pipes)
    await db.flush()
    for p in pipes:
        await db.refresh(p)
    return pipes


@router.get("/{pipe_id}", response_model=PipeResponse)
async def get_pipe(pipe_id: str, db: AsyncSession = Depends(get_db)):
    pipe = await db.get(PipeModel, pipe_id)
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipe not found")
    return pipe


@router.patch("/{pipe_id}", response_model=PipeResponse)
async def update_pipe(pipe_id: str, data: PipeUpdate, db: AsyncSession = Depends(get_db)):
    pipe = await db.get(PipeModel, pipe_id)
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipe not found")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(pipe, key, value)
    await db.flush()
    await db.refresh(pipe)
    return pipe


@router.delete("/{pipe_id}", status_code=204)
async def delete_pipe(pipe_id: str, db: AsyncSession = Depends(get_db)):
    pipe = await db.get(PipeModel, pipe_id)
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipe not found")
    await db.delete(pipe)
