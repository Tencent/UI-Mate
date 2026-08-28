import React, { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import {
  LayoutDashboard, BarChart2, Target, Wrench, CreditCard, Settings,
  Menu, Bell, HelpCircle, ChevronDown, ChevronRight, Search,
  Plus, User, X
} from 'lucide-react'
import CreateModal from './CreateModal.jsx'

const styles = {
  shell: { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  topBar: {
    height: 56, minHeight: 56, background: '#fff', borderBottom: '1px solid #DADCE0',
    display: 'flex', alignItems: 'center', paddingLeft: 56, paddingRight: 16, gap: 12,
    position: 'relative', zIndex: 100, flexShrink: 0
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 },
  logoIcon: { width: 28, height: 28 },
  logoText: { fontSize: 18, color: '#5F6368', fontFamily: "'Google Sans', sans-serif", fontWeight: 400, whiteSpace: 'nowrap' },
  searchBar: {
    flex: 1, maxWidth: 480, height: 40, background: '#F1F3F4', borderRadius: 20,
    display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, cursor: 'text',
    position: 'relative'
  },
  searchInput: {
    border: 'none', background: 'transparent', outline: 'none', flex: 1,
    fontSize: 14, color: '#202124', fontFamily: 'inherit'
  },
  topBarRight: { display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  iconBtn: {
    width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    color: '#5F6368', position: 'relative'
  },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  primarySidebar: {
    width: 56, minWidth: 56, background: '#202124', display: 'flex',
    flexDirection: 'column', alignItems: 'center', paddingTop: 8, paddingBottom: 8,
    zIndex: 50, flexShrink: 0
  },
  primaryBtn: {
    width: 48, height: 48, borderRadius: 24, border: 'none', background: 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    color: '#9AA0A6', marginBottom: 4, position: 'relative', transition: 'background 0.15s'
  },
  secondarySidebar: {
    width: 240, minWidth: 240, background: '#fff', borderRight: '1px solid #DADCE0',
    display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0
  },
  secondaryHeader: { padding: '12px 16px 8px', borderBottom: '1px solid #DADCE0' },
  secondaryTitle: { fontSize: 13, fontWeight: 500, color: '#202124' },
  navItem: {
    display: 'flex', alignItems: 'center', height: 36, padding: '0 16px', cursor: 'pointer',
    fontSize: 13, color: '#202124', borderRadius: 0, gap: 8, userSelect: 'none',
    transition: 'background 0.1s'
  },
  navGroup: {
    display: 'flex', alignItems: 'center', height: 36, padding: '0 16px', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, color: '#5F6368', gap: 4, userSelect: 'none',
    transition: 'background 0.1s'
  },
  navIndent: { paddingLeft: 28 },
  mainContent: {
    flex: 1, background: '#F8F9FA', overflow: 'auto', display: 'flex', flexDirection: 'column'
  },
  contentInner: { padding: 24, flex: 1 },
  notifBadge: {
    position: 'absolute', top: 6, right: 6, width: 16, height: 16, background: '#D93025',
    borderRadius: 8, fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 700
  },
  notifPanel: {
    position: 'absolute', top: 48, right: 0, width: 320, maxHeight: 400, background: '#fff',
    border: '1px solid #DADCE0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 200, overflow: 'auto'
  },
  searchDropdown: {
    position: 'absolute', top: 44, left: 0, right: 0, background: '#fff',
    border: '1px solid #DADCE0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 200
  },
}

const NAV_ITEMS = [
  { label: 'Overview', path: '/overview' },
  { label: 'Recommendations', path: '/recommendations', badge: true },
  {
    label: 'Insights and reports', expandable: true, defaultExpanded: true,
    children: [
      { label: 'Dashboards', path: '/insights/dashboards' },
      { label: 'Search terms', path: '/insights/search-terms' },
    ]
  },
  {
    label: 'Campaigns', expandable: true, defaultExpanded: true,
    children: [
      { label: 'Campaigns', path: '/campaigns' },
      { label: 'Ad groups', path: '/ad-groups' },
      { label: 'Ads & assets', path: '/ads' },
    ]
  },
  {
    label: 'Audiences, keywords, and content', expandable: true, defaultExpanded: true,
    children: [
      { label: 'Keywords', path: '/keywords' },
    ]
  },
]

function NotificationPanel({ notifications, onClose, onMarkAll, onRead }) {
  return (
    <div style={styles.notifPanel}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #DADCE0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 500, fontSize: 14 }}>Notifications</span>
        <button onClick={onMarkAll} style={{ border: 'none', background: 'none', color: '#1A73E8', cursor: 'pointer', fontSize: 12 }}>Mark all as read</button>
      </div>
      {notifications.map(n => (
        <div key={n.id} onClick={() => onRead(n.id)} style={{
          padding: '12px 16px', borderBottom: '1px solid #F1F3F4', cursor: 'pointer',
          background: n.read ? '#fff' : '#E8F0FE', display: 'flex', gap: 10, alignItems: 'flex-start'
        }}>
          {!n.read && <div style={{ width: 8, height: 8, background: '#1A73E8', borderRadius: 4, marginTop: 4, flexShrink: 0 }} />}
          {n.read && <div style={{ width: 8, flexShrink: 0 }} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 500, color: '#202124' }}>{n.title}</div>
            <div style={{ fontSize: 12, color: '#5F6368', marginTop: 2 }}>{n.message}</div>
            <div style={{ fontSize: 11, color: '#9AA0A6', marginTop: 4 }}>
              {new Date(n.timestamp).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
      {notifications.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: '#5F6368' }}>No notifications</div>
      )}
    </div>
  )
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch } = useApp()
  const [expanded, setExpanded] = useState({ 'Insights and reports': true, 'Campaigns': true, 'Audiences, keywords, and content': true })
  const [showNotif, setShowNotif] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notifRef = useRef(null)
  const searchRef = useRef(null)
  const userMenuRef = useRef(null)
  const helpRef = useRef(null)

  const unread = state?.notifications?.filter(n => !n.read).length || 0

  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
      if (helpRef.current && !helpRef.current.contains(e.target)) setShowHelp(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const searchResults = React.useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return []
    const q = searchQuery.toLowerCase()
    const results = []
    state?.campaigns?.forEach(c => {
      if (c.name.toLowerCase().includes(q)) {
        results.push({ type: 'Campaign', label: c.name, path: `/campaigns/${c.id}` })
      }
    })
    state?.keywords?.filter(kw => !kw.isNegative).forEach(kw => {
      if (kw.text.toLowerCase().includes(q) && results.length < 8) {
        results.push({ type: 'Keyword', label: kw.text, path: '/keywords' })
      }
    })
    const pages = [
      { label: 'Overview', path: '/overview' }, { label: 'Recommendations', path: '/recommendations' },
      { label: 'Keywords', path: '/keywords' }, { label: 'Campaigns', path: '/campaigns' },
    ]
    pages.forEach(p => {
      if (p.label.toLowerCase().includes(q) && results.length < 10) {
        results.push({ type: 'Page', label: p.label, path: p.path })
      }
    })
    return results.slice(0, 8)
  }, [searchQuery, state])

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div style={styles.shell}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        {/* Logo */}
        <div style={styles.logo}>
          <svg style={styles.logoIcon} viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,24 2,24" fill="none" stroke="none"/>
            <polygon points="14,2 20,24 8,24" fill="#FBBC04"/>
            <polygon points="14,2 26,24 14,18" fill="#EA4335"/>
            <polygon points="14,2 2,24 14,18" fill="#4285F4"/>
            <polygon points="8,24 20,24 14,18" fill="#34A853"/>
          </svg>
          <span style={styles.logoText}>Xoogle Ads</span>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 480, position: 'relative' }} ref={searchRef}>
          <div style={styles.searchBar} onClick={() => setShowSearch(true)}>
            <Search size={16} color="#5F6368" />
            <input
              style={styles.searchInput}
              placeholder="Search for campaigns, settings, and more"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true) }}
              onFocus={() => setShowSearch(true)}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearch(false) }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5F6368' }}>
                <X size={14} />
              </button>
            )}
          </div>
          {showSearch && searchResults.length > 0 && (
            <div style={styles.searchDropdown} role="listbox" data-testid="search-dropdown">
              {searchResults.map((r, i) => (
                <div key={i} onClick={() => { navigate(r.path); setShowSearch(false); setSearchQuery('') }}
                  style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid #F1F3F4' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F1F3F4'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span style={{ fontSize: 11, color: '#5F6368', minWidth: 60 }}>{r.type}</span>
                  <span style={{ fontSize: 13, color: '#202124' }}>{r.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right icons */}
        <div style={styles.topBarRight}>
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button style={styles.iconBtn} onClick={() => setShowNotif(!showNotif)}>
              <Bell size={20} />
              {unread > 0 && <div style={styles.notifBadge}>{unread}</div>}
            </button>
            {showNotif && (
              <NotificationPanel
                notifications={state?.notifications || []}
                onClose={() => setShowNotif(false)}
                onMarkAll={() => { dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' }); }}
                onRead={(id) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id })}
              />
            )}
          </div>
          <div style={{ position: 'relative' }} ref={helpRef}>
            <button style={styles.iconBtn} title="Help" onClick={() => setShowHelp(v => !v)}>
              <HelpCircle size={20} />
            </button>
            {showHelp && (
              <div style={{
                position: 'absolute', top: 48, right: 0, width: 220, background: '#fff',
                border: '1px solid #DADCE0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 200, overflow: 'hidden'
              }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #F1F3F4' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#202124' }}>Help</span>
                </div>
                {[
                  { label: 'Help Center', href: '#help-center' },
                  { label: 'Send Feedback', href: '#send-feedback' },
                  { label: 'Keyboard Shortcuts', href: '#keyboard-shortcuts' },
                ].map(({ label, href }) => (
                  <a key={href} href={href} onClick={e => { e.preventDefault(); setShowHelp(false) }}
                    style={{
                      display: 'block', padding: '10px 16px', fontSize: 13,
                      color: '#202124', textDecoration: 'none', cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F1F3F4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              style={{ ...styles.iconBtn, background: '#1A73E8', color: '#fff' }}
              title="Account"
              onClick={() => setShowUserMenu(v => !v)}
            >
              <User size={18} />
            </button>
            {showUserMenu && (
              <div style={{
                position: 'absolute', top: 48, right: 0, width: 220, background: '#fff',
                border: '1px solid #DADCE0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 200, overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F3F4' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#202124' }}>Acme Corp</div>
                  <div style={{ fontSize: 12, color: '#5F6368' }}>admin@acmecorp.com</div>
                </div>
                {[
                  { label: 'Account settings', path: '/settings' },
                  { label: 'Billing & payments', path: '/billing' },
                ].map(({ label, path }) => (
                  <div key={path} onClick={() => { navigate(path); setShowUserMenu(false) }}
                    style={{ padding: '10px 16px', fontSize: 13, color: '#202124', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F1F3F4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {/* Primary Sidebar */}
        <div style={styles.primarySidebar}>
          <button style={{ ...styles.primaryBtn, marginBottom: 12 }} title="Menu" onClick={() => setSidebarCollapsed(v => !v)}>
            <Menu size={20} color="#9AA0A6" />
          </button>
          {[
            { icon: LayoutDashboard, label: 'Home', path: '/overview' },
            { icon: BarChart2, label: 'Campaigns', path: '/campaigns' },
            { icon: Target, label: 'Goals', path: '/goals' },
            { icon: Wrench, label: 'Tools', path: '/tools' },
            { icon: CreditCard, label: 'Billing', path: '/billing' },
            { icon: Settings, label: 'Admin', path: '/settings' },
          ].map(({ icon: Icon, label, path }) => {
            const active = isActive(path)
            return (
              <button key={path} title={label} onClick={() => navigate(path)}
                style={{
                  ...styles.primaryBtn,
                  color: active ? '#fff' : '#9AA0A6',
                  borderLeft: active ? '3px solid #1A73E8' : '3px solid transparent',
                  borderRadius: 4,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={20} />
              </button>
            )
          })}
        </div>

        {/* Secondary Sidebar */}
        <div style={{ ...styles.secondarySidebar, display: sidebarCollapsed ? 'none' : 'flex' }}>
          <div style={{ padding: '8px 0', overflowY: 'auto', flex: 1 }}>
            {NAV_ITEMS.map(item => {
              if (!item.expandable) {
                const active = isActive(item.path)
                return (
                  <div key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                      ...styles.navItem,
                      background: active ? '#E8F0FE' : 'transparent',
                      color: active ? '#1A73E8' : '#202124',
                      fontWeight: active ? 500 : 400,
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F1F3F4' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? '#E8F0FE' : 'transparent' }}
                  >
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && state?.account?.optimizationScore && (
                      <span style={{ background: '#1A73E8', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                        {state.account.optimizationScore}
                      </span>
                    )}
                  </div>
                )
              }

              const open = expanded[item.label] !== false
              return (
                <React.Fragment key={item.label}>
                  <div style={styles.navGroup}
                    onClick={() => setExpanded(ex => ({ ...ex, [item.label]: !open }))}>
                    <ChevronDown size={14} style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', color: '#5F6368' }} />
                    <span style={{ fontSize: 12, color: '#5F6368', fontWeight: 500 }}>{item.label}</span>
                  </div>
                  {open && item.children.map(child => {
                    const active = isActive(child.path)
                    return (
                      <div key={child.path}
                        onClick={() => navigate(child.path)}
                        data-testid={child.path === '/keywords' ? 'nav-item-keywords' : undefined}
                        style={{
                          ...styles.navItem, ...styles.navIndent,
                          background: active ? '#E8F0FE' : 'transparent',
                          color: active ? '#1A73E8' : '#202124',
                          fontWeight: active ? 500 : 400,
                        }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F1F3F4' }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? '#E8F0FE' : 'transparent' }}
                      >
                        {child.label}
                      </div>
                    )
                  })}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Create button bar */}
          <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4,
                  padding: '8px 16px', fontSize: 14, fontWeight: 500, display: 'flex',
                  alignItems: 'center', gap: 6, cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                Create
              </button>
            </div>
          </div>

          <div style={styles.contentInner}>
            <Outlet />
          </div>
        </div>
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
