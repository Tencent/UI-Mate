import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/Avatar.jsx'
import { formatRelativeDate } from '../utils/dataManager.js'

function FeedbackCard({ item, users, currentUser, onReact }) {
  const fromUser = users.find(u => u.id === item.fromUserId)
  const toUser = users.find(u => u.id === item.toUserId)

  const visibilityBadge = {
    private: { icon: '🔒', label: 'Private', color: '#6B7280', bg: '#F3F4F6' },
    public: { icon: '👁', label: 'Public', color: '#166534', bg: '#DCFCE7' },
    manager_only: { icon: '👤', label: 'Manager only', color: '#854D0E', bg: '#FEF9C3' },
  }[item.visibility] || { icon: '', label: item.visibility, color: '#6B7280', bg: '#F3F4F6' }

  return (
    <div className="card" style={{ marginBottom: 12, padding: '16px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {fromUser && <Avatar user={fromUser} size={36} />}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {fromUser ? `${fromUser.firstName} ${fromUser.lastName}` : 'Unknown'}
              {item.type === 'praise' && toUser && (
                <span style={{ color: '#6B7280', fontWeight: 400 }}>
                  {' → '}
                  {toUser.firstName} {toUser.lastName}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              {fromUser?.title}
              {item.type === 'praise' && toUser && <span> → {toUser.title}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {item.isPendingRequest && (
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 20,
              background: '#FEF9C3', color: '#854D0E', fontWeight: 600,
            }}>
              ⏳ Pending
            </span>
          )}
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 20,
            background: visibilityBadge.bg, color: visibilityBadge.color,
            fontWeight: 500,
          }}>
            {visibilityBadge.icon} {visibilityBadge.label}
          </span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{formatRelativeDate(item.createdAt)}</span>
        </div>
      </div>

      {/* Body */}
      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 12 }}>{item.body}</p>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {item.competencyTags?.map(tag => (
          <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#EFF6FF', color: '#1D4ED8', fontWeight: 500 }}>
            {tag}
          </span>
        ))}
        {item.valueTags?.map(tag => (
          <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#FFF7ED', color: '#92400E', fontWeight: 500 }}>
            ⭐ {tag}
          </span>
        ))}
      </div>

      {/* Reactions (for praise) */}
      {item.type === 'praise' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {Object.entries(
            (item.reactions || []).reduce((acc, r) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1
              return acc
            }, {})
          ).map(([emoji, count]) => {
            const hasReacted = item.reactions.some(r => r.userId === currentUser.id && r.emoji === emoji)
            return (
              <button
                key={emoji}
                onClick={() => onReact(item.id, emoji)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                  borderRadius: 20, border: `1px solid ${hasReacted ? '#6B4FBB' : '#E5E7EB'}`,
                  background: hasReacted ? '#EFF6FF' : '#fff', cursor: 'pointer', fontSize: 13,
                }}
              >
                {emoji} <span style={{ fontSize: 12, fontWeight: 600, color: hasReacted ? '#6B4FBB' : '#374151' }}>{count}</span>
              </button>
            )
          })}
          <button
            onClick={() => onReact(item.id, '👏')}
            style={{
              padding: '4px 10px', borderRadius: 20, border: '1px solid #E5E7EB',
              background: '#fff', cursor: 'pointer', fontSize: 13, color: '#6B7280',
            }}
          >
            + React
          </button>
        </div>
      )}
    </div>
  )
}

