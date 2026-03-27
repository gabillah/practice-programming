"""
==============================================================================
CFD PIPE FLOW SOLVER - Core Computational Engine
==============================================================================
Implements all CFD mathematics for piping network analysis:

  1.  Darcy-Weisbach equation (pressure drop)
  2.  Colebrook-White / Swamee-Jain (friction factor)
  3.  Hardy-Cross network solver (iterative flow balancing)
  4.  Newton-Raphson network solver (quadratic convergence)
  5.  k-epsilon turbulence model
  6.  Dittus-Boelter / Gnielinski heat transfer
  7.  Method of Characteristics (water hammer / transient)
  8.  Lockhart-Martinelli two-phase flow
  9.  Compressible flow (isentropic, Fanno, Rayleigh)
  10. Non-Newtonian rheology (Power-law, Bingham, Herschel-Bulkley)
  11. Cavitation index (σ)
  12. Pump curve interpolation
  13. Control valve Cv / Kv modelling
  14. Network graph analysis (connectivity, loops)

All equations reference standard engineering literature (see REFERENCES at
bottom of file).

Units: SI throughout (Pa, m, m/s, kg/m³, Pa·s, W/m·K, K)
==============================================================================
"""

from __future__ import annotations

import math
import numpy as np
from numpy.typing import NDArray
from scipy import optimize, linalg, interpolate
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional, Callable, Any
import warnings
import logging

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Physical Constants
# ─────────────────────────────────────────────────────────────────────────────
GRAVITY          = 9.80665          # m/s²  (standard gravity, ISO 80000-3)
UNIVERSAL_GAS_R  = 8.314462618      # J/(mol·K)
BOLTZMANN        = 1.380649e-23     # J/K
AVOGADRO         = 6.02214076e23    # 1/mol
ATM_PRESSURE     = 101_325.0        # Pa
WATER_DENSITY_4C = 999.972          # kg/m³ at 4°C
PI               = math.pi

# Convergence defaults
DEFAULT_MAX_ITER   = 500
DEFAULT_TOLERANCE  = 1.0e-8
DEFAULT_RELAXATION = 0.7            # under-relaxation factor for Hardy-Cross


# ─────────────────────────────────────────────────────────────────────────────
# Data Classes
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class FluidProperties:
    """
    Fluid thermophysical properties (temperature-dependent lookup available).

    Attributes
    ----------
    density         : kg/m³
    dynamic_viscosity: Pa·s
    kinematic_viscosity: m²/s  (auto-computed)
    bulk_modulus    : Pa  (for water-hammer wave speed)
    vapour_pressure : Pa  (for cavitation)
    specific_heat   : J/(kg·K)
    thermal_conductivity : W/(m·K)
    prandtl_number  : dimensionless (auto-computed)
    surface_tension : N/m (two-phase)
    """
    name: str                   = "water"
    density: float              = 998.2          # kg/m³ at 20°C
    dynamic_viscosity: float    = 1.002e-3       # Pa·s at 20°C
    bulk_modulus: float         = 2.15e9         # Pa
    vapour_pressure: float      = 2337.0         # Pa at 20°C
    specific_heat: float        = 4182.0         # J/(kg·K)
    thermal_conductivity: float = 0.598          # W/(m·K)
    surface_tension: float      = 0.0728         # N/m at 20°C
    # For non-Newtonian fluids
    rheology_model: str         = "newtonian"    # "power_law" | "bingham" | "herschel_bulkley"
    consistency_index: float    = 0.0            # K  [Pa·sⁿ]
    flow_behaviour_index: float = 1.0            # n  (1.0 = Newtonian)
    yield_stress: float         = 0.0            # τ₀ [Pa]
    # For gas / compressible flow
    molar_mass: float           = 0.018015       # kg/mol (water)
    ratio_specific_heats: float = 1.4            # γ = cp/cv
    is_compressible: bool       = False
    temperature: float          = 293.15         # K (20°C)

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if self.density <= 0:
            raise ValueError(f"Density must be positive: {self.density}")
        if self.dynamic_viscosity <= 0:
            raise ValueError(f"Dynamic viscosity must be positive: {self.dynamic_viscosity}")
        if self.flow_behaviour_index <= 0:
            raise ValueError(f"Flow behaviour index n must be positive: {self.flow_behaviour_index}")

    @property
    def kinematic_viscosity(self) -> float:
        """ν = μ/ρ  [m²/s]"""
        return self.dynamic_viscosity / self.density

    @property
    def prandtl_number(self) -> float:
        """Pr = μ·cp / λ  [-]"""
        return (self.dynamic_viscosity * self.specific_heat) / self.thermal_conductivity

    @property
    def thermal_diffusivity(self) -> float:
        """α = λ/(ρ·cp)  [m²/s]"""
        return self.thermal_conductivity / (self.density * self.specific_heat)

    def sound_speed(self) -> float:
        """
        Speed of sound in the fluid.

        For liquids: c = sqrt(K/ρ)         [water-hammer wave speed basis]
        For ideal gas: c = sqrt(γRT/M)
        """
        if self.is_compressible:
            # Ideal gas
            R_specific = UNIVERSAL_GAS_R / self.molar_mass
            return math.sqrt(self.ratio_specific_heats * R_specific * self.temperature)
        else:
            # Liquid (no pipe elasticity correction here — see wave_speed())
            return math.sqrt(self.bulk_modulus / self.density)

    def effective_viscosity(self, shear_rate: float) -> float:
        """
        Effective (apparent) dynamic viscosity for non-Newtonian fluids.

        Power-Law:          η = K · γ̇^(n-1)
        Bingham Plastic:    η = τ₀/γ̇ + μ_p  (if γ̇ > 0)
        Herschel-Bulkley:   η = (τ₀ + K·γ̇ⁿ) / γ̇
        Newtonian:          η = μ

        Parameters
        ----------
        shear_rate : s⁻¹  (always non-negative)
        """
        if shear_rate <= 0.0:
            return self.dynamic_viscosity  # avoid division-by-zero

        model = self.rheology_model.lower()
        if model == "newtonian":
            return self.dynamic_viscosity
        elif model == "power_law":
            return self.consistency_index * (shear_rate ** (self.flow_behaviour_index - 1.0))
        elif model == "bingham":
            return (self.yield_stress / shear_rate) + self.dynamic_viscosity
        elif model == "herschel_bulkley":
            return (self.yield_stress + self.consistency_index * (shear_rate ** self.flow_behaviour_index)) / shear_rate
        else:
            raise ValueError(f"Unknown rheology model: {self.rheology_model}")


@dataclass
class PipeSegment:
    """
    A single pipe segment in the network.

    Attributes
    ----------
    id             : unique segment identifier
    node_start     : start node id
    node_end       : end node id
    length         : m
    diameter       : m (inner diameter)
    roughness      : m (absolute roughness, ε)
    elevation_start: m  (above datum)
    elevation_end  : m
    flow_rate      : m³/s  (positive = start→end)
    thickness      : m (wall thickness, for elasticity / water hammer)
    young_modulus  : Pa (pipe wall Young's modulus)
    fittings_K     : sum of minor-loss K coefficients (velocity-head basis)
    is_valve       : flag for valve element
    valve_open_frac: 0–1 (1 = fully open)
    is_pump        : flag for pump element
    pump_curve     : list of (Q, dH) tuples for pump head curve
    heat_flux      : W/m² (wall heat flux, + = into fluid)
    insulation_R   : m²·K/W (insulation thermal resistance)
    """
    id: str
    node_start: str
    node_end: str
    length: float              = 100.0       # m
    diameter: float            = 0.1         # m (100 mm)
    roughness: float           = 4.6e-5      # m (commercial steel)
    elevation_start: float     = 0.0         # m
    elevation_end: float       = 0.0         # m
    flow_rate: float           = 0.0         # m³/s
    thickness: float           = 0.008       # m  (8 mm steel wall)
    young_modulus: float       = 200.0e9     # Pa (steel)
    poisson_ratio: float       = 0.30        # steel
    fittings_K: float          = 0.0
    is_valve: bool             = False
    valve_open_frac: float     = 1.0
    is_pump: bool              = False
    pump_curve: List[Tuple[float, float]] = field(default_factory=list)
    heat_flux: float           = 0.0         # W/m²
    insulation_R: float        = 0.0         # m²·K/W
    # Computed results (filled after solver)
    velocity: float            = 0.0
    reynolds_number: float     = 0.0
    friction_factor: float     = 0.0
    pressure_drop: float       = 0.0
    head_loss: float           = 0.0
    wall_shear_stress: float   = 0.0
    nusselt_number: float      = 0.0
    heat_transfer_coeff: float = 0.0
    temperature_out: float     = 293.15
    mach_number: float         = 0.0
    flow_regime: str           = "laminar"
    cavitation_number: float   = 0.0

    @property
    def area(self) -> float:
        """Cross-sectional area A = π·D²/4 [m²]"""
        return PI * self.diameter**2 / 4.0

    @property
    def hydraulic_diameter(self) -> float:
        """D_h = D for full circular pipe [m]"""
        return self.diameter

    @property
    def perimeter(self) -> float:
        """Wetted perimeter P = π·D [m]"""
        return PI * self.diameter

    def relative_roughness(self) -> float:
        """ε/D  [-]"""
        return self.roughness / self.diameter

    def volume(self) -> float:
        """Pipe volume V = A·L [m³]"""
        return self.area * self.length

    def elevation_change(self) -> float:
        """Δz = z_end - z_start [m]"""
        return self.elevation_end - self.elevation_start


@dataclass
class NetworkNode:
    """
    A node (junction) in the piping network.

    Attributes
    ----------
    id              : unique node identifier
    elevation       : m (above datum)
    pressure        : Pa (unknown, solved for)
    pressure_head   : m  (= p/ρg)
    total_head      : m  (= p/ρg + v²/2g + z)
    external_flow   : m³/s (+inflow, -outflow, 0=junction)
    is_reservoir    : fixed-head boundary condition
    fixed_head      : m  (total head if reservoir)
    is_pressure_bc  : gauge pressure boundary
    fixed_pressure  : Pa
    temperature     : K
    """
    id: str
    elevation: float       = 0.0
    pressure: float        = 0.0        # Pa (gauge)
    external_flow: float   = 0.0        # m³/s  (+ = supply, - = demand)
    is_reservoir: bool     = False
    fixed_head: float      = 0.0        # m
    is_pressure_bc: bool   = False
    fixed_pressure: float  = 0.0        # Pa
    temperature: float     = 293.15     # K

    @property
    def pressure_head(self) -> float:
        """H_p = p / (ρ·g)  -- uses solver density (passed externally)"""
        raise NotImplementedError("Use solver-provided density")


