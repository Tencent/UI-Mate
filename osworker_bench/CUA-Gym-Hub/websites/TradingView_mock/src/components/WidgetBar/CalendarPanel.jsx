import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { ChevronDown, ChevronRight } from 'lucide-react';

const IMPACT_COLORS = { high: '#EF5350', medium: '#FF9800', low: '#26A69A' };

function groupByDate(events) {
  const groups = {};
  for (const ev of events) {
    if (!groups[ev.date]) groups[ev.date] = [];
    groups[ev.date].push(ev);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function CalendarPanel() {
  const { state } = useAppContext();
  const { economicEvents } = state;
  const [collapsedDates, setCollapsedDates] = useState({});
  const [filterImpact, setFilterImpact] = useState('all');

  const filtered = economicEvents.filter(ev => filterImpact === 'all' || ev.impact === filterImpact);
  const groups = groupByDate(filtered);

  const toggleDate = (date) => {
    setCollapsedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>Economic Calendar</span>
      </div>

      {/* Impact filter */}
      <div style={{
        display: 'flex', gap: 4, padding: '6px 12px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        {['all', 'high', 'medium', 'low'].map(lvl => (
          <button
            key={lvl}
            onClick={() => setFilterImpact(lvl)}
            style={{
              padding: '2px 8px', borderRadius: 3, fontSize: 11,
              background: filterImpact === lvl ? (IMPACT_COLORS[lvl] || 'var(--accent)') : 'var(--bg-hover)',
              color: filterImpact === lvl ? '#fff' : 'var(--text-secondary)',
              transition: 'background-color 0.1s',
            }}
          >
            {lvl === 'all' ? 'All' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '4px 12px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
        fontSize: 10, color: 'var(--text-secondary)',
      }}>
        <div style={{ width: 20 }} />
        <div style={{ width: 45 }}>Time</div>
        <div style={{ flex: 1 }}>Event</div>
        <div style={{ width: 50, textAlign: 'right' }}>Fcst</div>
        <div style={{ width: 50, textAlign: 'right' }}>Prev</div>
      </div>

      {/* Events */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {groups.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, padding: 24, textAlign: 'center' }}>
            No events
          </div>
        )}
        {groups.map(([date, events]) => {
          const isCollapsed = collapsedDates[date];
          return (
            <div key={date}>
              {/* Date header */}
              <div
                onClick={() => toggleDate(date)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', cursor: 'pointer',
                  background: 'var(--bg-page)', fontWeight: 600, fontSize: 12,
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-page)'}
              >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                <span>{formatDate(date)}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-secondary)', fontWeight: 400 }}>
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </span>
              </div>

              {!isCollapsed && events.map(ev => (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '6px 12px',
                    borderBottom: '1px solid rgba(42,46,57,0.4)', gap: 4,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Impact dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: IMPACT_COLORS[ev.impact] || '#787B86',
                    flexShrink: 0, marginRight: 4,
                  }} />

                  {/* Time */}
                  <div style={{ width: 40, fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {ev.time}
                  </div>

                  {/* Flag + Event */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 12 }}>{ev.countryFlag}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.event}
                      </span>
                    </div>
                  </div>

                  {/* Forecast */}
                  <div style={{ width: 48, textAlign: 'right', fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {ev.forecast || '--'}
                  </div>

                  {/* Previous */}
                  <div style={{ width: 48, textAlign: 'right', fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {ev.actual ? (
                      <span style={{
                        color: parseFloat(ev.actual) >= parseFloat(ev.forecast) ? 'var(--up)' : 'var(--down)',
                        fontWeight: 600,
                      }}>
                        {ev.actual}
                      </span>
                    ) : ev.previous || '--'}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
