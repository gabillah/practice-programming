/**
 * AnalysisPage — Single Pipe CFD Analysis
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, Cell,
} from 'recharts'
import api from '@/api/client'
import type { SinglePipeAnalysis } from '@/api/client'
import {
  Spinner, MetricCard, RegimeBadge, SectionHeader,
  formatNumber, formatFlow, formatPressure,
} from '@/components/ui'

interface FormData {
  diameter_mm: number
  length_m: number
  flow_lps: number
  roughness_um: number
  minor_loss_K: number
  elevation_in_m: number
  elevation_out_m: number
  fluid_slug: string
}

export default function AnalysisPage() {
  const [result, setResult] = useState<SinglePipeAnalysis | null>(null)

  const { data: fluids = [] } = useQuery({
    queryKey: ['fluids'],
    queryFn: () => api.listFluids(),
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      diameter_mm: 100,
      length_m: 200,
      flow_lps: 10,
      roughness_um: 46,
      minor_loss_K: 1.5,
      elevation_in_m: 0,
      elevation_out_m: 0,
      fluid_slug: 'water_20',
    },
  })

  const analyze = useMutation({
    mutationFn: (data: FormData) => api.analyzePipe({
      diameter_m: data.diameter_mm / 1000,
      length_m: data.length_m,
      flow_rate_m3s: data.flow_lps / 1000,
      roughness_m: data.roughness_um / 1e6,
      minor_loss_K: data.minor_loss_K,
      elevation_in_m: data.elevation_in_m,
      elevation_out_m: data.elevation_out_m,
      fluid_slug: data.fluid_slug,
    }),
    onSuccess: setResult,
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <SectionHeader
        title="Single Pipe CFD Analysis"
        subtitle="Detailed hydraulic calculation for one pipe segment — Darcy-Weisbach, turbulence, water hammer"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit(data => analyze.mutate(data))} className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-700">Input Parameters</h3>
            </div>
            <div className="card-body space-y-3">
              <Field label="Fluid">
                <select className="select" {...register('fluid_slug')}>
                  {fluids.map(f => (
                    <option key={f.slug} value={f.slug}>{f.name}</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Diameter (mm)">
                  <input className="input" type="number" step="1" min="1" max="3000"
                    {...register('diameter_mm', { required: true, min: 1 })} />
                </Field>
                <Field label="Length (m)">
                  <input className="input" type="number" step="0.1" min="0.01"
                    {...register('length_m', { required: true, min: 0.01 })} />
                </Field>
                <Field label="Flow (L/s)">
                  <input className="input" type="number" step="0.001"
                    {...register('flow_lps', { required: true })} />
                </Field>
                <Field label="Roughness (μm)">
                  <input className="input" type="number" step="0.1" min="0"
                    {...register('roughness_um', { min: 0 })} />
                </Field>
                <Field label="Minor K">
                  <input className="input" type="number" step="0.1" min="0"
                    {...register('minor_loss_K', { min: 0 })} />
                </Field>
                <Field label="Elev. In (m)">
                  <input className="input" type="number" step="0.1"
                    {...register('elevation_in_m')} />
                </Field>
                <Field label="Elev. Out (m)">
                  <input className="input" type="number" step="0.1"
                    {...register('elevation_out_m')} />
                </Field>
              </div>
            </div>
            <div className="card-footer">
              <button
                type="submit"
                className="btn-primary btn-md w-full justify-center"
                disabled={analyze.isPending}
              >
                {analyze.isPending ? <><Spinner size={14} /> Calculating…</> : 'Calculate'}
              </button>
            </div>
          </form>

          {/* Quick reference */}
          <div className="card mt-4">
            <div className="card-header"><h3 className="text-xs font-semibold text-slate-600">Common Roughness Values</h3></div>
            <div className="card-body p-0">
              {ROUGHNESS_TABLE.map(r => (
                <div key={r.mat} className="flex justify-between px-4 py-2 border-b border-slate-50 text-xs last:border-0">
                  <span className="text-slate-600">{r.mat}</span>
                  <span className="font-mono text-slate-500">{r.eps} μm</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2">
          {!result && !analyze.isPending && (
            <div className="card h-64 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <div className="text-3xl mb-2">📐</div>
                <div className="text-sm">Fill in the form and click Calculate</div>
              </div>
            </div>
          )}

          {analyze.isPending && (
            <div className="card h-64 flex items-center justify-center">
              <Spinner size={28} />
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-fade-in">
              {/* Regime + basic */}
              <div className="card p-4 flex items-center gap-4">
                <RegimeBadge regime={result.flow_regime} />
                <div className="text-sm text-slate-600 font-mono">
                  Re = <span className="font-bold text-slate-900">
                    {result.reynolds_number.toExponential(3)}
                  </span>
                </div>
                <div className="text-sm text-slate-600 font-mono">
                  f = <span className="font-bold text-slate-900">
                    {result.friction_factor_darcy.toFixed(5)}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  ε/D = <span className="font-mono font-bold text-slate-900">
                    {result.relative_roughness.toExponential(2)}
                  </span>
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Velocity"   value={result.velocity_m_s.toFixed(3)} unit="m/s" variant="blue" />
                <MetricCard label="Head Loss"  value={result.total_head_loss_m.toFixed(3)} unit="m" variant="green" />
                <MetricCard label="Pressure Δ" value={formatPressure(result.total_pressure_drop_pa)} variant="amber" />
                <MetricCard label="Turbulence" value={result.turbulence_intensity_pct.toFixed(1)} unit="%" />
              </div>

              {/* Detailed results grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Head losses */}
                <div className="card">
                  <div className="card-header"><h4 className="text-xs font-semibold text-slate-600">Head Loss Breakdown</h4></div>
                  <div className="card-body p-0">
                    <HeadLossChart result={result} />
                  </div>
                </div>

                {/* Pressure breakdown */}
                <div className="card">
                  <div className="card-header"><h4 className="text-xs font-semibold text-slate-600">Pressure Components</h4></div>
                  <div className="card-body p-3 space-y-1.5">
                    <ResultRow label="Friction ΔP"  value={formatPressure(result.friction_pressure_drop_pa)} />
                    <ResultRow label="Minor ΔP"     value={formatPressure(result.minor_pressure_drop_pa)} />
                    <ResultRow label="Elevation ΔP" value={formatPressure(result.static_pressure_drop_pa)} />
                    <ResultRow label="Dynamic P"    value={formatPressure(result.dynamic_pressure_pa)} highlight />
                    <div className="border-t border-slate-100 pt-1.5 mt-1.5">
                      <ResultRow label="Total ΔP" value={formatPressure(result.total_pressure_drop_pa)} strong />
                    </div>
                  </div>
                </div>

                {/* Turbulence / shear */}
                <div className="card">
                  <div className="card-header"><h4 className="text-xs font-semibold text-slate-600">Turbulence & Wall Shear</h4></div>
                  <div className="card-body p-3 space-y-1.5">
                    <ResultRow label="Turbulence Intensity" value={`${result.turbulence_intensity_pct.toFixed(2)}%`} />
                    <ResultRow label="TKE k" value={`${result.turbulent_kinetic_energy_m2s2.toExponential(3)} m²/s²`} />
                    <ResultRow label="Wall Shear τ_w" value={formatPressure(result.wall_shear_stress_pa)} />
                    <ResultRow label="Friction Velocity u*" value={`${result.friction_velocity_m_s.toFixed(4)} m/s`} />
                    <ResultRow label="Coriolis α" value={result.kinetic_energy_coeff_alpha.toFixed(3)} />
                  </div>
                </div>

                {/* Velocity profile */}
                <div className="card">
                  <div className="card-header"><h4 className="text-xs font-semibold text-slate-600">Velocity Profile</h4></div>
                  <div className="card-body p-3 space-y-1.5">
                    <ResultRow label="Mean Velocity"        value={`${result.velocity_m_s.toFixed(4)} m/s`} />
                    <ResultRow label="Centreline Velocity"  value={`${result.centerline_velocity_m_s.toFixed(4)} m/s`} />
                    <ResultRow label="Velocity @ R/2"       value={`${result.velocity_at_half_radius_m_s.toFixed(4)} m/s`} />
                    <ResultRow label="Velocity at Wall"     value="0 m/s (no-slip)" />
                    <ResultRow label="Velocity Head"        value={`${result.velocity_head_m.toFixed(4)} m`} />
                  </div>
                </div>

                {/* Dimensionless */}
                <div className="card">
                  <div className="card-header"><h4 className="text-xs font-semibold text-slate-600">Dimensionless Numbers</h4></div>
                  <div className="card-body p-3 space-y-1.5">
                    <ResultRow label="Reynolds Re"    value={result.reynolds_number.toExponential(3)} />
                    <ResultRow label="Friction f (D-W)" value={result.friction_factor_darcy.toFixed(5)} />
                    <ResultRow label="Friction f (Fanning)" value={result.friction_factor_fanning.toFixed(5)} />
                    <ResultRow label="Mach Ma"        value={result.mach_number.toExponential(3)} />
                    <ResultRow label="Euler Eu"       value={formatNumber(result.euler_number)} />
                    <ResultRow label="Cavitation σ"   value={formatNumber(result.cavitation_number)} />
                  </div>
                </div>

                {/* Water hammer */}
                <div className="card">
                  <div className="card-header"><h4 className="text-xs font-semibold text-slate-600">Water Hammer (Transient)</h4></div>
                  <div className="card-body p-3 space-y-1.5">
                    <ResultRow label="Wave Speed a"     value={`${result.wave_speed_m_s.toFixed(1)} m/s`} />
                    <ResultRow label="Joukowski ΔP"     value={formatPressure(result.joukowski_pressure_surge_pa)} highlight />
                    <ResultRow label="Critical Closure" value={`${result.critical_closure_time_s.toFixed(3)} s`} />
                    <ResultRow label="Hydraulic Power"  value={`${result.hydraulic_power_w.toFixed(1)} W`} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function ResultRow({ label, value, highlight, strong }: {
  label: string; value: string; highlight?: boolean; strong?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-mono font-medium ${
        strong ? 'text-slate-900 font-bold' :
        highlight ? 'text-flow-700' : 'text-slate-700'
      }`}>{value}</span>
    </div>
  )
}

function HeadLossChart({ result }: { result: SinglePipeAnalysis }) {
  const data = [
    { name: 'Friction', value: result.darcy_weisbach_head_loss_m, color: '#0e87ea' },
    { name: 'Minor', value: result.minor_loss_head_m, color: '#14b8a6' },
    { name: 'Elevation', value: Math.abs(result.static_pressure_drop_pa / (998.2 * 9.80665)), color: '#f59e0b' },
  ]

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 4 }}>
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <RTooltip
          formatter={(v: number) => [`${v.toFixed(3)} m`, 'Head Loss']}
          contentStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

const ROUGHNESS_TABLE = [
  { mat: 'Drawn Tubing / Plastic',  eps: 0.0015 },
  { mat: 'Commercial Steel',         eps: 0.046 },
  { mat: 'Galvanised Iron',          eps: 0.15 },
  { mat: 'Cast Iron',                eps: 0.26 },
  { mat: 'Concrete',                 eps: 3.0 },
  { mat: 'Riveted Steel',            eps: 9.0 },
]
