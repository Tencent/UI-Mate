import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { StatusIcon, PriorityIcon } from './Icons.jsx';
import './CommandPalette.css';

export default function CommandPalette({ onClose, onCreateIssue }) {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  const toPath = p => sid ? `${p}?sid=${sid}` : p;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const allStates = state.teams?.flatMap(t => t.workflowStates) || [];

  function getResults() {
    if (!query.trim()) {
      return [
        { id: 'create', type: 'action', icon: '+', label: 'Create new issue', action: () => { onClose(); onCreateIssue(); } },
        { id: 'inbox', type: 'action', icon: '📬', label: 'Go to Inbox', action: () => { navigate(toPath('/inbox')); onClose(); } },
        { id: 'my-issues', type: 'action', icon: '👤', label: 'Go to My Issues', action: () => { navigate(toPath('/my-issues')); onClose(); } },
        ...(state.issues || []).slice(0, 5).map(i => {
          const wfState = allStates.find(s => s.id === i.stateId);
          return {
            id: i.id,
            type: 'issue',
            label: i.title,
            identifier: i.identifier,
            state: wfState,
            action: () => { navigate(toPath(`/issue/${i.id}`)); onClose(); },
          };
        }),
      ];
    }

    const q = query.toLowerCase();
    const issues = (state.issues || [])
      .filter(i => i.title.toLowerCase().includes(q) || i.identifier.toLowerCase().includes(q))
      .slice(0, 8)
      .map(i => {
        const wfState = allStates.find(s => s.id === i.stateId);
        return {
          id: i.id,
          type: 'issue',
          label: i.title,
          identifier: i.identifier,
          state: wfState,
          action: () => { navigate(toPath(`/issue/${i.id}`)); onClose(); },
        };
      });

    const projects = (state.projects || [])
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map(p => ({
        id: p.id,
        type: 'project',
        icon: p.icon,
        label: p.name,
        action: () => { navigate(toPath(`/project/${p.id}`)); onClose(); },
      }));

    return [...issues, ...projects];
  }

  const results = getResults();

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      results[selectedIndex]?.action?.();
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="command-palette">
        <div className="command-palette-input-row">
          <span className="command-search-icon">⌕</span>
          <input
            ref={inputRef}
            className="command-palette-input"
            placeholder="Search or jump to..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button className="command-clear-btn" onClick={() => setQuery('')}>✕</button>
          )}
        </div>

        <div className="command-results">
          {results.length === 0 ? (
            <div className="command-empty">No results</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                className={`command-result-item ${i === selectedIndex ? 'selected' : ''}`}
                onClick={r.action}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                {r.type === 'issue' && r.state && (
                  <span className="cmd-icon"><StatusIcon state={r.state} size={14} /></span>
                )}
                {r.type !== 'issue' && (
                  <span className="cmd-icon">{r.icon}</span>
                )}
                {r.identifier && (
                  <span className="cmd-identifier">{r.identifier}</span>
                )}
                <span className="cmd-label">{r.label}</span>
                <span className="cmd-type">{r.type}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
