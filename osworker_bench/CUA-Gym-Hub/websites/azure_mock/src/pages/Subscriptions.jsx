import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, RefreshCw } from 'lucide-react';

export default function Subscriptions() {
  const { state } = useAppContext();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Subscriptions' }]} />
      <h1 className="page-title">Subscriptions</h1>

      <div className="command-bar">
        <button className="btn btn-primary"><Plus size={14} /> Add</button>
        <button className="btn btn-default" onClick={() => setRefreshKey(k => k + 1)}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Subscription ID</th>
              <th>Status</th>
              <th>My role</th>
            </tr>
          </thead>
          <tbody>
            {state.subscriptions.map(sub => (
              <tr key={sub.id}>
                <td><Link to={`/subscriptions/${sub.id}`}>{sub.displayName}</Link></td>
                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{sub.subscriptionId}</td>
                <td><span className="badge badge-success">{sub.state}</span></td>
                <td>Owner</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
