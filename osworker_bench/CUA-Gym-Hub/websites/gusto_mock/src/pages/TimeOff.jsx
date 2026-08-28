import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { getInitials, getAvatarColor, formatDate } from '../utils/helpers'

const TimeOff = () => {
  const { state, approveTimeOff, denyTimeOff, addTimeOffRequest } = useAppContext()
  const [tab, setTab] = useState('pending')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    employeeId: '',
    type: 'Vacation',
    startDate: '',
    endDate: '',
    reason: ''
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const toast = (msg) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const requests = state?.timeOffRequests || []
  const pending = requests.filter(r => r.status === 'Pending')
  const upcoming = requests.filter(r => r.status === 'Approved' && new Date(r.startDate) >= new Date('2025-04-10'))
  const all = [...requests].sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
  const employees = state?.employees || []

  const getEmp = (id) => employees.find(e => e.id === id)

  const typeClass = (type) => {
    if (type === 'Vacation') return 'badge-vacation'
    if (type === 'Sick') return 'badge-sick'
    if (type === 'Personal') return 'badge-personal'
    return 'badge-holiday'
  }

  const handleApprove = (id) => {
    approveTimeOff(id)
    toast('Time off approved')
  }

  const handleDeny = (id) => {
    denyTimeOff(id)
    toast('Time off denied')
  }

  const handleCreateRequest = () => {
    const emp = employees.find(e => e.id === createForm.employeeId)
    if (!emp || !createForm.startDate || !createForm.endDate) return

    const start = new Date(createForm.startDate + 'T00:00:00')
    const end = new Date(createForm.endDate + 'T00:00:00')
    const days = Math.max(1, Math.ceil((end - start) / 86400000) + 1)
    // Only count weekdays
    let weekdays = 0
    const d = new Date(start)
    while (d <= end) {
      const dow = d.getDay()
      if (dow !== 0 && dow !== 6) weekdays++
      d.setDate(d.getDate() + 1)
    }
    const totalHours = weekdays * 8

    const newRequest = {
      id: `tor_${Date.now()}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      type: createForm.type,
      startDate: createForm.startDate,
      endDate: createForm.endDate,
      totalHours,
      status: 'Pending',
      reason: createForm.reason,
      requestedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null
    }

    addTimeOffRequest(newRequest)
    setShowCreateModal(false)
    setCreateForm({ employeeId: '', type: 'Vacation', startDate: '', endDate: '', reason: '' })
    toast('Time off request created')
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Time Off</h1>
          {pending.length > 0 && (
            <p className="page-subtitle">{pending.length} pending request{pending.length !== 1 ? 's' : ''} need your review</p>
          )}
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Request time off
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          Pending ({pending.length})
        </button>
        <button className={`tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>
          Upcoming ({upcoming.length})
        </button>
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          All Requests ({all.length})
        </button>
      </div>

      {/* Pending Requests */}
      {tab === 'pending' && (
        <>
          {pending.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--medium-gray)' }}>
              No pending requests
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pending.map(req => {
                const emp = getEmp(req.employeeId)
                return (
                  <div key={req.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      {emp && (
                        <div className="avatar avatar-md" style={{ background: getAvatarColor(`${emp.firstName} ${emp.lastName}`) }}>
                          {getInitials(emp.firstName, emp.lastName)}
                        </div>
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600' }}>{req.employeeName}</span>
                          <span className={`badge ${typeClass(req.type)}`}>{req.type}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--medium-gray)', marginBottom: '4px' }}>
                          {formatDate(req.startDate)} &ndash; {formatDate(req.endDate)} &middot; {req.totalHours} hours
                        </div>
                        {req.reason && (
                          <div style={{ fontSize: '13px', color: 'var(--charcoal)', fontStyle: 'italic' }}>
                            &ldquo;{req.reason}&rdquo;
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: 'var(--medium-gray)', marginTop: '4px' }}>
                          Requested {new Date(req.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button className="btn-success btn-sm" onClick={() => handleApprove(req.id)}>
                        Approve
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => handleDeny(req.id)}>
                        Deny
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Upcoming Approved */}
      {tab === 'upcoming' && (
        <>
          {upcoming.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--medium-gray)' }}>
              No upcoming approved time off
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(req => (
                    <tr key={req.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="avatar avatar-sm" style={{ background: getAvatarColor(req.employeeName) }}>
                            {req.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <span style={{ fontWeight: '500' }}>{req.employeeName}</span>
                        </div>
                      </td>
                      <td><span className={`badge ${typeClass(req.type)}`}>{req.type}</span></td>
                      <td>{formatDate(req.startDate)}{req.startDate !== req.endDate ? ` \u2013 ${formatDate(req.endDate)}` : ''}</td>
                      <td>{req.totalHours}h</td>
                      <td><span className="badge badge-approved">{req.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* All Requests */}
      {tab === 'all' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Hours</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {all.map(req => (
                <tr key={req.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="avatar avatar-sm" style={{ background: getAvatarColor(req.employeeName) }}>
                        {req.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <span style={{ fontWeight: '500' }}>{req.employeeName}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${typeClass(req.type)}`}>{req.type}</span></td>
                  <td style={{ fontSize: '13px' }}>{formatDate(req.startDate)}{req.startDate !== req.endDate ? ` \u2013 ${formatDate(req.endDate)}` : ''}</td>
                  <td>{req.totalHours}h</td>
                  <td style={{ fontSize: '13px', color: 'var(--medium-gray)', maxWidth: '180px' }}>{req.reason || '\u2014'}</td>
                  <td><span className={`badge badge-${req.status.toLowerCase()}`}>{req.status}</span></td>
                </tr>
              ))}
              {all.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--medium-gray)', padding: '32px' }}>No time off requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal-content" style={{ width: '480px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>Request Time Off</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', color: 'var(--medium-gray)', fontSize: '20px', padding: 0 }}>&times;</button>
            </div>
            <div className="form-field">
              <label>Employee *</label>
              <select value={createForm.employeeId} onChange={e => setCreateForm(f => ({ ...f, employeeId: e.target.value }))}>
                <option value="">Select employee...</option>
                {employees.filter(e => e.status === 'Active').map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Type</label>
              <select value={createForm.type} onChange={e => setCreateForm(f => ({ ...f, type: e.target.value }))}>
                <option value="Vacation">Vacation</option>
                <option value="Sick">Sick</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-field">
                <label>Start date *</label>
                <input type="date" value={createForm.startDate} onChange={e => setCreateForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>End date *</label>
                <input type="date" value={createForm.endDate} onChange={e => setCreateForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="form-field">
              <label>Reason (optional)</label>
              <textarea
                value={createForm.reason}
                onChange={e => setCreateForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Reason for time off..."
                style={{ minHeight: '60px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleCreateRequest}
                disabled={!createForm.employeeId || !createForm.startDate || !createForm.endDate}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && <div className="toast">{toastMsg}</div>}
    </div>
  )
}

export default TimeOff
