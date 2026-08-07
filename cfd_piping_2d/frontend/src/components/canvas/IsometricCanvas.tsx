/**
 * IsometricCanvas — 3D Isometric View of Pipe Network
 * =====================================================
 * Renders the pipe network in a classic engineering isometric projection.
 *
 * ISOMETRIC PROJECTION:
 *   World coordinates (x, y, z) map to screen as:
 *     screen_x = (x - y) * cos(30°)
 *     screen_y = (x + y) * sin(30°) - z
 *
 *   The z-axis is the node elevation (elevation_m).
 *   The x-axis comes from the canvas x position / SCALE.
 *   The y-axis comes from the canvas y position / SCALE.
 *
 * FEATURES:
 *   - Isometric grid (diamond-pattern floor)
 *   - Pipes rendered as 3D tubes with top-face highlight
 *   - Node elevation shown as vertical columns
 *   - CFD result colors on pipes (velocity, pressure, etc.)
 *   - Flow direction arrows
 *   - Pressure head labels floating above nodes
 *   - Zoom and pan
 *   - Rotate view (toggle between 3 isometric angles: 30°, 150°, 270°)
 */

import React, { useRef, useState, useCallback } from 'react'
import { Stage, Layer, Line, Circle, Text, Group, Rect, Arrow } from 'react-konva'
import type Konva from 'konva'
import type { Node, Pipe, CanvasNodeData, CanvasPipeData } from '@/api/client'

// ── Constants ────────────────────────────────────────────────────────────────

const ISO_ANGLE = Math.PI / 6      // 30 degrees
const COS30 = Math.cos(ISO_ANGLE)  // ≈ 0.866
const SIN30 = Math.sin(ISO_ANGLE)  // 0.5
const WORLD_SCALE = 2.0            // canvas pixels → world units
const ELEV_SCALE  = 3.0            // elevation meter → pixels per meter
const GRID_CELLS  = 20
const GRID_STEP   = 48             // world units per grid cell

const NODE_TYPE_COLORS: Record<string, { fill: string; stroke: string; top: string }> = {
  junction:    { fill: '#bfdbfe', stroke: '#1d4ed8', top: '#dbeafe' },
  reservoir:   { fill: '#93c5fd', stroke: '#1e40af', top: '#bfdbfe' },
  tank:        { fill: '#6ee7b7', stroke: '#047857', top: '#a7f3d0' },
  pump_inlet:  { fill: '#fcd34d', stroke: '#b45309', top: '#fef3c7' },
  pump_outlet: { fill: '#fcd34d', stroke: '#b45309', top: '#fef3c7' },
  valve_node:  { fill: '#f9a8d4', stroke: '#9d174d', top: '#fce7f3' },
}

// ── Isometric projection ──────────────────────────────────────────────────────

/**
 * Convert world (wx, wy, wz) → screen (sx, sy)
 * wx, wy: world X/Y (derived from canvas node x,y positions)
 * wz: elevation in world units (elevation_m * ELEV_SCALE)
 * angle: rotation offset in radians (0, π/3, 2π/3 for 3 views)
 */
function isoProject(wx: number, wy: number, wz: number, angle: number = 0) {
  const rx = wx * Math.cos(angle) - wy * Math.sin(angle)
  const ry = wx * Math.sin(angle) + wy * Math.cos(angle)
  const sx = (rx - ry) * COS30
  const sy = (rx + ry) * SIN30 - wz
  return { sx, sy }
}

