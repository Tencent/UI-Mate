import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { relativeTime, statusBadgeClass, formatTimestamp, logLineClass, shortSha, frameworkLabel, generateId } from '../utils/helpers';
import { ExternalLink, GitBranch, GitCommit, RotateCcw, ArrowUpCircle, XCircle, Clock, Box, Zap, Globe } from 'lucide-react';

export default function DeploymentDetail() {
  const { projectId, deploymentId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('build-logs');
  const [showRedeployModal, setShowRedeployModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const deployment = state.deployments.find(d => d.id === deploymentId);
  const project = state.projects.find(p => p.id === projectId);

  if (!deployment) return (
    <div className="page-body">
      <p style={{ color: 'var(--fg-muted)' }}>Deployment not found.</p>
    </div>
  );

  const handleRedeploy = () => {
    const newId = generateId('dpl');
    dispatch({ type: 'ADD_DEPLOYMENT', payload: {
      id: newId, projectId, url: `${project?.slug}-${Math.random().toString(36).slice(2,9)}.vercel.app`,
      productionUrl: deployment.productionUrl, status: 'BUILDING', environment: deployment.environment,
      git: deployment.git, buildDuration: null, framework: deployment.framework,
      nodeVersion: deployment.nodeVersion, regions: deployment.regions, output: null,
      buildLogs: [
        { timestamp: new Date().toISOString(), text: 'Cloning repository...' },
        { timestamp: new Date().toISOString(), text: 'Installing dependencies...' },
      ],
      createdAt: new Date().toISOString(), readyAt: null, creatorId: state.currentUser?.id,
    }});
    dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
      type: 'deployment.created', description: `Redeployed ${project?.name}`,
      userId: state.currentUser?.id, userName: state.currentUser?.name,
      userAvatar: state.currentUser?.avatar, projectId, projectName: project?.name, metadata: {},
    }});
    setTimeout(() => {
      dispatch({ type: 'UPDATE_DEPLOYMENT', payload: { id: newId, status: 'READY', readyAt: new Date().toISOString(), buildDuration: 45 }});
    }, 5000);
    setShowRedeployModal(false);
    navigate(`/project/${projectId}/deployments`);
  };

  const handlePromote = () => {
    dispatch({ type: 'UPDATE_DEPLOYMENT', payload: { id: deploymentId, environment: 'production', productionUrl: project?.productionUrl }});
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectId, latestDeployment: deploymentId }});
    dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
      type: 'deployment.ready', description: `Promoted deployment to production for ${project?.name}`,
      userId: state.currentUser?.id, userName: state.currentUser?.name,
      userAvatar: state.currentUser?.avatar, projectId, projectName: project?.name, metadata: {},
    }});
    setShowPromoteModal(false);
  };

  const handleCancel = () => {
    dispatch({ type: 'UPDATE_DEPLOYMENT', payload: { id: deploymentId, status: 'CANCELED' }});
  };

  return (
    <div>
      {/* Deployment Header */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.5px', fontFamily: 'var(--font-mono)' }}>
              {deployment.url}
            </h1>
            <button
              type="button"
              className="btn-icon"
              aria-label="Open deployment preview"
              onClick={() => setPreviewUrl(deployment.url)}
            >
              <ExternalLink size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowRedeployModal(true)}>
              <RotateCcw size={13} /> Redeploy
            </button>
            {deployment.environment === 'preview' && deployment.status === 'READY' && (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPromoteModal(true)}>
                <ArrowUpCircle size={13} /> Promote to Production
              </button>
            )}
            {(deployment.status === 'BUILDING' || deployment.status === 'QUEUED') && (
              <button className="btn btn-danger btn-sm" onClick={handleCancel}>
                <XCircle size={13} /> Cancel
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge ${statusBadgeClass(deployment.status)}`}>
            {deployment.status.charAt(0) + deployment.status.slice(1).toLowerCase()}
          </span>
          <span className={`badge badge-${deployment.environment}`}>
            {deployment.environment.charAt(0).toUpperCase() + deployment.environment.slice(1)}
          </span>
          <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
            {deployment.git?.commitMessage}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, padding: '24px 32px' }}>
          {/* Tabs */}
          <div className="tabs">
            {[
              { key: 'build-logs', label: 'Build Logs' },
              { key: 'runtime-logs', label: 'Runtime Logs' },
              { key: 'source', label: 'Source' },
            ].map(tab => (
              <button key={tab.key} className={`tab-item${activeTab === tab.key ? ' active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'build-logs' && (
            <div className="build-logs">
              {(!deployment.buildLogs || deployment.buildLogs.length === 0) ? (
                <div style={{ color: '#6e7681' }}>No build logs available.</div>
              ) : (
                deployment.buildLogs.map((line, i) => (
                  <div key={i} className="log-line">
                    <span className="log-timestamp">{formatTimestamp(line.timestamp)}</span>
                    <span className={logLineClass(line.text)}>{line.text}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'runtime-logs' && (
            <div className="build-logs" style={{ minHeight: 200 }}>
              <div className="log-line">
                <span className="log-timestamp">--:--:--</span>
                <span style={{ color: '#6e7681' }}>Waiting for runtime logs...</span>
              </div>
              <div className="log-line">
                <span className="log-timestamp">--:--:--</span>
                <span style={{ color: '#6e7681' }}>Runtime logs are collected from serverless functions during execution.</span>
              </div>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ color: 'var(--fg-muted)', fontSize: 14 }}>
                <p style={{ marginBottom: 8 }}>Source files for this deployment</p>
                <p>Commit: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>{shortSha(deployment.git?.commitSha)}</code> on branch <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>{deployment.git?.branch}</code></p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: 320, flexShrink: 0, borderLeft: '1px solid var(--border)', padding: '24px 20px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, letterSpacing: '-0.02em' }}>Deployment Details</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: Box, label: 'Framework', value: frameworkLabel(deployment.framework) },
              { icon: Clock, label: 'Build Duration', value: deployment.buildDuration ? `${deployment.buildDuration}s` : 'In progress...' },
              { icon: Globe, label: 'Regions', value: (deployment.regions || []).join(', ') || 'iad1' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Icon size={14} style={{ color: 'var(--fg-muted)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--fg)' }}>{value}</div>
                </div>
              </div>
            ))}

            {/* Git info */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8, fontWeight: 500 }}>Source</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13 }}>
                <GitBranch size={13} style={{ color: 'var(--fg-muted)' }} />
                <span>{deployment.git?.branch}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13 }}>
                <GitCommit size={13} style={{ color: 'var(--fg-muted)' }} />
                <span style={{ fontFamily: 'var(--font-mono)' }}>{shortSha(deployment.git?.commitSha)}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>
                by {deployment.git?.author}
              </div>
            </div>

            {/* Output */}
            {deployment.output && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Output</div>
                {[
                  { label: 'Static Files', value: deployment.output.staticFiles },
                  { label: 'Serverless Functions', value: deployment.output.serverlessFunctions },
                  { label: 'Edge Functions', value: deployment.output.edgeFunctions },
                  { label: 'Total Size', value: deployment.output.totalSize },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: 'var(--fg-muted)' }}>{label}</span>
                    <span style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)' }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRedeployModal && (
        <div className="modal-overlay" onClick={() => setShowRedeployModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Redeploy</h3>
            <p className="modal-desc">This will create a new deployment using the same source code and configuration.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowRedeployModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRedeploy}>Redeploy</button>
            </div>
          </div>
        </div>
      )}

      {showPromoteModal && (
        <div className="modal-overlay" onClick={() => setShowPromoteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Promote to Production</h3>
            <p className="modal-desc">This will make this deployment the active production deployment for {project?.name}.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowPromoteModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePromote}>Promote</button>
            </div>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="modal-overlay" onClick={() => setPreviewUrl(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Deployment Preview</h3>
            <p className="modal-desc">Local sandbox preview for this deployment URL.</p>
            <div className="code-block" style={{ marginBottom: 16 }}>{previewUrl}</div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setPreviewUrl(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
