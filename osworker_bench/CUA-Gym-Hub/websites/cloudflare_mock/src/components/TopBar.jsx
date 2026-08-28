import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './TopBar.css'

function CloudflareLogo() {
  return (
    <svg width="120" height="36" viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.5 24.3c.1-.4.2-.9.2-1.4 0-4.1-3.3-7.4-7.4-7.4-.4 0-.8 0-1.1.1-.9-3.2-3.8-5.5-7.3-5.5-4.2 0-7.6 3.4-7.6 7.6 0 .3 0 .6 0 .8-2.5.3-4.5 2.5-4.5 5.2 0 2.9 2.3 5.2 5.2 5.2h22c2.3 0 4.2-1.9 4.2-4.2 0-2-1.4-3.6-3.2-4.1l-.5.3z" fill="#F6821F" transform="translate(8,2)"/>
      <path d="M14.2 24.3c.1-.4.2-.8.2-1.3 0-3.8-3-6.8-6.8-6.8-.4 0-.7 0-1.1.1-.8-2.9-3.5-5-6.6-5-3.9 0-7 3.1-7 7 0 .3 0 .6 0 .8-2.4.3-4.1 2.3-4.1 4.7 0 2.6 2.1 4.8 4.8 4.8h20.3c2.1 0 3.9-1.7 3.9-3.9 0-1.8-1.2-3.4-2.9-3.8l-.2.1" fill="#FBAD41" transform="translate(8,2)"/>
      <text x="36" y="24" fill="#1A1A1A" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="600">Xloudflare</text>
    </svg>
  )
}

