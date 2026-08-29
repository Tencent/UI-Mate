import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getUserDisplayName } from '../utils/dataManager';
import { ArrowLeft } from 'lucide-react';

const CLASS_LABELS = {
  'cmdb_ci_server': 'Server', 'cmdb_ci_database': 'Database', 'cmdb_ci_app_server': 'Application Server', 'cmdb_ci_netgear': 'Network',
};

export default function CMDBDetail() {
  const { state, dispatch } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';

  const ci = state.cmdbItems.find(c => c.sys_id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(ci ? { ...ci } : null);
  const [activeTab, setActiveTab] = useState('related_incidents');

  if (!ci) return <div className="sn-page-body"><p>Configuration item not found. <a onClick={() => navigate('/cmdb/list' + sp)}>Back to list</a></p></div>;

  // Related records
  const relatedIncidents = state.incidents.filter(i => i.cmdb_ci === ci.sys_id);
  const relatedProblems = state.problems.filter(p => p.cmdb_ci === ci.sys_id);
  const relatedChanges = state.changeRequests.filter(c => c.cmdb_ci === ci.sys_id);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = () => {
    if (!form.name.trim()) { alert('Name is required.'); return; }
    dispatch({ type: 'UPDATE_CMDB_ITEM', payload: form });
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({ ...ci });
    setEditing(false);
  };

  const userOptions = state.users.map(u => ({ value: u.sys_id, label: `${u.first_name} ${u.last_name}` }));

  const fieldRow = (label, field, readOnly = false) => (
    <div className="sn-form-row" key={field}>
      <label className="sn-form-label">{label}</label>
      <div className="sn-form-field">
        {editing && !readOnly ? (
          <input className="sn-form-input" value={form[field] || ''} onChange={e => update(field, e.target.value)} />
        ) : (
          <span style={{ fontSize: 13 }}>{ci[field] || '\u2014'}</span>
        )}
      </div>
    </div>
  );

  const selectRow = (label, field, options) => (
    <div className="sn-form-row" key={field}>
      <label className="sn-form-label">{label}</label>
      <div className="sn-form-field">
        {editing ? (
          <select className="sn-form-select" value={form[field] || ''} onChange={e => update(field, e.target.value)}>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <span style={{ fontSize: 13 }}>{ci[field] || '\u2014'}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="sn-page">
      <div className="sn-form-header">
        <div className="sn-form-header-left">
          <button className="sn-form-back" onClick={() => navigate('/cmdb/list' + sp)}><ArrowLeft size={18} /></button>
          <h1 className="sn-page-title" style={{ fontSize: 16 }}>{ci.name}</h1>
          <span style={{ fontSize: 13, color: '#666', marginLeft: 8 }}>{CLASS_LABELS[ci.sys_class_name] || ci.sys_class_name}</span>
        </div>
        <div className="sn-form-header-right">
          {editing ? (
            <>
              <button className="sn-btn sn-btn-primary" onClick={handleSave}>Save</button>
              <button className="sn-btn" onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <button className="sn-btn" onClick={() => setEditing(true)}>Edit</button>
          )}
        </div>
      </div>

      <div className="sn-form-body">
        <div className="sn-form-grid">
          <div>
            {fieldRow('Name', 'name')}
            {selectRow('Class', 'sys_class_name', Object.entries(CLASS_LABELS).map(([v, l]) => ({ value: v, label: l })))}
            {selectRow('Status', 'status', ['Installed', 'In Maintenance', 'Retired', 'Absent'].map(s => ({ value: s, label: s })))}
            {selectRow('Environment', 'environment', ['Production', 'Development', 'Test', 'Staging'].map(e => ({ value: e, label: e })))}
            {fieldRow('Category', 'category')}
            {fieldRow('Location', 'location')}
          </div>
          <div>
            {fieldRow('IP Address', 'ip_address')}
            {fieldRow('Serial Number', 'serial_number')}
            {fieldRow('Manufacturer', 'manufacturer')}
            {fieldRow('Model', 'model')}
            {fieldRow('Department', 'department')}
            <div className="sn-form-row">
              <label className="sn-form-label">Assigned to</label>
              <div className="sn-form-field">
                {editing ? (
                  <select className="sn-form-select" value={form.assigned_to || ''} onChange={e => update('assigned_to', e.target.value)}>
                    <option value="">-- None --</option>
                    {userOptions.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                ) : (
                  <span style={{ fontSize: 13 }}>{getUserDisplayName(state.users, ci.assigned_to) || '\u2014'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sn-tabs" style={{ marginTop: 16 }}>
          <button className={`sn-tab ${activeTab === 'related_incidents' ? 'active' : ''}`} onClick={() => setActiveTab('related_incidents')}>
            Incidents {relatedIncidents.length > 0 ? `(${relatedIncidents.length})` : ''}
          </button>
          <button className={`sn-tab ${activeTab === 'related_problems' ? 'active' : ''}`} onClick={() => setActiveTab('related_problems')}>
            Problems {relatedProblems.length > 0 ? `(${relatedProblems.length})` : ''}
          </button>
          <button className={`sn-tab ${activeTab === 'related_changes' ? 'active' : ''}`} onClick={() => setActiveTab('related_changes')}>
            Changes {relatedChanges.length > 0 ? `(${relatedChanges.length})` : ''}
          </button>
        </div>

        {activeTab === 'related_incidents' && (
          <div style={{ padding: '12px 0' }}>
            {relatedIncidents.length === 0 ? (
              <p style={{ color: '#999', fontSize: 13 }}>No related incidents.</p>
            ) : (
              <table className="sn-table" style={{ marginTop: 0 }}>
                <thead>
                  <tr><th>Number</th><th>Short Description</th><th>State</th><th>Priority</th></tr>
                </thead>
                <tbody>
                  {relatedIncidents.map(inc => (
                    <tr key={inc.sys_id} onClick={() => navigate(`/incident/${inc.sys_id}${sp}`)} style={{ cursor: 'pointer' }}>
                      <td><a className="sn-table-link">{inc.number}</a></td>
                      <td>{inc.short_description}</td>
                      <td>{inc.state === 1 ? 'New' : inc.state === 2 ? 'In Progress' : inc.state === 6 ? 'Resolved' : inc.state === 7 ? 'Closed' : 'Other'}</td>
                      <td>{inc.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'related_problems' && (
          <div style={{ padding: '12px 0' }}>
            {relatedProblems.length === 0 ? (
              <p style={{ color: '#999', fontSize: 13 }}>No related problems.</p>
            ) : (
              <table className="sn-table" style={{ marginTop: 0 }}>
                <thead>
                  <tr><th>Number</th><th>Short Description</th><th>State</th></tr>
                </thead>
                <tbody>
                  {relatedProblems.map(p => (
                    <tr key={p.sys_id} onClick={() => navigate(`/problem/${p.sys_id}${sp}`)} style={{ cursor: 'pointer' }}>
                      <td><a className="sn-table-link">{p.number}</a></td>
                      <td>{p.short_description}</td>
                      <td>{p.state === 5 ? 'Resolved' : p.state === 6 ? 'Closed' : 'Open'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'related_changes' && (
          <div style={{ padding: '12px 0' }}>
            {relatedChanges.length === 0 ? (
              <p style={{ color: '#999', fontSize: 13 }}>No related change requests.</p>
            ) : (
              <table className="sn-table" style={{ marginTop: 0 }}>
                <thead>
                  <tr><th>Number</th><th>Short Description</th><th>Type</th><th>Approval</th></tr>
                </thead>
                <tbody>
                  {relatedChanges.map(c => (
                    <tr key={c.sys_id} onClick={() => navigate(`/change/${c.sys_id}${sp}`)} style={{ cursor: 'pointer' }}>
                      <td><a className="sn-table-link">{c.number}</a></td>
                      <td>{c.short_description}</td>
                      <td>{c.type}</td>
                      <td>{c.approval}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
