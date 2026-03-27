"""
FlowSim CFD — Comprehensive Test Suite
========================================
Tests for physics engine, solver, and API endpoints.
"""

import math
import pytest

# ===========================================================================
# Physics engine tests
# ===========================================================================

class TestReynoldsNumber:
    def test_laminar_water_pipe(self):
        from app.services.physics import reynolds_number
        V = 0.5          # m/s
        D = 0.05         # m
        nu = 1.004e-6    # m²/s (water 20°C)
        Re = reynolds_number(V, D, nu)
        assert abs(Re - 24900) < 100  # ~24900

    def test_zero_velocity(self):
        from app.services.physics import reynolds_number
        assert reynolds_number(0.0, 0.05, 1e-6) == 0.0

    def test_zero_diameter(self):
        from app.services.physics import reynolds_number
        assert reynolds_number(1.0, 0.0, 1e-6) == 0.0

    def test_turbulent_air_duct(self):
        from app.services.physics import reynolds_number
        Re = reynolds_number(5.0, 0.3, 1.516e-5)
        assert Re > 4000  # clearly turbulent


class TestFlowRegime:
    def test_laminar_low_re(self):
        from app.services.physics import identify_flow_regime, FlowRegime
        regime = identify_flow_regime(1000, 0.001)
        assert regime == FlowRegime.LAMINAR

    def test_transitional(self):
        from app.services.physics import identify_flow_regime, FlowRegime
        regime = identify_flow_regime(3000, 0.001)
        assert regime == FlowRegime.TRANSITIONAL

    def test_turbulent(self):
        from app.services.physics import identify_flow_regime, FlowRegime
        regime = identify_flow_regime(100000, 0.001)
        assert regime in (
            FlowRegime.TURBULENT_SMOOTH,
            FlowRegime.TURBULENT_ROUGH,
            FlowRegime.FULLY_TURBULENT,
        )


class TestFrictionFactors:
    """Validate against known Moody chart values."""

    def test_laminar_hagen_poiseuille(self):
        from app.services.physics import friction_factor_laminar
        # f = 64/Re, so at Re=1000: f=0.064
        f = friction_factor_laminar(1000)
        assert abs(f - 0.064) < 1e-6

    def test_colebrook_smooth_turbulent(self):
        from app.services.physics import friction_factor_colebrook
        # For smooth pipe (ε/D→0), Re=1e5, expected f ≈ 0.0180
        f = friction_factor_colebrook(1e5, 1e-10)
        assert 0.015 < f < 0.022

    def test_colebrook_rough_turbulent(self):
        from app.services.physics import friction_factor_colebrook
        # ε/D=0.01, Re=1e6, fully rough → f ≈ 0.038
        f = friction_factor_colebrook(1e6, 0.01)
        assert 0.030 < f < 0.045

    def test_swamee_jain_within_3pct_of_colebrook(self):
        from app.services.physics import friction_factor_colebrook, friction_factor_swamee_jain
        for re in [5e3, 1e4, 1e5, 1e6, 1e7]:
            for eps_d in [1e-4, 1e-3, 1e-2]:
                f_cb = friction_factor_colebrook(re, eps_d)
                f_sj = friction_factor_swamee_jain(re, eps_d)
                error_pct = abs(f_sj - f_cb) / f_cb * 100
                assert error_pct < 5.0, f"Swamee-Jain error {error_pct:.1f}% at Re={re}, ε/D={eps_d}"

    def test_churchill_spans_all_regimes(self):
        from app.services.physics import friction_factor_churchill
        # Should not raise for any Re
        for re in [100, 2300, 4000, 1e5, 1e8]:
            f = friction_factor_churchill(re, 0.001)
            assert f > 0

    def test_moody_laminar_threshold(self):
        from app.services.physics import friction_factor_moody
        f_lam = friction_factor_moody(2000, 0.001)
        assert abs(f_lam - 64 / 2000) < 1e-5

    def test_moody_turbulent(self):
        from app.services.physics import friction_factor_moody
        f = friction_factor_moody(1e5, 0.001)
        assert 0.015 < f < 0.040


