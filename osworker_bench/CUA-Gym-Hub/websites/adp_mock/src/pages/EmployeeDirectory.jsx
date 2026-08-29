import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import SortableTable from '../components/SortableTable.jsx'

export default function EmployeeDirectory() {
  const { state } = useApp()
  const employees = state.employees || []
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [locFilter, setLocFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedEmp, setSelectedEmp] = useState(null)

  const departments = [...new Set(employees.map(e => e.department))].sort()
  const locations = [...new Set(employees.map(e => e.workLocation))].sort()

  const filtered = employees.filter(e => {
    if (search) {
      const q = search.toLowerCase()
      const match = `${e.firstName} ${e.lastName} ${e.email} ${e.jobTitle} ${e.employeeId}`.toLowerCase()
      if (!match.includes(q)) return false
    }
    if (deptFilter && e.department !== deptFilter) return false
    if (locFilter && e.workLocation !== locFilter) return false
    if (statusFilter && e.employmentStatus !== statusFilter) return false
    return true
  })

  const columns = [
    {
      key: 'lastName',
      label: 'Employee',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar avatar-sm" style={{ background: '#4B5563' }}>{row.avatar}</div>
          <div>
            <div style={{ fontWeight: 500 }}>{row.firstName} {row.lastName}</div>
            <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>{row.employeeId}</div>
          </div>
        </div>
      ),
    },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'department', label: 'Department' },
    { key: 'workLocation', label: 'Location' },
    { key: 'manager', label: 'Manager' },
    { key: 'hireDate', label: 'Hire Date' },
    {
      key: 'employmentStatus',
      label: 'Status',
      render: (val) => (
        <span className={`badge ${val === 'Full-Time' ? 'badge-green' : 'badge-blue'}`}>{val}</span>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>People</h1>
        <p>Employee directory -- {filtered.length} of {employees.length} employees</p>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, title, or ID..."
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="form-input" style={{ width: 160 }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={locFilter} onChange={e => setLocFilter(e.target.value)} className="form-input" style={{ width: 180 }}>
            <option value="">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input" style={{ width: 140 }}>
            <option value="">All Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
          </select>
          {(search || deptFilter || locFilter || statusFilter) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setDeptFilter(''); setLocFilter(''); setStatusFilter('') }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <SortableTable columns={columns} data={filtered} onRowClick={setSelectedEmp} />
      </div>

      {/* Employee Detail Modal */}
      {selectedEmp && (
        <div className="modal-overlay" onClick={() => setSelectedEmp(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Employee Details</h3>
              <button onClick={() => setSelectedEmp(null)} style={{ background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-medium)' }}>x</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                <div className="avatar avatar-lg" style={{ background: '#4B5563', width: 56, height: 56, fontSize: 18 }}>{selectedEmp.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{selectedEmp.firstName} {selectedEmp.lastName}</div>
                  <div style={{ color: 'var(--color-gray-medium)' }}>{selectedEmp.jobTitle}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>{selectedEmp.employeeId}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['Department', selectedEmp.department],
                  ['Division', selectedEmp.division],
                  ['Manager', selectedEmp.manager || 'None'],
                  ['Location', selectedEmp.workLocation],
                  ['Email', selectedEmp.email],
                  ['Phone', selectedEmp.phone],
                  ['Hire Date', selectedEmp.hireDate],
                  ['Status', selectedEmp.employmentStatus],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: 'var(--color-gray-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{value}</div>
                  </div>
                ))}
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
