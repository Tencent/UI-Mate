import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, EyeOff, Pencil, Trash2, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/helpers';

const ALL_ENVS = ['production', 'preview', 'development'];

function EnvRow({ envVar, onEdit, onDelete }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <tr>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{envVar.key}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {revealed ? (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-secondary)' }}>{envVar.value}</span>
          ) : (
            <span className="env-value-masked">{'*'.repeat(12)}</span>
          )}
          <button
            className="btn-icon"
            onClick={() => setRevealed(r => !r)}
            title={revealed ? 'Hide' : 'Show'}
            aria-label={`${revealed ? 'Hide' : 'Show'} ${envVar.key}`}
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {envVar.target.map(t => (
            <span key={t} className={`badge badge-${t === 'production' ? 'production' : t === 'preview' ? 'preview' : 'queued'}`} style={{ fontSize: 11 }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </span>
          ))}
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn-icon" onClick={() => onEdit(envVar)} title="Edit" aria-label={`Edit ${envVar.key}`}><Pencil size={14} /></button>
          <button className="btn-icon" style={{ color: 'var(--error)' }} onClick={() => onDelete(envVar.id)} title="Delete" aria-label={`Delete ${envVar.key}`}><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

export default function SettingsEnvVars() {
  const { projectId } = useParams();
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({ key: '', value: '', target: ['production', 'preview', 'development'] });
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const envVars = state.environmentVariables.filter(e => e.projectId === projectId);

  const handleTargetToggle = (env, setter) => {
    setter(f => ({
      ...f,
      target: f.target.includes(env) ? f.target.filter(t => t !== env) : [...f.target, env]
    }));
  };

  const handleSave = () => {
    if (!form.key.trim()) return;
    dispatch({ type: 'ADD_ENV_VAR', payload: {
      id: generateId('env'), projectId, key: form.key.trim(), value: form.value,
      target: form.target, type: 'encrypted', gitBranch: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }});
    dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
      type: 'env-variable.created',
      description: `Added environment variable ${form.key.trim()}`,
      userId: state.currentUser?.id, userName: state.currentUser?.name,
      userAvatar: state.currentUser?.avatar, projectId,
      projectName: state.projects.find(p => p.id === projectId)?.name,
      metadata: { key: form.key.trim() },
    }});
    setForm({ key: '', value: '', target: ['production', 'preview', 'development'] });
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!editing) return;
    dispatch({ type: 'UPDATE_ENV_VAR', payload: { ...editing, updatedAt: new Date().toISOString() }});
    dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
      type: 'env-variable.updated',
      description: `Updated environment variable ${editing.key}`,
      userId: state.currentUser?.id, userName: state.currentUser?.name,
      userAvatar: state.currentUser?.avatar, projectId,
      projectName: state.projects.find(p => p.id === projectId)?.name,
      metadata: { key: editing.key },
    }});
    setEditing(null);
  };

  const handleDelete = (id) => {
    const ev = state.environmentVariables.find(e => e.id === id);
    dispatch({ type: 'DELETE_ENV_VAR', payload: id });
    dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
      type: 'env-variable.deleted',
      description: `Deleted environment variable ${ev?.key}`,
      userId: state.currentUser?.id, userName: state.currentUser?.name,
      userAvatar: state.currentUser?.avatar, projectId,
      projectName: state.projects.find(p => p.id === projectId)?.name,
      metadata: { key: ev?.key },
    }});
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="settings-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div className="settings-section-title">Environment Variables</div>
            <div className="settings-section-desc" style={{ marginBottom: 0 }}>
              Environment Variables are key-value pairs configured outside your source code. They are used to store API keys, database URLs, and other sensitive data.
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add
          </button>
        </div>

        {showAdd && (
          <div className="card" style={{ marginBottom: 24, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Add New Variable</div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginBottom: 4 }}>Key</div>
                <input
                  value={form.key}
                  onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
                  placeholder="VARIABLE_NAME"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                />
              </div>
              <div style={{ flex: 2 }}>
                <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginBottom: 4 }}>Value</div>
                <textarea
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  placeholder="Value (will be encrypted)"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', minHeight: 38, resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--fg-secondary)', marginBottom: 8 }}>Environments</div>
              <div style={{ display: 'flex', gap: 16 }}>
                {ALL_ENVS.map(env => (
                  <label key={env} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.target.includes(env)}
                      onChange={() => handleTargetToggle(env, setForm)}
                      style={{ width: 'auto', padding: 0, border: '1px solid var(--border-strong)', accentColor: 'var(--fg)' }}
                    />
                    {env.charAt(0).toUpperCase() + env.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        {envVars.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--fg-muted)' }}>
            No environment variables configured for this project.
          </div>
        ) : (
          <div style={{ boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Environments</th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {envVars.map(ev => (
                  editing?.id === ev.id ? (
                    <tr key={ev.id}>
                      <td><input value={editing.key} onChange={e => setEditing(ed => ({ ...ed, key: e.target.value }))} style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 13 }} /></td>
                      <td><input value={editing.value} onChange={e => setEditing(ed => ({ ...ed, value: e.target.value }))} style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 13 }} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {ALL_ENVS.map(env => (
                            <label key={env} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
                              <input type="checkbox" checked={editing.target.includes(env)} onChange={() => handleTargetToggle(env, setEditing)} style={{ width: 'auto', padding: 0, accentColor: 'var(--fg)' }} />
                              {env.charAt(0).toUpperCase() + env.slice(1)}
                            </label>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-primary btn-sm" onClick={handleUpdate}>Save</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>X</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <EnvRow key={ev.id} envVar={ev} onEdit={setEditing} onDelete={id => setDeleteTarget(id)} />
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Delete Variable</h3>
            <p className="modal-desc">Are you sure you want to delete this environment variable? Your deployments will need to be redeployed for changes to take effect.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteTarget)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