function GiveFeedbackModal({ onClose, users, currentUser, onSubmit }) {
  const [recipient, setRecipient] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [feedbackType, setFeedbackType] = useState('feedback')
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState('private')
  const [competencyTags, setCompetencyTags] = useState([])
  const [valueTag, setValueTag] = useState('')
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const allTags = ['Leadership', 'Communication', 'Collaboration', 'Execution', 'Technical Skills', 'Adaptability', 'Design Thinking', 'Initiative', 'Mentorship']
  const companyValues = ['Innovation', 'Teamwork', 'Customer Focus', 'Integrity', 'Growth Mindset']

  const filteredUsers = users.filter(u =>
    u.id !== currentUser.id &&
    (`${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSubmit = () => {
    if (!selectedUser || !body.trim()) return
    const item = {
      id: `fb_${Date.now()}`,
      type: feedbackType,
      fromUserId: currentUser.id,
      toUserId: selectedUser.id,
      body: body.trim(),
      visibility: feedbackType === 'praise' ? 'public' : visibility,
      competencyTags,
      valueTags: valueTag ? [valueTag] : [],
      reactions: [],
      createdAt: new Date().toISOString(),
    }
    onSubmit(item)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Give Feedback</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Recipient</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                placeholder="Search for a person..."
                value={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : search}
                onChange={e => { setSearch(e.target.value); setSelectedUser(null); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
              />
              {showDropdown && filteredUsers.length > 0 && !selectedUser && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: 200, overflowY: 'auto' }}>
                  {filteredUsers.map(u => (
                    <div
                      key={u.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                      onClick={() => { setSelectedUser(u); setSearch(''); setShowDropdown(false) }}
                    >
                      <Avatar user={u} size={28} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{u.firstName} {u.lastName}</div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>{u.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="seg-control">
              <button className={`seg-btn${feedbackType === 'feedback' ? ' active' : ''}`} onClick={() => setFeedbackType('feedback')}>Feedback</button>
              <button className={`seg-btn${feedbackType === 'praise' ? ' active' : ''}`} onClick={() => setFeedbackType('praise')}>Praise</button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              placeholder={feedbackType === 'praise' ? 'Write a praise message...' : 'Write your feedback...'}
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>

          {feedbackType === 'feedback' && (
            <div className="form-group">
              <label className="form-label">Visibility</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['private', 'public', 'manager_only'].map(v => (
                  <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name="visibility" value={v} checked={visibility === v} onChange={() => setVisibility(v)} style={{ accentColor: '#6B4FBB' }} />
                    {{private: '🔒 Private', public: '👁 Public', manager_only: '👤 Manager only'}[v]}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Competency tags (optional)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setCompetencyTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  style={{
                    padding: '3px 10px', borderRadius: 20, border: `1px solid ${competencyTags.includes(tag) ? '#6B4FBB' : '#E5E7EB'}`,
                    background: competencyTags.includes(tag) ? '#EFF6FF' : '#fff', color: competencyTags.includes(tag) ? '#1D4ED8' : '#374151',
                    fontSize: 12, cursor: 'pointer',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {feedbackType === 'praise' && (
            <div className="form-group">
              <label className="form-label">Company value (optional)</label>
              <select className="form-input" value={valueTag} onChange={e => setValueTag(e.target.value)}>
                <option value="">Select a value...</option>
                {companyValues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!selectedUser || !body.trim()}>
            {feedbackType === 'praise' ? 'Give Praise' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RequestFeedbackModal({ onClose, users, currentUser, onSubmit }) {
  const [search, setSearch] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [prompt, setPrompt] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const filteredUsers = users.filter(u =>
    u.id !== currentUser.id &&
    !selectedUsers.find(s => s.id === u.id) &&
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  const addUser = (u) => {
    setSelectedUsers(prev => [...prev, u])
    setSearch('')
    setShowDropdown(false)
  }

  const removeUser = (uid) => setSelectedUsers(prev => prev.filter(u => u.id !== uid))

  const handleSubmit = () => {
    if (selectedUsers.length === 0) return
    onSubmit(selectedUsers, prompt.trim())
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Request Feedback</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Recipients</label>
            <div style={{ display: 'relative' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {selectedUsers.map(u => (
                  <span key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#1D4ED8', fontSize: 13, padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                    {u.firstName} {u.lastName}
                    <button onClick={() => removeUser(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93C5FD', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  placeholder="Search for a person..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                />
                {showDropdown && filteredUsers.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: 200, overflowY: 'auto' }}>
                    {filteredUsers.map(u => (
                      <div
                        key={u.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                        onClick={() => addUser(u)}
                      >
                        <Avatar user={u} size={28} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{u.firstName} {u.lastName}</div>
                          <div style={{ fontSize: 11, color: '#6B7280' }}>{u.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Optional prompt</label>
            <textarea
              className="form-textarea"
              placeholder="What specific feedback are you looking for? (optional)"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={selectedUsers.length === 0}>
            Send Request
          </button>
        </div>
      </div>
    </div>
  )
}


export default function Feedback() {
  const { state, updateState } = useApp()
  const [activeTab, setActiveTab] = useState('Received')
  const [showModal, setShowModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)

  if (!state) return null
  const { currentUser, users, feedback } = state

  const tabs = ['Received', 'Given', 'Requested', 'Praise']

  const filteredFeedback = feedback.filter(item => {
    if (activeTab === 'Received') return item.toUserId === currentUser.id && item.type === 'feedback' && !item.isPendingRequest
    if (activeTab === 'Given') return item.fromUserId === currentUser.id && !item.isPendingRequest
    if (activeTab === 'Requested') return item.toUserId === currentUser.id && item.isPendingRequest === true
    if (activeTab === 'Praise') return item.type === 'praise'
    return false
  })

  const handleReact = (feedbackId, emoji) => {
    updateState(prev => ({
      ...prev,
      feedback: prev.feedback.map(item => {
        if (item.id !== feedbackId) return item
        const hasReacted = item.reactions.some(r => r.userId === prev.currentUser.id && r.emoji === emoji)
        return {
          ...item,
          reactions: hasReacted
            ? item.reactions.filter(r => !(r.userId === prev.currentUser.id && r.emoji === emoji))
            : [...item.reactions, { userId: prev.currentUser.id, emoji }]
        }
      })
    }))
  }

  const handleSubmitFeedback = (item) => {
    updateState(prev => {
      const updatedTasks = prev.tasks.map(t =>
        (t.relatedEntityType === 'feedback' || t.id === 'task_5') && !t.completed
          ? { ...t, completed: true }
          : t
      )
      return { ...prev, feedback: [item, ...prev.feedback], tasks: updatedTasks }
    })
  }

  const handleRequestFeedback = (recipients, prompt) => {
    const newItems = recipients.map(u => ({
      id: `fb_${Date.now()}_${u.id}`,
      type: 'feedback',
      fromUserId: u.id,
      toUserId: currentUser.id,
      body: prompt || '',
      visibility: 'private',
      competencyTags: [],
      valueTags: [],
      reactions: [],
      createdAt: new Date().toISOString(),
      isPendingRequest: true,
    }))
    updateState(prev => ({
      ...prev,
      feedback: [...newItems, ...prev.feedback],
    }))
  }

  return (
    <div style={{ padding: 32 }}>
      <div className="page-header">
        <h1 className="page-title">Feedback</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setShowRequestModal(true)}>
            Request Feedback
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Give Feedback
          </button>
        </div>
      </div>

      <div className="tab-nav">
        {tabs.map(tab => (
          <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {filteredFeedback.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">💬</div>
          <div className="empty-state-text">No {activeTab.toLowerCase()} feedback yet</div>
        </div>
      ) : (
        <div>
          {filteredFeedback.map(item => (
            <FeedbackCard
              key={item.id}
              item={item}
              users={users}
              currentUser={currentUser}
              onReact={handleReact}
            />
          ))}
        </div>
      )}

      {showModal && (
        <GiveFeedbackModal
          onClose={() => setShowModal(false)}
          users={users}
          currentUser={currentUser}
          onSubmit={handleSubmitFeedback}
        />
      )}

      {showRequestModal && (
        <RequestFeedbackModal
          onClose={() => setShowRequestModal(false)}
          users={users}
          currentUser={currentUser}
          onSubmit={handleRequestFeedback}
        />
      )}
    </div>
  )
}
