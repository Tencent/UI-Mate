import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/ToastProvider'

const STATUS_CLASS = {
  'Open': 'status-ordered', 'In Process': 'status-partial',
  'Completed': 'status-delivered', 'Cancelled': 'status-cancelled'
}

function StatusIcon({ status }) {
  if (status === 'Open') return <span style={{ color: 'var(--xap-blue)' }}>●</span>
  if (status === 'In Process') return <span style={{ color: 'var(--xap-status-warning)' }}>◑</span>
  if (status === 'Completed') return <span style={{ color: 'var(--xap-status-success)' }}>✓</span>
  if (status === 'Cancelled') return <span style={{ color: 'var(--xap-status-error)' }}>×</span>
  return <span>—</span>
}

export default function ManageSalesOrders() {
  const { state, deleteSalesOrder, setFilterState } = useApp()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { salesOrders, filterState } = state

  const [filters, setFilters] = useState({
    soNumber: filterState?.so?.soNumber || '',
    customer: filterState?.so?.customer || '',
    salesOrg: filterState?.so?.salesOrg || '',
    dateFrom: filterState?.so?.dateFrom || '',
    dateTo: filterState?.so?.dateTo || '',
    status: filterState?.so?.status || '',
    deliveryStatus: filterState?.so?.deliveryStatus || '',
    billingStatus: filterState?.so?.billingStatus || ''
  })
  const [applied, setApplied] = useState(filters)
  const [sortCol, setSortCol] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [selected, setSelected] = useState([])
  const [filterCollapsed, setFilterCollapsed] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = useMemo(() => {
    let res = [...salesOrders]
    if (applied.soNumber) res = res.filter(s => s.soNumber.toLowerCase().includes(applied.soNumber.toLowerCase()))
    if (applied.customer) res = res.filter(s => s.customerName.toLowerCase().includes(applied.customer.toLowerCase()))
    if (applied.salesOrg) res = res.filter(s => s.salesOrg === applied.salesOrg)
    if (applied.dateFrom) res = res.filter(s => s.createdDate >= applied.dateFrom)
    if (applied.dateTo) res = res.filter(s => s.createdDate <= applied.dateTo)
    if (applied.status) res = res.filter(s => s.status === applied.status)
    if (applied.deliveryStatus) res = res.filter(s => s.overallDeliveryStatus === applied.deliveryStatus)
    if (applied.billingStatus) res = res.filter(s => s.overallBillingStatus === applied.billingStatus)
    if (sortCol) {
      res.sort((a, b) => {
        let va = a[sortCol], vb = b[sortCol]
        if (typeof va === 'string') va = va.toLowerCase()
        if (typeof vb === 'string') vb = vb.toLowerCase()
        return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
      })
    }
    return res
  }, [salesOrders, applied, sortCol, sortDir])

  function applyFilters() { setApplied(filters); setFilterState({ so: filters }) }

  function handleSort(col) {
    if (sortCol === col) { if (sortDir === 'asc') setSortDir('desc'); else { setSortCol(''); setSortDir('asc') } }
    else { setSortCol(col); setSortDir('asc') }
  }
  function thClass(col) {
    if (sortCol !== col) return 'sortable'
    return sortDir === 'asc' ? 'sortable sort-asc' : 'sortable sort-desc'
  }
  function toggleSelect(id) { setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]) }
  function toggleAll() { setSelected(p => p.length === filtered.length ? [] : filtered.map(s => s.id)) }

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', flex: 1, overflowY: 'auto' }}>
        {/* Filter bar */}
        <div className="filter-bar">
          {!filterCollapsed && (
            <div className="filter-bar-fields">
              <div className="form-field">
                <label>Sales Order</label>
                <input value={filters.soNumber} onChange={e => setFilters(f => ({ ...f, soNumber: e.target.value }))} placeholder="e.g. 1000001234" />
              </div>
              <div className="form-field">
                <label>Customer</label>
                <input value={filters.customer} onChange={e => setFilters(f => ({ ...f, customer: e.target.value }))} placeholder="Customer name" />
              </div>
              <div className="form-field">
                <label>Sales Organization</label>
                <select value={filters.salesOrg} onChange={e => setFilters(f => ({ ...f, salesOrg: e.target.value }))}>
                  <option value="">All</option>
                  <option value="1000">1000 — BestRun Sales Org</option>
                </select>
              </div>
              <div className="form-field">
                <label>Order Date From</label>
                <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Order Date To</label>
                <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                  <option value="">All</option>
                  {['Open','In Process','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Delivery Status</label>
                <select value={filters.deliveryStatus} onChange={e => setFilters(f => ({ ...f, deliveryStatus: e.target.value }))}>
                  <option value="">All</option>
                  {['Not Delivered','Partially Delivered','Fully Delivered'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Billing Status</label>
                <select value={filters.billingStatus} onChange={e => setFilters(f => ({ ...f, billingStatus: e.target.value }))}>
                  <option value="">All</option>
                  {['Not Billed','Partially Billed','Fully Billed'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="filter-bar-actions">
            <button className="btn-ghost" style={{ fontSize: '12px', color: 'var(--xap-text-secondary)' }}>Adapt Filters (8)</button>
            <button className="btn-primary" onClick={applyFilters}>Go</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
            <button onClick={() => setFilterCollapsed(c => !c)}
              style={{ background: 'none', border: 'none', color: 'var(--xap-text-secondary)', cursor: 'pointer', fontSize: '18px' }}>
              {filterCollapsed ? '▽' : '△'}
            </button>
          </div>
        </div>

        <div className="section-card">
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--xap-border)' }}>
            <div className="table-toolbar">
              <span className="table-count">Sales Orders ({filtered.length})</span>
              <div className="table-toolbar-right">
                <button className="btn-ghost" onClick={() => navigate('/app/create-sales-order')}>Create</button>
                <button className="btn-ghost" disabled={selected.length === 0}>Copy</button>
                <button className="btn-ghost" disabled={selected.length === 0} onClick={() => setConfirmDelete(selected)}
                  style={{ color: selected.length > 0 ? 'var(--xap-status-error)' : undefined }}>Delete</button>
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
                  <th style={{ width: '40px' }}><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                  <th style={{ width: '32px' }}></th>
                  <th className={thClass('soNumber')} onClick={() => handleSort('soNumber')}>SO Number</th>
                  <th className={thClass('customerName')} onClick={() => handleSort('customerName')}>Customer</th>
                  <th className={thClass('createdDate')} onClick={() => handleSort('createdDate')}>Order Date</th>
                  <th className={thClass('totalNetValue')} onClick={() => handleSort('totalNetValue')} style={{ textAlign: 'right' }}>Net Value</th>
                  <th>Currency</th>
                  <th className={thClass('status')} onClick={() => handleSort('status')}>Status</th>
                  <th>Delivery Status</th>
                  <th>Billing Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--xap-text-secondary)' }}>No sales orders found.</td></tr>
                ) : filtered.map(so => (
                  <tr key={so.id} className={selected.includes(so.id) ? 'selected' : ''}>
                    <td><input type="checkbox" checked={selected.includes(so.id)} onChange={() => toggleSelect(so.id)} /></td>
                    <td><StatusIcon status={so.status} /></td>
                    <td><button className="btn-link" onClick={() => navigate(`/app/sales-order/${so.id}`)}>{so.soNumber}</button></td>
                    <td>{so.customerName}</td>
                    <td>{so.createdDate}</td>
                    <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(so.totalNetValue)}</td>
                    <td>{so.currency}</td>
                    <td><span className={`status-badge ${STATUS_CLASS[so.status] || ''}`}>{so.status}</span></td>
                    <td>{so.overallDeliveryStatus}</td>
                    <td>{so.overallBillingStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Sales Order(s)"
          message={`Delete ${confirmDelete.length} sales order${confirmDelete.length > 1 ? 's' : ''}?`}
          confirmLabel="Delete"
          confirmClass="btn-danger"
          onConfirm={() => { confirmDelete.forEach(id => deleteSalesOrder(id)); showToast(`${confirmDelete.length} SO(s) deleted`, 'success'); setSelected([]); setConfirmDelete(null) }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
