import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FolderOpen, Network, Play,
  BarChart3, Waves, FlaskConical, Wrench, Droplets,
  ChevronRight,
} from 'lucide-react'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard,   label: 'Dashboard' },
  { to: '/projects',     icon: FolderOpen,        label: 'Projects' },
  { to: '/simulations',  icon: Play,              label: 'Simulations' },
  { to: '/analysis',     icon: BarChart3,         label: 'Pipe Analysis' },
  { to: '/moody-chart',  icon: Waves,             label: 'Moody Chart' },
  { to: '/fluids',       icon: Droplets,          label: 'Fluid Library' },
  { to: '/diagnostics',  icon: Wrench,            label: 'Diagnostics' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-flow-500 to-teal-500 flex items-center justify-center shadow-sm">
            <Waves size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 leading-tight">FlowSim</div>
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">CFD</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-flow-50 text-flow-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-flow-600' : 'text-slate-400'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={12} className="text-flow-400" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 shrink-0">
        <div className="text-[11px] text-slate-400">
          <div className="font-semibold text-slate-500">FlowSim CFD v2.0</div>
          <div>Hardy-Cross / Gradient Solver</div>
          <div className="mt-1 flex gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 mt-0.5"></span>
            <span>API Connected</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
