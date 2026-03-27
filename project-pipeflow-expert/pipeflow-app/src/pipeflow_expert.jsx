import { useState, useRef, useEffect, useCallback, useReducer } from "react";

// ============================================================
// CONSTANTS & PHYSICS ENGINE
// ============================================================
const GRAVITY = 9.81;
const WATER_DENSITY = 1000;
const WATER_VISCOSITY = 0.001;
const PI = Math.PI;

const FLUID_PRESETS = {
  water: { name: "Water (20°C)", density: 1000, viscosity: 0.001002, color: "#3b82f6" },
  hotwater: { name: "Water (80°C)", density: 971.8, viscosity: 0.000355, color: "#f97316" },
  oil: { name: "Hydraulic Oil", density: 870, viscosity: 0.046, color: "#a16207" },
  air: { name: "Air (20°C)", density: 1.204, viscosity: 0.0000181, color: "#6b7280" },
  steam: { name: "Steam (150°C)", density: 2.547, viscosity: 0.0000145, color: "#d1d5db" },
  glycol: { name: "Ethylene Glycol", density: 1113, viscosity: 0.016, color: "#10b981" },
  diesel: { name: "Diesel Fuel", density: 850, viscosity: 0.003, color: "#78350f" },
  naturalgas: { name: "Natural Gas", density: 0.717, viscosity: 0.0000109, color: "#fbbf24" },
};

const PIPE_MATERIALS = {
  steel: { name: "Steel (Commercial)", roughness: 0.000046, color: "#6b7280" },
  galvanized: { name: "Galvanized Steel", roughness: 0.00015, color: "#9ca3af" },
  castiron: { name: "Cast Iron", roughness: 0.00026, color: "#4b5563" },
  concrete: { name: "Concrete", roughness: 0.003, color: "#d1d5db" },
  pvc: { name: "PVC / Plastic", roughness: 0.0000015, color: "#60a5fa" },
  copper: { name: "Copper", roughness: 0.0000015, color: "#f59e0b" },
  stainless: { name: "Stainless Steel", roughness: 0.000002, color: "#e5e7eb" },
  hdpe: { name: "HDPE", roughness: 0.000007, color: "#34d399" },
};

const FITTING_TYPES = {
  elbow90: { name: "Elbow 90°", kFactor: 0.9, symbol: "⌐" },
  elbow45: { name: "Elbow 45°", kFactor: 0.4, symbol: "⌐" },
  tee_branch: { name: "Tee (branch)", kFactor: 1.8, symbol: "T" },
  tee_through: { name: "Tee (through)", kFactor: 0.4, symbol: "T" },
  gate_valve: { name: "Gate Valve (open)", kFactor: 0.1, symbol: "⊠" },
  globe_valve: { name: "Globe Valve", kFactor: 10, symbol: "⊡" },
  ball_valve: { name: "Ball Valve (open)", kFactor: 0.05, symbol: "⊗" },
  check_valve: { name: "Check Valve", kFactor: 2.5, symbol: "⊳" },
  butterfly: { name: "Butterfly Valve", kFactor: 0.35, symbol: "⊙" },
  reducer: { name: "Reducer (gradual)", kFactor: 0.1, symbol: "▷" },
  entrance: { name: "Sharp Entrance", kFactor: 0.5, symbol: "→" },
  exit: { name: "Exit Loss", kFactor: 1.0, symbol: "→|" },
  strainer: { name: "Y-Strainer", kFactor: 3.0, symbol: "Y" },
};

const PUMP_TYPES = {
  centrifugal: { name: "Centrifugal Pump", efficiency: 0.75 },
  positive: { name: "Positive Displacement", efficiency: 0.85 },
  axial: { name: "Axial Flow Pump", efficiency: 0.80 },
};

// ============================================================
// HYDRAULIC CALCULATIONS ENGINE
// ============================================================
function calcReynolds(velocity, diameter, density, viscosity) {
  return (density * velocity * diameter) / viscosity;
}

function calcFrictionFactor(Re, roughness, diameter) {
  if (Re < 2300) return 64 / Re; // Laminar
  if (Re < 4000) {
    const f_lam = 64 / Re;
    const f_turb = colebrook(Re, roughness, diameter);
    const t = (Re - 2300) / 1700;
    return f_lam * (1 - t) + f_turb * t;
  }
  return colebrook(Re, roughness, diameter);
}

function colebrook(Re, roughness, diameter) {
  const rr = roughness / diameter;
  let f = 0.02;
  for (let i = 0; i < 50; i++) {
    const rhs = -2 * Math.log10(rr / 3.7 + 2.51 / (Re * Math.sqrt(f)));
    const f_new = 1 / (rhs * rhs);
    if (Math.abs(f_new - f) < 1e-10) break;
    f = f_new;
  }
  return f;
}

function calcDarcyWeisbach(f, L, D, V) {
  return f * (L / D) * (V * V) / (2 * GRAVITY);
}

function calcMinorLoss(K, V) {
  return K * V * V / (2 * GRAVITY);
}

function calcVelocity(flowRate, diameter) {
  const area = PI * diameter * diameter / 4;
  return flowRate / area;
}

function calcFlowFromVelocity(velocity, diameter) {
  const area = PI * diameter * diameter / 4;
  return velocity * area;
}

function analyzePipe(pipe, nodes, fluid) {
  const n1 = nodes.find(n => n.id === pipe.startNodeId);
  const n2 = nodes.find(n => n.id === pipe.endNodeId);
  if (!n1 || !n2) return null;

  const mat = PIPE_MATERIALS[pipe.material] || PIPE_MATERIALS.steel;
  const D = pipe.diameter / 1000; // mm to m
  const L = pipe.length; // m
  const Q = pipe.flowRate / 3600; // m³/h to m³/s
  const V = calcVelocity(Q, D);
  const Re = calcReynolds(V, D, fluid.density, fluid.viscosity);
  const f = calcFrictionFactor(Re, mat.roughness, D);
  const hf_major = calcDarcyWeisbach(f, L, D, V);

  let hf_minor = 0;
  const fittings = pipe.fittings || [];
  fittings.forEach(fit => {
    const ft = FITTING_TYPES[fit.type];
    if (ft) hf_minor += calcMinorLoss(ft.kFactor * fit.count, V);
  });

  const hf_total = hf_major + hf_minor;
  const pressureDrop = hf_total * fluid.density * GRAVITY; // Pa
  const area = PI * D * D / 4;
  const flowRegime = Re < 2300 ? "Laminar" : Re < 4000 ? "Transitional" : "Turbulent";
  const velocity_ms = V;
  const powerLoss = pressureDrop * Q; // W

  return {
    reynolds: Re,
    frictionFactor: f,
    velocity: V,
    headLossMajor: hf_major,
    headLossMinor: hf_minor,
    headLossTotal: hf_total,
    pressureDrop: pressureDrop,
    flowRegime,
    powerLoss,
    massFlow: Q * fluid.density,
    area,
  };
}

function analyzeNetwork(nodes, pipes, fluid) {
  const results = {};
  pipes.forEach(pipe => {
    results[pipe.id] = analyzePipe(pipe, nodes, fluid);
  });
  return results;
}

// ============================================================
// ISOMETRIC GRID UTILITIES
// ============================================================
const ISO_ANGLE = 30 * (PI / 180);
const ISO_X = Math.cos(ISO_ANGLE);
const ISO_Y = Math.sin(ISO_ANGLE);

function isoToScreen(ix, iy, iz, originX, originY, scale) {
  const sx = originX + (ix - iy) * ISO_X * scale;
  const sy = originY + (ix + iy) * ISO_Y * scale - iz * scale;
  return { x: sx, y: sy };
}

function screenToIso(sx, sy, originX, originY, scale) {
  const rx = (sx - originX) / scale;
  const ry = (sy - originY) / scale;
  const ix = (rx / ISO_X + ry / ISO_Y) / 2;
  const iy = (ry / ISO_Y - rx / ISO_X) / 2;
  return { x: Math.round(ix), y: Math.round(iy), z: 0 };
}

// ============================================================
// COLOR SCALE FOR VELOCITY/PRESSURE
// ============================================================
function velocityToColor(v, minV, maxV) {
  const t = maxV > minV ? (v - minV) / (maxV - minV) : 0;
  const r = Math.round(255 * Math.min(1, t * 2));
  const g = Math.round(255 * Math.min(1, 2 - t * 2));
  const b = Math.round(100 * (1 - t));
  return `rgb(${r},${g},${b})`;
}

function pressureToColor(p, minP, maxP) {
  const t = maxP > minP ? (p - minP) / (maxP - minP) : 0;
  const r = Math.round(50 + 200 * t);
  const g = Math.round(150 * (1 - t));
  const b = Math.round(255 * (1 - t));
  return `rgb(${r},${g},${b})`;
}

// ============================================================
// INITIAL STATE
// ============================================================
const initialNodes = [
  { id: "N1", label: "Source", x: 2, y: 8, z: 0, type: "reservoir", pressure: 200000, elevation: 10 },
  { id: "N2", label: "Junction A", x: 5, y: 8, z: 0, type: "junction", pressure: 0, elevation: 8 },
  { id: "N3", label: "Junction B", x: 8, y: 8, z: 0, type: "junction", pressure: 0, elevation: 6 },
  { id: "N4", label: "Junction C", x: 8, y: 5, z: 0, type: "junction", pressure: 0, elevation: 5 },
  { id: "N5", label: "Demand D", x: 11, y: 8, z: 0, type: "demand", pressure: 0, elevation: 4 },
  { id: "N6", label: "Demand E", x: 11, y: 5, z: 0, type: "demand", pressure: 0, elevation: 3 },
];

const initialPipes = [
  { id: "P1", label: "Pipe 1", startNodeId: "N1", endNodeId: "N2", diameter: 150, length: 100, material: "steel", flowRate: 50, fittings: [{ type: "elbow90", count: 1 }] },
  { id: "P2", label: "Pipe 2", startNodeId: "N2", endNodeId: "N3", diameter: 125, length: 80, material: "steel", flowRate: 30, fittings: [{ type: "gate_valve", count: 1 }] },
  { id: "P3", label: "Pipe 3", startNodeId: "N2", endNodeId: "N4", diameter: 100, length: 60, material: "pvc", flowRate: 20, fittings: [] },
  { id: "P4", label: "Pipe 4", startNodeId: "N3", endNodeId: "N5", diameter: 100, length: 75, material: "steel", flowRate: 30, fittings: [{ type: "elbow90", count: 2 }] },
  { id: "P5", label: "Pipe 5", startNodeId: "N4", endNodeId: "N6", diameter: 80, length: 55, material: "pvc", flowRate: 20, fittings: [{ type: "ball_valve", count: 1 }] },
  { id: "P6", label: "Pipe 6", startNodeId: "N3", endNodeId: "N4", diameter: 80, length: 40, material: "galvanized", flowRate: 0, fittings: [] },
];

