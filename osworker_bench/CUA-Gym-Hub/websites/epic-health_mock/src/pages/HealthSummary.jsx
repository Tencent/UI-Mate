import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Heart, ChevronDown, ChevronUp, Activity, Thermometer, Scale } from 'lucide-react'
import '../styles/common.css'

function AccordionSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="section-card">
      <div
        className="section-card-header"
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setOpen(!open)}
      >
        <h2 className="section-card-title">{title}</h2>
        {open ? <ChevronUp size={18} style={{ color: 'var(--color-text-secondary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--color-text-secondary)' }} />}
      </div>
      {open && <div className="section-card-body">{children}</div>}
    </div>
  )
}

export default function HealthSummary() {
  const { state, dispatch } = useApp()
  const [editingDemog, setEditingDemog] = useState(false)
  const [demogEdits, setDemogEdits] = useState({})

  const conditions = state.conditions || []
  const allergies = state.allergies || []
  const vitals = state.vitals || []
  const immunizations = state.immunizations || []
  const user = state.currentUser || {}

  const latestVitals = vitals.length > 0
    ? [...vitals].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null

  const allergyTypeBadge = (type) => {
    if (type === 'Medication') return 'badge--blue'
    if (type === 'Food') return 'badge--orange'
    return 'badge--green'
  }

  const severityBadge = (s) => {
    if (s === 'Severe') return 'badge--red'
    if (s === 'Moderate') return 'badge--yellow'
    return 'badge--green'
  }

  const handleSaveDemog = () => {
    dispatch({ type: 'UPDATE_PATIENT_INFO', payload: demogEdits })
    setEditingDemog(false)
    setDemogEdits({})
  }

  const vitalItems = latestVitals ? [
    { label: 'Blood Pressure', value: `${latestVitals.readings.bloodPressureSystolic.value}/${latestVitals.readings.bloodPressureDiastolic.value}`, unit: 'mmHg', icon: '♥', status: latestVitals.readings.bloodPressureSystolic.value < 120 ? 'normal' : latestVitals.readings.bloodPressureSystolic.value < 130 ? 'elevated' : 'high' },
    { label: 'Heart Rate', value: latestVitals.readings.heartRate.value, unit: 'bpm', icon: '~', status: 'normal' },
    { label: 'Temperature', value: latestVitals.readings.temperature.value, unit: '°F', icon: '🌡', status: 'normal' },
    { label: 'Weight', value: latestVitals.readings.weight.value, unit: 'lbs', icon: '⚖', status: 'normal' },
    { label: 'BMI', value: latestVitals.readings.bmi.value, unit: 'kg/m²', icon: 'B', status: latestVitals.readings.bmi.value < 25 ? 'normal' : latestVitals.readings.bmi.value < 30 ? 'elevated' : 'high' },
    { label: 'O₂ Saturation', value: latestVitals.readings.oxygenSaturation.value, unit: '%', icon: 'O₂', status: latestVitals.readings.oxygenSaturation.value >= 95 ? 'normal' : 'high' },
  ] : []

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Heart size={22} style={{ color: 'var(--color-primary)' }} />
        Health Summary
      </h1>

      {/* Current Conditions */}
      <AccordionSection title="Current Conditions">
        {conditions.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>No conditions on record.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Condition</th>
                <th>ICD Code</th>
                <th>Status</th>
                <th>Onset Date</th>
                <th>Diagnosed By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {conditions.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{c.name}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{c.icdCode}</td>
                  <td>
                    <span className={`badge ${c.clinicalStatus === 'Active' ? 'badge--green' : 'badge--gray'}`}>
                      {c.clinicalStatus}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>{c.onsetDate}</td>
                  <td style={{ fontSize: 'var(--font-sm)' }}>{c.diagnosedBy}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AccordionSection>

      {/* Allergies */}
      <AccordionSection title="Allergies">
        {allergies.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>No allergies on record.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Allergen</th>
                <th>Type</th>
                <th>Reaction</th>
                <th>Severity</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {allergies.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{a.allergen}</td>
                  <td><span className={`badge ${allergyTypeBadge(a.type)}`}>{a.type}</span></td>
                  <td style={{ fontSize: 'var(--font-sm)' }}>{a.reaction}</td>
                  <td><span className={`badge ${severityBadge(a.severity)}`}>{a.severity}</span></td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{a.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AccordionSection>

      {/* Current Vitals */}
      <AccordionSection title="Current Vitals">
        {!latestVitals ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>No vitals on record.</p>
        ) : (
          <>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              Recorded: {latestVitals.date} by {latestVitals.recordedBy}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {vitalItems.map(v => (
                <div key={v.label} style={{
                  padding: '14px', borderRadius: 'var(--radius-md)',
                  border: `1px solid ${v.status === 'normal' ? '#a3d9c0' : v.status === 'elevated' ? '#ffe0b2' : '#f5c2c7'}`,
                  background: v.status === 'normal' ? 'var(--color-success-light)' : v.status === 'elevated' ? 'var(--color-warning-light)' : 'var(--color-danger-light)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{v.icon}</div>
                  <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: v.status === 'normal' ? 'var(--color-success)' : v.status === 'elevated' ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                    {v.value}
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{v.unit}</div>
                  <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, marginTop: 4, color: 'var(--color-text-primary)' }}>{v.label}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </AccordionSection>

      {/* Immunizations */}
      <AccordionSection title="Immunizations">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vaccine</th>
              <th>Date Administered</th>
              <th>Site</th>
              <th>Status</th>
              <th>Next Due</th>
            </tr>
          </thead>
          <tbody>
            {[...( state.immunizations || [])].sort((a, b) => new Date(b.administrationDate) - new Date(a.administrationDate)).map(imm => (
              <tr key={imm.id}>
                <td style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{imm.vaccineName}</td>
                <td style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>{imm.administrationDate}</td>
                <td style={{ fontSize: 'var(--font-sm)' }}>{imm.site}</td>
                <td><span className="badge badge--green">{imm.status}</span></td>
                <td style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>{imm.nextDueDate || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AccordionSection>

      {/* Demographics */}
      <AccordionSection title="Demographics">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 'var(--font-sm)' }}>
          {[
            ['Full Name', user.fullName],
            ['Date of Birth', user.dateOfBirth],
            ['Age', user.age],
            ['Gender', user.gender],
            ['Preferred Language', user.preferredLanguage],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 16, paddingTop: 16 }}>
          {editingDemog ? (
            <div>
              {[
                { key: 'phone', label: 'Phone', value: demogEdits.phone ?? user.phone },
                { key: 'email', label: 'Email', value: demogEdits.email ?? user.email },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={f.value}
                    onChange={e => setDemogEdits(prev => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn--primary btn--sm" onClick={handleSaveDemog}>Save</button>
                <button className="btn btn--gray btn--sm" onClick={() => { setEditingDemog(false); setDemogEdits({}) }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 'var(--font-sm)', marginBottom: 12 }}>
                {[
                  ['Phone', user.phone],
                  ['Email', user.email],
                  ['Address', `${user.address?.street}, ${user.address?.city}, ${user.address?.state} ${user.address?.zip}`],
                  ['Emergency Contact', `${user.emergencyContact?.name} (${user.emergencyContact?.relationship}) — ${user.emergencyContact?.phone}`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn--outline btn--sm" onClick={() => setEditingDemog(true)}>Edit Contact Info</button>
            </div>
          )}
        </div>
      </AccordionSection>
    </div>
  )
}
