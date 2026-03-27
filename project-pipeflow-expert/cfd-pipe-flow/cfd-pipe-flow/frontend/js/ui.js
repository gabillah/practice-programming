/**
 * ui.js — UI helpers: modals, toasts, panels, tabs, spinners
 * CFD Pipe-Flow Expert  |  Light-mode SPA
 */

"use strict";

/* =========================================================
   TOAST NOTIFICATIONS
   ========================================================= */

const Toast = (() => {
  let _container = null;

  function _getContainer() {
    if (!_container) {
      _container = document.createElement("div");
      _container.id = "toast-container";
      _container.style.cssText = `
        position:fixed;top:1.25rem;right:1.25rem;z-index:9999;
        display:flex;flex-direction:column;gap:.5rem;
        pointer-events:none;
      `;
      document.body.appendChild(_container);
    }
    return _container;
  }

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {"info"|"success"|"warning"|"error"} type
   * @param {number} duration  ms before auto-dismiss (0 = sticky)
   */
  function show(message, type = "info", duration = 4000) {
    const colors = {
      info:    { bg: "#e0f0ff", border: "#5b9bd5", icon: "ℹ️" },
      success: { bg: "#e6f9f0", border: "#27ae60", icon: "✅" },
      warning: { bg: "#fff8e1", border: "#f39c12", icon: "⚠️" },
      error:   { bg: "#fdecea", border: "#e74c3c", icon: "❌" },
    };
    const c = colors[type] || colors.info;

    const toast = document.createElement("div");
    toast.style.cssText = `
      background:${c.bg};border:1px solid ${c.border};border-radius:6px;
      padding:.65rem 1rem;font-size:.85rem;max-width:340px;
      display:flex;align-items:flex-start;gap:.5rem;
      box-shadow:0 2px 8px rgba(0,0,0,.12);
      pointer-events:all;cursor:pointer;
      animation:toast-in .2s ease;
      color:#1a1a2e;line-height:1.4;
    `;

    if (!document.getElementById("toast-style")) {
      const style = document.createElement("style");
      style.id = "toast-style";
      style.textContent = `
        @keyframes toast-in{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
        @keyframes toast-out{to{opacity:0;transform:translateX(20px)}}
      `;
      document.head.appendChild(style);
    }

    toast.innerHTML = `<span style="font-size:1.1em;flex-shrink:0">${c.icon}</span>
      <span style="flex:1">${escapeHtml(message)}</span>
      <span style="flex-shrink:0;color:#999;font-size:1rem;margin-left:.25rem">×</span>`;

    toast.addEventListener("click", () => _dismiss(toast));
    _getContainer().appendChild(toast);

    if (duration > 0) {
      setTimeout(() => _dismiss(toast), duration);
    }
    return toast;
  }

  function _dismiss(toast) {
    toast.style.animation = "toast-out .2s ease forwards";
    setTimeout(() => toast.remove(), 200);
  }

  return { show };
})();


/* =========================================================
   MODAL SYSTEM
   ========================================================= */

