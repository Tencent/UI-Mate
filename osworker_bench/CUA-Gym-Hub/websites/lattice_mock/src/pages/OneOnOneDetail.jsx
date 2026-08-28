import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/Avatar.jsx'
import { formatDate } from '../utils/dataManager.js'

export default function OneOnOneDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, updateState } = useApp()
  const [newTp, setNewTp] = useState('')
  const [newAi, setNewAi] = useState('')
  const [expandedPast, setExpandedPast] = useState({})
  const [notes, setNotes] = useState(null)

  if (!state) return null

  const { currentUser, users, oneOnOnes, meetings } = state
  const oo = oneOnOnes.find(o => o.id === id)

  if (!oo) {
    return (
      <div style={{ padding: 32 }}>
        <button className="btn btn-outline" onClick={() => navigate('/1on1s')}>← Back to 1:1s</button>
        <p style={{ marginTop: 20, color: '#6B7280' }}>1:1 not found.</p>
      </div>
    )
  }

  const otherUserId = oo.participantIds.find(uid => uid !== currentUser.id)
  const otherUser = users.find(u => u.id === otherUserId)

  const sortedMeetings = meetings
    .filter(m => m.oneOnOneId === id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const activeMeeting = sortedMeetings.find(m => m.status === 'upcoming') || sortedMeetings[0]
  const pastMeetings = sortedMeetings.filter(m => m.id !== activeMeeting?.id && m.status === 'completed')

  const currentNotes = notes !== null ? notes : (activeMeeting?.notes || '')

  const toggleTalkingPoint = (tpId) => {
    updateState(prev => ({
      ...prev,
      meetings: prev.meetings.map(m => {
        if (m.id !== activeMeeting.id) return m
        return {
          ...m,
          talkingPoints: m.talkingPoints.map(tp =>
            tp.id === tpId ? { ...tp, discussed: !tp.discussed } : tp
          )
        }
      })
    }))
  }

  const addTalkingPoint = () => {
    if (!newTp.trim()) return
    const tp = {
      id: `tp_new_${Date.now()}`,
      text: newTp.trim(),
      addedBy: currentUser.id,
      discussed: false,
      order: activeMeeting.talkingPoints.length,
    }
    updateState(prev => {
      const updatedMeetings = prev.meetings.map(m => {
        if (m.id !== activeMeeting.id) return m
        return { ...m, talkingPoints: [...m.talkingPoints, tp] }
      })
      const updatedTasks = prev.tasks.map(t =>
        t.relatedEntityType === '1on1' && t.relatedEntityId === id && !t.completed
          ? { ...t, completed: true }
          : t
      )
      return { ...prev, meetings: updatedMeetings, tasks: updatedTasks }
    })
    setNewTp('')
  }

  const addActionItem = () => {
    if (!newAi.trim()) return
    const ai = {
      id: `ai_new_${Date.now()}`,
      text: newAi.trim(),
      assigneeId: currentUser.id,
      dueDate: null,
      completed: false,
    }
    updateState(prev => ({
      ...prev,
      meetings: prev.meetings.map(m => {
        if (m.id !== activeMeeting.id) return m
        return { ...m, actionItems: [...(m.actionItems || []), ai] }
      })
    }))
    setNewAi('')
  }

  const toggleActionItem = (aiId) => {
    updateState(prev => ({
      ...prev,
      meetings: prev.meetings.map(m => {
        if (m.id !== activeMeeting.id) return m
        return {
          ...m,
          actionItems: m.actionItems.map(ai =>
            ai.id === aiId ? { ...ai, completed: !ai.completed } : ai
          )
        }
      })
    }))
  }

  const saveNotes = () => {
    updateState(prev => {
      const updatedMeetings = prev.meetings.map(m =>
        m.id === activeMeeting.id ? { ...m, notes: currentNotes } : m
      )
      const updatedTasks = prev.tasks.map(t =>
        t.relatedEntityType === '1on1' && t.relatedEntityId === id && !t.completed
          ? { ...t, completed: true }
          : t
      )
      return { ...prev, meetings: updatedMeetings, tasks: updatedTasks }
    })
  }

  const date = activeMeeting ? new Date(activeMeeting.date) : null
  const dateStr = date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''
  const timeStr = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''

  return (
    <div style={{ padding: 32 }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => navigate('/1on1s')}
        style={{ marginBottom: 20 }}
      >
        ← Back to 1:1s
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        {otherUser && <Avatar user={otherUser} size={48} />}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>
            {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown'}
          </h1>
          <div style={{ color: '#6B7280', fontSize: 14, marginTop: 2 }}>
            {dateStr} at {timeStr} • {oo.frequency.charAt(0).toUpperCase() + oo.frequency.slice(1)}
          </div>
        </div>
      </div>

      {activeMeeting && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          {/* Talking points */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Talking Points</span>
              <span style={{ fontSize: 12, color: '#6B7280' }}>
                {activeMeeting.talkingPoints.filter(t => t.discussed).length}/{activeMeeting.talkingPoints.length} discussed
              </span>
            </div>
            <div>
              {activeMeeting.talkingPoints.map(tp => {
                const addedByUser = users.find(u => u.id === tp.addedBy)
                return (
                  <div key={tp.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 20px', borderBottom: '1px solid #F3F4F6' }}>
                    <input
                      type="checkbox"
                      checked={tp.discussed}
                      onChange={() => toggleTalkingPoint(tp.id)}
                      style={{ marginTop: 2, accentColor: '#6B4FBB', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: tp.discussed ? '#9CA3AF' : '#1A1A2E', textDecoration: tp.discussed ? 'line-through' : 'none' }}>
                        {tp.text}
                      </div>
                      {addedByUser && (
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                          Added by {addedByUser.firstName}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div style={{ padding: '12px 20px', display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Add a talking point..."
                  value={newTp}
                  onChange={e => setNewTp(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTalkingPoint()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary btn-sm" onClick={addTalkingPoint}>+</button>
              </div>
            </div>

            {/* Action items */}
            <div style={{ borderTop: '2px solid #F3F4F6', paddingTop: 4 }}>
              <div className="card-header" style={{ paddingTop: 12, paddingBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Action Items</span>
              </div>
              {(activeMeeting.actionItems || []).map(ai => {
                const assignee = users.find(u => u.id === ai.assigneeId)
                return (
                  <div key={ai.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 20px', borderBottom: '1px solid #F3F4F6' }}>
                    <input
                      type="checkbox"
                      checked={ai.completed}
                      onChange={() => toggleActionItem(ai.id)}
                      style={{ marginTop: 2, accentColor: '#6B4FBB', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: ai.completed ? '#9CA3AF' : '#1A1A2E', textDecoration: ai.completed ? 'line-through' : 'none' }}>
                        {ai.text}
                      </div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                        {assignee ? `${assignee.firstName}` : ''}{ai.dueDate ? ` • Due ${formatDate(ai.dueDate)}` : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div style={{ padding: '10px 20px', display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Add action item..."
                  value={newAi}
                  onChange={e => setNewAi(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addActionItem()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary btn-sm" onClick={addActionItem}>+</button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Notes</span>
              <button className="btn btn-outline btn-sm" onClick={saveNotes}>Save</button>
            </div>
            <div style={{ padding: 16 }}>
              <textarea
                className="form-textarea"
                style={{ minHeight: 240 }}
                placeholder="Take notes during your meeting..."
                value={currentNotes}
                onChange={e => setNotes(e.target.value)}
                onBlur={saveNotes}
              />
            </div>
          </div>
        </div>
      )}

      {/* Previous meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Previous meetings</h2>
          <div className="card">
            {pastMeetings.map(meeting => {
              const d = new Date(meeting.date)
              const dStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              const isExpanded = expandedPast[meeting.id]
              const discussed = meeting.talkingPoints?.filter(t => t.discussed).length || 0
              const total = meeting.talkingPoints?.length || 0
              const aiCount = meeting.actionItems?.length || 0

              return (
                <div key={meeting.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer' }}
                    onClick={() => setExpandedPast(prev => ({ ...prev, [meeting.id]: !prev[meeting.id] }))}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{dStr}</span>
                      <span style={{ fontSize: 13, color: '#6B7280', marginLeft: 12 }}>
                        {discussed} topic{discussed !== 1 ? 's' : ''} discussed • {aiCount} action item{aiCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(90deg)' : '', transition: 'transform 0.2s' }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                  {isExpanded && (
                    <div style={{ padding: '0 20px 16px', background: '#FAFAFA' }}>
                      {meeting.talkingPoints?.map(tp => (
                        <div key={tp.id} style={{ fontSize: 13, color: '#374151', padding: '4px 0', display: 'flex', gap: 8 }}>
                          <span style={{ color: tp.discussed ? '#22C55E' : '#9CA3AF' }}>
                            {tp.discussed ? '✓' : '○'}
                          </span>
                          {tp.text}
                        </div>
                      ))}
                      {meeting.notes && (
                        <div style={{ marginTop: 10, padding: 12, background: '#fff', borderRadius: 6, border: '1px solid #E5E7EB' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>NOTES</div>
                          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{meeting.notes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
