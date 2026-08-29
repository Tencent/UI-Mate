import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { StatusBadge, formatDuration, formatRelativeTime } from '../components/StatusBadge.jsx';
import { withCurrentSearch } from '../utils/navigation.js';

export default function PipelineDetail() {
  const { pipelineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);
  const { state, dispatch } = useApp();

  const pipeline = state.pipelines.find(p => p.id === pipelineId);
  const project = pipeline ? state.projects.find(p => p.id === pipeline.projectId) : null;
  const workflows = state.workflows.filter(w => w.pipelineId === pipelineId);

  if (!pipeline) return (
    <div className="empty-state" style={{ marginTop: 48 }}>
      <div className="empty-state-title">Pipeline not found</div>
    </div>
  );

  const handleRerun = () => dispatch({ type: 'RERUN_PIPELINE', payload: { pipelineId } });
  const handleRerunFailed = () => {
    dispatch({ type: 'RERUN_FAILED', payload: { pipelineId } });
  };
  const handleCancel = (wfId) => dispatch({ type: 'CANCEL_WORKFLOW', payload: { workflowId: wfId } });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="text-link" onClick={() => navigate(toPath('/pipelines'))}>Pipelines</span>
        <span className="breadcrumb-sep">›</span>
        <span className="text-link" onClick={() => navigate(toPath('/projects'))}>{project?.name}</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">#{pipeline.number}</span>
      </div>

      {/* Pipeline metadata */}
      <div className="pipeline-meta">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>
            {project?.name} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>#{pipeline.number}</span>
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {workflows.some(w => w.status === 'failed') && (
              <button className="btn" onClick={handleRerunFailed}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                Rerun from Failed
              </button>
            )}
            <button className="btn btn-primary" onClick={handleRerun}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
              Rerun
            </button>
          </div>
        </div>
        <div className="pipeline-meta-row">
          <div className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>
            <span>{pipeline.vcs.branch}</span>
          </div>
          <div className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <span className="commit-hash">{pipeline.vcs.commitHash}</span>
          </div>
          <div className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <span style={{ color: 'var(--text-secondary)' }}>{pipeline.vcs.commitMessage}</span>
          </div>
          <div className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>{formatRelativeTime(pipeline.createdAt)}</span>
          </div>
          <div className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <span>{pipeline.trigger.actor.login}</span>
            <span style={{ color: 'var(--text-secondary)' }}>via {pipeline.trigger.type}</span>
          </div>
        </div>
      </div>

      {/* Workflows list */}
      <div className="section-header">
        <span className="section-title">Workflows ({workflows.length})</span>
      </div>

      <table className="jobs-table">
        <thead>
          <tr>
            <th>Workflow Name</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Credits</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workflows.map(wf => (
            <tr key={wf.id}>
              <td>
                <span
                  className="text-link"
                  onClick={() => navigate(toPath(`/pipelines/${pipelineId}/workflows/${wf.id}`))}
                >
                  {wf.name}
                </span>
              </td>
              <td><StatusBadge status={wf.status} /></td>
              <td className="duration">{formatDuration(wf.duration)}</td>
              <td>{wf.creditsUsed}</td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn" style={{ padding: '4px 10px' }} onClick={() => dispatch({ type: 'RERUN_WORKFLOW', payload: { workflowId: wf.id } })}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                    Rerun
                  </button>
                  {(wf.status === 'running' || wf.status === 'queued') && (
                    <button className="btn" style={{ padding: '4px 10px', color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => handleCancel(wf.id)}>
                      Cancel
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
