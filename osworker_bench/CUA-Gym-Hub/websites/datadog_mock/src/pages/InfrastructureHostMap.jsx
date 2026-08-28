import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

function getHeatColor(val, metric) {
  const max = metric === 'cpu' ? 100 : 100;
  const pct = Math.min(val / max, 1);
  if (pct > 0.8) return '#E74C3C';
  if (pct > 0.6) return '#F39C12';
  if (pct > 0.4) return '#F1C40F';
  if (pct > 0.2) return '#2ECC71';
  return '#27AE60';
}

export default function InfrastructureHostMap() {
  const { state } = useAppContext();
  const [colorBy, setColorBy] = useState('cpu');
  const [groupBy, setGroupBy] = useState('none');
  const [search, setSearch] = useState('');
  const [hoveredHost, setHoveredHost] = useState(null);

  const activeHosts = useMemo(() => {
    let hosts = state.hosts.filter(h => h.status === 'active');
    if (search) {
      const q = search.toLowerCase();
      hosts = hosts.filter(h => h.hostname.toLowerCase().includes(q) || h.tags.some(t => t.toLowerCase().includes(q)));
    }
    return hosts;
  }, [state.hosts, search]);

  const grouped = useMemo(() => {
    if (groupBy === 'none') return { 'All Hosts': activeHosts };
    const groups = {};
    for (const h of activeHosts) {
      let key = 'Other';
      if (groupBy === 'region') key = `${h.cloudProvider} ${h.region}`;
      else if (groupBy === 'service') {
        const svcTag = h.tags.find(t => t.startsWith('service:'));
        key = svcTag ? svcTag.split(':')[1] : 'untagged';
      } else if (groupBy === 'env') {
        const envTag = h.tags.find(t => t.startsWith('env:'));
        key = envTag ? envTag.split(':')[1] : 'untagged';
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(h);
    }
    return groups;
  }, [activeHosts, groupBy]);

  function getVal(h) {
    if (colorBy === 'cpu') return h.cpu;
    if (colorBy === 'memory') return h.memory;
    if (colorBy === 'load15') return Math.min(h.load15 / 6 * 100, 100);
    return h.cpu;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Host Map</h1>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="search-input" placeholder="Filter hosts..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Color by:</span>
          <select value={colorBy} onChange={e => setColorBy(e.target.value)} style={{ padding: '4px 8px', border: '1px solid var(--card-border)', borderRadius: 4, fontSize: 13 }}>
            <option value="cpu">CPU %</option>
            <option value="memory">Memory %</option>
            <option value="load15">Load 15</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Group by:</span>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)} style={{ padding: '4px 8px', border: '1px solid var(--card-border)', borderRadius: 4, fontSize: 13 }}>
            <option value="none">Nothing</option>
            <option value="region">Region</option>
            <option value="service">Service</option>
            <option value="env">Environment</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span>{activeHosts.length} hosts</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>Low</span>
          {['#27AE60', '#2ECC71', '#F1C40F', '#F39C12', '#E74C3C'].map(c => (
            <div key={c} style={{ width: 20, height: 10, background: c, borderRadius: 2 }} />
          ))}
          <span>High</span>
        </div>
      </div>

      {Object.entries(grouped).map(([group, hosts]) => (
        <div key={group} style={{ marginBottom: 24 }}>
          {groupBy !== 'none' && (
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              {group}
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 400 }}>{hosts.length} hosts</span>
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {hosts.map(h => {
              const val = getVal(h);
              const isHovered = hoveredHost === h.id;
              return (
                <div
                  key={h.id}
                  style={{
                    width: 48, height: 48,
                    background: getHeatColor(val, colorBy),
                    borderRadius: 4,
                    cursor: 'pointer',
                    border: isHovered ? '2px solid #23232F' : '2px solid transparent',
                    transition: 'transform 0.1s',
                    transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={() => setHoveredHost(h.id)}
                  onMouseLeave={() => setHoveredHost(null)}
                  title={`${h.hostname}\nCPU: ${h.cpu.toFixed(1)}%\nMemory: ${h.memory.toFixed(1)}%\nLoad: ${h.load15.toFixed(2)}`}
                >
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.9)', fontWeight: 700, textAlign: 'center', lineHeight: 1.1, padding: 2, overflow: 'hidden' }}>
                    {h.hostname.split('-').slice(0, 2).join('-')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Hover detail */}
      {hoveredHost && (() => {
        const h = state.hosts.find(x => x.id === hoveredHost);
        if (!h) return null;
        return (
          <div style={{
            position: 'fixed', bottom: 20, right: 20, background: 'white', border: '1px solid var(--card-border)',
            borderRadius: 8, padding: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: 280, zIndex: 50,
          }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{h.hostname}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px 8px', fontSize: 12 }}>
              <span style={{ color: 'var(--text-secondary)' }}>CPU:</span><span>{h.cpu.toFixed(1)}%</span>
              <span style={{ color: 'var(--text-secondary)' }}>Memory:</span><span>{h.memory.toFixed(1)}%</span>
              <span style={{ color: 'var(--text-secondary)' }}>Load 15:</span><span>{h.load15.toFixed(2)}</span>
              <span style={{ color: 'var(--text-secondary)' }}>IO Wait:</span><span>{h.ioWait.toFixed(1)}</span>
              <span style={{ color: 'var(--text-secondary)' }}>Region:</span><span>{h.cloudProvider} {h.region}</span>
              <span style={{ color: 'var(--text-secondary)' }}>Instance:</span><span>{h.instanceType}</span>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {h.apps.map(a => <span key={a} className="tag tag-sm">{a}</span>)}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
