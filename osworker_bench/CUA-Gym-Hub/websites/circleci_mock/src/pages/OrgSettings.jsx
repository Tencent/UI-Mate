import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const TABS = ['Overview', 'Members', 'Contexts', 'Security', 'VCS'];

function OverviewTab({ org }) {
  return (
    <div>
      <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Organization Overview</h3>
      <div style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
        {[{ label: 'Organization Name', value: org.name }, { label: 'Organization Slug', value: org.slug, mono: true }, { label: 'Plan', value: org.plan, caps: true }].map(f => (
          <div key={f.label} className="form-field">
            <label>{f.label}</label>
            <div style={{ padding: '8px 10px', background: 'var(--content-secondary-bg)', borderRadius: 6, fontSize: 13, fontFamily: f.mono ? 'var(--mono)' : undefined, textTransform: f.caps ? 'capitalize' : undefined }}>{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MembersTab({ users, dispatch, currentUserId }) {
  const [removeTarget, setRemoveTarget] = useState(null);

  const handleRemove = (user) => {
    dispatch({ type: 'REMOVE_MEMBER', payload: { userId: user.id } });
  };

  return (
    <div>
      <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Members</h3>
      <table className="data-table">
        <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th></th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#4a90e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {u.name.split(' ').map(w => w[0]).join('')}
                </div>
                {u.name}
              </td>
              <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{u.username}</td>
              <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
              <td>
                <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: u.role === 'admin' ? '#fef3c7' : 'var(--content-secondary-bg)', color: u.role === 'admin' ? '#92400e' : 'var(--text-secondary)' }}>
                  {u.role}
                </span>
              </td>
              <td>
                {u.id !== currentUserId && u.role !== 'admin' && (
                  <button
                    className="btn-ghost"
                    title="Remove member"
                    onClick={() => setRemoveTarget(u)}
                    style={{ color: 'var(--red)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {removeTarget && (
        <ConfirmDialog
          title="Remove member?"
          message={`Remove ${removeTarget.name} from the organization? This updates the local member roster for the current sandbox session.`}
          confirmLabel="Remove"
          destructive
          onCancel={() => setRemoveTarget(null)}
          onConfirm={() => { handleRemove(removeTarget); setRemoveTarget(null); }}
        />
      )}
    </div>
  );
}

function ContextsTab({ contexts, dispatch }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newCtxName, setNewCtxName] = useState('');
  const [selectedCtx, setSelectedCtx] = useState(null);
  const [showAddVar, setShowAddVar] = useState(false);
  const [varName, setVarName] = useState('');
  const [varValue, setVarValue] = useState('');
  const [deleteContextTarget, setDeleteContextTarget] = useState(null);
  const [createError, setCreateError] = useState('');
  const [varError, setVarError] = useState('');

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowCreate(false);
        setShowAddVar(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleCreate = () => {
    if (!newCtxName.trim()) {
      setCreateError('Context name is required.');
      return;
    }
    dispatch({ type: 'ADD_CONTEXT', payload: { name: newCtxName.trim() } });
    setNewCtxName(''); setCreateError(''); setShowCreate(false);
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_CONTEXT', payload: { id } });
    if (selectedCtx?.id === id) setSelectedCtx(null);
  };

  const handleAddVar = () => {
    if (!varName.trim() || !varValue.trim() || !selectedCtx) {
      setVarError('Variable name and value are required.');
      return;
    }
    dispatch({ type: 'ADD_CONTEXT_ENV_VAR', payload: { contextId: selectedCtx.id, name: varName.trim(), value: varValue.trim() } });
    setVarName(''); setVarValue(''); setVarError(''); setShowAddVar(false);
  };

  const activeCtx = contexts.find(c => c.id === selectedCtx?.id);

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ width: 280, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>Contexts</h3>
          <button className="btn" onClick={() => setShowCreate(true)}>New Context</button>
        </div>
        {contexts.map(ctx => (
          <div
            key={ctx.id}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 6, cursor: 'pointer', background: selectedCtx?.id === ctx.id ? 'var(--content-secondary-bg)' : 'var(--content-bg)' }}
            onClick={() => setSelectedCtx(ctx)}
          >
            <span style={{ fontWeight: 500, fontSize: 14 }}>{ctx.name}</span>
            <button className="btn-ghost" title="Delete context" onClick={e => { e.stopPropagation(); setDeleteContextTarget(ctx); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            </button>
          </div>
        ))}
      </div>

      {activeCtx && (
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ fontWeight: 600, fontSize: 14 }}>{activeCtx.name} — Variables</h4>
            <button className="btn" onClick={() => setShowAddVar(true)}>Add Variable</button>
          </div>
          <table className="env-table">
            <thead><tr><th>Name</th><th>Value</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {activeCtx.envVars.length === 0 ? (
                <tr><td colSpan={4} style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>No variables</td></tr>
              ) : (
                activeCtx.envVars.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{ev.name}</td>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--text-secondary)' }}>{ev.value}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{ev.createdAt.split('T')[0]}</td>
                    <td>
                      <button className="btn-ghost" onClick={() => dispatch({ type: 'DELETE_CONTEXT_ENV_VAR', payload: { contextId: activeCtx.id, envVarId: ev.id } })}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {showAddVar && (
            <div className="modal-overlay" onClick={() => setShowAddVar(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-title">Add Variable to {activeCtx.name}</div>
                <div className="form-field"><label>Name</label><input type="text" value={varName} onChange={e => { setVarName(e.target.value); setVarError(''); }} /></div>
                <div className="form-field"><label>Value</label><input type="password" value={varValue} onChange={e => { setVarValue(e.target.value); setVarError(''); }} /></div>
                {varError && <div style={{ color: 'var(--red)', fontSize: 12 }}>{varError}</div>}
                <div className="modal-actions">
                  <button className="btn" onClick={() => setShowAddVar(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleAddVar}>Add</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create Context</div>
            <div className="form-field"><label>Name</label><input type="text" placeholder="my-context" value={newCtxName} onChange={e => { setNewCtxName(e.target.value); setCreateError(''); }} /></div>
            {createError && <div style={{ color: 'var(--red)', fontSize: 12 }}>{createError}</div>}
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}
      {deleteContextTarget && (
        <ConfirmDialog
          title="Delete context?"
          message={`Delete ${deleteContextTarget.name}? Context variables in this sandbox context will be removed.`}
          confirmLabel="Delete"
          destructive
          onCancel={() => setDeleteContextTarget(null)}
          onConfirm={() => { handleDelete(deleteContextTarget.id); setDeleteContextTarget(null); }}
        />
      )}
    </div>
  );
}

export default function OrgSettings() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Organization Settings
        </h1>
      </div>
      <div className="settings-layout" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="settings-sidebar">
          {TABS.map(t => (
            <div key={t} className={`settings-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</div>
          ))}
        </div>
        <div className="settings-content">
          {activeTab === 'Overview' && <OverviewTab org={state.organization} />}
          {activeTab === 'Members' && <MembersTab users={state.users} dispatch={dispatch} currentUserId={state.currentUser?.id} />}
          {activeTab === 'Contexts' && <ContextsTab contexts={state.contexts} dispatch={dispatch} />}
          {activeTab === 'Security' && (
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Security Settings</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Two-factor authentication is enabled for all members. IP allowlist and SAML SSO are available on Scale plan.</p>
            </div>
          )}
          {activeTab === 'VCS' && (
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>VCS Connections</h3>
              {[{ name: 'GitHub', icon: '⬤', color: '#24292F' }, { name: 'GitLab', icon: '⬤', color: '#FC6D26' }, { name: 'Bitbucket', icon: '⬤', color: '#0052CC' }].map(v => (
                <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: v.color, fontSize: 20 }}>{v.icon}</span>
                  <span style={{ fontWeight: 500 }}>{v.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Connected</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
