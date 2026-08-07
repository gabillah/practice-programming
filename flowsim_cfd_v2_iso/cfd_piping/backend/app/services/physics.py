"""
CFD Physics Engine — Fluid Properties & Dimensionless Numbers
=============================================================
Implements all fundamental fluid mechanics calculations used by the solver.

References:
    - Moody, L.F. (1944). Friction factors for pipe flow. ASME Transactions, 66, 671–684.
    - Colebrook, C.F. (1939). Turbulent flow in pipes. J. Inst. Civil Eng., 11, 133–156.
    - Churchill, S.W. (1977). Friction-factor equation spans all fluid-flow regimes.
      Chemical Engineering, 84(24), 91–92.
    - Swamee, P.K. & Jain, A.K. (1976). Explicit equations for pipe-flow problems.
      J. Hydraulics Div., 102(5), 657–664.
    - White, F.M. (2011). Fluid Mechanics, 7th ed. McGraw-Hill.
    - Munson, B.R. et al. (2013). Fundamentals of Fluid Mechanics, 7th ed. Wiley.
"""

import math
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Tuple


# ===========================================================================
# Enumerations
# ===========================================================================

class FlowRegime(str, Enum):
    LAMINAR = "laminar"
    TRANSITIONAL = "transitional"
    TURBULENT_SMOOTH = "turbulent_smooth"
    TURBULENT_ROUGH = "turbulent_rough"
    FULLY_TURBULENT = "fully_turbulent"


class PipeRoughness(str, Enum):
    """Absolute roughness (mm) for common pipe materials."""
    DRAWN_TUBING       = "drawn_tubing"       # 0.0015 mm
    COMMERCIAL_STEEL   = "commercial_steel"   # 0.046  mm
    WROUGHT_IRON       = "wrought_iron"       # 0.046  mm
    ASPHALTED_CI       = "asphalted_ci"       # 0.12   mm
    GALVANISED_IRON    = "galvanised_iron"    # 0.15   mm
    CAST_IRON          = "cast_iron"          # 0.26   mm
    WOOD_STAVE         = "wood_stave"         # 0.60   mm
    CONCRETE           = "concrete"           # 3.0    mm
    RIVETED_STEEL      = "riveted_steel"      # 9.0    mm
    SMOOTH_PLASTIC     = "smooth_plastic"     # 0.0015 mm


# Map roughness enum → absolute roughness (m)
ROUGHNESS_VALUES_M: dict[str, float] = {
    "drawn_tubing":     0.0000015,
    "commercial_steel": 0.000046,
    "wrought_iron":     0.000046,
    "asphalted_ci":     0.00012,
    "galvanised_iron":  0.00015,
    "cast_iron":        0.00026,
    "wood_stave":       0.00060,
    "concrete":         0.003,
    "riveted_steel":    0.009,
    "smooth_plastic":   0.0000015,
}


# ===========================================================================
# Data containers
# ===========================================================================

@dataclass
class FluidProperties:
    """Complete thermodynamic and transport properties of a fluid."""
    name: str
    density: float          # kg/m³
    viscosity: float        # Pa·s (dynamic)
    bulk_modulus: float     # Pa
    vapor_pressure: float   # Pa
    surface_tension: float  # N/m
    specific_heat: float    # J/(kg·K)
    thermal_conductivity: float  # W/(m·K)
    compressible: bool = False
    temperature: float = 293.15  # K
    pressure: float = 101325.0   # Pa

    @property
    def kinematic_viscosity(self) -> float:
        """Kinematic viscosity ν = μ/ρ  [m²/s]."""
        return self.viscosity / self.density

    @property
    def prandtl_number(self) -> float:
        """Pr = μ·cp / k  [-]."""
        if self.thermal_conductivity > 0:
            return (self.viscosity * self.specific_heat) / self.thermal_conductivity
        return 0.0

    @property
    def speed_of_sound(self) -> float:
        """Speed of sound c = sqrt(K/ρ)  [m/s]."""
        return math.sqrt(self.bulk_modulus / self.density)


