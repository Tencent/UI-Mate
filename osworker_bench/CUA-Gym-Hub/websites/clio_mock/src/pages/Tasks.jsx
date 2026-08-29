import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { TaskModal } from '../components/Modals'

export default function Tasks() {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Outstanding')
  const [modal, setModal] = useState(null)
  const [assigneeFilter, setAssigneeFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [matterFilter, setMatterFilter] = useState('All')
  const [dueDateFilter, setDueDateFilter] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const today = new Date().toISOString().split('T')[0]

  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r.toISOString().split('T')[0] }
  const weekEnd = addDays(today, 7)
  const monthEnd = addDays(today, 30)

  const counts = {
    Outstanding: state.tasks.filter(t => t.status === 'Outstanding').length,
    Completed: state.tasks.filter(t => t.status === 'Completed').length,
  }

  const filtered = state.tasks
    .filter(t => t.status === tab)
    .filter(t => assigneeFilter === 'All' || t.assigneeId === assigneeFilter)
    .filter(t => priorityFilter === 'All' || t.priority === priorityFilter)
    .filter(t => matterFilter === 'All' || t.matterId === matterFilter)
    .filter(t => {
      if (dueDateFilter === 'All') return true
      if (dueDateFilter === 'Overdue') return t.dueDate && t.dueDate < today
      if (dueDateFilter === 'Due Today') return t.dueDate === today
      if (dueDateFilter === 'Due This Week') return t.dueDate && t.dueDate >= today && t.dueDate <= weekEnd
      if (dueDateFilter === 'Due This Month') return t.dueDate && t.dueDate >= today && t.dueDate <= monthEnd
      return true
    })
    .sort((a, b) => {
      if (tab === 'Outstanding') {
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
        if (a.dueDate) return -1
        if (b.dueDate) return 1
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })

  const priorityOrder = { High: 0, Normal: 1, Low: 2 }
  const getBadgeClass = (p) => ({ High: 'badge-high', Normal: 'badge-normal', Low: 'badge-low' }[p] || 'badge-normal')
  const isOverdue = (t) => t.dueDate && t.dueDate < today && t.status === 'Outstanding'

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={14} /> New Task</button>
      </div>

      <div className="tabs" style={{ marginBottom: 16, borderRadius: '8px 8px 0 0' }}>
        {['Outstanding', 'Completed'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 12 }}>
        <select className="select-field" style={{ height: 34, width: 140 }} value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
          <option value="All">All Assignees</option>
          {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select className="select-field" style={{ height: 34, width: 130 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="All">All Priorities</option>
          <option>High</option><option>Normal</option><option>Low</option>
        </select>
        <select className="select-field" style={{ height: 34, width: 180 }} value={matterFilter} onChange={e => setMatterFilter(e.target.value)}>
          <option value="All">All Matters</option>
          {state.matters.map(m => <option key={m.id} value={m.id}>{m.matterNumber}</option>)}
        </select>
        <select className="select-field" style={{ height: 34, width: 160 }} value={dueDateFilter} onChange={e => setDueDateFilter(e.target.value)}>
          <option value="All">All Due Dates</option>
          <option>Overdue</option><option>Due Today</option><option>Due This Week</option><option>Due This Month</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No tasks found</p><p>Try adjusting your filters</p></div>
        ) : (
          filtered.map(task => (
            <div key={task.id} style={{ borderBottom: '1px solid #EEEEEE' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', minHeight: 44,
                cursor: 'pointer'
              }}>
                <input type="checkbox" className="checkbox"
                  checked={task.status === 'Completed'}
                  onChange={() => { dispatch({ type: 'TOGGLE_TASK', payload: task.id }); if (task.status === 'Outstanding') addToast('Task completed') }}
                  onClick={e => e.stopPropagation()} />
                <div style={{ flex: 1 }} onClick={() => setExpanded(expanded === task.id ? null : task.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 14, fontWeight: 500,
                      textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                      color: task.status === 'Completed' ? '#9AA0A6' : '#1A1A2E'
                    }}>
                      {task.name}
                    </span>
                    <span className={`badge ${getBadgeClass(task.priority)}`} style={{ fontSize: 10 }}>{task.priority}</span>
                  </div>
                  {task.matterDescription && (
                    <div style={{ fontSize: 12, color: '#9AA0A6', marginTop: 2 }}>
                      <span className="text-link" style={{ fontSize: 12 }} onClick={e => { e.stopPropagation(); if (task.matterId) navigate(`/matters/${task.matterId}`) }}>
                        {task.matterDescription}
                      </span>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#9AA0A6' }}>{task.assigneeName}</span>
                {task.dueDate && (
                  <span style={{ fontSize: 12, color: isOverdue(task) ? '#EA4335' : '#5F6368', fontWeight: isOverdue(task) ? 600 : 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isOverdue(task) && '⚠ '}{task.dueDate}
                  </span>
                )}
              </div>
              {expanded === task.id && (
                <div style={{ padding: '0 16px 12px 48px', background: '#FAFBFC' }}>
                  {task.description && <p style={{ fontSize: 13, color: '#5F6368', marginBottom: 8 }}>{task.description}</p>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type: 'edit', task })}>Edit</button>
                    <button className="btn-icon btn-sm" style={{ color: '#EA4335' }} onClick={() => { dispatch({ type: 'DELETE_TASK', payload: task.id }); addToast('Task deleted') }}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {modal === 'new' && <TaskModal onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && <TaskModal task={modal.task} onClose={() => setModal(null)} />}
    </div>
  )
}
