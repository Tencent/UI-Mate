import React from 'react'
import { Monitor, CheckCircle, AlertCircle, AlertTriangle, Clock } from 'lucide-react'
import { formatRelativeTime } from '../utils/helpers.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

const STATUS_CONFIG = {
  ok: { icon: CheckCircle, color: '#2BA185', bg: '#E8F8F5', label: 'OK' },
  error: { icon: AlertCircle, color: '#E03E2F', bg: '#FFE8E6', label: 'ERROR' },
  missed: { icon: AlertTriangle, color: '#F5B000', bg: '#FFF8E8', label: 'MISSED' },
  timeout: { icon: Clock, color: '#80708F', bg: '#F4F2F7', label: 'TIMEOUT' }
}

const MONITORS = [
  {
    id: 'mon-1', name: 'process-pending-orders', status: 'ok',
    schedule: '*/5 * * * *', lastCheckIn: '2025-04-09T14:20:00Z',
    nextExpected: '2025-04-09T14:25:00Z', project: 'flask-api',
    history: ['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'missed', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok']
  },
  {
    id: 'mon-2', name: 'sync-inventory', status: 'error',
    schedule: '0 */1 * * *', lastCheckIn: '2025-04-09T13:00:00Z',
    nextExpected: '2025-04-09T14:00:00Z', project: 'spring-boot-5',
    history: ['ok', 'ok', 'ok', 'error', 'error', 'error', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'error', 'error', 'ok', 'ok', 'ok', 'ok']
  },
  {
    id: 'mon-3', name: 'cleanup-expired-sessions', status: 'ok',
    schedule: '0 3 * * *', lastCheckIn: '2025-04-09T03:00:00Z',
    nextExpected: '2025-04-10T03:00:00Z', project: 'flask-api',
    history: ['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok']
  },
  {
    id: 'mon-4', name: 'send-daily-digest', status: 'missed',
    schedule: '0 9 * * *', lastCheckIn: '2025-04-08T09:00:00Z',
    nextExpected: '2025-04-09T09:00:00Z', project: 'flask-api',
    history: ['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'missed', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'missed', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'missed']
  },
  {
    id: 'mon-5', name: 'generate-reports', status: 'ok',
    schedule: '30 2 * * 1', lastCheckIn: '2025-04-07T02:30:00Z',
    nextExpected: '2025-04-14T02:30:00Z', project: 'spring-boot-5',
    history: ['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok']
  }
]

export default function MonitorsPage() {
  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>Monitors</h1>

      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 100px 140px 140px 140px 240px',
          padding: '10px 16px', backgroundColor: '#FAF9FB', borderBottom: `1px solid ${BORDER}`,
          fontSize: 11, fontWeight: 600, color: TEXT_SEC, textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          <div>Monitor</div>
          <div>Status</div>
          <div>Schedule</div>
          <div>Last Check-in</div>
          <div>Next Expected</div>
          <div style={{ textAlign: 'center' }}>History (24h)</div>
        </div>

        {MONITORS.map((mon, idx) => {
          const statusCfg = STATUS_CONFIG[mon.status]
          const StatusIcon = statusCfg.icon

          return (
            <div key={mon.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 100px 140px 140px 140px 240px',
              padding: '12px 16px', borderBottom: idx < MONITORS.length - 1 ? `1px solid ${BORDER}` : 'none',
              alignItems: 'center', fontSize: 13
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF9FB'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Monitor size={14} color={ACCENT} />
                  <span style={{ fontWeight: 500, color: TEXT_PRI, fontFamily: '"Source Code Pro", monospace' }}>{mon.name}</span>
                </div>
                <div style={{ fontSize: 11, color: TEXT_SEC, marginTop: 2, marginLeft: 20 }}>{mon.project}</div>
              </div>
              <div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 10, padding: '2px 8px', borderRadius: 3, fontWeight: 700,
                  backgroundColor: statusCfg.bg, color: statusCfg.color
                }}>
                  <StatusIcon size={10} />
                  {statusCfg.label}
                </span>
              </div>
              <div style={{ fontFamily: '"Source Code Pro", monospace', fontSize: 11, color: TEXT_SEC }}>{mon.schedule}</div>
              <div style={{ fontSize: 12, color: TEXT_SEC }}>{formatRelativeTime(mon.lastCheckIn)}</div>
              <div style={{ fontSize: 12, color: TEXT_SEC }}>{formatRelativeTime(mon.nextExpected)}</div>
              <div style={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                {mon.history.map((h, i) => (
                  <div key={i} style={{
                    width: 8, height: 20, borderRadius: 1,
                    backgroundColor: STATUS_CONFIG[h]?.color || '#E2DBE8',
                    opacity: 0.7
                  }} title={`${h} - ${24 - i}h ago`} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
