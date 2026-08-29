import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Filter, Settings } from 'lucide-react'

const ALL_REPLAYS = [
  { time: '2024-12-16 14:23:01', userId: 'alice@example.com', length: '3m 42s', country: 'United States', lengthSec: 222, daysAgo: 0 },
  { time: '2024-12-16 11:05:33', userId: 'bob@techstart.io', length: '1m 28s', country: 'United Kingdom', lengthSec: 88, daysAgo: 0 },
  { time: '2024-12-15 22:47:18', userId: 'carol@globalco.com', length: '5m 12s', country: 'Canada', lengthSec: 312, daysAgo: 1 },
  { time: '2024-12-15 16:32:44', userId: 'david@bauhaus.de', length: '2m 05s', country: 'Germany', lengthSec: 125, daysAgo: 1 },
  { time: '2024-12-15 09:14:29', userId: 'emma@startup.id', length: '4m 33s', country: 'Indonesia', lengthSec: 273, daysAgo: 1 },
  { time: '2024-12-14 18:22:10', userId: 'frank@example.com', length: '6m 18s', country: 'United States', lengthSec: 378, daysAgo: 2 },
  { time: '2024-12-13 10:11:45', userId: 'grace@techstart.io', length: '1m 55s', country: 'Canada', lengthSec: 115, daysAgo: 3 },
  { time: '2024-12-12 15:44:22', userId: 'henry@globalco.com', length: '3m 08s', country: 'Australia', lengthSec: 188, daysAgo: 4 },
  { time: '2024-12-10 09:30:17', userId: 'iris@bauhaus.de', length: '7m 22s', country: 'Germany', lengthSec: 442, daysAgo: 6 },
  { time: '2024-12-08 14:55:33', userId: 'jack@startup.id', length: '2m 41s', country: 'Japan', lengthSec: 161, daysAgo: 8 },
]

const COUNTRY_FLAGS = {
  'United States': '\uD83C\uDDFA\uD83C\uDDF8', 'United Kingdom': '\uD83C\uDDEC\uD83C\uDDE7', 'Canada': '\uD83C\uDDE8\uD83C\uDDE6',
  'Germany': '\uD83C\uDDE9\uD83C\uDDEA', 'Indonesia': '\uD83C\uDDEE\uD83C\uDDE9', 'Australia': '\uD83C\uDDE6\uD83C\uDDFA', 'Japan': '\uD83C\uDDEF\uD83C\uDDF5'
}

export default function SessionReplay() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('7d')
  const [playingId, setPlayingId] = useState(null)
  const [filterCountry, setFilterCountry] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [minLength, setMinLength] = useState(0)

  const maxDays = timeRange === '1d' ? 1 : timeRange === '7d' ? 7 : 30

  const filteredReplays = ALL_REPLAYS.filter(r => {
    if (r.daysAgo >= maxDays) return false
    if (filterCountry && r.country !== filterCountry) return false
    if (minLength > 0 && r.lengthSec < minLength) return false
    return true
  })

  return (
    <div style={{ padding: 24, background: 'white', minHeight: '100%' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Session Replays</h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
        Unlock qualitative insights by finding the most relevant session replays to watch
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {['1d', '7d', '30d'].map(t => (
          <button
            key={t}
            className={timeRange === t ? 'chart-timerange-pill chart-timerange-active' : 'chart-timerange-pill'}
            onClick={() => setTimeRange(t)}
          >{t}</button>
        ))}
        <button className="btn-outline" style={{ marginLeft: 8, fontSize: 13 }} onClick={() => setShowFilterPanel(!showFilterPanel)}>
          <Filter size={13} /> {filterCountry || minLength > 0 ? 'Filtered' : 'Add Filter'}
        </button>
        {(filterCountry || minLength > 0) && (
          <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => { setFilterCountry(''); setMinLength(0) }}>
            <X size={14} />
          </button>
        )}
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-secondary)' }}>
          {filteredReplays.length} sessions
        </div>
      </div>

      {showFilterPanel && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Country</label>
            <select className="input" style={{ width: 180 }} value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
              <option value="">All Countries</option>
              {[...new Set(ALL_REPLAYS.map(r => r.country))].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Min Session Length (sec)</label>
            <input type="number" className="input" style={{ width: 120 }} min={0} value={minLength} onChange={e => setMinLength(Number(e.target.value))} />
          </div>
          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowFilterPanel(false)}>Close</button>
        </div>
      )}

      <table className="users-table" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>User ID</th>
            <th>Session Length</th>
            <th>Country</th>
          </tr>
        </thead>
        <tbody>
          {filteredReplays.length === 0 && (
            <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No replays found for this time range and filters.</td></tr>
          )}
          {filteredReplays.map((r, i) => (
            <tr key={i} className="users-row">
              <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  style={{
                    fontSize: 12, width: 28, height: 28, borderRadius: '50%',
                    border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: playingId === i ? 'var(--primary)' : 'white',
                    color: playingId === i ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPlayingId(playingId === i ? null : i)}
                >
                  {playingId === i ? '\u23F8' : '\u25B6'}
                </button>
                <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{r.time}</span>
              </td>
              <td style={{ color: 'var(--primary)', fontSize: 13, cursor: 'pointer' }} onClick={() => {
                const user = r.userId.split('@')[0]
                navigate(`/users`)
              }}>{r.userId}</td>
              <td style={{ fontSize: 13 }}>{r.length}</td>
              <td style={{ fontSize: 13 }}>{COUNTRY_FLAGS[r.country] || ''} {r.country}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {playingId !== null && (
        <div style={{ marginTop: 20, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ background: 'var(--page-bg)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Session Replay</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>{filteredReplays[playingId]?.userId}</span>
            </div>
            <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setPlayingId(null)}><X size={14} /></button>
          </div>
          <div style={{ height: 300, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>{'\uD83C\uDFAC'}</div>
              <div style={{ color: '#999' }}>Session replay for {filteredReplays[playingId]?.userId}</div>
              <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Duration: {filteredReplays[playingId]?.length}</div>
            </div>
          </div>
        </div>
      )}

      <style>{`.chart-timerange-pill { padding: 4px 10px; border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text-secondary); cursor: pointer; background: white; } .chart-timerange-active { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }`}</style>
    </div>
  )
}
