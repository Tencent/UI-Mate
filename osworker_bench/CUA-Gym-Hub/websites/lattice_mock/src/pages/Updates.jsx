import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/Avatar.jsx'
import { formatDate } from '../utils/dataManager.js'

const MOODS = [
  { key: 'great', emoji: '😄', label: 'Great' },
  { key: 'good', emoji: '🙂', label: 'Good' },
  { key: 'okay', emoji: '😐', label: 'Okay' },
  { key: 'not_great', emoji: '😟', label: 'Not great' },
]

function WriteUpdateModal({ onClose, onSubmit, currentUser }) {
  const [accomplishments, setAccomplishments] = useState('')
  const [challenges, setChallenges] = useState('')
  const [priorities, setPriorities] = useState('')
  const [mood, setMood] = useState(null)

  const getMonday = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d.toISOString().split('T')[0]
  }

  const handleSubmit = () => {
    if (!accomplishments.trim()) return
    const update = {
      id: `upd_${Date.now()}`,
      authorId: currentUser.id,
      weekOf: getMonday(),
      accomplishments: accomplishments.trim(),
      challenges: challenges.trim(),
      priorities: priorities.trim(),
      mood,
      createdAt: new Date().toISOString(),
    }
    onSubmit(update)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <span className="modal-title">Write an Update</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">What did you accomplish this week? *</label>
            <textarea className="form-textarea" placeholder="Share your wins and completed work..." value={accomplishments} onChange={e => setAccomplishments(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">What challenges are you facing?</label>
            <textarea className="form-textarea" placeholder="Any blockers, concerns, or areas where you need help..." value={challenges} onChange={e => setChallenges(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">What are your priorities for next week?</label>
            <textarea className="form-textarea" placeholder="Your focus areas for the coming week..." value={priorities} onChange={e => setPriorities(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">How are you feeling? (optional)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {MOODS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMood(mood === m.key ? null : m.key)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '8px 14px', borderRadius: 8,
                    border: `2px solid ${mood === m.key ? '#6B4FBB' : '#E5E7EB'}`,
                    background: mood === m.key ? '#EFF6FF' : '#fff', cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{m.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: mood === m.key ? '#6B4FBB' : '#6B7280' }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!accomplishments.trim()}>Submit Update</button>
        </div>
      </div>
    </div>
  )
}

function UpdateCard({ update, users }) {
  const [expanded, setExpanded] = useState(false)
  const author = users.find(u => u.id === update.authorId)
  const moodData = MOODS.find(m => m.key === update.mood)

  const weekDate = new Date(update.weekOf)
  const weekStr = weekDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
      <div
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14 }}
        onClick={() => setExpanded(v => !v)}
        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
        onMouseLeave={e => e.currentTarget.style.background = ''}
      >
        {author && <Avatar user={author} size={40} />}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Week of {weekStr}</span>
            {moodData && <span style={{ fontSize: 18 }} title={moodData.label}>{moodData.emoji}</span>}
          </div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>
            {author ? `${author.firstName} ${author.lastName}` : 'Unknown'} • {new Date(update.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          {!expanded && (
            <div style={{ fontSize: 13, color: '#374151', marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {update.accomplishments}
            </div>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? 'rotate(90deg)' : '', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #F3F4F6' }}>
          {[
            { label: 'Accomplishments', content: update.accomplishments, color: '#6B4FBB' },
            { label: 'Challenges', content: update.challenges, color: '#EF4444' },
            { label: 'Priorities', content: update.priorities, color: '#F59E0B' },
          ].map(section => section.content ? (
            <div key={section.label} style={{ display: 'flex', gap: 0, padding: '14px 20px', borderBottom: '1px solid #F9FAFB' }}>
              <div style={{ width: 4, background: section.color, borderRadius: 2, flexShrink: 0, marginRight: 16 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: section.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  {section.label}
                </div>
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{section.content}</div>
              </div>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  )
}

export default function Updates() {
  const { state, updateState } = useApp()
  const [showModal, setShowModal] = useState(false)

  if (!state) return null
  const { currentUser, users, updates } = state

  const sorted = [...updates].sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf))

  const handleSubmit = (update) => {
    updateState(prev => ({ ...prev, updates: [update, ...prev.updates] }))
  }

  return (
    <div style={{ padding: 32 }}>
      <div className="page-header">
        <h1 className="page-title">Updates</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Write an update</button>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">📝</div>
          <div className="empty-state-text">No updates yet</div>
          <div className="empty-state-sub">Share your weekly progress with your manager</div>
        </div>
      ) : (
        sorted.map(update => (
          <UpdateCard key={update.id} update={update} users={users} />
        ))
      )}

      {showModal && (
        <WriteUpdateModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}
