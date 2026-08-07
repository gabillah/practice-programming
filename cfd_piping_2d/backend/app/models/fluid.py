"""
ORM Models — Pipe Network Database Schema
==========================================
SQLAlchemy async models for:
  - Projects
  - Networks (pipe systems)
  - Nodes
  - Pipes
  - Simulations & Results
  - Fluid library
"""

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean, DateTime, Float, ForeignKey, Integer,
    JSON, String, Text, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


# ===========================================================================
# Fluid library
# ===========================================================================

class FluidModel(Base):
    __tablename__ = "fluids"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Thermodynamic properties
    density_kg_m3: Mapped[float] = mapped_column(Float, nullable=False)
    dynamic_viscosity_pa_s: Mapped[float] = mapped_column(Float, nullable=False)
    kinematic_viscosity_m2_s: Mapped[float] = mapped_column(Float, nullable=False)
    bulk_modulus_pa: Mapped[float] = mapped_column(Float, default=2.18e9)
    vapor_pressure_pa: Mapped[float] = mapped_column(Float, default=2338.0)
    surface_tension_n_m: Mapped[float] = mapped_column(Float, default=0.0728)
    specific_heat_j_kg_k: Mapped[float] = mapped_column(Float, default=4182.0)
    thermal_conductivity_w_m_k: Mapped[float] = mapped_column(Float, default=0.598)
    prandtl_number: Mapped[float] = mapped_column(Float, default=7.01)
    compressible: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    networks: Mapped[List["NetworkModel"]] = relationship("NetworkModel", back_populates="fluid")


# ===========================================================================
# Project
# ===========================================================================

