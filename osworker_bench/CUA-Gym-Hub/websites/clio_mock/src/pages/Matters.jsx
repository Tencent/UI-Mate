import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronUp, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { MatterModal } from '../components/Modals'

function getBadgeClass(status) {
  const map = { Open: 'badge-open', Pending: 'badge-pending', Closed: 'badge-closed' }
  return map[status] || 'badge-closed'
}

export default function Matters() {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [practiceFilter, setPracticeFilter] = useState('All')
  const [attorneyFilter, setAttorneyFilter] = useState('All')
  const [sortKey, setSortKey] = useState('updatedAt')
  const [sortDir, setSortDir] = useState('desc')
  const [selected, setSelected] = useState([])
  const [showModal, setShowModal] = useState(false)

  const counts = {
    All: state.matters.length,
    Open: state.matters.filter(m => m.status === 'Open').length,
    Pending: state.matters.filter(m => m.status === 'Pending').length,
    Closed: state.matters.filter(m => m.status === 'Closed').length,
  }

  const filtered = state.matters
    .filter(m => tab === 'All' || m.status === tab)
    .filter(m => !search || m.matterNumber.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()) || m.clientName.toLowerCase().includes(search.toLowerCase()))
    .filter(m => practiceFilter === 'All' || m.practiceArea === practiceFilter)
    .filter(m => attorneyFilter === 'All' || m.responsibleAttorneyId === attorneyFilter)
    .sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey]
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ k }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp size={12} className="sort-arrow" /> : <ChevronDown size={12} className="sort-arrow" />)
    : null

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(m => m.id))

  const handleBulkStatus = (status) => {
    selected.forEach(id => dispatch({ type: 'UPDATE_MATTER', payload: { id, status, updatedAt: new Date().toISOString() } }))
    addToast(`Updated ${selected.length} matter${selected.length > 1 ? 's' : ''}`)
    setSelected([])
  }

  const handleBulkDelete = () => {
    if (!window.confirm(`Delete ${selected.length} matter${selected.length > 1 ? 's' : ''}?`)) return
    selected.forEach(id => dispatch({ type: 'DELETE_MATTER', payload: id }))
    addToast(`Deleted ${selected.length} matter${selected.length > 1 ? 's' : ''}`)
    setSelected([])
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—'

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Matters</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> New Matter
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16, borderRadius: '8px 8px 0 0' }}>
        {['All', 'Open', 'Pending', 'Closed'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9AA0A6', pointerEvents: 'none' }} />
          <input className="input-field search-input" placeholder="Search matters..." value={search} onChange={e => setSearch(e.target.value)} style={{ height: 34 }} />
        </div>
        <select className="select-field" style={{ width: 160, height: 34 }} value={practiceFilter} onChange={e => setPracticeFilter(e.target.value)}>
          <option value="All">All Practice Areas</option>
          {state.firmSettings.practiceAreas.map(a => <option key={a}>{a}</option>)}
        </select>
        <select className="select-field" style={{ width: 180, height: 34 }} value={attorneyFilter} onChange={e => setAttorneyFilter(e.target.value)}>
          <option value="All">All Attorneys</option>
          {state.users.filter(u => u.subscriberType === 'Attorney').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div style={{ background: '#EEF4FD', border: '1px solid #1A73E8', borderRadius: 8, padding: '8px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{selected.length} selected</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <select className="select-field btn-sm" style={{ width: 140 }} onChange={e => { if (e.target.value) handleBulkStatus(e.target.value); e.target.value = '' }} defaultValue="">
              <option value="" disabled>Change Status</option>
              <option>Open</option><option>Pending</option><option>Closed</option>
            </select>
            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>Delete</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected([])}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No matters found</p>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr className="table-header">
                <th style={{ width: 40, padding: '10px 12px' }}>
                  <input type="checkbox" className="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} />
                </th>
                <th onClick={() => toggleSort('matterNumber')} style={{ cursor: 'pointer' }}>Matter Number <SortIcon k="matterNumber" /></th>
                <th onClick={() => toggleSort('description')} style={{ cursor: 'pointer' }}>Description <SortIcon k="description" /></th>
                <th onClick={() => toggleSort('clientName')} style={{ cursor: 'pointer' }}>Client <SortIcon k="clientName" /></th>
                <th>Practice Area</th>
                <th>Status</th>
                <th>Responsible Attorney</th>
                <th onClick={() => toggleSort('openDate')} style={{ cursor: 'pointer' }}>Open Date <SortIcon k="openDate" /></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} onClick={() => { dispatch({ type: 'UPDATE_RECENT_MATTERS', payload: m.id }); navigate(`/matters/${m.id}`) }} style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '10px 12px' }} onClick={e => { e.stopPropagation(); toggleSelect(m.id) }}>
                    <input type="checkbox" className="checkbox" checked={selected.includes(m.id)} onChange={() => toggleSelect(m.id)} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="text-link">{m.matterNumber}</span>
                  </td>
                  <td>{m.description}</td>
                  <td>
                    <span className="text-link" onClick={e => { e.stopPropagation(); const c = state.contacts.find(c => c.id === m.clientId); if (c) { dispatch({ type: 'UPDATE_RECENT_CONTACTS', payload: c.id }); navigate(`/contacts/${c.id}`) } }}>
                      {m.clientName}
                    </span>
                  </td>
                  <td>{m.practiceArea}</td>
                  <td><span className={`badge ${getBadgeClass(m.status)}`}>{m.status}</span></td>
                  <td>{m.responsibleAttorneyName}</td>
                  <td>{formatDate(m.openDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <MatterModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
