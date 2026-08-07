import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Network, Play, Droplets, Activity, ArrowRight,
  TrendingUp, Gauge, Wind, Waves,
} from 'lucide-react'
import api from '@/api/client'
import { LoadingOverlay, StatusBadge, formatFlow, formatPressure } from '@/components/ui'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: projects, isLoading: loadingProj } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.listProjects(),
  })
  const { data: sims, isLoading: loadingSims } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => api.listSimulations(),
  })
  const { data: fluids } = useQuery({
    queryKey: ['fluids'],
    queryFn: () => api.listFluids(),
  })

  const recentSims = sims?.slice(0, 5) ?? []
  const convergedSims = sims?.filter(s => s.status === 'converged') ?? []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome to <span className="text-gradient">FlowSim CFD</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Computational fluid dynamics for complex pipe networks — Hardy-Cross &amp; Gradient solvers
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={<Network size={18} />} label="Projects" value={projects?.length ?? 0} color="blue" />
        <KpiCard icon={<Play size={18} />} label="Simulations" value={sims?.length ?? 0} color="teal" />
        <KpiCard icon={<Activity size={18} />} label="Converged" value={convergedSims.length} color="green" />
        <KpiCard icon={<Droplets size={18} />} label="Fluids" value={fluids?.length ?? 0} color="amber" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-slate-800">Quick Start</h2>
          </div>
          <div className="card-body space-y-2">
            <QuickAction
              title="New Project"
              desc="Create a new pipe network project"
              icon={<Network size={16} className="text-flow-500" />}
              onClick={() => navigate('/projects')}
            />
            <QuickAction
              title="Run Analysis"
              desc="Analyze a single pipe segment"
              icon={<Gauge size={16} className="text-teal-500" />}
              onClick={() => navigate('/analysis')}
            />
            <QuickAction
              title="Moody Chart"
              desc="Interactive Moody friction factor diagram"
              icon={<Waves size={16} className="text-amber-500" />}
              onClick={() => navigate('/moody-chart')}
            />
            <QuickAction
              title="Run Diagnostics"
              desc="Validate solver with built-in test cases"
              icon={<Activity size={16} className="text-purple-500" />}
              onClick={() => navigate('/diagnostics')}
            />
          </div>
        </div>

        {/* Recent simulations */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-slate-800">Recent Simulations</h2>
            <button
              className="btn-ghost btn-sm text-xs"
              onClick={() => navigate('/simulations')}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="card-body p-0">
            {loadingSims ? (
              <LoadingOverlay message="Loading simulations…" />
            ) : recentSims.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                No simulations yet. Create a project to get started.
              </div>
            ) : (
              <table className="table-auto">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Iterations</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSims.map(sim => (
                    <tr key={sim.id} className="cursor-pointer" onClick={() => navigate('/simulations')}>
                      <td className="max-w-[120px] truncate">{sim.name}</td>
                      <td><StatusBadge status={sim.status} /></td>
                      <td className="font-mono">{sim.iterations_used ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Physics reference */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-800">Physics Engine Reference</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {PHYSICS_FEATURES.map(feat => (
              <div key={feat.title} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="font-semibold text-slate-700 mb-1">{feat.title}</div>
                <div className="text-slate-500 leading-relaxed">{feat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number
  color: 'blue' | 'teal' | 'green' | 'amber'
}) {
  const colors = {
    blue:  'bg-flow-50  border-flow-100  text-flow-600',
    teal:  'bg-teal-50  border-teal-100  text-teal-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
  }
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 shadow-sm ${colors[color]}`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-xs font-medium text-slate-500">{label}</div>
      </div>
    </div>
  )
}

function QuickAction({ title, desc, icon, onClick }: {
  title: string; desc: string; icon: React.ReactNode; onClick: () => void
}) {
  return (
    <button
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-left transition-colors group"
      onClick={onClick}
    >
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-800 group-hover:text-flow-600 transition-colors">
          {title}
        </div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
      <ArrowRight size={13} className="text-slate-300 group-hover:text-flow-400 transition-colors" />
    </button>
  )
}

const PHYSICS_FEATURES = [
  {
    title: 'Darcy-Weisbach',
    desc: 'hf = f·(L/D)·V²/(2g) — primary friction head loss equation',
  },
  {
    title: 'Colebrook-White',
    desc: 'Implicit friction factor — solved by Newton-Raphson iteration',
  },
  {
    title: 'Hardy-Cross / Gradient',
    desc: 'Loop-corrective & Todini-Pilati network solvers',
  },
  {
    title: 'Turbulence (k-ε)',
    desc: 'Turbulence intensity, TKE, dissipation, wall shear stress',
  },
  {
    title: 'Minor Losses',
    desc: 'Valves, elbows, tees, contractions, expansions (K-method)',
  },
  {
    title: 'Water Hammer',
    desc: 'Joukowski surge pressure, wave celerity, critical closure time',
  },
  {
    title: 'Velocity Profiles',
    desc: 'Parabolic (laminar), power-law & log-law (turbulent)',
  },
  {
    title: 'Compressible Flow',
    desc: 'Mach number, stagnation properties, Fanno flow parameter',
  },
]
