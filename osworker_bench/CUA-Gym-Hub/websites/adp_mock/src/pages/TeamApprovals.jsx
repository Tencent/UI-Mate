import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'

export default function TeamApprovals() {
  const { state, updatePendingApproval } = useApp()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [denyModal, setDenyModal] = useState(null)
  const [denyReason, setDenyReason] = useState('')

  const approvals = (state.pendingApprovals || []).filter(a => a.status === 'Pending')
  const timeoffApprovals = approvals.filter(a => a.type === 'timeoff')
  const timecardApprovals = approvals.filter(a => a.type === 'timecard')

  function handleApprove(approval) {
    updatePendingApproval(approval.id, { status: 'Approved', reviewedDate: new Date().toISOString().slice(0, 10) })
    showToast(`Approved ${approval.employeeName}'s request`, 'success')
  }

  function handleDeny(approval, reason) {
    updatePendingApproval(approval.id, { status: 'Denied', denyReason: reason, reviewedDate: new Date().toISOString().slice(0, 10) })
    showToast(`Denied ${approval.employeeName}'s request`, 'warning')
    setDenyModal(null)
    setDenyReason('')
  }

  function ApprovalCard({ approval }) {
    return (
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="avatar avatar-md" style={{ background: '#4B5563' }}>{approval.employeeAvatar}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{approval.employeeName}</div>
              <div style={{ fontSize: 14, color: '#374151' }}>{approval.request}</div>
              {approval.type === 'timeoff' && (
                <div style={{ fontSize: 13, color: 'var(--color-gray-medium)' }}>
                  {approval.startDate} – {approval.endDate} · {approval.totalHours}h
                </div>
              )}
              {approval.type === 'timecard' && (
                <div style={{ fontSize: 13, color: 'var(--color-gray-medium)' }}>
                  Week of {approval.weekStart} · {approval.totalHours}h total
                </div>
              )}
              <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginTop: 2 }}>
                Submitted: {approval.submittedDate}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-success btn-sm" onClick={() => handleApprove(approval)}>✓ Approve</button>
            <button className="btn btn-danger btn-sm" onClick={() => { setDenyModal(approval); setDenyReason('') }}>✕ Deny</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <button className="back-link" onClick={() => navigate('/my-team')}>← Back to My Team</button>
      <div className="page-header">
        <h1>Pending Approvals</h1>
        <p>{approvals.length} item{approvals.length !== 1 ? 's' : ''} awaiting your review</p>
      </div>

      {approvals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 500 }}>All caught up!</div>
          <div style={{ color: 'var(--color-gray-medium)', fontSize: 14 }}>No pending approvals</div>
        </div>
      ) : (
        <>
          {timeoffApprovals.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12 }}>Time Off Requests ({timeoffApprovals.length})</h3>
              {timeoffApprovals.map(a => <ApprovalCard key={a.id} approval={a} />)}
            </div>
          )}
          {timecardApprovals.length > 0 && (
            <div>
              <h3 style={{ marginBottom: 12 }}>Timecard Approvals ({timecardApprovals.length})</h3>
              {timecardApprovals.map(a => <ApprovalCard key={a.id} approval={a} />)}
            </div>
          )}
        </>
      )}

      {denyModal && (
        <div className="modal-overlay" onClick={() => setDenyModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Deny Request</h3>
              <button onClick={() => setDenyModal(null)} style={{ background: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16 }}>Denying <strong>{denyModal.employeeName}</strong>'s {denyModal.type === 'timeoff' ? 'time off' : 'timecard'} request.</p>
              <div className="form-group">
                <label className="form-label">Reason for Denial (optional)</label>
                <textarea
                  value={denyReason}
                  onChange={e => setDenyReason(e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="Provide a reason..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDenyModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDeny(denyModal, denyReason)}>Deny Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