@dataclass
class SolverConfig:
    """Solver configuration parameters."""
    method: str            = "newton_raphson"  # "hardy_cross" | "newton_raphson" | "gauss_seidel"
    max_iterations: int    = DEFAULT_MAX_ITER
    tolerance: float       = DEFAULT_TOLERANCE
    relaxation: float      = DEFAULT_RELAXATION
    solve_heat: bool       = False
    solve_transient: bool  = False
    transient_dt: float    = 0.01     # s
    transient_duration: float = 10.0  # s
    turbulence_model: str  = "k_epsilon"  # "k_epsilon"|"k_omega"|"mixing_length"|"laminar"
    two_phase: bool        = False
    vapour_quality: float  = 0.0       # x = m_gas/(m_gas+m_liq)
    verbose: bool          = False
    check_cavitation: bool = True


@dataclass
class SolverResult:
    """Packed result of a CFD solve."""
    converged: bool
    iterations: int
    residual: float
    pipe_results: List[Dict]
    node_results: List[Dict]
    network_stats: Dict
    warnings: List[str]
    solver_log: List[str]


# ─────────────────────────────────────────────────────────────────────────────
# Friction Factor Functions
# ─────────────────────────────────────────────────────────────────────────────

def friction_factor_laminar(Re: float) -> float:
    """
    Darcy friction factor for laminar flow.
        f = 64 / Re   (Hagen-Poiseuille)

    Valid for Re < 2300.
    """
    if Re <= 0:
        return 0.0
    return 64.0 / Re


def friction_factor_colebrook_white(Re: float, rel_roughness: float,
                                     f_init: float = 0.02,
                                     max_iter: int = 100,
                                     tol: float = 1e-10) -> float:
    """
    Colebrook-White implicit equation for turbulent friction factor.

        1/√f = -2 log₁₀(ε/(3.7·D) + 2.51/(Re·√f))

    Solved by successive substitution (Picard iteration).

    Parameters
    ----------
    Re          : Reynolds number  (≥ 4000 for validity)
    rel_roughness: ε/D  (absolute roughness / inner diameter)
    f_init      : initial guess
    max_iter    : Picard iteration limit
    tol         : convergence tolerance on f

    Returns
    -------
    Darcy friction factor f  [-]
    """
    if Re <= 0:
        return f_init
    f = f_init
    for _ in range(max_iter):
        rhs = -2.0 * math.log10(rel_roughness / 3.7 + 2.51 / (Re * math.sqrt(f)))
        f_new = 1.0 / (rhs ** 2)
        if abs(f_new - f) < tol:
            return f_new
        f = f_new
    return f   # return best estimate if not converged


def friction_factor_swamee_jain(Re: float, rel_roughness: float) -> float:
    """
    Swamee-Jain explicit approximation to Colebrook-White.

        f = 0.25 / [log₁₀(ε/(3.7D) + 5.74/Re⁰·⁹)]²

    Accuracy: ±3% compared to Colebrook-White.
    Valid: 5×10³ ≤ Re ≤ 10⁸, 10⁻⁶ ≤ ε/D ≤ 10⁻².
    """
    if Re <= 0:
        return 0.02
    log_arg = rel_roughness / 3.7 + 5.74 / (Re ** 0.9)
    if log_arg <= 0:
        return 0.02
    return 0.25 / (math.log10(log_arg) ** 2)


def friction_factor_churchill(Re: float, rel_roughness: float) -> float:
    """
    Churchill (1977) single explicit equation valid for ALL flow regimes
    (laminar, transitional, turbulent).

        f = 8·[(8/Re)¹² + (A+B)^(-3/2)]^(1/12)

    where
        A = [-2.457·ln(7/Re)^0.9 + 0.27·ε/D)]^16
        B = (37530/Re)^16

    Reference: Churchill, S.W. (1977) Chem. Eng., Nov 7, p. 91.
    """
    if Re <= 0:
        return 64.0
    A_inner = (7.0 / Re) ** 0.9 + 0.27 * rel_roughness
    if A_inner <= 0:
        A_inner = 1e-30
    A = (-2.457 * math.log(A_inner)) ** 16
    B = (37530.0 / Re) ** 16
    term1 = (8.0 / Re) ** 12
    term2 = (A + B) ** (-3.0 / 2.0)
    f = 8.0 * (term1 + term2) ** (1.0 / 12.0)
    return f


def friction_factor_moody(Re: float, rel_roughness: float) -> float:
    """
    Dispatcher: select the most appropriate friction factor formula.

    Regime determination:
      Re < 2300  → laminar (Hagen-Poiseuille)
      2300–4000  → transitional (linear interpolation)
      > 4000     → turbulent (Colebrook-White)
    """
    if Re < 2300.0:
        return friction_factor_laminar(Re)
    elif Re < 4000.0:
        f_lam = friction_factor_laminar(2300.0)
        f_turb = friction_factor_colebrook_white(4000.0, rel_roughness)
        t = (Re - 2300.0) / (4000.0 - 2300.0)
        return f_lam + t * (f_turb - f_lam)
    else:
        return friction_factor_colebrook_white(Re, rel_roughness)


def flow_regime(Re: float) -> str:
    """Classify flow regime by Reynolds number."""
    if Re < 2300:
        return "laminar"
    elif Re < 4000:
        return "transitional"
    else:
        return "turbulent"


# ─────────────────────────────────────────────────────────────────────────────
# Hydraulic Computations
# ─────────────────────────────────────────────────────────────────────────────

def reynolds_number(velocity: float, diameter: float, nu: float) -> float:
    """
    Re = V·D / ν

    Parameters
    ----------
    velocity : m/s
    diameter : m
    nu       : kinematic viscosity [m²/s]
    """
    if nu <= 0 or diameter <= 0:
        return 0.0
    return abs(velocity) * diameter / nu


def reynolds_number_power_law(velocity: float, diameter: float,
                               K: float, n: float, rho: float) -> float:
    """
    Generalised Reynolds number for Power-Law fluids (Metzner-Reed).

        Re_MR = ρ·V²⁻ⁿ·Dⁿ / [K · 8^(n-1) · ((3n+1)/(4n))^n]

    Reference: Metzner, A.B. & Reed, J.C. (1955) AIChE J., 1(4), 434-440.
    """
    if K <= 0 or n <= 0:
        return 0.0
    numerator = rho * (abs(velocity) ** (2.0 - n)) * (diameter ** n)
    denom = K * (8.0 ** (n - 1.0)) * ((3.0 * n + 1.0) / (4.0 * n)) ** n
    if denom <= 0:
        return 0.0
    return numerator / denom


def head_loss_darcy_weisbach(f: float, L: float, D: float,
                              V: float, g: float = GRAVITY) -> float:
    """
    Darcy-Weisbach head loss.

        h_f = f · (L/D) · V²/(2g)   [m]

    Parameters
    ----------
    f : Darcy friction factor [-]
    L : pipe length [m]
    D : inner diameter [m]
    V : mean velocity [m/s]
    g : gravitational acceleration [m/s²]
    """
    if D <= 0 or g <= 0:
        return 0.0
    return f * (L / D) * (V ** 2) / (2.0 * g)


def pressure_drop_darcy_weisbach(f: float, L: float, D: float,
                                   V: float, rho: float) -> float:
    """
    Darcy-Weisbach pressure drop.

        Δp = f · (L/D) · ρ·V²/2   [Pa]
    """
    if D <= 0 or rho <= 0:
        return 0.0
    return f * (L / D) * rho * (V ** 2) / 2.0


def minor_loss_head(K: float, V: float, g: float = GRAVITY) -> float:
    """
    Minor (local) loss head.

        h_m = K · V²/(2g)   [m]

    K values (typical):
        Sharp-edged entrance     : 0.5
        Re-entrant entrance      : 0.8–1.0
        Exit (fully open)        : 1.0
        Gate valve (fully open)  : 0.1
        Globe valve (fully open) : 6–10
        90° std. elbow           : 0.9
        45° elbow                : 0.4
        Tee (branch)             : 1.0
        Tee (straight)           : 0.2
        Sudden contraction (0.5) : 0.5
        Sudden expansion         : (1 - A₁/A₂)²
    """
    return K * (V ** 2) / (2.0 * g)


def valve_head_loss(Cv: float, Q: float, rho: float,
                    g: float = GRAVITY) -> float:
    """
    Valve head loss via Cv (US gpm/psi⁰·⁵) converted to SI.

        Δp = ρ·g·ΔH  where  Q = Cv · √(ΔP/SG)

    SI equivalent:  Kv = Cv / 1.1561  [m³/h / bar⁰·⁵]
    """
    if Cv <= 0 or Q == 0:
        return 0.0
    SG = rho / 1000.0   # specific gravity relative to water
    # Q in m³/s → convert to US gpm: 1 m³/s = 15850.3 gpm
    Q_gpm = abs(Q) * 15850.3
    dp_psi = (Q_gpm / Cv) ** 2 * SG
    dp_pa  = dp_psi * 6894.76    # psi → Pa
    return dp_pa / (rho * g)    # Pa → m head


def pump_head(pump_curve: List[Tuple[float, float]], Q: float) -> float:
    """
    Interpolate pump head from a Q–H characteristic curve.

    Parameters
    ----------
    pump_curve : list of (Q [m³/s], H [m]) tuples, sorted by Q
    Q          : flow rate [m³/s]

    Returns
    -------
    H : pump head [m]  (0 if Q outside curve range)
    """
    if not pump_curve or len(pump_curve) < 2:
        return 0.0
    Q_arr = [pt[0] for pt in pump_curve]
    H_arr = [pt[1] for pt in pump_curve]
    if Q < Q_arr[0] or Q > Q_arr[-1]:
        return 0.0
    f_interp = interpolate.interp1d(Q_arr, H_arr, kind='cubic',
                                     bounds_error=False, fill_value=0.0)
    return float(f_interp(Q))


def wave_speed_water_hammer(fluid: FluidProperties, pipe: PipeSegment,
                             anchor_condition: str = "both_ends") -> float:
    """
    Water-hammer wave speed considering pipe elasticity (Korteweg formula).

        a = c₀ / √(1 + (K/E)·(D/e)·ψ)

    where:
        c₀  = sound speed in bulk liquid = √(K/ρ)
        K   = bulk modulus of liquid [Pa]
        E   = Young's modulus of pipe wall [Pa]
        D   = inner diameter [m]
        e   = wall thickness [m]
        ψ   = constraint factor (anchorage condition)

    Constraint factors:
        Both ends anchored        : ψ = 1 - ν²
        One end free, one anchored: ψ = 1 - ν/2
        Expansion joints          : ψ = 1

    Reference: Streeter, V.L. & Wylie, E.B. (1978) Fluid Mechanics, McGraw-Hill.
    """
    c0 = math.sqrt(fluid.bulk_modulus / fluid.density)
    E  = pipe.young_modulus
    nu = pipe.poisson_ratio
    D  = pipe.diameter
    e  = pipe.thickness

    if E <= 0 or e <= 0:
        return c0

    psi_map = {
        "both_ends":           1.0 - nu**2,
        "one_end_free":        1.0 - nu / 2.0,
        "expansion_joints":    1.0,
        "thin_walled_anchored": 1.0 - nu**2,
    }
    psi = psi_map.get(anchor_condition, 1.0 - nu**2)

    denom = 1.0 + (fluid.bulk_modulus / E) * (D / e) * psi
    return c0 / math.sqrt(denom)


