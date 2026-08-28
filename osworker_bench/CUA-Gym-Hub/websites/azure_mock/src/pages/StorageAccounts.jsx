import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, RefreshCw } from 'lucide-react';

export default function StorageAccounts() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const filtered = state.storageAccounts.filter(sa => sa.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Storage accounts' }]} />
      <h1 className="page-title">Storage accounts</h1>
      <div className="command-bar">
        <button className="btn btn-primary" onClick={() => navigate('/storage-accounts/create')}><Plus size={14} /> Create</button>
        <button className="btn btn-default" onClick={() => setRefreshKey(k => k + 1)}><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className="filter-bar">
        <input className="input" placeholder="Filter by name..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead><tr><th>Name</th><th>Resource group</th><th>Location</th><th>Performance</th><th>Replication</th></tr></thead>
          <tbody>
            {filtered.map(sa => (
              <tr key={sa.id}>
                <td><Link to={`/storage-accounts/${sa.id}`}>{sa.name}</Link></td>
                <td>{sa.resourceGroup}</td><td>{sa.location}</td><td>{sa.performance}</td><td>{sa.replication}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No storage accounts found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
