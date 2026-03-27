"""
==============================================================================
CFD PIPE FLOW SOLVER - Pydantic API Schemas
==============================================================================
All request and response schemas for the REST API.

Organised as:
  - Fluid / Material schemas
  - Node schemas
  - Pipe schemas
  - Network schemas
  - Solver configuration schemas
  - Result schemas
  - Visualisation schemas
  - Error schemas
==============================================================================
"""

from __future__ import annotations

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Optional, Dict, Tuple, Any, Literal
from enum import Enum
import math


# ─────────────────────────────────────────────────────────────────────────────
# Enumerations
# ─────────────────────────────────────────────────────────────────────────────

class RheologyModel(str, Enum):
    newtonian          = "newtonian"
    power_law          = "power_law"
    bingham            = "bingham"
    herschel_bulkley   = "herschel_bulkley"

class TurbulenceModel(str, Enum):
    laminar        = "laminar"
    mixing_length  = "mixing_length"
    k_epsilon      = "k_epsilon"
    k_omega        = "k_omega"

class SolverMethod(str, Enum):
    hardy_cross    = "hardy_cross"
    newton_raphson = "newton_raphson"
    gauss_seidel   = "gauss_seidel"

class FlowRegime(str, Enum):
    laminar        = "laminar"
    transitional   = "transitional"
    turbulent      = "turbulent"
    compressible   = "compressible"

class VisualisationVariable(str, Enum):
    velocity       = "velocity"
    pressure       = "pressure"
    temperature    = "temperature"
    reynolds       = "reynolds"
    head_loss      = "head_loss"
    wall_shear     = "wall_shear"
    turbulent_ke   = "turbulent_ke"
    mach_number    = "mach_number"
    friction_factor = "friction_factor"

class FittingType(str, Enum):
    elbow_90      = "elbow_90"
    elbow_45      = "elbow_45"
    tee_branch    = "tee_branch"
    tee_straight  = "tee_straight"
    reducer       = "reducer"
    expander      = "expander"
    gate_valve    = "gate_valve"
    globe_valve   = "globe_valve"
    ball_valve    = "ball_valve"
    butterfly_valve = "butterfly_valve"
    check_valve   = "check_valve"
    entrance_sharp = "entrance_sharp"
    exit_open     = "exit_open"
    orifice       = "orifice"
    venturi       = "venturi"

class PipeMaterial(str, Enum):
    drawn_tubing         = "drawn_tubing"
    commercial_steel     = "commercial_steel"
    galvanized_iron      = "galvanized_iron"
    cast_iron            = "cast_iron"
    wrought_iron         = "wrought_iron"
    concrete_smooth      = "concrete_smooth"
    concrete_rough       = "concrete_rough"
    pvc_plastic          = "pvc_plastic"
    hdpe                 = "hdpe"
    stainless_steel_304  = "stainless_steel_304"
    stainless_steel_316  = "stainless_steel_316"
    copper               = "copper"
    ductile_iron         = "ductile_iron"


# ─────────────────────────────────────────────────────────────────────────────
# Fluid / Material Schemas
# ─────────────────────────────────────────────────────────────────────────────

