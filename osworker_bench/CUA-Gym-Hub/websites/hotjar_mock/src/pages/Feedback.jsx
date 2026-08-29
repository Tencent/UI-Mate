import { useState } from 'react'
import { Settings, MessageCircle, X, Check } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'

function EmojiIcon({ type }) {
  const emojis = { happy: '😊', sad: '😞', confused: '😕', neutral: '😐', love: '😍' }
  return <span style={{ fontSize: 24 }}>{emojis[type] || '😐'}</span>
}

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Feedback() {
  const { state, dispatch } = useAppContext()
  const [sentimentFilter, setSentimentFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [activeView, setActiveView] = useState('responses')
  const [widgetEnabled, setWidgetEnabled] = useState(state.feedbackWidgetConfig?.enabled !== false)
  const [widgetPosition, setWidgetPosition] = useState(state.feedbackWidgetConfig?.position || 'right')
  const [widgetColor, setWidgetColor] = useState(state.feedbackWidgetConfig?.color || '#FF3C00')
  const [widgetText, setWidgetText] = useState(state.feedbackWidgetConfig?.text || 'Feedback')
  const [widgetShowEmoji, setWidgetShowEmoji] = useState(state.feedbackWidgetConfig?.showEmoji !== false)
  const [widgetShowMessage, setWidgetShowMessage] = useState(state.feedbackWidgetConfig?.showMessage !== false)
  const [widgetShowScreenshot, setWidgetShowScreenshot] = useState(state.feedbackWidgetConfig?.showScreenshot !== false)
  const [widgetSaved, setWidgetSaved] = useState(false)

  const feedback = (state.feedback || []).filter(fb => fb.siteId === state.activeSiteId)
  const filtered = sentimentFilter === 'all' ? feedback : feedback.filter(fb => fb.sentiment === sentimentFilter)

  const positive = feedback.filter(f => f.sentiment === 'positive').length
  const negative = feedback.filter(f => f.sentiment === 'negative').length
  const neutral = feedback.filter(f => f.sentiment === 'neutral').length
  const total = feedback.length

  const sentimentColors = { positive: '#10B981', negative: '#EF4444', neutral: '#6B7280' }

  function handleSaveWidgetConfig() {
    dispatch({
      type: 'SET_STATE',
      payload: {
        ...state,
        feedbackWidgetConfig: {
          enabled: widgetEnabled,
          position: widgetPosition,
          color: widgetColor,
          text: widgetText,
          showEmoji: widgetShowEmoji,
          showMessage: widgetShowMessage,
          showScreenshot: widgetShowScreenshot,
        }
      }
    })
    setWidgetSaved(true)
    setTimeout(() => setWidgetSaved(false), 2000)
  }

  function handleDeleteFeedback(fbId, e) {
    e.stopPropagation()
    const newFeedback = state.feedback.filter(f => f.id !== fbId)
    dispatch({ type: 'SET_STATE', payload: { ...state, feedback: newFeedback } })
  }

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-header">
          <h1 className="page-title">Feedback</h1>
          <p className="page-subtitle">See what visitors think about your site</p>
        </div>
      </div>

      {/* View tabs */}
      <div className="tab-bar">
        <button className={`tab-btn ${activeView === 'responses' ? 'active' : ''}`} onClick={() => setActiveView('responses')}>
          <MessageCircle size={14} style={{ marginRight: 4 }} />
          Responses ({total})
        </button>
        <button className={`tab-btn ${activeView === 'widget' ? 'active' : ''}`} onClick={() => setActiveView('widget')}>
          <Settings size={14} style={{ marginRight: 4 }} />
          Widget config
        </button>
      </div>

      {activeView === 'responses' && (
        <>
          {/* Summary */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div className="metric-card" style={{ flex: 1 }}>
              <div className="metric-label">Total feedback</div>
              <div className="metric-value">{total}</div>
            </div>
            <div className="metric-card" style={{ flex: 1 }}>
              <div className="metric-label">Positive</div>
              <div className="metric-value" style={{ color: '#10B981' }}>{positive} <span style={{ fontSize: 16, fontWeight: 400, color: '#6B7280' }}>({total > 0 ? Math.round(positive/total*100) : 0}%)</span></div>
            </div>
            <div className="metric-card" style={{ flex: 1 }}>
              <div className="metric-label">Negative</div>
              <div className="metric-value" style={{ color: '#EF4444' }}>{negative} <span style={{ fontSize: 16, fontWeight: 400, color: '#6B7280' }}>({total > 0 ? Math.round(negative/total*100) : 0}%)</span></div>
            </div>
            <div className="metric-card" style={{ flex: 1 }}>
              <div className="metric-label">Neutral</div>
              <div className="metric-value" style={{ color: '#6B7280' }}>{neutral}</div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="tab-bar" style={{ marginBottom: 16 }}>
            {['all', 'positive', 'negative', 'neutral'].map(s => (
              <button
                key={s}
                onClick={() => setSentimentFilter(s)}
                className={`tab-btn ${sentimentFilter === s ? 'active' : ''}`}
                style={{
                  color: sentimentFilter === s
                    ? (s === 'all' ? '#FF3C00' : sentimentColors[s])
                    : '#6B7280',
                  borderBottomColor: sentimentFilter === s
                    ? (s === 'all' ? '#FF3C00' : sentimentColors[s])
                    : 'transparent'
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {s !== 'all' && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8 }}>
                  ({s === 'positive' ? positive : s === 'negative' ? negative : neutral})
                </span>}
              </button>
            ))}
          </div>

          {/* Feedback list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(fb => (
              <div
                key={fb.id}
                className="card"
                style={{ padding: '12px 16px', cursor: 'pointer', borderLeft: `3px solid ${sentimentColors[fb.sentiment]}` }}
                onClick={() => setExpandedId(expandedId === fb.id ? null : fb.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <EmojiIcon type={fb.emoji} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: '#2D3038', marginBottom: 4, lineHeight: '20px' }}>{fb.message}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: 12, color: '#9CA3AF' }}>
                      <span>{formatDate(fb.submittedAt)}</span>
                      <span>·</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{fb.page}</span>
                      <span>·</span>
                      <span className={`badge badge-${fb.sentiment === 'positive' ? 'green' : fb.sentiment === 'negative' ? 'red' : 'grey'}`} style={{ textTransform: 'capitalize' }}>{fb.sentiment}</span>
                      <span className="badge badge-grey">{fb.device}</span>
                    </div>
                    {expandedId === fb.id && (
                      <div style={{ marginTop: 8, padding: 12, background: '#F9FAFB', borderRadius: 6, fontSize: 13, color: '#6B7280' }}>
                        <div><strong>Page:</strong> {fb.page}</div>
                        <div><strong>Browser:</strong> {fb.browser}</div>
                        <div><strong>Device:</strong> {fb.device}</div>
                        <div style={{ marginTop: 8 }}>
                          <button className="btn-ghost" style={{ fontSize: 12, color: '#EF4444', padding: '4px 8px' }} onClick={(e) => handleDeleteFeedback(fb.id, e)}>
                            Delete feedback
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-title">No {sentimentFilter !== 'all' ? sentimentFilter : ''} feedback yet</div>
              </div>
            )}
          </div>
        </>
      )}

      {activeView === 'widget' && (
        <div style={{ display: 'flex', gap: 32 }}>
          {/* Config form */}
          <div style={{ flex: 1, maxWidth: 480 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Feedback widget configuration</h2>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="label" style={{ marginBottom: 0 }}>Widget enabled</label>
                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                  <input type="checkbox" checked={widgetEnabled} onChange={e => setWidgetEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: 12,
                    background: widgetEnabled ? '#FF3C00' : '#D1D5DB', transition: 'background 0.2s'
                  }}>
                    <span style={{
                      position: 'absolute', left: widgetEnabled ? 22 : 2, top: 2, width: 20, height: 20,
                      background: '#FFFFFF', borderRadius: '50%', transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </span>
                </label>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label">Button text</label>
              <input className="input" value={widgetText} onChange={e => setWidgetText(e.target.value)} placeholder="Feedback" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label">Position</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['left', 'right', 'bottom-left', 'bottom-right'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => setWidgetPosition(pos)}
                    style={{
                      padding: '6px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                      border: `1px solid ${widgetPosition === pos ? '#FF3C00' : '#E5E7EB'}`,
                      background: widgetPosition === pos ? '#FFF7F5' : '#FFFFFF',
                      color: widgetPosition === pos ? '#FF3C00' : '#6B7280'
                    }}
                  >
                    {pos.charAt(0).toUpperCase() + pos.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label">Brand color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={widgetColor}
                  onChange={e => setWidgetColor(e.target.value)}
                  style={{ width: 40, height: 32, border: '1px solid #E5E7EB', borderRadius: 4, cursor: 'pointer', padding: 2 }}
                />
                <input className="input" value={widgetColor} onChange={e => setWidgetColor(e.target.value)} style={{ width: 120 }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label" style={{ marginBottom: 12 }}>Widget fields</label>
              {[
                { label: 'Emoji reaction', checked: widgetShowEmoji, onChange: setWidgetShowEmoji },
                { label: 'Text message', checked: widgetShowMessage, onChange: setWidgetShowMessage },
                { label: 'Screenshot capture', checked: widgetShowScreenshot, onChange: setWidgetShowScreenshot },
              ].map(field => (
                <label key={field.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={field.checked} onChange={e => field.onChange(e.target.checked)} style={{ accentColor: '#FF3C00', cursor: 'pointer' }} />
                  {field.label}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn-primary" onClick={handleSaveWidgetConfig}>Save configuration</button>
              {widgetSaved && (
                <span style={{ color: '#10B981', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={14} /> Saved!
                </span>
              )}
            </div>
          </div>

          {/* Live preview */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#6B7280' }}>Preview</h3>
            <div style={{
              position: 'relative', width: '100%', maxWidth: 400, height: 500,
              background: '#F3F4F6', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden'
            }}>
              {/* Mock page */}
              <div style={{ padding: 20 }}>
                <div style={{ height: 32, background: '#E5E7EB', borderRadius: 4, marginBottom: 12 }} />
                <div style={{ height: 120, background: '#E5E7EB', borderRadius: 6, marginBottom: 12 }} />
                <div style={{ height: 60, background: '#E5E7EB', borderRadius: 6, marginBottom: 12 }} />
                <div style={{ height: 80, background: '#E5E7EB', borderRadius: 6 }} />
              </div>

              {/* Widget button preview */}
              {widgetEnabled && (
                <>
                  {(widgetPosition === 'right' || widgetPosition === 'left') && (
                    <div style={{
                      position: 'absolute',
                      [widgetPosition]: -28,
                      top: '50%',
                      transform: `translateY(-50%) rotate(${widgetPosition === 'right' ? '90' : '-90'}deg)`,
                      transformOrigin: `${widgetPosition === 'right' ? 'right' : 'left'} center`,
                      background: widgetColor,
                      color: '#FFFFFF',
                      padding: '6px 14px',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: '0 0 6px 6px',
                      whiteSpace: 'nowrap'
                    }}>
                      {widgetText}
                    </div>
                  )}
                  {(widgetPosition === 'bottom-right' || widgetPosition === 'bottom-left') && (
                    <div style={{
                      position: 'absolute',
                      bottom: 16,
                      [widgetPosition === 'bottom-right' ? 'right' : 'left']: 16,
                      background: widgetColor,
                      color: '#FFFFFF',
                      padding: '8px 16px',
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      <MessageCircle size={14} />
                      {widgetText}
                    </div>
                  )}

                  {/* Widget popup preview */}
                  <div style={{
                    position: 'absolute',
                    bottom: widgetPosition.startsWith('bottom') ? 56 : 20,
                    right: widgetPosition.includes('right') ? 16 : 'auto',
                    left: widgetPosition.includes('left') ? 16 : 'auto',
                    width: 220,
                    background: '#FFFFFF',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    padding: 14,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>Send us feedback</span>
                      <X size={12} color="#9CA3AF" />
                    </div>
                    {widgetShowEmoji && (
                      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 8 }}>
                        {['😠', '😞', '😐', '😊', '😍'].map((e, i) => (
                          <span key={i} style={{ fontSize: 18, cursor: 'pointer', opacity: i === 3 ? 1 : 0.5 }}>{e}</span>
                        ))}
                      </div>
                    )}
                    {widgetShowMessage && (
                      <div style={{ height: 48, background: '#F9FAFB', borderRadius: 4, border: '1px solid #E5E7EB', marginBottom: 8, padding: 6 }}>
                        <div style={{ fontSize: 10, color: '#9CA3AF' }}>Tell us what you think...</div>
                      </div>
                    )}
                    {widgetShowScreenshot && (
                      <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        📷 Include screenshot
                      </div>
                    )}
                    <div style={{ background: widgetColor, color: 'white', borderRadius: 4, padding: '4px 0', textAlign: 'center', fontSize: 11, fontWeight: 600 }}>
                      Submit
                    </div>
                    <div style={{ marginTop: 6, fontSize: 9, color: '#9CA3AF', textAlign: 'center' }}>Powered by xotjar</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
