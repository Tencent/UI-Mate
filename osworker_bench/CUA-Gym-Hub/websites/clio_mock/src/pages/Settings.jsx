import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'

export default function Settings() {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const [tab, setTab] = useState('firm')
  const [firmForm, setFirmForm] = useState({ ...state.firmSettings })
  const [billingForm, setBillingForm] = useState({
    defaultBillingRate: state.firmSettings.defaultBillingRate || 350,
    taxRate: state.firmSettings.taxRate || 0,
    defaultPaymentTerms: state.firmSettings.defaultPaymentTerms || 30,
    currency: state.firmSettings.currency || 'USD',
  })

  const tabs = [
    { id: 'firm', label: 'Firm Profile' },
    { id: 'billing', label: 'Billing & Rates' },
    { id: 'practice', label: 'Practice Areas' },
    { id: 'users', label: 'Users' },
  ]

  const handleSaveFirm = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.firmSettings, ...firmForm } })
    addToast('Firm settings saved')
  }

  const handleSaveBilling = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.firmSettings, ...billingForm } })
    addToast('Billing settings saved')
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
        {/* Sidebar */}
        <div className="card" style={{ padding: 0, alignSelf: 'start' }}>
          {tabs.map(t => (
            <div key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 16px', cursor: 'pointer', fontSize: 13,
                background: tab === t.id ? '#EEF4FD' : 'transparent',
                color: tab === t.id ? '#1A73E8' : '#1A1A2E',
                fontWeight: tab === t.id ? 600 : 400,
                borderLeft: tab === t.id ? '3px solid #1A73E8' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = '#F8F9FA' }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = 'transparent' }}>
              {t.label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div>
          {tab === 'firm' && (
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Firm Profile</h3>
              <div style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
                <div className="form-group">
                  <label className="form-label">Firm Name</label>
                  <input className="input-field" value={firmForm.firmName || ''} onChange={e => setFirmForm(f => ({ ...f, firmName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="input-field" value={firmForm.phone || ''} onChange={e => setFirmForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="input-field" type="email" value={firmForm.email || ''} onChange={e => setFirmForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input className="input-field" value={firmForm.address?.street || ''} onChange={e => setFirmForm(f => ({ ...f, address: { ...f.address, street: e.target.value } }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="input-field" value={firmForm.address?.city || ''} onChange={e => setFirmForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="input-field" value={firmForm.address?.state || ''} onChange={e => setFirmForm(f => ({ ...f, address: { ...f.address, state: e.target.value } }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP</label>
                    <input className="input-field" value={firmForm.address?.zip || ''} onChange={e => setFirmForm(f => ({ ...f, address: { ...f.address, zip: e.target.value } }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input className="input-field" value={firmForm.website || ''} onChange={e => setFirmForm(f => ({ ...f, website: e.target.value }))} />
                </div>
                <button className="btn btn-primary" style={{ width: 'fit-content' }} onClick={handleSaveFirm}>Save Changes</button>
              </div>
            </div>
          )}

          {tab === 'billing' && (
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Billing & Rates</h3>
              <div style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
                <div className="form-group">
                  <label className="form-label">Default Hourly Rate ($)</label>
                  <input className="input-field" type="number" value={billingForm.defaultBillingRate} onChange={e => setBillingForm(f => ({ ...f, defaultBillingRate: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tax Rate (%)</label>
                  <input className="input-field" type="number" step="0.1" value={billingForm.taxRate} onChange={e => setBillingForm(f => ({ ...f, taxRate: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Terms (days)</label>
                  <select className="select-field" value={billingForm.defaultPaymentTerms} onChange={e => setBillingForm(f => ({ ...f, defaultPaymentTerms: parseInt(e.target.value) }))}>
                    {[0, 15, 30, 60, 90].map(t => <option key={t} value={t}>{t === 0 ? 'Due on Receipt' : `Net ${t}`}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="select-field" value={billingForm.currency} onChange={e => setBillingForm(f => ({ ...f, currency: e.target.value }))}>
                    {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" style={{ width: 'fit-content' }} onClick={handleSaveBilling}>Save Changes</button>
              </div>
            </div>
          )}

          {tab === 'practice' && (
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Practice Areas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
                {(state.firmSettings.practiceAreas || []).map((area, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input className="input-field" value={area} style={{ flex: 1 }}
                      onChange={e => {
                        const updated = [...state.firmSettings.practiceAreas]
                        updated[i] = e.target.value
                        dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.firmSettings, practiceAreas: updated } })
                      }} />
                    <button className="btn-icon" style={{ color: '#EA4335' }}
                      onClick={() => {
                        const updated = state.firmSettings.practiceAreas.filter((_, j) => j !== i)
                        dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.firmSettings, practiceAreas: updated } })
                        addToast('Practice area removed')
                      }}>✕</button>
                  </div>
                ))}
                <button className="btn btn-secondary" style={{ width: 'fit-content', marginTop: 8 }}
                  onClick={() => {
                    const updated = [...(state.firmSettings.practiceAreas || []), 'New Practice Area']
                    dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.firmSettings, practiceAreas: updated } })
                  }}>+ Add Practice Area</button>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Users & Permissions</h3>
              <div className="table-container" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
                <table>
                  <thead>
                    <tr className="table-header">
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Hourly Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                              {u.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span style={{ fontWeight: 500 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: '#5F6368' }}>{u.email}</td>
                        <td style={{ fontSize: 13 }}>{u.role}</td>
                        <td style={{ fontSize: 13 }}>${u.hourlyRate}/hr</td>
                        <td><span className="badge badge-paid">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 12, color: '#9AA0A6', marginTop: 12 }}>User management (invite, deactivate) is not available in this demo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
