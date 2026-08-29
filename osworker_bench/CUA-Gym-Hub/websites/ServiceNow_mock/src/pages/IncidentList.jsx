import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getPriorityLabel, getPriorityColor, getIncidentStateLabel, getUserDisplayName, getGroupDisplayName } from '../utils/dataManager';
import { formatDistanceToNow } from 'date-fns';

export default function IncidentList() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';
  const filter = searchParams.get('filter');

  const [sortCol, setSortCol] = useState('number');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [bulkGroup, setBulkGroup] = useState('');

  const filtered = useMemo(() => {
    let list = [...state.incidents];
    if (filter === 'assigned_to_me') {
      list = list.filter(i => i.assigned_to === state.currentUser.sys_id);
    } else if (filter === 'open') {
      list = list.filter(i => [1, 2, 3].includes(i.state));
    } else if (filter === 'open_unassigned') {
      list = list.filter(i => [1, 2, 3].includes(i.state) && !i.assigned_to);
    } else if (filter === 'resolved') {
      list = list.filter(i => i.state === 6);
    } else if (filter === 'closed') {
      list = list.filter(i => i.state === 7);
    }
    return list;
  }, [state.incidents, filter, state.currentUser.sys_id]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (sortCol === 'assigned_to') { av = getUserDisplayName(state.users, av); bv = getUserDisplayName(state.users, bv); }
      if (sortCol === 'assignment_group') { av = getGroupDisplayName(state.groups, av); bv = getGroupDisplayName(state.groups, bv); }
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      av = String(av || ''); bv = String(bv || '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [filtered, sortCol, sortDir, state.users, state.groups]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const filterLabel = { assigned_to_me: 'Assigned to me', open: 'Open', open_unassigned: 'Open - Unassigned', resolved: 'Resolved', closed: 'Closed' }[filter] || 'All';

  const SortArrow = ({ col }) => (
    <span className={`sort-arrow ${sortCol === col ? 'active' : ''}`}>
      {sortCol === col ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : '\u25B2'}
    </span>
  );

  const toggleSelectAll = () => {
    if (selectedRows.size === paged.length && paged.length > 0) setSelectedRows(new Set());
    else setSelectedRows(new Set(paged.map(i => i.sys_id)));
  };

  const toggleRow = (id) => {
    const s = new Set(selectedRows);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedRows(s);
  };

  const handleBulkClose = () => {
    if (selectedRows.size === 0) return;
    if (!window.confirm(`Close ${selectedRows.size} selected incident(s)?`)) return;
    [...selectedRows].forEach(incId => {
      const inc = state.incidents.find(i => i.sys_id === incId);
      if (inc && inc.state !== 7) {
        dispatch({ type: 'UPDATE_INCIDENT', payload: { ...inc, state: 7, closed_at: new Date().toISOString(), closed_by: state.currentUser.sys_id, updated_at: new Date().toISOString() } });
      }
    });
    setSelectedRows(new Set());
  };

  const handleBulkAssign = () => {
    if (selectedRows.size === 0 || !bulkGroup) { alert('Select incidents and an assignment group.'); return; }
    [...selectedRows].forEach(incId => {
      const inc = state.incidents.find(i => i.sys_id === incId);
      if (inc) {
        dispatch({ type: 'UPDATE_INCIDENT', payload: { ...inc, assignment_group: bulkGroup, updated_at: new Date().toISOString() } });
      }
    });
    setSelectedRows(new Set());
    setBulkGroup('');
  };

  return (
    <div className="sn-page">
      <div className="sn-page-header">
        <div className="sn-page-header-left">
          <h1 className="sn-page-title">Incidents</h1>
          <span className="sn-page-subtitle">{filterLabel} &middot; {sorted.length} records</span>
        </div>
        <div className="sn-page-header-right">
          <button className="sn-btn sn-btn-success" onClick={() => navigate('/incident/create' + sp)}>New</button>
        </div>
      </div>

      {selectedRows.size > 0 && (
        <div className="sn-bulk-actions">
          <span>{selectedRows.size} selected</span>
          <button className="sn-btn sn-btn-sm" onClick={handleBulkClose}>Close Selected</button>
          <select className="sn-form-select" style={{ width: 160, display: 'inline-block' }} value={bulkGroup} onChange={e => setBulkGroup(e.target.value)}>
            <option value="">Assign to Group...</option>
            {state.groups.map(g => <option key={g.sys_id} value={g.sys_id}>{g.name}</option>)}
          </select>
          <button className="sn-btn sn-btn-sm" onClick={handleBulkAssign}>Assign</button>
          <button className="sn-btn sn-btn-sm" onClick={() => setSelectedRows(new Set())}>Clear</button>
        </div>
      )}

      <div className="sn-table-container">
        <table className="sn-table">
          <thead>
            <tr>
              <th className="sn-table-checkbox">
                <input type="checkbox" checked={selectedRows.size === paged.length && paged.length > 0} onChange={toggleSelectAll} />
              </th>
              <th onClick={() => handleSort('number')}>Number <SortArrow col="number" /></th>
              <th onClick={() => handleSort('priority')}>Priority <SortArrow col="priority" /></th>
              <th onClick={() => handleSort('state')}>State <SortArrow col="state" /></th>
              <th onClick={() => handleSort('short_description')}>Short description <SortArrow col="short_description" /></th>
              <th onClick={() => handleSort('category')}>Category <SortArrow col="category" /></th>
              <th onClick={() => handleSort('assignment_group')}>Assignment group <SortArrow col="assignment_group" /></th>
              <th onClick={() => handleSort('assigned_to')}>Assigned to <SortArrow col="assigned_to" /></th>
              <th onClick={() => handleSort('updated_at')}>Updated <SortArrow col="updated_at" /></th>
            </tr>
          </thead>
          <tbody>
            {paged.map(inc => (
              <tr key={inc.sys_id} className={selectedRows.has(inc.sys_id) ? 'selected' : ''}>
                <td className="sn-table-checkbox" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedRows.has(inc.sys_id)} onChange={() => toggleRow(inc.sys_id)} />
                </td>
                <td>
                  <a className="sn-table-link" onClick={() => navigate(`/incident/${inc.sys_id}${sp}`)}>{inc.number}</a>
                </td>
                <td>
                  <span className="sn-priority-badge" style={{ background: getPriorityColor(inc.priority) }}>
                    {getPriorityLabel(inc.priority)}
                  </span>
                </td>
                <td><span className="sn-state-label">{getIncidentStateLabel(inc.state)}</span></td>
                <td className="text-truncate" style={{ maxWidth: 300 }}>{inc.short_description}</td>
                <td>{inc.category}</td>
                <td>{getGroupDisplayName(state.groups, inc.assignment_group)}</td>
                <td>{getUserDisplayName(state.users, inc.assigned_to)}</td>
                <td>{inc.updated_at ? formatDistanceToNow(new Date(inc.updated_at), { addSuffix: true }) : ''}</td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 20, color: '#999' }}>No incidents found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="sn-pagination">
        <button className="sn-page-btn" disabled={page <= 1} onClick={() => setPage(1)}>|&lt;</button>
        <button className="sn-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
        <span className="sn-page-info">
          {sorted.length === 0 ? '0 records' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, sorted.length)} of ${sorted.length}`}
        </span>
        <button className="sn-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
        <button className="sn-page-btn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>&gt;|</button>
        <select className="sn-page-size-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
        </select>
      </div>
    </div>
  );
}
