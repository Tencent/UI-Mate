import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Search, ChevronUp, ChevronDown, X } from 'lucide-react';

function NewJobOpeningModal({ state, dispatch, onClose }) {
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [hiringManagerId, setHiringManagerId] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!title.trim()) { setError('Job title is required.'); return; }
    const openings = state.jobOpenings || [];
    const nextId = Math.max(0, ...openings.map(j => j.id)) + 1;
    dispatch({
      type: 'ADD_JOB_OPENING',
      jobOpening: {
        id: nextId,
        title: title.trim(),
        departmentId: departmentId ? Number(departmentId) : null,
        locationId: locationId ? Number(locationId) : null,
        hiringManagerId: hiringManagerId ? Number(hiringManagerId) : null,
        status: 'Open',
        applicantCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      }
    });
    const notifs = state.notifications || [];
    const nextNotifId = Math.max(0, ...notifs.map(n => n.id)) + 1;
    dispatch({ type: 'ADD_NOTIFICATION', notification: {
      id: nextNotifId, type: 'new_job_opening',
      message: `New job opening created: ${title.trim()}`,
      timestamp: new Date().toISOString(), isRead: false, icon: 'briefcase',
      linkTo: `/hiring`, isPastDue: false, dueDate: null
    }});
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 520 }}>
        <div className="modal-header">
          <h2>New Job Opening</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div className="form-group">
          <label className="form-label">Job Title *</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Department</label>
            <select className="form-select" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
              <option value="">Select department</option>
              {(state.departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Location</label>
            <select className="form-select" value={locationId} onChange={e => setLocationId(e.target.value)}>
              <option value="">Select location</option>
              {(state.locations || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Hiring Manager</label>
          <select className="form-select" value={hiringManagerId} onChange={e => setHiringManagerId(e.target.value)}>
            <option value="">Select hiring manager</option>
            {(state.employees || []).filter(e => e.status === 'Active').map(e => (
              <option key={e.id} value={e.id}>{e.displayName}</option>
            ))}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Create Job Opening</button>
        </div>
      </div>
    </div>
  );
}

export default function Hiring() {
  const { state, dispatch } = useApp();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const [showNewJobModal, setShowNewJobModal] = useState(false);

  const sid = searchParams.get('sid');
  const navTo = (path) => sid ? `${path}?sid=${sid}` : path;

  const openings = (state.jobOpenings || []).filter(j => {
    const q = search.toLowerCase();
    const dept = state.departments?.find(d => d.id === j.departmentId);
    const matchesSearch = !search || j.title.toLowerCase().includes(q) || (dept?.name || '').toLowerCase().includes(q);
    const matchesStatus = !statusFilter || j.status === statusFilter;
    const matchesDept = !deptFilter || j.departmentId === Number(deptFilter);
    return matchesSearch && matchesStatus && matchesDept;
  }).sort((a, b) => {
    let av = a[sortBy] || '', bv = b[sortBy] || '';
    if (sortBy === 'applicantCount') { av = Number(av); bv = Number(bv); }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  }

  function SortIcon({ col }) {
    if (sortBy !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  }

  function statusBadge(status) {
    const map = { Open: 'badge-green', Draft: 'badge-gray', 'On Hold': 'badge-yellow', Closed: 'badge-red', Filled: 'badge-blue' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
  }

  return (
    <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 18, padding: '14px 0', flex: 1 }}>Job Openings</span>
        <button className="btn btn-primary" onClick={() => setShowNewJobModal(true)}><Plus size={14} /> New Job Opening</button>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Filters */}
        <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: 4, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200, background: '#f5f5f5', borderRadius: 4, padding: '6px 12px' }}>
            <Search size={15} color="#999" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search job openings..." style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 14 }} />
          </div>
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140 }}>
            <option value="">All Status</option>
            {['Open','Draft','On Hold','Closed'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All Departments</option>
            {(state.departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: 4, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort('title')}>Job Title <SortIcon col="title" /></th>
                <th>Department</th>
                <th>Location</th>
                <th className="sortable" onClick={() => toggleSort('status')}>Status <SortIcon col="status" /></th>
                <th className="sortable" onClick={() => toggleSort('applicantCount')}>Applicants <SortIcon col="applicantCount" /></th>
                <th>Hiring Manager</th>
                <th className="sortable" onClick={() => toggleSort('createdAt')}>Date Posted <SortIcon col="createdAt" /></th>
              </tr>
            </thead>
            <tbody>
              {openings.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#999' }}>No job openings found.</td></tr>
              ) : openings.map(job => {
                const dept = state.departments?.find(d => d.id === job.departmentId);
                const loc = state.locations?.find(l => l.id === job.locationId);
                const manager = state.employees?.find(e => e.id === job.hiringManagerId);
                return (
                  <tr key={job.id}>
                    <td>
                      <Link to={navTo(`/hiring/${job.id}`)} style={{ color: '#73C41D', fontWeight: 500, fontSize: 14 }}>{job.title}</Link>
                    </td>
                    <td style={{ fontSize: 13 }}>{dept?.name || '—'}</td>
                    <td style={{ fontSize: 13 }}>{loc?.name || '—'}</td>
                    <td>{statusBadge(job.status)}</td>
                    <td style={{ fontSize: 13, color: '#73C41D', fontWeight: 500 }}>{job.applicantCount || 0}</td>
                    <td style={{ fontSize: 13 }}>{manager ? `${manager.firstName} ${manager.lastName}` : '—'}</td>
                    <td style={{ fontSize: 13 }}>{job.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showNewJobModal && <NewJobOpeningModal state={state} dispatch={dispatch} onClose={() => setShowNewJobModal(false)} />}
    </div>
  );
}