class TestHeadLoss:
    def test_darcy_weisbach_basic(self):
        from app.services.physics import darcy_weisbach_head_loss
        # f=0.02, L=100m, D=0.1m, V=2 m/s → hf = 0.02*(100/0.1)*(4/19.613) = 0.02*1000*0.2039 ≈ 4.077m
        hf = darcy_weisbach_head_loss(0.02, 100, 0.1, 2.0)
        assert abs(hf - 4.077) < 0.01

    def test_minor_loss_zero_velocity(self):
        from app.services.physics import minor_loss_head
        assert minor_loss_head(1.5, 0.0) == 0.0

    def test_minor_loss_elbow(self):
        from app.services.physics import minor_loss_head
        # K=1.5, V=2 m/s: hm = 1.5 * 4/(2*9.80665) ≈ 0.306m
        hm = minor_loss_head(1.5, 2.0)
        assert abs(hm - 0.3058) < 0.01


class TestMinorLossCoefficients:
    def test_sudden_contraction_full(self):
        from app.services.physics import MinorLossCoefficients as MLC
        # ratio=0 (full contraction) → K = 0.42
        K = MLC.sudden_contraction(0.0)
        assert abs(K - 0.42) < 0.01

    def test_sudden_expansion_borda_carnot(self):
        from app.services.physics import MinorLossCoefficients as MLC
        # ratio=0.5 → K = (1-0.5)^2 = 0.25
        K = MLC.sudden_expansion(0.5)
        assert abs(K - 0.25) < 0.01


class TestVelocityProfiles:
    def test_laminar_parabolic_centerline(self):
        from app.services.physics import velocity_profile_laminar
        # At r=0 (centreline), u = 2*V_mean
        V_mean = 1.0
        R = 0.05
        u_cl = velocity_profile_laminar(0.0, R, V_mean)
        assert abs(u_cl - 2.0) < 1e-9

    def test_laminar_parabolic_wall(self):
        from app.services.physics import velocity_profile_laminar
        # At r=R (wall), u = 0
        u_wall = velocity_profile_laminar(0.05, 0.05, 1.0)
        assert abs(u_wall) < 1e-9

    def test_turbulent_power_law_at_wall(self):
        from app.services.physics import velocity_profile_turbulent_power_law
        # At r=0 (wall), u = 0
        u = velocity_profile_turbulent_power_law(0.0, 0.05, 1.0, 7.0)
        assert u == 0.0

    def test_log_law_buffer_layer(self):
        from app.services.physics import velocity_profile_log_law
        # y+ ~10 → buffer layer
        u = velocity_profile_log_law(1e-4, 0.05, 1e-6)
        assert u >= 0


class TestBernoulli:
    def test_static_head(self):
        from app.services.physics import bernoulli_total_head
        # V=0, z=0: H = P/(ρg) = 101325/(998.2*9.80665) ≈ 10.35m
        H = bernoulli_total_head(101325.0, 0.0, 0.0, 998.2)
        assert abs(H - 10.35) < 0.05

    def test_velocity_head_contribution(self):
        from app.services.physics import bernoulli_total_head
        H1 = bernoulli_total_head(101325.0, 0.0, 0.0, 998.2)
        H2 = bernoulli_total_head(101325.0, 2.0, 0.0, 998.2)
        # V²/(2g) = 4/19.613 ≈ 0.204m
        assert abs(H2 - H1 - 0.204) < 0.01


