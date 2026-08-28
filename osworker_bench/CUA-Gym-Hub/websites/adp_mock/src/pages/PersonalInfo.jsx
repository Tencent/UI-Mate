import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'

function EditableField({ label, value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const { showToast } = useToast()

  function handleSave() {
    onSave(val)
    setEditing(false)
    showToast('Information updated', 'success')
  }

  if (editing) {
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={val} onChange={e => setVal(e.target.value)} className="form-input" />
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setVal(value); setEditing(false) }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontWeight: 400, fontSize: 14 }}>{value || '—'}</div>
      </div>
      <button
        onClick={() => setEditing(true)}
        style={{ background: 'none', color: 'var(--color-info)', fontSize: 16, cursor: 'pointer', padding: '4px' }}
        title="Edit"
      >
        ✏️
      </button>
    </div>
  )
}

function DisplayField({ label, value }) {
  return (
    <div style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 400, fontSize: 14 }}>{value || '—'}</div>
    </div>
  )
}

function EmergencyContactModal({ contact, onSave, onClose }) {
  const [form, setForm] = useState({
    name: contact?.name || '',
    relationship: contact?.relationship || 'Spouse',
    phone: contact?.phone || '',
    email: contact?.email || '',
    isPrimary: contact?.isPrimary || false,
  })

  function handleChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: val }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{contact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}</h3>
          <button onClick={onClose} style={{ background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-medium)' }}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Relationship</label>
            <select name="relationship" value={form.relationship} onChange={handleChange} className="form-input">
              <option>Spouse</option>
              <option>Parent</option>
              <option>Sibling</option>
              <option>Child</option>
              <option>Friend</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="form-input" placeholder="(555) 000-0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" name="isPrimary" checked={form.isPrimary} onChange={handleChange} id="isPrimary" />
            <label htmlFor="isPrimary">Primary Contact</label>
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

export default function PersonalInfo() {
  const { state, updateEmployee, updateAddress, addEmergencyContact, updateEmergencyContact, removeEmergencyContact } = useApp()
  const { showToast } = useToast()
  const [showPayRate, setShowPayRate] = useState(false)
  const [editContact, setEditContact] = useState(null)
  const [showAddContact, setShowAddContact] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState(null)

  const emp = state.employee || {}
  const address = state.address || {}
  const emergencyContacts = state.emergencyContacts || []

  function handleEditAddressOpen() {
    setAddressForm({ ...address })
    setEditingAddress(true)
  }

  function handleAddressSave() {
    updateAddress(addressForm)
    setEditingAddress(false)
    showToast('Address updated', 'success')
  }

  function handleSaveContact(contact, form) {
    if (contact) {
      updateEmergencyContact(contact.id, form)
    } else {
      addEmergencyContact({ id: `ec-${Date.now()}`, ...form })
    }
    showToast('Emergency contact saved', 'success')
    setEditContact(null)
    setShowAddContact(false)
  }

  function handleRemoveContact(c) {
    removeEmergencyContact(c.id)
    showToast('Emergency contact removed', 'success')
    setConfirmRemove(null)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Information</h1>
        <p style={{ fontSize: 13 }}>Employee ID: {emp.employeeId}</p>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Personal Details */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Personal Details</h3>
            <DisplayField label="Full Name" value={`${emp.firstName} ${emp.lastName}`} />
            <DisplayField label="Date of Birth" value={emp.dateOfBirth} />
            <DisplayField label="Employee ID" value={emp.employeeId} />
            <DisplayField label="Hire Date" value={emp.hireDate} />
            <EditableField label="Job Title" value={emp.jobTitle} onSave={v => updateEmployee({ jobTitle: v })} />
            <EditableField label="Department" value={emp.department} onSave={v => updateEmployee({ department: v })} />
            <DisplayField label="Division" value={emp.division} />
            <DisplayField label="Manager" value={emp.manager} />
            <DisplayField label="Work Location" value={emp.workLocation} />
            <DisplayField label="Employment Status" value={emp.employmentStatus} />
            <div style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginBottom: 2 }}>Pay Rate</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 400, fontSize: 14 }}>
                  {showPayRate ? `$${emp.payRate?.toLocaleString()}/year` : '••••••••'}
                </span>
                <button
                  onClick={() => setShowPayRate(v => !v)}
                  style={{ background: 'none', fontSize: 14, cursor: 'pointer', color: 'var(--color-info)', padding: 0 }}
                >
                  {showPayRate ? 'Hide' : 'Reveal'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Contact Information</h3>
            {editingAddress && addressForm ? (
              <div style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)', marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginBottom: 6 }}>Home Address</div>
                <div className="form-group" style={{ marginBottom: 6 }}>
                  <input value={addressForm.street1} onChange={e => setAddressForm(f => ({ ...f, street1: e.target.value }))} className="form-input" placeholder="Street address" />
                </div>
                <div className="form-group" style={{ marginBottom: 6 }}>
                  <input value={addressForm.street2 || ''} onChange={e => setAddressForm(f => ({ ...f, street2: e.target.value }))} className="form-input" placeholder="Apt, suite, etc. (optional)" />
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <input value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))} className="form-input" placeholder="City" style={{ flex: 2 }} />
                  <input value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))} className="form-input" placeholder="State" style={{ flex: 1 }} />
                  <input value={addressForm.zip} onChange={e => setAddressForm(f => ({ ...f, zip: e.target.value }))} className="form-input" placeholder="ZIP" style={{ flex: 1 }} />
                </div>
                <input value={addressForm.country} onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))} className="form-input" placeholder="Country" style={{ marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleAddressSave}>Save</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingAddress(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginBottom: 2 }}>Home Address</div>
                  <div style={{ fontSize: 14 }}>
                    {address.street1}{address.street2 ? `, ${address.street2}` : ''}<br />
                    {address.city}, {address.state} {address.zip}<br />
                    {address.country}
                  </div>
                </div>
                <button
                  onClick={handleEditAddressOpen}
                  style={{ background: 'none', color: 'var(--color-info)', fontSize: 16, cursor: 'pointer', padding: '4px' }}
                  title="Edit"
                >
                  ✏️
                </button>
              </div>
            )}
            <EditableField label="Phone Number" value={emp.phone} onSave={v => updateEmployee({ phone: v })} />
            <EditableField label="Email Address" value={emp.email} onSave={v => updateEmployee({ email: v })} />
          </div>

          {/* Emergency Contacts */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Emergency Contacts</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddContact(true)}>+ Add</button>
            </div>
            {emergencyContacts.length === 0 ? (
              <div style={{ color: 'var(--color-gray-medium)', fontSize: 14 }}>No emergency contacts on file</div>
            ) : (
              emergencyContacts.map(c => (
                <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
                        {c.name}
                        {c.isPrimary && <span className="badge badge-blue" style={{ fontSize: 10 }}>Primary</span>}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-gray-medium)' }}>{c.relationship}</div>
                      <div style={{ fontSize: 13 }}>{c.phone}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-gray-medium)' }}>{c.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditContact(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmRemove(c)}>✕</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {(editContact || showAddContact) && (
        <EmergencyContactModal
          contact={editContact}
          onSave={(form) => handleSaveContact(editContact, form)}
          onClose={() => { setEditContact(null); setShowAddContact(false) }}
        />
      )}

      {confirmRemove && (
        <div className="modal-overlay" onClick={() => setConfirmRemove(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Remove Emergency Contact</h3></div>
            <div className="modal-body">
              <p>Remove <strong>{confirmRemove.name}</strong> from your emergency contacts?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmRemove(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleRemoveContact(confirmRemove)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
