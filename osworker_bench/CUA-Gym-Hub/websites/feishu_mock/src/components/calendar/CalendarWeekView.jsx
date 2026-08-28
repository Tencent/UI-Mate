import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import EventDetailPopover from './EventDetailPopover';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS_LABEL = ['一', '二', '三', '四', '五', '六', '日'];

function getWeekDates(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  const monday = d;
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    return dt;
  });
}

export default function CalendarWeekView({ selectedDate, onSelectDate, onCreateEvent, onEditEvent }) {
  const { state, dispatch } = useApp();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const gridRef = useRef(null);
  const now = new Date();

  const weekDates = getWeekDates(selectedDate);
  const weekStart = weekDates[0].getTime();
  const weekEnd = weekDates[6].getTime() + 86400000;

  // Get events for this week
  const weekEvents = state.events.filter(e => e.startTime < weekEnd && e.endTime >= weekStart);
  const allDayEvents = weekEvents.filter(e => e.isAllDay);
  const timedEvents = weekEvents.filter(e => !e.isAllDay);

  function getDayEvents(dayDate, events) {
    const dayStart = dayDate.getTime();
    const dayEnd = dayStart + 86400000;
    return events.filter(e => e.startTime < dayEnd && e.endTime >= dayStart);
  }

  function handleGridClick(e, dayDate, hour) {
    const clickedTime = new Date(dayDate);
    clickedTime.setHours(hour, 0, 0, 0);
    onCreateEvent(clickedTime);
  }

  function handleEventClick(e, event) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({ x: rect.right + 8, y: rect.top });
    setSelectedEvent(event);
  }

  // Current time
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isCurrentWeek = weekDates.some(d => d.toDateString() === now.toDateString());
  const todayDayIndex = weekDates.findIndex(d => d.toDateString() === now.toDateString());

  function prevWeek() {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    onSelectDate(prev);
  }
  function nextWeek() {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    onSelectDate(next);
  }

  const CELL_HEIGHT = 48; // px per hour

  // Scroll to 08:00 on mount
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = 8 * CELL_HEIGHT;
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #DEE0E3', gap: 12 }}>
        <button onClick={prevWeek} style={navBtnStyle}>‹</button>
        <button onClick={nextWeek} style={navBtnStyle}>›</button>
        <span style={{ fontWeight: 600, fontSize: 16, color: '#1F2329' }}>
          {weekDates[0].getMonth() + 1}月 {weekDates[0].getFullYear()}
        </span>
        <button
          onClick={() => onSelectDate(new Date())}
          style={{ padding: '4px 12px', border: '1px solid #DEE0E3', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#1F2329', background: '#fff', marginLeft: 8 }}
        >今天</button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => onCreateEvent(null)}
          style={{ padding: '5px 16px', background: '#3370FF', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
        >+ 新建日程</button>
      </div>

      {/* Week header */}
      <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', borderBottom: '1px solid #DEE0E3', background: '#fff', flexShrink: 0 }}>
        <div style={{ borderRight: '1px solid #DEE0E3' }} />
        {weekDates.map((d, i) => {
          const isToday = d.toDateString() === now.toDateString();
          return (
            <div key={i} style={{ textAlign: 'center', padding: '8px 4px', borderRight: i < 6 ? '1px solid #DEE0E3' : 'none' }}>
              <div style={{ fontSize: 12, color: '#8F959E' }}>周{DAYS_LABEL[i]}</div>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', margin: '2px auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isToday ? '#3370FF' : 'transparent',
                color: isToday ? '#fff' : '#1F2329',
                fontWeight: isToday ? 600 : 400, fontSize: 14,
              }}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day events row */}
      {allDayEvents.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', borderBottom: '1px solid #DEE0E3', minHeight: 32, flexShrink: 0 }}>
          <div style={{ borderRight: '1px solid #DEE0E3', fontSize: 11, color: '#8F959E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>全天</div>
          {weekDates.map((d, i) => {
            const dayEvts = getDayEvents(d, allDayEvents);
            return (
              <div key={i} style={{ borderRight: i < 6 ? '1px solid #DEE0E3' : 'none', padding: '2px 2px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayEvts.map(ev => (
                  <div
                    key={ev.id}
                    onClick={e => handleEventClick(e, ev)}
                    style={{
                      background: ev.color + 'CC', color: '#fff', borderRadius: 3, fontSize: 11,
                      padding: '1px 4px', cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    }}
                  >
                    {ev.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }} ref={gridRef}>
        <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', position: 'relative' }}>
          {/* Time labels */}
          <div>
            {HOURS.map(h => (
              <div key={h} style={{ height: CELL_HEIGHT, borderBottom: '1px solid #F0F1F2', position: 'relative', borderRight: '1px solid #DEE0E3' }}>
                <span style={{ position: 'absolute', top: -8, right: 6, fontSize: 10, color: '#8F959E' }}>
                  {h > 0 ? `${String(h).padStart(2,'0')}:00` : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((d, di) => {
            const dayEvts = getDayEvents(d, timedEvents);
            return (
              <div
                key={di}
                style={{ position: 'relative', borderRight: di < 6 ? '1px solid #DEE0E3' : 'none' }}
              >
                {HOURS.map(h => (
                  <div
                    key={h}
                    onClick={() => handleGridClick(null, d, h)}
                    style={{
                      height: CELL_HEIGHT, borderBottom: '1px solid #F0F1F2', cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F8F9FF'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  />
                ))}

                {/* Events */}
                {dayEvts.map(ev => {
                  const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
                  const startMin = Math.max(0, (ev.startTime - dayStart.getTime()) / 60000);
                  const endMin = Math.min(1440, (ev.endTime - dayStart.getTime()) / 60000);
                  const top = (startMin / 60) * CELL_HEIGHT;
                  const height = Math.max(((endMin - startMin) / 60) * CELL_HEIGHT, 20);
                  return (
                    <div
                      key={ev.id}
                      onClick={e => handleEventClick(e, ev)}
                      style={{
                        position: 'absolute', left: 2, right: 2, top, height,
                        background: ev.color + 'CC', borderRadius: 4, cursor: 'pointer',
                        padding: '2px 4px', overflow: 'hidden', zIndex: 1,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {ev.title}
                      </div>
                      {height > 28 && (
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)' }}>
                          {formatTime(ev.startTime)} - {formatTime(ev.endTime)}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Current time line */}
                {isCurrentWeek && todayDayIndex === di && (
                  <div style={{
                    position: 'absolute', left: 0, right: 0, top: (currentMinutes / 60) * CELL_HEIGHT,
                    height: 2, background: '#F54A45', zIndex: 2, pointerEvents: 'none',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F54A45', marginTop: -3, marginLeft: -4 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event detail popover */}
      {selectedEvent && (
        <EventDetailPopover
          event={selectedEvent}
          position={popoverPos}
          onClose={() => setSelectedEvent(null)}
          onEdit={() => { onEditEvent(selectedEvent); setSelectedEvent(null); }}
        />
      )}
    </div>
  );
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

const navBtnStyle = {
  border: 'none', background: 'none', cursor: 'pointer', color: '#646A73',
  fontSize: 20, padding: '2px 6px', borderRadius: 4,
};
