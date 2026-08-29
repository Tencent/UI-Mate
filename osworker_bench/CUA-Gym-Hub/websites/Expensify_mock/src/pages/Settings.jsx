import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, Plus, Trash2 } from 'lucide-react';

const settingsTabs = [
  { key: 'basics', label: 'Basics' },
  { key: 'connections', label: 'Connections' },
  { key: 'categories', label: 'Categories' },
  { key: 'tags', label: 'Tags' },
  { key: 'people', label: 'People' },
  { key: 'distance', label: 'Distance and Time' },
  { key: 'reportfields', label: 'Report Fields' },
  { key: 'tax', label: 'Tax' },
  { key: 'exportformats', label: 'Export Formats' },
];

export default function Settings() {
  const { policyId, tab } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const qsStr = qs ? '?' + qs : '';

  const policy = state.policies.find(p => p.id === policyId) || state.policies[0];
  if (!policy) return <div>No policy found</div>;

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Settings</h1></div>
      <div className="settings-layout">
        <div className="settings-subnav">
          <div className="settings-subnav-title"><Menu size={16} /> {policy.name}</div>
          {settingsTabs.map(t => (
            <NavLink
              key={t.key}
              to={'/settings/workspace/' + policyId + '/' + t.key + qsStr}
              className={'settings-subnav-link' + (tab === t.key ? ' active' : '')}
            >
              {t.label}
            </NavLink>
          ))}
        </div>
        <div className="settings-content">
          {tab === 'basics' && <BasicsTab policy={policy} dispatch={dispatch} />}
          {tab === 'connections' && <ConnectionsTab />}
          {tab === 'categories' && <CategoriesTab state={state} dispatch={dispatch} policy={policy} />}
          {tab === 'tags' && <TagsTab state={state} dispatch={dispatch} policy={policy} />}
          {tab === 'people' && <PeopleTab state={state} dispatch={dispatch} policy={policy} />}
          {tab === 'distance' && <DistanceTab state={state} dispatch={dispatch} policy={policy} />}
          {tab === 'reportfields' && <ReportFieldsTab state={state} dispatch={dispatch} policy={policy} />}
          {tab === 'tax' && <TaxTab state={state} dispatch={dispatch} policy={policy} />}
          {tab === 'exportformats' && <ExportFormatsTab />}
        </div>
      </div>
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <label className="toggle-switch" onClick={onChange}>
      <div className={'toggle-track' + (value ? ' on' : '')}><div className="toggle-thumb" /></div>
      <span>{label}</span>
    </label>
  );
}

