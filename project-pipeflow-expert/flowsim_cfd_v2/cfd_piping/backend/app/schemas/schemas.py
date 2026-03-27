"""
Pydantic Schemas — Request & Response Models
=============================================
All FastAPI request bodies and response models.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field, validator, model_validator
import math


# ===========================================================================
# Shared base schemas
# ===========================================================================

class BaseResponse(BaseModel):
    class Config:
        from_attributes = True


# ===========================================================================
# Fluid schemas
# ===========================================================================

class FluidCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    slug: str = Field(..., min_length=1, max_length=80, pattern=r"^[a-z0-9_]+$")
    description: Optional[str] = None
    density_kg_m3: float = Field(..., gt=0, description="Density ρ [kg/m³]")
    dynamic_viscosity_pa_s: float = Field(..., gt=0, description="Dynamic viscosity μ [Pa·s]")
    kinematic_viscosity_m2_s: float = Field(..., gt=0, description="Kinematic viscosity ν [m²/s]")
    bulk_modulus_pa: float = Field(2.18e9, gt=0, description="Bulk modulus K [Pa]")
    vapor_pressure_pa: float = Field(2338.0, ge=0, description="Vapor pressure Pv [Pa]")
    surface_tension_n_m: float = Field(0.0728, ge=0, description="Surface tension σ [N/m]")
    specific_heat_j_kg_k: float = Field(4182.0, gt=0, description="Specific heat cp [J/(kg·K)]")
    thermal_conductivity_w_m_k: float = Field(0.598, gt=0, description="Thermal conductivity k [W/(m·K)]")
    prandtl_number: float = Field(7.01, gt=0)
    compressible: bool = False


class FluidResponse(BaseResponse):
    id: str
    name: str
    slug: str
    description: Optional[str]
    density_kg_m3: float
    dynamic_viscosity_pa_s: float
    kinematic_viscosity_m2_s: float
    bulk_modulus_pa: float
    vapor_pressure_pa: float
    surface_tension_n_m: float
    specific_heat_j_kg_k: float
    thermal_conductivity_w_m_k: float
    prandtl_number: float
    compressible: bool
    created_at: datetime
    updated_at: datetime


# ===========================================================================
# Project schemas
# ===========================================================================

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    owner: str = Field("default", max_length=120)
    tags: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    tags: Optional[str] = None


class ProjectResponse(BaseResponse):
    id: str
    name: str
    description: Optional[str]
    owner: str
    tags: Optional[str]
    created_at: datetime
    updated_at: datetime


# ===========================================================================
# Network schemas
# ===========================================================================

class NetworkCreate(BaseModel):
    project_id: str
    fluid_id: str
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    temperature_c: float = Field(20.0, ge=-50, le=500)
    reference_pressure_pa: float = Field(101325.0, gt=0)
    gravity_m_s2: float = Field(9.80665, gt=0)
    units_system: str = Field("SI", pattern=r"^(SI|imperial)$")
    canvas_width: int = Field(1200, ge=400, le=5000)
    canvas_height: int = Field(800, ge=300, le=4000)


class NetworkUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    fluid_id: Optional[str] = None
    temperature_c: Optional[float] = Field(None, ge=-50, le=500)
    reference_pressure_pa: Optional[float] = Field(None, gt=0)
    canvas_width: Optional[int] = None
    canvas_height: Optional[int] = None


class NetworkResponse(BaseResponse):
    id: str
    project_id: str
    fluid_id: str
    name: str
    description: Optional[str]
    temperature_c: float
    reference_pressure_pa: float
    gravity_m_s2: float
    units_system: str
    canvas_width: int
    canvas_height: int
    created_at: datetime
    updated_at: datetime


# ===========================================================================
# Node schemas
# ===========================================================================

class NodeCreate(BaseModel):
    network_id: str
    label: str = Field(..., min_length=1, max_length=80)
    node_type: str = Field("junction", pattern=r"^(junction|reservoir|tank|pump_inlet|pump_outlet|valve_node)$")
    x: float = Field(0.0, description="Canvas X position [px]")
    y: float = Field(0.0, description="Canvas Y position [px]")
    elevation_m: float = Field(0.0, description="Physical elevation z [m]")
    demand_m3s: float = Field(0.0, description="External flow demand Q [m³/s]")
    fixed_head_m: Optional[float] = Field(None, description="Fixed piezometric head [m]")
    fixed_pressure_pa: Optional[float] = Field(None, description="Fixed pressure [Pa]")
    surface_area_m2: Optional[float] = None
    min_level_m: float = 0.0
    max_level_m: float = 10.0
    initial_level_m: float = 5.0
    notes: Optional[str] = None
    color: Optional[str] = None


class NodeUpdate(BaseModel):
    label: Optional[str] = None
    node_type: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None
    elevation_m: Optional[float] = None
    demand_m3s: Optional[float] = None
    fixed_head_m: Optional[float] = None
    fixed_pressure_pa: Optional[float] = None
    notes: Optional[str] = None
    color: Optional[str] = None


class NodeResponse(BaseResponse):
    id: str
    network_id: str
    label: str
    node_type: str
    x: float
    y: float
    elevation_m: float
    demand_m3s: float
    fixed_head_m: Optional[float]
    fixed_pressure_pa: Optional[float]
    surface_area_m2: Optional[float]
    notes: Optional[str]
    color: Optional[str]
    created_at: datetime


# ===========================================================================
# Pipe schemas
# ===========================================================================

class FittingsConfig(BaseModel):
    """Pipe fitting counts for minor loss calculation."""
    elbows_90_standard: int = Field(0, ge=0)
    elbows_90_long_radius: int = Field(0, ge=0)
    elbows_45: int = Field(0, ge=0)
    elbows_180: int = Field(0, ge=0)
    tees_through: int = Field(0, ge=0)
    tees_branch: int = Field(0, ge=0)
    gate_valves_open: int = Field(0, ge=0)
    globe_valves: int = Field(0, ge=0)
    check_valves_swing: int = Field(0, ge=0)
    ball_valves: int = Field(0, ge=0)
    butterfly_valves: int = Field(0, ge=0)
    sharp_entrance: int = Field(0, ge=0)
    exit_loss: int = Field(0, ge=0)
    sudden_contraction_ratio: float = Field(0.0, ge=0, le=1)
    sudden_expansion_ratio: float = Field(0.0, ge=0, le=1)

    def total_K(self) -> float:
        """Compute total minor loss coefficient K."""
        from app.services.physics import MinorLossCoefficients as MLC
        K = 0.0
        K += self.elbows_90_standard * MLC.ELBOW_90_STANDARD
        K += self.elbows_90_long_radius * MLC.ELBOW_90_LONG_RADIUS
        K += self.elbows_45 * MLC.ELBOW_45_STANDARD
        K += self.elbows_180 * MLC.ELBOW_180_RETURN
        K += self.tees_through * MLC.TEE_FLOW_THROUGH
        K += self.tees_branch * MLC.TEE_BRANCH
        K += self.gate_valves_open * MLC.GATE_VALVE_FULLY_OPEN
        K += self.globe_valves * MLC.GLOBE_VALVE_FULLY_OPEN
        K += self.check_valves_swing * MLC.SWING_CHECK_VALVE
        K += self.ball_valves * MLC.BALL_VALVE_FULLY_OPEN
        K += self.butterfly_valves * MLC.BUTTERFLY_VALVE_FULLY_OPEN
        K += self.sharp_entrance * MLC.SHARP_EDGED_ENTRANCE
        K += self.exit_loss * MLC.EXIT_LOSS
        if self.sudden_contraction_ratio > 0:
            K += MLC.sudden_contraction(self.sudden_contraction_ratio)
        if self.sudden_expansion_ratio > 0:
            K += MLC.sudden_expansion(self.sudden_expansion_ratio)
        return K


class PipeCreate(BaseModel):
    network_id: str
    node_from_id: str
    node_to_id: str
    label: str = Field(..., min_length=1, max_length=80)
    pipe_material: str = Field("commercial_steel")
    diameter_m: float = Field(..., gt=0, le=10, description="Internal diameter [m]")
    length_m: float = Field(..., gt=0, description="Pipe length [m]")
    roughness_m: float = Field(4.6e-5, ge=0, description="Absolute roughness ε [m]")
    wall_thickness_m: float = Field(0.005, gt=0)
    elastic_modulus_pa: float = Field(200e9, gt=0)
    minor_loss_K: float = Field(0.0, ge=0)
    fittings: Optional[Dict[str, Any]] = None
    valve_type: Optional[str] = None
    valve_open: bool = True
    valve_setting: float = Field(1.0, ge=0, le=1)
    has_pump: bool = False
    pump_rated_flow_m3s: float = 0.0
    pump_rated_head_m: float = 0.0
    pump_efficiency: float = Field(0.80, ge=0, le=1)
    pump_curve: Optional[Dict[str, Any]] = None
    waypoints: Optional[List[List[float]]] = None
    color_override: Optional[str] = None
    line_width: float = Field(4.0, ge=1, le=20)
    initial_flow_m3s: float = Field(0.001, description="Initial flow guess Q₀ [m³/s]")
    notes: Optional[str] = None

    @validator("node_from_id", "node_to_id")
    def validate_node_id(cls, v):
        if not v:
            raise ValueError("Node ID cannot be empty")
        return v


class PipeUpdate(BaseModel):
    label: Optional[str] = None
    pipe_material: Optional[str] = None
    diameter_m: Optional[float] = Field(None, gt=0)
    length_m: Optional[float] = Field(None, gt=0)
    roughness_m: Optional[float] = Field(None, ge=0)
    minor_loss_K: Optional[float] = Field(None, ge=0)
    fittings: Optional[Dict[str, Any]] = None
    valve_open: Optional[bool] = None
    valve_setting: Optional[float] = Field(None, ge=0, le=1)
    has_pump: Optional[bool] = None
    pump_rated_head_m: Optional[float] = None
    pump_efficiency: Optional[float] = Field(None, ge=0, le=1)
    waypoints: Optional[List[List[float]]] = None
    color_override: Optional[str] = None
    line_width: Optional[float] = Field(None, ge=1, le=20)
    notes: Optional[str] = None


class PipeResponse(BaseResponse):
    id: str
    network_id: str
    node_from_id: str
    node_to_id: str
    label: str
    pipe_material: str
    diameter_m: float
    length_m: float
    roughness_m: float
    wall_thickness_m: float
    minor_loss_K: float
    fittings: Optional[Dict[str, Any]]
    valve_type: Optional[str]
    valve_open: bool
    valve_setting: float
    has_pump: bool
    pump_rated_flow_m3s: float
    pump_rated_head_m: float
    pump_efficiency: float
    pump_curve: Optional[Dict[str, Any]]
    waypoints: Optional[List[List[float]]]
    color_override: Optional[str]
    line_width: float
    initial_flow_m3s: float
    notes: Optional[str]
    created_at: datetime


# ===========================================================================
# Simulation schemas
# ===========================================================================

class SolverSettingsSchema(BaseModel):
    max_iterations: int = Field(500, ge=1, le=5000)
    convergence_tol: float = Field(1e-7, gt=0, description="Convergence tolerance [m³/s or m]")
    relaxation: float = Field(1.0, gt=0, le=2.0, description="Under-relaxation factor ω")
    use_gradient_method: bool = True
    verbose: bool = False


class SimulationCreate(BaseModel):
    network_id: str
    name: str = Field("Simulation Run", max_length=200)
    solver_settings: Optional[SolverSettingsSchema] = None


class SimulationResponse(BaseResponse):
    id: str
    network_id: str
    name: str
    status: str
    solver_type: str
    max_iterations: int
    convergence_tol: float
    relaxation_factor: float
    converged: Optional[bool]
    iterations_used: Optional[int]
    max_residual: Optional[float]
    total_head_loss_m: Optional[float]
    total_power_w: Optional[float]
    solve_time_s: Optional[float]
    error_message: Optional[str]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]


class SimulationResultsResponse(SimulationResponse):
    pipe_results: Optional[Dict[str, Any]]
    node_results: Optional[Dict[str, Any]]
    convergence_history: Optional[List[float]]
    warnings: Optional[List[str]]


# ===========================================================================
# CFD analysis schemas
# ===========================================================================

class PipeAnalysisRequest(BaseModel):
    """Single-pipe detailed CFD analysis request."""
    diameter_m: float = Field(..., gt=0, description="Internal diameter [m]")
    length_m: float = Field(..., gt=0, description="Pipe length [m]")
    flow_rate_m3s: float = Field(..., description="Volumetric flow rate Q [m³/s]")
    roughness_m: float = Field(4.6e-5, ge=0)
    minor_loss_K: float = Field(0.0, ge=0)
    elevation_in_m: float = Field(0.0)
    elevation_out_m: float = Field(0.0)
    fluid_slug: Optional[str] = Field("water_20")

    # Custom fluid override
    density_kg_m3: Optional[float] = Field(None, gt=0)
    dynamic_viscosity_pa_s: Optional[float] = Field(None, gt=0)


class SinglePipeAnalysisResult(BaseModel):
    """Detailed single-pipe CFD analysis result."""
    # Input echo
    diameter_m: float
    length_m: float
    flow_rate_m3s: float
    roughness_m: float
    fluid_name: str

    # Geometric
    pipe_area_m2: float
    relative_roughness: float

    # Flow
    velocity_m_s: float
    reynolds_number: float
    friction_factor_darcy: float
    friction_factor_fanning: float
    flow_regime: str

    # Head losses
    darcy_weisbach_head_loss_m: float
    minor_loss_head_m: float
    total_head_loss_m: float

    # Pressure
    friction_pressure_drop_pa: float
    minor_pressure_drop_pa: float
    static_pressure_drop_pa: float
    total_pressure_drop_pa: float

    # Energy
    dynamic_pressure_pa: float
    velocity_head_m: float
    kinetic_energy_coeff_alpha: float

    # Shear / turbulence
    wall_shear_stress_pa: float
    friction_velocity_m_s: float
    turbulence_intensity_pct: float
    turbulent_kinetic_energy_m2s2: float

    # Dimensionless
    mach_number: float
    euler_number: float
    cavitation_number: float

    # Velocity profile
    centerline_velocity_m_s: float
    velocity_at_half_radius_m_s: float
    velocity_at_wall_m_s: float

    # Power
    hydraulic_power_w: float

    # Water hammer
    wave_speed_m_s: float
    joukowski_pressure_surge_pa: float
    critical_closure_time_s: float


class VelocityProfilePoint(BaseModel):
    r_normalized: float    # r/R  0→1
    r_m: float             # absolute radial position
    velocity_m_s: float
    y_plus: float


class VelocityProfileResult(BaseModel):
    pipe_id: str
    regime: str
    n_radial_points: int
    profile: List[VelocityProfilePoint]
    mean_velocity_m_s: float
    centerline_velocity_m_s: float
    coriolis_coefficient: float


# ===========================================================================
# Canvas / visual export schemas
# ===========================================================================

class CanvasExportRequest(BaseModel):
    network_id: str
    simulation_id: Optional[str] = None
    color_field: str = Field("velocity", description="Field to color-map: velocity|pressure|reynolds|head_loss|turbulence")
    colormap: str = Field("viridis", description="Colormap: viridis|plasma|RdYlBu|coolwarm|jet")
    show_labels: bool = True
    show_arrows: bool = True
    show_egl: bool = False
    show_hgl: bool = False


class CanvasNodeData(BaseModel):
    id: str
    label: str
    node_type: str
    x: float
    y: float
    elevation_m: float
    # Result overlays
    pressure_head_m: Optional[float] = None
    pressure_pa: Optional[float] = None
    hydraulic_grade_m: Optional[float] = None
    balance_error_m3s: Optional[float] = None


class CanvasPipeData(BaseModel):
    id: str
    label: str
    node_from_id: str
    node_to_id: str
    waypoints: Optional[List[List[float]]]
    diameter_m: float
    line_width: float
    # Color mapping result
    color: str = "#94a3b8"
    color_value: Optional[float] = None
    color_field: Optional[str] = None
    # Result overlays
    flow_m3s: Optional[float] = None
    velocity_m_s: Optional[float] = None
    reynolds_number: Optional[float] = None
    head_loss_m: Optional[float] = None
    pressure_drop_pa: Optional[float] = None
    flow_regime: Optional[str] = None
    turbulence_intensity_pct: Optional[float] = None
    direction: Optional[str] = None
    arrow_position: Optional[float] = 0.5  # 0–1 along pipe


class CanvasExportResponse(BaseModel):
    network_id: str
    simulation_id: Optional[str]
    color_field: str
    colormap: str
    nodes: List[CanvasNodeData]
    pipes: List[CanvasPipeData]
    legend_min: float
    legend_max: float
    legend_unit: str
    legend_label: str
    canvas_width: int
    canvas_height: int


# ===========================================================================
# Paginated list responses
# ===========================================================================

class PaginatedResponse(BaseModel):
    total: int
    page: int
    per_page: int
    pages: int
    items: List[Any]


# ===========================================================================
# Health / diagnostics
# ===========================================================================

class HealthResponse(BaseModel):
    status: str
    database: str
    solver: str
    version: str


class SolverDiagnosticsRequest(BaseModel):
    """Request to run solver diagnostics on a predefined test network."""
    test_case: str = Field("simple_loop", description="Test network: simple_loop|branched|complex_grid")
    fluid_slug: str = "water_20"


class SolverDiagnosticsResponse(BaseModel):
    test_case: str
    n_nodes: int
    n_pipes: int
    n_loops: int
    converged: bool
    iterations: int
    max_residual: float
    solve_time_ms: float
    expected_convergence: bool
    passed: bool
