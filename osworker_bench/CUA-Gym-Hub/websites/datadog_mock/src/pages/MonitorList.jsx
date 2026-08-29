import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';

const STATUS_TABS = ['All', 'Alert', 'Warn', 'No Data', 'OK', 'Muted'];

export default function MonitorList() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());

  const statusCounts = useMemo(() => {
    const counts = { All: state.monitors.length };
    for (const m of state.monitors) {
      counts[m.status] = (counts[m.status] || 0) + 1;
      if (m.muted) counts['Muted'] = (counts['Muted'] || 0) + 1;
    }
    return counts;
  }, [state.monitors]);

  const filtered = useMemo(() => {
    let monitors = state.monitors;
    if (activeTab !== 'All') {
      if (activeTab === 'Muted') {
        monitors = monitors.filter(m => m.muted);
      } else {
        monitors = monitors.filter(m => m.status === activeTab);
      }
    }
    if (search) {
      const q = search.toLowerCase();
      monitors = monitors.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return monitors;
  }, [state.monitors, activeTab, search]);

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function bulkDelete() {
    for (const id of selected) {
      dispatch({ type: 'DELETE_MONITOR', payload: id });
    }
    setSelected(new Set());
  }

  function bulkMute() {
    for (const id of selected) {
      dispatch({ type: 'UPDATE_MONITOR', payload: { id, muted: true } });
    }
    setSelected(new Set());
  }

  function deleteMonitor(e, id) {
    e.stopPropagation();
    dispatch({ type: 'DELETE_MONITOR', payload: id });
  }

  function muteMonitor(e, id) {
    e.stopPropagation();
    const m = state.monitors.find(mon => mon.id === id);
    dispatch({ type: 'UPDATE_MONITOR', payload: { id, muted: !m.muted } });
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    return 'just now';
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Manage Monitors</h1>
        <button className="btn btn-success" onClick={() => navigate(toPath('/monitors/new'))}>+ New Monitor</button>
      </div>

      <div className="tabs">
        {STATUS_TABS.map(tab => (
          <button key={tab} className={`tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
            {statusCounts[tab] !== undefined && (
              <span className={`tab-badge ${tab.toLowerCase().replace(/\s/g, '')}`}>
                {statusCounts[tab] || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      <input
        className="search-input"
        placeholder="Search monitors by name or tag..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      {selected.size > 0 && (
        <div className="bulk-bar">
          <span style={{ fontWeight: 600 }}>{selected.size} selected</span>
          <button className="btn btn-sm btn-secondary" onClick={bulkMute}>Mute</button>
          <button className="btn btn-sm btn-danger" onClick={bulkDelete}>Delete</button>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        {filtered.map(m => (
          <div key={m.id} className="monitor-row" onClick={() => navigate(toPath(`/monitors/${m.id}`))}>
            <div className={`monitor-status-bar`} style={{
              backgroundColor: m.status === 'OK' ? 'var(--color-ok)' : m.status === 'Alert' ? 'var(--color-alert)' : m.status === 'Warn' ? 'var(--color-warn)' : 'var(--color-nodata)'
            }} />
            <input
              type="checkbox"
              checked={selected.has(m.id)}
              onChange={() => toggleSelect(m.id)}
              onClick={e => e.stopPropagation()}
              style={{ accentColor: 'var(--color-brand)' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{m.name}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`type-badge ${m.type}`}>{m.type}</span>
                {m.tags.map(t => <span key={t} className="tag tag-sm">{t}</span>)}
                {m.muted && <span className="tag tag-sm" style={{ background: '#f0f0f0', color: '#666' }}>Muted</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div className="user-avatar" style={{ width: 24, height: 24, fontSize: 9 }}>
                {m.creator.split('@')[0].split('.').map(n => n[0].toUpperCase()).join('')}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 80 }}>Created {timeAgo(m.created)}</span>
              <span className={`status-badge ${m.status.toLowerCase().replace(/\s/g, '-')}`}>{m.status}</span>
              <div style={{ display: 'flex', gap: 4, opacity: 0 }} className="monitor-actions">
                <button className="btn btn-ghost btn-sm" onClick={e => muteMonitor(e, m.id)} title="Mute">{m.muted ? '\u{1F508}' : '\u{1F507}'}</button>
                <button className="btn btn-ghost btn-sm" onClick={e => deleteMonitor(e, m.id)} title="Delete">{'\u{1F5D1}'}</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No monitors found.</div>
        )}
      </div>

      <style>{`
        .monitor-row:hover .monitor-actions { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
