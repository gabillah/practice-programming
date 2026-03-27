/**
 * app.js — Main Application Entry Point
 * CFD Pipe-Flow Expert  ·  Frontend Module
 *
 * Responsibilities:
 *   • Boot sequence: init all modules in dependency order
 *   • View routing (SPA tab navigation)
 *   • Global AppState singleton
 *   • Keyboard shortcuts
 *   • Drag-and-drop file import
 *   • Print / screenshot helpers
 *   • Service-worker registration
 */

"use strict";

/* =========================================================================
   AppState — global state shared across modules
   ========================================================================= */

const AppState = (() => {
  let _currentView     = "editor";
  let _currentNetworkId = null;
  let _darkMode        = false;
  let _unsavedChanges  = false;
  let _ready           = false;

  return {
    get currentView()      { return _currentView; },
    get currentNetworkId() { return _currentNetworkId; },
    get darkMode()         { return _darkMode; },
    get unsavedChanges()   { return _unsavedChanges; },
    get ready()            { return _ready; },

    setView(view)             { _currentView = view; },
    setCurrentNetworkId(id)   { _currentNetworkId = id; },
    setDarkMode(v)            { _darkMode = v; },
    markDirty()               { _unsavedChanges = true; _updateTitle(); },
    markClean()               { _unsavedChanges = false; _updateTitle(); },
    setReady()                { _ready = true; }
  };

  function _updateTitle() {
    const dirty = _unsavedChanges ? "• " : "";
    document.title = `${dirty}CFD Pipe Flow Expert`;
  }
})();

/* =========================================================================
   ViewRouter — manages tab/view navigation
   ========================================================================= */

