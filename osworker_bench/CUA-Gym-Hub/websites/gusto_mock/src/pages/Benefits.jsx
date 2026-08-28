import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { formatCurrency, getInitials, getAvatarColor } from '../utils/helpers'

const ICONS = {
  Medical: '\u{1F3E5}',
  Dental: '\u{1F9B7}',
  Vision: '\u{1F441}',
  '401(k)': '\u{1F4C8}'
}

const Benefits = () => {
  const { state, updateState } = useAppContext()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [enrollEmpId, setEnrollEmpId] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const toast = (msg) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const plans = state?.benefitPlans || []
  const employees = state?.employees || []

  const totalEmployerMonthly = plans.reduce((s, p) => s + (p.monthlyCostEmployer || 0), 0)

  const getEnrolledEmployees = (plan) => {
    const planKey = plan.type === '401(k)' ? '401k' : plan.type.toLowerCase()
    return employees.filter(e =>
      e.benefits.some(b => b.toLowerCase().replace(/[^a-z0-9]/g, '') === planKey.replace(/[^a-z0-9]/g, ''))
    )
  }

  const handleEnroll = () => {
    if (!enrollEmpId || !selectedPlan) return
    const planKey = selectedPlan.type === '401(k)' ? '401k' : selectedPlan.type.toLowerCase()

    updateState(prev => ({
      ...prev,
      employees: prev.employees.map(e => {
        if (e.id !== enrollEmpId) return e
        if (e.benefits.includes(planKey)) return e
        return { ...e, benefits: [...e.benefits, planKey] }
      }),
      benefitPlans: prev.benefitPlans.map(p =>
        p.id === selectedPlan.id ? { ...p, enrolledCount: (p.enrolledCount || 0) + 1 } : p
      )
    }))
    setEnrollEmpId('')
    setShowEnrollModal(false)
    toast(`Employee enrolled in ${selectedPlan.planName}`)
  }

  const handleUnenroll = (empId) => {
    if (!selectedPlan) return
    const planKey = selectedPlan.type === '401(k)' ? '401k' : selectedPlan.type.toLowerCase()

    updateState(prev => ({
      ...prev,
      employees: prev.employees.map(e => {
        if (e.id !== empId) return e
        return { ...e, benefits: e.benefits.filter(b => b.toLowerCase().replace(/[^a-z0-9]/g, '') !== planKey.replace(/[^a-z0-9]/g, '')) }
      }),
      benefitPlans: prev.benefitPlans.map(p =>
        p.id === selectedPlan.id ? { ...p, enrolledCount: Math.max(0, (p.enrolledCount || 0) - 1) } : p
      )
    }))
    toast(`Employee removed from ${selectedPlan.planName}`)
  }

  // Detail view for a selected plan
  if (selectedPlan) {
    const enrolled = getEnrolledEmployees(selectedPlan)
    const planKey = selectedPlan.type === '401(k)' ? '401k' : selectedPlan.type.toLowerCase()
    const unenrolled = employees.filter(e =>
      e.status === 'Active' && !e.benefits.some(b => b.toLowerCase().replace(/[^a-z0-9]/g, '') === planKey.replace(/[^a-z0-9]/g, ''))
    )

    return (
      <div className="page-container">
        <div style={{ fontSize: '13px', color: 'var(--medium-gray)', marginBottom: '20px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', color: 'var(--teal)' }} onClick={() => setSelectedPlan(null)}>Benefits</span>
          <span>&rsaquo;</span>
          <span>{selectedPlan.planName}</span>
        </div>

        <div className="page-header">
          <div>
            <h1 className="page-title">{selectedPlan.planName}</h1>
            <p className="page-subtitle">{selectedPlan.provider} &middot; {selectedPlan.coverage}</p>
          </div>
          <button className="btn-primary" onClick={() => { setShowEnrollModal(true); setEnrollEmpId('') }}>
            + Enroll employee
          </button>
        </div>

        {/* Plan details */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--medium-gray)', marginBottom: '4px' }}>Employee cost</div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>
                {selectedPlan.monthlyCostEmployee > 0 ? formatCurrency(selectedPlan.monthlyCostEmployee) + '/mo' : selectedPlan.employeeContributionPercent || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--medium-gray)', marginBottom: '4px' }}>Employer cost</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--teal)' }}>
                {selectedPlan.monthlyCostEmployer > 0 ? formatCurrency(selectedPlan.monthlyCostEmployer) + '/mo' : selectedPlan.employerMatchPercent || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--medium-gray)', marginBottom: '4px' }}>Enrolled</div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>{enrolled.length} employees</div>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--medium-gray)', marginTop: '16px', lineHeight: '1.5' }}>
            {selectedPlan.description}
          </p>
        </div>

        {/* Enrolled employees list */}
        <h3 style={{ marginBottom: '12px' }}>Enrolled Employees</h3>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {enrolled.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar avatar-sm" style={{ background: getAvatarColor(`${emp.firstName} ${emp.lastName}`) }}>
                        {getInitials(emp.firstName, emp.lastName)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{emp.firstName} {emp.lastName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{emp.jobTitle}</div>
                      </div>
                    </div>
                  </td>
                  <td>{emp.department}</td>
                  <td><span className={`badge badge-${emp.status.toLowerCase()}`}>{emp.status}</span></td>
                  <td>
                    <button className="btn-danger btn-sm" onClick={() => handleUnenroll(emp.id)}>Remove</button>
                  </td>
                </tr>
              ))}
              {enrolled.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--medium-gray)', padding: '32px' }}>No employees enrolled</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Enroll modal */}
        {showEnrollModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEnrollModal(false)}>
            <div className="modal-content" style={{ width: '420px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>Enroll Employee</h2>
                <button onClick={() => setShowEnrollModal(false)} style={{ background: 'none', color: 'var(--medium-gray)', fontSize: '20px', padding: 0 }}>&times;</button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--medium-gray)', marginBottom: '16px' }}>
                Select an employee to enroll in {selectedPlan.planName}
              </p>
              <div className="form-field">
                <label>Employee</label>
                <select value={enrollEmpId} onChange={e => setEnrollEmpId(e.target.value)}>
                  <option value="">Select employee...</option>
                  {unenrolled.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} - {e.department}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="btn-outline" onClick={() => setShowEnrollModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleEnroll} disabled={!enrollEmpId}>Enroll</button>
              </div>
            </div>
          </div>
        )}

        {showToast && <div className="toast">{toastMsg}</div>}
      </div>
    )
  }

  // Plans overview
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Benefits</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {plans.map(plan => (
          <div
            key={plan.id}
            className="card"
            style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
            onClick={() => setSelectedPlan(plan)}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>{ICONS[plan.type] || '\u{1F4CB}'}</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{plan.planName}</div>
                <div style={{ fontSize: '13px', color: 'var(--medium-gray)', marginTop: '2px' }}>{plan.provider}</div>
                <div style={{ fontSize: '12px', color: 'var(--medium-gray)', marginTop: '2px' }}>Coverage: {plan.coverage}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginBottom: '12px' }}>
              {plan.type !== '401(k)' ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <div>
                    <div style={{ color: 'var(--medium-gray)', fontSize: '12px' }}>Employee pays</div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{formatCurrency(plan.monthlyCostEmployee)}<span style={{ fontSize: '12px', color: 'var(--medium-gray)', fontWeight: '400' }}>/mo</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--medium-gray)', fontSize: '12px' }}>Employer pays</div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{formatCurrency(plan.monthlyCostEmployer)}<span style={{ fontSize: '12px', color: 'var(--medium-gray)', fontWeight: '400' }}>/mo</span></div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--medium-gray)' }}>Employee contribution</span>
                    <span style={{ fontWeight: '500' }}>{plan.employeeContributionPercent}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--medium-gray)' }}>Employer match</span>
                    <span style={{ fontWeight: '500' }}>{plan.employerMatchPercent}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: 'var(--light-gray)', borderRadius: '6px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ color: 'var(--medium-gray)' }}>Enrolled</span>
              <span style={{ fontWeight: '600' }}>{getEnrolledEmployees(plan).length} employees</span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--medium-gray)', marginTop: '12px', lineHeight: '1.5' }}>
              {plan.description}
            </p>
          </div>
        ))}
      </div>

      {/* Company Total */}
      <div className="card" style={{ background: 'var(--teal-light)', border: '1px solid rgba(0,160,125,0.2)' }}>
        <h3 style={{ color: 'var(--teal)', marginBottom: '16px' }}>Company Benefits Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--medium-gray)', marginBottom: '4px' }}>Total plans</div>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>{plans.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--medium-gray)', marginBottom: '4px' }}>Monthly employer cost</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--teal)' }}>{formatCurrency(totalEmployerMonthly)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--medium-gray)', marginBottom: '4px' }}>Annual employer cost</div>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrency(totalEmployerMonthly * 12)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Benefits
