import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, BarChart3, Filter, RotateCcw, GitBranch, LayoutDashboard, BookOpen,
  Database, Tag, Layers, Users, UserCircle, FlaskConical, ChevronDown, ChevronRight, Zap, Sparkles
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import './Sidebar.css'

const navItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/home' },
  {
    id: 'analytics', label: 'Analytics', icon: BarChart3, path: null,
    children: [
      { id: 'segmentation', label: 'Event Segmentation', path: '/chart/new?type=segmentation' },
      { id: 'funnel', label: 'Funnel Analysis', path: '/chart/new?type=funnel' },
      { id: 'retention', label: 'Retention', path: '/chart/new?type=retention' },
      { id: 'journeys', label: 'User Paths', path: '/paths' },
      { id: 'dashboards', label: 'Dashboards', path: '/content?filter=dashboard' },
      { id: 'notebooks', label: 'Notebooks', path: '/content?filter=notebook' },
    ]
  },
  {
    id: 'data', label: 'Data', icon: Database, path: null,
    children: [
      { id: 'events', label: 'Events', path: '/data/events' },
      { id: 'properties', label: 'Properties', path: '/data/events?tab=properties' },
      { id: 'liveEvents', label: 'Live Events', path: '/live-events' },
    ]
  },
  {
    id: 'audiences', label: 'Audiences', icon: Users, path: null,
    children: [
      { id: 'cohorts', label: 'Cohorts', path: '/cohorts' },
      { id: 'userProfiles', label: 'User Profiles', path: '/users' },
    ]
  },
  { id: 'experiment', label: 'Experiment', icon: FlaskConical, path: '/experiments' },
  { id: 'ask', label: 'Ask AI', icon: Sparkles, path: '/ask' },
  { id: 'content', label: 'All Content', icon: Layers, path: '/content' },
]

export default function Sidebar() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const expanded = state.ui.sidebarExpanded
  const expandedSections = state.ui.expandedSections || []

  function getActiveId() {
    const path = location.pathname
    if (path === '/' || path === '/home') return 'home'
    if (path === '/content') return 'content'
    if (path === '/live-events') return 'liveEvents'
    if (path === '/ask') return 'ask'
    if (path === '/paths') return 'journeys'
    if (path.startsWith('/chart')) return 'segmentation'
    if (path.startsWith('/users')) return 'userProfiles'
    if (path.startsWith('/cohorts')) return 'cohorts'
    if (path.startsWith('/experiment')) return 'experiment'
    if (path.startsWith('/data')) return 'events'
    if (path.startsWith('/dashboard')) return 'dashboards'
    if (path.startsWith('/notebooks')) return 'notebooks'
    return 'home'
  }

  const activeId = getActiveId()

  function handleNav(item) {
    if (item.path) {
      navigate(item.path)
      dispatch({ type: 'SET_ACTIVE_SIDEBAR', payload: item.id })
    } else {
      dispatch({ type: 'TOGGLE_SECTION', payload: { section: item.id } })
    }
  }

  const { mtuUsed, mtuLimit } = state.currentUser
  const mtuPct = Math.min(100, (mtuUsed / mtuLimit) * 100)

  return (
    <aside className={`sidebar ${expanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {/* Xmplitude logo */}
      {expanded && (
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#7C3AED"/>
              <path d="M16 7C13.5 7 11.5 9.5 10 13C8.5 16.5 7.5 21 7 25H11C11.5 21 12.5 17 13.5 14C14.5 11 15 9.5 16 9.5C17 9.5 17.5 11 18.5 14C19.5 17 20.5 21 21 25H25C24.5 21 23.5 16.5 22 13C20.5 9.5 18.5 7 16 7Z" fill="white"/>
            </svg>
          </div>
          <span className="sidebar-logo-text">Xmplitude</span>
        </div>
      )}

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon
          const isExpandable = !!item.children
          const isSectionExpanded = expandedSections.includes(item.id)
          const isActive = activeId === item.id || (item.children && item.children.some(c => c.id === activeId))

          return (
            <div key={item.id}>
              <button
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                onClick={() => handleNav(item)}
                title={!expanded ? item.label : undefined}
              >
                <Icon size={18} className="sidebar-item-icon" />
                {expanded && (
                  <>
                    <span className="sidebar-item-label">{item.label}</span>
                    {isExpandable && (
                      <span className="sidebar-item-chevron">
                        {isSectionExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    )}
                  </>
                )}
              </button>
              {expanded && isExpandable && isSectionExpanded && item.children && (
                <div className="sidebar-children">
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      className={`sidebar-child-item ${activeId === child.id ? 'sidebar-item-active' : ''}`}
                      onClick={() => { navigate(child.path); dispatch({ type: 'SET_ACTIVE_SIDEBAR', payload: child.id }) }}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        {expanded ? (
          <>
            <div className="sidebar-mtu-label">
              MTUs {mtuUsed.toLocaleString()} / {(mtuLimit / 1000).toFixed(0)}k
            </div>
            <div className="sidebar-mtu-bar">
              <div className="sidebar-mtu-fill" style={{ width: `${mtuPct}%` }} />
            </div>
            <button className="sidebar-manage-plan" onClick={() => navigate('/home')}>Manage Plan</button>
          </>
        ) : (
          <div className="sidebar-mtu-collapsed" title={`MTUs: ${mtuUsed}/${mtuLimit}`}>
            <div className="sidebar-mtu-bar-sm">
              <div className="sidebar-mtu-fill" style={{ width: `${mtuPct}%` }} />
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
