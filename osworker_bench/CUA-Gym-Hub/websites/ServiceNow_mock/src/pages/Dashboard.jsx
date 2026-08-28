import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getUserDisplayName, getPriorityLabel, getPriorityColor, getIncidentStateLabel, getChangeStateLabel } from '../utils/dataManager';
import { format } from 'date-fns';

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';
  const currentUser = state.currentUser;

  const openIncidents = state.incidents.filter(i => [1, 2, 3].includes(i.state));
  const myIncidents = state.incidents.filter(i => i.assigned_to === currentUser.sys_id && [1, 2, 3].includes(i.state));
  const openChanges = state.changeRequests.filter(c => c.state !== 3 && c.state !== 4);
  const unreadNotifs = state.notifications.filter(n => !n.read);

  // Overdue: SLA due in the past for open incidents
  const now = new Date();
  const overdueItems = state.incidents.filter(i =>
    [1, 2, 3].includes(i.state) && i.sla_due && new Date(i.sla_due) < now
  );

  // Assigned work: combine incidents, changes assigned to current user
  const assignedWork = [
    ...state.incidents
      .filter(i => i.assigned_to === currentUser.sys_id && [1, 2, 3].includes(i.state))
      .map(i => ({ type: 'Incident', number: i.number, sys_id: i.sys_id, route: `/incident/${i.sys_id}`, priority: i.priority, state: getIncidentStateLabel(i.state), short_description: i.short_description, created: i.opened_at, updated_at: i.updated_at })),
    ...state.changeRequests
      .filter(c => c.assigned_to === currentUser.sys_id && c.state !== 3 && c.state !== 4)
      .map(c => ({ type: 'Change', number: c.number, sys_id: c.sys_id, route: `/change/${c.sys_id}`, priority: c.priority, state: getChangeStateLabel(c.state), short_description: c.short_description, created: c.opened_at, updated_at: c.updated_at })),
  ].sort((a, b) => (a.priority || 5) - (b.priority || 5));

  return (
    <div className="sn-dashboard">
      <div className="sn-dashboard-welcome">
        <h1>Welcome, {currentUser.first_name} {currentUser.last_name}!</h1>
        <p>{format(now, 'EEEE, MMMM d, yyyy h:mm a')}</p>
      </div>

      <div className="sn-stats-row">
        <div className="sn-stat-card" onClick={() => navigate(`/incident/list${sp ? sp + '&' : '?'}filter=open`)}>
          <div className="sn-stat-card-number">{openIncidents.length}</div>
          <div className="sn-stat-card-label">Open Incidents</div>
        </div>
        <div className="sn-stat-card" onClick={() => navigate(`/incident/list${sp ? sp + '&' : '?'}filter=open`)}>
          <div className="sn-stat-card-number" style={{ color: overdueItems.length > 0 ? '#d32f2f' : undefined }}>{overdueItems.length}</div>
          <div className="sn-stat-card-label">Overdue Items</div>
        </div>
        <div className="sn-stat-card" onClick={() => navigate(`/change/list${sp ? sp + '&' : '?'}filter=open`)}>
          <div className="sn-stat-card-number">{openChanges.length}</div>
          <div className="sn-stat-card-label">Open Changes</div>
        </div>
        <div className="sn-stat-card">
          <div className="sn-stat-card-number">{unreadNotifs.length}</div>
          <div className="sn-stat-card-label">Unread Notifications</div>
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Your Work</h2>
      {assignedWork.length === 0 ? (
        <p style={{ color: '#666' }}>No items assigned to you.</p>
      ) : (
        <table className="sn-table" style={{ marginTop: 0 }}>
          <thead>
            <tr>
              <th>Number</th>
              <th>Type</th>
              <th>Priority</th>
              <th>State</th>
              <th>Short Description</th>
            </tr>
          </thead>
          <tbody>
            {assignedWork.slice(0, 20).map(item => (
              <tr key={item.sys_id}>
                <td>
                  <a className="sn-table-link" onClick={() => navigate(item.route + sp)}>
                    {item.number}
                  </a>
                </td>
                <td>{item.type}</td>
                <td>
                  <span className="sn-priority-badge" style={{ background: getPriorityColor(item.priority) }}>
                    {getPriorityLabel(item.priority)}
                  </span>
                </td>
                <td><span className="sn-state-label">{item.state}</span></td>
                <td className="text-truncate" style={{ maxWidth: 400 }}>{item.short_description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
