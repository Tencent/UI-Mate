import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Home, Calendar, Mail, FlaskConical, DollarSign } from 'lucide-react'
import './NavBar.css'

const NAV_ITEMS = [
  { id: 'home', label: 'Your Menu', icon: Home, path: '/' },
  { id: 'visits', label: 'Visits', icon: Calendar, path: '/visits' },
  { id: 'messages', label: 'Messages', icon: Mail, path: '/messages', badge: true },
  { id: 'test-results', label: 'Test Results', icon: FlaskConical, path: '/test-results' },
  { id: 'billing', label: 'Billing & Insurance', icon: DollarSign, path: '/billing' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch } = useApp()

  const getActiveId = () => {
    const path = location.pathname
    if (path === '/' || path === '') return 'home'
    if (path.startsWith('/visits')) return 'visits'
    if (path.startsWith('/messages')) return 'messages'
    if (path.startsWith('/test-results')) return 'test-results'
    if (path.startsWith('/billing') || path.startsWith('/insurance')) return 'billing'
    if (path.startsWith('/medications')) return 'medications'
    if (path.startsWith('/health-summary')) return 'health-summary'
    return 'home'
  }

  const activeId = getActiveId()

  const handleNavClick = (item) => {
    if (item.id === 'home') {
      dispatch({ type: 'TOGGLE_SIDEBAR' })
      return
    }
    dispatch({ type: 'CLOSE_SIDEBAR' })
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: item.id })
    navigate(item.path)
  }

  const unreadCount = state.ui?.unreadMessageCount || 0

  return (
    <nav className="app-nav">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon
        const isActive = item.id === 'home'
          ? (state.ui?.sideMenuOpen || false)
          : item.id === activeId

        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <div className="nav-item-inner">
              <div className="nav-icon-wrap">
                <Icon size={18} />
                {item.badge && unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount}</span>
                )}
              </div>
              <span className="nav-label">{item.label}</span>
            </div>
          </button>
        )
      })}
    </nav>
  )
}
