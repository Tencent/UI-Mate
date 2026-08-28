import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { withCurrentSearch } from '../utils/navigation.js';

function OverviewTab({ project, dispatch }) {
  const [stopConfirm, setStopConfirm] = useState(false);
  const [stopFeedback, setStopFeedback] = useState('');
  const [repoOpen, setRepoOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setRepoOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleStopBuilding = () => {
    dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: { projectId: project.id, settings: { isBuilding: false } } });
    setStopFeedback('Building stopped. No new pipelines will be triggered.');
    setTimeout(() => setStopFeedback(''), 4000);
  };

  const isBuilding = project.settings?.isBuilding !== false;

  return (
    <div>
      <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Overview</h3>
      <div style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
        <div className="form-field">
          <label>Project Name</label>
          <div style={{ padding: '8px 10px', background: 'var(--content-secondary-bg)', borderRadius: 6, fontSize: 13 }}>{project.name}</div>
        </div>
        <div className="form-field">
          <label>Project Slug</label>
          <div style={{ padding: '8px 10px', background: 'var(--content-secondary-bg)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--mono)' }}>{project.slug}</div>
        </div>
        <div className="form-field">
          <label>VCS URL</label>
          <div style={{ padding: '8px 10px', background: 'var(--content-secondary-bg)', borderRadius: 6, fontSize: 13 }}>
            <button className="btn-ghost" style={{ padding: 0, color: 'var(--link)' }} onClick={() => setRepoOpen(true)}>{project.vcsUrl}</button>
          </div>
        </div>
        <div className="form-field">
          <label>Default Branch</label>
          <div style={{ padding: '8px 10px', background: 'var(--content-secondary-bg)', borderRadius: 6, fontSize: 13 }}>{project.defaultBranch}</div>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        {isBuilding ? (
          <button className="btn btn-danger" onClick={() => setStopConfirm(true)}>Stop Building</button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => {
              dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: { projectId: project.id, settings: { isBuilding: true } } });
              setStopFeedback('Building re-enabled. New pipelines will be triggered normally.');
              setTimeout(() => setStopFeedback(''), 4000);
            }}
          >
            Resume Building
          </button>
        )}
        {stopFeedback && (
          <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--content-secondary-bg)', borderRadius: 6, fontSize: 13, color: 'var(--green)', border: '1px solid var(--green)' }}>
            {stopFeedback}
          </div>
        )}
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
          {isBuilding ? 'This will stop XircleCI from building this project.' : 'Building is currently stopped for this project.'}
        </p>
      </div>
      {stopConfirm && (
        <ConfirmDialog
          title="Stop project builds?"
          message={`Stop building "${project.name}"? This disables future pipelines until you resume building from this page.`}
          confirmLabel="Stop Building"
          destructive
          onCancel={() => setStopConfirm(false)}
          onConfirm={() => { setStopConfirm(false); handleStopBuilding(); }}
        />
      )}
      {repoOpen && (
        <div className="modal-overlay" role="presentation" onClick={() => setRepoOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="repo-details-title" onClick={e => e.stopPropagation()}>
            <div id="repo-details-title" className="modal-title">Repository connection</div>
            <div className="notice-card">
              <div><strong>Provider:</strong> {project.vcsProvider}</div>
              <div><strong>Repository:</strong> {project.vcsUrl}</div>
              <div><strong>Default branch:</strong> {project.defaultBranch}</div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 12 }}>
              This local sandbox keeps VCS actions inside XircleCI instead of opening an external repository.
            </p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setRepoOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EnvVarsTab({ project, envVars, dispatch }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleAdd = () => {
    if (!name.trim() || !value.trim()) {
      setFormError('Name and value are required.');
      return;
    }
    dispatch({ type: 'ADD_ENV_VAR', payload: { projectId: project.id, name: name.trim(), value: value.trim() } });
    setName(''); setValue(''); setFormError(''); setShowModal(false);
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_ENV_VAR', payload: { id } });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontWeight: 600, fontSize: 16 }}>Environment Variables</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Variable
        </button>
      </div>

      <table className="env-table">
        <thead><tr><th>Name</th><th>Value</th><th>Created</th><th></th></tr></thead>
        <tbody>
          {envVars.length === 0 ? (
            <tr><td colSpan={4} style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>No environment variables</td></tr>
          ) : (
            envVars.map(ev => (
              <tr key={ev.id}>
                <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{ev.name}</td>
                <td style={{ fontFamily: 'var(--mono)', color: 'var(--text-secondary)' }}>{ev.value}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{ev.createdAt.split('T')[0]}</td>
                <td>
                  <button className="btn-ghost" onClick={() => setDeleteTarget(ev)} title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Environment Variable</div>
            <div className="form-field">
              <label>Name</label>
              <input type="text" placeholder="MY_VAR_NAME" value={name} onChange={e => { setName(e.target.value); setFormError(''); }} />
            </div>
            <div className="form-field">
              <label>Value</label>
              <input type="password" placeholder="Value" value={value} onChange={e => { setValue(e.target.value); setFormError(''); }} />
            </div>
            {formError && <div style={{ color: 'var(--red)', fontSize: 12 }}>{formError}</div>}
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Variable</button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete environment variable?"
          message={`Delete ${deleteTarget.name}? The masked value will be removed from this project.`}
          confirmLabel="Delete"
          destructive
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { handleDelete(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}

function SSHKeysTab({ project, sshKeys, dispatch }) {
  const deployKeys = sshKeys.filter(k => k.type === 'deploy-key' && k.projectId === project.id);
  const additionalKeys = sshKeys.filter(k => k.type === 'additional' && k.projectId === project.id);
  const [showModal, setShowModal] = useState(false);
  const [hostname, setHostname] = useState('');
  const [fingerprint, setFingerprint] = useState('');
  const [keyType, setKeyType] = useState('additional');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleAdd = () => {
    if (!hostname.trim()) {
      setFormError('Hostname is required.');
      return;
    }
    dispatch({ type: 'ADD_SSH_KEY', payload: { projectId: project.id, type: keyType, fingerprint: fingerprint || `SHA256:${Math.random().toString(36).slice(2)}`, hostname } });
    setHostname(''); setFingerprint(''); setFormError(''); setShowModal(false);
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_SSH_KEY', payload: { id } });
  };

  const KeyTable = ({ keys, title }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h4 style={{ fontWeight: 600, fontSize: 14 }}>{title}</h4>
        {title === 'Additional SSH Keys' && (
          <button className="btn" onClick={() => setShowModal(true)}>Add SSH Key</button>
        )}
      </div>
      <table className="env-table">
        <thead><tr><th>Fingerprint</th><th>Hostname</th><th>Added</th><th></th></tr></thead>
        <tbody>
          {keys.length === 0 ? (
            <tr><td colSpan={4} style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>No keys configured</td></tr>
          ) : (
            keys.map(k => (
              <tr key={k.id}>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{k.fingerprint}</td>
                <td>{k.hostname}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{k.createdAt.split('T')[0]}</td>
                <td>
                  <button className="btn-ghost" onClick={() => setDeleteTarget(k)} title="Delete SSH key">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>SSH Keys</h3>
      <KeyTable keys={deployKeys} title="Deploy Keys" />
      <KeyTable keys={additionalKeys} title="Additional SSH Keys" />
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add SSH Key</div>
            <div className="form-field">
              <label>Hostname</label>
              <input type="text" placeholder="github.com" value={hostname} onChange={e => { setHostname(e.target.value); setFormError(''); }} />
            </div>
            <div className="form-field">
              <label>Private Key (fingerprint)</label>
              <input type="text" placeholder="SHA256:..." value={fingerprint} onChange={e => setFingerprint(e.target.value)} />
            </div>
            {formError && <div style={{ color: 'var(--red)', fontSize: 12 }}>{formError}</div>}
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Key</button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete SSH key?"
          message={`Delete the SSH key for ${deleteTarget.hostname}? This local sandbox will remove the key from the project.`}
          confirmLabel="Delete"
          destructive
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { handleDelete(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}

function WebhooksTab({ project, webhooks, dispatch }) {
  const [showModal, setShowModal] = useState(false);
  const [wName, setWName] = useState('');
  const [wUrl, setWUrl] = useState('');
  const [wEvents, setWEvents] = useState('workflow-completed');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const projWebhooks = webhooks.filter(w => w.projectId === project.id);

  const handleAdd = () => {
    if (!wName.trim() || !wUrl.trim()) {
      setFormError('Webhook name and URL are required.');
      return;
    }
    dispatch({ type: 'ADD_WEBHOOK', payload: { projectId: project.id, name: wName.trim(), url: wUrl.trim(), events: [wEvents] } });
    setWName(''); setWUrl(''); setFormError(''); setShowModal(false);
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_WEBHOOK', payload: { id } });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontWeight: 600, fontSize: 16 }}>Webhooks</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Webhook</button>
      </div>
      <table className="env-table">
        <thead><tr><th>Name</th><th>URL</th><th>Events</th><th></th></tr></thead>
        <tbody>
          {projWebhooks.length === 0 ? (
            <tr><td colSpan={4} style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>No webhooks configured</td></tr>
          ) : (
            projWebhooks.map(wh => (
              <tr key={wh.id}>
                <td style={{ fontWeight: 500 }}>{wh.name}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 11, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wh.url}</td>
                <td style={{ fontSize: 12 }}>{(wh.events || []).join(', ')}</td>
                <td>
                  <button className="btn-ghost" onClick={() => setDeleteTarget(wh)} title="Delete webhook">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Webhook</div>
            <div className="form-field">
              <label>Name</label>
              <input type="text" placeholder="My Webhook" value={wName} onChange={e => { setWName(e.target.value); setFormError(''); }} />
            </div>
            <div className="form-field">
              <label>URL</label>
              <input type="text" placeholder="https://..." value={wUrl} onChange={e => { setWUrl(e.target.value); setFormError(''); }} />
            </div>
            <div className="form-field">
              <label>Event</label>
              <select value={wEvents} onChange={e => setWEvents(e.target.value)}>
                <option value="workflow-completed">workflow-completed</option>
                <option value="job-completed">job-completed</option>
              </select>
            </div>
            {formError && <div style={{ color: 'var(--red)', fontSize: 12 }}>{formError}</div>}
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Webhook</button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete webhook?"
          message={`Delete ${deleteTarget.name}? Workflow events will no longer be sent to this local webhook entry.`}
          confirmLabel="Delete"
          destructive
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { handleDelete(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}

function AdvancedTab({ project, dispatch }) {
  const settings = project.settings || {};
  const toggle = (key) => {
    dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: { projectId: project.id, settings: { [key]: !settings[key] } } });
  };
  const rows = [
    { key: 'buildForkPRs', label: 'Build forked pull requests', desc: 'Run builds for pull requests from forked repositories' },
    { key: 'passSecretsToForks', label: 'Pass secrets to builds from forked PRs', desc: 'Make secrets available to builds from forked PRs' },
    { key: 'onlyBuildPRs', label: 'Only build pull requests', desc: 'Only run pipelines when a pull request is open' },
    { key: 'autoCancelRedundant', label: 'Auto-cancel redundant workflows', desc: 'Automatically cancel queued or running workflows when a newer pipeline runs' }
  ];
  return (
    <div>
      <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Advanced Settings</h3>
      {rows.map(row => (
        <div key={row.key} className="toggle-row">
          <div>
            <div className="toggle-label">{row.label}</div>
            <div className="toggle-desc">{row.desc}</div>
          </div>
          <button
            type="button"
            className={`toggle-switch${settings[row.key] ? ' checked' : ''}`}
            role="switch"
            aria-checked={!!settings[row.key]}
            aria-label={row.label}
            onClick={() => toggle(row.key)}
          >
            <span className="toggle-switch-thumb" />
          </button>
        </div>
      ))}
    </div>
  );
}

const TABS = ['Overview', 'Environment Variables', 'SSH Keys', 'Webhooks', 'Advanced'];

export default function ProjectSettings() {
  const { projectSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('Overview');
  const toPath = (path) => withCurrentSearch(path, location.search);

  const project = state.projects.find(p => p.slug === projectSlug);
  const envVars = state.environmentVariables.filter(e => e.projectId === project?.id);
  const sshKeys = state.sshKeys.filter(k => k.projectId === project?.id);
  const webhooks = state.webhooks.filter(w => w.projectId === project?.id);

  if (!project) return <div className="empty-state" style={{ marginTop: 48 }}><div className="empty-state-title">Project not found</div></div>;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="text-link" onClick={() => navigate(toPath('/projects'))}>Projects</span>
        <span className="breadcrumb-sep">›</span>
        <span className="text-link">{project.name}</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Settings</span>
      </div>

      <div className="page-header">
        <h1 className="page-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          {project.name} — Settings
        </h1>
      </div>

      <div className="settings-layout" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div className="settings-sidebar">
          {TABS.map(tab => (
            <div
              key={tab}
              className={`settings-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        <div className="settings-content">
          {activeTab === 'Overview' && <OverviewTab project={project} dispatch={dispatch} />}
          {activeTab === 'Environment Variables' && <EnvVarsTab project={project} envVars={envVars} dispatch={dispatch} />}
          {activeTab === 'SSH Keys' && <SSHKeysTab project={project} sshKeys={sshKeys} dispatch={dispatch} />}
          {activeTab === 'Webhooks' && <WebhooksTab project={project} webhooks={webhooks} dispatch={dispatch} />}
          {activeTab === 'Advanced' && <AdvancedTab project={project} dispatch={dispatch} />}
        </div>
      </div>
    </div>
  );
}
