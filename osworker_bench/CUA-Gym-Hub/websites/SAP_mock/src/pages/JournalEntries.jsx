import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/ToastProvider'

const STATUS_CLASS = {
  'Posted': 'status-delivered', 'Parked': 'status-partial', 'Reversed': 'status-cancelled'
}

function StatusIcon({ status }) {
  if (status === 'Posted') return <span style={{ color: 'var(--xap-status-success)' }}>✓</span>
  if (status === 'Parked') return <span style={{ color: 'var(--xap-status-warning)' }}>◑</span>
  if (status === 'Reversed') return <span style={{ color: 'var(--xap-status-error)' }}>×</span>
  return <span>—</span>
}

export default function JournalEntries() {
  const { state, setFilterState } = useApp()
  const navigate = useNavigate()
  const { journalEntries, filterState } = state

  const [filters, setFilters] = useState({
    documentNumber: filterState?.je?.documentNumber || '',
    documentType: filterState?.je?.documentType || '',
    dateFrom: filterState?.je?.dateFrom || '',
    dateTo: filterState?.je?.dateTo || '',
    status: filterState?.je?.status || '',
    companyCode: filterState?.je?.companyCode || '',
    postingPeriod: filterState?.je?.postingPeriod || ''
  })
  const [applied, setApplied] = useState(filters)
  const [sortCol, setSortCol] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [selected, setSelected] = useState([])
  const [filterCollapsed, setFilterCollapsed] = useState(false)

  const filtered = useMemo(() => {
    let res = [...journalEntries]
    if (applied.documentNumber) res = res.filter(j => j.documentNumber.toLowerCase().includes(applied.documentNumber.toLowerCase()))
    if (applied.documentType) res = res.filter(j => j.documentType === applied.documentType)
    if (applied.dateFrom) res = res.filter(j => j.postingDate >= applied.dateFrom)
    if (applied.dateTo) res = res.filter(j => j.postingDate <= applied.dateTo)
    if (applied.status) res = res.filter(j => j.status === applied.status)
    if (applied.companyCode) res = res.filter(j => j.companyCode === applied.companyCode)
    if (sortCol) {
      res.sort((a, b) => {
        let va = a[sortCol], vb = b[sortCol]
        if (typeof va === 'string') va = va.toLowerCase()
        if (typeof vb === 'string') vb = vb.toLowerCase()
        return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
      })
    }
    return res
  }, [journalEntries, applied, sortCol, sortDir])

  function applyFilters() { setApplied(filters); setFilterState({ je: filters }) }

  function handleSort(col) {
    if (sortCol === col) { if (sortDir === 'asc') setSortDir('desc'); else { setSortCol(''); setSortDir('asc') } }
    else { setSortCol(col); setSortDir('asc') }
  }
  function thClass(col) {
    if (sortCol !== col) return 'sortable'
    return sortDir === 'asc' ? 'sortable sort-asc' : 'sortable sort-desc'
  }
  function toggleSelect(id) { setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]) }
  function toggleAll() { setSelected(p => p.length === filtered.length ? [] : filtered.map(j => j.id)) }

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', flex: 1, overflowY: 'auto' }}>
        {/* Filter bar */}
        <div className="filter-bar">
          {!filterCollapsed && (
            <div className="filter-bar-fields">
              <div className="form-field">
                <label>Document Number</label>
                <input value={filters.documentNumber} onChange={e => setFilters(f => ({ ...f, documentNumber: e.target.value }))} placeholder="e.g. 1000000001" />
              </div>
              <div className="form-field">
                <label>Document Type</label>
                <select value={filters.documentType} onChange={e => setFilters(f => ({ ...f, documentType: e.target.value }))}>
                  <option value="">All</option>
                  {['SA', 'DR', 'KR', 'AB'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Posting Date From</label>
                <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Posting Date To</label>
                <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                  <option value="">All</option>
                  {['Posted', 'Parked', 'Reversed'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Company Code</label>
                <select value={filters.companyCode} onChange={e => setFilters(f => ({ ...f, companyCode: e.target.value }))}>
                  <option value="">All</option>
                  <option value="1000">1000 — BestRun US</option>
                  <option value="2000">2000 — BestRun DE</option>
                </select>
              </div>
            </div>
          )}
          <div className="filter-bar-actions">
            <button className="btn-ghost" style={{ fontSize: '12px', color: 'var(--xap-text-secondary)' }}>Adapt Filters (6)</button>
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
              <span className="table-count">Journal Entries ({filtered.length})</span>
              <div className="table-toolbar-right">
                <button className="btn-ghost" onClick={() => navigate('/app/create-journal-entry')}>Create</button>
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
                  <th className={thClass('documentNumber')} onClick={() => handleSort('documentNumber')}>Document No.</th>
                  <th>Doc. Type</th>
                  <th className={thClass('postingDate')} onClick={() => handleSort('postingDate')}>Posting Date</th>
                  <th>Period</th>
                  <th>Reference</th>
                  <th className={thClass('totalAmount')} onClick={() => handleSort('totalAmount')} style={{ textAlign: 'right' }}>Total Amount</th>
                  <th>Currency</th>
                  <th className={thClass('status')} onClick={() => handleSort('status')}>Status</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={11} style={{ textAlign: 'center', padding: '32px', color: 'var(--xap-text-secondary)' }}>No journal entries found.</td></tr>
                ) : filtered.map(je => (
                  <tr key={je.id} className={selected.includes(je.id) ? 'selected' : ''}>
                    <td><input type="checkbox" checked={selected.includes(je.id)} onChange={() => toggleSelect(je.id)} /></td>
                    <td><StatusIcon status={je.status} /></td>
                    <td><button className="btn-link" onClick={() => navigate(`/app/journal-entry/${je.id}`)}>{je.documentNumber}</button></td>
                    <td>{je.documentType}</td>
                    <td>{je.postingDate}</td>
                    <td>{je.postingPeriod || '—'}</td>
                    <td>{je.reference || '—'}</td>
                    <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(je.totalAmount || 0)}</td>
                    <td>{je.currency}</td>
                    <td><span className={`status-badge ${STATUS_CLASS[je.status] || ''}`}>{je.status}</span></td>
                    <td>{je.createdBy}</td>
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
