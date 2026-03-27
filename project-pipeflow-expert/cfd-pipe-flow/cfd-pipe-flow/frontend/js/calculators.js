/**
 * calculators.js — Engineering Calculator Logic
 * CFD Pipe-Flow Expert  ·  Frontend Module
 *
 * Provides interactive calculators:
 *   1. Darcy-Weisbach head-loss / pressure-drop
 *   2. Reynolds Number + flow regime
 *   3. Water Hammer (Joukowsky)
 *   4. Heat Transfer (Nusselt, convection coefficient)
 *   5. Minor Losses (K-factor)
 *   6. Pump Power & NPSH
 *   7. Pipe sizing (iterative, given Q & allowable ΔP)
 *   8. Compressible flow (Mach, choked)
 *   9. Two-phase flow (Lockhart-Martinelli)
 *  10. Hydraulic jump
 */

"use strict";

/* =========================================================================
   Fluid database (mirrors backend FLUID_DATABASE)
   ========================================================================= */

const FLUIDS = {
  water_20c:  { name: "Water 20 °C",  rho: 998.2,  mu: 1.002e-3, Pr: 7.01,  cp: 4182,  k: 0.598,  pv: 2337  },
  water_60c:  { name: "Water 60 °C",  rho: 983.2,  mu: 0.467e-3, Pr: 2.99,  cp: 4185,  k: 0.651,  pv: 19940 },
  water_80c:  { name: "Water 80 °C",  rho: 971.8,  mu: 0.355e-3, Pr: 2.22,  cp: 4197,  k: 0.670,  pv: 47390 },
  air_20c:    { name: "Air 20 °C",    rho: 1.204,  mu: 1.825e-5, Pr: 0.713, cp: 1005,  k: 0.02551, pv: 0    },
  oil_sae30:  { name: "SAE-30 Oil",   rho: 891,    mu: 0.290,    Pr: 3800,  cp: 1900,  k: 0.145,  pv: 0    },
  glycol_50:  { name: "50 % Ethylene Glycol", rho: 1065, mu: 3.48e-3, Pr: 28, cp: 3558, k: 0.415, pv: 500 }
};

/* =========================================================================
   Pipe roughness database
   ========================================================================= */

const ROUGHNESS = {
  smooth_glass:      0.0000001,
  drawn_tubing:      0.0000015,
  commercial_steel:  0.000046,
  galvanized_steel:  0.00015,
  cast_iron:         0.00026,
  concrete_smooth:   0.0003,
  concrete_rough:    0.003,
  riveted_steel:     0.003,
  pvc_plastic:       0.0000015,
  copper:            0.0000015,
  stainless_steel:   0.000002,
  wrought_iron:      0.000046,
  asphalted_ci:      0.00012
};

/* =========================================================================
   Core math (mirrors backend solver.py, no external deps)
   ========================================================================= */

