import { useLocation } from 'react-router-dom'
import { Bell, HelpCircle, Settings } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/projects':    'Projects',
  '/simulations': 'Simulations',
  '/analysis':    'Pipe Analysis',
  '/moody-chart': 'Moody Chart',
  '/fluids':      'Fluid Library',
  '/diagnostics': 'Diagnostics',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const baseRoute = '/' + pathname.split('/')[1]
  const title = PAGE_TITLES[baseRoute] ?? 'FlowSim CFD'

  return (
    <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-sm font-semibold text-slate-800">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <button className="btn-ghost btn-sm rounded-lg p-2 text-slate-400 hover:text-slate-600">
          <HelpCircle size={16} />
        </button>
        <button className="btn-ghost btn-sm rounded-lg p-2 text-slate-400 hover:text-slate-600">
          <Bell size={16} />
        </button>
        <button className="btn-ghost btn-sm rounded-lg p-2 text-slate-400 hover:text-slate-600">
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}
