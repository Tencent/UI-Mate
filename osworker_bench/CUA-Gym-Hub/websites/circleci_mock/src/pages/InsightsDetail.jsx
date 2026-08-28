import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { formatDuration } from '../components/StatusBadge.jsx';
import { withCurrentSearch } from '../utils/navigation.js';

export default function InsightsDetail() {
  const { projectSlug, workflowName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);
  const { state } = useApp();

  const decodedSlug = decodeURIComponent(projectSlug);
  const decodedWorkflow = decodeURIComponent(workflowName);

  const project = state.projects.find(p => p.slug === decodedSlug || p.name === decodedSlug);
  const metrics = (state.insights.workflowMetrics || []).find(
    m => m.workflowName === decodedWorkflow && (project ? m.projectName === project.name : true)
  );

  return (
    <div>
      <div className="breadcrumb">
        <span className="text-link" onClick={() => navigate(toPath('/insights'))}>Insights</span>
        <span className="breadcrumb-sep">›</span>
        <span className="text-link">{project?.name || decodedSlug}</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{decodedWorkflow}</span>
      </div>

      <div className="page-header">
        <h1 className="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          {decodedWorkflow}
        </h1>
      </div>

      {metrics ? (
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32, maxWidth: 800 }}>
            {[
              { label: 'Total Runs', value: metrics.runs },
              { label: 'Success Rate', value: `${metrics.successRate}%`, color: metrics.successRate > 90 ? 'var(--green)' : metrics.successRate > 70 ? 'var(--amber)' : 'var(--red)' },
              { label: 'P50 Duration', value: formatDuration(metrics.p50Duration) },
              { label: 'P95 Duration', value: formatDuration(metrics.p95Duration) },
              { label: 'Credits Used', value: metrics.credits.toLocaleString() },
              { label: 'MTTR', value: formatDuration(metrics.mttr) }
            ].map(card => (
              <div key={card.label} className="insight-card">
                <div className="insight-card-label">{card.label}</div>
                <div className="insight-card-value" style={card.color ? { color: card.color } : {}}>{card.value}</div>
              </div>
            ))}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Project: <strong style={{ color: 'var(--text-primary)' }}>{metrics.projectName}</strong>
            &nbsp;· Workflow: <strong style={{ color: 'var(--text-primary)' }}>{metrics.workflowName}</strong>
          </div>
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: 48 }}>
          <div className="empty-state-title">No insights data found</div>
          <div className="empty-state-desc">No metrics available for this workflow.</div>
        </div>
      )}
    </div>
  );
}