function nodeToWorld(node: Node) {
  return {
    wx: node.x / WORLD_SCALE,
    wy: node.y / WORLD_SCALE,
    wz: (node.elevation_m ?? 0) * ELEV_SCALE,
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface IsoCanvasProps {
  nodes: Node[]
  pipes: Pipe[]
  canvasNodes?: CanvasNodeData[]
  canvasPipes?: CanvasPipeData[]
  showLabels: boolean
  showArrows: boolean
  showGrid: boolean
  width: number
  height: number
  onNodeClick: (id: string) => void
  onPipeClick: (id: string) => void
  selectedNodeId: string | null
  selectedPipeId: string | null
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function IsometricCanvas({
  nodes, pipes, canvasNodes, canvasPipes,
  showLabels, showArrows, showGrid,
  width, height,
  onNodeClick, onPipeClick,
  selectedNodeId, selectedPipeId,
}: IsoCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [scale, setScale]     = useState(1.0)
  const [offset, setOffset]   = useState({ x: width / 2, y: height / 2 })
  const [viewAngle, setViewAngle] = useState(0) // 0, π/3, or 2π/3

  const canvasPipeMap: Record<string, CanvasPipeData> = Object.fromEntries(
    (canvasPipes ?? []).map(p => [p.id, p])
  )
  const canvasNodeMap: Record<string, CanvasNodeData> = Object.fromEntries(
    (canvasNodes ?? []).map(n => [n.id, n])
  )

  // Center of all nodes (for initial viewport)
  const centerX = nodes.length ? nodes.reduce((s, n) => s + n.x, 0) / nodes.length / WORLD_SCALE : 0
  const centerY = nodes.length ? nodes.reduce((s, n) => s + n.y, 0) / nodes.length / WORLD_SCALE : 0

  // Project a node to screen space (accounting for offset, scale)
  function project(wx: number, wy: number, wz: number) {
    const { sx, sy } = isoProject(wx - centerX, wy - centerY, wz, viewAngle)
    return {
      x: offset.x + sx * scale,
      y: offset.y + sy * scale,
    }
  }

  // ── Zoom ─────────────────────────────────────────────────────────────────

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const scaleBy = 1.1
    const newScale = e.evt.deltaY < 0
      ? Math.min(scale * scaleBy, 10)
      : Math.max(scale / scaleBy, 0.1)
    setScale(newScale)
  }, [scale])

  // ── Render: isometric grid floor ─────────────────────────────────────────

  const renderGrid = () => {
    if (!showGrid) return null
    const lines: React.ReactNode[] = []
    const half = GRID_CELLS / 2
    for (let i = -half; i <= half; i++) {
      // Lines along Y axis (constant X)
      const a = project(i * GRID_STEP / WORLD_SCALE, -half * GRID_STEP / WORLD_SCALE, 0)
      const b = project(i * GRID_STEP / WORLD_SCALE,  half * GRID_STEP / WORLD_SCALE, 0)
      lines.push(<Line key={`gx${i}`} points={[a.x, a.y, b.x, b.y]}
        stroke="#e2e8f0" strokeWidth={0.8} />)
      // Lines along X axis (constant Y)
      const c = project(-half * GRID_STEP / WORLD_SCALE, i * GRID_STEP / WORLD_SCALE, 0)
      const d = project( half * GRID_STEP / WORLD_SCALE, i * GRID_STEP / WORLD_SCALE, 0)
      lines.push(<Line key={`gy${i}`} points={[c.x, c.y, d.x, d.y]}
        stroke="#e2e8f0" strokeWidth={0.8} />)
    }
    return lines
  }

  // ── Render: pipes as isometric tubes ─────────────────────────────────────

  const renderPipes = () => pipes.map(pipe => {
    const fromNode = nodes.find(n => n.id === pipe.node_from_id)
    const toNode   = nodes.find(n => n.id === pipe.node_to_id)
    if (!fromNode || !toNode) return null

    const cPipe      = canvasPipeMap[pipe.id]
    const isSelected = pipe.id === selectedPipeId
    const color      = cPipe?.color ?? pipe.color_override ?? '#94a3b8'
    const darkColor  = shadeColor(color, -25)
    const flow       = cPipe?.flow_m3s ?? 0
    const velocity   = cPipe?.velocity_m_s ?? 0

    const fw = nodeToWorld(fromNode)
    const tw = nodeToWorld(toNode)
    const fp = project(fw.wx, fw.wy, fw.wz)
    const tp = project(tw.wx, tw.wy, tw.wz)

    const D  = (pipe.diameter_m ?? 0.1) * WORLD_SCALE * scale * 2
    const hw = Math.max(2, Math.min(12, D))  // half-width for tube effect

    // Pipe tube: draw as thick line + top highlight
    const midX = (fp.x + tp.x) / 2
    const midY = (fp.y + tp.y) / 2

    return (
      <Group key={pipe.id} onClick={(e) => { e.cancelBubble = true; onPipeClick(pipe.id) }}>
        {/* Selection glow */}
        {isSelected && (
          <Line points={[fp.x, fp.y, tp.x, tp.y]}
            stroke="#0e87ea" strokeWidth={hw * 3 + 6}
            lineCap="round" opacity={0.15} />
        )}

        {/* Pipe shadow/body (darker, wider) */}
        <Line
          points={[fp.x, fp.y, tp.x, tp.y]}
          stroke={darkColor}
          strokeWidth={hw * 2.5}
          lineCap="round"
        />

        {/* Pipe highlight (lighter, narrower, offset) */}
        <Line
          points={[fp.x - 1.5, fp.y - 2, tp.x - 1.5, tp.y - 2]}
          stroke={lightenColor(color, 30)}
          strokeWidth={hw * 0.9}
          lineCap="round"
          opacity={0.7}
        />

        {/* Main pipe surface */}
        <Line
          points={[fp.x, fp.y, tp.x, tp.y]}
          stroke={color}
          strokeWidth={hw * 1.8}
          lineCap="round"
          opacity={0.9}
        />

        {/* Flow arrow */}
        {showArrows && Math.abs(flow) > 1e-9 && (
          <Arrow
            x={midX} y={midY}
            points={[-8, 0, 8, 0]}
            pointerLength={7} pointerWidth={7}
            fill="white" stroke="white" strokeWidth={1.5} opacity={0.9}
            rotation={
              (flow >= 0
                ? Math.atan2(tp.y - fp.y, tp.x - fp.x)
                : Math.atan2(fp.y - tp.y, fp.x - tp.x)
              ) * 180 / Math.PI
            }
          />
        )}

        {/* Pipe label */}
        {showLabels && scale > 0.6 && (
          <Text x={midX - 25} y={midY - 20} width={50} align="center"
            text={pipe.label}
            fontSize={9} fill="#334155"
            fontFamily="Inter"
            padding={2}
          />
        )}

        {/* Velocity label */}
        {showLabels && scale > 0.8 && velocity !== 0 && (
          <Text x={midX - 30} y={midY + 6} width={60} align="center"
            text={`${Math.abs(velocity).toFixed(2)} m/s`}
            fontSize={8} fill="#64748b" fontFamily="monospace"
          />
        )}
      </Group>
    )
  })

  // ── Render: nodes as isometric cylinders / pillars ─────────────────────

  const renderNodes = () => nodes.map(node => {
    const w = nodeToWorld(node)
    const styles  = NODE_TYPE_COLORS[node.node_type] ?? NODE_TYPE_COLORS.junction
    const cNode   = canvasNodeMap[node.id]
    const isSelected = node.id === selectedNodeId

    // Base position (at floor level, z=0)
    const basePos = project(w.wx, w.wy, 0)
    // Top position (at node elevation)
    const topPos  = project(w.wx, w.wy, w.wz)

    const R  = 10 * scale         // node circle radius
    const elevPx = basePos.y - topPos.y  // pixel height of elevation column

    return (
      <Group key={node.id}
        onClick={(e) => { e.cancelBubble = true; onNodeClick(node.id) }}
      >
        {/* Elevation column (vertical pillar) */}
        {elevPx > 3 && (
          <>
            {/* Column sides */}
            <Line
              points={[topPos.x - R * 0.6, topPos.y, basePos.x - R * 0.6, basePos.y]}
              stroke={styles.stroke} strokeWidth={R * 1.2}
              lineCap="butt" opacity={0.15}
            />
            {/* Column outline left */}
            <Line
              points={[topPos.x - R * 0.6, topPos.y, basePos.x - R * 0.6, basePos.y]}
              stroke={styles.stroke} strokeWidth={1} opacity={0.4}
            />
            {/* Column outline right */}
            <Line
              points={[topPos.x + R * 0.6, topPos.y, basePos.x + R * 0.6, basePos.y]}
              stroke={styles.stroke} strokeWidth={1} opacity={0.4}
            />
            {/* Floor base dot */}
            <Circle x={basePos.x} y={basePos.y} radius={4}
              fill={styles.stroke} opacity={0.3} />
          </>
        )}

        {/* Selection ring */}
        {isSelected && (
          <Circle x={topPos.x} y={topPos.y} radius={R + 7}
            stroke="#0e87ea" strokeWidth={2} dash={[4, 3]}
            fill="#0e87ea10" />
        )}

        {/* Node circle (top) — isometric ellipse approximated as circle */}
        <Circle x={topPos.x} y={topPos.y} radius={R}
          fill={styles.fill}
          stroke={isSelected ? '#0e87ea' : styles.stroke}
          strokeWidth={isSelected ? 2.5 : 2}
          shadowColor={isSelected ? '#0e87ea' : undefined}
          shadowBlur={isSelected ? 8 : 0}
        />

        {/* Node type symbol */}
        {node.node_type === 'reservoir' && (
          <Text x={topPos.x - R} y={topPos.y - 7} width={R * 2}
            align="center" text="~" fontSize={14} fill={styles.stroke} />
        )}
        {node.node_type === 'pump_inlet' || node.node_type === 'pump_outlet' ? (
          <Text x={topPos.x - R} y={topPos.y - 6} width={R * 2}
            align="center" text="P" fontSize={10} fill={styles.stroke}
            fontStyle="bold" />
        ) : null}

        {/* Node label */}
        {showLabels && scale > 0.4 && (
          <Text x={topPos.x - 30} y={topPos.y - R - 18}
            width={60} align="center"
            text={node.label}
            fontSize={10} fill="#1e293b"
            fontFamily="Inter" fontStyle="500"
          />
        )}

        {/* Elevation label */}
        {showLabels && scale > 0.5 && (node.elevation_m ?? 0) > 0 && (
          <Text x={topPos.x + R + 3} y={topPos.y - 5}
            text={`z=${node.elevation_m?.toFixed(1)}m`}
            fontSize={8} fill="#64748b" fontFamily="monospace"
          />
        )}

        {/* Pressure head overlay */}
        {showLabels && scale > 0.6 && cNode?.pressure_head_m != null && (
          <Text x={topPos.x - 30} y={topPos.y - R - 32}
            width={60} align="center"
            text={`H=${cNode.pressure_head_m.toFixed(1)}m`}
            fontSize={9} fill="#0e87ea" fontFamily="monospace"
          />
        )}

        {/* Fixed head marker */}
        {node.fixed_head_m != null && (
          <Circle x={topPos.x} y={topPos.y - R - 5} radius={3} fill="#1d4ed8" />
        )}
      </Group>
    )
  })

  // ── Rotate view ───────────────────────────────────────────────────────────

  const rotateView = () => {
    setViewAngle(a => (a + Math.PI / 3) % (Math.PI * 2))
  }

  // ── Axes indicator ────────────────────────────────────────────────────────

  const renderAxes = () => {
    const origin = { x: 60, y: height - 60 }
    const len = 30
    // X axis (red)
    const xEnd = isoProject(len, 0, 0, viewAngle)
    // Y axis (green)
    const yEnd = isoProject(0, len, 0, viewAngle)
    // Z axis (blue, vertical)
    const zEnd = isoProject(0, 0, len, viewAngle)

    return (
      <Group>
        <Line points={[origin.x, origin.y, origin.x + xEnd.sx, origin.y + xEnd.sy]}
          stroke="#ef4444" strokeWidth={2} />
        <Text x={origin.x + xEnd.sx + 3} y={origin.y + xEnd.sy - 6}
          text="X" fontSize={10} fill="#ef4444" fontStyle="bold" />

        <Line points={[origin.x, origin.y, origin.x + yEnd.sx, origin.y + yEnd.sy]}
          stroke="#10b981" strokeWidth={2} />
        <Text x={origin.x + yEnd.sx + 3} y={origin.y + yEnd.sy - 6}
          text="Y" fontSize={10} fill="#10b981" fontStyle="bold" />

        <Line points={[origin.x, origin.y, origin.x + zEnd.sx, origin.y + zEnd.sy]}
          stroke="#3b82f6" strokeWidth={2} />
        <Text x={origin.x + zEnd.sx - 4} y={origin.y + zEnd.sy - 14}
          text="Z" fontSize={10} fill="#3b82f6" fontStyle="bold" />

        <Circle x={origin.x} y={origin.y} radius={4} fill="#64748b" />
      </Group>
    )
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-slate-200"
      style={{
        width, height,
        background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      {/* View angle label */}
      <div className="absolute top-3 left-3 bg-white/90 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 pointer-events-none shadow-sm">
        Isometric · {Math.round(viewAngle * 180 / Math.PI)}°
      </div>

      <Stage
        ref={stageRef}
        width={width} height={height}
        onWheel={handleWheel}
        draggable
        onDragEnd={(e) => setOffset(prev => ({
          x: prev.x + e.target.x(),
          y: prev.y + e.target.y(),
        }))}
        onDragMove={(e) => {
          // Live pan
        }}
        x={0} y={0}
      >
        <Layer>
          {/* Grid */}
          {renderGrid()}

          {/* Pipes behind nodes */}
          {renderPipes()}

          {/* Nodes on top */}
          {renderNodes()}

          {/* Axis indicator (fixed in screen space) */}
          {renderAxes()}
        </Layer>
      </Stage>

      {/* Rotate button */}
      <button
        className="absolute top-3 right-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-colors"
        onClick={rotateView}
      >
        <span>↻</span> Rotate View
      </button>

      {/* Scale indicator */}
      <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-mono bg-white/90 px-2 py-1 rounded-md border border-slate-200 pointer-events-none">
        {Math.round(scale * 100)}%
      </div>

      {/* Elevation legend */}
      {nodes.some(n => (n.elevation_m ?? 0) > 0) && (
        <div className="absolute bottom-3 left-3 bg-white/90 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 shadow-sm pointer-events-none">
          <div className="font-semibold text-slate-700 mb-1">Elevation</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-t from-slate-200 to-blue-400 rounded" />
            <div className="flex flex-col justify-between h-6 text-[10px] font-mono">
              <span>{Math.max(...nodes.map(n => n.elevation_m ?? 0)).toFixed(1)}m</span>
              <span>0m</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">
          <div className="text-center">
            <div className="text-3xl mb-2">📐</div>
            <div className="text-sm">No nodes to display</div>
            <div className="text-xs mt-1">Add nodes in the 2D editor first</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Color utilities ───────────────────────────────────────────────────────────

function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + percent))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent))
  const b = Math.max(0, Math.min(255, (num & 0xff) + percent))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function lightenColor(hex: string, amount: number): string {
  return shadeColor(hex, amount)
}
