import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Globe, Lock, Check, XCircle, Clock, BarChart2, GitBranch, Activity, Edit2, X } from 'lucide-react';

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatDuration(seconds) {
  if (!seconds) return '-';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function StateIcon({ state }) {
  switch (state) {
    case 'finished': return <Check size={12} color="var(--success-green)" />;
    case 'crashed': return <XCircle size={12} color="var(--error-red)" />;
    case 'running': return <Clock size={12} color="var(--warning-amber)" />;
    default: return null;
  }
}

export default function ProjectOverview() {
  const { entity, project } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const proj = state.projects.find(p => p.name === project && p.entity === entity);

  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!proj) return <div className="page-container"><p className="text-muted">Project not found.</p></div>;

  const projectRuns = state.runs.filter(r => r.projectId === proj.id);
  const projectSweeps = state.sweeps.filter(s => s.projectId === proj.id);
  const projectReports = state.reports.filter(r => r.projectId === proj.id);
  const projectArtifacts = state.artifacts.filter(a => a.projectId === proj.id);

  const finishedRuns = projectRuns.filter(r => r.state === 'finished');
  const runningRuns = projectRuns.filter(r => r.state === 'running');
  const crashedRuns = projectRuns.filter(r => r.state === 'crashed');

  // Compute best run (by any numeric summary metric)
  const bestRun = finishedRuns.length > 0
    ? finishedRuns.reduce((best, run) => {
        const acc = run.summary?.val_acc ?? run.summary?.accuracy ?? run.summary?.f1 ?? run.summary?.mean_reward;
        const bestAcc = best?.summary?.val_acc ?? best?.summary?.accuracy ?? best?.summary?.f1 ?? best?.summary?.mean_reward;
        if (acc === undefined) return best;
        if (bestAcc === undefined) return run;
        return acc > bestAcc ? run : best;
      }, null)
    : null;

  // Recent runs (last 5)
  const recentRuns = [...projectRuns]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Activity: recent events based on run createdAt
  const activity = [...projectRuns]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)
    .map(r => ({
      run: r,
      action: r.state === 'finished' ? 'completed run' : r.state === 'crashed' ? 'run crashed' : 'started run',
      timestamp: r.updatedAt || r.createdAt,
    }));

  const handleSaveDesc = () => {
    dispatch({
      type: 'UPDATE_PROJECT',
      payload: { id: proj.id, description: descDraft }
    });
    setEditingDesc(false);
  };

  const handleDeleteProject = () => {
    dispatch({ type: 'DELETE_PROJECT', payload: proj.id });
    navigate('/');
  };

  const statCards = [
    { label: 'Total Runs', value: projectRuns.length, icon: <Activity size={18} color="var(--accent-blue)" /> },
    { label: 'Finished', value: finishedRuns.length, icon: <Check size={18} color="var(--success-green)" /> },
    { label: 'Running', value: runningRuns.length, icon: <Clock size={18} color="var(--warning-amber)" /> },
    { label: 'Crashed', value: crashedRuns.length, icon: <XCircle size={18} color="var(--error-red)" /> },
    { label: 'Sweeps', value: projectSweeps.length, icon: <BarChart2 size={18} color="var(--accent-blue)" /> },
    { label: 'Reports', value: projectReports.length, icon: <GitBranch size={18} color="var(--accent-blue)" /> },
  ];

  return (
    <div className="page-container" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="page-title" style={{ marginBottom: 0 }}>{proj.displayName}</h1>
            {proj.visibility === 'private'
              ? <Lock size={16} color="var(--text-muted)" title="Private" />
              : <Globe size={16} color="var(--text-muted)" title="Public" />
            }
          </div>
          <div className="text-muted text-small">{proj.entity}/{proj.name} &middot; Updated {timeAgo(proj.updatedAt)}</div>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-secondary"
            style={{ fontSize: 12, padding: '5px 12px' }}
            onClick={() => navigate(`/${entity}/${project}/workspace`)}
          >
            Open Workspace
          </button>
          <button
            className="btn-danger"
            style={{ fontSize: 12, padding: '5px 12px' }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Project
          </button>
        </div>
      </div>

      {/* Delete confirm dialog */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title">Delete Project</span>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Are you sure you want to delete <strong>{proj.displayName}</strong>? This will remove the project and all {projectRuns.length} associated runs. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button className="btn-danger" onClick={handleDeleteProject}>Delete</button>
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>Description</span>
          {!editingDesc && (
            <button
              style={{ color: 'var(--text-muted)', padding: 4 }}
              title="Edit description"
              onClick={() => { setDescDraft(proj.description || ''); setEditingDesc(true); }}
            >
              <Edit2 size={13} />
            </button>
          )}
        </div>
        {editingDesc ? (
          <>
            <textarea
              className="form-input"
              rows={3}
              value={descDraft}
              onChange={e => setDescDraft(e.target.value)}
              autoFocus
              style={{ width: '100%', marginBottom: 8, resize: 'vertical' }}
            />
            <div className="flex gap-2">
              <button className="btn-blue" style={{ fontSize: 12, padding: '3px 10px' }} onClick={handleSaveDesc}>Save</button>
              <button className="btn-secondary" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => setEditingDesc(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <p style={{ color: proj.description ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 14 }}>
            {proj.description || 'No description. Click the edit icon to add one.'}
          </p>
        )}
        {proj.tags && proj.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-3">
            {proj.tags.map(tag => <span key={tag} className="tag-pill">{tag}</span>)}
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {statCards.map(sc => (
          <div key={sc.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
            {sc.icon}
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{sc.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sc.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Runs */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Recent Runs</h3>
            <button
              style={{ fontSize: 12, color: 'var(--accent-link)', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => navigate(`/${entity}/${project}/runs`)}
            >
              View all
            </button>
          </div>
          {recentRuns.length === 0 ? (
            <p className="text-muted text-small">No runs yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentRuns.map(run => (
                <div
                  key={run.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer', borderRadius: 4 }}
                  onClick={() => navigate(`/${entity}/${project}/runs/${run.id}/overview`)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: run.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.name}</span>
                  <StateIcon state={run.state} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>{formatDuration(run.duration)}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(run.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Activity</h3>
          {activity.length === 0 ? (
            <p className="text-muted text-small">No recent activity.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ marginTop: 2 }}><StateIcon state={a.run.state} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--accent-link)' }}
                      onClick={() => navigate(`/${entity}/${project}/runs/${a.run.id}/overview`)}
                    >
                      {a.run.user}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}> {a.action} </span>
                    <span
                      style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--accent-link)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: 120, verticalAlign: 'bottom' }}
                      onClick={() => navigate(`/${entity}/${project}/runs/${a.run.id}/overview`)}
                      title={a.run.name}
                    >
                      {a.run.name}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(a.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best Run */}
        {bestRun && (
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Best Run</h3>
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/${entity}/${project}/runs/${bestRun.id}/overview`)}
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: bestRun.color }} />
                <span style={{ fontWeight: 600, color: 'var(--accent-link)' }}>{bestRun.name}</span>
                <StateIcon state={bestRun.state} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(bestRun.summary || {}).slice(0, 4).map(([k, v]) => (
                  typeof v === 'number' ? (
                    <div key={k}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {Number.isInteger(v) ? v : v.toFixed(4)}
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Team Members */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Contributors</h3>
          {(() => {
            const contributors = [...new Set(projectRuns.map(r => r.user))];
            return contributors.length === 0 ? (
              <p className="text-muted text-small">No contributors yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {contributors.map(username => {
                  const user = state.users.find(u => u.username === username);
                  const userRuns = projectRuns.filter(r => r.user === username);
                  return (
                    <div key={username} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                        {user ? user.name.split(' ').map(w => w[0]).join('') : username[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.name || username}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{userRuns.length} runs</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
