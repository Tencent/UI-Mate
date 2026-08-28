import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import AgendaView from './components/AgendaView';
import EventModal from './components/EventModal';
import EventPopover from './components/EventPopover';
import GoEndpoint from './components/GoEndpoint';
import { mockNow } from './utils/helpers';

// Simple router component since we can't use React Router easily in this constrained env without more setup
const Router = () => {
  const [path, setPath] = useState(window.location.pathname);

  React.useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (path === '/go') {
    return <GoEndpoint />;
  }

  return <CalendarApp />;
};

function CalendarApp() {
  const { state, dispatch } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Popover state
  const [popoverEvent, setPopoverEvent] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleEventClick = (event, e) => {
    // If e is provided, show popover at click position
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      setPopoverPosition({ x: rect.left + rect.width + 10, y: rect.top });
      setPopoverEvent(event);
    } else {
      // Fallback or direct edit
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedDate(mockNow());
    setSelectedEvent(null);
    setIsModalOpen(true);
  };
  
  const handleEditFromPopover = () => {
    setSelectedEvent(popoverEvent);
    setPopoverEvent(null);
    setIsModalOpen(true);
  };
  
  const handleDeleteFromPopover = () => {
    setDeleteTarget(popoverEvent);
    setPopoverEvent(null);
  };

  React.useEffect(() => {
    if (!deleteTarget) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') setDeleteTarget(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [deleteTarget]);

  const filteredEvents = state.events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header onSearch={setSearchQuery} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onCreateEvent={handleCreateClick} />
        
        <main className="flex-1 overflow-hidden relative">
          {state.view === 'month' && (
            <MonthView onEventClick={handleEventClick} onDateClick={handleDateClick} />
          )}
          {(state.view === 'week' || state.view === 'day') && (
            <WeekView onEventClick={handleEventClick} onDateClick={handleDateClick} />
          )}
          {state.view === 'agenda' && (
            <AgendaView onEventClick={handleEventClick} />
          )}

          {/* Search Results Overlay (Simple Implementation) */}
          {searchQuery && (
            <div className="absolute top-0 right-0 w-80 bg-white shadow-xl border-l h-full z-20 p-4 overflow-y-auto">
              <h3 className="font-medium mb-4">Search Results</h3>
              {filteredEvents.length === 0 ? (
                <p className="text-sm text-gray-500">No events found.</p>
              ) : (
                <div className="space-y-2">
                  {filteredEvents.map(e => (
                    <div 
                      key={e.id} 
                      onClick={() => {
                        setSelectedEvent(e);
                        setIsModalOpen(true);
                      }}
                      className="p-2 border rounded hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      <div className="font-medium">{e.title}</div>
                      <div className="text-gray-500 text-xs">{new Date(e.start).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        event={selectedEvent}
        selectedDate={selectedDate}
      />
      
      <EventPopover 
        event={popoverEvent}
        position={popoverPosition}
        onClose={() => setPopoverEvent(null)}
        onEdit={handleEditFromPopover}
        onDelete={handleDeleteFromPopover}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl border border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-2">Delete event?</h3>
            <p className="text-sm text-gray-600 mb-5">This removes "{deleteTarget.title || 'Untitled event'}" from the local calendar state.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm rounded hover:bg-gray-100">Cancel</button>
              <button
                onClick={() => {
                  dispatch({ type: 'DELETE_EVENT', payload: deleteTarget.id });
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
}
