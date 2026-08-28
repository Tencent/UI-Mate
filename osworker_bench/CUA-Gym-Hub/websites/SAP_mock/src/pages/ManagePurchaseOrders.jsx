import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/ToastProvider'

function formatCurrency(val, cur = 'USD') {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + ' ' + cur
}

function StatusIcon({ status, deliveryStatus }) {
  if (deliveryStatus === 'Overdue') return <span title="Overdue" style={{ color: 'var(--xap-status-error)' }}>⚠</span>
  if (status === 'Fully Delivered') return <span title="Delivered" style={{ color: 'var(--xap-status-success)' }}>✓</span>
  if (status === 'Partially Delivered') return <span title="Partially Delivered" style={{ color: 'var(--xap-status-warning)' }}>◑</span>
  if (status === 'Ordered') return <span title="Ordered" style={{ color: 'var(--xap-blue)' }}>●</span>
  if (status === 'Draft') return <span title="Draft" style={{ color: 'var(--xap-text-secondary)' }}>○</span>
  if (status === 'Closed') return <span title="Closed" style={{ color: 'var(--xap-text-secondary)' }}>■</span>
  return <span>—</span>
}

const STATUS_CLASS = {
  'Draft': 'status-draft', 'Ordered': 'status-ordered',
  'Partially Delivered': 'status-partial', 'Fully Delivered': 'status-delivered',
  'Closed': 'status-closed'
}

