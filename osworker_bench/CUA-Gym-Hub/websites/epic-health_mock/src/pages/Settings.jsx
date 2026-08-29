import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Settings as SettingsIcon } from 'lucide-react'
import '../styles/common.css'

const DEFAULT_PREFS = {
  apptReminderEmail: true,
  apptReminderText: true,
  testResultEmail: true,
  testResultText: false,
  billingEmail: true,
  billingText: false,
  marketing: false
}

export default function Settings() {
  const { state, dispatch } = useApp()
  const user = state.currentUser || {}

  const [editPhone, setEditPhone] = useState(user.phone || '')
  const [editEmail, setEditEmail] = useState(user.email || '')
  const [saved, setSaved] = useState(false)

  // Read communication prefs from global state (persisted), fallback to defaults
  const storedPrefs = state.ui?.communicationPrefs || {}
  const [prefs, setPrefs] = useState({ ...DEFAULT_PREFS, ...storedPrefs })

  // Read language from user state (persisted via UPDATE_PATIENT_INFO)
  const [language, setLanguage] = useState(user.preferredLanguage || 'English')
  const [prefsSaved, setPrefsSaved] = useState(false)
  const [langSaved, setLangSaved] = useState(false)

  const handleSavePersonal = () => {
    dispatch({ type: 'UPDATE_PATIENT_INFO', payload: { phone: editPhone, email: editEmail } })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTogglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    // Persist immediately to global state
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { communicationPrefs: next }
    })
  }

  const handleSaveLanguage = () => {
    dispatch({ type: 'UPDATE_PATIENT_INFO', payload: { preferredLanguage: language } })
    setLangSaved(true)
    setTimeout(() => setLangSaved(false), 2000)
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <SettingsIcon size={22} style={{ color: 'var(--color-primary)' }} />
        Account Settings
      </h1>

      {/* Personal Information */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Personal Information</h2>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[
              ['Full Name', user.fullName, true],
              ['Date of Birth', user.dateOfBirth, true],
              ['Gender', user.gender, true],
            ].map(([label, value, readOnly]) => (
              <div key={label}>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>{label} {readOnly && <span style={{ color: 'var(--color-text-secondary)', fontSize: '10px' }}>(Read Only)</span>}</div>
                <div style={{ fontSize: 'var(--font-sm)', fontWeight: 500, padding: '8px 12px', background: 'var(--color-section-bg)', borderRadius: 'var(--radius-sm)', color: readOnly ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" className="form-input" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn--primary btn--sm" onClick={handleSavePersonal}>
              {saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Communication Preferences</h2>
        </div>
        <div className="section-card-body">
          {[
            { key: 'apptReminderEmail', label: 'Appointment reminders by email' },
            { key: 'apptReminderText', label: 'Appointment reminders by text' },
            { key: 'testResultEmail', label: 'Test result notifications by email' },
            { key: 'testResultText', label: 'Test result notifications by text' },
            { key: 'billingEmail', label: 'Billing notifications by email' },
            { key: 'billingText', label: 'Billing notifications by text' },
            { key: 'marketing', label: 'Marketing communications' },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 'var(--font-sm)' }}>{item.label}</span>
              <div
                style={{
                  width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s',
                  background: prefs[item.key] ? 'var(--color-success)' : 'var(--color-border)',
                  position: 'relative', flexShrink: 0
                }}
                onClick={() => handleTogglePref(item.key)}
                role="switch"
                aria-checked={prefs[item.key]}
                tabIndex={0}
                onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && handleTogglePref(item.key)}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3, transition: 'left 0.2s',
                  left: prefs[item.key] ? 23 : 3, boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 'var(--font-xs)', color: 'var(--color-success)' }}>
            Preferences are saved automatically when toggled.
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Language</h2>
        </div>
        <div className="section-card-body">
          <div className="form-group">
            <label className="form-label">Preferred Language</label>
            <select
              className="form-select"
              style={{ maxWidth: 240 }}
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {['English', 'Spanish', 'Chinese (Simplified)', 'Chinese (Traditional)', 'French', 'Portuguese', 'German'].map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <button
            className="btn btn--primary btn--sm"
            onClick={handleSaveLanguage}
            disabled={language === (user.preferredLanguage || 'English') && !langSaved}
          >
            {langSaved ? '✓ Saved' : 'Save Language'}
          </button>
        </div>
      </div>
    </div>
  )
}
