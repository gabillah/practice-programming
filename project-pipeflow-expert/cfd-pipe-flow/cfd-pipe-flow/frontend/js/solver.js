/**
 * solver.js — CFD Solve Dispatch, Results Rendering & Visualisation
 * CFD Pipe-Flow Expert  ·  Frontend Module
 *
 * Responsibilities:
 *   • Build solve request payload from NetworkManager state
 *   • POST to /api/v1/solvers/solve/{id} or /api/v1/solvers/solve/inline
 *   • Parse SolverResult JSON and store in SolverState
 *   • Apply velocity / pressure / temperature colour mapping to canvas pipes
 *   • Render tabular results (pipe table, node table)
 *   • Export CSV / JSON result files
 *   • Animate transient (water-hammer) results frame-by-frame
 *   • Draw convergence plot on a mini canvas
 *   • Manage the colour-legend strip
 */

"use strict";

/* =========================================================================
   SolverState  — singleton that holds the latest solve result
   ========================================================================= */

const SolverState = (() => {
  let _result      = null;   // raw API SolverResult object
  let _networkId   = null;   // uuid of the solved network
  let _colourMode  = "velocity";   // "velocity" | "pressure" | "temperature" | "reynolds"
  let _listeners   = [];

  return {
    // ---- setters ---------------------------------------------------------
    setResult(result, networkId) {
      _result    = result;
      _networkId = networkId;
      _listeners.forEach(fn => fn(result));
    },
    setColourMode(mode) {
      _colourMode = mode;
      _listeners.forEach(fn => fn(_result));
    },
    clear() {
      _result    = null;
      _networkId = null;
    },

    // ---- getters ---------------------------------------------------------
    get result()     { return _result; },
    get networkId()  { return _networkId; },
    get colourMode() { return _colourMode; },
    get hasSolution(){ return _result !== null && _result.converged; },

    // ---- observer --------------------------------------------------------
    onChange(fn) { _listeners.push(fn); },

    // ---- helpers ---------------------------------------------------------
    pipeResult(pipeId) {
      if (!_result) return null;
      return (_result.pipe_results || []).find(p => p.pipe_id === pipeId) || null;
    },
    nodeResult(nodeId) {
      if (!_result) return null;
      return (_result.node_results || []).find(n => n.node_id === nodeId) || null;
    }
  };
})();

/* =========================================================================
   ColourMapper  — convert scalar → CSS rgb string
   ========================================================================= */

const ColourMapper = (() => {
  // Built-in colourmaps (same as backend)
  const COLORMAPS = {
    viridis: [
      [68, 1, 84], [72, 35, 116], [64, 67, 135], [52, 94, 141],
      [41, 120, 142], [32, 144, 140], [34, 167, 132], [68, 190, 112],
      [121, 209, 81], [189, 222, 38], [253, 231, 37]
    ],
    plasma: [
      [13, 8, 135], [75, 3, 161], [125, 3, 168], [168, 34, 150],
      [203, 70, 121], [229, 107, 93], [248, 148, 65], [253, 195, 40],
      [240, 249, 33]
    ],
    coolwarm: [
      [59, 76, 192], [98, 130, 234], [141, 176, 254], [184, 208, 249],
      [221, 220, 219], [245, 196, 173], [244, 154, 123], [222, 96, 77],
      [180, 4, 38]
    ],
    jet: [
      [0, 0, 143], [0, 0, 255], [0, 127, 255], [0, 255, 255],
      [127, 255, 127], [255, 255, 0], [255, 127, 0], [255, 0, 0],
      [127, 0, 0]
    ],
    hot: [
      [10, 0, 0], [80, 0, 0], [160, 0, 0], [255, 0, 0],
      [255, 80, 0], [255, 160, 0], [255, 255, 0], [255, 255, 160],
      [255, 255, 255]
    ]
  };

  let _currentMap = "viridis";

  function _lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function _sampleColormap(t, name) {
    const cm = COLORMAPS[name] || COLORMAPS.viridis;
    t = Math.max(0, Math.min(1, t));
    const idx = t * (cm.length - 1);
    const lo  = Math.floor(idx);
    const hi  = Math.min(lo + 1, cm.length - 1);
    const frac = idx - lo;
    const r = _lerp(cm[lo][0], cm[hi][0], frac);
    const g = _lerp(cm[lo][1], cm[hi][1], frac);
    const b = _lerp(cm[lo][2], cm[hi][2], frac);
    return `rgb(${r},${g},${b})`;
  }

  return {
    setColormap(name) { _currentMap = name; },
    get colormapName() { return _currentMap; },

    /** Map a normalised value [0,1] to a CSS colour string */
    mapNorm(t)       { return _sampleColormap(t, _currentMap); },

    /** Map a raw value given domain [min, max] */
    mapValue(v, min, max) {
      const t = max > min ? (v - min) / (max - min) : 0.5;
      return _sampleColormap(t, _currentMap);
    },

    /** Return array of {t, colour} stops for legend */
    legendStops(n = 10) {
      const stops = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        stops.push({ t, colour: this.mapNorm(t) });
      }
      return stops;
    },

    /** Draw a horizontal colour bar onto a canvas element */
    drawLegendBar(canvas, minVal, maxVal, label, unit, n = 256) {
      const ctx = canvas.getContext("2d");
      const w   = canvas.width;
      const h   = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barH   = Math.floor(h * 0.45);
      const barY   = 4;
      const segW   = w / n;

      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        ctx.fillStyle = this.mapNorm(t);
        ctx.fillRect(Math.floor(i * segW), barY, Math.ceil(segW) + 1, barH);
      }

      // border
      ctx.strokeStyle = "#555";
      ctx.lineWidth   = 1;
      ctx.strokeRect(0, barY, w, barH);

      // tick labels
      ctx.fillStyle  = "#222";
      ctx.font       = "11px Inter, sans-serif";
      ctx.textAlign  = "left";
      const ticks = [0, 0.25, 0.5, 0.75, 1];
      ticks.forEach(t => {
        const val   = minVal + t * (maxVal - minVal);
        const x     = Math.round(t * (w - 1));
        const label = _formatSI(val);
        ctx.textAlign = t < 0.1 ? "left" : t > 0.9 ? "right" : "center";
        ctx.fillText(label, x, barY + barH + 13);
      });

      // axis label + unit
      ctx.textAlign = "center";
      ctx.font      = "12px Inter, sans-serif";
      ctx.fillText(`${label} (${unit})`, w / 2, h - 2);
    }
  };
})();

