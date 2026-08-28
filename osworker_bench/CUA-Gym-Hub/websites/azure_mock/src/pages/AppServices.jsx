import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, RefreshCw } from 'lucide-react';

export default function AppServices() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const filtered = state.appServices.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'App Services' }]} />
      <h1 className="page-title">App Services</h1>

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
              <th>Status</th>
              <th>App Service plan</th>
              <th>Location</th>
              <th>Resource group</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No App Services found</td></tr>
            )}
            {filtered.map(app => (
              <tr key={app.id}>
                <td><Link to={`/app-services/${app.id}`}>{app.name}</Link></td>
                <td><span className={`badge ${app.status === 'Running' ? 'badge-success' : 'badge-gray'}`}>{app.status}</span></td>
                <td>{app.appServicePlan}</td>
                <td>{app.location}</td>
                <td>{app.resourceGroup}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
