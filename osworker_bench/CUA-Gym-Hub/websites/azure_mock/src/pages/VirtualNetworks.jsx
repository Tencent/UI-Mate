import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { RefreshCw } from 'lucide-react';

export default function VirtualNetworks() {
  const { state } = useAppContext();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Virtual networks' }]} />
      <h1 className="page-title">Virtual networks</h1>
      <div className="command-bar">
        <button className="btn btn-default" onClick={() => setRefreshKey(k => k + 1)}><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead><tr><th>Name</th><th>Address space</th><th>Resource group</th><th>Location</th></tr></thead>
          <tbody>
            {state.virtualNetworks.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No virtual networks found</td></tr>
            )}
            {state.virtualNetworks.map(vn => (
              <tr key={vn.id}>
                <td><Link to={`/virtual-networks/${vn.id}`}>{vn.name}</Link></td>
                <td>{vn.addressSpace}</td>
                <td>{vn.resourceGroup}</td>
                <td>{vn.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
