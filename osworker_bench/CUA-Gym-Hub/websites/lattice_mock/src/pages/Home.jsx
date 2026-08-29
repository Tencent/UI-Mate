import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/Avatar.jsx'
import { formatDate, formatRelativeDate } from '../utils/dataManager.js'

function StatusDot({ status }) {
  const cls = {
    on_track: 'status-dot-green',
    progressing: 'status-dot-amber',
    behind: 'status-dot-red',
    completed: 'status-dot-green',
    not_started: 'status-dot-gray',
  }[status] || 'status-dot-gray'
  return <span className={`status-dot ${cls}`} />
}

function TaskRow({ task, users, navigate, onMarkComplete }) {
  const getRoute = () => {
    if (task.relatedEntityType === 'review_cycle') return `/reviews/${task.relatedEntityId}`
    if (task.relatedEntityType === 'survey') return `/engagement`
    if (task.relatedEntityType === 'goal') return `/goals/${task.relatedEntityId}`
    if (task.relatedEntityType === '1on1') return `/1on1s/${task.relatedEntityId}`
    if (task.relatedEntityType === 'feedback') return `/feedback`
    return null
  }
  const route = getRoute()
  const priorityColor = { high: '#EF4444', medium: '#F59E0B', low: '#9CA3AF' }[task.priority]

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px', borderBottom: '1px solid #F3F4F6',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB' }}
      onMouseLeave={e => { e.currentTarget.style.background = '' }}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={e => { e.stopPropagation(); onMarkComplete(task.id) }}
        style={{ accentColor: '#6B4FBB', cursor: 'pointer', flexShrink: 0, width: 16, height: 16 }}
        title="Mark complete"
      />
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor, flexShrink: 0 }} />
      <div style={{ flex: 1, cursor: route ? 'pointer' : 'default' }} onClick={() => route && navigate(route)}>
        <div style={{ fontSize: 14, color: '#1A1A2E', fontWeight: 500 }}>{task.title}</div>
        {task.dueDate && (
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            Due {formatDate(task.dueDate)}
          </div>
        )}
      </div>
      <div>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 20,
          background: task.type === 'review' ? '#EFF6FF' : task.type === 'survey' ? '#F0FDF4' : '#FFF7ED',
          color: task.type === 'review' ? '#1D4ED8' : task.type === 'survey' ? '#166534' : '#92400E',
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          {task.type}
        </span>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: route ? 'pointer' : 'default' }} onClick={() => route && navigate(route)}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  )
}

