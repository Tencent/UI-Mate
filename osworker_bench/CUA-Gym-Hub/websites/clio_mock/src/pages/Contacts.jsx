import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronUp, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { ContactModal } from '../components/Modals'

export default function Contacts() {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('All')
  const [sortKey, setSortKey] = useState('displayName')
  const [sortDir, setSortDir] = useState('asc')
  const [selected, setSelected] = useState([])
  const [showModal, setShowModal] = useState(false)

  const counts = {
    All: state.contacts.length,
    People: state.contacts.filter(c => c.type === 'Person').length,
    Companies: state.contacts.filter(c => c.type === 'Company').length,
  }

  const filtered = state.contacts
    .filter(c => tab === 'All' || (tab === 'People' ? c.type === 'Person' : c.type === 'Company'))
    .filter(c => !search || c.displayName.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))
    .filter(c => tagFilter === 'All' || c.tags?.includes(tagFilter))
    .sort((a, b) => {
      let va = a[sortKey] || '', vb = b[sortKey] || ''
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
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.id))

  const handleBulkDelete = () => {
    if (!window.confirm(`Delete ${selected.length} contact${selected.length > 1 ? 's' : ''}?`)) return
    selected.forEach(id => dispatch({ type: 'DELETE_CONTACT', payload: id }))
    addToast(`Deleted ${selected.length} contact${selected.length > 1 ? 's' : ''}`)
    setSelected([])
  }

  const getInitials = (c) => {
    if (c.type === 'Company') return c.displayName.substring(0, 2).toUpperCase()
    return `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase()
  }

  const colors = ['#1A73E8','#34A853','#FBBC04','#EA4335','#9C27B0','#FF5722']
  const getColor = (id) => colors[parseInt(id.replace(/\D/g,'')) % colors.length]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Contacts</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> New Contact
        </button>
      </div>

      <div className="tabs" style={{ marginBottom: 16, borderRadius: '8px 8px 0 0' }}>
        {['All', 'People', 'Companies'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t} ({counts[t] || 0})
          </button>
        ))}
      </div>

      <div className="filter-bar" style={{ marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9AA0A6', pointerEvents: 'none' }} />
          <input className="input-field search-input" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} style={{ height: 34 }} />
        </div>
        <select className="select-field" style={{ width: 160, height: 34 }} value={tagFilter} onChange={e => setTagFilter(e.target.value)}>
          <option value="All">All Tags</option>
          {['Client','Opposing Counsel','Judge','Witness','Expert','Other'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {selected.length > 0 && (
        <div style={{ background: '#EEF4FD', border: '1px solid #1A73E8', borderRadius: 8, padding: '8px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{selected.length} selected</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>Delete</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected([])}>Cancel</button>
          </div>
        </div>
      )}

      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No contacts found</p><p>Try adjusting your filters</p></div>
        ) : (
          <table>
            <thead>
              <tr className="table-header">
                <th style={{ width: 40, padding: '10px 12px' }}>
                  <input type="checkbox" className="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} />
                </th>
                <th onClick={() => toggleSort('displayName')} style={{ cursor: 'pointer' }}>Name <SortIcon k="displayName" /></th>
                <th>Type</th>
                <th onClick={() => toggleSort('email')} style={{ cursor: 'pointer' }}>Email <SortIcon k="email" /></th>
                <th>Phone</th>
                <th>Tags</th>
                <th onClick={() => toggleSort('createdAt')} style={{ cursor: 'pointer' }}>Created <SortIcon k="createdAt" /></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}
                  onClick={() => { dispatch({ type: 'UPDATE_RECENT_CONTACTS', payload: c.id }); navigate(`/contacts/${c.id}`) }}
                  style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ background: getColor(c.id), fontSize: 11 }}>{getInitials(c)}</div>
                      <span style={{ color: '#1A73E8', fontWeight: 500 }}>{c.displayName}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${c.type === 'Person' ? 'badge-person' : 'badge-company'}`}>{c.type}</span></td>
                  <td style={{ fontSize: 13, color: '#5F6368' }}>{c.email || '—'}</td>
                  <td style={{ fontSize: 13 }}>{c.phone || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(c.tags || []).map(t => <span key={t} className="badge badge-tag" style={{ fontSize: 10 }}>{t}</span>)}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#9AA0A6' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <ContactModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