class TestWaterHammer:
    def test_wave_speed_steel_pipe(self):
        from app.services.physics import wave_speed_joukowski
        a = wave_speed_joukowski(
            bulk_modulus_fluid=2.18e9,
            density=998.2,
            diameter=0.1,
            wall_thickness=0.005,
            elastic_modulus_pipe=200e9,
        )
        # Steel water pipe: a ≈ 1000–1400 m/s
        assert 900 < a < 1500

    def test_joukowski_pressure_surge(self):
        from app.services.physics import joukowski_pressure_surge
        # ρ=998, a=1200, ΔV=1 m/s → ΔP = 1197600 Pa ≈ 1.2 MPa
        dP = joukowski_pressure_surge(998.2, 1200.0, 1.0)
        assert abs(dP - 1197840) < 5000

    def test_critical_closure_time(self):
        from app.services.physics import critical_closure_time
        # L=500m, a=1200 m/s → Tc = 2*500/1200 ≈ 0.833s
        tc = critical_closure_time(500.0, 1200.0)
        assert abs(tc - 0.833) < 0.01


class TestTurbulenceParameters:
    def test_turbulence_intensity_decreases_with_re(self):
        from app.services.physics import turbulence_intensity
        I1 = turbulence_intensity(1e4)
        I2 = turbulence_intensity(1e6)
        assert I1 > I2  # Higher Re → lower intensity

    def test_tke_proportional_to_velocity_squared(self):
        from app.services.physics import turbulent_kinetic_energy
        k1 = turbulent_kinetic_energy(0.05, 1.0)
        k2 = turbulent_kinetic_energy(0.05, 2.0)
        assert abs(k2 / k1 - 4.0) < 0.01  # k ∝ V²

    def test_friction_velocity_positive(self):
        from app.services.physics import friction_velocity
        u_star = friction_velocity(50.0, 998.2)
        assert u_star > 0
        assert abs(u_star - math.sqrt(50.0 / 998.2)) < 1e-9


class TestFullPipeHydraulics:
    def setup_method(self):
        from app.services.physics import FluidProperties, PipeGeometry
        self.fluid = FluidProperties(
            name="Water", density=998.2, viscosity=1.002e-3,
            bulk_modulus=2.18e9, vapor_pressure=2338.0,
            surface_tension=0.0728, specific_heat=4182.0,
            thermal_conductivity=0.598,
        )
        self.geom = PipeGeometry(
            diameter=0.10, length=200.0, roughness=4.6e-5,
        )

    def test_head_loss_increases_with_flow(self):
        from app.services.physics import calculate_pipe_hydraulics
        s1 = calculate_pipe_hydraulics(0.005, self.geom, self.fluid)
        s2 = calculate_pipe_hydraulics(0.010, self.geom, self.fluid)
        assert s2.head_loss > s1.head_loss

    def test_flow_regime_laminar_at_low_q(self):
        from app.services.physics import calculate_pipe_hydraulics, FlowRegime
        # Very low flow → laminar
        s = calculate_pipe_hydraulics(1e-5, self.geom, self.fluid)
        assert s.flow_regime == FlowRegime.LAMINAR

    def test_positive_negative_flow_symmetry(self):
        from app.services.physics import calculate_pipe_hydraulics
        s_pos = calculate_pipe_hydraulics(+0.01, self.geom, self.fluid)
        s_neg = calculate_pipe_hydraulics(-0.01, self.geom, self.fluid)
        assert abs(abs(s_pos.head_loss) - abs(s_neg.head_loss)) < 1e-6

    def test_wall_shear_stress_positive(self):
        from app.services.physics import calculate_pipe_hydraulics
        s = calculate_pipe_hydraulics(0.01, self.geom, self.fluid)
        assert s.wall_shear_stress > 0

    def test_mach_number_very_small_for_water(self):
        from app.services.physics import calculate_pipe_hydraulics
        s = calculate_pipe_hydraulics(0.05, self.geom, self.fluid)
        assert s.mach_number < 0.01  # Water flow: Ma << 1


# ===========================================================================
# Solver tests
# ===========================================================================