const CFDMath = (() => {

  function reynoldsNumber(velocity, diameter, kinematicViscosity) {
    if (kinematicViscosity <= 0) return Infinity;
    return Math.abs(velocity) * diameter / kinematicViscosity;
  }

  function kinematicViscosity(mu, rho) { return mu / rho; }

  /** Colebrook-White, Picard iteration */
  function colebrookWhite(re, epsD) {
    if (re <= 0) return NaN;
    if (re < 2300) return 64 / re;
    if (epsD <= 0) {
      // Smooth: Prandtl smooth law
      let f = 0.02;
      for (let i = 0; i < 60; i++) {
        const f1 = 1 / (-2 * Math.log10(2.51 / (re * Math.sqrt(f)))) ** 2;
        if (Math.abs(f1 - f) < 1e-12) return f1;
        f = f1;
      }
      return f;
    }
    let f = 0.25 / (Math.log10(epsD / 3.7 + 5.74 / re ** 0.9)) ** 2;
    for (let i = 0; i < 60; i++) {
      const f1 = 1 / (-2 * Math.log10(epsD / 3.7 + 2.51 / (re * Math.sqrt(f)))) ** 2;
      if (Math.abs(f1 - f) < 1e-12) return f1;
      f = f1;
    }
    return f;
  }

  /** Swamee-Jain explicit approximation */
  function swameeJain(re, epsD) {
    if (re < 2300) return 64 / re;
    return 0.25 / (Math.log10(epsD / 3.7 + 5.74 / re ** 0.9)) ** 2;
  }

  /** Churchill (1977) unified formula */
  function churchill(re, epsD) {
    const A = (-2.457 * Math.log((7/re)**0.9 + 0.27*epsD)) ** 16;
    const B = (37530/re) ** 16;
    return 8 * ((8/re)**12 + 1/(A+B)**1.5) ** (1/12);
  }

  /** Darcy-Weisbach head loss */
  function headLoss(f, L, D, v) {
    const g = 9.80665;
    return f * (L / D) * (v * v) / (2 * g);
  }

  /** Pressure drop (Pa) */
  function pressureDrop(f, L, D, v, rho) {
    return f * (L / D) * 0.5 * rho * v * v;
  }

  /** Minor loss head (K factor) */
  function minorLossHead(K, v) {
    return K * v * v / (2 * 9.80665);
  }

  /** Velocity from flow rate */
  function velocity(Q, D) {
    return Q / (Math.PI * D * D / 4);
  }

  /** Joukowsky pressure rise (water hammer) */
  function joukowsky(rho, a, dV) {
    return rho * a * dV;
  }

  /** Wave speed in liquid-filled pipe */
  function waveSpeed(K, rho, D, t, E) {
    // K = bulk modulus of liquid, E = Young's modulus of pipe, t = wall thickness
    const denom = 1 + (K / E) * (D / t);
    return Math.sqrt(K / (rho * denom));
  }

  /** Nusselt — Dittus-Boelter */
  function nusseltDittusBoelter(re, pr, heating = true) {
    if (re < 10000) return NaN;
    const n = heating ? 0.4 : 0.3;
    return 0.023 * re ** 0.8 * pr ** n;
  }

  /** Nusselt — Gnielinski (4000 ≤ Re ≤ 5×10^6) */
  function nusseltGnielinski(re, pr, f) {
    if (re < 3000) return NaN;
    const num = (f / 8) * (re - 1000) * pr;
    const den = 1 + 12.7 * Math.sqrt(f / 8) * (pr ** (2/3) - 1);
    return num / den;
  }

  /** Nusselt — Sieder-Tate */
  function nusseltSiederTate(re, pr) {
    if (re < 10000) return NaN;
    return 0.027 * re ** 0.8 * pr ** (1/3);
  }

  /** Nusselt — laminar, constant heat flux */
  function nusseltLaminar(re, pr, D, L) {
    const Gz = re * pr * D / L;
    return 3.66 + (0.0668 * Gz) / (1 + 0.04 * Gz ** (2/3));
  }

  /** Heat transfer coefficient h (W/m²K) */
  function htCoeff(Nu, k, D) { return Nu * k / D; }

  /** Log-mean temperature difference */
  function lmtd(T_in, T_out, T_wall) {
    const dT1 = T_wall - T_in;
    const dT2 = T_wall - T_out;
    if (dT1 === dT2) return dT1;
    return (dT1 - dT2) / Math.log(Math.abs(dT1 / dT2));
  }

  /** Cavitation number */
  function cavitationNumber(p, pv, rho, v) {
    return (p - pv) / (0.5 * rho * v * v);
  }

  /** NPSH available */
  function npshAvailable(p_atm, p_vapor, rho, g, z) {
    return (p_atm - p_vapor) / (rho * g) + z;
  }

  /** Pump power */
  function pumpPower(Q, rho, g, Hp, eta) {
    return (rho * g * Q * Hp) / eta;
  }

  /** Mach number */
  function machNumber(v, gamma, R, T) {
    return v / Math.sqrt(gamma * R * T);
  }

  /** Isentropic pressure ratio */
  function isentropicPressureRatio(M, gamma) {
    return (1 + (gamma - 1) / 2 * M * M) ** (-gamma / (gamma - 1));
  }

  /** Critical pressure ratio for choked flow */
  function criticalPressureRatio(gamma) {
    return (2 / (gamma + 1)) ** (gamma / (gamma - 1));
  }

  /** Lockhart-Martinelli parameter */
  function lockhartMartinelli(dpdz_L, dpdz_G) {
    return Math.sqrt(dpdz_L / dpdz_G);
  }

  /** Two-phase multiplier Φ² (Chisholm) */
  function twoPhaseMultiplier(X, C = 21) {
    return 1 + C / X + 1 / (X * X);
  }

  /** Dean number */
  function deanNumber(re, D, Rc) {
    return re * Math.sqrt(D / (2 * Rc));
  }

  /** Womersley number */
  function womersleyNumber(R, omega, nu) {
    return R * Math.sqrt(omega / nu);
  }

  /** Strouhal number */
  function strouhalNumber(f_vortex, L, v) {
    return f_vortex * L / v;
  }

  /** Euler number */
  function eulerNumber(dp, rho, v) {
    return dp / (0.5 * rho * v * v);
  }

  return {
    reynoldsNumber, kinematicViscosity,
    colebrookWhite, swameeJain, churchill,
    headLoss, pressureDrop, minorLossHead, velocity,
    joukowsky, waveSpeed,
    nusseltDittusBoelter, nusseltGnielinski, nusseltSiederTate, nusseltLaminar,
    htCoeff, lmtd, cavitationNumber, npshAvailable, pumpPower,
    machNumber, isentropicPressureRatio, criticalPressureRatio,
    lockhartMartinelli, twoPhaseMultiplier,
    deanNumber, womersleyNumber, strouhalNumber, eulerNumber
  };
})();

/* =========================================================================
   Helper: format output table row
   ========================================================================= */

function _row(label, value, unit = "", note = "") {
  const noteHTML = note ? `<small class="note">${note}</small>` : "";
  return `<tr>
    <td class="calc-label">${label}</td>
    <td class="calc-val"><strong>${value}</strong> <span class="unit">${unit}</span>${noteHTML}</td>
  </tr>`;
}

function _fmt(v, dec = 4) {
  if (v == null || isNaN(v) || !isFinite(v)) return "—";
  if (Math.abs(v) >= 1e6 || (Math.abs(v) < 0.001 && v !== 0)) return v.toExponential(3);
  return v.toFixed(dec);
}

function _regimeBadge(re) {
  if (re < 2300)  return `<span style="color:#27ae60;font-weight:bold;">Laminar (Re=${Math.round(re)})</span>`;
  if (re < 4000)  return `<span style="color:#f39c12;font-weight:bold;">Transitional (Re=${Math.round(re)})</span>`;
  return              `<span style="color:#c0392b;font-weight:bold;">Turbulent (Re=${Math.round(re)})</span>`;
}

