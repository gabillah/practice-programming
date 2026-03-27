/**
 * PropertiesPanel
 * ---------------
 * Right-side panel showing properties and CFD results
 * for a selected node or pipe.
 */

import { X, Droplets, Gauge, Wind, Waves, Activity, Zap } from 'lucide-react'
import type { Node, Pipe, PipeResult, NodeResult } from '@/api/client'
import {
  MetricCard, RegimeBadge, Badge,
  formatNumber, formatFlow, formatPressure,
} from '@/components/ui'

interface Props {
  selectedNode?: Node | null
  selectedPipe?: Pipe | null
  pipeResult?: PipeResult | null
  nodeResult?: NodeResult | null
  onClose: () => void
}

export default function PropertiesPanel({
  selectedNode, selectedPipe, pipeResult, nodeResult, onClose,
}: Props) {
  if (!selectedNode && !selectedPipe) return null

  return (
    <aside className="w-72 shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <h3 className="text-sm font-semibold text-slate-800">
          {selectedNode ? '⬤ Node Properties' : '━ Pipe Properties'}
        </h3>
        <button className="btn-ghost btn-sm p-1.5 rounded-md" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ─── Node properties ─────────────────────────────────────────── */}
        {selectedNode && (
          <div>
            <Section title="Identity">
              <Row label="ID" value={selectedNode.id.slice(0, 8) + '…'} mono />
              <Row label="Label" value={selectedNode.label} />
              <Row label="Type" value={
                <Badge variant="blue">{selectedNode.node_type}</Badge>
              } />
            </Section>

            <Section title="Physical">
              <Row label="Elevation" value={`${selectedNode.elevation_m.toFixed(2)} m`} />
              <Row label="Demand" value={formatFlow(selectedNode.demand_m3s)} />
              {selectedNode.fixed_head_m != null && (
                <Row label="Fixed Head" value={`${selectedNode.fixed_head_m.toFixed(2)} m`} />
              )}
            </Section>

            {nodeResult && (
              <Section title="CFD Results">
                <div className="grid grid-cols-2 gap-2 px-4 pb-2">
                  <MetricCard
                    label="Pressure" variant="blue"
                    value={formatPressure(nodeResult.pressure_pa)}
                  />
                  <MetricCard
                    label="Hyd. Grade" variant="green"
                    value={`${nodeResult.hydraulic_grade_m.toFixed(2)}`}
                    unit="m"
                  />
                  <MetricCard
                    label="Press. Head"
                    value={`${nodeResult.pressure_head_m.toFixed(2)}`}
                    unit="m"
                  />
                  <MetricCard
                    label="Balance Error"
                    variant={Math.abs(nodeResult.balance_error_m3s) > 1e-4 ? 'red' : 'green'}
                    value={nodeResult.balance_error_m3s.toExponential(1)}
                    unit="m³/s"
                  />
                </div>
                <div className="px-4 pb-3">
                  <Row label="Inflow"  value={formatFlow(nodeResult.inflow_m3s)} />
                  <Row label="Outflow" value={formatFlow(nodeResult.outflow_m3s)} />
                  <Row label="Demand"  value={formatFlow(nodeResult.demand_m3s)} />
                </div>
              </Section>
            )}
          </div>
        )}

        {/* ─── Pipe properties ─────────────────────────────────────────── */}
        {selectedPipe && (
          <div>
            <Section title="Identity">
              <Row label="ID" value={selectedPipe.id.slice(0, 8) + '…'} mono />
              <Row label="Label" value={selectedPipe.label} />
              <Row label="Material" value={selectedPipe.pipe_material} />
            </Section>

            <Section title="Geometry">
              <Row label="Diameter"  value={`${(selectedPipe.diameter_m * 1000).toFixed(1)} mm`} />
              <Row label="Length"    value={`${selectedPipe.length_m.toFixed(1)} m`} />
              <Row label="Roughness" value={`${(selectedPipe.roughness_m * 1e6).toFixed(0)} μm`} />
              <Row label="Minor K"   value={formatNumber(selectedPipe.minor_loss_K)} />
            </Section>

            {selectedPipe.has_pump && (
              <Section title="Pump">
                <Row label="Rated Flow" value={formatFlow(selectedPipe.pump_rated_flow_m3s)} />
                <Row label="Rated Head" value={`${selectedPipe.pump_rated_head_m.toFixed(1)} m`} />
                <Row label="Efficiency" value={`${(selectedPipe.pump_efficiency * 100).toFixed(0)}%`} />
              </Section>
            )}

            {pipeResult && (
              <>
                <Section title="CFD Results">
                  <div className="px-4 pb-1 flex items-center gap-2">
                    <RegimeBadge regime={pipeResult.flow_regime} />
                    <Badge variant={pipeResult.direction === 'forward' ? 'blue' : 'amber'}>
                      {pipeResult.direction === 'forward' ? '→ Forward' : '← Reverse'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 px-4 pb-2">
                    <MetricCard
                      label="Velocity" variant="blue"
                      value={Math.abs(pipeResult.velocity_m_s).toFixed(3)}
                      unit="m/s"
                      icon={<Wind size={13} />}
                    />
                    <MetricCard
                      label="Flow Rate" variant="green"
                      value={formatFlow(Math.abs(pipeResult.flow_m3s))}
                      icon={<Droplets size={13} />}
                    />
                    <MetricCard
                      label="Reynolds" variant="blue"
                      value={pipeResult.reynolds_number.toExponential(2)}
                    />
                    <MetricCard
                      label="Friction f"
                      value={formatNumber(pipeResult.friction_factor, 4)}
                    />
                    <MetricCard
                      label="Head Loss"
                      value={`${pipeResult.head_loss_m.toFixed(3)}`}
                      unit="m"
                      icon={<Gauge size={13} />}
                    />
                    <MetricCard
                      label="ΔP Friction"
                      value={formatPressure(pipeResult.pressure_drop_pa)}
                    />
                    <MetricCard
                      label="Turbulence"
                      value={pipeResult.turbulence_intensity_pct.toFixed(1)}
                      unit="%"
                      icon={<Waves size={13} />}
                    />
                    <MetricCard
                      label="Wall Shear"
                      value={formatPressure(pipeResult.wall_shear_stress_pa)}
                    />
                  </div>
                </Section>

                <Section title="Energy">
                  <Row label="Minor HL"    value={`${pipeResult.minor_head_loss_m.toFixed(3)} m`} />
                  <Row label="Total HL"    value={`${pipeResult.total_head_loss_m.toFixed(3)} m`} />
                  <Row label="Resistance R" value={pipeResult.resistance_R.toExponential(3)} mono />
                </Section>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <div className="px-4 py-2 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </div>
      <div className="py-1">{children}</div>
    </div>
  )
}

function Row({
  label, value, mono = false,
}: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 hover:bg-slate-50">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-medium text-slate-800 ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}
