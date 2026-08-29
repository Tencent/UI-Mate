import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'
import SortableTable from '../components/SortableTable.jsx'

function formatCurrency(n) {
  return n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'
}

function ReportViewer({ report, employees, departments, payrollRuns }) {
  const type = report.type

  if (type === 'Headcount') {
    const deptData = departments.map(d => ({
      id: d.id,
      department: d.name,
      headcount: employees.filter(e => e.department === d.name).length,
      manager: d.manager,
      location: d.location,
    }))
    const total = deptData.reduce((s, d) => s + d.headcount, 0)
    return (
      <div>
        <h3 style={{ marginBottom: 16 }}>Headcount by Department</h3>
        <SortableTable
          columns={[
            { key: 'department', label: 'Department' },
            { key: 'headcount', label: 'Headcount', align: 'right' },
            { key: 'manager', label: 'Manager' },
            { key: 'location', label: 'Location' },
          ]}
          data={deptData}
        />
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#F9FAFB', borderRadius: 6, fontWeight: 600 }}>
          Total Headcount: {total}
        </div>
      </div>
    )
  }

  if (type === 'Payroll Summary') {
    const completed = payrollRuns.filter(r => r.status === 'Completed')
    const totalGross = completed.reduce((s, r) => s + (r.totalGross || 0), 0)
    const totalNet = completed.reduce((s, r) => s + (r.totalNet || 0), 0)
    return (
      <div>
        <h3 style={{ marginBottom: 16 }}>Payroll Summary -- 2026 YTD</h3>
        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Total Gross</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{formatCurrency(totalGross)}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Total Net</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-success)' }}>{formatCurrency(totalNet)}</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Pay Runs</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{completed.length}</div>
          </div>
        </div>
        <SortableTable
          columns={[
            { key: 'payDate', label: 'Pay Date' },
            { key: 'name', label: 'Pay Run' },
            { key: 'employeeCount', label: 'Employees', align: 'right' },
            { key: 'totalGross', label: 'Gross', align: 'right', render: (v) => formatCurrency(v) },
            { key: 'totalNet', label: 'Net', align: 'right', render: (v) => v ? formatCurrency(v) : '--' },
          ]}
          data={completed}
        />
      </div>
    )
  }

  if (type === 'Turnover') {
    // Simulated turnover data
    const months = ['Jan', 'Feb', 'Mar', 'Apr']
    const turnoverData = months.map((m, i) => ({
      id: i,
      month: m + ' 2026',
      startCount: 26 - i,
      hires: i === 0 ? 1 : 0,
      terminations: i === 1 ? 1 : 0,
      endCount: 26 - i + (i === 0 ? 1 : 0) - (i === 1 ? 1 : 0),
      turnoverRate: i === 1 ? '3.8%' : '0.0%',
    }))
    return (
      <div>
        <h3 style={{ marginBottom: 16 }}>Turnover Report -- 2026 YTD</h3>
        <SortableTable
          columns={[
            { key: 'month', label: 'Month' },
            { key: 'startCount', label: 'Start Count', align: 'right' },
            { key: 'hires', label: 'Hires', align: 'right' },
            { key: 'terminations', label: 'Terminations', align: 'right' },
            { key: 'endCount', label: 'End Count', align: 'right' },
            { key: 'turnoverRate', label: 'Turnover Rate', align: 'right' },
          ]}
          data={turnoverData}
        />
      </div>
    )
  }

  if (type === 'Benefits') {
    const deptBenefits = departments.map(d => {
      const count = employees.filter(e => e.department === d.name).length
      return {
        id: d.id,
        department: d.name,
        enrolled: count,
        medical: count,
        dental: Math.round(count * 0.85),
        vision: Math.round(count * 0.75),
        fourOneK: Math.round(count * 0.9),
      }
    })
    return (
      <div>
        <h3 style={{ marginBottom: 16 }}>Benefits Enrollment Summary</h3>
        <SortableTable
          columns={[
            { key: 'department', label: 'Department' },
            { key: 'enrolled', label: 'Total Employees', align: 'right' },
            { key: 'medical', label: 'Medical', align: 'right' },
            { key: 'dental', label: 'Dental', align: 'right' },
            { key: 'vision', label: 'Vision', align: 'right' },
            { key: 'fourOneK', label: '401(k)', align: 'right' },
          ]}
          data={deptBenefits}
        />
      </div>
    )
  }

  // Custom / default -- show employee roster grouped by department
  const deptGroups = {}
  employees.forEach(emp => {
    const dept = emp.department || 'Unknown'
    if (!deptGroups[dept]) deptGroups[dept] = []
    deptGroups[dept].push(emp)
  })
  const sortedDepts = Object.keys(deptGroups).sort()
  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>{report.name}</h3>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Total Employees</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{employees.length}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Departments</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{sortedDepts.length}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Avg Headcount/Dept</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{sortedDepts.length > 0 ? (employees.length / sortedDepts.length).toFixed(1) : 0}</div>
        </div>
      </div>
      <SortableTable
        columns={[
          { key: 'firstName', label: 'First Name' },
          { key: 'lastName', label: 'Last Name' },
          { key: 'department', label: 'Department' },
          { key: 'jobTitle', label: 'Job Title' },
          { key: 'workLocation', label: 'Location' },
          { key: 'hireDate', label: 'Hire Date' },
          { key: 'employmentStatus', label: 'Status', render: (v) => <span className={`badge ${v === 'Full-Time' ? 'badge-green' : 'badge-blue'}`}>{v}</span> },
        ]}
        data={employees}
      />
    </div>
  )
}