/* =========================================================================
   Helpers
   ========================================================================= */

function _formatSI(v, digits = 3) {
  if (v === null || v === undefined || isNaN(v)) return "—";
  const abs = Math.abs(v);
  if (abs === 0) return "0";
  if (abs >= 1e6)  return (v / 1e6).toFixed(digits - 1) + "M";
  if (abs >= 1e3)  return (v / 1e3).toFixed(digits - 1) + "k";
  if (abs >= 1)    return v.toFixed(digits);
  if (abs >= 1e-3) return (v * 1e3).toFixed(digits - 1) + "m";
  if (abs >= 1e-6) return (v * 1e6).toFixed(digits - 1) + "μ";
  return v.toExponential(digits - 1);
}

function _formatFixed(v, decimals = 4) {
  if (v === null || v === undefined || isNaN(v)) return "—";
  return Number(v).toFixed(decimals);
}

function _flowRegime(re) {
  if (re < 2300)  return { label: "Laminar",      colour: "#27ae60" };
  if (re < 4000)  return { label: "Transitional",  colour: "#f39c12" };
  return              { label: "Turbulent",     colour: "#c0392b" };
}

function _buildBadge(text, colour) {
  return `<span class="badge" style="background:${colour};color:#fff;padding:2px 7px;border-radius:10px;font-size:11px;">${text}</span>`;
}

/* =========================================================================
   SolverController  — main solve orchestration
   ========================================================================= */