/* =========================================================================
   Calculator 1 — Darcy-Weisbach
   ========================================================================= */

const CalcDarcyWeisbach = (() => {

  function compute() {
    const fluid  = document.getElementById("dw-fluid")?.value ?? "water_20c";
    const f_props= FLUIDS[fluid] || FLUIDS.water_20c;

    const L    = parseFloat(document.getElementById("dw-L")?.value);
    const D    = parseFloat(document.getElementById("dw-D")?.value);
    const Q    = parseFloat(document.getElementById("dw-Q")?.value);
    const eps  = parseFloat(document.getElementById("dw-eps")?.value) ?? 4.6e-5;
    const method = document.getElementById("dw-method")?.value ?? "colebrook";

    if ([L, D, Q].some(v => isNaN(v) || v <= 0)) {
      _showResult("dw-result", "<p class='error'>Please enter valid positive values for L, D, Q.</p>");
      return;
    }

    const rho  = f_props.rho;
    const mu   = f_props.mu;
    const nu   = mu / rho;
    const A    = Math.PI * D * D / 4;
    const v    = Q / A;
    const re   = CFDMath.reynoldsNumber(v, D, nu);
    const epsD = eps / D;

    let f;
    switch (method) {
      case "laminar":  f = 64 / re; break;
      case "swamee":   f = CFDMath.swameeJain(re, epsD); break;
      case "churchill": f = CFDMath.churchill(re, epsD); break;
      default:          f = CFDMath.colebrookWhite(re, epsD);
    }

    const hL  = CFDMath.headLoss(f, L, D, v);
    const dp  = CFDMath.pressureDrop(f, L, D, v, rho);
    const tau = f * rho * v * v / 8;   // wall shear stress
    const uStar = Math.sqrt(tau / rho); // shear velocity
    const Re_tau = uStar * (D/2) / nu; // friction Re

    const cavNum = CFDMath.cavitationNumber(101325, f_props.pv ?? 2337, rho, v);

    _showResult("dw-result", `
      <table class="calc-result-table">
        ${_row("Fluid", f_props.name)}
        ${_row("Cross-sectional Area", _fmt(A, 6), "m²")}
        ${_row("Mean Velocity", _fmt(v), "m/s")}
        ${_row("Reynolds Number", Math.round(re), "—", _regimeBadge(re))}
        ${_row("Relative Roughness ε/D", epsD.toExponential(3))}
        ${_row("Friction Factor f", _fmt(f, 6), "—", `Method: ${method}`)}
        ${_row("Head Loss h_L", _fmt(hL), "m")}
        ${_row("Pressure Drop Δp", _fmt(dp, 2), "Pa")}
        ${_row("Pressure Drop Δp", _fmt(dp / 1000, 4), "kPa")}
        ${_row("Wall Shear Stress τ_w", _fmt(tau, 4), "Pa")}
        ${_row("Shear Velocity u*", _fmt(uStar, 5), "m/s")}
        ${_row("Friction Reynolds Re_τ", _fmt(Re_tau, 1))}
        ${_row("Cavitation Number", _fmt(cavNum, 4), "—", cavNum < 0.5 ? "⚠ Cavitation risk" : "OK")}
      </table>
    `);
  }

  return { compute };
})();

/* =========================================================================
   Calculator 2 — Reynolds Number & Flow Regime
   ========================================================================= */

const CalcReynolds = (() => {

  function compute() {
    const fluid   = document.getElementById("re-fluid")?.value ?? "water_20c";
    const fp      = FLUIDS[fluid] || FLUIDS.water_20c;
    const v       = parseFloat(document.getElementById("re-velocity")?.value);
    const D       = parseFloat(document.getElementById("re-diameter")?.value);
    const nuCustom = parseFloat(document.getElementById("re-nu")?.value);
    const nu      = isNaN(nuCustom) || nuCustom <= 0 ? fp.mu / fp.rho : nuCustom;

    if (isNaN(v) || isNaN(D) || v <= 0 || D <= 0) {
      _showResult("re-result", "<p class='error'>Enter valid velocity and diameter.</p>");
      return;
    }

    const re = CFDMath.reynoldsNumber(v, D, nu);
    const regime = re < 2300 ? "Laminar" : re < 4000 ? "Transitional" : "Turbulent";

    // Stanton number, thermal entry length
    const Pr   = fp.Pr;
    const Le_h = re < 2300 ? 0.06 * re * D : 10 * D;   // hydrodynamic entry length
    const Le_t = re < 2300 ? 0.05 * re * Pr * D : 10 * D;

    // Turbulence intensity (empirical)
    const I = re < 2300 ? 0 : 0.16 * re ** (-1/8);

    // Boundary layer thickness (Prandtl 1/7 law) at L=1m
    const L = 1;
    const delta_lam = 5 * L / Math.sqrt(re);

    _showResult("re-result", `
      <table class="calc-result-table">
        ${_row("Fluid", fp.name)}
        ${_row("Kinematic Viscosity ν", nu.toExponential(4), "m²/s")}
        ${_row("Reynolds Number", Math.round(re))}
        ${_row("Flow Regime", _regimeBadge(re))}
        ${_row("Prandtl Number", _fmt(Pr, 3))}
        ${_row("Turb. Intensity I", _fmt(I * 100, 2), "% (estimated)")}
        ${_row("Hydro. Entry Length", _fmt(Le_h, 3), "m")}
        ${_row("Thermal Entry Length", _fmt(Le_t, 3), "m")}
        ${_row("Lam. BL δ (at L=1m)", _fmt(delta_lam, 5), "m")}
      </table>
    `);
  }

  return { compute };
})();

