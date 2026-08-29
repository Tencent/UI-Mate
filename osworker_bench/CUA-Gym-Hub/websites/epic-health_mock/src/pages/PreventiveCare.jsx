import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Shield, Calendar } from 'lucide-react'
import '../styles/common.css'

export default function PreventiveCare() {
  const { state } = useApp()
  const navigate = useNavigate()

  const items = state.preventiveCare || []

  const getStatusBadge = (status) => {
    if (status === 'Completed') return 'badge--green'
    if (status === 'Due') return 'badge--orange'
    if (status === 'Overdue') return 'badge--red'
    return 'badge--gray'
  }

  const getBorderColor = (status) => {
    if (status === 'Overdue') return 'var(--color-danger)'
    if (status === 'Due') return 'var(--color-warning)'
    return 'transparent'
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Shield size={22} style={{ color: 'var(--color-primary)' }} />
        Preventive Care
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => (
          <div
            key={item.id}
            className="section-card"
            style={{ borderLeft: `4px solid ${getBorderColor(item.status)}` }}
          >
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-md)' }}>{item.name}</span>
                  <span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span>
                </div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                  {item.category} · {item.frequency}
                </div>
                {item.notes && (
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    {item.notes}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 'var(--font-sm)', flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Last Completed</div>
                  <div style={{ fontWeight: 600 }}>{item.lastCompleted || '—'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Next Due</div>
                  <div style={{ fontWeight: 600 }}>{item.nextDue || '—'}</div>
                </div>
              </div>
              {(item.status === 'Due' || item.status === 'Overdue') && (
                <button className="btn btn--primary btn--sm" onClick={() => navigate('/schedule')}>
                  <Calendar size={14} /> Schedule Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
