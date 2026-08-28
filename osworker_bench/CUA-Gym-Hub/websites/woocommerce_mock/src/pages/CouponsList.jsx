import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'

export default function CouponsList() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkAction, setBulkAction] = useState('')

  const navTo = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  const filtered = useMemo(() => {
    return state.coupons.filter(c =>
      !search || c.code.toLowerCase().includes(search.toLowerCase()) || (c.description || '').toLowerCase().includes(search.toLowerCase())
    )
  }, [state.coupons, search])

  const typeLabel = (t) => ({ percent: 'Percentage discount', fixed_cart: 'Fixed cart discount', fixed_product: 'Fixed product discount' })[t] || t

  const isExpired = (c) => c.dateExpires && new Date(c.dateExpires) < new Date()

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = (checked) => {
    if (checked) setSelectedIds(new Set(filtered.map(c => c.id)))
    else setSelectedIds(new Set())
  }

  const applyBulk = () => {
    if (!bulkAction || selectedIds.size === 0) return
    if (bulkAction === 'trash') {
      ;[...selectedIds].forEach(id => dispatch({ type: 'DELETE_COUPON', payload: id }))
      setNotice({ type: 'success', msg: `${selectedIds.size} coupon(s) deleted.` })
    }
    setSelectedIds(new Set())
    setBulkAction('')
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
        <h1>Coupons</h1>
        <button className="button-primary" onClick={() => navTo('/coupons/new')}><Plus size={14} /> Add coupon</button>
      </div>
      <div className="tablenav">
        <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} style={{ height: 30, fontSize: 13 }}>
          <option value="">Bulk actions</option>
          <option value="trash">Move to Trash</option>
        </select>
        <button className="button" onClick={applyBulk}>Apply</button>
        <div className="tablenav-right search-box">
          <input type="search" className="search-input" placeholder="Search coupons..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="button-primary" onClick={() => { /* search already reactive via input */ }}>Search coupons</button>
        </div>
      </div>
      <table className="wp-list-table">
        <thead>
          <tr>
            <th className="cb"><input type="checkbox" onChange={e => selectAll(e.target.checked)} checked={selectedIds.size === filtered.length && filtered.length > 0} /></th>
            <th>Code</th>
            <th>Coupon type</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Usage / Limit</th>
            <th>Expiry date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#646970' }}>No coupons found.</td></tr>
          ) : filtered.map(c => (
            <tr key={c.id}>
              <td className="cb"><input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} /></td>
              <td>
                <button className="button-link" style={{ fontWeight: 600, textTransform: 'uppercase' }} onClick={() => navTo(`/coupons/${c.id}`)}>{c.code}</button>
                {isExpired(c) && <span style={{ marginLeft: 6, background: '#eba3a3', color: '#761919', fontSize: 11, padding: '1px 5px', borderRadius: 3 }}>Expired</span>}
                <div className="row-actions">
                  <span><button className="button-link edit" onClick={() => navTo(`/coupons/${c.id}`)}>Edit</button></span>
                  <span><button className="button-link" style={{ color: '#761919' }} onClick={() => { dispatch({ type: 'DELETE_COUPON', payload: c.id }); setNotice({ type: 'success', msg: 'Coupon deleted.' }) }}>Trash</button></span>
                </div>
              </td>
              <td style={{ fontSize: 12 }}>{typeLabel(c.discountType)}</td>
              <td style={{ fontSize: 12, color: '#646970' }}>{c.description}</td>
              <td>{c.discountType === 'percent' ? `${c.amount}%` : `$${c.amount}`}</td>
              <td>{c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
              <td style={{ fontSize: 12, color: isExpired(c) ? '#761919' : '#646970' }}>
                {c.dateExpires ? format(new Date(c.dateExpires), 'MMM d, yyyy') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="tablenav" style={{ marginTop: 8 }}>
        <span className="text-muted">{filtered.length} items</span>
      </div>
    </div>
  )
}
