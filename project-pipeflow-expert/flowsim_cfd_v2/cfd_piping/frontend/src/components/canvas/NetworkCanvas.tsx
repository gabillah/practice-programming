/**
 * NetworkCanvas — Interactive CFD Pipe Network Editor
 * =====================================================
 * Built with react-konva for high-performance 2D canvas rendering.
 *
 * Features:
 *  - Drag-and-drop node placement
 *  - Interactive pipe drawing (click-to-connect)
 *  - CFD result color mapping on pipes
 *  - Zoom / pan
 *  - Node/pipe selection with property panel
 *  - Flow direction arrows
 *  - Pressure head labels
 */

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Stage, Layer, Circle, Line, Text, Arrow, Group, Rect } from 'react-konva'
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

const REGIME_STROKE_COLORS: Record<string, string> = {
  laminar:          '#3b82f6',
  transitional:     '#f59e0b',
  turbulent_smooth: '#10b981',
  turbulent_rough:  '#f97316',
  fully_turbulent:  '#ef4444',
}

// ── Types ────────────────────────────────────────────────────────────────────

export type CanvasTool = 'select' | 'pan' | 'add_node' | 'add_pipe'

export interface CanvasNodeState extends CanvasNodeData {
  radius?: number
}

export interface CanvasPipeState extends CanvasPipeData {
  // computed
  x1: number; y1: number
  x2: number; y2: number
}

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

// ── Helper ───────────────────────────────────────────────────────────────────

function snapToGrid(v: number): number {
  return Math.round(v / GRID_SIZE) * GRID_SIZE
}

function midpoint(x1: number, y1: number, x2: number, y2: number) {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
}

