/**
 * NetworkCanvas — Interactive CFD Pipe Network Editor
 * =====================================================
 * 2D orthographic canvas with full pipe-drawing and node-connection support.
 *
 * HOW TO CONNECT NODES WITH A PIPE:
 *   1. Click the "Add Pipe" tool button in the toolbar (pipe icon)
 *   2. Click the FIRST node (it turns amber/orange with a dashed ring)
 *   3. Move the mouse — a dashed blue preview line follows your cursor
 *   4. Click the SECOND node — the pipe is created instantly
 *   5. Repeat for more pipes. Press Escape to cancel mid-draw.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Stage, Layer, Circle, Line, Text, Arrow, Group, Rect, RegularPolygon } from 'react-konva'
import type Konva from 'konva'
import type { Node, Pipe, CanvasNodeData, CanvasPipeData } from '@/api/client'

// ── Constants ────────────────────────────────────────────────────────────────

const NODE_RADIUS = 14
const NODE_RADIUS_RESERVOIR = 18
const GRID_SIZE = 24

const NODE_TYPE_COLORS: Record<string, { fill: string; stroke: string }> = {
  junction:    { fill: '#ffffff',  stroke: '#0e87ea' },
  reservoir:   { fill: '#dbeafe',  stroke: '#1d4ed8' },
  tank:        { fill: '#d1fae5',  stroke: '#059669' },
  pump_inlet:  { fill: '#fef3c7',  stroke: '#d97706' },
  pump_outlet: { fill: '#fef3c7',  stroke: '#d97706' },
  valve_node:  { fill: '#fce7f3',  stroke: '#be185d' },
}

// ── Types ────────────────────────────────────────────────────────────────────

export type CanvasTool = 'select' | 'pan' | 'add_node' | 'add_pipe'

interface Props {
  networkId: string
  nodes: Node[]
  pipes: Pipe[]
  canvasNodes?: CanvasNodeData[]
  canvasPipes?: CanvasPipeData[]
  tool: CanvasTool
  selectedNodeId: string | null
  selectedPipeId: string | null
  showLabels: boolean
  showArrows: boolean
  showGrid: boolean
  width: number
  height: number
  onNodeClick: (id: string) => void
  onPipeClick: (id: string) => void
  onNodeDragEnd: (id: string, x: number, y: number) => void
  onCanvasClick: (x: number, y: number) => void
  onPipeDrawn: (fromId: string, toId: string) => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function snapToGrid(v: number) { return Math.round(v / GRID_SIZE) * GRID_SIZE }
function midpoint(x1: number, y1: number, x2: number, y2: number) {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
}
function buildNodeMap(nodes: Node[]): Record<string, Node> {
  return Object.fromEntries(nodes.map(n => [n.id, n]))
}
function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function NetworkCanvas({
  networkId, nodes, pipes,
  canvasNodes, canvasPipes,
  tool, selectedNodeId, selectedPipeId,
  showLabels, showArrows, showGrid,
  width, height,
  onNodeClick, onPipeClick, onNodeDragEnd, onCanvasClick, onPipeDrawn,
}: Props) {
  const stageRef = useRef<Konva.Stage>(null)

  // Pipe-drawing state
  const [drawFrom, setDrawFrom] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  // Viewport
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const nodeMap = buildNodeMap(nodes)

  const canvasNodeMap: Record<string, CanvasNodeData> = Object.fromEntries(
    (canvasNodes ?? []).map(n => [n.id, n])
  )
  const canvasPipeMap: Record<string, CanvasPipeData> = Object.fromEntries(
    (canvasPipes ?? []).map(p => [p.id, p])
  )

  // Cancel pipe drawing with Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDrawFrom(null); setMousePos(null) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Reset drawFrom when tool changes away from add_pipe
  useEffect(() => {
    if (tool !== 'add_pipe') { setDrawFrom(null); setMousePos(null) }
  }, [tool])

  // ── Zoom ─────────────────────────────────────────────────────────────────

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current!
    const scaleBy = 1.08
    const pointer = stage.getPointerPosition()!
    const mousePointTo = {
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale,
    }
    const newScale = e.evt.deltaY < 0
      ? Math.min(scale * scaleBy, 8)
      : Math.max(scale / scaleBy, 0.1)
    setScale(newScale)
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
  }, [scale])

  // ── Stage background click ────────────────────────────────────────────────

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== stageRef.current) return
    const pos = stageRef.current!.getRelativePointerPosition()!
    if (tool === 'add_node') {
      onCanvasClick(snapToGrid(pos.x), snapToGrid(pos.y))
    } else if (tool === 'add_pipe') {
      // Clicked empty canvas: cancel current draw
      setDrawFrom(null)
      setMousePos(null)
    } else {
      // Deselect
      onNodeClick('')
    }
  }, [tool, onCanvasClick, onNodeClick])

  // ── Mouse move: track cursor for pipe preview line ────────────────────────

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool !== 'add_pipe') return
    const pos = stageRef.current!.getRelativePointerPosition()!
    setMousePos({ x: pos.x, y: pos.y })
  }, [tool])

  // ── Node click: connect pipe ──────────────────────────────────────────────

  const handleNodeClick = useCallback((nodeId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    if (tool === 'add_pipe') {
      if (!drawFrom) {
        // First click: set source node
        setDrawFrom(nodeId)
      } else if (drawFrom === nodeId) {
        // Clicked same node: cancel
        setDrawFrom(null)
        setMousePos(null)
      } else {
        // Second click: create pipe
        onPipeDrawn(drawFrom, nodeId)
        setDrawFrom(null)
        setMousePos(null)
      }
    } else {
      onNodeClick(nodeId)
    }
  }, [tool, drawFrom, onNodeClick, onPipeDrawn])

  // ── Render: pipes ─────────────────────────────────────────────────────────

  const renderPipes = () => pipes.map(pipe => {
    const fromNode = nodeMap[pipe.node_from_id]
    const toNode   = nodeMap[pipe.node_to_id]
    if (!fromNode || !toNode) return null

    const cPipe     = canvasPipeMap[pipe.id]
    const isSelected = pipe.id === selectedPipeId
    const color     = cPipe?.color ?? pipe.color_override ?? '#94a3b8'
    const lineW     = Math.max(2, Math.min(14, (pipe.line_width ?? 4) * scale * 0.8))

    let points: number[]
    if (pipe.waypoints && pipe.waypoints.length > 0) {
      points = [fromNode.x, fromNode.y,
        ...pipe.waypoints.flat(),
        toNode.x, toNode.y]
    } else {
      points = [fromNode.x, fromNode.y, toNode.x, toNode.y]
    }

    const mid      = midpoint(fromNode.x, fromNode.y, toNode.x, toNode.y)
    const flow     = cPipe?.flow_m3s ?? 0
    const velocity = cPipe?.velocity_m_s ?? 0
    const angle    = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x) * 180 / Math.PI

    return (
      <Group key={pipe.id} onClick={(e) => { e.cancelBubble = true; onPipeClick(pipe.id) }}>
        {/* Selection glow */}
        {isSelected && (
          <Line points={points} stroke="#0e87ea" strokeWidth={lineW + 6}
            lineCap="round" lineJoin="round" opacity={0.2} />
        )}
        {/* Pipe body */}
        <Line
          points={points}
          stroke={color}
          strokeWidth={lineW}
          lineCap="round"
          lineJoin="round"
          shadowColor={isSelected ? '#0e87ea' : undefined}
          shadowBlur={isSelected ? 6 : 0}
          shadowOpacity={0.4}
        />
        {/* Flow arrow */}
        {showArrows && Math.abs(flow) > 1e-9 && (
          <Arrow
            x={mid.x} y={mid.y}
            points={[-8, 0, 8, 0]}
            pointerLength={7} pointerWidth={7}
            fill={color} stroke={color} strokeWidth={1.5}
            rotation={flow >= 0 ? angle : angle + 180}
          />
        )}
        {/* Labels */}
        {showLabels && scale > 0.5 && (
          <Text x={mid.x - 30} y={mid.y - 18} width={60} align="center"
            text={pipe.label} fontSize={10} fill="#334155" fontFamily="Inter" />
        )}
        {showLabels && scale > 0.7 && velocity !== 0 && (
          <Text x={mid.x - 35} y={mid.y + 5} width={70} align="center"
            text={`${Math.abs(velocity).toFixed(2)} m/s`}
            fontSize={9} fill="#64748b" fontFamily="monospace" />
        )}
      </Group>
    )
  })

  // ── Render: nodes ─────────────────────────────────────────────────────────

  const renderNodes = () => nodes.map(node => {
    const cNode      = canvasNodeMap[node.id]
    const styles     = NODE_TYPE_COLORS[node.node_type] ?? NODE_TYPE_COLORS.junction
    const r          = node.node_type === 'reservoir' ? NODE_RADIUS_RESERVOIR : NODE_RADIUS
    const isSelected = node.id === selectedNodeId
    const isFrom     = node.id === drawFrom          // source of pipe being drawn
    const isHovered  = node.id === hoveredNodeId && tool === 'add_pipe' && drawFrom && drawFrom !== node.id

    return (
      <Group
        key={node.id}
        x={node.x} y={node.y}
        draggable={tool === 'select'}
        onDragEnd={(e) => onNodeDragEnd(node.id,
          snapToGrid(e.target.x()), snapToGrid(e.target.y()))}
        onClick={(e) => handleNodeClick(node.id, e)}
        onMouseEnter={() => setHoveredNodeId(node.id)}
        onMouseLeave={() => setHoveredNodeId(null)}
      >
        {/* Hover glow for target node */}
        {isHovered && (
          <Circle radius={r + 8} fill="#10b98122" stroke="#10b981"
            strokeWidth={2} dash={[5, 3]} />
        )}
        {/* Source node ring (amber) */}
        {isFrom && (
          <Circle radius={r + 6} fill="#f59e0b22" stroke="#f59e0b"
            strokeWidth={2} dash={[4, 3]} />
        )}
        {/* Selection ring (blue) */}
        {isSelected && !isFrom && (
          <Circle radius={r + 5} fill="#0e87ea18" stroke="#0e87ea"
            strokeWidth={2} dash={[4, 3]} />
        )}
        {/* Node shape */}
        {node.node_type === 'reservoir' ? (
          <>
            <Rect x={-r} y={-r} width={r * 2} height={r * 2}
              fill={styles.fill} stroke={isFrom ? '#f59e0b' : styles.stroke}
              strokeWidth={isFrom ? 2.5 : 2} cornerRadius={4} />
            <Text x={-r} y={-7} width={r * 2} align="center"
              text="~" fontSize={16} fill={styles.stroke} />
          </>
        ) : node.node_type === 'tank' ? (
          <>
            <Rect x={-r} y={-r} width={r * 2} height={r * 2}
              fill={styles.fill} stroke={isFrom ? '#f59e0b' : styles.stroke}
              strokeWidth={isFrom ? 2.5 : 2} cornerRadius={2} />
            <Line points={[-r + 3, 4, r - 3, 4]} stroke={styles.stroke} strokeWidth={1.5} />
          </>
        ) : (
          <Circle radius={r}
            fill={isHovered ? '#ecfdf5' : styles.fill}
            stroke={isFrom ? '#f59e0b' : isSelected ? '#0e87ea' : isHovered ? '#10b981' : styles.stroke}
            strokeWidth={isFrom || isSelected ? 2.5 : 2}
            shadowColor={isSelected ? '#0e87ea' : isFrom ? '#f59e0b' : undefined}
            shadowBlur={isSelected || isFrom ? 6 : 0}
          />
        )}
        {/* Node label */}
        {showLabels && scale > 0.4 && (
          <Text x={-40} y={r + 4} width={80} align="center"
            text={node.label} fontSize={10} fill="#1e293b"
            fontFamily="Inter" fontStyle="500" />
        )}
        {/* Pressure head overlay */}
        {showLabels && scale > 0.6 && cNode?.pressure_head_m != null && (
          <Text x={-30} y={-(r + 16)} width={60} align="center"
            text={`${cNode.pressure_head_m.toFixed(1)}m`}
            fontSize={9} fill="#0e87ea" fontFamily="monospace" />
        )}
        {/* Fixed head marker */}
        {node.fixed_head_m != null && (
          <Circle radius={3} fill="#1d4ed8" y={-r - 7} />
        )}
      </Group>
    )
  })

  // ── Cursor ────────────────────────────────────────────────────────────────

  const cursor = {
    select:   'default',
    pan:      'grab',
    add_node: 'crosshair',
    add_pipe: drawFrom ? 'cell' : 'crosshair',
  }[tool]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-[#f8fafc]"
      style={{ width, height, cursor }}
    >
      {/* CSS grid background */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)`,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundPosition: `${position.x % GRID_SIZE}px ${position.y % GRID_SIZE}px`,
        }} />
      )}

      <Stage
        ref={stageRef}
        width={width} height={height}
        scaleX={scale} scaleY={scale}
        x={position.x} y={position.y}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        draggable={tool === 'pan'}
        onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
      >
        {/* Pipes */}
        <Layer>
          {renderPipes()}

          {/* Live preview line while drawing a pipe */}
          {tool === 'add_pipe' && drawFrom && mousePos && (() => {
            const from = nodeMap[drawFrom]
            if (!from) return null
            // Snap preview end to nearby node
            const nearby = nodes.find(n =>
              n.id !== drawFrom && dist(n.x, n.y, mousePos.x, mousePos.y) < 24
            )
            const endX = nearby ? nearby.x : mousePos.x
            const endY = nearby ? nearby.y : mousePos.y
            return (
              <>
                <Line
                  points={[from.x, from.y, endX, endY]}
                  stroke="#0e87ea"
                  strokeWidth={3}
                  dash={[10, 5]}
                  opacity={0.75}
                  lineCap="round"
                />
                {/* Snap indicator ring on target */}
                {nearby && (
                  <Circle x={nearby.x} y={nearby.y}
                    radius={NODE_RADIUS + 10}
                    stroke="#10b981" strokeWidth={2}
                    fill="#10b98115" dash={[4, 3]} />
                )}
              </>
            )
          })()}
        </Layer>

        {/* Nodes on top */}
        <Layer>
          {renderNodes()}
        </Layer>
      </Stage>

      {/* ── Pipe-drawing instruction banner ── */}
      {tool === 'add_pipe' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium shadow-lg
            ${drawFrom
              ? 'bg-amber-500 text-white'
              : 'bg-slate-800/85 backdrop-blur-sm text-white'}`}
          >
            {drawFrom ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Click a second node to connect — or press Esc to cancel
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Click the START node
              </>
            )}
          </div>
        </div>
      )}

      {tool === 'add_node' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-slate-800/85 backdrop-blur-sm text-white shadow-lg">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Click anywhere on the canvas to place a node
          </div>
        </div>
      )}

      {/* Scale indicator */}
      <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-mono bg-white/90 px-2 py-1 rounded-md border border-slate-200 pointer-events-none">
        {Math.round(scale * 100)}%
      </div>
    </div>
  )
}
