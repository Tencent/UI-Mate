import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, Activity, Globe, Settings, Puzzle, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { frameworkLabel } from '../utils/helpers';

const PAGE_RESULTS = [
  { title: 'Overview', path: '/', icon: LayoutGrid },
  { title: 'Activity', path: '/activity', icon: Activity },
  { title: 'Domains', path: '/domains', icon: Globe },
  { title: 'Usage', path: '/usage', icon: BarChart2 },
  { title: 'Integrations', path: '/integrations', icon: Puzzle },
  { title: 'Settings', path: '/settings', icon: Settings },
];

export default function CommandPalette({ onClose }) {
  const { state } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const projectResults = state.projects
    .filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase()))
    .map(p => ({
      title: p.name,
      path: `/project/${p.id}/overview`,
      description: frameworkLabel(p.framework),
    }));

  const pageResults = PAGE_RESULTS.filter(p =>
    !query || p.title.toLowerCase().includes(query.toLowerCase())
  );

  const allResults = [...projectResults, ...pageResults];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && allResults[selected]) {
      navigate(allResults[selected].path);
      onClose();
    }
  };

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-palette-input-wrap">
          <Search size={18} color="var(--fg-muted)" />
          <input
            ref={inputRef}
            className="command-palette-input"
            placeholder="Search projects and pages..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
          />
          <span style={{ fontSize: 12, color: 'var(--fg-muted)', background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }} onClick={onClose}>
            ESC
          </span>
        </div>
        <div className="command-palette-results">
          {allResults.length === 0 && (
            <div style={{ padding: '20px 16px', color: 'var(--fg-muted)', fontSize: 14 }}>
              No results found
            </div>
          )}
          {projectResults.length > 0 && (
            <>
              <div style={{ padding: '8px 16px 4px', fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Projects
              </div>
              {projectResults.map((r, i) => (
                <div
                  key={r.path}
                  className={`command-result-item${selected === i ? ' selected' : ''}`}
                  onClick={() => { navigate(r.path); onClose(); }}
                >
                  <div style={{ width: 20, height: 20, background: 'var(--bg-hover)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--fg-secondary)' }}>
                    ▲
                  </div>
                  <span className="command-result-title">{r.title}</span>
                  <span className="command-result-path">{r.description}</span>
                </div>
              ))}
            </>
          )}
          {pageResults.length > 0 && (
            <>
              <div style={{ padding: '8px 16px 4px', fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pages
              </div>
              {pageResults.map((r, i) => {
                const Icon = r.icon;
                const idx = projectResults.length + i;
                return (
                  <div
                    key={r.path}
                    className={`command-result-item${selected === idx ? ' selected' : ''}`}
                    onClick={() => { navigate(r.path); onClose(); }}
                  >
                    <Icon size={16} color="var(--fg-secondary)" />
                    <span className="command-result-title">{r.title}</span>
                    <span className="command-result-path">{r.path}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
