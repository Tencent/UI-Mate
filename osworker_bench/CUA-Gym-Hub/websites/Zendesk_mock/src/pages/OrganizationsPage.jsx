import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function OrganizationsPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState('');

  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  const filtered = state.organizations.filter(o =>
    o.name.toLowerCase().includes(filter.toLowerCase())
  );

  const getUserCount = (orgId) => state.users.filter(u => u.organization_id === orgId).length;
  const getTicketCount = (orgId) => {
    const orgUserIds = state.users.filter(u => u.organization_id === orgId).map(u => u.id);
    return state.tickets.filter(t => orgUserIds.includes(t.requester_id)).length;
  };

  return (
    <div className="list-page">
      <h1 className="list-page-title">Organizations</h1>
      <div className="list-search">
        <input
          placeholder="Search organizations..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          type="organizations"
          title={filter ? `No organizations matching "${filter}"` : 'No organizations found'}
          subtitle={filter ? 'Try adjusting your search term.' : 'Organizations will appear here once added.'}
        />
      ) : (
        <table className="list-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Domain</th>
              <th>Users</th>
              <th>Tickets</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(org => (
              <tr key={org.id} onClick={() => navigate(appendQuery(`/organizations/${org.id}`))}>
                <td style={{ fontWeight: 600 }}>{org.name}</td>
                <td style={{ color: '#68737D' }}>{org.domain_names.join(', ')}</td>
                <td>{getUserCount(org.id)}</td>
                <td>{getTicketCount(org.id)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {org.tags.map(tag => (
                      <span key={tag} className="tag-pill">{tag}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
