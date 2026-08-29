import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Pill, ChevronRight } from 'lucide-react'
import '../styles/common.css'

export default function Medications() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('current')
  const [selected, setSelected] = useState([])

  const meds = state.medications || []
  const current = meds.filter(m => m.status === 'Active')
  const past = meds.filter(m => m.status !== 'Active')

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleRefillNav = () => {
    const params = selected.length > 0 ? `?meds=${selected.join(',')}` : ''
    navigate(`/medications/refill${params}`)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pill size={22} style={{ color: 'var(--color-primary)' }} />
          Medications
        </h1>
        <button className="btn btn--primary" onClick={handleRefillNav}>
          Request Refill
        </button>
      </div>

      <div className="tab-nav">
        <button className={`tab-btn ${activeTab === 'current' ? 'tab-btn--active' : ''}`} onClick={() => setActiveTab('current')}>
          Current Medications ({current.length})
        </button>
        <button className={`tab-btn ${activeTab === 'past' ? 'tab-btn--active' : ''}`} onClick={() => setActiveTab('past')}>
          Past Medications ({past.length})
        </button>
      </div>

      <div>
        {activeTab === 'current' && (
          current.length === 0 ? (
            <div className="section-card">
              <div className="section-card-body" style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-secondary)' }}>
                No current medications.
              </div>
            </div>
          ) : (
            <>
              {selected.length > 0 && (
                <div style={{ background: 'var(--color-primary-light)', border: '1px solid #b3d9f0', borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-primary)' }}>
                    {selected.length} medication{selected.length > 1 ? 's' : ''} selected for refill
                  </span>
                  <button className="btn btn--primary btn--sm" onClick={handleRefillNav}>
                    Request Refill for Selected
                  </button>
                </div>
              )}
              {current.map(med => (
                <MedCard key={med.id} med={med} isSelected={selected.includes(med.id)} onToggle={toggleSelect} navigate={navigate} />
              ))}
            </>
          )
        )}

        {activeTab === 'past' && (
          past.length === 0 ? (
            <div className="section-card">
              <div className="section-card-body" style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-secondary)' }}>
                No past medications.
              </div>
            </div>
          ) : (
            past.map(med => (
              <MedCard key={med.id} med={med} isPast navigate={navigate} />
            ))
          )
        )}
      </div>
    </div>
  )
}

function MedCard({ med, isSelected, onToggle, navigate, isPast }) {
  const refillPct = med.totalRefills > 0 ? (med.refillsRemaining / med.totalRefills) * 100 : 0

  return (
    <div
      className="section-card"
      style={{
        opacity: isPast ? 0.75 : 1,
        cursor: 'pointer',
        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'
      }}
    >
      <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {!isPast && (
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={() => onToggle && onToggle(med.id)}
            style={{ marginTop: 4, cursor: 'pointer', width: 16, height: 16 }}
            onClick={e => e.stopPropagation()}
          />
        )}

        <div style={{ flex: 1 }} onClick={() => navigate(`/medications/${med.id}`)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-md)' }}>
                {med.name} <span style={{ fontWeight: 400, fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>{med.dosage}</span>
              </div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {med.frequency} — {med.route}
              </div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Prescribed by {med.prescriber} | {med.pharmacy}
              </div>
            </div>
            <div>
              <span className={`badge ${isPast ? 'badge--gray' : 'badge--green'}`}>
                {med.status}
              </span>
              {isPast && med.endDate && (
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  Discontinued: {med.endDate}
                </div>
              )}
            </div>
          </div>

          {!isPast && med.isRefillable && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                <span>Refills remaining: {med.refillsRemaining}/{med.totalRefills}</span>
                <span>Last filled: {med.lastFilledDate}</span>
              </div>
              <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${refillPct}%`, background: refillPct > 40 ? 'var(--color-success)' : refillPct > 20 ? 'var(--color-warning)' : 'var(--color-danger)', borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
            </div>
          )}
        </div>

        <ChevronRight size={16} style={{ color: 'var(--color-text-secondary)', marginTop: 4, flexShrink: 0 }} />
      </div>
    </div>
  )
}