@dataclass
class PipeGeometry:
    """Geometric parameters of a single pipe segment."""
    diameter: float         # m
    length: float           # m
    roughness: float        # m (absolute)
    elevation_in: float = 0.0   # m (inlet elevation)
    elevation_out: float = 0.0  # m (outlet elevation)

    @property
    def area(self) -> float:
        """Cross-sectional area A = π·D²/4  [m²]."""
        return math.pi * self.diameter ** 2 / 4.0

    @property
    def hydraulic_diameter(self) -> float:
        """For circular pipes, Dh = D."""
        return self.diameter

    @property
    def relative_roughness(self) -> float:
        """ε/D  [-]."""
        if self.diameter <= 0:
            return 0.0
        return self.roughness / self.diameter

    @property
    def elevation_change(self) -> float:
        """Δz = z_out − z_in  [m]."""
        return self.elevation_out - self.elevation_in


@dataclass
class FlowState:
    """Result of a single-pipe hydraulic calculation."""
    velocity: float             # m/s (average)
    flow_rate: float            # m³/s (volumetric)
    reynolds_number: float      # -
    friction_factor: float      # Darcy-Weisbach f
    head_loss: float            # m  (Darcy friction head loss)
    pressure_drop: float        # Pa (Darcy friction only)
    minor_loss_head: float      # m  (fittings, valves, etc.)
    total_head_loss: float      # m  (friction + minor)
    total_pressure_drop: float  # Pa (friction + minor + elevation)
    flow_regime: FlowRegime
    mach_number: float = 0.0   # - (for compressible flows)
    turbulence_intensity: float = 0.0   # %
    wall_shear_stress: float = 0.0      # Pa
    darcy_velocity: float = 0.0         # m/s (seepage velocity, if porous)

    # velocity profile parameters
    centerline_velocity: float = 0.0    # m/s
    displacement_thickness: float = 0.0 # m  (BL displacement)
    momentum_thickness: float = 0.0     # m  (BL momentum)

    # energy
    kinetic_energy_coeff: float = 1.0   # α (Coriolis coefficient)
    specific_kinetic_energy: float = 0.0  # J/kg


# ===========================================================================
# Core dimensionless numbers
# ===========================================================================

def reynolds_number(velocity: float, diameter: float, kinematic_viscosity: float) -> float:
    """
    Reynolds number Re = V·D / ν

    Args:
        velocity: Mean flow velocity [m/s]
        diameter: Pipe (hydraulic) diameter [m]
        kinematic_viscosity: ν [m²/s]

    Returns:
        Re [-]
    """
    if kinematic_viscosity <= 0 or diameter <= 0:
        return 0.0
    return abs(velocity) * diameter / kinematic_viscosity


def mach_number(velocity: float, speed_of_sound: float) -> float:
    """Ma = V / c  [-]."""
    if speed_of_sound <= 0:
        return 0.0
    return abs(velocity) / speed_of_sound


def froude_number(velocity: float, length: float, g: float = 9.80665) -> float:
    """Fr = V / sqrt(g·L)  [-]. Used for open-channel reference."""
    if length <= 0:
        return 0.0
    return abs(velocity) / math.sqrt(g * length)


def weber_number(velocity: float, length: float, density: float,
                 surface_tension: float) -> float:
    """We = ρ·V²·L / σ  [-]."""
    if surface_tension <= 0:
        return 0.0
    return density * velocity ** 2 * length / surface_tension


def strouhal_number(frequency: float, length: float, velocity: float) -> float:
    """St = f·L / V  [-]."""
    if velocity <= 0:
        return 0.0
    return frequency * length / velocity


def nusselt_number(heat_transfer_coeff: float, diameter: float,
                   thermal_conductivity: float) -> float:
    """Nu = h·D / k  [-]."""
    if thermal_conductivity <= 0:
        return 0.0
    return heat_transfer_coeff * diameter / thermal_conductivity


def prandtl_number(dynamic_viscosity: float, specific_heat: float,
                   thermal_conductivity: float) -> float:
    """Pr = μ·cp / k  [-]."""
    if thermal_conductivity <= 0:
        return 0.0
    return (dynamic_viscosity * specific_heat) / thermal_conductivity


def euler_number(pressure_drop: float, density: float, velocity: float) -> float:
    """Eu = ΔP / (ρ·V²)  [-]."""
    if density <= 0 or velocity == 0:
        return 0.0
    return pressure_drop / (density * velocity ** 2)


