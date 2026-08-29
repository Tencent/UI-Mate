import React, { useState } from 'react'

export default function SortableTable({ columns, data, onRowClick, rowStyle }) {
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  function handleSort(colKey) {
    if (sortCol === colKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(colKey)
      setSortDir('asc')
    }
  }

  const sorted = [...data]
  if (sortCol) {
    sorted.sort((a, b) => {
      let av = a[sortCol]
      let bv = b[sortCol]
      if (av == null) av = ''
      if (bv == null) bv = ''
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      const as = String(av).toLowerCase()
      const bs = String(bv).toLowerCase()
      if (as < bs) return sortDir === 'asc' ? -1 : 1
      if (as > bs) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={col.key}
              className={col.align === 'right' ? 'amount' : ''}
              style={{ cursor: col.sortable !== false ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}
              onClick={() => col.sortable !== false && handleSort(col.key)}
            >
              {col.label}
              {col.sortable !== false && (
                <span style={{ marginLeft: 4, fontSize: 10, opacity: sortCol === col.key ? 1 : 0.3 }}>
                  {sortCol === col.key ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : '\u25B4'}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--color-gray-medium)', padding: 24 }}>
              No data found
            </td>
          </tr>
        ) : sorted.map((row, idx) => (
          <tr
            key={row.id || idx}
            onClick={() => onRowClick && onRowClick(row)}
            style={{
              cursor: onRowClick ? 'pointer' : 'default',
              background: idx % 2 === 0 ? 'white' : '#FAFAFA',
              ...(rowStyle ? rowStyle(row, idx) : {}),
            }}
          >
            {columns.map(col => (
              <td key={col.key} className={col.align === 'right' ? 'amount' : ''}>
                {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '\u2014')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