const Modal = (() => {
  const _stack = [];

  function _buildOverlay() {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.45);
      z-index:8000;display:flex;align-items:center;justify-content:center;
      animation:fade-in .15s ease;
    `;
    if (!document.getElementById("modal-style")) {
      const style = document.createElement("style");
      style.id = "modal-style";
      style.textContent = `
        @keyframes fade-in{from{opacity:0}to{opacity:1}}
        @keyframes slide-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        .modal-box{animation:slide-up .18s ease;}
      `;
      document.head.appendChild(style);
    }
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) Modal.close();
    });
    return overlay;
  }

  /**
   * Open a modal dialog.
   * @param {object} opts
   * @param {string} opts.title
   * @param {string|HTMLElement} opts.body
   * @param {Array<{label:string,class:string,action:function}>} opts.buttons
   * @param {string} opts.width  CSS width e.g. "520px"
   * @returns {HTMLElement} overlay element
   */
  function open({ title = "", body = "", buttons = [], width = "480px" } = {}) {
    const overlay = _buildOverlay();

    const box = document.createElement("div");
    box.className = "modal-box";
    box.style.cssText = `
      background:#fff;border-radius:10px;width:${width};max-width:96vw;
      max-height:88vh;display:flex;flex-direction:column;
      box-shadow:0 8px 40px rgba(0,0,0,.2);overflow:hidden;
    `;

    // Header
    const header = document.createElement("div");
    header.style.cssText = `
      padding:.9rem 1.25rem;border-bottom:1px solid #e8eaf6;
      display:flex;align-items:center;justify-content:space-between;
      flex-shrink:0;
    `;
    header.innerHTML = `
      <h3 style="margin:0;font-size:1rem;color:#1a1a2e">${escapeHtml(title)}</h3>
      <button id="modal-close-btn" style="
        background:none;border:none;font-size:1.4rem;cursor:pointer;
        color:#888;line-height:1;padding:0 .25rem;
      ">×</button>
    `;
    header.querySelector("#modal-close-btn").addEventListener("click", Modal.close);

    // Body
    const bodyEl = document.createElement("div");
    bodyEl.style.cssText = `padding:1.25rem;overflow-y:auto;flex:1;`;
    if (typeof body === "string") {
      bodyEl.innerHTML = body;
    } else {
      bodyEl.appendChild(body);
    }

    // Footer
    let footer = null;
    if (buttons.length) {
      footer = document.createElement("div");
      footer.style.cssText = `
        padding:.75rem 1.25rem;border-top:1px solid #e8eaf6;
        display:flex;gap:.5rem;justify-content:flex-end;flex-shrink:0;
      `;
      buttons.forEach(({ label, cls = "btn-secondary", action }) => {
        const btn = document.createElement("button");
        btn.className = `btn ${cls}`;
        btn.textContent = label;
        btn.addEventListener("click", () => {
          if (action) action(overlay, box);
        });
        footer.appendChild(btn);
      });
    }

    box.appendChild(header);
    box.appendChild(bodyEl);
    if (footer) box.appendChild(footer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    _stack.push(overlay);

    // Trap focus
    setTimeout(() => {
      const first = box.querySelector("input,select,textarea,button");
      if (first) first.focus();
    }, 50);

    return overlay;
  }

  function close() {
    const top = _stack.pop();
    if (top) top.remove();
  }

  function closeAll() {
    while (_stack.length) _stack.pop().remove();
  }

  /** Shortcut: confirm dialog */
  function confirm(message, onConfirm, onCancel) {
    open({
      title: "Confirm",
      body: `<p style="margin:0;color:#444">${escapeHtml(message)}</p>`,
      buttons: [
        {
          label: "Cancel",
          cls: "btn-secondary",
          action: (ov) => { ov.remove(); _stack.pop(); if (onCancel) onCancel(); }
        },
        {
          label: "Confirm",
          cls: "btn-danger",
          action: (ov) => { ov.remove(); _stack.pop(); onConfirm(); }
        },
      ],
    });
  }

  /** Shortcut: input prompt */
  function prompt(message, defaultValue = "", onOk, onCancel) {
    const inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.value = defaultValue;
    inputEl.style.cssText = `
      width:100%;box-sizing:border-box;padding:.5rem .75rem;
      border:1px solid #ccc;border-radius:5px;font-size:.9rem;margin-top:.75rem;
    `;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<p style="margin:0 0 .5rem;color:#444">${escapeHtml(message)}</p>`;
    wrapper.appendChild(inputEl);

    open({
      title: "Input",
      body: wrapper,
      buttons: [
        {
          label: "Cancel",
          cls: "btn-secondary",
          action: (ov) => { ov.remove(); _stack.pop(); if (onCancel) onCancel(); }
        },
        {
          label: "OK",
          cls: "btn-primary",
          action: (ov) => { ov.remove(); _stack.pop(); if (onOk) onOk(inputEl.value); }
        },
      ],
    });
    setTimeout(() => { inputEl.focus(); inputEl.select(); }, 80);
  }

  return { open, close, closeAll, confirm, prompt };
})();


