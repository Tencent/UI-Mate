import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { relativeTime, statusBadgeClass, truncate, shortSha, frameworkLabel, generateId } from '../utils/helpers';
import { useState } from 'react';
import { ExternalLink, GitBranch, GitCommit, RotateCcw } from 'lucide-react';

export default function ProjectOverview() {
  const { projectId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showRedeployModal, setShowRedeployModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const project = state.projects.find(p => p.id === projectId);
  const allDeployments = state.deployments.filter(d => d.projectId === projectId);
  const prodDep = allDeployments.find(d => d.environment === 'production' && d.status === 'READY');
  const previewDeps = allDeployments.filter(d => d.environment === 'preview').slice(0, 5);
  const projectDomains = state.domains.filter(d => d.projectId === projectId);

  const handleRedeploy = () => {
    if (!prodDep) return;
    const newId = generateId('dpl');
    dispatch({
      type: 'ADD_DEPLOYMENT',
      payload: {
        id: newId, projectId,
        url: `${project.slug}-${Math.random().toString(36).slice(2, 9)}.vercel.app`,
        productionUrl: prodDep.productionUrl, status: 'BUILDING', environment: 'production',
        git: prodDep.git, buildDuration: null, framework: prodDep.framework,
        nodeVersion: prodDep.nodeVersion, regions: prodDep.regions, output: null,
        buildLogs: [
          { timestamp: new Date().toISOString(), text: `Redeploying from commit ${prodDep.git?.commitSha}...` },
          { timestamp: new Date().toISOString(), text: 'Installing dependencies...' },
        ],
        createdAt: new Date().toISOString(), readyAt: null, creatorId: state.currentUser?.id,
      }
    });
    dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: {
      type: 'deployment.created', description: `Redeployed ${project.name}`,
      userId: state.currentUser?.id, userName: state.currentUser?.name,
      userAvatar: state.currentUser?.avatar, projectId, projectName: project.name, metadata: {},
    }});
    setTimeout(() => {
      dispatch({ type: 'UPDATE_DEPLOYMENT', payload: { id: newId, status: 'READY', readyAt: new Date().toISOString(), buildDuration: 45 } });
    }, 5000);
    setShowRedeployModal(false);
  };

  if (!project) return <div className="page-body"><p style={{ color: 'var(--fg-muted)' }}>Project not found.</p></div>;

  return (
    <div className="page-body">
      {/* Production Deployment */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.32px' }}>Production Deployment</h2>
          {prodDep && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowRedeployModal(true)}>
              <RotateCcw size={13} /> Redeploy
            </button>
          )}
        </div>
        {prodDep ? (
          <div className="card">
            <div style={{ display: 'flex', gap: 32 }}>
              {/* Preview thumbnail */}
              <div style={{
                width: 320, height: 200, borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden',
              }}>
                <div style={{ color: 'var(--fg-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{'\u25B2'}</div>
                  {project.productionUrl}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 4 }}>Deployment</div>
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(prodDep.url)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left' }}
                  >
                    {prodDep.url} <ExternalLink size={12} />
                  </button>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 4 }}>Domains</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button type="button" onClick={() => setPreviewUrl(project.productionUrl)} style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                      {project.productionUrl} <ExternalLink size={12} />
                    </button>
                    {project.customDomains.map(d => (
                      <button key={d} type="button" onClick={() => setPreviewUrl(d)} style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                        {d} <ExternalLink size={12} />
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 4 }}>Status</div>
                    <span className={`badge ${statusBadgeClass(prodDep.status)}`}>
                      {prodDep.status.charAt(0) + prodDep.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 4 }}>Created</div>
                    <span style={{ fontSize: 14 }}>{relativeTime(prodDep.createdAt)}</span>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--fg-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <GitBranch size={13} /> {prodDep.git?.branch}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <GitCommit size={13} /> <span style={{ fontFamily: 'var(--font-mono)' }}>{shortSha(prodDep.git?.commitSha)}</span>
                  </span>
                  <span>{truncate(prodDep.git?.commitMessage, 50)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--fg-muted)' }}>
            No production deployment yet. Push to the main branch to create one.
          </div>
        )}
      </section>

      {/* Preview Deployments */}
      {previewDeps.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.32px' }}>Preview Deployments</h2>
            <Link to={`/project/${projectId}/deployments`} style={{ fontSize: 13, color: 'var(--accent-blue)', fontWeight: 500 }}>
              View All
            </Link>
          </div>
          <div style={{ boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {previewDeps.map(dep => (
              <div
                key={dep.id}
                className="deployment-row"
                onClick={() => navigate(`/project/${projectId}/deployments/${dep.id}`)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg)' }}>
                      {dep.url}
                    </span>
                    <span className={`badge ${statusBadgeClass(dep.status)}`}>
                      {dep.status.charAt(0) + dep.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--fg-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <GitBranch size={12} /> {dep.git?.branch}
                    </span>
                    <span>{truncate(dep.git?.commitMessage, 50)}</span>
                    <span style={{ color: 'var(--fg-muted)', marginLeft: 'auto' }}>{relativeTime(dep.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Redeploy Modal */}
      {showRedeployModal && (
        <div className="modal-overlay" onClick={() => setShowRedeployModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Redeploy to Production</h3>
            <p className="modal-desc">
              This will create a new deployment using the same source code and configuration as the current production deployment.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowRedeployModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRedeploy}>Redeploy</button>
            </div>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="modal-overlay" onClick={() => setPreviewUrl(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Deployment Preview</h3>
            <p className="modal-desc">This sandbox keeps previews local while preserving the deployment URL.</p>
            <div className="code-block" style={{ marginBottom: 16 }}>{previewUrl}</div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setPreviewUrl(null)}>Close</button>
              <Link className="btn btn-primary" to={`/project/${projectId}/deployments`}>
                View Deployments
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