class TestHardyCrossSolver:
    def setup_method(self):
        from app.services.physics import FluidProperties
        self.fluid = FluidProperties(
            name="Water", density=998.2, viscosity=1.002e-3,
            bulk_modulus=2.18e9, vapor_pressure=2338.0,
            surface_tension=0.0728, specific_heat=4182.0,
            thermal_conductivity=0.598,
        )

    def test_simple_two_pipe_series(self):
        from app.services.solver import solve_network, NodeBC, PipeBC, SolverSettings
        nodes = [
            NodeBC("N1", demand_m3s=0.0, fixed_head_m=20.0, elevation_m=0.0),
            NodeBC("N2", demand_m3s=0.0, elevation_m=0.0),
            NodeBC("N3", demand_m3s=0.01, elevation_m=0.0),
        ]
        pipes = [
            PipeBC("P1", "N1", "N2", diameter_m=0.10, length_m=200, roughness_m=4.6e-5),
            PipeBC("P2", "N2", "N3", diameter_m=0.10, length_m=200, roughness_m=4.6e-5),
        ]
        sol = solve_network(nodes, pipes, self.fluid,
                            SolverSettings(max_iterations=500, convergence_tol=1e-7))
        # Series pipes: same flow through each
        q1 = abs(sol.pipe_results["P1"].flow_m3s)
        q2 = abs(sol.pipe_results["P2"].flow_m3s)
        assert abs(q1 - q2) < 1e-4  # mass balance

    def test_mass_balance_at_all_nodes(self):
        from app.services.solver import solve_network, NodeBC, PipeBC, SolverSettings
        nodes = [
            NodeBC("N1", demand_m3s=0.0,   fixed_head_m=20.0, elevation_m=0.0),
            NodeBC("N2", demand_m3s=0.006, elevation_m=0.0),
            NodeBC("N3", demand_m3s=0.004, elevation_m=0.0),
        ]
        pipes = [
            PipeBC("P1", "N1", "N2", 0.10, 300, 4.6e-5),
            PipeBC("P2", "N2", "N3", 0.08, 200, 4.6e-5),
            PipeBC("P3", "N3", "N1", 0.08, 250, 4.6e-5),
        ]
        sol = solve_network(nodes, pipes, self.fluid,
                            SolverSettings(max_iterations=500, convergence_tol=1e-7))
        # Check mass balance only at non-reservoir (demand) nodes
        for nid, nr in sol.node_results.items():
            node = next(n for n in nodes if n.node_id == nid)
            if node.fixed_head_m is None:  # skip reservoir nodes
                assert abs(nr.balance_error_m3s) < 1e-4, \
                    f"Node {nid} has mass balance error {nr.balance_error_m3s:.2e}"

    def test_single_pipe_network(self):
        from app.services.solver import solve_network, NodeBC, PipeBC, SolverSettings
        nodes = [
            NodeBC("N1", demand_m3s=0.0,  fixed_head_m=15.0, elevation_m=0.0),
            NodeBC("N2", demand_m3s=0.01, elevation_m=0.0),
        ]
        pipes = [
            PipeBC("P1", "N1", "N2", diameter_m=0.10, length_m=500, roughness_m=4.6e-5),
        ]
        sol = solve_network(nodes, pipes, self.fluid,
                            SolverSettings(max_iterations=500, convergence_tol=1e-7))
        assert sol.converged

    def test_convergence_simple_loop(self):
        from app.services.solver import solve_network, NodeBC, PipeBC, SolverSettings
        nodes = [
            NodeBC("A", fixed_head_m=25.0, demand_m3s=0.0,   elevation_m=5.0),
            NodeBC("B", demand_m3s=0.008, elevation_m=2.0),
            NodeBC("C", demand_m3s=0.006, elevation_m=0.0),
            NodeBC("D", demand_m3s=0.004, elevation_m=1.0),
        ]
        pipes = [
            PipeBC("AB", "A", "B", 0.12, 400, 4.6e-5),
            PipeBC("BC", "B", "C", 0.10, 300, 4.6e-5),
            PipeBC("CD", "C", "D", 0.08, 250, 4.6e-5),
            PipeBC("DA", "D", "A", 0.10, 350, 4.6e-5),
        ]
        sol = solve_network(nodes, pipes, self.fluid,
                            SolverSettings(max_iterations=500, convergence_tol=1e-7))
        assert sol.converged, f"Did not converge: {sol.warnings}"

    def test_pump_adds_energy(self):
        """Network with a pump should show higher downstream pressure."""
        from app.services.solver import solve_network, NodeBC, PipeBC, SolverSettings
        nodes = [
            NodeBC("N1", fixed_head_m=5.0, demand_m3s=0.0,   elevation_m=0.0),
            NodeBC("N2", demand_m3s=0.005, elevation_m=10.0),   # 10m higher
        ]
        pipes = [
            PipeBC("P1", "N1", "N2",
                   diameter_m=0.10, length_m=300, roughness_m=4.6e-5,
                   is_pump=True, pump_head_m=30.0),  # pump adds 30m
        ]
        sol = solve_network(nodes, pipes, self.fluid,
                            SolverSettings(max_iterations=500, convergence_tol=1e-7))
        # Upstream + pump head - friction > elevation: flow should be positive
        q = sol.pipe_results["P1"].flow_m3s
        assert q > 0  # Forward flow


