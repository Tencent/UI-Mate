import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Building2, MapPin, Users, Calendar, Plus, Edit2, Trash2, Check, X,
  Shield, Settings as SettingsIcon, ChevronRight
} from 'lucide-react';

function SettingsNav({ active, onSelect }) {
  const items = [
    { key: 'company', label: 'Company Information', icon: <Building2 size={15} /> },
    { key: 'departments', label: 'Departments', icon: <Users size={15} /> },
    { key: 'locations', label: 'Locations', icon: <MapPin size={15} /> },
    { key: 'time-off', label: 'Time Off Policies', icon: <Calendar size={15} /> },
    { key: 'access', label: 'Access Levels', icon: <Shield size={15} /> },
  ];

  return (
    <div style={{ width: 240, flexShrink: 0, background: 'white', borderRight: '1px solid #E0E0E0', minHeight: 'calc(100vh - 112px)' }}>
      <div style={{ padding: '16px 16px 8px', fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        Settings
      </div>
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '10px 16px', border: 'none', background: active === item.key ? '#edf8e0' : 'none',
            color: active === item.key ? '#5CA315' : '#555',
            fontSize: 13, fontWeight: active === item.key ? 600 : 400,
            cursor: 'pointer', textAlign: 'left',
            borderLeft: active === item.key ? '3px solid #73C41D' : '3px solid transparent'
          }}
          onMouseEnter={e => { if (active !== item.key) e.currentTarget.style.background = '#fafafa'; }}
          onMouseLeave={e => { if (active !== item.key) e.currentTarget.style.background = 'none'; }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

function CompanyInfoSection({ state, dispatch }) {
  const [editing, setEditing] = useState(false);
  const [companyName, setCompanyName] = useState(state.currentUser?.companyName || '');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    dispatch({ type: 'SET_STATE', payload: { ...state, currentUser: { ...state.currentUser, companyName } } });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Company Information</h2>
      {saved && (
        <div style={{ background: '#edf8e0', border: '1px solid #b6e07a', color: '#5CA315', borderRadius: 4, padding: '8px 14px', marginBottom: 16, fontSize: 13 }}>
          Company information saved successfully.
        </div>
      )}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
          <div>
            <div style={{ fontSize: 12, color: '#999', fontWeight: 500, marginBottom: 4 }}>Company Name</div>
            {editing ? (
              <input className="form-input" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ width: '100%' }} />
            ) : (
              <div style={{ fontSize: 14, color: '#333' }}>{state.currentUser?.companyName || 'Efficient Office Solutions'}</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#999', fontWeight: 500, marginBottom: 4 }}>Industry</div>
            <div style={{ fontSize: 14, color: '#333' }}>Professional Services</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#999', fontWeight: 500, marginBottom: 4 }}>Country</div>
            <div style={{ fontSize: 14, color: '#333' }}>United States</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#999', fontWeight: 500, marginBottom: 4 }}>Fiscal Year Start</div>
            <div style={{ fontSize: 14, color: '#333' }}>January</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#999', fontWeight: 500, marginBottom: 4 }}>Total Employees</div>
            <div style={{ fontSize: 14, color: '#333' }}>{(state.employees || []).filter(e => e.status === 'Active').length}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#999', fontWeight: 500, marginBottom: 4 }}>Time Zone</div>
            <div style={{ fontSize: 14, color: '#333' }}>America/Los_Angeles (PST)</div>
          </div>
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
          {editing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={() => { setEditing(true); setCompanyName(state.currentUser?.companyName || 'Efficient Office Solutions'); }}>
              <Edit2 size={13} /> Edit Company Info
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DepartmentsSection({ state, dispatch }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [toast, setToast] = useState('');

  function addDept() {
    if (!newName.trim()) return;
    const depts = state.departments || [];
    const nextId = Math.max(0, ...depts.map(d => d.id)) + 1;
    dispatch({ type: 'SET_STATE', payload: { ...state, departments: [...depts, { id: nextId, name: newName.trim(), headId: null }] } });
    setNewName('');
    setShowAdd(false);
    setToast('Department added.');
    setTimeout(() => setToast(''), 2000);
  }

  function saveDept(id) {
    if (!editName.trim()) return;
    const depts = (state.departments || []).map(d => d.id === id ? { ...d, name: editName.trim() } : d);
    dispatch({ type: 'SET_STATE', payload: { ...state, departments: depts } });
    setEditId(null);
    setToast('Department updated.');
    setTimeout(() => setToast(''), 2000);
  }

  function deleteDept(id) {
    const empCount = (state.employees || []).filter(e => e.departmentId === id && e.status === 'Active').length;
    if (empCount > 0) {
      setToast(`Cannot delete: ${empCount} employees are in this department.`);
      setTimeout(() => setToast(''), 3000);
      return;
    }
    const depts = (state.departments || []).filter(d => d.id !== id);
    dispatch({ type: 'SET_STATE', payload: { ...state, departments: depts } });
    setToast('Department deleted.');
    setTimeout(() => setToast(''), 2000);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Departments</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Department</button>
      </div>
      {toast && (
        <div style={{ background: toast.includes('Cannot') ? '#fff3e0' : '#edf8e0', border: `1px solid ${toast.includes('Cannot') ? '#ffe0b2' : '#b6e07a'}`, color: toast.includes('Cannot') ? '#e65100' : '#5CA315', borderRadius: 4, padding: '8px 14px', marginBottom: 16, fontSize: 13 }}>
          {toast}
        </div>
      )}
      {showAdd && (
        <div className="card" style={{ marginBottom: 16, padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Department name" style={{ flex: 1 }} autoFocus onKeyDown={e => e.key === 'Enter' && addDept()} />
          <button className="btn btn-primary" onClick={addDept}>Add</button>
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Head</th>
              <th>Employees</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(state.departments || []).map(dept => {
              const head = state.employees?.find(e => e.id === dept.headId);
              const empCount = (state.employees || []).filter(e => e.departmentId === dept.id && e.status === 'Active').length;
              const isEditing = editId === dept.id;
              return (
                <tr key={dept.id}>
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input className="form-input" value={editName} onChange={e => setEditName(e.target.value)} style={{ fontSize: 13, padding: '4px 8px' }} onKeyDown={e => e.key === 'Enter' && saveDept(dept.id)} />
                        <button onClick={() => saveDept(dept.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#73C41D' }}><Check size={14} /></button>
                        <button onClick={() => setEditId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}><X size={14} /></button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{dept.name}</span>
                    )}
                  </td>
                  <td style={{ fontSize: 13 }}>{head?.displayName || '---'}</td>
                  <td style={{ fontSize: 13 }}>{empCount}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => { setEditId(dept.id); setEditName(dept.name); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#73C41D', padding: 4 }}><Edit2 size={13} /></button>
                      <button onClick={() => deleteDept(dept.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LocationsSection({ state, dispatch }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [toast, setToast] = useState('');

  function addLoc() {
    if (!newName.trim()) return;
    const locs = state.locations || [];
    const nextId = Math.max(0, ...locs.map(l => l.id)) + 1;
    dispatch({ type: 'SET_STATE', payload: { ...state, locations: [...locs, { id: nextId, name: newName.trim(), address: newAddress.trim(), timezone: '' }] } });
    setNewName('');
    setNewAddress('');
    setShowAdd(false);
    setToast('Location added.');
    setTimeout(() => setToast(''), 2000);
  }

  function saveLoc(id) {
    if (!editName.trim()) return;
    const locs = (state.locations || []).map(l => l.id === id ? { ...l, name: editName.trim() } : l);
    dispatch({ type: 'SET_STATE', payload: { ...state, locations: locs } });
    setEditId(null);
    setToast('Location updated.');
    setTimeout(() => setToast(''), 2000);
  }

  function deleteLoc(id) {
    const empCount = (state.employees || []).filter(e => e.locationId === id && e.status === 'Active').length;
    if (empCount > 0) {
      setToast(`Cannot delete: ${empCount} employees are at this location.`);
      setTimeout(() => setToast(''), 3000);
      return;
    }
    const locs = (state.locations || []).filter(l => l.id !== id);
    dispatch({ type: 'SET_STATE', payload: { ...state, locations: locs } });
    setToast('Location deleted.');
    setTimeout(() => setToast(''), 2000);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Locations</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Location</button>
      </div>
      {toast && (
        <div style={{ background: toast.includes('Cannot') ? '#fff3e0' : '#edf8e0', border: `1px solid ${toast.includes('Cannot') ? '#ffe0b2' : '#b6e07a'}`, color: toast.includes('Cannot') ? '#e65100' : '#5CA315', borderRadius: 4, padding: '8px 14px', marginBottom: 16, fontSize: 13 }}>
          {toast}
        </div>
      )}
      {showAdd && (
        <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Location name" style={{ flex: 1 }} autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="form-input" value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Address" style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={addLoc}>Add</button>
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Location Name</th>
              <th>Address</th>
              <th>Employees</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(state.locations || []).map(loc => {
              const empCount = (state.employees || []).filter(e => e.locationId === loc.id && e.status === 'Active').length;
              const isEditing = editId === loc.id;
              return (
                <tr key={loc.id}>
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input className="form-input" value={editName} onChange={e => setEditName(e.target.value)} style={{ fontSize: 13, padding: '4px 8px' }} onKeyDown={e => e.key === 'Enter' && saveLoc(loc.id)} />
                        <button onClick={() => saveLoc(loc.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#73C41D' }}><Check size={14} /></button>
                        <button onClick={() => setEditId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}><X size={14} /></button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{loc.name}</span>
                    )}
                  </td>
                  <td style={{ fontSize: 13, color: '#666' }}>{loc.address || '---'}</td>
                  <td style={{ fontSize: 13 }}>{empCount}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => { setEditId(loc.id); setEditName(loc.name); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#73C41D', padding: 4 }}><Edit2 size={13} /></button>
                      <button onClick={() => deleteLoc(loc.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TimeOffPoliciesSection({ state, dispatch }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Vacation', unit: 'hours', accrualRate: 0, maxBalance: 0 });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [toast, setToast] = useState('');

  function addPolicy() {
    if (!form.name.trim()) return;
    const policies = state.timeOffPolicies || [];
    const nextId = Math.max(0, ...policies.map(p => p.id)) + 1;
    dispatch({
      type: 'SET_STATE',
      payload: {
        ...state,
        timeOffPolicies: [...policies, { id: nextId, name: form.name.trim(), type: form.type, icon: 'calendar', unit: form.unit, accrualRate: Number(form.accrualRate), maxBalance: Number(form.maxBalance) }]
      }
    });
    setForm({ name: '', type: 'Vacation', unit: 'hours', accrualRate: 0, maxBalance: 0 });
    setShowAdd(false);
    setToast('Time off policy added.');
    setTimeout(() => setToast(''), 2000);
  }

  function savePolicy(id) {
    const policies = (state.timeOffPolicies || []).map(p =>
      p.id === id ? { ...p, name: editForm.name || p.name, type: editForm.type || p.type, accrualRate: Number(editForm.accrualRate) ?? p.accrualRate, maxBalance: Number(editForm.maxBalance) ?? p.maxBalance } : p
    );
    dispatch({ type: 'SET_STATE', payload: { ...state, timeOffPolicies: policies } });
    setEditId(null);
    setToast('Policy updated.');
    setTimeout(() => setToast(''), 2000);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Time Off Policies</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Policy</button>
      </div>
      {toast && (
        <div style={{ background: '#edf8e0', border: '1px solid #b6e07a', color: '#5CA315', borderRadius: 4, padding: '8px 14px', marginBottom: 16, fontSize: 13 }}>
          {toast}
        </div>
      )}
      {showAdd && (
        <div className="card" style={{ marginBottom: 16, padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Policy Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Vacation Full-Time" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {['Vacation', 'Sick', 'Personal', 'Bereavement', 'FMLA', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Accrual Rate (per pay period)</label>
              <input className="form-input" type="number" value={form.accrualRate} onChange={e => setForm(f => ({ ...f, accrualRate: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Max Balance</label>
              <input className="form-input" type="number" value={form.maxBalance} onChange={e => setForm(f => ({ ...f, maxBalance: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={addPolicy}>Add Policy</button>
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Policy Name</th>
              <th>Type</th>
              <th>Unit</th>
              <th>Accrual Rate</th>
              <th>Max Balance</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(state.timeOffPolicies || []).map(policy => {
              const isEditing = editId === policy.id;
              return (
                <tr key={policy.id}>
                  <td>
                    {isEditing ? (
                      <input className="form-input" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ fontSize: 13, padding: '4px 8px', width: '100%' }} />
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{policy.name}</span>
                    )}
                  </td>
                  <td style={{ fontSize: 13 }}>{isEditing ? (
                    <select className="form-select" value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} style={{ fontSize: 13, padding: '4px 8px' }}>
                      {['Vacation', 'Sick', 'Personal', 'Bereavement', 'FMLA', 'Other'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  ) : policy.type}</td>
                  <td style={{ fontSize: 13 }}>{policy.unit}</td>
                  <td style={{ fontSize: 13 }}>
                    {isEditing ? (
                      <input className="form-input" type="number" value={editForm.accrualRate} onChange={e => setEditForm(f => ({ ...f, accrualRate: e.target.value }))} style={{ fontSize: 13, padding: '4px 8px', width: 80 }} />
                    ) : policy.accrualRate}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {isEditing ? (
                      <input className="form-input" type="number" value={editForm.maxBalance} onChange={e => setEditForm(f => ({ ...f, maxBalance: e.target.value }))} style={{ fontSize: 13, padding: '4px 8px', width: 80 }} />
                    ) : policy.maxBalance}
                  </td>
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => savePolicy(policy.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#73C41D' }}><Check size={14} /></button>
                        <button onClick={() => setEditId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}><X size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditId(policy.id); setEditForm({ name: policy.name, type: policy.type, accrualRate: policy.accrualRate, maxBalance: policy.maxBalance }); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#73C41D', padding: 4 }}><Edit2 size={13} /></button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AccessLevelsSection({ state }) {
  const accessLevels = [
    { name: 'Administrator', description: 'Full access to all XambooHR features including settings, reports, and employee data.', count: 1 },
    { name: 'HR Manager', description: 'Access to manage employees, time off, hiring, and run reports.', count: 2 },
    { name: 'Manager', description: 'View and manage direct reports, approve time off, performance reviews.', count: 6 },
    { name: 'Employee', description: 'View own profile, request time off, update personal information.', count: (state.employees || []).filter(e => e.status === 'Active').length - 9 },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Access Levels</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {accessLevels.map(level => (
          <div key={level.name} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#333', marginBottom: 4 }}>{level.name}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{level.description}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="badge badge-gray">{level.count} {level.count === 1 ? 'user' : 'users'}</span>
              <ChevronRight size={14} color="#ccc" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Settings() {
  const { state, dispatch } = useApp();
  const [activeSection, setActiveSection] = useState('company');

  return (
    <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0' }}>
          <SettingsIcon size={18} color="#73C41D" />
          <span style={{ fontWeight: 600, fontSize: 18 }}>Settings</span>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <SettingsNav active={activeSection} onSelect={setActiveSection} />
        <div style={{ flex: 1, padding: '24px 32px', maxWidth: 900 }}>
          {activeSection === 'company' && <CompanyInfoSection state={state} dispatch={dispatch} />}
          {activeSection === 'departments' && <DepartmentsSection state={state} dispatch={dispatch} />}
          {activeSection === 'locations' && <LocationsSection state={state} dispatch={dispatch} />}
          {activeSection === 'time-off' && <TimeOffPoliciesSection state={state} dispatch={dispatch} />}
          {activeSection === 'access' && <AccessLevelsSection state={state} />}
        </div>
      </div>
    </div>
  );
}
