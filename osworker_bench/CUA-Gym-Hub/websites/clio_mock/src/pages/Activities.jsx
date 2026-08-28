import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronUp, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { TimeEntryModal, ExpenseModal } from '../components/Modals'

export default function Activities() {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = today.substring(0, 7) + '-01'
  const [modal, setModal] = useState(null)
  const [typeFilter, setTypeFilter] = useState('All')
  const [dateFrom, setDateFrom] = useState(firstOfMonth)
  const [dateTo, setDateTo] = useState(today)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [userFilter, setUserFilter] = useState('All')
  const [matterFilter, setMatterFilter] = useState('All')
  const [billableFilter, setBillableFilter] = useState('All')
  const [selected, setSelected] = useState([])
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  const filtered = state.activities
    .filter(a => typeFilter === 'All' || (typeFilter === 'Time Entries' ? a.type === 'TimeEntry' : a.type === 'ExpenseEntry'))
    .filter(a => !dateFrom || a.date >= dateFrom)
    .filter(a => !dateTo || a.date <= dateTo)
    .filter(a => categoryFilter === 'All' || a.category === categoryFilter)
    .filter(a => userFilter === 'All' || a.userId === userFilter)
    .filter(a => matterFilter === 'All' || a.matterId === matterFilter)
    .filter(a => billableFilter === 'All' || (billableFilter === 'Billable' ? a.billable : !a.billable))
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
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(a => a.id))

  const totalHours = filtered.filter(a => a.type === 'TimeEntry').reduce((s, a) => s + a.duration, 0)
  const totalAmount = filtered.reduce((s, a) => s + a.total, 0)

  const handleBulkBillable = (billable) => {
    selected.forEach(id => dispatch({ type: 'UPDATE_ACTIVITY', payload: { id, billable } }))
    addToast(`Marked ${selected.length} as ${billable ? 'billable' : 'non-billable'}`)
    setSelected([])
  }

  const handleBulkDelete = () => {
    if (!window.confirm(`Delete ${selected.length} activities?`)) return
    selected.forEach(id => dispatch({ type: 'DELETE_ACTIVITY', payload: id }))
    addToast('Activities deleted')
    setSelected([])
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Activities</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setModal('expense')}><Plus size={14} /> New Expense</button>
          <button className="btn btn-primary" onClick={() => setModal('timeEntry')}><Plus size={14} /> New Time Entry</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">From</label>
            <input className="input-field" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ height: 34, width: 140 }} />
          </div>
          <div>
            <label className="form-label">To</label>
            <input className="input-field" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ height: 34, width: 140 }} />
          </div>
          <div>
            <label className="form-label">Type</label>
            <select className="select-field" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ height: 34, width: 140 }}>
              <option>All</option><option>Time Entries</option><option>Expenses</option>
            </select>
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="select-field" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ height: 34, width: 160 }}>
              <option value="All">All Categories</option>
              {state.firmSettings.activityCategories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">User</label>
            <select className="select-field" value={userFilter} onChange={e => setUserFilter(e.target.value)} style={{ height: 34, width: 140 }}>
              <option value="All">All Users</option>
              {state.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Billable</label>
            <select className="select-field" value={billableFilter} onChange={e => setBillableFilter(e.target.value)} style={{ height: 34, width: 120 }}>
              <option>All</option><option>Billable</option><option>Non-billable</option>
            </select>
          </div>
          <div>
            <label className="form-label">Matter</label>
            <select className="select-field" value={matterFilter} onChange={e => setMatterFilter(e.target.value)} style={{ height: 34, width: 200 }}>
              <option value="All">All Matters</option>
              {state.matters.map(m => <option key={m.id} value={m.id}>{m.matterNumber}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div style={{ background: '#EEF4FD', border: '1px solid #1A73E8', borderRadius: 8, padding: '8px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{selected.length} selected</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleBulkBillable(true)}>Mark Billable</button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleBulkBillable(false)}>Mark Non-billable</button>
            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>Delete</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelected([])}>Cancel</button>
          </div>
        </div>
      )}

      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No activities found</p><p>Try adjusting your filters</p></div>
        ) : (
          <table>
            <thead>
              <tr className="table-header">
                <th style={{ width: 40, padding: '10px 12px' }}>
                  <input type="checkbox" className="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} />
                </th>
                <th onClick={() => toggleSort('date')} style={{ cursor: 'pointer' }}>Date <SortIcon k="date" /></th>
                <th>Type</th>
                <th onClick={() => toggleSort('matterDescription')} style={{ cursor: 'pointer' }}>Matter <SortIcon k="matterDescription" /></th>
                <th>Description</th>
                <th onClick={() => toggleSort('userName')} style={{ cursor: 'pointer' }}>User <SortIcon k="userName" /></th>
                <th>Duration/Qty</th>
                <th>Rate</th>
                <th>Total</th>
                <th>Billable</th>
                <th>Billed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td style={{ padding: '10px 12px' }}>
                    <input type="checkbox" className="checkbox" checked={selected.includes(a.id)} onChange={() => toggleSelect(a.id)} />
                  </td>
                  <td style={{ fontSize: 12 }}>{a.date}</td>
                  <td><span className={`badge ${a.type === 'TimeEntry' ? 'badge-time' : 'badge-expense'}`}>{a.type === 'TimeEntry' ? 'Time' : 'Expense'}</span></td>
                  <td style={{ fontSize: 12 }}>
                    {a.matterId ? (
                      <span className="text-link" style={{ cursor: 'pointer', fontSize: 12 }} onClick={() => navigate(`/matters/${a.matterId}`)}>
                        {state.matters.find(m => m.id === a.matterId)?.matterNumber || a.matterDescription}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ fontSize: 12, maxWidth: 240 }}>{a.description.length > 60 ? a.description.substring(0,60) + '...' : a.description}</td>
                  <td style={{ fontSize: 12 }}>{a.userName}</td>
                  <td style={{ fontSize: 12 }}>{a.type === 'TimeEntry' ? `${a.duration} hrs` : `${a.quantity} x`}</td>
                  <td style={{ fontSize: 12 }}>${a.rate}</td>
                  <td style={{ fontWeight: 500 }}>${a.total.toFixed(2)}</td>
                  <td>{a.billable ? <span style={{ color: '#34A853' }}>✓</span> : <span style={{ color: '#9AA0A6' }}>—</span>}</td>
                  <td>{a.billed ? <span style={{ color: '#34A853' }}>✓</span> : <span style={{ color: '#9AA0A6' }}>—</span>}</td>
                </tr>
              ))}
              <tr style={{ background: '#F5F6FA', fontWeight: 600, borderTop: '2px solid #E0E0E0' }}>
                <td colSpan={6} style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, color: '#5F6368' }}>Totals</td>
                <td style={{ padding: '10px 12px', fontSize: 13 }}>{totalHours.toFixed(1)} hrs</td>
                <td></td>
                <td style={{ padding: '10px 12px' }}>${totalAmount.toFixed(2)}</td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {modal === 'timeEntry' && <TimeEntryModal onClose={() => setModal(null)} />}
      {modal === 'expense' && <ExpenseModal onClose={() => setModal(null)} />}
    </div>
  )
}
