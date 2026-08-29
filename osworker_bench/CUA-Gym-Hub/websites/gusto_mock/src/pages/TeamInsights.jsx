import { useAppContext } from '../context/AppContext'

const TeamInsights = () => {
  const { state } = useAppContext()
  const employees = state?.employees || []

  const deptCounts = {}
  employees.forEach(e => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1
  })

  const locationCounts = {}
  employees.forEach(e => {
    locationCounts[e.location] = (locationCounts[e.location] || 0) + 1
  })

  const active = employees.filter(e => e.status === 'Active')
  const avgTenure = active.length > 0
    ? active.reduce((s, e) => {
        const start = new Date(e.startDate)
        const now = new Date('2025-04-10')
        return s + (now - start) / (365.25 * 86400000)
      }, 0) / active.length
    : 0

  const maxDept = Math.max(...Object.values(deptCounts))

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Team Insights</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total headcount', value: employees.length, color: 'var(--teal)' },
          { label: 'Active employees', value: employees.filter(e => e.status === 'Active').length, color: 'var(--success)' },
          { label: 'Onboarding', value: employees.filter(e => e.status === 'Onboarding').length, color: 'var(--warning)' },
          { label: 'Avg tenure (years)', value: avgTenure.toFixed(1), color: 'var(--blue)' }
        ].map(item => (
          <div key={item.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--medium-gray)', marginTop: '4px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>By Department</h3>
          {Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
            <div key={dept} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                <span>{dept}</span>
                <span style={{ fontWeight: '600' }}>{count}</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${(count / maxDept) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>By Location</h3>
          {Object.entries(locationCounts).sort((a, b) => b[1] - a[1]).map(([loc, count]) => (
            <div key={loc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
              <span>{loc.replace('HQ - ', '')}</span>
              <span style={{ background: 'var(--teal-light)', color: 'var(--teal)', borderRadius: '12px', padding: '2px 10px', fontWeight: '600', fontSize: '12px' }}>{count}</span>
            </div>
          ))}

          <div style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--medium-gray)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Upcoming Anniversaries
            </h4>
            {employees
              .map(e => {
                const start = new Date(e.startDate)
                const thisYear = new Date(`2025-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`)
                const now = new Date('2025-04-10')
                if (thisYear < now) thisYear.setFullYear(2026)
                const daysUntil = Math.ceil((thisYear - now) / 86400000)
                return { ...e, daysUntil, anniversaryDate: thisYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
              })
              .filter(e => e.daysUntil >= 0 && e.daysUntil <= 60)
              .sort((a, b) => a.daysUntil - b.daysUntil)
              .slice(0, 4)
              .map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0' }}>
                  <span>{e.firstName} {e.lastName}</span>
                  <span style={{ color: 'var(--medium-gray)' }}>{e.anniversaryDate} · {new Date().getFullYear() - new Date(e.startDate).getFullYear()}yr</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamInsights
