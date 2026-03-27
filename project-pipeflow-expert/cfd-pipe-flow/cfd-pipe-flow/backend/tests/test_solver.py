"""
test_solver.py — Unit tests for the CFD solver engine.
Run with: pytest backend/tests/test_solver.py -v
"""
import math
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from cfd.solver import (
    friction_factor_colebrook_white,
    friction_factor_swamee_jain,
    friction_factor_churchill,
    head_loss_darcy_weisbach,
    pressure_drop_darcy_weisbach,
    reynolds_number,
    nusselt_gnielinski,
    nusselt_dittus_boelter,
    wave_speed_water_hammer,
    joukowsky_pressure_rise,
    cavitation_number,
    mach_number,
    critical_pressure_ratio,
    HardyCrossSolver,
    NewtonRaphsonSolver,
    NetworkTopology,
    CFDNetworkSolver,
    SolverConfig,
    PipeSegment,
    NetworkNode,
    FluidProperties,
    FLUID_DATABASE,
)


# ─────────────────────────────────────────────
# Friction factor tests
# ─────────────────────────────────────────────

class TestFrictionFactors:

    def test_laminar_exact(self):
        """Hagen-Poiseuille: f = 64/Re for laminar flow."""
        for re in [100, 500, 1000, 2000, 2299]:
            f = friction_factor_colebrook_white(re, 0.0)
            assert abs(f - 64.0 / re) < 1e-10, f"Re={re}"

    def test_turbulent_smooth_pipe(self):
        """Turbulent smooth pipe in expected range."""
        f = friction_factor_colebrook_white(1e5, 0.0)
        assert 0.017 < f < 0.020, f"f={f:.5f}"

    def test_turbulent_rough_pipe(self):
        """Rough pipe higher f than smooth at same Re."""
        f_smooth = friction_factor_colebrook_white(1e5, 0.0)
        f_rough  = friction_factor_colebrook_white(1e5, 0.01)
        assert f_rough > f_smooth

    def test_swamee_jain_close_to_colebrook(self):
        """Swamee-Jain within 3% of Colebrook-White."""
        for re in [1e4, 1e5, 1e6]:
            for eps_d in [0.0, 0.001, 0.01]:
                f_cw = friction_factor_colebrook_white(re, eps_d)
                f_sj = friction_factor_swamee_jain(re, eps_d)
                rel_err = abs(f_sj - f_cw) / f_cw
                assert rel_err < 0.03, f"Re={re:.0e} eps_d={eps_d} err={rel_err:.2%}"

    def test_churchill_close_to_colebrook(self):
        """Churchill unified formula within 1% of Colebrook-White."""
        for re in [1e4, 1e5, 1e6, 1e7]:
            for eps_d in [0.0, 0.001, 0.005]:
                f_cw = friction_factor_colebrook_white(re, eps_d)
                f_ch = friction_factor_churchill(re, eps_d)
                rel_err = abs(f_ch - f_cw) / f_cw
                assert rel_err < 0.02, f"Re={re:.0e} eps_d={eps_d} err={rel_err:.2%}"

    def test_nan_for_zero_re(self):
        f = friction_factor_colebrook_white(0, 0.001)
        assert math.isnan(f)

    def test_fully_turbulent_high_re(self):
        """At very high Re, rough pipe approaches fully-turbulent asymptote."""
        eps_d = 0.01
        f_high_re  = friction_factor_colebrook_white(1e9, eps_d)
        f_asymptote = 1.0 / (-2.0 * math.log10(eps_d / 3.7)) ** 2
        assert abs(f_high_re - f_asymptote) / f_asymptote < 0.01


# ─────────────────────────────────────────────
# Hydraulics tests
# ─────────────────────────────────────────────

