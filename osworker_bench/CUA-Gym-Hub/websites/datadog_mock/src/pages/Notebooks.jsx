import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function Notebooks() {
  const { state, dispatch } = useAppContext();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [createError, setCreateError] = useState('');

  const notebooks = state.notebooks || [];
  const filtered = search
    ? notebooks.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
    : notebooks;

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function handleCreate() {
    if (!newTitle.trim()) {
      setCreateError('Enter a notebook title before creating it.');
      return;
    }
    const id = 'nb-' + Date.now();
    dispatch({ type: 'ADD_NOTEBOOK', payload: {
      id, title: newTitle.trim(), author: state.currentUser.email,
      created: new Date().toISOString(), modified: new Date().toISOString(),
      tags: [], cells: [{ type: 'markdown', content: '# ' + newTitle.trim() + '\n\nStart writing...' }],
    }});
    setShowCreate(false);
    setNewTitle('');
    setCreateError('');
  }

  function deleteNotebook(e, id) {
    e.stopPropagation();
    dispatch({ type: 'DELETE_NOTEBOOK', payload: id });
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Notebooks</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Notebook</button>
      </div>

      <input className="search-input" placeholder="Search notebooks..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 16 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(nb => (
          <div key={nb.id}>
            <div
              className="card"
              style={{ padding: '14px 16px', cursor: 'pointer', borderRadius: expandedId === nb.id ? '8px 8px 0 0' : 8 }}
              onClick={() => setExpandedId(expandedId === nb.id ? null : nb.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18, color: 'var(--color-brand)' }}>
                  <svg viewBox="0 0 16 16" fill="currentColor" width="18" height="18"><rect x="3" y="1" width="10" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5"/><line x1="6" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1"/><line x1="6" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1"/></svg>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{nb.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {nb.author.split('@')[0]} | Modified {timeAgo(nb.modified)} | {nb.cells.length} cells
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {nb.tags.map(t => <span key={t} className="tag tag-sm">{t}</span>)}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={e => deleteNotebook(e, nb.id)} title="Delete">
                  {'\u2715'}
                </button>
              </div>
            </div>

            {expandedId === nb.id && (
              <div className="card" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none', padding: 16 }}>
                {nb.cells.map((cell, i) => (
                  <div key={i} style={{ marginBottom: 12, padding: 12, background: cell.type === 'markdown' ? 'white' : '#F5F5FF', borderRadius: 6, border: '1px solid var(--card-border)' }}>
                    {cell.type === 'markdown' ? (
                      <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {cell.content.split('\n').map((line, li) => {
                          if (line.startsWith('# ')) return <h2 key={li} style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{line.slice(2)}</h2>;
                          if (line.startsWith('## ')) return <h3 key={li} style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, marginTop: 12 }}>{line.slice(3)}</h3>;
                          if (line.startsWith('- [x] ')) return <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked readOnly style={{ accentColor: 'var(--color-brand)' }} /><span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{line.slice(6)}</span></div>;
                          if (line.startsWith('- [ ] ')) return <div key={li} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" readOnly /><span>{line.slice(6)}</span></div>;
                          if (line.startsWith('- ')) return <div key={li} style={{ paddingLeft: 12 }}>{'\u2022'} {line.slice(2)}</div>;
                          return <div key={li}>{line || '\u00A0'}</div>;
                        })}
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--color-brand)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>
                          {cell.type === 'timeseries' ? 'Timeseries Graph' : cell.type}
                        </div>
                        {cell.title && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{cell.title}</div>}
                        <code style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{cell.query}</code>
                        {/* Graph visualization */}
                        <div style={{ height: 80, marginTop: 8, background: 'linear-gradient(180deg, rgba(123,104,238,0.1) 0%, rgba(123,104,238,0.02) 100%)', borderRadius: 4, display: 'flex', alignItems: 'flex-end', padding: '0 4px 4px 4px', gap: 2 }}>
                          {Array.from({ length: 30 }, (_, i) => (
                            <div key={i} style={{ flex: 1, background: '#7B68EE', borderRadius: '2px 2px 0 0', height: `${20 + Math.sin(i / 5) * 30 + Math.random() * 20}%`, opacity: 0.6 }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No notebooks found.</div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Notebook</h2>
            <div className="form-group">
              <label>Title</label>
              <input value={newTitle} onChange={e => { setNewTitle(e.target.value); setCreateError(''); }} placeholder="Notebook title" autoFocus />
              {createError && <div style={{ color: 'var(--color-alert)', fontSize: 12, marginTop: 6 }}>{createError}</div>}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
