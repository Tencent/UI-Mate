import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Header from '../components/Header.jsx'
import { Filter, Download, Search, ChevronDown } from 'lucide-react'

export default function UsersPage() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const profiles = state?.userProfiles || []
  const [searchVal, setSearchVal] = useState('')
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [planFilter, setPlanFilter] = useState('All')

  function navTo(path) {
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  const filtered = profiles.filter(p => {
    if (planFilter !== 'All' && p.properties?.Plan !== planFilter) return false
    if (!searchVal) return true
    const q = searchVal.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
  })

  const selectedProfiles = filtered.filter(p => selectedRows.has(p.id))
  const exportRows = selectedProfiles.length ? selectedProfiles : filtered

  function exportUsers() {
    const headers = ['Name', 'Email', 'Plan', 'Total Sessions', 'Country', 'Last Seen']
    const rows = exportRows.map(p => [
      p.name,
      p.email || '',
      p.properties?.Plan || 'Free',
      p.properties?.['Total Sessions'] || 0,
      p.countryCode || '',
      p.lastSeen || ''
    ])
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'xixpanel-users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function toggleRow(id) {
    setSelectedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const AVATAR_COLORS = ['#4F44E0', '#EB5757', '#27AE60', '#F5A623', '#00BCD4', '#9C27B0', '#FF7043', '#607D8B']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header title="Users / Explore" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderBottom: '1px solid #E4E4E8' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1B1B2E' }}>{filtered.length}</span>
          <span style={{ fontSize: 13, color: '#8E8EA0' }}>users</span>
          <div style={{ flex: 1 }} />
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            style={{
            padding: '5px 10px', border: '1px solid #E4E4E8', borderRadius: 6,
            background: '#fff', cursor: 'pointer', fontSize: 12, color: '#1B1B2E',
            height: 30
          }}>
            <option value="All">All plans</option>
            <option value="Free">Free</option>
            <option value="Growth">Growth</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <button style={{
            padding: '5px 10px', border: '1px solid #E4E4E8', borderRadius: 6,
            background: '#fff', cursor: 'pointer', fontSize: 12, color: '#1B1B2E',
            display: 'flex', alignItems: 'center', gap: 4
          }} onClick={exportUsers}>
            <Download size={12} color="#8E8EA0" /> Export {selectedProfiles.length ? `(${selectedProfiles.length})` : ''}
          </button>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#8E8EA0" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search users"
              style={{
                border: '1px solid #E4E4E8', borderRadius: 6, padding: '6px 10px 6px 28px',
                fontSize: 13, outline: 'none', width: 180
              }}
              onFocus={e => e.target.style.borderColor = '#4F44E0'}
              onBlur={e => e.target.style.borderColor = '#E4E4E8'}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F7F7F8' }}>
              <th style={thStyle}><input type="checkbox" checked={filtered.length > 0 && selectedRows.size === filtered.length} onChange={e => setSelectedRows(e.target.checked ? new Set(filtered.map(p => p.id)) : new Set())} style={{ cursor: 'pointer' }} /></th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Plan</th>
              <th style={thStyle}>Sessions</th>
              <th style={thStyle}>Country</th>
              <th style={thStyle}>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((profile, i) => (
              <tr key={profile.id}
                style={{ borderBottom: '1px solid #E4E4E8', cursor: 'pointer' }}
                onClick={() => navTo(`/users/${profile.id}`)}
                onMouseEnter={e => e.currentTarget.style.background = '#F9F9FB'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={tdStyle} onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedRows.has(profile.id)}
                    onChange={() => toggleRow(profile.id)} style={{ cursor: 'pointer' }} />
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0
                    }}>{getInitials(profile.name)}</div>
                    <span style={{ fontWeight: 500 }}>{profile.name}</span>
                  </div>
                </td>
                <td style={{ ...tdStyle, color: '#585870' }}>{profile.email}</td>
                <td style={tdStyle}>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4,
                    background: profile.properties?.Plan === 'Enterprise' ? '#EEEDFC' : profile.properties?.Plan === 'Growth' ? '#E8F5E9' : '#F7F7F8',
                    color: profile.properties?.Plan === 'Enterprise' ? '#4F44E0' : profile.properties?.Plan === 'Growth' ? '#27AE60' : '#8E8EA0'
                  }}>{profile.properties?.Plan || 'Free'}</span>
                </td>
                <td style={{ ...tdStyle, color: '#585870' }}>{profile.properties?.['Total Sessions'] || 0}</td>
                <td style={{ ...tdStyle, color: '#585870' }}>{profile.countryCode}</td>
                <td style={{ ...tdStyle, color: '#8E8EA0', fontSize: 12 }}>{new Date(profile.lastSeen).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle = {
  padding: '8px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600,
  color: '#8E8EA0', borderBottom: '1px solid #E4E4E8', whiteSpace: 'nowrap'
}
const tdStyle = { padding: '10px 16px', fontSize: 13, color: '#1B1B2E', verticalAlign: 'middle' }
