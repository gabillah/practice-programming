"""
Simulation Endpoints
=====================
Run CFD solver, manage simulation history, retrieve results.
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.fluid import (
    SimulationModel, NetworkModel, NodeModel, PipeModel, FluidModel
)
from app.schemas.schemas import (
    SimulationCreate, SimulationResponse, SimulationResultsResponse,
    SolverSettingsSchema,
)
from app.services.solver import (
    solve_network, NodeBC, PipeBC, SolverSettings
)
from app.services.physics import FluidProperties

logger = logging.getLogger("flowsim.simulations")
router = APIRouter()


# ===========================================================================
# Helpers
# ===========================================================================

async def _load_fluid(fluid_id: str, db: AsyncSession) -> FluidProperties:
    fluid_db = await db.get(FluidModel, fluid_id)
    if not fluid_db:
        raise HTTPException(status_code=404, detail="Fluid not found")
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


async def _run_simulation(sim_id: str) -> None:
    """Background task to execute the solver for a simulation."""
    from app.core.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        sim = await db.get(SimulationModel, sim_id)
        if not sim:
            return

        sim.status = "running"
        sim.started_at = datetime.now(timezone.utc)
        await db.commit()

        try:
            network = await db.get(NetworkModel, sim.network_id)
            if not network:
                raise ValueError(f"Network {sim.network_id} not found")

            fluid = await _load_fluid(network.fluid_id, db)
            g = network.gravity_m_s2

            nodes_res = await db.execute(
                select(NodeModel).where(NodeModel.network_id == network.id)
            )
            pipes_res = await db.execute(
                select(PipeModel).where(PipeModel.network_id == network.id)
            )
            nodes_db = nodes_res.scalars().all()
            pipes_db = pipes_res.scalars().all()

            if len(nodes_db) < 2:
                raise ValueError("Network must have at least 2 nodes")
            if len(pipes_db) < 1:
                raise ValueError("Network must have at least 1 pipe")

            # Build solver inputs
            nodes_bc = [
                NodeBC(
                    node_id=n.id,
                    demand_m3s=n.demand_m3s,
                    fixed_head_m=n.fixed_head_m,
                    fixed_pressure_pa=n.fixed_pressure_pa,
                    elevation_m=n.elevation_m,
                )
                for n in nodes_db
            ]

            def _compute_valve_K(pipe_db: PipeModel) -> float:
                if not pipe_db.valve_open:
                    return 1e9  # closed valve = huge resistance
                if pipe_db.valve_type == "gate":
                    from app.services.physics import MinorLossCoefficients as MLC
                    setting = pipe_db.valve_setting
                    if setting >= 1.0:
                        return MLC.GATE_VALVE_FULLY_OPEN
                    elif setting >= 0.5:
                        return MLC.GATE_VALVE_HALF_OPEN
                    else:
                        return MLC.GATE_VALVE_QUARTER_OPEN
                return 0.0

            # Compute fittings K
            def _fittings_K(pipe_db: PipeModel) -> float:
                if pipe_db.fittings:
                    from app.schemas.schemas import FittingsConfig
                    try:
                        fc = FittingsConfig(**pipe_db.fittings)
                        return fc.total_K()
                    except Exception:
                        pass
                return pipe_db.minor_loss_K

            pipes_bc = [
                PipeBC(
                    pipe_id=p.id,
                    node_from=p.node_from_id,
                    node_to=p.node_to_id,
                    diameter_m=p.diameter_m,
                    length_m=p.length_m,
                    roughness_m=p.roughness_m,
                    minor_K=_fittings_K(p),
                    elevation_from=nodes_db[
                        next(i for i, n in enumerate(nodes_db) if n.id == p.node_from_id)
                    ].elevation_m if any(n.id == p.node_from_id for n in nodes_db) else 0.0,
                    elevation_to=nodes_db[
                        next(i for i, n in enumerate(nodes_db) if n.id == p.node_to_id)
                    ].elevation_m if any(n.id == p.node_to_id for n in nodes_db) else 0.0,
                    is_pump=p.has_pump,
                    pump_head_m=p.pump_rated_head_m,
                    initial_flow_m3s=p.initial_flow_m3s,
                    valve_open=p.valve_open,
                    valve_K=_compute_valve_K(p),
                )
                for p in pipes_db
            ]

            settings = SolverSettings(
                max_iterations=sim.max_iterations,
                convergence_tol=sim.convergence_tol,
                relaxation=sim.relaxation_factor,
                use_gradient_method=(sim.solver_type == "gradient"),
                verbose=False,
            )

            # Run solver in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            solution = await loop.run_in_executor(
                None,
                lambda: solve_network(nodes_bc, pipes_bc, fluid, settings, g)
            )

            # Serialize results
            pipe_results_dict = {
                pid: {
                    "flow_m3s": r.flow_m3s,
                    "velocity_m_s": r.velocity_m_s,
                    "reynolds_number": r.reynolds_number,
                    "friction_factor": r.friction_factor,
                    "head_loss_m": r.head_loss_m,
                    "pressure_drop_pa": r.pressure_drop_pa,
                    "minor_head_loss_m": r.minor_head_loss_m,
                    "total_head_loss_m": r.total_head_loss_m,
                    "flow_regime": r.flow_regime,
                    "turbulence_intensity_pct": r.turbulence_intensity_pct,
                    "wall_shear_stress_pa": r.wall_shear_stress_pa,
                    "resistance_R": r.resistance_R,
                    "direction": r.direction,
                }
                for pid, r in solution.pipe_results.items()
            }

            node_results_dict = {
                nid: {
                    "pressure_head_m": r.pressure_head_m,
                    "elevation_m": r.elevation_m,
                    "hydraulic_grade_m": r.hydraulic_grade_m,
                    "energy_grade_m": r.energy_grade_m,
                    "pressure_pa": r.pressure_pa,
                    "demand_m3s": r.demand_m3s,
                    "inflow_m3s": r.inflow_m3s,
                    "outflow_m3s": r.outflow_m3s,
                    "balance_error_m3s": r.balance_error_m3s,
                }
                for nid, r in solution.node_results.items()
            }

            sim.status = "converged" if solution.converged else "failed"
            sim.converged = solution.converged
            sim.iterations_used = solution.iterations
            sim.max_residual = solution.max_residual_m3s
            sim.total_head_loss_m = solution.total_head_loss_m
            sim.total_power_w = solution.total_power_w
            sim.solve_time_s = solution.solve_time_s
            sim.pipe_results = pipe_results_dict
            sim.node_results = node_results_dict
            sim.convergence_history = solution.convergence_history
            sim.warnings = solution.warnings
            sim.completed_at = datetime.now(timezone.utc)

            if not solution.converged:
                sim.error_message = f"Solver did not converge in {solution.iterations} iterations. Max residual: {solution.max_residual_m3s:.2e}"

            await db.commit()
            logger.info("Simulation %s completed: converged=%s in %d iter",
                        sim_id, solution.converged, solution.iterations)

        except Exception as exc:
            logger.exception("Simulation %s failed: %s", sim_id, exc)
            async with AsyncSessionLocal() as db2:
                sim2 = await db2.get(SimulationModel, sim_id)
                if sim2:
                    sim2.status = "failed"
                    sim2.error_message = str(exc)
                    sim2.completed_at = datetime.now(timezone.utc)
                    await db2.commit()


# ===========================================================================
# Endpoints
# ===========================================================================

@router.post("/", response_model=SimulationResponse, status_code=202)
async def create_and_run_simulation(
    data: SimulationCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a simulation and immediately queue it for execution.
    Returns 202 Accepted with simulation ID for polling.
    """
    network = await db.get(NetworkModel, data.network_id)
    if not network:
        raise HTTPException(status_code=404, detail="Network not found")

    cfg = data.solver_settings or SolverSettingsSchema()
    sim = SimulationModel(
        network_id=data.network_id,
        name=data.name,
        status="pending",
        solver_type="gradient" if cfg.use_gradient_method else "hardy_cross",
        max_iterations=cfg.max_iterations,
        convergence_tol=cfg.convergence_tol,
        relaxation_factor=cfg.relaxation,
    )
    db.add(sim)
    await db.flush()
    await db.refresh(sim)
    sim_id = sim.id
    await db.commit()

    background_tasks.add_task(_run_simulation, sim_id)
    return sim


