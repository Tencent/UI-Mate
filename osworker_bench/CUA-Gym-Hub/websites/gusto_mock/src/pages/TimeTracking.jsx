import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { getInitials, getAvatarColor } from '../utils/helpers'

const TimeTracking = () => {
  const { state, approveTimeEntry, updateTimeEntry } = useAppContext()
  const [tab, setTab] = useState('team')
  const [selectedEmpId, setSelectedEmpId] = useState(null)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [editingDay, setEditingDay] = useState(null)
  const [editForm, setEditForm] = useState({ clockIn: '', clockOut: '', notes: '' })

  const employees = (state?.employees || []).filter(e => e.status === 'Active')
  const timeEntries = state?.timeEntries || []

  // Calculate week dates
  const getWeekDates = (offset = 0) => {
    const now = new Date('2025-04-07') // Use fixed date for demo
    now.setDate(now.getDate() + offset * 7)
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.toISOString().split('T')[0]
    })
  }

  const weekDates = getWeekDates(currentWeekOffset)
  const weekStart = new Date(weekDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const weekEnd = new Date(weekDates[4]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const selectedEmp = employees.find(e => e.id === selectedEmpId)
  const empEntry = timeEntries.find(te =>
    te.employeeId === selectedEmpId &&
    te.weekStartDate === weekDates[0]
  )

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const handleSaveEdit = () => {
    if (!empEntry || !editingDay) return

    const inTime = editForm.clockIn
    const outTime = editForm.clockOut
    const [inH, inM] = inTime.split(':').map(Number)
    const [outH, outM] = outTime.split(':').map(Number)
    const totalHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60 - 0.5 // 30 min break

    const updatedEntries = empEntry.entries.map(e =>
      e.date === editingDay
        ? { ...e, clockIn: inTime, clockOut: outTime, totalHours: Math.max(0, totalHours), notes: editForm.notes }
        : e
    )
    const newTotal = updatedEntries.reduce((s, e) => s + e.totalHours, 0)

    updateTimeEntry(empEntry.id, {
      entries: updatedEntries,
      totalHours: newTotal,
      regularHours: Math.min(40, newTotal),
      overtimeHours: Math.max(0, newTotal - 40)
    })
    setEditingDay(null)
  }

  return (
    <div className="page-container" style={{ maxWidth: '1100px' }}>
      <div className="page-header">
        <h1 className="page-title">Time Tracking</h1>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'team' ? 'active' : ''}`} onClick={() => setTab('team')}>My team</button>
        <button className={`tab ${tab === 'approvals' ? 'active' : ''}`} onClick={() => setTab('approvals')}>
          Approvals ({timeEntries.filter(te => te.status === 'Pending').length})
        </button>
      </div>

      {tab === 'team' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
          {/* Employee list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content' }}>
            {employees.map(emp => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                  cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  background: selectedEmpId === emp.id ? 'var(--teal-light)' : 'transparent',
                  borderLeft: selectedEmpId === emp.id ? '3px solid var(--teal)' : '3px solid transparent'
                }}
                onMouseEnter={e => { if (selectedEmpId !== emp.id) e.currentTarget.style.background = 'var(--hover-bg)' }}
                onMouseLeave={e => { if (selectedEmpId !== emp.id) e.currentTarget.style.background = 'transparent' }}
              >
                <div className="avatar avatar-sm" style={{ background: getAvatarColor(`${emp.firstName} ${emp.lastName}`) }}>
                  {getInitials(emp.firstName, emp.lastName)}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>{emp.firstName} {emp.lastName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--medium-gray)' }}>{emp.employmentType}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          <div>
            {!selectedEmp ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--medium-gray)' }}>
                Select an employee to view their time entries
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar avatar-sm" style={{ background: getAvatarColor(`${selectedEmp.firstName} ${selectedEmp.lastName}`) }}>
                      {getInitials(selectedEmp.firstName, selectedEmp.lastName)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{selectedEmp.firstName} {selectedEmp.lastName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{weekStart} – {weekEnd}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn-outline btn-sm" onClick={() => setCurrentWeekOffset(o => o - 1)}>← Prev</button>
                    <button className="btn-outline btn-sm" onClick={() => setCurrentWeekOffset(o => o + 1)}>Next →</button>
                    {empEntry && empEntry.status === 'Pending' && (
                      <button className="btn-primary btn-sm" onClick={() => approveTimeEntry(empEntry.id)}>
                        Approve
                      </button>
                    )}
                    {empEntry && <span className={`badge badge-${empEntry.status.toLowerCase()}`}>{empEntry.status}</span>}
                  </div>
                </div>

                {/* Summary */}
                {empEntry && (
                  <div style={{ padding: '12px 20px', background: 'var(--light-gray)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '24px' }}>
                    {[
                      { label: 'Total', value: empEntry.totalHours + 'h' },
                      { label: 'Regular', value: empEntry.regularHours + 'h' },
                      { label: 'Overtime', value: empEntry.overtimeHours + 'h' },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{item.label}</div>
                        <div style={{ fontSize: '18px', fontWeight: '700' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Day table */}
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Hours</th>
                      <th>Breakdown</th>
                      <th>Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekDates.map((date, i) => {
                      const entry = empEntry?.entries?.find(e => e.date === date)
                      const dayName = DAYS[i]
                      const dayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                      return (
                        <tr key={date}>
                          <td>
                            <div style={{ fontWeight: '500' }}>{dayName}</div>
                            <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{dayDate}</div>
                          </td>
                          <td>
                            {entry ? (
                              <div>
                                <div style={{ fontSize: '13px' }}>{entry.clockIn} – {entry.clockOut}</div>
                                <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{entry.totalHours}h</div>
                              </div>
                            ) : '—'}
                          </td>
                          <td>
                            {entry ? (
                              <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>
                                Regular: {Math.min(8, entry.totalHours)}h
                                {entry.totalHours > 8 && `, OT: ${(entry.totalHours - 8).toFixed(1)}h`}
                              </div>
                            ) : '—'}
                          </td>
                          <td style={{ fontSize: '12px', color: 'var(--medium-gray)', maxWidth: '150px' }}>
                            {entry?.notes || '—'}
                          </td>
                          <td>
                            {editingDay === date ? (
                              <div style={{ display: 'flex', gap: '6px', flexDirection: 'column', padding: '8px 0' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <input type="time" value={editForm.clockIn} onChange={e => setEditForm(f => ({ ...f, clockIn: e.target.value }))} style={{ width: '110px', padding: '4px 6px', fontSize: '12px' }} />
                                  <input type="time" value={editForm.clockOut} onChange={e => setEditForm(f => ({ ...f, clockOut: e.target.value }))} style={{ width: '110px', padding: '4px 6px', fontSize: '12px' }} />
                                </div>
                                <input placeholder="Note..." value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} style={{ fontSize: '12px', padding: '4px 6px' }} />
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button className="btn-primary btn-sm" style={{ fontSize: '11px', padding: '3px 8px' }} onClick={handleSaveEdit}>Submit</button>
                                  <button className="btn-outline btn-sm" style={{ fontSize: '11px', padding: '3px 8px' }} onClick={() => setEditingDay(null)}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="btn-outline btn-sm"
                                style={{ fontSize: '11px' }}
                                onClick={() => {
                                  setEditingDay(date)
                                  setEditForm({ clockIn: entry?.clockIn || '08:00', clockOut: entry?.clockOut || '17:00', notes: entry?.notes || '' })
                                }}
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'approvals' && (
        <div>
          <h3 style={{ marginBottom: '16px', color: 'var(--medium-gray)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pending Approvals
          </h3>
          {timeEntries.filter(te => te.status === 'Pending').map(te => {
            const emp = employees.find(e => e.id === te.employeeId)
            return (
              <div key={te.id} className="card" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {emp && (
                    <div className="avatar avatar-sm" style={{ background: getAvatarColor(`${emp.firstName} ${emp.lastName}`) }}>
                      {getInitials(emp.firstName, emp.lastName)}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: '600' }}>{emp ? `${emp.firstName} ${emp.lastName}` : te.employeeId}</div>
                    <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>
                      Week of {new Date(te.weekStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' · '}{te.totalHours}h total ({te.regularHours}h regular, {te.overtimeHours}h OT)
                    </div>
                  </div>
                </div>
                <button className="btn-primary btn-sm" onClick={() => approveTimeEntry(te.id)}>Approve</button>
              </div>
            )
          })}
          {timeEntries.filter(te => te.status === 'Pending').length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--medium-gray)' }}>
              No pending time entry approvals
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TimeTracking