function GoalRow({ goal, navigate }) {
  const label = {
    on_track: { text: 'On track', color: '#166534', bg: '#DCFCE7' },
    progressing: { text: 'Progressing', color: '#854D0E', bg: '#FEF9C3' },
    behind: { text: 'Behind', color: '#991B1B', bg: '#FEE2E2' },
    completed: { text: 'Completed', color: '#166534', bg: '#DCFCE7' },
    not_started: { text: 'Not started', color: '#374151', bg: '#F3F4F6' },
  }[goal.status] || { text: goal.status, color: '#374151', bg: '#F3F4F6' }

  return (
    <div
      onClick={() => navigate(`/goals/${goal.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px', borderBottom: '1px solid #F3F4F6',
        cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >
      <StatusDot status={goal.status} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: '#1A1A2E', fontWeight: 500 }}>{goal.title}</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
          Last updated on {formatDate(goal.updatedAt)}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  )
}

function CelebrationTab({ celebrations, users, activeTab }) {
  const [showAll, setShowAll] = useState(false)
  const filtered = celebrations.filter(c => {
    if (activeTab === 'New hires') return c.type === 'new_hire'
    if (activeTab === 'Birthdays') return c.type === 'birthday'
    if (activeTab === 'Anniversaries') return c.type === 'anniversary'
    return false
  })

  const MAX_VISIBLE = 3
  const visible = showAll ? filtered : filtered.slice(0, MAX_VISIBLE)

  return (
    <div style={{ padding: '12px 0 0' }}>
      {filtered.length === 0 ? (
        <div style={{ color: '#6B7280', fontSize: 13, padding: '4px 0' }}>No upcoming {activeTab.toLowerCase()}</div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {visible.map(c => {
            const user = users.find(u => u.id === c.userId)
            if (!user) return null
            const colors = ['#6B4FBB', '#7C3AED', '#DB2777', '#059669', '#D97706']
            const color = colors[parseInt(c.userId.replace(/\D/g, '')) % colors.length]
            return (
              <div key={c.id} title={`${user.firstName} ${user.lastName}${c.details ? ` — ${c.details}` : ''}`}
                style={{ width: 32, height: 32, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
            )
          })}
          {!showAll && filtered.length > MAX_VISIBLE && (
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: 11, fontWeight: 600 }}>
              +{filtered.length - MAX_VISIBLE}
            </div>
          )}
        </div>
      )}
      {filtered.length > MAX_VISIBLE && (
        <button onClick={() => setShowAll(prev => !prev)} style={{ marginTop: 8, fontSize: 12, color: '#6B4FBB', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
          {showAll ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

export default function Home() {
  const { state, updateState } = useApp()
  const navigate = useNavigate()
  const [showMoreActions, setShowMoreActions] = useState(false)
  const [celebTab, setCelebTab] = useState('New hires')
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMoreActions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!state) return null

  const { currentUser, users, tasks, goals, oneOnOnes, meetings, celebrations, company } = state

  const pendingTasks = tasks.filter(t => t.assigneeId === currentUser.id && !t.completed)
  const myActiveGoals = goals.filter(g =>
    g.ownerId === currentUser.id && g.status !== 'completed'
  )

  const manager = users.find(u => u.id === currentUser.managerId)

  const myOneOnOnes = oneOnOnes.filter(o => o.participantIds.includes(currentUser.id))
  const upcomingMeetings = meetings.filter(m => m.status === 'upcoming' && myOneOnOnes.some(o => o.id === m.oneOnOneId))

  const goalsGrouped = {}
  myActiveGoals.forEach(g => {
    const label = {
      on_track: 'On track', progressing: 'Progressing', behind: 'Behind', not_started: 'Not started'
    }[g.status] || g.status
    if (!goalsGrouped[label]) goalsGrouped[label] = []
    goalsGrouped[label].push(g)
  })

  const statusOrder = ['Progressing', 'On track', 'Behind', 'Not started']
  const statusColor = { 'On track': '#166534', 'Progressing': '#854D0E', 'Behind': '#991B1B', 'Not started': '#374151' }

  const moreActionsItems = [
    { label: 'Request feedback', action: () => navigate('/feedback') },
    { label: 'Give praise', action: () => navigate('/feedback') },
    { label: 'Create a goal', action: () => navigate('/goals') },
    { label: 'Write an update', action: () => navigate('/updates') },
  ]

  const getOneOnOneOtherUser = (oo) => {
    const otherId = oo.participantIds.find(id => id !== currentUser.id)
    return users.find(u => u.id === otherId)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #E8DEF8 0%, #EDE9F6 40%, #F3EFF9 70%, #F7F6FB 100%)',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#6B4FBB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20, fontWeight: 700, flexShrink: 0,
          }}>
            {currentUser.firstName[0]}{currentUser.lastName[0]}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E' }}>
            Welcome, {currentUser.firstName}!
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-outline-dark"
            onClick={() => navigate('/feedback')}
          >
            Give or request feedback
          </button>
          <div className="dropdown-wrapper" ref={dropdownRef}>
            <button
              className="btn btn-outline-dark"
              onClick={() => setShowMoreActions(v => !v)}
            >
              More actions
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showMoreActions && (
              <div className="dropdown-menu">
                {moreActionsItems.map(item => (
                  <button key={item.label} className="dropdown-item" onClick={() => { item.action(); setShowMoreActions(false) }}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', gap: 20, padding: '24px 32px' }}>
        {/* Left column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {/* Tasks card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="card-title">Tasks</span>
                <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>Sorted by priority</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            {pendingTasks.length === 0 ? (
              <div className="empty-state" style={{ padding: '48px 24px' }}>
                <div className="empty-state-emoji">🎉</div>
                <div className="empty-state-text">You're all caught up on tasks this week!</div>
              </div>
            ) : (
              <div>
                {pendingTasks.map(task => (
                  <TaskRow key={task.id} task={task} users={users} navigate={navigate} onMarkComplete={(taskId) => {
                    updateState(prev => ({
                      ...prev,
                      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: true } : t)
                    }))
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* Active goals card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="card-title">Active goal ({myActiveGoals.length})</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/goals')}>Create goal</button>
            </div>
            {myActiveGoals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-emoji">🎯</div>
                <div className="empty-state-text">No active goals</div>
                <div className="empty-state-sub">Create a goal to track your progress</div>
              </div>
            ) : (
              <div>
                {statusOrder.map(label => {
                  const groupGoals = goalsGrouped[label]
                  if (!groupGoals) return null
                  return (
                    <div key={label}>
                      <div style={{ padding: '8px 20px 4px', fontSize: 12, fontWeight: 600, color: statusColor[label] || '#374151' }}>
                        {label}
                      </div>
                      {groupGoals.map(goal => (
                        <GoalRow key={goal.id} goal={goal} navigate={navigate} />
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
          {/* Manager card */}
          {manager && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>Manager</span>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/people')}>View org chart</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar user={manager} size={36} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{manager.firstName} {manager.lastName}</span>
              </div>
            </div>
          )}

          {/* 1:1s card */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>1:1s</span>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/1on1s')}>Add 1:1</button>
            </div>
            {upcomingMeetings.length === 0 ? (
              <div style={{ color: '#6B7280', fontSize: 13 }}>No upcoming 1:1s</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingMeetings.map(meeting => {
                  const oo = myOneOnOnes.find(o => o.id === meeting.oneOnOneId)
                  const otherUser = oo ? getOneOnOneOtherUser(oo) : null
                  const date = new Date(meeting.date)
                  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                  const tpCount = meeting.talkingPoints?.length || 0

                  return (
                    <div
                      key={meeting.id}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}
                      onClick={() => oo && navigate(`/1on1s/${oo.id}`)}
                    >
                      {otherUser && <Avatar user={otherUser} size={32} />}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown'}
                        </div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>
                          {dateStr} @ {timeStr} • {tpCount} talking point{tpCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Celebrations card */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🎉</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Celebrations</span>
            </div>
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E7EB', marginBottom: 8 }}>
              {['New hires', 'Birthdays', 'Anniversaries'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setCelebTab(tab)}
                  style={{
                    flex: 1, padding: '6px 4px', fontSize: 11, fontWeight: 500,
                    cursor: 'pointer', background: 'none', border: 'none',
                    borderBottom: celebTab === tab ? '2px solid #6B4FBB' : '2px solid transparent',
                    color: celebTab === tab ? '#6B4FBB' : '#6B7280',
                    marginBottom: -1,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <CelebrationTab
              celebrations={celebrations}
              users={users}
              activeTab={celebTab}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