function BasicsTab({ policy, dispatch }) {
  const [form, setForm] = useState({ ...policy });
  const [saved_, setSaved_] = useState(false);
  const handleSave = () => {
    dispatch({ type: 'UPDATE_POLICY', payload: { id: policy.id, ...form } });
    setSaved_(true);
    setTimeout(() => setSaved_(false), 2500);
  };
  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Basics</h2>
      <div className="form-group">
        <label className="form-label">Workspace Name</label>
        <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Output Currency</label>
        <select className="form-select" value={form.outputCurrency} onChange={e => setForm({ ...form, outputCurrency: e.target.value })}>
          {['USD','EUR','GBP','CAD','AUD','JPY'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Toggle value={form.autoReporting} onChange={() => setForm({ ...form, autoReporting: !form.autoReporting })} label="Auto-Reporting" />
        {form.autoReporting && (
          <select className="form-select" style={{ width: 160 }} value={form.autoReportingFrequency} onChange={e => setForm({ ...form, autoReportingFrequency: e.target.value })}>
            {['daily','weekly','monthly','trip','manual'].map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>)}
          </select>
        )}
      </div>
      <div className="form-group"><Toggle value={form.requiresCategory} onChange={() => setForm({ ...form, requiresCategory: !form.requiresCategory })} label="Require Category" /></div>
      <div className="form-group"><Toggle value={form.requiresTag} onChange={() => setForm({ ...form, requiresTag: !form.requiresTag })} label="Require Tag" /></div>
      <div className="form-group"><Toggle value={form.requiresComment} onChange={() => setForm({ ...form, requiresComment: !form.requiresComment })} label="Require Comments" /></div>
      <div className="form-row">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Max Expense Age (days)</label>
          <input className="form-input" type="number" value={form.maxExpenseAge} onChange={e => setForm({ ...form, maxExpenseAge: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Max Expense Amount ($)</label>
          <input className="form-input" type="number" value={form.maxExpenseAmount} onChange={e => setForm({ ...form, maxExpenseAmount: parseInt(e.target.value) || 0 })} />
        </div>
      </div>
      <div className="form-group"><Toggle value={form.preventSelfApproval} onChange={() => setForm({ ...form, preventSelfApproval: !form.preventSelfApproval })} label="Prevent Self-Approval" /></div>
      <div className="form-group">
        <label className="form-label">Approval Mode</label>
        <div style={{ display: 'flex', gap: 16 }}>
          {['basic','advanced'].map(m => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" name="approvalMode" checked={form.approvalMode === m} onChange={() => setForm({ ...form, approvalMode: m })} />
              {m.charAt(0).toUpperCase()+m.slice(1)}
            </label>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Reimbursement</label>
        <div style={{ display: 'flex', gap: 16 }}>
          {[['reimburseManual','Manual'],['reimburseACH','ACH'],['noReimbursement','No Reimbursement']].map(([v,l]) => (
            <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" name="reimbursement" checked={form.reimbursementChoice === v} onChange={() => setForm({ ...form, reimbursementChoice: v })} />
              {l}
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={handleSave}>Save</button>
        {saved_ && <span style={{ color: '#03D47C', fontSize: 13, fontWeight: 600, marginTop: 8 }}>Saved!</span>}
      </div>
    </div>
  );
}

function ConnectionsTab() {
  const [modal, setModal] = useState(null);
  const integrations = [
    { name: 'QuickBooks Online', desc: 'Sync expenses and reports with QuickBooks' },
    { name: 'Xero', desc: 'Export expenses directly to Xero' },
    { name: 'NetSuite', desc: 'Integrate with Oracle NetSuite ERP' },
    { name: 'Sage Intacct', desc: 'Connect to Sage Intacct for advanced accounting' },
  ];
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Connections</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {integrations.map(i => (
          <div key={i.name} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 20 }}>
            <div style={{ width: 48, height: 48, background: '#F0F2F5', borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#8B959E', fontSize: 12 }}>{i.name.slice(0,2).toUpperCase()}</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{i.name}</div>
            <div style={{ fontSize: 13, color: '#8B959E', marginBottom: 12 }}>{i.desc}</div>
            <button className="btn btn-outline" onClick={() => setModal(i.name)}>Connect</button>
          </div>
        ))}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-card" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: 32 }}>
              <p style={{ fontSize: 16, marginBottom: 16 }}>Connection simulated -- this is a mock environment.</p>
              <button className="btn btn-primary" onClick={() => setModal(null)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoriesTab({ state, dispatch, policy }) {
  const categories = state.categories.filter(c => c.policyId === policy.id);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGl, setNewGl] = useState('');
  const [newPayroll, setNewPayroll] = useState('');
  const handleAdd = () => {
    if (!newName.trim()) return;
    dispatch({ type: 'ADD_CATEGORY', payload: {
      id: 'cat_' + Date.now(), policyId: policy.id, name: newName, enabled: true,
      glCode: newGl, payrollCode: newPayroll, maxExpenseAmount: 0, requiresComment: false, commentHint: '', externalId: ''
    }});
    setNewName(''); setNewGl(''); setNewPayroll(''); setAdding(false);
  };
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Categories</h2>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
        <input type="checkbox" checked={policy.requiresCategory} onChange={() => dispatch({ type: 'UPDATE_POLICY', payload: { id: policy.id, requiresCategory: !policy.requiresCategory } })} />
        People must categorize expenses
      </label>
      <table className="data-table">
        <thead><tr><th style={{ width: 50 }}>Enabled</th><th>Name</th><th>GL Code</th><th>Payroll Code</th></tr></thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id} style={{ cursor: 'default' }}>
              <td>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: cat.enabled ? '#03D47C' : '#C4C9D1', cursor: 'pointer' }}
                  onClick={() => dispatch({ type: 'UPDATE_CATEGORY', payload: { id: cat.id, enabled: !cat.enabled } })} />
              </td>
              <td>{cat.name}</td>
              <td><input className="form-input" style={{ border: 'none', padding: '4px 0', background: 'transparent' }} value={cat.glCode} onChange={e => dispatch({ type: 'UPDATE_CATEGORY', payload: { id: cat.id, glCode: e.target.value } })} /></td>
              <td><input className="form-input" style={{ border: 'none', padding: '4px 0', background: 'transparent' }} value={cat.payrollCode} onChange={e => dispatch({ type: 'UPDATE_CATEGORY', payload: { id: cat.id, payrollCode: e.target.value } })} /></td>
            </tr>
          ))}
          {adding && (
            <tr>
              <td></td>
              <td><input className="form-input" placeholder="Category name" value={newName} onChange={e => setNewName(e.target.value)} /></td>
              <td><input className="form-input" placeholder="GL Code" value={newGl} onChange={e => setNewGl(e.target.value)} /></td>
              <td><div style={{ display: 'flex', gap: 8 }}><input className="form-input" placeholder="Payroll" value={newPayroll} onChange={e => setNewPayroll(e.target.value)} /><button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={handleAdd}>Add</button></div></td>
            </tr>
          )}
        </tbody>
      </table>
      {!adding && <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => setAdding(true)}><Plus size={14} /> Add Category</button>}
    </div>
  );
}

function TagsTab({ state, dispatch, policy }) {
  const tags = state.tags.filter(t => t.policyId === policy.id);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGl, setNewGl] = useState('');
  const handleAdd = () => {
    if (!newName.trim()) return;
    dispatch({ type: 'ADD_TAG', payload: {
      id: 'tag_' + Date.now(), policyId: policy.id, name: newName, enabled: true, glCode: newGl, required: false
    }});
    setNewName(''); setNewGl(''); setAdding(false);
  };
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Tags</h2>
      <table className="data-table">
        <thead><tr><th style={{ width: 50 }}>Enabled</th><th>Name</th><th>GL Code</th></tr></thead>
        <tbody>
          {tags.map(tag => (
            <tr key={tag.id} style={{ cursor: 'default' }}>
              <td><div style={{ width: 20, height: 20, borderRadius: '50%', background: tag.enabled ? '#03D47C' : '#C4C9D1', cursor: 'pointer' }} onClick={() => dispatch({ type: 'UPDATE_TAG', payload: { id: tag.id, enabled: !tag.enabled } })} /></td>
              <td>{tag.name}</td>
              <td><input className="form-input" style={{ border: 'none', padding: '4px 0', background: 'transparent' }} value={tag.glCode} onChange={e => dispatch({ type: 'UPDATE_TAG', payload: { id: tag.id, glCode: e.target.value } })} /></td>
            </tr>
          ))}
          {adding && (
            <tr>
              <td></td>
              <td><input className="form-input" placeholder="Tag name" value={newName} onChange={e => setNewName(e.target.value)} /></td>
              <td><div style={{ display: 'flex', gap: 8 }}><input className="form-input" placeholder="GL Code" value={newGl} onChange={e => setNewGl(e.target.value)} /><button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={handleAdd}>Add</button></div></td>
            </tr>
          )}
        </tbody>
      </table>
      {!adding && <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => setAdding(true)}><Plus size={14} /> Add Tag</button>}
    </div>
  );
}

