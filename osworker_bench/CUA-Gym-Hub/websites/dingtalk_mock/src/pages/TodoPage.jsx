import { useState } from 'react'
import { useApp } from '../context/AppContext'

const PRIORITY_COLORS = { high: '#FF4D4F', medium: '#FA8C16', low: '#8F959E' }
const PRIORITY_LABELS = { high: '高', medium: '中', low: '低' }

export default function TodoPage() {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('mine')
  const [showCreate, setShowCreate] = useState(false)

  const todos = state.todoItems || []
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  const getList = () => {
    if (activeTab === 'mine') return todos.filter(t => t.assigneeId === state.currentUser.id && !t.completed)
    if (activeTab === 'assigned') return todos.filter(t => t.creatorId === state.currentUser.id && t.assigneeId !== state.currentUser.id)
    return todos.filter(t => t.completed)
  }

  const getUser = (id) => state.users.find(u => u.id === id)

  const isOverdue = (t) => !t.completed && t.dueDate && t.dueDate < today

  return (
    <div style={{ padding: 20, maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>待办</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ 新建待办</button>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        {[
          { key: 'mine', label: '我的待办' },
          { key: 'assigned', label: '我分配的' },
          { key: 'done', label: '已完成' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14,
              fontFamily: 'var(--font-family)',
              color: activeTab === t.key ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: activeTab === t.key ? 600 : 400
            }}
          >{t.label}</button>
        ))}
      </div>
      {getList().map(todo => {
        const overdue = isOverdue(todo)
        const assignee = getUser(todo.assigneeId)
        return (
          <div key={todo.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px',
            background: 'white', border: '1px solid var(--border)', borderRadius: 8,
            marginBottom: 8, opacity: todo.completed ? 0.6 : 1
          }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'TOGGLE_TODO', id: todo.id })}
              style={{ width: 16, height: 16, marginTop: 2, cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, textDecoration: todo.completed ? 'line-through' : 'none', color: todo.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                {todo.title}
              </div>
              {todo.description && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{todo.description}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                {todo.dueDate && (
                  <span style={{ fontSize: 11, color: overdue ? '#FF4D4F' : 'var(--text-secondary)' }}>
                    📅 {todo.dueDate} {overdue ? '（已逾期）' : ''}
                  </span>
                )}
                <span style={{ fontSize: 11, fontWeight: 600, color: PRIORITY_COLORS[todo.priority] }}>
                  {PRIORITY_LABELS[todo.priority]}优先级
                </span>
              </div>
            </div>
            {assignee && (
              <div className="avatar-circle" style={{ width: 24, height: 24, fontSize: 11, background: assignee.avatar, flexShrink: 0 }} title={assignee.name}>
                {assignee.name.charAt(0)}
              </div>
            )}
          </div>
        )
      })}
      {getList().length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: 13 }}>暂无待办事项</div>
      )}
      {showCreate && <CreateTodoModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

function CreateTodoModal({ onClose }) {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', assigneeId: state.currentUser.id, priority: 'medium' })

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = () => {
    if (!form.title.trim()) return
    dispatch({ type: 'CREATE_TODO', todo: form })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h3>新建待办</h3>
          <button onClick={onClose} style={{ fontSize: 18, cursor: 'pointer', color: '#8F959E' }}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>标题 *</label>
            <input value={form.title} onChange={e => setF('title', e.target.value)} placeholder="待办标题" className="form-input" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>描述</label>
            <textarea value={form.description} onChange={e => setF('description', e.target.value)} placeholder="详细描述" className="form-textarea" style={{ minHeight: 60 }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>截止日期</label>
              <input type="date" value={form.dueDate} onChange={e => setF('dueDate', e.target.value)} className="form-input" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>优先级</label>
              <select value={form.priority} onChange={e => setF('priority', e.target.value)} className="form-select">
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>负责人</label>
            <select value={form.assigneeId} onChange={e => setF('assigneeId', e.target.value)} className="form-select">
              {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.title.trim()}>创建</button>
        </div>
      </div>
    </div>
  )
}