const ViewRouter = (() => {
  const VIEWS = ["editor", "results", "moody", "calculators", "docs"];

  function init() {
    // Wire tab buttons
    document.querySelectorAll("[data-view]").forEach(btn => {
      btn.addEventListener("click", e => {
        const view = e.currentTarget.dataset.view;
        navigateTo(view);
      });
    });

    // Default view
    navigateTo("editor");
  }

  function navigateTo(view) {
    if (!VIEWS.includes(view)) return;
    AppState.setView(view);

    // Update tab active states
    document.querySelectorAll("[data-view]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });

    // Show/hide view panels
    document.querySelectorAll(".view-panel").forEach(panel => {
      panel.classList.toggle("active", panel.id === `view-${view}`);
    });

    // Lazy-init modules on first visit
    switch (view) {
      case "moody":
        if (!MoodyChart._initialised) {
          MoodyUI.init();
          MoodyChart._initialised = true;
        }
        break;
      case "docs":
        if (!DocsRenderer._initialised) {
          DocsRenderer.init();
          DocsRenderer._initialised = true;
        }
        break;
      case "calculators":
        if (!CalculatorUI._initialised) {
          CalculatorUI.init();
          CalculatorUI._initialised = true;
        }
        break;
      case "results":
        // Ensure legend is current
        if (window.SolverState?.hasSolution) {
          LegendRenderer?.update();
        }
        break;
    }
  }

  return { init, navigateTo };
})();

/* =========================================================================
   NetworkSaveLoad — save / load networks via API
   ========================================================================= */

const NetworkSaveLoad = (() => {

  async function saveNetwork() {
    const nm  = window.NetworkManager;
    const net = nm.getNetwork();

    if (!net.nodes.length) {
      window.UI?.toast("Nothing to save — add some nodes first", "warning");
      return;
    }

    try {
      let result;
      if (AppState.currentNetworkId) {
        // Update existing
        result = await window.ApiClient.updateNetwork(AppState.currentNetworkId, {
          name:        net.name || "Untitled Network",
          description: net.description || "",
          nodes:       net.nodes,
          pipes:       net.pipes
        });
        window.UI?.toast("Network saved", "success");
      } else {
        // Create new
        result = await window.ApiClient.createNetwork({
          name:        net.name || "Untitled Network",
          description: net.description || "",
          nodes:       net.nodes,
          pipes:       net.pipes
        });
        AppState.setCurrentNetworkId(result.network_id ?? result.id);
        window.UI?.toast("Network created and saved", "success");
      }
      AppState.markClean();
      _refreshNetworkList();
    } catch (err) {
      window.UI?.toast(`Save failed: ${err.message}`, "error");
      console.error(err);
    }
  }

  async function loadNetwork(networkId) {
    try {
      const net = await window.ApiClient.getNetwork(networkId);
      window.NetworkManager.loadFromAPI(net);
      AppState.setCurrentNetworkId(networkId);
      AppState.markClean();
      window.CanvasRenderer?.fitToContent();
      window.UI?.toast(`Loaded: ${net.name}`, "success");
    } catch (err) {
      window.UI?.toast(`Load failed: ${err.message}`, "error");
    }
  }

  async function newNetwork() {
    if (AppState.unsavedChanges) {
      const ok = await window.UI?.confirm("Unsaved changes will be lost. Continue?");
      if (!ok) return;
    }
    window.NetworkManager.reset();
    AppState.setCurrentNetworkId(null);
    AppState.markClean();
    window.SolverState?.clear();
    window.CanvasRenderer?.redraw();
    window.UI?.toast("New network started", "info");
  }

  async function _refreshNetworkList() {
    const container = document.getElementById("saved-networks-list");
    if (!container) return;

    try {
      const resp = await window.ApiClient.listNetworks();
      const nets = resp.networks ?? resp;

      if (!nets.length) {
        container.innerHTML = "<p class='muted'>No saved networks</p>";
        return;
      }

      container.innerHTML = nets.map(n => `
        <div class="network-list-item" data-id="${n.network_id ?? n.id}">
          <div class="net-name">${n.name}</div>
          <div class="net-meta">${n.node_count} nodes · ${n.pipe_count} pipes</div>
          <div class="net-actions">
            <button class="btn-sm" onclick="NetworkSaveLoad.loadNetwork('${n.network_id ?? n.id}')">Load</button>
            <button class="btn-sm btn-danger" onclick="NetworkSaveLoad.deleteNetwork('${n.network_id ?? n.id}')">✕</button>
          </div>
        </div>
      `).join("");
    } catch (e) {
      container.innerHTML = "<p class='muted'>Could not load list</p>";
    }
  }

  async function deleteNetwork(id) {
    const ok = await window.UI?.confirm("Delete this network?");
    if (!ok) return;
    try {
      await window.ApiClient.deleteNetwork(id);
      if (AppState.currentNetworkId === id) {
        AppState.setCurrentNetworkId(null);
        window.NetworkManager.reset();
        window.CanvasRenderer?.redraw();
      }
      _refreshNetworkList();
      window.UI?.toast("Deleted", "success");
    } catch (e) {
      window.UI?.toast(`Delete failed: ${e.message}`, "error");
    }
  }

  async function importFromJSON(file) {
    try {
      const text   = await file.text();
      const data   = JSON.parse(text);
      window.NetworkManager.loadFromAPI(data);
      AppState.setCurrentNetworkId(null);
      AppState.markDirty();
      window.CanvasRenderer?.fitToContent();
      window.UI?.toast(`Imported: ${data.name ?? file.name}`, "success");
    } catch (e) {
      window.UI?.toast(`Import failed: ${e.message}`, "error");
    }
  }

  async function exportToJSON() {
    const nm  = window.NetworkManager;
    const net = nm.getNetwork();
    const blob = new Blob([JSON.stringify(net, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `${net.name || "network"}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.UI?.toast("Network exported as JSON", "success");
  }

  return { saveNetwork, loadNetwork, newNetwork, deleteNetwork, importFromJSON, exportToJSON, refreshList: _refreshNetworkList };
})();

/* =========================================================================
   KeyboardShortcuts — global keyboard handler
   ========================================================================= */

const KeyboardShortcuts = (() => {

  const SHORTCUTS = {
    "ctrl+s":     () => NetworkSaveLoad.saveNetwork(),
    "ctrl+n":     () => NetworkSaveLoad.newNetwork(),
    "ctrl+z":     () => window.NetworkManager?.undo(),
    "ctrl+y":     () => window.NetworkManager?.redo(),
    "ctrl+shift+z": () => window.NetworkManager?.redo(),
    "ctrl+a":     () => window.CanvasRenderer?.selectAll(),
    "Delete":     () => window.CanvasRenderer?.deleteSelected(),
    "Backspace":  () => window.CanvasRenderer?.deleteSelected(),
    "Escape":     () => window.CanvasRenderer?.clearSelection(),
    "f":          () => window.CanvasRenderer?.fitToContent(),
    "n":          () => window.CanvasRenderer?.setTool("node"),
    "p":          () => window.CanvasRenderer?.setTool("pipe"),
    "s":          () => window.CanvasRenderer?.setTool("select"),
    "Enter":      () => SolverController?.solve(AppState.currentNetworkId),
    "1":          () => ViewRouter.navigateTo("editor"),
    "2":          () => ViewRouter.navigateTo("results"),
    "3":          () => ViewRouter.navigateTo("moody"),
    "4":          () => ViewRouter.navigateTo("calculators"),
    "5":          () => ViewRouter.navigateTo("docs"),
    "?":          () => ViewRouter.navigateTo("docs")
  };

  function init() {
    document.addEventListener("keydown", e => {
      // Skip when inside a text input
      if (["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;

      const parts = [];
      if (e.ctrlKey || e.metaKey) parts.push("ctrl");
      if (e.shiftKey)             parts.push("shift");
      if (e.altKey)               parts.push("alt");
      parts.push(e.key);
      const combo = parts.join("+");

      if (SHORTCUTS[combo]) {
        e.preventDefault();
        SHORTCUTS[combo]();
      }
    });
  }

  return { init };
})();

/* =========================================================================
   DragDropImport — drop JSON network files onto the canvas
   ========================================================================= */

const DragDropImport = (() => {

  function init() {
    const canvas = document.getElementById("main-canvas");
    if (!canvas) return;

    canvas.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      canvas.classList.add("drag-over");
    });

    canvas.addEventListener("dragleave", () => {
      canvas.classList.remove("drag-over");
    });

    canvas.addEventListener("drop", e => {
      e.preventDefault();
      canvas.classList.remove("drag-over");
      const file = e.dataTransfer.files[0];
      if (!file) return;
      if (file.name.endsWith(".json")) {
        NetworkSaveLoad.importFromJSON(file);
      } else {
        window.UI?.toast("Only .json network files are supported", "warning");
      }
    });
  }

  return { init };
})();

/* =========================================================================
   TemplateLoader — load example templates from API
   ========================================================================= */

const TemplateLoader = (() => {

  async function loadTemplates() {
    const container = document.getElementById("template-list");
    if (!container) return;

    try {
      const resp = await window.ApiClient.listTemplates();
      const templates = resp.templates ?? resp;

      container.innerHTML = templates.map(t => `
        <div class="template-card" onclick="TemplateLoader.applyTemplate('${t.id}')">
          <div class="tmpl-name">${t.name}</div>
          <div class="tmpl-desc">${t.description ?? ""}</div>
          <div class="tmpl-meta">${t.node_count} nodes · ${t.pipe_count} pipes</div>
        </div>
      `).join("");
    } catch (e) {
      container.innerHTML = "<p class='muted'>Templates unavailable</p>";
    }
  }

  async function applyTemplate(id) {
    try {
      const resp = await window.ApiClient.applyTemplate(id);
      const networkId = resp.network_id ?? resp.id;
      await NetworkSaveLoad.loadNetwork(networkId);
      window.UI?.modal(null, null);  // close modal
      window.UI?.toast("Template loaded", "success");
    } catch (e) {
      window.UI?.toast(`Template load failed: ${e.message}`, "error");
    }
  }

  return { loadTemplates, applyTemplate };
})();

/* =========================================================================
   PrintHelper — screenshot and print
   ========================================================================= */

const PrintHelper = (() => {

  function screenshotCanvas() {
    const canvas = document.getElementById("main-canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a   = document.createElement("a");
    a.href    = url;
    a.download = `cfd_network_${Date.now()}.png`;
    a.click();
    window.UI?.toast("Canvas saved as PNG", "success");
  }

  function print() {
    window.print();
  }

  return { screenshotCanvas, print };
})();

/* =========================================================================
   Notifications — real-time server-sent events (if backend supports it)
   ========================================================================= */

const SSEClient = (() => {
  let _es = null;

  function connect() {
    try {
      _es = new EventSource("/api/v1/solvers/stream");
      _es.addEventListener("solve_progress", e => {
        const data = JSON.parse(e.data);
        const bar  = document.getElementById("solve-progress-bar");
        if (bar) bar.style.width = `${data.pct ?? 0}%`;
      });
      _es.addEventListener("solve_complete", e => {
        const data = JSON.parse(e.data);
        window.UI?.toast(`Solve complete (server): ${data.network_id}`, "success");
      });
    } catch (_) {
      // SSE not available; ignore
    }
  }

  function disconnect() {
    _es?.close();
    _es = null;
  }

  return { connect, disconnect };
})();

/* =========================================================================
   Boot sequence
   ========================================================================= */

async function _boot() {
  // 1. Apply theme (light mode default)
  document.documentElement.setAttribute("data-theme", "light");

  // 2. Wire DOM shortcuts / navigation
  ViewRouter.init();
  KeyboardShortcuts.init();
  DragDropImport.init();
  SolverUI.init();

  // 3. Wire toolbar buttons
  document.getElementById("btn-save"  )?.addEventListener("click", NetworkSaveLoad.saveNetwork);
  document.getElementById("btn-new"   )?.addEventListener("click", NetworkSaveLoad.newNetwork);
  document.getElementById("btn-export-net")?.addEventListener("click", NetworkSaveLoad.exportToJSON);
  document.getElementById("btn-screenshot")?.addEventListener("click", PrintHelper.screenshotCanvas);

  document.getElementById("btn-templates")?.addEventListener("click", async () => {
    await TemplateLoader.loadTemplates();
    window.UI?.modal("Network Templates",
      `<div id="template-list"><p class="muted">Loading…</p></div>`, true);
    await TemplateLoader.loadTemplates();
  });

  // 4. Load saved network list in sidebar
  await NetworkSaveLoad.refreshList().catch(() => {});

  // 5. Health check
  try {
    const health = await window.ApiClient.health();
    console.log("Backend health:", health);
  } catch (e) {
    window.UI?.toast("Backend unreachable — some features unavailable", "warning");
  }

  // 6. Connect SSE (optional)
  SSEClient.connect();

  // 7. Mark ready
  AppState.setReady();

  // 8. Hide splash / loading screen
  const splash = document.getElementById("loading-splash");
  if (splash) {
    splash.style.opacity = "0";
    setTimeout(() => splash.remove(), 400);
  }

  console.log("CFD Pipe Flow Expert — ready ✔");
}

/* =========================================================================
   DOM ready → boot
   ========================================================================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _boot);
} else {
  _boot();
}

/* =========================================================================
   Export
   ========================================================================= */

window.AppState        = AppState;
window.ViewRouter      = ViewRouter;
window.NetworkSaveLoad = NetworkSaveLoad;
window.KeyboardShortcuts = KeyboardShortcuts;
window.TemplateLoader  = TemplateLoader;
window.PrintHelper     = PrintHelper;