def cavitation_number(local_pressure: float, vapor_pressure: float,
                      density: float, velocity: float) -> float:
    """σ = (P − Pv) / (½·ρ·V²)  [-]."""
    dynamic_pressure = 0.5 * density * velocity ** 2
    if dynamic_pressure <= 0:
        return float("inf")
    return (local_pressure - vapor_pressure) / dynamic_pressure


# ===========================================================================
# Friction factor correlations
# ===========================================================================

def identify_flow_regime(re: float, relative_roughness: float) -> FlowRegime:
    """Classify the flow regime based on Re and ε/D."""
    if re < 2300:
        return FlowRegime.LAMINAR
    if re < 4000:
        return FlowRegime.TRANSITIONAL
    # Turbulent sub-regimes
    re_smooth = 3500 / relative_roughness if relative_roughness > 0 else float("inf")
    if re < re_smooth:
        return FlowRegime.TURBULENT_SMOOTH
    re_full = 10 * 3500 / relative_roughness if relative_roughness > 0 else float("inf")
    if re < re_full:
        return FlowRegime.TURBULENT_ROUGH
    return FlowRegime.FULLY_TURBULENT


def friction_factor_laminar(re: float) -> float:
    """
    Hagen-Poiseuille: f = 64 / Re

    Valid for Re < 2300.
    """
    if re <= 0:
        return 0.0
    return 64.0 / re


def friction_factor_colebrook(re: float, relative_roughness: float,
                               max_iter: int = 50,
                               tol: float = 1e-8) -> float:
    """
    Colebrook-White implicit equation (Darcy friction factor):

        1/√f = −2 log₁₀(ε/(3.7D) + 2.51/(Re√f))

    Solved by Newton-Raphson iteration.

    Args:
        re: Reynolds number
        relative_roughness: ε/D
        max_iter: Maximum Newton-Raphson iterations
        tol: Convergence tolerance on f

    Returns:
        Darcy-Weisbach friction factor f [-]
    """
    if re <= 0:
        return 0.0
    if re < 2300:
        return friction_factor_laminar(re)

    # Initial guess: Swamee-Jain (good first approximation)
    f = friction_factor_swamee_jain(re, relative_roughness)
    if f <= 0:
        f = 0.02

    for _ in range(max_iter):
        sqrt_f = math.sqrt(f)
        rhs = -2.0 * math.log10(
            relative_roughness / 3.7 + 2.51 / (re * sqrt_f)
        )
        f_new = 1.0 / (rhs * rhs)

        if abs(f_new - f) < tol:
            return f_new
        f = f_new

    return f


def friction_factor_swamee_jain(re: float, relative_roughness: float) -> float:
    """
    Swamee-Jain explicit approximation to Colebrook-White (1976).

        f = 0.25 / [log₁₀(ε/(3.7D) + 5.74/Re^0.9)]²

    Valid for: 10⁻⁶ ≤ ε/D ≤ 10⁻² and 5×10³ ≤ Re ≤ 10⁸
    Error within ±3% of Colebrook.
    """
    if re <= 0:
        return 0.0
    if re < 2300:
        return friction_factor_laminar(re)
    term1 = relative_roughness / 3.7
    term2 = 5.74 / (re ** 0.9)
    denom = math.log10(term1 + term2)
    if denom == 0:
        return 0.02
    return 0.25 / (denom ** 2)


def friction_factor_churchill(re: float, relative_roughness: float) -> float:
    """
    Churchill (1977) single equation spanning all flow regimes:

        f = 8 [(8/Re)¹² + (A+B)^(-3/2)]^(1/12)

    Where:
        A = {-2.457 ln[(7/Re)^0.9 + 0.27(ε/D)]}^16
        B = (37530/Re)^16

    Continuous across laminar, transitional, and turbulent regions.
    """
    if re <= 0:
        return 0.0

    term1 = (8.0 / re) ** 12

    A = (
        -2.457 * math.log(
            (7.0 / re) ** 0.9 + 0.27 * relative_roughness
        )
    ) ** 16

    B = (37530.0 / re) ** 16

    return 8.0 * (term1 + (A + B) ** (-3.0 / 2.0)) ** (1.0 / 12.0)


