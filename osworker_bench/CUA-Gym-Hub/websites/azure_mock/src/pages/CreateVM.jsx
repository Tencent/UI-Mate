import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';

const tabs = ['Basics', 'Disks', 'Networking', 'Management', 'Advanced', 'Tags', 'Review + Create'];
const regions = ['East US', 'East US 2', 'West US', 'West US 2', 'Central US', 'North Europe', 'West Europe', 'Southeast Asia'];
const images = ['Ubuntu Server 22.04 LTS', 'Ubuntu Server 20.04 LTS', 'Windows Server 2022 Datacenter', 'Windows Server 2019 Datacenter', 'Red Hat Enterprise Linux 9', 'Debian 12'];
const sizes = ['Standard_B1s', 'Standard_B2s', 'Standard_DS2_v2', 'Standard_E4s_v3', 'Standard_D4s_v3'];

export default function CreateVM() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({
    name: '', resourceGroup: state.resourceGroups[0]?.name || '', subscriptionId: 'sub-001',
    location: 'East US', osImage: images[0], size: sizes[0], adminUsername: 'azureuser',
    osDiskType: 'Premium SSD', osDiskSizeGb: 30,
    virtualNetwork: state.virtualNetworks[0]?.name || '', subnet: state.virtualNetworks[0]?.subnets[0]?.name || '',
    networkSecurityGroup: state.networkSecurityGroups[0]?.name || '',
    tags: {}
  });
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleCreate = () => {
    const osType = form.osImage.includes('Windows') ? 'Windows' : 'Linux';
    dispatch({
      type: 'CREATE_VM',
      payload: {
        name: form.name,
        resourceGroup: form.resourceGroup,
        subscriptionId: form.subscriptionId,
        location: form.location,
        size: form.size,
        osType,
        osImage: form.osImage,
        publicIpAddress: null,
        privateIpAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        virtualNetwork: form.virtualNetwork,
        subnet: form.subnet,
        networkSecurityGroup: form.networkSecurityGroup,
        osDiskSizeGb: form.osDiskSizeGb,
        osDiskType: form.osDiskType,
        computerName: form.name,
        adminUsername: form.adminUsername,
        tags: form.tags,
      }
    });
    navigate('/virtual-machines');
  };

  const addTag = () => {
    if (tagKey) {
      update('tags', { ...form.tags, [tagKey]: tagValue });
      setTagKey(''); setTagValue('');
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Virtual machines', path: '/virtual-machines' }, { label: 'Create a virtual machine' }]} />
      <h1 className="page-title">Create a virtual machine</h1>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--xzure-border)', marginBottom: '24px', gap: '0' }}>
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            padding: '8px 16px', border: 'none', borderBottom: activeTab === i ? '2px solid var(--xzure-blue)' : '2px solid transparent',
            background: 'none', cursor: 'pointer', fontWeight: activeTab === i ? 600 : 400,
            color: activeTab === i ? 'var(--xzure-blue)' : 'var(--xzure-text-secondary)', fontSize: '14px'
          }}>
            {tab}
          </button>
        ))}
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        {activeTab === 0 && (
          <>
            <div className="section-header">Project details</div>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
              <label>Subscription<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.subscriptionId} onChange={e => update('subscriptionId', e.target.value)}>
                {state.subscriptions.map(s => <option key={s.id} value={s.id}>{s.displayName}</option>)}
              </select></label>
              <label>Resource group<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.resourceGroup} onChange={e => update('resourceGroup', e.target.value)}>
                {state.resourceGroups.map(rg => <option key={rg.id} value={rg.name}>{rg.name}</option>)}
              </select></label>
            </div>
            <div className="section-header">Instance details</div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <label>Virtual machine name *<input className="input" style={{ width: '100%', marginTop: '4px', borderColor: activeTab === 0 && form.name === '' && form._touched ? 'var(--xzure-error)' : undefined }} value={form.name} onChange={e => update('name', e.target.value)} placeholder="Enter name" /></label>
              <label>Region<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.location} onChange={e => update('location', e.target.value)}>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select></label>
              <div><strong>Availability options</strong>
                <select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.availabilityOption || 'No infrastructure redundancy required'} onChange={e => update('availabilityOption', e.target.value)}>
                  <option>No infrastructure redundancy required</option>
                  <option>Availability zone</option>
                  <option>Availability set</option>
                  <option>Virtual machine scale set</option>
                </select>
              </div>
              <label>Image<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.osImage} onChange={e => update('osImage', e.target.value)}>
                {images.map(img => <option key={img} value={img}>{img}</option>)}
              </select></label>
              <label>Size<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.size} onChange={e => update('size', e.target.value)}>
                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select></label>
            </div>
            <div className="section-header" style={{ marginTop: '16px' }}>Administrator account</div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div><strong>Authentication type</strong>
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                  {['SSH public key', 'Password'].map(a => (
                    <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="radio" name="authType" checked={(form.authType || 'SSH public key') === a} onChange={() => update('authType', a)} /> {a}
                    </label>
                  ))}
                </div>
              </div>
              <label>Username<input className="input" style={{ width: '100%', marginTop: '4px' }} value={form.adminUsername} onChange={e => update('adminUsername', e.target.value)} /></label>
              {(form.authType || 'SSH public key') === 'SSH public key' ? (
                <label>SSH public key source<select className="input" style={{ width: '100%', marginTop: '4px' }}>
                  <option>Generate new key pair</option>
                  <option>Use existing key stored in Xzure</option>
                  <option>Use existing public key</option>
                </select></label>
              ) : (
                <>
                  <label>Password<input type="password" className="input" style={{ width: '100%', marginTop: '4px' }} value={form.adminPassword || ''} onChange={e => update('adminPassword', e.target.value)} placeholder="12-72 chars" /></label>
                  <label>Confirm password<input type="password" className="input" style={{ width: '100%', marginTop: '4px' }} value={form.adminPasswordConfirm || ''} onChange={e => update('adminPasswordConfirm', e.target.value)} /></label>
                </>
              )}
            </div>
          </>
        )}
        {activeTab === 1 && (
          <>
            <div className="section-header">OS disk</div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <label>OS disk type<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.osDiskType} onChange={e => update('osDiskType', e.target.value)}>
                <option>Premium SSD</option><option>Standard SSD</option><option>Standard HDD</option>
              </select></label>
              <label>OS disk size (GB)<input type="number" className="input" style={{ width: '100%', marginTop: '4px' }} value={form.osDiskSizeGb} onChange={e => update('osDiskSizeGb', parseInt(e.target.value) || 30)} /></label>
            </div>
          </>
        )}
        {activeTab === 2 && (
          <>
            <div className="section-header">Network interface</div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <label>Virtual network<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.virtualNetwork} onChange={e => update('virtualNetwork', e.target.value)}>
                {state.virtualNetworks.map(vn => <option key={vn.id} value={vn.name}>{vn.name}</option>)}
              </select></label>
              <label>Subnet<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.subnet} onChange={e => update('subnet', e.target.value)}>
                {(state.virtualNetworks.find(vn => vn.name === form.virtualNetwork)?.subnets || []).map(s => <option key={s.id} value={s.name}>{s.name} ({s.addressPrefix})</option>)}
              </select></label>
              <label>NIC network security group<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.networkSecurityGroup} onChange={e => update('networkSecurityGroup', e.target.value)}>
                <option value="">None</option>
                {state.networkSecurityGroups.map(nsg => <option key={nsg.id} value={nsg.name}>{nsg.name}</option>)}
              </select></label>
            </div>
          </>
        )}
        {activeTab === 3 && (
          <>
            <div className="section-header">Management</div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Auto-shutdown</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.autoShutdown || false} onChange={e => update('autoShutdown', e.target.checked)} />
                  <span>Enable auto-shutdown</span>
                </label>
                {form.autoShutdown && (
                  <div style={{ marginTop: '8px' }}>
                    <label>Shutdown time<input className="input" style={{ width: '160px', marginLeft: '8px' }} placeholder="11:00 PM" value={form.shutdownTime || ''} onChange={e => update('shutdownTime', e.target.value)} /></label>
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Monitoring</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.monitoring !== false} onChange={e => update('monitoring', e.target.checked)} defaultChecked />
                  <span>Boot diagnostics</span>
                </label>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Identity</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.managedIdentity || false} onChange={e => update('managedIdentity', e.target.checked)} />
                  <span>System assigned managed identity</span>
                </label>
              </div>
            </div>
          </>
        )}
        {activeTab === 4 && (
          <>
            <div className="section-header">Advanced</div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Custom data</div>
                <div style={{ fontSize: '13px', color: 'var(--xzure-text-secondary)', marginBottom: '8px' }}>Pass a script or configuration to your VM on startup.</div>
                <textarea className="input" style={{ width: '100%', minHeight: '100px', fontFamily: 'monospace', fontSize: '13px' }} placeholder="#!/bin/bash&#10;# cloud-init script here" value={form.customData || ''} onChange={e => update('customData', e.target.value)} />
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Extensions</div>
                <div style={{ fontSize: '13px', color: 'var(--xzure-text-secondary)' }}>Extensions can be added after VM creation.</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Proximity placement group</div>
                <select className="input" style={{ width: '300px' }}>
                  <option>None</option>
                </select>
              </div>
            </div>
          </>
        )}
        {activeTab === 5 && (
          <>
            <div className="section-header">Tags</div>
            <table className="xzure-table" style={{ marginBottom: '12px' }}>
              <thead><tr><th>Key</th><th>Value</th><th></th></tr></thead>
              <tbody>
                {Object.entries(form.tags).map(([k, v]) => (
                  <tr key={k}>
                    <td>{k}</td><td>{v}</td>
                    <td><button className="btn-link" onClick={() => { const t = { ...form.tags }; delete t[k]; update('tags', t); }}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input className="input" placeholder="Key" value={tagKey} onChange={e => setTagKey(e.target.value)} />
              <input className="input" placeholder="Value" value={tagValue} onChange={e => setTagValue(e.target.value)} />
              <button className="btn btn-default" onClick={addTag}>Add</button>
            </div>
          </>
        )}
        {activeTab === 6 && (
          <>
            <div className="section-header">Review + Create</div>
            <div style={{ fontSize: '14px', display: 'grid', gap: '6px' }}>
              <div><strong>Subscription:</strong> {state.subscriptions.find(s => s.id === form.subscriptionId)?.displayName}</div>
              <div><strong>Resource group:</strong> {form.resourceGroup}</div>
              <div><strong>Virtual machine name:</strong> {form.name}</div>
              <div><strong>Region:</strong> {form.location}</div>
              <div><strong>Image:</strong> {form.osImage}</div>
              <div><strong>Size:</strong> {form.size}</div>
              <div><strong>OS disk type:</strong> {form.osDiskType}</div>
              <div><strong>Virtual network:</strong> {form.virtualNetwork}</div>
              <div><strong>Subnet:</strong> {form.subnet}</div>
              <div><strong>NSG:</strong> {form.networkSecurityGroup || 'None'}</div>
            </div>
            <div style={{ marginTop: '24px' }}>
              <button className="btn btn-primary" onClick={handleCreate} disabled={!form.name}>Create</button>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        {activeTab > 0 && <button className="btn btn-default" onClick={() => setActiveTab(activeTab - 1)}>&lt; Previous</button>}
        {activeTab < tabs.length - 1 && <button className="btn btn-primary" onClick={() => setActiveTab(activeTab + 1)}>Next &gt;</button>}
      </div>
    </div>
  );
}
