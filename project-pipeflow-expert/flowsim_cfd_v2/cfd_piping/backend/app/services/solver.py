"""
Hardy-Cross Pipe Network Solver
================================
Iterative method for solving pressure and flow distribution in
complex pipe networks (looped and branched systems).

References:
    - Hardy Cross (1936). Analysis of flow in networks of conduits or conductors.
      University of Illinois Bulletin 286.
    - Todini, E. & Pilati, S. (1988). A gradient algorithm for the analysis of
      pipe networks. Computer Applications in Water Supply, 1, 1–20.
    - Epp, R. & Fowler, A.G. (1970). Efficient code for steady-state flows in
      networks. J. Hydraulics Div., 96(1), 43–56.
    - Bhave, P.R. (1991). Analysis of Flow in Water Distribution Networks.
      Technomic, Lancaster, PA.

Physics equations per pipe:
    hf = R·Q^n   where R = f·L / (D·2gA²)  (Darcy-Weisbach, n=2)
    or
    hf = K_HW·Q^1.852  (Hazen-Williams)

Convergence criterion:
    max(|ΔQ_loop|) < tolerance
"""

import math
import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import numpy as np
from scipy.linalg import solve

from app.services.physics import (
    FluidProperties, PipeGeometry, FlowState,
    calculate_pipe_hydraulics,
    friction_factor_moody, darcy_weisbach_pressure_drop,
    bernoulli_total_head,
)

logger = logging.getLogger("flowsim.solver")


# ===========================================================================
# Data structures
# ===========================================================================

@dataclass
class NodeBC:
    """Boundary condition at a network node."""
    node_id: str
    demand_m3s: float = 0.0          # External demand (positive = outflow)
    fixed_head_m: Optional[float] = None   # Fixed hydraulic grade line (reservoir)
    fixed_pressure_pa: Optional[float] = None
    elevation_m: float = 0.0


@dataclass
class PipeBC:
    """Boundary condition / property for a pipe segment."""
    pipe_id: str
    node_from: str
    node_to: str
    diameter_m: float
    length_m: float
    roughness_m: float = 4.6e-5      # commercial steel
    minor_K: float = 0.0
    elevation_from: float = 0.0
    elevation_to: float = 0.0
    is_pump: bool = False
    pump_head_m: float = 0.0         # Added head (pump)
    initial_flow_m3s: float = 0.001  # Initial guess
    valve_open: bool = True
    valve_K: float = 0.0


@dataclass
class SolverSettings:
    """Configuration for the Hardy-Cross solver."""
    max_iterations: int = 500
    convergence_tol: float = 1e-7     # m³/s
    head_tol: float = 1e-5            # m
    relaxation: float = 1.0           # 0 < ω ≤ 1 (under-relaxation)
    use_gradient_method: bool = True  # Todini-Pilati if True, Hardy-Cross if False
    verbose: bool = False
    n_exponent: float = 2.0           # Flow exponent (1.852 for HW, 2.0 for DW)


@dataclass
class PipeResult:
    """Hydraulic result for a single pipe."""
    pipe_id: str
    flow_m3s: float
    velocity_m_s: float
    reynolds_number: float
    friction_factor: float
    head_loss_m: float
    pressure_drop_pa: float
    minor_head_loss_m: float
    total_head_loss_m: float
    flow_regime: str
    turbulence_intensity_pct: float
    wall_shear_stress_pa: float
    resistance_R: float
    direction: str   # "forward" or "reverse"


@dataclass
class NodeResult:
    """Hydraulic result at a network node."""
    node_id: str
    pressure_head_m: float      # P/(ρg)
    elevation_m: float
    hydraulic_grade_m: float    # HGL = pressure_head + elevation
    energy_grade_m: float       # EGL = HGL + V²/(2g) (at adjacent pipes avg)
    pressure_pa: float
    demand_m3s: float
    inflow_m3s: float           # Total inflow to node
    outflow_m3s: float          # Total outflow (demand + pipe)
    balance_error_m3s: float    # Should be ≈ 0


@dataclass
class NetworkSolution:
    """Complete solution of the pipe network."""
    converged: bool
    iterations: int
    max_residual_m3s: float
    max_head_error_m: float
    pipe_results: Dict[str, PipeResult]
    node_results: Dict[str, NodeResult]
    total_head_loss_m: float
    total_power_w: float
    solve_time_s: float
    convergence_history: List[float] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


# ===========================================================================
# Pipe resistance calculation
# ===========================================================================

