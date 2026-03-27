"""
==============================================================================
CFD PIPE FLOW SOLVER - API Routes (all routes in one file for clarity)
==============================================================================
Routes:
  /health            - health check
  /networks          - CRUD for piping networks
  /nodes             - node management
  /pipes             - pipe management
  /solvers           - run CFD solvers
  /materials         - fluid / pipe material library
  /results           - fetch and visualise results
  /export            - export results
  /validation        - pre-solve validation
  /templates         - network templates
  /history           - solve history
==============================================================================
"""

# NOTE: In a production codebase these would be split into separate files
# under api/routes/. For this tutorial we organise them as submodules of
# this single file using classes + FastAPI routers.

from __future__ import annotations

import uuid
import json
import math
import io
import csv
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

# Import all internal modules
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.database import (
    get_db, NetworkCRUD, SolveResultCRUD,
    NetworkModel, SolveResultModel, MaterialModel, TemplateModel,
    FLUID_DATABASE as _fluid_db,
)
from models.schemas import (
    NetworkCreateSchema, NetworkUpdateSchema, NetworkSummarySchema, NetworkDetailSchema,
    NodeCreateSchema, NodeUpdateSchema,
    PipeCreateSchema, PipeUpdateSchema,
    SolverConfigSchema, SolveRequest, SolveInlineRequest,
    SolveResultSchema, NetworkStatsSchema, PipeResultSchema, NodeResultSchema,
    FluidPropertiesSchema, VisualisationRequest, VisualisationResponse,
    ColourLegendSchema, ColourStop, PipeVisualSchema,
    ValidationResult, ValidationIssue,
    TemplateInfo, TemplateApplyRequest,
    ExportRequest, MoodyChartRequest, MoodyChartResponse,
    SolveHistoryItem, PaginatedResponse, ErrorResponse, SuccessResponse,
    FittingSchema,
)
from cfd.solver import (
    CFDNetworkSolver, FluidProperties, PipeSegment, NetworkNode, SolverConfig,
    NetworkTopology, CFDStatistics,
    velocity_to_color, pressure_to_color, temperature_to_color, colormap_legend,
    friction_factor_moody, PIPE_ROUGHNESS_DB, FLUID_DATABASE, GRAVITY, PI,
)

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def schema_to_fluid(f: FluidPropertiesSchema) -> FluidProperties:
    return FluidProperties(
        name                = f.name,
        density             = f.density,
        dynamic_viscosity   = f.dynamic_viscosity,
        bulk_modulus        = f.bulk_modulus,
        vapour_pressure     = f.vapour_pressure,
        specific_heat       = f.specific_heat,
        thermal_conductivity = f.thermal_conductivity,
        surface_tension     = f.surface_tension,
        temperature         = f.temperature,
        rheology_model      = f.rheology_model.value,
        consistency_index   = f.consistency_index,
        flow_behaviour_index = f.flow_behaviour_index,
        yield_stress        = f.yield_stress,
        molar_mass          = f.molar_mass,
        ratio_specific_heats = f.ratio_specific_heats,
        is_compressible     = f.is_compressible,
    )


def schema_to_node(n: NodeCreateSchema) -> NetworkNode:
    return NetworkNode(
        id             = n.id,
        elevation      = n.elevation,
        external_flow  = n.external_flow,
        is_reservoir   = n.is_reservoir,
        fixed_head     = n.fixed_head,
        is_pressure_bc = n.is_pressure_bc,
        fixed_pressure = n.fixed_pressure,
        temperature    = n.temperature,
    )


def schema_to_pipe(p: PipeCreateSchema) -> PipeSegment:
    pump_curve = [(pt.flow_rate, pt.head) for pt in p.pump_curve]
    return PipeSegment(
        id              = p.id,
        node_start      = p.node_start,
        node_end        = p.node_end,
        length          = p.length,
        diameter        = p.diameter,
        roughness       = p.computed_roughness(),
        elevation_start = p.elevation_start,
        elevation_end   = p.elevation_end,
        flow_rate       = p.initial_flow,
        thickness       = p.thickness,
        young_modulus   = p.young_modulus,
        poisson_ratio   = p.poisson_ratio,
        fittings_K      = p.computed_fittings_K(),
        is_valve        = p.is_valve,
        valve_open_frac = p.valve_open_fraction,
        is_pump         = p.is_pump,
        pump_curve      = pump_curve,
        heat_flux       = p.heat_flux,
        insulation_R    = p.insulation_R,
    )


