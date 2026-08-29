import React, { useState, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { withCurrentSearch } from '../utils/navigation';

function generateMonitorHistory(count = 60) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    time: now - (count - 1 - i) * 60000,
    value: Math.max(0, 50 + Math.sin(i / 8) * 30 + (Math.random() - 0.5) * 15),
  }));
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function MonitorDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const toPath = (path) => withCurrentSearch(path, location.search);
  const monitor = state.monitors.find(m => m.id === id);
  const [editingName, setEditingName] = useState(false);
  const [nameText, setNameText] = useState('');

  const chartData = useMemo(() => generateMonitorHistory(60), [id]);

  if (!monitor) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Monitor not found. <button className="btn btn-ghost" onClick={() => navigate(toPath('/monitors'))}>Back</button>
      </div>
    );
  }

  function startEdit() {
    setNameText(monitor.name);
    setEditingName(true);
  }

  function saveName() {
    if (nameText.trim()) {
      dispatch({ type: 'UPDATE_MONITOR', payload: { id: monitor.id, name: nameText.trim(), modified: new Date().toISOString() } });
    }
    setEditingName(false);
  }

  function handleDelete() {
    dispatch({ type: 'DELETE_MONITOR', payload: monitor.id });
    navigate(toPath('/monitors'));
  }

  function handleMute() {
    dispatch({ type: 'UPDATE_MONITOR', payload: { id: monitor.id, muted: !monitor.muted } });
  }

  const statusColor = monitor.status === 'OK' ? 'var(--color-ok)' :
    monitor.status === 'Alert' ? 'var(--color-alert)' :
    monitor.status === 'Warn' ? 'var(--color-warn)' : 'var(--color-nodata)';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <span className={`status-badge ${monitor.status.toLowerCase().replace(/\s/g, '-')}`} style={{ fontSize: 14, padding: '4px 14px' }}>
          {monitor.status}
        </span>
        {editingName ? (
          <input
            value={nameText}
            onChange={e => setNameText(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            autoFocus
            style={{ fontSize: 20, fontWeight: 600, border: '1px solid var(--color-brand)', borderRadius: 4, padding: '2px 8px', outline: 'none', flex: 1 }}
          />
        ) : (
          <h1 style={{ fontSize: 20, fontWeight: 600, cursor: 'pointer' }} onClick={startEdit}>{monitor.name}</h1>
        )}
        <span style={{ flex: 1 }} />
        <button className="btn btn-secondary btn-sm" onClick={startEdit}>Edit</button>
        <button className="btn btn-secondary btn-sm" onClick={handleMute}>{monitor.muted ? 'Unmute' : 'Mute'}</button>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
      </div>

      {/* Properties */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Properties</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px', fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Type</span>
          <span><span className={`type-badge ${monitor.type}`}>{monitor.type}</span></span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Query</span>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--content-bg)', padding: '4px 8px', borderRadius: 4, wordBreak: 'break-all' }}>{monitor.query}</code>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Creator</span>
          <span>{monitor.creator}</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Created</span>
          <span>{new Date(monitor.created).toLocaleDateString()}</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Modified</span>
          <span>{new Date(monitor.modified).toLocaleDateString()}</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Priority</span>
          <span>P{monitor.priority}</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Tags</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {monitor.tags.map(t => <span key={t} className="tag tag-sm">{t}</span>)}
          </div>
        </div>
      </div>

      {/* Status & History chart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Status & History</h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fontSize: 11, fill: '#6C6C80' }} axisLine={{ stroke: '#DCDCE0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6C6C80' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip labelFormatter={formatTime} />
              <ReferenceLine y={90} stroke="#E74C3C" strokeDasharray="5 5" label={{ value: 'Alert', fill: '#E74C3C', fontSize: 11 }} />
              <ReferenceLine y={70} stroke="#F39C12" strokeDasharray="5 5" label={{ value: 'Warn', fill: '#F39C12', fontSize: 11 }} />
              <Area type="monotone" dataKey="value" stroke={statusColor} fill={statusColor} fillOpacity={0.15} strokeWidth={2} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Status timeline bar */}
        <div style={{ display: 'flex', height: 20, borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
          {Array.from({ length: 24 }, (_, i) => {
            const colors = ['var(--color-ok)', 'var(--color-ok)', 'var(--color-ok)', 'var(--color-warn)', 'var(--color-ok)', 'var(--color-ok)', 'var(--color-alert)', 'var(--color-ok)'];
            return <div key={i} style={{ flex: 1, background: colors[i % colors.length] }} />;
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
          <span>24h ago</span><span>Now</span>
        </div>
      </div>

      {/* Group Status */}
      {monitor.groups && monitor.groups.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Group Status</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Group</th>
                <th>Status</th>
                <th>Last Triggered</th>
              </tr>
            </thead>
            <tbody>
              {monitor.groups.map((g, i) => (
                <tr key={i}>
                  <td style={{
                    borderLeft: `4px solid ${g.status === 'OK' ? 'var(--color-ok)' : g.status === 'Alert' ? 'var(--color-alert)' : g.status === 'Warn' ? 'var(--color-warn)' : 'var(--color-nodata)'}`
                  }}>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{g.name}</code>
                  </td>
                  <td>
                    <span className={`status-badge ${g.status.toLowerCase().replace(/\s/g, '-')}`}>{g.status}</span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {new Date(g.lastTriggeredAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notification */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Notification</h3>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--content-bg)', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap' }}>
          {monitor.message}
        </div>
      </div>
    </div>
  );
}
