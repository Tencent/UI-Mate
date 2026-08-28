import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const DAYS_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Analytics() {
  const { projectId } = useParams();
  const { state, dispatch } = useApp();
  const project = state.projects.find(p => p.id === projectId);
  const analyticsEnabled = project?.analyticsEnabled !== false;
  const [timeRange, setTimeRange] = useState('7d');

  const visitors = [1840, 2250, 1920, 2100, 3200, 2800, 1950];
  const pageViews = [4200, 5100, 4800, 5300, 7800, 6200, 4500];
  const maxVal = Math.max(...visitors);

  const toggleAnalytics = () => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectId, analyticsEnabled: !analyticsEnabled } });
  };

  const topPages = [
    { path: '/', views: 18420, unique: 9130, bounce: '42%' },
    { path: '/dashboard', views: 8291, unique: 4201, bounce: '28%' },
    { path: '/pricing', views: 5103, unique: 3100, bounce: '56%' },
    { path: '/docs', views: 3280, unique: 1820, bounce: '33%' },
    { path: '/login', views: 2199, unique: 1950, bounce: '71%' },
    { path: '/about', views: 1840, unique: 1120, bounce: '48%' },
    { path: '/blog', views: 1520, unique: 980, bounce: '39%' },
  ];

  const topReferrers = [
    { source: 'google.com', visitors: 4820 },
    { source: 'twitter.com', visitors: 2130 },
    { source: 'github.com', visitors: 1840 },
    { source: 'direct', visitors: 1520 },
    { source: 'linkedin.com', visitors: 890 },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Web Analytics</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)} style={{ minWidth: 140 }}>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="btn btn-secondary btn-sm" onClick={toggleAnalytics}>
            {analyticsEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
      <div className="page-body">
        {analyticsEnabled ? (
          <>
            {/* Stat Cards */}
            <div className="stat-grid">
              {[
                { label: 'Unique Visitors', value: '12,847' },
                { label: 'Total Page Views', value: '48,293' },
                { label: 'Avg. Visit Duration', value: '2m 34s' },
              ].map(m => (
                <div key={m.label} className="stat-card">
                  <div className="stat-label">{m.label}</div>
                  <div className="stat-value">{m.value}</div>
                </div>
              ))}
            </div>

            {/* Visitors Chart */}
            <div className="card" style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Visitors</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Last 7 days</div>
              </div>
              <div className="chart-bar-container">
                {visitors.map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div className="chart-bar" style={{ height: `${(v / maxVal) * 100}px` }} title={`${v.toLocaleString()} visitors`} />
                    <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{DAYS_LABELS[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Two-column: Top Pages + Top Referrers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="card">
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Top Pages</div>
                <table className="table">
                  <thead><tr><th>Path</th><th style={{ textAlign: 'right' }}>Views</th><th style={{ textAlign: 'right' }}>Bounce</th></tr></thead>
                  <tbody>
                    {topPages.map(p => (
                      <tr key={p.path}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{p.path}</td>
                        <td style={{ textAlign: 'right' }}>{p.views.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', color: 'var(--fg-muted)' }}>{p.bounce}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Top Referrers</div>
                <table className="table">
                  <thead><tr><th>Source</th><th style={{ textAlign: 'right' }}>Visitors</th></tr></thead>
                  <tbody>
                    {topReferrers.map(r => (
                      <tr key={r.source}>
                        <td style={{ fontSize: 13 }}>{r.source}</td>
                        <td style={{ textAlign: 'right' }}>{r.visitors.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: 'var(--fg)' }}>Analytics is disabled</div>
            <div style={{ fontSize: 14, color: 'var(--fg-muted)', marginBottom: 20 }}>Enable Web Analytics to start tracking visitors, page views, and referrers.</div>
            <button className="btn btn-primary" onClick={toggleAnalytics}>Enable Analytics</button>
          </div>
        )}
      </div>
    </div>
  );
}