def schema_to_config(cfg: SolverConfigSchema) -> SolverConfig:
    return SolverConfig(
        method              = cfg.method.value,
        max_iterations      = cfg.max_iterations,
        tolerance           = cfg.tolerance,
        relaxation          = cfg.relaxation,
        solve_heat          = cfg.solve_heat,
        solve_transient     = cfg.solve_transient,
        transient_dt        = cfg.transient_dt,
        transient_duration  = cfg.transient_duration,
        turbulence_model    = cfg.turbulence_model.value,
        two_phase           = cfg.two_phase,
        vapour_quality      = cfg.vapour_quality,
        verbose             = cfg.verbose,
        check_cavitation    = cfg.check_cavitation,
    )


def _dict_to_pipe_schema(d: Dict) -> PipeCreateSchema:
    """Convert a dict (from DB JSON) to PipeCreateSchema."""
    fittings = []
    for f in d.get("fittings", []):
        from models.schemas import FittingType
        try:
            fittings.append(FittingSchema(
                type=FittingType(f["type"]),
                quantity=f.get("quantity", 1),
                K_override=f.get("K_override"),
            ))
        except Exception:
            pass

    pump_curve = []
    from models.schemas import PumpCurvePoint
    for pt in d.get("pump_curve", []):
        pump_curve.append(PumpCurvePoint(flow_rate=pt["flow_rate"], head=pt["head"]))

    from models.schemas import PipeMaterial
    mat_val = d.get("material")
    try:
        material = PipeMaterial(mat_val) if mat_val else PipeMaterial.commercial_steel
    except Exception:
        material = PipeMaterial.commercial_steel

    return PipeCreateSchema(
        id=d["id"], node_start=d["node_start"], node_end=d["node_end"],
        length=d.get("length", 100.0), diameter=d.get("diameter", 0.1),
        material=material,
        roughness=d.get("roughness"),
        elevation_start=d.get("elevation_start", 0.0),
        elevation_end=d.get("elevation_end", 0.0),
        thickness=d.get("thickness", 0.008),
        young_modulus=d.get("young_modulus", 200e9),
        poisson_ratio=d.get("poisson_ratio", 0.3),
        fittings=fittings,
        fittings_K_total=d.get("fittings_K_total"),
        is_valve=d.get("is_valve", False),
        valve_open_fraction=d.get("valve_open_fraction", 1.0),
        is_pump=d.get("is_pump", False),
        pump_curve=pump_curve,
        heat_flux=d.get("heat_flux", 0.0),
        insulation_R=d.get("insulation_R", 0.0),
        initial_flow=d.get("initial_flow", 0.001),
        label=d.get("label"),
        line_width=d.get("line_width", 3.0),
    )


def _run_cfd_solve(network: NetworkModel, config: SolverConfigSchema) -> Dict:
    """Run the CFD solver and return serialisable result dict."""
    fluid_dict = network.fluid
    fluid_schema = FluidPropertiesSchema(**fluid_dict)
    fluid = schema_to_fluid(fluid_schema)

    nodes = [schema_to_node(NodeCreateSchema(**n)) for n in network.nodes]
    pipes = [schema_to_pipe(_dict_to_pipe_schema(p)) for p in network.pipes]

    solver_config = schema_to_config(config)
    master = CFDNetworkSolver(fluid, solver_config)
    result = master.solve(nodes, pipes)

    # Build pipe display map (id → {x1,y1,x2,y2} from network's pipe list)
    pipe_positions = {p["id"]: {"node_start": p["node_start"], "node_end": p["node_end"]}
                      for p in network.pipes}
    node_positions = {n["id"]: {"x": n.get("x", 0), "y": n.get("y", 0),
                                  "label": n.get("label", n["id"])}
                      for n in network.nodes}

    # Enrich pipe results with colour
    v_values = [abs(pr["velocity"]) for pr in result.pipe_results]
    v_min = min(v_values) if v_values else 0.0
    v_max = max(v_values) if v_values else 1.0

    p_values = [pr["pressure_drop"] for pr in result.pipe_results]
    p_min = min(p_values) if p_values else 0.0
    p_max = max(p_values) if p_values else 1.0

    for pr in result.pipe_results:
        pr["display_color_velocity"]  = velocity_to_color(pr["velocity"], v_min, v_max)
        pr["display_color_pressure"]  = pressure_to_color(pr["pressure_drop"], p_min, p_max)
        pr["node_start"]  = pipe_positions.get(pr["id"], {}).get("node_start", "")
        pr["node_end"]    = pipe_positions.get(pr["id"], {}).get("node_end", "")
        pr["relative_roughness"] = 0.0  # will be computed below

    # Statistics
    stats = CFDStatistics.network_efficiency(result.pipe_results)
    result.network_stats.update(stats)
    result.network_stats["pressure_uniformity_index"] = CFDStatistics.pressure_uniformity_index(
        [nr["pressure"] for nr in result.node_results]
    )
    result.network_stats["flow_distribution_cv"] = CFDStatistics.flow_distribution_cv(
        [pr["flow_rate"] for pr in result.pipe_results]
    )

    # HGL
    hgl = CFDStatistics.hydraulic_grade_line(result.node_results, result.pipe_results)

    return {
        "converged":     result.converged,
        "iterations":    result.iterations,
        "residual":      result.residual,
        "pipe_results":  result.pipe_results,
        "node_results":  result.node_results,
        "network_stats": result.network_stats,
        "hgl":           hgl,
        "warnings":      result.warnings,
        "solver_log":    result.solver_log,
        "node_positions": node_positions,
        "colour_ranges": {
            "velocity":  {"min": v_min, "max": v_max},
            "pressure":  {"min": p_min, "max": p_max},
        },
    }


