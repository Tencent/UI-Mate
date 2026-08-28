import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

function formatDeployedAt(isoString) {
  if (!isoString) return 'unknown';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export default function Deploys() {
  const { state, dispatch } = useApp();
  const envs = state.deployEnvironments || [];
  const [selectedEnv, setSelectedEnv] = useState(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedEnv(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const statusColor = (s) => s === 'success' ? 'var(--green)' : s === 'running' ? 'var(--blue)' : s === 'failed' ? 'var(--red)' : 'var(--gray)';

  const handleRedeploy = (env) => {
    dispatch({
      type: 'UPDATE_DEPLOY_ENV',
      payload: {
        id: env.id,
        updates: { status: 'running', deployedAt: new Date().toISOString() }
      }
    });
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_DEPLOY_ENV',
        payload: {
          id: env.id,
          updates: { status: 'success', deployedAt: new Date().toISOString() }
        }
      });
    }, 3000);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Deploys
        </h1>
      </div>
      <div className="deploy-env-grid">
        {envs.map(env => (
          <div key={env.id} className="deploy-env-card">
            <div className="deploy-env-name">{env.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(env.status), display: 'inline-block' }} />
              <span style={{ fontWeight: 600, fontSize: 13, color: statusColor(env.status), textTransform: 'capitalize' }}>{env.status}</span>
            </div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>
              <strong>{env.version}</strong>
              <span className="text-mono" style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>{env.commit}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Deployed {formatDeployedAt(env.deployedAt)}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn-ghost" onClick={() => setSelectedEnv(env)} style={{ fontSize: 12, color: 'var(--link)', padding: 0 }}>View deployment →</button>
              <button className="link-button" onClick={() => setSelectedEnv(env)} style={{ fontSize: 12, color: 'var(--link)', padding: 0 }}>View deployment →</button>
              <button
                className="btn"
                style={{ padding: '4px 10px', fontSize: 12, marginLeft: 'auto' }}
                onClick={() => handleRedeploy(env)}
              >
                {env.status === 'running' ? 'Restart deploy' : 'Redeploy'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedEnv && (
        <div className="modal-overlay" role="presentation" onClick={() => setSelectedEnv(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="deployment-preview-title" onClick={e => e.stopPropagation()}>
            <div id="deployment-preview-title" className="modal-title">{selectedEnv.name} deployment</div>
            <div className="notice-card">
              <div><strong>Version:</strong> {selectedEnv.version}</div>
              <div><strong>Commit:</strong> <span className="text-mono">{selectedEnv.commit}</span></div>
              <div><strong>Status:</strong> {selectedEnv.status}</div>
              <div><strong>Local URL:</strong> {selectedEnv.url}</div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 12 }}>
              External deployment pages are represented locally so CUA training stays inside the sandbox.
            </p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setSelectedEnv(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { handleRedeploy(selectedEnv); setSelectedEnv(null); }}>Redeploy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
