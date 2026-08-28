import React, { useState } from 'react';
import { Search, Calendar, MapPin, Plus, Users, X, Clock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { format, formatDistanceToNow } from 'date-fns';

const EventDetailModal = ({ event, onClose, host, onRSVP, rsvpStatus }) => {
  const goingCount = (event.going || []).length;
  const interestedCount = (event.interested || []).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Cover */}
        <div className="relative h-48 flex-shrink-0">
          <img src={event.cover} alt={event.name} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/80 rounded-full p-1.5 hover:bg-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-2xl font-bold mb-3">{event.name}</h2>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-[15px]">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                <p className="text-[13px] text-gray-500">{format(new Date(event.date), 'h:mm a')} – {event.endDate ? format(new Date(event.endDate), 'h:mm a') : 'TBD'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={16} className="text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-[15px]">{event.location}</p>
              </div>
            </div>

            {host && (
              <div className="flex items-start gap-3">
                <img src={host.avatar} alt={host.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                <div>
                  <p className="text-[13px] text-gray-500">Hosted by</p>
                  <p className="font-semibold text-[15px]">{host.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Attendee counts */}
          <div className="flex items-center gap-4 mb-4 text-[15px]">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Users size={16} />
              <span><strong>{goingCount}</strong> Going</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span>·</span>
              <span><strong>{interestedCount}</strong> Interested</span>
            </div>
          </div>

          {/* RSVP Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => onRSVP(event.id, 'going')}
              className={`flex-1 py-2.5 rounded-md font-semibold text-[15px] transition-colors ${rsvpStatus === 'going' ? 'bg-primary text-white' : 'bg-gray-200 text-[#050505] hover:bg-gray-300'}`}
            >
              Going
            </button>
            <button
              onClick={() => onRSVP(event.id, 'interested')}
              className={`flex-1 py-2.5 rounded-md font-semibold text-[15px] transition-colors ${rsvpStatus === 'interested' ? 'bg-primary text-white' : 'bg-gray-200 text-[#050505] hover:bg-gray-300'}`}
            >
              Interested
            </button>
            <button
              onClick={() => onRSVP(event.id, 'cantgo')}
              className="flex-1 bg-gray-200 text-[#050505] py-2.5 rounded-md font-semibold text-[15px] hover:bg-gray-300 transition-colors"
            >
              Can't Go
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-[17px] mb-2">About</h3>
            <p className="text-[15px] text-[#050505] leading-relaxed">{event.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateEventModal = ({ onClose, onSubmit, currentUser }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    date: '',
    endDate: '',
    category: 'social'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.date) return;
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Create Event</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold mb-1">Event Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Event name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell people what your event is about..."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              placeholder="Where is this event?"
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Start Date & Time *</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">End Date & Time</label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            >
              {['networking', 'social', 'education'].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2.5 rounded-md font-semibold hover:bg-blue-600 text-[15px]"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};

const Events = () => {
  const { state, getUser, currentUser, updateRSVP, addEvent } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeNav, setActiveNav] = useState('Your Events');

  const events = state.events || [];
  const currentUserId = state.currentUser?.id;

  const filteredEvents = events.filter(e =>
    !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRSVP = (eventId, status) => {
    const event = events.find(e => e.id === eventId);
    const currentStatus = event ? getRsvpStatus(event) : null;
    // If clicking the same status, remove it (toggle off); otherwise set new status
    const newStatus = currentStatus === status ? null : status;
    updateRSVP(eventId, newStatus);
  };

  const getRsvpStatus = (event) => {
    if ((event.going || []).includes(currentUserId)) return 'going';
    if ((event.interested || []).includes(currentUserId)) return 'interested';
    return null;
  };

  return (
    <div className="bg-[#F0F2F5] min-h-screen pt-14 flex">
      {/* Left Sidebar */}
      <div className="w-[360px] bg-white h-[calc(100vh-56px)] fixed left-0 overflow-y-auto p-4 shadow-sm hidden lg:block">
        <h2 className="text-2xl font-bold mb-4">Events</h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search events"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 outline-none text-[15px]"
          />
        </div>

        <nav className="space-y-1 mb-4">
          {['Your Events', 'Birthdays', 'Discover'].map((item) => (
            <div
              key={item}
              onClick={() => setActiveNav(item)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer font-medium text-[15px] ${activeNav === item ? 'bg-blue-50 text-primary' : 'hover:bg-gray-100 text-[#050505]'}`}
            >
              {item}
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-200 my-3" />

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-primary text-white py-2.5 rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 text-[15px]"
        >
          <Plus size={18} /> Create Event
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-[360px] p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {activeNav === 'Your Events' ? 'Upcoming Events' :
             activeNav === 'Birthdays' ? 'Birthdays' : 'Discover Events'}
          </h2>
        </div>

        {activeNav === 'Birthdays' ? (
          <div className="text-center py-16 text-gray-500">
            <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-xl font-semibold text-gray-700 mb-1">No upcoming birthdays</p>
            <p className="text-[15px]">Add friends to see their birthdays here</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-xl font-semibold text-gray-700 mb-1">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map(event => {
              const host = getUser(event.hostId);
              const rsvpStatus = getRsvpStatus(event);
              const eventDate = new Date(event.date);
              const month = format(eventDate, 'MMM').toUpperCase();
              const day = format(eventDate, 'd');

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedEvent(event)}
                >
                  {/* Cover with date badge */}
                  <div className="relative h-40">
                    <img src={event.cover} alt={event.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-white rounded-lg overflow-hidden shadow-md text-center w-12">
                      <div className="bg-red-500 text-white text-xs font-bold py-0.5">{month}</div>
                      <div className="text-[#050505] text-xl font-bold py-0.5">{day}</div>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="font-bold text-[17px] mb-1 line-clamp-2">{event.name}</h3>
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-500 mb-1">
                      <Clock size={13} />
                      <span>{format(eventDate, 'EEE, MMM d · h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-500 mb-3">
                      <MapPin size={13} />
                      <span className="truncate">{event.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[13px] text-gray-500 mb-3">
                      <Users size={13} />
                      <span>{(event.going || []).length} going · {(event.interested || []).length} interested</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); handleRSVP(event.id, 'going'); }}
                        className={`flex-1 py-1.5 rounded-md font-semibold text-sm transition-colors ${rsvpStatus === 'going' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        Going
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleRSVP(event.id, 'interested'); }}
                        className={`flex-1 py-1.5 rounded-md font-semibold text-sm transition-colors ${rsvpStatus === 'interested' ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        Interested
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          host={getUser(selectedEvent.hostId)}
          onClose={() => setSelectedEvent(null)}
          onRSVP={handleRSVP}
          rsvpStatus={getRsvpStatus(selectedEvent)}
        />
      )}

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(form) => {
            const newEvent = {
              id: `event_${Date.now()}`,
              name: form.name,
              description: form.description || '',
              cover: `https://picsum.photos/1200/400?random=event_${Date.now()}`,
              hostId: currentUser.id,
              date: new Date(form.date).toISOString(),
              endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
              location: form.location || 'Online',
              interested: [],
              going: [currentUser.id],
              category: form.category
            };
            addEvent(newEvent);
          }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default Events;
