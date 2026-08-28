import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, CheckSquare, Square, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { showToast } from '../components/Toast';

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dueDate) {
  return dueDate && new Date(dueDate) < new Date();
}

function CreateTaskModal({ onClose, onSave }) {
  const { state } = useApp();
  const [form, setForm] = useState({ title: '', type: 'review', contractId: '', assigneeId: state.currentUser?.id || 'user-1', dueDate: '' });
  const [errors, setErrors] = useState({});

  const allUsers = [state.currentUser, ...state.users].filter(Boolean);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2>Create Task</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="review">Review</option>
              <option value="approval">Approval</option>
              <option value="renewal">Renewal</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Contract</label>
            <select className="input" value={form.contractId} onChange={e => setForm({ ...form, contractId: e.target.value })}>
              <option value="">None</option>
              {state.contracts.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Assignee</label>
            <select className="input" value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}>
              {allUsers.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input type="date" className="input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Create Task</button>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { state, addTask, updateTask } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const query = sid ? `?sid=${sid}` : '';

  const [activeTab, setActiveTab] = useState('mine');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTasks = state.tasks.filter(task => {
    if (activeTab === 'mine') return task.assigneeId === state.currentUser?.id;
    if (activeTab === 'following') {
      const myContracts = state.contracts.filter(c => c.createdBy === state.currentUser?.id).map(c => c.id);
      return task.contractId && myContracts.includes(task.contractId);
    }
    return true;
  });

  const handleToggle = (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask({ id: task.id, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : null });
    showToast(newStatus === 'completed' ? 'Task completed!' : 'Task reopened', 'success');
  };

  const handleCreateTask = (form) => {
    addTask({
      title: form.title,
      type: form.type,
      status: 'pending',
      contractId: form.contractId || null,
      assigneeId: form.assigneeId,
      createdBy: state.currentUser?.id,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      description: '',
    });
    setShowCreateModal(false);
    showToast('Task created', 'success');
  };

  const allUsers = [state.currentUser, ...state.users].filter(Boolean);

  const getUserName = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  const getInitials = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return '?';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          Create Task
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
          Assigned to me
        </button>
        <button className={`tab ${activeTab === 'following' ? 'active' : ''}`} onClick={() => setActiveTab('following')}>
          Following
        </button>
        <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <CheckSquare size={48} className="empty-state-icon" />
          <h3>No tasks assigned</h3>
          <p>Tasks assigned to you will appear here</p>
        </div>
      ) : (
        <div>
          {filteredTasks.map(task => {
            const contract = task.contractId ? state.contracts.find(c => c.id === task.contractId) : null;
            const overdue = task.status !== 'completed' && isOverdue(task.dueDate);

            return (
              <div key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
                <button
                  className="btn btn-ghost btn-icon"
                  style={{ color: task.status === 'completed' ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                  onClick={() => handleToggle(task)}
                >
                  {task.status === 'completed' ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>

                <div style={{ flex: 1 }}>
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className={`badge badge-${task.type}`}>{task.type}</span>
                    {contract && (
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '0 4px', fontSize: 12, color: 'var(--color-primary)', height: 'auto' }}
                        onClick={() => navigate(`/contracts/${contract.id}${query}`)}
                      >
                        {contract.title}
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    className="avatar avatar-sm"
                    title={getUserName(task.assigneeId)}
                  >
                    {getInitials(task.assigneeId)}
                  </div>
                  {task.dueDate && (
                    <span style={{ fontSize: 12, color: overdue ? 'var(--color-danger)' : 'var(--color-text-muted)', fontWeight: overdue ? 600 : 400 }}>
                      {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} onSave={handleCreateTask} />
      )}
    </div>
  );
}
