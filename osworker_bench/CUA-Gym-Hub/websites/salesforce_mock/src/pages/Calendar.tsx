import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Activity } from '../types';
import { Modal } from '../components/Modal';

interface CalendarProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Calendar: React.FC<CalendarProps> = ({ onShowToast }) => {
  const { state, updateState } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    subject: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Number of leading empty cells to align the first day with the correct weekday (0=Sun)
  const startDayOfWeek = getDay(monthStart);

  // Get events for the current month
  const monthEvents = state.activities.filter(activity => {
    if (activity.type === 'event' && activity.startDateTime) {
      const eventDate = new Date(activity.startDateTime);
      return isSameMonth(eventDate, currentDate);
    }
    return false;
  });

  const getEventsForDay = (day: Date) => {
    return monthEvents.filter(event => {
      if (event.startDateTime) {
        return isSameDay(new Date(event.startDateTime), day);
      }
      return false;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (day: Date) => {
    // Pre-fill start/end time to 9:00-10:00 AM on the clicked day
    const startDt = new Date(day);
    startDt.setHours(9, 0, 0, 0);
    const endDt = new Date(day);
    endDt.setHours(10, 0, 0, 0);

    // Format for datetime-local input: "YYYY-MM-DDTHH:mm"
    const toLocal = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setEventFormData({
      subject: '',
      startDateTime: toLocal(startDt),
      endDateTime: toLocal(endDt),
      location: '',
      description: '',
    });
    setFormErrors({});
    setShowEventModal(true);
  };

  const openNewEventModal = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const toLocal = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setEventFormData({
      subject: '',
      startDateTime: toLocal(now),
      endDateTime: toLocal(end),
      location: '',
      description: '',
    });
    setFormErrors({});
    setShowEventModal(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!eventFormData.subject.trim()) errors.subject = 'Subject is required';
    if (!eventFormData.startDateTime) errors.startDateTime = 'Start date & time is required';
    if (!eventFormData.endDateTime) errors.endDateTime = 'End date & time is required';
    if (eventFormData.startDateTime && eventFormData.endDateTime) {
      if (new Date(eventFormData.endDateTime) <= new Date(eventFormData.startDateTime)) {
        errors.endDateTime = 'End time must be after start time';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateEvent = () => {
    if (!validateForm()) return;

    const subject = eventFormData.subject + (eventFormData.location ? ` (${eventFormData.location})` : '');
    const newEvent: Activity = {
      activityId: 'event_' + Date.now(),
      subject,
      type: 'event',
      startDateTime: new Date(eventFormData.startDateTime).toISOString(),
      endDateTime: new Date(eventFormData.endDateTime).toISOString(),
      description: eventFormData.description || '',
      status: 'Scheduled',
      priority: 'Normal',
      relatedToType: '',
      relatedToId: '',
      assignedToId: state.user.userId,
      createdDate: new Date().toISOString(),
    };

    updateState({
      activities: [...state.activities, newEvent]
    });

    setShowEventModal(false);
    onShowToast('Event created successfully', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>Calendar</h1>
        <button
          className="btn btn-primary"
          onClick={openNewEventModal}
        >
          <Plus size={18} />
          New Event
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={handlePrevMonth} className="btn btn-secondary">
            <ChevronLeft size={20} />
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={handleNextMonth} className="btn btn-secondary">
            <ChevronRight size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ background: 'var(--bg)', padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>
              {day}
            </div>
          ))}

          {/* Leading empty cells for weekday alignment */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} style={{ background: 'var(--bg)', minHeight: '100px' }} />
          ))}

          {daysInMonth.map(day => {
            const events = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                style={{
                  background: 'white',
                  padding: '8px',
                  minHeight: '100px',
                  cursor: 'pointer',
                  border: isToday ? '2px solid var(--primary)' : 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
                title="Click to create event on this day"
              >
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{format(day, 'd')}</div>
                {events.slice(0, 3).map((event, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'var(--primary)',
                      color: 'white',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {event.subject}
                  </div>
                ))}
                {events.length > 3 && (
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    +{events.length - 3} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Upcoming Events</h3>
        {state.activities.filter(a => a.type === 'event').slice(0, 5).map(event => (
          <div key={event.activityId} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600 }}>{event.subject}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {event.startDateTime ? format(new Date(event.startDateTime), 'MMM d, yyyy h:mm a') : 'No date'}
            </div>
          </div>
        ))}
      </div>

      {/* Event Creation Modal */}
      <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title="Create New Event" size="large">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Subject <span style={{ color: 'var(--error)' }}>*</span></label>
            <input
              type="text"
              className={`form-input${formErrors.subject ? ' error' : ''}`}
              value={eventFormData.subject}
              onChange={(e) => setEventFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Event subject"
            />
            {formErrors.subject && <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>{formErrors.subject}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Start Date &amp; Time <span style={{ color: 'var(--error)' }}>*</span></label>
            <input
              type="datetime-local"
              className={`form-input${formErrors.startDateTime ? ' error' : ''}`}
              value={eventFormData.startDateTime}
              onChange={(e) => setEventFormData(prev => ({ ...prev, startDateTime: e.target.value }))}
            />
            {formErrors.startDateTime && <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>{formErrors.startDateTime}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">End Date &amp; Time <span style={{ color: 'var(--error)' }}>*</span></label>
            <input
              type="datetime-local"
              className={`form-input${formErrors.endDateTime ? ' error' : ''}`}
              value={eventFormData.endDateTime}
              onChange={(e) => setEventFormData(prev => ({ ...prev, endDateTime: e.target.value }))}
            />
            {formErrors.endDateTime && <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>{formErrors.endDateTime}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              value={eventFormData.location}
              onChange={(e) => setEventFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Optional location"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={eventFormData.description}
              onChange={(e) => setEventFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Optional description"
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={() => setShowEventModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateEvent}>
              Create Event
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