function CustomReportBuilder({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    type: 'Custom',
    columns: ['firstName', 'lastName', 'department', 'jobTitle'],
    groupBy: '',
  })

  const availableColumns = [
    'firstName', 'lastName', 'email', 'phone', 'employeeId', 'hireDate',
    'jobTitle', 'department', 'division', 'manager', 'workLocation',
    'employmentStatus', 'payRate', 'payFrequency',
  ]

  function toggleColumn(col) {
    setForm(prev => ({
      ...prev,
      columns: prev.columns.includes(col) ? prev.columns.filter(c => c !== col) : [...prev.columns, col],
    }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Custom Report</h3>
          <button onClick={onClose} style={{ background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-medium)' }}>x</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Report Name</label>
            <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="form-input" placeholder="Enter report name..." />
          </div>
          <div className="form-group">
            <label className="form-label">Group By</label>
            <select value={form.groupBy} onChange={e => setForm(prev => ({ ...prev, groupBy: e.target.value }))} className="form-input">
              <option value="">No Grouping</option>
              <option value="department">Department</option>
              <option value="workLocation">Location</option>
              <option value="employmentStatus">Status</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Columns</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {availableColumns.map(col => (
                <label key={col} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={form.columns.includes(col)} onChange={() => toggleColumn(col)} />
                  {col}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!form.name} onClick={() => form.name && onSave(form)}>Create Report</button>
        </div>
      </div>
    </div>
  )
}

export default function Reports() {
  const { state, updateState } = useApp()
  const { showToast } = useToast()
  const [viewReport, setViewReport] = useState(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const savedReports = state.savedReports || []
  const employees = state.employees || []
  const departments = state.departments || []
  const payrollRuns = state.payrollRuns || []

  function handleRunReport(report) {
    const today = new Date().toISOString().slice(0, 10)
    updateState(prev => ({
      ...prev,
      savedReports: prev.savedReports.map(r => r.id === report.id ? { ...r, lastRun: today } : r),
    }))
    setViewReport(report)
    showToast(`Running "${report.name}"...`, 'success')
  }

  function handleDeleteReport(report) {
    updateState(prev => ({
      ...prev,
      savedReports: prev.savedReports.filter(r => r.id !== report.id),
    }))
    showToast('Report deleted', 'success')
  }

  function handleCreateCustom(form) {
    const today = new Date().toISOString().slice(0, 10)
    const newReport = {
      id: `rpt-${Date.now()}`,
      name: form.name,
      type: 'Custom',
      lastRun: today,
      schedule: 'On Demand',
      createdBy: `${state.employee.firstName} ${state.employee.lastName}`,
    }
    updateState(prev => ({
      ...prev,
      savedReports: [...prev.savedReports, newReport],
    }))
    setShowBuilder(false)
    showToast('Custom report created', 'success')
  }

  const standardReportTypes = [
    { type: 'Headcount', label: 'Headcount Report', description: 'Employee count by department, location, and status', icon: '\uD83D\uDC65' },
    { type: 'Payroll Summary', label: 'Payroll Summary', description: 'Payroll totals, deductions, and taxes by period', icon: '\uD83D\uDCB5' },
    { type: 'Turnover', label: 'Turnover Report', description: 'Hires, terminations, and turnover rates over time', icon: '\uD83D\uDD04' },
    { type: 'Benefits', label: 'Benefits Enrollment', description: 'Benefits participation rates across plans', icon: '\uD83D\uDED1' },
  ]

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Reports</h1>
          <p>Standard and custom workforce reports</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowBuilder(true)}>+ Custom Report</button>
      </div>

      {/* Standard Reports */}
      <h3 style={{ marginBottom: 12 }}>Standard Reports</h3>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {standardReportTypes.map(rpt => (
          <div key={rpt.type} className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
            onClick={() => handleRunReport({ id: `std-${rpt.type}`, name: rpt.label, type: rpt.type, lastRun: new Date().toISOString().slice(0, 10) })}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)' }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ fontSize: 28 }}>{rpt.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{rpt.label}</div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-medium)', marginTop: 2 }}>{rpt.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Saved Reports */}
      <h3 style={{ marginBottom: 12 }}>Saved Reports</h3>
      <div className="card">
        <SortableTable
          columns={[
            { key: 'name', label: 'Report Name', render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
            { key: 'type', label: 'Type' },
            { key: 'lastRun', label: 'Last Run' },
            { key: 'schedule', label: 'Schedule' },
            { key: 'createdBy', label: 'Created By' },
            {
              key: 'actions',
              label: 'Actions',
              sortable: false,
              render: (_, row) => (
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleRunReport(row)}>Run</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteReport(row)}>Delete</button>
                </div>
              ),
            },
          ]}
          data={savedReports}
        />
      </div>

      {/* Report Viewer */}
      {viewReport && (
        <div className="modal-overlay" onClick={() => setViewReport(null)}>
          <div className="modal" style={{ maxWidth: 800, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{viewReport.name}</h3>
                <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Generated: {new Date().toLocaleDateString()}</div>
              </div>
              <button onClick={() => setViewReport(null)} style={{ background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-medium)' }}>x</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <ReportViewer
                report={viewReport}
                employees={employees}
                departments={departments}
                payrollRuns={payrollRuns}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewReport(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => showToast('Report exported as CSV', 'success')}>Export CSV</button>
            </div>
          </div>
        </div>
      )}

      {showBuilder && <CustomReportBuilder onSave={handleCreateCustom} onClose={() => setShowBuilder(false)} />}
    </div>
  )
}
