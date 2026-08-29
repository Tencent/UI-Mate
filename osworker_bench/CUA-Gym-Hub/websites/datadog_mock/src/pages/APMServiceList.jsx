import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';

const TYPE_COLORS = { web: '#632CA6', db: '#1a73e8', cache: '#0d652d', worker: '#c17d10', custom: '#666' };

export default function APMServiceList() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState('all');

  const filtered = useMemo(() => {
    let svcs = state.services;
    if (envFilter !== 'all') svcs = svcs.filter(s => s.env === envFilter);
    if (search) {
      const q = search.toLowerCase();
      svcs = svcs.filter(s => s.name.toLowerCase().includes(q));
    }
    return svcs;
  }, [state.services, search, envFilter]);

  const totalReqs = filtered.reduce((a, s) => a + s.requestsPerSec, 0);
  const avgLatency = filtered.length ? (filtered.reduce((a, s) => a + s.avgLatencyMs, 0) / filtered.length) : 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Services</h1>
        <select value={envFilter} onChange={e => setEnvFilter(e.target.value)} style={{ padding: '4px 8px', border: '1px solid var(--card-border)', borderRadius: 6, fontSize: 13 }}>
          <option value="all">All Environments</option>
          <option value="production">production</option>
          <option value="staging">staging</option>
        </select>
      </div>

      <input className="search-input" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 16 }} />

      <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
        <span>{filtered.length} services</span>
        <span>Total: {totalReqs.toFixed(1)} req/s</span>
        <span>Avg Latency: {avgLatency.toFixed(1)} ms</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Type</th>
              <th className="numeric">Requests/s</th>
              <th className="numeric">Avg Latency</th>
              <th className="numeric">P95 Latency</th>
              <th className="numeric">Error Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ cursor: 'pointer', height: 48 }} onClick={() => navigate(toPath(`/apm/services/${s.name}`))}>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span className="status-dot" style={{ background: TYPE_COLORS[s.type] || '#666' }} />
                    <strong>{s.name}</strong>
                  </span>
                </td>
                <td><span className={`type-badge ${s.type}`}>{s.type}</span></td>
                <td className="numeric">{s.requestsPerSec.toFixed(1)}</td>
                <td className="numeric">{s.avgLatencyMs.toFixed(1)} ms</td>
                <td className="numeric">{s.p95LatencyMs.toFixed(1)} ms</td>
                <td className="numeric" style={{ color: s.errorRate > 5 ? 'var(--color-alert)' : 'inherit' }}>
                  {s.errorRate.toFixed(2)}%
                </td>
                <td><span className={`status-dot ${s.status}`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
