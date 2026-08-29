import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Download } from 'lucide-react';

function LevelBadge({ level }) {
  const styles = {
    INFO: { background: 'rgba(131,179,247,0.15)', color: 'var(--accent-blue)' },
    WARNING: { background: 'rgba(229,164,68,0.15)', color: 'var(--warning-amber)' },
    ERROR: { background: 'rgba(229,83,75,0.15)', color: 'var(--error-red)' },
  };
  const s = styles[level] || styles.INFO;
  return (
    <span style={{ ...s, padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
      {level}
    </span>
  );
}

export default function RunLogs() {
  const { runId } = useParams();
  const { state } = useApp();
  const run = state.runs.find(r => r.id === runId);
  const [search, setSearch] = useState('');
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView();
  }, [run]);

  if (!run) return null;

  const logs = run.logs || [];
  const filtered = search
    ? logs.filter(l => l.message.toLowerCase().includes(search.toLowerCase()))
    : logs;

  const handleDownload = () => {
    const content = logs.map(l => `${l.timestamp} [${l.level}] ${l.message}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${run.name}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const highlightMatch = (text) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase()
        ? <mark key={i} style={{ background: 'rgba(245,197,24,0.3)', color: 'inherit', borderRadius: 2, padding: '0 1px' }}>{part}</mark>
        : part
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ width: '100%', paddingLeft: 30 }}
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-secondary flex items-center gap-2" onClick={handleDownload}>
          <Download size={14} /> Download
        </button>
      </div>
      <div className="log-viewer">
        {filtered.map((log, i) => (
          <div key={i} className="log-line">
            <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
            <LevelBadge level={log.level} />
            <span className="log-message">{highlightMatch(log.message)}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