/* =========================================================
   TABS
   ========================================================= */

/**
 * Initialise a tab group.
 * @param {string|HTMLElement} containerSel  Container with [data-tab] and [data-panel]
 */
function initTabs(containerSel) {
  const container = typeof containerSel === "string"
    ? document.querySelector(containerSel) : containerSel;
  if (!container) return;

  const tabs   = [...container.querySelectorAll("[data-tab]")];
  const panels = [...container.querySelectorAll("[data-panel]")];

  function activate(tabName) {
    tabs.forEach(t => {
      const active = t.dataset.tab === tabName;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", active);
    });
    panels.forEach(p => {
      const show = p.dataset.panel === tabName;
      p.style.display = show ? "" : "none";
    });
  }

  tabs.forEach(t => {
    t.addEventListener("click", () => activate(t.dataset.tab));
  });

  // Activate first tab
  if (tabs.length) activate(tabs[0].dataset.tab);
}


/* =========================================================
   COLLAPSIBLE SECTIONS
   ========================================================= */

function initCollapsibles(root = document) {
  root.querySelectorAll("[data-collapsible]").forEach(trigger => {
    const targetId = trigger.dataset.collapsible;
    const target   = document.getElementById(targetId);
    if (!target) return;

    trigger.style.cursor = "pointer";
    trigger.addEventListener("click", () => {
      const open = target.style.display !== "none";
      target.style.display = open ? "none" : "";
      trigger.classList.toggle("collapsed", open);
      const icon = trigger.querySelector(".collapse-icon");
      if (icon) icon.textContent = open ? "▸" : "▾";
    });
  });
}


/* =========================================================
   SPINNER / LOADING OVERLAY
   ========================================================= */

const Spinner = (() => {
  let _overlay = null;

  if (!document.getElementById("spinner-style")) {
    const style = document.createElement("style");
    style.id = "spinner-style";
    style.textContent = `
      @keyframes spin{to{transform:rotate(360deg)}}
      .spinner-circle{
        width:44px;height:44px;border-radius:50%;
        border:4px solid #e0e0e0;
        border-top-color:#5b9bd5;
        animation:spin .7s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }

  function show(msg = "Processing…") {
    if (_overlay) return;
    _overlay = document.createElement("div");
    _overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(255,255,255,.7);
      z-index:9000;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:1rem;
    `;
    _overlay.innerHTML = `
      <div class="spinner-circle"></div>
      <span style="font-size:.9rem;color:#555;font-weight:500">${escapeHtml(msg)}</span>
    `;
    document.body.appendChild(_overlay);
  }

  function hide() {
    if (_overlay) { _overlay.remove(); _overlay = null; }
  }

  return { show, hide };
})();


/* =========================================================
   PROGRESS BAR
   ========================================================= */

const ProgressBar = (() => {
  let _bar = null;
  let _timer = null;

  function _ensure() {
    if (_bar) return;
    _bar = document.createElement("div");
    _bar.style.cssText = `
      position:fixed;top:0;left:0;height:3px;width:0%;
      background:linear-gradient(90deg,#5b9bd5,#27ae60);
      z-index:9999;transition:width .2s ease;
      box-shadow:0 0 6px rgba(91,155,213,.5);
    `;
    document.body.appendChild(_bar);
  }

  function start() {
    _ensure();
    let pct = 0;
    _bar.style.width = "5%";
    _timer = setInterval(() => {
      pct = Math.min(pct + Math.random() * 10, 85);
      _bar.style.width = pct + "%";
    }, 300);
  }

  function finish() {
    if (!_bar) return;
    clearInterval(_timer);
    _bar.style.width = "100%";
    setTimeout(() => {
      _bar.style.opacity = "0";
      setTimeout(() => { if (_bar) { _bar.remove(); _bar = null; } }, 300);
    }, 300);
  }

  function set(pct) {
    _ensure();
    clearInterval(_timer);
    _bar.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }

  return { start, finish, set };
})();


/* =========================================================
   SIDEBAR TOGGLE (responsive)
   ========================================================= */

