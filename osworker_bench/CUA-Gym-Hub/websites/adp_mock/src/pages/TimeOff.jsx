import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'
import SortableTable from '../components/SortableTable.jsx'

const STATUS_BADGE = {
  Approved: 'badge-green',
  Pending: 'badge-amber',
  Denied: 'badge-red',
  Cancelled: 'badge-gray',
}

export default function TimeOff() {
  const { state, updateTimeOffRequest, updateTimeOffBalance } = useApp()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const balances = state.timeOffBalances || []
  const requests = state.timeOffRequests || []
  const recentRequests = [...requests].sort((a, b) => b.submittedDate.localeCompare(a.submittedDate)).slice(0, 5)

  function handleCancel(req) {
    updateTimeOffRequest(req.id, { status: 'Cancelled', reviewedBy: 'Self', reviewedDate: new Date().toISOString().slice(0, 10) })
    updateTimeOffBalance(req.type, (bal) => ({
      ...bal,
      pendingDays: Math.max(0, (bal.pendingDays || 0) - (req.totalHours / 8)),
    }))
    showToast('Time off request cancelled', 'success')
  }

  function balanceColor(type) {
    return type === 'Vacation' ? 'var(--color-info)' : type === 'Sick' ? 'var(--color-success)' : 'var(--color-warning)'
  }

  const columns = [
    { key: 'type', label: 'Type' },
    {
      key: 'startDate',
      label: 'Dates',
      render: (_, row) => row.startDate === row.endDate ? row.startDate : `${row.startDate} - ${row.endDate}`,
    },
    { key: 'totalHours', label: 'Hours', align: 'right', render: (v) => `${v}h` },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <span className={`badge ${STATUS_BADGE[val] || 'badge-gray'}`}>{val}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        row.status === 'Pending' ? (
          <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleCancel(row) }}>Cancel</button>
        ) : null
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Time Off</h1>
        <p>Manage your time off balances and requests</p>
      </div>

      {/* Balance Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {balances.map(b => {
          const pct = b.totalDays > 0 ? (b.availableDays / b.totalDays) * 100 : 0
          const color = balanceColor(b.type)
          return (
            <div key={b.type} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>{b.type}</div>
              {/* Circular Progress */}
              <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 12px' }}>
                <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 34 * pct / 100} ${2 * Math.PI * 34}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color }}>{b.availableDays}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-gray-medium)' }}>days</div>
                </div>
              </div>
              <div style={{ fontSize: 14 }}><strong style={{ color }}>{b.availableDays}</strong> of <strong>{b.totalDays}</strong> days</div>
              <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginTop: 4 }}>
                Used: {b.usedDays} | Pending: {b.pendingDays}
              </div>
              {b.accrualRate !== 'N/A' && (
                <div style={{ fontSize: 11, color: 'var(--color-gray-medium)', marginTop: 4 }}>Accrues {b.accrualRate}</div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => navigate('/myself/timeoff/request')}>
          + Request Time Off
        </button>
        <button className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={() => navigate('/myself/timeoff/history')}>
          View Full History
        </button>
        <button className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={() => navigate('/myself/timeoff/holidays')}>
          Holiday Calendar
        </button>
      </div>

      {/* Recent Requests */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Recent Requests</h3>
        <SortableTable columns={columns} data={recentRequests} />
      </div>
    </div>
  )
}
