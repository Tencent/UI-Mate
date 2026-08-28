import React, { useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LineChart, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { withCurrentSearch } from '../utils/navigation';

function makeChartData(arr) {
  const now = Date.now();
  return arr.map((v, i) => ({ time: now - (arr.length - 1 - i) * 60000, value: v }));
}

function makeDualData(arr1, arr2) {
  const now = Date.now();
  return arr1.map((v, i) => ({ time: now - (arr1.length - 1 - i) * 60000, requests: v, errors: (arr2[i] || 0) }));
}

function makeLatencyData(svc) {
  const now = Date.now();
  return svc.latencyHistory.map((v, i) => ({
    time: now - (svc.latencyHistory.length - 1 - i) * 60000,
    p50: v * 0.7,
    p95: v * 1.8,
    p99: v * 3.5,
  }));
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function APMServiceDetail() {
  const { name } = useParams();
  const { state } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);
  const svc = state.services.find(s => s.name === name);

  const requestData = useMemo(() => svc ? makeDualData(svc.requestHistory, svc.errorHistory) : [], [svc]);
  const latencyData = useMemo(() => svc ? makeLatencyData(svc) : [], [svc]);
  const errorData = useMemo(() => svc ? makeChartData(svc.errorHistory) : [], [svc]);

  if (!svc) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Service not found. <button className="btn btn-ghost" onClick={() => navigate(toPath('/apm/services'))}>Back</button></div>;
  }

  const deps = svc.dependencies.map(id => state.services.find(s => s.id === id)).filter(Boolean);
  const upstreams = state.services.filter(s => s.dependencies.includes(svc.id));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>{svc.name}</h1>
        <span className={`type-badge ${svc.type}`}>{svc.type}</span>
        <span className="tag tag-sm">{svc.env}</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{svc.team}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span className={`status-dot ${svc.status}`} />
          <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{svc.status}</span>
        </span>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Requests/s', value: svc.requestsPerSec.toFixed(1), unit: '/s' },
          { label: 'Avg Latency', value: svc.avgLatencyMs.toFixed(1), unit: 'ms' },
          { label: 'Error Rate', value: svc.errorRate.toFixed(2), unit: '%', color: svc.errorRate > 5 ? 'var(--color-alert)' : undefined },
          { label: 'Apdex', value: svc.apdex.toFixed(2), unit: '' },
        ].map(card => (
          <div key={card.label} className="card" style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: card.color || 'var(--text-primary)' }}>
              {card.value}<span style={{ fontSize: 14, fontWeight: 500 }}>{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Graphs 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {/* Requests & Errors */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Requests & Errors</div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fontSize: 11, fill: '#6C6C80' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6C6C80' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip labelFormatter={formatTime} />
                <Area type="monotone" dataKey="requests" stroke="#7B68EE" fill="#7B68EE" fillOpacity={0.15} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="errors" stroke="#E74C3C" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Latency (p50/p95/p99)</div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fontSize: 11, fill: '#6C6C80' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6C6C80' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip labelFormatter={formatTime} />
                <Line type="monotone" dataKey="p50" stroke="#2ECC71" strokeWidth={1.5} dot={false} isAnimationActive={false} name="p50" />
                <Line type="monotone" dataKey="p95" stroke="#FF9800" strokeWidth={1.5} dot={false} isAnimationActive={false} name="p95" />
                <Line type="monotone" dataKey="p99" stroke="#E91E63" strokeWidth={1.5} dot={false} isAnimationActive={false} name="p99" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Error Rate */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Error Rate %</div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={errorData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fontSize: 11, fill: '#6C6C80' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6C6C80' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip labelFormatter={formatTime} />
                <Area type="monotone" dataKey="value" stroke="#E74C3C" fill="#E74C3C" fillOpacity={0.15} strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average time breakdown */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Time Breakdown</div>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fontSize: 11, fill: '#6C6C80' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6C6C80' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip labelFormatter={formatTime} />
                <Area type="monotone" dataKey="requests" stroke="#7B68EE" fill="#7B68EE" fillOpacity={0.15} strokeWidth={1.5} dot={false} isAnimationActive={false} name="App" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resources table */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Resources</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Resource</th>
              <th className="numeric">Requests/s</th>
              <th className="numeric">Avg Latency</th>
              <th className="numeric">P95 Latency</th>
              <th className="numeric">Error Rate</th>
            </tr>
          </thead>
          <tbody>
            {svc.resources.map((r, i) => (
              <tr key={i}>
                <td><strong>{r.name}</strong></td>
                <td className="numeric">{r.requestsPerSec.toFixed(1)}</td>
                <td className="numeric">{r.avgLatencyMs.toFixed(1)} ms</td>
                <td className="numeric">{r.p95LatencyMs.toFixed(1)} ms</td>
                <td className="numeric" style={{ color: r.errorRate > 5 ? 'var(--color-alert)' : 'inherit' }}>{r.errorRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dependencies */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Dependencies</h3>
        <div className="dep-graph">
          {upstreams.length > 0 && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upstreams.map(u => (
                  <div key={u.id} className={`dep-node ${u.status}`} onClick={() => navigate(toPath(`/apm/services/${u.name}`))} style={{ cursor: 'pointer' }}>
                    {u.name}
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{u.requestsPerSec.toFixed(0)} req/s</div>
                  </div>
                ))}
              </div>
              <span className="dep-arrow">{'\u2192'}</span>
            </>
          )}
          <div className={`dep-node ${svc.status}`} style={{ fontWeight: 700, borderWidth: 3 }}>
            {svc.name}
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{svc.requestsPerSec.toFixed(0)} req/s</div>
          </div>
          {deps.length > 0 && (
            <>
              <span className="dep-arrow">{'\u2192'}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {deps.map(d => (
                  <div key={d.id} className={`dep-node ${d.status}`} onClick={() => navigate(toPath(`/apm/services/${d.name}`))} style={{ cursor: 'pointer' }}>
                    {d.name}
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{d.requestsPerSec.toFixed(0)} req/s</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
