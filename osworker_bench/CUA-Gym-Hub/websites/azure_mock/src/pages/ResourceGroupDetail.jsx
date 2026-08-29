import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, Trash2 } from 'lucide-react';

export default function ResourceGroupDetail() {
  const { name } = useParams();
  const { state, dispatch, getAllResources } = useAppContext();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const rg = state.resourceGroups.find(r => r.name === name);
  if (!rg) return <div style={{ padding: '24px' }}>Resource group "{name}" not found.</div>;

  const resources = getAllResources().filter(r => r.resourceGroup === name);

  const handleDelete = () => {
    dispatch({ type: 'DELETE_RESOURCE_GROUP', payload: name });
    navigate('/resource-groups');
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Resource groups', path: '/resource-groups' }, { label: name }]} />
      <h1 className="page-title">{name}</h1>

      <div className="command-bar">
        <button className="btn btn-primary" onClick={() => navigate('/create-resource')}><Plus size={14} /> Create</button>
        <button className="btn btn-danger" onClick={() => setShowDelete(true)}><Trash2 size={14} /> Delete resource group</button>
      </div>

      {/* Essentials */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="section-header">Essentials</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
          <div><strong>Resource group:</strong> {rg.name}</div>
          <div><strong>Location:</strong> {rg.location}</div>
          <div><strong>Subscription:</strong> {state.subscriptions[0]?.displayName}</div>
          <div><strong>Subscription ID:</strong> {state.subscriptions[0]?.subscriptionId}</div>
          <div><strong>Tags:</strong> {Object.entries(rg.tags || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None'}</div>
          <div><strong>Provisioning state:</strong> {rg.provisioningState}</div>
        </div>
      </div>

      {/* Resources */}
      <div className="section-header">Resources ({resources.length})</div>
      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(r => (
              <tr key={r.id}>
                <td><Link to={r.detailPath}>{r.name}</Link></td>
                <td>{r.type}</td>
                <td>{r.location}</td>
              </tr>
            ))}
            {resources.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No resources in this group</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation dialog */}
      {showDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}>
          <div className="card" style={{ width: '450px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Delete resource group "{name}"?</h2>
            <p style={{ marginBottom: '16px', color: 'var(--xzure-text-secondary)' }}>
              This will permanently delete the resource group and all its resources. Type the resource group name to confirm:
            </p>
            <input
              className="input"
              style={{ width: '100%', marginBottom: '16px' }}
              placeholder={name}
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-default" onClick={() => { setShowDelete(false); setDeleteInput(''); }}>Cancel</button>
              <button
                className="btn btn-danger"
                disabled={deleteInput !== name}
                onClick={handleDelete}
                style={{ opacity: deleteInput !== name ? 0.5 : 1 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
