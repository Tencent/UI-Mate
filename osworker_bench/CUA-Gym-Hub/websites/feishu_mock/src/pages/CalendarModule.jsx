import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CalendarSidebar from '../components/calendar/CalendarSidebar';
import CalendarWeekView from '../components/calendar/CalendarWeekView';
import EventModal from '../components/calendar/EventModal';

export default function CalendarModule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEventTime, setNewEventTime] = useState(null);

  function handleCreateEvent(time) {
    setEditingEvent(null);
    setNewEventTime(time);
    setShowEventModal(true);
  }

  function handleEditEvent(event) {
    setEditingEvent(event);
    setNewEventTime(null);
    setShowEventModal(true);
  }

  return (
    <>
      {/* Module Panel — Calendar Sidebar */}
      <div style={{
        width: 240, minWidth: 240, background: '#fff', borderRight: '1px solid #DEE0E3',
        display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
      }}>
        <CalendarSidebar selectedDate={selectedDate} onSelectDate={setSelectedDate} onCreateEvent={() => handleCreateEvent(null)} />
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CalendarWeekView
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onCreateEvent={handleCreateEvent}
          onEditEvent={handleEditEvent}
        />
      </div>

      {showEventModal && (
        <EventModal
          event={editingEvent}
          defaultTime={newEventTime}
          onClose={() => setShowEventModal(false)}
        />
      )}
    </>
  );
}
