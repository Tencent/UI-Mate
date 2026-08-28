import React, { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Bell, Settings } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { ToastProvider } from './Toast'
import Sidebar from './Sidebar'

export default function Layout() {
  const { state, dispatch } = useAppContext()
  const [showNotif, setShowNotif] = useState(false)
  const notifRef = useRef(null)
  const navigate = useNavigate()

  const unreadNotifCount = state.notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleNotifClick(notif) {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id })
    if (notif.type === 'order' && notif.relatedId) navigate(`/orders/${notif.relatedId}`)
    else if (notif.type === 'refund' && notif.relatedId) navigate(`/refunds/${notif.relatedId}`)
    else if (notif.type === 'review' && notif.relatedId) navigate('/reviews')
    setShowNotif(false)
  }

  function formatTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    const now = new Date()
    const diff = (now - d) / 1000
    if (diff < 60) return '刚刚'
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
    return Math.floor(diff / 86400) + '天前'
  }

  const notifTypeColor = { order: '#FF6600', refund: '#FF4D4F', review: '#1890FF', system: '#999' }

  return (
    <ToastProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          height: 56, minHeight: 56, background: '#fff',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', zIndex: 100, flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 32, height: 32, background: 'var(--color-primary)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer'
            }} onClick={() => navigate('/')}>淘</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)' }}>
              淘宝卖家中心
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              {state.store.name}
            </span>
            <span style={{
              background: '#FFF0D9', color: '#D48806',
              padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500,
              border: '1px solid #FFD591'
            }}>
              {state.store.rating}
            </span>
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                style={{ position: 'relative', padding: 8, borderRadius: 6, color: 'var(--color-text-secondary)' }}
                className="btn btn-ghost"
                onClick={() => setShowNotif(v => !v)}
              >
                <Bell size={18} />
                {unreadNotifCount > 0 && (
                  <span className="count-badge" style={{ position: 'absolute', top: 2, right: 2 }}>
                    {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                  </span>
                )}
              </button>
              {showNotif && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, width: 360,
                  background: '#fff', border: '1px solid var(--color-border)',
                  borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200,
                  maxHeight: 480, display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>通知中心</span>
                    <button className="btn btn-link" style={{ fontSize: 12 }} onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}>全部已读</button>
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {state.notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无新通知</div>
                    ) : state.notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        style={{
                          padding: '10px 16px', cursor: 'pointer',
                          background: n.read ? '#fff' : '#E6F7FF',
                          borderBottom: '1px solid var(--color-border-light)',
                          borderLeft: `3px solid ${notifTypeColor[n.type] || '#999'}`,
                          display: 'flex', gap: 10, alignItems: 'flex-start'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: n.read ? 400 : 600, fontSize: 13, marginBottom: 2 }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content}</div>
                        </div>
                        <div style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>{formatTime(n.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-ghost" onClick={() => navigate('/settings')} style={{ padding: 8, color: 'var(--color-text-secondary)' }}>
              <Settings size={18} />
            </button>
            <div style={{
              width: 32, height: 32, background: 'var(--color-primary)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer'
            }}>
              {state.store.owner.charAt(0)}
            </div>
          </div>
        </header>
        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar />
          <main style={{ flex: 1, background: 'var(--color-bg-page)', padding: 20, overflowY: 'auto' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
