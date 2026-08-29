import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import NotificationCenter from './NotificationCenter'
import UserMenu from './UserMenu'
import SearchOverlay from './SearchOverlay'

const APP_TITLES = {
  '/app/manage-purchase-orders': 'Manage Purchase Orders',
  '/app/create-purchase-order': 'Create Purchase Order',
  '/app/manage-sales-orders': 'Manage Sales Orders',
  '/app/create-sales-order': 'Create Sales Order',
  '/app/manage-products': 'Manage Product Master Data',
  '/app/journal-entries': 'Journal Entries',
}

function getAppTitle(pathname) {
  if (APP_TITLES[pathname]) return APP_TITLES[pathname]
  if (pathname.startsWith('/app/purchase-order/')) return 'Purchase Order'
  if (pathname.startsWith('/app/sales-order/')) return 'Sales Order'
  if (pathname.startsWith('/app/product/')) return 'Product'
  if (pathname.startsWith('/app/journal-entry/')) return 'Journal Entry'
  return 'Home'
}

export default function ShellBar() {
  const { state } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  const isAppPage = location.pathname.startsWith('/app/')
  const appTitle = getAppTitle(location.pathname)
  const unreadCount = state.notificationCount

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div style={{
      background: 'var(--xap-shell-bg)',
      height: 'var(--xap-shell-height)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '8px',
      flexShrink: 0,
      position: 'relative',
      zIndex: 200
    }}>
      {isAppPage && (
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', lineHeight: 1 }}
          title="Back to Home"
        >
          ←
        </button>
      )}

      {/* XAP Logo */}
      <div style={{ color: '#fff', fontWeight: 800, fontSize: '18px', letterSpacing: '1px', marginRight: '8px', userSelect: 'none' }}>
        XAP
      </div>

      {/* Page title */}
      <button style={{
        background: 'none', border: 'none', color: '#fff', fontSize: '14px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
        padding: '4px 8px', borderRadius: '4px'
      }}>
        {appTitle}
        <span style={{ fontSize: '10px', opacity: 0.8 }}>▾</span>
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search icon */}
      <button
        onClick={() => setShowSearch(s => !s)}
        style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}
        title="Search"
      >
        🔍
      </button>

      {/* Help icon */}
      <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }} title="Help">
        ❓
      </button>

      {/* Notification bell */}
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setShowNotifications(s => !s); setShowUserMenu(false) }}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', position: 'relative' }}
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '2px', right: '4px',
              background: '#BB0000', color: '#fff', fontSize: '10px',
              borderRadius: '50%', width: '16px', height: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}
      </div>

      {/* User avatar */}
      <div ref={userRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setShowUserMenu(s => !s); setShowNotifications(false) }}
          style={{
            background: state.currentUser.avatarColor,
            border: 'none',
            borderRadius: '50%',
            width: '36px', height: '36px',
            color: '#fff', fontWeight: 700, fontSize: '13px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title={`${state.currentUser.firstName} ${state.currentUser.lastName}`}
        >
          {state.currentUser.initials}
        </button>
        {showUserMenu && <UserMenu onClose={() => setShowUserMenu(false)} />}
      </div>

      {/* Search overlay */}
      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
    </div>
  )
}
