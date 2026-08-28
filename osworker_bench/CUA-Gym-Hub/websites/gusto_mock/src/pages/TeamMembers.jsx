import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { getInitials, getAvatarColor, formatDate } from '../utils/helpers'
import AddEmployeeModal from '../components/AddEmployeeModal'

const TeamMembers = () => {
  const { state } = useAppContext()
  const navigate = useNavigate()
  const [tab, setTab] = useState('employees')
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortCol, setSortCol] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [showModal, setShowModal] = useState(false)

  const employees = state?.employees || []
  const contractors = state?.contractors || []
  const departments = ['All', ...([...new Set(employees.map(e => e.department))])]

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const filtered = employees
    .filter(e => {
      const q = search.toLowerCase()
      const matchSearch = !q || `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) || e.jobTitle.toLowerCase().includes(q)
      const matchDept = deptFilter === 'All' || e.department === deptFilter
      const matchStatus = statusFilter === 'All' || e.status === statusFilter
      return matchSearch && matchDept && matchStatus
    })
    .sort((a, b) => {
      let av, bv
      if (sortCol === 'name') { av = `${a.firstName} ${a.lastName}`; bv = `${b.firstName} ${b.lastName}` }
      else if (sortCol === 'dept') { av = a.department; bv = b.department }
      else if (sortCol === 'title') { av = a.jobTitle; bv = b.jobTitle }
      else if (sortCol === 'start') { av = a.startDate; bv = b.startDate }
      else if (sortCol === 'type') { av = a.employmentType; bv = b.employmentType }
      else if (sortCol === 'status') { av = a.status; bv = b.status }
      else { av = ''; bv = '' }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const SortIcon = ({ col }) => (
    <span style={{ marginLeft: '4px', opacity: sortCol === col ? 1 : 0.3 }}>
      {sortCol === col && sortDir === 'desc' ? '↓' : '↑'}
    </span>
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team members</h1>
          <p className="page-subtitle">You have {employees.length} team members</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add employee
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'employees' ? 'active' : ''}`} onClick={() => setTab('employees')}>
          Team members ({employees.length})
        </button>
        <button className={`tab ${tab === 'contractors' ? 'active' : ''}`} onClick={() => setTab('contractors')}>
          Contractors ({contractors.length})
        </button>
      </div>

      {tab === 'employees' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search people..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--medium-gray)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </span>
            </div>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ width: '160px' }}>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '140px' }}>
              <option>All</option>
              <option>Active</option>
              <option>Onboarding</option>
            </select>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>Name <SortIcon col="name" /></th>
                  <th onClick={() => handleSort('dept')}>Department <SortIcon col="dept" /></th>
                  <th onClick={() => handleSort('title')}>Job title <SortIcon col="title" /></th>
                  <th onClick={() => handleSort('type')}>Type <SortIcon col="type" /></th>
                  <th onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                  <th onClick={() => handleSort('start')}>Start date <SortIcon col="start" /></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr
                    key={emp.id}
                    className="clickable"
                    onClick={() => navigate(`/people/team-members/${emp.id}`)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar avatar-sm" style={{ background: getAvatarColor(`${emp.firstName} ${emp.lastName}`) }}>
                          {getInitials(emp.firstName, emp.lastName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500' }}>{emp.firstName} {emp.lastName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.jobTitle}</td>
                    <td>{emp.employmentType}</td>
                    <td>
                      <span className={`badge badge-${emp.status.toLowerCase()}`}>{emp.status}</span>
                    </td>
                    <td>{formatDate(emp.startDate)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--medium-gray)', padding: '32px' }}>No employees found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'contractors' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Business</th>
                <th>Type</th>
                <th>Compensation</th>
                <th>Total Paid YTD</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contractors.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar avatar-sm" style={{ background: getAvatarColor(`${c.firstName} ${c.lastName}`) }}>
                        {getInitials(c.firstName, c.lastName)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{c.firstName} {c.lastName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.businessName}</td>
                  <td>{c.type}</td>
                  <td>${c.compensation.amount}/{c.compensation.per}</td>
                  <td>${c.totalPaidYTD.toLocaleString()}</td>
                  <td><span className="badge badge-active">{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <AddEmployeeModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

export default TeamMembers
