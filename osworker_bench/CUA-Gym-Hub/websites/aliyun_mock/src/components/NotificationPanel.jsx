import React from 'react'
import { useApp } from '../context/AppContext'

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  const d = Math.floor(h / 24)
  return `${d}天前`
}

const typeColors = {
  system: '#0070CC',
  billing: '#FFA003',
  security: '#FF3333',
  product: '#1DC11D'
}

const typeLabels = {
  system: '系统',
  billing: '费用',
  security: '安全',
  product: '产品'
}

export default function NotificationPanel({ onClose }) {
  const { state, updateState } = useApp()

  const markAllRead = () => {
    updateState(prev => ({
      ...prev,
      messages: prev.messages.map(m => ({ ...m, isRead: true }))
    }))
  }

  const markRead = (id) => {
    updateState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === id ? { ...m, isRead: true } : m)
    }))
  }

  return (
    <div className="notif-dropdown">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #E8E8E8' }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>站内消息</span>
        <button className="btn-text" style={{ fontSize: 12 }} onClick={markAllRead}>全部已读</button>
      </div>
      {state.messages.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>暂无消息</div>
      )}
      {state.messages.map(msg => (
        <div
          key={msg.id}
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #F0F0F0',
            cursor: 'pointer',
            background: msg.isRead ? 'white' : '#FFF7F0'
          }}
          onClick={() => markRead(msg.id)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: typeColors[msg.type] || '#999', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: typeColors[msg.type] || '#999', padding: '0 4px', border: `1px solid ${typeColors[msg.type] || '#999'}`, borderRadius: 2 }}>{typeLabels[msg.type] || msg.type}</span>
            <span style={{ fontWeight: msg.isRead ? 400 : 600, fontSize: 13, flex: 1 }}>{msg.title}</span>
            <span style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>{relativeTime(msg.createdAt)}</span>
          </div>
          <div style={{ fontSize: 12, color: '#666', paddingLeft: 16, lineHeight: '18px' }}>{msg.content}</div>
        </div>
      ))}
    </div>
  )
}
