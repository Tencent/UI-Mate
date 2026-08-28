import React, { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDistanceToNow } from 'date-fns';

export default function SearchPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('tickets');

  const q = searchParams.get('q') || state.ui.searchQuery || '';
  const appendQuery = (p) => {
    const sid = searchParams.get('sid');
    return sid ? `${p}${p.includes('?') ? '&' : '?'}sid=${sid}` : p;
  };

  const ticketResults = useMemo(() => {
    if (!q) return [];
    const lower = q.toLowerCase();
    return state.tickets.filter(t => {
      const requester = state.users.find(u => u.id === t.requester_id);
      const commentsForTicket = (state.comments[t.id] || []);
      return (
        t.subject.toLowerCase().includes(lower) ||
        (t.description && t.description.toLowerCase().includes(lower)) ||
        (requester && requester.name.toLowerCase().includes(lower)) ||
        t.tags.some(tag => tag.toLowerCase().includes(lower)) ||
        String(t.id).includes(lower) ||
        commentsForTicket.some(c => c.body && c.body.toLowerCase().includes(lower))
      );
    });
  }, [q, state.tickets, state.users, state.comments]);

  const userResults = useMemo(() => {
    if (!q) return [];
    const lower = q.toLowerCase();
    return state.users.filter(u =>
      u.name.toLowerCase().includes(lower) ||
      u.email.toLowerCase().includes(lower) ||
      (u.phone && u.phone.toLowerCase().includes(lower)) ||
      (u.notes && u.notes.toLowerCase().includes(lower))
    );
  }, [q, state.users]);

  const orgResults = useMemo(() => {
    if (!q) return [];
    const lower = q.toLowerCase();
    return state.organizations.filter(o =>
      o.name.toLowerCase().includes(lower) ||
      o.domain_names.some(d => d.toLowerCase().includes(lower)) ||
      (o.details && o.details.toLowerCase().includes(lower)) ||
      (o.notes && o.notes.toLowerCase().includes(lower)) ||
      o.tags.some(tag => tag.toLowerCase().includes(lower))
    );
  }, [q, state.organizations]);

  const totalResults = ticketResults.length + userResults.length + orgResults.length;

  const getUserName = (id) => state.users.find(u => u.id === id)?.name || '—';
  const getGroupName = (id) => state.groups.find(g => g.id === id)?.name || '—';
  const getOrgName = (id) => state.organizations.find(o => o.id === id)?.name || '—';

  const handleTicketClick = (ticket) => {
    dispatch({ type: 'OPEN_TICKET_TAB', payload: ticket.id });
    navigate(appendQuery(`/tickets/${ticket.id}`));
  };

  const tabStyle = (tab) => ({
    padding: '8px 16px',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid #1F73B7' : '2px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: activeTab === tab ? 600 : 400,
    color: activeTab === tab ? '#1F73B7' : '#68737D',
    fontFamily: 'var(--font-family)',
  });

  return (
    <div className="search-page">
      <h2 className="search-page-title">
        {totalResults} result{totalResults !== 1 ? 's' : ''} for <strong>"{q}"</strong>
      </h2>

      {q && (
        <div style={{ display: 'flex', borderBottom: '1px solid #D8DCDE', marginBottom: 16 }}>
          <button style={tabStyle('tickets')} onClick={() => setActiveTab('tickets')}>
            Tickets ({ticketResults.length})
          </button>
          <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>
            Customers ({userResults.length})
          </button>
          <button style={tabStyle('orgs')} onClick={() => setActiveTab('orgs')}>
            Organizations ({orgResults.length})
          </button>
        </div>
      )}

      {activeTab === 'tickets' && (
        ticketResults.length > 0 ? (
          <div className="ticket-table-wrapper">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th className="status-cell">Status</th>
                  <th className="id-cell">ID</th>
                  <th className="subject-cell">Subject</th>
                  <th>Requester</th>
                  <th>Updated</th>
                  <th>Group</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {ticketResults.map(ticket => (
                  <tr key={ticket.id} onClick={() => handleTicketClick(ticket)}>
                    <td className="status-cell"><span className={`status-dot ${ticket.status}`} /></td>
                    <td className="id-cell">#{ticket.id}</td>
                    <td className="subject-cell">
                      <span className="subject-text">{ticket.subject}</span>
                      <div className="subject-requester">{getUserName(ticket.requester_id)}</div>
                    </td>
                    <td className="requester-cell">{getUserName(ticket.requester_id)}</td>
                    <td className="time-cell">{formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</td>
                    <td className="group-cell">{getGroupName(ticket.group_id)}</td>
                    <td className="assignee-cell">{ticket.assignee_id ? getUserName(ticket.assignee_id) : '—'}</td>
                    <td><PriorityBadge priority={ticket.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            type="search"
            title={q ? `No tickets found for "${q}"` : 'Search for tickets'}
            subtitle={q ? 'Try adjusting your search terms.' : 'Enter a search query to find tickets.'}
          />
        )
      )}

      {activeTab === 'users' && (
        userResults.length > 0 ? (
          <div className="ticket-table-wrapper">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Organization</th>
                  <th>Tickets</th>
                </tr>
              </thead>
              <tbody>
                {userResults.map(user => (
                  <tr key={user.id} onClick={() => navigate(appendQuery(`/customers/${user.id}`))}>
                    <td>
                      <div className="user-cell">
                        <div className={`list-avatar ${user.role === 'agent' ? 'agent' : 'end-user'}`}>{user.initials}</div>
                        {user.name}
                      </div>
                    </td>
                    <td style={{ color: '#68737D', fontSize: 12 }}>{user.email}</td>
                    <td><span style={{ textTransform: 'capitalize', fontSize: 12 }}>{user.role}</span></td>
                    <td>{getOrgName(user.organization_id)}</td>
                    <td>{state.tickets.filter(t => t.requester_id === user.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            type="search"
            title={q ? `No customers found for "${q}"` : 'Search for customers'}
            subtitle={q ? 'Try adjusting your search terms.' : 'Enter a search query to find customers.'}
          />
        )
      )}

      {activeTab === 'orgs' && (
        orgResults.length > 0 ? (
          <div className="ticket-table-wrapper">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Domain</th>
                  <th>Members</th>
                  <th>Tickets</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {orgResults.map(org => (
                  <tr key={org.id} onClick={() => navigate(appendQuery(`/organizations/${org.id}`))}>
                    <td style={{ fontWeight: 600 }}>{org.name}</td>
                    <td style={{ color: '#68737D', fontSize: 12 }}>{org.domain_names.join(', ')}</td>
                    <td>{state.users.filter(u => u.organization_id === org.id).length}</td>
                    <td>
                      {state.tickets.filter(t => {
                        const orgUserIds = state.users.filter(u => u.organization_id === org.id).map(u => u.id);
                        return orgUserIds.includes(t.requester_id);
                      }).length}
                    </td>
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
          </div>
        ) : (
          <EmptyState
            type="search"
            title={q ? `No organizations found for "${q}"` : 'Search for organizations'}
            subtitle={q ? 'Try adjusting your search terms.' : 'Enter a search query to find organizations.'}
          />
        )
      )}

      {!q && (
        <EmptyState
          type="search"
          title="Search for anything"
          subtitle="Enter a search query to find tickets, customers, and organizations."
        />
      )}
    </div>
  );
}