function initSidebarToggles() {
  document.querySelectorAll("[data-sidebar-toggle]").forEach(btn => {
    const targetId = btn.dataset.sidebarToggle;
    const sidebar  = document.getElementById(targetId);
    if (!sidebar) return;

    btn.addEventListener("click", () => {
      const open = sidebar.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      btn.textContent = open ? "✕" : "☰";
    });
  });
}


/* =========================================================
   TOOLTIP
   ========================================================= */

let _tooltipEl = null;

function _ensureTooltip() {
  if (_tooltipEl) return;
  _tooltipEl = document.createElement("div");
  _tooltipEl.id = "global-tooltip";
  _tooltipEl.style.cssText = `
    position:fixed;background:#2c3e50;color:#fff;
    font-size:.78rem;padding:.3rem .6rem;border-radius:4px;
    pointer-events:none;z-index:9998;display:none;
    box-shadow:0 2px 6px rgba(0,0,0,.2);max-width:240px;line-height:1.4;
  `;
  document.body.appendChild(_tooltipEl);
}

function showTooltip(anchorEl, text) {
  _ensureTooltip();
  const rect = anchorEl.getBoundingClientRect();
  _tooltipEl.textContent = text;
  _tooltipEl.style.display = "block";
  const tw = _tooltipEl.offsetWidth;
  const th = _tooltipEl.offsetHeight;
  let left = rect.left + rect.width / 2 - tw / 2;
  let top  = rect.top - th - 6;
  if (top < 4) top = rect.bottom + 6;
  left = Math.max(4, Math.min(left, window.innerWidth - tw - 4));
  _tooltipEl.style.left = left + "px";
  _tooltipEl.style.top  = top  + "px";
}

function hideTooltip() {
  if (_tooltipEl) _tooltipEl.style.display = "none";
}

function initTooltips(root = document) {
  root.querySelectorAll("[data-tooltip]").forEach(el => {
    el.addEventListener("mouseenter", () => showTooltip(el, el.dataset.tooltip));
    el.addEventListener("mouseleave", hideTooltip);
    el.addEventListener("focus",      () => showTooltip(el, el.dataset.tooltip));
    el.addEventListener("blur",       hideTooltip);
  });
}


/* =========================================================
   DROPDOWN MENU
   ========================================================= */

function initDropdowns(root = document) {
  root.querySelectorAll(".dropdown").forEach(dropdown => {
    const trigger = dropdown.querySelector(".dropdown-trigger");
    const menu    = dropdown.querySelector(".dropdown-menu");
    if (!trigger || !menu) return;

    menu.style.display = "none";

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = menu.style.display !== "none";
      // Close all other dropdowns
      document.querySelectorAll(".dropdown-menu").forEach(m => {
        m.style.display = "none";
      });
      menu.style.display = isOpen ? "none" : "block";
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu").forEach(m => {
      m.style.display = "none";
    });
  });
}


/* =========================================================
   FORM HELPERS
   ========================================================= */

/**
 * Read all named inputs from a form element into a plain object.
 */
function formToObject(formEl) {
  const data = {};
  new FormData(formEl).forEach((val, key) => {
    const input = formEl.elements[key];
    if (!input) { data[key] = val; return; }
    if (input.type === "checkbox") { data[key] = input.checked; return; }
    if (input.type === "number" || input.dataset.type === "number") {
      data[key] = parseFloat(val);
    } else {
      data[key] = val;
    }
  });
  return data;
}

/**
 * Populate a form from a plain object.
 */
function objectToForm(formEl, obj) {
  Object.entries(obj).forEach(([key, val]) => {
    const el = formEl.elements[key];
    if (!el) return;
    if (el.type === "checkbox") { el.checked = !!val; }
    else { el.value = val ?? ""; }
  });
}

/**
 * Simple client-side form validation.
 * Returns { valid, errors }.
 */
