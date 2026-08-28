import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/dataManager';

const CLASS_MAP = {
  'server': 'cmdb_ci_server',
  'database': 'cmdb_ci_database',
  'app_server': 'cmdb_ci_app_server',
  'network': 'cmdb_ci_netgear',
  'netgear': 'cmdb_ci_netgear',
};

const CLASS_LABELS = {
  'cmdb_ci_server': 'Server', 'cmdb_ci_database': 'Database', 'cmdb_ci_app_server': 'Application Server',
  'cmdb_ci_netgear': 'Network',
};

export default function CMDBList() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';

  const classFilter = searchParams.get('class') || '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '', sys_class_name: 'cmdb_ci_server', status: 'Installed', environment: 'Production',
    category: 'Hardware', assigned_to: '', department: '', location: '', ip_address: '', serial_number: '', manufacturer: '', model: '',
  });

  const filtered = useMemo(() => {
    let items = state.cmdbItems;
    if (classFilter && CLASS_MAP[classFilter]) {
      items = items.filter(c => c.sys_class_name === CLASS_MAP[classFilter]);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(c => c.name.toLowerCase().includes(q) || c.sys_class_name.toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q) || (c.location || '').toLowerCase().includes(q));
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    items = [...items].sort((a, b) => {
      const av = a[sortCol] || '', bv = b[sortCol] || '';
      return av < bv ? -dir : av > bv ? dir : 0;
    });
    return items;
  }, [state.cmdbItems, classFilter, search, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const SortIndicator = ({ col }) => <>{sortCol === col ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : ''}</>;

  const handleCreate = () => {
    if (!createForm.name.trim()) { alert('Name is required.'); return; }
    const newItem = { ...createForm, sys_id: generateId() };
    dispatch({ type: 'ADD_CMDB_ITEM', payload: newItem });
    setShowCreateForm(false);
    setCreateForm({ name: '', sys_class_name: 'cmdb_ci_server', status: 'Installed', environment: 'Production', category: 'Hardware', assigned_to: '', department: '', location: '', ip_address: '', serial_number: '', manufacturer: '', model: '' });
  };

  return (
    <div className="sn-page">
      <div className="sn-page-header">
        <h1 className="sn-page-title">
          Configuration Items
          {classFilter && CLASS_MAP[classFilter] && ` \u2014 ${CLASS_LABELS[CLASS_MAP[classFilter]] || classFilter}`}
        </h1>
        <div className="sn-page-header-actions">
          <button className="sn-btn sn-btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'New'}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="sn-form-body" style={{ borderBottom: '1px solid #ddd', marginBottom: 16 }}>
          <div className="sn-form-section-title" style={{ marginBottom: 10 }}>Create New Configuration Item</div>
          <div className="sn-form-grid">
            <div>
              <div className="sn-form-row">
                <label className="sn-form-label">Name <span className="mandatory">*</span></label>
                <div className="sn-form-field"><input className="sn-form-input" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} /></div>
              </div>
              <div className="sn-form-row">
                <label className="sn-form-label">Class</label>
                <div className="sn-form-field">
                  <select className="sn-form-select" value={createForm.sys_class_name} onChange={e => setCreateForm(f => ({ ...f, sys_class_name: e.target.value }))}>
                    {Object.entries(CLASS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="sn-form-row">
                <label className="sn-form-label">Status</label>
                <div className="sn-form-field">
                  <select className="sn-form-select" value={createForm.status} onChange={e => setCreateForm(f => ({ ...f, status: e.target.value }))}>
                    {['Installed', 'In Maintenance', 'Retired', 'Absent'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="sn-form-row">
                <label className="sn-form-label">Environment</label>
                <div className="sn-form-field">
                  <select className="sn-form-select" value={createForm.environment} onChange={e => setCreateForm(f => ({ ...f, environment: e.target.value }))}>
                    {['Production', 'Development', 'Test', 'Staging'].map(ev => <option key={ev} value={ev}>{ev}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <div className="sn-form-row">
                <label className="sn-form-label">IP Address</label>
                <div className="sn-form-field"><input className="sn-form-input" value={createForm.ip_address} onChange={e => setCreateForm(f => ({ ...f, ip_address: e.target.value }))} /></div>
              </div>
              <div className="sn-form-row">
                <label className="sn-form-label">Location</label>
                <div className="sn-form-field"><input className="sn-form-input" value={createForm.location} onChange={e => setCreateForm(f => ({ ...f, location: e.target.value }))} /></div>
              </div>
              <div className="sn-form-row">
                <label className="sn-form-label">Manufacturer</label>
                <div className="sn-form-field"><input className="sn-form-input" value={createForm.manufacturer} onChange={e => setCreateForm(f => ({ ...f, manufacturer: e.target.value }))} /></div>
              </div>
              <div className="sn-form-row">
                <label className="sn-form-label">Model</label>
                <div className="sn-form-field"><input className="sn-form-input" value={createForm.model} onChange={e => setCreateForm(f => ({ ...f, model: e.target.value }))} /></div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
            <button className="sn-btn sn-btn-primary" onClick={handleCreate}>Create</button>
            <button className="sn-btn" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="sn-list-controls">
        <div className="sn-search-bar">
          <input type="text" placeholder="Search configuration items..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="sn-list-info">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          {classFilter && CLASS_MAP[classFilter] && ` (filtered by class: ${CLASS_LABELS[CLASS_MAP[classFilter]] || classFilter})`}
          {search && ` matching "${search}"`}
        </div>
      </div>

      <div className="sn-table-container">
        <table className="sn-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Name<SortIndicator col="name" /></th>
              <th onClick={() => handleSort('sys_class_name')} style={{ cursor: 'pointer' }}>Class<SortIndicator col="sys_class_name" /></th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status<SortIndicator col="status" /></th>
              <th onClick={() => handleSort('environment')} style={{ cursor: 'pointer' }}>Environment<SortIndicator col="environment" /></th>
              <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>Category<SortIndicator col="category" /></th>
              <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>Location<SortIndicator col="location" /></th>
              <th onClick={() => handleSort('manufacturer')} style={{ cursor: 'pointer' }}>Manufacturer<SortIndicator col="manufacturer" /></th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20, color: '#999' }}>No configuration items found.</td></tr>
            ) : (
              paged.map(ci => (
                <tr key={ci.sys_id} onClick={() => navigate(`/cmdb/${ci.sys_id}${sp}`)} style={{ cursor: 'pointer' }}>
                  <td><a className="sn-table-link">{ci.name}</a></td>
                  <td>{CLASS_LABELS[ci.sys_class_name] || ci.sys_class_name}</td>
                  <td>
                    <span className={`sn-status-badge ${ci.status === 'Installed' ? 'state-open' : 'state-hold'}`}>
                      {ci.status}
                    </span>
                  </td>
                  <td>{ci.environment}</td>
                  <td>{ci.category}</td>
                  <td>{ci.location}</td>
                  <td>{ci.manufacturer}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="sn-pagination">
          <button className="sn-page-btn" disabled={page <= 1} onClick={() => setPage(1)}>|&lt;</button>
          <button className="sn-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
          <span className="sn-page-info">{page} / {totalPages} ({filtered.length} records)</span>
          <button className="sn-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
          <button className="sn-page-btn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>&gt;|</button>
          <select className="sn-page-size-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