def pipe_resistance(pipe: PipeBC, fluid: FluidProperties,
                    Q: float, g: float = 9.80665) -> Tuple[float, float]:
    """
    Compute the resistance R and derivative dR/dQ for a pipe.

    Darcy-Weisbach: hf = R·Q²
        R = f·L / (D·2g·A²)

    Since f depends on Re which depends on V = Q/A, we iterate implicitly.
    Returns R = hf/Q² and dR/dQ (via numerical diff or exact formula).

    Returns:
        (R, dR_dQ): resistance coefficient and its derivative
    """
    if abs(Q) < 1e-12:
        Q = 1e-12

    geom = PipeGeometry(
        diameter=pipe.diameter_m,
        length=pipe.length_m,
        roughness=pipe.roughness_m,
        elevation_in=pipe.elevation_from,
        elevation_out=pipe.elevation_to,
    )

    A = geom.area
    V = abs(Q) / A
    Re = V * pipe.diameter_m / fluid.kinematic_viscosity
    f = friction_factor_moody(Re, geom.relative_roughness)

    # Resistance coefficient hf = R * Q^2
    R = f * pipe.length_m / (pipe.diameter_m * 2 * g * A ** 2)

    # Add minor loss resistance
    K_minor = pipe.minor_K + pipe.valve_K
    R_minor = K_minor / (2 * g * A ** 2)
    R_total = R + R_minor

    # Add pump (negative head = pump adds energy)
    if pipe.is_pump:
        # Pump head is treated as a negative resistance
        # Simplified: pump adds constant head for now
        R_pump = -pipe.pump_head_m / (Q ** 2) if Q != 0 else 0
        R_total += R_pump

    return R_total


def head_loss_pipe(pipe: PipeBC, fluid: FluidProperties,
                   Q: float, g: float = 9.80665) -> float:
    """
    Total head loss for pipe: hf = R·Q·|Q| (signed)

    Sign convention: positive Q → flow from node_from to node_to.
    Head loss is positive in flow direction (energy is consumed).
    """
    R = pipe_resistance(pipe, fluid, Q, g)
    return R * Q * abs(Q)


def dh_dQ(pipe: PipeBC, fluid: FluidProperties,
           Q: float, g: float = 9.80665) -> float:
    """
    Derivative d(hf)/dQ ≈ 2·R·|Q|  (Darcy-Weisbach, n=2 exponent)

    Used in Newton-Raphson Jacobian.
    """
    R = pipe_resistance(pipe, fluid, Q, g)
    return 2.0 * R * abs(Q) + 1e-10  # add small epsilon to avoid zero


# ===========================================================================
# Loop identification (for Hardy-Cross)
# ===========================================================================

def find_independent_loops(
    nodes: List[str],
    pipes: List[PipeBC],
) -> List[List[str]]:
    """
    Find independent loops in the pipe network using DFS spanning tree.

    Returns a list of loops, each loop being an ordered list of pipe IDs
    with sign (+1 or -1) to indicate traversal direction relative to
    the assumed positive flow direction.
    
    Returns:
        List of loops as [[(pipe_id, sign), ...], ...]
    """
    # Build adjacency list
    adj: Dict[str, List[Tuple[str, str]]] = {n: [] for n in nodes}
    for pipe in pipes:
        adj[pipe.node_from].append((pipe.node_to, pipe.pipe_id))
        adj[pipe.node_to].append((pipe.node_from, pipe.pipe_id))

    # Spanning tree via DFS
    visited: set = set()
    tree_edges: set = set()
    parent: Dict[str, Optional[str]] = {}

    def dfs(node: str, par_node: Optional[str] = None):
        visited.add(node)
        for neighbour, pid in adj[node]:
            if pid in tree_edges:
                continue
            if neighbour not in visited:
                tree_edges.add(pid)
                parent[neighbour] = (node, pid)
                dfs(neighbour, node)

    for n in nodes:
        if n not in visited:
            parent[n] = None
            dfs(n)

    # Co-tree (non-tree) edges form independent loops
    co_tree_pipes = [p for p in pipes if p.pipe_id not in tree_edges]

    loops = []
    for co_pipe in co_tree_pipes:
        loop = _trace_loop(co_pipe, parent, pipes)
        if loop:
            loops.append(loop)

    return loops