// ============================================================
// REDUCER
// ============================================================
function reducer(state, action) {
  switch (action.type) {
    case "ADD_NODE":
      return { ...state, nodes: [...state.nodes, action.node] };
    case "UPDATE_NODE":
      return { ...state, nodes: state.nodes.map(n => n.id === action.id ? { ...n, ...action.changes } : n) };
    case "DELETE_NODE":
      return {
        ...state,
        nodes: state.nodes.filter(n => n.id !== action.id),
        pipes: state.pipes.filter(p => p.startNodeId !== action.id && p.endNodeId !== action.id),
      };
    case "ADD_PIPE":
      return { ...state, pipes: [...state.pipes, action.pipe] };
    case "UPDATE_PIPE":
      return { ...state, pipes: state.pipes.map(p => p.id === action.id ? { ...p, ...action.changes } : p) };
    case "DELETE_PIPE":
      return { ...state, pipes: state.pipes.filter(p => p.id !== action.id) };
    case "SET_FLUID":
      return { ...state, fluid: action.fluid };
    case "SET_SELECTED":
      return { ...state, selected: action.selected };
    case "SET_TOOL":
      return { ...state, tool: action.tool };
    case "SET_VIEW":
      return { ...state, view: action.view };
    case "LOAD_PROJECT":
      return { ...state, nodes: action.nodes, pipes: action.pipes };
    case "ADD_FITTING":
      return {
        ...state,
        pipes: state.pipes.map(p => p.id === action.pipeId
          ? { ...p, fittings: [...(p.fittings || []), action.fitting] }
          : p)
      };
    case "REMOVE_FITTING":
      return {
        ...state,
        pipes: state.pipes.map(p => p.id === action.pipeId
          ? { ...p, fittings: p.fittings.filter((_, i) => i !== action.index) }
          : p)
      };
    default:
      return state;
  }
}

// ============================================================
// HELPER COMPONENTS
// ============================================================
function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "bg-blue-100 text-blue-800 border border-blue-200",
    green: "bg-green-100 text-green-800 border border-green-200",
    red: "bg-red-100 text-red-800 border border-red-200",
    yellow: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    gray: "bg-gray-100 text-gray-700 border border-gray-200",
    purple: "bg-purple-100 text-purple-800 border border-purple-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{children}</span>
    </div>
  );
}

function InputRow({ label, children }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <label className="text-xs text-gray-600 w-28 shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function StyledInput({ value, onChange, type = "text", className = "", ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white ${className}`}
      {...props}
    />
  );
}

function StyledSelect({ value, onChange, children, className = "" }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 bg-white ${className}`}
    >
      {children}
    </select>
  );
}

function Btn({ children, onClick, active, color = "gray", size = "sm", className = "", disabled = false }) {
  const sizes = { xs: "px-1.5 py-0.5 text-xs", sm: "px-2 py-1 text-xs", md: "px-3 py-1.5 text-sm" };
  const colors = {
    gray: active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
    blue: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700",
    red: "bg-red-500 text-white border-red-500 hover:bg-red-600",
    green: "bg-green-600 text-white border-green-600 hover:bg-green-700",
    orange: "bg-orange-500 text-white border-orange-500 hover:bg-orange-600",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`border rounded font-medium transition-colors ${sizes[size]} ${colors[color]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, unit, color = "blue", icon }) {
  const colors = {
    blue: "border-l-blue-500",
    green: "border-l-green-500",
    red: "border-l-red-500",
    yellow: "border-l-yellow-500",
    purple: "border-l-purple-500",
  };
  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${colors[color]} rounded p-3 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="text-lg font-bold text-gray-800">{value}</div>
          {unit && <div className="text-xs text-gray-400">{unit}</div>}
        </div>
        {icon && <div className="text-2xl opacity-40">{icon}</div>}
      </div>
    </div>
  );
}

// ============================================================
// ISOMETRIC CANVAS
// ============================================================
function IsometricCanvas({ nodes, pipes, analysisResults, selected, onSelect, tool, onNodeAdd, viewMode, colorMode }) {
  const canvasRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(45);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState(null);
  const [drawingPipe, setDrawingPipe] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  const [flowAnim, setFlowAnim] = useState(0);

  const originX = 200 + pan.x;
  const originY = 300 + pan.y;

  useEffect(() => {
    const animate = () => {
      setFlowAnim(prev => (prev + 1) % 60);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const getMaxValues = useCallback(() => {
    if (!analysisResults) return { maxV: 3, minV: 0, maxP: 300000, minP: 0 };
    const velocities = Object.values(analysisResults).filter(r => r).map(r => r.velocity);
    const pressures = Object.values(analysisResults).filter(r => r).map(r => r.pressureDrop);
    return {
      maxV: Math.max(...velocities, 0.1),
      minV: Math.min(...velocities, 0),
      maxP: Math.max(...pressures, 1),
      minP: Math.min(...pressures, 0),
    };
  }, [analysisResults]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let i = -20; i <= 20; i++) {
      for (let j = -20; j <= 20; j++) {
        const p = isoToScreen(i, j, 0, originX, originY, scale);
        if (i === 0 && j === 0) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, 2 * PI);
        ctx.fillStyle = "#cbd5e1";
        ctx.fill();
      }
    }

    // Draw iso grid lines
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.3;
    for (let i = -20; i <= 20; i++) {
      const p1 = isoToScreen(i, -20, 0, originX, originY, scale);
      const p2 = isoToScreen(i, 20, 0, originX, originY, scale);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      const q1 = isoToScreen(-20, i, 0, originX, originY, scale);
      const q2 = isoToScreen(20, i, 0, originX, originY, scale);
      ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.stroke();
    }

    const { maxV, minV, maxP, minP } = getMaxValues();

    // Draw pipes
    pipes.forEach(pipe => {
      const n1 = nodes.find(n => n.id === pipe.startNodeId);
      const n2 = nodes.find(n => n.id === pipe.endNodeId);
      if (!n1 || !n2) return;

      const p1 = isoToScreen(n1.x, n1.y, n1.z || 0, originX, originY, scale);
      const p2 = isoToScreen(n2.x, n2.y, n2.z || 0, originX, originY, scale);
      const result = analysisResults && analysisResults[pipe.id];

      let pipeColor = "#64748b";
      const mat = PIPE_MATERIALS[pipe.material];
      if (mat) pipeColor = mat.color;

      if (colorMode === "velocity" && result) {
        pipeColor = velocityToColor(result.velocity, minV, maxV);
      } else if (colorMode === "pressure" && result) {
        pipeColor = pressureToColor(result.pressureDrop, minP, maxP);
      } else if (colorMode === "material") {
        pipeColor = mat ? mat.color : "#64748b";
      }

      const isSelected = selected && selected.id === pipe.id;
      const isHovered = hoveredId === pipe.id;

      // Pipe shadow
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = (pipe.diameter / 20) * (scale / 45) + 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p1.x + 2, p1.y + 2);
      ctx.lineTo(p2.x + 2, p2.y + 2);
      ctx.stroke();

      // Pipe body
      ctx.strokeStyle = pipeColor;
      ctx.lineWidth = (pipe.diameter / 20) * (scale / 45) + (isSelected ? 3 : isHovered ? 2 : 1);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Flow animation particles
      if (result && result.velocity > 0.01) {
        const numParticles = 3;
        for (let i = 0; i < numParticles; i++) {
          const t = ((flowAnim / 60 + i / numParticles) % 1);
          const px = p1.x + (p2.x - p1.x) * t;
          const py = p1.y + (p2.y - p1.y) * t;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, 2 * PI);
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.fill();
        }
      }

      // Selection outline
      if (isSelected) {
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = (pipe.diameter / 20) * (scale / 45) + 5;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Pipe label
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      ctx.font = "9px monospace";
      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "center";
      ctx.fillText(pipe.label, mx, my - 8);
      if (result) {
        ctx.fillStyle = "#475569";
        ctx.fillText(`${result.velocity.toFixed(2)} m/s`, mx, my + 16);
      }

      // Fittings markers
      if (pipe.fittings && pipe.fittings.length > 0) {
        const fx = mx;
        const fy = my;
        ctx.fillStyle = "#7c3aed";
        ctx.beginPath();
        ctx.arc(fx, fy, 5, 0, 2 * PI);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 7px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pipe.fittings.length, fx, fy);
        ctx.textBaseline = "alphabetic";
      }

      // Diameter label
      if (scale > 35) {
        ctx.font = "8px monospace";
        ctx.fillStyle = "#64748b";
        ctx.fillText(`Ø${pipe.diameter}mm`, mx, my + 6);
      }
    });

    // Draw pipe being created
    if (drawingPipe && tool === "pipe") {
      const n1 = nodes.find(n => n.id === drawingPipe.startNodeId);
      if (n1) {
        const p1 = isoToScreen(n1.x, n1.y, n1.z || 0, originX, originY, scale);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw nodes
    nodes.forEach(node => {
      const p = isoToScreen(node.x, node.y, node.z || 0, originX, originY, scale);
      const isSelected = selected && selected.id === node.id;
      const isHovered = hoveredId === node.id;
      const r = isSelected ? 13 : isHovered ? 11 : 9;

      // Node shadow
      ctx.beginPath();
      ctx.arc(p.x + 2, p.y + 2, r, 0, 2 * PI);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fill();

      // Node body
      let nodeColor = "#3b82f6";
      if (node.type === "reservoir") nodeColor = "#0284c7";
      else if (node.type === "pump") nodeColor = "#d97706";
      else if (node.type === "demand") nodeColor = "#dc2626";
      else if (node.type === "junction") nodeColor = "#16a34a";
      else if (node.type === "tank") nodeColor = "#7c3aed";

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 4, 0, 2 * PI);
        ctx.fillStyle = "#fef08a";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, 2 * PI);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node inner
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 0.5, 0, 2 * PI);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fill();

      // Node label
      ctx.font = `bold ${scale > 40 ? 10 : 8}px sans-serif`;
      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "center";
      ctx.fillText(node.label, p.x, p.y - r - 4);

      // Elevation
      if (scale > 35) {
        ctx.font = "8px monospace";
        ctx.fillStyle = "#64748b";
        ctx.fillText(`z=${node.elevation}m`, p.x, p.y + r + 12);
      }

      // Pressure
      if (node.pressure > 0) {
        ctx.font = "8px monospace";
        ctx.fillStyle = "#0284c7";
        ctx.fillText(`${(node.pressure / 1000).toFixed(0)}kPa`, p.x, p.y + r + 22);
      }
    });

    // Coordinate axes
    const axOrig = isoToScreen(0, 0, 0, originX, originY, scale);
    const axX = isoToScreen(2, 0, 0, originX, originY, scale);
    const axY = isoToScreen(0, 2, 0, originX, originY, scale);
    const axZ = isoToScreen(0, 0, 2, originX, originY, scale);

    ctx.lineWidth = 2;
    [[axX, "#ef4444", "X"], [axY, "#22c55e", "Y"], [axZ, "#3b82f6", "Z"]].forEach(([pt, color, lbl]) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(axOrig.x, axOrig.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(lbl, pt.x + 4, pt.y - 4);
    });

    // Legend for color mode
    if (colorMode !== "material" && analysisResults) {
      drawColorLegend(ctx, colorMode, minV, maxV, minP, maxP, W, H);
    }
  }, [nodes, pipes, analysisResults, selected, hoveredId, pan, scale, flowAnim, colorMode, drawingPipe, tool, mousePos, getMaxValues]);

  function drawColorLegend(ctx, mode, minV, maxV, minP, maxP, W, H) {
    const x = W - 140;
    const y = H - 180;
    const w = 120;
    const h = 150;

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 9px sans-serif";
    ctx.fillStyle = "#1e293b";
    ctx.textAlign = "center";
    ctx.fillText(mode === "velocity" ? "Velocity (m/s)" : "Pressure Drop (Pa)", x + w / 2, y + 14);

    const gradH = 100;
    const grad = ctx.createLinearGradient(x + 20, y + 25, x + 20, y + 25 + gradH);
    if (mode === "velocity") {
      grad.addColorStop(0, velocityToColor(maxV, minV, maxV));
      grad.addColorStop(1, velocityToColor(minV, minV, maxV));
    } else {
      grad.addColorStop(0, pressureToColor(maxP, minP, maxP));
      grad.addColorStop(1, pressureToColor(minP, minP, maxP));
    }
    ctx.fillStyle = grad;
    ctx.fillRect(x + 20, y + 25, 20, gradH);
    ctx.strokeStyle = "#94a3b8";
    ctx.strokeRect(x + 20, y + 25, 20, gradH);

    ctx.font = "8px monospace";
    ctx.fillStyle = "#374151";
    ctx.textAlign = "left";
    const maxVal = mode === "velocity" ? maxV.toFixed(2) : (maxP / 1000).toFixed(1) + "k";
    const minVal = mode === "velocity" ? minV.toFixed(2) : (minP / 1000).toFixed(1) + "k";
    ctx.fillText(maxVal, x + 46, y + 30);
    ctx.fillText(minVal, x + 46, y + 25 + gradH);
  }

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  const getHitTarget = useCallback((sx, sy) => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const p = isoToScreen(node.x, node.y, node.z || 0, originX, originY, scale);
      const dist = Math.sqrt((sx - p.x) ** 2 + (sy - p.y) ** 2);
      if (dist < 15) return { type: "node", item: node };
    }
    for (let i = pipes.length - 1; i >= 0; i--) {
      const pipe = pipes[i];
      const n1 = nodes.find(n => n.id === pipe.startNodeId);
      const n2 = nodes.find(n => n.id === pipe.endNodeId);
      if (!n1 || !n2) continue;
      const p1 = isoToScreen(n1.x, n1.y, n1.z || 0, originX, originY, scale);
      const p2 = isoToScreen(n2.x, n2.y, n2.z || 0, originX, originY, scale);
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1) continue;
      const t = ((sx - p1.x) * dx + (sy - p1.y) * dy) / (len * len);
      if (t < 0 || t > 1) continue;
      const closestX = p1.x + t * dx;
      const closestY = p1.y + t * dy;
      const dist = Math.sqrt((sx - closestX) ** 2 + (sy - closestY) ** 2);
      if (dist < 8) return { type: "pipe", item: pipe };
    }
    return null;
  }, [nodes, pipes, originX, originY, scale]);

  const handleMouseDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (tool === "pan" || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const hit = getHitTarget(sx, sy);

    if (tool === "select") {
      onSelect(hit ? hit.item : null);
    } else if (tool === "node") {
      const iso = screenToIso(sx, sy, originX, originY, scale);
      onNodeAdd({ x: iso.x, y: iso.y, z: 0 });
    } else if (tool === "pipe") {
      if (hit && hit.type === "node") {
        if (!drawingPipe) {
          setDrawingPipe({ startNodeId: hit.item.id });
        } else {
          if (hit.item.id !== drawingPipe.startNodeId) {
            onSelect({ _newPipe: true, startNodeId: drawingPipe.startNodeId, endNodeId: hit.item.id });
          }
          setDrawingPipe(null);
        }
      }
    } else if (tool === "delete") {
      if (hit) onSelect({ _delete: true, ...hit.item, _type: hit.type });
    }
  }, [tool, pan, getHitTarget, onSelect, onNodeAdd, drawingPipe, originX, originY, scale]);

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    setMousePos({ x: sx, y: sy });

    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    const hit = getHitTarget(sx, sy);
    setHoveredId(hit ? hit.item.id : null);
  }, [isPanning, panStart, getHitTarget]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => Math.max(20, Math.min(120, s * factor)));
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={600}
      style={{ cursor: tool === "pan" ? "grab" : tool === "node" ? "crosshair" : tool === "delete" ? "no-drop" : "default", width: "100%", height: "100%" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    />
  );
}