def friction_factor_moody(re: float, relative_roughness: float) -> float:
    """
    Compute Darcy-Weisbach friction factor using the best available correlation.

    - Re < 2300:   Hagen-Poiseuille (exact)
    - 2300–4000:   Linear interpolation (transitional)
    - Re ≥ 4000:   Colebrook-White via Newton-Raphson

    Returns:
        Darcy-Weisbach f [-]
    """
    if re < 2300:
        return friction_factor_laminar(re)

    if 2300 <= re < 4000:
        # Linear interpolation between laminar and turbulent
        f_lam = friction_factor_laminar(2300)
        f_tur = friction_factor_colebrook(4000, relative_roughness)
        alpha = (re - 2300) / (4000 - 2300)
        return f_lam + alpha * (f_tur - f_lam)

    return friction_factor_colebrook(re, relative_roughness)


# ===========================================================================
# Head loss equations
# ===========================================================================

def darcy_weisbach_head_loss(friction_factor: float, length: float,
                              diameter: float, velocity: float,
                              g: float = 9.80665) -> float:
    """
    Darcy-Weisbach equation:

        hf = f · (L/D) · V²/(2g)   [m]

    Args:
        friction_factor: Darcy f [-]
        length: Pipe length L [m]
        diameter: Internal diameter D [m]
        velocity: Mean velocity V [m/s]
        g: Gravitational acceleration [m/s²]

    Returns:
        Friction head loss [m]
    """
    if diameter <= 0 or g <= 0:
        return 0.0
    return friction_factor * (length / diameter) * (velocity ** 2) / (2.0 * g)


def darcy_weisbach_pressure_drop(friction_factor: float, length: float,
                                  diameter: float, velocity: float,
                                  density: float) -> float:
    """
    Darcy-Weisbach pressure drop:

        ΔP = f · (L/D) · ½·ρ·V²   [Pa]
    """
    if diameter <= 0 or density <= 0:
        return 0.0
    return friction_factor * (length / diameter) * 0.5 * density * velocity ** 2


def hazen_williams_head_loss(flow_rate: float, length: float,
                              diameter: float, C: float) -> float:
    """
    Hazen-Williams formula (Imperial/metric version):

        hf = 10.67 · L · Q^1.852 / (C^1.852 · D^4.8704)   [m]

    Applicable only for water, 10–27°C, D > 50mm.

    Args:
        flow_rate: Q [m³/s]
        length: L [m]
        diameter: D [m]
        C: Hazen-Williams roughness coefficient [-]

    Returns:
        Head loss [m]
    """
    if C <= 0 or diameter <= 0:
        return 0.0
    return 10.67 * length * (abs(flow_rate) ** 1.852) / (C ** 1.852 * diameter ** 4.8704)


def minor_loss_head(K: float, velocity: float, g: float = 9.80665) -> float:
    """
    Minor (local) head loss:

        hm = K · V²/(2g)   [m]

    Args:
        K: Loss coefficient [-]
        velocity: Velocity at the fitting [m/s]
        g: Gravitational acceleration [m/s²]

    Returns:
        Minor head loss [m]
    """
    if g <= 0:
        return 0.0
    return K * velocity ** 2 / (2.0 * g)


def equivalent_length(K: float, diameter: float, friction_factor: float) -> float:
    """
    Equivalent pipe length for a fitting:

        Le = K · D / f   [m]
    """
    if friction_factor <= 0 or diameter <= 0:
        return 0.0
    return K * diameter / friction_factor


# ===========================================================================
# Minor loss coefficients
# ===========================================================================

