import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import TagEditor from '../components/TagEditor';
import { Plus, Trash2, RefreshCw, X } from 'lucide-react';

export default function StorageAccountDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('containers');
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showAddContainer, setShowAddContainer] = useState(false);
  const [newContainerName, setNewContainerName] = useState('');
  const [newContainerAccess, setNewContainerAccess] = useState('Private');
  const [containerError, setContainerError] = useState('');

  const sa = state.storageAccounts.find(s => s.id === id);
  if (!sa) return <div style={{ padding: '24px' }}>Storage account not found.</div>;

  React.useEffect(() => {
    dispatch({
      type: 'UPDATE_RECENT_RESOURCES',
      payload: { name: sa.name, type: 'Storage account', resourceGroup: sa.resourceGroup }
    });
  }, [sa.name]);

  const handleDelete = () => {
    dispatch({ type: 'DELETE_STORAGE_ACCOUNT', payload: sa.id });
    navigate('/storage-accounts');
  };

  const handleAddContainer = () => {
    if (!newContainerName.trim()) {
      setContainerError('Container name is required.');
      return;
    }
    if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(newContainerName.trim())) {
      setContainerError('Container name must be 3-63 characters, lowercase letters, numbers, and hyphens only.');
      return;
    }
    if (sa.containers.find(c => c.name === newContainerName.trim())) {
      setContainerError('A container with this name already exists.');
      return;
    }
    dispatch({
      type: 'CREATE_CONTAINER',
      payload: {
        storageAccountId: sa.id,
        name: newContainerName.trim(),
        publicAccessLevel: newContainerAccess
      }
    });
    setNewContainerName('');
    setNewContainerAccess('Private');
    setContainerError('');
    setShowAddContainer(false);
  };

  const sub = state.subscriptions.find(s => s.id === sa.subscriptionId) || state.subscriptions[0];

  const menuItems = [
    { id: 'containers', label: 'Containers' },
    { id: 'overview', label: 'Overview' },
    { id: 'tags', label: 'Tags' },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Storage accounts', path: '/storage-accounts' }, { label: sa.name }]} />
      <h1 className="page-title">{sa.name}</h1>
      <div style={{ fontSize: '13px', color: 'var(--xzure-text-secondary)', marginBottom: '16px' }}>Storage account</div>

      <div className="command-bar">
        <button className="btn btn-default" onClick={() => setRefreshKey(k => k + 1)}><RefreshCw size={14} /> Refresh</button>
        <button className="btn btn-danger" onClick={() => setDeleteConfirm(true)}><Trash2 size={14} /> Delete</button>
      </div>

      {deleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h2 style={{ marginBottom: '12px', fontSize: '18px' }}>Delete Storage Account</h2>
            <p style={{ marginBottom: '20px', color: 'var(--xzure-text-secondary)' }}>
              Are you sure you want to delete <strong>{sa.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-default" onClick={() => setDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Service menu */}
        <div style={{ minWidth: '200px', flexShrink: 0 }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              style={{ borderLeft: activeTab === item.id ? '3px solid var(--xzure-blue)' : '3px solid transparent' }}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1 }}>
          {activeTab === 'overview' && (
            <div className="card">
              <div className="section-header" style={{ marginBottom: '12px' }}>Essentials</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <div><strong>Resource group:</strong> <Link to={`/resource-groups/${sa.resourceGroup}`} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{sa.resourceGroup}</Link></div>
                <div><strong>Status:</strong> <span className="badge badge-success">{sa.status}</span></div>
                <div><strong>Location:</strong> {sa.location}</div>
                <div><strong>Performance:</strong> {sa.performance}</div>
                <div><strong>Subscription:</strong> <Link to={`/subscriptions/${sub?.id}`} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{sub?.displayName}</Link></div>
                <div><strong>Replication:</strong> {sa.replication}</div>
                <div><strong>Primary endpoint:</strong> <span style={{ fontSize: '12px', wordBreak: 'break-all' }}>{sa.primaryEndpoint}</span></div>
                <div><strong>Access tier:</strong> {sa.accessTier}</div>
                <div><strong>Tags:</strong> {Object.entries(sa.tags || {}).map(([k, v]) => (
                  <span key={k} className="badge badge-info" style={{ marginRight: '4px' }}>{k}: {v}</span>
                ))}</div>
              </div>
            </div>
          )}

          {activeTab === 'containers' && (
            <div>
              <div className="command-bar" style={{ marginBottom: '12px' }}>
                <button className="btn btn-primary" onClick={() => setShowAddContainer(!showAddContainer)}>
                  <Plus size={14} /> Container
                </button>
              </div>

              {showAddContainer && (
                <div className="card" style={{ marginBottom: '16px', maxWidth: '480px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>New container</div>
                    <button onClick={() => { setShowAddContainer(false); setContainerError(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={16} /></button>
                  </div>
                  {containerError && (
                    <div style={{ color: 'var(--xzure-error)', fontSize: '13px', marginBottom: '12px', padding: '8px 12px', background: '#fde8e8', borderRadius: '2px' }}>{containerError}</div>
                  )}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Name *</label>
                    <input className="input" style={{ width: '100%' }} placeholder="container-name" value={newContainerName}
                      onChange={e => { setNewContainerName(e.target.value); setContainerError(''); }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Public access level</label>
                    <select className="input" style={{ width: '100%' }} value={newContainerAccess}
                      onChange={e => setNewContainerAccess(e.target.value)}>
                      <option value="Private">Private (no anonymous access)</option>
                      <option value="Blob">Blob (anonymous read access for blobs only)</option>
                      <option value="Container">Container (anonymous read access for containers and blobs)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" onClick={handleAddContainer}>Create</button>
                    <button className="btn btn-default" onClick={() => { setShowAddContainer(false); setContainerError(''); }}>Cancel</button>
                  </div>
                </div>
              )}

              <div className="card" style={{ padding: 0 }}>
                <table className="xzure-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Public access level</th>
                      <th>Lease state</th>
                      <th>Last modified</th>
                      <th>Blob count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sa.containers.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No containers found</td></tr>
                    )}
                    {sa.containers.map(c => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.publicAccessLevel}</td>
                        <td>{c.leaseState}</td>
                        <td>{new Date(c.lastModified).toLocaleDateString()}</td>
                        <td>{c.blobCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div>
              <div className="section-header" style={{ marginBottom: '12px' }}>Tags</div>
              <TagEditor
                tags={sa.tags || {}}
                onSave={(newTags) => dispatch({ type: 'UPDATE_STORAGE_TAGS', payload: { id: sa.id, tags: newTags } })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
