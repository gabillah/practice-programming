"""
Canvas Export Endpoints
========================
Generates color-mapped pipe visualization data for the frontend canvas.
"""

import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.fluid import NetworkModel, NodeModel, PipeModel, SimulationModel
from app.schemas.schemas import (
    CanvasExportRequest, CanvasExportResponse,
    CanvasNodeData, CanvasPipeData,
)

router = APIRouter()

# ===========================================================================
# Colormaps
# ===========================================================================

COLORMAPS = {
    "viridis": [
        (0.267, 0.005, 0.329), (0.283, 0.141, 0.458), (0.254, 0.265, 0.530),
        (0.207, 0.372, 0.553), (0.164, 0.471, 0.558), (0.128, 0.567, 0.551),
        (0.135, 0.659, 0.518), (0.267, 0.749, 0.441), (0.478, 0.821, 0.318),
        (0.741, 0.873, 0.150), (0.993, 0.906, 0.144),
    ],
    "plasma": [
        (0.050, 0.030, 0.528), (0.299, 0.007, 0.616), (0.494, 0.012, 0.657),
        (0.665, 0.083, 0.631), (0.796, 0.190, 0.534), (0.894, 0.302, 0.402),
        (0.956, 0.425, 0.268), (0.991, 0.559, 0.145), (0.984, 0.704, 0.106),
        (0.940, 0.849, 0.260), (0.940, 0.975, 0.131),
    ],
    "RdYlBu": [
        (0.647, 0.000, 0.149), (0.843, 0.188, 0.153), (0.957, 0.427, 0.263),
        (0.992, 0.682, 0.380), (0.996, 0.878, 0.565), (1.000, 1.000, 0.749),
        (0.878, 0.953, 0.973), (0.671, 0.851, 0.914), (0.455, 0.678, 0.820),
        (0.271, 0.459, 0.706), (0.192, 0.212, 0.584),
    ],
    "coolwarm": [
        (0.230, 0.299, 0.754), (0.395, 0.490, 0.897), (0.573, 0.658, 0.971),
        (0.741, 0.795, 0.983), (0.886, 0.886, 0.886), (0.957, 0.798, 0.736),
        (0.951, 0.597, 0.506), (0.884, 0.367, 0.269), (0.696, 0.094, 0.168),
    ],
    "jet": [
        (0.000, 0.000, 0.502), (0.000, 0.118, 1.000), (0.000, 0.502, 1.000),
        (0.000, 0.859, 1.000), (0.271, 1.000, 0.729), (0.776, 1.000, 0.224),
        (1.000, 0.859, 0.000), (1.000, 0.467, 0.000), (1.000, 0.039, 0.000),
        (0.502, 0.000, 0.000),
    ],
    "hot": [
        (0.000, 0.000, 0.000), (0.250, 0.000, 0.000), (0.502, 0.000, 0.000),
        (0.752, 0.000, 0.000), (1.000, 0.000, 0.000), (1.000, 0.250, 0.000),
        (1.000, 0.502, 0.000), (1.000, 0.752, 0.000), (1.000, 1.000, 0.000),
        (1.000, 1.000, 0.502), (1.000, 1.000, 1.000),
    ],
}

FIELD_META = {
    "velocity":           {"label": "Velocity",           "unit": "m/s"},
    "pressure_drop":      {"label": "Pressure Drop",      "unit": "Pa"},
    "reynolds":           {"label": "Reynolds Number",    "unit": "−"},
    "head_loss":          {"label": "Head Loss",          "unit": "m"},
    "turbulence":         {"label": "Turbulence Intensity","unit": "%"},
    "friction_factor":    {"label": "Friction Factor",    "unit": "−"},
    "wall_shear":         {"label": "Wall Shear Stress",  "unit": "Pa"},
    "flow_rate":          {"label": "Flow Rate",          "unit": "m³/s"},
}

REGIME_COLORS = {
    "laminar":           "#3b82f6",  # blue
    "transitional":      "#f59e0b",  # amber
    "turbulent_smooth":  "#10b981",  # emerald
    "turbulent_rough":   "#f97316",  # orange
    "fully_turbulent":   "#ef4444",  # red
}


def _interpolate_color(value_norm: float, colormap: str) -> str:
    """
    Map normalized value (0–1) to an RGB hex color using the given colormap.
    """
    cmap = COLORMAPS.get(colormap, COLORMAPS["viridis"])
    n = len(cmap) - 1
    idx_f = max(0.0, min(1.0, value_norm)) * n
    idx_lo = int(idx_f)
    idx_hi = min(idx_lo + 1, n)
    t = idx_f - idx_lo

    r0, g0, b0 = cmap[idx_lo]
    r1, g1, b1 = cmap[idx_hi]

    r = r0 + t * (r1 - r0)
    g = g0 + t * (g1 - g0)
    b = b0 + t * (b1 - b0)

    ri = max(0, min(255, int(r * 255)))
    gi = max(0, min(255, int(g * 255)))
    bi = max(0, min(255, int(b * 255)))

    return f"#{ri:02x}{gi:02x}{bi:02x}"