class MinorLossCoefficients:
    """Standard K-values from engineering references."""

    # Gate valves (fully open)
    GATE_VALVE_FULLY_OPEN: float = 0.1
    GATE_VALVE_HALF_OPEN: float = 5.6
    GATE_VALVE_QUARTER_OPEN: float = 24.0

    # Globe valves
    GLOBE_VALVE_FULLY_OPEN: float = 10.0

    # Check valves
    SWING_CHECK_VALVE: float = 2.5
    LIFT_CHECK_VALVE: float = 12.0
    BALL_CHECK_VALVE: float = 4.0

    # Ball valves
    BALL_VALVE_FULLY_OPEN: float = 0.05
    BALL_VALVE_HALF_OPEN: float = 5.5

    # Butterfly valve
    BUTTERFLY_VALVE_FULLY_OPEN: float = 0.3

    # Elbows and bends
    ELBOW_90_STANDARD: float = 1.5
    ELBOW_90_LONG_RADIUS: float = 0.7
    ELBOW_45_STANDARD: float = 0.4
    ELBOW_45_LONG_RADIUS: float = 0.2
    ELBOW_180_RETURN: float = 2.2

    # Tees
    TEE_FLOW_THROUGH: float = 0.4
    TEE_BRANCH: float = 1.5

    # Entrances/exits
    SHARP_EDGED_ENTRANCE: float = 0.5
    REENTRANT_ENTRANCE: float = 0.8
    WELL_ROUNDED_ENTRANCE: float = 0.04
    PROJECTING_ENTRANCE: float = 0.9
    EXIT_LOSS: float = 1.0

    # Reducers / expansions
    @staticmethod
    def sudden_contraction(area_ratio: float) -> float:
        """K for sudden contraction (A2/A1 < 1)."""
        if area_ratio >= 1.0:
            return 0.0
        return 0.42 * (1 - area_ratio ** 2)

    @staticmethod
    def sudden_expansion(area_ratio: float) -> float:
        """Borda-Carnot: K = (1 - A1/A2)²  (referenced to V1)."""
        if area_ratio <= 0 or area_ratio >= 1.0:
            return 0.0
        return (1 - area_ratio) ** 2

    @staticmethod
    def gradual_contraction(angle_deg: float) -> float:
        """K for gradual (tapered) contraction with cone half-angle θ."""
        if angle_deg <= 45:
            return 0.04
        return 0.07 + 0.0005 * (angle_deg - 45)

    @staticmethod
    def gradual_expansion(area_ratio: float, angle_deg: float) -> float:
        """K for conical diffuser (Idelchik correlation)."""
        k_sudden = MinorLossCoefficients.sudden_expansion(area_ratio)
        efficiency = math.sin(math.radians(angle_deg / 2)) ** 0.5
        return k_sudden * efficiency


# ===========================================================================
# Bernoulli & energy equation
# ===========================================================================

def bernoulli_total_head(pressure: float, velocity: float,
                          elevation: float, density: float,
                          g: float = 9.80665) -> float:
    """
    Extended Bernoulli total head:

        H = P/(ρg) + V²/(2g) + z   [m]

    Args:
        pressure: Static pressure P [Pa]
        velocity: Mean velocity V [m/s]
        elevation: Elevation z [m]
        density: Fluid density ρ [kg/m³]
        g: Gravitational acceleration [m/s²]

    Returns:
        Total head H [m]
    """
    pressure_head = pressure / (density * g)
    velocity_head = velocity ** 2 / (2 * g)
    return pressure_head + velocity_head + elevation


def energy_grade_line(total_head: float) -> float:
    """Energy grade line = total hydraulic head [m]."""
    return total_head


def hydraulic_grade_line(pressure: float, elevation: float,
                          density: float, g: float = 9.80665) -> float:
    """
    HGL = P/(ρg) + z   [m]
    (excludes velocity head)
    """
    return pressure / (density * g) + elevation


def specific_energy(velocity: float, depth: float, g: float = 9.80665) -> float:
    """Specific energy for open-channel flow: E = y + V²/(2g)."""
    return depth + velocity ** 2 / (2 * g)


# ===========================================================================
# Power & efficiency
# ===========================================================================

def pump_power(flow_rate: float, head: float,
               density: float, g: float = 9.80665,
               efficiency: float = 0.80) -> float:
    """
    Pump hydraulic power:

        P_hydraulic = ρ·g·Q·H   [W]
        P_shaft     = P_hydraulic / η   [W]

    Returns:
        (hydraulic_power_W, shaft_power_W)
    """
    hydraulic_power = density * g * flow_rate * head
    shaft_power = hydraulic_power / efficiency if efficiency > 0 else 0.0
    return hydraulic_power, shaft_power


def pump_specific_speed(rotation_rpm: float, flow_rate_m3s: float,
                         head_m: float) -> float:
    """
    Dimensionless specific speed:

        Ns = n·√Q / H^(3/4)

    Used to classify pump type (radial, mixed, axial).
    """
    if head_m <= 0:
        return 0.0
    return rotation_rpm * math.sqrt(flow_rate_m3s) / (head_m ** 0.75)


def net_positive_suction_head_required(velocity_at_eye: float,
                                        blade_thickness_coeff: float = 0.08,
                                        g: float = 9.80665) -> float:
    """
    NPSHr simplified estimate:

        NPSHr ≈ (1 + K_b) · V²/(2g)
    """
    return (1 + blade_thickness_coeff) * velocity_at_eye ** 2 / (2 * g)