function validateForm(formEl) {
  const errors = [];
  formEl.querySelectorAll("[required]").forEach(el => {
    if (!el.value.trim()) {
      const label = formEl.querySelector(`label[for="${el.id}"]`);
      errors.push(`${label ? label.textContent : el.name || el.id} is required.`);
      el.classList.add("input-error");
    } else {
      el.classList.remove("input-error");
    }
  });
  formEl.querySelectorAll("[data-min]").forEach(el => {
    const min = parseFloat(el.dataset.min);
    if (parseFloat(el.value) < min) {
      errors.push(`${el.name} must be ≥ ${min}.`);
      el.classList.add("input-error");
    }
  });
  formEl.querySelectorAll("[data-max]").forEach(el => {
    const max = parseFloat(el.dataset.max);
    if (parseFloat(el.value) > max) {
      errors.push(`${el.name} must be ≤ ${max}.`);
      el.classList.add("input-error");
    }
  });
  return { valid: errors.length === 0, errors };
}


/* =========================================================
   NUMBER FORMATTING
   ========================================================= */

function fmt(value, decimals = 4, unit = "") {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const formatted = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return unit ? `${formatted} ${unit}` : formatted;
}

function fmtSci(value, sig = 4) {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return Number(value).toExponential(sig - 1);
}

function fmtPct(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}


/* =========================================================
   COLOUR UTILITIES (CFD result colouring)
   ========================================================= */

/**
 * Jet colormap: returns [r,g,b] 0-255 for t ∈ [0,1].
 */
function jetColor(t) {
  t = Math.max(0, Math.min(1, t));
  const r = Math.round(255 * Math.min(4 * t - 1.5, -4 * t + 4.5, 1, Math.max(0, 4 * t - 0.5)));
  const g = Math.round(255 * Math.min(4 * t - 0.5, -4 * t + 3.5, 1, Math.max(0, 4 * t + 0.5 - 2)));
  const b = Math.round(255 * Math.min(4 * t + 0.5, -4 * t + 2.5, 1, Math.max(0, -4 * t + 1.5)));
  return [r, g, b];
}

function jetCss(t) {
  const [r, g, b] = jetColor(t);
  return `rgb(${r},${g},${b})`;
}

/**
 * Map a value to a CSS colour within a range using jet colormap.
 */
function valueToColor(value, min, max) {
  if (max === min) return jetCss(0.5);
  const t = (value - min) / (max - min);
  return jetCss(t);
}

/**
 * Build an SVG gradient legend.
 * @param {HTMLElement} container
 * @param {number} min
 * @param {number} max
 * @param {string} label
 */
function renderColorLegend(container, min, max, label = "") {
  const steps = 64;
  const w = 200, h = 20;

  let svgGrad = `<defs><linearGradient id="lg" x1="0" x2="1" y1="0" y2="0">`;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [r, g, b] = jetColor(t);
    svgGrad += `<stop offset="${(t * 100).toFixed(1)}%" stop-color="rgb(${r},${g},${b})"/>`;
  }
  svgGrad += `</linearGradient></defs>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h + 30}">
    ${svgGrad}
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#lg)" rx="3"/>
    <text x="0"   y="${h + 14}" font-size="11" fill="#333">${fmt(min, 2)}</text>
    <text x="${w/2}" y="${h + 14}" font-size="11" fill="#333" text-anchor="middle">${label}</text>
    <text x="${w}" y="${h + 14}" font-size="11" fill="#333" text-anchor="end">${fmt(max, 2)}</text>
  </svg>`;

  container.innerHTML = svg;
}


/* =========================================================
   TABLE BUILDER
   ========================================================= */

/**
 * Build a sortable HTML table from data.
 * @param {string[]} columns   Header names
 * @param {string[]} keys      Object keys corresponding to columns
 * @param {object[]} rows      Data rows
 * @param {object}   opts
 * @param {function} opts.onRowClick
 * @param {object}   opts.formatters  key → function(val, row) → string
 */
