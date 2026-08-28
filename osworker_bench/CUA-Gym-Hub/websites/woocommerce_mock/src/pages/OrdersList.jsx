import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Eye, ChevronUp, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_LABELS = {
  processing: 'Processing', completed: 'Completed', 'on-hold': 'On hold',
  pending: 'Pending payment', cancelled: 'Cancelled', refunded: 'Refunded', failed: 'Failed'
}

function StatusBadge({ status }) {
  const cls = `order-status-badge status-${status.replace('-', '-')}`
  return <span className={cls}>{STATUS_LABELS[status] || status}</span>
}

export default function OrdersList() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [activeStatus, setActiveStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [bulkAction, setBulkAction] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [sortField, setSortField] = useState('dateCreated')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState(null)
  const perPage = 20

  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  // Debounced search
  const handleSearch = useCallback((val) => {
    setSearchInput(val)
    clearTimeout(window._searchTimer)
    window._searchTimer = setTimeout(() => setSearch(val), 300)
  }, [])

  const statusCounts = useMemo(() => {
    const counts = { all: state.orders.length }
    for (const o of state.orders) {
      counts[o.status] = (counts[o.status] || 0) + 1
    }
    return counts
  }, [state.orders])

  const filtered = useMemo(() => {
    let list = state.orders
    if (activeStatus !== 'all') list = list.filter(o => o.status === activeStatus)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        o.number.includes(q) ||
        `${o.billing.firstName} ${o.billing.lastName}`.toLowerCase().includes(q) ||
        o.billing.email.toLowerCase().includes(q)
      )
    }
    list = [...list].sort((a, b) => {
      let aVal = a[sortField], bVal = b[sortField]
      if (sortField === 'total') { aVal = parseFloat(aVal); bVal = parseFloat(bVal) }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [state.orders, activeStatus, search, sortField, sortDir])

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.ceil(filtered.length / perPage)

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={12} style={{ opacity: 0.3 }} />
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = (checked) => {
    if (checked) setSelectedIds(new Set(paginated.map(o => o.id)))
    else setSelectedIds(new Set())
  }

  const applyBulk = () => {
    if (!bulkAction || selectedIds.size === 0) return
    const ids = [...selectedIds]
    if (bulkAction === 'trash') {
      ids.forEach(id => dispatch({ type: 'UPDATE_ORDER', payload: { id, status: 'cancelled' } }))
      setNotice({ type: 'success', msg: `${ids.length} order(s) moved to cancelled.` })
    } else if (bulkAction.startsWith('status_')) {
      const newStatus = bulkAction.replace('status_', '')
      ids.forEach(id => dispatch({ type: 'UPDATE_ORDER', payload: { id, status: newStatus, dateModified: new Date().toISOString() } }))
      setNotice({ type: 'success', msg: `${ids.length} order(s) updated.` })
    }
    setSelectedIds(new Set())
    setBulkAction('')
  }

  const statuses = ['all', 'processing', 'on-hold', 'completed', 'pending', 'cancelled', 'refunded', 'failed']

  return (
    <div>
      {notice && (
        <div className={`notice notice-${notice.type}`}>
          <span>{notice.msg}</span>
          <button className="notice-dismiss" onClick={() => setNotice(null)}>×</button>
        </div>
      )}
      <div className="wp-page-title">
        <h1>Orders</h1>
      </div>

      {/* Status filter tabs */}
      <ul className="subsubsub">
        {statuses.map(s => {
          const count = statusCounts[s] || 0
          if (s !== 'all' && !count) return null
          return (
            <li key={s}>
              {activeStatus === s ? (
                <span className="current">
                  {s === 'all' ? 'All' : STATUS_LABELS[s]} <span className="count">({s === 'all' ? statusCounts.all : count})</span>
                </span>
              ) : (
                <a onClick={() => { setActiveStatus(s); setPage(1) }}>
                  {s === 'all' ? 'All' : STATUS_LABELS[s]} <span className="count">({s === 'all' ? statusCounts.all : count})</span>
                </a>
              )}
            </li>
          )
        })}
      </ul>

      {/* Toolbar */}
      <div className="tablenav">
        <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} style={{ height: 30, fontSize: 13 }}>
          <option value="">Bulk actions</option>
          <option value="trash">Move to Trash</option>
          <option value="status_processing">Change status to Processing</option>
          <option value="status_completed">Change status to Completed</option>
          <option value="status_on-hold">Change status to On hold</option>
        </select>
        <button className="button" onClick={applyBulk}>Apply</button>
        <div className="tablenav-right search-box">
          <input
            type="search"
            className="search-input"
            placeholder="Search orders..."
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
          />
          <button className="button-primary" onClick={() => setSearch(searchInput)}>Search orders</button>
        </div>
      </div>

      {/* Table */}
      <table className="wp-list-table">
        <thead>
          <tr>
            <th className="cb">
              <input type="checkbox" onChange={e => selectAll(e.target.checked)} checked={selectedIds.size === paginated.length && paginated.length > 0} />
            </th>
            <th onClick={() => toggleSort('number')} style={{ cursor: 'pointer' }}>
              Order <SortIcon field="number" />
            </th>
            <th onClick={() => toggleSort('dateCreated')} style={{ cursor: 'pointer' }}>
              Date <SortIcon field="dateCreated" />
            </th>
            <th>Status</th>
            <th onClick={() => toggleSort('total')} style={{ cursor: 'pointer' }}>
              Total <SortIcon field="total" />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#646970' }}>No orders found.</td></tr>
          ) : paginated.map(o => {
            const name = `${o.billing.firstName} ${o.billing.lastName}`
            return (
              <tr key={o.id}>
                <td className="cb">
                  <input type="checkbox" checked={selectedIds.has(o.id)} onChange={() => toggleSelect(o.id)} />
                </td>
                <td>
                  <button className="button-link" style={{ fontWeight: 600 }} onClick={() => navTo(`/orders/${o.id}`)}>
                    #{o.number} {name}
                  </button>
                  <div className="row-actions">
                    <span><button className="button-link edit" onClick={() => navTo(`/orders/${o.id}`)}>View</button></span>
                  </div>
                </td>
                <td>
                  <span>{format(new Date(o.dateCreated), 'MMM d, yyyy')}</span>
                  <div className="text-muted">{format(new Date(o.dateCreated), 'h:mm a')}</div>
                </td>
                <td><StatusBadge status={o.status} /></td>
                <td>${o.total} for {o.lineItems.length} item{o.lineItems.length !== 1 ? 's' : ''}</td>
                <td>
                  <button className="button" style={{ padding: '0 8px', height: 26, fontSize: 12 }} onClick={() => navTo(`/orders/${o.id}`)}>
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="tablenav" style={{ marginTop: 8 }}>
        <span className="text-muted">{filtered.length} items</span>
        {totalPages > 1 && (
          <div className="tablenav-right tablenav-pages">
            <button className="page-numbers" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-numbers ${p === page ? 'current' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-numbers" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          </div>
        )}
      </div>
    </div>
  )
}
