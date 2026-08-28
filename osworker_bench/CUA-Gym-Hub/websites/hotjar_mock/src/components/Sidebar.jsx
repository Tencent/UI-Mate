import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, LayoutGrid, Lightbulb, TrendingUp, BarChart3,
  MonitorPlay, Target, MessageCircle, ClipboardCheck, Users,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { withCurrentSearch } from '../utils/navigation.js'

const navItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
  { id: 'highlights', label: 'Highlights', icon: Lightbulb, path: '/highlights' },
  { divider: true },
  { id: 'trends', label: 'Trends', icon: TrendingUp, path: '/trends' },
  { id: 'funnels', label: 'Funnels', icon: BarChart3, path: '/funnels' },
  { divider: true },
  { id: 'recordings', label: 'Recordings', icon: MonitorPlay, path: '/recordings' },
  { id: 'heatmaps', label: 'Heatmaps', icon: Target, path: '/heatmaps' },
  { divider: true },
  { id: 'feedback', label: 'Feedback', icon: MessageCircle, path: '/feedback' },
  { id: 'surveys', label: 'Surveys', icon: ClipboardCheck, path: '/surveys' },
  { divider: true },
  { id: 'interviews', label: 'Interviews', icon: Users, path: '/interviews' },
]

export default function Sidebar() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()

  const expanded = state.sidebarExpanded

  function isActive(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className={`sidebar ${expanded ? 'expanded' : ''}`}>
      <div className="sidebar-top">
        {navItems.map((item, i) => {
          if (item.divider) {
            return <div key={`divider-${i}`} className="sidebar-divider" />
          }
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <div
              key={item.id}
              className={`sidebar-item ${active ? 'active' : ''}`}
              onClick={() => navigate(withCurrentSearch(item.path, location.search))}
              title={!expanded ? item.label : undefined}
            >
              <span className="sidebar-icon">
                <Icon size={20} />
              </span>
              <span className="sidebar-label">{item.label}</span>
            </div>
          )
        })}
      </div>

      <div className="sidebar-bottom">
        <div
          className="sidebar-toggle-btn"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="sidebar-icon">
            {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </span>
          <span className="sidebar-label">Collapse</span>
        </div>
      </div>
    </nav>
  )
}