function buildTable(columns, keys, rows, opts = {}) {
  const { onRowClick, formatters = {}, highlight = null } = opts;

  const table = document.createElement("table");
  table.className = "data-table";
  table.style.cssText = `width:100%;border-collapse:collapse;font-size:.83rem;`;

  // Head
  const thead = table.createTHead();
  const hr    = thead.insertRow();
  columns.forEach((col, i) => {
    const th = document.createElement("th");
    th.textContent = col;
    th.dataset.key = keys[i];
    th.style.cssText = `
      padding:.45rem .65rem;background:#f0f4f8;border:1px solid #dde3ec;
      text-align:left;font-weight:600;color:#1a1a2e;cursor:pointer;
      white-space:nowrap;user-select:none;
    `;
    th.addEventListener("click", () => _sortTable(table, keys[i], rows, keys, formatters, opts));
    hr.appendChild(th);
  });

  // Body
  _fillBody(table, rows, keys, formatters, opts);

  table._sortKey = null;
  table._sortDir = 1;

  return table;
}

function _fillBody(table, rows, keys, formatters, opts) {
  const { onRowClick, highlight } = opts;
  let tbody = table.querySelector("tbody");
  if (tbody) tbody.remove();
  tbody = table.createTBody();

  rows.forEach((row, idx) => {
    const tr = tbody.insertRow();
    tr.style.background = idx % 2 === 0 ? "#fff" : "#f8f9fc";
    if (highlight && highlight(row)) tr.style.background = "#fffde7";
    if (onRowClick) {
      tr.style.cursor = "pointer";
      tr.addEventListener("click", () => onRowClick(row, tr));
      tr.addEventListener("mouseenter", () => tr.style.background = "#e8f0fe");
      tr.addEventListener("mouseleave", () => {
        tr.style.background = idx % 2 === 0 ? "#fff" : "#f8f9fc";
      });
    }
    keys.forEach(key => {
      const td = tr.insertCell();
      const val = row[key];
      td.innerHTML = formatters[key] ? formatters[key](val, row) : (val ?? "—");
      td.style.cssText = `padding:.4rem .65rem;border:1px solid #eee;color:#333;`;
    });
  });
}

function _sortTable(table, key, rows, keys, formatters, opts) {
  if (table._sortKey === key) {
    table._sortDir *= -1;
  } else {
    table._sortKey = key;
    table._sortDir = 1;
  }
  const sorted = [...rows].sort((a, b) => {
    const av = a[key], bv = b[key];
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number") return (av - bv) * table._sortDir;
    return String(av).localeCompare(String(bv)) * table._sortDir;
  });
  // Update sort indicator
  table.querySelectorAll("th").forEach(th => {
    th.textContent = th.textContent.replace(/ [▲▼]$/, "");
    if (th.dataset.key === key) {
      th.textContent += table._sortDir === 1 ? " ▲" : " ▼";
    }
  });
  _fillBody(table, sorted, keys, formatters, opts);
}


/* =========================================================
   PANEL RESIZE HANDLE
   ========================================================= */

/**
 * Make a divider element resize two adjacent panels horizontally.
 */
function initHorizontalResize(dividerEl, leftEl, rightEl, minLeft = 180, minRight = 180) {
  let dragging = false;
  let startX, startLeftW, startRightW;

  dividerEl.style.cursor = "col-resize";
  dividerEl.style.userSelect = "none";

  dividerEl.addEventListener("mousedown", (e) => {
    dragging   = true;
    startX     = e.clientX;
    startLeftW = leftEl.offsetWidth;
    startRightW = rightEl.offsetWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const newLeft  = Math.max(minLeft,  startLeftW  + dx);
    const newRight = Math.max(minRight, startRightW - dx);
    leftEl.style.width  = newLeft  + "px";
    leftEl.style.flex   = "none";
    rightEl.style.width = newRight + "px";
    rightEl.style.flex  = "none";
  });

  document.addEventListener("mouseup", () => {
    if (dragging) {
      dragging = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  });
}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

const Shortcuts = (() => {
  const _map = new Map();

  document.addEventListener("keydown", (e) => {
    // Skip if typing in an input
    if (["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;

    const key = [
      e.ctrlKey  ? "ctrl"  : "",
      e.metaKey  ? "meta"  : "",
      e.altKey   ? "alt"   : "",
      e.shiftKey ? "shift" : "",
      e.key.toLowerCase(),
    ].filter(Boolean).join("+");

    const handler = _map.get(key);
    if (handler) { e.preventDefault(); handler(e); }
  });

  function register(combo, handler) { _map.set(combo.toLowerCase(), handler); }
  function unregister(combo)        { _map.delete(combo.toLowerCase()); }

  return { register, unregister };
})();


/* =========================================================
   CLIPBOARD
   ========================================================= */

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    Toast.show("Copied to clipboard", "success", 2000);
  } catch {
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    Toast.show("Copied to clipboard", "success", 2000);
  }
}


/* =========================================================
   SECURITY HELPER
   ========================================================= */

function escapeHtml(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   DEBOUNCE / THROTTLE
   ========================================================= */

function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function throttle(fn, interval = 100) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= interval) { last = now; fn(...args); }
  };
}


