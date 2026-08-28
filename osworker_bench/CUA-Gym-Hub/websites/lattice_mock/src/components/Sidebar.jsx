import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Avatar from './Avatar.jsx'

function CalendarIcon() {
  return (
    <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

function TrendingIcon() {
  return (
    <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="12" y2="16" />
    </svg>
  )
}

function CheckSquareIcon() {
  return (
    <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function DollarIcon() {
  return (
    <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function SearchModal({ state, onClose, navigate }) {
  const [query, setQuery] = useState('')

  const results = []
  if (query.trim().length > 0) {
    const q = query.toLowerCase()
    const users = state?.users || []
    users.forEach(u => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase()
      if (name.includes(q)) {
        results.push({ label: `${u.firstName} ${u.lastName}`, sub: u.title, route: `/people/${u.id}`, icon: '👤' })
      }
    })
    const goals = state?.goals || []
    goals.forEach(g => {
      if (g.title.toLowerCase().includes(q)) {
        results.push({ label: g.title, sub: 'Goal', route: `/goals/${g.id}`, icon: '🎯' })
      }
    })
    const pages = [
      { label: '1:1s', route: '/1on1s' },
      { label: 'Feedback', route: '/feedback' },
      { label: 'Goals', route: '/goals' },
      { label: 'Reviews', route: '/reviews' },
      { label: 'Updates', route: '/updates' },
      { label: 'Grow', route: '/grow' },
      { label: 'Engagement', route: '/engagement' },
      { label: 'Compensation', route: '/compensation' },
      { label: 'Tasks', route: '/tasks' },
      { label: 'People', route: '/people' },
    ]
    pages.forEach(p => {
      if (p.label.toLowerCase().includes(q)) {
        results.push({ label: p.label, sub: 'Page', route: p.route, icon: '📄' })
      }
    })
  }

  const handleSelect = (route) => {
    navigate(route)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 12, width: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            autoFocus
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, color: '#1A1A2E' }}
            placeholder="Search people, goals, pages..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'Enter' && results.length > 0) handleSelect(results[0].route)
            }}
          />
          <kbd style={{ fontSize: 11, color: '#9CA3AF', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, border: '1px solid #E5E7EB' }}>Esc</kbd>
        </div>
        {query.trim().length === 0 ? (
          <div style={{ padding: '24px 16px', color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
            Start typing to search...
          </div>
        ) : results.length === 0 ? (
          <div style={{ padding: '24px 16px', color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
            No results for "{query}"
          </div>
        ) : (
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {results.map((r, i) => (
              <div
                key={i}
                onClick={() => handleSelect(r.route)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1A2E' }}>{r.label}</div>
                  {r.sub && <div style={{ fontSize: 12, color: '#6B7280' }}>{r.sub}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function HelpPanel({ onClose }) {
  const shortcuts = [
    { key: 'G H', desc: 'Go to Home' },
    { key: 'G 1', desc: 'Go to 1:1s' },
    { key: 'G F', desc: 'Go to Feedback' },
    { key: 'G G', desc: 'Go to Goals' },
    { key: 'G R', desc: 'Go to Reviews' },
    { key: 'G T', desc: 'Go to Tasks' },
    { key: '/', desc: 'Open search' },
    { key: 'Esc', desc: 'Close modal / panel' },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 12, width: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A2E' }}>Help & Keyboard Shortcuts</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9CA3AF', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
            Xattice is a performance management platform. Use the sidebar to navigate between 1:1s, goals, reviews, feedback, and more.
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Keyboard shortcuts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {shortcuts.map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{s.desc}</span>
                <kbd style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: 4, border: '1px solid #E5E7EB', fontFamily: 'monospace' }}>{s.key}</kbd>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: '12px 16px', background: '#F0FDF4', borderRadius: 8, fontSize: 13, color: '#166534' }}>
            💡 Tip: Click any item in the sidebar to navigate, or use the search button (top) to find people, goals, and pages quickly.
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 20px', background: '#6B4FBB', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

const navItems = [
  { to: '/1on1s', label: '1:1s', Icon: CalendarIcon },
  { to: '/feedback', label: 'Feedback', Icon: MessageIcon },
  { to: '/updates', label: 'Updates', Icon: RefreshIcon },
  { to: '/grow', label: 'Grow', Icon: TrendingIcon, subItems: [
    { to: '/grow/career-tracks', label: 'Career tracks' }
  ]},
  { to: '/goals', label: 'Goals', Icon: TargetIcon },
  { to: '/engagement', label: 'Engagement', Icon: HeartIcon },
  { to: '/reviews', label: 'Reviews', Icon: ClipboardIcon },
  { to: '/compensation', label: 'Compensation', Icon: DollarIcon },
]

export default function Sidebar() {
  const { state } = useApp()
  const navigate = useNavigate()
  const currentUser = state?.currentUser
  const [showSearch, setShowSearch] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-inner">
          <svg className="sidebar-logo-icon" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="6" fill="#6B4FBB"/>
            <path d="M8 22V10h2.5v10h7V22H8z" fill="#fff"/>
          </svg>
          <span className="sidebar-logo-text">Xattice</span>
        </div>
        <button className="sidebar-search-btn" title="Search" onClick={() => setShowSearch(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {/* Main nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, Icon, subItems }) => (
          <div key={to}>
            <NavLink
              to={to}
              end={to === '/grow' ? false : true}
              className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon />
              {label}
            </NavLink>
            {subItems && subItems.map(sub => (
              <NavLink
                key={sub.to}
                to={sub.to}
                className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                style={{ paddingLeft: '36px', fontSize: '13px' }}
              >
                {sub.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-divider" />

      {/* Company */}
      <div className="sidebar-company">
        <Link to="/people">{state?.company?.name || 'Evergreen Technologies, Inc'}</Link>
      </div>

      <div style={{ flex: 1 }} />

      {/* Bottom */}
      <div className="sidebar-bottom">
        <NavLink
          to="/tasks"
          className="sidebar-nav-item"
        >
          <CheckSquareIcon />
          Tasks
        </NavLink>
        <div className="sidebar-nav-item" style={{ cursor: 'pointer' }} onClick={() => setShowHelp(true)}>
          <HelpIcon />
          Help
        </div>
        <div className="sidebar-user">
          {currentUser && (
            <Avatar user={currentUser} size={28} />
          )}
          <span className="sidebar-user-name">
            {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Sarah Chen'}
          </span>
        </div>
      </div>
    </div>

    {showSearch && (
      <SearchModal state={state} onClose={() => setShowSearch(false)} navigate={navigate} />
    )}
    {showHelp && (
      <HelpPanel onClose={() => setShowHelp(false)} />
    )}
    </>
  )
}
