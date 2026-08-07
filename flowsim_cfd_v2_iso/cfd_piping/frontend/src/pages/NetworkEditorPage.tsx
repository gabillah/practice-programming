/**
 * NetworkEditorPage — Full CFD Pipe Network Editor
 * -------------------------------------------------
 * Two view modes:
 *   2D (Plan View) — Interactive editor: add nodes, draw pipes, run CFD
 *   3D (Isometric) — Read-only isometric projection with elevation
 *
 * HOW TO CONNECT NODES WITH A PIPE:
 *   1. Select the "Add Pipe" tool (pipe icon in toolbar)
 *   2. Click the first (source) node — it highlights in amber
 *   3. A dashed blue preview line follows your mouse
 *   4. Click the second (target) node — pipe is created
 *   5. Press Escape to cancel mid-draw
 */

import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MousePointer2, Hand, PlusCircle, Minus, Play,
  Eye, EyeOff, Grid3x3, ArrowLeft, Layers,
  Trash2, Box, LayoutTemplate,
} from 'lucide-react'
import api from '@/api/client'
import type { CanvasTool } from '@/components/canvas/NetworkCanvas'
import NetworkCanvas from '@/components/canvas/NetworkCanvas'
import IsometricCanvas from '@/components/canvas/IsometricCanvas'
import PropertiesPanel from '@/components/canvas/PropertiesPanel'
import ColormapLegend from '@/components/canvas/ColormapLegend'
import { Spinner, StatusBadge } from '@/components/ui'
import { clsx } from 'clsx'

const COLOR_FIELDS = [
  { key: 'velocity',        label: 'Velocity',       unit: 'm/s' },
  { key: 'pressure_drop',   label: 'Pressure Drop',  unit: 'Pa' },
  { key: 'reynolds',        label: 'Reynolds No.',   unit: '-' },
  { key: 'head_loss',       label: 'Head Loss',      unit: 'm' },
  { key: 'turbulence',      label: 'Turbulence',     unit: '%' },
  { key: 'friction_factor', label: 'Friction f',     unit: '-' },
]

const COLORMAPS = ['viridis', 'plasma', 'RdYlBu', 'coolwarm', 'jet', 'hot']

type ViewMode = '2d' | 'iso'