export default function ManagePurchaseOrders() {
  const { state, deletePurchaseOrder, setFilterState } = useApp()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { purchaseOrders, plants, filterState } = state

  const [filters, setFilters] = useState({
    poNumber: filterState?.po?.poNumber || '',
    supplier: filterState?.po?.supplier || '',
    purchasingOrg: filterState?.po?.purchasingOrg || '',
    dateFrom: filterState?.po?.dateFrom || '',
    dateTo: filterState?.po?.dateTo || '',
    status: filterState?.po?.status || '',
    plant: filterState?.po?.plant || '',
    deliveryStatus: filterState?.po?.deliveryStatus || ''
  })
  const [applied, setApplied] = useState(filters)
  const [sortCol, setSortCol] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [selected, setSelected] = useState([])
  const [showVariants, setShowVariants] = useState(false)
  const [variant, setVariant] = useState('Standard')
  const [filterCollapsed, setFilterCollapsed] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = useMemo(() => {
    let res = [...purchaseOrders]
    if (applied.poNumber) res = res.filter(p => p.poNumber.toLowerCase().includes(applied.poNumber.toLowerCase()))
    if (applied.supplier) res = res.filter(p => p.supplierName.toLowerCase().includes(applied.supplier.toLowerCase()))
    if (applied.purchasingOrg) res = res.filter(p => p.purchasingOrg === applied.purchasingOrg)
    if (applied.dateFrom) res = res.filter(p => p.createdDate >= applied.dateFrom)
    if (applied.dateTo) res = res.filter(p => p.createdDate <= applied.dateTo)
    if (applied.status) res = res.filter(p => p.status === applied.status)
    if (applied.plant) res = res.filter(p => p.plant === applied.plant)
    if (applied.deliveryStatus) res = res.filter(p => p.deliveryStatus === applied.deliveryStatus)
    if (sortCol) {
      res.sort((a, b) => {
        let va = a[sortCol], vb = b[sortCol]
        if (typeof va === 'string') va = va.toLowerCase()
        if (typeof vb === 'string') vb = vb.toLowerCase()
        return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
      })
    }
    return res
  }, [purchaseOrders, applied, sortCol, sortDir])

  function applyFilters() {
    setApplied(filters)
    setFilterState({ po: filters })
  }

  function handleSort(col) {
    if (sortCol === col) {
      if (sortDir === 'asc') setSortDir('desc')
      else if (sortDir === 'desc') { setSortCol(''); setSortDir('asc') }
    } else { setSortCol(col); setSortDir('asc') }
  }

  function thClass(col) {
    if (sortCol !== col) return 'sortable'
    return sortDir === 'asc' ? 'sortable sort-asc' : 'sortable sort-desc'
  }

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function toggleAll() {
    setSelected(prev => prev.length === filtered.length ? [] : filtered.map(p => p.id))
  }

  function handleDelete() {
    if (selected.length === 0) return
    setConfirmDelete(selected)
  }

  function confirmDeleteAction() {
    selected.forEach(id => deletePurchaseOrder(id))
    showToast(`${selected.length} purchase order${selected.length > 1 ? 's' : ''} deleted`, 'success')
    setSelected([])
    setConfirmDelete(null)
  }

  const VARIANT_OPTIONS = ['Standard (Default)', 'My Custom View', 'Save As...', 'Manage...']

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Variant bar */}
      <div className="variant-bar">
        <div style={{ position: 'relative' }}>
          <button className="variant-selector" onClick={() => setShowVariants(s => !s)}>
            {variant}* <span style={{ fontSize: '10px' }}>▾</span>
          </button>
          {showVariants && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, background: '#fff',
              border: '1px solid var(--xap-border)', borderRadius: '4px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '180px'
            }}>
              {VARIANT_OPTIONS.map(v => (
                <div key={v} onClick={() => { setVariant(v.replace(' (Default)', '')); setShowVariants(false) }}
                  style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', color: 'var(--xap-text-primary)' }}
                  onMouseEnter={e => e.target.style.background = 'var(--xap-page-bg)'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >{v}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '12px 16px', flex: 1, overflowY: 'auto' }}>
        {/* Filter bar */}
        <div className="filter-bar">
          {!filterCollapsed && (
            <div className="filter-bar-fields">
              <div className="form-field">
                <label>Purchase Order</label>
                <input value={filters.poNumber} onChange={e => setFilters(f => ({ ...f, poNumber: e.target.value }))} placeholder="e.g. 4500001234" />
              </div>
              <div className="form-field">
                <label>Supplier</label>
                <input value={filters.supplier} onChange={e => setFilters(f => ({ ...f, supplier: e.target.value }))} placeholder="Supplier name" />
              </div>
              <div className="form-field">
                <label>Purchasing Org.</label>
                <select value={filters.purchasingOrg} onChange={e => setFilters(f => ({ ...f, purchasingOrg: e.target.value }))}>
                  <option value="">All</option>
                  <option value="1000">1000 — BestRun Purchasing Org</option>
                </select>
              </div>
              <div className="form-field">
                <label>PO Date From</label>
                <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>PO Date To</label>
                <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                  <option value="">All</option>
                  {['Draft','Ordered','Partially Delivered','Fully Delivered','Closed'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Plant</label>
                <select value={filters.plant} onChange={e => setFilters(f => ({ ...f, plant: e.target.value }))}>
                  <option value="">All</option>
                  {plants.map(p => <option key={p.plantCode} value={p.plantCode}>{p.plantCode} — {p.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Delivery Status</label>
                <select value={filters.deliveryStatus} onChange={e => setFilters(f => ({ ...f, deliveryStatus: e.target.value }))}>
                  <option value="">All</option>
                  {['On Time','Overdue','Partially Received','Received'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="filter-bar-actions">
            <button className="btn-ghost" style={{ fontSize: '12px', color: 'var(--xap-text-secondary)' }}>
              Adapt Filters (8)
            </button>
            <button className="btn-primary" onClick={applyFilters}>Go</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
            <button
              onClick={() => setFilterCollapsed(c => !c)}
              style={{ background: 'none', border: 'none', color: 'var(--xap-text-secondary)', cursor: 'pointer', fontSize: '18px' }}
              title={filterCollapsed ? 'Expand filters' : 'Collapse filters'}
            >
              {filterCollapsed ? '▽' : '△'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="section-card">
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--xap-border)' }}>
            <div className="table-toolbar">
              <div className="table-toolbar-left">
                <span className="table-count">Purchase Orders ({filtered.length})</span>
              </div>
              <div className="table-toolbar-right">
                <button className="btn-ghost" onClick={() => navigate('/app/create-purchase-order')}>Create</button>
                <button className="btn-ghost" disabled={selected.length === 0}>Copy</button>
                <button
                  className="btn-ghost"
                  onClick={handleDelete}
                  disabled={selected.length === 0}
                  style={{ color: selected.length > 0 ? 'var(--xap-status-error)' : undefined }}
                >
                  Delete
                </button>
                <span style={{ color: 'var(--xap-border)', margin: '0 4px' }}>|</span>
                <button className="btn-ghost" title="Settings">⚙</button>
                <button className="btn-ghost" title="Export">⬇</button>
              </div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="xap-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} />
                  </th>
                  <th style={{ width: '32px' }}></th>
                  <th className={thClass('poNumber')} onClick={() => handleSort('poNumber')}>PO Number</th>
                  <th className={thClass('supplierName')} onClick={() => handleSort('supplierName')}>Supplier</th>
                  <th className={thClass('createdDate')} onClick={() => handleSort('createdDate')}>PO Date</th>
                  <th className={thClass('totalNetValue')} onClick={() => handleSort('totalNetValue')} style={{ textAlign: 'right' }}>Net Value</th>
                  <th>Currency</th>
                  <th className={thClass('status')} onClick={() => handleSort('status')}>Status</th>
                  <th className={thClass('deliveryStatus')} onClick={() => handleSort('deliveryStatus')}>Delivery Status</th>
                  <th>Plant</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--xap-text-secondary)' }}>
                    No purchase orders found. Adjust filters and click Go.
                  </td></tr>
                ) : filtered.map(po => (
                  <tr key={po.id} className={selected.includes(po.id) ? 'selected' : ''}>
                    <td><input type="checkbox" checked={selected.includes(po.id)} onChange={() => toggleSelect(po.id)} /></td>
                    <td><StatusIcon status={po.status} deliveryStatus={po.deliveryStatus} /></td>
                    <td>
                      <button className="btn-link" onClick={() => navigate(`/app/purchase-order/${po.id}`)}>
                        {po.poNumber}
                      </button>
                    </td>
                    <td>{po.supplierName}</td>
                    <td>{po.createdDate}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(po.totalNetValue)}
                    </td>
                    <td>{po.currency}</td>
                    <td><span className={`status-badge ${STATUS_CLASS[po.status] || ''}`}>{po.status}</span></td>
                    <td>{po.deliveryStatus}</td>
                    <td>{po.plant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Purchase Order(s)"
          message={`Are you sure you want to delete ${confirmDelete.length} purchase order${confirmDelete.length > 1 ? 's' : ''}? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmClass="btn-danger"
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
