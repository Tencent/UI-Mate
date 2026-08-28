import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './ContactsPage.css'

function CreateDingModal({ onClose, prefilledUser }) {
  const { state, dispatch } = useApp()
  const [selected, setSelected] = useState(prefilledUser ? [prefilledUser] : [])
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

export default function ContactsPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const [selectedUser, setSelectedUser] = useState(null)
  const [toast, setToast] = useState('')
  const [dingTarget, setDingTarget] = useState(null)

  const getPath = (p) => sid ? `${p}?sid=${sid}` : p

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const handleMessage = (user) => {
    dispatch({ type: 'CREATE_CONVERSATION', userIds: [user.id], convType: 'dm' })
    dispatch({ type: 'SET_ACTIVE_TAB', tab: 'messages' })
    navigate(getPath('/messages'))
  }

  const activeTab = state.contactsActiveTab || 'org'

  return (
    <div className="contacts-page">
      {/* Middle panel */}
      <div className="list-panel">
        <div className="list-panel-header">
          <span style={{ fontWeight: 600, fontSize: 15 }}>通讯录</span>
        </div>
        <div className="contacts-tabs">
          {['org', 'friends', 'groups'].map(tab => (
            <button
              key={tab}
              className={`contacts-tab ${activeTab === tab ? 'contacts-tab-active' : ''}`}
              onClick={() => dispatch({ type: 'SET_CONTACTS_TAB', tab })}
            >
              {tab === 'org' ? '组织架构' : tab === 'friends' ? '我的好友' : '群组'}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'org' && (
            <OrgTree
              departments={state.departments}
              users={state.users}
              dispatch={dispatch}
              onSelectUser={setSelectedUser}
              selectedUserId={selectedUser?.id}
            />
          )}
          {activeTab === 'friends' && (
            <div style={{ padding: '8px 12px' }}>
              {state.users.filter(u => !u.isCurrentUser).map(u => (
                <div
                  key={u.id}
                  className={`contact-item ${selectedUser?.id === u.id ? 'contact-active' : ''}`}
                  onClick={() => setSelectedUser(u)}
                >
                  <div className="avatar-circle avatar-sm" style={{ background: u.avatar }}>{u.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{u.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'groups' && (
            <div style={{ padding: '8px 12px' }}>
              {state.conversations.filter(c => c.isGroup).map(conv => (
                <div
                  key={conv.id}
                  className="contact-item"
                  onClick={() => {
                    dispatch({ type: 'SET_ACTIVE_TAB', tab: 'messages' })
                    dispatch({ type: 'SET_ACTIVE_CONVERSATION', id: conv.id })
                    navigate(getPath(`/messages/${conv.id}`))
                  }}
                >
                  <div className="avatar-circle avatar-sm" style={{ background: conv.avatar }}>{conv.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{conv.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{conv.memberIds.length}人</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: user detail */}
      <div className="chat-panel" style={{ background: '#f7f8fa', overflow: 'hidden' }}>
        {selectedUser ? (
          <ContactDetail
            user={selectedUser}
            departments={state.departments}
            onMessage={handleMessage}
            onDing={() => setDingTarget(selectedUser)}
            onVideo={() => {
              dispatch({ type: 'CREATE_CONVERSATION', userIds: [selectedUser.id], convType: 'dm' })
              const conv = state.conversations.find(c => c.type === 'dm' && c.memberIds.includes(selectedUser.id))
              if (conv) {
                dispatch({ type: 'SEND_MESSAGE', conversationId: conv.id, text: `[视频会议] 发起了视频会议邀请` })
              }
              dispatch({ type: 'SET_ACTIVE_TAB', tab: 'messages' })
              navigate(getPath('/messages'))
              showToast(`已向 ${selectedUser.name} 发起视频会议`)
            }}
            onCopy={(text) => {
              navigator.clipboard?.writeText(text).catch(() => {})
              showToast('已复制')
            }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
              <div>选择联系人查看详情</div>
            </div>
          </div>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
      {dingTarget && (
        <CreateDingModal
          prefilledUser={dingTarget}
          onClose={() => setDingTarget(null)}
        />
      )}
    </div>
  )
}

function OrgTree({ departments, users, dispatch, onSelectUser, selectedUserId }) {
  const rootDepts = departments.filter(d => d.parentId === null)

  return (
    <div style={{ padding: '8px 0' }}>
      {rootDepts.map(dept => (
        <DeptNode key={dept.id} dept={dept} departments={departments} users={users} dispatch={dispatch} onSelectUser={onSelectUser} selectedUserId={selectedUserId} level={0} />
      ))}
    </div>
  )
}

function DeptNode({ dept, departments, users, dispatch, onSelectUser, selectedUserId, level }) {
  const children = departments.filter(d => d.parentId === dept.id)
  const members = users.filter(u => u.departmentId === dept.id && !u.isCurrentUser)
  const hasChildren = children.length > 0 || members.length > 0

  const toggle = () => dispatch({ type: 'TOGGLE_DEPARTMENT', id: dept.id })

  return (
    <div>
      <div
        className="dept-node"
        style={{ paddingLeft: 12 + level * 20 }}
        onClick={toggle}
      >
        {hasChildren && (
          <span className="dept-arrow">{dept.expanded ? '▾' : '▸'}</span>
        )}
        <span className="dept-icon">📁</span>
        <span className="dept-name">{dept.name}</span>
        <span className="dept-count">{dept.memberCount}人</span>
      </div>
      {dept.expanded && (
        <>
          {members.map(u => (
            <div
              key={u.id}
              className={`contact-item ${selectedUserId === u.id ? 'contact-active' : ''}`}
              style={{ paddingLeft: 24 + level * 20 }}
              onClick={() => onSelectUser(u)}
            >
              <div className="avatar-circle avatar-sm" style={{ background: u.avatar }}>{u.name.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{u.title}</div>
              </div>
            </div>
          ))}
          {children.map(child => (
            <DeptNode key={child.id} dept={child} departments={departments} users={users} dispatch={dispatch} onSelectUser={onSelectUser} selectedUserId={selectedUserId} level={level + 1} />
          ))}
        </>
      )}
    </div>
  )
}

function ContactDetail({ user, departments, onMessage, onDing, onVideo, onCopy }) {
  const getDeptBreadcrumb = () => {
    const parts = []
    let deptId = user.departmentId
    while (deptId) {
      const dept = departments.find(d => d.id === deptId)
      if (!dept) break
      parts.unshift(dept.name)
      deptId = dept.parentId
    }
    return parts.join(' > ')
  }

  return (
    <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="avatar-circle" style={{ width: 80, height: 80, fontSize: 28, background: user.avatar, marginBottom: 16 }}>
        {user.name.charAt(0)}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{user.name}</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>{user.title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 24 }}>{getDeptBreadcrumb()}</div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => onMessage(user)}>发消息</button>
        <button className="btn btn-default" style={{ fontSize: 13 }} onClick={onDing}>DING TA</button>
        <button className="btn btn-default" style={{ fontSize: 13 }} onClick={onVideo}>视频会议</button>
      </div>

      <div style={{ width: '100%', maxWidth: 360, background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '0 16px' }}>
        <div className="detail-field">
          <span className="detail-label">手机</span>
          <span className="detail-value">{user.phone}</span>
          <button className="copy-btn" onClick={() => onCopy(user.phone)}>📋</button>
        </div>
        <div className="detail-field" style={{ borderBottom: 'none' }}>
          <span className="detail-label">邮箱</span>
          <span className="detail-value">{user.email}</span>
          <button className="copy-btn" onClick={() => onCopy(user.email)}>📋</button>
        </div>
      </div>
    </div>
  )
}
