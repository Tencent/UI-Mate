import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CalendarRoute() {
  const { state, actions } = useStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState('Week');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(null);
  const today = addDays(new Date(), weekOffset * 7);
  const startDate = startOfWeek(today);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const hours = Array.from({ length: 11 }).map((_, i) => i + 8); // 8 AM to 6 PM

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="h-12 border-b border-neutral-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-neutral-700">{format(today, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(offset => offset - 1)} className="p-1 hover:bg-neutral-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setWeekOffset(offset => offset + 1)} className="p-1 hover:bg-neutral-100 rounded"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex gap-2">
          {['Day', 'Week', 'Month'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded text-sm font-medium ${viewMode === mode ? 'bg-primary text-white' : 'bg-neutral-100'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Row */}
        <div className="flex border-b border-neutral-200">
          <div className="w-16 border-r border-neutral-200 flex-shrink-0"></div>
          {weekDays.map(day => (
            <div key={day.toString()} className={`flex-1 text-center py-2 border-r border-neutral-200 ${isSameDay(day, today) ? 'bg-blue-50' : ''}`}>
              <div className={`text-xs font-semibold ${isSameDay(day, today) ? 'text-primary' : 'text-neutral-500'}`}>{format(day, 'EEE')}</div>
              <div className={`text-xl ${isSameDay(day, today) ? 'text-primary font-bold' : 'text-neutral-700'}`}>{format(day, 'd')}</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto">
          {hours.map(hour => (
            <div key={hour} className="flex h-20 border-b border-neutral-100">
              <div className="w-16 border-r border-neutral-200 text-xs text-neutral-500 text-right pr-2 pt-2 flex-shrink-0">
                {hour}:00
              </div>
              {weekDays.map(day => {
                // Simple check if any event starts in this hour/day
                const dayEvents = state.events.filter(e => {
                  const eDate = new Date(e.start);
                  return isSameDay(eDate, day) && eDate.getHours() === hour;
                });

                return (
                  <div
                    key={day.toString()}
                    onClick={() => setNewEvent({ date: day, hour, title: '', attendees: '' })}
                    className="flex-1 border-r border-neutral-200 relative p-1"
                  >
                    {dayEvents.map(evt => (
                      <div
                        key={evt.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        className="bg-blue-100 border-l-4 border-primary p-1 rounded text-xs overflow-hidden h-full cursor-pointer hover:bg-blue-200"
                      >
                        <div className="font-semibold text-blue-800">{evt.title}</div>
                        <div className="text-blue-600">{format(new Date(evt.start), 'h:mm a')}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)} className="rounded p-1 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-sm text-neutral-600">{format(new Date(selectedEvent.start), 'PPpp')} - {format(new Date(selectedEvent.end), 'p')}</p>
            <p className="mt-2 text-sm text-neutral-600">Attendees: {selectedEvent.attendees.join(', ') || 'None'}</p>
            <div className="mt-5 flex justify-end">
              <button onClick={() => setSelectedEvent(null)} className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-white">Close</button>
            </div>
          </div>
        </div>
      )}

      {newEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!newEvent.title.trim()) return;
              const start = new Date(newEvent.date);
              start.setHours(newEvent.hour, 0, 0, 0);
              const end = new Date(start);
              end.setHours(start.getHours() + 1);
              actions.createEvent({
                title: newEvent.title.trim(),
                start: start.toISOString(),
                end: end.toISOString(),
                attendees: newEvent.attendees.split(',').map(item => item.trim()).filter(Boolean)
              });
              setNewEvent(null);
            }}
            className="w-96 rounded bg-white p-5 shadow-xl"
          >
            <h3 className="mb-3 text-lg font-semibold">New event</h3>
            <input autoFocus value={newEvent.title} onChange={(event) => setNewEvent(prev => ({ ...prev, title: event.target.value }))} className="mb-3 w-full rounded border border-neutral-300 px-3 py-2 text-sm" placeholder="Title" />
            <input value={newEvent.attendees} onChange={(event) => setNewEvent(prev => ({ ...prev, attendees: event.target.value }))} className="mb-4 w-full rounded border border-neutral-300 px-3 py-2 text-sm" placeholder="Attendees, comma separated" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setNewEvent(null)} className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">Cancel</button>
              <button type="submit" className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-white">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
