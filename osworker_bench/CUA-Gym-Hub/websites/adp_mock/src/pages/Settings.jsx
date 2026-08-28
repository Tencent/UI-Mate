import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'
import SortableTable from '../components/SortableTable.jsx'

export default function Settings() {
  const { state, updateState } = useApp()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('company')
  const [editingCompany, setEditingCompany] = useState(false)
  const [companyForm, setCompanyForm] = useState(null)
  const [editDept, setEditDept] = useState(null)
  const [showAddDept, setShowAddDept] = useState(false)
  const [editLoc, setEditLoc] = useState(null)
  const [showAddLoc, setShowAddLoc] = useState(false)

  const companyInfo = state.companyInfo || {}
  const departments = state.departments || []
  const locations = state.locations || []
  const payPolicies = state.payPolicies || []

  const tabs = [
    { id: 'company', label: 'Company Info' },
    { id: 'departments', label: 'Departments' },
    { id: 'locations', label: 'Locations' },
    { id: 'pay-policies', label: 'Pay Policies' },
  ]

  // Company Info
  function handleCompanyEdit() {
    setCompanyForm({ ...companyInfo })
    setEditingCompany(true)
  }

  function handleCompanySave() {
    updateState(prev => ({ ...prev, companyInfo: companyForm }))
    setEditingCompany(false)
    showToast('Company information updated', 'success')
  }

  // Departments
  function DeptModal({ dept, onSave, onClose }) {
    const [form, setForm] = useState({
      name: dept?.name || '',
      manager: dept?.manager || '',
      location: dept?.location || '',
      costCenter: dept?.costCenter || '',
    })
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{dept ? 'Edit Department' : 'Add Department'}</h3>
            <button onClick={onClose} style={{ background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-medium)' }}>x</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Department Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Manager</label>
              <input value={form.manager} onChange={e => setForm(f => ({ ...f, manager: e.target.value }))} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Cost Center</label>
              <input value={form.costCenter} onChange={e => setForm(f => ({ ...f, costCenter: e.target.value }))} className="form-input" />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave(form)}>Save</button>
          </div>
        </div>
      </div>
    )
  }

  function handleSaveDept(existingDept, form) {
    if (existingDept) {
      updateState(prev => ({
        ...prev,
        departments: prev.departments.map(d => d.id === existingDept.id ? { ...d, ...form } : d),
      }))
      showToast('Department updated', 'success')
    } else {
      const newDept = { id: `dept-${Date.now()}`, headcount: 0, managerId: '', ...form }
      updateState(prev => ({ ...prev, departments: [...prev.departments, newDept] }))
      showToast('Department added', 'success')
    }
    setEditDept(null)
    setShowAddDept(false)
  }

  function handleDeleteDept(dept) {
    updateState(prev => ({ ...prev, departments: prev.departments.filter(d => d.id !== dept.id) }))
    showToast('Department removed', 'success')
  }

  // Locations
  function LocModal({ loc, onSave, onClose }) {
    const [form, setForm] = useState({
      name: loc?.name || '',
      address: loc?.address || '',
      phone: loc?.phone || '',
      type: loc?.type || 'Branch',
    })
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{loc ? 'Edit Location' : 'Add Location'}</h3>
            <button onClick={onClose} style={{ background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-medium)' }}>x</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Location Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="form-input">
                <option>Headquarters</option>
                <option>Branch</option>
                <option>Remote</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave(form)}>Save</button>
          </div>
        </div>
      </div>
    )
  }

  function handleSaveLoc(existingLoc, form) {
    if (existingLoc) {
      updateState(prev => ({
        ...prev,
        locations: prev.locations.map(l => l.id === existingLoc.id ? { ...l, ...form } : l),
      }))
      showToast('Location updated', 'success')
    } else {
      const newLoc = { id: `loc-${Date.now()}`, headcount: 0, ...form }
      updateState(prev => ({ ...prev, locations: [...prev.locations, newLoc] }))
      showToast('Location added', 'success')
    }
    setEditLoc(null)
    setShowAddLoc(false)
  }

  function handleDeleteLoc(loc) {
    updateState(prev => ({ ...prev, locations: prev.locations.filter(l => l.id !== loc.id) }))
    showToast('Location removed', 'success')
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Company configuration and administration</p>
      </div>

      {/* Tabs */}
      <div className="section-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`section-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Company Info Tab */}
      {activeTab === 'company' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3>Company Information</h3>
            {!editingCompany && (
              <button className="btn btn-secondary" onClick={handleCompanyEdit}>Edit</button>
            )}
          </div>
          {editingCompany && companyForm ? (
            <div>
              {[
                { key: 'name', label: 'Company Name' },
                { key: 'ein', label: 'EIN' },
                { key: 'address', label: 'Address' },
                { key: 'industry', label: 'Industry' },
                { key: 'founded', label: 'Founded' },
                { key: 'website', label: 'Website' },
                { key: 'phone', label: 'Phone' },
              ].map(field => (
                <div className="form-group" key={field.key}>
                  <label className="form-label">{field.label}</label>
                  <input
                    value={companyForm[field.key] || ''}
                    onChange={e => setCompanyForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="form-input"
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn-primary" onClick={handleCompanySave}>Save</button>
                <button className="btn btn-secondary" onClick={() => setEditingCompany(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['Company Name', companyInfo.name],
                ['EIN', companyInfo.ein],
                ['Address', companyInfo.address],
                ['Industry', companyInfo.industry],
                ['Founded', companyInfo.founded],
                ['Website', companyInfo.website],
                ['Phone', companyInfo.phone],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{value || '\u2014'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary" onClick={() => setShowAddDept(true)}>+ Add Department</button>
          </div>
          <div className="card">
            <SortableTable
              columns={[
                { key: 'name', label: 'Department', render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
                { key: 'headcount', label: 'Headcount', align: 'right' },
                { key: 'manager', label: 'Manager' },
                { key: 'location', label: 'Location' },
                { key: 'costCenter', label: 'Cost Center' },
                {
                  key: 'actions',
                  label: 'Actions',
                  sortable: false,
                  render: (_, row) => (
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditDept(row)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDept(row)}>Delete</button>
                    </div>
                  ),
                },
              ]}
              data={departments}
            />
          </div>
          {editDept && <DeptModal dept={editDept} onSave={(form) => handleSaveDept(editDept, form)} onClose={() => setEditDept(null)} />}
          {showAddDept && <DeptModal dept={null} onSave={(form) => handleSaveDept(null, form)} onClose={() => setShowAddDept(false)} />}
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary" onClick={() => setShowAddLoc(true)}>+ Add Location</button>
          </div>
          <div className="card">
            <SortableTable
              columns={[
                { key: 'name', label: 'Location', render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
                { key: 'address', label: 'Address' },
                { key: 'phone', label: 'Phone' },
                { key: 'headcount', label: 'Headcount', align: 'right' },
                {
                  key: 'type',
                  label: 'Type',
                  render: (v) => <span className={`badge ${v === 'Headquarters' ? 'badge-blue' : 'badge-gray'}`}>{v}</span>,
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  sortable: false,
                  render: (_, row) => (
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditLoc(row)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLoc(row)}>Delete</button>
                    </div>
                  ),
                },
              ]}
              data={locations}
            />
          </div>
          {editLoc && <LocModal loc={editLoc} onSave={(form) => handleSaveLoc(editLoc, form)} onClose={() => setEditLoc(null)} />}
          {showAddLoc && <LocModal loc={null} onSave={(form) => handleSaveLoc(null, form)} onClose={() => setShowAddLoc(false)} />}
        </div>
      )}

      {/* Pay Policies Tab */}
      {activeTab === 'pay-policies' && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Pay Policies</h3>
          <SortableTable
            columns={[
              { key: 'name', label: 'Policy Name', render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
              { key: 'frequency', label: 'Frequency' },
              { key: 'overtimeRule', label: 'Overtime Rule' },
              { key: 'effectiveDate', label: 'Effective Date' },
              {
                key: 'status',
                label: 'Status',
                render: (v) => <span className={`badge ${v === 'Active' ? 'badge-green' : 'badge-gray'}`}>{v}</span>,
              },
            ]}
            data={payPolicies}
          />
        </div>
      )}
    </div>
  )
}
