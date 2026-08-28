import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';

const MONITOR_TYPES = [
  { id: 'metric', icon: '\u{1F4C8}', title: 'Metric', desc: 'Alert on a metric threshold' },
  { id: 'apm', icon: '\u{1F50E}', title: 'APM', desc: 'Alert on APM service metrics' },
  { id: 'log', icon: '\u{1F4CB}', title: 'Log', desc: 'Alert on log patterns' },
  { id: 'host', icon: '\u{1F5A5}', title: 'Host', desc: 'Alert when hosts stop reporting' },
  { id: 'process', icon: '\u{2699}', title: 'Process', desc: 'Alert on process status' },
  { id: 'composite', icon: '\u{1F517}', title: 'Composite', desc: 'Combine multiple monitors' },
];

const METRICS = [
  'system.cpu.user', 'system.mem.used', 'system.disk.in_use', 'system.disk.used',
  'system.net.bytes_rcvd', 'system.net.bytes_sent', 'system.load.15',
  'trace.web.request.hits', 'trace.web.request.errors', 'trace.web.request.duration',
  'nginx.net.request_per_s', 'postgresql.connections', 'redis.mem.used',
];

const WINDOWS = ['Last 5 minutes', 'Last 15 minutes', 'Last 1 hour', 'Last 4 hours'];

export default function CreateMonitor() {
  const { dispatch, state } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [monitorType, setMonitorType] = useState('metric');
  const [metric, setMetric] = useState(METRICS[0]);
  const [fromTag, setFromTag] = useState('');
  const [aggregation, setAggregation] = useState('avg');
  const [alertThreshold, setAlertThreshold] = useState(90);
  const [warnThreshold, setWarnThreshold] = useState(70);
  const [evalWindow, setEvalWindow] = useState(WINDOWS[0]);
  const [condition, setCondition] = useState('above');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState(3);
  const [createError, setCreateError] = useState('');

  function handleCreate() {
    if (!name.trim()) {
      setCreateError('Enter a monitor name before creating it.');
      return;
    }
    const id = 'mon-' + Date.now();
    const fromStr = fromTag ? `{${fromTag}}` : '{*}';
    const query = `${aggregation}(last_5m):${aggregation}:${metric}${fromStr} ${condition === 'above' ? '>' : '<'} ${alertThreshold}`;
    const newMonitor = {
      id, name: name.trim(), type: monitorType, status: 'No Data', query,
      message: message.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      priority, creator: state.currentUser.email,
      created: new Date().toISOString(), modified: new Date().toISOString(),
      muted: false, overallState: 'No Data', groups: [],
    };
    dispatch({ type: 'ADD_MONITOR', payload: newMonitor });
    setCreateError('');
    navigate(withCurrentSearch(`/monitors/${id}`, location.search));
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Create Monitor</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>1. Choose monitor type</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {MONITOR_TYPES.map(t => (
            <div key={t.id} className={`step-card${monitorType === t.id ? ' selected' : ''}`} onClick={() => setMonitorType(t.id)}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>2. Define the metric</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label>Metric</label>
            <select value={metric} onChange={e => setMetric(e.target.value)}>
              {METRICS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ width: 160 }}>
            <label>from</label>
            <input value={fromTag} onChange={e => setFromTag(e.target.value)} placeholder="env:production" />
          </div>
          <div className="form-group" style={{ width: 100 }}>
            <label>Aggregation</label>
            <select value={aggregation} onChange={e => setAggregation(e.target.value)}>
              {['avg', 'sum', 'min', 'max', 'count'].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>3. Set conditions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ width: 130 }}>
            <label>Condition</label>
            <select value={condition} onChange={e => setCondition(e.target.value)}>
              <option value="above">above</option>
              <option value="below">below</option>
            </select>
          </div>
          <div className="form-group" style={{ width: 130 }}>
            <label>Alert threshold</label>
            <input type="number" value={alertThreshold} onChange={e => setAlertThreshold(Number(e.target.value))} />
          </div>
          <div className="form-group" style={{ width: 130 }}>
            <label>Warning threshold</label>
            <input type="number" value={warnThreshold} onChange={e => setWarnThreshold(Number(e.target.value))} />
          </div>
          <div className="form-group" style={{ width: 180 }}>
            <label>Evaluation window</label>
            <select value={evalWindow} onChange={e => setEvalWindow(e.target.value)}>
              {WINDOWS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>4. Notify your team</h3>
        <div className="form-group">
          <label>Monitor name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., High CPU on production hosts" />
        </div>
        <div className="form-group">
          <label>Notification message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe the alert and who to notify..." />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Tags (comma-separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="env:production, team:platform" />
          </div>
          <div className="form-group" style={{ width: 100 }}>
            <label>Priority</label>
            <select value={priority} onChange={e => setPriority(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>P{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        {createError && <span style={{ color: 'var(--color-alert)', fontSize: 12, marginRight: 'auto' }}>{createError}</span>}
        <button className="btn btn-ghost" onClick={() => navigate(withCurrentSearch('/monitors', location.search))}>Cancel</button>
        <button className="btn btn-primary" onClick={handleCreate}>Create Monitor</button>
      </div>
    </div>
  );
}
