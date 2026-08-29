import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { formatDate } from '../utils/dataManager.js'

export default function Tasks() {
  const { state, updateState } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('pending')

  if (!state) return null
  const { currentUser, tasks } = state

  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id)
  const filteredTasks = myTasks.filter(t => {
    if (filter === 'pending') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const getRoute = (task) => {
    if (task.relatedEntityType === 'review_cycle') return `/reviews/${task.relatedEntityId}`
    if (task.relatedEntityType === 'survey') return `/engagement`
    if (task.relatedEntityType === 'goal') return `/goals/${task.relatedEntityId}`
    if (task.relatedEntityType === '1on1') return `/1on1s/${task.relatedEntityId}`
    if (task.relatedEntityType === 'feedback') return `/feedback`
    return null
  }

  const handleMarkComplete = (taskId) => {
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: true } : t),
    }))
  }

  const handleMarkIncomplete = (taskId) => {
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: false } : t),
    }))
  }

  const priorityColor = { high: '#EF4444', medium: '#F59E0B', low: '#9CA3AF' }
  const pendingCount = myTasks.filter(t => !t.completed).length
  const completedCount = myTasks.filter(t => t.completed).length

  return (
    <div style={{ padding: 32 }}>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <div style={{ display: 'flex', gap: 8, fontSize: 13, color: '#6B7280' }}>
          <span>{pendingCount} pending</span>
          <span>·</span>
          <span>{completedCount} completed</span>
        </div>
      </div>

      <div className="tab-nav" style={{ marginBottom: 24 }}>
        {[
          { key: 'pending', label: 'Pending' },
          { key: 'completed', label: 'Completed' },
          { key: 'all', label: 'All' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab-btn${filter === tab.key ? ' active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {filteredTasks.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <div className="empty-state-emoji">{filter === 'completed' ? '✅' : '🎉'}</div>
            <div className="empty-state-text">
              {filter === 'pending' ? "You're all caught up!" : filter === 'completed' ? 'No completed tasks yet' : 'No tasks assigned'}
            </div>
          </div>
        ) : (
          filteredTasks.map(task => {
            const route = getRoute(task)
            return (
              <div
                key={task.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 20px', borderBottom: '1px solid #F3F4F6',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB' }}
                onMouseLeave={e => { e.currentTarget.style.background = '' }}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => task.completed ? handleMarkIncomplete(task.id) : handleMarkComplete(task.id)}
                  style={{ accentColor: '#6B4FBB', cursor: 'pointer', flexShrink: 0, width: 16, height: 16 }}
                  title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                />
                <div
                  style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor[task.priority] || '#9CA3AF', flexShrink: 0 }}
                  title={`Priority: ${task.priority}`}
                />
                <div style={{ flex: 1, cursor: route ? 'pointer' : 'default' }} onClick={() => route && navigate(route)}>
                  <div style={{
                    fontSize: 14, fontWeight: 500,
                    color: task.completed ? '#9CA3AF' : '#1A1A2E',
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}>
                    {task.title}
                  </div>
                  {task.dueDate && (
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      Due {formatDate(task.dueDate)}
                    </div>
                  )}
                </div>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 20,
                  background: task.type === 'review' ? '#EFF6FF' : task.type === 'survey' ? '#F0FDF4' : '#FFF7ED',
                  color: task.type === 'review' ? '#1D4ED8' : task.type === 'survey' ? '#166534' : '#92400E',
                  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  {task.type}
                </span>
                {route && (
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => navigate(route)}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
