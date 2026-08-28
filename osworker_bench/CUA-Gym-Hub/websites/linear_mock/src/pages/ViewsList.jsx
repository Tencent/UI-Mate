import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Plus, X, Star } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { PriorityIcon, StatusIcon, PRIORITY_LABELS } from '../components/Icons.jsx';
import './TeamIssues.css';

export default function ViewsList() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  const toPath = p => sid ? `${p}?sid=${sid}` : p;

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [newGroupBy, setNewGroupBy] = useState('status');
  const [newLayout, setNewLayout] = useState('list');
  const [filterPriority, setFilterPriority] = useState([]);
  const [filterLabels, setFilterLabels] = useState([]);

  function createView() {
    if (!newName.trim()) return;
    const filters = {};
    if (filterPriority.length > 0) filters.priority = filterPriority;
    if (filterLabels.length > 0) filters.labelIds = filterLabels;

    dispatch({
      type: 'CREATE_VIEW',
      view: {
        id: `v${Date.now()}`,
        name: newName.trim(),
        icon: newIcon || null,
        filters,
        groupBy: newGroupBy,
        sortBy: 'priority',
        layout: newLayout,
        teamId: null,
        creatorId: state.currentUserId,
      },
    });
    setNewName('');
    setNewIcon('');
    setFilterPriority([]);
    setFilterLabels([]);
    setShowCreate(false);
  }

  function deleteView(viewId) {
    dispatch({ type: 'DELETE_VIEW', viewId });
  }

  function toggleFavorite(viewId) {
    dispatch({ type: 'TOGGLE_FAVORITE', targetId: viewId, favType: 'view' });
  }

  const views = state.views || [];
  const favorites = state.favorites?.filter(f => f.userId === state.currentUserId) || [];

  return (
    <div className="team-issues-page">
      <div className="page-header">
        <div className="page-header-left">
          <Eye size={16} style={{ color: 'var(--text-muted)' }} />
          <h2 className="page-title">Views</h2>
          <span className="issue-count">{views.length}</span>
        </div>
        <div className="page-header-right">
          <button className="btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={12} style={{ marginRight: 4 }} /> New view
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="views-create-form">
          <div className="views-create-header">
            <span className="views-create-title">Create custom view</span>
            <button className="views-create-close" onClick={() => setShowCreate(false)}><X size={14} /></button>
          </div>
          <div className="views-create-body">
            <div className="views-create-field">
              <label className="views-create-label">Name</label>
              <input
                className="views-create-input"
                placeholder="View name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createView(); }}
                autoFocus
              />
            </div>
            <div className="views-create-field">
              <label className="views-create-label">Icon (emoji)</label>
              <input
                className="views-create-input"
                placeholder="e.g. 🐛"
                value={newIcon}
                onChange={e => setNewIcon(e.target.value)}
                style={{ maxWidth: 80 }}
              />
            </div>
            <div className="views-create-row">
              <div className="views-create-field">
                <label className="views-create-label">Group by</label>
                <select className="create-prop-select" value={newGroupBy} onChange={e => setNewGroupBy(e.target.value)}>
                  <option value="none">None</option>
                  <option value="status">Status</option>
                  <option value="priority">Priority</option>
                  <option value="assignee">Assignee</option>
                  <option value="project">Project</option>
                </select>
              </div>
              <div className="views-create-field">
                <label className="views-create-label">Layout</label>
                <select className="create-prop-select" value={newLayout} onChange={e => setNewLayout(e.target.value)}>
                  <option value="list">List</option>
                  <option value="board">Board</option>
                </select>
              </div>
            </div>
            <div className="views-create-field">
              <label className="views-create-label">Filter by priority</label>
              <div className="views-filter-chips">
                {[1, 2, 3, 4, 0].map(p => (
                  <button
                    key={p}
                    className={`views-filter-chip ${filterPriority.includes(p) ? 'selected' : ''}`}
                    onClick={() => setFilterPriority(
                      filterPriority.includes(p) ? filterPriority.filter(x => x !== p) : [...filterPriority, p]
                    )}
                  >
                    <PriorityIcon priority={p} size={12} />
                    <span>{PRIORITY_LABELS[p]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="views-create-field">
              <label className="views-create-label">Filter by labels</label>
              <div className="views-filter-chips">
                {(state.labels || []).map(l => (
                  <button
                    key={l.id}
                    className={`views-filter-chip ${filterLabels.includes(l.id) ? 'selected' : ''}`}
                    onClick={() => setFilterLabels(
                      filterLabels.includes(l.id) ? filterLabels.filter(x => x !== l.id) : [...filterLabels, l.id]
                    )}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="views-create-footer">
            <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn-primary" onClick={createView} disabled={!newName.trim()}>Create view</button>
          </div>
        </div>
      )}

      <div className="team-issues-content" style={{ padding: 24 }}>
        {views.length === 0 && !showCreate && (
          <div className="views-empty">
            <Eye size={36} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
            <p>No custom views yet</p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>Create a view to save your favorite filters</p>
          </div>
        )}
        {views.map(v => {
          const isFav = favorites.some(f => f.targetId === v.id);
          // Count matching issues
          let issues = state.issues || [];
          const f = v.filters || {};
          if (f.priority?.length) issues = issues.filter(i => f.priority.includes(i.priority));
          if (f.labelIds?.length) issues = issues.filter(i => f.labelIds.some(lid => i.labelIds?.includes(lid)));
          if (f.assigneeId) issues = issues.filter(i => i.assigneeId === f.assigneeId);

          return (
            <div
              key={v.id}
              className="view-card"
              onClick={() => navigate(toPath(`/views/${v.id}`))}
            >
              <div className="view-card-header">
                <span className="view-card-icon">{v.icon || '👁'}</span>
                <span className="view-card-name">{v.name}</span>
                <span className="view-card-count">{issues.length} issues</span>
                <button
                  className={`view-fav-btn ${isFav ? 'active' : ''}`}
                  onClick={e => { e.stopPropagation(); toggleFavorite(v.id); }}
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star size={12} />
                </button>
                <button
                  className="view-delete-btn"
                  onClick={e => { e.stopPropagation(); deleteView(v.id); }}
                  title="Delete view"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="view-card-meta">
                {v.layout} view{v.groupBy && v.groupBy !== 'none' ? `, grouped by ${v.groupBy}` : ''}
                {v.filters?.priority?.length > 0 && ` | Priority: ${v.filters.priority.map(p => PRIORITY_LABELS[p]).join(', ')}`}
                {v.filters?.labelIds?.length > 0 && ` | ${v.filters.labelIds.length} label${v.filters.labelIds.length > 1 ? 's' : ''}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
