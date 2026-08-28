import { useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function NotificationCenter({ onClose }) {
  const { state, readNotification, markAllNotificationsRead } = useApp()
  const { notifications } = state

  const sorted = [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  function formatTime(ts) {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
    const days = Math.floor(hrs / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  const typeColors = {
    success: '#2B7C2B', warning: '#E78C07', error: '#BB0000', info: '#0A6ED1'
  }
  const typeEmojis = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' }

  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0,
      width: '360px', maxHeight: '440px',
      background: '#fff', borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      border: '1px solid var(--xap-border)',
      zIndex: 9999, overflow: 'hidden',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--xap-border)'
      }}>
        <span style={{ fontWeight: 600, fontSize: '14px' }}>Notifications</span>
        <button className="btn-link" onClick={markAllNotificationsRead} style={{ fontSize: '12px' }}>
          Mark All as Read
        </button>
      </div>
      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {sorted.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--xap-text-secondary)' }}>No notifications</div>
        ) : sorted.map(n => (
          <div
            key={n.id}
            onClick={() => readNotification(n.id)}
            style={{
              display: 'flex', gap: '12px', padding: '12px 16px',
              borderBottom: '1px solid var(--xap-border)',
              cursor: 'pointer', background: n.isRead ? '#fff' : '#F0F7FF',
              borderLeft: n.isRead ? '3px solid transparent' : `3px solid ${typeColors[n.type] || '#0A6ED1'}`
            }}
          >
            <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '2px' }}>{typeEmojis[n.type] || 'ℹ️'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: '13px', marginBottom: '2px' }}>{n.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--xap-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {n.description}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--xap-text-placeholder)', marginTop: '4px' }}>
                {formatTime(n.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