@router.post("/{sim_id}/run", response_model=SimulationResponse, status_code=202)
async def re_run_simulation(
    sim_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Re-run an existing simulation (reset status and re-execute)."""
    sim = await db.get(SimulationModel, sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    if sim.status == "running":
        raise HTTPException(status_code=409, detail="Simulation already running")

    sim.status = "pending"
    sim.converged = None
    sim.iterations_used = None
    sim.pipe_results = None
    sim.node_results = None
    sim.error_message = None
    await db.commit()

    background_tasks.add_task(_run_simulation, sim_id)
    return sim


@router.get("/", response_model=List[SimulationResponse])
async def list_simulations(
    network_id: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    q = select(SimulationModel)
    if network_id:
        q = q.where(SimulationModel.network_id == network_id)
    result = await db.execute(q.offset(skip).limit(limit).order_by(SimulationModel.created_at.desc()))
    return result.scalars().all()


@router.get("/{sim_id}", response_model=SimulationResponse)
async def get_simulation_status(sim_id: str, db: AsyncSession = Depends(get_db)):
    sim = await db.get(SimulationModel, sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return sim


@router.get("/{sim_id}/results", response_model=SimulationResultsResponse)
async def get_simulation_results(sim_id: str, db: AsyncSession = Depends(get_db)):
    """Return full results including per-pipe and per-node data."""
    sim = await db.get(SimulationModel, sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    if sim.status not in ("converged", "failed"):
        raise HTTPException(status_code=425, detail=f"Simulation not yet complete (status: {sim.status})")
    return sim


@router.delete("/{sim_id}", status_code=204)
async def delete_simulation(sim_id: str, db: AsyncSession = Depends(get_db)):
    sim = await db.get(SimulationModel, sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    await db.delete(sim)
