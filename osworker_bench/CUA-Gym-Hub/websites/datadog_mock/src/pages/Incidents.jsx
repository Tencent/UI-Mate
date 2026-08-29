import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const SEV_COLORS = { 'SEV-1': '#E74C3C', 'SEV-2': '#F39C12', 'SEV-3': '#F1C40F', 'SEV-4': '#3498DB', 'SEV-5': '#95A5A6' };

export default function Incidents() {
  const { state, dispatch } = useAppContext();
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSev, setNewSev] = useState('SEV-3');
  const [newNote, setNewNote] = useState('');
  const [createError, setCreateError] = useState('');
  const [noteError, setNoteError] = useState('');

  const incidents = state.incidents || [];
  const filtered = statusFilter === 'all' ? incidents : incidents.filter(i => i.status === statusFilter);
  const activeCount = incidents.filter(i => i.status === 'active').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  function timeAgo(iso) {
    if (!iso) return '-';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function handleCreate() {
    if (!newTitle.trim()) {
      setCreateError('Enter an incident title before declaring it.');
      return;
    }
    const id = 'inc-' + Date.now();
    dispatch({ type: 'ADD_INCIDENT', payload: {
      id, title: newTitle.trim(), severity: newSev, status: 'active',
      commander: state.currentUser.email,
      created: new Date().toISOString(), updated: new Date().toISOString(), resolved: null,
      services: [], tags: ['env:production'],
      timeline: [{ time: new Date().toISOString(), author: state.currentUser.name, text: `Incident declared: ${newTitle.trim()}` }],
      impact: '', customerNotification: false,
    }});
    setShowCreate(false);
    setNewTitle('');
    setNewSev('SEV-3');
    setCreateError('');
  }

  function addTimelineEntry(incId) {
    if (!newNote.trim()) {
      setNoteError('Enter a timeline note before adding it.');
      return;
    }
    dispatch({ type: 'ADD_INCIDENT_TIMELINE', payload: {
      incidentId: incId,
      entry: { time: new Date().toISOString(), author: state.currentUser.name, text: newNote.trim() },
    }});
    setNewNote('');
    setNoteError('');
  }

  function resolveIncident(incId) {
    dispatch({ type: 'UPDATE_INCIDENT', payload: {
      id: incId, status: 'resolved', resolved: new Date().toISOString(), updated: new Date().toISOString(),
    }});
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Incidents</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Declare Incident</button>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab${statusFilter === 'all' ? ' active' : ''}`} onClick={() => setStatusFilter('all')}>
          All <span className="tab-badge">{incidents.length}</span>
        </button>
        <button className={`tab${statusFilter === 'active' ? ' active' : ''}`} onClick={() => setStatusFilter('active')}>
          Active <span className="tab-badge alert">{activeCount}</span>
        </button>
        <button className={`tab${statusFilter === 'resolved' ? ' active' : ''}`} onClick={() => setStatusFilter('resolved')}>
          Resolved <span className="tab-badge ok">{resolvedCount}</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(inc => (
          <div key={inc.id}>
            <div
              className="card"
              style={{
                padding: '14px 16px', cursor: 'pointer',
                borderLeft: `4px solid ${SEV_COLORS[inc.severity] || '#95A5A6'}`,
                borderRadius: expandedId === inc.id ? '8px 8px 0 0' : 8,
              }}
              onClick={() => setExpandedId(expandedId === inc.id ? null : inc.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: 'white', padding: '2px 8px', borderRadius: 4,
                  background: SEV_COLORS[inc.severity],
                }}>{inc.severity}</span>
                <span className={`status-badge ${inc.status === 'active' ? 'alert' : 'ok'}`} style={{ fontSize: 10 }}>
                  {inc.status}
                </span>
                <strong style={{ flex: 1, fontSize: 14 }}>{inc.title}</strong>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  IC: {inc.commander.split('@')[0]}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {timeAgo(inc.created)}
                </span>
              </div>
              {inc.services.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 8, marginLeft: 100 }}>
                  {inc.services.map(s => <span key={s} className="tag tag-sm">{s}</span>)}
                </div>
              )}
            </div>

            {expandedId === inc.id && (
              <div className="card" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none', padding: 16, background: '#FAFAFA' }}>
                {inc.impact && (
                  <div style={{ marginBottom: 16, padding: 12, background: '#FFF3E0', borderRadius: 6, fontSize: 13 }}>
                    <strong>Impact:</strong> {inc.impact}
                  </div>
                )}

                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Timeline</h4>
                <div style={{ borderLeft: '2px solid var(--card-border)', paddingLeft: 16, marginBottom: 16 }}>
                  {inc.timeline.map((entry, i) => (
                    <div key={i} style={{ marginBottom: 12, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: -21, top: 5, width: 10, height: 10, borderRadius: '50%', background: i === 0 ? SEV_COLORS[inc.severity] : '#DCDCE0', border: '2px solid white' }} />
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>
                        {new Date(entry.time).toLocaleTimeString('en-US', { hour12: false })} - <strong>{entry.author}</strong>
                      </div>
                      <div style={{ fontSize: 13 }}>{entry.text}</div>
                    </div>
                  ))}
                </div>

                {inc.status === 'active' && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                      className="search-input"
                      placeholder="Add timeline note..."
                      value={expandedId === inc.id ? newNote : ''}
                      onChange={e => setNewNote(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTimelineEntry(inc.id)}
                      style={{ flex: 1 }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => addTimelineEntry(inc.id)}>Add</button>
                    <button className="btn btn-success btn-sm" onClick={() => resolveIncident(inc.id)}>Resolve</button>
                  </div>
                )}
                {inc.status === 'active' && noteError && (
                  <div style={{ color: 'var(--color-alert)', fontSize: 12, marginBottom: 8 }}>{noteError}</div>
                )}

                {inc.postmortem && (
                  <div style={{ padding: 12, background: 'white', borderRadius: 6, border: '1px solid var(--card-border)', marginTop: 8 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Postmortem</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{inc.postmortem}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {inc.tags.map(t => <span key={t} className="tag tag-sm">{t}</span>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No incidents found.</div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Declare Incident</h2>
            <div className="form-group">
              <label>Title</label>
              <input value={newTitle} onChange={e => { setNewTitle(e.target.value); setCreateError(''); }} placeholder="Brief description of the incident" autoFocus />
              {createError && <div style={{ color: 'var(--color-alert)', fontSize: 12, marginTop: 6 }}>{createError}</div>}
            </div>
            <div className="form-group">
              <label>Severity</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['SEV-1', 'SEV-2', 'SEV-3', 'SEV-4', 'SEV-5'].map(sev => (
                  <button
                    key={sev}
                    className={`btn btn-sm ${newSev === sev ? '' : 'btn-ghost'}`}
                    style={{
                      background: newSev === sev ? SEV_COLORS[sev] : undefined,
                      color: newSev === sev ? 'white' : undefined,
                      border: `1px solid ${SEV_COLORS[sev]}`,
                    }}
                    onClick={() => setNewSev(sev)}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Declare</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
