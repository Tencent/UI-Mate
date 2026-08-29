import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getPriorityLabel, getPriorityColor, getChangeStateLabel, getUserDisplayName, getGroupDisplayName } from '../utils/dataManager';
import { formatDistanceToNow } from 'date-fns';

export default function ChangeList() {
  const { state, dispatch } = useApp();
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
    let list = [...state.changeRequests];
    if (filter === 'open') list = list.filter(c => c.state !== 3 && c.state !== 4);
    else if (filter === 'closed') list = list.filter(c => c.state === 3);
    return list;
  }, [state.changeRequests, filter]);

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

  const handleSort = (col) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } setPage(1); };
  const SortArrow = ({ col }) => <span className={`sort-arrow ${sortCol === col ? 'active' : ''}`}>{sortCol === col ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : '\u25B2'}</span>;

  const handleApprove = (e, change) => {
    e.stopPropagation();
    dispatch({ type: 'UPDATE_CHANGE', payload: { ...change, approval: 'Approved', updated_at: new Date().toISOString() } });
  };

  const handleReject = (e, change) => {
    e.stopPropagation();
    const reason = window.prompt('Enter rejection reason:');
    if (reason !== null) {
      dispatch({ type: 'UPDATE_CHANGE', payload: { ...change, approval: 'Rejected', state: 4, close_notes: reason, updated_at: new Date().toISOString() } });
    }
  };

  return (
    <div className="sn-page">
      <div className="sn-page-header">
        <div className="sn-page-header-left">
          <h1 className="sn-page-title">Change Requests</h1>
          <span className="sn-page-subtitle">{filter === 'open' ? 'Open' : filter === 'closed' ? 'Closed' : 'All'} &middot; {sorted.length} records</span>
        </div>
        <div className="sn-page-header-right">
          <button className="sn-btn sn-btn-success" onClick={() => navigate('/change/create' + sp)}>New</button>
        </div>
      </div>
      <div className="sn-table-container">
        <table className="sn-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('number')}>Number <SortArrow col="number" /></th>
              <th onClick={() => handleSort('type')}>Type <SortArrow col="type" /></th>
              <th onClick={() => handleSort('priority')}>Priority <SortArrow col="priority" /></th>
              <th onClick={() => handleSort('state')}>State <SortArrow col="state" /></th>
              <th onClick={() => handleSort('approval')}>Approval <SortArrow col="approval" /></th>
              <th onClick={() => handleSort('short_description')}>Short description <SortArrow col="short_description" /></th>
              <th onClick={() => handleSort('assignment_group')}>Assignment group <SortArrow col="assignment_group" /></th>
              <th onClick={() => handleSort('risk')}>Risk <SortArrow col="risk" /></th>
              <th onClick={() => handleSort('updated_at')}>Updated <SortArrow col="updated_at" /></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(c => (
              <tr key={c.sys_id}>
                <td><a className="sn-table-link" onClick={() => navigate(`/change/${c.sys_id}${sp}`)}>{c.number}</a></td>
                <td><span className={`sn-change-type-badge ${c.type}`}>{c.type}</span></td>
                <td><span className="sn-priority-badge" style={{ background: getPriorityColor(c.priority) }}>{getPriorityLabel(c.priority)}</span></td>
                <td><span className="sn-state-label">{getChangeStateLabel(c.state)}</span></td>
                <td>
                  <span style={{ fontSize: 12, fontWeight: 600, color: c.approval === 'Approved' ? '#2e7d32' : c.approval === 'Rejected' ? '#c62828' : c.approval === 'Requested' ? '#e65100' : '#666' }}>
                    {c.approval}
                  </span>
                </td>
                <td className="text-truncate" style={{ maxWidth: 220 }}>{c.short_description}</td>
                <td>{getGroupDisplayName(state.groups, c.assignment_group)}</td>
                <td>{c.risk}</td>
                <td>{c.updated_at ? formatDistanceToNow(new Date(c.updated_at), { addSuffix: true }) : ''}</td>
                <td>
                  {c.approval === 'Requested' && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="sn-btn sn-btn-sm sn-btn-success" onClick={(e) => handleApprove(e, c)}>Approve</button>
                      <button className="sn-btn sn-btn-sm sn-btn-danger" onClick={(e) => handleReject(e, c)}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 20, color: '#999' }}>No change requests found.</td></tr>
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
