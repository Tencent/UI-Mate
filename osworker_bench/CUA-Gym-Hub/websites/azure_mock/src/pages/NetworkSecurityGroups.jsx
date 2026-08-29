import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, RefreshCw } from 'lucide-react';

export default function NetworkSecurityGroups() {
  const { state } = useAppContext();
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const filtered = state.networkSecurityGroups.filter(nsg =>
    nsg.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Network security groups' }]} />
      <h1 className="page-title">Network security groups</h1>

      <div className="command-bar">
        <button className="btn btn-primary"><Plus size={14} /> Create</button>
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
              <th>Resource group</th>
              <th>Location</th>
              <th>Inbound rules</th>
              <th>Outbound rules</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No network security groups found</td></tr>
            )}
            {filtered.map(nsg => (
              <tr key={nsg.id}>
                <td><Link to={`/network-security-groups/${nsg.id}`}>{nsg.name}</Link></td>
                <td>{nsg.resourceGroup}</td>
                <td>{nsg.location}</td>
                <td>{nsg.inboundRules.length}</td>
                <td>{nsg.outboundRules.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
