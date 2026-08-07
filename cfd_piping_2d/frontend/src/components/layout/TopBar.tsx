import { useLocation } from 'react-router-dom'
import { Bell, HelpCircle, Settings, PanelLeftOpen } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/projects':    'Projects',
  '/simulations': 'Simulations',
  '/analysis':    'Pipe Analysis',
  '/moody-chart': 'Moody Chart',
  '/fluids':      'Fluid Library',
  '/diagnostics': 'Diagnostics',
}

interface Props {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function TopBar({ sidebarOpen, onToggleSidebar }: Props) {
  const { pathname } = useLocation()
  const baseRoute = '/' + pathname.split('/')[1]
  const title = PAGE_TITLES[baseRoute] ?? 'FlowSim CFD'

  return (
    <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 gap-3">
      {/* Left: toggle button (shown only when sidebar is collapsed) + page title */}
      <div className="flex items-center gap-3 min-w-0">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            title="Expand sidebar"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <PanelLeftOpen size={16} />
          </button>
        )}
        <h1 className="text-sm font-semibold text-slate-800 truncate">{title}</h1>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          title="Help"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <HelpCircle size={16} />
        </button>
        <button
          title="Notifications"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Bell size={16} />
        </button>
        <button
          title="Settings"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}
