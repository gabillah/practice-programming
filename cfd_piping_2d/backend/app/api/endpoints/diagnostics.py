"""
Diagnostics & Test Case Endpoints
===================================
Built-in benchmark networks for solver validation.
"""
import time
from fastapi import APIRouter
from app.schemas.schemas import SolverDiagnosticsRequest, SolverDiagnosticsResponse
from app.services.solver import solve_network, NodeBC, PipeBC, SolverSettings
from app.services.physics import FluidProperties

router = APIRouter()

WATER = FluidProperties(
    name="Water", density=998.2, viscosity=1.002e-3,
    bulk_modulus=2.18e9, vapor_pressure=2338.0,
    surface_tension=0.0728, specific_heat=4182.0,
    thermal_conductivity=0.598,
)


def _simple_loop():
    """Classic 3-pipe loop: 3 nodes, 3 pipes forming a triangle."""
    nodes = [
        NodeBC("N1", demand_m3s=0.0,   fixed_head_m=20.0, elevation_m=0.0),
        NodeBC("N2", demand_m3s=0.010, elevation_m=0.0),
        NodeBC("N3", demand_m3s=0.005, elevation_m=0.0),
    ]
    pipes = [
        PipeBC("P1", "N1", "N2", diameter_m=0.10, length_m=300, roughness_m=4.6e-5),
        PipeBC("P2", "N2", "N3", diameter_m=0.08, length_m=200, roughness_m=4.6e-5),
        PipeBC("P3", "N3", "N1", diameter_m=0.08, length_m=250, roughness_m=4.6e-5),
    ]
    return nodes, pipes, 1


def _branched():
    """Simple branched (tree) network: 4 nodes, 3 pipes."""
    nodes = [
        NodeBC("N1", demand_m3s=0.0,   fixed_head_m=30.0, elevation_m=10.0),
        NodeBC("N2", demand_m3s=0.005, elevation_m=5.0),
        NodeBC("N3", demand_m3s=0.008, elevation_m=0.0),
        NodeBC("N4", demand_m3s=0.004, elevation_m=2.0),
    ]
    pipes = [
        PipeBC("P1", "N1", "N2", diameter_m=0.15, length_m=500, roughness_m=4.6e-5),
        PipeBC("P2", "N2", "N3", diameter_m=0.10, length_m=400, roughness_m=4.6e-5),
        PipeBC("P3", "N2", "N4", diameter_m=0.10, length_m=300, roughness_m=4.6e-5),
    ]
    return nodes, pipes, 0


def _complex_grid():
    """4x2 grid: 8 nodes, 10 pipes."""
    nodes = [
        NodeBC("N1", demand_m3s=0.0,   fixed_head_m=25.0, elevation_m=0.0),
        NodeBC("N2", demand_m3s=0.003, elevation_m=0.0),
        NodeBC("N3", demand_m3s=0.003, elevation_m=0.0),
        NodeBC("N4", demand_m3s=0.003, elevation_m=0.0),
        NodeBC("N5", demand_m3s=0.002, elevation_m=0.0),
        NodeBC("N6", demand_m3s=0.002, elevation_m=0.0),
        NodeBC("N7", demand_m3s=0.002, elevation_m=0.0),
        NodeBC("N8", demand_m3s=0.002, elevation_m=0.0),
    ]
    pipes = [
        PipeBC("P1",  "N1", "N2", 0.10, 200, 4.6e-5),
        PipeBC("P2",  "N2", "N3", 0.10, 200, 4.6e-5),
        PipeBC("P3",  "N3", "N4", 0.10, 200, 4.6e-5),
        PipeBC("P4",  "N1", "N5", 0.10, 200, 4.6e-5),
        PipeBC("P5",  "N2", "N6", 0.08, 200, 4.6e-5),
        PipeBC("P6",  "N3", "N7", 0.08, 200, 4.6e-5),
        PipeBC("P7",  "N4", "N8", 0.08, 200, 4.6e-5),
        PipeBC("P8",  "N5", "N6", 0.10, 200, 4.6e-5),
        PipeBC("P9",  "N6", "N7", 0.10, 200, 4.6e-5),
        PipeBC("P10", "N7", "N8", 0.10, 200, 4.6e-5),
    ]
    return nodes, pipes, 3


TEST_CASES = {
    "simple_loop": _simple_loop,
    "branched":    _branched,
    "complex_grid": _complex_grid,
}


@router.post("/solver-test", response_model=SolverDiagnosticsResponse)
async def run_solver_diagnostics(req: SolverDiagnosticsRequest):
    factory = TEST_CASES.get(req.test_case)
    if not factory:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Unknown test case '{req.test_case}'. "
                            f"Available: {list(TEST_CASES.keys())}")
    nodes, pipes, expected_loops = factory()
    settings = SolverSettings(max_iterations=500, convergence_tol=1e-7)
    t0 = time.perf_counter()
    solution = solve_network(nodes, pipes, WATER, settings)
    elapsed_ms = (time.perf_counter() - t0) * 1000

    return SolverDiagnosticsResponse(
        test_case=req.test_case,
        n_nodes=len(nodes),
        n_pipes=len(pipes),
        n_loops=expected_loops,
        converged=solution.converged,
        iterations=solution.iterations,
        max_residual=solution.max_residual_m3s,
        solve_time_ms=elapsed_ms,
        expected_convergence=True,
        passed=solution.converged,
    )


@router.get("/solver-test/all")
async def run_all_diagnostics():
    results = []
    for name, factory in TEST_CASES.items():
        nodes, pipes, _ = factory()
        settings = SolverSettings(max_iterations=500, convergence_tol=1e-7)
        t0 = time.perf_counter()
        sol = solve_network(nodes, pipes, WATER, settings)
        elapsed_ms = (time.perf_counter() - t0) * 1000
        results.append({
            "test_case": name,
            "n_nodes": len(nodes),
            "n_pipes": len(pipes),
            "converged": sol.converged,
            "iterations": sol.iterations,
            "max_residual": sol.max_residual_m3s,
            "solve_time_ms": round(elapsed_ms, 2),
            "passed": sol.converged,
        })
    all_passed = all(r["passed"] for r in results)
    return {"all_passed": all_passed, "results": results}
