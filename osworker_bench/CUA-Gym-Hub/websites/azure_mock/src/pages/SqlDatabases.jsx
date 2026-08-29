import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, RefreshCw } from 'lucide-react';

export default function SqlDatabases() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const filtered = state.sqlDatabases.filter(db =>
    db.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'SQL databases' }]} />
      <h1 className="page-title">SQL databases</h1>

      <div className="command-bar">
        <button className="btn btn-primary" onClick={() => navigate('/create-resource')}><Plus size={14} /> Create</button>
        <button className="btn btn-default" onClick={() => setRefreshKey(k => k + 1)}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Filter by name..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Server</th>
              <th>Status</th>
              <th>Pricing tier</th>
              <th>Resource group</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No SQL databases found</td></tr>
            )}
            {filtered.map(db => (
              <tr key={db.id}>
                <td><Link to={`/sql-databases/${db.id}`}>{db.name}</Link></td>
                <td>{db.serverName}</td>
                <td><span className={`badge ${db.status === 'Online' ? 'badge-success' : 'badge-gray'}`}>{db.status}</span></td>
                <td>{db.pricingTier}</td>
                <td>{db.resourceGroup}</td>
                <td>{db.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
