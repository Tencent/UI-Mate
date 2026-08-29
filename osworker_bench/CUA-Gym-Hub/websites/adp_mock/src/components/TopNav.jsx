import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

function NotificationDropdown({ onClose }) {
  const { state, markNotificationRead, markAllNotificationsRead } = useApp()
  const navigate = useNavigate()
  const notifications = state.notifications || []

  function formatRelativeTime(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffHrs = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffHrs < 1) return 'Just now'
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, width: 340, maxHeight: 440,
      background: 'white', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 200,
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Notifications</span>
        <button onClick={markAllNotificationsRead} style={{ background: 'none', color: 'var(--color-info)', fontSize: 13, cursor: 'pointer', border: 'none' }}>
          Mark all read
        </button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-gray-medium)' }}>No notifications</div>
        )}
        {notifications.map(n => (
          <div key={n.id}
            onClick={() => { markNotificationRead(n.id); navigate(n.actionUrl || '/'); onClose() }}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
              cursor: 'pointer',
              background: n.isRead ? 'white' : '#EFF6FF',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: 14 }}>{n.title}</div>
            <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{n.message}</div>
            <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginTop: 4 }}>{formatRelativeTime(n.date)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileDropdown({ onClose }) {
  const { state } = useApp()
  const navigate = useNavigate()
  const emp = state.employee || {}
  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, width: 200,
      background: 'white', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', zIndex: 200,
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div>
        <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>{emp.email}</div>
      </div>
      <div style={{ padding: '4px 0' }}>
        <button onClick={() => { navigate('/myself/info'); onClose() }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', fontSize: 14, cursor: 'pointer', border: 'none', color: 'var(--color-navy)' }}>
          My Profile
        </button>
        <button onClick={() => { navigate('/settings'); onClose() }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', fontSize: 14, cursor: 'pointer', border: 'none', color: 'var(--color-navy)' }}>
          Settings
        </button>
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />
        <button
          disabled
          title="Sign Out not available in demo"
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', background: 'none', fontSize: 14, cursor: 'not-allowed', color: 'var(--color-gray-medium)', opacity: 0.6, border: 'none' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default function TopNav({ onToggleSidebar }) {
  const { state, unreadNotificationCount } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const searchRef = useRef(null)

  const emp = state.employee || {}

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Search results
  const searchPages = [
    { label: 'Home', path: '/' },
    { label: 'Profile & Contact', path: '/myself/info' },
    { label: 'Pay Statements', path: '/myself/pay' },
    { label: 'Tax Statements', path: '/myself/tax' },
    { label: 'Direct Deposit', path: '/myself/direct-deposit' },
    { label: 'Timecard', path: '/myself/time' },
    { label: 'Schedule', path: '/myself/schedule' },
    { label: 'Attendance', path: '/myself/attendance' },
    { label: 'Time Off', path: '/myself/timeoff' },
    { label: 'Benefits', path: '/myself/benefits' },
    { label: 'Dependents', path: '/myself/dependents' },
    { label: 'Employee Directory', path: '/people' },
    { label: 'Org Chart', path: '/people/org-chart' },
    { label: 'My Team', path: '/my-team' },
    { label: 'Approvals', path: '/my-team/approvals' },
    { label: 'Payroll', path: '/payroll' },
    { label: 'Reports', path: '/reports' },
    { label: 'Settings', path: '/settings' },
  ]

  const employees = state.employees || []
  const q = searchQuery.toLowerCase().trim()
  const matchedPages = q ? searchPages.filter(p => p.label.toLowerCase().includes(q)) : []
  const matchedEmployees = q ? employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.email} ${e.jobTitle} ${e.employeeId}`.toLowerCase().includes(q)
  ).slice(0, 5) : []
  const hasResults = matchedPages.length > 0 || matchedEmployees.length > 0

  return (
    <nav style={{
      height: 56,
      background: '#1F2937',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }}>
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        style={{
          background: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 20, padding: '4px 8px',
          cursor: 'pointer', border: 'none', marginRight: 12, borderRadius: 4,
        }}
        title="Toggle sidebar"
      >
        {'\u2630'}
      </button>

      {/* Logo */}
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', marginRight: 32 }}>
        <span style={{ color: '#D0021B', fontWeight: 700, fontSize: 24, letterSpacing: '-1px', fontStyle: 'italic' }}>xdp</span>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginLeft: 8, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Workforce Now</span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search bar */}
      <div ref={searchRef} style={{ position: 'relative', marginRight: 16 }}>
        <input
          type="text"
          placeholder="Search employees, pages..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
          onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.borderColor = 'rgba(255,255,255,0.4)'; setSearchOpen(true) }}
          onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'rgba(255,255,255,0.2)' }}
          onKeyDown={e => {
            if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery('') }
            if (e.key === 'Enter' && q) {
              if (matchedPages.length > 0) { navigate(matchedPages[0].path); setSearchQuery(''); setSearchOpen(false) }
              else if (matchedEmployees.length > 0) { navigate('/people'); setSearchQuery(''); setSearchOpen(false) }
            }
          }}
          style={{
            width: 260,
            padding: '6px 12px 6px 32px',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
          {'\uD83D\uDD0D'}
        </span>
        {searchOpen && q && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
            background: 'white', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
            maxHeight: 360, overflowY: 'auto', zIndex: 200,
          }}>
            {!hasResults && (
              <div style={{ padding: '12px 16px', color: 'var(--color-gray-medium)', fontSize: 13 }}>No results found</div>
            )}
            {matchedPages.length > 0 && (
              <div>
                <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 600, color: 'var(--color-gray-medium)', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F9FAFB' }}>Pages</div>
                {matchedPages.map(p => (
                  <div key={p.path}
                    onClick={() => { navigate(p.path); setSearchQuery(''); setSearchOpen(false) }}
                    style={{ padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: 'var(--color-navy)', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            )}
            {matchedEmployees.length > 0 && (
              <div>
                <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 600, color: 'var(--color-gray-medium)', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F9FAFB', borderTop: matchedPages.length > 0 ? '1px solid var(--color-border)' : 'none' }}>Employees</div>
                {matchedEmployees.map(e => (
                  <div key={e.id}
                    onClick={() => { navigate('/people'); setSearchQuery(''); setSearchOpen(false) }}
                    style={{ padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.1s' }}
                    onMouseEnter={ev => ev.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={ev => ev.currentTarget.style.background = 'white'}
                  >
                    <span style={{ background: '#4B5563', color: 'white', borderRadius: '50%', width: 24, height: 24, fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e.avatar}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{e.firstName} {e.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>{e.jobTitle} -- {e.department}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false) }}
            style={{ background: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 18, padding: 8, borderRadius: 6, cursor: 'pointer', position: 'relative', border: 'none' }}
            title="Notifications"
          >
            {'\uD83D\uDD14'}
            {unreadNotificationCount > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 2,
                background: '#D0021B', color: 'white',
                borderRadius: '50%', width: 16, height: 16,
                fontSize: 10, fontWeight: 700, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}>
                {unreadNotificationCount}
              </span>
            )}
          </button>
          {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
            style={{
              background: '#4B5563', border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '50%', width: 32, height: 32,
              color: 'white', fontWeight: 600, fontSize: 12,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title={`${emp.firstName} ${emp.lastName}`}
          >
            {emp.avatar || 'SJ'}
          </button>
          {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
        </div>
      </div>
    </nav>
  )
}
