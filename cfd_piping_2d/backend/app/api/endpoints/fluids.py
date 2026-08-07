"""Fluid Library CRUD Endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.fluid import FluidModel
from app.schemas.schemas import FluidCreate, FluidResponse

router = APIRouter()


@router.get("/", response_model=List[FluidResponse])
async def list_fluids(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FluidModel).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{fluid_id}", response_model=FluidResponse)
async def get_fluid(fluid_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FluidModel).where(FluidModel.id == fluid_id))
    fluid = result.scalar_one_or_none()
    if not fluid:
        raise HTTPException(status_code=404, detail=f"Fluid '{fluid_id}' not found")
    return fluid


@router.get("/slug/{slug}", response_model=FluidResponse)
async def get_fluid_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FluidModel).where(FluidModel.slug == slug))
    fluid = result.scalar_one_or_none()
    if not fluid:
        raise HTTPException(status_code=404, detail=f"Fluid slug '{slug}' not found")
    return fluid


@router.post("/", response_model=FluidResponse, status_code=201)
async def create_fluid(data: FluidCreate, db: AsyncSession = Depends(get_db)):
    # Check unique slug
    existing = await db.execute(select(FluidModel).where(FluidModel.slug == data.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Fluid slug '{data.slug}' already exists")
    fluid = FluidModel(**data.model_dump())
    db.add(fluid)
    await db.flush()
    await db.refresh(fluid)
    return fluid


@router.delete("/{fluid_id}", status_code=204)
async def delete_fluid(fluid_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FluidModel).where(FluidModel.id == fluid_id))
    fluid = result.scalar_one_or_none()
    if not fluid:
        raise HTTPException(status_code=404, detail="Fluid not found")
    await db.delete(fluid)
