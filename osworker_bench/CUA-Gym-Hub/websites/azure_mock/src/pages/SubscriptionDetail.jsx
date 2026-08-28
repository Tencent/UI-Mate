import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';

export default function SubscriptionDetail() {
  const { id } = useParams();
  const { state, getAllResources } = useAppContext();
  const sub = state.subscriptions.find(s => s.id === id);
  if (!sub) return <div style={{ padding: '24px' }}>Subscription not found.</div>;

  const resources = getAllResources();

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Subscriptions', path: '/subscriptions' }, { label: sub.displayName }]} />
      <h1 className="page-title">{sub.displayName}</h1>

      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="section-header">Essentials</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
          <div><strong>Subscription name:</strong> {sub.displayName}</div>
          <div><strong>Status:</strong> <span className="badge badge-success">{sub.state}</span></div>
          <div><strong>Subscription ID:</strong> {sub.subscriptionId}</div>
          <div><strong>Spending limit:</strong> {sub.spendingLimit}</div>
          <div><strong>Directory:</strong> {state.tenant.displayName}</div>
        </div>
      </div>

      <div className="section-header">Resources ({resources.length})</div>
      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead><tr><th>Name</th><th>Type</th><th>Resource group</th><th>Location</th></tr></thead>
          <tbody>
            {resources.map(r => (
              <tr key={r.id}>
                <td><Link to={r.detailPath}>{r.name}</Link></td>
                <td>{r.type}</td><td>{r.resourceGroup}</td><td>{r.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
