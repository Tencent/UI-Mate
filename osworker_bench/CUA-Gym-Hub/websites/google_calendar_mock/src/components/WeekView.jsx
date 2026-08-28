import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, addMinutes, startOfDay, endOfDay, differenceInMinutes, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { mockNow } from '../utils/helpers';

const HOUR_HEIGHT = 60; // px per hour

function expandRecurringEvents(rawEvents, viewStart, viewEnd) {
  const events = [];
  const extendedEnd = addDays(viewEnd, 7);

  rawEvents.forEach(event => {
    events.push(event);

    if (event.recurring && event.recurring !== 'none') {
      let currentDate = new Date(event.start);
      let i = 0;
      while (currentDate < extendedEnd && i < 200) {
        i++;
        if (event.recurring === 'daily') currentDate = addDays(currentDate, 1);
        else if (event.recurring === 'weekly') currentDate = addWeeks(currentDate, 1);
        else if (event.recurring === 'monthly') currentDate = addMonths(currentDate, 1);
        else if (event.recurring === 'yearly') currentDate = addYears(currentDate, 1);

        if (currentDate > extendedEnd) break;

        const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
        events.push({
          ...event,
          id: `${event.id}_recur_${i}`,
          start: currentDate.toISOString(),
          end: new Date(currentDate.getTime() + duration).toISOString(),
          originalEventId: event.id
        });
      }
    }
  });
  return events;
}

