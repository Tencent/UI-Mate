import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function formatCurrency(n) {
  return n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'
}

function QuickActionCard({ icon, title, subtitle, to, subtitleColor }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(to)}
      style={{
        background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
        padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
        transition: 'box-shadow 0.15s, transform 0.15s', minHeight: 80,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'none' }}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 13, color: subtitleColor || 'var(--color-gray-medium)', marginTop: 2 }}>{subtitle}</div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, to }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => to && navigate(to)}
      style={{
        background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
        padding: '16px 20px', textAlign: 'center',
        cursor: to ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => { if (to) e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)' }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, color: color || 'var(--color-navy)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const { state, toggleTodoItem, markAnnouncementRead } = useApp()
  const navigate = useNavigate()
  const [expandedAnn, setExpandedAnn] = useState(null)

  const emp = state.employee || {}
  const payStatements = state.payStatements || []
  const latestPay = payStatements[0] || null
  const timeOffBalances = state.timeOffBalances || []
  const todoItems = state.todoItems || []
  const announcements = state.announcements || []
  const clockStatus = state.clockStatus || {}
  const employees = state.employees || []
  const pendingApprovals = (state.pendingApprovals || []).filter(a => a.status === 'Pending')
  const directReports = state.directReports || []

  const pendingTodos = todoItems.filter(t => !t.isCompleted)
  const pendingCount = pendingTodos.length

  function formatClockSubtitle() {
    if (clockStatus.isClockedIn && clockStatus.lastClockIn) {
      const t = new Date(clockStatus.lastClockIn)
      return `Clocked in since ${t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    }
    return 'Not clocked in'
  }

  function formatBalanceBar(balance) {
    const pct = balance.totalDays > 0 ? (balance.availableDays / balance.totalDays) * 100 : 0
    const color = balance.type === 'Vacation' ? 'var(--color-info)' : balance.type === 'Sick' ? 'var(--color-success)' : 'var(--color-warning)'
    return { pct, color }
  }

  const categoryBadgeStyle = (cat) => {
    const map = {
      Benefits: { background: '#FEE2E2', color: '#991B1B' },
      Company: { background: '#DBEAFE', color: '#1E40AF' },
      Policy: { background: '#F3F4F6', color: '#374151' },
      Events: { background: '#D1FAE5', color: '#065F46' },
    }
    return map[cat] || map.Company
  }

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div style={{
        background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
        padding: '20px 24px', marginBottom: 20,
        borderLeft: '4px solid #D0021B',
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>{getGreeting()}, {emp.firstName}!</h1>
        <div style={{ color: 'var(--color-gray-medium)', fontSize: 14, marginTop: 2 }}>{formatDate(new Date())}</div>
        <div style={{ color: '#374151', fontSize: 14, marginTop: 4 }}>
          {emp.jobTitle} -- {emp.department} | {state.companyInfo?.name || 'Acme Corporation'}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <StatCard label="Total Employees" value={employees.length} color="var(--color-info)" to="/people" />
        <StatCard label="Direct Reports" value={directReports.length} color="var(--color-navy)" to="/my-team" />
        <StatCard label="Pending Approvals" value={pendingApprovals.length} color="var(--color-warning)" to="/my-team/approvals" />
        <StatCard label="Open To-Dos" value={pendingCount} color="var(--color-primary)" />
      </div>

      {/* Quick Actions */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <QuickActionCard
          icon={'\u23F0'}
          title="Clock In/Out"
          subtitle={formatClockSubtitle()}
          subtitleColor={clockStatus.isClockedIn ? 'var(--color-success)' : 'var(--color-gray-medium)'}
          to="/myself/time"
        />
        <QuickActionCard
          icon={'\uD83D\uDCC5'}
          title="Request Time Off"
          subtitle="Submit a time-off request"
          to="/myself/timeoff/request"
        />
        <QuickActionCard
          icon={'\uD83D\uDCB5'}
          title="View Pay Statement"
          subtitle={latestPay ? `Last pay: ${latestPay.payDate}` : 'No statements'}
          to="/myself/pay"
        />
      </div>

      {/* Main 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Pay Summary */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3>Last Pay</h3>
              <span style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>{latestPay?.payDate || '-'}</span>
            </div>
            {latestPay ? (
              <>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-navy)' }}>
                  {formatCurrency(latestPay.netPay)}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-medium)', marginTop: 2 }}>
                  Gross: {formatCurrency(latestPay.grossPay)}
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)', fontSize: 13, color: 'var(--color-gray-medium)' }}>
                  Next pay date: <strong style={{ color: 'var(--color-navy)' }}>{(() => { const d = new Date(new Date(latestPay.payDate).getTime() + 14*24*60*60*1000); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) })()}</strong>
                </div>
                <button
                  onClick={() => navigate('/myself/pay/pay-001')}
                  style={{ marginTop: 12, background: 'none', color: 'var(--color-info)', fontSize: 13, cursor: 'pointer', padding: 0, border: 'none' }}
                >
                  View Details {'\u2192'}
                </button>
              </>
            ) : (
              <div style={{ color: 'var(--color-gray-medium)' }}>No pay statements found</div>
            )}
          </div>

          {/* Time Off Balances */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Time Off Balances</h3>
              <button onClick={() => navigate('/myself/timeoff')} style={{ background: 'none', color: 'var(--color-info)', fontSize: 13, cursor: 'pointer', padding: 0, border: 'none' }}>
                View All {'\u2192'}
              </button>
            </div>
            {timeOffBalances.map(b => {
              const { pct, color } = formatBalanceBar(b)
              return (
                <div key={b.type} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{b.type}</span>
                    <span style={{ fontSize: 13, color: 'var(--color-gray-medium)' }}>{b.availableDays} of {b.totalDays} days</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginTop: 2 }}>
                    {b.availableDays} days available
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pending Approvals (Manager view) */}
          {pendingApprovals.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3>Pending Approvals</h3>
                <span className="badge badge-amber">{pendingApprovals.length}</span>
              </div>
              {pendingApprovals.slice(0, 3).map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div className="avatar avatar-sm" style={{ background: '#4B5563' }}>{a.employeeAvatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{a.employeeName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>{a.request}</div>
                  </div>
                  <span className="badge badge-amber" style={{ fontSize: 10 }}>{a.type}</span>
                </div>
              ))}
              <button onClick={() => navigate('/my-team/approvals')} style={{ marginTop: 12, background: 'none', color: 'var(--color-info)', fontSize: 13, cursor: 'pointer', padding: 0, border: 'none' }}>
                Review All {'\u2192'}
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* To-Do Items */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <h3>To-Do</h3>
              {pendingCount > 0 && (
                <span style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pendingCount}
                </span>
              )}
            </div>
            {todoItems.length === 0 ? (
              <div style={{ color: 'var(--color-gray-medium)', fontSize: 14 }}>All caught up!</div>
            ) : (
              todoItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                  borderBottom: '1px solid var(--color-border)',
                  opacity: item.isCompleted ? 0.6 : 1,
                }}>
                  <button
                    onClick={() => toggleTodoItem(item.id)}
                    style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${item.isCompleted ? 'var(--color-success)' : 'var(--color-border)'}`,
                      background: item.isCompleted ? 'var(--color-success)' : 'white',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: 'white',
                    }}
                  >
                    {item.isCompleted ? '\u2713' : ''}
                  </button>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(item.link)}>
                    <div style={{ fontWeight: 500, fontSize: 14, textDecoration: item.isCompleted ? 'line-through' : 'none' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-gray-medium)', marginTop: 2 }}>
                      Due: {item.dueDate}
                    </div>
                  </div>
                  <span style={{ color: 'var(--color-info)', fontSize: 16, cursor: 'pointer' }} onClick={() => navigate(item.link)}>{'\u203A'}</span>
                </div>
              ))
            )}
          </div>

          {/* Announcements */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Company News</h3>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {announcements.map(ann => {
                const badgeStyle = categoryBadgeStyle(ann.category)
                const isExpanded = expandedAnn === ann.id
                return (
                  <div key={ann.id} style={{
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}
                      onClick={() => {
                        setExpandedAnn(isExpanded ? null : ann.id)
                        if (!ann.isRead) markAnnouncementRead(ann.id)
                      }}
                    >
                      {!ann.isRead && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-info)', flexShrink: 0, marginTop: 4 }} />
                      )}
                      {ann.isRead && <span style={{ width: 8, flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ ...badgeStyle, fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 10, display: 'inline-block' }}>
                            {ann.category}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--color-gray-medium)' }}>{ann.date}</span>
                        </div>
                        <div style={{ fontWeight: ann.isRead ? 400 : 600, fontSize: 14 }}>{ann.title}</div>
                        {!isExpanded && (
                          <div style={{ fontSize: 13, color: 'var(--color-gray-medium)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ann.content}
                          </div>
                        )}
                        {isExpanded && (
                          <div style={{ fontSize: 13, color: '#374151', marginTop: 6 }}>{ann.content}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
