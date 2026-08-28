import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import SortableTable from '../components/SortableTable.jsx'

export default function MyTeam() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [selectedEmp, setSelectedEmp] = useState(null)
  const directReports = state.directReports || []

  const columns = [
    {
      key: 'lastName',
      label: 'Employee',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar avatar-sm" style={{ background: '#4B5563' }}>{row.avatar}</div>
          <span style={{ fontWeight: 500 }}>{row.firstName} {row.lastName}</span>
        </div>
      ),
    },
    { key: 'jobTitle', label: 'Job Title', render: (v) => <span style={{ color: 'var(--color-gray-medium)' }}>{v}</span> },
    { key: 'department', label: 'Department', render: (v) => <span style={{ color: 'var(--color-gray-medium)' }}>{v}</span> },
    {
      key: 'email',
      label: 'Email',
      render: (v) => <a href={`mailto:${v}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--color-info)' }}>{v}</a>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <span className="badge badge-green">{v}</span>,
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>My Team</h1>
          <p>Your direct reports -- {directReports.length} team members</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/my-team/approvals')}>
          Pending Approvals ({(state.pendingApprovals || []).filter(a => a.status === 'Pending').length})
        </button>
      </div>

      <div className="card">
        <SortableTable columns={columns} data={directReports} onRowClick={setSelectedEmp} />
      </div>

      {/* Employee Detail Panel */}
      {selectedEmp && (
        <div className="modal-overlay" onClick={() => setSelectedEmp(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Employee Details</h3>
              <button onClick={() => setSelectedEmp(null)} style={{ background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-medium)', border: 'none' }}>x</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                <div className="avatar avatar-lg" style={{ background: '#4B5563' }}>{selectedEmp.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{selectedEmp.firstName} {selectedEmp.lastName}</div>
                  <div style={{ color: 'var(--color-gray-medium)' }}>{selectedEmp.jobTitle}</div>
                </div>
              </div>
              <div>
                <div style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Department:</span>
                  <span style={{ marginLeft: 8 }}>{selectedEmp.department}</span>
                </div>
                <div style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Email:</span>
                  <span style={{ marginLeft: 8 }}>{selectedEmp.email}</span>
                </div>
                <div style={{ padding: '8px 0' }}>
                  <span style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Phone:</span>
                  <span style={{ marginLeft: 8 }}>{selectedEmp.phone}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedEmp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
