import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { formatDate, formatCurrency } from '../utils/helpers'

const PayrollHistory = () => {
  const { state } = useAppContext()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(null)

  const payrolls = state?.payrolls || []
  const hasDraft = payrolls.some(p => p.status === 'Draft')
  const sorted = [...payrolls].sort((a, b) => new Date(b.checkDate) - new Date(a.checkDate))

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Payroll History</h1>
        {hasDraft && (
          <button className="btn-primary" onClick={() => navigate('/payroll/run')}>
            Run payroll
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Pay Period</th>
              <th>Check Date</th>
              <th>Employees</th>
              <th>Gross Pay</th>
              <th>Taxes</th>
              <th>Net Pay</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(payroll => (
              <React.Fragment key={payroll.id}>
                <tr
                  className="clickable"
                  onClick={() => setExpanded(expanded === payroll.id ? null : payroll.id)}
                >
                  <td>
                    <div style={{ fontWeight: '500' }}>
                      {formatDate(payroll.payPeriod.startDate)} – {formatDate(payroll.payPeriod.endDate)}
                    </div>
                  </td>
                  <td>{formatDate(payroll.checkDate)}</td>
                  <td>{payroll.employeeCount || '—'}</td>
                  <td>{payroll.totalGrossPay > 0 ? formatCurrency(payroll.totalGrossPay) : '—'}</td>
                  <td>{payroll.totalTaxes > 0 ? formatCurrency(payroll.totalTaxes) : '—'}</td>
                  <td>{payroll.totalNetPay > 0 ? formatCurrency(payroll.totalNetPay) : '—'}</td>
                  <td>
                    <span className={`badge badge-${payroll.status.toLowerCase()}`}>{payroll.status}</span>
                  </td>
                </tr>
                {expanded === payroll.id && (
                  <tr key={`${payroll.id}-expanded`}>
                    <td colSpan={7} style={{ padding: 0 }}>
                      <div style={{ background: 'var(--light-gray)', padding: '16px 24px' }}>
                        {payroll.employeeCompensations?.length > 0 ? (
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: 'left', fontSize: '12px', color: 'var(--medium-gray)', padding: '6px 8px' }}>Employee</th>
                                <th style={{ textAlign: 'right', fontSize: '12px', color: 'var(--medium-gray)', padding: '6px 8px' }}>Hours</th>
                                <th style={{ textAlign: 'right', fontSize: '12px', color: 'var(--medium-gray)', padding: '6px 8px' }}>Gross</th>
                                <th style={{ textAlign: 'right', fontSize: '12px', color: 'var(--medium-gray)', padding: '6px 8px' }}>Taxes</th>
                                <th style={{ textAlign: 'right', fontSize: '12px', color: 'var(--medium-gray)', padding: '6px 8px' }}>Net</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payroll.employeeCompensations.map(c => (
                                <tr key={c.employeeId}>
                                  <td style={{ padding: '6px 8px', fontSize: '13px' }}>{c.employeeName}</td>
                                  <td style={{ padding: '6px 8px', fontSize: '13px', textAlign: 'right' }}>{c.hoursWorked}</td>
                                  <td style={{ padding: '6px 8px', fontSize: '13px', textAlign: 'right' }}>{formatCurrency(c.grossPay)}</td>
                                  <td style={{ padding: '6px 8px', fontSize: '13px', textAlign: 'right' }}>{formatCurrency(c.taxes?.total || 0)}</td>
                                  <td style={{ padding: '6px 8px', fontSize: '13px', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(c.netPay)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>
                            {payroll.status === 'Draft'
                              ? 'This payroll has not been submitted yet.'
                              : 'No per-employee breakdown available for this payroll.'}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PayrollHistory
