import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'

export default function Reports() {
  const { state } = useApp()
  const { addToast } = useToast()

  const today = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today)
    d.setMonth(d.getMonth() - (5 - i))
    return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) }
  })

  const billsByMonth = months.map(({ year, month, label }) => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    const billed = state.bills.filter(b => b.issuedDate?.startsWith(monthStr)).reduce((s, b) => s + b.totalDue, 0)
    const collected = state.bills.filter(b => b.paidDate?.startsWith(monthStr)).reduce((s, b) => s + b.amountPaid, 0)
    return { label, billed, collected }
  })

  const maxBilled = Math.max(...billsByMonth.map(m => Math.max(m.billed, m.collected)), 1)

  const hoursByUser = state.users.map(u => {
    const hours = state.activities
      .filter(a => a.userId === u.id && a.type === 'TimeEntry' && a.billable)
      .reduce((s, a) => s + a.duration, 0)
    return { name: u.name, hours, color: u.avatarColor }
  }).filter(u => u.hours > 0).sort((a, b) => b.hours - a.hours)

  const maxHours = Math.max(...hoursByUser.map(u => u.hours), 1)

  const mattersByArea = state.firmSettings.practiceAreas.map(area => ({
    area, count: state.matters.filter(m => m.practiceArea === area).length
  })).filter(a => a.count > 0).sort((a, b) => b.count - a.count)

  const totalMatters = mattersByArea.reduce((s, a) => s + a.count, 0)
  const areaColors = ['#1A73E8', '#34A853', '#FBBC04', '#EA4335', '#9C27B0', '#FF5722', '#00BCD4']

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Billing Summary */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Billing Summary</h3>
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, background: '#1A73E8', borderRadius: 2 }} /><span style={{ fontSize: 12 }}>Billed</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, background: '#34A853', borderRadius: 2 }} /><span style={{ fontSize: 12 }}>Collected</span></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
            {billsByMonth.map(({ label, billed, collected }) => (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 110 }}>
                  <div style={{ flex: 1, background: '#1A73E8', borderRadius: '2px 2px 0 0', height: `${(billed / maxBilled) * 100}%`, minHeight: billed > 0 ? 4 : 0 }} title={`$${billed}`} />
                  <div style={{ flex: 1, background: '#34A853', borderRadius: '2px 2px 0 0', height: `${(collected / maxBilled) * 100}%`, minHeight: collected > 0 ? 4 : 0 }} title={`$${collected}`} />
                </div>
                <span style={{ fontSize: 10, color: '#9AA0A6' }}>{label}</span>
              </div>
            ))}
          </div>
          <button onClick={() => addToast('Full reports not available in this demo', 'info')} style={{ fontSize: 12, color: '#1A73E8', marginTop: 12, display: 'block', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>View Full Report →</button>
        </div>

        {/* Productivity */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Productivity — Billable Hours</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {hoursByUser.map(({ name, hours, color }) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span>{name}</span>
                  <span style={{ fontWeight: 600 }}>{hours.toFixed(1)} hrs</span>
                </div>
                <div style={{ background: '#E0E0E0', borderRadius: 4, height: 8 }}>
                  <div style={{ background: color, borderRadius: 4, height: 8, width: `${(hours / maxHours) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => addToast('Full reports not available in this demo', 'info')} style={{ fontSize: 12, color: '#1A73E8', marginTop: 12, display: 'block', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>View Full Report →</button>
        </div>

        {/* Matters by Practice Area */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Matters by Practice Area</h3>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {/* Donut */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                {(() => {
                  let offset = 0
                  const r = 45
                  const circ = 2 * Math.PI * r
                  return mattersByArea.map(({ area, count }, i) => {
                    const pct = count / totalMatters
                    const stroke = pct * circ
                    const el = (
                      <circle key={area} cx="60" cy="60" r={r}
                        fill="none" stroke={areaColors[i % areaColors.length]} strokeWidth="18"
                        strokeDasharray={`${stroke} ${circ - stroke}`}
                        strokeDashoffset={-offset * circ + circ * 0.25}
                        transform="rotate(-90 60 60)" />
                    )
                    offset += pct
                    return el
                  })
                })()}
                <text x="60" y="65" textAnchor="middle" style={{ fontSize: 18, fontWeight: 700, fill: '#1A1A2E' }}>{totalMatters}</text>
              </svg>
            </div>
            <div style={{ flex: 1, fontSize: 13 }}>
              {mattersByArea.map(({ area, count }, i) => (
                <div key={area} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: areaColors[i % areaColors.length], flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{area}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AR Aging */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Accounts Receivable Aging</h3>
          {(() => {
            const today = new Date()
            const buckets = [
              { label: '0-30 days', color: '#34A853', bills: [] },
              { label: '31-60 days', color: '#FBBC04', bills: [] },
              { label: '61-90 days', color: '#FF7043', bills: [] },
              { label: '90+ days', color: '#EA4335', bills: [] },
            ]
            state.bills.filter(b => b.status !== 'Paid' && b.status !== 'Void' && b.balance > 0).forEach(b => {
              if (!b.issuedDate) { buckets[0].bills.push(b); return }
              const days = Math.floor((today - new Date(b.issuedDate)) / 86400000)
              if (days <= 30) buckets[0].bills.push(b)
              else if (days <= 60) buckets[1].bills.push(b)
              else if (days <= 90) buckets[2].bills.push(b)
              else buckets[3].bills.push(b)
            })
            const maxVal = Math.max(...buckets.map(b => b.bills.reduce((s, bi) => s + bi.balance, 0)), 1)
            return buckets.map(({ label, color, bills }) => {
              const total = bills.reduce((s, b) => s + b.balance, 0)
              return (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{label}</span>
                    <span style={{ fontWeight: 600 }}>${total.toLocaleString()}</span>
                  </div>
                  <div style={{ background: '#E0E0E0', borderRadius: 4, height: 10 }}>
                    <div style={{ background: color, borderRadius: 4, height: 10, width: `${(total / maxVal) * 100}%` }} />
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )
}
