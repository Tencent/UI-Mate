import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'

export default function CustomersList() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sortField, setSortField] = useState('dateCreated')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const perPage = 20

  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  const handleSearch = useCallback((val) => {
    setSearchInput(val)
    clearTimeout(window._custSearchTimer)
    window._custSearchTimer = setTimeout(() => setSearch(val), 300)
  }, [])

  const filtered = useMemo(() => {
    let list = state.customers
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q)
      )
    }
    list = [...list].sort((a, b) => {
      let aVal = a[sortField], bVal = b[sortField]
      if (sortField === 'totalSpent' || sortField === 'ordersCount') {
        aVal = parseFloat(aVal); bVal = parseFloat(bVal)
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [state.customers, search, sortField, sortDir])

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

  return (
    <div>
      <div className="wp-page-title">
        <h1>Customers</h1>
      </div>

      <div className="tablenav">
        <div className="tablenav-right search-box">
          <input
            type="search"
            className="search-input"
            placeholder="Search customers..."
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
          />
          <button className="button-primary" onClick={() => setSearch(searchInput)}>Search customers</button>
        </div>
      </div>

      <table className="wp-list-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort('lastName')} style={{ cursor: 'pointer' }}>Name <SortIcon field="lastName" /></th>
            <th>Username</th>
            <th>Email</th>
            <th onClick={() => toggleSort('ordersCount')} style={{ cursor: 'pointer' }}>Orders <SortIcon field="ordersCount" /></th>
            <th onClick={() => toggleSort('totalSpent')} style={{ cursor: 'pointer' }}>Total Spent <SortIcon field="totalSpent" /></th>
            <th onClick={() => toggleSort('dateCreated')} style={{ cursor: 'pointer' }}>Registered <SortIcon field="dateCreated" /></th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#646970' }}>No customers found.</td></tr>
          ) : paginated.map(c => (
            <tr key={c.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={c.avatarUrl} alt="" className="customer-avatar" />
                  <button className="button-link" style={{ fontWeight: 600 }} onClick={() => navTo(`/customers/${c.id}`)}>
                    {c.firstName} {c.lastName}
                  </button>
                </div>
              </td>
              <td className="text-muted">{c.username}</td>
              <td><a href={`mailto:${c.email}`}>{c.email}</a></td>
              <td>
                <button className="button-link" onClick={() => navTo(`/customers/${c.id}`)}>
                  {c.ordersCount}
                </button>
              </td>
              <td>${parseFloat(c.totalSpent).toFixed(2)}</td>
              <td className="text-muted">{format(new Date(c.dateCreated), 'MMM d, yyyy')}</td>
              <td>
                <button className="button-link" onClick={() => navTo(`/customers/${c.id}`)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="tablenav" style={{ marginTop: 8 }}>
        <span className="text-muted">{filtered.length} customers</span>
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