const SolverController = (() => {

  let _solving       = false;
  let _abortCtrl     = null;
  let _logLines      = [];
  const MAX_LOG      = 500;

  // ---- private helpers ---------------------------------------------------

  function _log(msg, level = "info") {
    const ts    = new Date().toISOString().slice(11, 23);
    const entry = { ts, msg, level };
    _logLines.push(entry);
    if (_logLines.length > MAX_LOG) _logLines.shift();
    _appendLogLine(entry);
  }

  function _appendLogLine({ ts, msg, level }) {
    const el = document.getElementById("solver-log");
    if (!el) return;
    const div = document.createElement("div");
    div.className = `log-line log-${level}`;
    div.textContent = `[${ts}] ${msg}`;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
  }

  function _clearLog() {
    _logLines = [];
    const el = document.getElementById("solver-log");
    if (el) el.innerHTML = "";
  }

  function _setSolveBtn(state) {
    const btn = document.getElementById("btn-solve");
    if (!btn) return;
    btn.disabled = (state === "solving");
    btn.textContent = state === "solving" ? "⏳ Solving…" : "▶ Solve";
  }

  function _showProgress(pct) {
    const bar = document.getElementById("solve-progress-bar");
    if (bar) {
      bar.style.width = `${pct}%`;
      bar.style.display = pct >= 100 ? "none" : "block";
    }
  }

  // ---- build payload from NetworkManager --------------------------------

  function _buildInlinePayload() {
    const nm     = window.NetworkManager;
    const net    = nm.getNetwork();
    const solver = nm.getSolverSettings();

    const nodes = net.nodes.map(n => ({
      node_id:        n.id,
      label:          n.label,
      node_type:      n.type,
      x:              n.x,
      y:              n.y,
      elevation:      n.elevation ?? 0,
      pressure_known: n.pressureKnown ?? false,
      pressure_value: n.pressureValue ?? null,
      demand:         n.demand ?? 0.0
    }));

    const pipes = net.pipes.map(p => ({
      pipe_id:         p.id,
      label:           p.label,
      start_node_id:   p.from,
      end_node_id:     p.to,
      length:          p.length,
      diameter:        p.diameter,
      roughness:       p.roughness ?? 0.000046,
      material:        p.material ?? "steel_commercial",
      has_valve:       p.hasValve ?? false,
      valve_cv:        p.valveCv ?? null,
      valve_open_pct:  p.valveOpenPct ?? 100,
      has_pump:        p.hasPump ?? false,
      pump_head:       p.pumpHead ?? null,
      pump_efficiency: p.pumpEfficiency ?? 0.75,
      minor_loss_k:    p.minorLossK ?? 0.0,
      initial_flow:    p.initialFlow ?? null
    }));

    return {
      network: { nodes, pipes },
      fluid:   solver.fluid ?? "water_20c",
      solver_type:     solver.type ?? "newton_raphson",
      max_iterations:  solver.maxIterations ?? 200,
      tolerance:       solver.tolerance ?? 1e-6,
      relaxation:      solver.relaxation ?? 1.0,
      include_minor_losses: solver.includeMinorLosses ?? true,
      temperature:     solver.temperature ?? 20.0,
      ambient_temp:    solver.ambientTemp ?? 20.0
    };
  }

  // ---- main solve --------------------------------------------------------

  async function solve(networkId = null) {
    if (_solving) return;
    _solving = true;
    _clearLog();
    _setSolveBtn("solving");
    _showProgress(5);
    SolverState.clear();

    _log("Preparing solve request…");

    try {
      let result;

      if (networkId) {
        // Saved network — use the server-side endpoint
        _log(`Solving saved network: ${networkId}`);
        _showProgress(20);
        const resp = await window.ApiClient.solveSaved(networkId, {
          solver_type:    window.NetworkManager.getSolverSettings().type ?? "newton_raphson",
          max_iterations: window.NetworkManager.getSolverSettings().maxIterations ?? 200,
          tolerance:      window.NetworkManager.getSolverSettings().tolerance ?? 1e-6
        });
        result = resp;
      } else {
        // Inline solve (draft / unsaved)
        _log("Building inline payload…");
        const payload = _buildInlinePayload();
        _log(`Nodes: ${payload.network.nodes.length}  Pipes: ${payload.network.pipes.length}`);
        _showProgress(20);
        result = await window.ApiClient.solveInline(payload);
      }

      _showProgress(80);
      _log(`Solver returned.  Converged: ${result.converged}`);
      _log(`Iterations: ${result.iterations}   Residual: ${result.final_residual?.toExponential(3) ?? "n/a"}`);

      if (!result.converged) {
        _log("⚠ Solver did NOT converge.  Results may be inaccurate.", "warn");
        window.UI?.toast("Solver did not converge — check network topology", "warning");
      } else {
        _log("✔ Converged successfully.", "success");
        window.UI?.toast("Solve complete", "success");
      }

      if (result.warnings?.length) {
        result.warnings.forEach(w => _log(`⚠ ${w}`, "warn"));
      }

      SolverState.setResult(result, networkId);
      _showProgress(100);

      // Render everything
      ResultsRenderer.renderAll(result);
      CanvasColourer.applyToCanvas(result);
      ConvergencePlot.draw(result.convergence_history ?? []);
      LegendRenderer.update();

    } catch (err) {
      _log(`✖ Error: ${err.message}`, "error");
      window.UI?.toast(`Solve failed: ${err.message}`, "error");
      console.error(err);
    } finally {
      _solving = false;
      _setSolveBtn("idle");
    }
  }

  return { solve, log: _log, clearLog: _clearLog };
})();

/* =========================================================================
   CanvasColourer  — apply result colours to pipes on the canvas
   ========================================================================= */

const CanvasColourer = (() => {

  function _getDomain(result, mode) {
    const pipes = result.pipe_results || [];
    if (!pipes.length) return { min: 0, max: 1, unit: "", label: mode };

    let vals, label, unit;
    switch (mode) {
      case "velocity":
        vals  = pipes.map(p => Math.abs(p.velocity ?? 0));
        label = "Velocity"; unit = "m/s"; break;
      case "pressure":
        vals  = pipes.map(p => p.pressure_drop_pa ?? 0);
        label = "Pressure Drop"; unit = "Pa"; break;
      case "temperature":
        vals  = pipes.map(p => p.outlet_temperature ?? 20);
        label = "Temperature"; unit = "°C"; break;
      case "reynolds":
        vals  = pipes.map(p => p.reynolds_number ?? 0);
        label = "Reynolds No."; unit = "—"; break;
      case "head_loss":
        vals  = pipes.map(p => p.head_loss_m ?? 0);
        label = "Head Loss"; unit = "m"; break;
      case "flow":
        vals  = pipes.map(p => Math.abs(p.flow_rate_m3s ?? 0));
        label = "Flow Rate"; unit = "m³/s"; break;
      default:
        vals  = pipes.map(p => Math.abs(p.velocity ?? 0));
        label = "Velocity"; unit = "m/s";
    }

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return { min, max, label, unit };
  }

  function _getVal(pipeResult, mode) {
    if (!pipeResult) return 0;
    switch (mode) {
      case "velocity":    return Math.abs(pipeResult.velocity ?? 0);
      case "pressure":    return pipeResult.pressure_drop_pa ?? 0;
      case "temperature": return pipeResult.outlet_temperature ?? 20;
      case "reynolds":    return pipeResult.reynolds_number ?? 0;
      case "head_loss":   return pipeResult.head_loss_m ?? 0;
      case "flow":        return Math.abs(pipeResult.flow_rate_m3s ?? 0);
      default:            return Math.abs(pipeResult.velocity ?? 0);
    }
  }

  function applyToCanvas(result) {
    const canvas = window.CanvasRenderer;
    if (!canvas) return;

    const mode   = SolverState.colourMode;
    const domain = _getDomain(result, mode);

    // Store domain globally so legend can use it
    CanvasColourer._domain = domain;

    const colourMap = {};
    (result.pipe_results || []).forEach(pr => {
      const val = _getVal(pr, mode);
      colourMap[pr.pipe_id] = ColourMapper.mapValue(val, domain.min, domain.max);
    });

    canvas.setPipeColours(colourMap);
    canvas.redraw();
  }

  return { applyToCanvas, getDomain: (r, m) => _getDomain(r, m), _domain: null };
})();

