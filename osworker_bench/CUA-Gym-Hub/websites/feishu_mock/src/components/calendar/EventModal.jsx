import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const COLORS = ['#3370FF','#34C724','#FF7D00','#F54A45','#9254DE','#FA8C16','#EB2F96','#13C2C2'];

export default function EventModal({ event, defaultTime, onClose }) {
  const { state, dispatch } = useApp();
  const isEdit = !!event;

  const defStart = defaultTime || new Date();
  const defEnd = new Date(defStart.getTime() + 3600000);

  function toDatetimeLocal(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const [title, setTitle] = useState(event?.title || '');
  const [startTime, setStartTime] = useState(toDatetimeLocal(event?.startTime || defStart));
  const [endTime, setEndTime] = useState(toDatetimeLocal(event?.endTime || defEnd));
  const [isAllDay, setIsAllDay] = useState(event?.isAllDay || false);
  const [location, setLocation] = useState(event?.location || '');
  const [description, setDescription] = useState(event?.description || '');
  const [color, setColor] = useState(event?.color || '#3370FF');
  const [reminder, setReminder] = useState(event?.reminder || 15);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [attendees, setAttendees] = useState(event?.attendees || [{ userId: state.currentUser.id, status: 'accepted' }]);

  const matchingUsers = attendeeSearch
    ? state.users.filter(u => (u.name.includes(attendeeSearch) || u.englishName.toLowerCase().includes(attendeeSearch.toLowerCase())) && !attendees.some(a => a.userId === u.id))
    : [];

  function addAttendee(u) {
    setAttendees(a => [...a, { userId: u.id, status: 'accepted' }]);
    setAttendeeSearch('');
  }

  function removeAttendee(userId) {
    setAttendees(a => a.filter(x => x.userId !== userId));
  }

  function handleSave() {
    if (!title.trim()) return;
    const ev = {
      id: event?.id || `event_${Date.now()}`,
      title: title.trim(),
      description,
      startTime: new Date(startTime).getTime(),
      endTime: new Date(endTime).getTime(),
      isAllDay,
      location,
      meetingLink: event?.meetingLink || '',
      organizerId: state.currentUser.id,
      attendees,
      color,
      reminder,
      isRecurring: false,
      calendarId: event?.calendarId || 'cal_1',
    };
    if (isEdit) {
      dispatch({ type: 'UPDATE_EVENT', payload: ev });
    } else {
      dispatch({ type: 'CREATE_EVENT', payload: ev });
    }
    onClose();
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 480, background: '#fff', borderRadius: 12,
        boxShadow: '0 16px 48px rgba(0,0,0,0.2)', zIndex: 201, padding: 24,
        maxHeight: '80vh', overflowY: 'auto',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1F2329', marginBottom: 20 }}>
          {isEdit ? '编辑日程' : '新建日程'}
        </h2>

        {/* Title */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="添加标题"
          style={inputStyle({ large: true })}
          autoFocus
        />

        {/* All day toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#1F2329' }}>
            <input type="checkbox" checked={isAllDay} onChange={e => setIsAllDay(e.target.checked)} />
            全天
          </label>
        </div>

        {/* Time */}
        {!isAllDay && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#8F959E', marginBottom: 4 }}>开始时间</div>
              <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle()} />
            </div>
            <div style={{ color: '#8F959E', marginTop: 18 }}>—</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#8F959E', marginBottom: 4 }}>结束时间</div>
              <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle()} />
            </div>
          </div>
        )}

        {/* Location */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8F959E', fontSize: 14 }}>📍</span>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="添加地点" style={{ ...inputStyle(), paddingLeft: 30 }} />
        </div>

        {/* Attendees */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: '#8F959E', marginBottom: 6 }}>参与者</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
            {attendees.map(a => {
              const u = state.users.find(u => u.id === a.userId);
              return (
                <div key={a.userId} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                  background: '#F0F1F2', borderRadius: 20, fontSize: 12,
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: u?.avatarColor, color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{u?.initials}</div>
                  {u?.name}
                  {a.userId !== state.currentUser.id && (
                    <button onClick={() => removeAttendee(a.userId)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8F959E', fontSize: 12, lineHeight: 1, padding: 0 }}>✕</button>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              value={attendeeSearch}
              onChange={e => setAttendeeSearch(e.target.value)}
              placeholder="搜索并添加参与者"
              style={inputStyle()}
            />
            {matchingUsers.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #DEE0E3', borderRadius: 6, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {matchingUsers.slice(0, 5).map(u => (
                  <div key={u.id} onClick={() => addAttendee(u)} style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F7'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: u.avatarColor, color: '#fff', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{u.initials}</div>
                    <div>
                      <div style={{ fontSize: 13 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: '#8F959E' }}>{u.department}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="添加描述"
          rows={3}
          style={{ ...inputStyle(), resize: 'none', lineHeight: '20px' }}
        />

        {/* Reminder */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: '#8F959E', marginBottom: 6 }}>提醒</div>
          <select value={reminder} onChange={e => setReminder(Number(e.target.value))} style={inputStyle()}>
            <option value={5}>5分钟前</option>
            <option value={15}>15分钟前</option>
            <option value={30}>30分钟前</option>
            <option value={60}>1小时前</option>
          </select>
        </div>

        {/* Color */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#8F959E', marginBottom: 6 }}>颜色</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{
                width: 24, height: 24, borderRadius: '50%', background: c, border: color === c ? '3px solid #1F2329' : '2px solid transparent',
                cursor: 'pointer',
              }} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '7px 20px', border: '1px solid #DEE0E3', borderRadius: 6, cursor: 'pointer', fontSize: 14, background: '#fff', color: '#646A73' }}>取消</button>
          <button onClick={handleSave} disabled={!title.trim()} style={{
            padding: '7px 20px', border: 'none', borderRadius: 6, cursor: title.trim() ? 'pointer' : 'default',
            fontSize: 14, background: title.trim() ? '#3370FF' : '#DEE0E3', color: '#fff', fontWeight: 500,
          }}>保存</button>
        </div>
      </div>
    </>
  );
}

function inputStyle({ large } = {}) {
  return {
    width: '100%', padding: large ? '10px 12px' : '7px 10px',
    border: '1px solid #DEE0E3', borderRadius: 6,
    fontSize: large ? 16 : 14, outline: 'none', marginBottom: large ? 16 : 0,
    fontFamily: 'inherit',
  };
}