// ============================================================
// PANEL: NODE PROPERTIES
// ============================================================
function NodePanel({ node, dispatch }) {
  if (!node) return null;
  const update = (changes) => dispatch({ type: "UPDATE_NODE", id: node.id, changes });

  return (
    <Card>
      <SectionTitle>🔵 Node Properties — {node.id}</SectionTitle>
      <div className="py-1">
        <InputRow label="Label">
          <StyledInput value={node.label} onChange={e => update({ label: e.target.value })} />
        </InputRow>
        <InputRow label="Type">
          <StyledSelect value={node.type} onChange={e => update({ type: e.target.value })}>
            <option value="junction">Junction</option>
            <option value="reservoir">Reservoir / Source</option>
            <option value="demand">Demand Node</option>
            <option value="pump">Pump Node</option>
            <option value="tank">Tank</option>
          </StyledSelect>
        </InputRow>
        <InputRow label="Elevation (m)">
          <StyledInput type="number" value={node.elevation} onChange={e => update({ elevation: parseFloat(e.target.value) || 0 })} step="0.5" />
        </InputRow>
        <InputRow label="Pressure (Pa)">
          <StyledInput type="number" value={node.pressure} onChange={e => update({ pressure: parseFloat(e.target.value) || 0 })} step="1000" />
        </InputRow>
        <InputRow label="X Position">
          <StyledInput type="number" value={node.x} onChange={e => update({ x: parseInt(e.target.value) || 0 })} />
        </InputRow>
        <InputRow label="Y Position">
          <StyledInput type="number" value={node.y} onChange={e => update({ y: parseInt(e.target.value) || 0 })} />
        </InputRow>
        <InputRow label="Z (Elev ISO)">
          <StyledInput type="number" value={node.z || 0} onChange={e => update({ z: parseFloat(e.target.value) || 0 })} step="0.5" />
        </InputRow>
        <div className="px-3 py-2 flex gap-2">
          <Btn color="red" onClick={() => dispatch({ type: "DELETE_NODE", id: node.id })}>🗑 Delete Node</Btn>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// PANEL: PIPE PROPERTIES
// ============================================================
function PipePanel({ pipe, dispatch }) {
  if (!pipe) return null;
  const update = (changes) => dispatch({ type: "UPDATE_PIPE", id: pipe.id, changes });

  return (
    <Card>
      <SectionTitle>🔴 Pipe Properties — {pipe.id}</SectionTitle>
      <div className="py-1">
        <InputRow label="Label">
          <StyledInput value={pipe.label} onChange={e => update({ label: e.target.value })} />
        </InputRow>
        <InputRow label="Diameter (mm)">
          <StyledInput type="number" value={pipe.diameter} onChange={e => update({ diameter: parseFloat(e.target.value) || 25 })} step="5" min="5" max="2000" />
        </InputRow>
        <InputRow label="Length (m)">
          <StyledInput type="number" value={pipe.length} onChange={e => update({ length: parseFloat(e.target.value) || 1 })} step="0.5" min="0.1" />
        </InputRow>
        <InputRow label="Material">
          <StyledSelect value={pipe.material} onChange={e => update({ material: e.target.value })}>
            {Object.entries(PIPE_MATERIALS).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </StyledSelect>
        </InputRow>
        <InputRow label="Flow Rate (m³/h)">
          <StyledInput type="number" value={pipe.flowRate} onChange={e => update({ flowRate: parseFloat(e.target.value) || 0 })} step="1" />
        </InputRow>
        <InputRow label="From Node">
          <StyledInput value={pipe.startNodeId} onChange={e => update({ startNodeId: e.target.value })} />
        </InputRow>
        <InputRow label="To Node">
          <StyledInput value={pipe.endNodeId} onChange={e => update({ endNodeId: e.target.value })} />
        </InputRow>
      </div>

      <SectionTitle>⚙️ Fittings & Valves</SectionTitle>
      <div className="p-2">
        {(pipe.fittings || []).map((fit, idx) => (
          <div key={idx} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-gray-50">
            <span className="text-xs text-gray-600 flex-1">{FITTING_TYPES[fit.type]?.name || fit.type} ×{fit.count}</span>
            <span className="text-xs text-gray-400">K={((FITTING_TYPES[fit.type]?.kFactor || 0) * fit.count).toFixed(2)}</span>
            <Btn size="xs" color="red" onClick={() => dispatch({ type: "REMOVE_FITTING", pipeId: pipe.id, index: idx })}>×</Btn>
          </div>
        ))}
        <AddFittingForm pipeId={pipe.id} dispatch={dispatch} />
      </div>

      <div className="px-3 py-2">
        <Btn color="red" onClick={() => dispatch({ type: "DELETE_PIPE", id: pipe.id })}>🗑 Delete Pipe</Btn>
      </div>
    </Card>
  );
}

function AddFittingForm({ pipeId, dispatch }) {
  const [type, setType] = useState("elbow90");
  const [count, setCount] = useState(1);
  return (
    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
      <StyledSelect value={type} onChange={e => setType(e.target.value)} className="flex-1">
        {Object.entries(FITTING_TYPES).map(([k, v]) => (
          <option key={k} value={k}>{v.name}</option>
        ))}
      </StyledSelect>
      <StyledInput type="number" value={count} onChange={e => setCount(parseInt(e.target.value) || 1)} className="w-12" min="1" />
      <Btn color="green" onClick={() => dispatch({ type: "ADD_FITTING", pipeId, fitting: { type, count } })}>+</Btn>
    </div>
  );
}

// ============================================================
// PANEL: ANALYSIS RESULTS
// ============================================================
function ResultsPanel({ pipe, result, fluid }) {
  if (!pipe || !result) return (
    <Card>
      <SectionTitle>📊 Analysis Results</SectionTitle>
      <div className="p-4 text-xs text-gray-400 text-center">Select a pipe to view results</div>
    </Card>
  );

  const flowRegimeColor = result.flowRegime === "Laminar" ? "green" : result.flowRegime === "Turbulent" ? "red" : "yellow";

  return (
    <Card>
      <SectionTitle>📊 Analysis — {pipe.label}</SectionTitle>
      <div className="p-2 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <StatCard label="Velocity" value={result.velocity.toFixed(3)} unit="m/s" color="blue" icon="💨" />
          <StatCard label="Reynolds No." value={result.reynolds.toFixed(0)} unit="" color="purple" icon="🌀" />
          <StatCard label="Head Loss" value={result.headLossTotal.toFixed(3)} unit="m" color="red" icon="📉" />
          <StatCard label="Pressure Drop" value={(result.pressureDrop / 1000).toFixed(2)} unit="kPa" color="orange" icon="⬇" />
        </div>

        <div className="bg-gray-50 rounded p-2 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Flow Regime</span>
            <Badge color={flowRegimeColor}>{result.flowRegime}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Friction Factor (f)</span>
            <span className="text-xs font-mono font-bold">{result.frictionFactor.toFixed(6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Major Head Loss</span>
            <span className="text-xs font-mono">{result.headLossMajor.toFixed(4)} m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Minor Head Loss</span>
            <span className="text-xs font-mono">{result.headLossMinor.toFixed(4)} m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Mass Flow Rate</span>
            <span className="text-xs font-mono">{result.massFlow.toFixed(4)} kg/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Power Loss</span>
            <span className="text-xs font-mono">{result.powerLoss.toFixed(2)} W</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Flow Velocity Area</span>
            <span className="text-xs font-mono">{(result.area * 10000).toFixed(2)} cm²</span>
          </div>
        </div>

        {/* Moody Diagram Indicator */}
        <div className="bg-blue-50 rounded p-2">
          <div className="text-xs font-semibold text-blue-800 mb-1">Moody Chart Position</div>
          <div className="relative h-6 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded overflow-hidden">
            <div
              className="absolute top-0 bottom-0 w-2 bg-blue-700 rounded"
              style={{ left: `${Math.min(95, Math.max(2, (Math.log10(result.reynolds + 1) / 7) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-0.5">
            <span>Re=0</span><span>Laminar</span><span>Turbulent</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// PANEL: NETWORK SUMMARY
// ============================================================
function NetworkSummaryPanel({ nodes, pipes, analysisResults, fluid }) {
  const totalPipeLength = pipes.reduce((s, p) => s + p.length, 0);
  const totalFlowRate = pipes.reduce((s, p) => s + p.flowRate, 0);
  const totalHeadLoss = Object.values(analysisResults || {}).filter(r => r).reduce((s, r) => s + r.headLossTotal, 0);
  const totalPowerLoss = Object.values(analysisResults || {}).filter(r => r).reduce((s, r) => s + r.powerLoss, 0);
  const maxVelocity = Object.values(analysisResults || {}).filter(r => r).reduce((mx, r) => Math.max(mx, r.velocity), 0);
  const maxPressureDrop = Object.values(analysisResults || {}).filter(r => r).reduce((mx, r) => Math.max(mx, r.pressureDrop), 0);

  return (
    <Card>
      <SectionTitle>🌐 Network Summary</SectionTitle>
      <div className="p-2 grid grid-cols-2 gap-1.5">
        <StatCard label="Total Pipes" value={pipes.length} icon="📏" color="blue" />
        <StatCard label="Total Nodes" value={nodes.length} icon="🔵" color="green" />
        <StatCard label="Total Length" value={totalPipeLength.toFixed(0)} unit="m" icon="📐" color="purple" />
        <StatCard label="Total Flow" value={totalFlowRate.toFixed(1)} unit="m³/h" icon="💧" color="blue" />
        <StatCard label="Max Velocity" value={maxVelocity.toFixed(3)} unit="m/s" icon="💨" color="red" />
        <StatCard label="Max ΔP" value={(maxPressureDrop / 1000).toFixed(1)} unit="kPa" icon="⬇" color="yellow" />
        <StatCard label="ΣHead Loss" value={totalHeadLoss.toFixed(2)} unit="m" icon="📉" color="red" />
        <StatCard label="ΣPower Loss" value={(totalPowerLoss / 1000).toFixed(3)} unit="kW" icon="⚡" color="yellow" />
      </div>
    </Card>
  );
}

// ============================================================
// PANEL: PIPE TABLE
// ============================================================
function PipeTablePanel({ pipes, nodes, analysisResults, onSelectPipe }) {
  return (
    <Card>
      <SectionTitle>📋 Pipe Schedule</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["ID", "From", "To", "Ø(mm)", "L(m)", "Material", "Q(m³/h)", "V(m/s)", "Re", "hf(m)", "ΔP(kPa)", "Regime"].map(h => (
                <th key={h} className="px-2 py-1.5 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pipes.map((pipe, i) => {
              const r = analysisResults && analysisResults[pipe.id];
              const regColor = r ? (r.flowRegime === "Laminar" ? "text-green-600" : r.flowRegime === "Turbulent" ? "text-red-600" : "text-yellow-600") : "";
              return (
                <tr key={pipe.id} onClick={() => onSelectPipe(pipe)} className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${i % 2 === 0 ? "" : "bg-gray-50"}`}>
                  <td className="px-2 py-1 font-mono font-bold text-blue-700">{pipe.id}</td>
                  <td className="px-2 py-1 font-mono">{pipe.startNodeId}</td>
                  <td className="px-2 py-1 font-mono">{pipe.endNodeId}</td>
                  <td className="px-2 py-1">{pipe.diameter}</td>
                  <td className="px-2 py-1">{pipe.length}</td>
                  <td className="px-2 py-1">{PIPE_MATERIALS[pipe.material]?.name || pipe.material}</td>
                  <td className="px-2 py-1">{pipe.flowRate}</td>
                  <td className="px-2 py-1 font-mono">{r ? r.velocity.toFixed(3) : "-"}</td>
                  <td className="px-2 py-1 font-mono">{r ? r.reynolds.toFixed(0) : "-"}</td>
                  <td className="px-2 py-1 font-mono">{r ? r.headLossTotal.toFixed(3) : "-"}</td>
                  <td className="px-2 py-1 font-mono">{r ? (r.pressureDrop / 1000).toFixed(2) : "-"}</td>
                  <td className={`px-2 py-1 font-semibold ${regColor}`}>{r ? r.flowRegime : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ============================================================
// PANEL: NODE TABLE
// ============================================================
function NodeTablePanel({ nodes, onSelectNode }) {
  return (
    <Card>
      <SectionTitle>📋 Node Schedule</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["ID", "Label", "Type", "Elevation (m)", "Pressure (kPa)", "X", "Y", "Z"].map(h => (
                <th key={h} className="px-2 py-1.5 text-left font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nodes.map((node, i) => (
              <tr key={node.id} onClick={() => onSelectNode(node)} className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${i % 2 === 0 ? "" : "bg-gray-50"}`}>
                <td className="px-2 py-1 font-mono font-bold text-green-700">{node.id}</td>
                <td className="px-2 py-1">{node.label}</td>
                <td className="px-2 py-1"><Badge color={node.type === "reservoir" ? "blue" : node.type === "demand" ? "red" : "green"}>{node.type}</Badge></td>
                <td className="px-2 py-1 font-mono">{node.elevation}</td>
                <td className="px-2 py-1 font-mono">{(node.pressure / 1000).toFixed(0)}</td>
                <td className="px-2 py-1 font-mono">{node.x}</td>
                <td className="px-2 py-1 font-mono">{node.y}</td>
                <td className="px-2 py-1 font-mono">{node.z || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ============================================================
// PANEL: FLUID SELECTOR
// ============================================================
function FluidPanel({ fluid, dispatch }) {
  const [custom, setCustom] = useState(false);
  return (
    <Card>
      <SectionTitle>💧 Fluid Properties</SectionTitle>
      <div className="py-1">
        <InputRow label="Fluid Preset">
          <StyledSelect value="" onChange={e => {
            if (e.target.value) {
              dispatch({ type: "SET_FLUID", fluid: FLUID_PRESETS[e.target.value] });
              setCustom(false);
            }
          }}>
            <option value="">— Select Preset —</option>
            {Object.entries(FLUID_PRESETS).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </StyledSelect>
        </InputRow>
        <InputRow label="Name">
          <StyledInput value={fluid.name} onChange={e => dispatch({ type: "SET_FLUID", fluid: { ...fluid, name: e.target.value } })} />
        </InputRow>
        <InputRow label="Density (kg/m³)">
          <StyledInput type="number" value={fluid.density} onChange={e => dispatch({ type: "SET_FLUID", fluid: { ...fluid, density: parseFloat(e.target.value) || 1000 } })} step="0.1" />
        </InputRow>
        <InputRow label="Viscosity (Pa·s)">
          <StyledInput type="number" value={fluid.viscosity} onChange={e => dispatch({ type: "SET_FLUID", fluid: { ...fluid, viscosity: parseFloat(e.target.value) || 0.001 } })} step="0.0001" />
        </InputRow>
        <div className="px-3 py-2">
          <div className="bg-blue-50 rounded p-2 text-xs text-blue-800">
            <div className="font-semibold mb-1">Kinematic Viscosity</div>
            <div className="font-mono">{(fluid.viscosity / fluid.density * 1e6).toFixed(4)} mm²/s</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// PUMP CURVE CHART
// ============================================================
function PumpCurveChart({ width = 300, height = 180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const x = 40 + (W - 60) * i / 10;
      ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, H - 30); ctx.stroke();
      const y = 10 + (H - 40) * i / 10;
      ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(W - 10, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 10); ctx.lineTo(40, H - 30);
    ctx.moveTo(40, H - 30); ctx.lineTo(W - 10, H - 30);
    ctx.stroke();

    // Pump H-Q curve
    const maxQ = 100, maxH = 50;
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let q = 0; q <= maxQ; q += 2) {
      const h = maxH * (1 - (q / maxQ) ** 2 * 0.85);
      const px = 40 + (W - 60) * q / maxQ;
      const py = H - 30 - (H - 40) * h / maxH;
      if (q === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // System curve
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (let q = 0; q <= maxQ; q += 2) {
      const h = 5 + 0.004 * q * q;
      const px = 40 + (W - 60) * q / maxQ;
      const py = H - 30 - (H - 40) * Math.min(h, maxH) / maxH;
      if (q === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Operating point (approx)
    const opQ = 58, opH = 21;
    const opX = 40 + (W - 60) * opQ / maxQ;
    const opY = H - 30 - (H - 40) * opH / maxH;
    ctx.beginPath();
    ctx.arc(opX, opY, 5, 0, 2 * PI);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Labels
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "#374151";
    ctx.textAlign = "center";
    ctx.fillText("Flow Rate (m³/h)", W / 2, H - 6);
    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-PI / 2);
    ctx.fillText("Head (m)", 0, 0);
    ctx.restore();

    // Legend
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(50, 12, 16, 3);
    ctx.fillStyle = "#374151";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Pump Curve", 70, 16);
    ctx.strokeStyle = "#ef4444";
    ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(50, 22); ctx.lineTo(66, 22); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText("System Curve", 70, 26);
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath(); ctx.arc(57, 31, 3, 0, 2 * PI); ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.fillText("Operating Point", 70, 34);
  }, []);

  return (
    <canvas ref={canvasRef} width={width} height={height} style={{ width: "100%", height: height }} />
  );
}

// ============================================================
// PRESSURE PROFILE CHART
// ============================================================
function PressureProfileChart({ pipes, nodes, analysisResults, width = 300, height = 180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, H);

    const margin = { l: 50, r: 15, t: 15, b: 35 };
    const chartW = W - margin.l - margin.r;
    const chartH = H - margin.t - margin.b;

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 6; i++) {
      const y = margin.t + chartH * i / 6;
      ctx.beginPath(); ctx.moveTo(margin.l, y); ctx.lineTo(W - margin.r, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin.l, margin.t); ctx.lineTo(margin.l, H - margin.b);
    ctx.moveTo(margin.l, H - margin.b); ctx.lineTo(W - margin.r, H - margin.b);
    ctx.stroke();

    if (!analysisResults || pipes.length === 0) {
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText("Run analysis to see pressure profile", W / 2, H / 2);
      return;
    }

    const pressures = Object.values(analysisResults).filter(r => r).map(r => r.pressureDrop);
    const maxP = Math.max(...pressures, 1);
    const N = pipes.length;

    // Draw pressure profile
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(59,130,246,0.1)";
    ctx.beginPath();
    let cumDist = 0;
    const totalLen = pipes.reduce((s, p) => s + p.length, 0);
    ctx.moveTo(margin.l, H - margin.b);
    let cumPressure = 0;
    pipes.forEach((pipe, i) => {
      const r = analysisResults[pipe.id];
      if (!r) return;
      const x1 = margin.l + chartW * cumDist / totalLen;
      const x2 = margin.l + chartW * (cumDist + pipe.length) / totalLen;
      const y1 = H - margin.b - chartH * cumPressure / (maxP * N);
      cumPressure += r.pressureDrop;
      const y2 = H - margin.b - chartH * cumPressure / (maxP * N);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      cumDist += pipe.length;
    });
    ctx.lineTo(W - margin.r, H - margin.b);
    ctx.closePath();
    ctx.fill();

    cumDist = 0; cumPressure = 0;
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin.l, H - margin.b);
    pipes.forEach((pipe) => {
      const r = analysisResults[pipe.id];
      if (!r) return;
      const x1 = margin.l + chartW * cumDist / totalLen;
      const x2 = margin.l + chartW * (cumDist + pipe.length) / totalLen;
      const y1 = H - margin.b - chartH * cumPressure / (maxP * N);
      cumPressure += r.pressureDrop;
      const y2 = H - margin.b - chartH * cumPressure / (maxP * N);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      cumDist += pipe.length;
    });
    ctx.stroke();

    // Labels
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "#374151";
    ctx.textAlign = "center";
    ctx.fillText("Pipe Network Distance (m)", W / 2, H - 5);
    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-PI / 2);
    ctx.fillText("Cumulative ΔP (Pa)", 0, 0);
    ctx.restore();

    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#374151";
    ctx.textAlign = "center";
    ctx.fillText("Pressure Profile", W / 2, margin.t + 10);
  }, [pipes, nodes, analysisResults]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ width: "100%", height }} />;
}

// ============================================================
// MOODY DIAGRAM
// ============================================================
function MoodyDiagram({ pipes, analysisResults, width = 500, height = 300 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, H);

    const margin = { l: 60, r: 20, t: 30, b: 40 };
    const cW = W - margin.l - margin.r;
    const cH = H - margin.t - margin.b;

    const logRe = (re) => Math.log10(re);
    const logF = (f) => Math.log10(f);
    const reMin = 100, reMax = 1e8;
    const fMin = 0.005, fMax = 0.1;

    const toX = (re) => margin.l + (logRe(re) - logRe(reMin)) / (logRe(reMax) - logRe(reMin)) * cW;
    const toY = (f) => margin.t + (logF(fMax) - logF(f)) / (logF(fMax) - logF(fMin)) * cH;

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    [1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8].forEach(re => {
      const x = toX(re);
      ctx.beginPath(); ctx.moveTo(x, margin.t); ctx.lineTo(x, H - margin.b); ctx.stroke();
      ctx.font = "8px monospace"; ctx.fillStyle = "#94a3b8"; ctx.textAlign = "center";
      ctx.fillText(`10^${logRe(re).toFixed(0)}`, x, H - margin.b + 12);
    });
    [0.008, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.08].forEach(f => {
      const y = toY(f);
      ctx.beginPath(); ctx.moveTo(margin.l, y); ctx.lineTo(W - margin.r, y); ctx.stroke();
      ctx.font = "8px monospace"; ctx.fillStyle = "#94a3b8"; ctx.textAlign = "right";
      ctx.fillText(f.toFixed(3), margin.l - 4, y + 3);
    });

    // Axes
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin.l, margin.t); ctx.lineTo(margin.l, H - margin.b);
    ctx.moveTo(margin.l, H - margin.b); ctx.lineTo(W - margin.r, H - margin.b);
    ctx.stroke();

    // Laminar line
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let re = reMin; re <= 2300; re *= 1.05) {
      const f = 64 / re;
      if (f > fMax || f < fMin) continue;
      const x = toX(re), y = toY(f);
      if (re === reMin) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Turbulent curves for different roughnesses
    const roughnesses = [0, 0.0001, 0.001, 0.01];
    const rColors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];
    roughnesses.forEach((rr, ri) => {
      ctx.strokeStyle = rColors[ri];
      ctx.lineWidth = 1;
      ctx.beginPath();
      let first = true;
      for (let re = 4000; re <= reMax; re *= 1.05) {
        let f;
        if (rr === 0) {
          f = 0.316 / Math.pow(re, 0.25);
        } else {
          f = colebrook(re, rr, 1.0);
        }
        if (f > fMax || f < fMin) continue;
        const x = toX(re), y = toY(f);
        if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Transition zone
    ctx.fillStyle = "rgba(251,191,36,0.1)";
    ctx.fillRect(toX(2300), margin.t, toX(4000) - toX(2300), cH);
    ctx.font = "7px sans-serif";
    ctx.fillStyle = "#92400e";
    ctx.textAlign = "center";
    ctx.fillText("Trans.", (toX(2300) + toX(4000)) / 2, margin.t + 10);

    // Plot current pipes
    if (analysisResults) {
      pipes.forEach((pipe, i) => {
        const r = analysisResults[pipe.id];
        if (!r) return;
        const re = r.reynolds;
        const f = r.frictionFactor;
        if (re < reMin || re > reMax || f < fMin || f > fMax) return;
        const x = toX(re), y = toY(f);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * PI);
        ctx.fillStyle = "#ef4444";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = "8px sans-serif";
        ctx.fillStyle = "#1e293b";
        ctx.textAlign = "left";
        ctx.fillText(pipe.id, x + 6, y + 3);
      });
    }

    // Title & labels
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#1e293b";
    ctx.textAlign = "center";
    ctx.fillText("Moody Diagram", W / 2, 14);
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "#374151";
    ctx.fillText("Reynolds Number", W / 2, H - 5);
    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-PI / 2);
    ctx.fillText("Friction Factor (f)", 0, 0);
    ctx.restore();
  }, [pipes, analysisResults]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ width: "100%", height }} />;
}

// ============================================================
// TOOLBAR
// ============================================================
function Toolbar({ tool, dispatch, viewTab, setViewTab, colorMode, setColorMode, onRunAnalysis, onExport, onImport, onAddNode, onAddPipe }) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Top menu bar */}
      <div className="flex items-center gap-0 px-2 py-1 border-b border-gray-100 bg-gray-50">
        {[["File", ["New Project", "Open Project...", "Save Project", "Export PDF Report", "Export CSV", "Export DXF/DWG"]],
          ["Edit", ["Undo", "Redo", "Select All", "Delete Selected", "Copy", "Paste"]],
          ["View", ["Zoom In", "Zoom Out", "Fit All", "Reset View", "Toggle Grid", "3D View"]],
          ["Network", ["Add Node", "Add Pipe", "Add Pump", "Add Valve", "Add Fitting", "Auto Layout"]],
          ["Analysis", ["Run Analysis", "Sensitivity Analysis", "Optimization", "Reports", "Batch Run"]],
          ["Help", ["Documentation", "Tutorial", "About PipeFlow Expert"]]
        ].map(([menu, items]) => (
          <MenuButton key={menu} label={menu} items={items} onSelect={(item) => {
            if (item === "Run Analysis") onRunAnalysis();
            else if (item === "Add Node") onAddNode();
            else if (item === "Add Pipe") onAddPipe();
            else if (item === "Export CSV") onExport();
          }} />
        ))}
      </div>

      {/* Toolbar buttons */}
      <div className="flex items-center gap-1 px-2 py-1.5 flex-wrap">
        <div className="flex gap-0.5 border border-gray-200 rounded overflow-hidden">
          {[
            { id: "select", icon: "↖", title: "Select" },
            { id: "pan", icon: "✋", title: "Pan" },
            { id: "node", icon: "⊕", title: "Add Node" },
            { id: "pipe", icon: "—", title: "Add Pipe" },
            { id: "delete", icon: "✕", title: "Delete" },
          ].map(({ id, icon, title }) => (
            <button
              key={id}
              title={title}
              onClick={() => dispatch({ type: "SET_TOOL", tool: id })}
              className={`px-2.5 py-1 text-sm font-bold transition-colors ${tool === id ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              {icon}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <div className="flex gap-0.5">
          {[
            { tab: "canvas", icon: "🗺", label: "Isometric" },
            { tab: "table", icon: "📋", label: "Tables" },
            { tab: "charts", icon: "📊", label: "Charts" },
            { tab: "moody", icon: "📈", label: "Moody" },
            { tab: "report", icon: "📄", label: "Report" },
          ].map(({ tab, icon, label }) => (
            <Btn key={tab} active={viewTab === tab} onClick={() => setViewTab(tab)} size="sm">
              {icon} {label}
            </Btn>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Color:</span>
          <StyledSelect value={colorMode} onChange={e => setColorMode(e.target.value)} className="w-24">
            <option value="material">Material</option>
            <option value="velocity">Velocity</option>
            <option value="pressure">Pressure</option>
          </StyledSelect>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <Btn color="blue" onClick={onRunAnalysis} size="sm">▶ Run Analysis</Btn>
        <Btn color="green" onClick={onExport} size="sm">↓ Export</Btn>
      </div>
    </div>
  );
}

function MenuButton({ label, items, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="px-3 py-1 text-xs font-medium text-gray-700 hover:bg-white rounded hover:shadow-sm"
      >
        {label}
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-0.5 bg-white border border-gray-200 rounded shadow-lg py-1 min-w-36">
          {items.map(item => (
            <button
              key={item}
              className="block w-full text-left px-4 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => { onSelect(item); setOpen(false); }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

// ============================================================
// STATUS BAR
// ============================================================
function StatusBar({ nodes, pipes, analysisResults, fluid, tool }) {
  const totalPower = Object.values(analysisResults || {}).filter(r => r).reduce((s, r) => s + r.powerLoss, 0);
  return (
    <div className="bg-gray-50 border-t border-gray-200 px-3 py-1 flex items-center gap-4 text-xs text-gray-600">
      <span className="font-semibold text-blue-700">PipeFlow Expert</span>
      <span>|</span>
      <span>Nodes: <b>{nodes.length}</b></span>
      <span>Pipes: <b>{pipes.length}</b></span>
      <span>Fluid: <b>{fluid.name}</b></span>
      <span>ρ: <b>{fluid.density} kg/m³</b></span>
      <span>μ: <b>{fluid.viscosity} Pa·s</b></span>
      <span>Total Power Loss: <b>{(totalPower / 1000).toFixed(3)} kW</b></span>
      <div className="ml-auto flex items-center gap-2">
        <span>Tool: <Badge color="blue">{tool}</Badge></span>
        <span>Scroll to zoom · Drag to pan</span>
      </div>
    </div>
  );
}

// ============================================================
// REPORT GENERATOR
// ============================================================
function ReportPanel({ nodes, pipes, analysisResults, fluid }) {
  const totalHeadLoss = Object.values(analysisResults || {}).filter(r => r).reduce((s, r) => s + r.headLossTotal, 0);
  const totalPower = Object.values(analysisResults || {}).filter(r => r).reduce((s, r) => s + r.powerLoss, 0);
  const totalFlow = pipes.reduce((s, p) => s + p.flowRate, 0);
  const date = new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="p-4 bg-white space-y-4 text-sm font-sans max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-2 border-gray-800 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">PIPE NETWORK ANALYSIS REPORT</h1>
            <p className="text-gray-600 text-xs mt-1">Generated by PipeFlow Expert — Hydraulic Analysis Software</p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <div>Date: {date}</div>
            <div>Rev: 1.0</div>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <Card className="p-3">
        <h2 className="font-bold text-gray-800 mb-2 text-base border-b pb-1">1. Project Information</h2>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div><span className="text-gray-500">Project:</span> Pipe Network Analysis</div>
          <div><span className="text-gray-500">Date:</span> {date}</div>
          <div><span className="text-gray-500">Software:</span> PipeFlow Expert</div>
          <div><span className="text-gray-500">Nodes:</span> {nodes.length}</div>
          <div><span className="text-gray-500">Pipes:</span> {pipes.length}</div>
          <div><span className="text-gray-500">Fluid:</span> {fluid.name}</div>
        </div>
      </Card>

      {/* Fluid Properties */}
      <Card className="p-3">
        <h2 className="font-bold text-gray-800 mb-2 text-base border-b pb-1">2. Fluid Properties</h2>
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-gray-500">Fluid Type</div>
            <div className="font-bold">{fluid.name}</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-gray-500">Density</div>
            <div className="font-bold">{fluid.density} kg/m³</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-gray-500">Dynamic Viscosity</div>
            <div className="font-bold">{fluid.viscosity} Pa·s</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-gray-500">Kinematic Viscosity</div>
            <div className="font-bold">{(fluid.viscosity / fluid.density * 1e6).toFixed(4)} mm²/s</div>
          </div>
        </div>
      </Card>

      {/* Network Summary */}
      <Card className="p-3">
        <h2 className="font-bold text-gray-800 mb-2 text-base border-b pb-1">3. Network Summary</h2>
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div className="bg-green-50 p-2 rounded">
            <div className="text-gray-500">Total Flow Rate</div>
            <div className="font-bold text-lg">{totalFlow.toFixed(1)} m³/h</div>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <div className="text-gray-500">Total Head Loss</div>
            <div className="font-bold text-lg">{totalHeadLoss.toFixed(2)} m</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded">
            <div className="text-gray-500">Total Power Loss</div>
            <div className="font-bold text-lg">{(totalPower / 1000).toFixed(3)} kW</div>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <div className="text-gray-500">Total Pipe Length</div>
            <div className="font-bold text-lg">{pipes.reduce((s, p) => s + p.length, 0)} m</div>
          </div>
        </div>
      </Card>

      {/* Pipe Results Table */}
      <Card className="p-3">
        <h2 className="font-bold text-gray-800 mb-2 text-base border-b pb-1">4. Pipe Hydraulic Results</h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {["Pipe ID", "From", "To", "D (mm)", "L (m)", "Q (m³/h)", "V (m/s)", "Re", "f", "hf (m)", "ΔP (kPa)", "Regime"].map(h => (
                <th key={h} className="border border-gray-300 px-2 py-1 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pipes.map((pipe, i) => {
              const r = analysisResults && analysisResults[pipe.id];
              return (
                <tr key={pipe.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-2 py-1 font-bold">{pipe.id}</td>
                  <td className="border border-gray-300 px-2 py-1">{pipe.startNodeId}</td>
                  <td className="border border-gray-300 px-2 py-1">{pipe.endNodeId}</td>
                  <td className="border border-gray-300 px-2 py-1">{pipe.diameter}</td>
                  <td className="border border-gray-300 px-2 py-1">{pipe.length}</td>
                  <td className="border border-gray-300 px-2 py-1">{pipe.flowRate}</td>
                  <td className="border border-gray-300 px-2 py-1">{r ? r.velocity.toFixed(3) : "—"}</td>
                  <td className="border border-gray-300 px-2 py-1">{r ? r.reynolds.toFixed(0) : "—"}</td>
                  <td className="border border-gray-300 px-2 py-1">{r ? r.frictionFactor.toFixed(5) : "—"}</td>
                  <td className="border border-gray-300 px-2 py-1">{r ? r.headLossTotal.toFixed(3) : "—"}</td>
                  <td className="border border-gray-300 px-2 py-1">{r ? (r.pressureDrop / 1000).toFixed(2) : "—"}</td>
                  <td className="border border-gray-300 px-2 py-1">{r ? r.flowRegime : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Calculation Method */}
      <Card className="p-3">
        <h2 className="font-bold text-gray-800 mb-2 text-base border-b pb-1">5. Calculation Methodology</h2>
        <div className="text-xs text-gray-700 space-y-2">
          <p><b>Head Loss:</b> Darcy-Weisbach equation: hf = f × (L/D) × V²/(2g)</p>
          <p><b>Friction Factor:</b> Colebrook-White equation (iterative): 1/√f = -2log(ε/(3.7D) + 2.51/(Re√f))</p>
          <p><b>Laminar Flow (Re &lt; 2300):</b> f = 64/Re</p>
          <p><b>Transitional Flow (2300 ≤ Re &lt; 4000):</b> Linear interpolation between laminar and turbulent</p>
          <p><b>Turbulent Flow (Re ≥ 4000):</b> Colebrook-White iterative solution</p>
          <p><b>Minor Losses:</b> hm = K × V²/(2g) using standard K-factors for fittings</p>
          <p><b>Reynolds Number:</b> Re = ρVD/μ</p>
        </div>
      </Card>

      {/* Standards Reference */}
      <Card className="p-3">
        <h2 className="font-bold text-gray-800 mb-2 text-base border-b pb-1">6. Standards & References</h2>
        <div className="text-xs text-gray-700 grid grid-cols-2 gap-1">
          {["ASME B31.3 Process Piping", "ISO 4200 Steel Pipes", "AWWA C900 PVC Water Main", "BS EN 805 Water Supply",
            "ANSI/HI Pump Standards", "Crane TP-410 Flow of Fluids", "API 5L Pipeline Steel", "NFPA 13 Sprinkler Systems"].map(s => (
            <div key={s} className="flex items-center gap-1">
              <span className="text-blue-500">▸</span> {s}
            </div>
          ))}
        </div>
      </Card>

      <div className="text-center text-xs text-gray-400 border-t pt-2">
        Generated by PipeFlow Expert — Advanced Hydraulic Pipe Network Analysis Software
      </div>
    </div>
  );
}

// ============================================================
// ADD NODE MODAL
// ============================================================
function AddNodeModal({ onAdd, onClose, nodeCount }) {
  const [form, setForm] = useState({
    label: `Node ${nodeCount + 1}`, type: "junction", elevation: 0, pressure: 0, x: 5, y: 5, z: 0
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Card className="w-80 shadow-xl">
        <SectionTitle>➕ Add New Node</SectionTitle>
        <div className="p-2 space-y-1">
          {[
            ["Label", "label", "text"],
            ["Elevation (m)", "elevation", "number"],
            ["Pressure (kPa)", "pressure", "number"],
            ["X Grid", "x", "number"],
            ["Y Grid", "y", "number"],
            ["Z Elevation", "z", "number"],
          ].map(([label, field, type]) => (
            <InputRow key={field} label={label}>
              <StyledInput type={type} value={form[field]} onChange={e => setForm({ ...form, [field]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value })} />
            </InputRow>
          ))}
          <InputRow label="Type">
            <StyledSelect value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="junction">Junction</option>
              <option value="reservoir">Reservoir</option>
              <option value="demand">Demand</option>
              <option value="pump">Pump</option>
              <option value="tank">Tank</option>
            </StyledSelect>
          </InputRow>
        </div>
        <div className="flex justify-end gap-2 px-3 pb-3">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn color="blue" onClick={() => {
            onAdd({ ...form, id: `N${Date.now()}`, pressure: (form.pressure || 0) * 1000 });
            onClose();
          }}>Add Node</Btn>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// ADD PIPE MODAL
// ============================================================
function AddPipeModal({ nodes, onAdd, onClose, pipeCount }) {
  const [form, setForm] = useState({
    label: `Pipe ${pipeCount + 1}`, startNodeId: nodes[0]?.id || "", endNodeId: nodes[1]?.id || "",
    diameter: 100, length: 50, material: "steel", flowRate: 10
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Card className="w-80 shadow-xl">
        <SectionTitle>➕ Add New Pipe</SectionTitle>
        <div className="p-2 space-y-1">
          <InputRow label="Label"><StyledInput value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} /></InputRow>
          <InputRow label="From Node">
            <StyledSelect value={form.startNodeId} onChange={e => setForm({ ...form, startNodeId: e.target.value })}>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.id} — {n.label}</option>)}
            </StyledSelect>
          </InputRow>
          <InputRow label="To Node">
            <StyledSelect value={form.endNodeId} onChange={e => setForm({ ...form, endNodeId: e.target.value })}>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.id} — {n.label}</option>)}
            </StyledSelect>
          </InputRow>
          <InputRow label="Diameter (mm)"><StyledInput type="number" value={form.diameter} onChange={e => setForm({ ...form, diameter: parseFloat(e.target.value) || 50 })} /></InputRow>
          <InputRow label="Length (m)"><StyledInput type="number" value={form.length} onChange={e => setForm({ ...form, length: parseFloat(e.target.value) || 10 })} /></InputRow>
          <InputRow label="Material">
            <StyledSelect value={form.material} onChange={e => setForm({ ...form, material: e.target.value })}>
              {Object.entries(PIPE_MATERIALS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </StyledSelect>
          </InputRow>
          <InputRow label="Flow Rate (m³/h)"><StyledInput type="number" value={form.flowRate} onChange={e => setForm({ ...form, flowRate: parseFloat(e.target.value) || 0 })} /></InputRow>
        </div>
        <div className="flex justify-end gap-2 px-3 pb-3">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn color="blue" onClick={() => {
            onAdd({ ...form, id: `P${Date.now()}`, fittings: [] });
            onClose();
          }}>Add Pipe</Btn>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// SENSITIVITY ANALYSIS PANEL
// ============================================================
function SensitivityPanel({ pipes, analysisResults, fluid }) {
  const canvasRef = useRef(null);
  const [param, setParam] = useState("diameter");
  const [pipeId, setPipeId] = useState(pipes[0]?.id || "");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pipeId) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, H);

    const pipe = pipes.find(p => p.id === pipeId);
    if (!pipe) return;

    const margin = { l: 55, r: 15, t: 30, b: 40 };
    const cW = W - margin.l - margin.r;
    const cH = H - margin.t - margin.b;

    const data = [];
    if (param === "diameter") {
      for (let d = 25; d <= 500; d += 5) {
        const D = d / 1000;
        const Q = pipe.flowRate / 3600;
        const V = calcVelocity(Q, D);
        const Re = calcReynolds(V, D, fluid.density, fluid.viscosity);
        const mat = PIPE_MATERIALS[pipe.material];
        const f = calcFrictionFactor(Re, mat.roughness, D);
        const hf = calcDarcyWeisbach(f, pipe.length, D, V);
        data.push({ x: d, y: hf });
      }
    } else if (param === "flowRate") {
      const D = pipe.diameter / 1000;
      const mat = PIPE_MATERIALS[pipe.material];
      for (let q = 1; q <= 200; q += 2) {
        const Q = q / 3600;
        const V = calcVelocity(Q, D);
        const Re = calcReynolds(V, D, fluid.density, fluid.viscosity);
        const f = calcFrictionFactor(Re, mat.roughness, D);
        const hf = calcDarcyWeisbach(f, pipe.length, D, V);
        data.push({ x: q, y: hf });
      }
    } else if (param === "length") {
      const D = pipe.diameter / 1000;
      const Q = pipe.flowRate / 3600;
      const V = calcVelocity(Q, D);
      const Re = calcReynolds(V, D, fluid.density, fluid.viscosity);
      const mat = PIPE_MATERIALS[pipe.material];
      const f = calcFrictionFactor(Re, mat.roughness, D);
      for (let l = 1; l <= 1000; l += 10) {
        data.push({ x: l, y: calcDarcyWeisbach(f, l, D, V) });
      }
    }

    if (data.length === 0) return;
    const maxX = Math.max(...data.map(d => d.x));
    const maxY = Math.max(...data.map(d => d.y));
    const minY = Math.min(...data.map(d => d.y), 0);

    // Grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = margin.t + cH * i / 5;
      ctx.beginPath(); ctx.moveTo(margin.l, y); ctx.lineTo(W - margin.r, y); ctx.stroke();
      ctx.font = "8px monospace"; ctx.fillStyle = "#94a3b8"; ctx.textAlign = "right";
      ctx.fillText((maxY * (5 - i) / 5).toFixed(1), margin.l - 4, y + 3);
    }

    // Axes
    ctx.strokeStyle = "#374151"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin.l, margin.t); ctx.lineTo(margin.l, H - margin.b);
    ctx.moveTo(margin.l, H - margin.b); ctx.lineTo(W - margin.r, H - margin.b);
    ctx.stroke();

    // Curve
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(59,130,246,0.1)";
    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = margin.l + (pt.x / maxX) * cW;
      const y = H - margin.b - ((pt.y - minY) / (maxY - minY)) * cH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Current value marker
    const curX = param === "diameter" ? pipe.diameter : param === "flowRate" ? pipe.flowRate : pipe.length;
    const curR = analysisResults && analysisResults[pipeId];
    if (curR) {
      const cx = margin.l + (curX / maxX) * cW;
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, margin.t); ctx.lineTo(cx, H - margin.b); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Labels
    ctx.font = "9px sans-serif"; ctx.fillStyle = "#374151"; ctx.textAlign = "center";
    const xLabels = { diameter: "Pipe Diameter (mm)", flowRate: "Flow Rate (m³/h)", length: "Pipe Length (m)" };
    ctx.fillText(xLabels[param], W / 2, H - 5);
    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-PI / 2);
    ctx.fillText("Head Loss (m)", 0, 0);
    ctx.restore();
    ctx.font = "bold 10px sans-serif";
    ctx.fillText(`Sensitivity: Head Loss vs ${param}`, W / 2, 14);
  }, [param, pipeId, pipes, analysisResults, fluid]);

  return (
    <Card>
      <SectionTitle>🔬 Sensitivity Analysis</SectionTitle>
      <div className="p-2 flex gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600">Pipe:</span>
          <StyledSelect value={pipeId} onChange={e => setPipeId(e.target.value)} className="w-24">
            {pipes.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
          </StyledSelect>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600">Parameter:</span>
          <StyledSelect value={param} onChange={e => setParam(e.target.value)} className="w-28">
            <option value="diameter">Diameter</option>
            <option value="flowRate">Flow Rate</option>
            <option value="length">Pipe Length</option>
          </StyledSelect>
        </div>
      </div>
      <canvas ref={canvasRef} width={500} height={220} style={{ width: "100%", height: 220 }} />
    </Card>
  );
}

// ============================================================
// VELOCITY PROFILE CHART
// ============================================================
function VelocityProfileChart({ pipes, analysisResults }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, H);

    if (!analysisResults || pipes.length === 0) {
      ctx.font = "11px sans-serif"; ctx.fillStyle = "#94a3b8"; ctx.textAlign = "center";
      ctx.fillText("Run analysis to view velocity comparison", W / 2, H / 2);
      return;
    }

    const margin = { l: 60, r: 15, t: 30, b: 70 };
    const cW = W - margin.l - margin.r;
    const cH = H - margin.t - margin.b;

    const data = pipes.map(p => {
      const r = analysisResults[p.id];
      return { id: p.id, velocity: r ? r.velocity : 0, regime: r ? r.flowRegime : "" };
    });

    const maxV = Math.max(...data.map(d => d.velocity), 0.1);
    const barW = cW / data.length * 0.7;
    const barGap = cW / data.length;

    // Grid
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = margin.t + cH * i / 5;
      ctx.beginPath(); ctx.moveTo(margin.l, y); ctx.lineTo(W - margin.r, y); ctx.stroke();
      ctx.font = "8px monospace"; ctx.fillStyle = "#94a3b8"; ctx.textAlign = "right";
      ctx.fillText((maxV * (5 - i) / 5).toFixed(2), margin.l - 4, y + 3);
    }

    // Axes
    ctx.strokeStyle = "#374151"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin.l, margin.t); ctx.lineTo(margin.l, H - margin.b);
    ctx.moveTo(margin.l, H - margin.b); ctx.lineTo(W - margin.r, H - margin.b);
    ctx.stroke();

    // Recommended velocity lines
    [1.5, 3.0].forEach((v, i) => {
      const y = H - margin.b - (v / maxV) * cH;
      ctx.strokeStyle = i === 0 ? "#22c55e" : "#ef4444";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(margin.l, y); ctx.lineTo(W - margin.r, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "8px sans-serif"; ctx.fillStyle = i === 0 ? "#16a34a" : "#dc2626";
      ctx.textAlign = "right";
      ctx.fillText(i === 0 ? "Recommended Max (1.5m/s)" : "Design Limit (3.0m/s)", W - margin.r, y - 2);
    });

    // Bars
    data.forEach((d, i) => {
      const x = margin.l + i * barGap + (barGap - barW) / 2;
      const barH = (d.velocity / maxV) * cH;
      const y = H - margin.b - barH;

      const color = d.velocity > 3 ? "#ef4444" : d.velocity > 1.5 ? "#f59e0b" : "#22c55e";
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barW, barH);
      ctx.strokeStyle = "white"; ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, barW, barH);

      ctx.font = "8px monospace"; ctx.fillStyle = "#374151"; ctx.textAlign = "center";
      ctx.fillText(d.id, x + barW / 2, H - margin.b + 12);
      ctx.fillText(d.velocity.toFixed(2), x + barW / 2, y - 3);

      // Regime badge
      const bColor = d.regime === "Laminar" ? "#16a34a" : d.regime === "Turbulent" ? "#dc2626" : "#d97706";
      ctx.font = "7px sans-serif"; ctx.fillStyle = bColor;
      ctx.fillText(d.regime?.slice(0, 4) || "", x + barW / 2, H - margin.b + 22);
    });

    // Title
    ctx.font = "bold 10px sans-serif"; ctx.fillStyle = "#1e293b"; ctx.textAlign = "center";
    ctx.fillText("Velocity Comparison by Pipe", W / 2, 14);
    ctx.font = "9px sans-serif"; ctx.fillStyle = "#374151";
    ctx.fillText("Pipe ID", W / 2, H - margin.b + 35);
    ctx.save(); ctx.translate(12, H / 2); ctx.rotate(-PI / 2);
    ctx.fillText("Velocity (m/s)", 0, 0);
    ctx.restore();
  }, [pipes, analysisResults]);

  return <canvas ref={canvasRef} width={500} height={220} style={{ width: "100%", height: 220 }} />;
}

// ============================================================
// MAIN APP
// ============================================================
const initialState = {
  nodes: initialNodes,
  pipes: initialPipes,
  fluid: FLUID_PRESETS.water,
  selected: null,
  tool: "select",
  view: "isometric",
};

export default function PipeFlowExpert() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [viewTab, setViewTab] = useState("canvas");
  const [colorMode, setColorMode] = useState("material");
  const [rightPanel, setRightPanel] = useState("properties");
  const [showAddNode, setShowAddNode] = useState(false);
  const [showAddPipe, setShowAddPipe] = useState(false);

  const { nodes, pipes, fluid, selected, tool } = state;

  const handleRunAnalysis = useCallback(() => {
    const results = analyzeNetwork(nodes, pipes, fluid);
    setAnalysisResults(results);
  }, [nodes, pipes, fluid]);

  useEffect(() => {
    handleRunAnalysis();
  }, [handleRunAnalysis]);

  const handleSelect = useCallback((item) => {
    if (!item) { dispatch({ type: "SET_SELECTED", selected: null }); return; }
    if (item._delete) {
      if (item._type === "node") dispatch({ type: "DELETE_NODE", id: item.id });
      else dispatch({ type: "DELETE_PIPE", id: item.id });
      dispatch({ type: "SET_SELECTED", selected: null });
      return;
    }
    if (item._newPipe) {
      dispatch({ type: "ADD_PIPE", pipe: { id: `P${Date.now()}`, label: `Pipe ${pipes.length + 1}`, startNodeId: item.startNodeId, endNodeId: item.endNodeId, diameter: 100, length: 50, material: "steel", flowRate: 10, fittings: [] } });
      return;
    }
    dispatch({ type: "SET_SELECTED", selected: item });
  }, [pipes.length]);

  const handleNodeAdd = useCallback((pos) => {
    const node = { id: `N${Date.now()}`, label: `Node ${nodes.length + 1}`, type: "junction", elevation: 0, pressure: 0, x: pos.x, y: pos.y, z: pos.z };
    dispatch({ type: "ADD_NODE", node });
  }, [nodes.length]);

  const handleExport = useCallback(() => {
    const headers = ["Pipe ID", "From", "To", "Diameter(mm)", "Length(m)", "Material", "FlowRate(m3h)", "Velocity(ms)", "Reynolds", "FrictionFactor", "HeadLoss(m)", "PressureDrop(kPa)", "Regime"];
    const rows = pipes.map(p => {
      const r = analysisResults && analysisResults[p.id];
      return [p.id, p.startNodeId, p.endNodeId, p.diameter, p.length, p.material, p.flowRate,
        r ? r.velocity.toFixed(3) : "", r ? r.reynolds.toFixed(0) : "", r ? r.frictionFactor.toFixed(6) : "",
        r ? r.headLossTotal.toFixed(3) : "", r ? (r.pressureDrop / 1000).toFixed(2) : "", r ? r.flowRegime : ""];
    });
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "pipeflow_analysis.csv"; a.click();
    URL.revokeObjectURL(url);
  }, [pipes, analysisResults]);

  const selectedNode = selected && nodes.find(n => n.id === selected.id);
  const selectedPipe = selected && pipes.find(p => p.id === selected.id);
  const selectedPipeResult = selectedPipe && analysisResults && analysisResults[selectedPipe.id];

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans overflow-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Title Bar */}
      <div className="bg-blue-700 text-white px-4 py-1.5 flex items-center gap-3 shadow">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">🔧</span>
          <span className="font-bold text-sm tracking-wide">PipeFlow Expert</span>
          <Badge color="gray">v3.0</Badge>
        </div>
        <span className="text-blue-200 text-xs">Advanced Hydraulic Pipe Network Analysis</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-blue-200">Darcy-Weisbach · Colebrook-White · Isometric View</span>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        tool={tool}
        dispatch={dispatch}
        viewTab={viewTab}
        setViewTab={setViewTab}
        colorMode={colorMode}
        setColorMode={setColorMode}
        onRunAnalysis={handleRunAnalysis}
        onExport={handleExport}
        onImport={() => {}}
        onAddNode={() => setShowAddNode(true)}
        onAddPipe={() => setShowAddPipe(true)}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-sm">
          <div className="flex border-b border-gray-200">
            {[["props", "⚙ Props"], ["fluid", "💧 Fluid"], ["network", "🌐 Net"]].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setRightPanel(id)}
                className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${rightPanel === id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="overflow-y-auto flex-1 p-1.5 space-y-2">
            {rightPanel === "props" && (
              <>
                {selectedNode && <NodePanel node={selectedNode} dispatch={dispatch} />}
                {selectedPipe && <PipePanel pipe={selectedPipe} dispatch={dispatch} />}
                {!selectedNode && !selectedPipe && (
                  <div className="text-center p-4 text-xs text-gray-400">
                    <div className="text-2xl mb-2">↖</div>
                    <div>Click to select a node or pipe</div>
                    <div className="mt-4 space-y-1">
                      <Btn color="blue" size="sm" onClick={() => setShowAddNode(true)} className="w-full">+ Add Node</Btn>
                      <Btn color="green" size="sm" onClick={() => setShowAddPipe(true)} className="w-full">+ Add Pipe</Btn>
                    </div>
                  </div>
                )}
                {selectedPipe && <ResultsPanel pipe={selectedPipe} result={selectedPipeResult} fluid={fluid} />}
              </>
            )}
            {rightPanel === "fluid" && <FluidPanel fluid={fluid} dispatch={dispatch} />}
            {rightPanel === "network" && <NetworkSummaryPanel nodes={nodes} pipes={pipes} analysisResults={analysisResults} fluid={fluid} />}
          </div>
        </div>

        {/* MAIN CANVAS / VIEWS */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewTab === "canvas" && (
            <div className="flex-1 overflow-hidden bg-slate-50 relative">
              <IsometricCanvas
                nodes={nodes}
                pipes={pipes}
                analysisResults={analysisResults}
                selected={selected}
                onSelect={handleSelect}
                tool={tool}
                onNodeAdd={handleNodeAdd}
                viewMode="isometric"
                colorMode={colorMode}
              />
              {/* Overlay info */}
              <div className="absolute top-2 right-2 bg-white/90 border border-gray-200 rounded p-2 text-xs shadow">
                <div className="font-semibold text-gray-700 mb-1">Legend</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-600" /><span>Source/Reservoir</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-600" /><span>Junction</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-600" /><span>Demand Node</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-600" /><span>Pump</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-600" /><span>Fitting Marker</span></div>
                <hr className="my-1" />
                <div className="text-gray-500">Scroll = Zoom</div>
                <div className="text-gray-500">Pan Tool = Move</div>
              </div>
            </div>
          )}

          {viewTab === "table" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <PipeTablePanel pipes={pipes} nodes={nodes} analysisResults={analysisResults} onSelectPipe={(p) => dispatch({ type: "SET_SELECTED", selected: p })} />
              <NodeTablePanel nodes={nodes} onSelectNode={(n) => dispatch({ type: "SET_SELECTED", selected: n })} />
            </div>
          )}

          {viewTab === "charts" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <SectionTitle>📈 Pump Curve & System Curve</SectionTitle>
                  <div className="p-2"><PumpCurveChart width={450} height={200} /></div>
                </Card>
                <Card>
                  <SectionTitle>📉 Pressure Profile</SectionTitle>
                  <div className="p-2"><PressureProfileChart pipes={pipes} nodes={nodes} analysisResults={analysisResults} width={450} height={200} /></div>
                </Card>
              </div>
              <Card>
                <SectionTitle>💨 Velocity Comparison</SectionTitle>
                <div className="p-2"><VelocityProfileChart pipes={pipes} analysisResults={analysisResults} /></div>
              </Card>
              <SensitivityPanel pipes={pipes} analysisResults={analysisResults} fluid={fluid} />
            </div>
          )}

          {viewTab === "moody" && (
            <div className="flex-1 overflow-y-auto p-3">
              <Card>
                <SectionTitle>📈 Moody Diagram — Friction Factor vs Reynolds Number</SectionTitle>
                <div className="p-2">
                  <MoodyDiagram pipes={pipes} analysisResults={analysisResults} width={800} height={420} />
                </div>
                <div className="px-3 pb-3 text-xs text-gray-500">
                  Red dots represent current pipe operating points. Green line = laminar (f=64/Re). Colored curves = Colebrook-White for different roughness ratios.
                </div>
              </Card>
            </div>
          )}

          {viewTab === "report" && (
            <div className="flex-1 overflow-y-auto p-3">
              <ReportPanel nodes={nodes} pipes={pipes} analysisResults={analysisResults} fluid={fluid} />
            </div>
          )}
        </div>

        {/* RIGHT MINI PANEL */}
        <div className="w-52 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
          <SectionTitle>🗂 Elements</SectionTitle>
          <div className="p-1.5 space-y-1">
            <div className="text-xs font-semibold text-gray-500 px-1 py-0.5">NODES ({nodes.length})</div>
            {nodes.map(node => (
              <div
                key={node.id}
                onClick={() => dispatch({ type: "SET_SELECTED", selected: node })}
                className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${selected?.id === node.id ? "bg-blue-100 border border-blue-300" : "hover:bg-gray-50"}`}
              >
                <div className={`w-2 h-2 rounded-full ${node.type === "reservoir" ? "bg-blue-600" : node.type === "demand" ? "bg-red-500" : "bg-green-500"}`} />
                <span className="font-mono font-bold text-gray-700">{node.id}</span>
                <span className="text-gray-500 truncate">{node.label}</span>
              </div>
            ))}
            <div className="text-xs font-semibold text-gray-500 px-1 py-0.5 mt-2">PIPES ({pipes.length})</div>
            {pipes.map(pipe => {
              const r = analysisResults && analysisResults[pipe.id];
              return (
                <div
                  key={pipe.id}
                  onClick={() => dispatch({ type: "SET_SELECTED", selected: pipe })}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${selected?.id === pipe.id ? "bg-orange-100 border border-orange-300" : "hover:bg-gray-50"}`}
                >
                  <div className="w-4 h-0.5 bg-gray-500 rounded" />
                  <span className="font-mono font-bold text-orange-700">{pipe.id}</span>
                  <span className="text-gray-500">{pipe.diameter}mm</span>
                  {r && <span className={`ml-auto font-mono text-xs ${r.velocity > 3 ? "text-red-600" : r.velocity > 1.5 ? "text-yellow-600" : "text-green-600"}`}>{r.velocity.toFixed(1)}</span>}
                </div>
              );
            })}
          </div>

          <div className="mt-auto p-2 border-t border-gray-100 space-y-1">
            <Btn color="blue" size="xs" onClick={() => setShowAddNode(true)} className="w-full">+ Node</Btn>
            <Btn color="green" size="xs" onClick={() => setShowAddPipe(true)} className="w-full">+ Pipe</Btn>
            <Btn color="orange" size="xs" onClick={handleRunAnalysis} className="w-full">▶ Analyze</Btn>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar nodes={nodes} pipes={pipes} analysisResults={analysisResults} fluid={fluid} tool={tool} />

      {/* Modals */}
      {showAddNode && (
        <AddNodeModal
          nodeCount={nodes.length}
          onAdd={(node) => dispatch({ type: "ADD_NODE", node })}
          onClose={() => setShowAddNode(false)}
        />
      )}
      {showAddPipe && (
        <AddPipeModal
          nodes={nodes}
          pipeCount={pipes.length}
          onAdd={(pipe) => dispatch({ type: "ADD_PIPE", pipe })}
          onClose={() => setShowAddPipe(false)}
        />
      )}
    </div>
  );
}
