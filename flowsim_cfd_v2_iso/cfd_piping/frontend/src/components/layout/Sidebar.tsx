import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FolderOpen, Play,
  BarChart3, Waves, Wrench, Droplets,
  ChevronRight, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',    icon: FolderOpen,      label: 'Projects' },
  { to: '/simulations', icon: Play,            label: 'Simulations' },
  { to: '/analysis',    icon: BarChart3,       label: 'Pipe Analysis' },
  { to: '/moody-chart', icon: Waves,           label: 'Moody Chart' },
  { to: '/fluids',      icon: Droplets,        label: 'Fluid Library' },
  { to: '/diagnostics', icon: Wrench,          label: 'Diagnostics' },
]

interface Props {
  open: boolean
  onToggle: () => void
}

export default function Sidebar({ open, onToggle }: Props) {
  return (
    <aside
      className={clsx(
        'shrink-0 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm',
        'transition-all duration-300 ease-in-out overflow-hidden',
        open ? 'w-56' : 'w-14',
      )}
    >
      {/* Logo row — always visible; label hidden when collapsed */}
      <div className="h-14 flex items-center border-b border-slate-100 shrink-0 px-3 gap-2.5">
        {/* Icon box — always shown */}
        <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-flow-500 to-teal-500 flex items-center justify-center shadow-sm">
          <Waves size={16} className="text-white" />
        </div>

        {/* Text — only when expanded */}
        {open && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-900 leading-tight">FlowSim</div>
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">CFD</div>
          </div>
        )}

        {/* Toggle button — inside logo row when expanded */}
        {open && (
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <PanelLeftClose size={15} />
          </button>
        )}
      </div>

      {/* Expand button row — only when collapsed */}
      {!open && (
        <div className="flex justify-center py-2 border-b border-slate-100">
          <button
            onClick={onToggle}
            title="Expand sidebar"
            className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <PanelLeftOpen size={15} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={!open ? label : undefined}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium',
                  'transition-all duration-150',
                  !open && 'justify-center px-0',
                  isActive
                    ? 'bg-flow-50 text-flow-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    className={clsx(
                      'shrink-0',
                      isActive ? 'text-flow-600' : 'text-slate-400',
                    )}
                  />
                  {open && (
                    <>
                      <span className="flex-1 truncate">{label}</span>
                      {isActive && <ChevronRight size={12} className="text-flow-400 shrink-0" />}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer — only when expanded */}
      {open && (
        <div className="px-4 py-3 border-t border-slate-100 shrink-0">
          <div className="text-[11px] text-slate-400">
            <div className="font-semibold text-slate-500">FlowSim CFD v2.0</div>
            <div>Hardy-Cross / Gradient Solver</div>
            <div className="mt-1 flex gap-1 items-center">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>API Connected</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer icon — collapsed state: just the green dot */}
      {!open && (
        <div className="flex justify-center py-3 border-t border-slate-100 shrink-0">
          <span className="inline-block w-2 h-2 rounded-full bg-teal-400" title="API Connected" />
        </div>
      )}
    </aside>
  )
}