class ProjectModel(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    owner: Mapped[str] = mapped_column(String(120), default="default")
    tags: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # comma-separated

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    networks: Mapped[List["NetworkModel"]] = relationship("NetworkModel", back_populates="project",
                                                          cascade="all, delete-orphan")


# ===========================================================================
# Network (pipe system)
# ===========================================================================

class NetworkModel(Base):
    __tablename__ = "networks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    fluid_id: Mapped[str] = mapped_column(ForeignKey("fluids.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Global settings
    temperature_c: Mapped[float] = mapped_column(Float, default=20.0)
    reference_pressure_pa: Mapped[float] = mapped_column(Float, default=101325.0)
    gravity_m_s2: Mapped[float] = mapped_column(Float, default=9.80665)
    units_system: Mapped[str] = mapped_column(String(10), default="SI")   # SI or imperial

    # Canvas layout
    canvas_width: Mapped[int] = mapped_column(Integer, default=1200)
    canvas_height: Mapped[int] = mapped_column(Integer, default=800)
    canvas_scale: Mapped[float] = mapped_column(Float, default=1.0)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    project: Mapped["ProjectModel"] = relationship("ProjectModel", back_populates="networks")
    fluid: Mapped["FluidModel"] = relationship("FluidModel", back_populates="networks")
    nodes: Mapped[List["NodeModel"]] = relationship("NodeModel", back_populates="network",
                                                     cascade="all, delete-orphan")
    pipes: Mapped[List["PipeModel"]] = relationship("PipeModel", back_populates="network",
                                                     cascade="all, delete-orphan")
    simulations: Mapped[List["SimulationModel"]] = relationship("SimulationModel", back_populates="network",
                                                                  cascade="all, delete-orphan")


# ===========================================================================
# Node
# ===========================================================================

class NodeModel(Base):
    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    network_id: Mapped[str] = mapped_column(ForeignKey("networks.id"), nullable=False, index=True)

    label: Mapped[str] = mapped_column(String(80), nullable=False)
    node_type: Mapped[str] = mapped_column(String(30), default="junction")
    # Types: junction, reservoir, tank, pump_inlet, pump_outlet, valve_node

    # Canvas position
    x: Mapped[float] = mapped_column(Float, default=0.0)
    y: Mapped[float] = mapped_column(Float, default=0.0)

    # Physical properties
    elevation_m: Mapped[float] = mapped_column(Float, default=0.0)
    demand_m3s: Mapped[float] = mapped_column(Float, default=0.0)

    # Boundary conditions
    fixed_head_m: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fixed_pressure_pa: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Reservoir / tank properties
    surface_area_m2: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    min_level_m: Mapped[float] = mapped_column(Float, default=0.0)
    max_level_m: Mapped[float] = mapped_column(Float, default=10.0)
    initial_level_m: Mapped[float] = mapped_column(Float, default=5.0)

    # Metadata
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    network: Mapped["NetworkModel"] = relationship("NetworkModel", back_populates="nodes")
    pipes_from: Mapped[List["PipeModel"]] = relationship("PipeModel",
                                                          foreign_keys="PipeModel.node_from_id",
                                                          back_populates="node_from")
    pipes_to: Mapped[List["PipeModel"]] = relationship("PipeModel",
                                                        foreign_keys="PipeModel.node_to_id",
                                                        back_populates="node_to")


# ===========================================================================
# Pipe
# ===========================================================================

class PipeModel(Base):
    __tablename__ = "pipes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    network_id: Mapped[str] = mapped_column(ForeignKey("networks.id"), nullable=False, index=True)
    node_from_id: Mapped[str] = mapped_column(ForeignKey("nodes.id"), nullable=False)
    node_to_id: Mapped[str] = mapped_column(ForeignKey("nodes.id"), nullable=False)

    label: Mapped[str] = mapped_column(String(80), nullable=False)
    pipe_material: Mapped[str] = mapped_column(String(60), default="commercial_steel")

    # Geometry
    diameter_m: Mapped[float] = mapped_column(Float, nullable=False)
    length_m: Mapped[float] = mapped_column(Float, nullable=False)
    roughness_m: Mapped[float] = mapped_column(Float, default=4.6e-5)
    wall_thickness_m: Mapped[float] = mapped_column(Float, default=0.005)
    elastic_modulus_pa: Mapped[float] = mapped_column(Float, default=200e9)

    # Fittings / minor losses
    minor_loss_K: Mapped[float] = mapped_column(Float, default=0.0)
    fittings: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    # e.g. {"elbows_90": 2, "gate_valve": 1, "tee_branch": 0}

    # Valve
    valve_type: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    valve_open: Mapped[bool] = mapped_column(Boolean, default=True)
    valve_setting: Mapped[float] = mapped_column(Float, default=1.0)  # 0–1 (fraction open)

    # Pump (if this pipe segment contains a pump)
    has_pump: Mapped[bool] = mapped_column(Boolean, default=False)
    pump_rated_flow_m3s: Mapped[float] = mapped_column(Float, default=0.0)
    pump_rated_head_m: Mapped[float] = mapped_column(Float, default=0.0)
    pump_efficiency: Mapped[float] = mapped_column(Float, default=0.80)
    pump_curve: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    # e.g. {"Q": [0, 0.01, 0.02], "H": [30, 25, 15]}

    # Canvas visual
    waypoints: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    # [[x1,y1], [x2,y2], ...] for routing the pipe line on canvas

    color_override: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    line_width: Mapped[float] = mapped_column(Float, default=4.0)

    # Initial conditions
    initial_flow_m3s: Mapped[float] = mapped_column(Float, default=0.001)

    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    network: Mapped["NetworkModel"] = relationship("NetworkModel", back_populates="pipes")
    node_from: Mapped["NodeModel"] = relationship("NodeModel",
                                                   foreign_keys=[node_from_id],
                                                   back_populates="pipes_from")
    node_to: Mapped["NodeModel"] = relationship("NodeModel",
                                                 foreign_keys=[node_to_id],
                                                 back_populates="pipes_to")


# ===========================================================================
# Simulation & Results
# ===========================================================================

class SimulationModel(Base):
    __tablename__ = "simulations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    network_id: Mapped[str] = mapped_column(ForeignKey("networks.id"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(200), nullable=False, default="Simulation")
    status: Mapped[str] = mapped_column(String(20), default="pending")
    # statuses: pending, running, converged, failed, cancelled

    # Solver settings snapshot
    solver_type: Mapped[str] = mapped_column(String(30), default="gradient")
    max_iterations: Mapped[int] = mapped_column(Integer, default=500)
    convergence_tol: Mapped[float] = mapped_column(Float, default=1e-7)
    relaxation_factor: Mapped[float] = mapped_column(Float, default=1.0)

    # Results summary
    converged: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    iterations_used: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_residual: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_head_loss_m: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_power_w: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    solve_time_s: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Full results (serialized)
    pipe_results: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    node_results: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    convergence_history: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    warnings: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)

    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    network: Mapped["NetworkModel"] = relationship("NetworkModel", back_populates="simulations")
