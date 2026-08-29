import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronLeft } from 'lucide-react'
import '../styles/common.css'

export default function MedicationDetail() {
  const { id } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()

  const med = (state.medications || []).find(m => m.id === id)

  if (!med) {
    return (
      <div>
        <button className="back-btn" onClick={() => navigate('/medications')}>
          <ChevronLeft size={16} /> Back to Medications
        </button>
        <p style={{ marginTop: 20 }}>Medication not found.</p>
      </div>
    )
  }

  const refillPct = med.totalRefills > 0 ? (med.refillsRemaining / med.totalRefills) * 100 : 0

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/medications')}>
        <ChevronLeft size={16} /> Back to Medications
      </button>

      <div style={{ marginTop: 16, marginBottom: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">{med.name}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <span className={`badge ${med.status === 'Active' ? 'badge--green' : 'badge--gray'}`}>{med.status}</span>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>{med.dosage} — {med.form}</span>
          </div>
        </div>
        {med.isRefillable && (
          <button className="btn btn--primary" onClick={() => navigate(`/medications/refill?meds=${med.id}`)}>
            Request Refill
          </button>
        )}
      </div>

      {/* Medication Info */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Medication Information</h2>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 'var(--font-sm)' }}>
            {[
              ['Medication Name', med.name],
              ['Generic Name', med.genericName],
              ['Dosage', med.dosage],
              ['Form', med.form],
              ['Route', med.route],
              ['Frequency', med.frequency],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
          {med.reason && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--color-section-bg)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)' }}>
              <span style={{ fontWeight: 600 }}>Treating: </span>{med.reason}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Instructions</h2>
        </div>
        <div className="section-card-body">
          <p style={{ fontSize: 'var(--font-sm)', lineHeight: 1.6 }}>{med.instructions}</p>
        </div>
      </div>

      {/* Prescription Details */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Prescription Details</h2>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 'var(--font-sm)' }}>
            {[
              ['Prescriber', med.prescriber],
              ['Pharmacy', med.pharmacy],
              ['Start Date', med.startDate],
              ['Days Supply', `${med.daysSupply} days`],
              ['Quantity', `${med.quantity} ${med.form}s`],
              ['Last Filled', med.lastFilledDate || 'N/A'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refill Information */}
      {med.isRefillable && (
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Refill Information</h2>
          </div>
          <div className="section-card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', marginBottom: 8 }}>
              <span>Refills remaining: <strong>{med.refillsRemaining}</strong> of {med.totalRefills}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>Last filled: {med.lastFilledDate}</span>
            </div>
            <div style={{ height: 10, background: 'var(--color-border)', borderRadius: 5, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ height: '100%', width: `${refillPct}%`, background: refillPct > 40 ? 'var(--color-success)' : refillPct > 20 ? 'var(--color-warning)' : 'var(--color-danger)', borderRadius: 5 }} />
            </div>
            <button className="btn btn--success" onClick={() => navigate(`/medications/refill?meds=${med.id}`)}>
              Request Refill
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
