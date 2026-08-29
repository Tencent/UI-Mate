import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDistanceToNow } from 'date-fns';

export default function CustomersPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState('');

  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  const endUsers = state.users.filter(u => u.role === 'end-user');
  const filtered = endUsers.filter(u =>
    u.name.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase())
  );

  const getOrgName = (orgId) => {
    const org = state.organizations.find(o => o.id === orgId);
    return org ? org.name : '—';
  };

  const getTicketCount = (userId) => {
    return state.tickets.filter(t => t.requester_id === userId).length;
  };

  return (
    <div className="list-page">
      <h1 className="list-page-title">Customers</h1>
      <div className="list-search">
        <input
          placeholder="Search customers..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          type="customers"
          title={filter ? `No customers matching "${filter}"` : 'No customers found'}
          subtitle={filter ? 'Try adjusting your search term.' : 'Customers will appear here once added.'}
        />
      ) : (
        <table className="list-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Organization</th>
              <th>Tickets</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} onClick={() => navigate(appendQuery(`/customers/${user.id}`))}>
                <td>
                  <div className="user-cell">
                    <div className="list-avatar end-user">{user.initials}</div>
                    {user.name}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{getOrgName(user.organization_id)}</td>
                <td>{getTicketCount(user.id)}</td>
                <td style={{ color: '#87929D', fontSize: 12 }}>
                  {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