# ═════════════════════════════════════════════════════════════════════════════
# HEALTH
# ═════════════════════════════════════════════════════════════════════════════

router_health = APIRouter()

# These will be imported as 'health.router' etc. in main.py
# For simplicity in this tutorial, we collect all routers here

class _HealthModule:
    router = APIRouter()

    @staticmethod
    @router.get("/health")
    async def health():
        return {"status": "ok", "timestamp": now_iso()}

    @staticmethod
    @router.get("/health/detailed")
    async def health_detailed(db: AsyncSession = Depends(get_db)):
        try:
            from sqlalchemy import text
            await db.execute(text("SELECT 1"))
            db_status = "ok"
        except Exception as e:
            db_status = f"error: {e}"
        return {
            "status": "ok" if db_status == "ok" else "degraded",
            "database": db_status,
            "timestamp": now_iso(),
        }

health = _HealthModule


# ═════════════════════════════════════════════════════════════════════════════
# NETWORKS
# ═════════════════════════════════════════════════════════════════════════════

class _NetworksModule:
    router = APIRouter()

    @staticmethod
    @router.post("/networks", status_code=201)
    async def create_network(
        body: NetworkCreateSchema,
        db: AsyncSession = Depends(get_db),
    ):
        crud = NetworkCRUD(db)
        data = body.model_dump()
        network = await crud.create(data)
        return network.to_detail_dict()

    @staticmethod
    @router.get("/networks")
    async def list_networks(
        page: int      = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        name: Optional[str] = Query(None),
        db: AsyncSession = Depends(get_db),
    ):
        crud = NetworkCRUD(db)
        return await crud.list_all(page=page, page_size=page_size, name_filter=name)

    @staticmethod
    @router.get("/networks/{network_id}")
    async def get_network(network_id: str, db: AsyncSession = Depends(get_db)):
        crud = NetworkCRUD(db)
        network = await crud.get_by_id(network_id)
        if not network:
            raise HTTPException(404, f"Network '{network_id}' not found")
        return network.to_detail_dict()

    @staticmethod
    @router.put("/networks/{network_id}")
    async def update_network(
        network_id: str,
        body: NetworkUpdateSchema,
        db: AsyncSession = Depends(get_db),
    ):
        crud = NetworkCRUD(db)
        updated = await crud.update(network_id, body.model_dump(exclude_none=True))
        if not updated:
            raise HTTPException(404, f"Network '{network_id}' not found")
        return updated.to_detail_dict()

    @staticmethod
    @router.delete("/networks/{network_id}", status_code=204)
    async def delete_network(network_id: str, db: AsyncSession = Depends(get_db)):
        crud = NetworkCRUD(db)
        deleted = await crud.delete(network_id)
        if not deleted:
            raise HTTPException(404, f"Network '{network_id}' not found")

    @staticmethod
    @router.post("/networks/{network_id}/duplicate")
    async def duplicate_network(
        network_id: str,
        new_name: str = Query(..., description="Name for the duplicate"),
        db: AsyncSession = Depends(get_db),
    ):
        crud = NetworkCRUD(db)
        original = await crud.get_by_id(network_id)
        if not original:
            raise HTTPException(404, f"Network '{network_id}' not found")
        data = original.to_detail_dict()
        data.pop("id", None)
        data["name"] = new_name
        data.pop("created_at", None)
        data.pop("updated_at", None)
        data.pop("last_solve_status", None)
        new_net = await crud.create(data)
        return new_net.to_detail_dict()

    @staticmethod
    @router.get("/networks/{network_id}/topology")
    async def get_topology(network_id: str, db: AsyncSession = Depends(get_db)):
        crud = NetworkCRUD(db)
        network = await crud.get_by_id(network_id)
        if not network:
            raise HTTPException(404)
        nodes = [schema_to_node(NodeCreateSchema(**n)) for n in network.nodes]
        pipes = [schema_to_pipe(_dict_to_pipe_schema(p)) for p in network.pipes]
        topo = NetworkTopology(nodes, pipes)
        A, node_ids, pipe_ids = topo.incidence_matrix()
        loops = topo.fundamental_loops()
        return {
            "connected":     topo.is_connected(),
            "node_count":    len(nodes),
            "pipe_count":    len(pipes),
            "loop_count":    len(loops),
            "loops":         loops,
            "node_degrees":  topo.node_degrees(),
            "incidence_matrix_shape": list(A.shape),
        }

