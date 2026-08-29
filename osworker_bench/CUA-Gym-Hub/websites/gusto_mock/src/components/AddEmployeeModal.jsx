import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const STEP_LABELS = ['1. Basics', '2. Employment details', '3. Review & send']

const AddEmployeeModal = ({ onClose }) => {
  const { state, addEmployee } = useAppContext()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    personalEmail: '',
    jobTitle: '',
    managerId: '',
    department: '',
    startDate: '',
    employmentType: 'Full-time',
    compensationType: 'Salary',
    compensationAmount: '',
    compensationPer: 'Year',
    location: 'HQ - San Francisco',
    locationId: 'loc_1'
  })

  const employees = state?.employees || []
  const departments = state?.company?.departments || []
  const locations = state?.company?.locations || []

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const isStep1Valid = form.firstName && form.lastName && form.personalEmail && form.startDate
  const isStep2Valid = form.compensationAmount

  const handleSubmit = () => {
    const manager = employees.find(e => e.id === form.managerId)
    const dept = departments.find(d => d.id === form.department)

    const newId = `emp_${Date.now()}`
    const newEmp = {
      id: newId,
      firstName: form.firstName,
      lastName: form.lastName,
      middleName: form.middleName,
      email: `${form.firstName.toLowerCase()}.${form.lastName.toLowerCase()}@horizontech.com`,
      personalEmail: form.personalEmail,
      phone: '',
      dateOfBirth: '',
      ssn: '',
      address: { street1: '', street2: '', city: '', state: '', zip: '' },
      department: dept?.name || form.department,
      departmentId: form.department,
      jobTitle: form.jobTitle,
      managerId: form.managerId || null,
      managerName: manager ? `${manager.firstName} ${manager.lastName}` : null,
      employmentType: form.employmentType,
      compensation: {
        type: form.compensationType,
        amount: parseFloat(form.compensationAmount) || 0,
        per: form.compensationPer
      },
      startDate: form.startDate,
      status: 'Onboarding',
      location: form.location,
      locationId: form.locationId,
      payMethod: 'Direct Deposit',
      federalFilingStatus: 'Single',
      stateFilingStatus: 'Single',
      allowances: 1,
      benefits: [],
      pto: { vacationBalance: 0, sickBalance: 0, vacationAccrualRate: 6.67, sickAccrualRate: 3.33 },
      avatar: null
    }

    addEmployee(newEmp)
    onClose()
    navigate('/people/team-members')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ width: '680px', maxWidth: '95vw', padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2>Add new employee</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--medium-gray)', fontSize: '20px', padding: '0', lineHeight: 1 }}>×</button>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEP_LABELS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
              {i < STEP_LABELS.length - 1 && (
                <div style={{ flex: 1, height: '1px', background: i < step ? 'var(--teal)' : 'var(--border)', margin: '0 12px' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 0 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-field">
                <label>First name *</label>
                <input value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="First name" />
              </div>
              <div className="form-field">
                <label>Middle name</label>
                <input value={form.middleName} onChange={e => update('middleName', e.target.value)} placeholder="Optional" />
              </div>
              <div className="form-field">
                <label>Last name *</label>
                <input value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Last name" />
              </div>
            </div>
            <div className="form-field">
              <label>Personal email address *</label>
              <input type="email" value={form.personalEmail} onChange={e => update('personalEmail', e.target.value)} placeholder="Use an address not associated with your company" />
            </div>
            <div className="form-field">
              <label>Job title</label>
              <input value={form.jobTitle} onChange={e => update('jobTitle', e.target.value)} placeholder="e.g. Software Engineer" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-field">
                <label>Manager</label>
                <select value={form.managerId} onChange={e => update('managerId', e.target.value)}>
                  <option value="">No manager</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Department</label>
                <select value={form.department} onChange={e => update('department', e.target.value)}>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label>Start date *</label>
              <input type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div>
            <div className="form-field">
              <label>Employment type</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                {['Full-time', 'Part-time'].map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--charcoal)' }}>
                    <input type="radio" name="empType" checked={form.employmentType === type} onChange={() => update('employmentType', type)} style={{ width: 'auto' }} />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-field">
              <label>Compensation type</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                {['Salary', 'Hourly'].map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--charcoal)' }}>
                    <input type="radio" name="compType" checked={form.compensationType === type} onChange={() => update('compensationType', type)} style={{ width: 'auto' }} />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
                <label>Amount *</label>
                <input type="number" value={form.compensationAmount} onChange={e => update('compensationAmount', e.target.value)} placeholder="0.00" />
              </div>
              <div className="form-field" style={{ width: '120px', marginBottom: 0 }}>
                <label>Per</label>
                <select value={form.compensationPer} onChange={e => update('compensationPer', e.target.value)}>
                  <option value="Year">Year</option>
                  <option value="Hour">Hour</option>
                </select>
              </div>
            </div>
            <div className="form-field" style={{ marginTop: '16px' }}>
              <label>Work location</label>
              <select value={form.locationId} onChange={e => {
                const loc = locations.find(l => l.id === e.target.value)
                update('locationId', e.target.value)
                update('location', loc?.name || '')
              }}>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 3 - Review */}
        {step === 2 && (
          <div>
            <div style={{ background: 'var(--light-gray)', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '16px' }}>Employee Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                {[
                  ['Name', `${form.firstName} ${form.middleName ? form.middleName + ' ' : ''}${form.lastName}`],
                  ['Personal email', form.personalEmail],
                  ['Job title', form.jobTitle || '—'],
                  ['Department', (departments.find(d => d.id === form.department)?.name) || '—'],
                  ['Manager', employees.find(e => e.id === form.managerId) ? `${employees.find(e => e.id === form.managerId).firstName} ${employees.find(e => e.id === form.managerId).lastName}` : 'None'],
                  ['Start date', form.startDate || '—'],
                  ['Employment type', form.employmentType],
                  ['Compensation', form.compensationAmount ? `$${parseFloat(form.compensationAmount).toLocaleString()} / ${form.compensationPer}` : '—'],
                  ['Location', form.location || '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color: 'var(--medium-gray)', display: 'block', fontSize: '12px' }}>{k}</span>
                    <span style={{ fontWeight: '500' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--medium-gray)' }}>
              Clicking "Send invite" will create the employee record and send an onboarding invitation to their personal email.
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-outline btn-sm" onClick={onClose}>Cancel</button>
            {step > 0 && (
              <button className="btn-outline btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
          </div>
          {step < 2 ? (
            <button
              className="btn-primary"
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 ? !isStep1Valid : !isStep2Valid}
            >
              Next step →
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit}>
              Send invite
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddEmployeeModal
