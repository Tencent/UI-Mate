import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import SortableTable from '../components/SortableTable.jsx'

function formatCurrency(n) {
  return n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'
}

export default function PayStatements() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()))
  const allPayStatements = state.payStatements || []
  const payStatements = allPayStatements.filter(pay => pay.payDate.startsWith(yearFilter))

  const columns = [
    {
      key: 'payDate',
      label: 'Pay Date',
      render: (val) => <strong>{val}</strong>,
    },
    {
      key: 'periodStart',
      label: 'Pay Period',
      render: (_, row) => <span style={{ color: 'var(--color-gray-medium)' }}>{row.periodStart} - {row.periodEnd}</span>,
    },
    {
      key: 'grossPay',
      label: 'Gross Pay',
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      key: '_deductions',
      label: 'Deductions',
      align: 'right',
      render: (_, row) => {
        const total = row.deductions ? row.deductions.reduce((s, d) => s + d.current, 0) : 0
        return <span style={{ color: 'var(--color-danger)' }}>-{formatCurrency(total)}</span>
      },
    },
    {
      key: 'netPay',
      label: 'Net Pay',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(val)}</span>,
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Pay Statements</h1>
        <p>View your pay history and download statements</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 14, color: 'var(--color-gray-medium)' }}>Year:</label>
            <select className="form-input" style={{ width: 100 }} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
          <span style={{ fontSize: 13, color: 'var(--color-gray-medium)' }}>{payStatements.length} statements</span>
        </div>

        <SortableTable
          columns={columns}
          data={payStatements}
          onRowClick={(row) => navigate(`/myself/pay/${row.id}`)}
        />
      </div>
    </div>
  )
}
