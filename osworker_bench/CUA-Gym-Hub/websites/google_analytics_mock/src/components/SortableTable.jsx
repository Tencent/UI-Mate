import { useState } from 'react';

export default function SortableTable({ columns, data, searchField, pageSize = 10 }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const handleSort = (colKey) => {
    if (sortCol === colKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colKey);
      setSortDir('desc');
    }
  };

  let filtered = data;
  if (search && searchField) {
    const q = search.toLowerCase();
    filtered = data.filter(row => {
      const val = row[searchField];
      return val && String(val).toLowerCase().includes(q);
    });
  }

  let sorted = [...filtered];
  if (sortCol) {
    sorted.sort((a, b) => {
      const va = a[sortCol];
      const vb = b[sortCol];
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const maxVal = {};
  columns.forEach(col => {
    if (col.showBar) {
      maxVal[col.key] = Math.max(...data.map(r => r[col.key] || 0), 1);
    }
  });

  return (
    <div className="card" style={{ padding: 0 }}>
      {searchField && (
        <div className="search-filter" style={{ padding: '12px 16px' }}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
      )}
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={`${col.numeric ? 'numeric' : ''} ${sortCol === col.key ? 'sorted' : ''}`}
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortCol === col.key && (
                  <span className="sort-arrow">{sortDir === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col.key} className={col.numeric ? 'numeric' : ''}>
                  {col.showBar && (
                    <span className="inline-bar" style={{ width: `${(row[col.key] / maxVal[col.key]) * 60}px` }} />
                  )}
                  {col.render ? col.render(row[col.key], row) : (
                    col.format ? col.format(row[col.key]) : row[col.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="pagination">
          <span>Rows per page: {pageSize}</span>
          <span>{page * pageSize + 1}-{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}</span>
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>&lt;</button>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>&gt;</button>
        </div>
      )}
    </div>
  );
}
