import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { StatusBadge, formatDuration, formatRelativeTime } from '../components/StatusBadge.jsx';
import { withCurrentSearch } from '../utils/navigation.js';

function getStatusIcon(status) {
  if (status === 'success') return <span style={{ color: '#04AA51', fontSize: 14, fontWeight: 700 }}>✓</span>;
  if (status === 'failed') return <span style={{ color: '#F44336', fontSize: 14, fontWeight: 700 }}>✗</span>;
  if (status === 'running') return <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #1A73E8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />;
  if (status === 'on_hold') return <span style={{ color: '#D4A017', fontSize: 14 }}>⏸</span>;
  if (status === 'blocked') return <span style={{ color: '#757575', fontSize: 14 }}>◷</span>;
  if (status === 'canceled') return <span style={{ color: '#757575', fontSize: 14 }}>⊘</span>;
  if (status === 'approval') return <span style={{ color: '#9C27B0', fontSize: 14 }}>⏸</span>;
  return <span style={{ color: '#ccc', fontSize: 14 }}>○</span>;
}

function buildDAGColumns(jobs) {
  // Assign each job to a depth column based on its dependencies
  const depths = {};
  const computed = new Set();

  const computeDepth = (jobId) => {
    if (computed.has(jobId)) return depths[jobId];
    const job = jobs.find(j => j.id === jobId);
    if (!job) return 0;
    if (!job.dependencies || job.dependencies.length === 0) {
      depths[jobId] = 0;
      computed.add(jobId);
      return 0;
    }
    const maxDepDepth = Math.max(...job.dependencies.map(depId => computeDepth(depId)));
    depths[jobId] = maxDepDepth + 1;
    computed.add(jobId);
    return depths[jobId];
  };

  jobs.forEach(j => computeDepth(j.id));

  const maxDepth = Math.max(0, ...Object.values(depths));
  const columns = [];
  for (let i = 0; i <= maxDepth; i++) {
    columns.push(jobs.filter(j => depths[j.id] === i));
  }
  return columns;
}

export default function WorkflowDetail() {
  const { pipelineId, workflowId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);
  const { state, dispatch } = useApp();

  const pipeline = state.pipelines.find(p => p.id === pipelineId);
  const workflow = state.workflows.find(w => w.id === workflowId);
  const project = pipeline ? state.projects.find(p => p.id === pipeline.projectId) : null;
  const jobs = state.jobs.filter(j => j.workflowId === workflowId);

  if (!workflow || !pipeline) return (
    <div className="empty-state" style={{ marginTop: 48 }}>
      <div className="empty-state-title">Workflow not found</div>
    </div>
  );

  const dagColumns = buildDAGColumns(jobs);

  const handleApprove = (jobId) => {
    dispatch({ type: 'APPROVE_JOB', payload: { jobId } });
  };

  const handleDeny = (jobId) => {
    dispatch({ type: 'DENY_JOB', payload: { jobId } });
  };

  const handleRerun = () => dispatch({ type: 'RERUN_WORKFLOW', payload: { workflowId } });
  const handleCancel = () => dispatch({ type: 'CANCEL_WORKFLOW', payload: { workflowId } });

  const liveJobs = jobs.filter(j => j.workflowId === workflowId);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="text-link" onClick={() => navigate(toPath('/pipelines'))}>Pipelines</span>
        <span className="breadcrumb-sep">›</span>
        <span className="text-link" onClick={() => navigate(toPath(`/pipelines/${pipelineId}`))}>
          {project?.name} #{pipeline.number}
        </span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{workflow.name}</span>
      </div>

      {/* Workflow header */}
      <div className="pipeline-meta">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge status={workflow.status} />
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>{workflow.name}</h2>
            <span className="duration">{formatDuration(workflow.duration)}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(workflow.status === 'running' || workflow.status === 'queued') && (
              <button className="btn" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={handleCancel}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Cancel
              </button>
            )}
            <button className="btn btn-primary" onClick={handleRerun}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
              Rerun
            </button>
          </div>
        </div>
      </div>

      {/* DAG Map */}
      <div className="section-header">
        <span className="section-title">Workflow Map</span>
      </div>

      <div className="workflow-map">
        <div className="dag-container">
          {dagColumns.map((col, colIdx) => (
            <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {col.map(job => {
                const isApproval = job.type === 'approval';
                const liveJob = liveJobs.find(j => j.id === job.id) || job;
                return (
                  <div key={job.id} style={{ display: 'flex', alignItems: 'center' }}>
                    {colIdx > 0 && (
                      <div style={{ width: 40, height: 2, background: 'var(--border)', marginRight: 8, flexShrink: 0 }}>
                        <svg width="40" height="14" style={{ position: 'relative', top: -6 }}>
                          <line x1="0" y1="7" x2="32" y2="7" stroke="var(--border)" strokeWidth="1.5"/>
                          <polygon points="28,4 36,7 28,10" fill="var(--border)"/>
                        </svg>
                      </div>
                    )}
                    <div
                      className={`dag-node ${liveJob.status} ${isApproval ? 'approval' : ''}`}
                      onClick={() => !isApproval && navigate(toPath(`/pipelines/${pipelineId}/workflows/${workflowId}/jobs/${job.id}`))}
                      style={{ cursor: isApproval ? 'default' : 'pointer' }}
                    >
                      <div className="dag-node-name" title={job.name}>{job.name}</div>
                      <div className="dag-node-status">
                        {getStatusIcon(isApproval && liveJob.status === 'on_hold' ? 'approval' : liveJob.status)}
                        <span className="dag-node-duration">{formatDuration(liveJob.duration)}</span>
                      </div>
                      {isApproval && liveJob.status === 'on_hold' && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '2px 8px', fontSize: 11 }}
                            onClick={e => { e.stopPropagation(); handleApprove(job.id); }}
                          >Approve</button>
                          <button
                            className="btn"
                            style={{ padding: '2px 8px', fontSize: 11, color: 'var(--red)', borderColor: 'var(--red)' }}
                            onClick={e => { e.stopPropagation(); handleDeny(job.id); }}
                          >Deny</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Jobs table */}
      <div className="section-header">
        <span className="section-title">Jobs ({jobs.length})</span>
      </div>

      <table className="jobs-table">
        <thead>
          <tr>
            <th>Job Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Credits</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => {
            const liveJob = liveJobs.find(j => j.id === job.id) || job;
            return (
              <tr key={job.id}>
                <td>
                  {job.type !== 'approval' ? (
                    <span
                      className="text-link"
                      onClick={() => navigate(toPath(`/pipelines/${pipelineId}/workflows/${workflowId}/jobs/${job.id}`))}
                    >
                      {job.name}
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--purple)' }}>⏸</span>
                      {job.name}
                      {liveJob.status === 'on_hold' && (
                        <span style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                          <button className="btn btn-primary" style={{ padding: '2px 10px', fontSize: 12 }} onClick={() => handleApprove(job.id)}>Approve</button>
                          <button className="btn" style={{ padding: '2px 10px', fontSize: 12, color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => handleDeny(job.id)}>Deny</button>
                        </span>
                      )}
                    </span>
                  )}
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{job.type}</td>
                <td><StatusBadge status={liveJob.status} /></td>
                <td className="duration">{formatDuration(liveJob.duration)}</td>
                <td>{liveJob.creditsUsed}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
