import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { ArrowLeft } from 'lucide-react'
import { RecordPaymentModal } from '../components/Modals'

function getBadgeClass(status) {
  const map = { Draft: 'badge-draft', 'Awaiting Approval': 'badge-awaiting', Sent: 'badge-sent', Paid: 'badge-paid', Overdue: 'badge-overdue', Void: 'badge-void' }
  return map[status] || 'badge-closed'
}

export default function BillDetail() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const bill = state.bills.find(b => b.id === id)
  if (!bill) return <div style={{ padding: 40, color: '#5F6368' }}>Bill not found. <Link to="/billing">Back to Billing</Link></div>

  const client = state.contacts.find(c => c.id === bill.clientId)
  const matter = state.matters.find(m => m.id === bill.matterId)
  const firm = state.firmSettings

  const handleSend = () => {
    dispatch({ type: 'UPDATE_BILL', payload: { ...bill, status: 'Sent', updatedAt: new Date().toISOString() } })
    addToast('Bill sent')
  }

  const handleVoid = () => {
    if (!window.confirm('Void this bill?')) return
    dispatch({ type: 'UPDATE_BILL', payload: { ...bill, status: 'Void', updatedAt: new Date().toISOString() } })
    addToast('Bill voided')
  }

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/billing')} style={{ marginBottom: 12 }}>
        <ArrowLeft size={14} /> Back to Billing
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{bill.billNumber}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className={`badge ${getBadgeClass(bill.status)}`}>{bill.status}</span>
              {client && <span className="text-link" style={{ cursor: 'pointer' }} onClick={() => navigate(`/contacts/${bill.clientId}`)}>{client.displayName}</span>}
              {matter && <span className="text-link" style={{ cursor: 'pointer' }} onClick={() => navigate(`/matters/${bill.matterId}`)}>{matter.matterNumber}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(bill.status === 'Draft' || bill.status === 'Awaiting Approval') && (
              <button className="btn btn-secondary" onClick={handleSend}>Send</button>
            )}
            {(bill.status === 'Sent' || bill.status === 'Overdue') && (
              <button className="btn btn-primary" onClick={() => setShowPaymentModal(true)}>Record Payment</button>
            )}
            {bill.status !== 'Void' && bill.status !== 'Paid' && (
              <button className="btn btn-danger" onClick={handleVoid}>Void</button>
            )}
          </div>
        </div>
      </div>

      {/* Bill Body */}
      <div className="card">
        {/* Firm and Client Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1A73E8', marginBottom: 4 }}>{firm.firmName}</div>
            <div style={{ fontSize: 13, color: '#5F6368', lineHeight: '20px' }}>
              {firm.address.street}<br />
              {firm.address.city}, {firm.address.state} {firm.address.zip}<br />
              {firm.phone}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#5F6368', marginBottom: 4 }}>BILL TO</div>
            {client && (
              <div style={{ fontSize: 13, lineHeight: '20px' }}>
                <div style={{ fontWeight: 600 }}>{client.displayName}</div>
                {client.address && (
                  <>
                    <div>{client.address.street}</div>
                    <div>{client.address.city}, {client.address.state} {client.address.zip}</div>
                  </>
                )}
                {client.email && <div>{client.email}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Bill Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24, padding: 16, background: '#F5F6FA', borderRadius: 8 }}>
          {[
            ['Bill Number', bill.billNumber],
            ['Issued Date', bill.issuedDate || 'TBD'],
            ['Due Date', bill.dueDate || 'TBD'],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Line Items */}
        <table style={{ width: '100%', marginBottom: 16 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E0E0E0' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#5F6368' }}>Description</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#5F6368' }}>Hours/Qty</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#5F6368' }}>Rate</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#5F6368' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(bill.lineItems || []).map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #EEEEEE' }}>
                <td style={{ padding: '10px 12px', fontSize: 13 }}>{item.description}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13 }}>{item.hours || item.quantity || 1}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13 }}>${item.rate}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontWeight: 500 }}>${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 300 }}>
            {[
              ['Subtotal', `$${bill.subtotal.toFixed(2)}`],
              ...(bill.taxRate > 0 ? [[`Tax (${bill.taxRate}%)`, `$${bill.taxAmount?.toFixed(2)}`]] : []),
              ['Total Due', `$${bill.totalDue.toFixed(2)}`],
              ['Amount Paid', `$${bill.amountPaid.toFixed(2)}`],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #EEEEEE', fontSize: 13 }}>
                <span style={{ color: '#5F6368' }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 16, fontWeight: 700 }}>
              <span>Balance Due</span>
              <span style={{ color: bill.balance > 0 ? '#EA4335' : '#34A853' }}>${bill.balance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {bill.memo && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #EEEEEE' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5F6368', marginBottom: 4 }}>MEMO</div>
            <p style={{ fontSize: 13 }}>{bill.memo}</p>
          </div>
        )}
      </div>

      {showPaymentModal && <RecordPaymentModal bill={bill} onClose={() => setShowPaymentModal(false)} />}
    </div>
  )
}