/* =========================================================================
   Calculator 3 — Water Hammer (Joukowsky)
   ========================================================================= */

const CalcWaterHammer = (() => {

  function compute() {
    const fluid = document.getElementById("wh-fluid")?.value ?? "water_20c";
    const fp    = FLUIDS[fluid] || FLUIDS.water_20c;
    const v0    = parseFloat(document.getElementById("wh-v0")?.value);
    const D     = parseFloat(document.getElementById("wh-D")?.value);
    const t     = parseFloat(document.getElementById("wh-thickness")?.value);
    const L     = parseFloat(document.getElementById("wh-L")?.value);
    const tc    = parseFloat(document.getElementById("wh-tc")?.value);   // valve closure time
    const E     = parseFloat(document.getElementById("wh-E")?.value) ?? 200e9;  // Young's modulus

    if ([v0, D, t, L].some(v => isNaN(v) || v <= 0)) {
      _showResult("wh-result", "<p class='error'>Enter valid pipe parameters.</p>");
      return;
    }

    const rho = fp.rho;
    // Bulk modulus of water ~2.15 GPa
    const K   = 2.15e9;

    const a    = CFDMath.waveSpeed(K, rho, D, t, E);
    const dp   = CFDMath.joukowsky(rho, a, v0);    // instantaneous pressure rise
    const T_r  = 2 * L / a;                         // wave return time
    const tc_eff = isNaN(tc) || tc <= 0 ? 0 : tc;
    const isInstant = tc_eff <= T_r;
    const dpEff = isInstant ? dp : dp * T_r / tc_eff;

    const head_rise = dpEff / (rho * 9.80665);

    _showResult("wh-result", `
      <table class="calc-result-table">
        ${_row("Fluid", fp.name)}
        ${_row("Wave Speed a", _fmt(a, 2), "m/s")}
        ${_row("Wave Return Time T_r", _fmt(T_r, 4), "s")}
        ${_row("Closure Type", isInstant ? "⚡ Instantaneous (t_c ≤ T_r)" : "Slow (t_c > T_r)")}
        ${_row("Joukowsky ΔP (max)", _fmt(dp / 1000, 2), "kPa")}
        ${_row("Effective ΔP", _fmt(dpEff / 1000, 2), "kPa")}
        ${_row("Head Rise Δh", _fmt(head_rise, 3), "m")}
        ${_row("Pipeline Period", _fmt(T_r, 4), "s")}
      </table>
    `);
  }

  return { compute };
})();

/* =========================================================================
   Calculator 4 — Heat Transfer
   ========================================================================= */

const CalcHeatTransfer = (() => {

  function compute() {
    const fluid  = document.getElementById("ht-fluid")?.value ?? "water_20c";
    const fp     = FLUIDS[fluid] || FLUIDS.water_20c;
    const D      = parseFloat(document.getElementById("ht-D")?.value);
    const L      = parseFloat(document.getElementById("ht-L")?.value);
    const v      = parseFloat(document.getElementById("ht-v")?.value);
    const T_in   = parseFloat(document.getElementById("ht-T-in")?.value);
    const T_wall = parseFloat(document.getElementById("ht-T-wall")?.value);
    const method = document.getElementById("ht-method")?.value ?? "gnielinski";

    if ([D, L, v, T_in, T_wall].some(x => isNaN(x))) {
      _showResult("ht-result", "<p class='error'>Enter all parameters.</p>");
      return;
    }

    const rho  = fp.rho;
    const mu   = fp.mu;
    const nu   = mu / rho;
    const k    = fp.k;
    const Pr   = fp.Pr;
    const cp   = fp.cp;
    const re   = CFDMath.reynoldsNumber(v, D, nu);
    const epsD = 0.000046 / D;
    const f    = CFDMath.colebrookWhite(re, epsD);
    const heating = T_wall > T_in;

    let Nu;
    switch (method) {
      case "dittus":  Nu = CFDMath.nusseltDittusBoelter(re, Pr, heating); break;
      case "sieder":  Nu = CFDMath.nusseltSiederTate(re, Pr); break;
      case "laminar": Nu = CFDMath.nusseltLaminar(re, Pr, D, L); break;
      default:        Nu = CFDMath.nusseltGnielinski(re, Pr, f);
    }

    const h    = CFDMath.htCoeff(Nu, k, D);
    const A    = Math.PI * D * L;    // heat transfer area
    const Q_dot = isNaN(Nu) ? NaN : h * A * (T_wall - T_in);  // W
    const mdot = rho * (Math.PI * D * D / 4) * v;
    const T_out = isNaN(Q_dot) ? NaN : T_in + Q_dot / (mdot * cp);
    const Eff_dT = Math.abs(T_wall - T_in);
    const NTU = isNaN(h) ? NaN : h * A / (mdot * cp);

    _showResult("ht-result", `
      <table class="calc-result-table">
        ${_row("Fluid", fp.name)}
        ${_row("Reynolds Number", Math.round(re), "—", _regimeBadge(re))}
        ${_row("Prandtl Number", _fmt(Pr, 3))}
        ${_row("Friction Factor", _fmt(f, 6))}
        ${_row("Nusselt Number", _fmt(Nu, 2), "—", `Method: ${method}`)}
        ${_row("Heat Transfer Coeff h", _fmt(h, 2), "W/(m²·K)")}
        ${_row("Heat Transfer Area A", _fmt(A, 4), "m²")}
        ${_row("Mass Flow Rate ṁ", _fmt(mdot, 5), "kg/s")}
        ${_row("Heat Rate Q̇", _fmt(Q_dot, 2), "W")}
        ${_row("Outlet Temperature", _fmt(T_out, 3), "°C")}
        ${_row("NTU (thermal units)", _fmt(NTU, 4))}
      </table>
    `);
  }

  return { compute };
})();