def _trace_loop(
    co_pipe: PipeBC,
    parent: Dict,
    pipes: List[PipeBC],
) -> List[Tuple[str, int]]:
    """Trace the loop formed by adding co_pipe to the spanning tree."""
    pipe_map = {p.pipe_id: p for p in pipes}

    def get_path(node: str) -> List[str]:
        path = [node]
        while parent.get(node) is not None:
            node_par, pid = parent[node]
            path.append(pid)
            path.append(node_par)
            node = node_par
        return path

    path_a = get_path(co_pipe.node_from)
    path_b = get_path(co_pipe.node_to)

    # Find common ancestor
    set_a = set(path_a[::2])  # nodes only (even indices)
    common = None
    for n in path_b[::2]:
        if n in set_a:
            common = n
            break

    if common is None:
        return []

    # Trim paths to common ancestor
    def trim(path, target):
        nodes_p = path[::2]
        idx = nodes_p.index(target)
        return path[:2 * idx + 1]

    seg_a = trim(path_a, common)
    seg_b = trim(path_b, common)

    # Build loop: co_pipe + path_a reversed + path_b
    loop: List[Tuple[str, int]] = [(co_pipe.pipe_id, +1)]

    # From node_from back to common (reverse direction = -1 if pipe goes away)
    for i in range(0, len(seg_a) - 2, 2):
        node = seg_a[i]
        pid = seg_a[i + 1]
        p = pipe_map.get(pid)
        if p and p.node_to == node:
            loop.append((pid, +1))
        else:
            loop.append((pid, -1))

    # From common to node_to (forward direction)
    for i in range(len(seg_b) - 3, -1, -2):
        node = seg_b[i]
        pid = seg_b[i + 1]
        p = pipe_map.get(pid)
        if p and p.node_from == node:
            loop.append((pid, +1))
        else:
            loop.append((pid, -1))

    return loop


# ===========================================================================
# Hardy-Cross solver
# ===========================================================================

