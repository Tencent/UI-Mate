import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function InfrastructureHosts() {
  const { state } = useAppContext();
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState('all');
  const [sortCol, setSortCol] = useState('hostname');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedHost, setSelectedHost] = useState(null);

  const filtered = useMemo(() => {
    let hosts = state.hosts;
    if (search) {
      const q = search.toLowerCase();
      hosts = hosts.filter(h =>
        h.hostname.toLowerCase().includes(q) ||
        h.tags.some(t => t.toLowerCase().includes(q)) ||
        h.cloudProvider.toLowerCase().includes(q)
      );
    }
    if (envFilter !== 'all') {
      hosts = hosts.filter(h => h.tags.some(t => t === `env:${envFilter}`));
    }
    hosts = [...hosts].sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return hosts;
  }, [state.hosts, search, envFilter, sortCol, sortDir]);

  function toggleSort(col) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }

  function sortIndicator(col) {
    if (sortCol !== col) return '';
    return sortDir === 'asc' ? ' \u25B2' : ' \u25BC';
  }

  function getBarColor(val) {
    if (val > 80) return 'var(--color-alert)';
    if (val > 50) return 'var(--color-warn)';
    return 'var(--color-ok)';
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  const host = selectedHost ? state.hosts.find(h => h.id === selectedHost) : null;

  function makeChartData(arr) {
    const now = Date.now();
    return arr.map((v, i) => ({ time: now - (arr.length - 1 - i) * 60000, value: v }));
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Infrastructure</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>All hosts reporting to your infrastructure in the past 1 hour</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          className="search-input"
          placeholder="Search hosts by name, tag, or metadata..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          value={envFilter}
          onChange={e => setEnvFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: 6, fontSize: 14 }}
        >
          <option value="all">All Environments</option>
          <option value="production">production</option>
          <option value="staging">staging</option>
        </select>
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
        Showing {filtered.length} hosts
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('hostname')}>Hostname{sortIndicator('hostname')}</th>
              <th onClick={() => toggleSort('status')}>Status{sortIndicator('status')}</th>
              <th onClick={() => toggleSort('cpu')} className="numeric">CPU %{sortIndicator('cpu')}</th>
              <th onClick={() => toggleSort('memory')} className="numeric">Memory %{sortIndicator('memory')}</th>
              <th onClick={() => toggleSort('ioWait')} className="numeric">IO Wait{sortIndicator('ioWait')}</th>
              <th onClick={() => toggleSort('load15')} className="numeric">Load 15{sortIndicator('load15')}</th>
              <th>Apps</th>
              <th>Cloud</th>
              <th>Agent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(h => (
              <tr key={h.id} style={{ height: 44, cursor: 'pointer' }} onClick={() => setSelectedHost(h.id)}>
                <td><strong style={{ color: 'var(--color-brand)' }}>{h.hostname}</strong></td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span className={`status-dot ${h.status}`} />
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{h.status}</span>
                  </span>
                </td>
                <td className="numeric">
                  <div className="mini-bar">
                    <span>{h.cpu.toFixed(1)}</span>
                    <div className="mini-bar-track">
                      <div className="mini-bar-fill" style={{ width: `${h.cpu}%`, background: getBarColor(h.cpu) }} />
                    </div>
                  </div>
                </td>
                <td className="numeric">
                  <div className="mini-bar">
                    <span>{h.memory.toFixed(1)}</span>
                    <div className="mini-bar-track">
                      <div className="mini-bar-fill" style={{ width: `${h.memory}%`, background: getBarColor(h.memory) }} />
                    </div>
                  </div>
                </td>
                <td className="numeric">{h.ioWait.toFixed(1)}</td>
                <td className="numeric">{h.load15.toFixed(2)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {h.apps.map(a => <span key={a} className="tag tag-sm">{a}</span>)}
                  </div>
                </td>
                <td style={{ fontSize: 12 }}>{h.cloudProvider} {h.region}</td>
                <td style={{ fontSize: 12 }}>{h.agentVersion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Host detail side panel */}
      {host && (
        <div className="side-panel">
          <div className="side-panel-header">
            <h3>{host.hostname}</h3>
            <button className="close-btn" onClick={() => setSelectedHost(null)}>{'\u2715'}</button>
          </div>
          <div className="side-panel-body">
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Tags</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {host.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>System Metrics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'CPU %', data: host.metrics.cpuHistory, color: '#7B68EE' },
                  { label: 'Memory %', data: host.metrics.memoryHistory, color: '#00BCD4' },
                  { label: 'Network In', data: host.metrics.networkInHistory, color: '#FF9800' },
                  { label: 'Network Out', data: host.metrics.networkOutHistory, color: '#E91E63' },
                ].map(metric => (
                  <div key={metric.label} style={{ border: '1px solid var(--card-border)', borderRadius: 6, padding: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{metric.label}</div>
                    <ResponsiveContainer width="100%" height={100}>
                      <AreaChart data={makeChartData(metric.data)} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                        <XAxis dataKey="time" tick={false} axisLine={false} />
                        <YAxis tick={false} axisLine={false} width={0} />
                        <Tooltip labelFormatter={formatTime} formatter={v => [v.toFixed(2)]} />
                        <Area type="monotone" dataKey="value" stroke={metric.color} fill={metric.color} fillOpacity={0.15} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Installed Apps</h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {host.apps.map(a => <span key={a} className="tag">{a}</span>)}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Recent Logs</h4>
              {state.logs.filter(l => l.host === host.hostname).slice(0, 10).map(log => (
                <div key={log.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', flexShrink: 0, width: 65 }}>
                    {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                  <span className={`log-status ${log.status}`}>{log.status}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.message}</span>
                </div>
              ))}
              {state.logs.filter(l => l.host === host.hostname).length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No recent logs</p>
              )}
            </div>

            <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div>OS: {host.os}</div>
              <div>Instance: {host.instanceType}</div>
              <div>Agent: {host.agentVersion}</div>
              <div>Created: {new Date(host.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