/* =========================================================================
   ResultsRenderer  — fill in the results panel tables
   ========================================================================= */

const ResultsRenderer = (() => {

  function renderAll(result) {
    _renderSummary(result);
    _renderPipeTable(result);
    _renderNodeTable(result);
    _renderStatisticsPanel(result);
    _showResultsPanel();
  }

  function _showResultsPanel() {
    document.querySelectorAll(".results-panel").forEach(el => el.classList.remove("hidden"));
    const tab = document.querySelector('[data-view="results"]');
    if (tab) tab.click();
  }

  // ---- Summary card ------------------------------------------------------

  function _renderSummary(result) {
    const el = document.getElementById("results-summary");
    if (!el) return;

    const stats = result.statistics || {};
    const rows = [
      ["Converged",          result.converged ? "✔ Yes" : "✖ No"],
      ["Iterations",         result.iterations ?? "—"],
      ["Final Residual",     result.final_residual != null ? result.final_residual.toExponential(3) : "—"],
      ["Solve Time (ms)",    result.solve_time_ms != null ? result.solve_time_ms.toFixed(1) : "—"],
      ["Solver Type",        result.solver_type ?? "—"],
      ["Total Flow (m³/s)",  stats.total_flow_m3s != null ? stats.total_flow_m3s.toFixed(6) : "—"],
      ["Max Velocity (m/s)", stats.max_velocity_ms != null ? stats.max_velocity_ms.toFixed(3) : "—"],
      ["Max Head Loss (m)",  stats.max_head_loss_m != null ? stats.max_head_loss_m.toFixed(3) : "—"],
      ["System Efficiency",  stats.system_efficiency != null ? (stats.system_efficiency * 100).toFixed(1) + "%" : "—"],
      ["Power Input (W)",    stats.total_pump_power_w != null ? stats.total_pump_power_w.toFixed(1) : "—"],
    ];

    el.innerHTML = `
      <table class="summary-table">
        <tbody>
          ${rows.map(([k, v]) => `<tr><td class="key">${k}</td><td class="val">${v}</td></tr>`).join("")}
        </tbody>
      </table>`;
  }

  // ---- Pipe table --------------------------------------------------------

  function _renderPipeTable(result) {
    const tbody = document.querySelector("#pipe-results-table tbody");
    if (!tbody) return;

    const pipes = result.pipe_results || [];
    if (!pipes.length) { tbody.innerHTML = `<tr><td colspan="10">No pipe results</td></tr>`; return; }

    tbody.innerHTML = pipes.map(p => {
      const regime = _flowRegime(p.reynolds_number ?? 0);
      const ff     = p.friction_factor != null ? p.friction_factor.toFixed(5) : "—";
      const q      = p.flow_rate_m3s  != null ? (p.flow_rate_m3s * 1000).toFixed(4) : "—";  // L/s
      const v      = p.velocity       != null ? p.velocity.toFixed(3)       : "—";
      const hl     = p.head_loss_m    != null ? p.head_loss_m.toFixed(4)    : "—";
      const dp     = p.pressure_drop_pa != null ? p.pressure_drop_pa.toFixed(2) : "—";
      const re     = p.reynolds_number != null ? Math.round(p.reynolds_number) : "—";
      const temp   = p.outlet_temperature != null ? p.outlet_temperature.toFixed(2) : "—";

      return `<tr data-pipe-id="${p.pipe_id}" class="pipe-row">
        <td>${p.pipe_id}</td>
        <td>${q}</td>
        <td>${v}</td>
        <td>${hl}</td>
        <td>${dp}</td>
        <td>${re}</td>
        <td>${_buildBadge(regime.label, regime.colour)}</td>
        <td>${ff}</td>
        <td>${temp}</td>
        <td><button class="btn-sm btn-outline" onclick="SolverUI.inspectPipe('${p.pipe_id}')">🔍</button></td>
      </tr>`;
    }).join("");

    // Row click → select on canvas
    tbody.querySelectorAll(".pipe-row").forEach(row => {
      row.addEventListener("click", () => {
        const pid = row.dataset.pipeId;
        window.CanvasRenderer?.selectPipe(pid);
      });
    });
  }

  // ---- Node table --------------------------------------------------------

  function _renderNodeTable(result) {
    const tbody = document.querySelector("#node-results-table tbody");
    if (!tbody) return;

    const nodes = result.node_results || [];
    if (!nodes.length) { tbody.innerHTML = `<tr><td colspan="7">No node results</td></tr>`; return; }

    tbody.innerHTML = nodes.map(n => {
      const p   = n.pressure_pa   != null ? (n.pressure_pa / 1000).toFixed(3)  : "—";
      const h   = n.head_m        != null ? n.head_m.toFixed(4)                : "—";
      const elev= n.elevation     != null ? n.elevation.toFixed(2)             : "—";
      const dem = n.demand_m3s    != null ? (n.demand_m3s * 1000).toFixed(4)   : "—";
      const hgl = n.hgl_m         != null ? n.hgl_m.toFixed(4)                 : "—";

      return `<tr data-node-id="${n.node_id}" class="node-row">
        <td>${n.node_id}</td>
        <td>${n.node_type ?? "junction"}</td>
        <td>${p}</td>
        <td>${h}</td>
        <td>${elev}</td>
        <td>${dem}</td>
        <td>${hgl}</td>
      </tr>`;
    }).join("");
  }

  // ---- Statistics panel --------------------------------------------------

  function _renderStatisticsPanel(result) {
    const el = document.getElementById("advanced-stats-panel");
    if (!el) return;

    const s = result.statistics || {};
    const pipes = result.pipe_results || [];

    // Velocity histogram bins
    const velocities = pipes.map(p => Math.abs(p.velocity ?? 0));
    const histHTML   = _renderHistogram("Velocity Distribution (m/s)", velocities, 10);

    // Friction factor stats
    const ffs = pipes.map(p => p.friction_factor).filter(f => f != null);
    const ffStats = _descStats(ffs);

    // Reynolds stats
    const res   = pipes.map(p => p.reynolds_number).filter(r => r != null);
    const reStats = _descStats(res);

    el.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card">
          <h4>Velocity Statistics (m/s)</h4>
          <table class="mini-table">
            <tr><td>Min</td><td>${_formatFixed(s.min_velocity_ms)}</td></tr>
            <tr><td>Max</td><td>${_formatFixed(s.max_velocity_ms)}</td></tr>
            <tr><td>Mean</td><td>${_formatFixed(s.mean_velocity_ms)}</td></tr>
            <tr><td>Std Dev</td><td>${_formatFixed(_descStats(velocities).std)}</td></tr>
            <tr><td>Uniformity Idx</td><td>${_formatFixed(s.velocity_uniformity_index)}</td></tr>
          </table>
        </div>
        <div class="stat-card">
          <h4>Reynolds Number Statistics</h4>
          <table class="mini-table">
            <tr><td>Min</td><td>${Math.round(reStats.min)}</td></tr>
            <tr><td>Max</td><td>${Math.round(reStats.max)}</td></tr>
            <tr><td>Mean</td><td>${Math.round(reStats.mean)}</td></tr>
            <tr><td>Std Dev</td><td>${Math.round(reStats.std)}</td></tr>
            <tr><td>Laminar count</td><td>${res.filter(r=>r<2300).length}</td></tr>
            <tr><td>Turbulent count</td><td>${res.filter(r=>r>=4000).length}</td></tr>
          </table>
        </div>
        <div class="stat-card">
          <h4>Friction Factor Statistics</h4>
          <table class="mini-table">
            <tr><td>Min</td><td>${ffStats.min.toFixed(5)}</td></tr>
            <tr><td>Max</td><td>${ffStats.max.toFixed(5)}</td></tr>
            <tr><td>Mean</td><td>${ffStats.mean.toFixed(5)}</td></tr>
            <tr><td>Std Dev</td><td>${ffStats.std.toFixed(5)}</td></tr>
          </table>
        </div>
        <div class="stat-card">
          <h4>Energy Budget</h4>
          <table class="mini-table">
            <tr><td>Pump Power (W)</td><td>${_formatFixed(s.total_pump_power_w)}</td></tr>
            <tr><td>Friction Loss (W)</td><td>${_formatFixed(s.total_friction_loss_w)}</td></tr>
            <tr><td>System Efficiency</td><td>${s.system_efficiency!=null?(s.system_efficiency*100).toFixed(1)+"%":"—"}</td></tr>
          </table>
        </div>
      </div>
      <div class="histogram-section">${histHTML}</div>
    `;
  }

  function _descStats(arr) {
    if (!arr.length) return { min: 0, max: 0, mean: 0, std: 0 };
    const n    = arr.length;
    const min  = Math.min(...arr);
    const max  = Math.max(...arr);
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
    const std  = Math.sqrt(variance);
    return { min, max, mean, std };
  }

  function _renderHistogram(title, data, bins) {
    if (!data.length) return "";
    const min  = Math.min(...data);
    const max  = Math.max(...data);
    const step = (max - min) / bins || 1;
    const counts = new Array(bins).fill(0);
    data.forEach(v => {
      const b = Math.min(bins - 1, Math.floor((v - min) / step));
      counts[b]++;
    });
    const maxCount = Math.max(...counts);
    const barH = 60;

    const bars = counts.map((c, i) => {
      const h = maxCount > 0 ? Math.round((c / maxCount) * barH) : 0;
      const x = i * 22;
      return `<rect x="${x}" y="${barH - h}" width="18" height="${h}" fill="var(--primary)" opacity="0.8"/>
              <title>${(min + i * step).toFixed(2)}–${(min + (i+1)*step).toFixed(2)}: ${c}</title>`;
    }).join("");

    return `<div class="histogram">
      <p class="hist-title">${title}</p>
      <svg width="${bins * 22 + 10}" height="${barH + 20}" style="overflow:visible">
        ${bars}
        <text x="0" y="${barH + 14}" font-size="10" fill="#666">${min.toFixed(2)}</text>
        <text x="${bins * 22}" y="${barH + 14}" font-size="10" fill="#666" text-anchor="end">${max.toFixed(2)}</text>
      </svg>
    </div>`;
  }

  return { renderAll };
})();

/* =========================================================================
   ConvergencePlot  — draw residual history on a canvas
   ========================================================================= */

const ConvergencePlot = (() => {

  function draw(history) {
    const canvas = document.getElementById("convergence-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W   = canvas.width;
    const H   = canvas.height;

    ctx.clearRect(0, 0, W, H);

    if (!history || history.length < 2) {
      ctx.fillStyle = "#999";
      ctx.font      = "13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No convergence history", W / 2, H / 2);
      return;
    }

    const pad = { top: 15, right: 15, bottom: 35, left: 55 };
    const pw  = W - pad.left - pad.right;
    const ph  = H - pad.top  - pad.bottom;

    // Log10 transform
    const logVals = history.map(v => Math.log10(Math.max(v, 1e-20)));
    const minLog  = Math.min(...logVals);
    const maxLog  = Math.max(...logVals);
    const rangeLog = maxLog - minLog || 1;

    // Grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth   = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + ph - (i / 5) * ph;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + pw, y);
      ctx.stroke();
      const label = (minLog + (i / 5) * rangeLog).toFixed(1);
      ctx.fillStyle  = "#666";
      ctx.font       = "10px Inter, sans-serif";
      ctx.textAlign  = "right";
      ctx.fillText(`1e${label}`, pad.left - 5, y + 3);
    }

    // Axes
    ctx.strokeStyle = "#333";
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + ph);
    ctx.lineTo(pad.left + pw, pad.top + ph);
    ctx.stroke();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth   = 2;
    history.forEach((v, i) => {
      const lv = Math.log10(Math.max(v, 1e-20));
      const x  = pad.left + (i / (history.length - 1)) * pw;
      const y  = pad.top  + ph - ((lv - minLog) / rangeLog) * ph;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Labels
    ctx.fillStyle  = "#333";
    ctx.font       = "11px Inter, sans-serif";
    ctx.textAlign  = "center";
    ctx.fillText("Iteration", pad.left + pw / 2, H - 5);

    ctx.save();
    ctx.translate(12, pad.top + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Residual (log₁₀)", 0, 0);
    ctx.restore();

    // Min line
    const minY = pad.top + ph - ((Math.min(...logVals) - minLog) / rangeLog) * ph;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, minY);
    ctx.lineTo(pad.left + pw, minY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  return { draw };
})();

/* =========================================================================
   LegendRenderer  — update the colour legend bar
   ========================================================================= */

const LegendRenderer = (() => {

  function update() {
    const result = SolverState.result;
    if (!result) return;

    const mode   = SolverState.colourMode;
    const domain = CanvasColourer.getDomain(result, mode);

    const canvas = document.getElementById("legend-canvas");
    if (canvas) {
      ColourMapper.drawLegendBar(canvas, domain.min, domain.max, domain.label, domain.unit);
    }

    const title = document.getElementById("legend-title");
    if (title) title.textContent = `${domain.label} (${domain.unit})`;
  }

  return { update };
})();

/* =========================================================================
   SolverUI  — wires DOM controls to solver / renderer functions
   ========================================================================= */

const SolverUI = (() => {

  function init() {
    // Solve button
    document.getElementById("btn-solve")?.addEventListener("click", () => {
      const networkId = window.AppState?.currentNetworkId ?? null;
      SolverController.solve(networkId);
    });

    // Colour mode selector
    const sel = document.getElementById("colour-mode-select");
    if (sel) {
      sel.addEventListener("change", e => {
        SolverState.setColourMode(e.target.value);
        if (SolverState.hasSolution) {
          CanvasColourer.applyToCanvas(SolverState.result);
          LegendRenderer.update();
        }
      });
    }

    // Colormap selector
    const cmSel = document.getElementById("colormap-select");
    if (cmSel) {
      cmSel.addEventListener("change", e => {
        ColourMapper.setColormap(e.target.value);
        if (SolverState.hasSolution) {
          CanvasColourer.applyToCanvas(SolverState.result);
          LegendRenderer.update();
        }
      });
    }

    // Export buttons
    document.getElementById("btn-export-csv")?.addEventListener("click", ExportManager.exportCSV);
    document.getElementById("btn-export-json")?.addEventListener("click", ExportManager.exportJSON);

    // SolverState change → refresh tables
    SolverState.onChange(result => {
      if (result) {
        ResultsRenderer.renderAll(result);
        LegendRenderer.update();
      }
    });
  }

  function inspectPipe(pipeId) {
    const pr = SolverState.pipeResult(pipeId);
    if (!pr) return;
    const nm = window.NetworkManager;
    const pipe = nm.getPipe(pipeId);

    const regime = _flowRegime(pr.reynolds_number ?? 0);
    const html = `
      <h3>Pipe: ${pipeId}</h3>
      <table class="inspect-table">
        <tr><td>Label</td><td>${pipe?.label ?? pipeId}</td></tr>
        <tr><td>Diameter (m)</td><td>${pipe?.diameter?.toFixed(4)}</td></tr>
        <tr><td>Length (m)</td><td>${pipe?.length?.toFixed(2)}</td></tr>
        <tr><td>Material</td><td>${pipe?.material ?? "—"}</td></tr>
        <tr><td>Roughness (m)</td><td>${pipe?.roughness?.toExponential(3) ?? "—"}</td></tr>
        <tr><td colspan="2"><hr/></td></tr>
        <tr><td>Flow Rate (L/s)</td><td>${(pr.flow_rate_m3s * 1000).toFixed(4)}</td></tr>
        <tr><td>Velocity (m/s)</td><td>${pr.velocity?.toFixed(4)}</td></tr>
        <tr><td>Reynolds Number</td><td>${Math.round(pr.reynolds_number)}</td></tr>
        <tr><td>Flow Regime</td><td>${_buildBadge(regime.label, regime.colour)}</td></tr>
        <tr><td>Friction Factor (f)</td><td>${pr.friction_factor?.toFixed(6)}</td></tr>
        <tr><td>Head Loss (m)</td><td>${pr.head_loss_m?.toFixed(4)}</td></tr>
        <tr><td>Pressure Drop (Pa)</td><td>${pr.pressure_drop_pa?.toFixed(2)}</td></tr>
        <tr><td>Pressure Drop (kPa)</td><td>${(pr.pressure_drop_pa/1000)?.toFixed(3)}</td></tr>
        <tr><td>Outlet Temperature (°C)</td><td>${pr.outlet_temperature?.toFixed(2) ?? "—"}</td></tr>
        <tr><td>Nusselt Number</td><td>${pr.nusselt_number?.toFixed(2) ?? "—"}</td></tr>
        <tr><td>Heat Transfer Coef. (W/m²K)</td><td>${pr.heat_transfer_coeff?.toFixed(2) ?? "—"}</td></tr>
        <tr><td>Cavitation Number</td><td>${pr.cavitation_number?.toFixed(4) ?? "—"}</td></tr>
        <tr><td>Shear Velocity (m/s)</td><td>${pr.shear_velocity?.toFixed(4) ?? "—"}</td></tr>
      </table>
    `;
    window.UI?.modal("Pipe Inspection", html);
  }

  function inspectNode(nodeId) {
    const nr = SolverState.nodeResult(nodeId);
    if (!nr) return;

    const html = `
      <h3>Node: ${nodeId}</h3>
      <table class="inspect-table">
        <tr><td>Type</td><td>${nr.node_type}</td></tr>
        <tr><td>Elevation (m)</td><td>${nr.elevation?.toFixed(2)}</td></tr>
        <tr><td>Pressure (kPa)</td><td>${(nr.pressure_pa/1000)?.toFixed(3)}</td></tr>
        <tr><td>Head (m)</td><td>${nr.head_m?.toFixed(4)}</td></tr>
        <tr><td>HGL (m)</td><td>${nr.hgl_m?.toFixed(4)}</td></tr>
        <tr><td>Demand (L/s)</td><td>${(nr.demand_m3s*1000)?.toFixed(4) ?? "—"}</td></tr>
        <tr><td>Inflow (L/s)</td><td>${nr.inflow_m3s!=null?(nr.inflow_m3s*1000).toFixed(4):"—"}</td></tr>
        <tr><td>Outflow (L/s)</td><td>${nr.outflow_m3s!=null?(nr.outflow_m3s*1000).toFixed(4):"—"}</td></tr>
        <tr><td>Balance Error (L/s)</td><td>${nr.balance_error_m3s!=null?(nr.balance_error_m3s*1000).toExponential(3):"—"}</td></tr>
      </table>
    `;
    window.UI?.modal("Node Inspection", html);
  }

  return { init, inspectPipe, inspectNode };
})();

/* =========================================================================
   ExportManager  — CSV and JSON downloads
   ========================================================================= */

const ExportManager = (() => {

  function _download(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const result = SolverState.result;
    if (!result) { window.UI?.toast("No results to export", "warning"); return; }

    const pipes = result.pipe_results || [];
    const header = [
      "pipe_id","flow_rate_ls","velocity_ms","head_loss_m",
      "pressure_drop_pa","reynolds_number","friction_factor",
      "outlet_temperature_c","nusselt_number","heat_transfer_coeff_wm2k",
      "cavitation_number","flow_regime"
    ].join(",");

    const rows = pipes.map(p => {
      const regime = _flowRegime(p.reynolds_number ?? 0).label;
      return [
        p.pipe_id,
        (p.flow_rate_m3s * 1000).toFixed(6),
        p.velocity?.toFixed(6),
        p.head_loss_m?.toFixed(6),
        p.pressure_drop_pa?.toFixed(4),
        Math.round(p.reynolds_number),
        p.friction_factor?.toFixed(8),
        p.outlet_temperature?.toFixed(4),
        p.nusselt_number?.toFixed(4),
        p.heat_transfer_coeff?.toFixed(4),
        p.cavitation_number?.toFixed(6),
        regime
      ].join(",");
    });

    const nodeHeader = "\n\nnode_id,type,pressure_kpa,head_m,hgl_m,demand_ls";
    const nodeRows = (result.node_results || []).map(n =>
      [n.node_id, n.node_type,
       (n.pressure_pa/1000).toFixed(4),
       n.head_m?.toFixed(4),
       n.hgl_m?.toFixed(4),
       (n.demand_m3s*1000).toFixed(6)
      ].join(",")
    );

    const csv = [header, ...rows, nodeHeader, nodeHeader, ...nodeRows].join("\n");
    _download(csv, `cfd_results_${Date.now()}.csv`, "text/csv");
    window.UI?.toast("CSV exported", "success");
  }

  function exportJSON() {
    const result = SolverState.result;
    if (!result) { window.UI?.toast("No results to export", "warning"); return; }
    _download(JSON.stringify(result, null, 2), `cfd_results_${Date.now()}.json`, "application/json");
    window.UI?.toast("JSON exported", "success");
  }

  return { exportCSV, exportJSON };
})();

/* =========================================================================
   TransientAnimator  — water-hammer / transient MOC frame animation
   ========================================================================= */

const TransientAnimator = (() => {
  let _frames      = [];
  let _current     = 0;
  let _timer       = null;
  let _fps         = 10;
  let _playing     = false;

  function load(transientResult) {
    _frames  = transientResult.time_steps || [];
    _current = 0;
    _renderFrame(0);
    _updateSlider();
  }

  function play() {
    if (_playing || !_frames.length) return;
    _playing = true;
    _timer   = setInterval(() => {
      _current = (_current + 1) % _frames.length;
      _renderFrame(_current);
      _updateSlider();
    }, 1000 / _fps);
    document.getElementById("btn-transient-play")?.setAttribute("disabled", "true");
    document.getElementById("btn-transient-pause")?.removeAttribute("disabled");
  }

  function pause() {
    _playing = false;
    clearInterval(_timer);
    document.getElementById("btn-transient-play")?.removeAttribute("disabled");
    document.getElementById("btn-transient-pause")?.setAttribute("disabled", "true");
  }

  function seek(idx) {
    _current = Math.max(0, Math.min(_frames.length - 1, idx));
    _renderFrame(_current);
  }

  function setFps(fps) {
    _fps = fps;
    if (_playing) { pause(); play(); }
  }

  function _renderFrame(idx) {
    const frame = _frames[idx];
    if (!frame) return;

    // Apply pressure field as colours
    const colourMap = {};
    Object.entries(frame.pressures || {}).forEach(([pid, p]) => {
      const domain = { min: 0, max: 1e6 };
      colourMap[pid] = ColourMapper.mapValue(p, domain.min, domain.max);
    });
    window.CanvasRenderer?.setPipeColours(colourMap);
    window.CanvasRenderer?.redraw();

    const timeEl = document.getElementById("transient-time");
    if (timeEl) timeEl.textContent = `t = ${(frame.time_s ?? idx / _fps).toFixed(3)} s`;
  }

  function _updateSlider() {
    const sl = document.getElementById("transient-slider");
    if (sl) {
      sl.max   = Math.max(0, _frames.length - 1);
      sl.value = _current;
    }
  }

  return { load, play, pause, seek, setFps };
})();

/* =========================================================================
   HydraulicGradientLine  — draw HGL/EGL overlay on the canvas
   ========================================================================= */

const HydraulicGradientLine = (() => {

  let _visible = false;

  function toggle() {
    _visible = !_visible;
    redraw();
  }

  function redraw() {
    const canvas = window.CanvasRenderer;
    const result = SolverState.result;
    if (!canvas || !result) return;

    if (!_visible) {
      canvas.clearOverlay("hgl");
      return;
    }

    const nodes   = result.node_results || [];
    const pipes   = result.pipe_results || [];
    const nm      = window.NetworkManager;

    // Build node positions
    const nodePos = {};
    nm.getNetwork().nodes.forEach(n => {
      nodePos[n.id] = { x: n.x, y: n.y, hgl: 0 };
    });
    nodes.forEach(nr => {
      if (nodePos[nr.node_id]) nodePos[nr.node_id].hgl = nr.hgl_m ?? 0;
    });

    const hglLines = pipes.map(pr => {
      const pipe    = nm.getPipe(pr.pipe_id);
      if (!pipe) return null;
      const fromPos = nodePos[pipe.from];
      const toPos   = nodePos[pipe.to];
      if (!fromPos || !toPos) return null;
      return {
        x1: fromPos.x, y1: fromPos.y, hgl1: fromPos.hgl,
        x2: toPos.x,   y2: toPos.y,   hgl2: toPos.hgl
      };
    }).filter(Boolean);

    canvas.drawOverlay("hgl", hglLines);
  }

  return { toggle, redraw, get visible() { return _visible; } };
})();

/* =========================================================================
   Export to global scope
   ========================================================================= */

window.SolverState       = SolverState;
window.ColourMapper      = ColourMapper;
window.SolverController  = SolverController;
window.CanvasColourer    = CanvasColourer;
window.ResultsRenderer   = ResultsRenderer;
window.ConvergencePlot   = ConvergencePlot;
window.LegendRenderer    = LegendRenderer;
window.SolverUI          = SolverUI;
window.ExportManager     = ExportManager;
window.TransientAnimator = TransientAnimator;
window.HydraulicGradientLine = HydraulicGradientLine;
