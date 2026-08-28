import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import AddCandidateModal from '../components/AddCandidateModal/AddCandidateModal';

export default function Candidates() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  let filtered = state.candidates.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (sourceFilter !== 'all' && c.source !== sourceFilter) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    let aVal, bVal;
    switch (sortKey) {
      case 'name': aVal = a.name; bVal = b.name; break;
      case 'company': aVal = a.currentCompany; bVal = b.currentCompany; break;
      case 'title': aVal = a.currentTitle; bVal = b.currentTitle; break;
      case 'source': aVal = a.source; bVal = b.source; break;
      case 'activity': aVal = a.updatedAt; bVal = b.updatedAt; break;
      default: aVal = a.name; bVal = b.name;
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={12} color="#D1D5DB" />;
    return sortDir === 'asc' ? <ChevronUp size={12} color="var(--text-secondary)" /> : <ChevronDown size={12} color="var(--text-secondary)" />;
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Candidates</h1>
        <button className="btn btn-primary" onClick={() => setShowAddCandidate(true)}>
          <Plus size={16} /> Add Candidate
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 2, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
          <option value="all">All Sources</option>
          <option value="applied">Applied</option>
          <option value="referral">Referral</option>
          <option value="sourced">Sourced</option>
          <option value="agency">Agency</option>
          <option value="internal">Internal</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'company', label: 'Current Company' },
                { key: 'title', label: 'Current Title' },
                { key: 'source', label: 'Source' },
                { key: 'jobs', label: 'Applied Jobs' },
                { key: 'activity', label: 'Last Activity' },
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
            {filtered.map(cand => {
              const apps = state.applications.filter(a => a.candidateId === cand.id);
              return (
                <tr
                  key={cand.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(buildLink(`/candidates/${cand.id}`))}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600, flexShrink: 0
                      }}>
                        {cand.firstName[0]}{cand.lastName[0]}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{cand.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{cand.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{cand.currentCompany}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{cand.currentTitle}</td>
                  <td style={{ textTransform: 'capitalize', color: 'var(--text-muted)', fontSize: 13 }}>{cand.source}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{apps.length}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {formatDistanceToNow(new Date(cand.updatedAt), { addSuffix: true })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <h3>No candidates found</h3>
            <p>Try adjusting your search</p>
          </div>
        )}
      </div>

      {showAddCandidate && <AddCandidateModal onClose={() => setShowAddCandidate(false)} />}
    </div>
  );
}