networks = _NetworksModule


# ═════════════════════════════════════════════════════════════════════════════
# NODES  (add/update/delete individual nodes on an existing network)
# ═════════════════════════════════════════════════════════════════════════════

class _NodesModule:
    router = APIRouter()

    @staticmethod
    @router.post("/networks/{network_id}/nodes", status_code=201)
    async def add_node(
        network_id: str,
        body: NodeCreateSchema,
        db: AsyncSession = Depends(get_db),
    ):
        crud = NetworkCRUD(db)
        network = await crud.get_by_id(network_id)
        if not network:
            raise HTTPException(404)
        node_list = network.nodes
        if any(n["id"] == body.id for n in node_list):
            raise HTTPException(409, f"Node '{body.id}' already exists")
        node_list.append(body.model_dump())
        await crud.update(network_id, {"nodes_json": json.dumps(node_list)})
        return body.model_dump()

    @staticmethod
    @router.put("/networks/{network_id}/nodes/{node_id}")
    async def update_node(
        network_id: str, node_id: str,
        body: NodeUpdateSchema,
        db: AsyncSession = Depends(get_db),
    ):
        crud = NetworkCRUD(db)
        network = await crud.get_by_id(network_id)
        if not network:
            raise HTTPException(404)
        node_list = network.nodes
        for i, n in enumerate(node_list):
            if n["id"] == node_id:
                updates = body.model_dump(exclude_none=True)
                node_list[i].update(updates)
                await crud.update(network_id, {"nodes_json": json.dumps(node_list)})
                return node_list[i]
        raise HTTPException(404, f"Node '{node_id}' not found")

    @staticmethod
    @router.delete("/networks/{network_id}/nodes/{node_id}", status_code=204)
    async def delete_node(
        network_id: str, node_id: str,
        db: AsyncSession = Depends(get_db),
    ):
        crud = NetworkCRUD(db)
        network = await crud.get_by_id(network_id)
        if not network:
            raise HTTPException(404)
        node_list = [n for n in network.nodes if n["id"] != node_id]
        await crud.update(network_id, {"nodes_json": json.dumps(node_list)})

nodes = _NodesModule


# ═════════════════════════════════════════════════════════════════════════════
# PIPES
# ═════════════════════════════════════════════════════════════════════════════

class _PipesModule:
    router = APIRouter()

    @staticmethod
    @router.post("/networks/{network_id}/pipes", status_code=201)
    async def add_pipe(
        network_id: str,
        body: PipeCreateSchema,
        db: AsyncSession = Depends(get_db),
    ):
        crud = NetworkCRUD(db)
        network = await crud.get_by_id(network_id)
        if not network:
            raise HTTPException(404)
        node_ids = {n["id"] for n in network.nodes}
        if body.node_start not in node_ids:
            raise HTTPException(422, f"node_start '{body.node_start}' not found")
        if body.node_end not in node_ids:
            raise HTTPException(422, f"node_end '{body.node_end}' not found")
        pipe_list = network.pipes
        if any(p["id"] == body.id for p in pipe_list):
            raise HTTPException(409, f"Pipe '{body.id}' already exists")
        pipe_list.append(body.model_dump())
        await crud.update(network_id, {"pipes_json": json.dumps(pipe_list)})
        return body.model_dump()

    @staticmethod
    @router.put("/networks/{network_id}/pipes/{pipe_id}")
    async def update_pipe(
        network_id: str, pipe_id: str,
        body: PipeUpdateSchema,
        db: AsyncSession = Depends(get_db),
    ):
        crud = NetworkCRUD(db)
        network = await crud.get_by_id(network_id)
        if not network:
            raise HTTPException(404)
        pipe_list = network.pipes
        for i, p in enumerate(pipe_list):
            if p["id"] == pipe_id:
                updates = body.model_dump(exclude_none=True)
                pipe_list[i].update(updates)
                await crud.update(network_id, {"pipes_json": json.dumps(pipe_list)})
                return pipe_list[i]
        raise HTTPException(404)

    @staticmethod
    @router.delete("/networks/{network_id}/pipes/{pipe_id}", status_code=204)
    async def delete_pipe(
        network_id: str, pipe_id: str,
        db: AsyncSession = Depends(get_db),
    ):
        crud = NetworkCRUD(db)
        network = await crud.get_by_id(network_id)
        if not network:
            raise HTTPException(404)
        pipe_list = [p for p in network.pipes if p["id"] != pipe_id]
        await crud.update(network_id, {"pipes_json": json.dumps(pipe_list)})

    @staticmethod
    @router.get("/networks/{network_id}/pipes/{pipe_id}/moody")
    async def pipe_moody_data(
        network_id: str, pipe_id: str,
        n_points: int = Query(200, ge=50, le=1000),
        db: AsyncSession = Depends(get_db),
    ):
        """Get Moody chart position for a specific pipe."""
        crud = NetworkCRUD(db)
        network = await crud.get_by_id(network_id)
        if not network:
            raise HTTPException(404)
        pipe_dict = next((p for p in network.pipes if p["id"] == pipe_id), None)
        if not pipe_dict:
            raise HTTPException(404)
        p = _dict_to_pipe_schema(pipe_dict)
        eps_D = p.computed_roughness() / p.diameter
        # Return the operating point from last solve if available
        return {
            "pipe_id":           pipe_id,
            "relative_roughness": eps_D,
            "diameter_m":        p.diameter,
            "roughness_m":       p.computed_roughness(),
            "length_m":          p.length,
        }

