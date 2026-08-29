import React, { useRef, useEffect } from 'react';
import { X, Clock, MapPin, Edit2, Trash2, Calendar as CalendarIcon, Users, Video, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../context/StoreContext';

export default function EventPopover({ event, position, onClose, onEdit, onDelete }) {
  const popoverRef = useRef(null);
  const { state } = useStore();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!event) return null;

  const calendar = state.calendars.find(c => c.id === event.calendarId);
  const color = event.color?.startsWith('#') ? event.color : (calendar?.color || '#039BE5');

  const style = {
    top: position.y,
    left: position.x,
  };

  // Adjust position if it goes off screen
  if (position.x + 340 > window.innerWidth) {
    style.left = window.innerWidth - 350;
  }
  if (position.y + 280 > window.innerHeight) {
    style.top = window.innerHeight - 300;
  }
  if (style.top < 64) style.top = 64;
  if (style.left < 8) style.left = 8;

  return (
    <div
      ref={popoverRef}
      style={{
        ...style,
        position: 'fixed',
        zIndex: 60,
        width: '340px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12), 0 5px 5px -3px rgba(0,0,0,.2)',
        border: '1px solid #E8EAED',
        overflow: 'hidden',
      }}
    >
      {/* Colored strip + action buttons */}
      <div
        style={{ backgroundColor: color, height: '8px', borderRadius: '8px 8px 0 0' }}
      />

      <div style={{ padding: '12px 16px 0 16px', display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
        <button
          onClick={onEdit}
          style={{ padding: '6px', borderRadius: '50%', color: '#5F6368', border: 'none', background: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F3F4'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={onDelete}
          style={{ padding: '6px', borderRadius: '50%', color: '#5F6368', border: 'none', background: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F3F4'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={onClose}
          style={{ padding: '6px', borderRadius: '50%', color: '#5F6368', border: 'none', background: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F3F4'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '8px 16px 16px 16px' }}>
        {/* Title + color dot */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: color, flexShrink: 0, marginTop: '5px' }} />
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 400, color: '#3C4043', lineHeight: 1.2, marginBottom: '4px' }}>
              {event.title || '(No title)'}
            </h3>
            <div style={{ fontSize: '13px', color: '#3C4043' }}>
              {format(new Date(event.start), 'EEEE, MMMM d')}
              {!event.allDay && (
                <span> · {format(new Date(event.start), 'h:mm a')} – {format(new Date(event.end), 'h:mm a')}</span>
              )}
              {event.allDay && <span> · All day</span>}
            </div>
          </div>
        </div>

        {/* Recurring */}
        {event.recurring && event.recurring !== 'none' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <RefreshCw size={16} style={{ color: '#5F6368', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#3C4043' }}>
              {event.recurring === 'daily' ? 'Every day' : event.recurring === 'weekly' ? 'Every week' : event.recurring === 'monthly' ? 'Every month' : 'Every year'}
            </span>
          </div>
        )}

        {/* Location */}
        {event.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <MapPin size={16} style={{ color: '#5F6368', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#3C4043' }}>{event.location}</span>
          </div>
        )}

        {/* Meet Link */}
        {event.meetLink && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Video size={16} style={{ color: '#5F6368', flexShrink: 0 }} />
            <a
              href={event.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '13px', color: '#1A73E8', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Join Google Meet
            </a>
          </div>
        )}

        {/* Guests */}
        {event.guests && event.guests.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
            <Users size={16} style={{ color: '#5F6368', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: '#3C4043' }}>
              {event.guests.length} guest{event.guests.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Calendar */}
        {calendar && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <CalendarIcon size={16} style={{ color: '#5F6368', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#3C4043' }}>{calendar.name}</span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#F8F9FA', borderRadius: '4px' }}>
            <p style={{ fontSize: '13px', color: '#3C4043', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {event.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
