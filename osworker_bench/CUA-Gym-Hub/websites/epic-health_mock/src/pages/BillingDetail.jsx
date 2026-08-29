import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronLeft } from 'lucide-react'
import '../styles/common.css'

export default function BillingDetail() {
  const { id } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()

  const bill = (state.billingStatements || []).find(b => b.id === id)

  if (!bill) {
    return (
      <div>
        <button className="back-btn" onClick={() => navigate('/billing')}>
          <ChevronLeft size={16} /> Back to Billing
        </button>
        <p style={{ marginTop: 20 }}>Statement not found.</p>
      </div>
    )
  }

  const getStatusBadge = (status) => {
    if (status === 'Paid') return 'badge--green'
    if (status === 'Due') return 'badge--orange'
    if (status === 'Overdue') return 'badge--red'
    return 'badge--gray'
  }

  const totals = {
    charged: bill.lineItems.reduce((s, i) => s + i.chargedAmount, 0),
    insAdj: bill.lineItems.reduce((s, i) => s + i.insuranceAdjustment, 0),
    insPaid: bill.lineItems.reduce((s, i) => s + i.insurancePaid, 0),
    patient: bill.lineItems.reduce((s, i) => s + i.patientResponsibility, 0),
  }

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/billing')}>
        <ChevronLeft size={16} /> Back to Billing
      </button>

      <div style={{ marginTop: 16, marginBottom: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Statement from {bill.statementDate}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <span className={`badge ${getStatusBadge(bill.status)}`}>{bill.status}</span>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
              Due: {bill.dueDate}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Amount Due</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: bill.balanceDue > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            ${bill.balanceDue.toFixed(2)}
          </div>
          {bill.balanceDue > 0 && (
            <button className="btn btn--success btn--sm" style={{ marginTop: 8 }} onClick={() => navigate(`/billing/pay?bill=${bill.id}&amount=${bill.balanceDue}`)}>
              Pay This Statement
            </button>
          )}
        </div>
      </div>

      {/* Line Items */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Service Details</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Service Date</th>
                <th>Description</th>
                <th>Provider</th>
                <th style={{ textAlign: 'right' }}>Charged</th>
                <th style={{ textAlign: 'right' }}>Ins. Adjustment</th>
                <th style={{ textAlign: 'right' }}>Ins. Paid</th>
                <th style={{ textAlign: 'right' }}>You Owe</th>
              </tr>
            </thead>
            <tbody>
              {bill.lineItems.map(item => (
                <tr key={item.id}>
                  <td style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>{item.serviceDate}</td>
                  <td>
                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>{item.description}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>CPT: {item.cptCode}</div>
                  </td>
                  <td style={{ fontSize: 'var(--font-sm)' }}>{item.provider}</td>
                  <td style={{ textAlign: 'right', fontSize: 'var(--font-sm)' }}>${item.chargedAmount.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontSize: 'var(--font-sm)', color: 'var(--color-success)' }}>${item.insuranceAdjustment.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontSize: 'var(--font-sm)', color: 'var(--color-success)' }}>${item.insurancePaid.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontSize: 'var(--font-sm)', fontWeight: 700 }}>${item.patientResponsibility.toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--color-section-bg)', fontWeight: 700 }}>
                <td colSpan={3} style={{ fontSize: 'var(--font-sm)' }}>Totals</td>
                <td style={{ textAlign: 'right', fontSize: 'var(--font-sm)' }}>${totals.charged.toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontSize: 'var(--font-sm)', color: 'var(--color-success)' }}>${totals.insAdj.toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontSize: 'var(--font-sm)', color: 'var(--color-success)' }}>${totals.insPaid.toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontSize: 'var(--font-sm)' }}>${totals.patient.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