pipes = _PipesModule


# ═════════════════════════════════════════════════════════════════════════════
# SOLVERS
# ═════════════════════════════════════════════════════════════════════════════

class _SolversModule:
    router = APIRouter()

    @staticmethod
    @router.post("/solve/{network_id}")
    async def solve_network(
        network_id: str,
        config: SolverConfigSchema,
        db: AsyncSession = Depends(get_db),
    ):
        """Solve a stored network with given solver configuration."""
        crud_net  = NetworkCRUD(db)
        crud_res  = SolveResultCRUD(db)

        network = await crud_net.get_by_id(network_id)
        if not network:
            raise HTTPException(404, f"Network '{network_id}' not found")

        # Run solver
        try:
            result_dict = _run_cfd_solve(network, config)
        except Exception as e:
            raise HTTPException(500, f"Solver error: {str(e)}")

        # Persist
        solve_result = await crud_res.create(
            network_id  = network_id,
            result_dict = result_dict,
            config_dict = config.model_dump(),
        )

        return {
            "solve_id":   solve_result.id,
            "network_id": network_id,
            "timestamp":  solve_result.timestamp.isoformat(),
            **result_dict,
        }

    @staticmethod
    @router.post("/solve/inline")
    async def solve_inline(body: SolveInlineRequest):
        """Solve a network defined inline (stateless, no DB)."""
        # Create a mock NetworkModel-like object
        class _MockNetwork:
            def __init__(self, schema):
                self.fluid = schema.fluid.model_dump()
                self.nodes = [n.model_dump() for n in schema.nodes]
                self.pipes = [p.model_dump() for p in schema.pipes]

        mock_net = _MockNetwork(body.network)
        try:
            result_dict = _run_cfd_solve(mock_net, body.config)
        except Exception as e:
            raise HTTPException(500, f"Solver error: {str(e)}")

        return {
            "solve_id":   str(uuid.uuid4()),
            "network_id": "inline",
            "timestamp":  now_iso(),
            **result_dict,
        }

    @staticmethod
    @router.get("/moody-chart")
    async def moody_chart(
        Re_min: float  = Query(100.0,   gt=0),
        Re_max: float  = Query(1e8,     gt=0),
        n_points: int  = Query(200,     ge=50, le=1000),
    ):
        """Generate Moody chart data for a range of Re and roughness values."""
        import numpy as np
        rel_roughnesses = [0.0, 1e-6, 1e-5, 5e-5, 1e-4, 5e-4, 1e-3, 5e-3, 1e-2]
        Re_arr = np.logspace(
            math.log10(max(Re_min, 10)),
            math.log10(Re_max),
            n_points
        ).tolist()

        curves = []
        for eps_D in rel_roughnesses:
            f_vals = [friction_factor_moody(Re, eps_D) for Re in Re_arr]
            curves.append({"eps_D": eps_D, "f_values": f_vals})

        laminar_Re = [r for r in Re_arr if r <= 2300]
        laminar_f  = [64.0 / r for r in laminar_Re]

        return {
            "Re_values":       Re_arr,
            "curves":          curves,
            "laminar_line":    {"Re": laminar_Re, "f": laminar_f},
            "transition_band": {"Re_min": 2300, "Re_max": 4000},
        }

    @staticmethod
    @router.get("/pipe-flow-calculators/darcy-weisbach")
    async def darcy_weisbach_calc(
        flow_rate: float   = Query(..., gt=0,  description="m³/s"),
        diameter: float    = Query(..., gt=0,  description="m"),
        length: float      = Query(..., gt=0,  description="m"),
        roughness: float   = Query(4.6e-5,     description="m"),
        density: float     = Query(998.2,      description="kg/m³"),
        viscosity: float   = Query(1.002e-3,   description="Pa·s"),
    ):
        """Quick Darcy-Weisbach single-pipe calculator."""
        A   = PI * diameter**2 / 4.0
        V   = flow_rate / A
        nu  = viscosity / density
        Re  = V * diameter / nu
        eps_D = roughness / diameter
        f   = friction_factor_moody(Re, eps_D)
        hL  = f * (length / diameter) * V**2 / (2.0 * GRAVITY)
        dP  = hL * density * GRAVITY

        return {
            "flow_rate_m3s":    flow_rate,
            "velocity_ms":      round(V, 4),
            "reynolds_number":  round(Re, 1),
            "friction_factor":  round(f, 6),
            "head_loss_m":      round(hL, 4),
            "pressure_drop_Pa": round(dP, 2),
            "flow_regime":      "laminar" if Re < 2300 else ("transitional" if Re < 4000 else "turbulent"),
            "relative_roughness": round(eps_D, 8),
        }

