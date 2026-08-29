import { useNavigate } from 'react-router-dom'
import { Plus, FlaskConical, CheckCircle, Play, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: '#6B7280', bg: '#F3F4F6', icon: Clock },
  running: { label: 'Running', color: '#059669', bg: '#ECFDF5', icon: Play },
  completed: { label: 'Completed', color: '#7C3AED', bg: '#F3EEFE', icon: CheckCircle },
}

export default function ExperimentList() {
  const { state } = useApp()
  const navigate = useNavigate()

  return (
    <div style={{ padding: 24, background: 'white', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Experiments</h1>
        <button className="btn-primary" onClick={() => navigate('/experiment/new')}>
          <Plus size={14} /> New Experiment
        </button>
      </div>
      <p className="page-subtitle">Run A/B tests and feature experiments to optimize your product.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(state.experiments || []).map(exp => {
          const sc = STATUS_CONFIG[exp.status] || STATUS_CONFIG.draft
          const StatusIcon = sc.icon
          return (
            <div
              key={exp.id}
              onClick={() => navigate(`/experiment/${exp.id}`)}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-200)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(124,58,237,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FlaskConical size={18} style={{ color: sc.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{exp.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {exp.type === 'ab_test' ? 'A/B Test' : exp.type} &middot; {exp.variants?.length || 0} variants &middot; Created {new Date(exp.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: sc.bg, fontSize: 12, fontWeight: 600, color: sc.color }}>
                <StatusIcon size={13} />
                {sc.label}
              </div>
              {exp.results?.lift && (
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: exp.results.lift > 0 ? 'var(--success)' : 'var(--error)' }}>
                    {exp.results.lift > 0 ? '+' : ''}{exp.results.lift}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>lift</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
