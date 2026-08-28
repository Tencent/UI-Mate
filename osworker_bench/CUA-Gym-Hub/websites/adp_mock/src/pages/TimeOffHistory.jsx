import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'
import SortableTable from '../components/SortableTable.jsx'

const STATUS_BADGE = {
  Approved: 'badge-green',
  Pending: 'badge-amber',
  Denied: 'badge-red',
  Cancelled: 'badge-gray',
}

export default function TimeOffHistory() {
  const { state, updateTimeOffRequest, updateTimeOffBalance } = useApp()
  const { showToast } = useToast()
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(null)

  const requests = state.timeOffRequests || []

  const filtered = requests.filter(r => {
    if (filterType && r.type !== filterType) return false
    if (filterStatus && r.status !== filterStatus) return false
    return true
  }).sort((a, b) => b.submittedDate.localeCompare(a.submittedDate))

  function handleCancel(req) {
    updateTimeOffRequest(req.id, { status: 'Cancelled' })
    updateTimeOffBalance(req.type, b => ({
      ...b,
      pendingDays: Math.max(0, (b.pendingDays || 0) - (req.totalHours / 8)),
    }))
    showToast('Request cancelled', 'success')
    setConfirmCancel(null)
  }

  const columns = [
    { key: 'submittedDate', label: 'Submitted', render: (v) => <span style={{ color: 'var(--color-gray-medium)' }}>{v}</span> },
    { key: 'type', label: 'Type' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'totalHours', label: 'Hours', align: 'right', render: (v) => `${v}h` },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <span className={`badge ${STATUS_BADGE[val] || 'badge-gray'}`}>{val}</span>,
    },
    { key: 'reviewedBy', label: 'Reviewed By', render: (v) => <span style={{ color: 'var(--color-gray-medium)' }}>{v || '\u2014'}</span> },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        row.status === 'Pending' ? (
          <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); setConfirmCancel(row) }}>Cancel</button>
        ) : null
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Time Off History</h1>
        <p>All your time off requests</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-input" style={{ width: 140 }}>
          <option value="">All Types</option>
          <option>Vacation</option>
          <option>Sick</option>
          <option>Personal</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input" style={{ width: 140 }}>
          <option value="">All Statuses</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Denied</option>
          <option>Cancelled</option>
        </select>
      </div>

      <div className="card">
        <SortableTable columns={columns} data={filtered} />
      </div>

      {/* Confirm Cancel Modal */}
      {confirmCancel && (
        <div className="modal-overlay" onClick={() => setConfirmCancel(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Time Off Request</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel your {confirmCancel.type} request for {confirmCancel.startDate}
                {confirmCancel.startDate !== confirmCancel.endDate ? ` - ${confirmCancel.endDate}` : ''}?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmCancel(null)}>No, Keep It</button>
              <button className="btn btn-danger" onClick={() => handleCancel(confirmCancel)}>Yes, Cancel Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
