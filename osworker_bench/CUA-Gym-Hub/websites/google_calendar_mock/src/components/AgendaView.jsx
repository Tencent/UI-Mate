import React from 'react';
import { useStore } from '../context/StoreContext';
import { format, isSameDay, compareAsc, addDays, addWeeks, addMonths, addYears, startOfDay, endOfDay } from 'date-fns';
import { mockNow } from '../utils/helpers';

// Show events for the next 90 days from the current date
const AGENDA_DAYS = 90;

function expandRecurringEvents(rawEvents, viewStart, viewEnd) {
  const events = [];
  const extendedEnd = addDays(viewEnd, 7);

  rawEvents.forEach(event => {
    const eventStart = new Date(event.start);
    // Only include if this event starts before view end
    if (eventStart >= viewStart && eventStart <= viewEnd) {
      events.push(event);
    }

    if (event.recurring && event.recurring !== 'none') {
      let currentDate = new Date(event.start);
      let i = 0;
      while (currentDate <= extendedEnd && i < 400) {
        i++;
        if (event.recurring === 'daily') currentDate = addDays(currentDate, 1);
        else if (event.recurring === 'weekly') currentDate = addWeeks(currentDate, 1);
        else if (event.recurring === 'monthly') currentDate = addMonths(currentDate, 1);
        else if (event.recurring === 'yearly') currentDate = addYears(currentDate, 1);

        if (currentDate > extendedEnd) break;

        // Only push if it falls within our view window
        if (currentDate >= viewStart && currentDate <= viewEnd) {
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
    }
  });
  return events;
}

export default function AgendaView({ onEventClick }) {
  const { state } = useStore();

  const currentDate = new Date(state.currentDate);
  const viewStart = startOfDay(currentDate);
  const viewEnd = endOfDay(addDays(currentDate, AGENDA_DAYS));

  const visibleCalendars = state.calendars.filter(c => c.visible).map(c => c.id);
  const rawEvents = state.events.filter(e => visibleCalendars.includes(e.calendarId));

  const events = expandRecurringEvents(rawEvents, viewStart, viewEnd)
    .sort((a, b) => compareAsc(new Date(a.start), new Date(b.start)));

  // Group by day
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = format(new Date(event.start), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  const getEventColor = (event) => {
    if (event.color && event.color.startsWith('#')) return event.color;
    const cal = state.calendars.find(c => c.id === event.calendarId);
    return cal?.color || '#039BE5';
  };

  return (
    <div className="h-full overflow-y-auto bg-white p-4 max-w-4xl mx-auto">
      {Object.keys(groupedEvents).length === 0 ? (
        <div className="text-center mt-10" style={{ color: '#70757A' }}>
          No events found in the next {AGENDA_DAYS} days.
        </div>
      ) : (
        Object.keys(groupedEvents).map(dateKey => {
          const date = new Date(dateKey);
          const dayEvents = groupedEvents[dateKey];
          const isToday = isSameDay(date, mockNow());

          return (
            <div key={dateKey} className="flex gap-4 mb-6">
              <div className="w-24 flex-shrink-0 text-right pt-1">
                <div style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: isToday ? '#1A73E8' : '#70757A', letterSpacing: '0.05em' }}>
                  {format(date, 'EEE')}
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 400,
                    color: isToday ? '#fff' : '#3C4043',
                    display: isToday ? 'flex' : 'block',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: isToday ? '40px' : 'auto',
                    height: isToday ? '40px' : 'auto',
                    borderRadius: isToday ? '50%' : '0',
                    backgroundColor: isToday ? '#1A73E8' : 'transparent',
                    marginLeft: isToday ? 'auto' : '0',
                  }}
                >
                  {format(date, 'd')}
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {dayEvents.map(event => {
                  const color = getEventColor(event);
                  return (
                    <div
                      key={event.id}
                      onClick={() => {
                        const targetEvent = event.originalEventId
                          ? state.events.find(ev => ev.id === event.originalEventId)
                          : event;
                        onEventClick(targetEvent);
                      }}
                      className="flex items-center gap-4 p-3 rounded-lg cursor-pointer"
                      style={{ border: '1px solid transparent', transition: 'all 0.15s' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#F8F9FA';
                        e.currentTarget.style.borderColor = '#DADCE0';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                      <div style={{ width: '120px', fontSize: '13px', color: '#70757A', flexShrink: 0 }}>
                        {event.allDay ? 'All day' : format(new Date(event.start), 'h:mm a')}
                      </div>
                      <div className="flex-1">
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#3C4043' }}>{event.title || '(No title)'}</div>
                        {event.location && (
                          <div style={{ fontSize: '12px', color: '#70757A' }}>{event.location}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
