import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'

function getWeekDates(anchorDate) {
  // Monday of the week containing anchorDate
  const d = new Date(anchorDate)
  const day = d.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  const days = []
  for (let i = 0; i < 5; i++) {
    const dd = new Date(d)
    dd.setDate(d.getDate() + i)
    days.push(dd.toISOString().slice(0, 10))
  }
  return days
}

function formatWeekLabel(days) {
  if (!days.length) return ''
  const start = new Date(days[0])
  const end = new Date(days[4])
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

const STATUS_BADGE = {
  'Approved': 'badge-green',
  'Submitted': 'badge-blue',
  'Not Submitted': 'badge-gray',
}

export default function Timecard() {
  const { state, updateClockStatus, addTimeEntry, updateTimeEntry, updateState } = useApp()
  const { showToast } = useToast()
  const [anchorDate, setAnchorDate] = useState(new Date().toISOString().slice(0, 10))
  const [editingCell, setEditingCell] = useState(null) // { entryId, field }
  const [editValue, setEditValue] = useState('')

  const clockStatus = state.clockStatus || {}
  const timeEntries = state.timeEntries || []

  const weekDays = getWeekDates(anchorDate)

  function navWeek(dir) {
    const d = new Date(anchorDate)
    d.setDate(d.getDate() + dir * 7)
    setAnchorDate(d.toISOString().slice(0, 10))
  }

  function getEntryForDay(dateStr) {
    return timeEntries.find(te => te.date === dateStr) || null
  }

  function handleClockToggle() {
    const now = new Date()
    const timeStr = now.toTimeString().slice(0, 5)
    const dateStr = now.toISOString().slice(0, 10)
    if (!clockStatus.isClockedIn) {
      // Clock in
      updateClockStatus({ isClockedIn: true, lastClockIn: now.toISOString(), lastClockOut: null })
      // Add or update today's entry
      const existing = getEntryForDay(dateStr)
      if (existing) {
        updateTimeEntry(existing.id, { clockIn: timeStr, status: 'Not Submitted' })
      } else {
        addTimeEntry({ id: `te-${Date.now()}`, date: dateStr, clockIn: timeStr, clockOut: null, breakMinutes: 60, totalHours: null, status: 'Not Submitted', note: '' })
      }
      showToast(`Clocked in at ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`, 'success')
    } else {
      // Clock out
      updateClockStatus({ isClockedIn: false, lastClockOut: now.toISOString() })
      const entry = getEntryForDay(dateStr)
      if (entry && entry.clockIn) {
        const [ih, im] = entry.clockIn.split(':').map(Number)
        const [oh, om] = timeStr.split(':').map(Number)
        const totalMins = (oh * 60 + om) - (ih * 60 + im) - (entry.breakMinutes || 0)
        const totalHours = Math.max(0, totalMins / 60)
        updateTimeEntry(entry.id, { clockOut: timeStr, totalHours: Math.round(totalHours * 100) / 100 })
      }
      showToast(`Clocked out at ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`, 'success')
    }
  }

  function startEdit(entryId, field, value) {
    setEditingCell({ entryId, field })
    setEditValue(value || '')
  }

  function commitEdit() {
    if (!editingCell) return
    const { entryId, field } = editingCell
    const update = { [field]: editValue }
    // Recalculate hours if clockIn or clockOut changed
    const entry = timeEntries.find(e => e.id === entryId)
    if (entry) {
      const newEntry = { ...entry, ...update }
      if (newEntry.clockIn && newEntry.clockOut) {
        const [ih, im] = newEntry.clockIn.split(':').map(Number)
        const [oh, om] = newEntry.clockOut.split(':').map(Number)
        const totalMins = (oh * 60 + om) - (ih * 60 + im) - (newEntry.breakMinutes || 0)
        update.totalHours = Math.max(0, Math.round((totalMins / 60) * 100) / 100)
      }
    }
    updateTimeEntry(entryId, update)
    setEditingCell(null)
  }

  function handleSubmitTimecard() {
    const weekEntries = weekDays.map(d => getEntryForDay(d)).filter(Boolean)
    const canSubmit = weekEntries.some(e => e.status === 'Not Submitted')
    if (!canSubmit) {
      showToast('No entries to submit', 'warning')
      return
    }
    updateState(prev => ({
      ...prev,
      timeEntries: prev.timeEntries.map(te =>
        weekDays.includes(te.date) && te.status === 'Not Submitted'
          ? { ...te, status: 'Submitted' }
          : te
      ),
    }))
    showToast('Timecard submitted successfully!', 'success')
  }

  function totalWeekHours() {
    return weekDays.reduce((sum, d) => {
      const e = getEntryForDay(d)
      return sum + (e?.totalHours || 0)
    }, 0)
  }

  const canSubmit = weekDays.some(d => {
    const e = getEntryForDay(d)
    return e && e.status === 'Not Submitted'
  })

  function formatClockStatus() {
    if (clockStatus.isClockedIn && clockStatus.lastClockIn) {
      const t = new Date(clockStatus.lastClockIn)
      return `Clocked in since ${t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    }
    return 'Not clocked in'
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Timecard</h1>
      </div>

      {/* Clock In/Out Button */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            {clockStatus.isClockedIn ? '🟢 Currently Clocked In' : '⚫ Not Clocked In'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-gray-medium)', marginTop: 4 }}>
            {formatClockStatus()}
          </div>
        </div>
        <button
          onClick={handleClockToggle}
          className="btn btn-lg"
          style={{
            background: clockStatus.isClockedIn ? 'var(--color-danger)' : 'var(--color-success)',
            color: 'white',
            minWidth: 130,
          }}
        >
          {clockStatus.isClockedIn ? '⏹ Clock Out' : '▶ Clock In'}
        </button>
      </div>

      {/* Week Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navWeek(-1)}>← Previous</button>
        <span style={{ fontWeight: 600 }}>{formatWeekLabel(weekDays)}</span>
        <button className="btn btn-secondary btn-sm" onClick={() => navWeek(1)}>Next →</button>
      </div>

      {/* Timecard Table */}
      <div className="card" style={{ marginBottom: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th className="amount">Break (min)</th>
              <th className="amount">Total Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {weekDays.map((date, i) => {
              const entry = getEntryForDay(date)
              const dayLabel = DAY_NAMES[i]
              const isEditing = (field) => editingCell?.entryId === entry?.id && editingCell?.field === field

              function CellValue({ field, value }) {
                if (!entry) return <span style={{ color: 'var(--color-gray-medium)' }}>—</span>
                if (isEditing(field)) {
                  return (
                    <input
                      type="time"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={e => e.key === 'Enter' && commitEdit()}
                      autoFocus
                      style={{ width: 90, padding: '2px 4px', border: '1px solid var(--color-info)', borderRadius: 4 }}
                    />
                  )
                }
                return (
                  <span
                    style={{ cursor: 'pointer', padding: '2px 4px', borderRadius: 4, transition: 'background 0.1s' }}
                    onClick={() => startEdit(entry.id, field, value)}
                    title="Click to edit"
                    onMouseEnter={e => e.target.style.background = '#F3F4F6'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    {value || '—'}
                  </span>
                )
              }

              return (
                <tr key={date} style={{ background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                  <td style={{ fontWeight: 500 }}>{dayLabel}</td>
                  <td style={{ color: 'var(--color-gray-medium)' }}>{date}</td>
                  <td><CellValue field="clockIn" value={entry?.clockIn} /></td>
                  <td><CellValue field="clockOut" value={entry?.clockOut} /></td>
                  <td className="amount">{entry?.breakMinutes ?? '—'}</td>
                  <td className="amount" style={{ fontWeight: 500 }}>
                    {entry?.totalHours != null ? `${entry.totalHours}h` : '—'}
                  </td>
                  <td>
                    {entry ? (
                      <span className={`badge ${STATUS_BADGE[entry.status] || 'badge-gray'}`}>{entry.status}</span>
                    ) : (
                      <span className="badge badge-gray">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700, background: '#F9FAFB' }}>
              <td colSpan={5}>Total Hours This Week</td>
              <td className="amount">{totalWeekHours().toFixed(2)}h</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmitTimecard}
          disabled={!canSubmit}
          style={{ opacity: canSubmit ? 1 : 0.5 }}
        >
          Submit Timecard
        </button>
      </div>
    </div>
  )
}