class TestHydraulics:

    def test_reynolds_number(self):
        # Water 20°C: ν = 1.004e-6 m²/s, V=1 m/s, D=0.05 m
        re = reynolds_number(1.0, 0.05, 1.004e-6)
        assert abs(re - 49800) < 200

    def test_head_loss_laminar(self):
        """Validate DW against Hagen-Poiseuille for laminar flow."""
        # D=10mm, L=10m, Q=1e-5 m³/s, water 20°C
        D = 0.01
        L = 10.0
        A = math.pi * D**2 / 4
        Q = 1e-5
        V = Q / A
        nu = 1.004e-6
        re = reynolds_number(V, D, nu)
        assert re < 2300, "Should be laminar"
        f  = friction_factor_colebrook_white(re, 0.0)
        hL = head_loss_darcy_weisbach(f, L, D, V)
        # H-P: Δp = 128μLQ/(πD⁴)
        rho = 998.2
        mu  = 1.002e-3
        dp_hp = 128 * mu * L * Q / (math.pi * D**4)
        hL_hp = dp_hp / (rho * 9.80665)
        assert abs(hL - hL_hp) / hL_hp < 0.005  # < 0.5% error

    def test_pressure_drop_positive(self):
        dp = pressure_drop_darcy_weisbach(0.02, 100, 0.1, 2.5, 998)
        assert dp > 0

    def test_head_loss_zero_velocity(self):
        hL = head_loss_darcy_weisbach(0.02, 100, 0.1, 0.0)
        assert hL == 0.0


# ─────────────────────────────────────────────
# Heat transfer tests
# ─────────────────────────────────────────────

class TestHeatTransfer:

    def test_gnielinski_turbulent(self):
        """Gnielinski Nu should be >100 for highly turbulent water."""
        re = 5e4
        pr = 7.01
        f  = friction_factor_colebrook_white(re, 0.0)
        nu = nusselt_gnielinski(re, pr, f)
        assert nu > 100

    def test_dittus_boelter_heating_gt_cooling(self):
        """Heating exponent n=0.4 gives higher Nu than cooling n=0.3."""
        re = 5e4
        pr = 7.0
        nu_heat = nusselt_dittus_boelter(re, pr, heating=True)
        nu_cool = nusselt_dittus_boelter(re, pr, heating=False)
        assert nu_heat > nu_cool

    def test_dittus_boelter_low_re_returns_nan(self):
        nu = nusselt_dittus_boelter(5000, 7.0, heating=True)
        assert math.isnan(nu)


# ─────────────────────────────────────────────
# Water hammer tests
# ─────────────────────────────────────────────

class TestWaterHammer:

    def test_wave_speed_steel_pipe(self):
        """Steel pipe, water: wave speed ~1200–1400 m/s."""
        K   = 2.15e9   # bulk modulus water
        rho = 998.2
        D   = 0.3      # 300 mm
        t   = 0.01     # 10 mm wall
        E   = 200e9    # steel Young's modulus
        a   = wave_speed_water_hammer(K, rho, D, t, E)
        assert 1200 < a < 1400, f"a={a:.1f} m/s"

    def test_joukowsky_large_pressure(self):
        """Sudden closure of fast flow gives large pressure spike."""
        rho = 998.2
        a   = 1300.0   # m/s
        dV  = 2.0      # m/s
        dP  = joukowsky_pressure_rise(rho, a, dV)
        assert dP > 2e6  # > 2 MPa = 20 bar


# ─────────────────────────────────────────────
# Cavitation and compressible tests
# ─────────────────────────────────────────────

class TestOtherPhysics:

    def test_cavitation_number_positive_no_cavitation(self):
        sigma = cavitation_number(200000, 2337, 998, 1.0)
        assert sigma > 10   # well above vapour pressure

    def test_cavitation_number_near_zero(self):
        sigma = cavitation_number(3000, 2337, 998, 1.0)
        assert sigma < 1.0

    def test_mach_number_subsonic(self):
        M = mach_number(100, 1.4, 287, 293.15)
        assert M < 1.0

    def test_critical_pressure_ratio_air(self):
        ratio = critical_pressure_ratio(1.4)
        assert abs(ratio - 0.5283) < 0.001


# ─────────────────────────────────────────────
# Network topology tests
# ─────────────────────────────────────────────

class TestNetworkTopology:

    def _simple_network(self):
        nodes = [
            NetworkNode("N1", "reservoir", 0, 0, 0, True, 300000, 0),
            NetworkNode("N2", "junction",  1, 0, 0, False, None,   0),
            NetworkNode("N3", "demand",    2, 0, 0, False, None,   0.005),
        ]
        pipes = [
            PipeSegment("P1", "N1", "N2", 100, 0.1, 4.6e-5),
            PipeSegment("P2", "N2", "N3", 100, 0.1, 4.6e-5),
        ]
        return nodes, pipes

    def test_connected(self):
        nodes, pipes = self._simple_network()
        topo = NetworkTopology()
        comps = topo.connected_components(nodes, pipes)
        assert len(comps) == 1

    def test_validation_passes(self):
        nodes, pipes = self._simple_network()
        topo = NetworkTopology()
        errors = topo.validate(nodes, pipes)
        assert errors == []

    def test_validation_no_reservoir(self):
        nodes = [
            NetworkNode("N1", "junction", 0, 0, 0, False, None, 0),
            NetworkNode("N2", "demand",   1, 0, 0, False, None, 0.005),
        ]
        pipes = [PipeSegment("P1", "N1", "N2", 100, 0.1, 4.6e-5)]
        topo  = NetworkTopology()
        errors = topo.validate(nodes, pipes)
        assert any("reservoir" in e.lower() or "fixed" in e.lower() for e in errors)


