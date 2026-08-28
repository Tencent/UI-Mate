import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getPriorityLabel, getPriorityColor, getProblemStateLabel, getUserDisplayName, getGroupDisplayName } from '../utils/dataManager';
import { formatDistanceToNow } from 'date-fns';

export default function ProblemList() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';
  const filter = searchParams.get('filter');
  const [sortCol, setSortCol] = useState('number');
  const [sortDir, setSortDir] = useState('asc');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => {
    let list = [...state.problems];
    if (filter === 'open') list = list.filter(p => p.state < 6);
    return list;
  }, [state.problems, filter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av || '').localeCompare(String(bv || '')) : String(bv || '').localeCompare(String(av || ''));
    });
    return list;
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const SortArrow = ({ col }) => <span className={`sort-arrow ${sortCol === col ? 'active' : ''}`}>{sortCol === col ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : '\u25B2'}</span>;

  return (
    <div className="sn-page">
      <div className="sn-page-header">
        <div className="sn-page-header-left">
          <h1 className="sn-page-title">Problems</h1>
          <span className="sn-page-subtitle">{filter === 'open' ? 'Open' : 'All'} &middot; {sorted.length} records</span>
        </div>
        <div className="sn-page-header-right">
          <button className="sn-btn sn-btn-success" onClick={() => navigate('/problem/create' + sp)}>New</button>
        </div>
      </div>
      <div className="sn-table-container">
        <table className="sn-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('number')}>Number <SortArrow col="number" /></th>
              <th onClick={() => handleSort('priority')}>Priority <SortArrow col="priority" /></th>
              <th onClick={() => handleSort('state')}>State <SortArrow col="state" /></th>
              <th onClick={() => handleSort('short_description')}>Short description <SortArrow col="short_description" /></th>
              <th onClick={() => handleSort('assignment_group')}>Assignment group <SortArrow col="assignment_group" /></th>
              <th onClick={() => handleSort('assigned_to')}>Assigned to <SortArrow col="assigned_to" /></th>
              <th onClick={() => handleSort('updated_at')}>Updated <SortArrow col="updated_at" /></th>
            </tr>
          </thead>
          <tbody>
            {paged.map(p => (
              <tr key={p.sys_id}>
                <td><a className="sn-table-link" onClick={() => navigate(`/problem/${p.sys_id}${sp}`)}>{p.number}</a></td>
                <td><span className="sn-priority-badge" style={{ background: getPriorityColor(p.priority) }}>{getPriorityLabel(p.priority)}</span></td>
                <td><span className="sn-state-label">{getProblemStateLabel(p.state)}</span></td>
                <td className="text-truncate" style={{ maxWidth: 300 }}>{p.short_description}</td>
                <td>{getGroupDisplayName(state.groups, p.assignment_group)}</td>
                <td>{getUserDisplayName(state.users, p.assigned_to)}</td>
                <td>{p.updated_at ? formatDistanceToNow(new Date(p.updated_at), { addSuffix: true }) : ''}</td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20, color: '#999' }}>No problems found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="sn-pagination">
        <button className="sn-page-btn" disabled={page <= 1} onClick={() => setPage(1)}>|&lt;</button>
        <button className="sn-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
        <span className="sn-page-info">{sorted.length === 0 ? '0 records' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, sorted.length)} of ${sorted.length}`}</span>
        <button className="sn-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
        <button className="sn-page-btn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>&gt;|</button>
        <select className="sn-page-size-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
        </select>
      </div>
    </div>
  );
}