// Compute overlap groups and assign columns
function computeEventLayout(dayEvents) {
  if (dayEvents.length === 0) return [];

  const sorted = [...dayEvents].sort((a, b) => new Date(a.start) - new Date(b.start));
  const groups = [];
  let currentGroup = [];

  for (const event of sorted) {
    const eventStart = new Date(event.start).getTime();
    const eventEnd = new Date(event.end).getTime();

    if (currentGroup.length === 0) {
      currentGroup = [event];
    } else {
      const groupEnd = Math.max(...currentGroup.map(e => new Date(e.end).getTime()));
      if (eventStart < groupEnd) {
        currentGroup.push(event);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [event];
      }
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  const result = [];
  for (const group of groups) {
    const n = group.length;
    group.forEach((event, idx) => {
      result.push({ event, col: idx, totalCols: n });
    });
  }
  return result;
}

// H-06: Helper to snap minutes to 30-minute grid
function snapTo30Min(minutes) {
  return Math.round(minutes / 30) * 30;
}

export default function WeekView({ onEventClick, onDateClick }) {
  const { state, dispatch } = useStore();
  const currentDate = new Date(state.currentDate);
  const scrollRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(mockNow());

  // H-06: Drag-to-create state
  const [dragCreate, setDragCreate] = useState(null); // { day, startMinutes, endMinutes, dayIndex }
  const dragCreateRef = useRef(null);
  const isDraggingCreate = useRef(false);

  // Determine date range based on view type
  let days;
  if (state.view === 'day') {
    days = [currentDate];
  } else {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    days = eachDayOfInterval({ start, end });
  }

  // Scroll to 7 AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, [state.view]);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(mockNow()), 60000);
    return () => clearInterval(interval);
  }, []);

  const visibleCalendars = state.calendars.filter(c => c.visible).map(c => c.id);
  const rawEvents = state.events.filter(e => visibleCalendars.includes(e.calendarId));
  const allEvents = expandRecurringEvents(rawEvents, startOfDay(days[0]), endOfDay(days[days.length - 1]));

  // Separate all-day and timed events
  const allDayEvents = allEvents.filter(e => e.allDay);
  const timedEvents = allEvents.filter(e => !e.allDay);

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const getEventColor = (event) => {
    if (event.color && event.color.startsWith('#')) return event.color;
    const cal = state.calendars.find(c => c.id === event.calendarId);
    return cal?.color || '#039BE5';
  };

  const getEventStyle = (event, dayStart) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startMinutes = differenceInMinutes(start, dayStart);
    const durationMinutes = Math.max(differenceInMinutes(end, start), 30);

    return {
      top: `${(startMinutes / 60) * HOUR_HEIGHT}px`,
      height: `${(durationMinutes / 60) * HOUR_HEIGHT}px`,
    };
  };

  // Current time line position (minutes from midnight)
  const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentTimeTop = (currentTimeMinutes / 60) * HOUR_HEIGHT;

  const handleDragStart = (e, eventId) => {
    e.dataTransfer.setData('eventId', eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, day, hour) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    if (eventId) {
      // M-14: Guard against dropping recurring event instances
      if (eventId.includes('_recur_')) return;
      const event = state.events.find(ev => ev.id === eventId);
      if (event) {
        // M-13: Snap to nearest 30-minute mark using cursor position within slot
        const slotRect = e.currentTarget.getBoundingClientRect();
        const relY = e.clientY - slotRect.top;
        const slotFraction = Math.max(0, Math.min(1, relY / HOUR_HEIGHT));
        const minutes = slotFraction >= 0.5 ? 30 : 0;
        const newStart = new Date(day);
        newStart.setHours(hour, minutes, 0, 0);
        dispatch({ type: 'MOVE_EVENT', payload: { eventId, newStart: newStart.toISOString() } });
      }
    }
  };

  const isDayView = state.view === 'day';
  const labelWidth = '56px';

  // H-06: Drag-to-create mouse handlers
  // Helper: compute minutes from midnight given a Y offset within the column container
  const getMinutesFromY = (colEl, clientY) => {
    const rect = colEl.getBoundingClientRect();
    const relY = clientY - rect.top;
    const rawMinutes = (relY / HOUR_HEIGHT) * 60;
    return Math.max(0, Math.min(23 * 60 + 59, rawMinutes));
  };

  const handleGridMouseDown = (e, day, dayIndex) => {
    // Only initiate on left-click on the background (not on event chips)
    if (e.button !== 0) return;
    if (e.target.closest('[data-event-chip]')) return;
    e.preventDefault();

    const startMinutes = snapTo30Min(getMinutesFromY(e.currentTarget, e.clientY));
    const endMinutes = startMinutes + 60;

    const newDragCreate = { day, startMinutes, endMinutes, dayIndex };
    dragCreateRef.current = newDragCreate;
    isDraggingCreate.current = false;
    setDragCreate(newDragCreate);

    const onMouseMove = (moveEvt) => {
      const colEls = document.querySelectorAll('[data-day-col]');
      const colEl = colEls[dayIndex];
      if (!colEl) return;
      const curMinutes = snapTo30Min(getMinutesFromY(colEl, moveEvt.clientY));
      const start = Math.min(dragCreateRef.current.startMinutes, curMinutes);
      const end = Math.max(dragCreateRef.current.startMinutes + 30, curMinutes + 30);
      isDraggingCreate.current = true;
      const updated = { ...dragCreateRef.current, endMinutes: end, startMinutes: start };
      dragCreateRef.current = updated;
      setDragCreate({ ...updated });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const created = dragCreateRef.current;
      if (!isDraggingCreate.current) {
        // Was just a click, open quick-create via onDateClick
        setDragCreate(null);
        dragCreateRef.current = null;
        return;
      }

      // Build new event from drag selection and open full modal
      if (created) {
        const startDate = new Date(created.day);
        startDate.setHours(Math.floor(created.startMinutes / 60), created.startMinutes % 60, 0, 0);
        onDateClick(startDate);
      }
      setDragCreate(null);
      dragCreateRef.current = null;
      isDraggingCreate.current = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Day headers */}
      <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid #DADCE0', marginLeft: labelWidth }}>
        {days.map(day => {
          const isToday = isSameDay(day, mockNow());
          return (
            <div
              key={day.toString()}
              className="flex-1 text-center py-2"
              style={{ borderLeft: '1px solid #DADCE0' }}
            >
              <div style={{ fontSize: '11px', fontWeight: 500, color: isToday ? '#1A73E8' : '#70757A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {format(day, isDayView ? 'EEEE' : 'EEE')}
              </div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  margin: '2px auto 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  fontSize: '22px',
                  fontWeight: 400,
                  color: isToday ? '#fff' : '#3C4043',
                  backgroundColor: isToday ? '#1A73E8' : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => onDateClick(day)}
                onMouseEnter={e => { if (!isToday) e.currentTarget.style.backgroundColor = '#F1F3F4'; }}
                onMouseLeave={e => { if (!isToday) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid #DADCE0', minHeight: '28px' }}>
          <div style={{ width: labelWidth, flexShrink: 0, borderRight: '1px solid #DADCE0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px' }}>
            <span style={{ fontSize: '10px', color: '#70757A' }}>all-day</span>
          </div>
          {days.map(day => {
            const dayAllDay = allDayEvents.filter(e => {
              const start = new Date(e.start);
              const end = new Date(e.end);
              return isSameDay(day, start) ||
                (day >= startOfDay(start) && day < startOfDay(end));
            });
            return (
              <div
                key={day.toString()}
                className="flex-1 relative"
                style={{ borderLeft: '1px solid #DADCE0', padding: '2px', minHeight: '28px' }}
              >
                {dayAllDay.map(event => {
                  const color = getEventColor(event);
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        const targetEvent = event.originalEventId
                          ? state.events.find(ev => ev.id === event.originalEventId)
                          : event;
                        onEventClick(targetEvent, e);
                      }}
                      style={{
                        height: '20px',
                        borderRadius: '2px',
                        padding: '0 6px',
                        marginBottom: '2px',
                        backgroundColor: color,
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.92)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >
                      {event.title}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto relative" ref={scrollRef}>
        <div className="flex relative" style={{ minHeight: `${24 * HOUR_HEIGHT}px` }}>
          {/* Time labels */}
          <div
            className="flex-shrink-0 sticky left-0 z-10 bg-white"
            style={{ width: labelWidth, borderRight: '1px solid #DADCE0' }}
          >
            {timeSlots.map(hour => (
              <div
                key={hour}
                style={{ height: `${HOUR_HEIGHT}px`, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: '6px', paddingTop: '2px' }}
              >
                {hour !== 0 && (
                  <span style={{ fontSize: '10px', color: '#70757A', marginTop: '-6px' }}>
                    {format(mockNow().setHours(hour, 0, 0, 0), 'h a')}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex-1 flex relative">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
              {timeSlots.map(hour => (
                <React.Fragment key={hour}>
                  <div style={{ height: `${HOUR_HEIGHT}px`, borderBottom: '1px solid #DADCE0', width: '100%' }} />
                </React.Fragment>
              ))}
            </div>

            {/* 30-min dashed lines */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
              {timeSlots.map(hour => (
                <div
                  key={hour}
                  style={{
                    position: 'absolute',
                    top: `${hour * HOUR_HEIGHT + HOUR_HEIGHT / 2}px`,
                    left: 0,
                    right: 0,
                    borderTop: '1px dashed #E8EAED',
                  }}
                />
              ))}
            </div>

            {days.map((day, dayIndex) => {
              const dayStart = startOfDay(day);
              const isToday = isSameDay(day, mockNow());
              const dayTimedEvents = timedEvents.filter(e => isSameDay(new Date(e.start), day));
              const layoutItems = computeEventLayout(dayTimedEvents);

              // H-06: Check if there's an active drag-create preview for this day column
              const showDragPreview = dragCreate && isSameDay(dragCreate.day, day);
              const dragPreviewTop = showDragPreview ? `${(dragCreate.startMinutes / 60) * HOUR_HEIGHT}px` : '0';
              const dragPreviewHeight = showDragPreview ? `${((dragCreate.endMinutes - dragCreate.startMinutes) / 60) * HOUR_HEIGHT}px` : '0';

              return (
                <div
                  key={day.toString()}
                  data-day-col
                  className="flex-1 relative"
                  style={{ borderLeft: '1px solid #DADCE0', userSelect: 'none' }}
                  onMouseDown={(e) => handleGridMouseDown(e, day, dayIndex)}
                >
                  {/* Click/drop zones */}
                  {timeSlots.map(hour => (
                    <div
                      key={hour}
                      style={{
                        position: 'absolute',
                        top: `${hour * HOUR_HEIGHT}px`,
                        left: 0,
                        right: 0,
                        height: `${HOUR_HEIGHT}px`,
                        zIndex: 1,
                      }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, hour)}
                      onMouseEnter={e => { if (!dragCreate) e.currentTarget.style.backgroundColor = 'rgba(26,115,232,0.04)'; }}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    />
                  ))}

                  {/* H-06: Drag-to-create preview overlay */}
                  {showDragPreview && (
                    <div
                      style={{
                        position: 'absolute',
                        top: dragPreviewTop,
                        left: '2px',
                        right: '2px',
                        height: dragPreviewHeight,
                        zIndex: 10,
                        backgroundColor: 'rgba(26,115,232,0.25)',
                        border: '2px solid #1A73E8',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '3px 6px',
                        overflow: 'hidden',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#1A73E8', whiteSpace: 'nowrap' }}>
                        {(() => {
                          const sh = Math.floor(dragCreate.startMinutes / 60);
                          const sm = dragCreate.startMinutes % 60;
                          const eh = Math.floor(dragCreate.endMinutes / 60);
                          const em = dragCreate.endMinutes % 60;
                          const fmt = (h, m) => `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
                          return `${fmt(sh, sm)} – ${fmt(eh, em)}`;
                        })()}
                      </span>
                    </div>
                  )}

                  {/* Current time red line */}
                  {isToday && (
                    <div
                      style={{
                        position: 'absolute',
                        top: `${currentTimeTop}px`,
                        left: 0,
                        right: 0,
                        zIndex: 5,
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EA4335', flexShrink: 0, marginLeft: '-5px' }} />
                      <div style={{ flex: 1, height: '2px', backgroundColor: '#EA4335' }} />
                    </div>
                  )}

                  {/* Event blocks */}
                  {layoutItems.map(({ event, col, totalCols }) => {
                    const color = getEventColor(event);
                    const style = getEventStyle(event, dayStart);
                    const width = `calc(${100 / totalCols}% - 4px)`;
                    const left = `calc(${(col / totalCols) * 100}% + 2px)`;
                    const isOriginalId = !event.id.includes('_recur_');

                    return (
                      <div
                        key={event.id}
                        data-event-chip
                        draggable={isOriginalId}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          isOriginalId && handleDragStart(e, event.id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetEvent = event.originalEventId
                            ? state.events.find(ev => ev.id === event.originalEventId)
                            : event;
                          onEventClick(targetEvent, e);
                        }}
                        style={{
                          position: 'absolute',
                          top: style.top,
                          height: style.height,
                          width,
                          left,
                          zIndex: 3,
                          backgroundColor: color,
                          borderRadius: '4px',
                          padding: '3px 6px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          borderLeft: `3px solid ${darkenColor(color, 20)}`,
                          opacity: 0.9,
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'white', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {event.title || '(No title)'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {format(new Date(event.start), 'h:mm a')} – {format(new Date(event.end), 'h:mm a')}
                        </div>
                        {event.location && parseFloat(style.height) > 50 && (
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {event.location}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Darken a hex color by a percentage
function darkenColor(hex, percent) {
  if (!hex || !hex.startsWith('#')) return hex;
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, Math.floor(r * (1 - percent / 100)));
  g = Math.max(0, Math.floor(g * (1 - percent / 100)));
  b = Math.max(0, Math.floor(b * (1 - percent / 100)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
