import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/Avatar.jsx'
import { formatDate } from '../utils/dataManager.js'

function StatusDot({ status }) {
  const colors = { on_track: '#22C55E', progressing: '#F59E0B', behind: '#EF4444', completed: '#22C55E', not_started: '#9CA3AF' }
  return <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors[status] || '#9CA3AF', display: 'inline-block', flexShrink: 0 }} />
}

function ProgressBar({ value, status }) {
  const colors = { on_track: '#22C55E', progressing: '#F59E0B', behind: '#EF4444', completed: '#22C55E', not_started: '#9CA3AF' }
  return (
    <div className="progress-bar" style={{ height: 6 }}>
      <div className={`progress-fill`} style={{ width: `${Math.min(100, value)}%`, background: colors[status] || '#9CA3AF' }} />
    </div>
  )
}

function CreateGoalModal({ onClose, users, currentUser, goals, onSubmit }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('individual')
  const [status, setStatus] = useState('not_started')
  const [dueDate, setDueDate] = useState('')
  const [parentGoalId, setParentGoalId] = useState('')
  const [keyResults, setKeyResults] = useState([
    { id: 'new_kr_1', title: '', startValue: 0, currentValue: 0, targetValue: 100, unit: '' }
  ])

  const addKR = () => {
    setKeyResults(prev => [...prev, { id: `new_kr_${Date.now()}`, title: '', startValue: 0, currentValue: 0, targetValue: 100, unit: '' }])
  }

  const updateKR = (idx, field, value) => {
    setKeyResults(prev => prev.map((kr, i) => i === idx ? { ...kr, [field]: value } : kr))
  }

  const removeKR = (idx) => {
    setKeyResults(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    const goal = {
      id: `goal_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      ownerId: currentUser.id,
      status,
      progress: 0,
      dueDate: dueDate || null,
      parentGoalId: parentGoalId || null,
      category,
      keyResults: keyResults.filter(kr => kr.title.trim()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSubmit(goal)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <span className="modal-title">Create Goal</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="What do you want to achieve?" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="Describe this goal..." value={description} onChange={e => setDescription(e.target.value)} style={{ minHeight: 80 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="individual">My Goal</option>
                <option value="team">Team Goal</option>
                <option value="company">Company Goal</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="not_started">Not started</option>
                <option value="on_track">On track</option>
                <option value="progressing">Progressing</option>
                <option value="behind">Behind</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due date</label>
              <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Parent goal (optional)</label>
            <select className="form-input" value={parentGoalId} onChange={e => setParentGoalId(e.target.value)}>
              <option value="">None</option>
              {goals.filter(g => g.id !== '').map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label className="form-label" style={{ margin: 0 }}>Key Results</label>
              <button className="btn btn-outline btn-sm" onClick={addKR}>+ Add key result</button>
            </div>
            {keyResults.map((kr, idx) => (
              <div key={kr.id} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input className="form-input" placeholder="Key result title..." value={kr.title} onChange={e => updateKR(idx, 'title', e.target.value)} style={{ flex: 2 }} />
                  <input className="form-input" placeholder="Unit (e.g. %)" value={kr.unit} onChange={e => updateKR(idx, 'unit', e.target.value)} style={{ flex: 1 }} />
                  <button onClick={() => removeKR(idx)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>Start</div>
                    <input className="form-input" type="number" value={kr.startValue} onChange={e => updateKR(idx, 'startValue', Number(e.target.value))} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>Current</div>
                    <input className="form-input" type="number" value={kr.currentValue} onChange={e => updateKR(idx, 'currentValue', Number(e.target.value))} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>Target</div>
                    <input className="form-input" type="number" value={kr.targetValue} onChange={e => updateKR(idx, 'targetValue', Number(e.target.value))} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!title.trim()}>Create Goal</button>
        </div>
      </div>
    </div>
  )
}

export default function Goals() {
  const { state, updateState } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('My Goals')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (!state) return null
  const { currentUser, users, goals } = state

  const categories = ['My Goals', 'Team Goals', 'Company Goals']
  const statusOptions = ['All', 'On track', 'Progressing', 'Behind', 'Completed']

  const filtered = goals.filter(g => {
    const catMatch = filter === 'My Goals' ? g.ownerId === currentUser.id :
      filter === 'Team Goals' ? g.category === 'team' : g.category === 'company'
    const statusMatch = statusFilter === 'All' || {
      'On track': 'on_track', 'Progressing': 'progressing', 'Behind': 'behind', 'Completed': 'completed'
    }[statusFilter] === g.status
    return catMatch && statusMatch
  })

  const handleCreateGoal = (goal) => {
    updateState(prev => ({ ...prev, goals: [goal, ...prev.goals] }))
  }

  return (
    <div style={{ padding: 32 }}>
      <div className="page-header">
        <h1 className="page-title">Goals</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ Create goal</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div className="seg-control">
          {categories.map(c => (
            <button key={c} className={`seg-btn${filter === c ? ' active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
        <select
          className="form-input"
          style={{ width: 'auto' }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {statusOptions.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">🎯</div>
          <div className="empty-state-text">No goals found</div>
          <div className="empty-state-sub">Create a goal to start tracking your progress</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(goal => {
            const owner = users.find(u => u.id === goal.ownerId)
            const statusColors = { on_track: '#22C55E', progressing: '#F59E0B', behind: '#EF4444', completed: '#22C55E', not_started: '#9CA3AF' }
            const statusLabels = { on_track: 'On track', progressing: 'Progressing', behind: 'Behind', completed: 'Completed', not_started: 'Not started' }

            return (
              <div
                key={goal.id}
                className="card"
                style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
                onClick={() => navigate(`/goals/${goal.id}`)}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <StatusDot status={goal.status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E', marginBottom: 4 }}>{goal.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {owner && <Avatar user={owner} size={20} />}
                    {owner && <span style={{ fontSize: 12, color: '#6B7280' }}>{owner.firstName} {owner.lastName}</span>}
                    {goal.dueDate && <span style={{ fontSize: 12, color: '#9CA3AF' }}>• Due {formatDate(goal.dueDate)}</span>}
                  </div>
                </div>
                <div style={{ width: 120, flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#6B7280' }}>{goal.progress}%</span>
                  </div>
                  <ProgressBar value={goal.progress} status={goal.status} />
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            )
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateGoalModal
          onClose={() => setShowCreateModal(false)}
          users={users}
          currentUser={currentUser}
          goals={goals}
          onSubmit={handleCreateGoal}
        />
      )}
    </div>
  )
}
