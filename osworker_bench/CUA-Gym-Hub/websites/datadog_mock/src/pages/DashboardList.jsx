import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';

export default function DashboardList() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLayout, setNewLayout] = useState('ordered');
  const [createError, setCreateError] = useState('');

  const filtered = state.dashboards.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate() {
    if (!newTitle.trim()) {
      setCreateError('Enter a dashboard title before creating it.');
      return;
    }
    const id = 'dash-' + Date.now();
    const dashboard = {
      id,
      title: newTitle.trim(),
      description: newDesc.trim(),
      author: state.currentUser.email,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      isStarred: false,
      isReadOnly: false,
      tags: [],
      widgets: [],
      templateVariables: [],
    };
    dispatch({ type: 'ADD_DASHBOARD', payload: dashboard });
    setShowCreate(false);
    setNewTitle('');
    setNewDesc('');
    setCreateError('');
    navigate(withCurrentSearch(`/dashboards/${id}`, location.search));
  }

  function toggleStar(e, dashId) {
    e.stopPropagation();
    const dash = state.dashboards.find(d => d.id === dashId);
    if (dash) {
      dispatch({ type: 'UPDATE_DASHBOARD', payload: { id: dashId, isStarred: !dash.isStarred } });
    }
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    return 'just now';
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Dashboards</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Dashboard</button>
      </div>

      <input
        className="search-input"
        placeholder="Search dashboards..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <div className="dashboard-grid">
        {filtered.map(dash => (
          <div key={dash.id} className="dashboard-card" onClick={() => navigate(withCurrentSearch(`/dashboards/${dash.id}`, location.search))}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <button className={`star-btn${dash.isStarred ? ' starred' : ''}`} onClick={e => toggleStar(e, dash.id)}>
                {dash.isStarred ? '\u2605' : '\u2606'}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{dash.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{dash.description}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>
                {dash.author.split('@')[0].split('.').map(n => n[0].toUpperCase()).join('')}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Modified {timeAgo(dash.modified)}</span>
              <span style={{ flex: 1 }} />
              {dash.tags.map(tag => <span key={tag} className="tag tag-sm">{tag}</span>)}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          No dashboards found.
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Dashboard</h2>
            <div className="form-group">
              <label>Title</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Dashboard title" autoFocus />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What does this dashboard track?" />
            </div>
            <div className="form-group">
              <label>Layout</label>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 400 }}>
                  <input type="radio" name="layout" checked={newLayout === 'ordered'} onChange={() => setNewLayout('ordered')} />
                  Ordered Grid
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 400 }}>
                  <input type="radio" name="layout" checked={newLayout === 'freeform'} onChange={() => setNewLayout('freeform')} />
                  Free-form
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              {createError && <span style={{ color: 'var(--color-alert)', fontSize: 12, marginRight: 'auto' }}>{createError}</span>}
              <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