# ===========================================================================
# Velocity profiles
# ===========================================================================

def velocity_profile_laminar(r: float, R: float, v_mean: float) -> float:
    """
    Hagen-Poiseuille parabolic velocity profile:

        u(r) = 2·V_mean · [1 − (r/R)²]

    Args:
        r: Radial position from centreline [m]
        R: Pipe radius [m]
        v_mean: Mean (average) velocity [m/s]

    Returns:
        Local velocity [m/s]
    """
    if R <= 0 or r > R:
        return 0.0
    return 2.0 * v_mean * (1 - (r / R) ** 2)


def velocity_profile_turbulent_power_law(r: float, R: float, v_mean: float,
                                          n: float = 7.0) -> float:
    """
    Turbulent power-law velocity profile (Nikuradse):

        u(r) = V_cl · (1 − r/R)^(1/n)

    where V_cl ≈ V_mean · (n+1)(2n+1) / (2n²)

    Args:
        r: Radial position from wall (NOT centreline) [m]
        R: Pipe radius [m]
        v_mean: Mean velocity [m/s]
        n: Power-law exponent (7 for Re ≈ 1e5, varies 6–10)
    """
    if R <= 0 or r > R:
        return 0.0
    v_cl = v_mean * (n + 1) * (2 * n + 1) / (2 * n ** 2)
    return v_cl * (r / R) ** (1.0 / n)


def velocity_profile_log_law(y: float, u_star: float,
                               kinematic_viscosity: float,
                               kappa: float = 0.41,
                               B: float = 5.0) -> float:
    """
    Turbulent log-law profile in the inner region:

        u⁺ = (1/κ) ln(y⁺) + B

    where u⁺ = u/u*, y⁺ = y·u*/ν

    Valid for y⁺ > 30 (log-law region).

    Args:
        y: Distance from wall [m]
        u_star: Friction velocity u* = sqrt(τ_w/ρ) [m/s]
        kinematic_viscosity: ν [m²/s]
        kappa: von Kármán constant (≈ 0.41)
        B: Log-law intercept (≈ 5.0 for smooth walls)

    Returns:
        Local velocity [m/s]
    """
    if kinematic_viscosity <= 0 or u_star <= 0 or y <= 0:
        return 0.0
    y_plus = y * u_star / kinematic_viscosity
    if y_plus < 5:
        return y_plus * u_star   # viscous sublayer: u⁺ = y⁺
    if y_plus < 30:
        # Buffer layer: blended
        return u_star * (5.0 * math.log(y_plus) - 3.05)
    return u_star * ((1 / kappa) * math.log(y_plus) + B)


def coriolis_coefficient_alpha(n: float = 7.0) -> float:
    """
    Kinetic energy correction factor α (Coriolis coefficient):

        α = (n+1)²(2n+1)² / (4·n⁴·(n+3)(2n+3))  · A_correction
    
    For turbulent power-law profile, approximate: α ≈ 1.02–1.10.
    For laminar (parabolic): α = 2.0.
    """
    if n >= 4:
        # Turbulent approximation
        return (n + 1) ** 2 * (2 * n + 1) ** 2 / (4 * n ** 4 * (n / (n + 3)) * (2 * n / (2 * n + 3)))
    return 2.0  # laminar


# ===========================================================================
# Turbulence parameters
# ===========================================================================

def turbulence_intensity(re: float) -> float:
    """
    Turbulence intensity at pipe inlet (empirical):

        I = 0.16 · Re^(-1/8)   [%]

    Args:
        re: Reynolds number

    Returns:
        Turbulence intensity I [fraction, not %]
    """
    if re <= 0:
        return 0.0
    return 0.16 * re ** (-0.125)


def turbulent_length_scale(diameter: float, re: float) -> float:
    """
    Turbulent integral length scale (Prandtl mixing length at centre):

        L_t ≈ 0.07 · D   [m]

    More precisely estimated from the log-law.
    """
    return 0.07 * diameter


def turbulent_kinetic_energy(intensity: float, velocity: float) -> float:
    """
    Turbulent kinetic energy:

        k = 1.5 · (I · V)²   [m²/s²]
    """
    return 1.5 * (intensity * velocity) ** 2


