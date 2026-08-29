import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Share2, X, CheckCircle, ExternalLink, Target, MonitorPlay, MessageCircle, ClipboardCheck, BarChart3 } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { withCurrentSearch } from '../utils/navigation.js'

export default function Home() {
  const { state } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [dismissedBanner, setDismissedBanner] = useState(false)
  const [dismissedCards, setDismissedCards] = useState([])
  const [showShareToast, setShowShareToast] = useState(false)

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
    }
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 2500)
  }

  const suggestedCards = [
    { id: 'invite', title: 'Invite team members', description: 'Collaborate with your team by inviting them to your Xotjar organization.', action: () => navigate(withCurrentSearch('/settings', location.search)) },
    { id: '2fa', title: 'Enable 2FA now', description: 'Add an extra layer of security to your account with two-factor authentication.', action: () => navigate(withCurrentSearch('/settings', location.search)) },
    { id: 'highlights', title: 'Save Highlights', description: 'Save important moments from recordings and share them with your team.', action: () => navigate(withCurrentSearch('/highlights', location.search)) },
    { id: 'attributes', title: 'Track user attributes', description: 'Send user attributes like name and email to personalize your analysis.', action: () => navigate(withCurrentSearch('/events', location.search)) },
  ]

  const visibleCards = suggestedCards.filter(c => !dismissedCards.includes(c.id))

  const quickActions = [
    { label: 'View heatmaps', icon: Target, path: '/heatmaps', color: '#FF3C00' },
    { label: 'Watch recordings', icon: MonitorPlay, path: '/recordings', color: '#FF3C00' },
    { label: 'See feedback', icon: MessageCircle, path: '/feedback', color: '#10B981' },
    { label: 'Create survey', icon: ClipboardCheck, path: '/surveys/new', color: '#F59E0B' },
    { label: 'View funnels', icon: BarChart3, path: '/funnels', color: '#8B5CF6' },
  ]

  return (
    <div className="content-area">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Home</h1>
        </div>
        <button className="btn-secondary" onClick={handleShare}>
          <Share2 size={16} />
          Share
        </button>
      </div>

      {/* Live tracking status */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 1 }}>
          {/* Demo banner */}
          {!dismissedBanner && (
            <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', border: '1px solid #FED7AA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#FF3C00', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>GUIDES: DEMO</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#2D3038', marginBottom: 6 }}>Explore the Xotjar demo</div>
                  <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
                    Get a feel for Xotjar by exploring a demo account with pre-populated data.
                  </div>
                  <button className="btn-primary" onClick={() => navigate(withCurrentSearch('/dashboard', location.search))}>Explore demo</button>
                </div>
                <button
                  className="header-icon-btn"
                  onClick={() => setDismissedBanner(true)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Live success banner */}
          <div className="card" style={{ marginBottom: 16, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle size={20} color="#10B981" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#065F46' }}>And we're live!</div>
              <div style={{ fontSize: 13, color: '#047857' }}>Xotjar is capturing data on {state.sites.find(s => s.id === state.activeSiteId)?.url}</div>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>QUICK ACTIONS</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {quickActions.map(action => {
                const Icon = action.icon
                return (
                  <div
                    key={action.label}
                    className="card"
                    style={{ flex: 1, cursor: 'pointer', padding: 16, textAlign: 'center', transition: 'border-color 0.15s' }}
                    onClick={() => navigate(withCurrentSearch(action.path, location.search))}
                    onMouseEnter={e => e.currentTarget.style.borderColor = action.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${action.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <Icon size={18} color={action.color} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#2D3038' }}>{action.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Suggested for you */}
          {visibleCards.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>SUGGESTED FOR YOU</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {visibleCards.map(card => (
                  <div
                    key={card.id}
                    className="card"
                    style={{ flex: '1 1 calc(50% - 6px)', minWidth: 200, position: 'relative', cursor: 'pointer' }}
                    onClick={card.action}
                  >
                    <button
                      className="header-icon-btn"
                      style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24 }}
                      onClick={(e) => { e.stopPropagation(); setDismissedCards([...dismissedCards, card.id]) }}
                    >
                      <X size={14} />
                    </button>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#2D3038', marginBottom: 6, paddingRight: 24 }}>{card.title}</div>
                    <div style={{ fontSize: 13, color: '#6B7280', lineHeight: '18px' }}>{card.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Tracking status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#065F46', fontWeight: 500 }}>Active sessions: 0</span>
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>
              {state.sites.find(s => s.id === state.activeSiteId)?.url}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#10B981' }}>
              <CheckCircle size={14} />
              Tracking code installed
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Quick stats (30d)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Sessions', value: state.dashboardMetrics?.totalSessions?.toLocaleString() || '0' },
                { label: 'Recordings', value: state.recordings?.filter(r => r.siteId === state.activeSiteId).length || 0 },
                { label: 'Feedback', value: state.feedback?.filter(f => f.siteId === state.activeSiteId).length || 0 },
                { label: 'Surveys', value: state.surveys?.filter(s => s.status === 'active').length || 0 },
              ].map(stat => (
                <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{stat.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2D3038' }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Recent team activity</div>
            {[
              { user: 'Alex Chen', action: 'created a new heatmap', time: '2h ago', page: 'Homepage' },
              { user: 'Alex Chen', action: 'starred a recording', time: '4h ago', page: 'rec-1' },
              { user: 'Alex Chen', action: 'created a survey', time: '1d ago', page: 'NPS Survey' },
            ].map((activity, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 2 ? 12 : 0, paddingBottom: i < 2 ? 12 : 0, borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FF3C00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {activity.user.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#2D3038' }}>
                    <span style={{ fontWeight: 500 }}>{activity.user}</span> {activity.action}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showShareToast && (
        <div className="toast">Link copied to clipboard</div>
      )}
    </div>
  )
}
