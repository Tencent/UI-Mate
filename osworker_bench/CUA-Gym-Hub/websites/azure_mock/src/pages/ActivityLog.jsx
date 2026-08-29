import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';

export default function ActivityLog() {
  const { state } = useAppContext();
  const [timeFilter, setTimeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const sorted = [...state.activityLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filtered = sorted.filter(event => {
    if (severityFilter !== 'all' && event.level.toLowerCase() !== severityFilter) return false;
    if (timeFilter !== 'all') {
      const hours = { '1h': 1, '6h': 6, '24h': 24, '1w': 168, '1m': 720 }[timeFilter] || Infinity;
      if (Date.now() - new Date(event.timestamp).getTime() > hours * 60 * 60 * 1000) return false;
    }
    return true;
  });

  const formatTime = (ts) => new Date(ts).toLocaleString();

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Activity log' }]} />
      <h1 className="page-title">Activity log</h1>

      <div className="filter-bar">
        <select className="input" value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
          <option value="all">All time</option>
          <option value="1h">1 hour</option>
          <option value="6h">6 hours</option>
          <option value="24h">24 hours</option>
          <option value="1w">1 week</option>
          <option value="1m">1 month</option>
        </select>
        <select className="input" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
          <option value="all">All severities</option>
          <option value="informational">Informational</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead>
            <tr><th>Operation</th><th>Status</th><th>Time</th><th>Resource group</th><th>Resource</th><th>Initiated by</th></tr>
          </thead>
          <tbody>
            {filtered.map(event => (
              <tr key={event.id}>
                <td>{event.operationName}</td>
                <td><span className={`badge ${event.status === 'Succeeded' ? 'badge-success' : 'badge-error'}`}>{event.status}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatTime(event.timestamp)}</td>
                <td>{event.resourceGroup}</td>
                <td>{event.resourceName}</td>
                <td>{event.initiatedBy}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No activity log entries found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