def joukowsky_pressure_rise(rho: float, a: float, dV: float) -> float:
    """
    Joukowsky (instant valve closure) pressure rise.

        ΔP = ρ · a · ΔV   [Pa]

    Reference: Joukowsky, N. (1898), translated ASME Trans. 1904.
    """
    return rho * a * abs(dV)


# ─────────────────────────────────────────────────────────────────────────────
# Heat Transfer Correlations
# ─────────────────────────────────────────────────────────────────────────────

def nusselt_dittus_boelter(Re: float, Pr: float, heating: bool = True) -> float:
    """
    Dittus-Boelter correlation for turbulent flow in smooth tubes.

        Nu = 0.023 · Re⁰·⁸ · Pr^n

    where n = 0.4 (fluid heating) or 0.3 (fluid cooling).

    Validity: Re > 10 000, 0.7 < Pr < 160, L/D > 10.

    Reference: Dittus, F.W. & Boelter, L.M.K. (1930),
               Univ. California Publ. Eng., 2, 443.
    """
    n = 0.4 if heating else 0.3
    if Re < 0 or Pr < 0:
        return 0.0
    return 0.023 * (Re ** 0.8) * (Pr ** n)


def nusselt_gnielinski(Re: float, Pr: float, f: float) -> float:
    """
    Gnielinski correlation (more accurate than Dittus-Boelter).

        Nu = (f/8)(Re - 1000)·Pr / [1 + 12.7·√(f/8)·(Pr^(2/3) - 1)]

    Validity: 3000 < Re < 5×10⁶, 0.5 < Pr < 2000, L/D > 10.

    Reference: Gnielinski, V. (1976) Int. Chem. Eng., 16, 359-368.
    """
    if Re <= 1000 or Pr <= 0 or f <= 0:
        return 0.0
    f8 = f / 8.0
    num = f8 * (Re - 1000.0) * Pr
    den = 1.0 + 12.7 * math.sqrt(f8) * (Pr ** (2.0 / 3.0) - 1.0)
    if den <= 0:
        return 0.0
    return num / den


def nusselt_sieder_tate(Re: float, Pr: float, mu_ratio: float = 1.0) -> float:
    """
    Sieder-Tate correlation with viscosity correction.

        Nu = 0.027 · Re⁰·⁸ · Pr^(1/3) · (μ/μ_w)^0.14

    Useful when wall temperature differs significantly from bulk.

    Reference: Sieder, E.N. & Tate, G.E. (1936) Ind. Eng. Chem., 28, 1429.
    """
    if Re <= 0 or Pr <= 0:
        return 0.0
    return 0.027 * (Re ** 0.8) * (Pr ** (1.0 / 3.0)) * (mu_ratio ** 0.14)


def nusselt_laminar_pipe(Re: float, Pr: float, L_D: float) -> float:
    """
    Hausen (1943) correlation for laminar pipe flow.

        Nu = 3.66 + 0.0668·(Re·Pr·D/L) / [1 + 0.04·(Re·Pr·D/L)^(2/3)]

    Valid for Re < 2300, L/D > 10.
    """
    Gz = Re * Pr / L_D  # Graetz number
    return 3.66 + 0.0668 * Gz / (1.0 + 0.04 * Gz ** (2.0 / 3.0))


def heat_transfer_coefficient(Nu: float, lambda_f: float, D: float) -> float:
    """
    h = Nu · λ / D   [W/(m²·K)]
    """
    if D <= 0:
        return 0.0
    return Nu * lambda_f / D


def log_mean_temperature_difference(T_in: float, T_out: float,
                                     T_wall: float) -> float:
    """
    LMTD for a pipe with uniform wall temperature.

        ΔTLM = (ΔT₁ - ΔT₂) / ln(ΔT₁/ΔT₂)

    where ΔT₁ = T_wall - T_in, ΔT₂ = T_wall - T_out.
    """
    dT1 = T_wall - T_in
    dT2 = T_wall - T_out
    if dT1 == dT2:
        return dT1
    if dT1 * dT2 <= 0:
        return (dT1 + dT2) / 2.0  # fallback
    return (dT1 - dT2) / math.log(dT1 / dT2)


def pipe_outlet_temperature(T_in: float, T_wall: float,
                              h: float, perimeter: float,
                              length: float, mass_flow: float,
                              cp: float) -> float:
    """
    Outlet temperature for uniform wall temperature boundary condition.

        T_out = T_w - (T_w - T_in) · exp(-h·P·L / (ṁ·cp))

    Parameters
    ----------
    T_in     : inlet fluid temperature [K]
    T_wall   : wall temperature [K]
    h        : convective heat transfer coefficient [W/(m²·K)]
    perimeter: pipe inner perimeter [m]
    length   : pipe length [m]
    mass_flow: mass flow rate [kg/s]
    cp       : specific heat [J/(kg·K)]
    """
    if mass_flow == 0 or cp == 0:
        return T_in
    NTU = h * perimeter * length / (mass_flow * cp)
    return T_wall - (T_wall - T_in) * math.exp(-NTU)


# ─────────────────────────────────────────────────────────────────────────────
# Compressible Flow
# ─────────────────────────────────────────────────────────────────────────────

def mach_number(V: float, c: float) -> float:
    """Ma = V/c"""
    return abs(V) / c if c > 0 else 0.0


def isentropic_stagnation_pressure(p_static: float, Ma: float, gamma: float) -> float:
    """
    p₀/p = (1 + (γ-1)/2 · Ma²)^(γ/(γ-1))
    """
    return p_static * (1.0 + (gamma - 1.0) / 2.0 * Ma**2) ** (gamma / (gamma - 1.0))


def critical_pressure_ratio(gamma: float) -> float:
    """
    Choked flow critical pressure ratio.
        p*/p₀ = (2/(γ+1))^(γ/(γ-1))
    """
    return (2.0 / (gamma + 1.0)) ** (gamma / (gamma - 1.0))


def fanno_line_friction(Ma1: float, Ma2: float, gamma: float) -> float:
    """
    Fanno-line parameter: fL*/D  between Ma1 and Ma2.

        fL/D = (1-Ma²)/(γ·Ma²) + (γ+1)/(2γ)·ln[(γ+1)·Ma²/(2+(γ-1)·Ma²)]
    """
    def fanno_func(Ma):
        t1 = (1.0 - Ma**2) / (gamma * Ma**2)
        t2 = ((gamma + 1.0) / (2.0 * gamma)) * math.log(
            (gamma + 1.0) * Ma**2 / (2.0 + (gamma - 1.0) * Ma**2)
        )
        return t1 + t2

    return fanno_func(Ma1) - fanno_func(Ma2)


# ─────────────────────────────────────────────────────────────────────────────
# Two-Phase Flow  (Lockhart-Martinelli)
# ─────────────────────────────────────────────────────────────────────────────

def lockhart_martinelli_parameter(dp_l: float, dp_g: float) -> float:
    """
    Martinelli parameter X.

        X = √(dP/dL_L / dP/dL_G)

    where subscripts L = liquid-only, G = gas-only.
    """
    if dp_g <= 0:
        return float('inf')
    return math.sqrt(dp_l / dp_g)


def lockhart_martinelli_multiplier_liquid(X: float, flow_regime: str = "turbulent_turbulent") -> float:
    """
    Two-phase multiplier for liquid phase φ²_L.

    Chisholm (1967) correlation:
        φ²_L = 1 + C/X + 1/X²

    C values:
        tt (turb-turb):   C = 20
        tv (turb-visc):   C = 12
        vt (visc-turb):   C = 10
        vv (visc-visc):   C = 5

    Reference: Chisholm, D. (1967) Int. J. Heat Mass Transfer, 10, 1767.
    """
    C_map = {
        "turbulent_turbulent": 20,
        "turbulent_viscous":   12,
        "viscous_turbulent":   10,
        "viscous_viscous":     5,
    }
    C = C_map.get(flow_regime, 20)
    return 1.0 + C / X + 1.0 / X**2


def void_fraction_homogeneous(x: float, rho_l: float, rho_g: float) -> float:
    """
    Homogeneous void fraction (equal velocity two-phase).

        α = x·ρ_l / (x·ρ_l + (1-x)·ρ_g)  ... wait, this is wrong.

    Correct formula:
        α = 1 / (1 + ((1-x)/x) · (ρ_g/ρ_l))

    Parameters
    ----------
    x    : quality (vapour mass fraction)  [0–1]
    rho_l: liquid density [kg/m³]
    rho_g: vapour density [kg/m³]
    """
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0
    slip_ratio = 1.0  # S = 1 for homogeneous
    denom = 1.0 + ((1.0 - x) / x) * (rho_g / rho_l) * slip_ratio
    return 1.0 / denom


def friedel_two_phase_multiplier(Re_L: float, Re_G: float,
                                   Fr: float, We: float,
                                   rho_l: float, rho_g: float,
                                   mu_l: float, mu_g: float,
                                   f_L: float, f_G: float) -> float:
    """
    Friedel (1979) two-phase multiplier for horizontal/vertical upflow.

        φ²_LO = E + 3.24·F·H / (Fr^0.045 · We^0.035)

    where:
        E = (1-x)² + x²·(ρ_L·f_G)/(ρ_G·f_L)
        F = x^0.78·(1-x)^0.224
        H = (ρ_L/ρ_G)^0.91·(μ_G/μ_L)^0.19·(1 - μ_G/μ_L)^0.7

    Reference: Friedel, L. (1979) Eur. Two-Phase Flow Group Mtg., Ispra, Italy.
    (Only a simplified version implemented here — x is assumed known externally)
    """
    # Placeholder using simplified Chisholm for now
    # Full Friedel requires void fraction and quality data
    if rho_g <= 0:
        return 1.0
    E = (rho_l * f_G) / (rho_g * f_L)
    return E


# ─────────────────────────────────────────────────────────────────────────────
# Cavitation
# ─────────────────────────────────────────────────────────────────────────────

def cavitation_number(p: float, p_v: float, rho: float, V: float) -> float:
    """
    Cavitation (Thoma) number.

        σ = (p - p_v) / (½·ρ·V²)

    Cavitation occurs when σ < σ_critical (typically ~0.3–2.0 for valves).

    Parameters
    ----------
    p   : local pressure [Pa]
    p_v : vapour pressure [Pa]
    rho : fluid density [kg/m³]
    V   : local velocity [m/s]
    """
    dynamic_p = 0.5 * rho * V**2
    if dynamic_p <= 0:
        return float('inf')
    return (p - p_v) / dynamic_p


def npsh_available(p_s: float, p_v: float, rho: float,
                   V_s: float, z_s: float,
                   g: float = GRAVITY) -> float:
    """
    Net Positive Suction Head Available (NPSHA).

        NPSHA = (p_s - p_v)/(ρg) + V_s²/(2g) + z_s

    Parameters
    ----------
    p_s : suction pressure [Pa absolute]
    p_v : vapour pressure [Pa]
    rho : density [kg/m³]
    V_s : suction velocity [m/s]
    z_s : suction elevation above datum [m]
    """
    return ((p_s - p_v) / (rho * g)
            + V_s**2 / (2.0 * g)
            + z_s)