export default function TopBar({ onAddSite }) {
  const navigate = useNavigate()
  const { state, markAllNotificationsRead } = useApp()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSupportMenu, setShowSupportMenu] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [localStatus, setLocalStatus] = useState('')
  const notifRef = useRef(null)
  const userRef = useRef(null)
  const supportRef = useRef(null)
  const accountRef = useRef(null)

  const unreadCount = state.notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false)
      if (supportRef.current && !supportRef.current.contains(e.target)) setShowSupportMenu(false)
      if (accountRef.current && !accountRef.current.contains(e.target)) setShowAccountMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  function showLocalStatus(message) {
    setLocalStatus(message)
    setTimeout(() => setLocalStatus(''), 2500)
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-logo" onClick={() => navigate('/')}>
          <svg width="28" height="20" viewBox="0 0 100 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M81.1 47.3c.2-.8.3-1.6.3-2.5 0-7.4-6-13.4-13.4-13.4-.7 0-1.4.1-2.1.2-1.6-5.7-6.9-9.9-13.1-9.9-7.6 0-13.8 6.2-13.8 13.8 0 .5 0 1 .1 1.5-4.6.6-8.1 4.5-8.1 9.3 0 5.2 4.2 9.4 9.4 9.4h39.9c4.2 0 7.6-3.4 7.6-7.6 0-3.6-2.5-6.6-5.8-7.4-.3.2-.6.4-1 .6z" fill="#F6821F"/>
            <path d="M67.9 47.3c.2-.7.3-1.5.3-2.3 0-6.8-5.5-12.3-12.3-12.3-.7 0-1.3 0-2 .1-1.5-5.2-6.3-9.1-12-9.1-7 0-12.7 5.7-12.7 12.7 0 .5 0 1 .1 1.4-4.3.5-7.5 4.1-7.5 8.5 0 4.8 3.9 8.7 8.7 8.7h36.7c3.9 0 7-3.1 7-7 0-3.3-2.2-6.1-5.3-6.9l-.3.2" fill="#FBAD41"/>
          </svg>
        </button>

        <div className="topbar-divider" />

        {/* Account Selector */}
        <div className="topbar-dropdown-wrap" ref={accountRef}>
          <button className="topbar-account-btn" onClick={() => setShowAccountMenu(v => !v)}>
            <span className="topbar-account-name">{state.account?.name || "John's Account"}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          {showAccountMenu && (
            <div className="topbar-dropdown">
              <div className="dropdown-section-title">My accounts</div>
              <button className="dropdown-item" style={{ fontWeight: 500 }} onClick={() => { navigate('/'); setShowAccountMenu(false) }}>
                <span className="dropdown-account-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M16 12a4 4 0 0 0-8 0"/><circle cx="12" cy="8" r="2"/></svg>
                </span>
                {state.account?.name || "John's Account"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        <button className="btn btn-orange btn-sm" onClick={onAddSite}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add site
        </button>

        {/* Notifications */}
        <div className="topbar-dropdown-wrap" ref={notifRef}>
          <button className="btn-icon topbar-icon-btn notif-btn" onClick={() => setShowNotifications(v => !v)} title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="topbar-dropdown notif-panel">
              <div className="notif-header">
                <span className="notif-title">Notifications</span>
                <button className="link-btn" onClick={() => { markAllNotificationsRead(); }}>Mark all read</button>
              </div>
              <div className="notif-list">
                {state.notifications.length === 0 ? (
                  <div className="notif-empty">No notifications</div>
                ) : state.notifications.map(n => (
                  <div key={n.id} className={`notif-item notif-${n.type} ${!n.read ? 'notif-unread' : ''}`}>
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-msg">{n.message}</div>
                    <div className="notif-item-meta">
                      {n.zone_name && <span className="notif-zone">{n.zone_name}</span>}
                      <span className="notif-time">{getTimeAgo(n.created_on)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Support */}
        <div className="topbar-dropdown-wrap" ref={supportRef}>
          <button className="topbar-text-btn" onClick={() => setShowSupportMenu(v => !v)}>
            Support
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          {showSupportMenu && (
            <div className="topbar-dropdown">
              <button className="dropdown-item" onClick={() => { setShowSupportMenu(false); showLocalStatus('Help Center opened locally.') }}>Help Center</button>
              <button className="dropdown-item" onClick={() => { setShowSupportMenu(false); showLocalStatus('Community support opened locally.') }}>Community</button>
              <button className="dropdown-item" onClick={() => { setShowSupportMenu(false); showLocalStatus('All systems operational in this sandbox.') }}>System Status</button>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => { setShowSupportMenu(false); showLocalStatus('Support case draft created locally.') }}>Contact Support</button>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="topbar-dropdown-wrap" ref={userRef}>
          <button className="user-avatar" onClick={() => setShowUserMenu(v => !v)} title={state.currentUser?.name}>
            {(state.currentUser?.name || 'JD').split(' ').map(n => n[0]).join('').slice(0, 2)}
          </button>
          {showUserMenu && (
            <div className="topbar-dropdown user-dropdown">
              <div className="user-dropdown-info">
                <div className="user-dropdown-name">{state.currentUser?.name}</div>
                <div className="user-dropdown-email">{state.currentUser?.email}</div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => { setShowUserMenu(false); showLocalStatus('Profile settings opened locally.') }}>My Profile</button>
              <button className="dropdown-item" onClick={() => { setShowUserMenu(false); navigate('/') }}>Account Home</button>
              <button className="dropdown-item" onClick={() => { setShowUserMenu(false); showLocalStatus('Billing overview opened locally.') }}>Billing</button>
              <button className="dropdown-item" onClick={() => { setShowUserMenu(false); showLocalStatus('Appearance preference saved locally.') }}>Appearance</button>
              <div className="dropdown-divider" />
              <button className="dropdown-item text-muted" onClick={() => { setShowUserMenu(false); showLocalStatus('Signed out locally. No external session changed.') }}>Log Out</button>
            </div>
          )}
        </div>
      </div>
      {localStatus && (
        <div style={{
          position: 'fixed',
          top: 64,
          right: 24,
          background: '#fff',
          border: '1px solid var(--cf-border)',
          boxShadow: 'var(--cf-shadow)',
          borderRadius: 8,
          padding: '10px 14px',
          color: 'var(--cf-text-primary)',
          fontSize: 13,
          zIndex: 3000
        }}>
          {localStatus}
        </div>
      )}
    </header>
  )
}
