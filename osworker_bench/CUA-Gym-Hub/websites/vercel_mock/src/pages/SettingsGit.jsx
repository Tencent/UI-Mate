import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GitBranch, Link2, Webhook } from 'lucide-react';

export default function SettingsGit() {
  const { projectId } = useParams();
  const { state, dispatch } = useApp();
  const project = state.projects.find(p => p.id === projectId);
  const [branch, setBranch] = useState(project?.productionBranch || 'main');
  const [hookName, setHookName] = useState('');
  const [hookBranch, setHookBranch] = useState('main');
  const [branchSaved, setBranchSaved] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [hookStatus, setHookStatus] = useState('');

  const saveBranch = () => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectId, productionBranch: branch } });
    setBranchSaved(true);
    setTimeout(() => setBranchSaved(false), 2000);
  };

  const disconnect = () => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectId, gitRepo: null, autoDeployEnabled: false } });
    setDisconnected(true);
    setShowDisconnectModal(false);
  };

  const createHook = () => {
    if (!hookName.trim()) return;
    const id = `hook_${Date.now()}`;
    const deployHooks = [...(project?.deployHooks || []), {
      id,
      name: hookName.trim(),
      branch: hookBranch,
      url: `/api/deploy-hooks/${id}`,
      createdAt: new Date().toISOString()
    }];
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectId, deployHooks } });
    setHookName('');
    setHookStatus('Deploy hook created.');
  };

  const removeHook = (hookId) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectId, deployHooks: (project?.deployHooks || []).filter(h => h.id !== hookId) } });
    setHookStatus('Deploy hook removed.');
  };

  const copyHook = (hook) => {
    navigator.clipboard?.writeText(`${window.location.origin}${hook.url}`).catch(() => {});
    setHookStatus(`Deploy hook URL copied for ${hook.name}.`);
  };

  const toggleAutoDeploy = () => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectId, autoDeployEnabled: !project?.autoDeployEnabled } });
  };

  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-title">Connected Git Repository</div>
        <div className="settings-section-desc">
          Seamlessly create Deployments for any commits pushed to your Git repository.
        </div>
        {disconnected || !project?.gitRepo ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--fg-muted)' }}>
            <Link2 size={24} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, marginBottom: 4 }}>No Git repository connected</div>
            <div style={{ fontSize: 13 }}>Connect a repository to enable automatic deployments.</div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {project?.gitRepo?.provider === 'github' ? '\u2693' : '\u{1F98A}'}
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{project?.gitRepo?.owner}/{project?.gitRepo?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{project?.gitRepo?.url}</div>
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => setShowDisconnectModal(true)}>Disconnect</button>
          </div>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Production Branch</div>
        <div className="settings-section-desc">
          By default, every commit pushed to the <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>main</code> branch will trigger a Production Deployment.
        </div>
        {branchSaved && (
          <div style={{ marginBottom: 10, padding: '8px 12px', background: '#dafbe8', border: '1px solid #0a7362', borderRadius: 'var(--radius)', color: '#0a7362', fontSize: 13 }}>
            Production branch updated.
          </div>
        )}
        <div className="settings-row">
          <input value={branch} onChange={e => setBranch(e.target.value)} style={{ fontFamily: 'var(--font-mono)' }} />
          <button className="btn btn-primary btn-sm" onClick={saveBranch}>Save</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Automatic Deployments</div>
        <div className="settings-section-desc">
          When enabled, every push to the production branch will trigger a new production deployment.
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
          <div
            onClick={toggleAutoDeploy}
            style={{
              width: 40, height: 22, borderRadius: 11,
              background: project?.autoDeployEnabled ? '#171717' : 'var(--border)',
              position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 2, left: project?.autoDeployEnabled ? 19 : 2,
              width: 18, height: 18, borderRadius: '50%',
              background: '#fff', transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
          {project?.autoDeployEnabled ? 'Enabled' : 'Disabled'}
        </label>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Deploy Hooks</div>
        <div className="settings-section-desc">
          Deploy Hooks allow external services to trigger deployments using unique URLs.
        </div>
        {(project?.deployHooks || []).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {(project?.deployHooks || []).map(hook => (
              <div key={hook.id} style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)' }}>
                <Webhook size={14} style={{ color: 'var(--fg-muted)' }} />
                <span style={{ fontWeight: 500, fontSize: 14 }}>{hook.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)' }}>{hook.branch}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {hook.url || `/api/deploy-hooks/${hook.id}`}
                </span>
                <button className="btn btn-secondary btn-sm" onClick={() => copyHook({ ...hook, url: hook.url || `/api/deploy-hooks/${hook.id}` })}>
                  Copy URL
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => removeHook(hook.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
        {hookStatus && (
          <div style={{ marginBottom: 10, padding: '8px 12px', background: '#eef6ff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', color: 'var(--fg-secondary)', fontSize: 13 }}>
            {hookStatus}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <input placeholder="Hook name" value={hookName} onChange={e => setHookName(e.target.value)} style={{ flex: 1 }} />
          <select value={hookBranch} onChange={e => setHookBranch(e.target.value)} style={{ width: 120 }}>
            <option>main</option>
            <option>develop</option>
            <option>staging</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={createHook}>Create Hook</button>
        </div>
      </div>

      {showDisconnectModal && (
        <div className="modal-overlay" onClick={() => setShowDisconnectModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Disconnect Git Repository</h3>
            <p className="modal-desc">This will remove the local Git connection for this project and disable automatic deployments.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDisconnectModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={disconnect}>Disconnect</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
