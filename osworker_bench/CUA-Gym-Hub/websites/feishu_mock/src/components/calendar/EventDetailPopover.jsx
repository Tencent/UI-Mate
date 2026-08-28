import React from 'react';
import { useApp } from '../../context/AppContext';

export default function EventDetailPopover({ event, position, onClose, onEdit }) {
  const { state, dispatch } = useApp();

  const organizer = state.users.find(u => u.id === event.organizerId);
  const attendees = (event.attendees || []).map(a => ({
    ...a,
    user: state.users.find(u => u.id === a.userId),
  }));

  function formatDateTime(ts) {
    const d = new Date(ts);
    return `${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function handleDelete() {
    dispatch({ type: 'DELETE_EVENT', payload: event.id });
    onClose();
  }

  const left = Math.min(position.x, window.innerWidth - 300);
  const top = Math.min(position.y, window.innerHeight - 400);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
      <div style={{
        position: 'fixed', left, top, zIndex: 100,
        background: '#fff', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        border: '1px solid #DEE0E3', width: 300, padding: 16,
      }}>
        {/* Color bar + title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: event.color, marginTop: 3, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 16, color: '#1F2329', lineHeight: '22px' }}>{event.title}</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8F959E', fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>

        {/* Time */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
          <span style={{ color: '#8F959E', fontSize: 14 }}>🕐</span>
          <span style={{ fontSize: 13, color: '#1F2329' }}>
            {event.isAllDay ? '全天' : `${formatDateTime(event.startTime)} - ${formatDateTime(event.endTime)}`}
          </span>
        </div>

        {/* Location */}
        {event.location && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
            <span style={{ color: '#8F959E', fontSize: 14 }}>📍</span>
            <span style={{ fontSize: 13, color: '#1F2329' }}>{event.location}</span>
          </div>
        )}

        {/* Organizer */}
        {organizer && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#8F959E', fontSize: 14 }}>👤</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: organizer.avatarColor, color: '#fff', fontSize: 10, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{organizer.initials}</div>
              <span style={{ fontSize: 13, color: '#1F2329' }}>{organizer.name}（组织者）</span>
            </div>
          </div>
        )}

        {/* Attendees */}
        {attendees.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#8F959E', marginBottom: 6 }}>参与者 ({attendees.length})</div>
            {attendees.slice(0, 5).map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: a.user?.avatarColor || '#8F959E', color: '#fff', fontSize: 9, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{a.user?.initials || '?'}</div>
                <span style={{ flex: 1, fontSize: 12, color: '#1F2329' }}>{a.user?.name || '未知'}</span>
                <span style={{ fontSize: 12, color: a.status === 'accepted' ? '#34C724' : a.status === 'declined' ? '#F54A45' : '#8F959E' }}>
                  {a.status === 'accepted' ? '✓' : a.status === 'declined' ? '✕' : '?'}
                </span>
              </div>
            ))}
            {attendees.length > 5 && (
              <div style={{ fontSize: 12, color: '#8F959E' }}>+{attendees.length - 5} 人</div>
            )}
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div style={{ fontSize: 13, color: '#646A73', marginBottom: 12, borderTop: '1px solid #DEE0E3', paddingTop: 10 }}>
            {event.description}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onEdit}
            style={{ flex: 1, padding: '7px', border: '1px solid #DEE0E3', borderRadius: 6, cursor: 'pointer', fontSize: 13, background: '#fff', color: '#1F2329' }}
          >编辑</button>
          <button
            onClick={handleDelete}
            style={{ flex: 1, padding: '7px', border: '1px solid #F54A45', borderRadius: 6, cursor: 'pointer', fontSize: 13, background: '#fff', color: '#F54A45' }}
          >删除</button>
        </div>
      </div>
    </>
  );
}
