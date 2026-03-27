"""
Analysis Endpoints
===================
Stateless CFD calculation endpoints for single-pipe and batch analysis.
"""

import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.fluid import FluidModel
from app.schemas.schemas import (
    PipeAnalysisRequest, SinglePipeAnalysisResult,
    VelocityProfileResult, VelocityProfilePoint,
    SolverDiagnosticsRequest, SolverDiagnosticsResponse,
)
from app.services.physics import (
    FluidProperties, PipeGeometry, FlowState,
    calculate_pipe_hydraulics,
    friction_factor_moody, reynolds_number,
    turbulence_intensity, turbulent_kinetic_energy,
    turbulent_length_scale,
    velocity_profile_laminar, velocity_profile_turbulent_power_law,
    velocity_profile_log_law,
    wall_shear_stress_from_f, friction_velocity,
    y_plus, coriolis_coefficient_alpha,
    bernoulli_total_head, euler_number, cavitation_number,
    wave_speed_joukowski, joukowski_pressure_surge, critical_closure_time,
    pump_power, identify_flow_regime, FlowRegime,
    mach_number, darcy_weisbach_pressure_drop, minor_loss_head,
)

router = APIRouter()

# Default water properties
DEFAULT_WATER = FluidProperties(
    name="Water (20°C)",
    density=998.2,
    viscosity=1.002e-3,
    bulk_modulus=2.18e9,
    vapor_pressure=2338.0,
    surface_tension=0.0728,
    specific_heat=4182.0,
    thermal_conductivity=0.598,
)


async def _resolve_fluid(
    fluid_slug: Optional[str],
    density_override: Optional[float],
    viscosity_override: Optional[float],
    db: AsyncSession,
) -> FluidProperties:
    if density_override and viscosity_override:
        return FluidProperties(
            name="Custom",
            density=density_override,
            viscosity=viscosity_override,
            bulk_modulus=2.18e9,
            vapor_pressure=2338.0,
            surface_tension=0.0728,
            specific_heat=4182.0,
            thermal_conductivity=0.598,
        )

    if fluid_slug:
        result = await db.execute(select(FluidModel).where(FluidModel.slug == fluid_slug))
        fluid_db = result.scalar_one_or_none()
        if fluid_db:
            return FluidProperties(
                name=fluid_db.name,
                density=fluid_db.density_kg_m3,
                viscosity=fluid_db.dynamic_viscosity_pa_s,
                bulk_modulus=fluid_db.bulk_modulus_pa,
                vapor_pressure=fluid_db.vapor_pressure_pa,
                surface_tension=fluid_db.surface_tension_n_m,
                specific_heat=fluid_db.specific_heat_j_kg_k,
                thermal_conductivity=fluid_db.thermal_conductivity_w_m_k,
                compressible=fluid_db.compressible,
            )

    return DEFAULT_WATER


