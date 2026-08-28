import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, RefreshCw } from 'lucide-react';

export default function ResourceGroups() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const filtered = state.resourceGroups.filter(rg =>
    rg.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Resource groups' }]} />
      <h1 className="page-title">Resource groups</h1>

      <div className="command-bar">
        <button className="btn btn-primary" onClick={() => navigate('/resource-groups/create')}><Plus size={14} /> Create</button>
        <button className="btn btn-default" onClick={() => setRefreshKey(k => k + 1)}><RefreshCw size={14} /> Refresh</button>
        <button className="btn btn-default" onClick={() => {
          const csv = ['Name,Subscription,Location', ...state.resourceGroups.map(rg => `${rg.name},${state.subscriptions[0]?.displayName},${rg.location}`)].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'resource-groups.csv'; a.click(); URL.revokeObjectURL(url);
        }}>Export to CSV</button>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Filter by name..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Subscription</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(rg => (
              <tr key={rg.id}>
                <td><Link to={`/resource-groups/${rg.name}`}>{rg.name}</Link></td>
                <td>{state.subscriptions[0]?.displayName}</td>
                <td>{rg.location}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--xzure-text-secondary)', padding: '24px' }}>No resource groups found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