export default function NetworkEditorPage() {
  const { projectId, networkId } = useParams<{ projectId: string; networkId: string }>()
  const navigate  = useNavigate()
  const qc        = useQueryClient()

  const [viewMode, setViewMode]       = useState<ViewMode>('2d')
  const [tool, setTool]               = useState<CanvasTool>('select')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedPipeId, setSelectedPipeId] = useState<string | null>(null)
  const [showLabels, setShowLabels]   = useState(true)
  const [showArrows, setShowArrows]   = useState(true)
  const [showGrid, setShowGrid]       = useState(true)
  const [colorField, setColorField]   = useState('velocity')
  const [colormap, setColormap]       = useState('viridis')
  const [activeSimId, setActiveSimId] = useState<string | null>(null)
  const [simPollEnabled, setSimPollEnabled] = useState(false)

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: network, isLoading: netLoading } = useQuery({
    queryKey: ['network', networkId],
    queryFn: () => api.getNetwork(networkId!),
    enabled: !!networkId,
  })

  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['nodes', networkId],
    queryFn: () => api.listNodes(networkId!),
    enabled: !!networkId,
  })

  const { data: pipes = [] } = useQuery({
    queryKey: ['pipes', networkId],
    queryFn: () => api.listPipes(networkId!),
    enabled: !!networkId,
  })

  const { data: activeSim } = useQuery({
    queryKey: ['sim', activeSimId],
    queryFn: () => api.getSimulation(activeSimId!),
    enabled: !!activeSimId && simPollEnabled,
    refetchInterval: 2000,
  })

  useEffect(() => {
    if (activeSim?.status === 'converged' || activeSim?.status === 'failed') {
      setSimPollEnabled(false)
      qc.invalidateQueries({ queryKey: ['canvas', networkId] })
    }
  }, [activeSim?.status])

  const { data: canvasData } = useQuery({
    queryKey: ['canvas', networkId, activeSimId, colorField, colormap],
    queryFn: () => api.exportCanvas({
      network_id: networkId!,
      simulation_id: activeSimId ?? undefined,
      color_field: colorField,
      colormap,
    }),
    enabled: !!networkId,
  })

  const { data: simResults } = useQuery({
    queryKey: ['simResults', activeSimId],
    queryFn: () => api.getSimulationResults(activeSimId!),
    enabled: !!activeSimId && activeSim?.status === 'converged',
  })

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createNode = useMutation({
    mutationFn: (pos: { x: number; y: number }) =>
      api.createNode({
        network_id: networkId!,
        label: `N${nodes.length + 1}`,
        node_type: 'junction',
        x: pos.x, y: pos.y,
        elevation_m: 0,
        demand_m3s: 0,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nodes', networkId] }),
  })

  const createPipe = useMutation({
    mutationFn: ({ fromId, toId }: { fromId: string; toId: string }) =>
      api.createPipe({
        network_id: networkId!,
        node_from_id: fromId,
        node_to_id:   toId,
        label: `P${pipes.length + 1}`,
        diameter_m: 0.10,
        length_m:   100,
        roughness_m: 4.6e-5,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipes', networkId] }),
  })

  const updateNode = useMutation({
    mutationFn: ({ id, x, y }: { id: string; x: number; y: number }) =>
      api.updateNode(id, { x, y }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nodes', networkId] }),
  })

  const deleteNode = useMutation({
    mutationFn: (id: string) => api.deleteNode(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nodes', networkId] })
      qc.invalidateQueries({ queryKey: ['pipes', networkId] })
      setSelectedNodeId(null)
    },
  })

  const deletePipe = useMutation({
    mutationFn: (id: string) => api.deletePipe(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipes', networkId] })
      setSelectedPipeId(null)
    },
  })

  const runSim = useMutation({
    mutationFn: () => api.createSimulation({
      network_id: networkId!,
      name: `Run ${new Date().toLocaleTimeString()}`,
      solver_settings: { max_iterations: 500, convergence_tol: 1e-7, use_gradient_method: true },
    }),
    onSuccess: (sim) => { setActiveSimId(sim.id); setSimPollEnabled(true) },
  })

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleNodeDragEnd = useCallback((id: string, x: number, y: number) => {
    updateNode.mutate({ id, x, y })
  }, [])

  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (tool === 'add_node') createNode.mutate({ x, y })
  }, [tool])

  const handlePipeDrawn = useCallback((fromId: string, toId: string) => {
    createPipe.mutate({ fromId, toId })
  }, [])

  const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null
  const selectedPipe = pipes.find(p => p.id === selectedPipeId) ?? null
  const pipeResult   = simResults?.pipe_results?.[selectedPipeId ?? ''] ?? null
  const nodeResult   = simResults?.node_results?.[selectedNodeId ?? ''] ?? null

  const canvasW = Math.max(600, (network?.canvas_width ?? 1200) -
    (selectedNode || selectedPipe ? 288 : 0))
  const canvasH = network?.canvas_height ?? 700

  if (netLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="h-12 shrink-0 bg-white border-b border-slate-200 flex items-center px-4 gap-2">
        {/* Back */}
        <button className="btn-ghost btn-sm gap-1.5 text-xs" onClick={() => navigate('/projects')}>
          <ArrowLeft size={13} />
          <span className="text-slate-600 max-w-[120px] truncate">{network?.name}</span>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
          <button
            title="2D Plan View"
            className={clsx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
              viewMode === '2d'
                ? 'bg-white shadow-sm text-flow-700'
                : 'text-slate-500 hover:text-slate-700')}
            onClick={() => setViewMode('2d')}
          >
            <LayoutTemplate size={13} /> 2D
          </button>
          <button
            title="3D Isometric View"
            className={clsx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
              viewMode === 'iso'
                ? 'bg-white shadow-sm text-flow-700'
                : 'text-slate-500 hover:text-slate-700')}
            onClick={() => setViewMode('iso')}
          >
            <Box size={13} /> Isometric
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* 2D tools (hidden in iso mode) */}
        {viewMode === '2d' && (
          <>
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
              {([
                ['select',   MousePointer2, 'Select (V)'],
                ['pan',      Hand,          'Pan (H)'],
                ['add_node', PlusCircle,    'Add Node (N)'],
                ['add_pipe', Minus,         'Add Pipe — click 2 nodes (P)'],
              ] as const).map(([t, Icon, label]) => (
                <button
                  key={t}
                  title={label}
                  className={clsx(
                    'p-1.5 rounded-md transition-all',
                    tool === t
                      ? 'bg-white shadow-sm text-flow-600'
                      : 'text-slate-500 hover:text-slate-800',
                  )}
                  onClick={() => setTool(t)}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1" />
          </>
        )}

        {/* Visibility toggles */}
        <button title="Labels" className={clsx('btn-sm p-1.5 rounded-lg', showLabels ? 'text-flow-600 bg-flow-50' : 'btn-ghost')} onClick={() => setShowLabels(v => !v)}>
          {showLabels ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button title="Flow Arrows" className={clsx('btn-sm p-1.5 rounded-lg', showArrows ? 'text-flow-600 bg-flow-50' : 'btn-ghost')} onClick={() => setShowArrows(v => !v)}>
          <Layers size={14} />
        </button>
        <button title="Grid" className={clsx('btn-sm p-1.5 rounded-lg', showGrid ? 'text-flow-600 bg-flow-50' : 'btn-ghost')} onClick={() => setShowGrid(v => !v)}>
          <Grid3x3 size={14} />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Color field + colormap */}
        <select className="select py-1 text-xs w-36" value={colorField}
          onChange={e => setColorField(e.target.value)}>
          {COLOR_FIELDS.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
        <select className="select py-1 text-xs w-24" value={colormap}
          onChange={e => setColormap(e.target.value)}>
          {COLORMAPS.map(cm => <option key={cm} value={cm}>{cm}</option>)}
        </select>

        <div className="flex-1" />

        {/* Stats */}
        <div className="text-xs text-slate-400 flex gap-3">
          <span>{nodes.length} nodes</span>
          <span>{pipes.length} pipes</span>
        </div>

        {/* Delete */}
        {(selectedNodeId || selectedPipeId) && (
          <button
            className="btn-danger btn-sm gap-1.5"
            onClick={() => {
              if (selectedNodeId) deleteNode.mutate(selectedNodeId)
              if (selectedPipeId) deletePipe.mutate(selectedPipeId)
            }}
          >
            <Trash2 size={12} /> Delete
          </button>
        )}

        {/* Run CFD */}
        <button
          className="btn-primary btn-sm gap-1.5"
          disabled={runSim.isPending || simPollEnabled || nodes.length < 2}
          onClick={() => runSim.mutate()}
        >
          {(runSim.isPending || simPollEnabled)
            ? <><Spinner size={12} /> Running…</>
            : <><Play size={12} /> Run CFD</>}
        </button>
      </div>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Canvas area */}
        <div className="flex-1 relative p-4 overflow-hidden">

          {/* Add Pipe instruction card (2D mode only) */}
          {viewMode === '2d' && tool === 'add_pipe' && (
            <div className="absolute top-6 left-6 z-10 bg-white border border-amber-200 rounded-xl shadow-panel-lg p-3 text-xs max-w-[220px]">
              <div className="font-semibold text-amber-700 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Add Pipe Tool Active
              </div>
              <ol className="space-y-1 text-slate-600">
                <li className="flex gap-2"><span className="text-slate-400">①</span> Click the <strong>start node</strong></li>
                <li className="flex gap-2"><span className="text-slate-400">②</span> A preview line follows your mouse</li>
                <li className="flex gap-2"><span className="text-slate-400">③</span> Click the <strong>end node</strong> to connect</li>
                <li className="flex gap-2"><span className="text-slate-400">✕</span> Press <kbd className="bg-slate-100 px-1 rounded">Esc</kbd> to cancel</li>
              </ol>
            </div>
          )}

          {/* 2D Canvas */}
          {viewMode === '2d' && (
            <NetworkCanvas
              networkId={networkId!}
              nodes={nodes}
              pipes={pipes}
              canvasNodes={canvasData?.nodes}
              canvasPipes={canvasData?.pipes}
              tool={tool}
              selectedNodeId={selectedNodeId}
              selectedPipeId={selectedPipeId}
              showLabels={showLabels}
              showArrows={showArrows}
              showGrid={showGrid}
              width={canvasW}
              height={canvasH}
              onNodeClick={(id) => { if (id) { setSelectedNodeId(id); setSelectedPipeId(null) } else { setSelectedNodeId(null) } }}
              onPipeClick={(id) => { setSelectedPipeId(id); setSelectedNodeId(null) }}
              onNodeDragEnd={handleNodeDragEnd}
              onCanvasClick={handleCanvasClick}
              onPipeDrawn={handlePipeDrawn}
            />
          )}

          {/* Isometric Canvas */}
          {viewMode === 'iso' && (
            <IsometricCanvas
              nodes={nodes}
              pipes={pipes}
              canvasNodes={canvasData?.nodes}
              canvasPipes={canvasData?.pipes}
              showLabels={showLabels}
              showArrows={showArrows}
              showGrid={showGrid}
              width={canvasW}
              height={canvasH}
              onNodeClick={(id) => { setSelectedNodeId(id); setSelectedPipeId(null) }}
              onPipeClick={(id) => { setSelectedPipeId(id); setSelectedNodeId(null) }}
              selectedNodeId={selectedNodeId}
              selectedPipeId={selectedPipeId}
            />
          )}

          {/* Colormap legend */}
          {canvasData && canvasData.legend_max > 0 && (
            <ColormapLegend
              label={canvasData.legend_label}
              unit={canvasData.legend_unit}
              min={canvasData.legend_min}
              max={canvasData.legend_max}
              colormap={colormap}
            />
          )}

          {/* Simulation status banner */}
          {activeSim && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 shadow-panel-lg">
              <StatusBadge status={activeSim.status} />
              {activeSim.status === 'converged' && (
                <span className="text-xs text-teal-700 font-medium">
                  Converged in {activeSim.iterations_used} iters · {activeSim.solve_time_s?.toFixed(3)}s
                </span>
              )}
              {activeSim.status === 'failed' && (
                <span className="text-xs text-red-600 max-w-[200px] truncate">
                  {activeSim.error_message}
                </span>
              )}
            </div>
          )}

          {/* Empty state */}
          {!nodesLoading && nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-slate-100">
                <div className="text-4xl mb-3">🔵</div>
                <div className="text-sm font-semibold text-slate-600 mb-1">Empty Network</div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>① Select <strong>Add Node</strong> tool</div>
                  <div>② Click canvas to place nodes</div>
                  <div>③ Select <strong>Add Pipe</strong> tool</div>
                  <div>④ Click two nodes to connect them</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Properties panel */}
        {(selectedNode || selectedPipe) && (
          <PropertiesPanel
            selectedNode={selectedNode}
            selectedPipe={selectedPipe}
            pipeResult={pipeResult}
            nodeResult={nodeResult}
            onClose={() => { setSelectedNodeId(null); setSelectedPipeId(null) }}
          />
        )}
      </div>
    </div>
  )
}
