import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';

const regions = ['East US', 'East US 2', 'West US', 'West US 2', 'Central US', 'North Europe', 'West Europe', 'Southeast Asia'];
const tabs = ['Basics', 'Advanced', 'Networking', 'Data protection', 'Encryption', 'Tags', 'Review + Create'];

export default function CreateStorageAccount() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({
    name: '', resourceGroup: state.resourceGroups[0]?.name || '', subscriptionId: 'sub-001',
    location: 'East US', performance: 'Standard', replication: 'LRS', accessTier: 'Hot', tags: {}
  });
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleCreate = () => {
    dispatch({
      type: 'CREATE_STORAGE_ACCOUNT',
      payload: {
        name: form.name, resourceGroup: form.resourceGroup, subscriptionId: form.subscriptionId,
        location: form.location, performance: form.performance, replication: form.replication,
        accessTier: form.accessTier, primaryEndpoint: `https://${form.name}.blob.core.windows.net`, tags: form.tags
      }
    });
    navigate('/storage-accounts');
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Storage accounts', path: '/storage-accounts' }, { label: 'Create storage account' }]} />
      <h1 className="page-title">Create a storage account</h1>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--xzure-border)', marginBottom: '24px' }}>
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{
            padding: '8px 16px', border: 'none', borderBottom: activeTab === i ? '2px solid var(--xzure-blue)' : '2px solid transparent',
            background: 'none', cursor: 'pointer', fontWeight: activeTab === i ? 600 : 400,
            color: activeTab === i ? 'var(--xzure-blue)' : 'var(--xzure-text-secondary)', fontSize: '14px'
          }}>{tab}</button>
        ))}
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        {activeTab === 0 && (
          <div style={{ display: 'grid', gap: '12px' }}>
            <label>Subscription<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.subscriptionId} onChange={e => update('subscriptionId', e.target.value)}>
              {state.subscriptions.map(s => <option key={s.id} value={s.id}>{s.displayName}</option>)}
            </select></label>
            <label>Resource group<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.resourceGroup} onChange={e => update('resourceGroup', e.target.value)}>
              {state.resourceGroups.map(rg => <option key={rg.id} value={rg.name}>{rg.name}</option>)}
            </select></label>
            <label>Storage account name *<input className="input" style={{ width: '100%', marginTop: '4px' }} value={form.name} onChange={e => update('name', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))} placeholder="3-24 chars, lowercase + numbers" /></label>
            <label>Region<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.location} onChange={e => update('location', e.target.value)}>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select></label>
            <div><strong>Performance</strong>
              <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                {['Standard', 'Premium'].map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="radio" checked={form.performance === p} onChange={() => update('performance', p)} /> {p}
                  </label>
                ))}
              </div>
            </div>
            <label>Redundancy<select className="input" style={{ width: '100%', marginTop: '4px' }} value={form.replication} onChange={e => update('replication', e.target.value)}>
              <option value="LRS">Locally-redundant storage (LRS)</option>
              <option value="GRS">Geo-redundant storage (GRS)</option>
              <option value="ZRS">Zone-redundant storage (ZRS)</option>
              <option value="RA-GRS">Read-access geo-redundant storage (RA-GRS)</option>
            </select></label>
          </div>
        )}
        {activeTab === 1 && (
          <div style={{ display: 'grid', gap: '12px' }}>
            <div><strong>Access tier</strong>
              <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                {['Hot', 'Cool'].map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="radio" checked={form.accessTier === t} onChange={() => update('accessTier', t)} /> {t}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 2 && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div className="section-header">Network connectivity</div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Connectivity method</div>
              {['Public endpoint (all networks)', 'Public endpoint (selected networks)', 'Private endpoint'].map(method => (
                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="connectivity" value={method} checked={(form.connectivityMethod || 'Public endpoint (all networks)') === method} onChange={() => update('connectivityMethod', method)} />
                  <span style={{ fontSize: '14px' }}>{method}</span>
                </label>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Routing preference</div>
              {['Microsoft network routing', 'Internet routing'].map(rp => (
                <label key={rp} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="routing" value={rp} checked={(form.routingPreference || 'Microsoft network routing') === rp} onChange={() => update('routingPreference', rp)} />
                  <span style={{ fontSize: '14px' }}>{rp}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {activeTab === 3 && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div className="section-header">Data protection</div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.softDeleteBlobs !== false} onChange={e => update('softDeleteBlobs', e.target.checked)} />
                <span>Enable soft delete for blobs</span>
              </label>
              {form.softDeleteBlobs !== false && (
                <div style={{ marginLeft: '24px', marginBottom: '8px' }}>
                  <label>Days to retain deleted blobs:&nbsp;
                    <input className="input" type="number" min="1" max="365" style={{ width: '80px' }} value={form.softDeleteDays || 7} onChange={e => update('softDeleteDays', parseInt(e.target.value) || 7)} />
                  </label>
                </div>
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.softDeleteContainers !== false} onChange={e => update('softDeleteContainers', e.target.checked)} />
                <span>Enable soft delete for containers</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.blobVersioning || false} onChange={e => update('blobVersioning', e.target.checked)} />
                <span>Enable versioning for blobs</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.blobChangeTracking || false} onChange={e => update('blobChangeTracking', e.target.checked)} />
                <span>Enable blob change feed</span>
              </label>
            </div>
          </div>
        )}
        {activeTab === 4 && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div className="section-header">Encryption</div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Encryption type</div>
              {['Microsoft-managed keys (MMK)', 'Customer-managed keys (CMK)', 'Double encryption with platform-managed and customer-managed keys'].map(enc => (
                <label key={enc} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="encryption" value={enc} checked={(form.encryptionType || 'Microsoft-managed keys (MMK)') === enc} onChange={() => update('encryptionType', enc)} />
                  <span style={{ fontSize: '14px' }}>{enc}</span>
                </label>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Enable infrastructure encryption</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.infraEncryption || false} onChange={e => update('infraEncryption', e.target.checked)} />
                <span style={{ fontSize: '14px' }}>Enable support for double encryption on data at rest</span>
              </label>
            </div>
          </div>
        )}
        {activeTab === 5 && (
          <>
            <div className="section-header">Tags</div>
            <table className="xzure-table" style={{ marginBottom: '12px' }}>
              <thead><tr><th>Key</th><th>Value</th><th></th></tr></thead>
              <tbody>
                {Object.entries(form.tags).map(([k, v]) => (
                  <tr key={k}><td>{k}</td><td>{v}</td><td><button className="btn-link" onClick={() => { const t = { ...form.tags }; delete t[k]; update('tags', t); }}>Remove</button></td></tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="input" placeholder="Key" value={tagKey} onChange={e => setTagKey(e.target.value)} />
              <input className="input" placeholder="Value" value={tagValue} onChange={e => setTagValue(e.target.value)} />
              <button className="btn btn-default" onClick={() => { if (tagKey) { update('tags', { ...form.tags, [tagKey]: tagValue }); setTagKey(''); setTagValue(''); } }}>Add</button>
            </div>
          </>
        )}
        {activeTab === 6 && (
          <>
            <div className="section-header">Review + Create</div>
            <div style={{ fontSize: '14px', display: 'grid', gap: '6px' }}>
              <div><strong>Storage account name:</strong> {form.name}</div>
              <div><strong>Resource group:</strong> {form.resourceGroup}</div>
              <div><strong>Location:</strong> {form.location}</div>
              <div><strong>Performance:</strong> {form.performance}</div>
              <div><strong>Redundancy:</strong> {form.replication}</div>
              <div><strong>Access tier:</strong> {form.accessTier}</div>
            </div>
            <div style={{ marginTop: '24px' }}><button className="btn btn-primary" onClick={handleCreate} disabled={!form.name || form.name.length < 3}>Create</button></div>
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
