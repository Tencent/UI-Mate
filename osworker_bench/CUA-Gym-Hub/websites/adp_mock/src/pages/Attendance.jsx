import React from 'react'
import { useApp } from '../context/AppContext.jsx'
import SortableTable from '../components/SortableTable.jsx'

export default function Attendance() {
  const { state } = useApp()
  const timeEntries = state.timeEntries || []

  const currentMonthKey = new Date().toISOString().slice(0, 7)
  const currentMonth = timeEntries.filter(e => e.date.startsWith(currentMonthKey))
  const totalHours = currentMonth.reduce((s, e) => s + (e.totalHours || 0), 0)
  const approvedDays = currentMonth.filter(e => e.status === 'Approved').length
  const submittedDays = currentMonth.filter(e => e.status === 'Submitted').length
  const monthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const sortedEntries = [...timeEntries].sort((a, b) => b.date.localeCompare(a.date))

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'clockIn', label: 'Clock In', render: (v) => v || '\u2014' },
    { key: 'clockOut', label: 'Clock Out', render: (v) => v || '\u2014' },
    { key: 'breakMinutes', label: 'Break (min)', align: 'right', render: (v) => v ?? '\u2014' },
    {
      key: 'totalHours',
      label: 'Hours Worked',
      align: 'right',
      render: (v) => v != null ? `${v}h` : '\u2014',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`badge ${val === 'Approved' ? 'badge-green' : val === 'Submitted' ? 'badge-blue' : 'badge-gray'}`}>
          {val}
        </span>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Attendance</h1>
        <p>{monthLabel} attendance summary</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-info)' }}>{currentMonth.length}</div>
          <div style={{ color: 'var(--color-gray-medium)', fontSize: 14 }}>Days Recorded</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-success)' }}>{totalHours.toFixed(1)}</div>
          <div style={{ color: 'var(--color-gray-medium)', fontSize: 14 }}>Total Hours</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-warning)' }}>{approvedDays + submittedDays}</div>
          <div style={{ color: 'var(--color-gray-medium)', fontSize: 14 }}>Days Approved/Submitted</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Attendance Log</h3>
        <SortableTable columns={columns} data={sortedEntries} />
      </div>
    </div>
  )
}