# ─────────────────────────────────────────────────────────────────────────────
# k-epsilon Turbulence Model (Pipe Cross-section Averaged)
# ─────────────────────────────────────────────────────────────────────────────

class KEpsilonModel:
    """
    Simplified k-ε turbulence model for pipe flow post-processing.

    Provides:
        - Turbulent kinetic energy k  [m²/s²]
        - Turbulent dissipation rate ε  [m²/s³]
        - Turbulent viscosity μ_t  [Pa·s]
        - Turbulent Prandtl number Pr_t  [-]
        - Wall function y+ and u+

    Standard k-ε constants (Launder & Spalding, 1974):
        C_μ   = 0.09
        C_1ε  = 1.44
        C_2ε  = 1.92
        σ_k   = 1.0    (Prandtl number for k)
        σ_ε   = 1.3    (Prandtl number for ε)
    """
    C_mu  = 0.09
    C_1e  = 1.44
    C_2e  = 1.92
    sigma_k = 1.0
    sigma_e = 1.3
    kappa   = 0.41     # von Kármán constant
    E_const = 9.793    # log-law constant

    def __init__(self, fluid: FluidProperties):
        self.fluid = fluid

    def turbulent_intensity(self, Re: float) -> float:
        """
        Pipe turbulent intensity (approximate).

            I = 0.16 · Re^(-1/8)

        Reference: ANSYS Fluent User's Guide (section on turbulence).
        """
        return 0.16 * Re ** (-0.125)

    def turbulent_kinetic_energy(self, V: float, Re: float) -> float:
        """
        k = (3/2) · (V·I)²   [m²/s²]
        """
        I = self.turbulent_intensity(Re)
        return 1.5 * (V * I) ** 2

    def turbulent_length_scale(self, D: float) -> float:
        """
        Turbulent length scale for fully developed pipe flow.

            l_t = 0.07 · D
        """
        return 0.07 * D

    def turbulent_dissipation(self, k: float, l_t: float) -> float:
        """
        ε = C_μ^(3/4) · k^(3/2) / l_t   [m²/s³]
        """
        return (self.C_mu ** 0.75) * (k ** 1.5) / l_t

    def turbulent_viscosity(self, rho: float, k: float, epsilon: float) -> float:
        """
        μ_t = ρ · C_μ · k² / ε   [Pa·s]
        """
        if epsilon <= 0:
            return 0.0
        return rho * self.C_mu * k**2 / epsilon

    def wall_shear_stress(self, f: float, rho: float, V: float) -> float:
        """
        τ_w = f/8 · ρ·V²   [Pa]
        """
        return (f / 8.0) * rho * V**2

    def friction_velocity(self, tau_w: float, rho: float) -> float:
        """
        u_τ = √(τ_w/ρ)   [m/s]
        """
        return math.sqrt(abs(tau_w) / rho)

    def y_plus(self, y: float, u_tau: float, nu: float) -> float:
        """
        y⁺ = y · u_τ / ν   [-]
        """
        return y * u_tau / nu

    def u_plus_log_law(self, y_plus: float) -> float:
        """
        u⁺ = (1/κ) · ln(E·y⁺)   for y⁺ > 30 (log-law region)
        u⁺ = y⁺                  for y⁺ < 5  (viscous sublayer)
        5 < y⁺ < 30              (buffer layer, linear interpolation)
        """
        if y_plus <= 5.0:
            return y_plus
        elif y_plus > 30.0:
            return (1.0 / self.kappa) * math.log(self.E_const * y_plus)
        else:
            t = (y_plus - 5.0) / 25.0
            return (1.0 - t) * y_plus + t * ((1.0 / self.kappa) * math.log(self.E_const * 30.0))

    def full_report(self, pipe: PipeSegment, fluid: FluidProperties) -> Dict:
        """Compute all turbulence quantities for a pipe segment."""
        V = pipe.velocity
        D = pipe.diameter
        Re = pipe.reynolds_number
        f  = pipe.friction_factor
        rho = fluid.density
        nu  = fluid.kinematic_viscosity

        k    = self.turbulent_kinetic_energy(V, Re)
        lt   = self.turbulent_length_scale(D)
        eps  = self.turbulent_dissipation(k, lt)
        mu_t = self.turbulent_viscosity(rho, k, eps)
        tau_w = self.wall_shear_stress(f, rho, V)
        u_tau = self.friction_velocity(tau_w, rho)

        # y+ at first cell (assume ~1% of radius from wall)
        y_wall = 0.01 * D / 2.0
        yp = self.y_plus(y_wall, u_tau, nu)

        I   = self.turbulent_intensity(Re)
        Pr_t = 0.85  # Turbulent Prandtl number (near 0.85–0.9 for standard k-ε)

        return {
            "turbulent_kinetic_energy_k": k,
            "turbulent_dissipation_epsilon": eps,
            "turbulent_viscosity_mu_t": mu_t,
            "turbulent_intensity_I": I,
            "turbulent_length_scale_lt": lt,
            "wall_shear_stress_tau_w": tau_w,
            "friction_velocity_u_tau": u_tau,
            "y_plus_at_wall_cell": yp,
            "turbulent_prandtl_Pr_t": Pr_t,
            "effective_viscosity": fluid.dynamic_viscosity + mu_t,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Pipe Hydraulics Helper
# ─────────────────────────────────────────────────────────────────────────────

class PipeHydraulics:
    """
    Computes all hydraulic quantities for a single pipe segment.
    Called by the network solver for each pipe at each iteration.
    """

    def __init__(self, fluid: FluidProperties, config: SolverConfig):
        self.fluid  = fluid
        self.config = config
        self.ke_model = KEpsilonModel(fluid)

    def compute(self, pipe: PipeSegment, Q: float) -> PipeSegment:
        """
        Full hydraulic computation for a pipe segment given flow rate Q [m³/s].

        Updates all fields on the PipeSegment in place and returns it.
        """
        f = self.fluid
        g = GRAVITY

        # --- Geometry ---
        A  = pipe.area
        D  = pipe.diameter
        L  = pipe.length

        # --- Velocity ---
        V  = Q / A if A > 0 else 0.0
        pipe.velocity = V

        # --- Wall shear rate (for non-Newtonian) ---
        gamma_dot = 8.0 * V / D  if D > 0 else 0.0   # apparent shear rate [1/s]

        # --- Effective viscosity ---
        mu_eff = f.effective_viscosity(gamma_dot)
        nu_eff = mu_eff / f.density

        # --- Reynolds number ---
        if f.rheology_model == "newtonian":
            Re = reynolds_number(V, D, nu_eff)
        else:
            Re = reynolds_number_power_law(
                V, D, f.consistency_index, f.flow_behaviour_index, f.density
            ) if f.rheology_model == "power_law" else reynolds_number(V, D, nu_eff)
        pipe.reynolds_number = Re

        # --- Flow regime ---
        pipe.flow_regime = flow_regime(Re)

        # --- Friction factor ---
        eps_D = pipe.relative_roughness()
        if self.config.turbulence_model == "laminar":
            f_darcy = friction_factor_laminar(Re) if Re > 0 else 0.064
        else:
            f_darcy = friction_factor_moody(Re, eps_D)
        pipe.friction_factor = f_darcy

        # --- Major (friction) losses ---
        h_f = head_loss_darcy_weisbach(f_darcy, L, D, V, g)

        # --- Minor losses ---
        h_m = minor_loss_head(pipe.fittings_K, V, g)

        # --- Valve loss ---
        h_valve = 0.0
        if pipe.is_valve:
            # Valve K from opening fraction (simplified linear approximation)
            K_valve = (1.0 / pipe.valve_open_frac**2 - 1.0) * 0.5 if pipe.valve_open_frac > 0 else 1e9
            h_valve = minor_loss_head(K_valve, V, g)

        # --- Pump head ---
        h_pump = 0.0
        if pipe.is_pump and pipe.pump_curve:
            h_pump = pump_head(pipe.pump_curve, abs(Q))

        # --- Total head loss (sign: positive = loss) ---
        delta_z = pipe.elevation_change()
        h_total  = h_f + h_m + h_valve + delta_z - h_pump
        pipe.head_loss = h_total
        pipe.pressure_drop = h_total * f.density * g   # Pa

        # --- Wall shear stress ---
        pipe.wall_shear_stress = (f_darcy / 8.0) * f.density * V**2

        # --- Mach number (compressible) ---
        if f.is_compressible:
            c = f.sound_speed()
            pipe.mach_number = mach_number(V, c)

        # --- Cavitation ---
        if self.config.check_cavitation and V > 0:
            # Approximate local pressure at pipe midpoint (rough estimate)
            p_mid = ATM_PRESSURE - pipe.pressure_drop / 2.0
            pipe.cavitation_number = cavitation_number(p_mid, f.vapour_pressure, f.density, V)

        # --- Heat transfer ---
        if self.config.solve_heat and pipe.heat_flux != 0.0:
            Pr = f.prandtl_number
            L_D = L / D if D > 0 else 10.0

            if Re > 10000:
                Nu = nusselt_gnielinski(Re, Pr, f_darcy)
            elif Re > 2300:
                Nu = nusselt_dittus_boelter(Re, Pr, pipe.heat_flux > 0)
            else:
                Nu = nusselt_laminar_pipe(Re, Pr, L_D)

            h_conv = heat_transfer_coefficient(Nu, f.thermal_conductivity, D)
            pipe.nusselt_number      = Nu
            pipe.heat_transfer_coeff = h_conv

            mdot = abs(Q) * f.density
            T_wall = 293.15 + pipe.heat_flux / h_conv if h_conv > 0 else 293.15
            T_in   = f.temperature
            pipe.temperature_out = pipe_outlet_temperature(
                T_in, T_wall, h_conv, pipe.perimeter, L, mdot, f.specific_heat
            )

        return pipe

    def resistance_coefficient(self, pipe: PipeSegment) -> float:
        """
        Pipe resistance coefficient r such that h_f = r · Q · |Q|.

        For Darcy-Weisbach:
            r = f·L / (D·2g·A²)   [s²/m⁵]
        """
        f_darcy = pipe.friction_factor
        L = pipe.length
        D = pipe.diameter
        A = pipe.area
        g = GRAVITY
        if A <= 0 or D <= 0:
            return 0.0
        return f_darcy * L / (D * 2.0 * g * A**2)


# ─────────────────────────────────────────────────────────────────────────────
# Hardy-Cross Network Solver
# ─────────────────────────────────────────────────────────────────────────────

class HardyCrossSolver:
    """
    Hardy-Cross iterative method for steady-state pipe network analysis.

    Algorithm
    ---------
    1. Assign initial flow estimates satisfying continuity at each node.
    2. For each loop, compute correction:

           ΔQ = -Σ(r·Q·|Q|) / Σ(2·r·|Q|)

       where r is the pipe resistance coefficient.
    3. Update all pipe flows in the loop: Q ← Q + ΔQ
    4. Repeat until |ΔQ| < tolerance for all loops.

    Topology
    --------
    Network must be provided as lists of nodes, pipes, and loops.
    Loops are identified by the loop-finding algorithm (cycle basis of graph).

    Reference: Cross, H. (1936) UIUC Engineering Experiment Station,
               Bulletin 286, "Analysis of flow in networks of conduits or conductors."
    """

    def __init__(self, fluid: FluidProperties, config: SolverConfig):
        self.fluid    = fluid
        self.config   = config
        self.hydraulics = PipeHydraulics(fluid, config)
        self.log: List[str] = []

    def _log(self, msg: str):
        self.log.append(msg)
        if self.config.verbose:
            logger.info(msg)

    def solve(self,
              nodes: List[NetworkNode],
              pipes: List[PipeSegment],
              loops: List[List[str]]) -> SolverResult:
        """
        Run the Hardy-Cross iterative solver.

        Parameters
        ----------
        nodes : list of NetworkNode
        pipes : list of PipeSegment
        loops : list of lists of pipe IDs forming each independent loop

        Returns
        -------
        SolverResult
        """
        self.log = []
        warnings_list = []

        self._log("Hardy-Cross solver started")
        self._log(f"  Nodes: {len(nodes)}, Pipes: {len(pipes)}, Loops: {len(loops)}")

        # Build lookup dict
        pipe_map: Dict[str, PipeSegment] = {p.id: p for p in pipes}
        node_map: Dict[str, NetworkNode] = {n.id: n for n in nodes}

        # Initial hydraulic computation for all pipes
        for pipe in pipes:
            self.hydraulics.compute(pipe, pipe.flow_rate)

        tol  = self.config.tolerance
        relax = self.config.relaxation
        converged = False

        for iteration in range(1, self.config.max_iterations + 1):
            max_correction = 0.0

            for loop in loops:
                if not loop:
                    continue
                # Compute loop correction
                sum_hf  = 0.0   # Σ(r·Q·|Q|)   with sign
                sum_dhf = 0.0   # Σ(2·r·|Q|)   always positive

                for pipe_id in loop:
                    if pipe_id not in pipe_map:
                        continue
                    p = pipe_map[pipe_id]
                    Q = p.flow_rate
                    r = self.hydraulics.resistance_coefficient(p)
                    h = r * Q * abs(Q)
                    sum_hf  += h
                    sum_dhf += 2.0 * r * abs(Q)

                if abs(sum_dhf) < 1e-30:
                    continue

                dQ = -relax * sum_hf / sum_dhf
                max_correction = max(max_correction, abs(dQ))

                # Apply correction to all pipes in loop
                for pipe_id in loop:
                    if pipe_id in pipe_map:
                        pipe_map[pipe_id].flow_rate += dQ

            # Recompute hydraulics after flow update
            for pipe in pipes:
                self.hydraulics.compute(pipe, pipe.flow_rate)

            self._log(f"  Iter {iteration:4d}  |ΔQ|_max = {max_correction:.4e} m³/s")

            if max_correction < tol:
                converged = True
                self._log(f"  ✅ Converged at iteration {iteration}")
                break

        if not converged:
            warnings_list.append(
                f"Hardy-Cross did not converge in {self.config.max_iterations} iterations. "
                f"Final |ΔQ| = {max_correction:.4e}"
            )
            self._log("  ⚠️  Did not converge")

        # Compute node pressures
        node_pressures = self._compute_node_pressures(nodes, pipes, pipe_map, node_map)

        # Assemble results
        pipe_results = []
        for p in pipes:
            turbulence = {}
            if self.config.turbulence_model == "k_epsilon":
                turbulence = self.hydraulics.ke_model.full_report(p, self.fluid)
            pipe_results.append({
                "id":              p.id,
                "flow_rate":       p.flow_rate,
                "velocity":        p.velocity,
                "reynolds_number": p.reynolds_number,
                "friction_factor": p.friction_factor,
                "head_loss":       p.head_loss,
                "pressure_drop":   p.pressure_drop,
                "wall_shear_stress": p.wall_shear_stress,
                "flow_regime":     p.flow_regime,
                "mach_number":     p.mach_number,
                "cavitation_number": p.cavitation_number,
                "nusselt_number":  p.nusselt_number,
                "heat_transfer_coeff": p.heat_transfer_coeff,
                "temperature_out": p.temperature_out,
                "turbulence":      turbulence,
            })

        node_results = []
        for n in nodes:
            node_results.append({
                "id":           n.id,
                "elevation":    n.elevation,
                "pressure":     node_pressures.get(n.id, 0.0),
                "pressure_head": node_pressures.get(n.id, 0.0) / (self.fluid.density * GRAVITY),
                "temperature":  n.temperature,
            })

        # Network statistics
        total_pipe_length = sum(p.length for p in pipes)
        total_head_loss   = sum(abs(p.head_loss) for p in pipes)
        max_velocity      = max((abs(p.velocity) for p in pipes), default=0.0)
        max_Re            = max((p.reynolds_number for p in pipes), default=0.0)

        network_stats = {
            "total_pipe_length_m":    total_pipe_length,
            "total_head_loss_m":      total_head_loss,
            "max_velocity_ms":        max_velocity,
            "max_reynolds_number":    max_Re,
            "converged":              converged,
            "iterations":             iteration,
            "final_residual":         max_correction,
            "solver_method":          "Hardy-Cross",
        }

        return SolverResult(
            converged=converged,
            iterations=iteration,
            residual=max_correction,
            pipe_results=pipe_results,
            node_results=node_results,
            network_stats=network_stats,
            warnings=warnings_list,
            solver_log=self.log,
        )

    def _compute_node_pressures(self,
                                 nodes: List[NetworkNode],
                                 pipes: List[PipeSegment],
                                 pipe_map: Dict,
                                 node_map: Dict) -> Dict[str, float]:
        """
        Traverse the network to compute nodal pressures from fixed-head boundaries.
        Uses BFS from fixed-head nodes.
        """
        pressures: Dict[str, float] = {}
        g = GRAVITY
        rho = self.fluid.density

        # Set boundary conditions
        for n in nodes:
            if n.is_reservoir:
                pressures[n.id] = n.fixed_head * rho * g
            elif n.is_pressure_bc:
                pressures[n.id] = n.fixed_pressure

        # BFS from known nodes
        from collections import deque
        queue = deque(n.id for n in nodes if n.id in pressures)
        adjacency: Dict[str, List[PipeSegment]] = {n.id: [] for n in nodes}
        for p in pipes:
            adjacency[p.node_start].append(p)
            adjacency[p.node_end].append(p)

        while queue:
            node_id = queue.popleft()
            p_known = pressures[node_id]
            for pipe in adjacency[node_id]:
                # Determine direction of pressure drop
                if pipe.node_start == node_id:
                    other_id = pipe.node_end
                    dp = pipe.pressure_drop   # positive = start→end loss
                else:
                    other_id = pipe.node_start
                    dp = -pipe.pressure_drop

                if other_id not in pressures:
                    pressures[other_id] = p_known - dp
                    queue.append(other_id)

        return pressures


# ─────────────────────────────────────────────────────────────────────────────
# Newton-Raphson Network Solver
# ─────────────────────────────────────────────────────────────────────────────

class NewtonRaphsonSolver:
    """
    Newton-Raphson method for pipe network analysis.

    Formulates the system as:
        F(x) = [continuity equations; energy equations] = 0

    State vector x: nodal heads H at all non-fixed nodes.
    Pipe flows are computed from head differences via:
        Q_ij = sign(H_i - H_j) · √(|H_i - H_j| / r_ij)

    Jacobian is computed analytically.

    Convergence: quadratic (O(2)) near solution — much faster than Hardy-Cross
    for large or ill-conditioned networks.

    Reference: Todini, E. & Pilati, S. (1988) "A gradient algorithm for the
               analysis of pipe networks", in Computer Applications in Water Supply,
               Vol. 1, pp. 1-20.
    """

    def __init__(self, fluid: FluidProperties, config: SolverConfig):
        self.fluid     = fluid
        self.config    = config
        self.hydraulics = PipeHydraulics(fluid, config)
        self.log: List[str] = []

    def _log(self, msg: str):
        self.log.append(msg)
        if self.config.verbose:
            logger.info(msg)

    def solve(self,
              nodes: List[NetworkNode],
              pipes: List[PipeSegment]) -> SolverResult:
        """
        Newton-Raphson solver for pipe network.

        Parameters
        ----------
        nodes : list of NetworkNode (with fixed-head BCs)
        pipes : list of PipeSegment

        Returns
        -------
        SolverResult
        """
        self.log = []
        warnings_list = []
        g   = GRAVITY
        rho = self.fluid.density

        self._log("Newton-Raphson solver started")

        # Identify free nodes (heads to solve for)
        fixed_ids = {n.id for n in nodes if n.is_reservoir or n.is_pressure_bc}
        free_nodes = [n for n in nodes if n.id not in fixed_ids]
        node_map   = {n.id: n for n in nodes}
        N_free     = len(free_nodes)
        N_pipes    = len(pipes)

        if N_free == 0:
            self._log("  All nodes are fixed — nothing to solve")
            return SolverResult(True, 0, 0.0, [], [], {}, [], self.log)

        # Initial head values
        def get_fixed_head(node: NetworkNode) -> float:
            if node.is_reservoir:
                return node.fixed_head
            elif node.is_pressure_bc:
                return node.fixed_pressure / (rho * g) + node.elevation
            return 0.0

        # Index maps
        free_idx = {n.id: i for i, n in enumerate(free_nodes)}

        H = np.array([
            (get_fixed_head(n) if n.id in fixed_ids else
             (node_map[n.id].pressure / (rho * g) + node_map[n.id].elevation + 10.0))
            for n in free_nodes
        ])

        for n in nodes:
            if n.id in fixed_ids:
                node_map[n.id]._fixed_head_val = get_fixed_head(n)

        def get_head(node_id: str, H_vec: NDArray) -> float:
            if node_id in fixed_ids:
                n = node_map[node_id]
                return get_fixed_head(n)
            return H_vec[free_idx[node_id]]

        def compute_flows(H_vec: NDArray) -> Dict[str, float]:
            flows = {}
            for pipe in pipes:
                H_s = get_head(pipe.node_start, H_vec)
                H_e = get_head(pipe.node_end,   H_vec)
                dH  = H_s - H_e
                # r from Darcy-Weisbach: Q = sign(dH)·√(|dH|/r)  where r = fL/(D·2g·A²)
                r = self._resistance(pipe)
                if r <= 0:
                    flows[pipe.id] = 0.0
                    continue
                Q = math.copysign(math.sqrt(abs(dH) / r), dH)
                flows[pipe.id] = Q
            return flows

        def residuals(H_vec: NDArray) -> NDArray:
            flows = compute_flows(H_vec)
            F = np.zeros(N_free)
            for i, node in enumerate(free_nodes):
                # Continuity: Σ Q_in - Σ Q_out = external_demand
                net = -node.external_flow   # demand positive
                for pipe in pipes:
                    Q = flows[pipe.id]
                    if pipe.node_end   == node.id:
                        net += Q
                    elif pipe.node_start == node.id:
                        net -= Q
                F[i] = net
            return F

        def jacobian(H_vec: NDArray) -> NDArray:
            flows = compute_flows(H_vec)
            J = np.zeros((N_free, N_free))
            for i, node in enumerate(free_nodes):
                for pipe in pipes:
                    if node.id not in (pipe.node_start, pipe.node_end):
                        continue
                    r  = self._resistance(pipe)
                    H_s = get_head(pipe.node_start, H_vec)
                    H_e = get_head(pipe.node_end,   H_vec)
                    dH  = H_s - H_e
                    if r <= 0 or abs(dH) < 1e-30:
                        continue
                    # ∂Q/∂H = 1/(2r·|Q|)  (from Q² = dH/r)
                    Q = flows[pipe.id]
                    dQdH = 0.5 / math.sqrt(r * abs(dH)) if abs(dH) > 0 else 0.0

                    # Which node is fixed and which is free?
                    if pipe.node_start == node.id and pipe.node_start not in fixed_ids:
                        j = free_idx[pipe.node_start]
                        J[i, j] -= dQdH
                    if pipe.node_end == node.id and pipe.node_end not in fixed_ids:
                        j = free_idx[pipe.node_end]
                        J[i, j] -= dQdH
                    if pipe.node_start not in fixed_ids and pipe.node_end == node.id:
                        j = free_idx[pipe.node_start]
                        J[i, j] += dQdH
                    if pipe.node_end not in fixed_ids and pipe.node_start == node.id:
                        j = free_idx[pipe.node_end]
                        J[i, j] += dQdH
            return J

        # Newton-Raphson iteration
        converged = False
        residual  = float('inf')
        iteration = 0

        for iteration in range(1, self.config.max_iterations + 1):
            F = residuals(H)
            residual = float(np.linalg.norm(F, ord=np.inf))
            self._log(f"  Iter {iteration:4d}  ||F||_∞ = {residual:.4e}")

            if residual < self.config.tolerance:
                converged = True
                self._log(f"  ✅ Converged at iteration {iteration}")
                break

            J = jacobian(H)

            # Solve J·dH = -F
            try:
                dH = np.linalg.solve(J, -F)
            except np.linalg.LinAlgError:
                dH, *_ = np.linalg.lstsq(J, -F, rcond=None)
                warnings_list.append("Singular Jacobian — using least-squares step")

            H += self.config.relaxation * dH

        if not converged:
            warnings_list.append(
                f"Newton-Raphson did not converge in {self.config.max_iterations} "
                f"iterations. Final ||F||_∞ = {residual:.4e}"
            )

        # Finalise: update pipe flows with converged heads
        final_flows = compute_flows(H)
        for pipe in pipes:
            Q = final_flows.get(pipe.id, 0.0)
            pipe.flow_rate = Q
            self.hydraulics.compute(pipe, Q)

        # Nodal pressures
        node_pressures = {}
        for i, node in enumerate(free_nodes):
            head = H[i]
            node.pressure = (head - node.elevation) * rho * g
            node_pressures[node.id] = node.pressure
        for n in nodes:
            if n.id in fixed_ids:
                n.pressure = get_fixed_head(n) * rho * g - n.elevation * rho * g
                node_pressures[n.id] = n.pressure

        # Assemble results
        pipe_results = self._build_pipe_results(pipes)
        node_results = self._build_node_results(nodes, node_pressures, rho, g)

        network_stats = {
            "solver_method":          "Newton-Raphson",
            "converged":              converged,
            "iterations":             iteration,
            "final_residual":         residual,
            "total_pipe_length_m":    sum(p.length for p in pipes),
            "total_head_loss_m":      sum(abs(p.head_loss) for p in pipes),
            "max_velocity_ms":        max((abs(p.velocity) for p in pipes), default=0.0),
            "max_reynolds_number":    max((p.reynolds_number for p in pipes), default=0.0),
        }

        return SolverResult(
            converged=converged,
            iterations=iteration,
            residual=residual,
            pipe_results=pipe_results,
            node_results=node_results,
            network_stats=network_stats,
            warnings=warnings_list,
            solver_log=self.log,
        )

    def _resistance(self, pipe: PipeSegment) -> float:
        """r = fL/(D·2g·A²)"""
        return self.hydraulics.resistance_coefficient(pipe)

    def _build_pipe_results(self, pipes: List[PipeSegment]) -> List[Dict]:
        results = []
        for p in pipes:
            turbulence = {}
            if self.config.turbulence_model == "k_epsilon":
                turbulence = self.hydraulics.ke_model.full_report(p, self.fluid)
            results.append({
                "id":                p.id,
                "flow_rate":         p.flow_rate,
                "velocity":          p.velocity,
                "reynolds_number":   p.reynolds_number,
                "friction_factor":   p.friction_factor,
                "head_loss":         p.head_loss,
                "pressure_drop":     p.pressure_drop,
                "wall_shear_stress": p.wall_shear_stress,
                "flow_regime":       p.flow_regime,
                "mach_number":       p.mach_number,
                "cavitation_number": p.cavitation_number,
                "nusselt_number":    p.nusselt_number,
                "heat_transfer_coeff": p.heat_transfer_coeff,
                "temperature_out":   p.temperature_out,
                "turbulence":        turbulence,
            })
        return results

    def _build_node_results(self, nodes: List[NetworkNode],
                             node_pressures: Dict[str, float],
                             rho: float, g: float) -> List[Dict]:
        return [{
            "id":           n.id,
            "elevation":    n.elevation,
            "pressure":     node_pressures.get(n.id, 0.0),
            "pressure_head": node_pressures.get(n.id, 0.0) / (rho * g),
            "temperature":  n.temperature,
        } for n in nodes]


# ─────────────────────────────────────────────────────────────────────────────
# Method of Characteristics – Water Hammer Transient Solver
# ─────────────────────────────────────────────────────────────────────────────

class WaterHammerSolver:
    """
    Method of Characteristics (MOC) for water-hammer analysis.

    Governing equations (1D, quasi-steady friction):
        ∂H/∂t + (a²/g)·∂V/∂x = 0                         (continuity)
        ∂V/∂t + g·∂H/∂x + (f/2D)·V·|V| = 0              (momentum)

    Characteristic lines:
        C⁺: dH/dt + (a/g)·dV/dt + (fa/2Dg)·V·|V| = 0    along dx/dt = +a
        C⁻: dH/dt - (a/g)·dV/dt - (fa/2Dg)·V·|V| = 0    along dx/dt = -a

    Explicit finite difference on the characteristic grid.

    Reference: Streeter, V.L. & Wylie, E.B. (1978) Fluid Mechanics, 6th ed.
               Chaudhry, M.H. (2014) Applied Hydraulic Transients, 3rd ed.
    """

    def __init__(self, fluid: FluidProperties, config: SolverConfig):
        self.fluid  = fluid
        self.config = config

    def solve(self, pipe: PipeSegment,
              H0: NDArray, V0: NDArray,
              n_sections: int = 10) -> Dict:
        """
        Run MOC transient for a single pipe.

        Parameters
        ----------
        pipe      : PipeSegment with geometry and steady-state initial conditions
        H0        : initial head distribution along pipe [m], shape (n_sections+1,)
        V0        : initial velocity distribution [m/s], shape (n_sections+1,)
        n_sections: number of pipe sections (spatial discretisation)

        Returns
        -------
        dict with time series of H and V at each node
        """
        g   = GRAVITY
        f   = self.fluid
        a   = wave_speed_water_hammer(f, pipe)
        D   = pipe.diameter
        f_f = pipe.friction_factor
        dt  = self.config.transient_dt
        T   = self.config.transient_duration
        Nx  = n_sections
        dx  = pipe.length / Nx
        Nt  = int(T / dt)

        # Courant number check
        Cr = a * dt / dx
        if Cr > 1.0:
            warnings.warn(
                f"MOC Courant number {Cr:.3f} > 1 — CFL violated. "
                f"Reduce dt or increase n_sections.",
                RuntimeWarning
            )

        # Arrays: H[t, x], V[t, x]
        H = np.zeros((Nt + 1, Nx + 1))
        V = np.zeros((Nt + 1, Nx + 1))
        H[0, :] = H0
        V[0, :] = V0

        B  = a / (g)                    # characteristic impedance [s/m²·m/(s²)] → s²/m
        R  = f_f * dx / (2.0 * D * g)  # friction term coefficient

        # Time integration
        for t in range(Nt):
            # Interior nodes (1 to Nx-1): MOC from C⁺ and C⁻
            for i in range(1, Nx):
                # C⁺ from node (i-1) at time t
                Hp_prev = H[t, i - 1]
                Vp_prev = V[t, i - 1]
                Cp = Hp_prev + B * Vp_prev - R * Vp_prev * abs(Vp_prev)

                # C⁻ from node (i+1) at time t
                Hm_prev = H[t, i + 1]
                Vm_prev = V[t, i + 1]
                Cm = Hm_prev - B * Vm_prev + R * Vm_prev * abs(Vm_prev)

                H[t + 1, i] = (Cp + Cm) / 2.0
                V[t + 1, i] = (Cp - Cm) / (2.0 * B)

            # Upstream boundary (x=0): constant head reservoir
            H[t + 1, 0]  = H[0, 0]
            V[t + 1, 0]  = V[t, 1]   # simple reflection (rigid wall approximation)

            # Downstream boundary (x=L): sudden valve closure at t>0
            if t * dt > 0:
                H[t + 1, Nx] = H[t, Nx - 1] + B * V[t, Nx - 1] \
                                - R * V[t, Nx - 1] * abs(V[t, Nx - 1])
                V[t + 1, Nx] = 0.0   # valve closed
            else:
                H[t + 1, Nx] = H[0, Nx]
                V[t + 1, Nx] = V[0, Nx]

        times = np.linspace(0, T, Nt + 1)
        x_arr = np.linspace(0, pipe.length, Nx + 1)

        return {
            "pipe_id":      pipe.id,
            "wave_speed_a": a,
            "courant_number": Cr,
            "times":        times.tolist(),
            "x_positions":  x_arr.tolist(),
            "head_matrix":  H.tolist(),
            "velocity_matrix": V.tolist(),
            "max_pressure_head": float(np.max(H)),
            "min_pressure_head": float(np.min(H)),
            "joukowsky_pressure_rise": joukowsky_pressure_rise(
                f.density, a, float(np.max(abs(V[0, :])))
            ),
        }


# ─────────────────────────────────────────────────────────────────────────────
# Graph Topology: Loop Finding (Cycle Basis)
# ─────────────────────────────────────────────────────────────────────────────

class NetworkTopology:
    """
    Graph-based pipe network topology analysis.

    Provides:
        - Connectivity check (all nodes reachable)
        - Fundamental cycle basis (independent loops for Hardy-Cross)
        - Spanning tree
        - Node degree distribution
        - Incidence matrix
    """

    def __init__(self, nodes: List[NetworkNode], pipes: List[PipeSegment]):
        self.nodes = nodes
        self.pipes = pipes
        self.node_ids = [n.id for n in nodes]
        self.pipe_map = {p.id: p for p in pipes}

    def adjacency_list(self) -> Dict[str, List[Tuple[str, str]]]:
        """Undirected adjacency list: node_id → [(neighbour_id, pipe_id)]"""
        adj: Dict[str, List] = {n.id: [] for n in self.nodes}
        for p in self.pipes:
            adj[p.node_start].append((p.node_end, p.id))
            adj[p.node_end].append((p.node_start, p.id))
        return adj

    def is_connected(self) -> bool:
        """Check connectivity via BFS."""
        if not self.nodes:
            return True
        adj = self.adjacency_list()
        visited = set()
        queue = [self.nodes[0].id]
        while queue:
            nid = queue.pop()
            if nid in visited:
                continue
            visited.add(nid)
            for (nbr, _) in adj[nid]:
                if nbr not in visited:
                    queue.append(nbr)
        return len(visited) == len(self.nodes)

    def spanning_tree_and_chords(self) -> Tuple[List[str], List[str]]:
        """
        Kruskal-like BFS spanning tree.

        Returns
        -------
        tree_pipes  : pipe IDs in spanning tree
        chord_pipes : pipe IDs NOT in tree (chords → loops)
        """
        adj = self.adjacency_list()
        tree_pipes  = []
        chord_pipes = []
        visited     = set()
        tree_edges  = set()

        queue = [self.nodes[0].id]
        visited.add(self.nodes[0].id)

        while queue:
            nid = queue.pop(0)
            for (nbr, pid) in adj[nid]:
                if nbr not in visited:
                    visited.add(nbr)
                    tree_pipes.append(pid)
                    tree_edges.add(pid)
                    queue.append(nbr)
                elif pid not in tree_edges:
                    chord_pipes.append(pid)
                    tree_edges.add(pid)

        return tree_pipes, chord_pipes

    def fundamental_loops(self) -> List[List[str]]:
        """
        Compute fundamental cycle basis using chord pipes.

        Each chord creates one fundamental loop. The loop is found by
        tracing the unique path in the spanning tree between the chord's
        endpoints, then adding the chord.

        Returns
        -------
        List of loops, each a list of pipe IDs (with sign convention
        encoded implicitly by the Hardy-Cross solver).
        """
        tree_pipes, chord_pipes = self.spanning_tree_and_chords()
        if not chord_pipes:
            return []

        tree_set = set(tree_pipes)
        adj = self.adjacency_list()

        def bfs_path(start: str, end: str) -> Optional[List[str]]:
            """BFS path in spanning tree from start to end, returns pipe IDs."""
            from collections import deque
            queue = deque([(start, [])])
            visited = {start}
            # Only traverse tree edges
            tree_adj: Dict[str, List] = {n.id: [] for n in self.nodes}
            for p in self.pipes:
                if p.id in tree_set:
                    tree_adj[p.node_start].append((p.node_end, p.id))
                    tree_adj[p.node_end].append((p.node_start, p.id))

            queue = deque([(start, [])])
            visited = {start}
            while queue:
                nid, path = queue.popleft()
                if nid == end:
                    return path
                for (nbr, pid) in tree_adj[nid]:
                    if nbr not in visited:
                        visited.add(nbr)
                        queue.append((nbr, path + [pid]))
            return None

        loops = []
        for chord_id in chord_pipes:
            chord = self.pipe_map[chord_id]
            path = bfs_path(chord.node_start, chord.node_end)
            if path is not None:
                loops.append(path + [chord_id])

        return loops

    def incidence_matrix(self) -> Tuple[NDArray, List[str], List[str]]:
        """
        Build node-pipe incidence matrix A (N_nodes × N_pipes).
        A[i,j] = +1 if pipe j leaves node i,
                 -1 if pipe j enters node i,
                  0 otherwise.
        """
        N = len(self.nodes)
        M = len(self.pipes)
        node_idx = {n.id: i for i, n in enumerate(self.nodes)}
        pipe_idx = {p.id: j for j, p in enumerate(self.pipes)}
        A = np.zeros((N, M), dtype=float)
        for p in self.pipes:
            j = pipe_idx[p.id]
            A[node_idx[p.node_start], j] =  1.0
            A[node_idx[p.node_end],   j] = -1.0
        return A, [n.id for n in self.nodes], [p.id for p in self.pipes]

    def node_degrees(self) -> Dict[str, int]:
        """Return degree (number of connected pipes) of each node."""
        deg = {n.id: 0 for n in self.nodes}
        for p in self.pipes:
            deg[p.node_start] += 1
            deg[p.node_end]   += 1
        return deg


# ─────────────────────────────────────────────────────────────────────────────
# Master Solver Dispatcher
# ─────────────────────────────────────────────────────────────────────────────

class CFDNetworkSolver:
    """
    Top-level solver that dispatches to Hardy-Cross or Newton-Raphson,
    optionally runs heat transfer, turbulence, and transient analysis.
    """

    def __init__(self, fluid: FluidProperties, config: SolverConfig):
        self.fluid   = fluid
        self.config  = config

    def solve(self,
              nodes: List[NetworkNode],
              pipes: List[PipeSegment]) -> SolverResult:
        """Main entry point."""
        topo = NetworkTopology(nodes, pipes)

        if not topo.is_connected():
            return SolverResult(
                converged=False, iterations=0, residual=float('inf'),
                pipe_results=[], node_results={},
                network_stats={"error": "Network is not connected"},
                warnings=["Network graph is disconnected — cannot solve"],
                solver_log=[],
            )

        method = self.config.method.lower()

        if method == "hardy_cross":
            loops = topo.fundamental_loops()
            solver = HardyCrossSolver(self.fluid, self.config)
            result = solver.solve(nodes, pipes, loops)
        elif method in ("newton_raphson", "nr"):
            solver = NewtonRaphsonSolver(self.fluid, self.config)
            result = solver.solve(nodes, pipes)
        else:
            raise ValueError(f"Unknown solver method: {self.config.method}")

        # Transient post-process (water hammer)
        if self.config.solve_transient and pipes:
            wh_solver = WaterHammerSolver(self.fluid, self.config)
            wh_results = []
            for pipe in pipes:
                nx = max(5, min(50, int(pipe.length / 10)))
                H0 = np.linspace(50.0, 20.0, nx + 1)   # example steady-state heads
                V0 = np.full(nx + 1, pipe.velocity)
                wh = wh_solver.solve(pipe, H0, V0, n_sections=nx)
                wh_results.append(wh)
            result.network_stats["water_hammer"] = wh_results

        return result


# ─────────────────────────────────────────────────────────────────────────────
# Colour Mapping Utilities (for frontend visualisation)
# ─────────────────────────────────────────────────────────────────────────────

def velocity_to_color(velocity: float, v_min: float, v_max: float) -> str:
    """
    Map velocity to a hex colour on a blue→cyan→green→yellow→red colour scale.
    Returns hex string e.g. '#ff4500'.
    """
    if v_max <= v_min:
        return "#0000ff"
    t = max(0.0, min(1.0, (abs(velocity) - v_min) / (v_max - v_min)))
    # 5-stop colour map: blue → cyan → green → yellow → red
    stops = [
        (0.00, (0,   0,   255)),
        (0.25, (0,   191, 255)),
        (0.50, (0,   255, 0  )),
        (0.75, (255, 255, 0  )),
        (1.00, (255, 0,   0  )),
    ]
    for i in range(len(stops) - 1):
        t0, c0 = stops[i]
        t1, c1 = stops[i + 1]
        if t0 <= t <= t1:
            f = (t - t0) / (t1 - t0)
            r = int(c0[0] + f * (c1[0] - c0[0]))
            g = int(c0[1] + f * (c1[1] - c0[1]))
            b = int(c0[2] + f * (c1[2] - c0[2]))
            return f"#{r:02x}{g:02x}{b:02x}"
    return "#ff0000"


def pressure_to_color(pressure: float, p_min: float, p_max: float) -> str:
    """Map pressure to blue→purple→red colour scale."""
    if p_max <= p_min:
        return "#0000ff"
    t = max(0.0, min(1.0, (pressure - p_min) / (p_max - p_min)))
    r = int(t * 255)
    b = int((1.0 - t) * 255)
    g = 0
    return f"#{r:02x}{g:02x}{b:02x}"


def temperature_to_color(T: float, T_min: float, T_max: float) -> str:
    """Map temperature to blue→red colour scale (cool→hot)."""
    if T_max <= T_min:
        return "#0000ff"
    t = max(0.0, min(1.0, (T - T_min) / (T_max - T_min)))
    r = int(t * 255)
    b = int((1.0 - t) * 255)
    g = int(4.0 * t * (1.0 - t) * 180)
    return f"#{r:02x}{g:02x}{b:02x}"


def colormap_legend(variable: str, v_min: float, v_max: float,
                    n_stops: int = 10) -> List[Dict]:
    """Generate colour bar data for frontend rendering."""
    legend = []
    for i in range(n_stops):
        t = i / (n_stops - 1)
        val = v_min + t * (v_max - v_min)
        if variable == "velocity":
            color = velocity_to_color(val, v_min, v_max)
        elif variable == "pressure":
            color = pressure_to_color(val, v_min, v_max)
        elif variable == "temperature":
            color = temperature_to_color(val, v_min, v_max)
        else:
            color = f"#{int(t*255):02x}{int(t*255):02x}{int(t*255):02x}"
        legend.append({"value": round(val, 4), "color": color, "fraction": t})
    return legend


# ─────────────────────────────────────────────────────────────────────────────
# Statistical Analysis of Results
# ─────────────────────────────────────────────────────────────────────────────

class CFDStatistics:
    """
    Statistical analysis of CFD results.

    Provides:
        - Descriptive statistics (mean, std, percentiles)
        - Hydraulic grade line (HGL) and energy grade line (EGL)
        - Network efficiency metrics
        - Pressure uniformity index
        - Flow distribution coefficient of variation
    """

    @staticmethod
    def descriptive_stats(values: List[float]) -> Dict:
        if not values:
            return {}
        arr = np.array(values)
        return {
            "count":    len(arr),
            "mean":     float(np.mean(arr)),
            "std":      float(np.std(arr, ddof=1)) if len(arr) > 1 else 0.0,
            "min":      float(np.min(arr)),
            "max":      float(np.max(arr)),
            "p25":      float(np.percentile(arr, 25)),
            "p50":      float(np.percentile(arr, 50)),
            "p75":      float(np.percentile(arr, 75)),
            "p95":      float(np.percentile(arr, 95)),
            "skewness": float(CFDStatistics._skewness(arr)),
            "kurtosis": float(CFDStatistics._kurtosis(arr)),
        }

    @staticmethod
    def _skewness(arr: NDArray) -> float:
        n = len(arr)
        if n < 3:
            return 0.0
        mu = np.mean(arr)
        s  = np.std(arr, ddof=1)
        if s == 0:
            return 0.0
        return float(np.mean(((arr - mu) / s) ** 3))

    @staticmethod
    def _kurtosis(arr: NDArray) -> float:
        n = len(arr)
        if n < 4:
            return 0.0
        mu = np.mean(arr)
        s  = np.std(arr, ddof=1)
        if s == 0:
            return 0.0
        return float(np.mean(((arr - mu) / s) ** 4) - 3.0)

    @staticmethod
    def pressure_uniformity_index(pressures: List[float]) -> float:
        """
        Pressure Uniformity Index (PUI).

            PUI = 1 - σ_p / μ_p

        PUI = 1.0 → perfectly uniform
        PUI < 0.9 → significant non-uniformity
        """
        if not pressures:
            return 1.0
        arr = np.array(pressures, dtype=float)
        mu  = np.mean(arr)
        if mu == 0:
            return 1.0
        return float(1.0 - np.std(arr, ddof=1) / abs(mu))

    @staticmethod
    def flow_distribution_cv(flows: List[float]) -> float:
        """
        Coefficient of Variation of pipe flow rates.

            CV = σ_Q / |μ_Q| × 100%

        Lower = more uniform distribution.
        """
        if not flows:
            return 0.0
        arr = np.array(flows)
        mu  = np.mean(np.abs(arr))
        if mu == 0:
            return 0.0
        return float(np.std(arr, ddof=1) / mu * 100.0)

    @staticmethod
    def hydraulic_grade_line(node_results: List[Dict],
                              pipe_results: List[Dict],
                              rho: float = 998.2,
                              g: float = GRAVITY) -> List[Dict]:
        """
        Compute HGL (= p/ρg + z) and EGL (= p/ρg + z + V²/2g) at nodes.
        """
        hgl = []
        for n in node_results:
            p_head = n.get("pressure_head", n.get("pressure", 0.0) / (rho * g))
            z      = n.get("elevation", 0.0)
            hgl.append({
                "node_id":    n["id"],
                "HGL_m":      p_head + z,
                "pressure_head_m": p_head,
                "elevation_m": z,
            })
        return hgl

    @staticmethod
    def network_efficiency(pipe_results: List[Dict]) -> Dict:
        """
        Overall network efficiency metrics.
        """
        velocities   = [abs(p.get("velocity", 0.0)) for p in pipe_results]
        head_losses  = [abs(p.get("head_loss", 0.0)) for p in pipe_results]
        reynolds     = [p.get("reynolds_number", 0.0) for p in pipe_results]
        regimes      = [p.get("flow_regime", "unknown") for p in pipe_results]

        regime_counts: Dict[str, int] = {}
        for r in regimes:
            regime_counts[r] = regime_counts.get(r, 0) + 1

        return {
            "velocity_stats":       CFDStatistics.descriptive_stats(velocities),
            "head_loss_stats":      CFDStatistics.descriptive_stats(head_losses),
            "reynolds_stats":       CFDStatistics.descriptive_stats(reynolds),
            "flow_regime_counts":   regime_counts,
            "total_head_loss_m":    sum(head_losses),
            "mean_velocity_ms":     float(np.mean(velocities)) if velocities else 0.0,
            "max_velocity_ms":      float(max(velocities)) if velocities else 0.0,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Dimensional Analysis & Similarity
# ─────────────────────────────────────────────────────────────────────────────

def buckingham_pi_pipe_flow() -> List[str]:
    """
    Buckingham π theorem applied to pipe flow.

    Variables: Δp, ρ, V, D, L, μ, ε
    Dimensions: M, L, T  (3 fundamental)
    n = 7 variables, k = 3 dimensions → 4 π groups:

        π₁ = Δp·ρ/(ρ²V²)   = Euler number Eu
        π₂ = ρVD/μ          = Reynolds number Re
        π₃ = L/D             = length ratio
        π₄ = ε/D             = relative roughness

    These are the governing dimensionless groups for pipe flow.
    """
    return [
        "π₁ = Δp/(½ρV²)  — Euler number (pressure coefficient)",
        "π₂ = ρVD/μ       — Reynolds number",
        "π₃ = L/D          — Length-to-diameter ratio",
        "π₄ = ε/D          — Relative roughness",
    ]


def strouhal_number(f_vortex: float, L: float, V: float) -> float:
    """St = f·L/V  (vortex shedding)"""
    return f_vortex * L / V if V > 0 else 0.0


def euler_number(dp: float, rho: float, V: float) -> float:
    """Eu = Δp/(½ρV²)  (pressure coefficient)"""
    dyn = 0.5 * rho * V**2
    return dp / dyn if dyn > 0 else 0.0


def dean_number(Re: float, D: float, R_curve: float) -> float:
    """
    Dean number for flow in curved pipes.

        De = Re · √(D / (2·R_curve))

    Dean > 11.6 → secondary Dean vortices appear.
    """
    return Re * math.sqrt(D / (2.0 * R_curve)) if R_curve > 0 else 0.0


def womersley_number(omega: float, D: float, nu: float) -> float:
    """
    Womersley number for pulsatile flow.

        Wo = (D/2) · √(ω/ν)

    Wo < 1  → quasi-steady (Poiseuille) profiles
    Wo >> 1 → inertia dominated, plug flow profiles
    """
    return (D / 2.0) * math.sqrt(abs(omega) / nu) if nu > 0 else 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Material / Roughness Database
# ─────────────────────────────────────────────────────────────────────────────

PIPE_ROUGHNESS_DB: Dict[str, float] = {
    # Material                   : ε [m]
    "drawn_tubing":               1.5e-6,
    "commercial_steel":           4.6e-5,
    "galvanized_iron":            1.5e-4,
    "asphalted_cast_iron":        1.2e-4,
    "cast_iron":                  2.6e-4,
    "wrought_iron":               4.6e-5,
    "concrete_smooth":            3.0e-4,
    "concrete_rough":             3.0e-3,
    "riveted_steel":              3.0e-3,
    "pvc_plastic":                1.5e-6,
    "hdpe":                       7.0e-6,
    "stainless_steel_304":        1.5e-6,
    "stainless_steel_316":        1.5e-6,
    "copper":                     1.5e-6,
    "brass":                      1.5e-6,
    "fiberglass":                 3.0e-6,
    "ductile_iron":               2.5e-4,
    "wood_stave":                 6.0e-4,
    "old_cast_iron":              1.0e-3,
}

FLUID_DATABASE: Dict[str, Dict] = {
    "water_20c": {
        "name": "Water at 20°C", "density": 998.2, "dynamic_viscosity": 1.002e-3,
        "bulk_modulus": 2.15e9, "vapour_pressure": 2337.0, "specific_heat": 4182.0,
        "thermal_conductivity": 0.598, "surface_tension": 0.0728,
    },
    "water_60c": {
        "name": "Water at 60°C", "density": 983.2, "dynamic_viscosity": 4.67e-4,
        "bulk_modulus": 2.27e9, "vapour_pressure": 19940.0, "specific_heat": 4185.0,
        "thermal_conductivity": 0.651, "surface_tension": 0.0662,
    },
    "oil_sae30": {
        "name": "SAE 30 Motor Oil", "density": 891.0, "dynamic_viscosity": 0.440,
        "bulk_modulus": 1.5e9, "vapour_pressure": 1000.0, "specific_heat": 1900.0,
        "thermal_conductivity": 0.145,
    },
    "glycerin": {
        "name": "Glycerin at 20°C", "density": 1260.0, "dynamic_viscosity": 1.50,
        "bulk_modulus": 4.35e9, "vapour_pressure": 1.3, "specific_heat": 2427.0,
        "thermal_conductivity": 0.286,
    },
    "air_20c": {
        "name": "Air at 20°C, 1 atm", "density": 1.204, "dynamic_viscosity": 1.81e-5,
        "bulk_modulus": 142000.0, "vapour_pressure": 0.0, "specific_heat": 1005.0,
        "thermal_conductivity": 0.0257, "molar_mass": 0.02896,
        "ratio_specific_heats": 1.4, "is_compressible": True,
    },
    "natural_gas": {
        "name": "Natural Gas (Methane)", "density": 0.717, "dynamic_viscosity": 1.12e-5,
        "bulk_modulus": 200000.0, "vapour_pressure": 0.0, "specific_heat": 2220.0,
        "thermal_conductivity": 0.0328, "molar_mass": 0.01604,
        "ratio_specific_heats": 1.31, "is_compressible": True,
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# REFERENCES
# ─────────────────────────────────────────────────────────────────────────────
REFERENCES = """
[1]  Cross, H. (1936). "Analysis of flow in networks of conduits or conductors."
     UIUC Engineering Experiment Station, Bulletin 286.

[2]  Darcy, H. (1857). Recherches expérimentales relatives au mouvement de l'eau
     dans les tuyaux. Mallet-Bachelier, Paris.

[3]  Weisbach, J. (1845). Lehrbuch der Ingenieur- und Maschinen-Mechanik.
     Vieweg und Sohn, Braunschweig.

[4]  Colebrook, C.F. & White, C.M. (1937). "Experiments with fluid friction in
     roughened pipes." Proc. R. Soc. Lond. A, 161, 367-381.

[5]  Moody, L.F. (1944). "Friction factors for pipe flow."
     Trans. ASME, 66(8), 671-684.

[6]  Swamee, P.K. & Jain, A.K. (1976). "Explicit equations for pipe-flow problems."
     ASCE J. Hydraulics Div., 102(5), 657-664.

[7]  Churchill, S.W. (1977). "Friction-factor equation spans all fluid flow regimes."
     Chem. Eng., Nov 7, 91-92.

[8]  Dittus, F.W. & Boelter, L.M.K. (1930). "Heat transfer in automobile radiators
     of the tubular type." Univ. California Publ. Eng., 2, 443.

[9]  Gnielinski, V. (1976). "New equations for heat and mass transfer in turbulent
     pipe and channel flow." Int. Chem. Eng., 16, 359-368.

[10] Launder, B.E. & Spalding, D.B. (1974). "The numerical computation of turbulent
     flows." Comput. Methods Appl. Mech. Eng., 3, 269-289.

[11] Streeter, V.L. & Wylie, E.B. (1978). Fluid Mechanics, 6th ed. McGraw-Hill.

[12] Chaudhry, M.H. (2014). Applied Hydraulic Transients, 3rd ed. Springer.

[13] Lockhart, R.W. & Martinelli, R.C. (1949). "Proposed correlation of data for
     isothermal two-component, two-phase flow in pipes." Chem. Eng. Prog., 45, 39-48.

[14] Joukowsky, N. (1898). "Über den hydraulischen Stoss in Wasserleitungsröhren."
     (Trans.: ASME Trans., 1904, 9, 1-224.)

[15] Todini, E. & Pilati, S. (1988). "A gradient algorithm for the analysis of pipe
     networks." In: Computer Applications in Water Supply, 1, 1-20.

[16] Metzner, A.B. & Reed, J.C. (1955). "Flow of non-Newtonian fluids."
     AIChE J., 1(4), 434-440.

[17] Friedel, L. (1979). "Improved friction pressure drop correlations for horizontal
     and vertical upward two-phase pipe flow." Eur. Two-Phase Flow Group Mtg., Ispra.

[18] Sieder, E.N. & Tate, G.E. (1936). "Heat transfer and pressure drop of liquids
     in tubes." Ind. Eng. Chem., 28, 1429-1435.
"""