function PeopleTab({ state, dispatch, policy }) {
  const members = state.members.filter(m => m.policyId === policy.id);
  const [inviting, setInviting] = useState(false);
  const [invEmail, setInvEmail] = useState('');
  const [invRole, setInvRole] = useState('member');
  const handleInvite = () => {
    if (!invEmail.trim()) return;
    dispatch({ type: 'ADD_MEMBER', payload: {
      id: 'mem_' + Date.now(), userId: 'usr_new_' + Date.now(), policyId: policy.id,
      email: invEmail, name: invEmail.split('@')[0], role: invRole,
      managerId: null, managerEmail: null, employeeId: '', submitsTo: null, approvesTo: null,
      isApprover: invRole === 'admin', addedAt: new Date().toISOString()
    }});
    setInvEmail(''); setInvRole('member'); setInviting(false);
  };
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>People</h2>
      <table className="data-table">
        <thead><tr><th style={{ width: 40 }}></th><th>Name</th><th>Email</th><th>Role</th><th>Manager</th><th>Employee ID</th></tr></thead>
        <tbody>
          {members.map(m => (
            <tr key={m.id} style={{ cursor: 'default' }}>
              <td><div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E85E95', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 600 }}>{(m.name || '?')[0]}</div></td>
              <td>{m.name}</td>
              <td style={{ fontSize: 13 }}>{m.email}</td>
              <td><select className="form-select" style={{ width: 110, padding: '4px 6px', fontSize: 13 }} value={m.role} onChange={e => dispatch({ type: 'UPDATE_MEMBER', payload: { id: m.id, role: e.target.value } })}><option value="admin">Admin</option><option value="member">Member</option><option value="auditor">Auditor</option></select></td>
              <td><select className="form-select" style={{ width: 140, padding: '4px 6px', fontSize: 13 }} value={m.managerId || ''} onChange={e => dispatch({ type: 'UPDATE_MEMBER', payload: { id: m.id, managerId: e.target.value || null } })}><option value="">None</option>{members.filter(x => x.id !== m.id).map(x => <option key={x.id} value={x.userId}>{x.name}</option>)}</select></td>
              <td style={{ fontSize: 13 }}>{m.employeeId}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {inviting ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <input className="form-input" style={{ flex: 1 }} placeholder="Email address" value={invEmail} onChange={e => setInvEmail(e.target.value)} />
          <select className="form-select" style={{ width: 110 }} value={invRole} onChange={e => setInvRole(e.target.value)}><option value="admin">Admin</option><option value="member">Member</option><option value="auditor">Auditor</option></select>
          <button className="btn btn-primary" onClick={handleInvite}>Send Invite</button>
          <button className="btn btn-outline" onClick={() => setInviting(false)}>Cancel</button>
        </div>
      ) : (
        <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => setInviting(true)}><Plus size={14} /> Invite</button>
      )}
    </div>
  );
}

