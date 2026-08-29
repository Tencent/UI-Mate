import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function AnnouncementsPage() {
  const { state, dispatch } = useApp()
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const announcements = [...state.announcements].sort((a, b) => {
    if (a.isTop !== b.isTop) return b.isTop ? 1 : -1
    return new Date(b.publishedAt) - new Date(a.publishedAt)
  })

  const getUser = (id) => state.users.find(u => u.id === id)

  const handleSelect = (ann) => {
    setSelected(ann)
    if (!ann.readBy.includes(state.currentUser.id)) {
      dispatch({ type: 'READ_ANNOUNCEMENT', id: ann.id })
    }
  }

  const isUnread = (ann) => !ann.readBy.includes(state.currentUser.id)

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Announcement list */}
      <div style={{ width: 300, borderRight: '1px solid var(--border)', overflow: 'hidden', background: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px 10px', fontWeight: 600, fontSize: 15, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>公告</span>
          <button
            className="btn btn-primary"
            style={{ fontSize: 12, padding: '5px 12px' }}
            onClick={() => setShowCreate(true)}
          >
            + 发布公告
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {announcements.map(ann => {
            const author = getUser(ann.authorId)
            const unread = isUnread(ann)
            return (
              <div
                key={ann.id}
                onClick={() => handleSelect(ann)}
                style={{
                  padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
                  background: selected?.id === ann.id ? 'var(--active-bg)' : 'white',
                  borderLeft: selected?.id === ann.id ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'background 0.1s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {ann.isTop && <span style={{ fontSize: 10, background: '#FF4D4F', color: 'white', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>TOP</span>}
                  {unread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />}
                  <span style={{ fontSize: 13, fontWeight: unread ? 600 : 400, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ann.title}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {author?.name} · {new Date(ann.publishedAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Announcement detail */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px', background: '#f7f8fa' }}>
        {selected ? (
          <div style={{ maxWidth: 640 }}>
            {selected.isTop && (
              <span style={{ fontSize: 11, background: '#FF4D4F', color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 700, marginBottom: 12, display: 'inline-block' }}>
                置顶公告
              </span>
            )}
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{selected.title}</h2>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20, display: 'flex', gap: 12 }}>
              <span>发布人：{state.users.find(u => u.id === selected.authorId)?.name}</span>
              <span>发布时间：{new Date(selected.publishedAt).toLocaleDateString('zh-CN')}</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', background: 'white', padding: '20px 24px', borderRadius: 8, border: '1px solid var(--border)' }}>
              {selected.content}
            </div>

            {/* Read confirmations */}
            <div style={{ marginTop: 16, background: 'white', padding: '16px 20px', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>已读确认</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#52C41A', marginBottom: 6 }}>
                    已读 ({selected.readBy.length})
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {selected.readBy.map(id => {
                      const u = getUser(id)
                      return u ? (
                        <div key={id} className="avatar-circle" style={{ width: 24, height: 24, fontSize: 10, background: u.avatar }} title={u.name}>
                          {u.name.charAt(0)}
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    未读 ({state.users.length - selected.readBy.length})
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {state.users.filter(u => !selected.readBy.includes(u.id)).slice(0, 8).map(u => (
                      <div key={u.id} className="avatar-circle" style={{ width: 24, height: 24, fontSize: 10, background: u.avatar, opacity: 0.5 }} title={u.name}>
                        {u.name.charAt(0)}
                      </div>
                    ))}
                    {state.users.filter(u => !selected.readBy.includes(u.id)).length > 8 && (
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', alignSelf: 'center' }}>
                        +{state.users.filter(u => !selected.readBy.includes(u.id)).length - 8}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
              <div>选择公告查看详情</div>
            </div>
          </div>
        )}
      </div>

      {showCreate && <CreateAnnouncementModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

function CreateAnnouncementModal({ onClose }) {
  const { dispatch } = useApp()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isTop, setIsTop] = useState(false)

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return
    dispatch({
      type: 'CREATE_ANNOUNCEMENT',
      announcement: { title: title.trim(), content: content.trim(), isTop }
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3>发布公告</h3>
          <button onClick={onClose} style={{ fontSize: 18, cursor: 'pointer', color: '#8F959E' }}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>公告标题 *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="请输入公告标题"
              className="form-input"
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>公告内容 *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="请输入公告内容..."
              className="form-textarea"
              style={{ minHeight: 120 }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={isTop} onChange={e => setIsTop(e.target.checked)} style={{ width: 14, height: 14 }} />
              置顶公告
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!title.trim() || !content.trim()}>发布</button>
        </div>
      </div>
    </div>
  )
}
