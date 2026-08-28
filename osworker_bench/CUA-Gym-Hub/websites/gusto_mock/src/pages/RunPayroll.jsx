import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { formatDate, formatCurrency } from '../utils/helpers'

const STEPS = ['1. Hours', '2. Time Off', '3. Review', '4. Confirmation']

const RunPayroll = () => {
  const { state, updatePayroll, addPayroll } = useAppContext()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const employees = (state?.employees || []).filter(e => e.status === 'Active')
  const draftPayroll = (state?.payrolls || []).find(p => p.status === 'Draft')

  // Initialize payroll data
  const [hoursData, setHoursData] = useState(() =>
    employees.map(emp => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      jobTitle: emp.jobTitle,
      hoursWorked: emp.compensation.type === 'Salary' ? 80 : 80,
      bonus: 0,
      commission: 0,
      reimbursement: 0,
      basePay: emp.compensation.type === 'Salary'
        ? emp.compensation.amount / 26
        : emp.compensation.amount * 80,
      compensationType: emp.compensation.type
    }))
  )

  const [timeOffData, setTimeOffData] = useState(() =>
    employees.map(emp => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      vacationHours: 0,
      sickHours: 0,
      holidayHours: 0
    }))
  )

  const updateHours = (empId, field, value) => {
    setHoursData(prev => prev.map(e =>
      e.id === empId ? { ...e, [field]: parseFloat(value) || 0 } : e
    ))
  }

  const updateTimeOff = (empId, field, value) => {
    setTimeOffData(prev => prev.map(e =>
      e.id === empId ? { ...e, [field]: parseFloat(value) || 0 } : e
    ))
  }

  const getGrossPay = (emp) => emp.basePay + emp.bonus + emp.commission + emp.reimbursement

  const totalGross = hoursData.reduce((s, e) => s + getGrossPay(e), 0)
  const totalTaxes = totalGross * 0.25
  const totalBenefits = employees.length * 300
  const totalNet = totalGross - totalTaxes - totalBenefits
  const debitDate = draftPayroll ? new Date(draftPayroll.checkDate) : new Date()
  debitDate.setDate(debitDate.getDate() - 3)

  const handleSubmit = () => {
    if (!draftPayroll) return

    const compensations = hoursData.map(e => ({
      employeeId: e.id,
      employeeName: e.name,
      hoursWorked: e.hoursWorked,
      grossPay: getGrossPay(e),
      taxes: { total: getGrossPay(e) * 0.25 },
      benefits: { total: 300 },
      netPay: getGrossPay(e) * 0.75 - 300,
      additionalEarnings: { bonus: e.bonus, commission: e.commission, reimbursement: e.reimbursement }
    }))

    updatePayroll(draftPayroll.id, {
      status: 'Complete',
      totalGrossPay: totalGross,
      totalTaxes,
      totalBenefits,
      totalNetPay: totalNet,
      totalReimbursements: hoursData.reduce((s, e) => s + e.reimbursement, 0),
      employeeCount: employees.length,
      debitDate: debitDate.toISOString().split('T')[0],
      employeeCompensations: compensations
    })

    // Add new draft payroll for next period
    const nextStart = new Date(draftPayroll.payPeriod.endDate)
    nextStart.setDate(nextStart.getDate() + 3)
    const nextEnd = new Date(nextStart)
    nextEnd.setDate(nextEnd.getDate() + 13)
    const nextCheck = new Date(nextEnd)
    nextCheck.setDate(nextCheck.getDate() + 7)

    addPayroll({
      id: `pay_${Date.now()}`,
      status: 'Draft',
      payPeriod: {
        startDate: nextStart.toISOString().split('T')[0],
        endDate: nextEnd.toISOString().split('T')[0]
      },
      checkDate: nextCheck.toISOString().split('T')[0],
      deadline: new Date(nextCheck.getTime() - 3 * 86400000).toISOString(),
      totalGrossPay: 0,
      totalTaxes: 0,
      totalBenefits: 0,
      totalNetPay: 0,
      totalReimbursements: 0,
      employeeCompensations: []
    })

    setStep(3)
  }

  if (!draftPayroll) {
    return (
      <div className="page-container">
        <h1 className="page-title">Run Payroll</h1>
        <div className="card" style={{ marginTop: '24px', textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2>No payroll to run</h2>
          <p style={{ color: 'var(--medium-gray)', marginTop: '8px' }}>All payrolls have been processed.</p>
          <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/payroll/history')}>
            View payroll history
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container" style={{ maxWidth: '1100px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Run Payroll</h1>
          <p className="page-subtitle">Pay period: {formatDate(draftPayroll.payPeriod.startDate)} – {formatDate(draftPayroll.payPeriod.endDate)}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        {STEPS.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '600',
                background: i < step ? 'var(--teal)' : i === step ? 'var(--coral)' : 'var(--border)',
                color: i <= step ? 'white' : 'var(--medium-gray)'
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '13px', fontWeight: i === step ? '600' : '400', color: i === step ? 'var(--charcoal)' : 'var(--medium-gray)', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: i < step ? 'var(--teal)' : 'var(--border)', margin: '0 12px' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 - Hours */}
      {step === 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3>Employee Hours & Earnings</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '200px' }}>Employee</th>
                  <th>Hours Worked</th>
                  <th>Bonus ($)</th>
                  <th>Commission ($)</th>
                  <th>Reimbursement ($)</th>
                  <th style={{ textAlign: 'right' }}>Gross Pay</th>
                </tr>
              </thead>
              <tbody>
                {hoursData.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{emp.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{emp.jobTitle}</div>
                    </td>
                    <td>
                      <input type="number" value={emp.hoursWorked} onChange={e => updateHours(emp.id, 'hoursWorked', e.target.value)}
                        style={{ width: '80px', padding: '5px 8px' }} min="0" max="200" />
                    </td>
                    <td>
                      <input type="number" value={emp.bonus || ''} onChange={e => updateHours(emp.id, 'bonus', e.target.value)}
                        style={{ width: '90px', padding: '5px 8px' }} min="0" placeholder="0.00" />
                    </td>
                    <td>
                      <input type="number" value={emp.commission || ''} onChange={e => updateHours(emp.id, 'commission', e.target.value)}
                        style={{ width: '90px', padding: '5px 8px' }} min="0" placeholder="0.00" />
                    </td>
                    <td>
                      <input type="number" value={emp.reimbursement || ''} onChange={e => updateHours(emp.id, 'reimbursement', e.target.value)}
                        style={{ width: '90px', padding: '5px 8px' }} min="0" placeholder="0.00" />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>{formatCurrency(getGrossPay(emp))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--light-gray)', fontWeight: '600' }}>
                  <td colSpan={5} style={{ padding: '12px 16px' }}>Total</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency(totalGross)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Step 2 - Time Off */}
      {step === 1 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3>Time Off Used This Period</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Vacation Hours</th>
                <th>Sick Hours</th>
                <th>Holiday Hours</th>
              </tr>
            </thead>
            <tbody>
              {timeOffData.map(emp => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: '500' }}>{emp.name}</td>
                  <td>
                    <input type="number" value={emp.vacationHours || ''} onChange={e => updateTimeOff(emp.id, 'vacationHours', e.target.value)}
                      style={{ width: '80px', padding: '5px 8px' }} min="0" placeholder="0" />
                  </td>
                  <td>
                    <input type="number" value={emp.sickHours || ''} onChange={e => updateTimeOff(emp.id, 'sickHours', e.target.value)}
                      style={{ width: '80px', padding: '5px 8px' }} min="0" placeholder="0" />
                  </td>
                  <td>
                    <input type="number" value={emp.holidayHours || ''} onChange={e => updateTimeOff(emp.id, 'holidayHours', e.target.value)}
                      style={{ width: '80px', padding: '5px 8px' }} min="0" placeholder="0" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Step 3 - Review */}
      {step === 2 && (
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--medium-gray)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Debit Amount</div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{formatCurrency(totalGross + totalTaxes + totalBenefits)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--medium-gray)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Debit Date</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{formatDate(debitDate.toISOString().split('T')[0])}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--medium-gray)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Employee Pay Date</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{formatDate(draftPayroll.checkDate)}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <h4 style={{ marginBottom: '12px' }}>Payroll Summary</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                <span>Total Gross Pay</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(totalGross)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                <span>Employee Taxes (est. 25%)</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(totalTaxes)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                <span>Benefits Deductions</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(totalBenefits)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '15px', fontWeight: '700', borderTop: '1px solid var(--border)', marginTop: '6px' }}>
                <span>Total Net Pay</span>
                <span>{formatCurrency(totalNet)}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontWeight: '600' }}>Employee Details</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Gross Pay</th>
                  <th>Taxes</th>
                  <th>Benefits</th>
                  <th style={{ textAlign: 'right' }}>Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {hoursData.map(emp => {
                  const gross = getGrossPay(emp)
                  const taxes = gross * 0.25
                  const benefits = 300
                  const net = gross - taxes - benefits
                  return (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: '500' }}>{emp.name}</td>
                      <td>{formatCurrency(gross)}</td>
                      <td>{formatCurrency(taxes)}</td>
                      <td>{formatCurrency(benefits)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>{formatCurrency(net)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 4 - Confirmation */}
      {step === 3 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: 'var(--success)' }}>
            Payroll has been submitted!
          </h2>
          <p style={{ color: 'var(--medium-gray)', marginBottom: '24px', fontSize: '15px' }}>
            Debit date: {formatDate(debitDate.toISOString().split('T')[0])} · Pay date: {formatDate(draftPayroll.checkDate)}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => navigate('/')}>Return to dashboard</button>
            <button className="btn-outline" onClick={() => navigate('/payroll/history')}>View payroll history</button>
          </div>
        </div>
      )}

      {/* Footer buttons */}
      {step < 3 && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
          {step > 0 && <button className="btn-outline" onClick={() => setStep(s => s - 1)}>Back</button>}
          <button className="btn-outline" onClick={() => navigate('/')}>Save changes for later</button>
          {step < 2
            ? <button className="btn-primary" onClick={() => setStep(s => s + 1)}>Save & Continue</button>
            : <button className="btn-primary" onClick={handleSubmit}>Submit payroll</button>
          }
        </div>
      )}
    </div>
  )
}

export default RunPayroll
