import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { DollarSign, ChevronRight } from 'lucide-react'
import '../styles/common.css'

export default function Billing() {
  const { state } = useApp()
  const navigate = useNavigate()

  const bills = state.billingStatements || []
  const insurance = (state.insurance || [])[0]
  const totalDue = bills.reduce((sum, b) => sum + b.balanceDue, 0)

  const getStatusBadge = (status) => {
    if (status === 'Paid') return 'badge--green'
    if (status === 'Due') return 'badge--orange'
    if (status === 'Overdue') return 'badge--red'
    if (status === 'Payment Plan') return 'badge--blue'
    return 'badge--gray'
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <DollarSign size={22} style={{ color: 'var(--color-primary)' }} />
        Billing & Insurance
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
        {/* Main column */}
        <div>
          {/* Balance card */}
          <div className="section-card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', color: '#fff', border: 'none' }}>
            <div style={{ padding: '24px' }}>
              <div style={{ fontSize: 'var(--font-sm)', opacity: 0.85, marginBottom: 4 }}>Your Current Balance</div>
              <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
                ${totalDue.toFixed(2)}
              </div>
              <button
                className="btn"
                style={{ background: 'var(--color-success)', color: '#fff' }}
                onClick={() => navigate('/billing/pay')}
                disabled={totalDue === 0}
              >
                Pay Now
              </button>
            </div>
          </div>

          {/* Statements list */}
          <div className="section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">Recent Statements</h2>
            </div>
            {bills.length === 0 ? (
              <div className="section-card-body" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No billing statements.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Statement Date</th>
                    <th>Service Dates</th>
                    <th>Total</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(bill => (
                    <tr
                      key={bill.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/billing/${bill.id}`)}
                    >
                      <td style={{ fontSize: 'var(--font-sm)' }}>{bill.statementDate}</td>
                      <td style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                        {bill.lineItems?.[0]?.serviceDate || '—'}
                      </td>
                      <td style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>${bill.totalAmount.toFixed(2)}</td>
                      <td style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: bill.balanceDue > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        ${bill.balanceDue.toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(bill.status)}`}>{bill.status}</span>
                      </td>
                      <td>
                        <ChevronRight size={16} style={{ color: 'var(--color-text-secondary)' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Insurance sidebar */}
        <div>
          {insurance && (
            <div className="section-card">
              <div className="section-card-header">
                <h2 className="section-card-title">Insurance</h2>
              </div>
              <div className="section-card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 'var(--font-sm)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Plan</div>
                    <div style={{ fontWeight: 600 }}>{insurance.planName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Member ID</div>
                    <div style={{ fontWeight: 600 }}>{insurance.memberId}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Deductible Met</div>
                    <div style={{ fontWeight: 600 }}>${insurance.deductible.metAmount} / ${insurance.deductible.individual}</div>
                    <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(insurance.deductible.metAmount / insurance.deductible.individual) * 100}%`, background: 'var(--color-primary)', borderRadius: 3 }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Out-of-Pocket Met</div>
                    <div style={{ fontWeight: 600 }}>${insurance.outOfPocketMax.metAmount} / ${insurance.outOfPocketMax.individual}</div>
                    <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(insurance.outOfPocketMax.metAmount / insurance.outOfPocketMax.individual) * 100}%`, background: 'var(--color-success)', borderRadius: 3 }} />
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-xs)', marginBottom: 8 }}>Copays</div>
                    {Object.entries(insurance.copay).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', marginBottom: 4 }}>
                        <span style={{ textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                        <span style={{ fontWeight: 600 }}>${v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn btn--outline btn--sm" style={{ marginTop: 12, width: '100%' }} onClick={() => navigate('/insurance')}>
                  View Full Insurance Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