/* =========================================================================
   Calculator 5 — Minor Losses (fittings K-factor)
   ========================================================================= */

const MINOR_LOSS_K = {
  globe_valve_open:   10.0,
  gate_valve_open:    0.13,
  gate_valve_half:    5.6,
  ball_valve_open:    0.05,
  check_valve:        2.0,
  elbow_90_std:       0.9,
  elbow_90_long:      0.6,
  elbow_45:           0.42,
  tee_through:        0.35,
  tee_branch:         1.5,
  entrance_sharp:     0.5,
  entrance_reentrant: 0.8,
  exit_sudden:        1.0,
  reducer_sudden:     0.5,
  expander_sudden:    0.9,
  strainer_basket:    0.85,
  y_strainer:         1.3,
  swing_check:        2.5
};

const CalcMinorLoss = (() => {

  function compute() {
    const fluid  = document.getElementById("ml-fluid")?.value ?? "water_20c";
    const fp     = FLUIDS[fluid] || FLUIDS.water_20c;
    const D      = parseFloat(document.getElementById("ml-D")?.value);
    const Q      = parseFloat(document.getElementById("ml-Q")?.value);

    if (isNaN(D) || isNaN(Q) || D <= 0 || Q <= 0) {
      _showResult("ml-result", "<p class='error'>Enter valid D and Q.</p>");
      return;
    }

    const A   = Math.PI * D * D / 4;
    const v   = Q / A;
    const rho = fp.rho;

    // Collect checked fittings
    let totalK = 0;
    const rows = [];

    Object.entries(MINOR_LOSS_K).forEach(([key, K]) => {
      const cb  = document.getElementById(`ml-${key}`);
      const qty = parseInt(document.getElementById(`ml-qty-${key}`)?.value) || 0;
      if (cb?.checked && qty > 0) {
        const Keff = K * qty;
        const hL   = CFDMath.minorLossHead(Keff, v);
        totalK += Keff;
        rows.push(_row(
          `${key.replace(/_/g," ")} × ${qty}`,
          `K=${Keff.toFixed(2)}, h_L=${_fmt(hL)}`,
          "m"
        ));
      }
    });

    const totalHL = CFDMath.minorLossHead(totalK, v);
    const totalDP = totalHL * rho * 9.80665;

    _showResult("ml-result", `
      <table class="calc-result-table">
        ${_row("Velocity", _fmt(v), "m/s")}
        ${rows.join("")}
        ${_row("Total K", _fmt(totalK, 4))}
        ${_row("Total Head Loss", _fmt(totalHL), "m")}
        ${_row("Total Pressure Drop", _fmt(totalDP, 2), "Pa")}
      </table>
    `);
  }

  function buildFittingsUI() {
    const container = document.getElementById("ml-fittings-list");
    if (!container) return;

    container.innerHTML = Object.entries(MINOR_LOSS_K).map(([key, K]) => `
      <div class="fitting-row">
        <label>
          <input type="checkbox" id="ml-${key}">
          ${key.replace(/_/g, " ")} (K = ${K})
        </label>
        <input type="number" id="ml-qty-${key}" value="1" min="1" max="100" style="width:48px;">
      </div>
    `).join("");
  }

  return { compute, buildFittingsUI };
})();

/* =========================================================================
   Calculator 6 — Pump Power & NPSH
   ========================================================================= */