function buildNodeMap(nodes: Node[]): Record<string, Node> {
  return Object.fromEntries(nodes.map(n => [n.id, n]))
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

  // For pipe drawing tool
  const [drawFrom, setDrawFrom] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  // Scale / position
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const nodeMap = buildNodeMap(nodes)

  // Result overlay maps
  const canvasNodeMap: Record<string, CanvasNodeData> = Object.fromEntries(
    (canvasNodes ?? []).map(n => [n.id, n])
  )
  const canvasPipeMap: Record<string, CanvasPipeData> = Object.fromEntries(
    (canvasPipes ?? []).map(p => [p.id, p])
  )

  // ── Zoom ─────────────────────────────────────────────────────────────────

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current!
    const oldScale = scale
    const scaleBy = 1.08
    const pointer = stage.getPointerPosition()!
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }
    const newScale = e.evt.deltaY < 0
      ? Math.min(oldScale * scaleBy, 8)
      : Math.max(oldScale / scaleBy, 0.15)

    setScale(newScale)
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
  }, [scale])

  // ── Stage click ──────────────────────────────────────────────────────────

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== stageRef.current) return
    const stage = stageRef.current!
    const pos = stage.getRelativePointerPosition()!
    if (tool === 'add_node') {
      onCanvasClick(snapToGrid(pos.x), snapToGrid(pos.y))
    } else if (tool === 'add_pipe') {
      setDrawFrom(null)
    }
  }, [tool, onCanvasClick])

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool !== 'add_pipe' || !drawFrom) return
    const stage = stageRef.current!
    const pos = stage.getRelativePointerPosition()!
    setMousePos({ x: pos.x, y: pos.y })
  }, [tool, drawFrom])

  // ── Node click ────────────────────────────────────────────────────────────

  const handleNodeClick = useCallback((nodeId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    if (tool === 'add_pipe') {
      if (!drawFrom) {
        setDrawFrom(nodeId)
      } else if (drawFrom !== nodeId) {
        onPipeDrawn(drawFrom, nodeId)
        setDrawFrom(null)
        setMousePos(null)
      }
    } else {
      onNodeClick(nodeId)
    }
  }, [tool, drawFrom, onNodeClick, onPipeDrawn])

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderGrid = () => {
    if (!showGrid) return null
    const lines: React.ReactNode[] = []
    const step = GRID_SIZE
    const cols = Math.ceil(width / step) + 2
    const rows = Math.ceil(height / step) + 2
    for (let i = 0; i < cols; i++) {
      lines.push(
        <Line key={`vg${i}`}
          points={[i * step, 0, i * step, rows * step]}
          stroke="#e2e8f0" strokeWidth={0.5} />
      )
    }
    for (let j = 0; j < rows; j++) {
      lines.push(
        <Line key={`hg${j}`}
          points={[0, j * step, cols * step, j * step]}
          stroke="#e2e8f0" strokeWidth={0.5} />
      )
    }
    return <Layer>{lines}</Layer>
  }

  const renderPipes = () => {
    return pipes.map(pipe => {
      const fromNode = nodeMap[pipe.node_from_id]
      const toNode   = nodeMap[pipe.node_to_id]
      if (!fromNode || !toNode) return null

      const cPipe = canvasPipeMap[pipe.id]
      const isSelected = pipe.id === selectedPipeId

      const color  = cPipe?.color ?? pipe.color_override ?? '#94a3b8'
      const regime = cPipe?.flow_regime
      const lineW  = Math.max(2, Math.min(14, (cPipe?.line_width ?? pipe.line_width ?? 4) * scale * 0.8))

      // Waypoints or straight line
      let points: number[]
      if (pipe.waypoints && pipe.waypoints.length > 0) {
        points = [fromNode.x, fromNode.y]
        for (const [wx, wy] of pipe.waypoints) {
          points.push(wx, wy)
        }
        points.push(toNode.x, toNode.y)
      } else {
        points = [fromNode.x, fromNode.y, toNode.x, toNode.y]
      }

      const mid = midpoint(fromNode.x, fromNode.y, toNode.x, toNode.y)
      const flow = cPipe?.flow_m3s ?? 0
      const velocity = cPipe?.velocity_m_s ?? 0

      return (
        <Group key={pipe.id} onClick={(e) => { e.cancelBubble = true; onPipeClick(pipe.id) }}>
          {/* Pipe line */}
          <Line
            points={points}
            stroke={color}
            strokeWidth={lineW}
            lineCap="round"
            lineJoin="round"
            shadowColor={isSelected ? '#0e87ea' : undefined}
            shadowBlur={isSelected ? 8 : 0}
            shadowOpacity={0.5}
          />

          {/* Selection highlight */}
          {isSelected && (
            <Line
              points={points}
              stroke="#0e87ea"
              strokeWidth={lineW + 4}
              lineCap="round"
              lineJoin="round"
              opacity={0.25}
            />
          )}

          {/* Flow direction arrow */}
          {showArrows && Math.abs(flow) > 1e-9 && (
            <Arrow
              x={0} y={0}
              points={[mid.x - 8, mid.y, mid.x + 8, mid.y]}
              pointerLength={6}
              pointerWidth={6}
              fill={color}
              stroke={color}
              strokeWidth={1.5}
              rotation={
                flow >= 0
                  ? Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x) * 180 / Math.PI
                  : Math.atan2(fromNode.y - toNode.y, fromNode.x - toNode.x) * 180 / Math.PI
              }
              offsetX={-mid.x}
              offsetY={-mid.y}
            />
          )}

          {/* Pipe label */}
          {showLabels && scale > 0.5 && (
            <Text
              x={mid.x - 30}
              y={mid.y - 18}
              width={60}
              align="center"
              text={pipe.label}
              fontSize={10}
              fill="#334155"
              fontFamily="Inter"
            />
          )}

          {/* Velocity overlay */}
          {showLabels && scale > 0.7 && cPipe?.velocity_m_s != null && (
            <Text
              x={mid.x - 35}
              y={mid.y + 5}
              width={70}
              align="center"
              text={`${Math.abs(velocity).toFixed(2)} m/s`}
              fontSize={9}
              fill="#64748b"
              fontFamily="JetBrains Mono, monospace"
            />
          )}
        </Group>
      )
    })
  }

  const renderNodes = () => {
    return nodes.map(node => {
      const cNode = canvasNodeMap[node.id]
      const styles = NODE_TYPE_COLORS[node.node_type] ?? NODE_TYPE_COLORS.junction
      const r = node.node_type === 'reservoir' ? NODE_RADIUS_RESERVOIR : NODE_RADIUS
      const isSelected = node.id === selectedNodeId
      const isDrawFrom = node.id === drawFrom

      return (
        <Group
          key={node.id}
          x={node.x}
          y={node.y}
          draggable={tool === 'select'}
          onDragEnd={(e) => {
            const snap = true
            const x = snap ? snapToGrid(e.target.x()) : e.target.x()
            const y = snap ? snapToGrid(e.target.y()) : e.target.y()
            onNodeDragEnd(node.id, x, y)
          }}
          onClick={(e) => handleNodeClick(node.id, e)}
        >
          {/* Selection ring */}
          {(isSelected || isDrawFrom) && (
            <Circle
              radius={r + 5}
              fill={isDrawFrom ? '#f59e0b22' : '#0e87ea22'}
              stroke={isDrawFrom ? '#f59e0b' : '#0e87ea'}
              strokeWidth={1.5}
              dash={[4, 3]}
            />
          )}

          {/* Reservoir: special shape */}
          {node.node_type === 'reservoir' ? (
            <>
              <Rect
                x={-r} y={-r}
                width={r * 2} height={r * 2}
                fill={styles.fill}
                stroke={styles.stroke}
                strokeWidth={2}
                cornerRadius={4}
              />
              <Text
                x={-r} y={-6}
                width={r * 2}
                align="center"
                text="≈"
                fontSize={14}
                fill={styles.stroke}
              />
            </>
          ) : (
            <Circle
              radius={r}
              fill={styles.fill}
              stroke={isSelected ? '#0e87ea' : styles.stroke}
              strokeWidth={isSelected ? 2.5 : 2}
              shadowColor={isSelected ? '#0e87ea' : undefined}
              shadowBlur={isSelected ? 6 : 0}
            />
          )}

          {/* Node label */}
          {showLabels && scale > 0.4 && (
            <Text
              x={-40} y={r + 4}
              width={80}
              align="center"
              text={node.label}
              fontSize={10}
              fill="#1e293b"
              fontFamily="Inter"
              fontStyle="500"
            />
          )}

          {/* Pressure head overlay */}
          {showLabels && scale > 0.6 && cNode?.pressure_head_m != null && (
            <Text
              x={-30} y={-(r + 16)}
              width={60}
              align="center"
              text={`${cNode.pressure_head_m.toFixed(1)}m`}
              fontSize={9}
              fill="#0e87ea"
              fontFamily="JetBrains Mono, monospace"
            />
          )}

          {/* Fixed head symbol */}
          {node.fixed_head_m != null && (
            <Circle radius={3} fill="#1d4ed8" y={-r - 6} />
          )}
        </Group>
      )
    })
  }

  // ── Cursor style ─────────────────────────────────────────────────────────

  const cursorStyle = {
    select:   'default',
    pan:      'grab',
    add_node: 'crosshair',
    add_pipe: 'cell',
  }[tool]

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-[#f8fafc]"
      style={{ width, height, cursor: cursorStyle }}
    >
      {/* Canvas background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: showGrid
            ? `linear-gradient(rgba(148,163,184,0.2) 1px, transparent 1px),
               linear-gradient(90deg, rgba(148,163,184,0.2) 1px, transparent 1px)`
            : undefined,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      />

      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        draggable={tool === 'pan'}
        onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
      >
        {/* Pipe layer */}
        <Layer>
          {renderPipes()}

          {/* Live pipe drawing preview */}
          {tool === 'add_pipe' && drawFrom && mousePos && (() => {
            const fromNode = nodeMap[drawFrom]
            if (!fromNode) return null
            return (
              <Line
                points={[fromNode.x, fromNode.y, mousePos.x, mousePos.y]}
                stroke="#0e87ea"
                strokeWidth={3}
                dash={[8, 4]}
                opacity={0.7}
              />
            )
          })()}
        </Layer>

        {/* Node layer */}
        <Layer>
          {renderNodes()}
        </Layer>
      </Stage>

      {/* Tool hint */}
      {(tool === 'add_node' || tool === 'add_pipe') && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-sm text-white text-xs rounded-full px-3 py-1.5 pointer-events-none">
          {tool === 'add_node' && '✦ Click on canvas to place node'}
          {tool === 'add_pipe' && (drawFrom
            ? '→ Now click a second node to connect'
            : '→ Click the starting node')}
        </div>
      )}

      {/* Scale indicator */}
      <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-mono bg-white/80 px-2 py-1 rounded-md border border-slate-200">
        {Math.round(scale * 100)}%
      </div>
    </div>
  )
}
