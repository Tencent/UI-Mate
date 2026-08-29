import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { RefreshCw } from 'lucide-react';

export default function VirtualNetworkDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const vnet = state.virtualNetworks.find(v => v.id === id);
  if (!vnet) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Virtual networks', path: '/virtual-networks' }, { label: 'Not found' }]} />
        <h1 className="page-title">Virtual network not found</h1>
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ color: 'var(--xzure-text-secondary)' }}>The requested virtual network could not be found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/virtual-networks')} style={{ marginTop: '16px' }}>Back to Virtual networks</button>
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    dispatch({
      type: 'UPDATE_RECENT_RESOURCES',
      payload: { name: vnet.name, type: 'Virtual network', resourceGroup: vnet.resourceGroup }
    });
  }, [vnet.name]);

  const sub = state.subscriptions.find(s => s.id === vnet.subscriptionId) || state.subscriptions[0];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Virtual networks', path: '/virtual-networks' }, { label: vnet.name }]} />
      <h1 className="page-title">{vnet.name}</h1>
      <div style={{ fontSize: '13px', color: 'var(--xzure-text-secondary)', marginBottom: '16px' }}>Virtual network</div>

      <div className="command-bar">
        <button className="btn btn-default" onClick={() => setRefreshKey(k => k + 1)}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="section-header" style={{ marginBottom: '12px' }}>Essentials</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
          <div><strong>Resource group:</strong> <Link to={`/resource-groups/${vnet.resourceGroup}`} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{vnet.resourceGroup}</Link></div>
          <div><strong>Location:</strong> {vnet.location}</div>
          <div><strong>Subscription:</strong> <Link to={`/subscriptions/${sub?.id}`} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{sub?.displayName}</Link></div>
          <div><strong>Address space:</strong> {vnet.addressSpace}</div>
          <div><strong>Status:</strong> <span className="badge badge-success">{vnet.status}</span></div>
          <div><strong>DNS servers:</strong> Default (Xzure-provided)</div>
          {Object.keys(vnet.tags || {}).length > 0 && (
            <>
              <div><strong>Tags:</strong></div>
              <div>{Object.entries(vnet.tags).map(([k, v]) => (
                <span key={k} className="badge badge-info" style={{ marginRight: '4px' }}>{k}: {v}</span>
              ))}</div>
            </>
          )}
        </div>
      </div>

      <div className="section-header" style={{ marginBottom: '12px' }}>Subnets ({vnet.subnets.length})</div>
      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address range</th>
              <th>Connected devices</th>
              <th>Network security group</th>
            </tr>
          </thead>
          <tbody>
            {vnet.subnets.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No subnets</td></tr>
            )}
            {vnet.subnets.map(subnet => (
              <tr key={subnet.id}>
                <td>{subnet.name}</td>
                <td>{subnet.addressPrefix}</td>
                <td>{subnet.connectedDevices}</td>
                <td>
                  {state.networkSecurityGroups.find(n => n.name === subnet.networkSecurityGroup)
                    ? <Link to={`/network-security-groups/${state.networkSecurityGroups.find(n => n.name === subnet.networkSecurityGroup).id}`} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{subnet.networkSecurityGroup}</Link>
                    : subnet.networkSecurityGroup || 'None'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