class FluidPropertiesSchema(BaseModel):
    """Fluid thermophysical properties for CFD analysis."""
    name: str                       = Field("water", description="Fluid name")
    density: float                  = Field(998.2, gt=0, description="Density [kg/m³]")
    dynamic_viscosity: float        = Field(1.002e-3, gt=0, description="Dynamic viscosity [Pa·s]")
    bulk_modulus: float             = Field(2.15e9, gt=0, description="Bulk modulus [Pa]")
    vapour_pressure: float          = Field(2337.0, ge=0, description="Vapour pressure [Pa]")
    specific_heat: float            = Field(4182.0, gt=0, description="Specific heat cp [J/(kg·K)]")
    thermal_conductivity: float     = Field(0.598, gt=0, description="Thermal conductivity λ [W/(m·K)]")
    surface_tension: float          = Field(0.0728, ge=0, description="Surface tension σ [N/m]")
    temperature: float              = Field(293.15, gt=0, description="Bulk temperature [K]")
    rheology_model: RheologyModel   = Field(RheologyModel.newtonian, description="Rheology model")
    consistency_index: float        = Field(0.0, ge=0, description="Power-law consistency K [Pa·sⁿ]")
    flow_behaviour_index: float     = Field(1.0, gt=0, description="Power-law index n [-]")
    yield_stress: float             = Field(0.0, ge=0, description="Yield stress τ₀ [Pa]")
    molar_mass: float               = Field(0.018015, gt=0, description="Molar mass [kg/mol]")
    ratio_specific_heats: float     = Field(1.4, gt=1, description="γ = cp/cv (gases)")
    is_compressible: bool           = Field(False, description="Enable compressible flow")

    model_config = {"json_schema_extra": {
        "example": {
            "name": "water_20c",
            "density": 998.2,
            "dynamic_viscosity": 1.002e-3,
            "bulk_modulus": 2.15e9,
            "vapour_pressure": 2337.0,
            "specific_heat": 4182.0,
            "thermal_conductivity": 0.598,
            "temperature": 293.15,
            "rheology_model": "newtonian",
        }
    }}


class FluidPresetRequest(BaseModel):
    """Request to use a preset fluid."""
    preset_id: str = Field(..., description="Fluid preset ID from /api/v1/materials/fluids")

    model_config = {"json_schema_extra": {"example": {"preset_id": "water_20c"}}}


# ─────────────────────────────────────────────────────────────────────────────
# Node Schemas
# ─────────────────────────────────────────────────────────────────────────────

class NodeCreateSchema(BaseModel):
    """Create a network node (junction, reservoir, demand point)."""
    id: str                         = Field(..., min_length=1, max_length=64, description="Unique node ID")
    elevation: float                = Field(0.0, description="Elevation above datum [m]")
    external_flow: float            = Field(0.0, description="External flow (+ supply, - demand) [m³/s]")
    is_reservoir: bool              = Field(False, description="Fixed-head boundary condition")
    fixed_head: float               = Field(0.0, description="Total head if reservoir [m]")
    is_pressure_bc: bool            = Field(False, description="Fixed-pressure boundary")
    fixed_pressure: float           = Field(0.0, description="Gauge pressure if BC [Pa]")
    temperature: float              = Field(293.15, gt=0, description="Node temperature [K]")
    # UI display properties
    x: float                        = Field(0.0, description="Canvas x-coordinate [px]")
    y: float                        = Field(0.0, description="Canvas y-coordinate [px]")
    label: Optional[str]            = Field(None, description="Display label")

    @model_validator(mode="after")
    def validate_boundary_conditions(self) -> "NodeCreateSchema":
        if self.is_reservoir and self.is_pressure_bc:
            raise ValueError("Node cannot be both a reservoir and a pressure BC")
        return self

    model_config = {"json_schema_extra": {
        "example": {
            "id": "N1",
            "elevation": 10.0,
            "external_flow": 0.05,
            "is_reservoir": False,
            "temperature": 293.15,
            "x": 100.0,
            "y": 200.0,
            "label": "Junction A",
        }
    }}


class NodeUpdateSchema(BaseModel):
    """Partial update for a node."""
    elevation: Optional[float]      = None
    external_flow: Optional[float]  = None
    is_reservoir: Optional[bool]    = None
    fixed_head: Optional[float]     = None
    is_pressure_bc: Optional[bool]  = None
    fixed_pressure: Optional[float] = None
    temperature: Optional[float]    = None
    x: Optional[float]              = None
    y: Optional[float]              = None
    label: Optional[str]            = None


class NodeResultSchema(BaseModel):
    """Solved hydraulic state at a node."""
    id: str
    elevation: float
    pressure: float                         # Pa gauge
    pressure_head: float                    # m
    total_head: float                       # m  (p/ρg + V²/2g + z)
    piezometric_head: float                 # m  (p/ρg + z)
    temperature: float                      # K
    is_reservoir: bool
    is_pressure_bc: bool
    velocity_head: Optional[float] = None   # m  (mean, from adjacent pipes)