solvers = _SolversModule


# ═════════════════════════════════════════════════════════════════════════════
# MATERIALS
# ═════════════════════════════════════════════════════════════════════════════

class _MaterialsModule:
    router = APIRouter()

    @staticmethod
    @router.get("/materials/fluids")
    async def list_fluid_presets():
        """List all built-in fluid presets."""
        result = []
        for key, data in FLUID_DATABASE.items():
            result.append({
                "id":   key,
                "name": data.get("name", key),
                "density":             data.get("density"),
                "dynamic_viscosity":   data.get("dynamic_viscosity"),
                "temperature":         data.get("temperature", 293.15),
                "is_compressible":     data.get("is_compressible", False),
            })
        return result

    @staticmethod
    @router.get("/materials/fluids/{preset_id}")
    async def get_fluid_preset(preset_id: str):
        if preset_id not in FLUID_DATABASE:
            raise HTTPException(404)
        return FLUID_DATABASE[preset_id]

    @staticmethod
    @router.get("/materials/pipe-roughness")
    async def list_pipe_roughness():
        return [
            {"material": k, "roughness_m": v, "roughness_mm": round(v * 1000, 6)}
            for k, v in PIPE_ROUGHNESS_DB.items()
        ]

    @staticmethod
    @router.get("/materials/fittings-k")
    async def list_fittings_k():
        """Return standard K-factor table for fittings."""
        from models.schemas import FittingSchema, FittingType
        dummy = FittingSchema(type=FittingType.elbow_90)
        return [
            {"fitting": k, "standard_K": v}
            for k, v in dummy.STANDARD_K.items()
        ]

materials = _MaterialsModule


# ═════════════════════════════════════════════════════════════════════════════
# RESULTS
# ═════════════════════════════════════════════════════════════════════════════

