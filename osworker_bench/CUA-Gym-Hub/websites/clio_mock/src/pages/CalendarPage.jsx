import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { EventModal } from '../components/Modals'

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  return { days, firstWeekday: firstDay.getDay() }
}

function formatDate(d) {
  return d.toISOString().split('T')[0]
}

function formatTimeStr(dateStr) {
  if (!dateStr || !dateStr.includes('T')) return ''
  const t = dateStr.split('T')[1]
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

export default function CalendarPage() {
  const { state, dispatch } = useApp()
  const [view, setView] = useState('Month')
  const [curDate, setCurDate] = useState(new Date())
  const [modal, setModal] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [popoverEvent, setPopoverEvent] = useState(null)

  const today = new Date()
  const todayStr = formatDate(today)

  const getEventDate = (e) => e.startDate?.split('T')[0] || e.startDate

  // Navigate
  const prev = () => {
    const d = new Date(curDate)
    if (view === 'Month') d.setMonth(d.getMonth() - 1)
    else if (view === 'Week') d.setDate(d.getDate() - 7)
    else d.setDate(d.getDate() - 1)
    setCurDate(d)
  }
  const next = () => {
    const d = new Date(curDate)
    if (view === 'Month') d.setMonth(d.getMonth() + 1)
    else if (view === 'Week') d.setDate(d.getDate() + 7)
    else d.setDate(d.getDate() + 1)
    setCurDate(d)
  }

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const title = view === 'Month'
    ? `${monthNames[curDate.getMonth()]} ${curDate.getFullYear()}`
    : view === 'Week'
    ? `Week of ${curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : curDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const { days, firstWeekday } = getMonthDays(curDate.getFullYear(), curDate.getMonth())

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Calendar</h1>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'new' })}><Plus size={14} /> New Event</button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {['Month','Week','Day'].map(v => (
            <button key={v} className={`btn ${view === v ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: v === 'Month' ? '4px 0 0 4px' : v === 'Day' ? '0 4px 4px 0' : 0, borderLeft: v !== 'Month' ? 'none' : undefined }}
              onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
        <button className="btn-icon" onClick={prev}><ChevronLeft size={18} /></button>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E', minWidth: 200, textAlign: 'center' }}>{title}</span>
        <button className="btn-icon" onClick={next}><ChevronRight size={18} /></button>
        <button className="btn btn-secondary btn-sm" onClick={() => setCurDate(new Date())}>Today</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Month View */}
        {view === 'Month' && (
          <>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E0E0E0' }}>
              {dayNames.map(d => (
                <div key={d} style={{ padding: '8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#5F6368', textTransform: 'uppercase' }}>{d}</div>
              ))}
            </div>
            {/* Days grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {/* Padding for first day */}
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div key={`pad-${i}`} style={{ minHeight: 100, borderRight: '1px solid #EEEEEE', borderBottom: '1px solid #EEEEEE', background: '#FAFBFC' }} />
              ))}
              {days.map((day, idx) => {
                const ds = formatDate(day)
                const dayEvents = state.calendarEvents.filter(e => getEventDate(e) === ds)
                const isToday = ds === todayStr
                const isPast = ds < todayStr
                return (
                  <div key={ds} style={{
                    minHeight: 100, borderRight: '1px solid #EEEEEE', borderBottom: '1px solid #EEEEEE',
                    padding: 6, background: isPast ? '#FAFBFC' : '#FFFFFF',
                    cursor: 'pointer'
                  }}
                  onClick={() => setModal({ type: 'new', date: ds })}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isToday ? '#1A73E8' : 'transparent',
                      color: isToday ? '#FFFFFF' : isPast ? '#9AA0A6' : '#1A1A2E',
                      fontSize: 13, fontWeight: isToday ? 700 : 400, marginBottom: 4
                    }}>
                      {day.getDate()}
                    </div>
                    {dayEvents.slice(0, 3).map(ev => (
                      <div key={ev.id}
                        onClick={e => { e.stopPropagation(); setPopoverEvent(ev) }}
                        style={{
                          background: ev.color || '#1A73E8', color: '#fff', borderRadius: 3,
                          padding: '2px 6px', fontSize: 11, marginBottom: 2, cursor: 'pointer',
                          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
                        }}>
                        {!ev.allDay && formatTimeStr(ev.startDate) + ' '}{ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && <div style={{ fontSize: 10, color: '#9AA0A6' }}>+{dayEvents.length - 3} more</div>}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Week View */}
        {view === 'Week' && (
          <WeekView curDate={curDate} events={state.calendarEvents} todayStr={todayStr} onEventClick={setPopoverEvent} onDayClick={(d) => setModal({ type: 'new', date: d })} />
        )}

        {/* Day View */}
        {view === 'Day' && (
          <DayView curDate={curDate} events={state.calendarEvents} todayStr={todayStr} onEventClick={setPopoverEvent} />
        )}
      </div>

      {/* Event Popover */}
      {popoverEvent && (
        <div className="modal-overlay" onClick={() => setPopoverEvent(null)}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{popoverEvent.title}</span>
              <button className="btn-icon" onClick={() => setPopoverEvent(null)}><X size={16} /></button>
            </div>
            <div style={{ fontSize: 13, color: '#5F6368', marginBottom: 8 }}>
              {popoverEvent.allDay ? popoverEvent.startDate : `${formatTimeStr(popoverEvent.startDate)} – ${formatTimeStr(popoverEvent.endDate)}`}
            </div>
            {popoverEvent.location && <div style={{ fontSize: 13, marginBottom: 8 }}>{popoverEvent.location}</div>}
            {popoverEvent.matterDescription && <div style={{ fontSize: 13, color: '#1A73E8', marginBottom: 8 }}>{popoverEvent.matterDescription}</div>}
            {popoverEvent.description && <p style={{ fontSize: 13, marginBottom: 12 }}>{popoverEvent.description}</p>}
            {popoverEvent.attendees?.length > 0 && (
              <div style={{ fontSize: 12, color: '#5F6368', marginBottom: 12 }}>
                Attendees: {popoverEvent.attendees.map(uid => state.users.find(u => u.id === uid)?.name).filter(Boolean).join(', ')}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setModal({ type: 'edit', event: popoverEvent }); setPopoverEvent(null) }}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => { dispatch({ type: 'DELETE_EVENT', payload: popoverEvent.id }); setPopoverEvent(null) }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'new' && <EventModal defaultDate={modal.date} onClose={() => setModal(null)} />}
      {modal?.type === 'edit' && <EventModal event={modal.event} onClose={() => setModal(null)} />}
    </div>
  )
}

function WeekView({ curDate, events, todayStr, onEventClick, onDayClick }) {
  const weekStart = new Date(curDate)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d
  })
  const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM to 8 PM
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', minWidth: 700 }}>
        <div style={{ padding: '8px', borderBottom: '1px solid #E0E0E0', background: '#F5F6FA' }} />
        {weekDays.map((d, i) => {
          const ds = d.toISOString().split('T')[0]
          const isToday = ds === todayStr
          return (
            <div key={i} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #E0E0E0', borderLeft: '1px solid #EEEEEE', background: '#F5F6FA' }}>
              <div style={{ fontSize: 11, color: '#5F6368' }}>{dayNames[i]}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: isToday ? '#1A73E8' : '#1A1A2E', width: 32, height: 32, borderRadius: '50%', background: isToday ? '#E8F0FE' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px auto 0' }}>{d.getDate()}</div>
            </div>
          )
        })}
        {hours.map(h => (
          <React.Fragment key={`row-${h}`}>
            <div style={{ padding: '4px 8px', borderBottom: '1px solid #EEEEEE', textAlign: 'right', fontSize: 11, color: '#9AA0A6', height: 48 }}>
              {h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h-12} PM`}
            </div>
            {weekDays.map((d, i) => {
              const ds = d.toISOString().split('T')[0]
              const dayEvents = events.filter(e => {
                const ed = e.startDate?.split('T')[0] || e.startDate
                if (ed !== ds) return false
                if (e.allDay) return false
                const t = e.startDate?.split('T')[1]
                if (!t) return false
                const eh = parseInt(t.split(':')[0])
                return eh === h
              })
              return (
                <div key={`${h}-${i}`} style={{ borderLeft: '1px solid #EEEEEE', borderBottom: '1px solid #EEEEEE', height: 48, position: 'relative', padding: 2 }}
                  onClick={() => onDayClick(ds)}>
                  {dayEvents.map(ev => (
                    <div key={ev.id} onClick={e => { e.stopPropagation(); onEventClick(ev) }}
                      style={{ background: ev.color || '#1A73E8', color: '#fff', borderRadius: 3, padding: '2px 4px', fontSize: 11, cursor: 'pointer', marginBottom: 2 }}>
                      {ev.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function DayView({ curDate, events, todayStr, onEventClick }) {
  const ds = curDate.toISOString().split('T')[0]
  const dayEvents = events.filter(e => (e.startDate?.split('T')[0] || e.startDate) === ds)
  const hours = Array.from({ length: 14 }, (_, i) => i + 7)

  return (
    <div>
      {dayEvents.filter(e => e.allDay).length > 0 && (
        <div style={{ padding: '8px 12px', background: '#F5F6FA', borderBottom: '1px solid #E0E0E0' }}>
          {dayEvents.filter(e => e.allDay).map(ev => (
            <div key={ev.id} onClick={() => onEventClick(ev)} style={{ background: ev.color, color: '#fff', borderRadius: 3, padding: '4px 8px', fontSize: 12, cursor: 'pointer', display: 'inline-block', marginRight: 8 }}>{ev.title}</div>
          ))}
        </div>
      )}
      {hours.map(h => {
        const timedEvents = dayEvents.filter(e => {
          if (e.allDay) return false
          const t = e.startDate?.split('T')[1]
          if (!t) return false
          return parseInt(t.split(':')[0]) === h
        })
        return (
          <div key={h} style={{ display: 'flex', borderBottom: '1px solid #EEEEEE', minHeight: 60 }}>
            <div style={{ width: 60, padding: '4px 8px', textAlign: 'right', fontSize: 11, color: '#9AA0A6', flexShrink: 0 }}>
              {h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h-12} PM`}
            </div>
            <div style={{ flex: 1, padding: 4 }}>
              {timedEvents.map(ev => (
                <div key={ev.id} onClick={() => onEventClick(ev)} style={{ background: ev.color, color: '#fff', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{ev.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>{ev.description}</div>
                  {ev.location && <div style={{ fontSize: 11, opacity: 0.8 }}>{ev.location}</div>}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
