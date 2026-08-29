import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { CreditCard, Download, DollarSign, Plus, Check, ChevronDown } from 'lucide-react'

const sectionStyle = { background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 24, marginBottom: 20 }

export default function Billing() {
  const { state, dispatch } = useApp()
  const billing = state?.billing || {}
  const pm = billing.paymentMethod || {}
  const transactions = billing.transactions || []
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [manualAmount, setManualAmount] = useState('')
  const [showMakePayment, setShowMakePayment] = useState(false)
  const [paymentMade, setPaymentMade] = useState(false)
  const [thresholdEdit, setThresholdEdit] = useState(null)

  const handleMakePayment = () => {
    const amount = parseFloat(manualAmount)
    if (isNaN(amount) || amount <= 0) return
    const now = new Date().toISOString().slice(0, 10)
    const newTx = {
      id: `tx-${Date.now()}`,
      date: now,
      amount: amount,
      type: 'MANUAL_PAYMENT',
      description: 'Manual payment',
      paymentMethod: `${pm.type} ****${pm.last4}`,
    }
    const newBilling = {
      ...billing,
      accountBalance: (billing.accountBalance || 0) + amount,
      transactions: [newTx, ...transactions],
    }
    dispatch({ type: 'SET_STATE', payload: { ...state, billing: newBilling } })
    setShowMakePayment(false)
    setManualAmount('')
    setPaymentMade(true)
    setTimeout(() => setPaymentMade(false), 3000)
  }

  const handleUpdateThreshold = () => {
    const val = parseInt(thresholdEdit)
    if (isNaN(val) || val <= 0) return
    const newBilling = { ...billing, billingThreshold: val }
    dispatch({ type: 'SET_STATE', payload: { ...state, billing: newBilling } })
    setThresholdEdit(null)
  }

  const totalSpent = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, color: '#202124', marginBottom: 20 }}>Billing & Payments</h1>

      {paymentMade && (
        <div style={{ marginBottom: 16, padding: '10px 16px', background: '#E6F4EA', color: '#188038', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} /> Payment recorded successfully.
        </div>
      )}

      {/* Account Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div style={sectionStyle}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Account balance</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#1A73E8', marginBottom: 4 }}>${(billing.accountBalance || 0).toFixed(2)}</div>
          <div style={{ fontSize: 13, color: '#5F6368' }}>
            {billing.billingType === 'AUTOMATIC' ? 'Automatic payments' : 'Manual payments'} · {pm.type} ****{pm.last4}
          </div>
          <button
            onClick={() => setShowMakePayment(true)}
            style={{
              marginTop: 16, background: '#1A73E8', color: '#fff', border: 'none',
              borderRadius: 4, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Plus size={14} /> Make a payment
          </button>
        </div>

        <div style={sectionStyle}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Billing summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#5F6368' }}>Total payments</span>
              <span style={{ fontWeight: 500, color: '#188038' }}>
                ${transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0).toFixed(2)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#5F6368' }}>Total spent</span>
              <span style={{ fontWeight: 500, color: '#D93025' }}>-${totalSpent.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px solid #F1F3F4', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#5F6368' }}>Billing threshold</span>
              {thresholdEdit !== null ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>$</span>
                  <input
                    type="number" min="100" step="100"
                    value={thresholdEdit}
                    onChange={e => setThresholdEdit(e.target.value)}
                    style={{ width: 80, border: '1px solid #1A73E8', borderRadius: 2, padding: '2px 6px', fontSize: 12, outline: 'none' }}
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleUpdateThreshold(); if (e.key === 'Escape') setThresholdEdit(null) }}
                  />
                  <button onClick={handleUpdateThreshold} style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 2, padding: '2px 8px', fontSize: 11, cursor: 'pointer' }}>Save</button>
                </div>
              ) : (
                <span
                  style={{ fontWeight: 500, color: '#1A73E8', cursor: 'pointer' }}
                  onClick={() => setThresholdEdit(String(billing.billingThreshold || 500))}
                >
                  ${billing.billingThreshold || 500}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#202124' }}>Payment method</span>
          <button
            onClick={() => setShowAddPayment(!showAddPayment)}
            style={{ border: '1px solid #DADCE0', background: '#fff', borderRadius: 4, padding: '6px 14px', fontSize: 13, cursor: 'pointer', color: '#1A73E8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={14} /> Add payment method
          </button>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: 16,
          border: '2px solid #1A73E8', borderRadius: 8, background: '#E8F0FE',
        }}>
          <div style={{
            width: 48, height: 32, background: pm.type === 'VISA' ? '#1A1F71' : '#EB001B',
            borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
              {pm.type || 'VISA'}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#202124' }}>
              {pm.type} ending in {pm.last4}
            </div>
            <div style={{ fontSize: 12, color: '#5F6368' }}>
              Expires {pm.expiry} · {pm.name}
            </div>
          </div>
          <div style={{
            background: '#E6F4EA', color: '#188038', fontSize: 11, fontWeight: 500,
            padding: '3px 10px', borderRadius: 10,
          }}>
            Primary
          </div>
        </div>

        {showAddPayment && (
          <div style={{ marginTop: 16, padding: 16, border: '1px solid #DADCE0', borderRadius: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Add payment method</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#5F6368', marginBottom: 4 }}>Card number</div>
                <input style={{ width: '100%', border: '1px solid #DADCE0', borderRadius: 4, padding: '8px 12px', fontSize: 13, outline: 'none' }} placeholder="4242 4242 4242 4242" />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#5F6368', marginBottom: 4 }}>Expiry</div>
                  <input style={{ width: '100%', border: '1px solid #DADCE0', borderRadius: 4, padding: '8px 12px', fontSize: 13, outline: 'none' }} placeholder="MM/YY" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#5F6368', marginBottom: 4 }}>CVC</div>
                  <input style={{ width: '100%', border: '1px solid #DADCE0', borderRadius: 4, padding: '8px 12px', fontSize: 13, outline: 'none' }} placeholder="123" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowAddPayment(false)}
                  style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                >
                  Add card
                </button>
                <button
                  onClick={() => setShowAddPayment(false)}
                  style={{ background: '#fff', color: '#5F6368', border: '1px solid #DADCE0', borderRadius: 4, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#202124' }}>Transaction history</span>
          <button style={{ border: '1px solid #DADCE0', background: '#fff', borderRadius: 4, padding: '6px 14px', fontSize: 13, cursor: 'pointer', color: '#5F6368', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Download size={14} /> Export
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #DADCE0' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#5F6368', fontWeight: 500, fontSize: 12 }}>Date</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#5F6368', fontWeight: 500, fontSize: 12 }}>Description</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#5F6368', fontWeight: 500, fontSize: 12 }}>Payment method</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: '#5F6368', fontWeight: 500, fontSize: 12 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #F1F3F4' }}>
                  <td style={{ padding: '12px 12px', color: '#202124' }}>
                    {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 12px', color: '#202124' }}>
                    <div>{tx.description}</div>
                    <div style={{ fontSize: 11, color: '#5F6368' }}>
                      {tx.type === 'PAYMENT' ? 'Automatic' : tx.type === 'MANUAL_PAYMENT' ? 'Manual' : 'Ad costs'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 12px', color: '#5F6368' }}>
                    {tx.paymentMethod || '---'}
                  </td>
                  <td style={{
                    padding: '12px 12px', textAlign: 'right', fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                    color: tx.amount >= 0 ? '#188038' : '#D93025',
                  }}>
                    {tx.amount >= 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#5F6368' }}>No transactions yet.</div>
        )}
      </div>

      {/* Make Payment Modal */}
      {showMakePayment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setShowMakePayment(false) }}
        >
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>Make a payment</h3>
            <div style={{ fontSize: 13, color: '#5F6368', marginBottom: 16 }}>
              Charge to {pm.type} ending in {pm.last4}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#5F6368', marginBottom: 4 }}>Payment amount ($)</div>
              <input
                type="number"
                min="1"
                step="0.01"
                value={manualAmount}
                onChange={e => setManualAmount(e.target.value)}
                style={{ width: '100%', border: '1px solid #DADCE0', borderRadius: 4, padding: '10px 12px', fontSize: 14, outline: 'none' }}
                placeholder="100.00"
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowMakePayment(false)}
                style={{ background: '#fff', color: '#5F6368', border: '1px solid #DADCE0', borderRadius: 4, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleMakePayment}
                disabled={!manualAmount || parseFloat(manualAmount) <= 0}
                style={{
                  background: manualAmount && parseFloat(manualAmount) > 0 ? '#1A73E8' : '#DADCE0',
                  color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >
                Pay ${manualAmount || '0.00'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
