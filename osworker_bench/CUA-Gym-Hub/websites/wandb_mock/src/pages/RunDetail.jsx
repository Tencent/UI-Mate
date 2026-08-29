import { useState } from 'react';
import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Pencil } from 'lucide-react';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function RunDetail() {
  const { entity, project, runId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const run = state.runs.find(r => r.id === runId);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  if (!run) {
    return <div className="page-container"><p className="text-muted">Run not found.</p></div>;
  }

  const basePath = `/${entity}/${project}/runs/${runId}`;
  const tabs = [
    { label: 'Overview', path: `${basePath}/overview` },
    { label: 'Charts', path: `${basePath}/charts` },
    { label: 'System', path: `${basePath}/system` },
    { label: 'Logs', path: `${basePath}/logs` },
    { label: 'Files', path: `${basePath}/files` },
  ];

  const startEditing = () => {
    setNameValue(run.name);
    setEditingName(true);
  };

  const saveName = () => {
    if (nameValue.trim() && nameValue !== run.name) {
      dispatch({ type: 'UPDATE_RUN_NAME', payload: { runId: run.id, name: nameValue.trim() } });
    }
    setEditingName(false);
  };

  return (
    <div className="page-container">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(`/${entity}/${project}/runs`)} style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={18} />
        </button>
        <span className="text-muted text-small">{project}</span>
        <span className="text-muted text-small">/</span>
        {editingName ? (
          <input
            className="form-input"
            style={{ fontSize: 20, fontWeight: 700, padding: '2px 8px', width: 300 }}
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
            autoFocus
          />
        ) : (
          <span style={{ fontSize: 20, fontWeight: 700, cursor: 'pointer' }} onClick={startEditing}>
            {run.name}
            <Pencil size={14} style={{ marginLeft: 6, color: 'var(--text-muted)', verticalAlign: 'middle' }} />
          </span>
        )}
        <span className={`state-badge ${run.state}`} style={{ marginLeft: 8 }}>{run.state}</span>
        <span className="text-muted text-small" style={{ marginLeft: 12 }}>{formatDuration(run.duration)}</span>
        <span className="text-muted text-small">{new Date(run.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="tab-bar">
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