const CalcPump = (() => {

  function compute() {
    const fluid = document.getElementById("pump-fluid")?.value ?? "water_20c";
    const fp    = FLUIDS[fluid] || FLUIDS.water_20c;
    const Q     = parseFloat(document.getElementById("pump-Q")?.value);
    const Hp    = parseFloat(document.getElementById("pump-Hp")?.value);
    const eta   = parseFloat(document.getElementById("pump-eta")?.value) / 100;
    const z_s   = parseFloat(document.getElementById("pump-zs")?.value) ?? 0;   // suction lift
    const p_atm = parseFloat(document.getElementById("pump-patm")?.value) ?? 101325;

    if ([Q, Hp, eta].some(v => isNaN(v) || v <= 0)) {
      _showResult("pump-result", "<p class='error'>Enter valid Q, H, η.</p>");
      return;
    }

    const rho = fp.rho;
    const g   = 9.80665;
    const pv  = fp.pv ?? 2337;

    const P_shaft   = CFDMath.pumpPower(Q, rho, g, Hp, eta);
    const P_hydro   = rho * g * Q * Hp;
    const P_losses  = P_shaft - P_hydro;
    const NPSH_a    = CFDMath.npshAvailable(p_atm, pv, rho, g, z_s);
    const sp_speed  = (Q ** 0.5 * (2 * Math.PI * /* assume N=1450rpm */ 1450/60)) / (g * Hp) ** 0.75;

    _showResult("pump-result", `
      <table class="calc-result-table">
        ${_row("Fluid", fp.name)}
        ${_row("Flow Rate Q", _fmt(Q * 1000, 3), "L/s")}
        ${_row("Pump Head H_p", _fmt(Hp), "m")}
        ${_row("Efficiency η", _fmt(eta * 100, 1), "%")}
        ${_row("Hydraulic Power", _fmt(P_hydro, 1), "W")}
        ${_row("Shaft Power", _fmt(P_shaft, 1), "W")}
        ${_row("Power Losses", _fmt(P_losses, 1), "W")}
        ${_row("NPSH_available", _fmt(NPSH_a, 3), "m")}
        ${_row("Specific Speed Ns", _fmt(sp_speed, 4))}
        ${_row("Vapor Pressure p_v", _fmt(pv, 0), "Pa")}
      </table>
    `);
  }

  return { compute };
})();

/* =========================================================================
   Calculator 7 — Pipe Sizing (given Q, allowable Δp/L)
   ========================================================================= */

const CalcPipeSizing = (() => {

  function compute() {
    const fluid   = document.getElementById("ps-fluid")?.value ?? "water_20c";
    const fp      = FLUIDS[fluid] || FLUIDS.water_20c;
    const Q       = parseFloat(document.getElementById("ps-Q")?.value);
    const dpL     = parseFloat(document.getElementById("ps-dpL")?.value);  // Pa/m
    const eps     = parseFloat(document.getElementById("ps-eps")?.value) ?? 4.6e-5;
    const vMax    = parseFloat(document.getElementById("ps-vmax")?.value) ?? 3.0;

    if ([Q, dpL].some(v => isNaN(v) || v <= 0)) {
      _showResult("ps-result", "<p class='error'>Enter valid Q and allowable Δp/L.</p>");
      return;
    }

    const rho = fp.rho;
    const nu  = fp.mu / rho;

    // Iterative pipe sizing
    let D = 0.05;   // initial guess
    for (let iter = 0; iter < 100; iter++) {
      const A    = Math.PI * D * D / 4;
      const v    = Q / A;
      const re   = CFDMath.reynoldsNumber(v, D, nu);
      const epsD = eps / D;
      const f    = CFDMath.colebrookWhite(re, epsD);
      const dp_L_calc = f * rho * v * v / (2 * D);
      const Dnew = D * Math.sqrt(dp_L_calc / dpL);
      if (Math.abs(Dnew - D) < 1e-8) break;
      D = Dnew;
    }

    const A    = Math.PI * D * D / 4;
    const v    = Q / A;
    const re   = CFDMath.reynoldsNumber(v, D, nu);
    const epsD = eps / D;
    const f    = CFDMath.colebrookWhite(re, epsD);
    const dpL_actual = f * rho * v * v / (2 * D);

    // Nearest nominal pipe size (DN mm)
    const DNS = [15,20,25,32,40,50,65,80,100,125,150,200,250,300,350,400,450,500,600];
    const dnNom = DNS.find(dn => dn / 1000 >= D) ?? DNS[DNS.length - 1];

    const vCheck = v > vMax;

    _showResult("ps-result", `
      <table class="calc-result-table">
        ${_row("Required Diameter", _fmt(D * 1000, 2), "mm")}
        ${_row("Nearest DN", dnNom, "mm", `D = ${(dnNom).toFixed(0)} mm`)}
        ${_row("Velocity", _fmt(v, 4), "m/s", vCheck ? "⚠ Exceeds v_max" : "OK")}
        ${_row("Reynolds Number", Math.round(re), "—", _regimeBadge(re))}
        ${_row("Friction Factor", _fmt(f, 6))}
        ${_row("Actual Δp/L", _fmt(dpL_actual, 2), "Pa/m")}
        ${_row("Allowable Δp/L", _fmt(dpL, 2), "Pa/m")}
      </table>
    `);
  }

  return { compute };
})();

/* =========================================================================
   Calculator 8 — Compressible Flow
   ========================================================================= */

