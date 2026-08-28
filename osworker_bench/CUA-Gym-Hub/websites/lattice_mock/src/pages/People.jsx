import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/Avatar.jsx'

export default function People() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')

  if (!state) return null
  const { users, company } = state

  const filtered = users.filter(u => {
    const matchSearch = search === '' || `${u.firstName} ${u.lastName} ${u.title}`.toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'All' || u.department === deptFilter
    return matchSearch && matchDept
  })

  return (
    <div style={{ padding: 32 }}>
      <div className="page-header">
        <h1 className="page-title">People — {company.name}</h1>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          className="form-input"
          style={{ maxWidth: 280 }}
          placeholder="Search people..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="form-input"
          style={{ width: 'auto' }}
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          <option>All</option>
          {company.departments.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Name', 'Title', 'Department', 'Location', 'Manager'].map(col => (
                <th key={col} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: '#6B7280', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => {
              const manager = users.find(u => u.id === user.managerId)
              return (
                <tr
                  key={user.id}
                  style={{ cursor: 'pointer', borderBottom: '1px solid #F3F4F6' }}
                  onClick={() => navigate(`/people/${user.id}`)}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar user={user} size={32} />
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{user.firstName} {user.lastName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{user.title}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{user.department}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{user.location}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>
                    {manager ? `${manager.firstName} ${manager.lastName}` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-text">No people found</div>
          </div>
        )}
      </div>
    </div>
  )
}
