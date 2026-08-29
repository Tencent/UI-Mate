import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import TagEditor from '../components/TagEditor';
import { Play, Square, RotateCcw, Trash2, RefreshCw } from 'lucide-react';

export default function VirtualMachineDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const vm = state.virtualMachines.find(v => v.id === id);
  if (!vm) return <div style={{ padding: '24px' }}>Virtual machine not found.</div>;

  const statusBadge = (status) => {
    if (status === 'Running') return <span className="badge badge-success">Running</span>;
    return <span className="badge badge-gray">{status}</span>;
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Virtual machines', path: '/virtual-machines' }, { label: vm.name }]} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{vm.name}</h1>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--xzure-text-secondary)', marginBottom: '16px' }}>Virtual machine</div>

      <div className="command-bar">
        <button className="btn btn-default" onClick={() => dispatch({ type: 'START_VM', payload: vm.id })}><Play size={14} /> Start</button>
        <button className="btn btn-default" onClick={() => dispatch({ type: 'RESTART_VM', payload: vm.id })}><RotateCcw size={14} /> Restart</button>
        <button className="btn btn-default" onClick={() => dispatch({ type: 'STOP_VM', payload: vm.id })}><Square size={14} /> Stop</button>
        <button className="btn btn-danger" onClick={() => setDeleteConfirm(true)}><Trash2 size={14} /> Delete</button>
        <button className="btn btn-default" onClick={() => setRefreshKey(k => k + 1)}><RefreshCw size={14} /> Refresh</button>
      </div>

      {deleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h2 style={{ marginBottom: '12px', fontSize: '18px' }}>Delete Virtual Machine</h2>
            <p style={{ marginBottom: '20px', color: 'var(--xzure-text-secondary)' }}>
              Are you sure you want to delete <strong>{vm.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-default" onClick={() => setDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { dispatch({ type: 'DELETE_VM', payload: vm.id }); navigate('/virtual-machines'); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--xzure-border)', marginBottom: '16px' }}>
        {['overview', 'networking', 'disks', 'tags'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 16px', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--xzure-blue)' : '2px solid transparent',
            background: 'none', cursor: 'pointer', fontWeight: activeTab === tab ? 600 : 400,
            color: activeTab === tab ? 'var(--xzure-blue)' : 'var(--xzure-text-secondary)', fontSize: '14px', textTransform: 'capitalize'
          }}>{tab === 'overview' ? 'Overview' : tab === 'networking' ? 'Networking' : tab === 'disks' ? 'Disks' : 'Tags'}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        /* Essentials */
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="section-header">Essentials</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
            <div><strong>Resource group:</strong> <Link to={`/resource-groups/${vm.resourceGroup}`}>{vm.resourceGroup}</Link></div>
            <div><strong>Computer name:</strong> {vm.computerName}</div>
            <div><strong>Status:</strong> {statusBadge(vm.status)}</div>
            <div><strong>Operating system:</strong> {vm.osType} - {vm.osImage}</div>
            <div><strong>Location:</strong> {vm.location}</div>
            <div><strong>Size:</strong> {vm.size}</div>
            <div><strong>Subscription:</strong> <Link to={`/subscriptions/${state.subscriptions[0]?.id}`}>{state.subscriptions[0]?.displayName}</Link></div>
            <div><strong>Public IP address:</strong> {vm.publicIpAddress || 'None'}</div>
            <div><strong>Subscription ID:</strong> {state.subscriptions[0]?.subscriptionId}</div>
            <div><strong>Private IP address:</strong> {vm.privateIpAddress}</div>
            <div><strong>Tags:</strong> {Object.entries(vm.tags || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None'}</div>
            <div><strong>Virtual network/subnet:</strong> {vm.virtualNetwork}/{vm.subnet}</div>
          </div>
        </div>
      )}

      {activeTab === 'networking' && (
        /* Networking */
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="section-header">Networking</div>
          <div style={{ fontSize: '14px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '8px 12px' }}>
            <div style={{ fontWeight: 600 }}>Network security group</div>
            <div>
              {state.networkSecurityGroups.find(n => n.name === vm.networkSecurityGroup)
                ? <Link to={`/network-security-groups/${state.networkSecurityGroups.find(n => n.name === vm.networkSecurityGroup).id}`} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{vm.networkSecurityGroup}</Link>
                : vm.networkSecurityGroup}
            </div>
            <div style={{ fontWeight: 600 }}>Virtual network</div>
            <div><Link to="/virtual-networks" style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{vm.virtualNetwork}</Link></div>
            <div style={{ fontWeight: 600 }}>Subnet</div>
            <div>{vm.subnet}</div>
            <div style={{ fontWeight: 600 }}>Private IP address</div>
            <div>{vm.privateIpAddress}</div>
            <div style={{ fontWeight: 600 }}>Public IP address</div>
            <div>{vm.publicIpAddress || 'None'}</div>
          </div>
        </div>
      )}

      {activeTab === 'disks' && (
        /* Disks */
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="section-header">Disks</div>
          <table className="xzure-table">
            <thead>
              <tr>
                <th>Disk name</th>
                <th>Storage type</th>
                <th>Size (GiB)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{vm.name}-osdisk</td>
                <td>{vm.osDiskType}</td>
                <td>{vm.osDiskSizeGb}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tags' && (
        <div>
          <div className="section-header" style={{ marginBottom: '12px' }}>Tags</div>
          <TagEditor
            tags={vm.tags || {}}
            onSave={(newTags) => dispatch({ type: 'UPDATE_VM_TAGS', payload: { id: vm.id, tags: newTags } })}
          />
        </div>
      )}
    </div>
  );
}