/* =========================================================
   VIEW MANAGEMENT
   ========================================================= */

const ViewManager = (() => {
  const _views   = new Map();
  let   _current = null;

  function register(name, { el, onShow, onHide } = {}) {
    _views.set(name, { el, onShow, onHide });
  }

  function show(name, params = {}) {
    if (_current) {
      const cur = _views.get(_current);
      if (cur) {
        if (cur.el) cur.el.style.display = "none";
        if (cur.onHide) cur.onHide();
      }
    }
    const view = _views.get(name);
    if (!view) { console.warn(`Unknown view: ${name}`); return; }
    if (view.el) view.el.style.display = "";
    if (view.onShow) view.onShow(params);
    _current = name;

    // Update nav links
    document.querySelectorAll("[data-nav]").forEach(el => {
      el.classList.toggle("active", el.dataset.nav === name);
    });
  }

  function current() { return _current; }

  return { register, show, current };
})();


/* =========================================================
   UNIT CONVERTER UTILITIES
   ========================================================= */

const Units = {
  // Pressure conversions to Pa
  pressure: {
    Pa:   1,
    kPa:  1e3,
    MPa:  1e6,
    bar:  1e5,
    psi:  6894.76,
    atm:  101325,
    mmHg: 133.322,
    inH2O: 249.089,
  },

  // Flow rate conversions to m³/s
  flowRate: {
    "m3/s":  1,
    "m3/h":  1 / 3600,
    "L/s":   1e-3,
    "L/min": 1e-3 / 60,
    "GPM":   6.30902e-5,
    "MGD":   0.043813,
  },

  // Length conversions to m
  length: {
    m:  1,
    mm: 1e-3,
    cm: 1e-2,
    km: 1e3,
    ft: 0.3048,
    in: 0.0254,
  },

  // Velocity to m/s
  velocity: {
    "m/s":  1,
    "km/h": 1 / 3.6,
    "ft/s": 0.3048,
    "mph":  0.44704,
  },

  convert(value, fromUnit, toUnit, category) {
    const cat = this[category];
    if (!cat) throw new Error(`Unknown category: ${category}`);
    if (!cat[fromUnit]) throw new Error(`Unknown unit: ${fromUnit}`);
    if (!cat[toUnit])   throw new Error(`Unknown unit: ${toUnit}`);
    return value * cat[fromUnit] / cat[toUnit];
  },
};


/* =========================================================
   EXPORTS (module-like — attach to window for browser use)
   ========================================================= */

Object.assign(window, {
  Toast,
  Modal,
  Spinner,
  ProgressBar,
  Shortcuts,
  ViewManager,
  Units,
  initTabs,
  initCollapsibles,
  initSidebarToggles,
  initTooltips,
  initDropdowns,
  initHorizontalResize,
  buildTable,
  renderColorLegend,
  valueToColor,
  jetColor,
  jetCss,
  formToObject,
  objectToForm,
  validateForm,
  fmt,
  fmtSci,
  fmtPct,
  debounce,
  throttle,
  copyToClipboard,
  escapeHtml,
  showTooltip,
  hideTooltip,
});
