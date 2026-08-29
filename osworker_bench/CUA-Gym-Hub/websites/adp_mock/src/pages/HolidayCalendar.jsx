import React from 'react'
import { useApp } from '../context/AppContext.jsx'
import SortableTable from '../components/SortableTable.jsx'

export default function HolidayCalendar() {
  const { state } = useApp()
  const holidays = (state.holidays || []).sort((a, b) => a.date.localeCompare(b.date))
  const today = new Date().toISOString().slice(0, 10)
  const nextHoliday = holidays.find(h => h.date >= today)

  const columns = [
    { key: '_num', label: '#', sortable: false, render: (_, row) => {
      const idx = holidays.indexOf(row)
      return <span style={{ color: 'var(--color-gray-medium)' }}>{idx + 1}</span>
    }},
    {
      key: 'date',
      label: 'Date',
      render: (v, row) => <span style={{ fontWeight: nextHoliday === row ? 600 : 400 }}>{v}</span>,
    },
    {
      key: 'dayOfWeek',
      label: 'Day of Week',
      render: (v) => <span style={{ color: 'var(--color-gray-medium)' }}>{v}</span>,
    },
    {
      key: 'name',
      label: 'Holiday',
      render: (v, row) => (
        <span>
          {v}
          {nextHoliday === row && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--color-warning)', fontWeight: 600 }}>Next Holiday</span>}
        </span>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Company Holidays -- 2026</h1>
        <p>Acme Corporation observed holidays</p>
      </div>

      <div className="card">
        <SortableTable
          columns={columns}
          data={holidays}
          rowStyle={(row) => ({
            opacity: row.date < today ? 0.55 : 1,
            background: nextHoliday === row ? '#FFF7ED' : undefined,
          })}
        />
      </div>
    </div>
  )
}