def _extract_field_value(pipe_result: dict, field: str) -> Optional[float]:
    mapping = {
        "velocity":        "velocity_m_s",
        "pressure_drop":   "pressure_drop_pa",
        "reynolds":        "reynolds_number",
        "head_loss":       "head_loss_m",
        "turbulence":      "turbulence_intensity_pct",
        "friction_factor": "friction_factor",
        "wall_shear":      "wall_shear_stress_pa",
        "flow_rate":       "flow_m3s",
    }
    key = mapping.get(field)
    if not key:
        return None
    val = pipe_result.get(key)
    return abs(val) if val is not None else None


@router.post("/export", response_model=CanvasExportResponse)
async def export_canvas(
    req: CanvasExportRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Build complete canvas visualization data:
    - All nodes with result overlays
    - All pipes with color-mapped CFD field values
    Returns ready-to-render data for the frontend.
    """
    network = await db.get(NetworkModel, req.network_id)
    if not network:
        raise HTTPException(status_code=404, detail="Network not found")

    nodes_res = await db.execute(select(NodeModel).where(NodeModel.network_id == req.network_id))
    pipes_res = await db.execute(select(PipeModel).where(PipeModel.network_id == req.network_id))
    nodes_db = nodes_res.scalars().all()
    pipes_db = pipes_res.scalars().all()

    # Load simulation results if requested
    pipe_results = {}
    node_results = {}
    if req.simulation_id:
        sim = await db.get(SimulationModel, req.simulation_id)
        if sim and sim.pipe_results:
            pipe_results = sim.pipe_results
        if sim and sim.node_results:
            node_results = sim.node_results

    # Compute color scale min/max
    field_values = []
    for pipe_db in pipes_db:
        r = pipe_results.get(pipe_db.id)
        if r:
            v = _extract_field_value(r, req.color_field)
            if v is not None:
                field_values.append(v)

    legend_min = min(field_values) if field_values else 0.0
    legend_max = max(field_values) if field_values else 1.0
    if legend_max == legend_min:
        legend_max = legend_min + 1e-10

    field_info = FIELD_META.get(req.color_field, {"label": req.color_field, "unit": ""})

    # Build node canvas data
    canvas_nodes = []
    for n in nodes_db:
        nr = node_results.get(n.id, {})
        canvas_nodes.append(CanvasNodeData(
            id=n.id,
            label=n.label,
            node_type=n.node_type,
            x=n.x,
            y=n.y,
            elevation_m=n.elevation_m,
            pressure_head_m=nr.get("pressure_head_m"),
            pressure_pa=nr.get("pressure_pa"),
            hydraulic_grade_m=nr.get("hydraulic_grade_m"),
            balance_error_m3s=nr.get("balance_error_m3s"),
        ))

    # Build pipe canvas data
    canvas_pipes = []
    for p in pipes_db:
        r = pipe_results.get(p.id)
        color = p.color_override or "#94a3b8"
        color_value = None

        if r:
            v = _extract_field_value(r, req.color_field)
            color_value = v
            if v is not None:
                norm = (v - legend_min) / (legend_max - legend_min)
                color = _interpolate_color(norm, req.colormap)

            canvas_pipes.append(CanvasPipeData(
                id=p.id,
                label=p.label,
                node_from_id=p.node_from_id,
                node_to_id=p.node_to_id,
                waypoints=p.waypoints,
                diameter_m=p.diameter_m,
                line_width=max(2.0, min(16.0, p.diameter_m * 200 + 2)),
                color=color,
                color_value=color_value,
                color_field=req.color_field,
                flow_m3s=r.get("flow_m3s"),
                velocity_m_s=r.get("velocity_m_s"),
                reynolds_number=r.get("reynolds_number"),
                head_loss_m=r.get("head_loss_m"),
                pressure_drop_pa=r.get("pressure_drop_pa"),
                flow_regime=r.get("flow_regime"),
                turbulence_intensity_pct=r.get("turbulence_intensity_pct"),
                direction=r.get("direction"),
            ))
        else:
            canvas_pipes.append(CanvasPipeData(
                id=p.id,
                label=p.label,
                node_from_id=p.node_from_id,
                node_to_id=p.node_to_id,
                waypoints=p.waypoints,
                diameter_m=p.diameter_m,
                line_width=max(2.0, min(16.0, p.diameter_m * 200 + 2)),
                color=color,
            ))

    return CanvasExportResponse(
        network_id=req.network_id,
        simulation_id=req.simulation_id,
        color_field=req.color_field,
        colormap=req.colormap,
        nodes=canvas_nodes,
        pipes=canvas_pipes,
        legend_min=legend_min,
        legend_max=legend_max,
        legend_unit=field_info["unit"],
        legend_label=field_info["label"],
        canvas_width=network.canvas_width,
        canvas_height=network.canvas_height,
    )


@router.get("/colormaps")
async def list_colormaps():
    return {"available": list(COLORMAPS.keys())}


@router.get("/color-fields")
async def list_color_fields():
    return {"fields": [
        {"key": k, "label": v["label"], "unit": v["unit"]}
        for k, v in FIELD_META.items()
    ]}