class HardyCrossSolver:
    """
    Hardy-Cross iterative solver for pipe network analysis.

    Algorithm:
    1. Assume initial flow distribution (mass balance at nodes)
    2. For each loop: compute ΔQ = -ΣhΔ / (n·Σ|hΔ/Q|)
    3. Correct all flows in each loop by ΔQ
    4. Repeat until |ΔQ| < tolerance
    """

    def __init__(
        self,
        nodes: List[NodeBC],
        pipes: List[PipeBC],
        fluid: FluidProperties,
        settings: Optional[SolverSettings] = None,
        g: float = 9.80665,
    ):
        self.nodes = {n.node_id: n for n in nodes}
        self.pipes = {p.pipe_id: p for p in pipes}
        self.fluid = fluid
        self.settings = settings or SolverSettings()
        self.g = g

        # Current flow estimates
        self.Q: Dict[str, float] = {p.pipe_id: p.initial_flow_m3s for p in pipes}
        self.H: Dict[str, float] = {}  # Node heads

        # Find loops
        node_ids = list(self.nodes.keys())
        pipe_list = list(self.pipes.values())
        self.loops = find_independent_loops(node_ids, pipe_list)
        logger.debug("Found %d independent loops", len(self.loops))

    def _compute_loop_dQ(self, loop: List[Tuple[str, int]]) -> float:
        """
        Hardy-Cross correction flow for one loop:

            ΔQ = -Σ(hΔ) / (n·Σ|hΔ/Q|)

        where n = flow exponent (2 for Darcy-Weisbach).
        """
        n = self.settings.n_exponent
        numerator = 0.0
        denominator = 0.0

        for pipe_id, sign in loop:
            pipe = self.pipes[pipe_id]
            Q_pipe = self.Q[pipe_id]
            Q_signed = sign * Q_pipe   # Q in loop direction

            hf = head_loss_pipe(pipe, self.fluid, Q_signed, self.g)
            dhf = dh_dQ(pipe, self.fluid, Q_signed, self.g)

            numerator += hf
            denominator += dhf  # always positive

        if abs(denominator) < 1e-15:
            return 0.0

        dQ = -numerator / denominator
        return self.settings.relaxation * dQ

    def _apply_loop_corrections(self, corrections: Dict[int, float]) -> None:
        """Apply ΔQ corrections to all pipes based on loop membership."""
        # For each pipe, sum corrections from all loops it belongs to
        for loop_idx, (loop, dQ) in enumerate(corrections.items()):
            loop_data = self.loops[loop_idx]
            for pipe_id, sign in loop_data:
                self.Q[pipe_id] += sign * dQ

    def _check_mass_balance(self) -> Dict[str, float]:
        """Compute mass balance error at each node (m³/s)."""
        balance: Dict[str, float] = {nid: 0.0 for nid in self.nodes}

        for pipe in self.pipes.values():
            Q = self.Q[pipe.pipe_id]
            # Positive Q: flows from node_from to node_to
            balance[pipe.node_from] -= Q
            balance[pipe.node_to] += Q

        # Subtract demands
        for nid, node in self.nodes.items():
            balance[nid] -= node.demand_m3s

        return balance

    def _compute_node_heads(self) -> None:
        """
        Compute hydraulic head at each node by walking from known heads.
        Requires at least one fixed-head node.
        """
        # Find reference node (reservoir / fixed head)
        ref_node = None
        for nid, node in self.nodes.items():
            if node.fixed_head_m is not None:
                self.H[nid] = node.fixed_head_m + node.elevation_m
                ref_node = nid
                break

        if ref_node is None:
            # No fixed head: set first node to 0
            first = next(iter(self.nodes))
            self.H[first] = 0.0
            ref_node = first

        # BFS/DFS from reference node
        visited = {ref_node}
        queue = [ref_node]

        pipe_lookup_from: Dict[str, List[PipeBC]] = {n: [] for n in self.nodes}
        pipe_lookup_to: Dict[str, List[PipeBC]] = {n: [] for n in self.nodes}
        for pipe in self.pipes.values():
            pipe_lookup_from[pipe.node_from].append(pipe)
            pipe_lookup_to[pipe.node_to].append(pipe)

        while queue:
            current = queue.pop(0)
            H_current = self.H.get(current, 0.0)

            # Forward pipes
            for pipe in pipe_lookup_from[current]:
                neighbour = pipe.node_to
                if neighbour not in visited:
                    Q = self.Q[pipe.pipe_id]
                    hf = head_loss_pipe(pipe, self.fluid, Q, self.g)
                    elev_diff = pipe.elevation_to - pipe.elevation_from
                    self.H[neighbour] = H_current - hf - elev_diff
                    visited.add(neighbour)
                    queue.append(neighbour)

            # Reverse pipes
            for pipe in pipe_lookup_to[current]:
                neighbour = pipe.node_from
                if neighbour not in visited:
                    Q = self.Q[pipe.pipe_id]
                    hf = head_loss_pipe(pipe, self.fluid, -Q, self.g)
                    elev_diff = pipe.elevation_from - pipe.elevation_to
                    self.H[neighbour] = H_current - hf - elev_diff
                    visited.add(neighbour)
                    queue.append(neighbour)

    def solve(self) -> NetworkSolution:
        """
        Run the Hardy-Cross iteration until convergence.

        Returns:
            NetworkSolution with complete results
        """
        import time as _time
        t0 = _time.perf_counter()
        history = []
        warnings = []

        if not self.loops:
            warnings.append("No independent loops found; treating as branched network.")
            # For branched networks, just propagate flows from boundary
            self._solve_branched()

        for iteration in range(self.settings.max_iterations):
            max_dQ = 0.0
            corrections = {}

            for loop_idx, loop in enumerate(self.loops):
                dQ = self._compute_loop_dQ(loop)
                corrections[loop_idx] = dQ
                max_dQ = max(max_dQ, abs(dQ))

            # Apply corrections
            self._apply_loop_corrections(corrections)
            history.append(max_dQ)

            if self.settings.verbose:
                logger.debug("Iter %d: max ΔQ = %.3e m³/s", iteration + 1, max_dQ)

            if max_dQ < self.settings.convergence_tol:
                logger.info("Hardy-Cross converged in %d iterations (ΔQ=%.2e)", iteration + 1, max_dQ)
                self._compute_node_heads()
                pipe_results, node_results = self._build_results()
                elapsed = _time.perf_counter() - t0
                return NetworkSolution(
                    converged=True,
                    iterations=iteration + 1,
                    max_residual_m3s=max_dQ,
                    max_head_error_m=self._head_error(),
                    pipe_results=pipe_results,
                    node_results=node_results,
                    total_head_loss_m=self._total_head_loss(),
                    total_power_w=self._total_power(),
                    solve_time_s=elapsed,
                    convergence_history=history,
                    warnings=warnings,
                )

        # Not converged
        logger.warning("Hardy-Cross did NOT converge after %d iterations", self.settings.max_iterations)
        warnings.append(f"Solver did not converge in {self.settings.max_iterations} iterations. Results may be inaccurate.")
        self._compute_node_heads()
        pipe_results, node_results = self._build_results()
        elapsed = _time.perf_counter() - t0
        return NetworkSolution(
            converged=False,
            iterations=self.settings.max_iterations,
            max_residual_m3s=max_dQ,
            max_head_error_m=self._head_error(),
            pipe_results=pipe_results,
            node_results=node_results,
            total_head_loss_m=self._total_head_loss(),
            total_power_w=self._total_power(),
            solve_time_s=elapsed,
            convergence_history=history,
            warnings=warnings,
        )

    def _solve_branched(self) -> None:
        """Simple flow propagation for tree (branched) networks."""
        # For branched: flow in each pipe = sum of downstream demands
        # BFS from source nodes
        fixed_nodes = [nid for nid, n in self.nodes.items() if n.fixed_head_m is not None]
        if not fixed_nodes:
            fixed_nodes = [next(iter(self.nodes))]

        # Build adjacency
        children: Dict[str, List[PipeBC]] = {n: [] for n in self.nodes}
        for pipe in self.pipes.values():
            children[pipe.node_from].append(pipe)

        visited = set()
        stack = list(fixed_nodes)
        while stack:
            node_id = stack.pop()
            if node_id in visited:
                continue
            visited.add(node_id)
            for pipe in children.get(node_id, []):
                self.Q[pipe.pipe_id] = self.nodes[pipe.node_to].demand_m3s
                stack.append(pipe.node_to)

    def _head_error(self) -> float:
        """Maximum closure error in head for all loops."""
        max_err = 0.0
        for loop in self.loops:
            head_sum = 0.0
            for pipe_id, sign in loop:
                Q = self.Q[pipe_id]
                hf = head_loss_pipe(self.pipes[pipe_id], self.fluid, sign * Q, self.g)
                head_sum += hf
            max_err = max(max_err, abs(head_sum))
        return max_err

    def _total_head_loss(self) -> float:
        """Sum of absolute head losses across all pipes [m]."""
        total = 0.0
        for pid, pipe in self.pipes.items():
            Q = self.Q[pid]
            hf = abs(head_loss_pipe(pipe, self.fluid, Q, self.g))
            total += hf
        return total

    def _total_power(self) -> float:
        """Total hydraulic power dissipated [W] = ρ·g·Q·Σhf."""
        total_Qh = 0.0
        for pid, pipe in self.pipes.items():
            Q = abs(self.Q[pid])
            hf = abs(head_loss_pipe(pipe, self.fluid, Q, self.g))
            total_Qh += Q * hf
        return self.fluid.density * self.g * total_Qh

    def _build_results(self) -> Tuple[Dict[str, PipeResult], Dict[str, NodeResult]]:
        """Build PipeResult and NodeResult dicts from current state."""
        pipe_results: Dict[str, PipeResult] = {}

        for pipe in self.pipes.values():
            Q = self.Q[pipe.pipe_id]
            geom = PipeGeometry(
                diameter=pipe.diameter_m,
                length=pipe.length_m,
                roughness=pipe.roughness_m,
                elevation_in=pipe.elevation_from,
                elevation_out=pipe.elevation_to,
            )
            state = calculate_pipe_hydraulics(Q, geom, self.fluid, pipe.minor_K, self.g)
            R = pipe_resistance(pipe, self.fluid, Q, self.g)

            pipe_results[pipe.pipe_id] = PipeResult(
                pipe_id=pipe.pipe_id,
                flow_m3s=Q,
                velocity_m_s=state.velocity,
                reynolds_number=state.reynolds_number,
                friction_factor=state.friction_factor,
                head_loss_m=state.head_loss,
                pressure_drop_pa=state.pressure_drop,
                minor_head_loss_m=state.minor_loss_head,
                total_head_loss_m=state.total_head_loss,
                flow_regime=state.flow_regime.value,
                turbulence_intensity_pct=state.turbulence_intensity,
                wall_shear_stress_pa=state.wall_shear_stress,
                resistance_R=R,
                direction="forward" if Q >= 0 else "reverse",
            )

        node_results: Dict[str, NodeResult] = {}
        for nid, node in self.nodes.items():
            H = self.H.get(nid, 0.0)
            p_head = H - node.elevation_m
            pressure_pa = max(0.0, p_head * self.fluid.density * self.g)

            # Compute in/out flows
            inflow = 0.0
            outflow = 0.0
            for pipe in self.pipes.values():
                Q = self.Q[pipe.pipe_id]
                if pipe.node_to == nid and Q > 0:
                    inflow += Q
                elif pipe.node_from == nid and Q < 0:
                    inflow += abs(Q)
                elif pipe.node_from == nid and Q > 0:
                    outflow += Q
                elif pipe.node_to == nid and Q < 0:
                    outflow += abs(Q)

            outflow += node.demand_m3s
            balance = inflow - outflow

            node_results[nid] = NodeResult(
                node_id=nid,
                pressure_head_m=p_head,
                elevation_m=node.elevation_m,
                hydraulic_grade_m=H,
                energy_grade_m=H,  # simplified (no local velocity)
                pressure_pa=pressure_pa,
                demand_m3s=node.demand_m3s,
                inflow_m3s=inflow,
                outflow_m3s=outflow,
                balance_error_m3s=balance,
            )

        return pipe_results, node_results


