import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function LogExplorer() {
  const { state } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilters, setStatusFilters] = useState(new Set());
  const [serviceFilters, setServiceFilters] = useState(new Set());
  const [hostFilters, setHostFilters] = useState(new Set());
  const [sourceFilters, setSourceFilters] = useState(new Set());
  const [expandedLog, setExpandedLog] = useState(null);
  const [detailLog, setDetailLog] = useState(null);

  const allLogs = state.logs;

  const facets = useMemo(() => {
    const statusMap = {}, serviceMap = {}, hostMap = {}, sourceMap = {};
    for (const log of allLogs) {
      statusMap[log.status] = (statusMap[log.status] || 0) + 1;
      serviceMap[log.service] = (serviceMap[log.service] || 0) + 1;
      hostMap[log.host] = (hostMap[log.host] || 0) + 1;
      sourceMap[log.source] = (sourceMap[log.source] || 0) + 1;
    }
    return { status: statusMap, service: serviceMap, host: hostMap, source: sourceMap };
  }, [allLogs]);

  const filtered = useMemo(() => {
    let logs = allLogs;
    if (statusFilters.size > 0) logs = logs.filter(l => statusFilters.has(l.status));
    if (serviceFilters.size > 0) logs = logs.filter(l => serviceFilters.has(l.service));
    if (hostFilters.size > 0) logs = logs.filter(l => hostFilters.has(l.host));
    if (sourceFilters.size > 0) logs = logs.filter(l => sourceFilters.has(l.source));
    if (search) {
      const q = search.toLowerCase();
      const kvMatch = q.match(/(\w+):(\S+)/g);
      if (kvMatch) {
        for (const kv of kvMatch) {
          const [key, val] = kv.split(':');
          if (key === 'status') logs = logs.filter(l => l.status === val);
          else if (key === 'service') logs = logs.filter(l => l.service === val);
          else if (key === 'host') logs = logs.filter(l => l.host.includes(val));
          else logs = logs.filter(l => l.message.toLowerCase().includes(val));
        }
        const textPart = q.replace(/\w+:\S+/g, '').trim();
        if (textPart) logs = logs.filter(l => l.message.toLowerCase().includes(textPart));
      } else {
        logs = logs.filter(l => l.message.toLowerCase().includes(q));
      }
    }
    return logs;
  }, [allLogs, search, statusFilters, serviceFilters, hostFilters, sourceFilters]);

  const barData = useMemo(() => {
    const buckets = {};
    for (const log of filtered) {
      const t = new Date(log.timestamp);
      const key = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
      if (!buckets[key]) buckets[key] = { time: key, count: 0, errorCount: 0 };
      buckets[key].count++;
      if (log.status === 'error' || log.status === 'critical') buckets[key].errorCount++;
    }
    return Object.values(buckets).sort((a, b) => a.time.localeCompare(b.time));
  }, [filtered]);

  function toggleFilter(setter, val) {
    setter(prev => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  }

  function formatTimestamp(iso) {
    const d = new Date(iso);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}.${String(d.getMilliseconds()).padStart(3,'0')}`;
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 96px)', margin: '-24px', overflow: 'hidden' }}>
      {/* Facet panel */}
      <div className="facet-panel">
        <div className="facet-section">
          <h4>Status</h4>
          {Object.entries(facets.status).sort().map(([s, count]) => (
            <label key={s} className="facet-item">
              <input type="checkbox" checked={statusFilters.has(s)} onChange={() => toggleFilter(setStatusFilters, s)} />
              <span className={`log-status ${s}`}>{s}</span>
              <span className="facet-count">{count}</span>
            </label>
          ))}
        </div>
        <div className="facet-section">
          <h4>Service</h4>
          {Object.entries(facets.service).sort().map(([svc, count]) => (
            <label key={svc} className="facet-item">
              <input type="checkbox" checked={serviceFilters.has(svc)} onChange={() => toggleFilter(setServiceFilters, svc)} />
              <span>{svc}</span>
              <span className="facet-count">{count}</span>
            </label>
          ))}
        </div>
        <div className="facet-section">
          <h4>Host</h4>
          {Object.entries(facets.host).sort().map(([host, count]) => (
            <label key={host} className="facet-item">
              <input type="checkbox" checked={hostFilters.has(host)} onChange={() => toggleFilter(setHostFilters, host)} />
              <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{host}</span>
              <span className="facet-count">{count}</span>
            </label>
          ))}
        </div>
        <div className="facet-section">
          <h4>Source</h4>
          {Object.entries(facets.source).sort().map(([src, count]) => (
            <label key={src} className="facet-item">
              <input type="checkbox" checked={sourceFilters.has(src)} onChange={() => toggleFilter(setSourceFilters, src)} />
              <span>{src}</span>
              <span className="facet-count">{count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
          <input className="search-input search-input-mono" placeholder='Search logs (e.g., status:error service:web-store)' value={search} onChange={e => setSearch(e.target.value)} style={{ height: 40 }} />
        </div>

        <div style={{ height: 100, padding: '8px 16px', borderBottom: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6C6C80' }} tickLine={false} axisLine={false} />
              <YAxis tick={false} axisLine={false} width={0} />
              <Tooltip />
              <Bar dataKey="count" isAnimationActive={false}>
                {barData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.errorCount > entry.count * 0.3 ? 'var(--color-alert)' : entry.errorCount > 0 ? 'var(--color-warn)' : 'var(--color-ok)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, overflow: 'auto', background: 'var(--card-bg)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
            {filtered.length} logs
          </div>
          {filtered.map(log => (
            <div key={log.id}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', height: 36, borderBottom: '1px solid #f8f8f8', cursor: 'pointer', fontSize: 13, background: expandedLog === log.id ? '#F5F5FF' : 'transparent' }}
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                onDoubleClick={() => setDetailLog(log)}
              >
                <span style={{ fontSize: 10, color: 'var(--text-secondary)', flexShrink: 0 }}>{expandedLog === log.id ? '\u25BE' : '\u25B8'}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0, width: 160 }}>{formatTimestamp(log.timestamp)}</span>
                <span className={`log-status ${log.status}`}>{log.status}</span>
                <strong style={{ fontSize: 13, flexShrink: 0 }}>{log.service}</strong>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}>{log.host}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.message}</span>
              </div>
              {expandedLog === log.id && (
                <div style={{ padding: '8px 16px 12px 36px', background: '#FAFAFA', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{log.message}</div>
                  <table style={{ fontSize: 12 }}>
                    <tbody>
                      <tr><td style={{ color: 'var(--text-secondary)', paddingRight: 16 }}>service</td><td>{log.service}</td></tr>
                      <tr><td style={{ color: 'var(--text-secondary)', paddingRight: 16 }}>host</td><td>{log.host}</td></tr>
                      <tr><td style={{ color: 'var(--text-secondary)', paddingRight: 16 }}>source</td><td>{log.source}</td></tr>
                      <tr><td style={{ color: 'var(--text-secondary)', paddingRight: 16 }}>status</td><td>{log.status}</td></tr>
                      {Object.entries(log.attributes).map(([k, v]) => (
                        <tr key={k}><td style={{ color: 'var(--text-secondary)', paddingRight: 16 }}>{k}</td><td>{String(v)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>{log.tags.map(t => <span key={t} className="tag tag-sm">{t}</span>)}</div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No logs match your filters.</div>}
        </div>
      </div>

      {detailLog && (
        <div className="side-panel" style={{ width: 480 }}>
          <div className="side-panel-header">
            <h3>Log Detail</h3>
            <button className="close-btn" onClick={() => setDetailLog(null)}>{'\u2715'}</button>
          </div>
          <div className="side-panel-body">
            <div style={{ marginBottom: 16 }}>
              <span className={`log-status ${detailLog.status}`} style={{ marginRight: 8 }}>{detailLog.status}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{formatTimestamp(detailLog.timestamp)}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--content-bg)', padding: 12, borderRadius: 6, marginBottom: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{detailLog.message}</div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Attributes</h4>
            <table className="data-table" style={{ fontSize: 12, marginBottom: 16 }}>
              <tbody>
                <tr><td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>service</td><td>{detailLog.service}</td></tr>
                <tr><td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>host</td><td>{detailLog.host}</td></tr>
                <tr><td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>source</td><td>{detailLog.source}</td></tr>
                {Object.entries(detailLog.attributes).map(([k, v]) => (
                  <tr key={k}><td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{k}</td><td>{String(v)}</td></tr>
                ))}
              </tbody>
            </table>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Tags</h4>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{detailLog.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
