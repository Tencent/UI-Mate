import { useState, useEffect, useRef } from 'react'

const EVENT_NAMES = ['Page Viewed', 'Start Session', 'Element Clicked', 'End Session', 'New User']
const PLATFORMS = ['Web', 'iOS', 'Android']
const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Indonesia']
const USER_IDS = ['alice@example.com', 'bob@techstart.io', 'carol@globalco.com', 'david@bauhaus.de', 'emma@startup.id']

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)] }

export default function LiveEvents() {
  const [events, setEvents] = useState([])
  const [paused, setPaused] = useState(false)
  const tableRef = useRef(null)

  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      const newEvt = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        eventName: randomItem(EVENT_NAMES),
        userId: randomItem(USER_IDS),
        platform: randomItem(PLATFORMS),
        country: randomItem(COUNTRIES)
      }
      setEvents(prev => {
        const updated = [newEvt, ...prev]
        return updated.slice(0, 100)
      })
    }, 2000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [paused])

  return (
    <div style={{ padding: 24, background: 'white', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Live Events</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: paused ? '#6B6F76' : '#00875A', display: 'inline-block', animation: paused ? 'none' : 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{paused ? 'Paused' : 'Live'}</span>
          </div>
        </div>
        <button className="btn-outline" onClick={() => setPaused(p => !p)}>
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, borderBottom: '1px solid var(--border)', background: 'var(--page-bg)' }}>Timestamp</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, borderBottom: '1px solid var(--border)', background: 'var(--page-bg)' }}>Event Name</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, borderBottom: '1px solid var(--border)', background: 'var(--page-bg)' }}>User ID</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, borderBottom: '1px solid var(--border)', background: 'var(--page-bg)' }}>Platform</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Waiting for events...</td></tr>
            )}
            {events.map(evt => (
              <tr key={evt.id} style={{ animation: 'fadeIn 0.3s ease' }}>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-sep)', fontFamily: 'monospace', fontSize: 12 }}>{evt.timestamp}</td>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-sep)', fontWeight: 500, color: 'var(--primary)' }}>{evt.eventName}</td>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-sep)', color: 'var(--text-secondary)' }}>{evt.userId}</td>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-sep)' }}>{evt.platform}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  )
}