def turbulent_dissipation_rate(k: float, length_scale: float,
                                C_mu: float = 0.09) -> float:
    """
    Turbulent dissipation rate (k-ε model):

        ε = C_μ^(3/4) · k^(3/2) / L_t   [m²/s³]
    """
    if length_scale <= 0:
        return 0.0
    return (C_mu ** 0.75) * (k ** 1.5) / length_scale


def friction_velocity(wall_shear_stress: float, density: float) -> float:
    """
    Friction velocity u* = sqrt(τ_w/ρ)   [m/s]
    """
    if density <= 0 or wall_shear_stress < 0:
        return 0.0
    return math.sqrt(abs(wall_shear_stress) / density)


def wall_shear_stress_from_f(friction_factor: float, density: float,
                               velocity: float) -> float:
    """
    Wall shear stress from Darcy friction factor:

        τ_w = f/8 · ρ · V²   [Pa]
    """
    return (friction_factor / 8.0) * density * velocity ** 2


def y_plus(y: float, u_star: float, kinematic_viscosity: float) -> float:
    """Dimensionless wall distance y⁺ = y·u*/ν."""
    if kinematic_viscosity <= 0:
        return 0.0
    return y * u_star / kinematic_viscosity


# ===========================================================================
# Compressible flow
# ===========================================================================

def isentropic_flow_area_ratio(mach: float, gamma: float = 1.4) -> float:
    """
    Isentropic area ratio A/A*:

        A/A* = (1/M) · [(2/(γ+1)) · (1 + (γ−1)/2 · M²)]^((γ+1)/(2(γ−1)))
    """
    if mach <= 0:
        return float("inf")
    exponent = (gamma + 1) / (2 * (gamma - 1))
    base = (2 / (gamma + 1)) * (1 + (gamma - 1) / 2 * mach ** 2)
    return (1 / mach) * base ** exponent


def stagnation_pressure(static_pressure: float, mach: float,
                         gamma: float = 1.4) -> float:
    """P0/P = (1 + (γ-1)/2 · M²)^(γ/(γ-1))."""
    ratio = (1 + (gamma - 1) / 2 * mach ** 2) ** (gamma / (gamma - 1))
    return static_pressure * ratio


def stagnation_temperature(static_temp_k: float, mach: float,
                            gamma: float = 1.4) -> float:
    """T0/T = 1 + (γ-1)/2 · M²."""
    return static_temp_k * (1 + (gamma - 1) / 2 * mach ** 2)


def fanno_flow_friction_parameter(mach: float, gamma: float = 1.4) -> float:
    """
    Fanno flow parameter 4fL*/D for adiabatic compressible pipe flow:

        4fL*/D = (1 - M²)/(γM²) + (γ+1)/(2γ) · ln[(γ+1)M²/(2 + (γ-1)M²)]
    """
    if mach <= 0 or mach == 1:
        return 0.0
    term1 = (1 - mach ** 2) / (gamma * mach ** 2)
    term2 = ((gamma + 1) / (2 * gamma)) * math.log(
        (gamma + 1) * mach ** 2 / (2 + (gamma - 1) * mach ** 2)
    )
    return term1 + term2


# ===========================================================================
# Water hammer / transient analysis
# ===========================================================================

def wave_speed_joukowski(bulk_modulus_fluid: float, density: float,
                          diameter: float, wall_thickness: float,
                          elastic_modulus_pipe: float,
                          support_factor: float = 1.0) -> float:
    """
    Wave speed (celerity) for water hammer:

        a = sqrt(K/ρ) / sqrt(1 + (K·D)/(E·e)·C₁)

    Where C₁ is a support condition factor.

    Args:
        bulk_modulus_fluid: K [Pa]
        density: ρ [kg/m³]
        diameter: D [m]
        wall_thickness: e [m]
        elastic_modulus_pipe: E [Pa] (e.g., 200 GPa for steel)
        support_factor: C₁ [-] (1.0 for anchored at both ends)

    Returns:
        Wave celerity a [m/s]
    """
    if density <= 0 or elastic_modulus_pipe <= 0 or wall_thickness <= 0:
        return 0.0
    numerator = bulk_modulus_fluid / density
    denominator = 1 + (bulk_modulus_fluid * diameter) / (elastic_modulus_pipe * wall_thickness) * support_factor
    return math.sqrt(numerator / denominator)


