import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function MetricsList() {
  const { state } = useAppContext();
  const [search, setSearch] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(null);

  const filtered = search
    ? state.metrics.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    : state.metrics;

  const generateSparkline = (seed) => {
    let s = seed;
    return Array.from({ length: 12 }, () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return (s / 0x7fffffff) * 20 + 4;
    });
  };

  if (selectedMetric) {
    const metric = state.metrics.find(m => m.id === selectedMetric);
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-secondary" onClick={() => setSelectedMetric(null)} style={{ fontSize: 13 }}>&larr; Back to Metrics</button>
        </div>
        <h1 className="page-title" style={{ marginBottom: 24 }}>{metric.name}</h1>
        <div className="card">
          <div className="card-title">Event Trend</div>
          <div style={{ height: 200, background: 'var(--bg-tertiary)', borderRadius: 6, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, padding: '16px 24px', marginBottom: 16 }}>
            {generateSparkline(42).map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h * 4}%`, background: 'var(--accent-green)', borderRadius: '3px 3px 0 0', opacity: 0.7, minHeight: 4 }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div><div style={{ fontSize: 20, fontWeight: 700 }}>{metric.eventCount.toLocaleString()}</div><div className="text-muted" style={{ fontSize: 12 }}>Total events</div></div>
            <div><div style={{ fontSize: 20, fontWeight: 700 }}>{metric.integration}</div><div className="text-muted" style={{ fontSize: 12 }}>Integration</div></div>
            <div><div style={{ fontSize: 20, fontWeight: 700 }}>{new Date(metric.lastEventAt).toLocaleDateString()}</div><div className="text-muted" style={{ fontSize: 12 }}>Last event</div></div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Recent Events</div>
          <table className="data-table">
            <thead><tr><th>Timestamp</th><th>Profile</th><th>Details</th></tr></thead>
            <tbody>
              {state.profiles.slice(0, 5).map((p, i) => (
                <tr key={i}>
                  <td className="text-muted">{new Date(Date.now() - i * 3600000).toLocaleString()}</td>
                  <td>{p.email}</td>
                  <td className="text-muted">{metric.name} event</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Metrics</h1>
      </div>

      <div className="filter-bar">
        <input type="text" placeholder="Search metrics..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric name</th>
              <th>Integration</th>
              <th>Total events</th>
              <th>Last event</th>
              <th>Trend (30d)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((metric, mi) => {
              const bars = generateSparkline(mi * 137 + 42);
              return (
                <tr key={metric.id}>
                  <td><span className="clickable" onClick={() => setSelectedMetric(metric.id)}>{metric.name}</span></td>
                  <td className="text-muted">{metric.integration}</td>
                  <td>{metric.eventCount.toLocaleString()}</td>
                  <td className="text-muted">{new Date(metric.lastEventAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>
                    <div className="sparkline">
                      {bars.map((h, i) => <div key={i} className="sparkline-bar" style={{ height: h }}></div>)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