const CalcCompressible = (() => {

  function compute() {
    const v     = parseFloat(document.getElementById("comp-v")?.value);
    const T     = parseFloat(document.getElementById("comp-T")?.value) + 273.15;
    const gamma = parseFloat(document.getElementById("comp-gamma")?.value) ?? 1.4;
    const R     = parseFloat(document.getElementById("comp-R")?.value) ?? 287;
    const p0    = parseFloat(document.getElementById("comp-p0")?.value) ?? 101325;

    if ([v, T].some(x => isNaN(x) || x <= 0)) {
      _showResult("comp-result", "<p class='error'>Enter valid velocity and temperature.</p>");
      return;
    }

    const M    = CFDMath.machNumber(v, gamma, R, T);
    const pratio = CFDMath.isentropicPressureRatio(M, gamma);
    const p    = p0 * pratio;
    const pcrit = CFDMath.criticalPressureRatio(gamma);
    const Tcrit = T * 2 / (gamma + 1);
    const a    = Math.sqrt(gamma * R * T);     // speed of sound
    const T0   = T * (1 + (gamma - 1) / 2 * M * M);  // stagnation temp

    const flowType = M < 0.3 ? "Incompressible (M < 0.3)"
                   : M < 1   ? "Subsonic"
                   : M < 1.2 ? "Transonic"
                   :            "Supersonic";

    _showResult("comp-result", `
      <table class="calc-result-table">
        ${_row("Speed of Sound a", _fmt(a, 2), "m/s")}
        ${_row("Mach Number M", _fmt(M, 4))}
        ${_row("Flow Regime", `<strong>${flowType}</strong>`)}
        ${_row("Stagnation Pressure p₀", _fmt(p0 / 1000, 3), "kPa")}
        ${_row("Static Pressure p", _fmt(p / 1000, 3), "kPa")}
        ${_row("p/p₀", _fmt(pratio, 5))}
        ${_row("Stagnation Temperature T₀", _fmt(T0 - 273.15, 3), "°C")}
        ${_row("Critical p/p₀ (choked)", _fmt(pcrit, 5))}
        ${_row("Critical Throat Temp", _fmt(Tcrit - 273.15, 3), "°C")}
        ${_row("Choked?", p / p0 <= pcrit ? "⚠ Yes (choked flow)" : "No")}
      </table>
    `);
  }

  return { compute };
})();

/* =========================================================================
   Calculator 9 — Two-Phase Flow (Lockhart-Martinelli)
   ========================================================================= */

const CalcTwoPhase = (() => {

  function compute() {
    const D        = parseFloat(document.getElementById("tp-D")?.value);
    const Q_L      = parseFloat(document.getElementById("tp-QL")?.value);   // L m³/s
    const Q_G      = parseFloat(document.getElementById("tp-QG")?.value);   // G m³/s
    const rho_L    = parseFloat(document.getElementById("tp-rhoL")?.value) ?? 998;
    const rho_G    = parseFloat(document.getElementById("tp-rhoG")?.value) ?? 1.2;
    const mu_L     = parseFloat(document.getElementById("tp-muL")?.value)  ?? 1e-3;
    const mu_G     = parseFloat(document.getElementById("tp-muG")?.value)  ?? 1.8e-5;
    const eps      = parseFloat(document.getElementById("tp-eps")?.value)   ?? 4.6e-5;

    if ([D, Q_L, Q_G].some(v => isNaN(v) || v <= 0)) {
      _showResult("tp-result", "<p class='error'>Enter valid D, Q_L, Q_G.</p>");
      return;
    }

    const A    = Math.PI * D * D / 4;
    const v_L  = Q_L / A;
    const v_G  = Q_G / A;
    const nu_L = mu_L / rho_L;
    const nu_G = mu_G / rho_G;
    const epsD = eps / D;

    const re_L = CFDMath.reynoldsNumber(v_L, D, nu_L);
    const re_G = CFDMath.reynoldsNumber(v_G, D, nu_G);
    const f_L  = CFDMath.colebrookWhite(re_L, epsD);
    const f_G  = CFDMath.colebrookWhite(re_G, epsD);

    const g = 9.80665;
    const dpdz_L = f_L * rho_L * v_L * v_L / (2 * D);
    const dpdz_G = f_G * rho_G * v_G * v_G / (2 * D);

    const X   = CFDMath.lockhartMartinelli(dpdz_L, dpdz_G);
    const phi2 = CFDMath.twoPhaseMultiplier(X, 21);  // C=21 liquid-turbulent gas-turbulent

    const dpdz_TP = phi2 * dpdz_L;

    // Void fraction (homogeneous model)
    const beta = Q_G / (Q_L + Q_G);  // volumetric gas fraction
    const alpha_h = beta;  // homogeneous void fraction

    // Martinelli void fraction
    const alpha_M = 1 / (1 + 0.28 * X ** 0.71);

    const x_mass = (Q_G * rho_G) / (Q_L * rho_L + Q_G * rho_G);  // quality

    _showResult("tp-result", `
      <table class="calc-result-table">
        ${_row("Liquid Re", Math.round(re_L), "—", _regimeBadge(re_L))}
        ${_row("Gas Re", Math.round(re_G), "—", _regimeBadge(re_G))}
        ${_row("Liquid f", _fmt(f_L, 6))}
        ${_row("Gas f", _fmt(f_G, 6))}
        ${_row("Liquid Δp/L", _fmt(dpdz_L, 4), "Pa/m")}
        ${_row("Gas Δp/L", _fmt(dpdz_G, 4), "Pa/m")}
        ${_row("Martinelli Parameter X", _fmt(X, 4))}
        ${_row("Two-phase Multiplier Φ²", _fmt(phi2, 4))}
        ${_row("Two-phase Δp/L", _fmt(dpdz_TP, 4), "Pa/m")}
        ${_row("Void Fraction α (homogeneous)", _fmt(alpha_h, 4))}
        ${_row("Void Fraction α (Martinelli)", _fmt(alpha_M, 4))}
        ${_row("Mass Quality x", _fmt(x_mass, 5))}
        ${_row("Volumetric Gas Fraction β", _fmt(beta, 4))}
      </table>
    `);
  }

  return { compute };
})();

/* =========================================================================
   Calculator 10 — Dimensionless Numbers
   ========================================================================= */

