"""
==============================================================================
CFD PIPE FLOW SOLVER - Database Layer
==============================================================================
Async SQLAlchemy + SQLite (dev) / PostgreSQL (prod) persistence layer.

Tables:
  - networks     : piping network metadata + topology JSON
  - solve_results: CFD solve results (compressed JSON blobs)
  - materials    : custom fluid/material library
  - templates    : network templates
  - solve_history: lightweight history index
==============================================================================
"""

from __future__ import annotations

import json
import uuid
import gzip
import base64
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from sqlalchemy import (
    Column, String, Float, Boolean, Integer, Text,
    DateTime, ForeignKey, Index, event
)
from sqlalchemy.ext.asyncio import (
    create_async_engine, AsyncSession, async_sessionmaker
)
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.future import select

from utils.config import get_settings

settings = get_settings()

# ─────────────────────────────────────────────────────────────────────────────
# Engine + Session
# ─────────────────────────────────────────────────────────────────────────────

DATABASE_URL = settings.database_url or "sqlite+aiosqlite:///./cfd_pipe_flow.db"

engine = create_async_engine(
    DATABASE_URL,
    echo=settings.debug,
    future=True,
    # SQLite-specific: enable WAL mode for better concurrency
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ─────────────────────────────────────────────────────────────────────────────
# Base + Models
# ─────────────────────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    pass


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class NetworkModel(Base):
    """Piping network metadata and topology."""
    __tablename__ = "networks"

    id: str                     = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: str                   = Column(String(128), nullable=False, index=True)
    description: Optional[str]  = Column(Text, nullable=True)
    fluid_json: str             = Column(Text, nullable=False, default="{}")
    nodes_json: str             = Column(Text, nullable=False, default="[]")
    pipes_json: str             = Column(Text, nullable=False, default="[]")
    tags_json: str              = Column(Text, nullable=False, default="[]")
    units_system: str           = Column(String(8), default="SI")
    created_at: datetime        = Column(DateTime(timezone=True), default=utcnow)
    updated_at: datetime        = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    last_solve_status: Optional[str] = Column(String(32), nullable=True)
    last_solve_id: Optional[str]     = Column(String(36), nullable=True)

    # Relationships
    solve_results = relationship("SolveResultModel", back_populates="network",
                                  cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_networks_name", "name"),
        Index("ix_networks_created_at", "created_at"),
    )

    @property
    def fluid(self) -> Dict:
        return json.loads(self.fluid_json)

    @fluid.setter
    def fluid(self, v: Dict):
        self.fluid_json = json.dumps(v)

    @property
    def nodes(self) -> List[Dict]:
        return json.loads(self.nodes_json)

    @nodes.setter
    def nodes(self, v: List[Dict]):
        self.nodes_json = json.dumps(v)

    @property
    def pipes(self) -> List[Dict]:
        return json.loads(self.pipes_json)

    @pipes.setter
    def pipes(self, v: List[Dict]):
        self.pipes_json = json.dumps(v)

    @property
    def tags(self) -> List[str]:
        return json.loads(self.tags_json)

    @tags.setter
    def tags(self, v: List[str]):
        self.tags_json = json.dumps(v)

    def to_summary_dict(self) -> Dict:
        return {
            "id":               self.id,
            "name":             self.name,
            "description":      self.description,
            "node_count":       len(self.nodes),
            "pipe_count":       len(self.pipes),
            "fluid_name":       self.fluid.get("name", "unknown"),
            "created_at":       self.created_at.isoformat() if self.created_at else None,
            "updated_at":       self.updated_at.isoformat() if self.updated_at else None,
            "last_solve_status": self.last_solve_status,
            "tags":             self.tags,
        }

    def to_detail_dict(self) -> Dict:
        d = self.to_summary_dict()
        d.update({
            "fluid": self.fluid,
            "nodes": self.nodes,
            "pipes": self.pipes,
            "units_system": self.units_system,
        })
        return d


class SolveResultModel(Base):
    """
    CFD solve results stored as compressed JSON.
    Compression: gzip → base64 to keep DB readable.
    """
    __tablename__ = "solve_results"

    id: str                     = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    network_id: str             = Column(String(36), ForeignKey("networks.id", ondelete="CASCADE"), nullable=False)
    timestamp: datetime         = Column(DateTime(timezone=True), default=utcnow, index=True)
    converged: bool             = Column(Boolean, default=False)
    iterations: int             = Column(Integer, default=0)
    residual: float             = Column(Float, default=0.0)
    solver_method: str          = Column(String(32), default="newton_raphson")
    max_velocity: float         = Column(Float, default=0.0)
    total_head_loss: float      = Column(Float, default=0.0)
    result_blob: str            = Column(Text, nullable=False, default="{}")   # compressed JSON
    config_json: str            = Column(Text, nullable=False, default="{}")

    # Relationship
    network = relationship("NetworkModel", back_populates="solve_results")

    __table_args__ = (
        Index("ix_solve_results_network_id", "network_id"),
        Index("ix_solve_results_timestamp",  "timestamp"),
    )

    def set_result(self, result_dict: Dict):
        """Compress and store result dictionary."""
        raw = json.dumps(result_dict).encode("utf-8")
        compressed = gzip.compress(raw, compresslevel=6)
        self.result_blob = base64.b64encode(compressed).decode("ascii")

    def get_result(self) -> Dict:
        """Decompress and return result dictionary."""
        compressed = base64.b64decode(self.result_blob)
        raw = gzip.decompress(compressed)
        return json.loads(raw.decode("utf-8"))

    def to_history_dict(self) -> Dict:
        return {
            "solve_id":      self.id,
            "network_id":    self.network_id,
            "network_name":  self.network.name if self.network else "unknown",
            "timestamp":     self.timestamp.isoformat() if self.timestamp else None,
            "converged":     self.converged,
            "iterations":    self.iterations,
            "residual":      self.residual,
            "solver_method": self.solver_method,
            "max_velocity":  self.max_velocity,
            "total_head_loss": self.total_head_loss,
        }


class MaterialModel(Base):
    """User-defined fluid and pipe material library."""
    __tablename__ = "materials"

    id: str             = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category: str       = Column(String(32), nullable=False, index=True)  # "fluid" | "pipe"
    name: str           = Column(String(128), nullable=False)
    data_json: str      = Column(Text, nullable=False, default="{}")
    created_at: datetime = Column(DateTime(timezone=True), default=utcnow)
    is_builtin: bool    = Column(Boolean, default=False)

    @property
    def data(self) -> Dict:
        return json.loads(self.data_json)

    @data.setter
    def data(self, v: Dict):
        self.data_json = json.dumps(v)


class TemplateModel(Base):
    """Predefined network templates."""
    __tablename__ = "templates"

    id: str             = Column(String(64), primary_key=True)
    name: str           = Column(String(128), nullable=False)
    description: str    = Column(Text, nullable=False, default="")
    category: str       = Column(String(64), nullable=False, default="general")
    network_json: str   = Column(Text, nullable=False, default="{}")
    tags_json: str      = Column(Text, nullable=False, default="[]")
    created_at: datetime = Column(DateTime(timezone=True), default=utcnow)

    @property
    def network(self) -> Dict:
        return json.loads(self.network_json)

    @property
    def tags(self) -> List[str]:
        return json.loads(self.tags_json)

    def to_info_dict(self) -> Dict:
        net = self.network
        return {
            "id":          self.id,
            "name":        self.name,
            "description": self.description,
            "category":    self.category,
            "node_count":  len(net.get("nodes", [])),
            "pipe_count":  len(net.get("pipes", [])),
            "tags":        self.tags,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Database Initialisation
# ─────────────────────────────────────────────────────────────────────────────

async def init_db():
    """Create all tables and seed built-in data."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await _seed_builtin_templates()


async def close_db():
    await engine.dispose()


async def _seed_builtin_templates():
    """Insert built-in network templates if not already present."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(TemplateModel).where(TemplateModel.is_builtin if hasattr(TemplateModel, 'is_builtin') else True)
        )
        existing_ids = {r.id for r in result.scalars().all()}

        templates_to_add = _get_builtin_templates()
        for tmpl in templates_to_add:
            if tmpl.id not in existing_ids:
                session.add(tmpl)

        await session.commit()


def _get_builtin_templates() -> List[TemplateModel]:
    """Define all built-in network templates."""
    templates = []

    # ── Template 1: Simple Series Network ────────────────────────────────────
    simple_series = {
        "name": "Simple Series Network",
        "description": "Three pipes in series with a reservoir inlet and demand outlet",
        "fluid": {"name": "water_20c", "density": 998.2, "dynamic_viscosity": 1.002e-3,
                  "bulk_modulus": 2.15e9, "vapour_pressure": 2337.0, "specific_heat": 4182.0,
                  "thermal_conductivity": 0.598, "temperature": 293.15, "rheology_model": "newtonian"},
        "nodes": [
            {"id": "N1", "elevation": 30.0, "is_reservoir": True, "fixed_head": 30.0,
             "x": 50, "y": 300, "label": "Reservoir A"},
            {"id": "N2", "elevation": 20.0, "x": 250, "y": 300, "label": "Junction B"},
            {"id": "N3", "elevation": 10.0, "x": 450, "y": 300, "label": "Junction C"},
            {"id": "N4", "elevation": 5.0, "external_flow": -0.05, "x": 650, "y": 300, "label": "Demand D"},
        ],
        "pipes": [
            {"id": "P1", "node_start": "N1", "node_end": "N2", "length": 500, "diameter": 0.15,
             "material": "commercial_steel", "elevation_start": 30, "elevation_end": 20,
             "initial_flow": 0.05, "label": "Pipe 1"},
            {"id": "P2", "node_start": "N2", "node_end": "N3", "length": 400, "diameter": 0.12,
             "material": "commercial_steel", "elevation_start": 20, "elevation_end": 10,
             "initial_flow": 0.05, "label": "Pipe 2"},
            {"id": "P3", "node_start": "N3", "node_end": "N4", "length": 600, "diameter": 0.10,
             "material": "commercial_steel", "elevation_start": 10, "elevation_end": 5,
             "initial_flow": 0.05, "label": "Pipe 3"},
        ],
        "tags": ["series", "basic", "tutorial"],
    }

    # ── Template 2: Looped Network (Hardy-Cross Classic) ─────────────────────
    looped_network = {
        "name": "Looped Distribution Network",
        "description": "Classic looped water distribution network with 6 nodes and 7 pipes",
        "fluid": {"name": "water_20c", "density": 998.2, "dynamic_viscosity": 1.002e-3,
                  "bulk_modulus": 2.15e9, "vapour_pressure": 2337.0, "specific_heat": 4182.0,
                  "thermal_conductivity": 0.598, "temperature": 293.15, "rheology_model": "newtonian"},
        "nodes": [
            {"id": "A", "elevation": 0, "is_reservoir": True, "fixed_head": 50.0, "x": 100, "y": 100, "label": "A (Source)"},
            {"id": "B", "elevation": 0, "external_flow": -0.02, "x": 400, "y": 100, "label": "B"},
            {"id": "C", "elevation": 0, "external_flow": -0.03, "x": 700, "y": 100, "label": "C"},
            {"id": "D", "elevation": 0, "external_flow": -0.01, "x": 700, "y": 350, "label": "D"},
            {"id": "E", "elevation": 0, "external_flow": -0.025, "x": 400, "y": 350, "label": "E"},
            {"id": "F", "elevation": 0, "external_flow": -0.015, "x": 100, "y": 350, "label": "F"},
        ],
        "pipes": [
            {"id": "P_AB", "node_start": "A", "node_end": "B", "length": 600, "diameter": 0.20, "material": "commercial_steel", "initial_flow": 0.06, "label": "A→B"},
            {"id": "P_BC", "node_start": "B", "node_end": "C", "length": 500, "diameter": 0.15, "material": "commercial_steel", "initial_flow": 0.03, "label": "B→C"},
            {"id": "P_CD", "node_start": "C", "node_end": "D", "length": 400, "diameter": 0.12, "material": "commercial_steel", "initial_flow": 0.03, "label": "C→D"},
            {"id": "P_DE", "node_start": "D", "node_end": "E", "length": 600, "diameter": 0.15, "material": "commercial_steel", "initial_flow": -0.01, "label": "D→E"},
            {"id": "P_EF", "node_start": "E", "node_end": "F", "length": 500, "diameter": 0.12, "material": "commercial_steel", "initial_flow": -0.02, "label": "E→F"},
            {"id": "P_FA", "node_start": "F", "node_end": "A", "length": 400, "diameter": 0.15, "material": "commercial_steel", "initial_flow": -0.035, "label": "F→A"},
            {"id": "P_BE", "node_start": "B", "node_end": "E", "length": 500, "diameter": 0.10, "material": "commercial_steel", "initial_flow": 0.01, "label": "B→E"},
        ],
        "tags": ["looped", "distribution", "hardy-cross"],
    }

    # ── Template 3: Pump System ───────────────────────────────────────────────
    pump_system = {
        "name": "Pump and Pipe System",
        "description": "Centrifugal pump lifting water to elevated storage",
        "fluid": {"name": "water_20c", "density": 998.2, "dynamic_viscosity": 1.002e-3,
                  "bulk_modulus": 2.15e9, "vapour_pressure": 2337.0, "specific_heat": 4182.0,
                  "thermal_conductivity": 0.598, "temperature": 293.15, "rheology_model": "newtonian"},
        "nodes": [
            {"id": "SUMP", "elevation": -2.0, "is_reservoir": True, "fixed_head": -2.0, "x": 100, "y": 400, "label": "Sump"},
            {"id": "PUMP_OUT", "elevation": -2.0, "x": 250, "y": 400, "label": "Pump Outlet"},
            {"id": "J1", "elevation": 5.0, "x": 400, "y": 280, "label": "Junction 1"},
            {"id": "TANK", "elevation": 20.0, "is_reservoir": True, "fixed_head": 22.0, "x": 700, "y": 100, "label": "Elevated Tank"},
        ],
        "pipes": [
            {"id": "SUCTION", "node_start": "SUMP", "node_end": "PUMP_OUT", "length": 10, "diameter": 0.15,
             "material": "commercial_steel", "is_pump": False, "initial_flow": 0.03,
             "fittings": [{"type": "entrance_sharp", "quantity": 1}, {"type": "gate_valve", "quantity": 1}],
             "label": "Suction Line"},
            {"id": "PUMP_PIPE", "node_start": "PUMP_OUT", "node_end": "J1", "length": 5, "diameter": 0.15,
             "material": "commercial_steel", "is_pump": True,
             "pump_curve": [
                 {"flow_rate": 0.000, "head": 35.0},
                 {"flow_rate": 0.010, "head": 33.0},
                 {"flow_rate": 0.020, "head": 30.0},
                 {"flow_rate": 0.030, "head": 26.0},
                 {"flow_rate": 0.040, "head": 20.0},
                 {"flow_rate": 0.050, "head": 12.0},
                 {"flow_rate": 0.060, "head": 0.0},
             ],
             "initial_flow": 0.03, "label": "Pump"},
            {"id": "DISCHARGE", "node_start": "J1", "node_end": "TANK", "length": 500, "diameter": 0.10,
             "material": "commercial_steel", "elevation_start": 5.0, "elevation_end": 20.0,
             "initial_flow": 0.03, "label": "Discharge Main"},
        ],
        "tags": ["pump", "lifting", "water-supply"],
    }

    # ── Template 4: Industrial Heat Exchanger Network ─────────────────────────
    heat_exchanger = {
        "name": "Industrial Heat Exchanger Piping",
        "description": "Hot water distribution with heat transfer analysis",
        "fluid": {"name": "water_60c", "density": 983.2, "dynamic_viscosity": 4.67e-4,
                  "bulk_modulus": 2.27e9, "vapour_pressure": 19940.0, "specific_heat": 4185.0,
                  "thermal_conductivity": 0.651, "temperature": 333.15, "rheology_model": "newtonian"},
        "nodes": [
            {"id": "HOT_IN", "elevation": 0, "is_reservoir": True, "fixed_head": 40.0,
             "temperature": 353.15, "x": 50, "y": 200, "label": "Hot Supply (80°C)"},
            {"id": "J1", "elevation": 0, "x": 300, "y": 200, "label": "Header J1"},
            {"id": "HX1_IN", "elevation": 0, "x": 450, "y": 100, "label": "HX-1 Inlet"},
            {"id": "HX2_IN", "elevation": 0, "x": 450, "y": 300, "label": "HX-2 Inlet"},
            {"id": "HX1_OUT", "elevation": 0, "x": 650, "y": 100, "label": "HX-1 Outlet"},
            {"id": "HX2_OUT", "elevation": 0, "x": 650, "y": 300, "label": "HX-2 Outlet"},
            {"id": "RETURN", "elevation": 0, "x": 800, "y": 200, "label": "Return Header"},
            {"id": "DRAIN", "elevation": -2, "external_flow": -0.04, "x": 950, "y": 200, "label": "Return"},
        ],
        "pipes": [
            {"id": "SUPPLY", "node_start": "HOT_IN", "node_end": "J1", "length": 50, "diameter": 0.15,
             "material": "stainless_steel_316", "initial_flow": 0.04, "label": "Supply Main"},
            {"id": "BR1", "node_start": "J1", "node_end": "HX1_IN", "length": 20, "diameter": 0.08,
             "material": "stainless_steel_316", "initial_flow": 0.02, "label": "Branch 1"},
            {"id": "BR2", "node_start": "J1", "node_end": "HX2_IN", "length": 20, "diameter": 0.08,
             "material": "stainless_steel_316", "initial_flow": 0.02, "label": "Branch 2"},
            {"id": "HX1", "node_start": "HX1_IN", "node_end": "HX1_OUT", "length": 10, "diameter": 0.025,
             "material": "stainless_steel_316", "heat_flux": -5000.0,
             "fittings": [{"type": "elbow_90", "quantity": 4}],
             "initial_flow": 0.02, "label": "Heat Exchanger 1"},
            {"id": "HX2", "node_start": "HX2_IN", "node_end": "HX2_OUT", "length": 10, "diameter": 0.025,
             "material": "stainless_steel_316", "heat_flux": -5000.0,
             "fittings": [{"type": "elbow_90", "quantity": 4}],
             "initial_flow": 0.02, "label": "Heat Exchanger 2"},
            {"id": "RET1", "node_start": "HX1_OUT", "node_end": "RETURN", "length": 20, "diameter": 0.08,
             "material": "stainless_steel_316", "initial_flow": 0.02, "label": "Return Branch 1"},
            {"id": "RET2", "node_start": "HX2_OUT", "node_end": "RETURN", "length": 20, "diameter": 0.08,
             "material": "stainless_steel_316", "initial_flow": 0.02, "label": "Return Branch 2"},
            {"id": "DRAIN_PIPE", "node_start": "RETURN", "node_end": "DRAIN", "length": 50, "diameter": 0.15,
             "material": "stainless_steel_316", "initial_flow": 0.04, "label": "Return Main"},
        ],
        "tags": ["heat-transfer", "industrial", "hvac", "heat-exchanger"],
    }

    def make_tmpl(tmpl_id: str, data: Dict, is_builtin: bool = True) -> TemplateModel:
        m = TemplateModel()
        m.id           = tmpl_id
        m.name         = data["name"]
        m.description  = data["description"]
        m.category     = "builtin"
        m.tags_json    = json.dumps(data.get("tags", []))
        m.network_json = json.dumps(data)
        return m

    templates.append(make_tmpl("simple_series",    simple_series))
    templates.append(make_tmpl("looped_network",   looped_network))
    templates.append(make_tmpl("pump_system",      pump_system))
    templates.append(make_tmpl("heat_exchanger",   heat_exchanger))

    return templates


# ─────────────────────────────────────────────────────────────────────────────
# Dependency Injection
# ─────────────────────────────────────────────────────────────────────────────

async def get_db() -> AsyncSession:
    """FastAPI dependency: yield a database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# ─────────────────────────────────────────────────────────────────────────────
# CRUD Helpers
# ─────────────────────────────────────────────────────────────────────────────

class NetworkCRUD:
    """CRUD operations for NetworkModel."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict) -> NetworkModel:
        network = NetworkModel(
            id          = data.get("id", str(uuid.uuid4())),
            name        = data["name"],
            description = data.get("description"),
            units_system = data.get("units_system", "SI"),
        )
        network.fluid   = data.get("fluid", {})
        network.nodes   = data.get("nodes", [])
        network.pipes   = data.get("pipes", [])
        network.tags    = data.get("tags", [])
        self.db.add(network)
        await self.db.commit()
        await self.db.refresh(network)
        return network

    async def get_by_id(self, network_id: str) -> Optional[NetworkModel]:
        result = await self.db.execute(
            select(NetworkModel).where(NetworkModel.id == network_id)
        )
        return result.scalar_one_or_none()

    async def list_all(self, page: int = 1, page_size: int = 20,
                        name_filter: Optional[str] = None) -> Dict:
        q = select(NetworkModel).order_by(NetworkModel.updated_at.desc())
        if name_filter:
            q = q.where(NetworkModel.name.ilike(f"%{name_filter}%"))

        # Count total
        from sqlalchemy import func
        count_q = select(func.count()).select_from(NetworkModel)
        if name_filter:
            count_q = count_q.where(NetworkModel.name.ilike(f"%{name_filter}%"))
        total_result = await self.db.execute(count_q)
        total = total_result.scalar_one()

        # Paginate
        q = q.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(q)
        items = result.scalars().all()

        return {
            "items":    [n.to_summary_dict() for n in items],
            "total":    total,
            "page":     page,
            "page_size": page_size,
            "has_next": (page * page_size) < total,
            "has_prev": page > 1,
        }

    async def update(self, network_id: str, data: Dict) -> Optional[NetworkModel]:
        network = await self.get_by_id(network_id)
        if not network:
            return None
        for k, v in data.items():
            if hasattr(network, k) and v is not None:
                setattr(network, k, v)
        network.updated_at = utcnow()
        await self.db.commit()
        await self.db.refresh(network)
        return network

    async def delete(self, network_id: str) -> bool:
        network = await self.get_by_id(network_id)
        if not network:
            return False
        await self.db.delete(network)
        await self.db.commit()
        return True


class SolveResultCRUD:
    """CRUD operations for SolveResultModel."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, network_id: str, result_dict: Dict,
                      config_dict: Dict) -> SolveResultModel:
        stats = result_dict.get("network_stats", {})
        sr = SolveResultModel(
            id             = str(uuid.uuid4()),
            network_id     = network_id,
            converged      = result_dict.get("converged", False),
            iterations     = result_dict.get("iterations", 0),
            residual       = result_dict.get("residual", 0.0),
            solver_method  = stats.get("solver_method", "unknown"),
            max_velocity   = stats.get("max_velocity_ms", 0.0),
            total_head_loss = stats.get("total_head_loss_m", 0.0),
            config_json    = json.dumps(config_dict),
        )
        sr.set_result(result_dict)
        self.db.add(sr)

        # Update network last_solve_status
        network = await self.db.execute(
            select(NetworkModel).where(NetworkModel.id == network_id)
        )
        net = network.scalar_one_or_none()
        if net:
            net.last_solve_status = "converged" if sr.converged else "diverged"
            net.last_solve_id     = sr.id
            net.updated_at        = utcnow()

        await self.db.commit()
        await self.db.refresh(sr)
        return sr

    async def get_by_id(self, solve_id: str) -> Optional[SolveResultModel]:
        result = await self.db.execute(
            select(SolveResultModel).where(SolveResultModel.id == solve_id)
        )
        return result.scalar_one_or_none()

    async def list_for_network(self, network_id: str,
                                limit: int = 20) -> List[SolveResultModel]:
        result = await self.db.execute(
            select(SolveResultModel)
            .where(SolveResultModel.network_id == network_id)
            .order_by(SolveResultModel.timestamp.desc())
            .limit(limit)
        )
        return result.scalars().all()

    async def get_history(self, page: int = 1, page_size: int = 20) -> Dict:
        from sqlalchemy import func
        # Load with network name
        q = (select(SolveResultModel)
             .order_by(SolveResultModel.timestamp.desc())
             .offset((page - 1) * page_size)
             .limit(page_size))
        result = await self.db.execute(q)
        items = result.scalars().all()

        count_result = await self.db.execute(select(func.count()).select_from(SolveResultModel))
        total = count_result.scalar_one()

        return {
            "items":    [i.to_history_dict() for i in items],
            "total":    total,
            "page":     page,
            "page_size": page_size,
            "has_next": (page * page_size) < total,
            "has_prev": page > 1,
        }