# ─────────────────────────────────────────────────────────────────────────────
# Fitting Schema
# ─────────────────────────────────────────────────────────────────────────────

class FittingSchema(BaseModel):
    """A pipe fitting contributing to minor losses."""
    type: FittingType
    quantity: int                   = Field(1, ge=1, description="Number of this fitting")
    K_override: Optional[float]     = Field(None, ge=0, description="Custom K (overrides table value)")
    description: Optional[str]      = None

    # Standard K values table (Crane TP-410, Table A-29)
    STANDARD_K: Dict[str, float] = {
        "elbow_90":       0.75,
        "elbow_45":       0.40,
        "tee_branch":     1.00,
        "tee_straight":   0.20,
        "reducer":        0.30,
        "expander":       1.00,
        "gate_valve":     0.10,
        "globe_valve":    6.00,
        "ball_valve":     0.05,
        "butterfly_valve": 0.35,
        "check_valve":    2.50,
        "entrance_sharp": 0.50,
        "exit_open":      1.00,
        "orifice":        3.00,
        "venturi":        0.15,
    }

    def effective_K(self) -> float:
        """Total K for this fitting (K_override or standard × quantity)."""
        K = self.K_override if self.K_override is not None else self.STANDARD_K.get(self.type.value, 0.0)
        return K * self.quantity

    model_config = {"arbitrary_types_allowed": True}


# ─────────────────────────────────────────────────────────────────────────────
# Pipe Schemas
# ─────────────────────────────────────────────────────────────────────────────

class PumpCurvePoint(BaseModel):
    """A single point on a pump Q-H curve."""
    flow_rate: float    = Field(..., ge=0,  description="Flow rate [m³/s]")
    head:      float    = Field(..., ge=0,  description="Head [m]")


class PipeCreateSchema(BaseModel):
    """Create a pipe segment."""
    id: str                         = Field(..., min_length=1, max_length=64)
    node_start: str                 = Field(..., description="Start node ID")
    node_end: str                   = Field(..., description="End node ID")
    length: float                   = Field(100.0, gt=0, description="Pipe length [m]")
    diameter: float                 = Field(0.1, gt=0, description="Inner diameter [m]")
    material: Optional[PipeMaterial] = Field(PipeMaterial.commercial_steel, description="Pipe material")
    roughness: Optional[float]      = Field(None, ge=0, description="Absolute roughness ε [m] (overrides material)")
    elevation_start: float          = Field(0.0, description="Start elevation [m]")
    elevation_end: float            = Field(0.0, description="End elevation [m]")
    thickness: float                = Field(0.008, gt=0, description="Wall thickness [m]")
    young_modulus: float            = Field(200e9, gt=0, description="Wall Young's modulus E [Pa]")
    poisson_ratio: float            = Field(0.30, ge=0, le=0.5, description="Poisson's ratio")
    fittings: List[FittingSchema]   = Field(default_factory=list, description="List of fittings")
    fittings_K_total: Optional[float] = Field(None, ge=0, description="Override total fittings K")
    is_valve: bool                  = Field(False, description="Valve element")
    valve_open_fraction: float      = Field(1.0, ge=0, le=1, description="Valve opening fraction [0–1]")
    is_pump: bool                   = Field(False, description="Pump element")
    pump_curve: List[PumpCurvePoint] = Field(default_factory=list, description="Pump Q-H curve")
    heat_flux: float                = Field(0.0, description="Wall heat flux [W/m²]")
    insulation_R: float             = Field(0.0, ge=0, description="Insulation resistance [m²K/W]")
    initial_flow: float             = Field(0.001, description="Initial flow guess [m³/s]")
    # UI
    color_override: Optional[str]   = Field(None, description="Force display colour (hex)")
    line_width: float               = Field(3.0, gt=0, description="Canvas line width [px]")
    label: Optional[str]            = None

    @field_validator("diameter")
    @classmethod
    def diameter_reasonable(cls, v: float) -> float:
        if v < 1e-4 or v > 10.0:
            raise ValueError(f"Diameter {v} m outside reasonable range [0.0001, 10] m")
        return v

    @field_validator("length")
    @classmethod
    def length_reasonable(cls, v: float) -> float:
        if v > 1e6:
            raise ValueError("Pipe length > 1,000 km seems unreasonable")
        return v

    def computed_roughness(self) -> float:
        """Resolve roughness: explicit value, or lookup from material."""
        if self.roughness is not None:
            return self.roughness
        from cfd.solver import PIPE_ROUGHNESS_DB
        return PIPE_ROUGHNESS_DB.get(self.material.value if self.material else "commercial_steel", 4.6e-5)

    def computed_fittings_K(self) -> float:
        """Total K from fittings list or override."""
        if self.fittings_K_total is not None:
            return self.fittings_K_total
        return sum(f.effective_K() for f in self.fittings)


