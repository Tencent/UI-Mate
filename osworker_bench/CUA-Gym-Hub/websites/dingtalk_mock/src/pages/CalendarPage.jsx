import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './CalendarPage.css'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8-20

function formatHour(h) { return `${h.toString().padStart(2,'0')}:00` }

function getWeekDates(dateStr) {
  const base = new Date(dateStr)
  const day = base.getDay()
  const monday = new Date(base)
  monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function sameDay(a, b) {
  return a.toDateString() === b.toDateString()
}

export default function CalendarPage() {
  const { state, dispatch } = useApp()
  const [showCreate, setShowCreate] = useState(false)
  const [createTime, setCreateTime] = useState(null)
  const [editEvent, setEditEvent] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const view = state.calendarView || 'week'
  const calDate = state.calendarDate ? new Date(state.calendarDate) : new Date()

  const weekDates = getWeekDates(calDate.toISOString())

  const prevPeriod = () => {
    const d = new Date(calDate)
    if (view === 'week') d.setDate(d.getDate() - 7)
    else if (view === 'month') d.setMonth(d.getMonth() - 1)
    else d.setDate(d.getDate() - 1)
    dispatch({ type: 'SET_CALENDAR_DATE', date: d.toISOString() })
  }

  const nextPeriod = () => {
    const d = new Date(calDate)
    if (view === 'week') d.setDate(d.getDate() + 7)
    else if (view === 'month') d.setMonth(d.getMonth() + 1)
    else d.setDate(d.getDate() + 1)
    dispatch({ type: 'SET_CALENDAR_DATE', date: d.toISOString() })
  }

  const getPeriodLabel = () => {
    if (view === 'month') {
      return `${calDate.getFullYear()}年${calDate.getMonth()+1}月`
    }
    if (view === 'week') {
      const start = weekDates[0]
      const end = weekDates[6]
      return `${start.getFullYear()}年${start.getMonth()+1}月${start.getDate()}日 - ${end.getMonth()+1}月${end.getDate()}日`
    }
    return `${calDate.getFullYear()}年${calDate.getMonth()+1}月${calDate.getDate()}日`
  }

  const getEventsForDay = (date) => {
    return state.calendarEvents.filter(evt => {
      const s = new Date(evt.startTime)
      return sameDay(s, date)
    })
  }

  const handleSlotClick = (date, hour) => {
    const d = new Date(date)
    d.setHours(hour, 0, 0, 0)
    setCreateTime(d.toISOString())
    setShowCreate(true)
  }

  const getEventStyle = (evt) => {
    const start = new Date(evt.startTime)
    const end = new Date(evt.endTime)
    const startH = start.getHours() + start.getMinutes() / 60
    const endH = end.getHours() + end.getMinutes() / 60
    const top = (startH - 8) * 60 // px per hour = 60
    const height = Math.max((endH - startH) * 60, 20)
    return { top, height }
  }

  return (
    <div className="calendar-page">
      {/* Header */}
      <div className="cal-header">
        <button className="icon-btn" onClick={prevPeriod}>◀</button>
        <span className="cal-period-label">{getPeriodLabel()}</span>
        <button className="icon-btn" onClick={nextPeriod}>▶</button>
        <button className="btn btn-default" style={{ fontSize: 12, padding: '4px 10px', marginLeft: 8 }}
          onClick={() => dispatch({ type: 'SET_CALENDAR_DATE', date: new Date().toISOString() })}>
          今天
        </button>
        <div className="view-toggle">
          {['day','week','month'].map(v => (
            <button key={v} className={`view-btn ${view === v ? 'view-btn-active' : ''}`}
              onClick={() => dispatch({ type: 'SET_CALENDAR_VIEW', view: v })}>
              {v === 'day' ? '日' : v === 'week' ? '周' : '月'}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" style={{ marginLeft: 8, fontSize: 13, padding: '6px 14px' }}
          onClick={() => setShowCreate(true)}>
          + 新建日程
        </button>
      </div>

      {/* Calendar body */}
      <div className="cal-body">
        {view === 'week' && (
          <WeekView
            weekDates={weekDates}
            events={state.calendarEvents}
            getEventsForDay={getEventsForDay}
            getEventStyle={getEventStyle}
            onSlotClick={handleSlotClick}
            onEventClick={setSelectedEvent}
          />
        )}
        {view === 'day' && (
          <DayView
            date={calDate}
            events={getEventsForDay(calDate)}
            getEventStyle={getEventStyle}
            onSlotClick={(h) => handleSlotClick(calDate, h)}
            onEventClick={setSelectedEvent}
          />
        )}
        {view === 'month' && (
          <MonthView
            date={calDate}
            events={state.calendarEvents}
            onEventClick={setSelectedEvent}
            onDayClick={(d) => { setCreateTime(new Date(d).toISOString()); setShowCreate(true) }}
          />
        )}
      </div>

      {showCreate && (
        <CreateEventModal
          defaultTime={createTime}
          initialEvent={editEvent}
          onClose={() => { setShowCreate(false); setCreateTime(null); setEditEvent(null) }}
          users={state.users}
        />
      )}

      {selectedEvent && (
        <EventDetailPopover
          event={selectedEvent}
          users={state.users}
          onClose={() => setSelectedEvent(null)}
          onEdit={(evt) => { setSelectedEvent(null); setEditEvent(evt); setShowCreate(true); setCreateTime(evt.startTime) }}
          onDelete={(id) => { dispatch({ type: 'DELETE_EVENT', id }); setSelectedEvent(null) }}
        />
      )}
    </div>
  )
}

function WeekView({ weekDates, getEventsForDay, getEventStyle, onSlotClick, onEventClick }) {
  const today = new Date()
  const weekDays = ['周一','周二','周三','周四','周五','周六','周日']

  return (
    <div className="week-view">
      {/* Day header row */}
      <div className="week-header">
        <div className="time-gutter" />
        {weekDates.map((d, i) => (
          <div key={i} className={`week-day-header ${sameDay(d, today) ? 'today' : ''}`}>
            <div className="week-day-name">{weekDays[i]}</div>
            <div className={`week-day-num ${sameDay(d, today) ? 'today-circle' : ''}`}>{d.getDate()}</div>
          </div>
        ))}
      </div>
      {/* Time grid */}
      <div className="week-grid">
        {/* Hour rows */}
        <div className="time-col">
          {HOURS.map(h => (
            <div key={h} className="time-slot">{formatHour(h)}</div>
          ))}
        </div>
        {/* Day columns */}
        {weekDates.map((d, di) => {
          const dayEvts = getEventsForDay(d).filter(e => !e.isAllDay)
          return (
            <div key={di} className={`day-col ${sameDay(d, new Date()) ? 'today-col' : ''}`}>
              {HOURS.map(h => (
                <div key={h} className="hour-cell" onClick={() => onSlotClick(d, h)} />
              ))}
              {dayEvts.map(evt => {
                const { top, height } = getEventStyle(evt)
                return (
                  <div
                    key={evt.id}
                    className="cal-event"
                    style={{ top, height, background: evt.color || 'var(--primary)', position: 'absolute', left: 2, right: 2 }}
                    onClick={e => { e.stopPropagation(); onEventClick(evt) }}
                  >
                    <div className="cal-event-title">{evt.title}</div>
                    <div className="cal-event-time">{new Date(evt.startTime).getHours().toString().padStart(2,'0')}:{new Date(evt.startTime).getMinutes().toString().padStart(2,'0')}</div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DayView({ date, events, getEventStyle, onSlotClick, onEventClick }) {
  return (
    <div className="day-view">
      <div className="time-col">
        {HOURS.map(h => <div key={h} className="time-slot">{formatHour(h)}</div>)}
      </div>
      <div className="day-col-single">
        {HOURS.map(h => <div key={h} className="hour-cell" onClick={() => onSlotClick(h)} />)}
        {events.filter(e => !e.isAllDay).map(evt => {
          const { top, height } = getEventStyle(evt)
          return (
            <div key={evt.id} className="cal-event" style={{ top, height, background: evt.color, position: 'absolute', left: 2, right: 2 }}
              onClick={e => { e.stopPropagation(); onEventClick(evt) }}>
              <div className="cal-event-title">{evt.title}</div>
              <div className="cal-event-time">{new Date(evt.startTime).getHours().toString().padStart(2,'0')}:{new Date(evt.startTime).getMinutes().toString().padStart(2,'0')} - {new Date(evt.endTime).getHours().toString().padStart(2,'0')}:{new Date(evt.endTime).getMinutes().toString().padStart(2,'0')}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthView({ date, events, onEventClick, onDayClick }) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const weekDays = ['日','一','二','三','四','五','六']

  const emptyBefore = firstDay

  const getMonthEvts = (day) => {
    const d = new Date(year, month, day)
    return events.filter(evt => sameDay(new Date(evt.startTime), d))
  }

  return (
    <div className="month-view">
      <div className="month-header">
        {weekDays.map(d => <div key={d} className="month-day-name">{d}</div>)}
      </div>
      <div className="month-grid">
        {Array(emptyBefore).fill(null).map((_, i) => <div key={`e${i}`} className="month-cell empty" />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
          const evts = getMonthEvts(day)
          return (
            <div key={day} className={`month-cell ${isToday ? 'today' : ''}`} onClick={() => onDayClick(new Date(year, month, day).toISOString())}>
              <div className={`month-day-num ${isToday ? 'today-circle' : ''}`}>{day}</div>
              {evts.slice(0, 3).map(evt => (
                <div key={evt.id} className="month-event" style={{ background: evt.color }}
                  onClick={e => { e.stopPropagation(); onEventClick(evt) }}>
                  {evt.title}
                </div>
              ))}
              {evts.length > 3 && <div className="month-more">+{evts.length - 3}更多</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CreateEventModal({ defaultTime, initialEvent, onClose, users }) {
  const { dispatch, state } = useApp()
  const isEditing = !!initialEvent
  const defaultStart = initialEvent ? new Date(initialEvent.startTime) : (defaultTime ? new Date(defaultTime) : new Date())
  const defaultEnd = initialEvent ? new Date(initialEvent.endTime) : (() => { const d = new Date(defaultStart); d.setHours(d.getHours() + 1); return d })()

  const toDateTimeLocal = (d) => {
    const pad = n => n.toString().padStart(2,'0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const [form, setForm] = useState({
    title: initialEvent?.title || '',
    startTime: toDateTimeLocal(defaultStart),
    endTime: toDateTimeLocal(defaultEnd),
    location: initialEvent?.location || '',
    participantIds: initialEvent?.participantIds || [],
    color: initialEvent?.color || '#1890FF',
    isAllDay: initialEvent?.isAllDay || false,
    reminder: initialEvent?.reminder ?? 15,
    description: initialEvent?.description || '',
    recurrence: initialEvent?.recurrence || null,
  })

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const COLORS = ['#1890FF','#FA8C16','#52C41A','#F5222D','#722ED1','#4CAF50','#FF9800','#EB2F96']

  const handleSave = () => {
    if (!form.title.trim()) return
    const toISO = (dtl) => new Date(dtl).toISOString()
    if (isEditing) {
      dispatch({
        type: 'UPDATE_EVENT',
        event: { ...initialEvent, ...form, startTime: toISO(form.startTime), endTime: toISO(form.endTime) }
      })
    } else {
      dispatch({
        type: 'CREATE_EVENT',
        event: { ...form, startTime: toISO(form.startTime), endTime: toISO(form.endTime) }
      })
    }
    onClose()
  }

  const toggleParticipant = (id) => {
    setF('participantIds', form.participantIds.includes(id)
      ? form.participantIds.filter(x => x !== id)
      : [...form.participantIds, id]
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3>{isEditing ? '编辑日程' : '新建日程'}</h3>
          <button onClick={onClose} style={{ fontSize: 18, cursor: 'pointer', color: '#8F959E' }}>✕</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: 12 }}>
            <input value={form.title} onChange={e => setF('title', e.target.value)} placeholder="日程标题 *" className="form-input" style={{ fontSize: 16, fontWeight: 600 }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isAllDay} onChange={e => setF('isAllDay', e.target.checked)} />全天
            </label>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>开始时间</label>
              <input type={form.isAllDay ? 'date' : 'datetime-local'} value={form.startTime} onChange={e => setF('startTime', e.target.value)} className="form-input" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>结束时间</label>
              <input type={form.isAllDay ? 'date' : 'datetime-local'} value={form.endTime} onChange={e => setF('endTime', e.target.value)} className="form-input" />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>地点</label>
            <input value={form.location} onChange={e => setF('location', e.target.value)} placeholder="会议室或线上链接" className="form-input" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>颜色</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setF('color', c)}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid rgba(0,0,0,0.3)' : '2px solid transparent', transition: 'border 0.1s' }} />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>提醒</label>
            <select value={form.reminder} onChange={e => setF('reminder', parseInt(e.target.value))} className="form-select" style={{ width: 'auto' }}>
              {[{v:0,l:'无'},{v:5,l:'5分钟前'},{v:15,l:'15分钟前'},{v:30,l:'30分钟前'},{v:60,l:'1小时前'}].map(o => (
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>参与人</label>
            <div style={{ maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 4 }}>
              {state.users.map(u => (
                <div key={u.id} onClick={() => toggleParticipant(u.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: 'pointer', background: form.participantIds.includes(u.id) ? '#EBF4FF' : 'transparent' }}>
                  <input type="checkbox" checked={form.participantIds.includes(u.id)} onChange={() => {}} />
                  <div className="avatar-circle avatar-sm" style={{ background: u.avatar }}>{u.name.charAt(0)}</div>
                  <span style={{ fontSize: 13 }}>{u.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>备注</label>
            <textarea value={form.description} onChange={e => setF('description', e.target.value)} placeholder="日程备注" className="form-textarea" style={{ minHeight: 60 }} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!form.title.trim()}>保存</button>
        </div>
      </div>
    </div>
  )
}

function EventDetailPopover({ event, users, onClose, onEdit, onDelete }) {
  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  const participants = users.filter(u => event.participantIds.includes(u.id))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 8, padding: 20, width: 320,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)', position: 'fixed',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1000
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: event.color, marginTop: 4, flexShrink: 0 }} />
          <div style={{ flex: 1, margin: '0 8px' }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{event.title}</div>
          </div>
          <button onClick={onClose} style={{ fontSize: 16, cursor: 'pointer', color: '#8F959E', border: 'none', background: 'none' }}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
          🕐 {start.toLocaleDateString('zh-CN')} {start.getHours().toString().padStart(2,'0')}:{start.getMinutes().toString().padStart(2,'0')} - {end.getHours().toString().padStart(2,'0')}:{end.getMinutes().toString().padStart(2,'0')}
        </div>
        {event.location && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>📍 {event.location}</div>}
        {participants.length > 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
            👥 {participants.map(u => u.name).join('、')}
          </div>
        )}
        {event.description && <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 8 }}>{event.description}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button className="btn btn-default" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => onEdit(event)}>编辑</button>
          <button className="btn btn-default" style={{ fontSize: 12, padding: '4px 12px', color: 'var(--error)' }} onClick={() => onDelete(event.id)}>删除</button>
        </div>
      </div>
    </div>
  )
}