# ===========================================================================
# Gradient method (Todini-Pilati) — more robust for large networks
# ===========================================================================

class GradientSolver:
    """
    Todini-Pilati gradient algorithm for pipe network analysis.

    Sign conventions (Todini & Pilati, 1988):
      • A[i,j] = +1 if pipe i LEAVES node j  (j is upstream)
      • A[i,j] = -1 if pipe i ENTERS node j  (j is downstream)
      • Q[i]   > 0 means flow in the nominal (A+) direction
      • Energy: A · H = hf(Q)   i.e.  H_from - H_to = hf > 0 for forward flow
      • Continuity: A^T · Q = d_ext  where d_ext > 0 means OUTFLOW (demand),
                                     d_ext < 0 means INFLOW (supply/injection)
        For a reservoir fixed-head node with no explicit demand, d_ext = 0
        (its flow is implicitly determined by the head boundary).

    Newton system per iteration:
        [ D      A_22 ] [ dQ  ]   [ A·H - hf          ]
        [ A_22^T  0   ] [ dH  ] = [ d_22 - A_22^T · Q ]

    where subscript 22 denotes columns/rows for the UNKNOWN-head nodes,
    and the RHS is the current residual (negative correction direction).
    """

    def __init__(
        self,
        nodes: List[NodeBC],
        pipes: List[PipeBC],
        fluid: FluidProperties,
        settings: Optional[SolverSettings] = None,
        g: float = 9.80665,
    ):
        self.nodes_list = nodes
        self.pipes_list = pipes
        self.fluid = fluid
        self.settings = settings or SolverSettings()
        self.g = g

        # Index maps
        self.node_ids = [n.node_id for n in nodes]
        self.pipe_ids = [p.pipe_id for p in pipes]
        self.n_nodes = len(nodes)
        self.n_pipes = len(pipes)

        self.node_idx = {nid: i for i, nid in enumerate(self.node_ids)}
        self.pipe_idx = {pid: i for i, pid in enumerate(self.pipe_ids)}

        # Separate fixed-head (known) and unknown-head nodes
        self.fixed_nodes   = [n for n in nodes if n.fixed_head_m is not None]
        self.unknown_nodes = [n for n in nodes if n.fixed_head_m is None]
        self.n_fixed   = len(self.fixed_nodes)
        self.n_unknown = len(self.unknown_nodes)

        self._fixed_idx   = [self.node_idx[n.node_id] for n in self.fixed_nodes]
        self._unknown_idx = [self.node_idx[n.node_id] for n in self.unknown_nodes]

        # Connectivity matrix A (n_pipes × n_nodes)
        # A[i, j_from] = +1,  A[i, j_to] = -1
        self.A = np.zeros((self.n_pipes, self.n_nodes))
        for pipe in pipes:
            i = self.pipe_idx[pipe.pipe_id]
            self.A[i, self.node_idx[pipe.node_from]] = +1.0
            self.A[i, self.node_idx[pipe.node_to]]   = -1.0

        # Partition A into fixed-head and unknown-head sub-matrices
        self.A_f = self.A[:, self._fixed_idx]    # (n_pipes × n_fixed)
        self.A_u = self.A[:, self._unknown_idx]  # (n_pipes × n_unknown)

        # Fixed heads (with elevation)
        self.H_f = np.array([n.fixed_head_m + n.elevation_m for n in self.fixed_nodes])

        # External demand vector (n_nodes,)
        # CONVENTION: d_vec[j] = -demand_m3s for consumption nodes
        #             d_vec[j] = 0 for reservoir/fixed-head nodes (handled by BC)
        # This matches the A-matrix convention where A[pipe,to_node]=-1
        # so A^T * Q gives net inflow per node, and d_vec = -outflow_demand
        self.d_vec = np.zeros(self.n_nodes)
        for node in nodes:
            self.d_vec[self.node_idx[node.node_id]] = -node.demand_m3s  # negative = outflow

        # Initial guesses
        self.Q = np.array([p.initial_flow_m3s for p in pipes], dtype=float)

        # Initialize H_u BELOW the minimum fixed head so Newton converges
        # to the physically correct solution (flow from source to demands)
        min_H_fixed = float(np.min(self.H_f)) if len(self.H_f) > 0 else 10.0
        # Each unknown node gets head = min_fixed - small_offset * (1 + position_index)
        # This provides a gentle gradient away from sources
        self.H_u = np.array([
            max(0.0, min_H_fixed - 2.0 * (i + 1))
            for i in range(self.n_unknown)
        ], dtype=float)

    # ─────────────────────────────────────────────────────────────────────────

    def _assemble_H_all(self) -> np.ndarray:
        H = np.zeros(self.n_nodes)
        for k, idx in enumerate(self._fixed_idx):
            H[idx] = self.H_f[k]
        for k, idx in enumerate(self._unknown_idx):
            H[idx] = self.H_u[k]
        return H

    def _compute_pipe_vectors(self) -> Tuple[np.ndarray, np.ndarray]:
        """Return (R, D) arrays for current Q."""
        R = np.zeros(self.n_pipes)
        D = np.zeros(self.n_pipes)
        for i, pipe in enumerate(self.pipes_list):
            R[i] = pipe_resistance(pipe, self.fluid, float(self.Q[i]), self.g)
            D[i] = dh_dQ(pipe, self.fluid, float(self.Q[i]), self.g)
        return R, D

    # ─────────────────────────────────────────────────────────────────────────

    def solve(self) -> NetworkSolution:
        """Run Newton-Raphson iterations until convergence."""
        import time as _time
        t0 = _time.perf_counter()
        history: List[float] = []
        warnings: List[str] = []
        max_err = 1e10
        iteration = 0

        for iteration in range(self.settings.max_iterations):
            R_vec, D_vec = self._compute_pipe_vectors()

            # Head loss vector: hf[i] = R[i] · Q[i] · |Q[i]|  (meters, signed)
            hf = R_vec * self.Q * np.abs(self.Q)

            H_all = self._assemble_H_all()

            # ── Residuals (Todini-Pilati, 1988) ──────────────────────────
            # Energy (per pipe): F1 = hf(Q) - A·H  →  should → 0
            #   i.e. friction head loss = head drop across pipe
            F1 = hf - self.A @ H_all                              # (n_pipes,)

            # Continuity (unknown nodes): F2 = A_u^T · Q - d_vec_u → should → 0
            # where d_vec = -demand (negative = outflow from network)
            d_vec_u = self.d_vec[self._unknown_idx]
            F2 = self.A_u.T @ self.Q - d_vec_u                   # (n_unknown,)

            max_err = float(max(np.max(np.abs(F1)), np.max(np.abs(F2))))
            history.append(max_err)

            if max_err < self.settings.convergence_tol:
                break

            # ── Newton system ─────────────────────────────────────────────
            # Jacobian:  dF1/dQ = D,  dF1/dH_u = -A_u
            #            dF2/dQ = A_u^T,  dF2/dH_u = 0
            #
            # [ D     -A_u ] [ dQ  ]   [ -F1 ]
            # [ A_u^T   0  ] [ dH_u] = [ -F2 ]
            n_eq = self.n_pipes + self.n_unknown
            J   = np.zeros((n_eq, n_eq))
            rhs = np.zeros(n_eq)

            np.fill_diagonal(J[:self.n_pipes, :self.n_pipes], D_vec)  # D
            J[:self.n_pipes, self.n_pipes:] = -self.A_u               # -A_u
            J[self.n_pipes:, :self.n_pipes] = self.A_u.T              # A_u^T

            rhs[:self.n_pipes] = -F1
            rhs[self.n_pipes:] = -F2

            try:
                delta, _, _, _ = np.linalg.lstsq(J, rhs, rcond=None)
            except np.linalg.LinAlgError:
                warnings.append(f"Linear solver failed at iteration {iteration}")
                break

            omega = self.settings.relaxation
            self.Q   += omega * delta[:self.n_pipes]
            self.H_u += omega * delta[self.n_pipes:]

        # ── Post-processing ───────────────────────────────────────────────
        elapsed   = _time.perf_counter() - t0
        converged = max_err < self.settings.convergence_tol

        if not converged:
            warnings.append(
                f"Gradient solver did not converge in {iteration + 1} iterations. "
                f"Max residual: {max_err:.2e}"
            )

        H_all = self._assemble_H_all()
        pipe_results, node_results = self._build_results(H_all)

        return NetworkSolution(
            converged=converged,
            iterations=iteration + 1,
            max_residual_m3s=float(max_err),
            max_head_error_m=float(max_err),
            pipe_results=pipe_results,
            node_results=node_results,
            total_head_loss_m=float(np.sum(np.abs(R_vec * self.Q ** 2))),
            total_power_w=float(self.fluid.density * self.g *
                                np.sum(np.abs(self.Q) * np.abs(R_vec * self.Q ** 2))),
            solve_time_s=elapsed,
            convergence_history=history,
            warnings=warnings,
        )

    def _build_results(self, H_all: np.ndarray) -> Tuple[Dict[str, PipeResult], Dict[str, NodeResult]]:
        pipe_results: Dict[str, PipeResult] = {}

        for i, pipe in enumerate(self.pipes_list):
            Q_i = float(self.Q[i])
            geom = PipeGeometry(
                diameter=pipe.diameter_m,
                length=pipe.length_m,
                roughness=pipe.roughness_m,
                elevation_in=pipe.elevation_from,
                elevation_out=pipe.elevation_to,
            )
            state = calculate_pipe_hydraulics(Q_i, geom, self.fluid, pipe.minor_K, self.g)
            R_i = pipe_resistance(pipe, self.fluid, Q_i, self.g)

            pipe_results[pipe.pipe_id] = PipeResult(
                pipe_id=pipe.pipe_id,
                flow_m3s=Q_i,
                velocity_m_s=float(state.velocity),
                reynolds_number=float(state.reynolds_number),
                friction_factor=float(state.friction_factor),
                head_loss_m=float(state.head_loss),
                pressure_drop_pa=float(state.pressure_drop),
                minor_head_loss_m=float(state.minor_loss_head),
                total_head_loss_m=float(state.total_head_loss),
                flow_regime=state.flow_regime.value,
                turbulence_intensity_pct=float(state.turbulence_intensity),
                wall_shear_stress_pa=float(state.wall_shear_stress),
                resistance_R=float(R_i),
                direction="forward" if Q_i >= 0 else "reverse",
            )

        node_results: Dict[str, NodeResult] = {}
        for j, node in enumerate(self.nodes_list):
            j_idx = self.node_idx[node.node_id]
            H_j = float(H_all[j_idx])
            p_head = H_j - node.elevation_m
            pressure_pa = max(0.0, p_head * self.fluid.density * self.g)

            # Compute inflow / outflow from pipe results
            inflow = outflow = 0.0
            for pipe in self.pipes_list:
                i = self.pipe_idx[pipe.pipe_id]
                Q_i = float(self.Q[i])
                if pipe.node_to == node.node_id and Q_i > 0:
                    inflow += Q_i
                elif pipe.node_from == node.node_id and Q_i < 0:
                    inflow += abs(Q_i)
                elif pipe.node_from == node.node_id and Q_i > 0:
                    outflow += Q_i
                elif pipe.node_to == node.node_id and Q_i < 0:
                    outflow += abs(Q_i)

            outflow += node.demand_m3s

            node_results[node.node_id] = NodeResult(
                node_id=node.node_id,
                pressure_head_m=float(p_head),
                elevation_m=node.elevation_m,
                hydraulic_grade_m=H_j,
                energy_grade_m=H_j,
                pressure_pa=float(pressure_pa),
                demand_m3s=node.demand_m3s,
                inflow_m3s=float(inflow),
                outflow_m3s=float(outflow),
                balance_error_m3s=float(inflow - outflow),
            )

        return pipe_results, node_results


# ===========================================================================
# High-level solve function
# ===========================================================================

def solve_network(
    nodes: List[NodeBC],
    pipes: List[PipeBC],
    fluid: FluidProperties,
    settings: Optional[SolverSettings] = None,
    g: float = 9.80665,
) -> NetworkSolution:
    """
    High-level entry point: solves a pipe network using the best available method.

    Uses Gradient (Todini-Pilati) by default; falls back to Hardy-Cross.

    Args:
        nodes: List of NodeBC boundary conditions
        pipes: List of PipeBC pipe definitions
        fluid: FluidProperties
        settings: SolverSettings (optional)
        g: Gravitational acceleration [m/s²]

    Returns:
        NetworkSolution with full results
    """
    cfg = settings or SolverSettings()

    if cfg.use_gradient_method and len(nodes) > 1:
        logger.info("Using Gradient (Todini-Pilati) solver for %d nodes, %d pipes",
                    len(nodes), len(pipes))
        solver = GradientSolver(nodes, pipes, fluid, cfg, g)
    else:
        logger.info("Using Hardy-Cross solver for %d nodes, %d pipes",
                    len(nodes), len(pipes))
        solver = HardyCrossSolver(nodes, pipes, fluid, cfg, g)

    return solver.solve()