class PipeUpdateSchema(BaseModel):
    """Partial pipe update."""
    length: Optional[float]             = None
    diameter: Optional[float]           = None
    material: Optional[PipeMaterial]    = None
    roughness: Optional[float]          = None
    elevation_start: Optional[float]    = None
    elevation_end: Optional[float]      = None
    thickness: Optional[float]          = None
    fittings: Optional[List[FittingSchema]] = None
    fittings_K_total: Optional[float]   = None
    is_valve: Optional[bool]            = None
    valve_open_fraction: Optional[float] = None
    is_pump: Optional[bool]             = None
    pump_curve: Optional[List[PumpCurvePoint]] = None
    heat_flux: Optional[float]          = None
    color_override: Optional[str]       = None
    label: Optional[str]                = None


class TurbulenceResultSchema(BaseModel):
    """k-epsilon turbulence quantities for a pipe."""
    turbulent_kinetic_energy_k: float       # m²/s²
    turbulent_dissipation_epsilon: float    # m²/s³
    turbulent_viscosity_mu_t: float         # Pa·s
    turbulent_intensity_I: float            # fraction
    turbulent_length_scale_lt: float        # m
    wall_shear_stress_tau_w: float          # Pa
    friction_velocity_u_tau: float          # m/s
    y_plus_at_wall_cell: float              # dimensionless
    turbulent_prandtl_Pr_t: float           # dimensionless
    effective_viscosity: float              # Pa·s


class PipeResultSchema(BaseModel):
    """Solved hydraulic state of a pipe segment."""
    id: str
    node_start: str
    node_end: str
    flow_rate: float                    # m³/s
    velocity: float                     # m/s
    reynolds_number: float
    friction_factor: float
    head_loss: float                    # m
    pressure_drop: float                # Pa
    wall_shear_stress: float            # Pa
    flow_regime: FlowRegime
    mach_number: float
    cavitation_number: float
    nusselt_number: float
    heat_transfer_coeff: float          # W/(m²·K)
    temperature_out: float              # K
    turbulence: Optional[TurbulenceResultSchema] = None
    # Colour for visualisation
    display_color: Optional[str] = None     # hex
    relative_roughness: Optional[float] = None


class PipeVisualSchema(BaseModel):
    """Minimal pipe data for canvas rendering."""
    id: str
    node_start: str
    node_end: str
    display_color: str      # hex colour based on selected variable
    line_width: float       # px (may scale with diameter)
    value: float            # numeric value driving colour
    variable: str           # "velocity", "pressure", etc.
    label: Optional[str]    = None
    tooltip: str            = ""


# ─────────────────────────────────────────────────────────────────────────────
# Network Schemas
# ─────────────────────────────────────────────────────────────────────────────

class NetworkCreateSchema(BaseModel):
    """Create a new piping network."""
    name: str                                   = Field(..., min_length=1, max_length=128)
    description: Optional[str]                  = Field(None, max_length=2048)
    fluid: FluidPropertiesSchema                = Field(default_factory=FluidPropertiesSchema)
    nodes: List[NodeCreateSchema]               = Field(default_factory=list)
    pipes: List[PipeCreateSchema]               = Field(default_factory=list)
    tags: List[str]                             = Field(default_factory=list)
    units_system: Literal["SI", "US"]           = Field("SI")

    @model_validator(mode="after")
    def validate_pipe_node_references(self) -> "NetworkCreateSchema":
        node_ids = {n.id for n in self.nodes}
        for pipe in self.pipes:
            if pipe.node_start not in node_ids:
                raise ValueError(f"Pipe '{pipe.id}' references unknown node '{pipe.node_start}'")
            if pipe.node_end not in node_ids:
                raise ValueError(f"Pipe '{pipe.id}' references unknown node '{pipe.node_end}'")
        return self


