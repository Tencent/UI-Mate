import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

function formatTime(date) {
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  const s = date.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function AttendancePage() {
  const { state, dispatch } = useApp()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const records = state.attendanceRecords || { checkIn: null, checkOut: null, history: {} }
  const todayRec = records.history?.[today] || {}

  const hasCheckedIn = !!todayRec.checkIn
  const hasCheckedOut = !!todayRec.checkOut

  const getStatusText = (time) => {
    if (!time) return { text: '--:-- 未打卡', color: 'var(--text-secondary)' }
    const d = new Date(time)
    const h = d.getHours()
    const m = d.getMinutes()
    const timeStr = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`
    if (!hasCheckedIn && h > 9) return { text: `${timeStr} 迟到`, color: '#FA8C16' }
    return { text: `${timeStr} 正常`, color: '#52C41A' }
  }

  const checkInStatus = getStatusText(todayRec.checkIn)
  const checkOutStatus = todayRec.checkOut
    ? { text: `${new Date(todayRec.checkOut).getHours().toString().padStart(2,'0')}:${new Date(todayRec.checkOut).getMinutes().toString().padStart(2,'0')} 正常`, color: '#52C41A' }
    : { text: '--:-- 未打卡', color: 'var(--text-secondary)' }

  // Generate month calendar
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getCellStatus = (day) => {
    const dateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`
    const rec = records.history?.[dateStr]
    if (!rec) {
      const d = new Date(year, month, day)
      const dow = d.getDay()
      if (dow === 0 || dow === 6) return 'weekend'
      if (d > now) return 'future'
      return 'absent'
    }
    if (rec.checkIn && rec.checkOut) return 'normal'
    if (rec.checkIn) return 'checkin-only'
    return 'absent'
  }

  const statusDots = { normal: '#52C41A', 'checkin-only': '#FA8C16', absent: '#FF4D4F', weekend: '#E8E8E8', future: 'transparent' }

  return (
    <div style={{ padding: 20, maxWidth: 560 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>考勤打卡</h2>
      <div style={{ background: 'white', borderRadius: 12, padding: '32px 20px', textAlign: 'center', border: '1px solid var(--border)', marginBottom: 20 }}>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 2, color: 'var(--text-primary)', marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(currentTime)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
          {currentTime.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <button
          onClick={() => dispatch({ type: 'CLOCK_IN' })}
          style={{
            width: 120, height: 120, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: hasCheckedOut ? '#C4C9D4' : hasCheckedIn ? '#52C41A' : 'var(--primary)',
            color: 'white', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-family)',
            boxShadow: '0 4px 20px rgba(42,131,240,0.3)',
            transition: 'all 0.2s'
          }}
        >
          {hasCheckedOut ? '已打卡' : hasCheckedIn ? '下班打卡' : '上班打卡'}
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--border)', padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>今日打卡记录</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>上班打卡</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: checkInStatus.color, marginTop: 4 }}>{checkInStatus.text}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>下班打卡</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: checkOutStatus.color, marginTop: 4 }}>{checkOutStatus.text}</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 8, border: '1px solid var(--border)', padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          {year}年{month+1}月 考勤日历
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
          {['日','一','二','三','四','五','六'].map(d => (
            <div key={d} style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '4px 0' }}>{d}</div>
          ))}
          {Array(firstDay === 0 ? 6 : firstDay - 1).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1
            const st = getCellStatus(day)
            const isToday = day === now.getDate()
            return (
              <div key={day} style={{ padding: '6px 2px', position: 'relative' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto', fontSize: 12,
                  background: isToday ? 'var(--primary)' : 'transparent',
                  color: isToday ? 'white' : 'var(--text-primary)',
                  fontWeight: isToday ? 700 : 400
                }}>{day}</div>
                {st !== 'future' && st !== 'weekend' && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusDots[st], margin: '2px auto 0' }} />
                )}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
          {[['normal', '正常'], ['checkin-only', '未下班'], ['absent', '缺勤']].map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusDots[k] }} />{l}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