class _ResultsModule:
    router = APIRouter()

    @staticmethod
    @router.get("/results/{solve_id}")
    async def get_result(solve_id: str, db: AsyncSession = Depends(get_db)):
        crud = SolveResultCRUD(db)
        sr = await crud.get_by_id(solve_id)
        if not sr:
            raise HTTPException(404, f"Solve result '{solve_id}' not found")
        data = sr.get_result()
        data["solve_id"]   = sr.id
        data["network_id"] = sr.network_id
        data["timestamp"]  = sr.timestamp.isoformat()
        return data

    @staticmethod
    @router.get("/results/{solve_id}/visualise")
    async def visualise_result(
        solve_id: str,
        variable: str = Query("velocity"),
        db: AsyncSession = Depends(get_db),
    ):
        """Return colour-mapped pipe data for visualisation."""
        crud = SolveResultCRUD(db)
        sr   = await crud.get_by_id(solve_id)
        if not sr:
            raise HTTPException(404)
        data = sr.get_result()

        pipe_results = data.get("pipe_results", [])
        node_results = data.get("node_results", [])

        # Extract values for the chosen variable
        var_key = {
            "velocity":        "velocity",
            "pressure":        "pressure_drop",
            "temperature":     "temperature_out",
            "reynolds":        "reynolds_number",
            "head_loss":       "head_loss",
            "wall_shear":      "wall_shear_stress",
            "friction_factor": "friction_factor",
            "mach_number":     "mach_number",
        }.get(variable, "velocity")

        values = [abs(pr.get(var_key, 0.0)) for pr in pipe_results]
        v_min  = min(values) if values else 0.0
        v_max  = max(values) if values else 1.0

        # Build pipe visual objects
        color_fn = {
            "velocity":    velocity_to_color,
            "pressure":    pressure_to_color,
            "temperature": temperature_to_color,
        }.get(variable, velocity_to_color)

        unit_map = {
            "velocity": "m/s", "pressure": "Pa", "temperature": "K",
            "reynolds": "-", "head_loss": "m", "wall_shear": "Pa",
            "friction_factor": "-", "mach_number": "-",
        }

        pipes_visual = []
        node_pos = data.get("node_positions", {})
        for pr in pipe_results:
            val   = abs(pr.get(var_key, 0.0))
            color = color_fn(val, v_min, v_max)
            ns    = pr.get("node_start", "")
            ne    = pr.get("node_end",   "")
            pipes_visual.append({
                "id":          pr["id"],
                "node_start":  ns,
                "node_end":    ne,
                "display_color": color,
                "value":       round(val, 6),
                "variable":    variable,
                "line_width":  4.0,
                "tooltip":     (
                    f"{pr['id']}: {variable}={round(val, 4)} {unit_map.get(variable,'')}, "
                    f"Re={round(pr.get('reynolds_number',0),0)}, "
                    f"regime={pr.get('flow_regime','')}"
                ),
            })

        nodes_visual = []
        for nr in node_results:
            npos = node_pos.get(nr["id"], {})
            p_head = nr.get("pressure_head", 0.0)
            nodes_visual.append({
                "id":        nr["id"],
                "x":         npos.get("x", 0),
                "y":         npos.get("y", 0),
                "label":     npos.get("label", nr["id"]),
                "pressure_head_m": round(p_head, 2),
                "pressure_Pa":    round(nr.get("pressure", 0.0), 1),
                "elevation_m":    nr.get("elevation", 0.0),
                "temperature_K":  nr.get("temperature", 293.15),
            })

        legend = {
            "variable": variable,
            "unit":     unit_map.get(variable, ""),
            "min_value": round(v_min, 6),
            "max_value": round(v_max, 6),
            "stops":    colormap_legend(variable, v_min, v_max, 10),
        }
        stats = CFDStatistics.descriptive_stats(values)

        return {
            "solve_id":     solve_id,
            "variable":     variable,
            "pipes_visual": pipes_visual,
            "nodes_visual": nodes_visual,
            "legend":       legend,
            "stats":        stats,
        }

    @staticmethod
    @router.get("/networks/{network_id}/results")
    async def list_network_results(
        network_id: str,
        limit: int = Query(20, ge=1, le=100),
        db: AsyncSession = Depends(get_db),
    ):
        crud = SolveResultCRUD(db)
        items = await crud.list_for_network(network_id, limit=limit)
        return [i.to_history_dict() for i in items]

results = _ResultsModule


# ═════════════════════════════════════════════════════════════════════════════
# EXPORT
# ═════════════════════════════════════════════════════════════════════════════

class _ExportModule:
    router = APIRouter()

    @staticmethod
    @router.get("/export/{solve_id}/csv")
    async def export_csv(solve_id: str, db: AsyncSession = Depends(get_db)):
        """Export pipe results as CSV."""
        crud = SolveResultCRUD(db)
        sr   = await crud.get_by_id(solve_id)
        if not sr:
            raise HTTPException(404)
        data = sr.get_result()
        pipe_results = data.get("pipe_results", [])

        output = io.StringIO()
        if pipe_results:
            fieldnames = [
                "id", "node_start", "node_end", "flow_rate", "velocity",
                "reynolds_number", "friction_factor", "head_loss", "pressure_drop",
                "wall_shear_stress", "flow_regime", "nusselt_number",
                "heat_transfer_coeff", "temperature_out", "mach_number", "cavitation_number",
            ]
            writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
            writer.writeheader()
            for pr in pipe_results:
                row = {k: pr.get(k, "") for k in fieldnames}
                writer.writerow(row)

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=cfd_results_{solve_id[:8]}.csv"},
        )

    @staticmethod
    @router.get("/export/{solve_id}/json")
    async def export_json(solve_id: str, db: AsyncSession = Depends(get_db)):
        """Export full result as JSON."""
        crud = SolveResultCRUD(db)
        sr   = await crud.get_by_id(solve_id)
        if not sr:
            raise HTTPException(404)
        data = sr.get_result()
        content = json.dumps(data, indent=2)
        return StreamingResponse(
            iter([content]),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=cfd_result_{solve_id[:8]}.json"},
        )

export = _ExportModule


# ═════════════════════════════════════════════════════════════════════════════
# VALIDATION
# ═════════════════════════════════════════════════════════════════════════════

