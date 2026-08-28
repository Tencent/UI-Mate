import { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const Settings = () => {
  const { state, updateState } = useAppContext()
  const company = state?.company
  const [saved, setSaved] = useState(false)
  const [notifs, setNotifs] = useState(company?.settings?.notifications || {
    payrollReminders: true,
    timeOffRequests: true,
    newHireOnboarding: true
  })

  const handleSaveNotifs = (updatedNotifs) => {
    updateState(prev => ({
      ...prev,
      company: {
        ...prev.company,
        settings: { ...prev.company?.settings, notifications: updatedNotifs }
      }
    }))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const Toggle = ({ value, onChange, label }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '14px' }}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: '40px', height: '22px', borderRadius: '11px', position: 'relative', cursor: 'pointer',
          background: value ? 'var(--teal)' : 'var(--border)', transition: 'background 0.2s'
        }}
      >
        <div style={{
          position: 'absolute', top: '3px', left: value ? '21px' : '3px',
          width: '16px', height: '16px', borderRadius: '50%', background: 'white',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </div>
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      {/* Company Settings */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>Company Settings</h3>
        {company && (
          <div>
            {[
              { label: 'Company name', value: company.name },
              { label: 'Timezone', value: company.settings?.timezone || 'America/Los_Angeles' }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: '180px', color: 'var(--medium-gray)', fontSize: '13px' }}>{item.label}</span>
                <span style={{ fontSize: '14px' }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>Email Notifications</h3>
        <Toggle
          label="Payroll reminders"
          value={notifs.payrollReminders}
          onChange={v => { const n = { ...notifs, payrollReminders: v }; setNotifs(n); handleSaveNotifs(n) }}
        />
        <Toggle
          label="Time off requests"
          value={notifs.timeOffRequests}
          onChange={v => { const n = { ...notifs, timeOffRequests: v }; setNotifs(n); handleSaveNotifs(n) }}
        />
        <Toggle
          label="New hire onboarding"
          value={notifs.newHireOnboarding}
          onChange={v => { const n = { ...notifs, newHireOnboarding: v }; setNotifs(n); handleSaveNotifs(n) }}
        />
        <div style={{ marginTop: '16px' }}>
          <button className="btn-primary btn-sm" onClick={() => handleSaveNotifs(notifs)}>Save changes</button>
        </div>
      </div>

      {/* Permissions */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Admin Permissions</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Permissions</th>
              <th>Users</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: '600' }}>Administrator</td>
              <td style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>Full access to all features</td>
              <td>Jessica Jackson</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Manager</td>
              <td style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>View team data, approve time off</td>
              <td style={{ color: 'var(--medium-gray)' }}>3 users</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Employee</td>
              <td style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>View own data, submit requests</td>
              <td style={{ color: 'var(--medium-gray)' }}>9 users</td>
            </tr>
          </tbody>
        </table>
      </div>

      {saved && <div className="toast">Settings saved successfully!</div>}
    </div>
  )
}

export default Settings
