import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { MatterModal, TimeEntryModal, TaskModal } from '../components/Modals'
import { useState } from 'react'
import { format, isToday, formatDistanceToNow } from 'date-fns'
import { Plus } from 'lucide-react'

function getBadgeClass(status) {
  const map = { Open: 'badge-open', Pending: 'badge-pending', Closed: 'badge-closed', Overdue: 'badge-overdue', Draft: 'badge-draft', Sent: 'badge-sent', Paid: 'badge-paid' }
  return map[status] || 'badge-closed'
}

export default function Dashboard() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [modal, setModal] = useState(null)

  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const user = state.users.find(u => u.id === state.currentUserId)

  const todayStr = today.toISOString().split('T')[0]
  const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().split('T')[0]
  const weekStart = new Date(today); weekStart.setDate(weekStart.getDate() - today.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  // Stats
  const billableHoursThisWeek = state.activities
    .filter(a => a.type === 'TimeEntry' && a.billable && a.date >= weekStartStr && a.date <= todayStr)
    .reduce((sum, a) => sum + a.duration, 0)
  const targetHours = 18
  const outstandingBills = state.bills.filter(b => b.status !== 'Paid' && b.status !== 'Void')
  const outstandingAmount = outstandingBills.reduce((sum, b) => sum + b.balance, 0)
  const upcomingDeadlines = state.tasks.filter(t => t.status === 'Outstanding' && t.dueDate >= todayStr && t.dueDate <= weekEndStr).length
  const openMatters = state.matters.filter(m => m.status === 'Open')

  // Recent matters (sorted by updatedAt desc)
  const recentMatters = [...state.matters]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)

  // Today's tasks
  const todayTasks = state.tasks.filter(t => t.status === 'Outstanding' && t.dueDate === todayStr)
  // Today's events
  const todayEvents = state.calendarEvents.filter(e => {
    const d = e.startDate?.split('T')[0] || e.startDate
    return d === todayStr
  }).sort((a, b) => a.startDate.localeCompare(b.startDate))

  const formatTime = (dateStr) => {
    if (!dateStr || !dateStr.includes('T')) return ''
    const [, time] = dateStr.split('T')
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <div>
      {/* Welcome */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#1A1A2E', marginBottom: 4 }}>
          {greeting}, {user?.name?.split(' ')[0]}
        </div>
        <div style={{ color: '#5F6368', fontSize: 14 }}>
          {format(today, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {/* Billable Hours */}
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Billable Hours This Week
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>
            {billableHoursThisWeek.toFixed(1)} hrs
          </div>
          <div style={{ fontSize: 12, color: '#9AA0A6', marginBottom: 8 }}>vs {targetHours}.0 target</div>
          <div style={{ background: '#E0E0E0', borderRadius: 4, height: 4 }}>
            <div style={{ background: '#1A73E8', borderRadius: 4, height: 4, width: `${Math.min(100, (billableHoursThisWeek / targetHours) * 100)}%` }} />
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Outstanding Invoices
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>
            ${outstandingAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#9AA0A6' }}>
            {outstandingBills.length} invoice{outstandingBills.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Upcoming Deadlines
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>
            {upcomingDeadlines}
          </div>
          <div style={{ fontSize: 12, color: '#9AA0A6' }}>next 7 days</div>
        </div>

        {/* Open Matters */}
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Open Matters
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>
            {openMatters.length}
          </div>
          <div style={{ fontSize: 12, color: '#9AA0A6' }}>
            {[...new Set(openMatters.map(m => m.practiceArea))].slice(0, 2).join(', ')}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 16 }}>
        {/* Recent Matters */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EEEEEE' }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Recent Matters</span>
            <button className="btn-icon" style={{ color: '#1A73E8', fontSize: 13 }} onClick={() => navigate('/matters')}>View all</button>
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr className="table-header">
                <th style={{ padding: '10px 20px' }}>Matter</th>
                <th>Client</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentMatters.map(m => (
                <tr key={m.id} onClick={() => { dispatch({ type: 'UPDATE_RECENT_MATTERS', payload: m.id }); navigate(`/matters/${m.id}`) }} style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8F9FA'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '10px 20px' }}>
                    <div style={{ color: '#1A73E8', fontWeight: 500, fontSize: 13 }}>{m.matterNumber}</div>
                    <div style={{ color: '#5F6368', fontSize: 12 }}>{m.description}</div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>{m.clientName}</td>
                  <td style={{ padding: '10px 12px' }}><span className={`badge ${getBadgeClass(m.status)}`}>{m.status}</span></td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#9AA0A6' }}>
                    {formatDistanceToNow(new Date(m.updatedAt), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Today's Agenda */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEEEEE' }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Today's Agenda</span>
          </div>
          <div style={{ padding: '12px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Tasks Due Today</div>
            {todayTasks.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9AA0A6', marginBottom: 12 }}>No tasks due today</p>
            ) : (
              todayTasks.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <input type="checkbox" className="checkbox" style={{ marginTop: 2 }}
                    checked={t.status === 'Completed'}
                    onChange={() => dispatch({ type: 'TOGGLE_TASK', payload: t.id })} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: t.status === 'Completed' ? 400 : 500, textDecoration: t.status === 'Completed' ? 'line-through' : 'none' }}>{t.name}</div>
                    {t.matterDescription && <div style={{ fontSize: 11, color: '#9AA0A6' }}>{t.matterDescription}</div>}
                  </div>
                </div>
              ))
            )}
            <div className="divider" style={{ margin: '12px 0' }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Calendar Events</div>
            {todayEvents.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9AA0A6' }}>No events today</p>
            ) : (
              todayEvents.map(e => (
                <div key={e.id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 3, borderRadius: 2, background: e.color || '#1A73E8', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{e.title}</div>
                    {!e.allDay && <div style={{ fontSize: 11, color: '#5F6368' }}>{formatTime(e.startDate)} - {formatTime(e.endDate)}</div>}
                    {e.location && <div style={{ fontSize: 11, color: '#9AA0A6' }}>{e.location}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-secondary" onClick={() => setModal('timeEntry')}>
          <Plus size={14} /> New Time Entry
        </button>
        <button className="btn btn-secondary" onClick={() => setModal('matter')}>
          <Plus size={14} /> New Matter
        </button>
        <button className="btn btn-secondary" onClick={() => setModal('task')}>
          <Plus size={14} /> New Task
        </button>
      </div>

      {modal === 'timeEntry' && <TimeEntryModal onClose={() => setModal(null)} />}
      {modal === 'matter' && <MatterModal onClose={() => setModal(null)} />}
      {modal === 'task' && <TaskModal onClose={() => setModal(null)} />}
    </div>
  )
}
