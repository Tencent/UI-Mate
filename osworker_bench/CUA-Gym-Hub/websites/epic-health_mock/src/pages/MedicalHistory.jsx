import { useApp } from '../context/AppContext'
import { ClipboardList } from 'lucide-react'
import '../styles/common.css'

// Default family history (static mock — injectable via state)
const DEFAULT_FAMILY_HISTORY = [
  { relation: 'Mother', conditions: ['Type 2 Diabetes', 'Hypertension'], age: 'Living, age 62' },
  { relation: 'Father', conditions: ['Coronary Artery Disease', 'Hyperlipidemia'], age: 'Living, age 67' },
  { relation: 'Maternal Grandmother', conditions: ['Type 2 Diabetes', 'Breast Cancer'], age: 'Deceased, age 78' },
  { relation: 'Paternal Grandfather', conditions: ['Hypertension', 'Stroke'], age: 'Deceased, age 74' },
]

// Surgical/medical history (static mock — injectable via state)
const DEFAULT_MEDICAL_HISTORY = [
  { year: '2018', event: 'Appendectomy', provider: 'Springfield General Hospital', notes: 'Laparoscopic, no complications' },
  { year: '2015', event: 'Tonsillectomy', provider: 'Springfield ENT', notes: 'Elective' },
  { year: '2010', event: 'Type 2 Diabetes Mellitus diagnosed', provider: 'Elizabeth Morrison, MD', notes: 'Managed with Metformin' },
]

export default function MedicalHistory() {
  const { state } = useApp()

  const conditions = state.conditions || []
  const familyHistory = state.familyHistory || DEFAULT_FAMILY_HISTORY
  const medicalHistory = state.medicalHistory || DEFAULT_MEDICAL_HISTORY

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <ClipboardList size={22} style={{ color: 'var(--color-primary)' }} />
        Medical and Family History
      </h1>

      {/* Current Medical Conditions */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Current Medical Conditions</h2>
        </div>
        <div className="section-card-body">
          {conditions.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>No active conditions on record.</p>
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
        </div>
      </div>

      {/* Past Medical / Surgical History */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Past Medical &amp; Surgical History</h2>
        </div>
        <div className="section-card-body">
          {medicalHistory.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>No past medical history on record.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Event / Procedure</th>
                  <th>Provider / Facility</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {medicalHistory.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{item.year}</td>
                    <td style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{item.event}</td>
                    <td style={{ fontSize: 'var(--font-sm)' }}>{item.provider}</td>
                    <td style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Family History */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Family History</h2>
        </div>
        <div className="section-card-body">
          {familyHistory.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>No family history on record.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Relation</th>
                  <th>Known Conditions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {familyHistory.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{item.relation}</td>
                    <td style={{ fontSize: 'var(--font-sm)' }}>
                      {item.conditions.map((c, j) => (
                        <span key={j}>
                          {c}{j < item.conditions.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </td>
                    <td style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{item.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