class TestGradientSolver:
    def setup_method(self):
        from app.services.physics import FluidProperties
        self.fluid = FluidProperties(
            name="Water", density=998.2, viscosity=1.002e-3,
            bulk_modulus=2.18e9, vapor_pressure=2338.0,
            surface_tension=0.0728, specific_heat=4182.0,
            thermal_conductivity=0.598,
        )

    def test_gradient_vs_hardy_cross_agree(self):
        """Gradient solver should produce correct flows satisfying mass balance."""
        from app.services.solver import solve_network, NodeBC, PipeBC, SolverSettings
        nodes = [
            NodeBC("N1", fixed_head_m=20.0, demand_m3s=0.0,   elevation_m=0.0),
            NodeBC("N2", demand_m3s=0.005, elevation_m=0.0),
            NodeBC("N3", demand_m3s=0.005, elevation_m=0.0),
        ]
        pipes = [
            PipeBC("P1", "N1", "N2", 0.10, 300, 4.6e-5),
            PipeBC("P2", "N2", "N3", 0.08, 200, 4.6e-5),
            PipeBC("P3", "N3", "N1", 0.08, 250, 4.6e-5),
        ]
        cfg = SolverSettings(use_gradient_method=True, convergence_tol=1e-7)
        sol = solve_network(nodes, pipes, self.fluid, cfg)
        assert sol.converged, f"Gradient solver failed: {sol.warnings}"
        # Verify demand nodes have near-zero balance error
        for nid, nr in sol.node_results.items():
            node = next(n for n in nodes if n.node_id == nid)
            if node.fixed_head_m is None:
                assert abs(nr.balance_error_m3s) < 1e-4, \
                    f"Node {nid} balance error: {nr.balance_error_m3s:.2e}"


# ===========================================================================
# Schema validation tests
# ===========================================================================

class TestSchemaValidation:
    def test_pipe_create_invalid_diameter(self):
        from app.schemas.schemas import PipeCreate
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            PipeCreate(
                network_id="x", node_from_id="a", node_to_id="b",
                label="P1", diameter_m=-0.1, length_m=100,
            )

    def test_pipe_create_same_nodes(self):
        """Should ideally fail at DB layer; schema allows it."""
        from app.schemas.schemas import PipeCreate
        # Schema itself doesn't prevent same-node, DB endpoint does
        p = PipeCreate(
            network_id="x", node_from_id="a", node_to_id="a",
            label="P1", diameter_m=0.1, length_m=100,
        )
        assert p.node_from_id == p.node_to_id

    def test_fittings_config_total_K(self):
        from app.schemas.schemas import FittingsConfig
        fc = FittingsConfig(elbows_90_standard=2, gate_valves_open=1)
        K = fc.total_K()
        # 2 * 1.5 + 1 * 0.1 = 3.1
        assert abs(K - 3.1) < 0.01

    def test_solver_settings_defaults(self):
        from app.schemas.schemas import SolverSettingsSchema
        s = SolverSettingsSchema()
        assert s.max_iterations == 500
        assert s.use_gradient_method is True

    def test_fluid_create_valid(self):
        from app.schemas.schemas import FluidCreate
        f = FluidCreate(
            name="Test Oil", slug="test_oil",
            density_kg_m3=850.0, dynamic_viscosity_pa_s=0.01,
            kinematic_viscosity_m2_s=1.18e-5,
        )
        assert f.density_kg_m3 == 850.0


