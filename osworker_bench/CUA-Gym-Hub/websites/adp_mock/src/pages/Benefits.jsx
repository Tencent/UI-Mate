import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

const CATEGORY_ICONS = {
  Medical: '🛡️',
  Dental: '🦷',
  Vision: '👁️',
  'Life Insurance': '❤️',
  '401(k)': '🏦',
}

export default function Benefits() {
  const { state } = useApp()
  const { benefitPlans = [], companyInfo = {} } = state
  const [expanded, setExpanded] = useState(null)

  const totalCostPerPeriod = benefitPlans.reduce((s, p) => s + (p.employeeCostPerPeriod || 0), 0)

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>My Benefits</h1>
          <p>Benefits Effective Date: January 1, 2026 · Plan Year 2026</p>
        </div>
        <div style={{ textAlign: 'right', background: 'white', borderRadius: 'var(--radius)', padding: '12px 16px', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>Total Employee Cost</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>
            ${totalCostPerPeriod.toFixed(2)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-gray-medium)' }}>per pay period</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {benefitPlans.map(plan => {
          const isOpen = expanded === plan.id
          return (
            <div key={plan.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : plan.id)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 32 }}>{CATEGORY_ICONS[plan.category] || '📋'}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>{plan.category}</span>
                      <span className="badge badge-green">{plan.status}</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#374151' }}>{plan.planName}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-gray-medium)' }}>{plan.coverageLevel}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>
                    {plan.employeeCostPerPeriod === 0 ? 'Employer Paid' : `$${plan.employeeCostPerPeriod.toFixed(2)}`}
                  </div>
                  {plan.employeeCostPerPeriod > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>per pay period</div>
                  )}
                  <span style={{ fontSize: 16 }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {isOpen && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginBottom: 2 }}>Employer Contribution</div>
                      <div style={{ fontWeight: 500 }}>${plan.employerContribution?.toFixed(2) || '0.00'}/period</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginBottom: 2 }}>Effective Date</div>
                      <div style={{ fontWeight: 500 }}>{plan.effectiveDate}</div>
                    </div>
                    {plan.contributionPercent && (
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginBottom: 2 }}>Employee Contribution</div>
                        <div style={{ fontWeight: 500 }}>{plan.contributionPercent}% of gross</div>
                      </div>
                    )}
                    {plan.employerMatchPercent && (
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginBottom: 2 }}>Employer Match</div>
                        <div style={{ fontWeight: 500 }}>{plan.employerMatchPercent}% match</div>
                      </div>
                    )}
                    {plan.dependentsCovered?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginBottom: 2 }}>Dependents Covered</div>
                        <div style={{ fontWeight: 500 }}>{plan.dependentsCovered.join(', ')}</div>
                      </div>
                    )}
                  </div>
                  {plan.details && (
                    <div style={{ marginTop: 12, fontSize: 13, color: '#374151', background: '#F9FAFB', padding: '10px 12px', borderRadius: 6 }}>
                      {plan.details}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