def joukowski_pressure_surge(density: float, wave_speed: float,
                              velocity_change: float) -> float:
    """
    Joukowski pressure surge (sudden valve closure):

        ΔP = ρ · a · ΔV   [Pa]
    """
    return density * wave_speed * abs(velocity_change)


def critical_closure_time(pipe_length: float, wave_speed: float) -> float:
    """
    Critical (rapid) closure time T_c = 2L/a  [s].
    Closure faster than T_c causes full Joukowski surge.
    """
    if wave_speed <= 0:
        return float("inf")
    return 2.0 * pipe_length / wave_speed


# ===========================================================================
# Full single-pipe hydraulic calculation
# ===========================================================================

def calculate_pipe_hydraulics(
    flow_rate: float,           # m³/s
    geometry: PipeGeometry,
    fluid: FluidProperties,
    minor_K: float = 0.0,
    g: float = 9.80665,
) -> FlowState:
    """
    Compute the full hydraulic state of a single pipe segment.

    Performs:
      1. Velocity from continuity
      2. Reynolds number
      3. Moody friction factor (Colebrook-White)
      4. Darcy-Weisbach head loss
      5. Minor losses
      6. Wall shear stress
      7. Turbulence parameters
      8. Bernoulli / energy terms

    Args:
        flow_rate: Volumetric flow rate Q [m³/s] (signed, +ve = forward)
        geometry:  PipeGeometry instance
        fluid:     FluidProperties instance
        minor_K:   Sum of fitting K values [-]
        g:         Gravitational acceleration [m/s²]

    Returns:
        FlowState with all hydraulic results
    """
    sign = 1 if flow_rate >= 0 else -1
    Q = abs(flow_rate)

    # 1. Velocity
    A = geometry.area
    V = Q / A if A > 0 else 0.0

    # 2. Reynolds number
    Re = reynolds_number(V, geometry.hydraulic_diameter, fluid.kinematic_viscosity)

    # 3. Friction factor
    eps_D = geometry.relative_roughness
    f = friction_factor_moody(Re, eps_D)

    # 4. Darcy head loss
    hf = darcy_weisbach_head_loss(f, geometry.length, geometry.diameter, V, g)
    dP_friction = darcy_weisbach_pressure_drop(f, geometry.length, geometry.diameter, V, fluid.density)

    # 5. Minor losses
    hm = minor_loss_head(minor_K, V, g)

    # 6. Total head loss (friction + minor + elevation)
    h_total = hf + hm + sign * geometry.elevation_change
    dP_total = h_total * fluid.density * g

    # 7. Wall shear stress & friction velocity
    tau_w = wall_shear_stress_from_f(f, fluid.density, V)
    u_star = friction_velocity(tau_w, fluid.density)

    # 8. Turbulence
    I = turbulence_intensity(Re)
    k_turb = turbulent_kinetic_energy(I, V)
    L_t = turbulent_length_scale(geometry.diameter, Re)
    eps_turb = turbulent_dissipation_rate(k_turb, L_t)

    # 9. Flow regime
    regime = identify_flow_regime(Re, eps_D)

    # 10. Velocity profile factors
    n_power = 7.0 if Re > 1e5 else 6.0
    alpha = 2.0 if regime == FlowRegime.LAMINAR else coriolis_coefficient_alpha(n_power)
    v_cl = 2.0 * V if regime == FlowRegime.LAMINAR else V * (n_power + 1) * (2 * n_power + 1) / (2 * n_power ** 2)

    # 11. Mach number (compressible fluids)
    Ma = mach_number(V, fluid.speed_of_sound)

    # 12. Specific kinetic energy
    ke = alpha * V ** 2 / 2.0

    return FlowState(
        velocity=sign * V,
        flow_rate=flow_rate,
        reynolds_number=Re,
        friction_factor=f,
        head_loss=hf,
        pressure_drop=dP_friction,
        minor_loss_head=hm,
        total_head_loss=h_total,
        total_pressure_drop=dP_total,
        flow_regime=regime,
        mach_number=Ma,
        turbulence_intensity=I * 100,   # convert to %
        wall_shear_stress=tau_w,
        centerline_velocity=v_cl,
        kinetic_energy_coeff=alpha,
        specific_kinetic_energy=ke,
    )