function DistanceTab({ state, dispatch, policy }) {
  const rates = state.distanceRates.filter(r => r.policyId === policy.id);
  const [editRate, setEditRate] = useState(rates[0] ? { ...rates[0] } : null);
  const handleSave = () => {
    if (!editRate) return;
    const updated = state.distanceRates.map(r => r.id === editRate.id ? editRate : r);
    dispatch({ type: 'SET_STATE', payload: { distanceRates: updated } });
  };
  return (
    <div style={{ maxWidth: 500 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Distance and Time</h2>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Distance Rates</h3>
      {editRate && (
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Rate (cents per unit)</label>
              <input className="form-input" type="number" value={editRate.rate} onChange={e => setEditRate({ ...editRate, rate: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="form-group" style={{ width: 80 }}>
              <label className="form-label">Unit</label>
              <select className="form-select" value={editRate.unit} onChange={e => setEditRate({ ...editRate, unit: e.target.value })}><option value="mi">mi</option><option value="km">km</option></select>
            </div>
          </div>
          <Toggle value={editRate.enabled} onChange={() => setEditRate({ ...editRate, enabled: !editRate.enabled })} label="Enabled" />
        </div>
      )}
      <button className="btn btn-primary" onClick={handleSave}>Save</button>
    </div>
  );
}

function ReportFieldsTab({ state, dispatch, policy }) {
  const fields = state.reportFields.filter(f => f.policyId === policy.id);
  const [adding, setAdding] = useState(false);
  const [newField, setNewField] = useState({ name: '', type: 'text', required: false, values: '' });
  const handleAdd = () => {
    if (!newField.name.trim()) return;
    const updated = [...state.reportFields, {
      id: 'rf_' + Date.now(), policyId: policy.id, name: newField.name, type: newField.type,
      values: newField.type === 'dropdown' ? newField.values.split(',').map(v => v.trim()).filter(Boolean) : [],
      required: newField.required, defaultValue: ''
    }];
    dispatch({ type: 'SET_STATE', payload: { reportFields: updated } });
    setNewField({ name: '', type: 'text', required: false, values: '' }); setAdding(false);
  };
  const handleDelete = (rfId) => {
    const updated = state.reportFields.filter(f => f.id !== rfId);
    dispatch({ type: 'SET_STATE', payload: { reportFields: updated } });
  };
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Report Fields</h2>
      {fields.map(f => (
        <div key={f.id} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{f.name} <span style={{ fontSize: 12, color: '#8B959E', fontWeight: 400 }}>({f.type})</span></div>
            {f.required && <span style={{ fontSize: 12, color: '#D93025' }}>Required</span>}
            {f.type === 'dropdown' && f.values.length > 0 && <div style={{ fontSize: 12, color: '#8B959E', marginTop: 4 }}>Values: {f.values.join(', ')}</div>}
          </div>
          <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => handleDelete(f.id)}><Trash2 size={14} /></button>
        </div>
      ))}
      {adding ? (
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 16 }}>
          <div className="form-group"><label className="form-label">Field Name</label><input className="form-input" value={newField.name} onChange={e => setNewField({ ...newField, name: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Type</label>
              <select className="form-select" value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value })}><option value="text">Text</option><option value="dropdown">Dropdown</option><option value="date">Date</option></select>
            </div>
            <div className="form-group"><Toggle value={newField.required} onChange={() => setNewField({ ...newField, required: !newField.required })} label="Required" /></div>
          </div>
          {newField.type === 'dropdown' && <div className="form-group"><label className="form-label">Values (comma-separated)</label><textarea className="form-textarea" rows={2} value={newField.values} onChange={e => setNewField({ ...newField, values: e.target.value })} /></div>}
          <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-primary" onClick={handleAdd}>Add Field</button><button className="btn btn-outline" onClick={() => setAdding(false)}>Cancel</button></div>
        </div>
      ) : (
        <button className="btn btn-outline" onClick={() => setAdding(true)}><Plus size={14} /> Add Field</button>
      )}
    </div>
  );
}

function TaxTab({ state, dispatch, policy }) {
  const taxes = state.taxRates.filter(t => t.policyId === policy.id);
  const [adding, setAdding] = useState(false);
  const [newTax, setNewTax] = useState({ name: '', rate: 0 });
  const handleAdd = () => {
    if (!newTax.name.trim()) return;
    const updated = [...state.taxRates, {
      id: 'tax_' + Date.now(), policyId: policy.id, name: newTax.name, rate: parseFloat(newTax.rate) || 0,
      isDefault: false, enabled: true
    }];
    dispatch({ type: 'SET_STATE', payload: { taxRates: updated } });
    setNewTax({ name: '', rate: 0 }); setAdding(false);
  };
  const setDefault = (taxId) => {
    const updated = state.taxRates.map(t => ({ ...t, isDefault: t.id === taxId }));
    dispatch({ type: 'SET_STATE', payload: { taxRates: updated } });
  };
  const toggleEnabled = (taxId) => {
    const updated = state.taxRates.map(t => t.id === taxId ? { ...t, enabled: !t.enabled } : t);
    dispatch({ type: 'SET_STATE', payload: { taxRates: updated } });
  };
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Tax</h2>
      <table className="data-table">
        <thead><tr><th>Name</th><th>Rate (%)</th><th>Default</th><th>Enabled</th></tr></thead>
        <tbody>
          {taxes.map(t => (
            <tr key={t.id} style={{ cursor: 'default' }}>
              <td>{t.name}</td>
              <td>{t.rate}%</td>
              <td><input type="radio" name="defaultTax" checked={t.isDefault} onChange={() => setDefault(t.id)} /></td>
              <td><div style={{ width: 20, height: 20, borderRadius: '50%', background: t.enabled ? '#03D47C' : '#C4C9D1', cursor: 'pointer' }} onClick={() => toggleEnabled(t.id)} /></td>
            </tr>
          ))}
          {adding && (
            <tr>
              <td><input className="form-input" placeholder="Name" value={newTax.name} onChange={e => setNewTax({ ...newTax, name: e.target.value })} /></td>
              <td><input className="form-input" type="number" step="0.01" value={newTax.rate} onChange={e => setNewTax({ ...newTax, rate: e.target.value })} /></td>
              <td></td>
              <td><button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={handleAdd}>Add</button></td>
            </tr>
          )}
        </tbody>
      </table>
      {!adding && <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => setAdding(true)}><Plus size={14} /> Add Tax Rate</button>}
    </div>
  );
}

