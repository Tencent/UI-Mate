import { useState } from 'react'

export default function ValueHelpDialog({ title, columns, rows, onSelect, onCancel, multiSelect = false }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])

  const filtered = rows.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  )

  function toggleRow(row) {
    if (multiSelect) {
      setSelected(prev => prev.includes(row) ? prev.filter(r => r !== row) : [...prev, row])
    } else {
      setSelected([row])
    }
  }

  function handleConfirm() {
    if (multiSelect) onSelect(selected)
    else if (selected.length > 0) onSelect(selected[0])
    else onCancel()
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal-box" style={{ width: '700px', maxWidth: '95vw' }}>
        <div className="modal-header">
          <h3>Select: {title}</h3>
          <button className="modal-close-btn" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body" style={{ padding: '12px 20px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              style={{
                flex: 1, border: '1px solid var(--xap-border)', borderRadius: '4px',
                padding: '6px 10px', fontSize: '13px', outline: 'none'
              }}
              onKeyDown={e => { if (e.key === 'Enter' && selected.length > 0) handleConfirm() }}
            />
            <button className="btn-primary">Go</button>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--xap-border)', borderRadius: '4px' }}>
            <table className="xap-table">
              <thead>
                <tr>
                  <th style={{ width: '32px' }}></th>
                  {columns.map(c => <th key={c.key}>{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', color: 'var(--xap-text-secondary)', padding: '20px' }}>No results found</td></tr>
                ) : filtered.map((row, i) => {
                  const isSelected = selected.includes(row)
                  return (
                    <tr
                      key={i}
                      className={isSelected ? 'selected' : ''}
                      onClick={() => toggleRow(row)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <input
                          type={multiSelect ? 'checkbox' : 'radio'}
                          checked={isSelected}
                          onChange={() => toggleRow(row)}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      {columns.map(c => <td key={c.key}>{row[c.key]}</td>)}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--xap-text-secondary)' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            {selected.length > 0 && ` · ${selected.length} selected`}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleConfirm} disabled={selected.length === 0}>
            Select
          </button>
        </div>
      </div>
    </div>
  )
}
