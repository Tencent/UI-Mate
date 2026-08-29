import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Breadcrumb from '../components/Breadcrumb';
import { Plus, Trash2, X } from 'lucide-react';

const protocols = ['TCP', 'UDP', '*'];
const accessOptions = ['Allow', 'Deny'];

export default function NsgDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppContext();
  const [activeTab, setActiveTab] = useState('inbound');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    priority: '',
    protocol: 'TCP',
    sourcePortRange: '*',
    destinationPortRange: '',
    sourceAddressPrefix: '*',
    destinationAddressPrefix: '*',
    access: 'Allow',
    description: ''
  });
  const [nameError, setNameError] = useState('');

  const nsg = state.networkSecurityGroups.find(n => n.id === id);
  if (!nsg) return <div style={{ padding: '24px' }}>NSG not found.</div>;

  const rules = activeTab === 'inbound' ? nsg.inboundRules : nsg.outboundRules;
  const direction = activeTab === 'inbound' ? 'Inbound' : 'Outbound';

  const handleAddRule = () => {
    if (!newRule.name.trim()) {
      setNameError('Rule name is required.');
      return;
    }
    if (rules.find(r => r.name === newRule.name.trim())) {
      setNameError('A rule with this name already exists.');
      return;
    }
    const priority = parseInt(newRule.priority);
    if (isNaN(priority) || priority < 100 || priority > 4096) {
      setNameError('Priority must be a number between 100 and 4096.');
      return;
    }
    if (!newRule.destinationPortRange.trim()) {
      setNameError('Destination port range is required.');
      return;
    }
    dispatch({
      type: 'ADD_NSG_RULE',
      payload: {
        nsgId: nsg.id,
        direction,
        rule: {
          name: newRule.name.trim(),
          priority,
          direction,
          access: newRule.access,
          protocol: newRule.protocol,
          sourcePortRange: newRule.sourcePortRange || '*',
          destinationPortRange: newRule.destinationPortRange.trim(),
          sourceAddressPrefix: newRule.sourceAddressPrefix || '*',
          destinationAddressPrefix: newRule.destinationAddressPrefix || '*',
          description: newRule.description
        }
      }
    });
    setNewRule({
      name: '', priority: '', protocol: 'TCP', sourcePortRange: '*',
      destinationPortRange: '', sourceAddressPrefix: '*',
      destinationAddressPrefix: '*', access: 'Allow', description: ''
    });
    setNameError('');
    setShowAddForm(false);
  };

  const handleDeleteRule = (ruleName) => {
    dispatch({
      type: 'DELETE_NSG_RULE',
      payload: { nsgId: nsg.id, ruleName, direction }
    });
  };

  const sub = state.subscriptions.find(s => s.id === nsg.subscriptionId) || state.subscriptions[0];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Network security groups', path: '/network-security-groups' }, { label: nsg.name }]} />
      <h1 className="page-title">{nsg.name}</h1>
      <div style={{ fontSize: '13px', color: 'var(--xzure-text-secondary)', marginBottom: '16px' }}>Network security group</div>

      {/* Essentials */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="section-header" style={{ marginBottom: '12px' }}>Essentials</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
          <div><strong>Resource group:</strong> <Link to={`/resource-groups/${nsg.resourceGroup}`} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{nsg.resourceGroup}</Link></div>
          <div><strong>Location:</strong> {nsg.location}</div>
          <div><strong>Subscription:</strong> <Link to={`/subscriptions/${sub?.id}`} style={{ color: 'var(--xzure-blue)', textDecoration: 'none' }}>{sub?.displayName}</Link></div>
          <div><strong>Subscription ID:</strong> {sub?.subscriptionId}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--xzure-border)', marginBottom: '16px' }}>
        {['inbound', 'outbound'].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setShowAddForm(false); }} style={{
            padding: '8px 16px', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--xzure-blue)' : '2px solid transparent',
            background: 'none', cursor: 'pointer', fontWeight: activeTab === tab ? 600 : 400,
            color: activeTab === tab ? 'var(--xzure-blue)' : 'var(--xzure-text-secondary)', fontSize: '14px', textTransform: 'capitalize'
          }}>{tab} security rules</button>
        ))}
      </div>

      <div className="command-bar" style={{ marginBottom: '12px' }}>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={14} /> Add
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '16px', maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>Add {direction.toLowerCase()} security rule</div>
            <button onClick={() => { setShowAddForm(false); setNameError(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={16} /></button>
          </div>

          {nameError && (
            <div style={{ color: 'var(--xzure-error)', fontSize: '13px', marginBottom: '12px', padding: '8px 12px', background: '#fde8e8', borderRadius: '2px' }}>{nameError}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Name *</label>
              <input className="input" style={{ width: '100%' }} placeholder="Rule name" value={newRule.name}
                onChange={e => { setNewRule(r => ({ ...r, name: e.target.value })); setNameError(''); }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Priority *</label>
              <input className="input" style={{ width: '100%' }} placeholder="100-4096" value={newRule.priority}
                onChange={e => setNewRule(r => ({ ...r, priority: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Protocol</label>
              <select className="input" style={{ width: '100%' }} value={newRule.protocol}
                onChange={e => setNewRule(r => ({ ...r, protocol: e.target.value }))}>
                {protocols.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Action</label>
              <select className="input" style={{ width: '100%' }} value={newRule.access}
                onChange={e => setNewRule(r => ({ ...r, access: e.target.value }))}>
                {accessOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Source</label>
              <input className="input" style={{ width: '100%' }} placeholder="* or CIDR" value={newRule.sourceAddressPrefix}
                onChange={e => setNewRule(r => ({ ...r, sourceAddressPrefix: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Source port ranges</label>
              <input className="input" style={{ width: '100%' }} placeholder="*" value={newRule.sourcePortRange}
                onChange={e => setNewRule(r => ({ ...r, sourcePortRange: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Destination</label>
              <input className="input" style={{ width: '100%' }} placeholder="* or CIDR" value={newRule.destinationAddressPrefix}
                onChange={e => setNewRule(r => ({ ...r, destinationAddressPrefix: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Destination port ranges *</label>
              <input className="input" style={{ width: '100%' }} placeholder="80, 443, 8080-8090" value={newRule.destinationPortRange}
                onChange={e => setNewRule(r => ({ ...r, destinationPortRange: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Description</label>
              <input className="input" style={{ width: '100%' }} placeholder="Optional description" value={newRule.description}
                onChange={e => setNewRule(r => ({ ...r, description: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={handleAddRule}>Add</button>
            <button className="btn btn-default" onClick={() => { setShowAddForm(false); setNameError(''); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <table className="xzure-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Name</th>
              <th>Port</th>
              <th>Protocol</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Action</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--xzure-text-secondary)' }}>No rules configured</td></tr>
            )}
            {rules.map((r, i) => (
              <tr key={i}>
                <td>{r.priority}</td>
                <td>{r.name}</td>
                <td>{r.destinationPortRange}</td>
                <td>{r.protocol}</td>
                <td>{r.sourceAddressPrefix}</td>
                <td>{r.destinationAddressPrefix}</td>
                <td><span className={`badge ${r.access === 'Allow' ? 'badge-success' : 'badge-error'}`}>{r.access}</span></td>
                <td>
                  <button
                    className="btn btn-default"
                    style={{ padding: '2px 8px', minHeight: '26px' }}
                    onClick={() => handleDeleteRule(r.name)}
                    title="Delete rule"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