class NetworkUpdateSchema(BaseModel):
    """Partial update of network metadata."""
    name: Optional[str]         = None
    description: Optional[str]  = None
    tags: Optional[List[str]]   = None


class NetworkSummarySchema(BaseModel):
    """Brief summary of a network (for list views)."""
    id: str
    name: str
    description: Optional[str]
    node_count: int
    pipe_count: int
    fluid_name: str
    created_at: str
    updated_at: str
    last_solve_status: Optional[str]    # "converged" | "diverged" | None
    tags: List[str]


class NetworkDetailSchema(BaseModel):
    """Full network data including topology."""
    id: str
    name: str
    description: Optional[str]
    fluid: FluidPropertiesSchema
    nodes: List[NodeCreateSchema]
    pipes: List[PipeCreateSchema]
    tags: List[str]
    units_system: str
    created_at: str
    updated_at: str
    topology: Optional[Dict]    = None  # {connected, n_loops, node_degrees}


# ─────────────────────────────────────────────────────────────────────────────
# Solver Schemas
# ─────────────────────────────────────────────────────────────────────────────

class SolverConfigSchema(BaseModel):
    """Solver configuration."""
    method: SolverMethod                    = Field(SolverMethod.newton_raphson)
    max_iterations: int                     = Field(500, ge=1, le=10000)
    tolerance: float                        = Field(1e-8, gt=0, le=1e-2)
    relaxation: float                       = Field(0.7, gt=0, le=1.0)
    turbulence_model: TurbulenceModel       = Field(TurbulenceModel.k_epsilon)
    solve_heat: bool                        = Field(False)
    solve_transient: bool                   = Field(False)
    transient_dt: float                     = Field(0.01, gt=0)
    transient_duration: float               = Field(10.0, gt=0)
    two_phase: bool                         = Field(False)
    vapour_quality: float                   = Field(0.0, ge=0.0, le=1.0)
    check_cavitation: bool                  = Field(True)
    verbose: bool                           = Field(False)


class SolveRequest(BaseModel):
    """Request to solve a network."""
    network_id: str
    config: SolverConfigSchema              = Field(default_factory=SolverConfigSchema)


class SolveInlineRequest(BaseModel):
    """Solve a network defined inline (no database persistence needed)."""
    network: NetworkCreateSchema
    config: SolverConfigSchema              = Field(default_factory=SolverConfigSchema)


# ─────────────────────────────────────────────────────────────────────────────
# Result Schemas
# ─────────────────────────────────────────────────────────────────────────────

class NetworkStatsSchema(BaseModel):
    """Network-level statistics from solver."""
    solver_method: str
    converged: bool
    iterations: int
    final_residual: float
    total_pipe_length_m: float
    total_head_loss_m: float
    max_velocity_ms: float
    max_reynolds_number: float
    velocity_stats: Optional[Dict]  = None
    head_loss_stats: Optional[Dict] = None
    reynolds_stats: Optional[Dict]  = None
    flow_regime_counts: Optional[Dict] = None
    pressure_uniformity_index: Optional[float] = None
    flow_distribution_cv: Optional[float] = None


class SolveResultSchema(BaseModel):
    """Complete solver result."""
    network_id: str
    solve_id: str
    timestamp: str
    converged: bool
    iterations: int
    residual: float
    pipe_results: List[PipeResultSchema]
    node_results: List[NodeResultSchema]
    network_stats: NetworkStatsSchema
    hgl: Optional[List[Dict]]           = None   # hydraulic grade line
    warnings: List[str]                  = Field(default_factory=list)
    solver_log: Optional[List[str]]      = None
    water_hammer: Optional[List[Dict]]   = None


