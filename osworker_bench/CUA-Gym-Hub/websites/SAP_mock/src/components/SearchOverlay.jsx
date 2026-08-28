import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function SearchOverlay({ onClose }) {
  const { state, setSearchQuery } = useApp()
  const [query, setQuery] = useState(state.searchQuery)
  const [results, setResults] = useState([])
  const navigate = useNavigate()

  function search(q) {
    setQuery(q)
    setSearchQuery(q)
    if (!q.trim()) { setResults([]); return }
    const ql = q.toLowerCase()
    const found = []
    state.purchaseOrders.filter(po =>
      po.poNumber.includes(q) || po.supplierName.toLowerCase().includes(ql)
    ).slice(0, 3).forEach(po =>
      found.push({ type: 'Purchase Order', label: `PO ${po.poNumber} — ${po.supplierName}`, route: `/app/purchase-order/${po.id}` })
    )
    state.salesOrders.filter(so =>
      so.soNumber.includes(q) || so.customerName.toLowerCase().includes(ql)
    ).slice(0, 3).forEach(so =>
      found.push({ type: 'Sales Order', label: `SO ${so.soNumber} — ${so.customerName}`, route: `/app/sales-order/${so.id}` })
    )
    state.materials.filter(m =>
      m.materialNumber.toLowerCase().includes(ql) || m.description.toLowerCase().includes(ql)
    ).slice(0, 3).forEach(m =>
      found.push({ type: 'Material', label: `${m.materialNumber} — ${m.description}`, route: `/app/product/${m.id}` })
    )
    setResults(found)
  }

  function handleSelect(route) {
    navigate(route)
    onClose()
  }

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(53,74,95,0.95)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: '6px',
      zIndex: 9999
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '600px', maxWidth: '90vw', gap: '8px' }}>
        <select style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '4px', padding: '6px 10px', color: '#fff', fontSize: '13px', cursor: 'pointer'
        }}>
          <option>All</option>
          <option>Purchase Orders</option>
          <option>Sales Orders</option>
          <option>Materials</option>
        </select>
        <input
          autoFocus
          value={query}
          onChange={e => search(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') onClose() }}
          placeholder="Search..."
          style={{
            flex: 1, background: '#fff', border: 'none', borderRadius: '4px',
            padding: '8px 12px', fontSize: '14px', outline: 'none'
          }}
        />
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
      </div>
      {results.length > 0 && (
        <div style={{
          width: '600px', maxWidth: '90vw', background: '#fff',
          borderRadius: '8px', marginTop: '4px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }}>
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => handleSelect(r.route)}
              style={{
                display: 'flex', gap: '12px', padding: '10px 16px',
                cursor: 'pointer', borderBottom: '1px solid var(--xap-border)',
                fontSize: '13px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--xap-page-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <span style={{ color: 'var(--xap-text-secondary)', minWidth: '100px', fontSize: '12px' }}>{r.type}</span>
              <span style={{ color: 'var(--xap-blue)' }}>{r.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
