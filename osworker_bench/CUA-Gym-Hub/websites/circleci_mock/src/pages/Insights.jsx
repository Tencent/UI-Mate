import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { formatDuration } from '../components/StatusBadge.jsx';
import { withCurrentSearch } from '../utils/navigation.js';

const TIME_RANGES = ['24h', '7d', '30d', '60d', '90d'];

function formatTotalDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function Insights() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);
  const [sortKey, setSortKey] = useState('runs');
  const [sortDir, setSortDir] = useState('desc');

  const { insights } = state;
  const timeRange = insights.timeRange || '30d';

  const setTimeRange = (tr) => dispatch({ type: 'SET_INSIGHTS_TIME_RANGE', payload: { timeRange: tr } });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...(insights.workflowMetrics || [])].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const trendUp = (val) => val >= 0;
  const summaryCards = [
    { label: 'Workflow Runs', value: insights.summary.workflowRuns.toLocaleString(), trend: '+8%', up: true },
    { label: 'Total Duration', value: formatTotalDuration(insights.summary.totalDuration), trend: '+3%', up: false },
    { label: 'Success Rate', value: `${insights.summary.successRate}%`, trend: '-1.2%', up: false, color: insights.summary.successRate > 90 ? 'var(--green)' : insights.summary.successRate > 70 ? 'var(--amber)' : 'var(--red)' },
    { label: 'Credits Used', value: insights.summary.totalCredits.toLocaleString(), trend: '+12%', up: false }
  ];

  const SortIcon = ({ k }) => (
    <span style={{ marginLeft: 4, opacity: sortKey === k ? 1 : 0.3, fontSize: 10 }}>
      {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Insights
        </h1>
      </div>

      {/* Time range selector */}
      <div className="insights-time-range">
        {TIME_RANGES.map(tr => (
          <button
            key={tr}
            className={`time-range-btn${timeRange === tr ? ' active' : ''}`}
            onClick={() => setTimeRange(tr)}
          >
            {tr}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="insight-cards">
        {summaryCards.map(card => (
          <div key={card.label} className="insight-card">
            <div className="insight-card-label">{card.label}</div>
            <div className="insight-card-value" style={card.color ? { color: card.color } : {}}>{card.value}</div>
            <div className={`insight-trend${card.up ? ' up' : ' down'}`}>
              {card.up ? '↑' : '↓'} {card.trend} vs. prior period
            </div>
          </div>
        ))}
      </div>

      {/* Workflow metrics table */}
      <div className="section-header">
        <span className="section-title">Workflow Metrics</span>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('workflowName')}>Workflow Name <SortIcon k="workflowName" /></th>
            <th onClick={() => handleSort('projectName')}>Project <SortIcon k="projectName" /></th>
            <th onClick={() => handleSort('runs')}>Runs <SortIcon k="runs" /></th>
            <th onClick={() => handleSort('successRate')}>Success Rate <SortIcon k="successRate" /></th>
            <th onClick={() => handleSort('p50Duration')}>P50 Duration <SortIcon k="p50Duration" /></th>
            <th onClick={() => handleSort('p95Duration')}>P95 Duration <SortIcon k="p95Duration" /></th>
            <th onClick={() => handleSort('credits')}>Credits <SortIcon k="credits" /></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const project = (state.projects || []).find(p => p.name === row.projectName);
            const projectSlug = project ? encodeURIComponent(project.slug) : encodeURIComponent(row.projectName);
            const workflowName = encodeURIComponent(row.workflowName);
            return (
            <tr key={i}>
              <td>
                <span
                  className="text-link"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(toPath(`/insights/${projectSlug}/${workflowName}`))}
                >
                  {row.workflowName}
                </span>
              </td>
              <td style={{ color: 'var(--text-secondary)' }}>{row.projectName}</td>
              <td>{row.runs}</td>
              <td>
                <div className="rate-bar">
                  <span style={{ minWidth: 42, color: row.successRate > 90 ? 'var(--green)' : row.successRate > 70 ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>
                    {row.successRate}%
                  </span>
                  <div className="rate-bar-track">
                    <div
                      className="rate-bar-fill"
                      style={{ width: `${row.successRate}%`, background: row.successRate > 90 ? 'var(--green)' : row.successRate > 70 ? 'var(--amber)' : 'var(--red)' }}
                    />
                  </div>
                </div>
              </td>
              <td className="duration">{formatDuration(row.p50Duration)}</td>
              <td className="duration">{formatDuration(row.p95Duration)}</td>
              <td>{row.credits.toLocaleString()}</td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
