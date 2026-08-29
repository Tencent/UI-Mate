import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { StatusBadge, formatRelativeTime } from '../components/StatusBadge.jsx';
import { withCurrentSearch } from '../utils/navigation.js';

export default function Home() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Derive summary stats from state
  const allWorkflows = state.workflows || [];
  const allPipelines = state.pipelines || [];
  const allProjects = state.projects || [];

  // Recent 5 pipelines sorted by createdAt desc
  const recentPipelines = [...allPipelines]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Summary counts
  const pipelinesToday = allPipelines.filter(p => (now - new Date(p.createdAt).getTime()) < oneDayMs);

  // Determine pipeline status from its workflows
  const getPipelineStatus = (pipelineId) => {
    const wfs = allWorkflows.filter(w => w.pipelineId === pipelineId);
    if (wfs.length === 0) return 'queued';
    if (wfs.some(w => w.status === 'failed')) return 'failed';
    if (wfs.some(w => w.status === 'running')) return 'running';
    if (wfs.some(w => w.status === 'queued')) return 'queued';
    if (wfs.some(w => w.status === 'on_hold')) return 'on_hold';
    if (wfs.every(w => w.status === 'success')) return 'success';
    return 'canceled';
  };

  const todayFailed = pipelinesToday.filter(p => getPipelineStatus(p.id) === 'failed').length;
  const todayRunning = pipelinesToday.filter(p => getPipelineStatus(p.id) === 'running').length;

  return (
    <div className="content-body">
      <h1 className="page-title" style={{ marginBottom: 4 }}>Organization Home</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 13 }}>
        Welcome to {state.organization.name}'s XircleCI dashboard.
      </p>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <div style={summaryCardStyle}>
          <div style={summaryValueStyle}>{allProjects.length}</div>
          <div style={summaryLabelStyle}>Projects</div>
        </div>
        <div style={summaryCardStyle}>
          <div style={summaryValueStyle}>{pipelinesToday.length}</div>
          <div style={summaryLabelStyle}>Pipelines today</div>
        </div>
        <div style={{ ...summaryCardStyle, borderColor: todayFailed > 0 ? '#fca5a5' : undefined }}>
          <div style={{ ...summaryValueStyle, color: todayFailed > 0 ? 'var(--red)' : undefined }}>{todayFailed}</div>
          <div style={summaryLabelStyle}>Failed today</div>
        </div>
        <div style={{ ...summaryCardStyle, borderColor: todayRunning > 0 ? '#93c5fd' : undefined }}>
          <div style={{ ...summaryValueStyle, color: todayRunning > 0 ? 'var(--blue)' : undefined }}>{todayRunning}</div>
          <div style={summaryLabelStyle}>Running now</div>
        </div>
      </div>

      {/* Recent pipelines */}
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Recent Pipelines</span>
        <span
          className="text-link"
          style={{ fontSize: 13 }}
          onClick={() => navigate(toPath('/pipelines'))}
        >
          View all
        </span>
      </div>
      <table className="jobs-table" style={{ marginBottom: 0 }}>
        <thead>
          <tr>
            <th>Project</th>
            <th>Pipeline</th>
            <th>Branch</th>
            <th>Status</th>
            <th>Triggered</th>
          </tr>
        </thead>
        <tbody>
          {recentPipelines.map(pipeline => {
            const project = allProjects.find(p => p.id === pipeline.projectId);
            const status = getPipelineStatus(pipeline.id);
            return (
              <tr key={pipeline.id} style={{ cursor: 'pointer' }} onClick={() => navigate(toPath(`/pipelines/${pipeline.id}`))}>
                <td>
                  <span className="text-link">{project?.name || pipeline.projectId}</span>
                </td>
                <td>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 12 }}>
                    #{pipeline.number}
                  </span>
                  <span style={{ marginLeft: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                    {pipeline.vcs.commitMessage.length > 50
                      ? pipeline.vcs.commitMessage.slice(0, 50) + '…'
                      : pipeline.vcs.commitMessage}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{pipeline.vcs.branch}</span>
                </td>
                <td>
                  <StatusBadge status={status} />
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  {formatRelativeTime(pipeline.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const summaryCardStyle = {
  flex: 1,
  background: 'var(--content-secondary-bg)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '16px 20px',
  minWidth: 100,
};

const summaryValueStyle = {
  fontSize: 28,
  fontWeight: 700,
  lineHeight: 1.2,
  marginBottom: 4,
};

const summaryLabelStyle = {
  fontSize: 12,
  color: 'var(--text-secondary)',
};
