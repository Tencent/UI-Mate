import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Grid, GitBranch, X } from 'lucide-react';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}
function getAvatarColor(id) {
  const colors = ['#73C41D','#2196F3','#FF5722','#9C27B0','#FF9800','#00BCD4','#795548','#607D8B'];
  return colors[(id || 0) % colors.length];
}

export default function PeopleDirectory() {
  const { state } = useApp();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const sid = searchParams.get('sid');
  const navTo = (path) => sid ? `${path}?sid=${sid}` : path;

  const employees = (state.employees || []).filter(e => {
    const q = search.toLowerCase();
    const dept = state.departments?.find(d => d.id === e.departmentId);
    const loc = state.locations?.find(l => l.id === e.locationId);
    const matchesSearch = !search || (
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      (e.jobTitle || '').toLowerCase().includes(q) ||
      (dept?.name || '').toLowerCase().includes(q)
    );
    const matchesDept = !deptFilter || e.departmentId === Number(deptFilter);
    const matchesLoc = !locationFilter || e.locationId === Number(locationFilter);
    const matchesStatus = !statusFilter || e.status === statusFilter;
    return matchesSearch && matchesDept && matchesLoc && matchesStatus;
  });

  const activeFilters = [
    deptFilter && { label: state.departments?.find(d => d.id === Number(deptFilter))?.name, clear: () => setDeptFilter('') },
    locationFilter && { label: state.locations?.find(l => l.id === Number(locationFilter))?.name, clear: () => setLocationFilter('') },
  ].filter(Boolean);

  return (
    <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
      {/* Header bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 18, padding: '14px 0', flex: 1 }}>People</span>
        <Link to={navTo('/people')} style={{ padding: '16px 14px', fontSize: 14, fontWeight: 500, color: !window.location.pathname.includes('org-chart') ? '#73C41D' : '#555', textDecoration: 'none', borderBottom: !window.location.pathname.includes('org-chart') ? '3px solid #73C41D' : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Grid size={14} /> Directory
        </Link>
        <Link to={navTo('/people/org-chart')} style={{ padding: '16px 14px', fontSize: 14, fontWeight: 500, color: '#555', textDecoration: 'none', borderBottom: '3px solid transparent', display: 'flex', alignItems: 'center', gap: 6 }}>
          <GitBranch size={14} /> Org Chart
        </Link>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Search & filters */}
        <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: 4, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200, background: '#f5f5f5', borderRadius: 4, padding: '6px 12px' }}>
            <Search size={15} color="#999" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employees..."
              style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 14 }}
            />
            {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}><X size={14} /></button>}
          </div>
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 120 }}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select className="form-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All Departments</option>
            {(state.departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="form-select" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All Locations</option>
            {(state.locations || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {activeFilters.map((f, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#edf8e0', color: '#5CA315', padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 500 }}>
                {f.label}
                <button onClick={f.clear} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5CA315', padding: 0, display: 'flex', alignItems: 'center' }}><X size={12} /></button>
              </span>
            ))}
          </div>
        )}

        <div style={{ color: '#999', fontSize: 13, marginBottom: 16 }}>
          Showing {employees.length} of {state.employees?.length || 0} employees
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {employees.map(emp => {
            const dept = state.departments?.find(d => d.id === emp.departmentId);
            const name = (emp.preferredName || emp.firstName) + ' ' + emp.lastName;
            const initials = getInitials(name);
            const bg = getAvatarColor(emp.id);
            return (
              <Link
                key={emp.id}
                to={navTo(`/people/${emp.id}`)}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: 'white', border: '1px solid #E0E0E0', borderRadius: 4,
                    padding: '20px 16px', textAlign: 'center',
                    transition: 'box-shadow 0.15s, transform 0.15s',
                    cursor: 'pointer', opacity: emp.status === 'Inactive' ? 0.6 : 1
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 600, margin: '0 auto 12px' }}>
                    {initials}
                  </div>
                  <div style={{ fontWeight: 600, color: '#333', fontSize: 14, marginBottom: 3 }}>
                    {emp.preferredName || emp.firstName} {emp.lastName}
                  </div>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 3, lineHeight: 1.4 }}>{emp.jobTitle}</div>
                  <div style={{ color: '#999', fontSize: 11 }}>{dept?.name || ''}</div>
                  {emp.status === 'Inactive' && (
                    <div style={{ marginTop: 6 }}>
                      <span className="badge badge-gray" style={{ fontSize: 10 }}>Terminated</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {employees.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
            <Search size={32} color="#ccc" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>No employees found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
