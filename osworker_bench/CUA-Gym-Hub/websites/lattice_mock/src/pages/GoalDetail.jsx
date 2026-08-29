import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/Avatar.jsx'
import { formatDate } from '../utils/dataManager.js'

export default function GoalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, updateState } = useApp()
  const [editingKR, setEditingKR] = useState(null)
  const [krValue, setKRValue] = useState('')
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  if (!state) return null

  const { goals, users, currentUser } = state
  const goal = goals.find(g => g.id === id)

  if (!goal) {
    return (
      <div style={{ padding: 32 }}>
        <button className="btn btn-outline" onClick={() => navigate('/goals')}>← Back to Goals</button>
        <p style={{ marginTop: 20, color: '#6B7280' }}>Goal not found.</p>
      </div>
    )
  }

  const owner = users.find(u => u.id === goal.ownerId)
  const parentGoal = goal.parentGoalId ? goals.find(g => g.id === goal.parentGoalId) : null

  const statusColors = { on_track: '#22C55E', progressing: '#F59E0B', behind: '#EF4444', completed: '#22C55E', not_started: '#9CA3AF' }
  const statusBgColors = { on_track: '#DCFCE7', progressing: '#FEF9C3', behind: '#FEE2E2', completed: '#DCFCE7', not_started: '#F3F4F6' }
  const statusTextColors = { on_track: '#166534', progressing: '#854D0E', behind: '#991B1B', completed: '#166534', not_started: '#374151' }
  const statusLabels = { on_track: 'On track', progressing: 'Progressing', behind: 'Behind', completed: 'Completed', not_started: 'Not started' }

  const updateStatus = (newStatus) => {
    updateState(prev => ({
      ...prev,
      goals: prev.goals.map(g =>
        g.id === id ? { ...g, status: newStatus, updatedAt: new Date().toISOString() } : g
      )
    }))
    setShowStatusMenu(false)
  }

  const updateKRValue = (krId) => {
    const newVal = parseFloat(krValue)
    if (isNaN(newVal)) return
    updateState(prev => {
      const updatedGoals = prev.goals.map(g => {
        if (g.id !== id) return g
        const krs = g.keyResults.map(kr => kr.id === krId ? { ...kr, currentValue: newVal } : kr)
        const totalProgress = krs.reduce((sum, kr) => {
          const range = kr.targetValue - kr.startValue
          if (range === 0) return sum + 100
          return sum + Math.min(100, Math.max(0, (kr.currentValue - kr.startValue) / range * 100))
        }, 0)
        const progress = Math.round(totalProgress / krs.length)
        return { ...g, keyResults: krs, progress, updatedAt: new Date().toISOString() }
      })
      // Mark any goal-type tasks related to this goal as complete
      const updatedTasks = prev.tasks.map(t =>
        t.relatedEntityType === 'goal' && t.relatedEntityId === id && !t.completed
          ? { ...t, completed: true }
          : t
      )
      return { ...prev, goals: updatedGoals, tasks: updatedTasks }
    })
    setEditingKR(null)
    setKRValue('')
  }

  return (
    <div style={{ padding: 32 }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('/goals')} style={{ marginBottom: 20 }}>
        ← Back to Goals
      </button>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1A1A2E', flex: 1, paddingRight: 20 }}>{goal.title}</h1>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowStatusMenu(v => !v)}
              style={{
                padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: statusBgColors[goal.status] || '#F3F4F6',
                color: statusTextColors[goal.status] || '#374151',
                fontSize: 13, fontWeight: 600,
              }}
            >
              {statusLabels[goal.status] || goal.status} ▾
            </button>
            {showStatusMenu && (
              <div className="dropdown-menu">
                {Object.entries(statusLabels).map(([val, label]) => (
                  <button key={val} className="dropdown-item" onClick={() => updateStatus(val)}>{label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
        {goal.description && (
          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6 }}>{goal.description}</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Main content */}
        <div>
          {/* Progress */}
          <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Overall Progress</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: statusColors[goal.status] || '#9CA3AF' }}>{goal.progress}%</span>
            </div>
            <div className="progress-bar" style={{ height: 12 }}>
              <div style={{ width: `${goal.progress}%`, height: '100%', borderRadius: 6, background: statusColors[goal.status] || '#9CA3AF', transition: 'width 0.5s' }} />
            </div>
          </div>

          {/* Key Results */}
          {goal.keyResults.length > 0 && (
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>Key Results</span>
              </div>
              {goal.keyResults.map(kr => {
                const range = kr.targetValue - kr.startValue
                const krProgress = range === 0 ? 100 : Math.min(100, Math.max(0, (kr.currentValue - kr.startValue) / range * 100))

                return (
                  <div key={kr.id} style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, flex: 1, paddingRight: 16 }}>{kr.title}</span>
                      {editingKR === kr.id ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input
                            className="form-input"
                            style={{ width: 80 }}
                            type="number"
                            value={krValue}
                            onChange={e => setKRValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && updateKRValue(kr.id)}
                            autoFocus
                          />
                          <button className="btn btn-primary btn-sm" onClick={() => updateKRValue(kr.id)}>Save</button>
                          <button className="btn btn-outline btn-sm" onClick={() => setEditingKR(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => { setEditingKR(kr.id); setKRValue(String(kr.currentValue)) }}
                        >
                          Update
                        </button>
                      )}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div style={{ width: `${krProgress}%`, height: '100%', borderRadius: 3, background: statusColors[goal.status] || '#9CA3AF', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>
                      {kr.startValue} {kr.unit} → <strong style={{ color: '#1A1A2E' }}>{kr.currentValue} {kr.unit}</strong> → {kr.targetValue} {kr.unit}
                      <span style={{ marginLeft: 8, color: statusColors[goal.status] }}>({Math.round(krProgress)}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Owner</div>
            {owner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar user={owner} size={36} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{owner.firstName} {owner.lastName}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{owner.title}</div>
                </div>
              </div>
            )}
          </div>

          {goal.dueDate && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Due Date</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{formatDate(goal.dueDate)}</div>
            </div>
          )}

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Category</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {{ individual: 'My Goal', team: 'Team Goal', company: 'Company Goal' }[goal.category] || goal.category}
            </div>
          </div>

          {parentGoal && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Parent Goal</div>
              <div
                style={{ fontSize: 14, color: '#6B4FBB', cursor: 'pointer' }}
                onClick={() => navigate(`/goals/${parentGoal.id}`)}
              >
                {parentGoal.title}
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Last Updated</div>
            <div style={{ fontSize: 14, color: '#6B7280' }}>{formatDate(goal.updatedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
