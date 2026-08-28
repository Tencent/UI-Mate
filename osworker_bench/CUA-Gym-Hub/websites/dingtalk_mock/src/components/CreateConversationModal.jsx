import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function CreateConversationModal({ onClose }) {
  const { state, dispatch } = useApp()
  const [selectedUsers, setSelectedUsers] = useState([])
  const [groupName, setGroupName] = useState('')
  const [search, setSearch] = useState('')

  const otherUsers = state.users.filter(u => !u.isCurrentUser)
  const filtered = otherUsers.filter(u =>
    u.name.includes(search) || u.title.includes(search)
  )

  const toggleUser = (u) => {
    setSelectedUsers(prev =>
      prev.some(x => x.id === u.id) ? prev.filter(x => x.id !== u.id) : [...prev, u]
    )
  }

  const handleConfirm = () => {
    if (selectedUsers.length === 0) return
    const userIds = selectedUsers.map(u => u.id)
    const type = selectedUsers.length > 1 ? 'group' : 'dm'
    const name = type === 'group' ? (groupName || '群聊') : selectedUsers[0].name
    dispatch({ type: 'CREATE_CONVERSATION', userIds, convType: type, name })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>发起聊天</h3>
          <button onClick={onClose} style={{ fontSize: 18, cursor: 'pointer', color: '#8F959E' }}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: '16px' }}>
          <input
            type="text"
            placeholder="搜索联系人"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
              borderRadius: 4, fontSize: 14, marginBottom: 12,
              fontFamily: 'var(--font-family)'
            }}
          />
          {selectedUsers.length > 1 && (
            <input
              type="text"
              placeholder="群聊名称（可选）"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
                borderRadius: 4, fontSize: 14, marginBottom: 12,
                fontFamily: 'var(--font-family)'
              }}
            />
          )}
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {filtered.map(u => (
              <div
                key={u.id}
                onClick={() => toggleUser(u)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 4px', cursor: 'pointer', borderRadius: 4,
                  background: selectedUsers.some(x => x.id === u.id) ? '#EBF4FF' : 'transparent',
                  transition: 'background 0.1s'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.some(x => x.id === u.id)}
                  onChange={() => {}}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <div className="avatar-circle avatar-sm" style={{ background: u.avatar }}>{u.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.title}</div>
                </div>
              </div>
            ))}
          </div>
          {selectedUsers.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              已选 {selectedUsers.length} 人：{selectedUsers.map(u => u.name).join('、')}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={selectedUsers.length === 0}>
            确定
          </button>
        </div>
      </div>
    </div>
  )
}
