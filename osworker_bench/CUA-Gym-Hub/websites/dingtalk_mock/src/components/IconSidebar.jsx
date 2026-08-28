import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './IconSidebar.css'

const NAV_ITEMS = [
  { key: 'messages', label: '消息', icon: '💬', path: '/messages' },
  { key: 'ding', label: 'DING', icon: '🔔', path: '/ding' },
  { key: 'workbench', label: '工作台', icon: '🔧', path: '/workbench' },
  { key: 'contacts', label: '通讯录', icon: '👥', path: '/contacts' },
  { key: 'calendar', label: '日历', icon: '📅', path: '/calendar' },
]

function NavIcon({ item, active, onClick }) {
  return (
    <button
      className={`nav-icon-btn ${active ? 'nav-icon-active' : ''}`}
      onClick={onClick}
      title={item.label}
    >
      <span className="nav-icon-emoji">{item.icon}</span>
      <span className="nav-icon-label">{item.label}</span>
    </button>
  )
}

export default function IconSidebar() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')

  const getPath = (path) => sid ? `${path}?sid=${sid}` : path

  const activeKey = () => {
    const p = location.pathname
    if (p.startsWith('/messages')) return 'messages'
    if (p.startsWith('/ding')) return 'ding'
    if (p.startsWith('/workbench')) return 'workbench'
    if (p.startsWith('/contacts')) return 'contacts'
    if (p.startsWith('/calendar')) return 'calendar'
    if (p.startsWith('/me')) return 'me'
    return ''
  }

  const currentUser = state.currentUser

  const handleNav = (item) => {
    dispatch({ type: 'SET_ACTIVE_TAB', tab: item.key })
    navigate(getPath(item.path))
  }

  const totalUnread = state.conversations.reduce((sum, c) => sum + (c.isMuted ? 0 : c.unreadCount), 0)
  const dingUnread = state.dingMessages.filter(d => d.type === 'received' && !d.confirmedBy.includes(state.currentUser.id)).length

  const getBadge = (key) => {
    if (key === 'messages') return totalUnread
    if (key === 'ding') return dingUnread
    return 0
  }

  return (
    <aside className="icon-sidebar">
      <button
        className="user-avatar-btn"
        onClick={() => navigate(getPath('/me'))}
        title={currentUser.name}
      >
        <div className="avatar-circle avatar-sm" style={{ background: currentUser.avatar }}>
          {currentUser.name.charAt(0)}
        </div>
        <span className={`status-dot status-${currentUser.status}`} />
      </button>

      <nav className="nav-icons">
        {NAV_ITEMS.map(item => (
          <div key={item.key} className="nav-icon-wrap">
            <NavIcon
              item={item}
              active={activeKey() === item.key}
              onClick={() => handleNav(item)}
            />
            {getBadge(item.key) > 0 && (
              <span className="nav-badge">{getBadge(item.key) > 99 ? '99+' : getBadge(item.key)}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className={`nav-icon-btn ${activeKey() === 'me' ? 'nav-icon-active' : ''}`}
          onClick={() => navigate(getPath('/me'))}
          title="我的"
        >
          <span className="nav-icon-emoji">👤</span>
          <span className="nav-icon-label">我的</span>
        </button>
      </div>
    </aside>
  )
}
