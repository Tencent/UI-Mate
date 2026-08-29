import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

const TYPE_ICONS = { deployment: '\u{1F680}', alert: '\u{1F514}', error: '\u{274C}', info: '\u{2139}\uFE0F', warning: '\u{26A0}\uFE0F' };
const TYPE_COLORS = { deployment: '#1a73e8', alert: '#E74C3C', error: '#E74C3C', info: '#95A5A6', warning: '#F39C12' };

export default function Events() {
  const { state } = useAppContext();
  const [search, setSearch] = useState('');

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  const filtered = useMemo(() => {
    let events = [...state.events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (search) {
      const q = search.toLowerCase();
      events = events.filter(e => e.title.toLowerCase().includes(q) || e.text.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q)));
    }
    return events;
  }, [state.events, search]);

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Events</h1>
      <input className="search-input" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 16 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(evt => (
          <div key={evt.id} className="card" style={{ borderLeft: `4px solid ${TYPE_COLORS[evt.type] || '#ccc'}`, padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{TYPE_ICONS[evt.type] || '\u{2139}\uFE0F'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{evt.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{evt.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{timeAgo(evt.timestamp)}</span>
                  <span className="tag tag-sm" style={{ background: TYPE_COLORS[evt.type] + '20', color: TYPE_COLORS[evt.type] }}>{evt.source}</span>
                  {evt.tags.map(t => <span key={t} className="tag tag-sm">{t}</span>)}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No events found.</div>}
      </div>
    </div>
  );
}
