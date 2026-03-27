/**
 * moody.js — Interactive Moody Chart Renderer
 * CFD Pipe-Flow Expert  ·  Frontend Module
 *
 * Draws the Darcy friction factor (f) vs Reynolds number (Re) chart:
 *   • Laminar line  f = 64/Re
 *   • Colebrook-White iso-roughness curves for ε/D ∈ [0, 0.05]
 *   • Transitional zone shading (2300 ≤ Re ≤ 4000)
 *   • Fully turbulent (von Kármán) limit line
 *   • Interactive hover: reads (Re, f) from pointer position
 *   • Clickable point: plots user-specified (Re, ε/D)
 *   • Zoom & pan via mouse-wheel and drag
 *   • Printable SVG export
 */

"use strict";

/* =========================================================================
   MoodyChart — main renderer object
   ========================================================================= */

const MoodyChart = (() => {

  // ---- Configuration -------------------------------------------------------
  const DEFAULT_CONFIG = {
    reMin:   600,
    reMax:   1e8,
    fMin:    0.006,
    fMax:    0.1,
    colormapName: "jet",
    showGrid:     true,
    showLaminar:  true,
    showTurbulent:true,
    showTransitional: true,
    showFullyTurbulent: true,
    isoRoughnessValues: [
      0, 0.000001, 0.000005, 0.00001, 0.00005,
      0.0001, 0.0002, 0.0005, 0.001, 0.002,
      0.005, 0.01, 0.015, 0.02, 0.03, 0.04, 0.05
    ]
  };

  // ---- State ---------------------------------------------------------------
  let _canvas, _ctx;
  let _cfg = { ...DEFAULT_CONFIG };
  let _pad = { top: 30, right: 80, bottom: 55, left: 65 };
  let _userPoints = [];  // [ {re, eps_d, label} ]
  let _hoverInfo  = null;

  // Pan/zoom state
  let _view = {
    logReMin: Math.log10(DEFAULT_CONFIG.reMin),
    logReMax: Math.log10(DEFAULT_CONFIG.reMax),
    logFMin:  Math.log10(DEFAULT_CONFIG.fMin),
    logFMax:  Math.log10(DEFAULT_CONFIG.fMax)
  };

  let _dragging     = false;
  let _dragStart    = null;
  let _dragViewSnap = null;

  // ---- Math helpers --------------------------------------------------------

  /** Colebrook-White friction factor (Picard iteration, converges in ~10 steps) */
  function _colebrookWhite(re, epsD) {
    if (re <= 0) return NaN;
    if (re < 2300) return 64 / re;   // laminar
    if (epsD === 0) {
      // Smooth pipe: use Prandtl formula as initial guess
      let f = 0.02;
      for (let i = 0; i < 50; i++) {
        const rhs = -2 * Math.log10(2.51 / (re * Math.sqrt(f)));
        const fNew = 1 / (rhs * rhs);
        if (Math.abs(fNew - f) < 1e-10) { f = fNew; break; }
        f = fNew;
      }
      return f;
    }
    // Swamee-Jain as initial guess
    let f = 0.25 / Math.pow(Math.log10(epsD / 3.7 + 5.74 / Math.pow(re, 0.9)), 2);
    for (let i = 0; i < 50; i++) {
      const rhs = -2 * Math.log10(epsD / 3.7 + 2.51 / (re * Math.sqrt(f)));
      const fNew = 1 / (rhs * rhs);
      if (Math.abs(fNew - f) < 1e-12) { f = fNew; break; }
      f = fNew;
    }
    return f;
  }

  /** Fully-turbulent (high-Re) asymptote: Nikuradse roughness law */
  function _fullyTurbulent(epsD) {
    if (epsD <= 0) return NaN;
    const rhs = -2 * Math.log10(epsD / 3.7);
    return 1 / (rhs * rhs);
  }

  // ---- Coordinate transforms -----------------------------------------------

  function _plotW() { return _canvas.width  - _pad.left - _pad.right; }
  function _plotH() { return _canvas.height - _pad.top  - _pad.bottom; }

  function _reToX(re) {
    const logRe = Math.log10(re);
    return _pad.left + ((logRe - _view.logReMin) / (_view.logReMax - _view.logReMin)) * _plotW();
  }

  function _fToY(f) {
    const logF = Math.log10(f);
    return _pad.top + _plotH() - ((logF - _view.logFMin) / (_view.logFMax - _view.logFMin)) * _plotH();
  }

  function _xToRe(x) {
    const t = (x - _pad.left) / _plotW();
    return Math.pow(10, _view.logReMin + t * (_view.logReMax - _view.logReMin));
  }

  function _yToF(y) {
    const t = (y - _pad.top) / _plotH();
    return Math.pow(10, _view.logFMax - t * (_view.logFMax - _view.logFMin));
  }

  function _inPlot(x, y) {
    return x >= _pad.left && x <= _pad.left + _plotW() &&
           y >= _pad.top  && y <= _pad.top  + _plotH();
  }

  // ---- Drawing -------------------------------------------------------------

  function _draw() {
    const ctx = _ctx;
    const W   = _canvas.width;
    const H   = _canvas.height;

    ctx.clearRect(0, 0, W, H);

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Clip to plot area
    ctx.save();
    ctx.beginPath();
    ctx.rect(_pad.left, _pad.top, _plotW(), _plotH());
    ctx.clip();

    if (_cfg.showGrid)          _drawGrid();
    if (_cfg.showTransitional)  _drawTransitionalZone();
    if (_cfg.showLaminar)       _drawLaminarLine();
    if (_cfg.showTurbulent)     _drawIsoRoughnessLines();
    if (_cfg.showFullyTurbulent) _drawFullyTurbulentLines();
    _drawUserPoints();

    ctx.restore();   // end clip

    _drawAxes();
    _drawAxisLabels();
    _drawTitle();
    _drawRoughnessLegend();

    if (_hoverInfo) _drawHoverInfo();
  }

  function _drawGrid() {
    const ctx = _ctx;
    ctx.strokeStyle = "#e8e8e8";
    ctx.lineWidth   = 0.5;

    // Vertical (Re) grid lines
    for (let exp = Math.ceil(_view.logReMin); exp <= Math.floor(_view.logReMax); exp++) {
      for (let m = 1; m <= 9; m++) {
        const re = m * Math.pow(10, exp - 1);
        const x  = _reToX(re);
        if (x < _pad.left || x > _pad.left + _plotW()) continue;
        ctx.beginPath();
        ctx.moveTo(x, _pad.top);
        ctx.lineTo(x, _pad.top + _plotH());
        ctx.stroke();
      }
    }

    // Horizontal (f) grid lines
    for (let exp = Math.ceil(_view.logFMin * 10) / 10; exp <= _view.logFMax; exp += 0.1) {
      const f = Math.pow(10, exp);
      const y = _fToY(f);
      if (y < _pad.top || y > _pad.top + _plotH()) continue;
      ctx.beginPath();
      ctx.moveTo(_pad.left, y);
      ctx.lineTo(_pad.left + _plotW(), y);
      ctx.stroke();
    }
  }

  function _drawTransitionalZone() {
    const ctx = _ctx;
    const x1  = _reToX(2300);
    const x2  = _reToX(4000);
    const y1  = _pad.top;
    const y2  = _pad.top + _plotH();

    ctx.fillStyle = "rgba(255, 200, 50, 0.15)";
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

    ctx.strokeStyle = "rgba(200, 150, 0, 0.4)";
    ctx.lineWidth   = 1;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x1, y2);
    ctx.moveTo(x2, y1); ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle  = "rgba(150, 100, 0, 0.7)";
    ctx.font       = "10px Inter, sans-serif";
    ctx.textAlign  = "center";
    const midX = (x1 + x2) / 2;
    if (midX > _pad.left && midX < _pad.left + _plotW()) {
      ctx.save();
      ctx.translate(midX, _pad.top + 60);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Transitional", 0, 0);
      ctx.restore();
    }
  }

  function _drawLaminarLine() {
    const ctx   = _ctx;
    const steps = 200;
    const reMin = Math.max(100, Math.pow(10, _view.logReMin));
    const reMax = Math.min(2300, Math.pow(10, _view.logReMax));

    if (reMin >= reMax) return;

    ctx.beginPath();
    ctx.strokeStyle = "#1a56db";
    ctx.lineWidth   = 2;

    for (let i = 0; i <= steps; i++) {
      const t  = i / steps;
      const re = reMin * Math.pow(reMax / reMin, t);
      const f  = 64 / re;
      const x  = _reToX(re);
      const y  = _fToY(f);
      if (y < _pad.top - 5 || y > _pad.top + _plotH() + 5) continue;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Label
    const midRe = Math.sqrt(reMin * reMax);
    const midF  = 64 / midRe;
    const lx    = _reToX(midRe);
    const ly    = _fToY(midF);
    if (lx > _pad.left && lx < _pad.left + _plotW()) {
      ctx.fillStyle  = "#1a56db";
      ctx.font       = "bold 11px Inter, sans-serif";
      ctx.textAlign  = "center";
      ctx.fillText("f = 64/Re  (Laminar)", lx + 30, ly - 8);
    }
  }

  function _drawIsoRoughnessLines() {
    const ctx    = _ctx;
    const steps  = 300;
    const colors = _generateColors(_cfg.isoRoughnessValues.length);

    const reViewMin = Math.pow(10, _view.logReMin);
    const reViewMax = Math.pow(10, _view.logReMax);

    _cfg.isoRoughnessValues.forEach((epsD, idx) => {
      const reStart = Math.max(4000, reViewMin * 0.5);
      const reEnd   = reViewMax * 2;

      ctx.beginPath();
      ctx.strokeStyle = colors[idx];
      ctx.lineWidth   = epsD === 0 ? 2 : 1.5;

      let firstVisible = true;
      for (let i = 0; i <= steps; i++) {
        const t  = i / steps;
        const re = reStart * Math.pow(reEnd / reStart, t);
        const f  = _colebrookWhite(re, epsD);
        if (!isFinite(f) || f < 0) continue;
        const x  = _reToX(re);
        const y  = _fToY(f);
        if (x < _pad.left - 5 || x > _pad.left + _plotW() + 5) continue;
        if (y < _pad.top  - 5 || y > _pad.top  + _plotH() + 5) { firstVisible = true; continue; }
        firstVisible ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        firstVisible = false;
      }
      ctx.stroke();

      // Label at right edge
      const labelRe = Math.pow(10, _view.logReMax) * 0.85;
      if (labelRe > reStart) {
        const f  = _colebrookWhite(labelRe, epsD);
        if (isFinite(f)) {
          const lx = _reToX(labelRe) + 4;
          const ly = _fToY(f);
          if (ly > _pad.top && ly < _pad.top + _plotH()) {
            ctx.fillStyle  = colors[idx];
            ctx.font       = "9px Inter, sans-serif";
            ctx.textAlign  = "left";
            const txt = epsD === 0 ? "smooth" : epsD.toExponential(0);
            ctx.fillText(txt, _pad.left + _plotW() + 2, ly + 3);
          }
        }
      }
    });
  }

  function _drawFullyTurbulentLines() {
    const ctx = _ctx;
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(100, 100, 100, 0.4)";
    ctx.lineWidth   = 1;

    _cfg.isoRoughnessValues.filter(e => e > 0).forEach(epsD => {
      const f  = _fullyTurbulent(epsD);
      if (!isFinite(f)) return;
      const y  = _fToY(f);
      if (y < _pad.top || y > _pad.top + _plotH()) return;
      ctx.beginPath();
      ctx.moveTo(_pad.left, y);
      ctx.lineTo(_pad.left + _plotW(), y);
      ctx.stroke();
    });

    ctx.setLineDash([]);
  }

  function _drawUserPoints() {
    const ctx = _ctx;
    _userPoints.forEach(pt => {
      const x = _reToX(pt.re);
      const y = _fToY(pt.f);
      if (x < _pad.left || x > _pad.left + _plotW() || y < _pad.top || y > _pad.top + _plotH()) return;

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle   = "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      ctx.fillStyle  = "#111";
      ctx.font       = "11px Inter, sans-serif";
      ctx.textAlign  = "left";
      ctx.fillText(pt.label || `Re=${_formatSI(pt.re)}`, x + 8, y - 4);
    });
  }

  function _drawAxes() {
    const ctx = _ctx;
    const W   = _canvas.width;
    const H   = _canvas.height;

    ctx.strokeStyle = "#333";
    ctx.lineWidth   = 1.5;

    // Box border
    ctx.strokeRect(_pad.left, _pad.top, _plotW(), _plotH());

    // X ticks (Re)
    ctx.fillStyle = "#333";
    ctx.font      = "10px Inter, sans-serif";
    ctx.textAlign = "center";

    for (let exp = Math.ceil(_view.logReMin); exp <= Math.floor(_view.logReMax); exp++) {
      const re = Math.pow(10, exp);
      const x  = _reToX(re);
      if (x < _pad.left || x > _pad.left + _plotW()) continue;
      ctx.beginPath();
      ctx.moveTo(x, _pad.top + _plotH());
      ctx.lineTo(x, _pad.top + _plotH() + 5);
      ctx.stroke();
      ctx.fillText(`10${_sup(exp)}`, x, _pad.top + _plotH() + 16);
    }

    // Y ticks (f)
    ctx.textAlign = "right";
    const fTicks = [0.008, 0.01, 0.012, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1];
    fTicks.forEach(f => {
      const y = _fToY(f);
      if (y < _pad.top || y > _pad.top + _plotH()) return;
      ctx.beginPath();
      ctx.moveTo(_pad.left, y);
      ctx.lineTo(_pad.left - 5, y);
      ctx.stroke();
      ctx.fillText(f.toFixed(3), _pad.left - 7, y + 3);
    });
  }

  function _drawAxisLabels() {
    const ctx = _ctx;
    ctx.fillStyle = "#111";
    ctx.font      = "13px Inter, sans-serif";

    // X label
    ctx.textAlign = "center";
    ctx.fillText("Reynolds Number  (Re)", _pad.left + _plotW() / 2, _canvas.height - 6);

    // Y label (rotated)
    ctx.save();
    ctx.translate(14, _pad.top + _plotH() / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Darcy Friction Factor  (f)", 0, 0);
    ctx.restore();
  }

  function _drawTitle() {
    const ctx = _ctx;
    ctx.fillStyle  = "#111";
    ctx.font       = "bold 15px Inter, sans-serif";
    ctx.textAlign  = "center";
    ctx.fillText("Moody Chart", _pad.left + _plotW() / 2, _pad.top - 10);
  }

  function _drawRoughnessLegend() {
    const ctx     = _ctx;
    const x0      = _pad.left + _plotW() + 10;
    const y0      = _pad.top;
    const colors  = _generateColors(_cfg.isoRoughnessValues.length);
    const visible = _cfg.isoRoughnessValues.slice(0, 8);  // top 8

    ctx.fillStyle = "#333";
    ctx.font      = "bold 10px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("ε/D", x0, y0 - 4);

    visible.forEach((epsD, i) => {
      const y   = y0 + i * 14;
      ctx.strokeStyle = colors[i];
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(x0, y + 4);
      ctx.lineTo(x0 + 14, y + 4);
      ctx.stroke();
      ctx.fillStyle = "#444";
      ctx.font      = "9px Inter, sans-serif";
      ctx.fillText(epsD === 0 ? "0 (smooth)" : epsD.toExponential(0), x0 + 18, y + 8);
    });
  }

  function _drawHoverInfo() {
    const ctx = _ctx;
    const { x, y, re, f, epsD } = _hoverInfo;
    const regime = re < 2300 ? "Laminar" : re < 4000 ? "Transitional" : "Turbulent";

    const lines = [
      `Re = ${_formatSI(re)}`,
      `f  = ${f.toFixed(5)}`,
      `ε/D = ${(epsD ?? 0).toExponential(2)}`,
      regime
    ];

    const boxW = 150;
    const boxH = lines.length * 16 + 10;
    let bx = x + 12;
    let by = y - boxH - 8;
    if (bx + boxW > _canvas.width - 10) bx = x - boxW - 12;
    if (by < 5) by = y + 12;

    ctx.fillStyle   = "rgba(255,255,255,0.94)";
    ctx.strokeStyle = "#333";
    ctx.lineWidth   = 1;
    _roundRect(ctx, bx, by, boxW, boxH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#111";
    ctx.font      = "11px Inter, sans-serif";
    ctx.textAlign = "left";
    lines.forEach((l, i) => ctx.fillText(l, bx + 8, by + 16 + i * 16));

    // Cross-hair
    ctx.strokeStyle = "rgba(200,0,0,0.5)";
    ctx.lineWidth   = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, _pad.top); ctx.lineTo(x, _pad.top + _plotH());
    ctx.moveTo(_pad.left, y); ctx.lineTo(_pad.left + _plotW(), y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(200,0,0,0.7)";
    ctx.fill();
  }

  // ---- Utilities -----------------------------------------------------------

  function _sup(n) {
    const map = { 0:"⁰",1:"¹",2:"²",3:"³",4:"⁴",5:"⁵",6:"⁶",7:"⁷",8:"⁸",9:"⁹","-":"⁻" };
    return String(n).split("").map(c => map[c] || c).join("");
  }

  function _formatSI(v) {
    if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
    if (v >= 1e3) return (v / 1e3).toFixed(1) + "k";
    return v.toFixed(0);
  }

  function _generateColors(n) {
    const colors = [];
    for (let i = 0; i < n; i++) {
      const t   = i / Math.max(n - 1, 1);
      const hue = Math.round(240 - t * 240);   // blue → red
      colors.push(`hsl(${hue}, 80%, 45%)`);
    }
    return colors;
  }

  function _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // ---- Nearest roughness ---------------------------------------------------

  function _nearestEpsD(re, f) {
    let best = null;
    let bestErr = Infinity;
    _cfg.isoRoughnessValues.forEach(epsD => {
      const fc  = _colebrookWhite(re, epsD);
      const err = Math.abs(fc - f);
      if (err < bestErr) { bestErr = err; best = epsD; }
    });
    return best;
  }

  // ---- Event handlers ------------------------------------------------------

  function _onMouseMove(e) {
    const rect = _canvas.getBoundingClientRect();
    const x    = (e.clientX - rect.left) * (_canvas.width  / rect.width);
    const y    = (e.clientY - rect.top)  * (_canvas.height / rect.height);

    if (_dragging && _dragStart) {
      const dx = x - _dragStart.x;
      const dy = y - _dragStart.y;
      const dLogRe = -(dx / _plotW()) * (_dragViewSnap.logReMax - _dragViewSnap.logReMin);
      const dLogF  =  (dy / _plotH()) * (_dragViewSnap.logFMax  - _dragViewSnap.logFMin);
      _view.logReMin = _dragViewSnap.logReMin + dLogRe;
      _view.logReMax = _dragViewSnap.logReMax + dLogRe;
      _view.logFMin  = _dragViewSnap.logFMin  + dLogF;
      _view.logFMax  = _dragViewSnap.logFMax  + dLogF;
      _draw();
      return;
    }

    if (!_inPlot(x, y)) {
      _hoverInfo = null;
      _draw();
      return;
    }

    const re   = _xToRe(x);
    const f    = _yToF(y);
    const epsD = _nearestEpsD(re, f);

    _hoverInfo = { x, y, re, f, epsD };
    _draw();
  }

  function _onMouseDown(e) {
    _dragging     = true;
    const rect    = _canvas.getBoundingClientRect();
    _dragStart    = {
      x: (e.clientX - rect.left) * (_canvas.width  / rect.width),
      y: (e.clientY - rect.top)  * (_canvas.height / rect.height)
    };
    _dragViewSnap = { ..._view };
    _canvas.style.cursor = "grabbing";
  }

  function _onMouseUp() {
    _dragging = false;
    _canvas.style.cursor = "crosshair";
  }

  function _onWheel(e) {
    e.preventDefault();
    const rect  = _canvas.getBoundingClientRect();
    const cx    = (e.clientX - rect.left) * (_canvas.width  / rect.width);
    const cy    = (e.clientY - rect.top)  * (_canvas.height / rect.height);
    const scale = e.deltaY > 0 ? 1.15 : 1 / 1.15;

    const px = _inPlot(cx, cy) ? (cx - _pad.left) / _plotW() : 0.5;
    const py = _inPlot(cx, cy) ? (cy - _pad.top)  / _plotH() : 0.5;

    const logReRange = _view.logReMax - _view.logReMin;
    const logFRange  = _view.logFMax  - _view.logFMin;
    const logReCtr   = _view.logReMin + px * logReRange;
    const logFCtr    = _view.logFMax  - py * logFRange;

    _view.logReMin = logReCtr - px * logReRange * scale;
    _view.logReMax = logReCtr + (1 - px) * logReRange * scale;
    _view.logFMin  = logFCtr  - (1 - py) * logFRange  * scale;
    _view.logFMax  = logFCtr  + py * logFRange * scale;

    _draw();
  }

  function _onClick(e) {
    const rect = _canvas.getBoundingClientRect();
    const x    = (e.clientX - rect.left) * (_canvas.width  / rect.width);
    const y    = (e.clientY - rect.top)  * (_canvas.height / rect.height);
    if (!_inPlot(x, y)) return;

    const re   = _xToRe(x);
    const f    = _colebrookWhite(re, _nearestEpsD(re, _yToF(y)));
    const epsD = _nearestEpsD(re, _yToF(y));

    MoodyChart.addPoint({ re, epsD, f, label: `Re=${_formatSI(re)}` });
    _updatePointsList();
  }

  function _onDblClick() {
    _resetView();
  }

  function _resetView() {
    _view = {
      logReMin: Math.log10(_cfg.reMin),
      logReMax: Math.log10(_cfg.reMax),
      logFMin:  Math.log10(_cfg.fMin),
      logFMax:  Math.log10(_cfg.fMax)
    };
    _draw();
  }

  function _updatePointsList() {
    const el = document.getElementById("moody-points-list");
    if (!el) return;

    if (!_userPoints.length) {
      el.innerHTML = "<p class='muted'>Click on the chart to add a point.</p>";
      return;
    }

    el.innerHTML = `<table class="mini-table">
      <thead><tr><th>Re</th><th>ε/D</th><th>f</th><th>Regime</th><th></th></tr></thead>
      <tbody>
        ${_userPoints.map((pt, i) => {
          const regime = pt.re < 2300 ? "Laminar" : pt.re < 4000 ? "Trans." : "Turbulent";
          return `<tr>
            <td>${_formatSI(pt.re)}</td>
            <td>${pt.epsD?.toExponential(1) ?? "—"}</td>
            <td>${pt.f?.toFixed(5)}</td>
            <td>${regime}</td>
            <td><button class="btn-sm" onclick="MoodyChart.removePoint(${i})">✕</button></td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>`;
  }

  // ---- Public API ----------------------------------------------------------

  function init(canvasId) {
    _canvas = document.getElementById(canvasId);
    if (!_canvas) { console.error("Moody canvas not found:", canvasId); return; }
    _ctx    = _canvas.getContext("2d");

    _canvas.addEventListener("mousemove",  _onMouseMove);
    _canvas.addEventListener("mousedown",  _onMouseDown);
    _canvas.addEventListener("mouseup",    _onMouseUp);
    _canvas.addEventListener("mouseleave", _onMouseUp);
    _canvas.addEventListener("wheel",      _onWheel, { passive: false });
    _canvas.addEventListener("click",      _onClick);
    _canvas.addEventListener("dblclick",   _onDblClick);

    _canvas.style.cursor = "crosshair";

    _resizeCanvas();
    _draw();

    window.addEventListener("resize", () => { _resizeCanvas(); _draw(); });
  }

  function _resizeCanvas() {
    const container = _canvas.parentElement;
    if (!container) return;
    const ratio    = window.devicePixelRatio || 1;
    const rect     = container.getBoundingClientRect();
    _canvas.width  = rect.width  * ratio;
    _canvas.height = (rect.height || 480) * ratio;
    _canvas.style.width  = rect.width  + "px";
    _canvas.style.height = (rect.height || 480) + "px";
    _ctx.scale(ratio, ratio);
  }

  function addPoint(pt) {
    if (!isFinite(pt.re) || !isFinite(pt.f)) return;
    _userPoints.push(pt);
    _draw();
    _updatePointsList();
  }

  function removePoint(idx) {
    _userPoints.splice(idx, 1);
    _draw();
    _updatePointsList();
  }

  function clearPoints() {
    _userPoints = [];
    _draw();
    _updatePointsList();
  }

  function plotNetworkResults(result) {
    clearPoints();
    (result.pipe_results || []).forEach(pr => {
      const re   = pr.reynolds_number ?? 0;
      const f    = pr.friction_factor ?? 0;
      const epsD = 0.000046 / (pr.diameter ?? 0.1);
      if (re > 0 && f > 0) {
        addPoint({ re, f, epsD, label: pr.pipe_id });
      }
    });
  }

  function setOption(key, value) {
    _cfg[key] = value;
    _draw();
  }

  function resetZoom() { _resetView(); }

  function exportSVG() {
    // Serialise current canvas to SVG via hidden canvas trick
    const dataURL = _canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href  = dataURL;
    a.download = "moody_chart.png";
    a.click();
  }

  function plotUserInput(re, epsD) {
    const f  = _colebrookWhite(re, epsD);
    addPoint({ re, epsD, f, label: `Re=${_formatSI(re)}, ε/D=${epsD.toExponential(1)}` });
    // Pan to that point
    const logRe = Math.log10(re);
    const logF  = Math.log10(f);
    const margin = 1.5;
    _view.logReMin = logRe - margin;
    _view.logReMax = logRe + margin;
    _view.logFMin  = logF  - 0.3;
    _view.logFMax  = logF  + 0.3;
    _draw();
  }

  return {
    init,
    addPoint,
    removePoint,
    clearPoints,
    plotNetworkResults,
    setOption,
    resetZoom,
    exportSVG,
    plotUserInput,
    colebrookWhite: _colebrookWhite
  };
})();

/* =========================================================================
   MoodyUI — wires the DOM controls for the Moody chart panel
   ========================================================================= */

const MoodyUI = (() => {

  function init() {
    MoodyChart.init("moody-canvas");

    // User-input form
    document.getElementById("btn-moody-plot")?.addEventListener("click", () => {
      const re   = parseFloat(document.getElementById("moody-re-input")?.value);
      const epsD = parseFloat(document.getElementById("moody-eps-input")?.value);
      if (!isFinite(re) || re <= 0) { window.UI?.toast("Enter a valid Reynolds number", "warning"); return; }
      if (!isFinite(epsD) || epsD < 0) { window.UI?.toast("Enter a valid ε/D (≥ 0)", "warning"); return; }
      MoodyChart.plotUserInput(re, epsD);
    });

    // Clear points
    document.getElementById("btn-moody-clear")?.addEventListener("click", () => {
      MoodyChart.clearPoints();
    });

    // Reset zoom
    document.getElementById("btn-moody-reset")?.addEventListener("click", () => {
      MoodyChart.resetZoom();
    });

    // Export
    document.getElementById("btn-moody-export")?.addEventListener("click", () => {
      MoodyChart.exportSVG();
    });

    // Overlay toggles
    ["laminar", "turbulent", "transitional", "fully-turbulent", "grid"].forEach(key => {
      const el = document.getElementById(`moody-show-${key}`);
      if (!el) return;
      const cfgKey = {
        "laminar":          "showLaminar",
        "turbulent":        "showTurbulent",
        "transitional":     "showTransitional",
        "fully-turbulent":  "showFullyTurbulent",
        "grid":             "showGrid"
      }[key];
      el.addEventListener("change", () => MoodyChart.setOption(cfgKey, el.checked));
    });

    // Plot results from solver if available
    document.getElementById("btn-moody-from-results")?.addEventListener("click", () => {
      const result = window.SolverState?.result;
      if (!result) { window.UI?.toast("Solve the network first", "warning"); return; }
      MoodyChart.plotNetworkResults(result);
      window.UI?.toast("Network results plotted on Moody chart", "success");
    });

    // Re calculator shortcut
    document.getElementById("btn-moody-calc-re")?.addEventListener("click", () => {
      const vel  = parseFloat(document.getElementById("moody-vel")?.value);
      const D    = parseFloat(document.getElementById("moody-D")?.value);
      const nu   = parseFloat(document.getElementById("moody-nu")?.value) ?? 1e-6;
      if (!isFinite(vel) || !isFinite(D)) return;
      const re   = vel * D / nu;
      const inEl = document.getElementById("moody-re-input");
      if (inEl) inEl.value = re.toFixed(0);
      window.UI?.toast(`Re = ${re.toFixed(0)}`, "info");
    });
  }

  return { init };
})();

/* =========================================================================
   Export
   ========================================================================= */

window.MoodyChart = MoodyChart;
window.MoodyUI    = MoodyUI;
