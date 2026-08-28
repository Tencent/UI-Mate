import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, CheckSquare, Briefcase, Users, Clock,
  DollarSign, CreditCard, Building, FileText, MessageSquare, BarChart3,
  Puzzle, Settings, ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/matters', icon: Briefcase, label: 'Matters' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/activities', icon: Clock, label: 'Activities' },
  { to: '/billing', icon: DollarSign, label: 'Billing' },
  { to: '/online-payments', icon: CreditCard, label: 'Online Payments' },
  { to: '/accounts', icon: Building, label: 'Accounts' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/communications', icon: MessageSquare, label: 'Communications' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/app-integrations', icon: Puzzle, label: 'App Integrations' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { state } = useApp()
  const location = useLocation()
  const user = state.users.find(u => u.id === state.currentUserId)
  const unreadNotifications = state.notifications.filter(n => !n.read).length

  return (
    <aside style={{
      width: collapsed ? 56 : 200,
      minWidth: collapsed ? 56 : 200,
      background: '#1B2A4A',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 10, minHeight: 60, flexShrink: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, background: '#1A73E8',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5L6.5 12L13 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {!collapsed && (
          <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            Xlio
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 0' }}>
        {navItems.map(({ to, icon: Icon, label, exact }) => {
          const isActive = exact ? location.pathname === '/' : location.pathname.startsWith(to) && to !== '/'
          return (
            <NavLink
              key={to}
              to={to}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 16px',
                margin: '1px 6px',
                borderRadius: 4,
                background: isActive ? '#2B3F6B' : 'transparent',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'background 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#2B3F6B' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              title={collapsed ? label : ''}
              >
                <Icon size={18} color={isActive ? '#FFFFFF' : '#6B8CC7'} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
              </div>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Resource Center */}
        {!collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', margin: '4px 6px', borderRadius: 4,
            cursor: 'pointer', color: '#FFFFFF', fontSize: 13, fontWeight: 500
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#2B3F6B'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <ExternalLink size={14} color="#6B8CC7" />
            <span style={{ flex: 1 }}>Resource center</span>
            {unreadNotifications > 0 && (
              <span style={{ background: '#EA4335', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 5px', minWidth: 16, textAlign: 'center' }}>
                {unreadNotifications}
              </span>
            )}
          </div>
        )}

        {/* User info */}
        {!collapsed && user && (
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="avatar" style={{ background: user.avatarColor, flexShrink: 0 }}>
              {user.initials}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ color: '#6B8CC7', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {state.firmSettings.firmName}
              </div>
            </div>
          </div>
        )}

        {/* Collapse button */}
        <button
          onClick={onToggle}
          style={{
            width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
            color: '#6B8CC7', fontSize: 13, fontWeight: 500, marginBottom: 4
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
