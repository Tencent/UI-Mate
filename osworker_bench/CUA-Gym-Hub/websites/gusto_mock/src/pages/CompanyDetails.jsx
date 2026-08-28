import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { formatDate } from '../utils/helpers'

const CompanyDetails = () => {
  const { state, updateState } = useAppContext()
  const company = state?.company
  const [editSection, setEditSection] = useState(null)
  const [editData, setEditData] = useState({})

  // Inline form state for adding location
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [newLocation, setNewLocation] = useState({ name: '', city: '', state: '' })

  // Inline form state for adding department
  const [showAddDept, setShowAddDept] = useState(false)
  const [newDeptName, setNewDeptName] = useState('')

  if (!company) return null

  const startEdit = (section) => {
    setEditSection(section)
    setEditData({ ...company })
  }

  const saveEdit = () => {
    updateState(prev => ({ ...prev, company: editData }))
    setEditSection(null)
  }

  const handleAddLocation = () => {
    if (!newLocation.name.trim()) return
    const loc = {
      id: `loc_${Date.now()}`,
      name: newLocation.name.trim(),
      isMain: false,
      address: {
        street1: '',
        city: newLocation.city.trim(),
        state: newLocation.state.trim(),
        zip: ''
      }
    }
    updateState(prev => ({
      ...prev,
      company: { ...prev.company, locations: [...prev.company.locations, loc] }
    }))
    setNewLocation({ name: '', city: '', state: '' })
    setShowAddLocation(false)
  }

  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return
    const dept = {
      id: `dept_${Date.now()}`,
      name: newDeptName.trim(),
      headcount: 0
    }
    updateState(prev => ({
      ...prev,
      company: { ...prev.company, departments: [...prev.company.departments, dept] }
    }))
    setNewDeptName('')
    setShowAddDept(false)
  }

  const Field = ({ label, value }) => (
    <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
      <span style={{ width: '180px', color: 'var(--medium-gray)', fontSize: '13px', flexShrink: 0 }}>{label}</span>
      <span>{value || '—'}</span>
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Company Details</h1>
      </div>

      {/* Company Info */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Company Info</h3>
          {editSection !== 'info'
            ? <button className="btn-outline btn-sm" onClick={() => startEdit('info')}>Edit</button>
            : <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary btn-sm" onClick={saveEdit}>Save</button>
                <button className="btn-outline btn-sm" onClick={() => setEditSection(null)}>Cancel</button>
              </div>
          }
        </div>
        {editSection !== 'info' ? (
          <>
            <Field label="Company name" value={company.name} />
            <Field label="Legal name" value={company.legalName} />
            <Field label="EIN" value={company.ein} />
            <Field label="Industry" value={company.industry} />
            <Field label="Entity type" value={company.entityType} />
            <Field label="Phone" value={company.phone} />
            <Field label="Email" value={company.email} />
            <Field label="Website" value={company.website} />
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { k: 'name', label: 'Company name' },
              { k: 'legalName', label: 'Legal name' },
              { k: 'ein', label: 'EIN' },
              { k: 'industry', label: 'Industry' },
              { k: 'phone', label: 'Phone' },
              { k: 'email', label: 'Email' },
              { k: 'website', label: 'Website' }
            ].map(({ k, label }) => (
              <div className="form-field" key={k}>
                <label>{label}</label>
                <input value={editData[k] || ''} onChange={e => setEditData(d => ({ ...d, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locations */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Locations</h3>
          <button className="btn-outline btn-sm" onClick={() => { setShowAddLocation(v => !v); setNewLocation({ name: '', city: '', state: '' }) }}>
            {showAddLocation ? 'Cancel' : '+ Add location'}
          </button>
        </div>
        {company.locations.map(loc => (
          <div key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: '500' }}>{loc.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--medium-gray)', marginTop: '2px' }}>
                {loc.address.street1}{loc.address.street2 ? ', ' + loc.address.street2 : ''}{loc.address.city ? (loc.address.street1 ? ', ' : '') + loc.address.city : ''}{loc.address.state ? ', ' + loc.address.state : ''} {loc.address.zip}
              </div>
            </div>
            {loc.isMain && <span className="badge badge-active">Main</span>}
          </div>
        ))}
        {showAddLocation && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'var(--light-gray)', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div className="form-field">
                <label>Location name</label>
                <input
                  placeholder="e.g. HQ, Branch Office"
                  value={newLocation.name}
                  onChange={e => setNewLocation(l => ({ ...l, name: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label>City</label>
                <input
                  placeholder="City"
                  value={newLocation.city}
                  onChange={e => setNewLocation(l => ({ ...l, city: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label>State</label>
                <input
                  placeholder="e.g. CA"
                  value={newLocation.state}
                  onChange={e => setNewLocation(l => ({ ...l, state: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary btn-sm" onClick={handleAddLocation}>Add location</button>
              <button className="btn-outline btn-sm" onClick={() => setShowAddLocation(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Departments */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Departments</h3>
          <button className="btn-outline btn-sm" onClick={() => { setShowAddDept(v => !v); setNewDeptName('') }}>
            {showAddDept ? 'Cancel' : '+ Add department'}
          </button>
        </div>
        {company.departments.map(dept => (
          <div key={dept.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
            <span>{dept.name}</span>
            <span style={{ color: 'var(--medium-gray)' }}>{dept.headcount} employees</span>
          </div>
        ))}
        {showAddDept && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'var(--light-gray)', borderRadius: '8px' }}>
            <div className="form-field" style={{ marginBottom: '12px' }}>
              <label>Department name</label>
              <input
                placeholder="e.g. Engineering, Marketing"
                value={newDeptName}
                onChange={e => setNewDeptName(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary btn-sm" onClick={handleAddDepartment}>Add department</button>
              <button className="btn-outline btn-sm" onClick={() => setShowAddDept(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Pay Schedule */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>Pay Schedule</h3>
        <Field label="Frequency" value={company.paySchedule.frequency} />
        <Field label="Next payday" value={formatDate(company.paySchedule.nextPayday)} />
        <Field label="Next deadline" value={new Date(company.paySchedule.nextDeadline).toLocaleString()} />
      </div>

      {/* Bank Account */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Bank Account</h3>
        <Field label="Bank name" value={company.bankAccount.bankName} />
        <Field label="Account type" value={company.bankAccount.accountType} />
        <Field label="Routing number" value={company.bankAccount.routingNumber} />
        <Field label="Account number" value={company.bankAccount.accountNumber} />
        <Field label="Status" value={<span className="badge badge-active">{company.bankAccount.status}</span>} />
      </div>
    </div>
  )
}

export default CompanyDetails
