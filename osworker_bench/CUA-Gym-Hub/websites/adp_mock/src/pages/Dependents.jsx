import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'

function DependentModal({ dep, onSave, onClose }) {
  const [form, setForm] = useState({
    firstName: dep?.firstName || '',
    lastName: dep?.lastName || '',
    relationship: dep?.relationship || 'Spouse',
    dateOfBirth: dep?.dateOfBirth || '',
    ssn: dep?.ssn || '',
    coveredPlans: dep?.coveredPlans || ['Medical', 'Dental', 'Vision'],
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function togglePlan(plan) {
    setForm(prev => ({
      ...prev,
      coveredPlans: prev.coveredPlans.includes(plan)
        ? prev.coveredPlans.filter(p => p !== plan)
        : [...prev.coveredPlans, plan],
    }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{dep ? 'Edit Dependent' : 'Add Dependent'}</h3>
          <button onClick={onClose} style={{ background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-medium)' }}>×</button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Relationship</label>
            <select name="relationship" value={form.relationship} onChange={handleChange} className="form-input">
              <option>Spouse</option>
              <option>Child</option>
              <option>Domestic Partner</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">SSN (last 4 digits)</label>
            <input name="ssn" value={form.ssn} onChange={handleChange} className="form-input" placeholder="***-**-XXXX" />
          </div>
          <div className="form-group">
            <label className="form-label">Covered Plans</label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['Medical', 'Dental', 'Vision'].map(p => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.coveredPlans.includes(p)} onChange={() => togglePlan(p)} />
                  {p}
                </label>
              ))}
            </div>
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

export default function Dependents() {
  const { state, addDependent, updateDependent, removeDependent } = useApp()
  const { showToast } = useToast()
  const [editDep, setEditDep] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(null)

  const dependents = state.dependents || []

  function handleSave(dep, form) {
    if (dep) {
      updateDependent(dep.id, form)
      showToast('Dependent updated', 'success')
    } else {
      addDependent({ id: `dep-${Date.now()}`, ...form })
      showToast('Dependent added', 'success')
    }
    setEditDep(null)
    setShowAdd(false)
  }

  function handleRemove(dep) {
    removeDependent(dep.id)
    showToast('Dependent removed', 'success')
    setConfirmRemove(null)
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>My Dependents</h1>
          <p>Family members covered under your benefits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Dependent</button>
      </div>

      {dependents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍👩‍👧</div>
          <div style={{ fontWeight: 500 }}>No dependents on file</div>
          <div style={{ color: 'var(--color-gray-medium)', fontSize: 14, marginTop: 4 }}>Add family members covered under your benefits</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dependents.map(dep => (
            <div key={dep.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className="avatar avatar-lg" style={{ background: '#4B5563' }}>
                  {dep.firstName?.[0] || '?'}{dep.lastName?.[0] || ''}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{dep.firstName} {dep.lastName}</div>
                  <div style={{ fontSize: 14, color: 'var(--color-gray-medium)' }}>{dep.relationship}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-gray-medium)', marginTop: 2 }}>
                    DOB: {dep.dateOfBirth} &nbsp;·&nbsp; SSN: {dep.ssn}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                    {(dep.coveredPlans || []).map(p => (
                      <span key={p} className="badge badge-blue" style={{ fontSize: 11 }}>{p}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditDep(dep)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmRemove(dep)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editDep && <DependentModal dep={editDep} onSave={(form) => handleSave(editDep, form)} onClose={() => setEditDep(null)} />}
      {showAdd && <DependentModal dep={null} onSave={(form) => handleSave(null, form)} onClose={() => setShowAdd(false)} />}

      {confirmRemove && (
        <div className="modal-overlay" onClick={() => setConfirmRemove(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Remove Dependent</h3></div>
            <div className="modal-body">
              <p>Remove <strong>{confirmRemove.firstName} {confirmRemove.lastName}</strong> from your dependents? This will also remove them from any covered benefit plans.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmRemove(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleRemove(confirmRemove)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
