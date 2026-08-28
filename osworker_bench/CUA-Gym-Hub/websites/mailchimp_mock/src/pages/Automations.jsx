import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Trash2, Copy, Pause, Play, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Automations() {
  const { state, updateAutomation, deleteAutomation, addAutomation, addToast } = useApp();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  let automations = [...state.automations];
  if (statusFilter !== 'all') automations = automations.filter(a => a.status === statusFilter);

  const handleToggle = (auto) => {
    const newStatus = auto.status === 'active' ? 'paused' : 'active';
    updateAutomation(auto.id, { status: newStatus });
    addToast(`Automation ${newStatus === 'active' ? 'activated' : 'paused'}`);
    setMenuOpen(null);
  };

  const handleDuplicate = (auto) => {
    addAutomation({
      ...auto,
      id: `auto_${Date.now()}`,
      name: `Copy of ${auto.name}`,
      status: 'draft',
      stats: { emailsSent: 0, opened: 0, clicked: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    addToast('Automation duplicated');
    setMenuOpen(null);
  };

  const handleDelete = (id) => {
    deleteAutomation(id);
    addToast('Automation deleted');
    setDeleteConfirm(null);
  };

  const formatRelDate = (d) => {
    if (!d) return '—';
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days < 7) return `${days}d ago`;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Automations</h1>
        <button className="btn btn-primary" onClick={() => navigate('/automations/prebuilt')}><Plus size={16} /> Create Automation</button>
      </div>

      <div className="filter-tabs">
        {['all', 'active', 'paused', 'draft'].map(s => (
          <button key={s} className={`filter-tab ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Emails Sent</th>
              <th>Open Rate</th>
              <th>Last Updated</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {automations.map(a => (
              <tr key={a.id}>
                <td><a style={{ fontWeight: 500, cursor: 'pointer', color: '#007C89' }} onClick={() => navigate(`/automations/${a.id}`)}>{a.name}</a></td>
                <td><span className={`badge badge-${a.type}`}>{a.type.replace('_', ' ')}</span></td>
                <td>
                  <span className={`badge badge-${a.status}`}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 4, background: a.status === 'active' ? '#2E7D32' : a.status === 'paused' ? '#E65100' : '#707070' }} />
                    {a.status}
                  </span>
                </td>
                <td>{a.stats?.emailsSent?.toLocaleString() || 0}</td>
                <td>{a.stats?.emailsSent > 0 ? `${((a.stats.opened / a.stats.emailsSent) * 100).toFixed(1)}%` : '—'}</td>
                <td className="text-muted text-sm">{formatRelDate(a.updatedAt)}</td>
                <td>
                  <div className="action-menu">
                    <button className="action-menu-btn" onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)}><MoreHorizontal size={16} /></button>
                    {menuOpen === a.id && (
                      <div className="action-menu-dropdown">
                        <button className="action-menu-item" onClick={() => { navigate(`/automations/${a.id}`); setMenuOpen(null); }}><Edit3 size={14} style={{ marginRight: 8 }} />Edit</button>
                        <button className="action-menu-item" onClick={() => handleToggle(a)}>
                          {a.status === 'active' ? <><Pause size={14} style={{ marginRight: 8 }} />Pause</> : <><Play size={14} style={{ marginRight: 8 }} />Resume</>}
                        </button>
                        <button className="action-menu-item" onClick={() => handleDuplicate(a)}><Copy size={14} style={{ marginRight: 8 }} />Duplicate</button>
                        <button className="action-menu-item danger" onClick={() => { setDeleteConfirm(a); setMenuOpen(null); }}><Trash2 size={14} style={{ marginRight: 8 }} />Delete</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Automation</h2></div>
            <div className="modal-body"><p>Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