@router.post("/pipe", response_model=SinglePipeAnalysisResult)
async def analyze_single_pipe(
    req: PipeAnalysisRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Perform comprehensive CFD analysis on a single pipe segment.
    Returns Reynolds number, friction factor, head losses, velocity profile parameters,
    turbulence intensity, wall shear stress, water hammer parameters, and more.
    """
    fluid = await _resolve_fluid(req.fluid_slug, req.density_kg_m3, req.dynamic_viscosity_pa_s, db)
    geom = PipeGeometry(
        diameter=req.diameter_m,
        length=req.length_m,
        roughness=req.roughness_m,
        elevation_in=req.elevation_in_m,
        elevation_out=req.elevation_out_m,
    )

    state = calculate_pipe_hydraulics(req.flow_rate_m3s, geom, fluid, req.minor_loss_K)

    V = abs(state.velocity)
    A = geom.area
    Re = state.reynolds_number
    f = state.friction_factor
    R = geom.diameter / 2

    # Turbulence
    I = turbulence_intensity(Re)
    k_t = turbulent_kinetic_energy(I, V)

    # Wall shear
    tau_w = state.wall_shear_stress
    u_star = friction_velocity(tau_w, fluid.density)

    # Velocity profile
    if state.flow_regime == FlowRegime.LAMINAR:
        v_cl = 2 * V
        v_half = velocity_profile_laminar(R / 2, R, V)
        alpha = 2.0
    else:
        n_exp = 7.0
        v_cl = V * (n_exp + 1) * (2 * n_exp + 1) / (2 * n_exp ** 2)
        v_half = velocity_profile_turbulent_power_law(R / 2, R, V, n_exp)
        alpha = coriolis_coefficient_alpha(n_exp)

    # Fanning friction factor
    f_fanning = f / 4.0

    # Dynamic pressure
    q_dyn = 0.5 * fluid.density * V ** 2

    # Euler number
    eu = euler_number(state.pressure_drop, fluid.density, V) if V > 0 else 0.0

    # Cavitation number (at pipe inlet, assume local_pressure = reference_pressure)
    sigma = cavitation_number(101325.0, fluid.vapor_pressure, fluid.density, V)

    # Minor losses
    dP_minor = req.minor_loss_K * 0.5 * fluid.density * V ** 2
    h_minor = req.minor_loss_K * V ** 2 / (2 * 9.80665)

    # Elevation pressure change
    dz = req.elevation_out_m - req.elevation_in_m
    dP_elevation = fluid.density * 9.80665 * dz

    # Total pressure drop
    dP_total = state.pressure_drop + dP_minor + dP_elevation

    # Hydraulic power
    P_hydraulic = abs(req.flow_rate_m3s) * abs(dP_total)

    # Water hammer
    a = wave_speed_joukowski(
        fluid.bulk_modulus, fluid.density,
        req.diameter_m, 0.005, 200e9
    )
    dP_wh = joukowski_pressure_surge(fluid.density, a, V)
    tc = critical_closure_time(req.length_m, a)

    # Mach number
    Ma = mach_number(V, fluid.speed_of_sound)

    return SinglePipeAnalysisResult(
        diameter_m=req.diameter_m,
        length_m=req.length_m,
        flow_rate_m3s=req.flow_rate_m3s,
        roughness_m=req.roughness_m,
        fluid_name=fluid.name,
        pipe_area_m2=A,
        relative_roughness=geom.relative_roughness,
        velocity_m_s=state.velocity,
        reynolds_number=Re,
        friction_factor_darcy=f,
        friction_factor_fanning=f_fanning,
        flow_regime=state.flow_regime.value,
        darcy_weisbach_head_loss_m=state.head_loss,
        minor_loss_head_m=h_minor,
        total_head_loss_m=state.head_loss + h_minor,
        friction_pressure_drop_pa=state.pressure_drop,
        minor_pressure_drop_pa=dP_minor,
        static_pressure_drop_pa=dP_elevation,
        total_pressure_drop_pa=dP_total,
        dynamic_pressure_pa=q_dyn,
        velocity_head_m=V ** 2 / (2 * 9.80665),
        kinetic_energy_coeff_alpha=alpha,
        wall_shear_stress_pa=tau_w,
        friction_velocity_m_s=u_star,
        turbulence_intensity_pct=I * 100,
        turbulent_kinetic_energy_m2s2=k_t,
        mach_number=Ma,
        euler_number=eu,
        cavitation_number=min(sigma, 1e6),
        centerline_velocity_m_s=v_cl,
        velocity_at_half_radius_m_s=v_half,
        velocity_at_wall_m_s=0.0,
        hydraulic_power_w=P_hydraulic,
        wave_speed_m_s=a,
        joukowski_pressure_surge_pa=dP_wh,
        critical_closure_time_s=tc,
    )


@router.get("/velocity-profile/{pipe_id}")
async def get_velocity_profile(
    pipe_id: str,
    sim_id: str = Query(...),
    n_points: int = Query(50, ge=5, le=200),
    db: AsyncSession = Depends(get_db),
):
    """
    Return the radial velocity profile for a pipe given simulation results.
    """
    from app.models.fluid import PipeModel, SimulationModel, NetworkModel

    pipe_db = await db.get(PipeModel, pipe_id)
    if not pipe_db:
        raise HTTPException(status_code=404, detail="Pipe not found")

    sim_db = await db.get(SimulationModel, sim_id)
    if not sim_db or not sim_db.pipe_results:
        raise HTTPException(status_code=404, detail="Simulation results not found")

    pipe_result = sim_db.pipe_results.get(pipe_id)
    if not pipe_result:
        raise HTTPException(status_code=404, detail="No result for this pipe in simulation")

    network_db = await db.get(NetworkModel, pipe_db.network_id)
    fluid = await _resolve_fluid(None, None, None, db)
    if network_db:
        result = await db.execute(select(FluidModel).where(FluidModel.id == network_db.fluid_id))
        fluid_db = result.scalar_one_or_none()
        if fluid_db:
            fluid = FluidProperties(
                name=fluid_db.name,
                density=fluid_db.density_kg_m3,
                viscosity=fluid_db.dynamic_viscosity_pa_s,
                bulk_modulus=fluid_db.bulk_modulus_pa,
                vapor_pressure=fluid_db.vapor_pressure_pa,
                surface_tension=fluid_db.surface_tension_n_m,
                specific_heat=fluid_db.specific_heat_j_kg_k,
                thermal_conductivity=fluid_db.thermal_conductivity_w_m_k,
                compressible=fluid_db.compressible,
            )

    V = abs(pipe_result["velocity_m_s"])
    Re = pipe_result["reynolds_number"]
    R = pipe_db.diameter_m / 2
    regime = pipe_result["flow_regime"]
    f = pipe_result["friction_factor"]

    tau_w = wall_shear_stress_from_f(f, fluid.density, V)
    u_star = friction_velocity(tau_w, fluid.density)

    profile_points = []
    for i in range(n_points + 1):
        r_norm = i / n_points   # 0 (wall) → 1 (center)
        r_from_wall = r_norm * R
        r_from_center = R - r_from_wall

        if regime == "laminar":
            vel = velocity_profile_laminar(r_from_center, R, V)
        else:
            n_exp = 7.0
            vel = velocity_profile_turbulent_power_law(r_from_wall, R, V, n_exp)

        yp = y_plus(r_from_wall + 1e-9, u_star, fluid.kinematic_viscosity)
        profile_points.append(VelocityProfilePoint(
            r_normalized=r_norm,
            r_m=r_from_wall,
            velocity_m_s=vel,
            y_plus=yp,
        ))

    n_exp = 7.0
    alpha = 2.0 if regime == "laminar" else coriolis_coefficient_alpha(n_exp)
    v_cl = 2 * V if regime == "laminar" else V * (n_exp + 1) * (2 * n_exp + 1) / (2 * n_exp ** 2)

    return VelocityProfileResult(
        pipe_id=pipe_id,
        regime=regime,
        n_radial_points=len(profile_points),
        profile=profile_points,
        mean_velocity_m_s=V,
        centerline_velocity_m_s=v_cl,
        coriolis_coefficient=alpha,
    )


@router.get("/friction-factor-comparison")
async def compare_friction_factors(
    re: float = Query(..., gt=0, description="Reynolds number"),
    eps_d: float = Query(0.001, ge=0, le=0.05, description="Relative roughness ε/D"),
):
    """
    Compare all friction factor correlations at a given Re and ε/D.
    Returns Moody, Colebrook, Swamee-Jain, Churchill, laminar.
    """
    from app.services.physics import (
        friction_factor_laminar, friction_factor_colebrook,
        friction_factor_swamee_jain, friction_factor_churchill,
        friction_factor_moody, identify_flow_regime,
    )

    regime = identify_flow_regime(re, eps_d)

    return {
        "reynolds_number": re,
        "relative_roughness": eps_d,
        "flow_regime": regime.value,
        "friction_factors": {
            "laminar_hagen_poiseuille": friction_factor_laminar(re) if re < 2300 else None,
            "colebrook_white": friction_factor_colebrook(re, eps_d),
            "swamee_jain": friction_factor_swamee_jain(re, eps_d),
            "churchill": friction_factor_churchill(re, eps_d),
            "moody_recommended": friction_factor_moody(re, eps_d),
        },
        "notes": {
            "colebrook_white": "Implicit equation, solved by Newton-Raphson. ±0% error (reference).",
            "swamee_jain": "Explicit approximation. ±3% error vs Colebrook.",
            "churchill": "Single equation spanning all regimes. ±1% error vs Colebrook.",
        }
    }


@router.get("/moody-chart-data")
async def get_moody_chart_data(
    n_re_points: int = Query(100, ge=20, le=500),
    n_roughness_lines: int = Query(8, ge=3, le=15),
):
    """
    Return data points for generating the Moody diagram.
    Returns multiple friction factor curves across Re range for different ε/D values.
    """
    from app.services.physics import friction_factor_moody, identify_flow_regime
    import numpy as np

    # Log-spaced Re from 100 to 1e8
    re_values = list(10 ** x for x in
                     [i * (8 - 2) / (n_re_points - 1) + 2 for i in range(n_re_points)])

    eps_d_values = [0, 1e-6, 1e-5, 5e-5, 1e-4, 5e-4, 1e-3, 5e-3, 1e-2, 5e-2][:n_roughness_lines]

    curves = {}
    for eps_d in eps_d_values:
        label = f"ε/D = {eps_d:.1e}" if eps_d > 0 else "Smooth (ε/D = 0)"
        curves[label] = {
            "eps_d": eps_d,
            "data": [
                {
                    "re": re,
                    "f": friction_factor_moody(re, eps_d),
                    "regime": identify_flow_regime(re, eps_d).value,
                }
                for re in re_values
            ]
        }

    return {
        "n_reynolds_points": n_re_points,
        "re_range": [100, 1e8],
        "laminar_line": [{"re": re, "f": 64.0 / re} for re in re_values if re < 4000],
        "transition_band": {"re_start": 2300, "re_end": 4000},
        "roughness_curves": curves,
    }
