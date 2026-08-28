import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Plus, Search } from 'lucide-react'

const WPLogo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <text x="10" y="14" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold">W</text>
  </svg>
)

export default function AdminBar({ currentUser, storeName }) {
  const navigate = useNavigate()
  const [showNewMenu, setShowNewMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowNewMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
    setShowNewMenu(false)
  }

  const goHome = () => navTo('/')

  return (
    <div className="wp-admin-bar">
      <div className="wp-admin-bar-left">
        <button className="wp-admin-bar-item wp-admin-bar-logo" onClick={goHome} title="Visit Dashboard">
          <WPLogo />
        </button>
        <button className="wp-admin-bar-item" onClick={goHome} title="GreenLeaf Organics">
          {storeName}
        </button>
        <div className="wp-admin-bar-divider" />
        <span className="wp-admin-bar-item" style={{ fontSize: '12px', color: '#a7aaad' }}>
          0 comments
        </span>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button className="wp-admin-bar-item" style={{ gap: '4px' }} onClick={() => setShowNewMenu(v => !v)}>
            <Plus size={12} /> New
          </button>
          {showNewMenu && (
            <div style={{
              position: 'absolute', top: 32, left: 0, background: '#2c3338', minWidth: 160,
              boxShadow: '0 3px 5px rgba(0,0,0,0.3)', zIndex: 100000
            }}>
              {[
                { label: 'Product', path: '/products/new' },
                { label: 'Order', path: '/orders' },
                { label: 'Coupon', path: '/coupons/new' },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => navTo(item.path)}
                  style={{
                    display: 'block', width: '100%', padding: '6px 12px', textAlign: 'left',
                    background: 'none', border: 'none', color: '#c3c4c7', fontSize: 13,
                    cursor: 'pointer', borderBottom: '1px solid #3c434a'
                  }}
                  onMouseEnter={e => { e.target.style.background = '#1d2327'; e.target.style.color = '#fff' }}
                  onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = '#c3c4c7' }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="wp-admin-bar-right">
        <div className="wp-admin-bar-user">
          <span>Howdy, {currentUser?.displayName || 'Admin'}</span>
          <img
            src={currentUser?.avatarUrl || 'https://placehold.co/16x16/1d2327/fff?text=A'}
            alt="avatar"
            className="wp-admin-bar-avatar"
          />
        </div>
      </div>
    </div>
  )
}