const CalcDimensionless = (() => {

  function compute() {
    const fluid  = document.getElementById("dim-fluid")?.value ?? "water_20c";
    const fp     = FLUIDS[fluid] || FLUIDS.water_20c;
    const v      = parseFloat(document.getElementById("dim-v")?.value);
    const D      = parseFloat(document.getElementById("dim-D")?.value);
    const L_pipe = parseFloat(document.getElementById("dim-L")?.value) ?? 1;
    const Rc     = parseFloat(document.getElementById("dim-Rc")?.value);   // bend radius
    const omega  = parseFloat(document.getElementById("dim-omega")?.value) ?? 0;  // pulsation frequency
    const f_vs   = parseFloat(document.getElementById("dim-fvs")?.value)  ?? 0;   // vortex shedding freq

    if ([v, D].some(x => isNaN(x) || x <= 0)) {
      _showResult("dim-result", "<p class='error'>Enter valid v, D.</p>");
      return;
    }

    const nu  = fp.mu / fp.rho;
    const re  = CFDMath.reynoldsNumber(v, D, nu);
    const epsD = 4.6e-5 / D;
    const f   = CFDMath.colebrookWhite(re, epsD);
    const dp  = CFDMath.pressureDrop(f, L_pipe, D, v, fp.rho);
    const Eu  = CFDMath.eulerNumber(dp, fp.rho, v);
    const De  = isNaN(Rc) || Rc <= 0 ? NaN : CFDMath.deanNumber(re, D, Rc);
    const Wo  = omega > 0 ? CFDMath.womersleyNumber(D / 2, omega, nu) : NaN;
    const St  = f_vs > 0 ? CFDMath.strouhalNumber(f_vs, D, v) : NaN;
    const Pr  = fp.Pr;
    const Pe  = re * Pr;   // Peclet number

    _showResult("dim-result", `
      <table class="calc-result-table">
        ${_row("Fluid", fp.name)}
        ${_row("Reynolds Number Re", Math.round(re), "—", _regimeBadge(re))}
        ${_row("Prandtl Number Pr", _fmt(Pr, 3))}
        ${_row("Péclet Number Pe", _fmt(Pe, 1))}
        ${_row("Euler Number Eu", _fmt(Eu, 5))}
        ${isNaN(De)  ? "" : _row("Dean Number De",    _fmt(De, 2))}
        ${isNaN(Wo)  ? "" : _row("Womersley Number Wo", _fmt(Wo, 4))}
        ${isNaN(St)  ? "" : _row("Strouhal Number St",  _fmt(St, 4), "—", "Vortex shedding")}
      </table>
    `);
  }

  return { compute };
})();

/* =========================================================================
   Helper — show result HTML in a target element
   ========================================================================= */

function _showResult(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* =========================================================================
   CalculatorUI — wires all calc forms to their compute functions
   ========================================================================= */

const CalculatorUI = (() => {

  function init() {
    _bind("btn-dw-compute",    CalcDarcyWeisbach.compute);
    _bind("btn-re-compute",    CalcReynolds.compute);
    _bind("btn-wh-compute",    CalcWaterHammer.compute);
    _bind("btn-ht-compute",    CalcHeatTransfer.compute);
    _bind("btn-ml-compute",    CalcMinorLoss.compute);
    _bind("btn-pump-compute",  CalcPump.compute);
    _bind("btn-ps-compute",    CalcPipeSizing.compute);
    _bind("btn-comp-compute",  CalcCompressible.compute);
    _bind("btn-tp-compute",    CalcTwoPhase.compute);
    _bind("btn-dim-compute",   CalcDimensionless.compute);

    // Build dynamic minor-loss fitting list
    CalcMinorLoss.buildFittingsUI();

    // Fluid selector syncing across all calculators
    document.querySelectorAll(".fluid-select").forEach(sel => {
      sel.innerHTML = Object.entries(FLUIDS)
        .map(([k, v]) => `<option value="${k}">${v.name}</option>`)
        .join("");
    });

    // Roughness presets
    document.querySelectorAll(".roughness-preset").forEach(sel => {
      sel.innerHTML = Object.entries(ROUGHNESS)
        .map(([k, v]) => `<option value="${v}">${k.replace(/_/g," ")} (${v.toExponential(2)} m)</option>`)
        .join("");
      sel.addEventListener("change", e => {
        const target = sel.dataset.target;
        const el = document.getElementById(target);
        if (el) el.value = e.target.value;
      });
    });
  }

  function _bind(id, fn) {
    document.getElementById(id)?.addEventListener("click", fn);
  }

  return { init };
})();

/* =========================================================================
   Export
   ========================================================================= */

window.CFDMath        = CFDMath;
window.FLUIDS         = FLUIDS;
window.ROUGHNESS      = ROUGHNESS;
window.MINOR_LOSS_K   = MINOR_LOSS_K;
window.CalculatorUI   = CalculatorUI;
window.CalcDarcyWeisbach = CalcDarcyWeisbach;
window.CalcReynolds   = CalcReynolds;
window.CalcWaterHammer= CalcWaterHammer;
window.CalcHeatTransfer = CalcHeatTransfer;
window.CalcMinorLoss  = CalcMinorLoss;
window.CalcPump       = CalcPump;
window.CalcPipeSizing = CalcPipeSizing;
window.CalcCompressible = CalcCompressible;
window.CalcTwoPhase   = CalcTwoPhase;
window.CalcDimensionless = CalcDimensionless;
