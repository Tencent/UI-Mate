import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './DingPage.css'

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff/60)}分钟前`
  if (diff < 86400) {
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
  }
  if (diff < 172800) return '昨天'
  return `${d.getMonth()+1}月${d.getDate()}日`
}

export default function DingPage() {
  const { state, dispatch } = useApp()
  const [showCreate, setShowCreate] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const received = state.dingMessages.filter(d => d.type === 'received')
  const sent = state.dingMessages.filter(d => d.type === 'sent')
  const activeTab = state.dingActiveTab || 'received'
  const list = activeTab === 'received' ? received : sent

  const getUser = (id) => state.users.find(u => u.id === id)

  return (
    <div className="ding-page">
      {/* Middle panel */}
      <div className="list-panel">
        <div className="list-panel-header">
          <span style={{ fontWeight: 600, fontSize: 15 }}>DING消息</span>
          <button className="icon-btn" onClick={() => setShowCreate(true)} title="发DING">📤</button>
        </div>
        <div className="ding-tabs">
          <button
            className={`ding-tab ${activeTab === 'received' ? 'ding-tab-active' : ''}`}
            onClick={() => dispatch({ type: 'SET_DING_TAB', tab: 'received' })}
          >
            我收到的
            {received.filter(d => !d.confirmedBy.includes(state.currentUser.id)).length > 0 && (
              <span className="tab-badge">{received.filter(d => !d.confirmedBy.includes(state.currentUser.id)).length}</span>
            )}
          </button>
          <button
            className={`ding-tab ${activeTab === 'sent' ? 'ding-tab-active' : ''}`}
            onClick={() => dispatch({ type: 'SET_DING_TAB', tab: 'sent' })}
          >
            我发出的
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {list.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', paddingTop: 40, fontSize: 13 }}>暂无DING消息</div>
          )}
          {list.map(ding => {
            const sender = getUser(ding.senderId)
            const isConfirmed = ding.confirmedBy.includes(state.currentUser.id)
            const expanded = expandedId === ding.id

            return (
              <div key={ding.id} className="ding-card">
                <div className="ding-card-header">
                  <div className="avatar-circle avatar-sm" style={{ background: sender?.avatar || '#ccc', flexShrink: 0 }}>
                    {sender?.name.charAt(0)}
                  </div>
                  <div className="ding-card-info">
                    <div className="ding-sender">{sender?.name}</div>
                    <div className="ding-time">{formatTime(ding.timestamp)}</div>
                  </div>
                  {activeTab === 'received' && (
                    <button
                      className={`confirm-btn ${isConfirmed ? 'confirmed' : ''}`}
                      onClick={() => !isConfirmed && dispatch({ type: 'CONFIRM_DING', id: ding.id })}
                    >
                      {isConfirmed ? '已确认' : '确认'}
                    </button>
                  )}
                  {activeTab === 'sent' && (
                    <button
                      className="expand-btn"
                      onClick={() => setExpandedId(expanded ? null : ding.id)}
                    >
                      已确认 {ding.confirmedBy.length}/{ding.recipientIds.length}人 {expanded ? '▲' : '▼'}
                    </button>
                  )}
                </div>
                <div className="ding-content">{ding.content}</div>
                {expanded && activeTab === 'sent' && (
                  <div className="ding-receipt">
                    <div className="receipt-col">
                      <div className="receipt-header">✅ 已确认 ({ding.confirmedBy.length})</div>
                      {ding.confirmedBy.map(id => {
                        const u = getUser(id)
                        return <div key={id} className="receipt-user-row">
                          <div className="avatar-circle" style={{ width: 20, height: 20, fontSize: 10, background: u?.avatar || '#ccc' }}>{u?.name.charAt(0)}</div>
                          <span>{u?.name}</span>
                        </div>
                      })}
                    </div>
                    <div className="receipt-col">
                      <div className="receipt-header">⏳ 未确认 ({ding.recipientIds.filter(id => !ding.confirmedBy.includes(id)).length})</div>
                      {ding.recipientIds.filter(id => !ding.confirmedBy.includes(id)).map(id => {
                        const u = getUser(id)
                        return <div key={id} className="receipt-user-row">
                          <div className="avatar-circle" style={{ width: 20, height: 20, fontSize: 10, background: u?.avatar || '#ccc' }}>{u?.name.charAt(0)}</div>
                          <span>{u?.name}</span>
                        </div>
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right empty state */}
      <div className="chat-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <div>DING消息是重要的紧急通知</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>点击"发DING"向同事发送紧急提醒</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>
            发DING
          </button>
        </div>
      </div>

      {showCreate && (
        <CreateDingModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}

function CreateDingModal({ onClose }) {
  const { state, dispatch } = useApp()
  const [selected, setSelected] = useState([])
  const [content, setContent] = useState('')
  const [method, setMethod] = useState('应用内')
  const [search, setSearch] = useState('')

  const others = state.users.filter(u => !u.isCurrentUser && u.name.includes(search))

  const toggle = (u) => {
    setSelected(prev => prev.some(x => x.id === u.id) ? prev.filter(x => x.id !== u.id) : [...prev, u])
  }

  const handleSend = () => {
    if (!content.trim() || selected.length === 0) return
    dispatch({ type: 'SEND_DING', recipientIds: selected.map(u => u.id), content: content.trim(), method })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3>发DING</h3>
          <button onClick={onClose} style={{ fontSize: 18, cursor: 'pointer', color: '#8F959E' }}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>选择接收人</label>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜索联系人"
              style={{ width: '100%', padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 13, marginBottom: 8, fontFamily: 'var(--font-family)' }}
            />
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 4 }}>
              {others.map(u => (
                <div key={u.id} onClick={() => toggle(u)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', cursor: 'pointer', background: selected.some(x => x.id === u.id) ? '#EBF4FF' : 'transparent' }}>
                  <input type="checkbox" checked={selected.some(x => x.id === u.id)} onChange={() => {}} style={{ width: 15, height: 15 }} />
                  <div className="avatar-circle avatar-sm" style={{ background: u.avatar }}>{u.name.charAt(0)}</div>
                  <span style={{ fontSize: 13 }}>{u.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{u.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>DING内容</label>
            <textarea
              value={content} onChange={e => setContent(e.target.value)}
              placeholder="请输入紧急通知内容..."
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 13, minHeight: 80, resize: 'none', fontFamily: 'var(--font-family)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>通知方式</label>
            {['应用内', '短信', '电话'].map(m => (
              <label key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 16, cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" checked={method === m} onChange={() => setMethod(m)} />
                {m}
              </label>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSend} disabled={!content.trim() || selected.length === 0}>发送</button>
        </div>
      </div>
    </div>
  )
}
