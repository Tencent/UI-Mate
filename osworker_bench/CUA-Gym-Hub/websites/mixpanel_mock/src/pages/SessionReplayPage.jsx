import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Header from '../components/Header.jsx'
import { Play, Pause, ChevronDown, Filter } from 'lucide-react'

export default function SessionReplayPage() {
  const { state } = useApp()
  const replays = state?.sessionReplays?.length ? state.sessionReplays : buildReplaysFromEvents(state)
  const [selectedId, setSelectedId] = useState(replays[0]?.id || null)
  const [activeTab, setActiveTab] = useState('Activity')
  const [playing, setPlaying] = useState(false)
  const [search, setSearch] = useState('')
  const [recency, setRecency] = useState('Newest')
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [shareNotice, setShareNotice] = useState('')

  const filteredReplays = replays.filter(replay => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return replay.distinctId.toLowerCase().includes(q) || replay.url.toLowerCase().includes(q)
  }).sort((a, b) => recency === 'Newest'
    ? new Date(b.timestamp) - new Date(a.timestamp)
    : new Date(a.timestamp) - new Date(b.timestamp))

  const selected = filteredReplays.find(r => r.id === selectedId) || filteredReplays[0]

  function shareReplay() {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setShareNotice('Replay link copied.')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header title="Session Replay" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{
          width: 260, borderRight: '1px solid #E8E8EC', display: 'flex',
          flexDirection: 'column', background: '#fff', overflow: 'hidden', flexShrink: 0
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #E8E8EC' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginBottom: 8 }}>Session Replay</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <button onClick={() => setSearch('')} style={{ padding: '4px 10px', border: '1px solid #E8E8EC', borderRadius: 6, background: search ? '#F3F0FF' : '#fff', cursor: 'pointer', fontSize: 12, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Filter size={11} /> Filter
              </button>
              <select value={recency} onChange={e => setRecency(e.target.value)} style={{ padding: '4px 10px', border: '1px solid #E8E8EC', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#1A1A2E' }}>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <input placeholder="Search for Replays" value={search} onChange={e => setSearch(e.target.value)} style={{
                width: '100%', border: '1px solid #E8E8EC', borderRadius: 6, padding: '6px 10px',
                fontSize: 12, outline: 'none'
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#6B6B80', marginTop: 8 }}>
              Showing {filteredReplays.length} journeys from {replays.length} matching recordings
            </div>
          </div>

          {/* Session list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredReplays.map(replay => (
              <div key={replay.id} onClick={() => setSelectedId(replay.id)} style={{
                padding: '10px 12px', borderBottom: '1px solid #F0F0F4', cursor: 'pointer',
                background: selectedId === replay.id ? '#F3F0FF' : 'none',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => { if (selectedId !== replay.id) e.currentTarget.style.background = '#F7F7F8' }}
              onMouseLeave={e => { if (selectedId !== replay.id) e.currentTarget.style.background = 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#F7F7F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                    {replay.avatar || '😊'}
                  </div>
                  <button onClick={e => { e.stopPropagation(); setSelectedId(replay.id) }} style={{ color: '#7B5CFF', fontSize: 12, fontWeight: 500, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }} className="truncate">
                    {replay.distinctId.length > 20 ? replay.distinctId.slice(0, 18) + '...' : replay.distinctId}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: '#6B6B80', marginBottom: 2 }}>
                  visited for {replay.visitDuration}
                </div>
                <div style={{ fontSize: 11, color: '#6B6B80' }}>
                  {replay.eventCount} events · {new Date(replay.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - player */}
        {selected ? (
          <>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>
              {/* URL bar */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #E8E8EC', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, background: '#F7F7F8', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#6B6B80' }}>
                  {selected.url}
                </div>
                <button onClick={() => setShowHeatmap(v => !v)} style={{ padding: '4px 10px', border: '1px solid #E8E8EC', borderRadius: 6, background: showHeatmap ? '#F3F0FF' : '#fff', cursor: 'pointer', fontSize: 12 }}>View Heatmap</button>
                <button onClick={() => setFeedback('positive')} style={{ padding: '4px 8px', border: '1px solid #E8E8EC', borderRadius: 6, background: feedback === 'positive' ? '#E8F5E9' : '#fff', cursor: 'pointer', fontSize: 14 }}>👍</button>
                <button onClick={() => setFeedback('negative')} style={{ padding: '4px 8px', border: '1px solid #E8E8EC', borderRadius: 6, background: feedback === 'negative' ? '#FCEEEE' : '#fff', cursor: 'pointer', fontSize: 14 }}>👎</button>
              </div>

              {/* Recording info bar */}
              <div style={{ padding: '6px 16px', borderBottom: '1px solid #E8E8EC', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6B6B80' }}>
                <span style={{ fontWeight: 500, color: '#1A1A2E' }}>Recording 1/{replays.length}</span>
                <span>·</span>
                <span>{new Date(selected.timestamp).toLocaleString()}</span>
                <span>·</span>
                <span>{selected.eventCount} events</span>
              </div>

              {/* Website screenshot placeholder */}
              <div style={{
                flex: 1, background: '#F7F7F8', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#6B6B80', flexDirection: 'column', gap: 12
              }}>
                <div style={{ fontSize: 48 }}>🖥️</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Session Recording</div>
                <div style={{ fontSize: 13, color: '#9999A8' }}>{selected.url}</div>
                {showHeatmap && <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, background: 'rgba(123,92,255,0.12)', color: '#4F44E0', fontSize: 12 }}>Heatmap overlay: clicks cluster around navigation, pricing, and signup controls.</div>}
                {feedback && <div style={{ fontSize: 12, color: feedback === 'positive' ? '#27AE60' : '#EB5757' }}>Feedback saved: {feedback}</div>}
              </div>

              {/* Playback bar */}
              <div style={{ borderTop: '1px solid #E8E8EC', padding: '10px 16px' }}>
                {/* Timeline */}
                <div style={{ height: 20, background: '#F7F7F8', borderRadius: 4, marginBottom: 8, position: 'relative', overflow: 'hidden' }}>
                  {selected.events.map((ev, i) => (
                    <div key={i} style={{
                      position: 'absolute', top: 4, bottom: 4,
                      left: `${(i / (selected.events.length - 1 || 1)) * 95}%`,
                      width: 8, borderRadius: '50%',
                      background: i === 0 ? '#4CAF50' : i === selected.events.length - 1 ? '#E74C3C' : '#7B5CFF'
                    }} title={ev.name} />
                  ))}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => setPlaying(v => !v)} style={{
                    width: 30, height: 30, border: 'none', borderRadius: '50%',
                    background: '#7B5CFF', color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {playing ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button style={{ padding: '3px 8px', border: '1px solid #E8E8EC', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                    1x <ChevronDown size={10} />
                  </button>
                  <span style={{ fontSize: 12, color: '#6B6B80' }}>0:00 / {selected.visitDuration}</span>
                  <div style={{ flex: 1 }} />
                  <button style={{ padding: '3px 8px', border: '1px solid #E8E8EC', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 12 }}>⛶</button>
                  <button onClick={shareReplay} style={{ padding: '3px 8px', border: '1px solid #E8E8EC', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 12 }}>Share</button>
                </div>
                {shareNotice && <div style={{ marginTop: 6, fontSize: 12, color: '#27AE60' }}>{shareNotice}</div>}
              </div>
            </div>

            {/* Right panel */}
            <div style={{
              width: 280, borderLeft: '1px solid #E8E8EC', background: '#fff',
              display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0
            }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #E8E8EC', padding: '0 16px' }}>
                {['Details', 'Activity', 'Summary'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: '11px 8px', border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                    color: activeTab === tab ? '#7B5CFF' : '#6B6B80',
                    borderBottom: activeTab === tab ? '2px solid #7B5CFF' : '2px solid transparent',
                    marginBottom: -1
                  }}>{tab}</button>
                ))}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                {activeTab === 'Details' && (
                  <div>
                    {[
                      ['User', selected.distinctId.slice(0, 20) + '...'],
                      ['Duration', selected.visitDuration],
                      ['Timestamp', new Date(selected.timestamp).toLocaleString()],
                      ['Event Count', selected.eventCount],
                      ['Entry URL', selected.entryUrl],
                      ['Exit URL', selected.exitUrl],
                      ['Source SDK', selected.sourceSDK],
                      ['Operating System', selected.operatingSystem],
                      ['Browser', selected.browser],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #F0F0F4', fontSize: 12 }}>
                        <span style={{ color: '#6B6B80', minWidth: 100, flexShrink: 0 }}>{k}</span>
                        <span style={{ color: '#1A1A2E' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'Activity' && (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      {['Tracked Events', 'Stitched Events', 'User Sentiment', 'Console'].map(label => (
                        <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer' }}>
                          <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                          {label}
                        </label>
                      ))}
                    </div>
                    {selected.events.map((ev, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #F0F0F4' }}>
                        <span style={{ fontSize: 11, color: '#6B6B80', minWidth: 50 }}>{ev.time}</span>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, flex: 1 }} className="truncate">{ev.name}</span>
                        <span style={{ fontSize: 11, color: '#6B6B80' }}>{ev.count}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'Summary' && (
                  <div style={{ fontSize: 13, color: '#6B6B80' }}>
                    User visited {selected.events.length} pages and performed {selected.eventCount} events.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6B80' }}>
            Select a session to view
          </div>
        )}
      </div>
    </div>
  )
}

function buildReplaysFromEvents(state) {
  const usersByDistinctId = new Map((state?.userProfiles || []).map(user => [user.distinctId, user]))
  const grouped = new Map()
  for (const event of state?.events || []) {
    if (!grouped.has(event.distinctId)) grouped.set(event.distinctId, [])
    grouped.get(event.distinctId).push(event)
  }
  return Array.from(grouped.entries()).slice(0, 12).map(([distinctId, events], index) => {
    const sortedEvents = [...events].sort((a, b) => new Date(a.time) - new Date(b.time)).slice(0, 8)
    const user = usersByDistinctId.get(distinctId)
    const first = sortedEvents[0]
    const last = sortedEvents[sortedEvents.length - 1] || first
    const durationMinutes = Math.max(1, Math.round((new Date(last?.time || Date.now()) - new Date(first?.time || Date.now())) / 60000))
    return {
      id: `generated_replay_${index + 1}`,
      distinctId,
      avatar: user?.name?.[0] || null,
      visitDuration: `${durationMinutes}m ${String((index * 11) % 60).padStart(2, '0')}s`,
      eventCount: sortedEvents.length,
      timestamp: last?.time || new Date().toISOString(),
      url: first?.currentUrl || 'https://app.example.com/',
      entryUrl: first?.currentUrl || 'https://app.example.com/',
      exitUrl: last?.currentUrl || first?.currentUrl || 'https://app.example.com/',
      sourceSDK: 'xixpanel-browser',
      operatingSystem: first?.operatingSystem || user?.properties?.['Device Type'] || 'Desktop',
      browser: first?.browser || 'Chrome',
      events: sortedEvents.map((event, eventIndex) => ({
        time: `0:${String(eventIndex * 7).padStart(2, '0')}`,
        name: event.eventName,
        count: eventIndex + 1
      }))
    }
  })
}
