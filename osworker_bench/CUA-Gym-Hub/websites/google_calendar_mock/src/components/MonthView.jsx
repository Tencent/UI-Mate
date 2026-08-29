import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, format, isWithinInterval, parseISO, setHours, setMinutes, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import clsx from 'clsx';
import { mockNow } from '../utils/helpers';

export default function MonthView({ onEventClick, onDateClick }) {
  const { state, dispatch } = useStore();
  const [notice, setNotice] = useState('');
  const currentDate = new Date(state.currentDate);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Filter events for this view
  const visibleCalendars = state.calendars.filter(c => c.visible).map(c => c.id);
  const rawEvents = state.events.filter(e => visibleCalendars.includes(e.calendarId));

  // Expand recurring events
  const events = [];
  rawEvents.forEach(event => {
    events.push(event); // Add original event

    if (event.recurring && event.recurring !== 'none') {
      let currentEventDate = new Date(event.start);
      // Limit recurrence expansion to the current view range + buffer
      const viewEnd = addMonths(endDate, 1); 
      
      // Simple recurrence expansion logic
      let i = 0;
      while (currentEventDate < viewEnd && i < 365) { // Safety limit
        i++;
        if (event.recurring === 'daily') currentEventDate = addDays(currentEventDate, 1);
        else if (event.recurring === 'weekly') currentEventDate = addWeeks(currentEventDate, 1);
        else if (event.recurring === 'monthly') currentEventDate = addMonths(currentEventDate, 1);
        else if (event.recurring === 'yearly') currentEventDate = addYears(currentEventDate, 1);

        if (currentEventDate > viewEnd) break;

        // Create a virtual event instance
        const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
        const instanceEnd = new Date(currentEventDate.getTime() + duration);

        events.push({
          ...event,
          id: `${event.id}_recur_${i}`, // Virtual ID
          start: currentEventDate.toISOString(),
          end: instanceEnd.toISOString(),
          originalEventId: event.id
        });
      }
    }
  });

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      return isSameDay(day, start) || 
             (isWithinInterval(day, { start, end }) && !isSameDay(day, end));
    });
  };

  const handleDragStart = (e, eventId) => {
    e.dataTransfer.setData('eventId', eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    if (eventId) {
      // Check if it's a virtual recurring instance
      if (eventId.includes('_recur_')) {
        const message = 'Open the recurring event and edit the series to reschedule it.';
        setNotice(message);
        dispatch({ type: 'ADD_NOTICE', payload: { message } });
        return;
      }

      // Preserve the original time, just change the date
      const event = state.events.find(ev => ev.id === eventId);
      if (event) {
        const originalStart = new Date(event.start);
        const newStart = new Date(day);
        newStart.setHours(originalStart.getHours());
        newStart.setMinutes(originalStart.getMinutes());
        
        dispatch({
          type: 'MOVE_EVENT',
          payload: { eventId, newStart: newStart.toISOString() }
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {notice && (
        <div className="flex items-center justify-between px-4 py-2 bg-amber-50 border-b border-amber-200 text-sm text-amber-900">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-amber-700 hover:text-amber-950">Dismiss</button>
        </div>
      )}
      <div className="grid grid-cols-7 border-b border-google-border">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-medium text-text-secondary">
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, mockNow());
          
          return (
            <div 
              key={day.toString()} 
              className={clsx(
                "border-b border-r border-google-border min-h-[100px] p-1 transition-colors hover:bg-gray-50 cursor-pointer",
                !isSameMonth(day, currentDate) && "bg-gray-50/50"
              )}
              onClick={() => onDateClick(day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className="flex justify-center mb-1">
                <span className={clsx(
                  "text-xs w-6 h-6 flex items-center justify-center rounded-full",
                  isToday ? "bg-primary text-white" : "text-text-primary",
                  !isSameMonth(day, currentDate) && !isToday && "text-text-secondary"
                )}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="space-y-1 overflow-hidden max-h-[90px]">
                {dayEvents.slice(0, 4).map(event => (
                  <div
                    key={event.id}
                    draggable={!event.id.includes('_recur_')} // Only original events draggable for simplicity
                    onDragStart={(e) => !event.id.includes('_recur_') && handleDragStart(e, event.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Pass event object AND click event for popover positioning
                      const targetEvent = event.originalEventId 
                        ? state.events.find(ev => ev.id === event.originalEventId) 
                        : event;
                      onEventClick(targetEvent, e);
                    }}
                    className={clsx(
                      "text-xs px-2 py-0.5 rounded truncate cursor-pointer shadow-sm hover:opacity-80",
                      event.color || "bg-blue-500",
                      "text-white",
                      event.allDay && "font-medium"
                    )}
                  >
                    {/* Hide time for all-day events */}
                    {!event.allDay && format(new Date(event.start), 'HH:mm ')}
                    {event.title || '(No title)'}
                  </div>
                ))}
                {dayEvents.length > 4 && (
                  <div className="text-xs text-text-secondary pl-1 hover:text-text-primary">
                    {dayEvents.length - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
