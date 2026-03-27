// =============================================================================
// js/api.js  —  REST API client
// All communication with the FastAPI backend
// =============================================================================

'use strict';

const API = (() => {

  const BASE_URL = 'http://localhost:8000/api/v1';

  // ── Low-level fetch wrapper ──────────────────────────────────────────────

  async function _request(method, path, body = null, params = null) {
    let url = `${BASE_URL}${path}`;
    if (params) {
      const qs = Object.entries(params)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      if (qs) url += '?' + qs;
    }

    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    };
    if (body !== null) opts.body = JSON.stringify(body);

    const resp = await fetch(url, opts);

    if (!resp.ok) {
      let errMsg = `HTTP ${resp.status}`;
      try {
        const errData = await resp.json();
        errMsg = errData.detail || errData.message || errMsg;
      } catch (_) { /* ignore parse error */ }
      throw new Error(errMsg);
    }

    // Handle empty responses (204)
    if (resp.status === 204) return null;
    return resp.json();
  }

  const get    = (path, params) => _request('GET',    path, null, params);
  const post   = (path, body)   => _request('POST',   path, body);
  const put    = (path, body)   => _request('PUT',    path, body);
  const del    = (path)         => _request('DELETE', path);

  // ── Health ───────────────────────────────────────────────────────────────

  const health = {
    check:    () => get('/health'),
    detailed: () => get('/health/detailed'),
  };

  // ── Networks ─────────────────────────────────────────────────────────────

  const networks = {
    list:      (skip = 0, limit = 50, tag = null) =>
                 get('/networks', { skip, limit, tag }),
    create:    (data)  => post('/networks', data),
    getById:   (id)    => get(`/networks/${id}`),
    update:    (id, d) => put(`/networks/${id}`, d),
    delete:    (id)    => del(`/networks/${id}`),
    duplicate: (id)    => post(`/networks/${id}/duplicate`),
    topology:  (id)    => get(`/networks/${id}/topology`),
  };

  // ── Nodes ────────────────────────────────────────────────────────────────

  const nodes = {
    add:    (netId, data)        => post(`/networks/${netId}/nodes`, data),
    update: (netId, nodeId, data)=> put(`/networks/${netId}/nodes/${nodeId}`, data),
    delete: (netId, nodeId)      => del(`/networks/${netId}/nodes/${nodeId}`),
  };

  // ── Pipes ────────────────────────────────────────────────────────────────

  const pipes = {
    add:    (netId, data)        => post(`/networks/${netId}/pipes`, data),
    update: (netId, pipeId, data)=> put(`/networks/${netId}/pipes/${pipeId}`, data),
    delete: (netId, pipeId)      => del(`/networks/${netId}/pipes/${pipeId}`),
    moody:  (netId, pipeId, q)   => get(`/networks/${netId}/pipes/${pipeId}/moody`, { q }),
  };

  // ── Solver ───────────────────────────────────────────────────────────────

  const solver = {
    solve: (networkId, config) =>
      post(`/solve/${networkId}`, config),

    solveInline: (data) =>
      post('/solve/inline', data),

    moodyChart: (reMin = 1e3, reMax = 1e8, epsDValues = null, nPoints = 200) =>
      post('/moody-chart', { re_min: reMin, re_max: reMax, eps_d_values: epsDValues, n_points: nPoints }),

    darcyWeisbach: (Q, D, L, roughness, density, viscosity) =>
      get('/pipe-flow-calculators/darcy-weisbach', { Q, D, L, roughness, density, viscosity }),
  };

  // ── Materials ────────────────────────────────────────────────────────────

  const materials = {
    fluids:      ()    => get('/materials/fluids'),
    fluidById:   (id)  => get(`/materials/fluids/${id}`),
    pipeRoughness: ()  => get('/materials/pipe-roughness'),
    fittingsK:   ()    => get('/materials/fittings-k'),
  };

  // ── Results ──────────────────────────────────────────────────────────────

  const results = {
    getById:    (solveId)          => get(`/results/${solveId}`),
    visualise:  (solveId, variable, vmin = null, vmax = null) =>
                  get(`/results/${solveId}/visualise`, { variable, v_min: vmin, v_max: vmax }),
    forNetwork: (netId, limit = 10)=> get(`/networks/${netId}/results`, { limit }),
  };

  // ── Export ───────────────────────────────────────────────────────────────

  const exports_ = {
    csv:  async (solveId) => {
      const url = `${BASE_URL}/export/${solveId}/csv`;
      const resp = await fetch(url, { headers: { Accept: 'text/csv' } });
      if (!resp.ok) throw new Error(`Export CSV failed: HTTP ${resp.status}`);
      const blob = await resp.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `cfd_results_${solveId}.csv`;
      link.click();
    },
    json: async (solveId) => {
      const url = `${BASE_URL}/export/${solveId}/json`;
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) throw new Error(`Export JSON failed: HTTP ${resp.status}`);
      const blob = await resp.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `cfd_results_${solveId}.json`;
      link.click();
    },
  };

  // ── Validation ───────────────────────────────────────────────────────────

  const validation = {
    network: (data) => post('/validate/network', data),
  };

  // ── Templates ────────────────────────────────────────────────────────────

  const templates = {
    list:  ()           => get('/templates'),
    getById: (id)       => get(`/templates/${id}`),
    apply: (id, scale = 1.0) => post(`/templates/${id}/apply`, { scale_factor: scale }),
  };

  // ── History ──────────────────────────────────────────────────────────────

  const history = {
    list: (skip = 0, limit = 20) => get('/history', { skip, limit }),
  };

  // ── Info ─────────────────────────────────────────────────────────────────

  const info = {
    get: () => get('/info'),
  };

  return {
    get, post, put, del,
    health, networks, nodes, pipes, solver,
    materials, results, exports: exports_,
    validation, templates, history, info,
    BASE_URL,
  };

})();

// Make available globally
window.API = API;
