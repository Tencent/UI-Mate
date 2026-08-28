import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import CreateJobModal from '../components/CreateJobModal/CreateJobModal';

export default function Jobs() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [sortKey, setSortKey] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const [showCreateJob, setShowCreateJob] = useState(false);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  let filtered = state.jobs.filter(j => {
    if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && j.status !== statusFilter) return false;
    if (deptFilter !== 'all' && j.departmentId !== deptFilter) return false;
    if (officeFilter !== 'all' && j.officeId !== officeFilter) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    let aVal, bVal;
    switch (sortKey) {
      case 'title': aVal = a.title; bVal = b.title; break;
      case 'status': aVal = a.status; bVal = b.status; break;
      case 'openings': aVal = a.openings; bVal = b.openings; break;
      case 'candidates': aVal = a.candidateCount; bVal = b.candidateCount; break;
      case 'createdAt': aVal = a.createdAt; bVal = b.createdAt; break;
      default: aVal = a.title; bVal = b.title;
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={12} color="#D1D5DB" />;
    return sortDir === 'asc' ? <ChevronUp size={12} color="var(--text-secondary)" /> : <ChevronDown size={12} color="var(--text-secondary)" />;
  };

  const statusBadge = (status) => {
    const map = { open: 'badge-green', closed: 'badge-gray', draft: 'badge-yellow' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">All Jobs</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateJob(true)}>
          <Plus size={16} /> Create Job
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input-wrap" style={{ flex: '2', minWidth: 200 }}>
          <Search size={14} className="search-icon" />
          <input
            className="form-input"
            placeholder="Search jobs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
        <select className="form-select" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
        <select className="form-select" style={{ width: 160 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="all">All Departments</option>
          {state.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="form-select" style={{ width: 160 }} value={officeFilter} onChange={e => setOfficeFilter(e.target.value)}>
          <option value="all">All Offices</option>
          {state.offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {[
                { key: 'title', label: 'Job Title' },
                { key: 'dept', label: 'Department' },
                { key: 'office', label: 'Office' },
                { key: 'status', label: 'Status' },
                { key: 'openings', label: 'Openings' },
                { key: 'candidates', label: 'Candidates' },
                { key: 'hiringManager', label: 'Hiring Manager' },
                { key: 'recruiter', label: 'Recruiter' },
                { key: 'createdAt', label: 'Created' },
              ].map(col => (
                <th key={col.key} onClick={() => handleSort(col.key)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.label} <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(job => {
              const dept = state.departments.find(d => d.id === job.departmentId);
              const office = state.offices.find(o => o.id === job.officeId);
              const hm = state.users.find(u => u.id === job.hiringManagerId);
              const rec = state.users.find(u => u.id === job.recruiterId);
              return (
                <tr key={job.id} style={{ cursor: 'pointer' }} onClick={() => navigate(buildLink(`/jobs/${job.id}`))}>
                  <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{job.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{dept?.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{office?.name}</td>
                  <td>{statusBadge(job.status)}</td>
                  <td>{job.openings}</td>
                  <td>{job.candidateCount}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{hm?.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{rec?.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {format(new Date(job.createdAt), 'MMM d, yyyy')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <h3>No jobs found</h3>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </div>

      {showCreateJob && <CreateJobModal onClose={() => setShowCreateJob(false)} />}
    </div>
  );
}
