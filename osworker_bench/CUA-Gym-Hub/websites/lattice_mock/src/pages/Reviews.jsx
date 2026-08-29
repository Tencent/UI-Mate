import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { formatDate } from '../utils/dataManager.js'

export default function Reviews() {
  const { state } = useApp()
  const navigate = useNavigate()

  if (!state) return null
  const { reviewCycles, reviews } = state

  const getProgress = (cycleId) => {
    const cycleReviews = reviews.filter(r => r.cycleId === cycleId)
    const total = cycleReviews.length
    const completed = cycleReviews.filter(r => r.status === 'completed').length
    const stillReceiving = cycleReviews.filter(r => r.status === 'still_receiving').length
    const notStarted = cycleReviews.filter(r => r.status === 'not_started').length
    return { total, completed, stillReceiving, notStarted }
  }

  const statusBadge = {
    active: { label: 'Active', bg: '#DCFCE7', color: '#166534' },
    completed: { label: 'Completed', bg: '#F3F4F6', color: '#374151' },
    draft: { label: 'Draft', bg: '#EFF6FF', color: '#1D4ED8' },
  }

  return (
    <div style={{ padding: 32 }}>
      <div className="page-header">
        <h1 className="page-title">Reviews</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reviewCycles.map(cycle => {
          const { total, completed, stillReceiving, notStarted } = getProgress(cycle.id)
          const badge = statusBadge[cycle.status] || { label: cycle.status, bg: '#F3F4F6', color: '#374151' }

          return (
            <div
              key={cycle.id}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/reviews/${cycle.id}`)}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E' }}>{cycle.name}</h2>
                    <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: badge.bg, color: badge.color, fontWeight: 600 }}>
                      {badge.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
                    {formatDate(cycle.startDate)} – {formatDate(cycle.endDate)}
                  </div>

                  {/* Progress bar */}
                  <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', maxWidth: 400, marginBottom: 8 }}>
                    {total > 0 && (
                      <>
                        <div style={{ width: `${completed / total * 100}%`, background: '#22C55E', transition: 'width 0.3s' }} />
                        <div style={{ width: `${stillReceiving / total * 100}%`, background: '#F59E0B', transition: 'width 0.3s' }} />
                        <div style={{ width: `${notStarted / total * 100}%`, background: '#E5E7EB' }} />
                      </>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: '#6B7280' }}>
                    {completed} of {total} reviews completed
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
