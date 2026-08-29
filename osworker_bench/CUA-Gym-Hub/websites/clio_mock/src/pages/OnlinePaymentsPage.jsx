import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'

export default function OnlinePaymentsPage() {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const payments = state.onlinePayments || { enabled: false, processor: '', acceptedMethods: [], recentPayments: [], paymentLinks: [], autoReminders: false, reminderDays: [], surchargeEnabled: false, surchargeRate: 0 }
  const [tab, setTab] = useState('overview')

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const toggleEnabled = () => {
    dispatch({ type: 'UPDATE_ONLINE_PAYMENTS', payload: { enabled: !payments.enabled } })
    addToast(payments.enabled ? 'Online payments disabled' : 'Online payments enabled')
  }

  const toggleMethod = (method) => {
    const methods = payments.acceptedMethods.includes(method)
      ? payments.acceptedMethods.filter(m => m !== method)
      : [...payments.acceptedMethods, method]
    dispatch({ type: 'UPDATE_ONLINE_PAYMENTS', payload: { acceptedMethods: methods } })
    addToast('Payment methods updated')
  }

  const toggleReminders = () => {
    dispatch({ type: 'UPDATE_ONLINE_PAYMENTS', payload: { autoReminders: !payments.autoReminders } })
    addToast(payments.autoReminders ? 'Auto reminders disabled' : 'Auto reminders enabled')
  }

  const toggleSurcharge = () => {
    dispatch({ type: 'UPDATE_ONLINE_PAYMENTS', payload: { surchargeEnabled: !payments.surchargeEnabled } })
    addToast(payments.surchargeEnabled ? 'Credit card surcharge disabled' : 'Credit card surcharge enabled')
  }

  const totalReceived = (payments.recentPayments || []).filter(p => p.status === 'Completed').reduce((s, p) => s + p.amount, 0)
  const pending = (payments.recentPayments || []).filter(p => p.status === 'Pending')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Online Payments</h1>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: '#5F6368', marginBottom: 4 }}>Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: payments.enabled ? '#2E7D32' : '#C62828' }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>{payments.enabled ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ fontSize: 12, color: '#9AA0A6', marginTop: 4 }}>Processor: {payments.processor || '—'}</div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: '#5F6368', marginBottom: 4 }}>Total Received</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#2E7D32' }}>{fmt(totalReceived)}</div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: '#5F6368', marginBottom: 4 }}>Pending</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#E65100' }}>{fmt(pending.reduce((s, p) => s + p.amount, 0))}</div>
              <div style={{ fontSize: 12, color: '#9AA0A6', marginTop: 4 }}>{pending.length} pending payment{pending.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: '#5F6368', marginBottom: 4 }}>Payment Links</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1A73E8' }}>{(payments.paymentLinks || []).length}</div>
              <div style={{ fontSize: 12, color: '#9AA0A6', marginTop: 4 }}>{(payments.paymentLinks || []).filter(l => l.status === 'Active').length} active</div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Payments</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8F9FA' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Date</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Contact</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Method</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Status</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, fontSize: 12 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(payments.recentPayments || []).map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #EAECF0' }}>
                    <td style={{ padding: '10px 16px' }}>{p.date}</td>
                    <td style={{ padding: '10px 16px' }}>{p.contactName}</td>
                    <td style={{ padding: '10px 16px' }}>
                      {p.method === 'credit_card' ? `Card ****${p.last4}` : `Bank ****${p.last4}`}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, background: p.status === 'Completed' ? '#E8F5E9' : '#FFF3E0', color: p.status === 'Completed' ? '#2E7D32' : '#E65100' }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600 }}>{fmt(p.amount)}</td>
                  </tr>
                ))}
                {(payments.recentPayments || []).length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#9AA0A6' }}>No payments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'transactions' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Payment Links</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8F9FA' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Link ID</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>URL</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Status</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {(payments.paymentLinks || []).map(l => (
                <tr key={l.id} style={{ borderTop: '1px solid #EAECF0' }}>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12 }}>{l.id}</td>
                  <td style={{ padding: '10px 16px', color: '#1A73E8', fontSize: 12 }}>{l.url}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, background: l.status === 'Active' ? '#E3F2FD' : '#E8F5E9', color: l.status === 'Active' ? '#1565C0' : '#2E7D32' }}>{l.status}</span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>{l.createdAt}</td>
                </tr>
              ))}
              {(payments.paymentLinks || []).length === 0 && (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#9AA0A6' }}>No payment links created</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'settings' && (
        <div style={{ maxWidth: 560 }}>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Enable Online Payments</div>
                <div style={{ fontSize: 12, color: '#5F6368' }}>Allow clients to pay invoices online</div>
              </div>
              <button onClick={toggleEnabled} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: payments.enabled ? '#1A73E8' : '#ccc', position: 'relative', transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: 2, left: payments.enabled ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Accepted Payment Methods</div>
            {[{ id: 'credit_card', label: 'Credit/Debit Cards' }, { id: 'bank_transfer', label: 'Bank Transfer (ACH)' }, { id: 'check', label: 'eCheck' }].map(m => (
              <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={payments.acceptedMethods.includes(m.id)} onChange={() => toggleMethod(m.id)} />
                {m.label}
              </label>
            ))}
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Auto Payment Reminders</div>
                <div style={{ fontSize: 12, color: '#5F6368' }}>Send automatic reminders for unpaid invoices at {(payments.reminderDays || []).join(', ')} days</div>
              </div>
              <button onClick={toggleReminders} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: payments.autoReminders ? '#1A73E8' : '#ccc', position: 'relative', transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: 2, left: payments.autoReminders ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Credit Card Surcharge</div>
                <div style={{ fontSize: 12, color: '#5F6368' }}>Pass credit card processing fees to clients</div>
              </div>
              <button onClick={toggleSurcharge} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: payments.surchargeEnabled ? '#1A73E8' : '#ccc', position: 'relative', transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: 2, left: payments.surchargeEnabled ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
