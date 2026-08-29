import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Calendar.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function Calendar() {
  const { state, setState } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // October 2025
  const [viewMode, setViewMode] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [addEventDate, setAddEventDate] = useState('');
  const [visibleCalendars, setVisibleCalendars] = useState(() => {
    const cals = { user_1: true };
    state.courses.filter(c => c.workflow_state === 'available').forEach(c => { cals[`course_${c.id}`] = true; });
    return cals;
  });

  // Add event form
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventAllDay, setEventAllDay] = useState(false);
  const [eventCalendar, setEventCalendar] = useState('user_1');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const activeCourses = state.courses.filter(c => c.workflow_state === 'available');

  // Get all events (calendar events + assignment due dates)
  const allEvents = useMemo(() => {
    const events = [];
    // Calendar events
    state.calendarEvents.forEach(e => {
      if (visibleCalendars[e.context_code]) {
        events.push({
          type: 'event',
          id: `event_${e.id}`,
          title: e.title,
          start: new Date(e.start_at),
          end: e.end_at ? new Date(e.end_at) : new Date(e.start_at),
          allDay: e.all_day,
          color: getContextColor(e.context_code),
          description: e.description,
          location: e.location_name,
          context: e.context_name,
          contextCode: e.context_code
        });
      }
    });
    // Assignment due dates
    state.assignments.filter(a => a.due_at && a.published).forEach(a => {
      const course = state.courses.find(c => c.id === a.course_id);
      const code = `course_${a.course_id}`;
      if (course && visibleCalendars[code]) {
        events.push({
          type: 'assignment',
          id: `asgn_${a.id}`,
          title: a.name,
          start: new Date(a.due_at),
          end: new Date(a.due_at),
          allDay: false,
          color: course.color,
          description: '',
          location: '',
          context: course.course_code,
          contextCode: code,
          courseId: a.course_id,
          assignmentId: a.id
        });
      }
    });
    return events;
  }, [state.calendarEvents, state.assignments, state.courses, visibleCalendars]);

  function getContextColor(contextCode) {
    if (contextCode === 'user_1') return '#394B58';
    const cid = parseInt(contextCode.replace('course_', ''));
    const course = state.courses.find(c => c.id === cid);
    return course ? course.color : '#394B58';
  }

  // Calendar grid computation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];
  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, month: month - 1, year: month === 0 ? year - 1 : year, isOtherMonth: true });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, month, year, isOtherMonth: false });
  }
  // Next month days
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, month: month + 1, year: month === 11 ? year + 1 : year, isOtherMonth: true });
  }

  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  function getEventsForDay(day, m, y) {
    return allEvents.filter(e => {
      const s = e.start;
      if (e.allDay) {
        const start = new Date(e.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(e.end);
        end.setHours(23, 59, 59, 999);
        const date = new Date(y, m, day);
        return date >= start && date <= end;
      }
      return s.getFullYear() === y && s.getMonth() === m && s.getDate() === day;
    });
  }

  const isToday = (day, m, y) => {
    const now = new Date();
    return day === now.getDate() && m === now.getMonth() && y === now.getFullYear();
  };

  const goToPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNext = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleDayClick = (day, m, y) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setAddEventDate(dateStr);
    setEventStartDate(dateStr);
    setShowAddEvent(true);
  };

  const handleToggleCalendar = (code) => {
    setVisibleCalendars(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const handleAddEvent = () => {
    if (!eventTitle.trim()) return;
    const startDateStr = eventStartDate || addEventDate;
    let startAt, endAt;
    if (eventAllDay) {
      startAt = `${startDateStr}T00:00:00Z`;
      endAt = `${startDateStr}T23:59:59Z`;
    } else {
      startAt = `${startDateStr}T${eventStartTime || '09:00'}:00Z`;
      endAt = `${startDateStr}T${eventEndTime || '10:00'}:00Z`;
    }
    const course = eventCalendar !== 'user_1' ? state.courses.find(c => c.id === parseInt(eventCalendar.replace('course_', ''))) : null;
    const newEvent = {
      id: Math.max(0, ...state.calendarEvents.map(e => e.id)) + 1,
      title: eventTitle.trim(),
      description: eventDescription,
      start_at: startAt,
      end_at: endAt,
      all_day: eventAllDay,
      location_name: eventLocation,
      context_code: eventCalendar,
      context_name: course ? course.course_code : 'Personal',
      workflow_state: 'active'
    };
    setState(prev => ({
      ...prev,
      calendarEvents: [...prev.calendarEvents, newEvent]
    }));
    resetAddForm();
  };

  const resetAddForm = () => {
    setShowAddEvent(false);
    setEventTitle('');
    setEventLocation('');
    setEventDescription('');
    setEventStartDate('');
    setEventStartTime('');
    setEventEndTime('');
    setEventAllDay(false);
    setEventCalendar('user_1');
  };

  // Mini calendar for sidebar
  const miniDays = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    miniDays.push({ day: daysInPrevMonth - i, other: true });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    miniDays.push({ day: i, other: false });
  }
  const miniRemaining = 42 - miniDays.length;
  for (let i = 1; i <= miniRemaining; i++) {
    miniDays.push({ day: i, other: true });
  }

  // Undated assignments
  const undatedAssignments = state.assignments.filter(a => !a.due_at && a.published);

  return (
    <div className="calendar-page">
      <div className="calendar-main">
        <div className="calendar-header">
          <div className="calendar-header-left">
            <h1>Calendar</h1>
          </div>
          <div className="calendar-header-center">
            <button className="calendar-nav-btn" onClick={goToPrev}><ChevronLeft size={18} /></button>
            <button className="calendar-today-btn" onClick={goToToday}>Today</button>
            <button className="calendar-nav-btn" onClick={goToNext}><ChevronRight size={18} /></button>
            <span className="calendar-month-label">{MONTHS[month]} {year}</span>
          </div>
          <div className="calendar-header-right">
            <div className="calendar-view-tabs">
              <button className={`calendar-view-tab ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Month</button>
              <button className={`calendar-view-tab ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Week</button>
              <button className={`calendar-view-tab ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>Day</button>
            </div>
          </div>
        </div>

        <div className="calendar-grid">
          <div className="calendar-grid-header">
            {DAYS.map(d => <div key={d} className="calendar-grid-day-name">{d}</div>)}
          </div>
          <div className="calendar-grid-body">
            {weeks.map((week, wi) => (
              <div key={wi} className="calendar-grid-week">
                {week.map((cell, ci) => {
                  const dayEvents = getEventsForDay(cell.day, cell.month, cell.year);
                  return (
                    <div
                      key={ci}
                      className={`calendar-grid-cell ${cell.isOtherMonth ? 'other-month' : ''}`}
                      onClick={() => handleDayClick(cell.day, cell.month, cell.year)}
                    >
                      <span className={`calendar-day-number ${isToday(cell.day, cell.month, cell.year) ? 'today' : ''}`}>
                        {cell.day}
                      </span>
                      <div className="calendar-cell-events">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div
                            key={ev.id}
                            className="calendar-event-pill"
                            style={{ background: ev.color }}
                            onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                            title={ev.title}
                          >
                            {ev.type === 'assignment' && <span className="calendar-event-icon">📋</span>}
                            <span className="calendar-event-title">{ev.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="calendar-more-events">+{dayEvents.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="calendar-sidebar">
        {/* Mini Calendar */}
        <div className="calendar-mini">
          <div className="calendar-mini-header">
            <span>{MONTHS[month]} {year}</span>
          </div>
          <div className="calendar-mini-grid">
            {DAYS.map(d => <div key={d} className="calendar-mini-day-name">{d[0]}</div>)}
            {miniDays.map((md, i) => (
              <div key={i} className={`calendar-mini-day ${md.other ? 'other' : ''}`}>{md.day}</div>
            ))}
          </div>
        </div>

        {/* Calendars */}
        <div className="calendar-filters">
          <h3>Calendars</h3>
          <label className="calendar-filter-item">
            <input
              type="checkbox"
              checked={visibleCalendars.user_1 || false}
              onChange={() => handleToggleCalendar('user_1')}
            />
            <span className="calendar-filter-swatch" style={{ background: '#394B58' }} />
            <span>Personal</span>
          </label>
          {activeCourses.map(c => (
            <label key={c.id} className="calendar-filter-item">
              <input
                type="checkbox"
                checked={visibleCalendars[`course_${c.id}`] || false}
                onChange={() => handleToggleCalendar(`course_${c.id}`)}
              />
              <span className="calendar-filter-swatch" style={{ background: c.color }} />
              <span>{c.course_code}</span>
            </label>
          ))}
        </div>

        {/* Undated */}
        {undatedAssignments.length > 0 && (
          <div className="calendar-undated">
            <h3>Undated</h3>
            {undatedAssignments.map(a => {
              const course = state.courses.find(c => c.id === a.course_id);
              return (
                <div key={a.id} className="calendar-undated-item">
                  <span className="calendar-undated-dot" style={{ background: course?.color || '#394B58' }} />
                  <span className="calendar-undated-name">{a.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Detail Popover */}
      {selectedEvent && (
        <div className="calendar-popover-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="calendar-popover" onClick={e => e.stopPropagation()}>
            <div className="calendar-popover-header" style={{ borderLeftColor: selectedEvent.color }}>
              <h3>{selectedEvent.title}</h3>
              <button className="calendar-popover-close" onClick={() => setSelectedEvent(null)}><X size={16} /></button>
            </div>
            <div className="calendar-popover-body">
              <div className="calendar-popover-field">
                <strong>Date:</strong> {selectedEvent.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              {!selectedEvent.allDay && (
                <div className="calendar-popover-field">
                  <strong>Time:</strong> {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                </div>
              )}
              {selectedEvent.allDay && (
                <div className="calendar-popover-field"><strong>All Day Event</strong></div>
              )}
              {selectedEvent.location && (
                <div className="calendar-popover-field"><strong>Location:</strong> {selectedEvent.location}</div>
              )}
              {selectedEvent.context && (
                <div className="calendar-popover-field"><strong>Calendar:</strong> {selectedEvent.context}</div>
              )}
              {selectedEvent.description && (
                <div className="calendar-popover-field"><strong>Details:</strong> {selectedEvent.description}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Event Panel */}
      {showAddEvent && (
        <div className="calendar-add-overlay" onClick={resetAddForm}>
          <div className="calendar-add-panel" onClick={e => e.stopPropagation()}>
            <div className="calendar-add-header">
              <h3>Add Event</h3>
              <button className="calendar-add-close" onClick={resetAddForm}><X size={18} /></button>
            </div>
            <div className="calendar-add-body">
              <div className="calendar-add-field">
                <label>Title</label>
                <input type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Event title" />
              </div>
              <div className="calendar-add-field">
                <label>Date</label>
                <input type="date" value={eventStartDate || addEventDate} onChange={e => setEventStartDate(e.target.value)} />
              </div>
              <label className="calendar-add-checkbox">
                <input type="checkbox" checked={eventAllDay} onChange={e => setEventAllDay(e.target.checked)} />
                <span>All Day Event</span>
              </label>
              {!eventAllDay && (
                <div className="calendar-add-times">
                  <div className="calendar-add-field">
                    <label>Start Time</label>
                    <input type="time" value={eventStartTime} onChange={e => setEventStartTime(e.target.value)} />
                  </div>
                  <div className="calendar-add-field">
                    <label>End Time</label>
                    <input type="time" value={eventEndTime} onChange={e => setEventEndTime(e.target.value)} />
                  </div>
                </div>
              )}
              <div className="calendar-add-field">
                <label>Location</label>
                <input type="text" value={eventLocation} onChange={e => setEventLocation(e.target.value)} placeholder="Location" />
              </div>
              <div className="calendar-add-field">
                <label>Calendar</label>
                <select value={eventCalendar} onChange={e => setEventCalendar(e.target.value)}>
                  <option value="user_1">Personal</option>
                  {activeCourses.map(c => (
                    <option key={c.id} value={`course_${c.id}`}>{c.course_code}</option>
                  ))}
                </select>
              </div>
              <div className="calendar-add-field">
                <label>Description</label>
                <textarea value={eventDescription} onChange={e => setEventDescription(e.target.value)} rows={3} placeholder="Details..." />
              </div>
            </div>
            <div className="calendar-add-footer">
              <button className="btn btn-secondary" onClick={resetAddForm}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddEvent} disabled={!eventTitle.trim()}>Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
