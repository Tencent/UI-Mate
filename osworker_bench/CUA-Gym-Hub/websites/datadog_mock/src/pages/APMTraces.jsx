import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

export default function APMTraces() {
  const { state } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedTrace, setExpandedTrace] = useState(null);

  const traces = state.traces || [];

  const filtered = useMemo(() => {
    let t = traces;
    if (statusFilter !== 'all') t = t.filter(tr => tr.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      t = t.filter(tr => tr.rootResource.toLowerCase().includes(q) || tr.rootService.toLowerCase().includes(q));
    }
    return t;
  }, [traces, search, statusFilter]);

  function formatDuration(ms) {
    if (ms < 1) return `${(ms * 1000).toFixed(0)}us`;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  function formatTime(iso) {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  const SERVICE_COLORS = {
    'api-gateway': '#632CA6',
    'web-store': '#1a73e8',
    'product-api': '#0d652d',
    'payment-service': '#c17d10',
    'user-service': '#00BCD4',
    'redis-cache': '#E91E63',
    'postgres-main': '#FF9800',
    'postgres-users': '#F39C12',
    'stripe-api': '#7B68EE',
    'kafka-cluster': '#2ECC71',
    'analytics-worker': '#95A5A6',
    'ml-inference': '#E74C3C',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Traces</h1>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{filtered.length} traces</span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input className="search-input search-input-mono" placeholder="Search traces by service or resource..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: 6, fontSize: 14 }}>
          <option value="all">All</option>
          <option value="ok">OK</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {filtered.map(trace => (
          <div key={trace.id}>
            <div
              className="card"
              style={{
                padding: '12px 16px', cursor: 'pointer', borderRadius: expandedTrace === trace.id ? '8px 8px 0 0' : 8,
                borderColor: trace.status === 'error' ? '#fde8e8' : undefined,
                borderLeft: `4px solid ${trace.status === 'error' ? 'var(--color-alert)' : 'var(--color-ok)'}`,
              }}
              onClick={() => setExpandedTrace(expandedTrace === trace.id ? null : trace.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 10 }}>{expandedTrace === trace.id ? '\u25BE' : '\u25B8'}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', width: 65 }}>{formatTime(trace.startTime)}</span>
                <span className={`type-badge ${trace.rootService === 'web-store' ? 'web' : trace.rootService.includes('api') ? 'web' : 'custom'}`}>
                  {trace.rootService}
                </span>
                <strong style={{ fontSize: 13, flex: 1 }}>{trace.rootResource}</strong>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: trace.duration > 200 ? 'var(--color-alert)' : trace.duration > 50 ? 'var(--color-warn)' : 'var(--text-primary)' }}>
                  {formatDuration(trace.duration)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{trace.spans.length} spans</span>
              </div>
            </div>

            {expandedTrace === trace.id && (
              <div className="card" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none', padding: '16px', background: '#FAFAFA' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Trace ID: <code style={{ fontFamily: 'var(--font-mono)' }}>{trace.traceId}</code>
                </div>

                {/* Flame graph */}
                <div style={{ position: 'relative', minHeight: trace.spans.length * 28 + 8, marginBottom: 16 }}>
                  {trace.spans.map((span, idx) => {
                    const totalDuration = trace.duration;
                    const leftPct = (span.start / totalDuration) * 100;
                    const widthPct = Math.max((span.duration / totalDuration) * 100, 2);
                    const depth = span.parentId ? (span.parentId === trace.spans[0]?.id ? 1 : 2) : 0;

                    return (
                      <div
                        key={span.id}
                        style={{
                          position: 'absolute',
                          top: idx * 28,
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          minWidth: 40,
                          height: 24,
                          background: span.error ? '#fde8e8' : (SERVICE_COLORS[span.service] || '#7B68EE'),
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 6px',
                          fontSize: 10,
                          color: span.error ? '#E74C3C' : 'white',
                          fontWeight: 600,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          border: span.error ? '1px solid #E74C3C' : 'none',
                          cursor: 'default',
                        }}
                        title={`${span.service} - ${span.resource}\n${formatDuration(span.duration)}${span.error ? '\nERROR' : ''}`}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {span.service} {span.resource} ({formatDuration(span.duration)})
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Span list */}
                <table className="data-table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Resource</th>
                      <th>Type</th>
                      <th className="numeric">Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trace.spans.map(span => (
                      <tr key={span.id}>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: SERVICE_COLORS[span.service] || '#7B68EE', flexShrink: 0 }} />
                            {span.service}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{span.resource}</td>
                        <td><span className="tag tag-sm">{span.type}</span></td>
                        <td className="numeric" style={{ fontFamily: 'var(--font-mono)' }}>{formatDuration(span.duration)}</td>
                        <td>
                          {span.error ? (
                            <span className="status-badge alert" style={{ fontSize: 10 }}>Error</span>
                          ) : (
                            <span className="status-badge ok" style={{ fontSize: 10 }}>OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No traces found.</div>
      )}
    </div>
  );
}