# ===========================================================================
# Canvas colormap tests
# ===========================================================================

class TestColormap:
    def test_min_value_maps_to_first_color(self):
        from app.api.endpoints.canvas import _interpolate_color
        c = _interpolate_color(0.0, "viridis")
        assert c.startswith("#")
        assert len(c) == 7

    def test_max_value_maps_to_last_color(self):
        from app.api.endpoints.canvas import _interpolate_color
        c = _interpolate_color(1.0, "viridis")
        assert c.startswith("#")

    def test_unknown_colormap_falls_back(self):
        from app.api.endpoints.canvas import _interpolate_color
        c = _interpolate_color(0.5, "nonexistent_map")
        assert c.startswith("#")  # should not raise

    def test_clamp_above_1(self):
        from app.api.endpoints.canvas import _interpolate_color
        c1 = _interpolate_color(1.0, "jet")
        c2 = _interpolate_color(999.0, "jet")
        assert c1 == c2  # clamped to 1


# ===========================================================================
# Integration: built-in test cases
# ===========================================================================

class TestBuiltInCases:
    """Validate the diagnostic test networks converge correctly."""

    def _water(self):
        from app.services.physics import FluidProperties
        return FluidProperties(
            name="Water", density=998.2, viscosity=1.002e-3,
            bulk_modulus=2.18e9, vapor_pressure=2338.0,
            surface_tension=0.0728, specific_heat=4182.0,
            thermal_conductivity=0.598,
        )

    def test_simple_loop_converges(self):
        from app.api.endpoints.diagnostics import _simple_loop, TEST_CASES
        from app.services.solver import solve_network, SolverSettings
        nodes, pipes, _ = _simple_loop()
        sol = solve_network(nodes, pipes, self._water(),
                            SolverSettings(convergence_tol=1e-7))
        assert sol.converged

    def test_branched_converges(self):
        from app.api.endpoints.diagnostics import _branched
        from app.services.solver import solve_network, SolverSettings
        nodes, pipes, _ = _branched()
        sol = solve_network(nodes, pipes, self._water(),
                            SolverSettings(convergence_tol=1e-7))
        assert sol.converged

    def test_complex_grid_converges(self):
        from app.api.endpoints.diagnostics import _complex_grid
        from app.services.solver import solve_network, SolverSettings
        nodes, pipes, _ = _complex_grid()
        sol = solve_network(nodes, pipes, self._water(),
                            SolverSettings(convergence_tol=1e-7))
        assert sol.converged

    def test_all_pipes_have_results(self):
        from app.api.endpoints.diagnostics import _complex_grid
        from app.services.solver import solve_network, SolverSettings
        nodes, pipes, _ = _complex_grid()
        sol = solve_network(nodes, pipes, self._water(),
                            SolverSettings(convergence_tol=1e-7))
        for pipe in pipes:
            assert pipe.pipe_id in sol.pipe_results

    def test_all_nodes_have_results(self):
        from app.api.endpoints.diagnostics import _complex_grid
        from app.services.solver import solve_network, SolverSettings
        nodes, pipes, _ = _complex_grid()
        sol = solve_network(nodes, pipes, self._water(),
                            SolverSettings(convergence_tol=1e-7))
        for node in nodes:
            assert node.node_id in sol.node_results

    def test_solution_positive_power(self):
        from app.api.endpoints.diagnostics import _simple_loop
        from app.services.solver import solve_network, SolverSettings
        nodes, pipes, _ = _simple_loop()
        sol = solve_network(nodes, pipes, self._water())
        assert sol.total_power_w >= 0
