import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'

export default function ProductsList() {
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
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [quickEditId, setQuickEditId] = useState(null)
  const [quickEditData, setQuickEditData] = useState({})
  const perPage = 20

  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  const handleSearch = useCallback((val) => {
    setSearchInput(val)
    clearTimeout(window._prodSearchTimer)
    window._prodSearchTimer = setTimeout(() => setSearch(val), 300)
  }, [])

  const visibleProducts = state.products.filter(p => p.status !== 'trash')

  const statusCounts = useMemo(() => ({
    all: visibleProducts.length,
    publish: visibleProducts.filter(p => p.status === 'publish').length,
    draft: visibleProducts.filter(p => p.status === 'draft').length,
    pending: visibleProducts.filter(p => p.status === 'pending').length,
  }), [visibleProducts])

  const filtered = useMemo(() => {
    let list = visibleProducts
    if (activeStatus !== 'all') list = list.filter(p => p.status === activeStatus)
    if (categoryFilter) list = list.filter(p => p.categories.some(c => c.id === categoryFilter))
    if (typeFilter) list = list.filter(p => p.type === typeFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    }
    list = [...list].sort((a, b) => {
      let aVal = a[sortField], bVal = b[sortField]
      if (sortField === 'price') { aVal = parseFloat(aVal); bVal = parseFloat(bVal) }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [visibleProducts, activeStatus, categoryFilter, typeFilter, search, sortField, sortDir])

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
    if (checked) setSelectedIds(new Set(paginated.map(p => p.id)))
    else setSelectedIds(new Set())
  }

  const applyBulk = () => {
    if (!bulkAction || selectedIds.size === 0) return
    const ids = [...selectedIds]
    if (bulkAction === 'trash') {
      ids.forEach(id => dispatch({ type: 'UPDATE_PRODUCT', payload: { id, status: 'trash' } }))
      setNotice({ type: 'success', msg: `${ids.length} product(s) moved to trash.` })
    }
    setSelectedIds(new Set())
    setBulkAction('')
  }

  const openQuickEdit = (prod) => {
    setQuickEditId(prod.id)
    setQuickEditData({
      name: prod.name,
      slug: prod.slug,
      status: prod.status,
      regularPrice: prod.regularPrice,
      salePrice: prod.salePrice,
    })
  }

  const saveQuickEdit = () => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id: quickEditId, ...quickEditData, dateModified: new Date().toISOString() } })
    setQuickEditId(null)
    setNotice({ type: 'success', msg: 'Product updated.' })
  }

  const getStockLabel = (p) => {
    if (!p.manageStock) return <span style={{ color: '#646970' }}>—</span>
    if (p.stockStatus === 'outofstock' || p.stockQuantity === 0) return <span className="stock-outofstock">Out of stock</span>
    if (p.stockStatus === 'onbackorder') return <span className="stock-onbackorder">On backorder ({p.stockQuantity})</span>
    return <span className="stock-instock">In stock ({p.stockQuantity})</span>
  }

  const getPriceLabel = (p) => {
    if (p.onSale && p.salePrice) {
      return (
        <span>
          <del style={{ color: '#646970' }}>${p.regularPrice}</del>{' '}
          <span style={{ color: '#5b841b' }}>${p.salePrice}</span>
        </span>
      )
    }
    return <span>${p.regularPrice || p.price || '—'}</span>
  }

  return (
    <div>
      {notice && (
        <div className={`notice notice-${notice.type}`}>
          <span>{notice.msg}</span>
          <button className="notice-dismiss" onClick={() => setNotice(null)}>×</button>
        </div>
      )}
      <div className="wp-page-title">
        <h1>Products</h1>
        <button className="button-primary" onClick={() => navTo('/products/new')}>
          <Plus size={14} /> Add New
        </button>
      </div>

      <ul className="subsubsub">
        {[['all', 'All'], ['publish', 'Published'], ['draft', 'Draft'], ['pending', 'Pending']].map(([s, label]) => {
          const count = statusCounts[s] || 0
          if (s !== 'all' && !count) return null
          return (
            <li key={s}>
              {activeStatus === s ? (
                <span className="current">{label} <span className="count">({count})</span></span>
              ) : (
                <a onClick={() => { setActiveStatus(s); setPage(1) }}>{label} <span className="count">({count})</span></a>
              )}
            </li>
          )
        })}
      </ul>

      <div className="tablenav">
        <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} style={{ height: 30, fontSize: 13 }}>
          <option value="">Bulk actions</option>
          <option value="trash">Move to Trash</option>
        </select>
        <button className="button" onClick={applyBulk}>Apply</button>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }} style={{ height: 30, fontSize: 13 }}>
          <option value="">All categories</option>
          {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} style={{ height: 30, fontSize: 13 }}>
          <option value="">All types</option>
          <option value="simple">Simple</option>
          <option value="variable">Variable</option>
          <option value="grouped">Grouped</option>
          <option value="external">External</option>
        </select>
        <button className="button" onClick={() => setPage(1)}>Filter</button>
        <div className="tablenav-right search-box">
          <input
            type="search"
            className="search-input"
            placeholder="Search products..."
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
          />
          <button className="button-primary" onClick={() => setSearch(searchInput)}>Search products</button>
        </div>
      </div>

      <table className="wp-list-table">
        <thead>
          <tr>
            <th className="cb"><input type="checkbox" onChange={e => selectAll(e.target.checked)} checked={selectedIds.size === paginated.length && paginated.length > 0} /></th>
            <th style={{ width: 70 }}></th>
            <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>Name <SortIcon field="name" /></th>
            <th>Stock</th>
            <th onClick={() => toggleSort('price')} style={{ cursor: 'pointer' }}>Price <SortIcon field="price" /></th>
            <th>Categories</th>
            <th>Tags</th>
            <th onClick={() => toggleSort('dateCreated')} style={{ cursor: 'pointer' }}>Date <SortIcon field="dateCreated" /></th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#646970' }}>No products found.</td></tr>
          ) : paginated.map(prod => [
            <tr key={prod.id}>
              <td className="cb"><input type="checkbox" checked={selectedIds.has(prod.id)} onChange={() => toggleSelect(prod.id)} /></td>
              <td>
                {prod.images?.[0]?.src ? (
                  <img src={prod.images[0].src} alt={prod.name} className="product-thumb" />
                ) : (
                  <div style={{ width: 60, height: 60, background: '#f6f7f7', border: '1px solid #dcdcde', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#646970' }}>No img</div>
                )}
              </td>
              <td>
                <button className="button-link" style={{ fontWeight: 600 }} onClick={() => navTo(`/products/${prod.id}`)}>
                  {prod.name}
                </button>
                <div className="text-muted">{prod.sku}</div>
                <div className="row-actions">
                  <span><button className="button-link edit" onClick={() => navTo(`/products/${prod.id}`)}>Edit</button></span>
                  <span><button className="button-link" onClick={() => openQuickEdit(prod)}>Quick Edit</button></span>
                  <span><button className="button-link" style={{ color: '#761919' }} onClick={() => { dispatch({ type: 'UPDATE_PRODUCT', payload: { id: prod.id, status: 'trash' } }); setNotice({ type: 'success', msg: 'Product moved to trash.' }) }}>Trash</button></span>
                </div>
              </td>
              <td>{getStockLabel(prod)}</td>
              <td>{getPriceLabel(prod)}</td>
              <td style={{ fontSize: 12 }}>{prod.categories.map(c => c.name).join(', ')}</td>
              <td style={{ fontSize: 12 }}>{prod.tags.map(t => t.name).join(', ')}</td>
              <td>
                <span style={{ fontSize: 12 }}>
                  {prod.status === 'publish' ? 'Published' : prod.status === 'draft' ? 'Draft' : prod.status}
                </span>
                <div className="text-muted">{format(new Date(prod.dateCreated), 'MMM d, yyyy')}</div>
              </td>
            </tr>,
            quickEditId === prod.id && (
              <tr key={`qe-${prod.id}`} className="quick-edit-row">
                <td colSpan={8}>
                  <div className="quick-edit-form">
                    <strong style={{ display: 'block', marginBottom: 12 }}>Quick Edit</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 12 }}>Title</label>
                        <input type="text" value={quickEditData.name} onChange={e => setQuickEditData(d => ({ ...d, name: e.target.value }))} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 12 }}>Status</label>
                        <select value={quickEditData.status} onChange={e => setQuickEditData(d => ({ ...d, status: e.target.value }))} style={{ height: 30, width: '100%' }}>
                          <option value="publish">Published</option>
                          <option value="draft">Draft</option>
                          <option value="pending">Pending Review</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 12 }}>Regular Price</label>
                          <input type="text" value={quickEditData.regularPrice} onChange={e => setQuickEditData(d => ({ ...d, regularPrice: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 12 }}>Sale Price</label>
                          <input type="text" value={quickEditData.salePrice} onChange={e => setQuickEditData(d => ({ ...d, salePrice: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="button-primary" onClick={saveQuickEdit}>Update</button>
                      <button className="button" onClick={() => setQuickEditId(null)}>Cancel</button>
                    </div>
                  </div>
                </td>
              </tr>
            )
          ])}
        </tbody>
      </table>

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
