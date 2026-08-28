import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, SkipBack, SkipForward, Play, Pause, Star, Tag, Plus, Info, Zap, X, Monitor, Tablet, Smartphone, ChevronDown } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { withCurrentSearch } from '../utils/navigation.js'

function FrustrationBars({ score }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ width: 4, height: `${(i / 5) * 100}%`, borderRadius: 1, background: i <= score ? '#FF3C00' : '#E5E7EB' }} />
      ))}
    </div>
  )
}

function EngagementBars({ score }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ width: 4, height: `${(i / 5) * 100}%`, borderRadius: 1, background: i <= score ? '#10B981' : '#E5E7EB' }} />
      ))}
    </div>
  )
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDate(isoStr) {
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function DeviceIcon({ device }) {
  if (device === 'mobile') return <Smartphone size={12} />
  if (device === 'tablet') return <Tablet size={12} />
  return <Monitor size={12} />
}

export function RecordingsList() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedDevice, setSelectedDevice] = useState('all')
  const [dateFilter, setDateFilter] = useState('30d')

  const siteRecordings = state.recordings.filter(r => r.siteId === state.activeSiteId)

  const filtered = siteRecordings.filter(r => {
    if (selectedDevice !== 'all' && r.device !== selectedDevice) return false
    return true
  })

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">Recordings</h1>
        <p className="page-subtitle">Watch how visitors use your site</p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>Filter by:</span>
        <div className="filter-pill">
          <DeviceIcon device="desktop" />
          Device
          <ChevronDown size={12} />
        </div>
        <div className="filter-pill">
          Frustration
          <ChevronDown size={12} />
        </div>
        <div style={{ flex: 1 }} />
        <div className="toggle-group">
          {['24h', '7d', '15d', '30d'].map(range => (
            <button key={range} className={`toggle-btn ${dateFilter === range ? 'active' : ''}`} onClick={() => setDateFilter(range)}>{range}</button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, padding: '8px 0', borderBottom: '1px solid #E5E7EB', fontSize: 13, color: '#6B7280' }}>
        <span>{filtered.length} recordings</span>
        <span>·</span>
        <span>{filtered.filter(r => r.hasRageClicks).length} with rage clicks</span>
        <span>·</span>
        <span>{filtered.filter(r => r.isStarred).length} starred</span>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: '8px 16px', borderBottom: '1px solid #E5E7EB', fontSize: 12, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <span>Visitor</span>
        <span>Frustration</span>
        <span>Engagement</span>
        <span>Duration</span>
        <span>Pages</span>
      </div>

      {filtered.map(rec => (
        <div
          key={rec.id}
          onClick={() => navigate(withCurrentSearch(`/recordings/${rec.id}`, location.search))}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
            padding: '12px 16px',
            borderBottom: '1px solid #E5E7EB',
            cursor: 'pointer',
            transition: 'background 0.15s',
            alignItems: 'center'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
          onMouseLeave={e => e.currentTarget.style.background = ''}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DeviceIcon device={rec.device} />
              <span style={{ fontWeight: 500, fontSize: 13 }}>{rec.visitorId}</span>
              {rec.isStarred && <Star size={12} color="#F59E0B" fill="#F59E0B" />}
              {rec.hasRageClicks && <span className="badge badge-red">Rage</span>}
              {rec.hasErrors && <span className="badge badge-yellow">Error</span>}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{formatDate(rec.startedAt)} · {rec.country} · {rec.browser}</div>
            {rec.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {rec.tags.map(tag => <span key={tag} className="badge badge-grey">{tag}</span>)}
              </div>
            )}
          </div>
          <div><FrustrationBars score={rec.frustrationScore} /></div>
          <div><EngagementBars score={rec.engagementScore} /></div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{formatDuration(rec.duration)}</div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>{rec.pagesVisited}</div>
        </div>
      ))}
    </div>
  )
}

