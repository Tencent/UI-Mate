import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { getInitials, getAvatarColor, formatDate, formatCurrency } from '../utils/helpers'

const EmployeeProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, updateEmployee, completeOnboardingTask, addComplianceNote, startOnboarding } = useAppContext()
  const [tab, setTab] = useState('personal')
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [empEditMode, setEmpEditMode] = useState(false)
  const [empEditData, setEmpEditData] = useState({})
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [noteDraft, setNoteDraft] = useState('')

  const toast = (msg) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const employee = (state?.employees || []).find(e => e.id === id)
  const documents = (state?.documents || []).filter(d => d.employeeId === id)
  const timeOffRequests = (state?.timeOffRequests || []).filter(r => r.employeeId === id)
  const benefitPlans = state?.benefitPlans || []
  const checklist = (state?.onboardingChecklists || []).find(c => c.employeeId === id)

  if (!employee) {
    return (
      <div className="page-container">
        <div style={{ color: 'var(--medium-gray)', padding: '40px 0' }}>Employee not found.</div>
        <button className="btn-outline" onClick={() => navigate('/people/team-members')}>Back to team members</button>
      </div>
    )
  }

  const initials = getInitials(employee.firstName, employee.lastName)
  const avatarColor = getAvatarColor(`${employee.firstName} ${employee.lastName}`)

  const startEdit = () => {
    setEditData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      personalEmail: employee.personalEmail,
      phone: employee.phone,
      dateOfBirth: employee.dateOfBirth,
      address: { ...employee.address }
    })
    setEditMode(true)
  }

  const saveEdit = () => {
    updateEmployee(id, editData)
    setEditMode(false)
    toast('Personal information saved')
  }

  const startEmpEdit = () => {
    setEmpEditData({
      jobTitle: employee.jobTitle,
      department: employee.department,
      departmentId: employee.departmentId,
      managerName: employee.managerName || '',
      location: employee.location,
      locationId: employee.locationId,
      startDate: employee.startDate,
      compensationType: employee.compensation.type,
      compensationAmount: employee.compensation.amount,
      payMethod: employee.payMethod
    })
    setEmpEditMode(true)
  }

  const saveEmpEdit = () => {
    const updates = {
      jobTitle: empEditData.jobTitle,
      department: empEditData.department,
      departmentId: empEditData.departmentId,
      managerName: empEditData.managerName || null,
      location: empEditData.location,
      locationId: empEditData.locationId,
      startDate: empEditData.startDate,
      compensation: {
        ...employee.compensation,
        type: empEditData.compensationType,
        amount: parseFloat(empEditData.compensationAmount) || employee.compensation.amount
      },
      payMethod: empEditData.payMethod
    }
    updateEmployee(id, updates)
    setEmpEditMode(false)
    toast('Employment details saved')
  }

  const saveNote = () => {
    const text = noteDraft.trim()
    if (!text) return
    addComplianceNote(id, text)
    setNoteDraft('')
    toast('Compliance note added')
  }

  const triggerOnboarding = () => {
    startOnboarding(id)
    toast('Onboarding flow started')
  }

  const Field = ({ label, value }) => (
    <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: '160px', minWidth: '160px', color: 'var(--medium-gray)', fontSize: '13px' }}>{label}</span>
      <span style={{ fontSize: '14px' }}>{value || '—'}</span>
    </div>
  )

  const enrolledPlans = benefitPlans.filter(p => {
    const key = p.type.toLowerCase().replace(/[^a-z]/g, '')
    return employee.benefits.some(b => b.toLowerCase().replace(/[^a-z]/g, '') === key || b === p.id)
  })

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: 'var(--medium-gray)', marginBottom: '20px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span style={{ cursor: 'pointer', color: 'var(--teal)' }} onClick={() => navigate('/people/team-members')}>People</span>
        <span>›</span>
        <span style={{ cursor: 'pointer', color: 'var(--teal)' }} onClick={() => navigate('/people/team-members')}>Team members</span>
        <span>›</span>
        <span>{employee.firstName} {employee.lastName}</span>
      </div>

      {/* Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="avatar avatar-lg" style={{ background: avatarColor, width: '64px', height: '64px', fontSize: '22px' }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '22px', fontWeight: '700' }}>{employee.firstName} {employee.lastName}</h1>
            <div style={{ color: 'var(--medium-gray)', fontSize: '14px', marginTop: '2px' }}>{employee.jobTitle}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span className="badge" style={{ background: 'var(--teal-light)', color: 'var(--teal)', fontSize: '12px' }}>{employee.department}</span>
              <span className={`badge badge-${employee.status.toLowerCase()}`}>{employee.status}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--medium-gray)' }}>
            <div>Started {formatDate(employee.startDate)}</div>
            <div style={{ marginTop: '4px' }}>{employee.location}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['personal', 'employment', 'time-off', 'documents', 'benefits', 'compliance'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'time-off' ? 'Time off' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Personal Tab */}
      {tab === 'personal' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Personal Information</h3>
            {!editMode ? (
              <button className="btn-outline btn-sm" onClick={startEdit}>✏ Edit</button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary btn-sm" onClick={saveEdit}>Save</button>
                <button className="btn-outline btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            )}
          </div>
          {!editMode ? (
            <>
              <Field label="First name" value={employee.firstName} />
              <Field label="Last name" value={employee.lastName} />
              <Field label="Personal email" value={employee.personalEmail} />
              <Field label="Work email" value={employee.email} />
              <Field label="Phone" value={employee.phone} />
              <Field label="Date of birth" value={formatDate(employee.dateOfBirth)} />
              <Field label="SSN" value={employee.ssn} />
              <Field label="Address" value={`${employee.address.street1}${employee.address.street2 ? ', ' + employee.address.street2 : ''}, ${employee.address.city}, ${employee.address.state} ${employee.address.zip}`} />
            </>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label>First name</label>
                  <input value={editData.firstName} onChange={e => setEditData(d => ({ ...d, firstName: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label>Last name</label>
                  <input value={editData.lastName} onChange={e => setEditData(d => ({ ...d, lastName: e.target.value }))} />
                </div>
              </div>
              <div className="form-field">
                <label>Personal email</label>
                <input value={editData.personalEmail} onChange={e => setEditData(d => ({ ...d, personalEmail: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Phone</label>
                <input value={editData.phone} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Date of birth</label>
                <input type="date" value={editData.dateOfBirth} onChange={e => setEditData(d => ({ ...d, dateOfBirth: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Street address</label>
                <input value={editData.address?.street1 || ''} onChange={e => setEditData(d => ({ ...d, address: { ...d.address, street1: e.target.value } }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: '12px' }}>
                <div className="form-field">
                  <label>City</label>
                  <input value={editData.address?.city || ''} onChange={e => setEditData(d => ({ ...d, address: { ...d.address, city: e.target.value } }))} />
                </div>
                <div className="form-field">
                  <label>State</label>
                  <input value={editData.address?.state || ''} onChange={e => setEditData(d => ({ ...d, address: { ...d.address, state: e.target.value } }))} />
                </div>
                <div className="form-field">
                  <label>Zip</label>
                  <input value={editData.address?.zip || ''} onChange={e => setEditData(d => ({ ...d, address: { ...d.address, zip: e.target.value } }))} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Employment Tab */}
      {tab === 'employment' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Employment Details</h3>
            {!empEditMode ? (
              <button className="btn-outline btn-sm" onClick={startEmpEdit}>✏ Edit</button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary btn-sm" onClick={saveEmpEdit}>Save</button>
                <button className="btn-outline btn-sm" onClick={() => setEmpEditMode(false)}>Cancel</button>
              </div>
            )}
          </div>
          {!empEditMode ? (
            <>
              <Field label="Job title" value={employee.jobTitle} />
              <Field label="Department" value={employee.department} />
              <Field label="Manager" value={employee.managerName || 'None'} />
              <Field label="Location" value={employee.location} />
              <Field label="Start date" value={formatDate(employee.startDate)} />
              <Field label="Employment type" value={employee.employmentType} />
              <Field label="Compensation" value={
                employee.compensation.type === 'Salary'
                  ? `${formatCurrency(employee.compensation.amount)} / year`
                  : `${formatCurrency(employee.compensation.amount)} / hour`
              } />
              <Field label="Pay method" value={employee.payMethod} />
              <Field label="Federal filing" value={employee.federalFilingStatus} />
              <Field label="State filing" value={employee.stateFilingStatus} />
            </>
          ) : (
            <div>
              <div className="form-field">
                <label>Job title</label>
                <input value={empEditData.jobTitle} onChange={e => setEmpEditData(d => ({ ...d, jobTitle: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Department</label>
                <select value={empEditData.department} onChange={e => {
                  const dept = (state.company?.departments || []).find(d => d.name === e.target.value)
                  setEmpEditData(d => ({ ...d, department: e.target.value, departmentId: dept?.id || d.departmentId }))
                }}>
                  {(state.company?.departments || []).map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Manager</label>
                <select value={empEditData.managerName || ''} onChange={e => setEmpEditData(d => ({ ...d, managerName: e.target.value || null }))}>
                  <option value="">None</option>
                  {(state.employees || []).filter(e => e.id !== id).map(e => (
                    <option key={e.id} value={`${e.firstName} ${e.lastName}`}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Location</label>
                <select value={empEditData.location} onChange={e => {
                  const loc = (state.company?.locations || []).find(l => l.name === e.target.value)
                  setEmpEditData(d => ({ ...d, location: e.target.value, locationId: loc?.id || d.locationId }))
                }}>
                  {(state.company?.locations || []).map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Start date</label>
                <input type="date" value={empEditData.startDate} onChange={e => setEmpEditData(d => ({ ...d, startDate: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label>Compensation type</label>
                  <select value={empEditData.compensationType} onChange={e => setEmpEditData(d => ({ ...d, compensationType: e.target.value }))}>
                    <option value="Salary">Salary</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Amount ($)</label>
                  <input type="number" value={empEditData.compensationAmount} onChange={e => setEmpEditData(d => ({ ...d, compensationAmount: e.target.value }))} />
                </div>
              </div>
              <div className="form-field">
                <label>Pay method</label>
                <select value={empEditData.payMethod} onChange={e => setEmpEditData(d => ({ ...d, payMethod: e.target.value }))}>
                  <option value="Direct Deposit">Direct Deposit</option>
                  <option value="Check">Check</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Time Off Tab */}
      {tab === 'time-off' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Time Off Balances</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
            {[
              { label: 'Vacation', balance: employee.pto.vacationBalance, max: 120, accrual: employee.pto.vacationAccrualRate, color: 'var(--teal)' },
              { label: 'Sick', balance: employee.pto.sickBalance, max: 60, accrual: employee.pto.sickAccrualRate, color: 'var(--blue)' }
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--light-gray)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600' }}>{item.label}</span>
                  <span style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>{item.balance}h available</span>
                </div>
                <div className="progress-bar-track" style={{ marginBottom: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, (item.balance / item.max) * 100)}%`, background: item.color }} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>
                  Accrues {item.accrual} hrs/period
                </div>
              </div>
            ))}
          </div>

          <h4 style={{ marginBottom: '12px', color: 'var(--medium-gray)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Requests</h4>
          {timeOffRequests.length === 0 ? (
            <div style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>No time off requests</div>
          ) : (
            timeOffRequests.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span className={`badge badge-${r.type.toLowerCase()}`} style={{ marginRight: '8px' }}>{r.type}</span>
                  <span style={{ fontSize: '13px' }}>{formatDate(r.startDate)} – {formatDate(r.endDate)}</span>
                  <span style={{ fontSize: '12px', color: 'var(--medium-gray)', marginLeft: '8px' }}>({r.totalHours}h)</span>
                </div>
                <span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Documents Tab */}
      {tab === 'documents' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Documents</h3>
          {documents.length === 0 ? (
            <div style={{ color: 'var(--medium-gray)', fontSize: '14px' }}>No documents found for this employee.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Uploaded</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: '500' }}>{doc.name}</td>
                    <td><span className="badge badge-upcoming">{doc.category}</span></td>
                    <td>{formatDate(doc.uploadedDate)}</td>
                    <td style={{ color: 'var(--medium-gray)' }}>{doc.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {checklist ? (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ marginBottom: '12px' }}>Onboarding Checklist</h4>
              {checklist.tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => completeOnboardingTask(checklist.id, task.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '4px',
                    border: task.status === 'completed' ? 'none' : '2px solid var(--border)',
                    background: task.status === 'completed' ? 'var(--teal)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.15s'
                  }}>
                    {task.status === 'completed' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none', color: task.status === 'completed' ? 'var(--medium-gray)' : 'var(--charcoal)' }}>
                      {task.title}
                    </span>
                    {task.completedDate && (
                      <div style={{ fontSize: '11px', color: 'var(--success)' }}>Completed {formatDate(task.completedDate)}</div>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>Due {formatDate(task.dueDate)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: '8px' }}>Onboarding Checklist</h4>
              <div style={{ color: 'var(--medium-gray)', fontSize: '13px', marginBottom: '14px' }}>
                No onboarding checklist yet. Start the standard onboarding flow to create one.
              </div>
              <button className="btn-primary btn-sm" onClick={triggerOnboarding}>Start onboarding</button>
            </div>
          )}
        </div>
      )}

      {showToast && <div className="toast">{toastMsg}</div>}

      {/* Benefits Tab */}
      {tab === 'benefits' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Enrolled Benefits</h3>
          {employee.benefits.length === 0 ? (
            <div style={{ color: 'var(--medium-gray)', fontSize: '14px' }}>Not enrolled in any benefit plans.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {benefitPlans
                .filter(p => {
                  const planKey = p.type === '401(k)' ? '401k' : p.type.toLowerCase()
                  return employee.benefits.includes(planKey) || employee.benefits.includes(p.type.toLowerCase())
                })
                .map(plan => (
                  <div key={plan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{plan.planName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--medium-gray)', marginTop: '2px' }}>{plan.provider} · {plan.coverage}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '13px' }}>
                      <div>Employee: {plan.monthlyCostEmployee > 0 ? formatCurrency(plan.monthlyCostEmployee) + '/mo' : plan.employeeContributionPercent || 'Varies'}</div>
                      <div style={{ color: 'var(--medium-gray)', fontSize: '12px' }}>Employer: {plan.monthlyCostEmployer > 0 ? formatCurrency(plan.monthlyCostEmployer) + '/mo' : plan.employerMatchPercent || 'Varies'}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

      {/* Compliance Tab */}
      {tab === 'compliance' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Compliance</h3>

          <div className="form-field">
            <label>Add a note</label>
            <textarea
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              placeholder="e.g. Policy acknowledgement sent via XocuSign on 2026-07-02; due 2026-07-20."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button className="btn-primary btn-sm" onClick={saveNote} disabled={!noteDraft.trim()}>Add note</button>
          </div>

          <h4 style={{ marginBottom: '12px', color: 'var(--medium-gray)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</h4>
          {((employee.compliance?.notes) || []).length === 0 ? (
            <div style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>No compliance notes yet.</div>
          ) : (
            (employee.compliance.notes).map(note => (
              <div key={note.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '14px', color: 'var(--charcoal)' }}>{note.text}</div>
                {(note.addedDate || note.addedBy) && (
                  <div style={{ fontSize: '11px', color: 'var(--medium-gray)', marginTop: '4px' }}>
                    {note.addedDate ? `Added ${formatDate(note.addedDate)}` : ''}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default EmployeeProfile
