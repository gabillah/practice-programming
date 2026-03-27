// =============================================================================
// js/network.js  —  Local network state manager
//
// Manages the in-memory pipe network, validation, and serialisation.
// Acts as the single source of truth for nodes/pipes.
// Communicates with the backend via API.js for persistence.
// =============================================================================

'use strict';

const Network = (() => {

  // ── State ──────────────────────────────────────────────────────────────

  let _state = {
    id:          null,         // backend network ID (null = unsaved)
    name:        'New Network',
    description: '',
    nodes:       {},           // { nodeId: { id, x, y, elevation, demand, is_reservoir, reservoir_head, ... } }
    pipes:       {},           // { pipeId: { id, node_from, node_to, length, diameter, roughness, ... } }
    fluid:       null,         // FluidPropertiesSchema dict or null (use preset)
    fluidPreset: 'water_20c',
    solverConfig: {
      method:       'newton_raphson',
      max_iter:     200,
      tolerance:    1e-6,
      relaxation:   0.5,
      heat_transfer: true,
      turbulence:   true,
      water_hammer: false,
      two_phase:    false,
    },
    isDirty: false,
  };

  // Roughness database (mirror of backend PIPE_ROUGHNESS_DB)
  const ROUGHNESS_DB = {
    commercial_steel: 0.000046,
    drawn_tubing:     0.0000015,
    wrought_iron:     0.000046,
    cast_iron:        0.00026,
    galvanised_iron:  0.00015,
    asphalted_iron:   0.00012,
    pvc:              0.0000015,
    hdpe:             0.000003,
    concrete_good:    0.0003,
    concrete_rough:   0.003,
    wood_stave:       0.0006,
    riveted_steel:    0.009,
    custom:           0.000046,
  };

  let _nodeCounter = 0;
  let _pipeCounter = 0;

  // ── Helpers ────────────────────────────────────────────────────────────

  function _nextNodeId() {
    _nodeCounter++;
    while (_state.nodes[`N${_nodeCounter}`]) _nodeCounter++;
    return `N${_nodeCounter}`;
  }

  function _nextPipeId() {
    _pipeCounter++;
    while (_state.pipes[`P${_pipeCounter}`]) _pipeCounter++;
    return `P${_pipeCounter}`;
  }

  function _markDirty() { _state.isDirty = true; }

  // ── Node operations ────────────────────────────────────────────────────

  function addNode(opts = {}) {
    const id = opts.id || _nextNodeId();
    if (_state.nodes[id]) {
      throw new Error(`Node '${id}' already exists`);
    }
    _state.nodes[id] = {
      id,
      x:              opts.x             ?? 0,
      y:              opts.y             ?? 0,
      elevation:      opts.elevation     ?? 0,
      demand:         opts.demand        ?? 0,
      is_reservoir:   opts.is_reservoir  ?? false,
      reservoir_head: opts.reservoir_head ?? 50,
      temperature:    opts.temperature   ?? 20,
    };
    _markDirty();
    return _state.nodes[id];
  }

  function updateNode(id, data) {
    if (!_state.nodes[id]) throw new Error(`Node '${id}' not found`);
    Object.assign(_state.nodes[id], data);
    _markDirty();
    return _state.nodes[id];
  }

  function removeNode(id) {
    if (!_state.nodes[id]) return false;
    // Remove connected pipes
    const toRemove = Object.keys(_state.pipes).filter(
      pid => _state.pipes[pid].node_from === id || _state.pipes[pid].node_to === id
    );
    toRemove.forEach(pid => delete _state.pipes[pid]);
    delete _state.nodes[id];
    _markDirty();
    return true;
  }

  // ── Pipe operations ────────────────────────────────────────────────────

  function addPipe(opts = {}) {
    const id = opts.id || _nextPipeId();
    if (_state.pipes[id]) throw new Error(`Pipe '${id}' already exists`);
    if (!_state.nodes[opts.node_from]) throw new Error(`Node '${opts.node_from}' not found`);
    if (!_state.nodes[opts.node_to])   throw new Error(`Node '${opts.node_to}' not found`);
    if (opts.node_from === opts.node_to) throw new Error('A pipe must connect two different nodes');

    const material = opts.material || 'commercial_steel';
    const roughness = (material === 'custom')
      ? (opts.roughness_m ?? 0.000046)
      : (ROUGHNESS_DB[material] ?? 0.000046);

    // Calculate length from node positions if not provided
    let length = opts.length;
    if (!length || length <= 0) {
      const nf = _state.nodes[opts.node_from];
      const nt = _state.nodes[opts.node_to];
      // Assume 1 pixel = 1 metre for auto-calc
      length = Math.max(1, Math.round(Math.hypot(nf.x - nt.x, nf.y - nt.y)));
    }

    _state.pipes[id] = {
      id,
      node_from:       opts.node_from,
      node_to:         opts.node_to,
      length:          length,
      diameter:        (opts.diameter_mm ?? 100) / 1000,   // store in metres
      roughness,
      material,
      initial_flow:    opts.initial_flow   ?? 0.001,        // m³/s
      minor_loss_K:    opts.minor_loss_K   ?? 0,
      has_pump:        opts.has_pump       ?? false,
      has_valve:       opts.has_valve      ?? false,
      heat_flux:       opts.heat_flux      ?? 0,
      fittings:        opts.fittings       ?? [],
      Q:               0,    // filled after solve
    };
    _markDirty();
    return _state.pipes[id];
  }

  function updatePipe(id, data) {
    if (!_state.pipes[id]) throw new Error(`Pipe '${id}' not found`);
    if (data.material && data.material !== 'custom') {
      data.roughness = ROUGHNESS_DB[data.material] ?? _state.pipes[id].roughness;
    }
    if (data.diameter_mm !== undefined) {
      data.diameter = data.diameter_mm / 1000;
    }
    Object.assign(_state.pipes[id], data);
    _markDirty();
    return _state.pipes[id];
  }

  function removePipe(id) {
    if (!_state.pipes[id]) return false;
    delete _state.pipes[id];
    _markDirty();
    return true;
  }

  // ── Serialisation ──────────────────────────────────────────────────────

  /**
   * Build the request payload for POST /solve/inline
   */
  function toSolvePayload() {
    const nodeList = Object.values(_state.nodes).map(n => ({
      id:             n.id,
      elevation:      n.elevation,
      external_flow:  n.demand,
      is_reservoir:   n.is_reservoir,
      reservoir_head: n.reservoir_head,
      temperature:    n.temperature,
    }));

    const pipeList = Object.values(_state.pipes).map(p => ({
      id:           p.id,
      node_from:    p.node_from,
      node_to:      p.node_to,
      length:       p.length,
      diameter:     p.diameter,
      roughness:    p.roughness,
      initial_flow: p.initial_flow,
      minor_loss_K: p.minor_loss_K,
      has_pump:     p.has_pump,
      has_valve:    p.has_valve,
      heat_flux:    p.heat_flux,
    }));

    const presets = {
      water_20c: { density: 998.2, viscosity: 0.001002, temperature: 20, vapour_pressure: 2338 },
      water_60c: { density: 983.2, viscosity: 0.000467, temperature: 60, vapour_pressure: 19940 },
      oil_sae30: { density: 882.0, viscosity: 0.08600,  temperature: 25 },
      glycerin:  { density: 1261,  viscosity: 0.9340,   temperature: 25 },
      air_20c:   { density: 1.204, viscosity: 1.825e-5, temperature: 20 },
      natural_gas:{ density: 0.717, viscosity: 1.1e-5,  temperature: 20 },
    };

    const fluidData = _state.fluid || presets[_state.fluidPreset] || presets.water_20c;

    return {
      nodes:  nodeList,
      pipes:  pipeList,
      fluid:  fluidData,
      config: _state.solverConfig,
    };
  }

  /**
   * Build payload for POST /networks (create/update)
   */
  function toNetworkPayload() {
    return {
      name:        _state.name,
      description: _state.description,
      nodes:       Object.values(_state.nodes),
      pipes:       Object.values(_state.pipes),
      fluid:       _state.fluid,
      tags:        [],
    };
  }

  /**
   * Load from API network detail response
   */
  function loadFromAPI(netData) {
    _state.id          = netData.id;
    _state.name        = netData.name;
    _state.description = netData.description || '';
    _state.nodes       = {};
    _state.pipes       = {};

    (netData.nodes || []).forEach(n => {
      _state.nodes[n.id] = {
        id:             n.id,
        x:              n.x  ?? (Object.keys(_state.nodes).length * 100 + 50),
        y:              n.y  ?? 100,
        elevation:      n.elevation       ?? 0,
        demand:         n.external_flow   ?? 0,
        is_reservoir:   n.is_reservoir    ?? false,
        reservoir_head: n.reservoir_head  ?? 50,
        temperature:    n.temperature     ?? 20,
      };
    });

    (netData.pipes || []).forEach(p => {
      _state.pipes[p.id] = {
        id:           p.id,
        node_from:    p.node_from,
        node_to:      p.node_to,
        length:       p.length,
        diameter:     p.diameter,
        roughness:    p.roughness,
        material:     p.material        || 'commercial_steel',
        initial_flow: p.initial_flow    ?? 0.001,
        minor_loss_K: p.minor_loss_K    ?? 0,
        has_pump:     p.has_pump        ?? false,
        has_valve:    p.has_valve       ?? false,
        heat_flux:    p.heat_flux       ?? 0,
        fittings:     p.fittings        ?? [],
        Q: 0,
      };
    });

    _state.isDirty = false;
    _nodeCounter = 0;
    _pipeCounter = 0;
  }

  /**
   * Load from a template apply response
   */
  function loadFromTemplate(tplData) {
    loadFromAPI({
      id:          null,
      name:        tplData.name + ' (from template)',
      description: tplData.description || '',
      nodes:       tplData.nodes || [],
      pipes:       tplData.pipes || [],
    });
    // Auto-layout nodes in a grid if no positions
    _autoLayout();
    _state.isDirty = true;
  }

  /**
   * Auto-layout nodes in a spring-like circular arrangement
   */
  function _autoLayout() {
    const nodes = Object.values(_state.nodes);
    const N = nodes.length;
    if (N === 0) return;
    const cx = 400, cy = 300, r = Math.min(250, 60 * N);
    nodes.forEach((n, i) => {
      if (!n.x || !n.y || (n.x === 0 && n.y === 0)) {
        const angle = (2 * Math.PI * i) / N - Math.PI / 2;
        n.x = Math.round(cx + r * Math.cos(angle));
        n.y = Math.round(cy + r * Math.sin(angle));
      }
    });
  }

  // ── Validation ─────────────────────────────────────────────────────────

  function validate() {
    const issues = [];
    const nodes  = Object.values(_state.nodes);
    const pipes  = Object.values(_state.pipes);

    if (nodes.length === 0) {
      issues.push({ severity: 'error', message: 'Network has no nodes.' });
    }
    if (pipes.length === 0) {
      issues.push({ severity: 'error', message: 'Network has no pipes.' });
    }

    // At least one reservoir
    const reservoirs = nodes.filter(n => n.is_reservoir);
    if (reservoirs.length === 0) {
      issues.push({ severity: 'error', message: 'No reservoir/pressure boundary node defined.' });
    }

    // Mass balance
    const totalDemand = nodes.reduce((s, n) => s + (n.demand ?? 0), 0);
    if (Math.abs(totalDemand) > 1e-4 && reservoirs.length > 0) {
      issues.push({
        severity: 'warning',
        message:  `Net demand imbalance: ${totalDemand.toFixed(4)} m³/s. Check node demands.`,
      });
    }

    // Pipe checks
    pipes.forEach(p => {
      if (p.diameter <= 0) issues.push({ severity: 'error', message: `Pipe ${p.id}: diameter must be > 0.` });
      if (p.length   <= 0) issues.push({ severity: 'error', message: `Pipe ${p.id}: length must be > 0.` });
      if (!_state.nodes[p.node_from]) issues.push({ severity: 'error', message: `Pipe ${p.id}: 'from' node ${p.node_from} not found.` });
      if (!_state.nodes[p.node_to])   issues.push({ severity: 'error', message: `Pipe ${p.id}: 'to' node ${p.node_to} not found.` });
      if (p.length / p.diameter > 10000) {
        issues.push({ severity: 'warning', message: `Pipe ${p.id}: L/D=${(p.length/p.diameter).toFixed(0)} is very large.` });
      }
    });

    // Connectivity (BFS from first reservoir)
    if (nodes.length > 0 && pipes.length > 0) {
      const adj = {};
      nodes.forEach(n => { adj[n.id] = []; });
      pipes.forEach(p => {
        adj[p.node_from]?.push(p.node_to);
        adj[p.node_to]?.push(p.node_from);
      });
      const start   = (reservoirs[0] || nodes[0]).id;
      const visited = new Set([start]);
      const queue   = [start];
      while (queue.length) {
        const curr = queue.shift();
        (adj[curr] || []).forEach(nb => {
          if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
        });
      }
      nodes.forEach(n => {
        if (!visited.has(n.id)) {
          issues.push({ severity: 'warning', message: `Node ${n.id} is disconnected from the network.` });
        }
      });
    }

    return issues;
  }

  // ── Getters / setters ──────────────────────────────────────────────────

  function getState()      { return _state; }
  function getNodes()      { return _state.nodes; }
  function getPipes()      { return _state.pipes; }
  function getNode(id)     { return _state.nodes[id]; }
  function getPipe(id)     { return _state.pipes[id]; }
  function isDirty()       { return _state.isDirty; }
  function clearDirty()    { _state.isDirty = false; }
  function setName(n)      { _state.name = n; _markDirty(); }
  function setDescription(d){ _state.description = d; _markDirty(); }
  function setFluidPreset(p){ _state.fluidPreset = p; _markDirty(); }
  function setSolverConfig(c){ Object.assign(_state.solverConfig, c); }

  function clear() {
    _state.id          = null;
    _state.name        = 'New Network';
    _state.description = '';
    _state.nodes       = {};
    _state.pipes       = {};
    _state.isDirty     = false;
    _nodeCounter = 0;
    _pipeCounter = 0;
  }

  function nodeCount() { return Object.keys(_state.nodes).length; }
  function pipeCount() { return Object.keys(_state.pipes).length; }

  function getRoughnessDB() { return ROUGHNESS_DB; }

  return {
    // Node ops
    addNode, updateNode, removeNode,
    // Pipe ops
    addPipe, updatePipe, removePipe,
    // Serialisation
    toSolvePayload, toNetworkPayload,
    loadFromAPI, loadFromTemplate,
    // Validation
    validate,
    // State
    getState, getNodes, getPipes, getNode, getPipe,
    isDirty, clearDirty, setName, setDescription,
    setFluidPreset, setSolverConfig, clear,
    nodeCount, pipeCount, getRoughnessDB,
  };

})();

window.Network = Network;
