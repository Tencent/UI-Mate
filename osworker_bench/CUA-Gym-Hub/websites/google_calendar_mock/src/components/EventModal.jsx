import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, MapPin, AlignLeft, Users, Bell, Trash2, Copy, Repeat, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { generateId, mockNow } from '../utils/helpers';
import { format } from 'date-fns';
import clsx from 'clsx';

// Mock users for the picker
const MOCK_USERS = [
  { email: 'alice@example.com', name: 'Alice Smith', avatar: 'https://picsum.photos/50/50?random=1' },
  { email: 'bob@example.com', name: 'Bob Jones', avatar: 'https://picsum.photos/50/50?random=2' },
  { email: 'charlie@example.com', name: 'Charlie Brown', avatar: 'https://picsum.photos/50/50?random=3' },
  { email: 'david@example.com', name: 'David Lee', avatar: 'https://picsum.photos/50/50?random=4' },
  { email: 'eve@example.com', name: 'Eve Wilson', avatar: 'https://picsum.photos/50/50?random=5' }
];

export default function EventModal({ isOpen, onClose, event, selectedDate }) {
  const { state, dispatch } = useStore();
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    allDay: false,
    location: '',
    description: '',
    calendarId: '',
    guests: [], // Changed to array
    color: 'bg-blue-500',
    recurring: 'none',
    reminders: []
  });
  
  const [guestInput, setGuestInput] = useState('');
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (event) {
        // Edit mode
        setFormData({
          ...event,
          start: event.start.slice(0, 16), // Format for datetime-local
          end: event.end.slice(0, 16),
          guests: event.guests || [],
          recurring: event.recurring || 'none',
          reminders: event.reminders || []
        });
      } else {
        // Create mode
        const defaultStart = selectedDate ? new Date(selectedDate) : mockNow();
        defaultStart.setHours(mockNow().getHours() + 1, 0, 0, 0);
        const defaultEnd = new Date(defaultStart);
        defaultEnd.setMinutes(defaultStart.getMinutes() + (state.settings.defaultDuration || 60));

        setFormData({
          title: '',
          start: defaultStart.toISOString().slice(0, 16),
          end: defaultEnd.toISOString().slice(0, 16),
          allDay: false,
          location: '',
          description: '',
          calendarId: state.calendars[0]?.id || '',
          guests: [],
          color: 'bg-blue-500',
          recurring: 'none',
          reminders: [{ type: 'popup', minutes: 10 }]
        });
      }
      setGuestInput('');
      setShowUserPicker(false);
      setDeletePending(false);
    }
  }, [isOpen, event, selectedDate, state.calendars]);

  // Handle click outside picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowUserPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key !== 'Escape') return;
      if (deletePending) setDeletePending(false);
      else onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [deletePending, isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      ...formData,
      id: event ? event.id : generateId(),
      guests: formData.guests,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString()
    };

    if (event) {
      dispatch({ type: 'UPDATE_EVENT', payload: newEvent });
    } else {
      dispatch({ type: 'ADD_EVENT', payload: newEvent });
    }
    onClose();
  };

  const handleDelete = () => {
    if (event) setDeletePending(true);
  };

  const confirmDelete = () => {
    if (!event) return;
    dispatch({ type: 'DELETE_EVENT', payload: event.id });
    setDeletePending(false);
    onClose();
  };

  const handleDuplicate = () => {
    if (event) {
      const newEvent = {
        ...formData,
        id: generateId(),
        title: `${formData.title} (Copy)`,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString(),
        guests: formData.guests,
      };
      dispatch({ type: 'ADD_EVENT', payload: newEvent });
      onClose();
    }
  };

  // Helper to detect the best display unit for a reminder's minutes value
  const getBestUnit = (minutes) => {
    if (minutes > 0 && minutes % 10080 === 0) return 'weeks';
    if (minutes > 0 && minutes % 1440 === 0) return 'days';
    if (minutes > 0 && minutes % 60 === 0) return 'hours';
    return 'minutes';
  };

  // Helper to get the display value for a given minutes total and unit
  const getDisplayValue = (minutes, unit) => {
    switch (unit) {
      case 'weeks': return minutes / 10080;
      case 'days': return minutes / 1440;
      case 'hours': return minutes / 60;
      default: return minutes;
    }
  };

  // Helper to convert a display value and unit back to total minutes
  const toMinutes = (value, unit) => {
    switch (unit) {
      case 'weeks': return value * 10080;
      case 'days': return value * 1440;
      case 'hours': return value * 60;
      default: return value;
    }
  };

  const addReminder = () => {
    setFormData({
      ...formData,
      reminders: [...formData.reminders, { type: 'popup', minutes: 10 }]
    });
  };

  const removeReminder = (index) => {
    const newReminders = [...formData.reminders];
    newReminders.splice(index, 1);
    setFormData({ ...formData, reminders: newReminders });
  };

  const updateReminder = (index, field, value) => {
    const newReminders = [...formData.reminders];
    newReminders[index] = { ...newReminders[index], [field]: value };
    setFormData({ ...formData, reminders: newReminders });
  };

  // Update reminder when the numeric value changes (convert using current unit)
  const updateReminderValue = (index, displayValue, unit) => {
    const newMinutes = toMinutes(parseInt(displayValue) || 0, unit);
    updateReminder(index, 'minutes', newMinutes);
  };

  // Update reminder when the unit changes (keep same display value, recalculate minutes)
  const updateReminderUnit = (index, newUnit, currentMinutes) => {
    const currentUnit = getBestUnit(currentMinutes);
    const currentDisplayValue = getDisplayValue(currentMinutes, currentUnit);
    const newMinutes = toMinutes(currentDisplayValue, newUnit);
    updateReminder(index, 'minutes', newMinutes);
  };

  const addGuest = (email) => {
    if (email && !formData.guests.includes(email)) {
      setFormData({
        ...formData,
        guests: [...formData.guests, email]
      });
    }
    setGuestInput('');
    setShowUserPicker(false);
  };

  const removeGuest = (email) => {
    setFormData({
      ...formData,
      guests: formData.guests.filter(g => g !== email)
    });
  };

  const filteredUsers = MOCK_USERS.filter(user => 
    !formData.guests.includes(user.email) &&
    (user.name.toLowerCase().includes(guestInput.toLowerCase()) || 
     user.email.toLowerCase().includes(guestInput.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
          <div className="flex gap-2">
            {event && (
              <>
                <button onClick={handleDelete} className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Delete">
                  <Trash2 size={18} />
                </button>
                <button onClick={handleDuplicate} className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Duplicate">
                  <Copy size={18} />
                </button>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <input
            type="text"
            placeholder="Add title"
            required
            className="w-full text-2xl border-b-2 border-gray-200 focus:border-primary outline-none py-1"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="flex items-start gap-4">
            <Clock className="text-gray-400 mt-2" size={20} />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="datetime-local"
                  required
                  className="border rounded p-1 text-sm"
                  value={formData.start}
                  onChange={e => setFormData({ ...formData, start: e.target.value })}
                />
                <span>-</span>
                <input
                  type="datetime-local"
                  required
                  className="border rounded p-1 text-sm"
                  value={formData.end}
                  onChange={e => setFormData({ ...formData, end: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.allDay}
                    onChange={e => setFormData({ ...formData, allDay: e.target.checked })}
                  />
                  All day
                </label>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Repeat size={14} />
                  <select 
                    className="border-none bg-transparent focus:ring-0 cursor-pointer"
                    value={formData.recurring}
                    onChange={e => setFormData({ ...formData, recurring: e.target.value })}
                  >
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-5" /> {/* Spacer for icon alignment */}
            <select
              className="w-full border rounded p-2 text-sm"
              value={formData.calendarId}
              onChange={e => setFormData({ ...formData, calendarId: e.target.value })}
            >
              {state.calendars.map(cal => (
                <option key={cal.id} value={cal.id}>{cal.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <MapPin className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Add location"
              className="w-full border-b border-gray-200 focus:border-primary outline-none py-1 text-sm"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="flex items-start gap-4">
            <Bell className="text-gray-400 mt-1" size={20} />
            <div className="flex-1 space-y-2">
              {formData.reminders.map((reminder, idx) => {
                const unit = getBestUnit(reminder.minutes);
                const displayValue = getDisplayValue(reminder.minutes, unit);
                return (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <select
                      className="border rounded p-1"
                      value={reminder.type}
                      onChange={e => updateReminder(idx, 'type', e.target.value)}
                    >
                      <option value="popup">Notification</option>
                      <option value="email">Email</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      className="border rounded p-1 w-16"
                      value={displayValue}
                      onChange={e => updateReminderValue(idx, e.target.value, unit)}
                    />
                    <select
                      className="border rounded p-1"
                      value={unit}
                      onChange={e => updateReminderUnit(idx, e.target.value, reminder.minutes)}
                    >
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                      <option value="weeks">weeks</option>
                    </select>
                    <span>before</span>
                    <button type="button" onClick={() => removeReminder(idx)} className="text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={addReminder}
                className="text-sm text-primary hover:text-primary-hover font-medium"
              >
                Add notification
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <AlignLeft className="text-gray-400 mt-1" size={20} />
            <textarea
              placeholder="Add description"
              className="w-full border rounded p-2 text-sm h-24 resize-none focus:border-primary outline-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-start gap-4 relative" ref={pickerRef}>
            <Users className="text-gray-400 mt-1" size={20} />
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.guests.map(email => (
                  <div key={email} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 text-xs">
                    <img 
                      src={MOCK_USERS.find(u => u.email === email)?.avatar || `https://ui-avatars.com/api/?name=${email}`} 
                      alt="" 
                      className="w-4 h-4 rounded-full"
                    />
                    <span>{MOCK_USERS.find(u => u.email === email)?.name || email}</span>
                    <button type="button" onClick={() => removeGuest(email)} className="text-gray-500 hover:text-gray-700">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add guests"
                className="w-full border-b border-gray-200 focus:border-primary outline-none py-1 text-sm"
                value={guestInput}
                onChange={e => {
                  setGuestInput(e.target.value);
                  setShowUserPicker(true);
                }}
                onFocus={() => setShowUserPicker(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && guestInput) {
                    e.preventDefault();
                    addGuest(guestInput);
                  }
                }}
              />
              
              {showUserPicker && (
                <div className="absolute top-full left-9 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto z-50">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <button
                        key={user.email}
                        type="button"
                        onClick={() => addGuest(user.email)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />
                        <div className="flex flex-col">
                          <span className="font-medium text-text-primary">{user.name}</span>
                          <span className="text-xs text-text-secondary">{user.email}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    guestInput && (
                      <button
                        type="button"
                        onClick={() => addGuest(guestInput)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-primary"
                      >
                        Add "{guestInput}"
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-hover font-medium"
            >
              Save
            </button>
          </div>
        </form>
      </div>
      {deletePending && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl border border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-2">Delete event?</h3>
            <p className="text-sm text-gray-600 mb-5">This removes "{formData.title || 'Untitled event'}" from the local calendar state.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeletePending(false)} className="px-4 py-2 text-sm rounded hover:bg-gray-100">Cancel</button>
              <button type="button" onClick={confirmDelete} className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
