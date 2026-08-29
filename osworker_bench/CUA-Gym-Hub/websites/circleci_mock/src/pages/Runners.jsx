import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

function formatLastContact(isoString) {
  if (!isoString) return 'unknown';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Runners() {
  const { state, dispatch } = useApp();
  const resourceClasses = state.resourceClasses || [];
  const runnerInstances = state.runnerInstances || [];

  const [showModal, setShowModal] = useState(false);
  const [rcName, setRcName] = useState('');
  const [rcDesc, setRcDesc] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleCreate = () => {
    const name = rcName.trim();
    if (!name) {
      setFormError('Class name is required.');
      return;
    }
    dispatch({ type: 'CREATE_RESOURCE_CLASS', payload: { name, description: rcDesc.trim() || 'Custom resource class' } });
    setRcName('');
    setRcDesc('');
    setFormError('');
    setShowModal(false);
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_RESOURCE_CLASS', payload: { id } });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          Self-Hosted Runners
        </h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Resource Class
        </button>
      </div>

      <div className="runners-section">
        <h3>Resource Classes</h3>
        <table className="data-table" style={{ marginBottom: 24 }}>
          <thead><tr><th>Class Name</th><th>Description</th><th>Runner Count</th><th></th></tr></thead>
          <tbody>
            {resourceClasses.length === 0 ? (
              <tr><td colSpan={4} style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>No resource classes. Create one to get started.</td></tr>
            ) : (
              resourceClasses.map(rc => {
                const count = runnerInstances.filter(ri => ri.resourceClassId === rc.id).length;
                return (
                  <tr key={rc.id}>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{rc.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{rc.description}</td>
                    <td>{count}</td>
                    <td>
                      <button className="btn-ghost" onClick={() => setDeleteTarget(rc)} title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <h3>Runner Instances</h3>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Resource Class</th><th>Version</th><th>Platform</th><th>Status</th><th>IP</th><th>Last Contact</th></tr></thead>
          <tbody>
            {runnerInstances.length === 0 ? (
              <tr><td colSpan={7} style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>No runner instances registered.</td></tr>
            ) : (
              runnerInstances.map(inst => (
                <tr key={inst.id}>
                  <td style={{ fontWeight: 500 }}>{inst.name}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{inst.resourceClassName}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{inst.version}</td>
                  <td style={{ fontSize: 12 }}>{inst.platform}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: inst.status === 'online' ? 'var(--green)' : 'var(--gray)' }} />
                      {inst.status}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{inst.ip}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{formatLastContact(inst.lastContactAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create Resource Class</div>
            <div className="form-field">
              <label>Class Name</label>
              <input
                type="text"
                placeholder="acme-corp/my-runner"
                value={rcName}
                onChange={e => { setRcName(e.target.value); setFormError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Format: namespace/name</div>
            </div>
            <div className="form-field">
              <label>Description</label>
              <input
                type="text"
                placeholder="e.g. General purpose Linux runner"
                value={rcDesc}
                onChange={e => setRcDesc(e.target.value)}
              />
            </div>
            {formError && (
              <div style={{ color: 'var(--red)', fontSize: 12, marginTop: -4 }}>{formError}</div>
            )}
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete resource class?"
          message={`Delete ${deleteTarget.name}? Associated runner instances remain visible, matching the local XircleCI sandbox behavior.`}
          confirmLabel="Delete"
          destructive
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { handleDelete(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}
