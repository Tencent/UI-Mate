import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const MATERIAL_TYPE_LABELS = {
  'HAWA': 'Trading Goods', 'ROH': 'Raw Material',
  'FERT': 'Finished Product', 'HALB': 'Semi-Finished'
}

function StatusIcon({ status }) {
  if (status === 'Active') return <span style={{ color: 'var(--xap-status-success)' }}>●</span>
  if (status === 'Inactive') return <span style={{ color: 'var(--xap-text-secondary)' }}>○</span>
  return <span>—</span>
}

export default function ManageProducts() {
  const { state, setFilterState } = useApp()
  const navigate = useNavigate()
  const { materials, filterState } = state

  const [filters, setFilters] = useState({
    materialNumber: filterState?.mat?.materialNumber || '',
    description: filterState?.mat?.description || '',
    materialType: filterState?.mat?.materialType || '',
    plant: filterState?.mat?.plant || '',
    status: filterState?.mat?.status || ''
  })
  const [applied, setApplied] = useState(filters)
  const [sortCol, setSortCol] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [selected, setSelected] = useState([])
  const [filterCollapsed, setFilterCollapsed] = useState(false)

  const { plants } = state

  const filtered = useMemo(() => {
    let res = [...materials]
    if (applied.materialNumber) res = res.filter(m => m.materialNumber.toLowerCase().includes(applied.materialNumber.toLowerCase()))
    if (applied.description) res = res.filter(m => m.description.toLowerCase().includes(applied.description.toLowerCase()))
    if (applied.materialType) res = res.filter(m => m.materialType === applied.materialType)
    if (applied.status) res = res.filter(m => (m.status || 'Active') === applied.status)
    if (sortCol) {
      res.sort((a, b) => {
        let va = a[sortCol], vb = b[sortCol]
        if (typeof va === 'string') va = va.toLowerCase()
        if (typeof vb === 'string') vb = vb.toLowerCase()
        return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
      })
    }
    return res
  }, [materials, applied, sortCol, sortDir])

  function applyFilters() { setApplied(filters); setFilterState({ mat: filters }) }

  function handleSort(col) {
    if (sortCol === col) { if (sortDir === 'asc') setSortDir('desc'); else { setSortCol(''); setSortDir('asc') } }
    else { setSortCol(col); setSortDir('asc') }
  }
  function thClass(col) {
    if (sortCol !== col) return 'sortable'
    return sortDir === 'asc' ? 'sortable sort-asc' : 'sortable sort-desc'
  }
  function toggleSelect(id) { setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]) }
  function toggleAll() { setSelected(p => p.length === filtered.length ? [] : filtered.map(m => m.id)) }

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', flex: 1, overflowY: 'auto' }}>
        {/* Filter bar */}
        <div className="filter-bar">
          {!filterCollapsed && (
            <div className="filter-bar-fields">
              <div className="form-field">
                <label>Material Number</label>
                <input value={filters.materialNumber} onChange={e => setFilters(f => ({ ...f, materialNumber: e.target.value }))} placeholder="e.g. MAT-1001" />
              </div>
              <div className="form-field">
                <label>Description</label>
                <input value={filters.description} onChange={e => setFilters(f => ({ ...f, description: e.target.value }))} placeholder="Material description" />
              </div>
              <div className="form-field">
                <label>Material Type</label>
                <select value={filters.materialType} onChange={e => setFilters(f => ({ ...f, materialType: e.target.value }))}>
                  <option value="">All</option>
                  {Object.entries(MATERIAL_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{k} — {v}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
          <div className="filter-bar-actions">
            <button className="btn-ghost" style={{ fontSize: '12px', color: 'var(--xap-text-secondary)' }}>Adapt Filters (4)</button>
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
              <span className="table-count">Materials ({filtered.length})</span>
              <div className="table-toolbar-right">
                <button className="btn-ghost" disabled={selected.length === 0}>Copy</button>
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
                  <th className={thClass('materialNumber')} onClick={() => handleSort('materialNumber')}>Material Number</th>
                  <th className={thClass('description')} onClick={() => handleSort('description')}>Description</th>
                  <th className={thClass('materialType')} onClick={() => handleSort('materialType')}>Material Type</th>
                  <th>Base Unit</th>
                  <th className={thClass('standardPrice')} onClick={() => handleSort('standardPrice')} style={{ textAlign: 'right' }}>Standard Price</th>
                  <th>Currency</th>
                  <th>Weight (KG)</th>
                  <th className={thClass('status')} onClick={() => handleSort('status')}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--xap-text-secondary)' }}>No materials found.</td></tr>
                ) : filtered.map(mat => (
                  <tr key={mat.id} className={selected.includes(mat.id) ? 'selected' : ''}>
                    <td><input type="checkbox" checked={selected.includes(mat.id)} onChange={() => toggleSelect(mat.id)} /></td>
                    <td><StatusIcon status={mat.status || 'Active'} /></td>
                    <td><button className="btn-link" onClick={() => navigate(`/app/product/${mat.id}`)}>{mat.materialNumber}</button></td>
                    <td>{mat.description}</td>
                    <td>{mat.materialType} — {MATERIAL_TYPE_LABELS[mat.materialType] || mat.materialType}</td>
                    <td>{mat.baseUnit}</td>
                    <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(mat.standardPrice)}</td>
                    <td>{mat.currency || 'USD'}</td>
                    <td style={{ textAlign: 'right' }}>{mat.grossWeight || '—'}</td>
                    <td>
                      <span className={`status-badge ${(mat.status || 'Active') === 'Active' ? 'status-delivered' : 'status-draft'}`}>
                        {mat.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
