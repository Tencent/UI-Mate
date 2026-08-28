import React, { useState } from 'react'

const SHIFT = { start: '8:00 AM', end: '5:00 PM', hours: 8, break: '1 hr' }

function getWeekDates(anchor) {
  const d = new Date(anchor)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  const days = []
  for (let i = 0; i < 7; i++) {
    const dd = new Date(d)
    dd.setDate(d.getDate() + i)
    days.push(dd)
  }
  return days
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Schedule() {
  const [anchor, setAnchor] = useState(new Date().toISOString().slice(0, 10))
  const days = getWeekDates(anchor)

  function navWeek(dir) {
    const d = new Date(anchor)
    d.setDate(d.getDate() + dir * 7)
    setAnchor(d.toISOString().slice(0, 10))
  }

  function weekLabel() {
    const start = days[0]
    const end = days[4]
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Schedule</h1>
        <p>Your assigned work schedule</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navWeek(-1)}>← Previous</button>
        <span style={{ fontWeight: 600 }}>{weekLabel()}</span>
        <button className="btn btn-secondary btn-sm" onClick={() => navWeek(1)}>Next →</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
        {days.map((date, i) => {
          const isWeekend = i >= 5
          const isToday = date.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)
          return (
            <div key={i} className="card" style={{
              background: isWeekend ? '#F9FAFB' : 'white',
              border: isToday ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              opacity: isWeekend ? 0.65 : 1,
              textAlign: 'center',
              padding: 16,
            }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: isToday ? 'var(--color-primary)' : 'var(--color-navy)' }}>
                {DAY_NAMES[i]}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginBottom: 8 }}>
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              {isWeekend ? (
                <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Off</div>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{SHIFT.start}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>to</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{SHIFT.end}</div>
                  <div style={{ marginTop: 8 }}>
                    <span className="badge badge-green" style={{ fontSize: 11 }}>{SHIFT.hours}h</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-gray-medium)', marginTop: 4 }}>Break: {SHIFT.break}</div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
