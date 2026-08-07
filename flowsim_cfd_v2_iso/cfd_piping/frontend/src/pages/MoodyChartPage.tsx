/**
 * MoodyChartPage — Interactive Moody Friction Factor Diagram
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer, Legend,
} from 'recharts'
import api from '@/api/client'
import { LoadingOverlay, SectionHeader, MetricCard } from '@/components/ui'

const CURVE_COLORS = [
  '#0e87ea', '#14b8a6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#10b981', '#f97316',
]

export default function MoodyChartPage() {
  const [re, setRe] = useState(100000)
  const [epsd, setEpsd] = useState(0.001)
  const [nPoints, setNPoints] = useState(80)

  const { data, isLoading } = useQuery({
    queryKey: ['moody', nPoints],
    queryFn: () => api.getMoodyChartData(nPoints, 8),
  })

  const { data: ffData } = useQuery({
    queryKey: ['ff-compare', re, epsd],
    queryFn: () => api.compareFrictionFactors(re, epsd),
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <SectionHeader
        title="Moody Diagram"
        subtitle="Darcy-Weisbach friction factor as a function of Reynolds number and relative roughness"
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="xl:col-span-1 space-y-4">
          <div className="card p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Point Query</h3>
            <div>
              <label className="label">Reynolds Number</label>
              <input
                className="input"
                type="number"
                step="1000"
                min="100"
                max="1e8"
                value={re}
                onChange={e => setRe(Number(e.target.value))}
              />
              <div className="text-xs text-slate-400 mt-1">
                {re.toExponential(2)}
              </div>
            </div>
            <div>
              <label className="label">Relative Roughness ε/D</label>
              <input
                className="input"
                type="number"
                step="0.0001"
                min="0"
                max="0.05"
                value={epsd}
                onChange={e => setEpsd(Number(e.target.value))}
              />
            </div>
          </div>

          {ffData && (
            <div className="card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Friction Factor Comparison</h3>
              <div className="text-xs font-medium text-slate-600 mb-1">
                Regime: <span className="capitalize">{ffData.flow_regime.replace(/_/g, ' ')}</span>
              </div>
              {Object.entries(ffData.friction_factors).map(([key, val]) =>
                val != null ? (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-mono font-semibold text-slate-800">{(val as number).toFixed(5)}</span>
                  </div>
                ) : null
              )}
            </div>
          )}

          <div className="card p-4 text-xs text-slate-500 space-y-2">
            <h3 className="font-semibold text-slate-700">Equations Used</h3>
            <div className="bg-slate-50 p-2 rounded font-mono text-[11px]">
              Colebrook-White:<br />
              1/√f = −2 log₁₀(ε/3.7D + 2.51/Re√f)
            </div>
            <div className="bg-slate-50 p-2 rounded font-mono text-[11px]">
              Laminar:<br />
              f = 64/Re
            </div>
            <div>
              <span className="font-semibold">Churchill (1977)</span> spans all regimes continuously.
            </div>
            <div>
              <span className="font-semibold">Swamee-Jain</span> explicit ±3% vs Colebrook.
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="xl:col-span-3 card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-slate-700">Moody Chart</h3>
            <span className="text-xs text-slate-400">log-log scale</span>
          </div>
          <div className="card-body p-4">
            {isLoading ? (
              <LoadingOverlay message="Computing Moody diagram…" />
            ) : data ? (
              <MoodyChart data={data} queryRe={re} queryEpsd={epsd} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function MoodyChart({ data, queryRe, queryEpsd }: any) {
  const curves = Object.entries(data.roughness_curves) as [string, any][]

  // Build flat log-log data for chart
  const allSeries = curves.map(([label, curve], idx) => ({
    label,
    color: CURVE_COLORS[idx % CURVE_COLORS.length],
    points: curve.data.map((pt: any) => ({
      re: Math.log10(pt.re),
      f: Math.log10(pt.f),
    })),
  }))

  // Laminar line
  const laminarPoints = data.laminar_line.map((pt: any) => ({
    re: Math.log10(pt.re),
    f: Math.log10(pt.f),
  }))

  // Merge all points for XAxis domain
  const allRe = allSeries.flatMap(s => s.points.map((p: any) => p.re))
  const minRe = Math.min(...allRe)
  const maxRe = Math.max(...allRe)

  return (
    <div>
      <ResponsiveContainer width="100%" height={440}>
        <LineChart margin={{ top: 8, right: 20, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#e2e8f0" />
          <XAxis
            dataKey="re"
            type="number"
            domain={[minRe, maxRe]}
            tickCount={9}
            tickFormatter={(v) => `10^${v.toFixed(0)}`}
            label={{ value: 'Reynolds Number (Re)', position: 'bottom', offset: 15, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            type="number"
            domain={['auto', 'auto']}
            tickFormatter={(v) => `${Math.pow(10, v).toFixed(3)}`}
            label={{ value: 'Friction Factor f', angle: -90, position: 'insideLeft', offset: -5, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            formatter={(v: number) => [`f = ${Math.pow(10, v).toFixed(5)}`, '']}
            labelFormatter={(v: number) => `Re = ${Math.pow(10, v).toExponential(2)}`}
            contentStyle={{ fontSize: 11 }}
          />

          {/* Transition zone */}
          <ReferenceArea
            x1={Math.log10(2300)}
            x2={Math.log10(4000)}
            fill="#fef3c7"
            fillOpacity={0.5}
            label={{ value: 'Transition', position: 'top', fontSize: 9 }}
          />

          {/* Laminar line */}
          <Line
            data={laminarPoints}
            type="monotone"
            dataKey="f"
            name="Laminar (f=64/Re)"
            stroke="#1d4ed8"
            strokeWidth={2.5}
            dot={false}
          />

          {/* Roughness curves */}
          {allSeries.map((series, i) => (
            <Line
              key={series.label}
              data={series.points}
              type="monotone"
              dataKey="f"
              name={series.label}
              stroke={series.color}
              strokeWidth={1.5}
              dot={false}
              strokeDasharray={i === 0 ? undefined : undefined}
            />
          ))}

          {/* Query point indicator */}
          <ReferenceLine
            x={Math.log10(queryRe)}
            stroke="#0e87ea"
            strokeDasharray="4 2"
            strokeWidth={1.5}
            label={{ value: `Re=${queryRe.toExponential(1)}`, fontSize: 9, fill: '#0e87ea' }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-3 flex flex-wrap gap-2 px-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-[#1d4ed8]" />
          <span className="text-xs text-slate-500">Laminar</span>
        </div>
        {curves.slice(0, 5).map(([label], i) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-6 h-0.5" style={{ background: CURVE_COLORS[i % CURVE_COLORS.length] }} />
            <span className="text-xs text-slate-500">{label.split('=')[1]?.trim()}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-3 bg-amber-100 border border-amber-300 rounded-sm" />
          <span className="text-xs text-slate-500">Transition</span>
        </div>
      </div>
    </div>
  )
}
