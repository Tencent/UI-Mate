import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { generateId, EVENT_COLORS } from '../utils/helpers';

export default function AddCalendarModal({ isOpen, onClose, mode }) {
  // mode: 'my' for "My calendars" add, 'other' for "Subscribe to calendar"
  const { dispatch } = useStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#039BE5');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Calendar name is required.');
      return;
    }
    const newCalendar = {
      id: generateId(),
      name: trimmed,
      color,
      visible: true,
      userId: 'u1',
      isDefault: false,
    };
    if (mode === 'other') {
      dispatch({ type: 'ADD_OTHER_CALENDAR', payload: newCalendar });
    } else {
      dispatch({ type: 'ADD_CALENDAR', payload: newCalendar });
    }
    setName('');
    setColor('#039BE5');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setColor('#039BE5');
    setError('');
    onClose();
  };

  const title = mode === 'other' ? 'Subscribe to calendar' : 'Create new calendar';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl"
        style={{ width: '400px', maxWidth: '95vw' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #DADCE0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#3C4043' }}>{title}</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full"
            style={{ color: '#5F6368' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F3F4'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {mode === 'other' ? 'Calendar name or email' : 'Name'}
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder={mode === 'other' ? 'Add calendar name or email' : 'New calendar name'}
              className="w-full mt-1 px-3 py-2 rounded border text-sm outline-none"
              style={{ borderColor: error ? '#D93025' : '#DADCE0', color: '#3C4043' }}
              onFocus={e => e.currentTarget.style.borderColor = '#1A73E8'}
              onBlur={e => e.currentTarget.style.borderColor = error ? '#D93025' : '#DADCE0'}
            />
            {error && <div style={{ fontSize: '12px', color: '#D93025', marginTop: '4px' }}>{error}</div>}
          </div>

          {/* Color picker */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Color
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EVENT_COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: color === c.hex ? '3px solid #1A73E8' : '2px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm rounded font-medium"
              style={{ color: '#1A73E8' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E8F0FE'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm rounded font-medium text-white"
              style={{ backgroundColor: '#1A73E8' }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.92)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              {mode === 'other' ? 'Subscribe' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
