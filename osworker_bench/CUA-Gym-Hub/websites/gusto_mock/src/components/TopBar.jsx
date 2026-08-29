import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { getInitials, getAvatarColor, formatTimestamp } from '../utils/helpers'

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
)

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 9l6 6 6-6"/>
  </svg>
)

const TopBar = () => {
  const { state, markNotificationRead, markAllNotificationsRead } = useAppContext()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const employees = state?.employees || []
  const notifications = state?.notifications || []
  const unreadCount = notifications.filter(n => !n.read).length

  const searchResults = search.length > 1
    ? employees.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.jobTitle.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5)
    : []

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const user = state?.currentUser
  const initials = user ? getInitials(user.firstName, user.lastName) : 'JJ'
  const avatarColor = getAvatarColor(user ? `${user.firstName} ${user.lastName}` : 'Jessica Jackson')

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 'var(--sidebar-width)',
      right: 0,
      height: 'var(--topbar-height)',
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 24px',
      gap: '16px',
      zIndex: 90,
    }}>
      {/* Search */}
      <div ref={searchRef} style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--light-gray)', border: '1px solid var(--border)', borderRadius: '20px', padding: '6px 14px' }}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search people..."
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSearch(true) }}
            onFocus={() => setShowSearch(true)}
            style={{
              border: 'none', background: 'transparent', outline: 'none', width: '180px', fontSize: '13px', padding: '0'
            }}
          />
        </div>
        {showSearch && searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: '40px', right: 0, width: '280px', background: 'var(--white)',
            border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-modal)', zIndex: 200
          }}>
            {searchResults.map(emp => (
              <div
                key={emp.id}
                onClick={() => { navigate(`/people/team-members/${emp.id}`); setSearch(''); setShowSearch(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="avatar avatar-sm" style={{ background: getAvatarColor(`${emp.firstName} ${emp.lastName}`), fontSize: '11px' }}>
                  {getInitials(emp.firstName, emp.lastName)}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{emp.firstName} {emp.lastName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{emp.jobTitle}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {showSearch && search.length > 1 && searchResults.length === 0 && (
          <div style={{ position: 'absolute', top: '40px', right: 0, width: '280px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', color: 'var(--medium-gray)', textAlign: 'center', fontSize: '13px', boxShadow: 'var(--shadow-modal)', zIndex: 200 }}>
            No results found
          </div>
        )}
      </div>

      {/* Bell */}
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setShowNotif(v => !v)}
          style={{ background: 'none', border: 'none', color: 'var(--medium-gray)', padding: '6px', display: 'flex', position: 'relative' }}
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '2px', right: '2px',
              background: 'var(--coral)', color: 'white', borderRadius: '50%',
              width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600'
            }}>{unreadCount}</span>
          )}
        </button>
        {showNotif && (
          <div style={{
            position: 'absolute', top: '44px', right: 0, width: '300px', background: 'var(--white)',
            border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-modal)', zIndex: 200
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: '600', fontSize: '14px' }}>
              Notifications
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--medium-gray)', fontSize: '13px' }}>No notifications</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => { markNotificationRead(n.id); navigate(n.actionUrl); setShowNotif(false) }}
                  style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(0,160,125,0.04)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(0,160,125,0.04)'}
                >
                  <div style={{ fontSize: '13px', fontWeight: n.read ? '400' : '500' }}>{n.message}</div>
                  <div style={{ fontSize: '11px', color: 'var(--medium-gray)', marginTop: '2px' }}>{formatTimestamp(n.timestamp)}</div>
                </div>
              ))
            )}
            <div
              onClick={() => { markAllNotificationsRead(); setShowNotif(false) }}
              style={{ padding: '10px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--teal)', cursor: 'pointer' }}
            >
              Mark all as read
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div ref={userRef} style={{ position: 'relative' }}>
        <div
          onClick={() => setShowUser(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="avatar avatar-sm" style={{ background: avatarColor }}>
            {initials}
          </div>
          <div style={{ lineHeight: '1.2' }}>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize: '11px', color: 'var(--medium-gray)' }}>Administrator</div>
          </div>
          <span style={{ color: 'var(--medium-gray)' }}><ChevronIcon /></span>
        </div>
        {showUser && (
          <div style={{
            position: 'absolute', top: '48px', right: 0, width: '200px', background: 'var(--white)',
            border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-modal)', zIndex: 200
          }}>
            <div
              onClick={() => { navigate('/people/team-members/emp_1'); setShowUser(false) }}
              style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >Your profile</div>
            <div
              onClick={() => { navigate('/settings'); setShowUser(false) }}
              style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >Company settings</div>
            <div style={{ height: '1px', background: 'var(--border)' }} />
            <div
              style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', color: 'var(--medium-gray)' }}
              onClick={() => { showToast('Sign out is disabled in demo mode'); setShowUser(false) }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >Sign out</div>
          </div>
        )}
      </div>
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </header>
  )
}

export default TopBar
