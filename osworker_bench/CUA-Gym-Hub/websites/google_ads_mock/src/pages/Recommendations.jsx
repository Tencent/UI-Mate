import React from 'react'
import { useApp } from '../context/AppContext.jsx'

const IMPACT_COLORS = {
  HIGH: { bg: '#FCE8E6', color: '#D93025', label: 'High impact' },
  MEDIUM: { bg: '#FEF7E0', color: '#E37400', label: 'Medium impact' },
  LOW: { bg: '#E8F0FE', color: '#1A73E8', label: 'Low impact' },
}

const TYPE_ICONS = {
  KEYWORD: '🔍',
  BID: '💰',
  BUDGET: '📊',
  AD: '📝',
  EXTENSION: '🔗',
  TARGETING: '🎯',
}

const CATEGORIES = [
  { key: 'ads', label: 'Ads & assets', types: ['AD', 'EXTENSION'] },
  { key: 'keywords', label: 'Keywords & targeting', types: ['KEYWORD', 'TARGETING'] },
  { key: 'bidding', label: 'Bidding & budgets', types: ['BID', 'BUDGET'] },
]

export default function Recommendations() {
  const { state, dispatch } = useApp()
  const recs = state?.recommendations || []
  const pending = recs.filter(r => r.status === 'PENDING')
  const score = state?.account?.optimizationScore || 72

  // SVG gauge
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const progressColor = score >= 80 ? '#188038' : score >= 50 ? '#F9AB00' : '#D93025'

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20 }}>Recommendations</h1>

      {/* Optimization score */}
      <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 32, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width={180} height={180} viewBox="0 0 180 180">
            <circle cx={90} cy={90} r={radius} fill="none" stroke="#F1F3F4" strokeWidth={16} />
            <circle cx={90} cy={90} r={radius} fill="none" stroke={progressColor} strokeWidth={16}
              strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round"
              transform="rotate(-90 90 90)" style={{ transition: 'stroke-dasharray 1s ease' }} />
            <text x={90} y={90} textAnchor="middle" dominantBaseline="middle" fontSize={40} fontWeight={700} fill={progressColor}>{score}</text>
            <text x={90} y={120} textAnchor="middle" dominantBaseline="middle" fontSize={13} fill="#5F6368">/ 100</text>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Your optimization score is {score}%</div>
          <div style={{ fontSize: 14, color: '#5F6368', marginBottom: 16 }}>
            Applying all {pending.length} pending recommendations could raise your score to {Math.min(100, score + pending.length * 3)}%.
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#D93025' }}>{recs.filter(r => r.impact === 'HIGH' && r.status === 'PENDING').length}</div>
              <div style={{ fontSize: 12, color: '#5F6368' }}>High impact</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#E37400' }}>{recs.filter(r => r.impact === 'MEDIUM' && r.status === 'PENDING').length}</div>
              <div style={{ fontSize: 12, color: '#5F6368' }}>Medium impact</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1A73E8' }}>{recs.filter(r => r.impact === 'LOW' && r.status === 'PENDING').length}</div>
              <div style={{ fontSize: 12, color: '#5F6368' }}>Low impact</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categorized cards */}
      {CATEGORIES.map(cat => {
        const catRecs = pending.filter(r => cat.types.includes(r.type))
        if (catRecs.length === 0) return null
        return (
          <div key={cat.key} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>{cat.label}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {catRecs.map(rec => {
                const impact = IMPACT_COLORS[rec.impact] || IMPACT_COLORS.LOW
                return (
                  <div key={rec.id} style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: impact.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {TYPE_ICONS[rec.type] || '💡'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{rec.title}</span>
                        <span style={{ fontSize: 11, background: impact.bg, color: impact.color, padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>
                          {impact.label}
                        </span>
                        {rec.estimatedImpact && (
                          <span style={{ fontSize: 12, background: '#E6F4EA', color: '#188038', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>
                            {rec.estimatedImpact}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: '#5F6368', marginBottom: 8 }}>{rec.description}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                      <button onClick={() => dispatch({ type: 'APPLY_RECOMMENDATION', payload: rec.id })}
                        style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 16px', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>
                        Apply
                      </button>
                      <button onClick={() => dispatch({ type: 'DISMISS_RECOMMENDATION', payload: rec.id })}
                        style={{ background: '#fff', color: '#5F6368', border: 'none', cursor: 'pointer', fontSize: 13, padding: '7px 8px' }}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {pending.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 40, textAlign: 'center', color: '#5F6368' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>All caught up!</div>
          <div style={{ fontSize: 14 }}>No pending recommendations right now.</div>
        </div>
      )}

      {/* Applied/Dismissed */}
      {recs.filter(r => r.status !== 'PENDING').length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12, color: '#5F6368' }}>Applied & dismissed</h2>
          {recs.filter(r => r.status !== 'PENDING').map(rec => (
            <div key={rec.id} style={{ background: '#F8F9FA', border: '1px solid #DADCE0', borderRadius: 8, padding: '12px 16px', marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center', opacity: 0.7 }}>
              <span style={{ fontSize: 18 }}>{TYPE_ICONS[rec.type]}</span>
              <span style={{ fontSize: 13, flex: 1 }}>{rec.title}</span>
              <span style={{ fontSize: 12, background: rec.status === 'APPLIED' ? '#E6F4EA' : '#F1F3F4', color: rec.status === 'APPLIED' ? '#188038' : '#5F6368', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>
                {rec.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