# ─────────────────────────────────────────────────────────────────────────────
# Visualisation Schemas
# ─────────────────────────────────────────────────────────────────────────────

class ColourStop(BaseModel):
    value: float
    color: str          # hex
    fraction: float     # 0–1


class ColourLegendSchema(BaseModel):
    variable: str
    unit: str
    min_value: float
    max_value: float
    stops: List[ColourStop]


class VisualisationRequest(BaseModel):
    """Request colour-mapped visualisation data for a solve result."""
    solve_id: str
    variable: VisualisationVariable     = Field(VisualisationVariable.velocity)
    colour_map: str                     = Field("rainbow", description="Colour scheme")
    n_legend_stops: int                 = Field(10, ge=5, le=50)
    normalise: bool                     = Field(True)


class VisualisationResponse(BaseModel):
    """Colour-mapped pipe data for canvas rendering."""
    solve_id: str
    variable: str
    pipes_visual: List[PipeVisualSchema]
    nodes_visual: List[Dict]
    legend: ColourLegendSchema
    stats: Dict     # descriptive stats of the visualised variable


# ─────────────────────────────────────────────────────────────────────────────
# Validation Schemas
# ─────────────────────────────────────────────────────────────────────────────

class ValidationIssue(BaseModel):
    severity: Literal["error", "warning", "info"]
    code: str
    message: str
    entity_type: Optional[str]  = None
    entity_id: Optional[str]    = None


class ValidationResult(BaseModel):
    valid: bool
    issues: List[ValidationIssue]
    summary: str


# ─────────────────────────────────────────────────────────────────────────────
# Template Schemas
# ─────────────────────────────────────────────────────────────────────────────

class TemplateInfo(BaseModel):
    id: str
    name: str
    description: str
    category: str
    node_count: int
    pipe_count: int
    tags: List[str]
    thumbnail: Optional[str] = None   # base64 PNG


class TemplateApplyRequest(BaseModel):
    template_id: str
    network_name: str
    fluid_preset: Optional[str]     = None
    scale_factor: float             = Field(1.0, gt=0)


# ─────────────────────────────────────────────────────────────────────────────
# Export Schemas
# ─────────────────────────────────────────────────────────────────────────────

class ExportRequest(BaseModel):
    solve_id: str
    format: Literal["csv", "json", "xlsx", "pdf_report"]    = "json"
    include_solver_log: bool        = False
    include_turbulence: bool        = True


# ─────────────────────────────────────────────────────────────────────────────
# Error / Response Helpers
# ─────────────────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str]   = None
    code: Optional[str]     = None


class SuccessResponse(BaseModel):
    message: str
    data: Optional[Any]     = None


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool


# ─────────────────────────────────────────────────────────────────────────────
# History Schemas
# ─────────────────────────────────────────────────────────────────────────────

class SolveHistoryItem(BaseModel):
    solve_id: str
    network_id: str
    network_name: str
    timestamp: str
    converged: bool
    iterations: int
    residual: float
    solver_method: str
    max_velocity: float
    total_head_loss: float


# ─────────────────────────────────────────────────────────────────────────────
# Moody Chart Data
# ─────────────────────────────────────────────────────────────────────────────

class MoodyChartRequest(BaseModel):
    """Request Moody chart data for a given roughness range."""
    Re_min: float       = Field(1e2,   gt=0)
    Re_max: float       = Field(1e8,   gt=0)
    n_points: int       = Field(200,   ge=10, le=2000)
    relative_roughnesses: List[float] = Field(
        default=[0.0, 1e-6, 1e-5, 1e-4, 1e-3, 5e-3, 1e-2],
        description="List of ε/D values for curves"
    )


class MoodyChartResponse(BaseModel):
    """Moody chart data series."""
    Re_values: List[float]
    curves: List[Dict]      # [{"eps_D": float, "f_values": [float,...]}]
    laminar_line: Dict      # {"Re": [...], "f": [...]}
    transition_band: Dict   # {"Re_min": 2300, "Re_max": 4000}