function ExportFormatsTab() {
  const { state, dispatch } = useApp();
  const saved = state.exportSettings || { format: 'csv', template: '${date},${merchant},${amount},${category},${tag},${description}' };
  const [format, setFormat] = useState(saved.format || 'csv');
  const [template, setTemplate] = useState(saved.template || '${date},${merchant},${amount},${category},${tag},${description}');
  const [saved_, setSaved_] = useState(false);

  // Dynamic preview: render template with sample data
  const sampleData = { date: '2024-11-15', merchant: 'United Airlines', amount: '456.00', category: 'Travel: Airfare', tag: 'Project Alpha', description: 'Flight SFO to NYC' };
  const previewLine = template.replace(/\$\{(\w+)\}/g, (_, key) => sampleData[key] || '');

  const handleSave = () => {
    dispatch({ type: 'UPDATE_EXPORT_SETTINGS', payload: { format, template } });
    setSaved_(true);
    setTimeout(() => setSaved_(false), 2500);
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Export Formats</h2>
      <div className="form-group">
        <label className="form-label">Default Format</label>
        <div style={{ display: 'flex', gap: 16 }}>
          {['csv','pdf'].map(f => (
            <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" name="exportFormat" checked={format === f} onChange={() => setFormat(f)} />
              Default {f.toUpperCase()}
            </label>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Export Template</label>
        <textarea className="form-textarea" rows={6} value={template} onChange={e => setTemplate(e.target.value)} style={{ fontFamily: 'monospace', fontSize: 12 }} />
        <div style={{ fontSize: 11, color: '#8B959E', marginTop: 4 }}>Available variables: {'{$'}{'{date}'}, {'{$'}{'{merchant}'}, {'{$'}{'{amount}'}, {'{$'}{'{category}'}, {'{$'}{'{tag}'}, {'{$'}{'{description}'}</div>
      </div>
      <div className="form-group">
        <label className="form-label">Preview</label>
        <pre style={{ background: '#F5F7F9', border: '1px solid var(--border-color)', borderRadius: 4, padding: 12, fontSize: 11, whiteSpace: 'pre-wrap' }}>{previewLine}</pre>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
        {saved_ && <span style={{ color: '#03D47C', fontSize: 13, fontWeight: 600 }}>Saved!</span>}
      </div>
    </div>
  );
}