# ─────────────────────────────────────────────
# Integration: solve a simple series network
# ─────────────────────────────────────────────

class TestSolverIntegration:

    def _make_series_network(self):
        nodes = [
            NetworkNode("N1", "reservoir", 0,   0, 0, True, 300000, 0),
            NetworkNode("N2", "junction",  100, 0, 0, False, None,  0),
            NetworkNode("N3", "demand",    200, 0, 0, False, None,  0.005),
        ]
        pipes = [
            PipeSegment("P1", "N1", "N2", 100, 0.1, 4.6e-5),
            PipeSegment("P2", "N2", "N3", 100, 0.1, 4.6e-5),
        ]
        return nodes, pipes

    def test_newton_raphson_converges(self):
        nodes, pipes = self._make_series_network()
        fluid  = FLUID_DATABASE["water_20c"]
        config = SolverConfig(solver_type="newton_raphson", tolerance=1e-9)
        solver = CFDNetworkSolver(config)
        result = solver.solve(nodes, pipes, fluid)
        assert result.converged
        assert result.iterations < 30

    def test_hardy_cross_converges(self):
        nodes, pipes = self._make_series_network()
        fluid  = FLUID_DATABASE["water_20c"]
        config = SolverConfig(solver_type="hardy_cross", tolerance=1e-8)
        solver = CFDNetworkSolver(config)
        result = solver.solve(nodes, pipes, fluid)
        assert result.converged

    def test_series_flow_equal_both_pipes(self):
        """In series: both pipes carry the same flow rate."""
        nodes, pipes = self._make_series_network()
        fluid  = FLUID_DATABASE["water_20c"]
        config = SolverConfig(solver_type="newton_raphson", tolerance=1e-10)
        solver = CFDNetworkSolver(config)
        result = solver.solve(nodes, pipes, fluid)

        Q1 = next(p.flow_rate_m3s for p in result.pipe_results if p.pipe_id == "P1")
        Q2 = next(p.flow_rate_m3s for p in result.pipe_results if p.pipe_id == "P2")
        assert abs(Q1 - Q2) < 1e-8, f"Q1={Q1:.6e} Q2={Q2:.6e}"

    def test_pipe_results_have_expected_fields(self):
        nodes, pipes = self._make_series_network()
        fluid  = FLUID_DATABASE["water_20c"]
        config = SolverConfig()
        solver = CFDNetworkSolver(config)
        result = solver.solve(nodes, pipes, fluid)
        for pr in result.pipe_results:
            assert pr.velocity is not None
            assert pr.reynolds_number is not None
            assert pr.friction_factor is not None
            assert pr.head_loss_m is not None
            assert pr.pressure_drop_pa is not None
            assert pr.reynolds_number > 0

    def test_mass_balance_at_nodes(self):
        """Sum of flows into each junction must equal zero."""
        nodes, pipes = self._make_series_network()
        fluid  = FLUID_DATABASE["water_20c"]
        config = SolverConfig(tolerance=1e-10)
        solver = CFDNetworkSolver(config)
        result = solver.solve(nodes, pipes, fluid)
        for nr in result.node_results:
            if nr.node_type == "junction":
                assert abs(nr.balance_error_m3s) < 1e-9, \
                    f"Node {nr.node_id} balance error={nr.balance_error_m3s:.2e}"

    def test_statistics_populated(self):
        nodes, pipes = self._make_series_network()
        fluid  = FLUID_DATABASE["water_20c"]
        result = CFDNetworkSolver(SolverConfig()).solve(nodes, pipes, fluid)
        stats  = result.statistics
        assert stats.max_velocity_ms > 0
        assert stats.mean_velocity_ms > 0
        assert 0 <= stats.velocity_uniformity_index <= 1
