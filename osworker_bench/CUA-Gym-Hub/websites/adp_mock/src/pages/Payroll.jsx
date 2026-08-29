import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'
import SortableTable from '../components/SortableTable.jsx'

function formatCurrency(n) {
  return n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'
}

const STATUS_BADGE = {
  Completed: 'badge-green',
  'In Progress': 'badge-amber',
  Draft: 'badge-gray',
}

function CreatePayRunModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: 'Regular Bi-Weekly',
    periodStart: '',
    periodEnd: '',
    payDate: '',
    employeeCount: 26,
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Pay Run</h3>
          <button onClick={onClose} style={{ background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-medium)' }}>x</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Pay Run Name</label>
            <select name="name" value={form.name} onChange={handleChange} className="form-input">
              <option>Regular Bi-Weekly</option>
              <option>Off-Cycle Run</option>
              <option>Bonus Run</option>
              <option>Commission Run</option>
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Period Start</label>
              <input type="date" name="periodStart" value={form.periodStart} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Period End</label>
              <input type="date" name="periodEnd" value={form.periodEnd} onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Pay Date</label>
              <input type="date" name="payDate" value={form.payDate} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Employee Count</label>
              <input type="number" name="employeeCount" value={form.employeeCount} onChange={handleChange} className="form-input" min={1} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!form.periodStart || !form.periodEnd || !form.payDate) return
              onSave(form)
            }}
          >
            Create Pay Run
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Payroll() {
  const { state, updateState } = useApp()
  const { showToast } = useToast()
  const [showCreate, setShowCreate] = useState(false)
  const [selectedRun, setSelectedRun] = useState(null)
  const payrollRuns = state.payrollRuns || []

  function handleCreate(form) {
    const newRun = {
      id: `pr-${Date.now()}`,
      name: form.name,
      payDate: form.payDate,
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      status: 'Draft',
      totalGross: 0,
      totalNet: null,
      employeeCount: Number(form.employeeCount),
      approvedBy: '',
      approvedDate: '',
    }
    updateState(prev => ({
      ...prev,
      payrollRuns: [newRun, ...prev.payrollRuns],
    }))
    setShowCreate(false)
    showToast('Pay run created as Draft', 'success')
  }

  function handleProcess(run) {
    const estimatedGross = run.employeeCount * 3654
    updateState(prev => ({
      ...prev,
      payrollRuns: prev.payrollRuns.map(pr =>
        pr.id === run.id ? { ...pr, status: 'In Progress', totalGross: estimatedGross } : pr
      ),
    }))
    showToast(`Processing payroll for ${run.name}...`, 'success')
  }

  function handleApprove(run) {
    const today = new Date().toISOString().slice(0, 10)
    const totalNet = Math.round(run.totalGross * 0.68 * 100) / 100
    updateState(prev => ({
      ...prev,
      payrollRuns: prev.payrollRuns.map(pr =>
        pr.id === run.id ? { ...pr, status: 'Completed', totalNet, approvedBy: state.employee.firstName + ' ' + state.employee.lastName, approvedDate: today } : pr
      ),
    }))
    showToast(`Payroll approved and completed`, 'success')
  }

  // Summary stats
  const completedRuns = payrollRuns.filter(r => r.status === 'Completed')
  const totalPaidYTD = completedRuns.reduce((s, r) => s + (r.totalGross || 0), 0)
  const pendingRuns = payrollRuns.filter(r => r.status !== 'Completed').length

  const columns = [
    { key: 'name', label: 'Pay Run' },
    { key: 'payDate', label: 'Pay Date' },
    {
      key: 'periodStart',
      label: 'Period',
      render: (_, row) => `${row.periodStart} - ${row.periodEnd}`,
    },
    { key: 'employeeCount', label: 'Employees', align: 'right' },
    {
      key: 'totalGross',
      label: 'Gross',
      align: 'right',
      render: (val) => val ? formatCurrency(val) : '--',
    },
    {
      key: 'totalNet',
      label: 'Net',
      align: 'right',
      render: (val) => val ? formatCurrency(val) : '--',
    },
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
        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
          {row.status === 'Draft' && (
            <button className="btn btn-primary btn-sm" onClick={() => handleProcess(row)}>Process</button>
          )}
          {row.status === 'In Progress' && (
            <button className="btn btn-success btn-sm" onClick={() => handleApprove(row)}>Approve</button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRun(row)}>View</button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Payroll</h1>
          <p>Manage pay runs and payroll processing</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Pay Run</button>
      </div>

      {/* Summary Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Paid YTD</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-success)', marginTop: 4 }}>{formatCurrency(totalPaidYTD)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed Runs</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-info)', marginTop: 4 }}>{completedRuns.length}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Runs</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-warning)', marginTop: 4 }}>{pendingRuns}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Pay Runs</h3>
        <SortableTable columns={columns} data={payrollRuns} onRowClick={setSelectedRun} />
      </div>

      {showCreate && <CreatePayRunModal onSave={handleCreate} onClose={() => setShowCreate(false)} />}

      {/* Pay Run Detail Modal */}
      {selectedRun && (
        <div className="modal-overlay" onClick={() => setSelectedRun(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pay Run Details</h3>
              <button onClick={() => setSelectedRun(null)} style={{ background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-medium)' }}>x</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><div className="form-label">Pay Run Name</div><div style={{ fontWeight: 500 }}>{selectedRun.name}</div></div>
                <div><div className="form-label">Status</div><span className={`badge ${STATUS_BADGE[selectedRun.status]}`}>{selectedRun.status}</span></div>
                <div><div className="form-label">Pay Date</div><div style={{ fontWeight: 500 }}>{selectedRun.payDate}</div></div>
                <div><div className="form-label">Employees</div><div style={{ fontWeight: 500 }}>{selectedRun.employeeCount}</div></div>
                <div><div className="form-label">Period</div><div style={{ fontWeight: 500 }}>{selectedRun.periodStart} - {selectedRun.periodEnd}</div></div>
                <div><div className="form-label">Total Gross</div><div style={{ fontWeight: 700, fontSize: 18 }}>{selectedRun.totalGross ? formatCurrency(selectedRun.totalGross) : '--'}</div></div>
                <div><div className="form-label">Total Net</div><div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-success)' }}>{selectedRun.totalNet ? formatCurrency(selectedRun.totalNet) : '--'}</div></div>
                {selectedRun.approvedBy && (
                  <div><div className="form-label">Approved By</div><div style={{ fontWeight: 500 }}>{selectedRun.approvedBy} on {selectedRun.approvedDate}</div></div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {selectedRun.status === 'Draft' && (
                <button className="btn btn-primary" onClick={() => { handleProcess(selectedRun); setSelectedRun(null) }}>Process</button>
              )}
              {selectedRun.status === 'In Progress' && (
                <button className="btn btn-success" onClick={() => { handleApprove(selectedRun); setSelectedRun(null) }}>Approve & Complete</button>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedRun(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