export function RecordingPlayer() {
  const { state, dispatch } = useAppContext()
  const { id } = useParams()
  const navigate = useNavigate()
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [activeTab, setActiveTab] = useState('info')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [comment, setComment] = useState('')
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 })
  const [notice, setNotice] = useState('')
  const intervalRef = useRef(null)

  const recording = state.recordings.find(r => r.id === id)
  const totalTime = recording?.duration || 0
  const siteRecordings = recording ? state.recordings.filter(r => r.siteId === recording.siteId) : []
  const recordingIndex = recording ? siteRecordings.findIndex(r => r.id === recording.id) : -1

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(t => {
          if (t >= totalTime) {
            setIsPlaying(false)
            return totalTime
          }
          return t + playbackSpeed
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, playbackSpeed, totalTime])

  useEffect(() => {
    if (!recording?.events) return
    const currentMs = currentTime * 1000
    const currentEvent = recording.events.slice().reverse().find(e => e.timestamp <= currentMs)
    if (currentEvent && currentEvent.x !== undefined) {
      setCursorPos({ x: currentEvent.x, y: currentEvent.y })
    }
  }, [currentTime, recording])

  if (!recording) return (
    <div className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>Recording not found</div>
    </div>
  )

  const currentSite = state.sites.find(s => s.id === recording.siteId)
  const currentPage = (() => {
    const currentMs = currentTime * 1000
    const pageEvents = recording.events?.filter(e => e.type === 'page_change') || []
    const currentPageEvent = pageEvents.slice().reverse().find(e => e.timestamp <= currentMs)
    return currentPageEvent?.page || recording.pagesList?.[0] || '/'
  })()

  function toggleStar() {
    dispatch({ type: 'UPDATE_RECORDING', payload: { id: recording.id, updates: { isStarred: !recording.isStarred } } })
  }

  function handleSpeedToggle() {
    const speeds = [1, 2, 4]
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length
    setPlaybackSpeed(speeds[nextIdx])
  }

  function handleSaveComment() {
    if (!comment.trim()) return
    const newHighlight = {
      id: `highlight-${Date.now()}`,
      siteId: recording.siteId,
      title: comment.substring(0, 50),
      sourceType: 'recording',
      sourceId: recording.id,
      startTime: currentTime * 1000,
      endTime: (currentTime + 6) * 1000,
      createdAt: new Date().toISOString(),
      createdBy: state.currentUser?.id,
      collectionId: null,
      notes: comment
    }
    dispatch({ type: 'ADD_HIGHLIGHT', payload: newHighlight })
    setComment('')
    setShowCommentBox(false)
    setNotice('Comment saved as a highlight.')
  }

  function navigateRecording(direction) {
    if (recordingIndex === -1 || siteRecordings.length < 2) {
      setNotice('No other recordings are available for this site.')
      return
    }
    const nextIndex = (recordingIndex + direction + siteRecordings.length) % siteRecordings.length
    navigate(withCurrentSearch(`/recordings/${siteRecordings[nextIndex].id}`, location.search))
    setCurrentTime(0)
    setIsPlaying(false)
  }

  function addToCollection() {
    const collectionId = state.highlightCollections?.[0]?.id || null
    dispatch({
      type: 'ADD_HIGHLIGHT',
      payload: {
        id: `highlight-${Date.now()}`,
        siteId: recording.siteId,
        title: `Recording ${recording.id} clip`,
        sourceType: 'recording',
        sourceId: recording.id,
        startTime: currentTime * 1000,
        endTime: Math.min(totalTime, currentTime + 10) * 1000,
        createdAt: new Date().toISOString(),
        createdBy: state.currentUser?.id,
        collectionId,
        notes: `Saved from ${recording.visitorId} at ${formatDuration(currentTime)}`
      }
    })
    setNotice(collectionId ? 'Clip added to the first highlights collection.' : 'Clip saved in Highlights.')
  }

  async function shareRecording() {
    const shareUrl = `${window.location.origin}/recordings/${recording.id}${window.location.search}`
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(shareUrl)
    } catch (e) {
      console.warn('Clipboard copy unavailable:', e)
    }
    setNotice('Recording link copied.')
  }

  const actionCounts = {
    clicks: recording.events?.filter(e => e.type === 'click').length || 0,
    text_input: recording.events?.filter(e => e.type === 'input').length || 0,
    rage_clicks: recording.events?.filter(e => e.type === 'rage_click').length || 0,
    u_turns: recording.events?.filter(e => e.type === 'u_turn').length || 0,
    surveys: 0,
    feedback: 0,
    errors: recording.events?.filter(e => e.type === 'error').length || 0,
    events: recording.events?.length || 0,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#1A1A2E' }}>
      {/* Top bar */}
      <div style={{ padding: '8px 16px', background: '#1A1A2E', borderBottom: '1px solid #2D3038', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="header-icon-btn" style={{ color: '#9CA3AF' }} onClick={() => navigate(withCurrentSearch('/recordings', location.search))}>
          <ArrowLeft size={18} />
        </button>
        <button className="header-icon-btn" style={{ color: '#9CA3AF' }} onClick={() => navigateRecording(-1)}><SkipBack size={18} /></button>
        <button className="header-icon-btn" style={{ color: '#9CA3AF' }} onClick={() => navigateRecording(1)}><SkipForward size={18} /></button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
          Recording {recording.id}
        </div>
        <button className="btn-blue" style={{ fontSize: 13 }} onClick={addToCollection}>
          <Plus size={14} />
          Add to collection
        </button>
        <button className="btn-secondary" style={{ fontSize: 13, background: 'transparent', borderColor: '#4B5563', color: '#9CA3AF' }} onClick={shareRecording}>
          Share
        </button>
        <button className="header-icon-btn" style={{ color: '#9CA3AF' }} onClick={toggleStar}>
          <Star size={18} color={recording.isStarred ? '#F59E0B' : '#9CA3AF'} fill={recording.isStarred ? '#F59E0B' : 'none'} />
        </button>
      </div>

      {/* URL bar */}
      <div style={{ padding: '6px 16px', background: '#16213E', borderBottom: '1px solid #2D3038', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="badge badge-blue" style={{ fontSize: 11 }}>TAB 1/1</span>
        <span style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'monospace' }}>{currentSite?.url}{currentPage}</span>
        {notice && <span style={{ marginLeft: 'auto', color: '#A7F3D0', fontSize: 12 }}>{notice}</span>}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Viewport */}
        <div style={{ flex: 1, position: 'relative', background: '#F3F4F6', overflow: 'hidden' }}>
          {/* Mock website */}
          <div style={{ width: '100%', height: '100%', overflow: 'auto', padding: 24 }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{ height: 48, background: '#E5E7EB', borderRadius: 6, marginBottom: 16 }} />
              <div style={{ height: 200, background: '#E5E7EB', borderRadius: 8, marginBottom: 16 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 140, background: '#E5E7EB', borderRadius: 8 }} />)}
              </div>
              <div style={{ height: 100, background: '#E5E7EB', borderRadius: 8 }} />
            </div>
          </div>

          {/* Animated cursor */}
          <div
            style={{
              position: 'absolute',
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              width: 16,
              height: 16,
              background: '#FF3C00',
              borderRadius: '50% 50% 50% 0',
              transform: 'translate(-50%, -50%) rotate(-45deg)',
              pointerEvents: 'none',
              transition: isPlaying ? 'left 0.5s, top 0.5s' : 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          />
        </div>

        {/* Right sidebar */}
        <div style={{ width: 280, background: '#FFFFFF', borderLeft: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
            {['info', 'actions'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '10px', fontSize: 13, fontWeight: 500,
                  color: activeTab === tab ? '#FF3C00' : '#6B7280',
                  background: 'transparent', border: 'none',
                  borderBottom: `2px solid ${activeTab === tab ? '#FF3C00' : 'transparent'}`,
                  cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize'
                }}
              >
                {tab === 'info' ? 'Info' : 'Actions'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {activeTab === 'info' ? (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 12 }}>SESSION INFO</div>
                {[
                  { label: 'Visitor', value: recording.visitorId },
                  { label: 'Country', value: `${recording.countryFlag?.toUpperCase()} ${recording.country}` },
                  { label: 'Date', value: formatDate(recording.startedAt) },
                  { label: 'Device', value: `${recording.device.charAt(0).toUpperCase() + recording.device.slice(1)} (${recording.screenSize})` },
                  { label: 'Browser', value: recording.browser },
                  { label: 'OS', value: recording.os },
                  { label: 'Pages visited', value: recording.pagesVisited },
                  { label: 'Duration', value: formatDuration(recording.duration) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13 }}>
                    <span style={{ color: '#6B7280' }}>{label}</span>
                    <span style={{ fontWeight: 500, color: '#2D3038', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 12 }}>RECORDING ACTIONS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Clicks', value: actionCounts.clicks, color: '#3B82F6' },
                    { label: 'Text input', value: actionCounts.text_input, color: '#10B981' },
                    { label: 'Rage clicks', value: actionCounts.rage_clicks, color: '#EF4444' },
                    { label: 'U-turns', value: actionCounts.u_turns, color: '#F59E0B' },
                    { label: 'Surveys', value: actionCounts.surveys, color: '#8B5CF6' },
                    { label: 'Feedback', value: actionCounts.feedback, color: '#EC4899' },
                    { label: 'Errors', value: actionCounts.errors, color: '#EF4444' },
                    { label: 'Events', value: actionCounts.events, color: '#6B7280' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="card" style={{ padding: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
                      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: '#3B82F6', cursor: 'pointer', textAlign: 'center' }}>
                  See all {recording.events?.length || 0} actions
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom control bar */}
      <div style={{ background: '#1A1A2E', borderTop: '1px solid #2D3038', padding: '8px 16px' }}>
        {/* Timeline */}
        <div style={{ marginBottom: 8, position: 'relative' }}>
          <input
            type="range"
            min={0}
            max={totalTime}
            value={currentTime}
            onChange={e => setCurrentTime(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#FF3C00' }}
          />
          {/* Event markers */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', pointerEvents: 'none' }}>
            {recording.events?.filter(e => ['rage_click', 'click', 'u_turn', 'page_change'].includes(e.type)).map(event => {
              const pct = (event.timestamp / 1000 / totalTime) * 100
              const color = event.type === 'rage_click' ? '#EF4444' : event.type === 'u_turn' ? '#F59E0B' : event.type === 'page_change' ? '#9CA3AF' : '#FF3C00'
              return (
                <div key={event.id} style={{ position: 'absolute', left: `${pct}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 6, height: 6, borderRadius: '50%', background: color }} />
              )
            })}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="header-icon-btn" style={{ color: '#9CA3AF' }} onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}>
            <SkipBack size={18} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF3C00', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button className="header-icon-btn" style={{ color: '#9CA3AF' }} onClick={() => setCurrentTime(Math.min(totalTime, currentTime + 10))}>
            <SkipForward size={18} />
          </button>
          <button
            onClick={handleSpeedToggle}
            style={{ padding: '4px 8px', background: '#2D3038', border: 'none', borderRadius: 4, color: '#FFFFFF', fontSize: 12, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
          >
            {playbackSpeed}x
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 13, color: '#9CA3AF', fontFamily: 'monospace' }}>
            {formatDuration(currentTime)} / {formatDuration(totalTime)}
          </div>

          <button
            className="btn-secondary"
            style={{ fontSize: 12, background: 'transparent', borderColor: '#4B5563', color: '#9CA3AF' }}
            onClick={() => setShowCommentBox(!showCommentBox)}
          >
            Comment
          </button>
        </div>

        {/* Comment box */}
        {showCommentBox && (
          <div style={{ marginTop: 8, background: '#2D3038', borderRadius: 6, padding: 12 }}>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment..."
              style={{ width: '100%', height: 80, background: '#1A1A2E', border: '1px solid #4B5563', borderRadius: 4, color: '#FFFFFF', fontSize: 13, padding: 8, fontFamily: 'inherit', resize: 'none', outline: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button className="btn-secondary" style={{ fontSize: 12, background: 'transparent', borderColor: '#4B5563', color: '#9CA3AF' }} onClick={() => setShowCommentBox(false)}>Cancel</button>
              <button className="btn-blue" style={{ fontSize: 12 }} onClick={handleSaveComment}>Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
