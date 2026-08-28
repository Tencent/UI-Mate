import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const PATHS = ['/api/users', '/api/auth/login', '/dashboard', '/', '/api/data', '/static/bundle.js', '/api/settings', '/api/webhooks', '/api/projects', '/health'];
const STATUSES = [200, 200, 200, 200, 200, 201, 301, 404, 500];

function randomLog() {
  const method = METHODS[Math.floor(Math.random() * METHODS.length)];
  const path = PATHS[Math.floor(Math.random() * PATHS.length)];
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  const duration = Math.floor(Math.random() * 200) + 10;
  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.${String(now.getMilliseconds()).padStart(3,'0')}`;
  return { ts, method, path, status, duration };
}

function statusColor(s) {
  if (s < 300) return '#3fb950';
  if (s < 400) return '#58a6ff';
  if (s < 500) return '#d29922';
  return '#f85149';
}

function methodBg(m) {
  const map = { GET: '#238636', POST: '#1f6feb', PUT: '#9e6a03', DELETE: '#da3633', PATCH: '#8957e5' };
  return map[m] || '#484f58';
}

const INITIAL_LOGS = Array.from({ length: 30 }, randomLog);

export default function LogsPage() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [live, setLive] = useState(false);
  const [env, setEnv] = useState('production');
  const [level, setLevel] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!live) return;
    const interval = setInterval(() => {
      setLogs(prev => [randomLog(), ...prev].slice(0, 200));
    }, 2000);
    return () => clearInterval(interval);
  }, [live]);

  const filtered = logs.filter(l => {
    if (search && !l.path.includes(search) && !String(l.status).includes(search)) return false;
    if (level === 'error' && l.status < 500) return false;
    if (level === 'warning' && l.status < 400) return false;
    return true;
  });

  return (
    <div>
      <div style={{ padding: '12px 32px', display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <select value={env} onChange={e => setEnv(e.target.value)}>
          <option value="production">Production</option>
          <option value="preview">Preview</option>
        </select>
        <select value={level} onChange={e => setLevel(e.target.value)}>
          <option value="all">All Levels</option>
          <option value="error">Errors Only</option>
          <option value="warning">Warnings & Errors</option>
        </select>
        <input
          placeholder="Filter logs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <button
          className={`btn ${live ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setLive(l => !l)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {live ? <Pause size={13} /> : <Play size={13} />}
          {live ? 'Pause' : 'Live'}
        </button>
      </div>
      <div className="build-logs" style={{ maxHeight: 'calc(100vh - 200px)', margin: 0, borderRadius: 0 }}>
        {filtered.map((log, i) => (
          <div key={i} className="log-line" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            <span style={{ color: '#6e7681', minWidth: 85, flexShrink: 0 }}>{log.ts}</span>
            <span style={{
              background: methodBg(log.method), color: '#fff', padding: '1px 6px', borderRadius: 3,
              fontSize: 10, fontWeight: 600, minWidth: 50, textAlign: 'center', flexShrink: 0, lineHeight: '18px',
            }}>
              {log.method}
            </span>
            <span style={{ flex: 1, color: '#c9d1d9' }}>{log.path}</span>
            <span style={{ color: statusColor(log.status), minWidth: 35, flexShrink: 0, fontWeight: 500 }}>{log.status}</span>
            <span style={{ color: '#6e7681', minWidth: 55, textAlign: 'right', flexShrink: 0 }}>{log.duration}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}
