import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  if (days < 60) return '1 month ago';
  return `${Math.floor(days / 30)} months ago`;
}

export default function ProfileList() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 25;

  const filtered = useMemo(() => {
    if (!search) return state.profiles;
    return state.profiles.filter(p =>
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [state.profiles, search]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profiles</h1>
      </div>

      <div className="filter-bar">
        <input type="text" placeholder="Search by email or name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ minWidth: 300 }} />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Location</th>
              <th>Last Active</th>
              <th>Lists</th>
              <th>Consent</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(prof => (
              <tr key={prof.id}>
                <td><span className="clickable" onClick={() => navigate(appendQuery(`/audience/profiles/${prof.id}`))}>{prof.email}</span></td>
                <td>{prof.firstName}</td>
                <td>{prof.lastName}</td>
                <td className="text-muted">{prof.location.city}, {prof.location.region}</td>
                <td className="text-muted">{timeAgo(prof.lastActive)}</td>
                <td>{prof.listIds.length}</td>
                <td>
                  {prof.consent.email === 'subscribed' && <span title="Email subscribed" style={{ color: 'var(--accent-green)', marginRight: 4 }}>&#9993;</span>}
                  {prof.consent.sms === 'subscribed' && <span title="SMS subscribed" style={{ color: 'var(--accent-green)' }}>&#128241;</span>}
                  {prof.consent.email === 'unsubscribed' && <span title="Email unsubscribed" style={{ color: 'var(--accent-red)', marginRight: 4 }}>&#9993;</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>{(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length.toLocaleString()}</span>
        <div className="pagination-buttons">
          <button className={`pagination-btn ${page <= 1 ? 'disabled' : ''}`} onClick={() => page > 1 && setPage(page - 1)}>Previous</button>
          <button className={`pagination-btn ${page >= totalPages ? 'disabled' : ''}`} onClick={() => page < totalPages && setPage(page + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
