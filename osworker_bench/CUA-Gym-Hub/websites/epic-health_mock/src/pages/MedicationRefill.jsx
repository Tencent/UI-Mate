import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronLeft } from 'lucide-react'
import '../styles/common.css'

export default function MedicationRefill() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedIds = (searchParams.get('meds') || '').split(',').filter(Boolean)

  const meds = (state.medications || []).filter(m => m.status === 'Active' && m.isRefillable)
  const [selected, setSelected] = useState(preselectedIds.length > 0 ? preselectedIds : meds.map(m => m.id))
  const [comments, setComments] = useState('')
  const [pharmacy, setPharmacy] = useState(state.currentUser?.preferredPharmacy?.name || 'CVS Pharmacy #4521')
  const [success, setSuccess] = useState(false)

  const toggleMed = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSubmit = () => {
    dispatch({ type: 'REQUEST_REFILL', payload: { medicationIds: selected } })
    setSuccess(true)
    setTimeout(() => navigate('/medications'), 2500)
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h2 style={{ color: 'var(--color-success)', fontSize: 'var(--font-xl)', marginBottom: 8 }}>Refill Request Submitted!</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Refill request submitted for {selected.length} medication{selected.length > 1 ? 's' : ''}. Redirecting...
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="back-btn" onClick={() => navigate('/medications')}>
          <ChevronLeft size={16} /> Back to Medications
        </button>
        <h1 className="page-title">Request Refill</h1>
      </div>

      <div className="section-card" style={{ marginBottom: 16 }}>
        <div className="section-card-header">
          <h2 className="section-card-title">Select Medications to Refill</h2>
        </div>
        <div className="section-card-body">
          {meds.map(med => (
            <div key={med.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              <input
                type="checkbox"
                id={`refill-${med.id}`}
                checked={selected.includes(med.id)}
                onChange={() => toggleMed(med.id)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor={`refill-${med.id}`} style={{ flex: 1, cursor: 'pointer' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{med.name} {med.dosage}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                  {med.pharmacy} · Refills remaining: {med.refillsRemaining}
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card" style={{ marginBottom: 16 }}>
        <div className="section-card-body">
          <div className="form-group">
            <label className="form-label">Preferred Pharmacy</label>
            <select className="form-select" value={pharmacy} onChange={e => setPharmacy(e.target.value)}>
              <option>CVS Pharmacy #4521</option>
              <option>Walgreens #1234</option>
              <option>Rite Aid #5678</option>
              <option>Mail Order Pharmacy</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Comments for Pharmacist (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Add any special instructions..."
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="btn btn--success btn--lg"
          onClick={handleSubmit}
          disabled={selected.length === 0}
        >
          Submit Refill Request
        </button>
        <button className="btn btn--gray" onClick={() => navigate('/medications')}>
          Cancel
        </button>
      </div>
    </div>
  )
}
