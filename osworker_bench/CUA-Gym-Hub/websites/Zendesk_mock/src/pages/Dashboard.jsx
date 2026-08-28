import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  const myOpenTickets = state.tickets.filter(t =>
    t.assignee_id === state.currentUser.id && ['new', 'open'].includes(t.status)
  );
  const pendingTickets = state.tickets.filter(t =>
    t.assignee_id === state.currentUser.id && t.status === 'pending'
  );
  const solvedThisWeek = state.tickets.filter(t => {
    if (t.status !== 'solved') return false;
    const updated = new Date(t.updated_at);
    return updated >= new Date(Date.now() - 7 * 86400000);
  });
  const unassigned = state.tickets.filter(t =>
    !t.assignee_id && ['new', 'open'].includes(t.status)
  );

  const recentTickets = [...state.tickets]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  const getUserName = (id) => state.users.find(u => u.id === id)?.name || '—';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-welcome">Good {greeting}, {state.currentUser.name.split(' ')[0]}</h1>

      <div className="dashboard-cards">
        <div className="dashboard-card green" onClick={() => navigate(appendQuery('/views/1'))}>
          <div className="dashboard-card-value">{myOpenTickets.length}</div>
          <div className="dashboard-card-label">Tickets assigned to you</div>
        </div>
        <div className="dashboard-card blue" onClick={() => navigate(appendQuery('/views/6'))}>
          <div className="dashboard-card-value">{pendingTickets.length}</div>
          <div className="dashboard-card-label">Pending your reply</div>
        </div>
        <div className="dashboard-card gray" onClick={() => navigate(appendQuery('/views/5'))} style={{ cursor: 'pointer' }}>
          <div className="dashboard-card-value">{solvedThisWeek.length}</div>
          <div className="dashboard-card-label">Solved this week</div>
        </div>
        <div className="dashboard-card orange" onClick={() => navigate(appendQuery('/views/2'))}>
          <div className="dashboard-card-value">{unassigned.length}</div>
          <div className="dashboard-card-label">Unassigned tickets</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Recent Tickets</h2>
        <table className="list-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>ID</th>
              <th>Subject</th>
              <th>Requester</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {recentTickets.map(ticket => (
              <tr key={ticket.id} onClick={() => {
                dispatch({ type: 'OPEN_TICKET_TAB', payload: ticket.id });
                navigate(appendQuery(`/tickets/${ticket.id}`));
              }}>
                <td><StatusBadge status={ticket.status} /></td>
                <td style={{ color: '#87929D' }}>#{ticket.id}</td>
                <td style={{ fontWeight: 600 }}>{ticket.subject}</td>
                <td>{getUserName(ticket.requester_id)}</td>
                <td style={{ color: '#87929D', fontSize: 12 }}>
                  {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Quick Links</h2>
        <div className="dashboard-quick-links">
          <Link to={appendQuery('/views/1')} className="dashboard-quick-link">Your unsolved tickets</Link>
          <Link to={appendQuery('/views/2')} className="dashboard-quick-link">Unassigned tickets</Link>
          <Link to={appendQuery('/views/3')} className="dashboard-quick-link">All unsolved tickets</Link>
        </div>
      </div>
    </div>
  );
}
