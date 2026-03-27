// =============================================================================
// js/canvas.js  —  Interactive pipe-network canvas renderer
//
// Responsibilities:
//   • Draw nodes (circles) and pipes (coloured lines) on an HTML canvas
//   • Handle zoom, pan, and selection
//   • Emit events when user clicks/drags elements
//   • Overlay CFD result colours and flow arrows
//   • Draw the colour legend bar
// =============================================================================

'use strict';

const CanvasEngine = (() => {

  // ── Internal state ─────────────────────────────────────────────────────

  let _canvas  = null;
  let _ctx     = null;
  let _dpr     = 1;        // device pixel ratio
  let _width   = 0;
  let _height  = 0;

  // Viewport transform
  let _ox = 0, _oy = 0;   // pan offset (world origin in screen coords)
  let _scale = 1.0;        // zoom

  // Interaction state
  let _tool        = 'select';
  let _isPanning   = false;
  let _isDrawingPipe = false;
  let _panStart    = { x: 0, y: 0 };
  let _pipeStart   = null;   // node id when drawing a pipe
  let _mouseScreen = { x: 0, y: 0 };
  let _mouseWorld  = { x: 0, y: 0 };
  let _selection   = { type: null, id: null };
  let _draggingNode = null;
  let _dragOffset   = { x: 0, y: 0 };

  // Network data (references to the Network module's store)
  let _nodes = {};
  let _pipes = {};

  // CFD result colours (set after solve)
  let _pipeColors = {};    // pipeId → hex colour string
  let _pipeValues = {};    // pipeId → numeric display value
  let _nodeHeads  = {};    // nodeId → head [m]
  let _visVariable = 'velocity';

  // Display options
  let _showLabels    = true;
  let _showArrows    = true;
  let _showNodeInfo  = true;
  let _pipeWidthScale = 3;

  // Undo/redo stacks (simple snapshots of network JSON)
  let _undoStack = [];
  let _redoStack = [];

  // Event handlers
  const _handlers = {};

  // ── Geometry helpers ───────────────────────────────────────────────────

  function worldToScreen(wx, wy) {
    return { x: wx * _scale + _ox, y: wy * _scale + _oy };
  }

  function screenToWorld(sx, sy) {
    return { x: (sx - _ox) / _scale, y: (sy - _oy) / _scale };
  }

  function distPointToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-10) return Math.hypot(px - ax, py - ay);
    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  }

  // ── Node/pipe hit testing ──────────────────────────────────────────────

  const NODE_RADIUS = 10;   // world units

  function hitTestNode(wx, wy) {
    for (const [id, n] of Object.entries(_nodes)) {
      if (Math.hypot(wx - n.x, wy - n.y) <= NODE_RADIUS + 2 / _scale) return id;
    }
    return null;
  }

  function hitTestPipe(wx, wy) {
    const threshold = 6 / _scale;
    for (const [id, p] of Object.entries(_pipes)) {
      const nf = _nodes[p.node_from], nt = _nodes[p.node_to];
      if (!nf || !nt) continue;
      const d = distPointToSegment(wx, wy, nf.x, nf.y, nt.x, nt.y);
      if (d <= threshold) return id;
    }
    return null;
  }

  // ── Colour helpers ─────────────────────────────────────────────────────

  function hexToRGBA(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function velocityToColor(v, vMin, vMax) {
    const stops = [
      [0,   0,   255],  // blue
      [0,   255, 255],  // cyan
      [0,   255, 0],    // green
      [255, 255, 0],    // yellow
      [255, 0,   0],    // red
    ];
    if (vMax <= vMin) return '#0000FF';
    const t   = Math.max(0, Math.min(1, (v - vMin) / (vMax - vMin)));
    const seg = t * (stops.length - 1);
    const i   = Math.min(Math.floor(seg), stops.length - 2);
    const lt  = seg - i;
    const r   = Math.round(lerp(stops[i][0], stops[i+1][0], lt));
    const g   = Math.round(lerp(stops[i][1], stops[i+1][1], lt));
    const b   = Math.round(lerp(stops[i][2], stops[i+1][2], lt));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  // ── Draw helpers ───────────────────────────────────────────────────────

  function _clearCanvas() {
    _ctx.clearRect(0, 0, _width, _height);
    _ctx.fillStyle = '#FFFFFF';
    _ctx.fillRect(0, 0, _width, _height);
  }

  function _drawGrid() {
    const gridSize = 50;   // world units per grid cell
    const screenGridSize = gridSize * _scale;
    if (screenGridSize < 8) return;  // too zoomed out

    _ctx.save();
    _ctx.strokeStyle = '#F0F0F0';
    _ctx.lineWidth = 1;

    const startX = ((-_ox) / _scale / gridSize | 0) * gridSize;
    const startY = ((-_oy) / _scale / gridSize | 0) * gridSize;
    const endX   = startX + (_width  / _scale) + gridSize * 2;
    const endY   = startY + (_height / _scale) + gridSize * 2;

    for (let wx = startX; wx < endX; wx += gridSize) {
      const sx = wx * _scale + _ox;
      _ctx.beginPath();
      _ctx.moveTo(sx, 0);
      _ctx.lineTo(sx, _height);
      _ctx.stroke();
    }
    for (let wy = startY; wy < endY; wy += gridSize) {
      const sy = wy * _scale + _oy;
      _ctx.beginPath();
      _ctx.moveTo(0, sy);
      _ctx.lineTo(_width, sy);
      _ctx.stroke();
    }
    _ctx.restore();
  }

  function _drawPipes() {
    for (const [id, p] of Object.entries(_pipes)) {
      const nf = _nodes[p.node_from];
      const nt = _nodes[p.node_to];
      if (!nf || !nt) continue;

      const sFrom = worldToScreen(nf.x, nf.y);
      const sTo   = worldToScreen(nt.x, nt.y);

      // Colour
      const color = _pipeColors[id] || '#94A3B8';
      const isSelected = _selection.type === 'pipe' && _selection.id === id;

      _ctx.save();

      // Draw pipe line
      const lw = Math.max(1.5, _pipeWidthScale * _scale * 0.6);
      _ctx.lineWidth   = isSelected ? lw + 2 : lw;
      _ctx.strokeStyle = isSelected ? '#2563EB' : color;
      _ctx.lineCap     = 'round';
      _ctx.shadowColor = isSelected ? 'rgba(37,99,235,0.3)' : 'transparent';
      _ctx.shadowBlur  = isSelected ? 8 : 0;

      _ctx.beginPath();
      _ctx.moveTo(sFrom.x, sFrom.y);
      _ctx.lineTo(sTo.x,   sTo.y);
      _ctx.stroke();

      // Flow arrow (midpoint)
      if (_showArrows && _pipeValues[id] !== undefined) {
        _drawFlowArrow(sFrom, sTo, p.Q || 0, color);
      }

      // Pipe label
      if (_showLabels && _scale > 0.6) {
        const mx = (sFrom.x + sTo.x) / 2;
        const my = (sFrom.y + sTo.y) / 2;
        const val = _pipeValues[id];
        const label = val !== undefined
          ? `${id} (${val.toFixed(3)})`
          : id;

        _ctx.font = `${Math.max(9, 11 * _scale)}px Inter, sans-serif`;
        _ctx.fillStyle = '#374151';
        _ctx.textAlign = 'center';
        _ctx.textBaseline = 'middle';

        const tw = _ctx.measureText(label).width;
        _ctx.fillStyle = 'rgba(255,255,255,0.8)';
        _ctx.fillRect(mx - tw / 2 - 2, my - 7, tw + 4, 14);
        _ctx.fillStyle = '#374151';
        _ctx.fillText(label, mx, my);
      }

      _ctx.restore();
    }
  }

  function _drawFlowArrow(sFrom, sTo, Q, color) {
    if (Math.abs(Q) < 1e-9) return;
    const mx = (sFrom.x + sTo.x) / 2;
    const my = (sFrom.y + sTo.y) / 2;
    const dx = sTo.x - sFrom.x;
    const dy = sTo.y - sFrom.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-6) return;

    const sign  = Q >= 0 ? 1 : -1;
    const angle = Math.atan2(dy, dx) + (sign < 0 ? Math.PI : 0);
    const arrowLen = Math.min(12 * _scale, 14);

    _ctx.save();
    _ctx.translate(mx, my);
    _ctx.rotate(angle);
    _ctx.beginPath();
    _ctx.moveTo(arrowLen, 0);
    _ctx.lineTo(-arrowLen * 0.6,  arrowLen * 0.35);
    _ctx.lineTo(-arrowLen * 0.6, -arrowLen * 0.35);
    _ctx.closePath();
    _ctx.fillStyle = color;
    _ctx.globalAlpha = 0.85;
    _ctx.fill();
    _ctx.restore();
  }

  function _drawNodes() {
    for (const [id, n] of Object.entries(_nodes)) {
      const s = worldToScreen(n.x, n.y);
      const isSelected = _selection.type === 'node' && _selection.id === id;
      const r = NODE_RADIUS * _scale;

      _ctx.save();

      // Outer glow for reservoir nodes
      if (n.is_reservoir) {
        _ctx.shadowColor = 'rgba(234,179,8,0.5)';
        _ctx.shadowBlur  = 10;
      }
      if (isSelected) {
        _ctx.shadowColor = 'rgba(37,99,235,0.4)';
        _ctx.shadowBlur  = 12;
      }

      // Node body
      _ctx.beginPath();
      _ctx.arc(s.x, s.y, r, 0, Math.PI * 2);

      if (n.is_reservoir) {
        _ctx.fillStyle = '#FEF3C7';
        _ctx.strokeStyle = '#D97706';
      } else {
        _ctx.fillStyle = isSelected ? '#EFF6FF' : '#FFFFFF';
        _ctx.strokeStyle = isSelected ? '#2563EB' : '#6B7280';
      }

      _ctx.fill();
      _ctx.lineWidth   = isSelected ? 2.5 : 1.5;
      _ctx.stroke();

      // Node head indicator (small inner circle)
      if (_nodeHeads[id] !== undefined) {
        const headNorm = Math.min(1, Math.max(0, (_nodeHeads[id] - 0) / 100));
        _ctx.beginPath();
        _ctx.arc(s.x, s.y, r * 0.4, 0, Math.PI * 2);
        _ctx.fillStyle = velocityToColor(headNorm, 0, 1);
        _ctx.fill();
      }

      // Node label
      if (_showNodeInfo && _scale > 0.5) {
        _ctx.font = `bold ${Math.max(9, 11 * _scale)}px Inter, sans-serif`;
        _ctx.fillStyle = isSelected ? '#1D4ED8' : '#111827';
        _ctx.textAlign = 'center';
        _ctx.textBaseline = 'bottom';
        _ctx.shadowBlur = 0;
        _ctx.fillText(id, s.x, s.y - r - 2);

        if (_nodeHeads[id] !== undefined && _scale > 0.7) {
          _ctx.font = `${Math.max(8, 9 * _scale)}px JetBrains Mono, monospace`;
          _ctx.fillStyle = '#6B7280';
          _ctx.textBaseline = 'top';
          _ctx.fillText(`${_nodeHeads[id].toFixed(1)}m`, s.x, s.y + r + 2);
        }
      }

      _ctx.restore();
    }
  }

  function _drawTemporaryPipe() {
    if (!_isDrawingPipe || !_pipeStart) return;
    const nf = _nodes[_pipeStart];
    if (!nf) return;
    const sFrom = worldToScreen(nf.x, nf.y);

    _ctx.save();
    _ctx.setLineDash([6, 4]);
    _ctx.strokeStyle = '#2563EB';
    _ctx.lineWidth   = 2;
    _ctx.globalAlpha = 0.6;
    _ctx.beginPath();
    _ctx.moveTo(sFrom.x, sFrom.y);
    _ctx.lineTo(_mouseScreen.x, _mouseScreen.y);
    _ctx.stroke();
    _ctx.restore();
  }

  function _drawColorbar() {
    const cbCanvas = document.getElementById('colorbar-canvas');
    if (!cbCanvas) return;
    const cbCtx = cbCanvas.getContext('2d');
    const w = cbCanvas.width;
    const h = cbCanvas.height;

    const grad = cbCtx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0,    '#0000FF');
    grad.addColorStop(0.25, '#00FFFF');
    grad.addColorStop(0.5,  '#00FF00');
    grad.addColorStop(0.75, '#FFFF00');
    grad.addColorStop(1,    '#FF0000');

    cbCtx.clearRect(0, 0, w, h);
    cbCtx.fillStyle = grad;
    cbCtx.fillRect(0, 0, w, h);
  }

  // ── Main render ────────────────────────────────────────────────────────

  function render() {
    if (!_canvas || !_ctx) return;
    _clearCanvas();
    _drawGrid();
    _ctx.save();
    // nothing extra — transforms applied per-element for better control
    _drawPipes();
    _drawTemporaryPipe();
    _drawNodes();
    _ctx.restore();
  }

  // ── Zoom helpers ───────────────────────────────────────────────────────

  function zoomAt(sx, sy, factor) {
    const wx = (sx - _ox) / _scale;
    const wy = (sy - _oy) / _scale;
    _scale  = Math.max(0.05, Math.min(10, _scale * factor));
    _ox = sx - wx * _scale;
    _oy = sy - wy * _scale;
    render();
  }

  function fitView() {
    const ns = Object.values(_nodes);
    if (ns.length === 0) {
      _scale = 1; _ox = 50; _oy = 50;
      render(); return;
    }
    const xs = ns.map(n => n.x), ys = ns.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const pad  = 60;
    const sx = (_width  - 2 * pad) / Math.max(maxX - minX, 1);
    const sy = (_height - 2 * pad) / Math.max(maxY - minY, 1);
    _scale = Math.max(0.05, Math.min(5, Math.min(sx, sy)));
    _ox = _width  / 2 - (minX + maxX) / 2 * _scale;
    _oy = _height / 2 - (minY + maxY) / 2 * _scale;
    render();
  }

  // ── Mouse events ───────────────────────────────────────────────────────

  function _onMouseDown(e) {
    if (e.button !== 0) return;
    const rect = _canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * _dpr;
    const sy = (e.clientY - rect.top)  * _dpr;
    const wx = (sx - _ox) / _scale;
    const wy = (sy - _oy) / _scale;

    if (_tool === 'pan' || e.button === 1 || (e.altKey)) {
      _isPanning = true;
      _panStart  = { x: sx - _ox, y: sy - _oy };
      _canvas.style.cursor = 'grabbing';
      return;
    }

    if (_tool === 'select') {
      const nodeId = hitTestNode(wx, wy);
      if (nodeId) {
        _selection = { type: 'node', id: nodeId };
        _draggingNode = nodeId;
        _dragOffset   = { x: wx - _nodes[nodeId].x, y: wy - _nodes[nodeId].y };
        _emit('select', { type: 'node', id: nodeId, data: _nodes[nodeId] });
        render(); return;
      }
      const pipeId = hitTestPipe(wx, wy);
      if (pipeId) {
        _selection = { type: 'pipe', id: pipeId };
        _emit('select', { type: 'pipe', id: pipeId, data: _pipes[pipeId] });
        render(); return;
      }
      // Clicked empty space
      _selection = { type: null, id: null };
      _emit('deselect', {});
      render(); return;
    }

    if (_tool === 'add-node') {
      _emit('addNode', { x: Math.round(wx), y: Math.round(wy) });
      return;
    }

    if (_tool === 'add-pipe') {
      const nodeId = hitTestNode(wx, wy);
      if (!_isDrawingPipe) {
        if (nodeId) {
          _isDrawingPipe = true;
          _pipeStart     = nodeId;
          _canvas.style.cursor = 'crosshair';
        }
      } else {
        if (nodeId && nodeId !== _pipeStart) {
          _emit('addPipe', { from: _pipeStart, to: nodeId });
        }
        _isDrawingPipe = false;
        _pipeStart     = null;
        _canvas.style.cursor = 'crosshair';
        render();
      }
      return;
    }
  }

  function _onMouseMove(e) {
    const rect = _canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * _dpr;
    const sy = (e.clientY - rect.top)  * _dpr;
    _mouseScreen = { x: sx, y: sy };
    _mouseWorld  = screenToWorld(sx, sy);

    if (_isPanning) {
      _ox = sx - _panStart.x;
      _oy = sy - _panStart.y;
      render(); return;
    }

    if (_draggingNode && _tool === 'select') {
      const n = _nodes[_draggingNode];
      if (n) {
        n.x = Math.round(_mouseWorld.x - _dragOffset.x);
        n.y = Math.round(_mouseWorld.y - _dragOffset.y);
        _emit('nodeMoved', { id: _draggingNode, x: n.x, y: n.y });
      }
      render(); return;
    }

    if (_isDrawingPipe) { render(); return; }

    // Update tooltip
    const nodeId = hitTestNode(_mouseWorld.x, _mouseWorld.y);
    const pipeId = nodeId ? null : hitTestPipe(_mouseWorld.x, _mouseWorld.y);
    const tooltip = document.getElementById('hover-tooltip');
    if (!tooltip) return;

    if (nodeId) {
      const n = _nodes[nodeId];
      let txt = `Node: ${nodeId}\nElev: ${n.elevation ?? 0}m`;
      if (_nodeHeads[nodeId] !== undefined) txt += `\nHead: ${_nodeHeads[nodeId].toFixed(2)}m`;
      if (n.is_reservoir) txt += '\n[Reservoir]';
      tooltip.textContent = txt;
      tooltip.style.left  = `${e.clientX + 12}px`;
      tooltip.style.top   = `${e.clientY - 8}px`;
      tooltip.classList.remove('hidden');
    } else if (pipeId) {
      const p = _pipes[pipeId];
      let txt = `Pipe: ${pipeId}\n${p.node_from} → ${p.node_to}`;
      if (_pipeValues[pipeId] !== undefined) {
        const units = _getVarUnits();
        txt += `\n${_visVariable}: ${_pipeValues[pipeId].toFixed(4)} ${units}`;
      }
      txt += `\nL=${p.length}m  D=${p.diameter*1000}mm`;
      tooltip.textContent = txt;
      tooltip.style.left  = `${e.clientX + 12}px`;
      tooltip.style.top   = `${e.clientY - 8}px`;
      tooltip.classList.remove('hidden');
    } else {
      tooltip.classList.add('hidden');
    }
  }

  function _onMouseUp(e) {
    if (_isPanning)  { _isPanning  = false; _canvas.style.cursor = ''; }
    if (_draggingNode) {
      _draggingNode = null;
      _pushUndo();
    }
  }

  function _onWheel(e) {
    e.preventDefault();
    const rect = _canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * _dpr;
    const sy = (e.clientY - rect.top)  * _dpr;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomAt(sx, sy, factor);
  }

  function _getVarUnits() {
    const map = {
      velocity:       'm/s',
      pressure:       'Pa',
      head_loss:      'm',
      reynolds:       '—',
      friction_factor:'—',
      temperature:    '°C',
      wall_shear:     'Pa',
      flow_regime:    '—',
    };
    return map[_visVariable] || '';
  }

  // ── Undo/Redo ──────────────────────────────────────────────────────────

  function _pushUndo() {
    const snap = JSON.stringify({ nodes: _nodes, pipes: _pipes });
    _undoStack.push(snap);
    if (_undoStack.length > 50) _undoStack.shift();
    _redoStack = [];
  }

  function undo() {
    if (_undoStack.length === 0) return;
    const snap = _undoStack.pop();
    _redoStack.push(JSON.stringify({ nodes: _nodes, pipes: _pipes }));
    const state = JSON.parse(snap);
    _nodes = state.nodes;
    _pipes = state.pipes;
    _emit('networkChanged', { nodes: _nodes, pipes: _pipes });
    render();
  }

  function redo() {
    if (_redoStack.length === 0) return;
    const snap = _redoStack.pop();
    _undoStack.push(JSON.stringify({ nodes: _nodes, pipes: _pipes }));
    const state = JSON.parse(snap);
    _nodes = state.nodes;
    _pipes = state.pipes;
    _emit('networkChanged', { nodes: _nodes, pipes: _pipes });
    render();
  }

  // ── Event emitter ──────────────────────────────────────────────────────

  function _emit(event, data) {
    if (_handlers[event]) _handlers[event].forEach(fn => fn(data));
  }

  function on(event, fn) {
    if (!_handlers[event]) _handlers[event] = [];
    _handlers[event].push(fn);
  }

  // ── Resize ─────────────────────────────────────────────────────────────

  function _resize() {
    const container = _canvas.parentElement;
    _dpr    = window.devicePixelRatio || 1;
    _width  = container.clientWidth  * _dpr;
    _height = container.clientHeight * _dpr;
    _canvas.width  = _width;
    _canvas.height = _height;
    _canvas.style.width  = container.clientWidth  + 'px';
    _canvas.style.height = container.clientHeight + 'px';
    render();
  }

  // ── Public API ─────────────────────────────────────────────────────────

  function init(canvasEl) {
    _canvas = canvasEl;
    _ctx    = _canvas.getContext('2d');
    _resize();
    window.addEventListener('resize', _resize);

    _canvas.addEventListener('mousedown',  _onMouseDown);
    _canvas.addEventListener('mousemove',  _onMouseMove);
    _canvas.addEventListener('mouseup',    _onMouseUp);
    _canvas.addEventListener('wheel',      _onWheel, { passive: false });
    _canvas.addEventListener('mouseleave', () => {
      _isPanning    = false;
      _draggingNode = null;
      document.getElementById('hover-tooltip')?.classList.add('hidden');
    });

    // Center view
    _ox = 80; _oy = 80;
    _drawColorbar();
    render();
  }

  function setNetworkData(nodes, pipes) {
    _nodes = nodes;
    _pipes = pipes;
    render();
  }

  function setCFDResults(pipeResults, nodeResults, variable) {
    _visVariable = variable || 'velocity';
    _pipeColors  = {};
    _pipeValues  = {};
    _nodeHeads   = {};

    if (pipeResults) {
      let values = pipeResults.map(r => r[_visVariable] ?? r.velocity ?? 0);
      const vMin = Math.min(...values);
      const vMax = Math.max(...values);

      // Update colorbar labels
      const cbMin = document.getElementById('cb-min');
      const cbMax = document.getElementById('cb-max');
      const cbMid = document.getElementById('cb-mid');
      const units = { velocity:'m/s', pressure:'Pa', head_loss:'m', reynolds:'', friction_factor:'', temperature:'°C', wall_shear:'Pa' };
      const u = units[_visVariable] || '';
      if (cbMin) cbMin.textContent = `${vMin.toFixed(3)} ${u}`;
      if (cbMax) cbMax.textContent = `${vMax.toFixed(3)} ${u}`;
      if (cbMid) cbMid.textContent = `${((vMin + vMax) / 2).toFixed(3)} ${u}`;

      pipeResults.forEach(r => {
        const val = r[_visVariable] ?? r.velocity ?? 0;
        _pipeColors[r.pipe_id] = r.color || velocityToColor(val, vMin, vMax);
        _pipeValues[r.pipe_id] = val;
        // Store Q for arrows
        if (_pipes[r.pipe_id]) _pipes[r.pipe_id].Q = r.flow_rate_m3s;
      });
    }

    if (nodeResults) {
      nodeResults.forEach(r => {
        _nodeHeads[r.node_id] = r.head_m;
      });
    }

    render();
  }

  function clearResults() {
    _pipeColors = {};
    _pipeValues = {};
    _nodeHeads  = {};
    render();
  }

  function setTool(tool) {
    _tool = tool;
    _isDrawingPipe = false;
    _pipeStart = null;
    const cursors = { select:'default', 'add-node':'cell', 'add-pipe':'crosshair', pan:'grab' };
    _canvas.style.cursor = cursors[tool] || 'default';
    render();
  }

  function setDisplayOptions(opts) {
    if (opts.showLabels    !== undefined) _showLabels    = opts.showLabels;
    if (opts.showArrows    !== undefined) _showArrows    = opts.showArrows;
    if (opts.showNodeInfo  !== undefined) _showNodeInfo  = opts.showNodeInfo;
    if (opts.pipeWidthScale !== undefined) _pipeWidthScale = opts.pipeWidthScale;
    render();
  }

  function getSelection() { return { ..._selection }; }

  function clearSelection() {
    _selection = { type: null, id: null };
    render();
  }

  function pushUndo() { _pushUndo(); }

  return {
    init, render, on,
    setNetworkData, setCFDResults, clearResults,
    setTool, fitView, zoomAt,
    setDisplayOptions, getSelection, clearSelection,
    undo, redo, pushUndo,
    worldToScreen, screenToWorld,
  };

})();

window.CanvasEngine = CanvasEngine;
