import { useApp } from '../context/AppContext'
import '../styles/common.css'

export default function Insurance() {
  const { state } = useApp()
  const insurance = (state.insurance || [])[0]

  if (!insurance) {
    return <div style={{ padding: 20, color: 'var(--color-text-secondary)' }}>No insurance information on file.</div>
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20 }}>Insurance Information</h1>

      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">{insurance.planName}</h2>
          <span className={`badge ${insurance.isActive ? 'badge--green' : 'badge--gray'}`}>
            {insurance.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 'var(--font-sm)' }}>
            {[
              ['Plan Type', insurance.planType],
              ['Member ID', insurance.memberId],
              ['Group Number', insurance.groupNumber],
              ['Subscriber', insurance.subscriberName],
              ['Relationship', insurance.relationship],
              ['Effective Date', insurance.effectiveDate],
              ['Contact Phone', insurance.contactPhone],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Deductible</h2>
          </div>
          <div className="section-card-body">
            <div style={{ fontSize: 'var(--font-sm)', marginBottom: 8 }}>
              <strong>${insurance.deductible.metAmount}</strong> of ${insurance.deductible.individual} met (Individual)
            </div>
            <div style={{ height: 10, background: 'var(--color-border)', borderRadius: 5, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ height: '100%', width: `${(insurance.deductible.metAmount / insurance.deductible.individual) * 100}%`, background: 'var(--color-primary)', borderRadius: 5 }} />
            </div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
              Family deductible: ${insurance.deductible.family}
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Out-of-Pocket Maximum</h2>
          </div>
          <div className="section-card-body">
            <div style={{ fontSize: 'var(--font-sm)', marginBottom: 8 }}>
              <strong>${insurance.outOfPocketMax.metAmount}</strong> of ${insurance.outOfPocketMax.individual} met (Individual)
            </div>
            <div style={{ height: 10, background: 'var(--color-border)', borderRadius: 5, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ height: '100%', width: `${(insurance.outOfPocketMax.metAmount / insurance.outOfPocketMax.individual) * 100}%`, background: 'var(--color-success)', borderRadius: 5 }} />
            </div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
              Family out-of-pocket max: ${insurance.outOfPocketMax.family}
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Copays</h2>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {Object.entries(insurance.copay).map(([key, value]) => (
              <div key={key} style={{ padding: '14px', background: 'var(--color-section-bg)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>${value}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', textTransform: 'capitalize', marginTop: 4 }}>
                  {key.replace(/([A-Z])/g, ' $1')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
