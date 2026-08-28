import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'

function EditModal({ account, onSave, onClose }) {
  const [form, setForm] = useState({
    bankName: account.bankName || '',
    routingNumber: account.routingNumber || '',
    accountNumber: account.accountNumber || '',
    accountType: account.accountType || 'Checking',
    depositType: account.depositType || 'Percentage',
    amount: account.amount || 100,
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Direct Deposit</h3>
          <button onClick={onClose} style={{ background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-gray-medium)' }}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Bank Name</label>
            <input name="bankName" value={form.bankName} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Routing Number (9 digits)</label>
            <input name="routingNumber" value={form.routingNumber} onChange={handleChange} className="form-input" maxLength={9} />
          </div>
          <div className="form-group">
            <label className="form-label">Account Number</label>
            <input name="accountNumber" value={form.accountNumber} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Checking', 'Savings'].map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="radio" name="accountType" value={t} checked={form.accountType === t} onChange={handleChange} />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deposit Type</label>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Percentage', 'Flat Amount'].map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="radio" name="depositType" value={t} checked={form.depositType === t} onChange={handleChange} />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{form.depositType === 'Percentage' ? 'Percentage (%)' : 'Amount ($)'}</label>
            <input name="amount" type="number" value={form.amount} onChange={handleChange} className="form-input" min={0} max={form.depositType === 'Percentage' ? 100 : undefined} />
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

export default function DirectDeposit() {
  const { state, updateDirectDeposit, addDirectDeposit } = useApp()
  const { showToast } = useToast()
  const [editAccount, setEditAccount] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const deposits = state.directDeposits || []

  function handleSave(id, formData) {
    updateDirectDeposit(id, formData)
    setEditAccount(null)
    showToast('Direct deposit updated successfully', 'success')
  }

  function handleAdd(formData) {
    addDirectDeposit({
      id: `dd-${Date.now()}`,
      ...formData,
      isPrimary: deposits.length === 0,
    })
    setShowAddModal(false)
    showToast('Direct deposit account added', 'success')
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Direct Deposit</h1>
          <p>Manage your bank account(s) for direct deposit</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Account</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {deposits.map(dd => (
          <div key={dd.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ fontSize: 32 }}>🏦</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{dd.bankName}</div>
                <div style={{ color: 'var(--color-gray-medium)', fontSize: 14, marginTop: 2 }}>
                  {dd.accountType} &nbsp;·&nbsp; Routing: {dd.routingNumber} &nbsp;·&nbsp; Account: {dd.accountNumber}
                </div>
                <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
                  <span className="badge badge-blue">{dd.depositType === 'Percentage' ? `${dd.amount}%` : `$${dd.amount}`} deposit</span>
                  {dd.isPrimary && <span className="badge badge-green">Primary</span>}
                </div>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => setEditAccount(dd)}>Edit</button>
          </div>
        ))}
      </div>

      {editAccount && (
        <EditModal
          account={editAccount}
          onSave={(formData) => handleSave(editAccount.id, formData)}
          onClose={() => setEditAccount(null)}
        />
      )}
      {showAddModal && (
        <EditModal
          account={{ bankName: '', routingNumber: '', accountNumber: '', accountType: 'Checking', depositType: 'Percentage', amount: 100 }}
          onSave={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