class _ValidationModule:
    router = APIRouter()

    @staticmethod
    @router.post("/validate/network")
    async def validate_network(body: NetworkCreateSchema):
        """Pre-solve validation of a network definition."""
        issues: List[Dict] = []

        # Check at least one fixed-head node
        fixed = [n for n in body.nodes if n.is_reservoir or n.is_pressure_bc]
        if not fixed:
            issues.append({
                "severity": "error",
                "code": "NO_BOUNDARY",
                "message": "Network has no fixed-head or pressure boundary conditions — solver will be underdetermined",
            })

        # Check flow balance
        total_ext = sum(n.external_flow for n in body.nodes)
        if abs(total_ext) > 1e-6:
            issues.append({
                "severity": "warning",
                "code": "FLOW_IMBALANCE",
                "message": f"Net external flow = {total_ext:.6f} m³/s (should be ~0 for closed systems)",
            })

        # Check pipe diameters
        for p in body.pipes:
            V_est = 0.05 / (PI * p.diameter**2 / 4)
            if V_est > 10.0:
                issues.append({
                    "severity": "warning",
                    "code": "HIGH_VELOCITY",
                    "message": f"Pipe '{p.id}': estimated velocity {V_est:.1f} m/s > 10 m/s (possible undersizing)",
                    "entity_type": "pipe",
                    "entity_id": p.id,
                })
            if p.length / p.diameter < 10:
                issues.append({
                    "severity": "info",
                    "code": "SHORT_PIPE",
                    "message": f"Pipe '{p.id}': L/D = {p.length/p.diameter:.1f} < 10 (heat/friction correlations may be less accurate)",
                    "entity_type": "pipe",
                    "entity_id": p.id,
                })

        # Topology check
        node_ids = {n.id for n in body.nodes}
        for p in body.pipes:
            if p.node_start == p.node_end:
                issues.append({
                    "severity": "error",
                    "code": "LOOP_PIPE",
                    "message": f"Pipe '{p.id}' has same start and end node '{p.node_start}'",
                    "entity_type": "pipe",
                    "entity_id": p.id,
                })

        valid = all(i["severity"] != "error" for i in issues)
        return {
            "valid":   valid,
            "issues":  issues,
            "summary": f"{len([i for i in issues if i['severity']=='error'])} errors, "
                       f"{len([i for i in issues if i['severity']=='warning'])} warnings",
        }

validation = _ValidationModule


# ═════════════════════════════════════════════════════════════════════════════
# TEMPLATES
# ═════════════════════════════════════════════════════════════════════════════

class _TemplatesModule:
    router = APIRouter()

    @staticmethod
    @router.get("/templates")
    async def list_templates(db: AsyncSession = Depends(get_db)):
        from sqlalchemy.future import select
        result = await db.execute(select(TemplateModel))
        templates = result.scalars().all()
        return [t.to_info_dict() for t in templates]

    @staticmethod
    @router.get("/templates/{template_id}")
    async def get_template(template_id: str, db: AsyncSession = Depends(get_db)):
        from sqlalchemy.future import select
        result = await db.execute(
            select(TemplateModel).where(TemplateModel.id == template_id)
        )
        tmpl = result.scalar_one_or_none()
        if not tmpl:
            raise HTTPException(404)
        return {"id": tmpl.id, "name": tmpl.name, "description": tmpl.description,
                "network": tmpl.network, "tags": tmpl.tags}

    @staticmethod
    @router.post("/templates/{template_id}/apply")
    async def apply_template(
        template_id: str,
        body: TemplateApplyRequest,
        db: AsyncSession = Depends(get_db),
    ):
        from sqlalchemy.future import select
        result = await db.execute(
            select(TemplateModel).where(TemplateModel.id == template_id)
        )
        tmpl = result.scalar_one_or_none()
        if not tmpl:
            raise HTTPException(404)

        net_data = tmpl.network.copy()
        net_data["name"] = body.network_name

        # Apply scale factor
        if body.scale_factor != 1.0:
            for p in net_data.get("pipes", []):
                p["length"]   = p.get("length",   100.0) * body.scale_factor
                p["diameter"] = p.get("diameter",  0.1)  * math.sqrt(body.scale_factor)

        crud = NetworkCRUD(db)
        network = await crud.create(net_data)
        return network.to_detail_dict()

templates = _TemplatesModule


# ═════════════════════════════════════════════════════════════════════════════
# HISTORY
# ═════════════════════════════════════════════════════════════════════════════

class _HistoryModule:
    router = APIRouter()

    @staticmethod
    @router.get("/history")
    async def get_history(
        page: int      = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=100),
        db: AsyncSession = Depends(get_db),
    ):
        crud = SolveResultCRUD(db)
        return await crud.get_history(page=page, page_size=page_size)

history = _HistoryModule
