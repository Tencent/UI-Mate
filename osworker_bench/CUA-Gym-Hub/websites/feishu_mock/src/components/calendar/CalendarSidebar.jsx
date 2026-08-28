import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function CalendarSidebar({ selectedDate, onSelectDate, onCreateEvent }) {
  const { state, dispatch } = useApp();
  const [miniMonth, setMiniMonth] = useState(new Date(selectedDate));

  const today = new Date();

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  const year = miniMonth.getFullYear();
  const month = miniMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  // Adjust for Monday start
  const startOffset = (firstDay + 6) % 7;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Mini calendar header */}
      <div style={{ padding: '16px 12px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button
            onClick={onCreateEvent}
            style={{
              padding: '5px 14px', background: '#3370FF', color: '#fff', border: 'none',
              borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}
          >
            + 新建
          </button>
          <button
            onClick={() => onSelectDate(today)}
            style={{
              padding: '5px 10px', background: '#fff', color: '#3370FF', border: '1px solid #3370FF',
              borderRadius: 6, cursor: 'pointer', fontSize: 12,
            }}
          >
            今天
          </button>
        </div>

        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <button
            onClick={() => setMiniMonth(new Date(year, month - 1, 1))}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#646A73', padding: '2px 4px', fontSize: 16 }}
          >‹</button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#1F2329' }}>
            {year}年{month + 1}月
          </span>
          <button
            onClick={() => setMiniMonth(new Date(year, month + 1, 1))}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#646A73', padding: '2px 4px', fontSize: 16 }}
          >›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 2 }}>
          {['一','二','三','四','五','六','日'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#8F959E', padding: '2px 0' }}>{d}</div>
          ))}
        </div>

        {/* Date grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const d = new Date(year, month, day);
            const isToday = d.toDateString() === today.toDateString();
            const isSelected = d.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={i}
                onClick={() => onSelectDate(d)}
                style={{
                  width: 26, height: 26, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 12,
                  background: isSelected ? '#3370FF' : isToday ? '#E1EAFF' : 'transparent',
                  color: isSelected ? '#fff' : isToday ? '#3370FF' : '#1F2329',
                  fontWeight: isToday || isSelected ? 600 : 400,
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendars */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        <div style={{ fontSize: 12, color: '#8F959E', fontWeight: 500, marginBottom: 6, marginTop: 4 }}>我的日历</div>
        {state.calendars.filter(c => c.ownerId).map(cal => (
          <div key={cal.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px', cursor: 'pointer', borderRadius: 4 }}>
            <input
              type="checkbox"
              checked={cal.isVisible}
              onChange={() => {}}
              style={{ accentColor: cal.color, cursor: 'pointer' }}
            />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: cal.color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#1F2329', flex: 1 }}>{cal.name}</span>
          </div>
        ))}

        <div style={{ fontSize: 12, color: '#8F959E', fontWeight: 500, marginBottom: 6, marginTop: 12 }}>其他日历</div>
        {state.calendars.filter(c => !c.ownerId).map(cal => (
          <div key={cal.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px', cursor: 'pointer', borderRadius: 4 }}>
            <input type="checkbox" checked={cal.isVisible} onChange={() => {}} style={{ accentColor: cal.color }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: cal.color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#1F2329', flex: 1 }}>{cal.name}</span>
          </div>
        ))}

        <button style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 4px',
          border: 'none', background: 'transparent', cursor: 'pointer', color: '#3370FF', fontSize: 13, marginTop: 8,
        }}>
          + 新建日历
        </button>
      </div>
    </div>
  );
}
