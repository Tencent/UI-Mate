import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export default function SortableTable({ columns, rows, onRowClick, stickyHeader, emptyMessage }) {
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('desc')

  const sorted = useMemo(() => {
    if (!sortCol) return rows
    return [...rows].sort((a, b) => {
      // Don't sort total rows
      if (a._bold || b._bold) return 0
      let va = a[sortCol]
      let vb = b[sortCol]
      // Try to access nested metrics
      if (va === undefined && a.metrics) va = a.metrics[sortCol]
      if (vb === undefined && b.metrics) vb = b.metrics[sortCol]
      if (va == null) return 1
      if (vb == null) return -1
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, sortCol, sortDir])

  const handleSort = (key) => {
    if (sortCol === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(key)
      setSortDir('desc')
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #DADCE0', background: '#fff' }}>
            {columns.map(col => (
              <th key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                style={{
                  padding: '10px 12px', textAlign: col.align || 'left', fontWeight: 500,
                  color: '#5F6368', fontSize: 12, whiteSpace: 'nowrap',
                  cursor: col.sortable !== false ? 'pointer' : 'default',
                  userSelect: 'none', position: stickyHeader ? 'sticky' : 'static', top: 0, background: '#fff'
                }}
              >
                {col.headerRender ? col.headerRender() : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    {col.label}
                    {sortCol === col.key && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 24, textAlign: 'center', color: '#5F6368' }}>{emptyMessage || 'No data'}</td></tr>
          ) : sorted.map((row, i) => (
            <tr key={row.id || i}
              onClick={() => onRowClick && !row._bold && onRowClick(row)}
              style={{
                borderBottom: '1px solid #F1F3F4', cursor: onRowClick && !row._bold ? 'pointer' : 'default',
                background: row._bold ? '#F8F9FA' : '#fff'
              }}
              onMouseEnter={e => { if (!row._bold) e.currentTarget.style.background = '#F8F9FA' }}
              onMouseLeave={e => { e.currentTarget.style.background = row._bold ? '#F8F9FA' : '#fff' }}
            >
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: '10px 12px', textAlign: col.align || 'left',
                  fontVariantNumeric: 'tabular-nums', fontWeight: row._bold ? 600 : 400,
                  color: col.color ? col.color(row[col.key], row) : '#202124',
                  whiteSpace: col.nowrap ? 'nowrap' : 'normal'
                }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
