import { useApp } from '../context/AppContext.jsx'

export default function Compensation() {
  const { state } = useApp()
  if (!state) return null

  const comp = state.compensation || {}
  const baseSalary = comp.baseSalary ?? 125000
  const bonusTarget = comp.bonusTarget ?? 15
  const equityShares = comp.equityShares ?? 5000
  const totalComp = Math.round(baseSalary * (1 + bonusTarget / 100))
  const history = comp.history || []

  const compData = { baseSalary, bonusTarget, equityGrants: equityShares, totalComp, history }

  return (
    <div style={{ padding: 32 }}>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Compensation</h1>

      <div style={{ background: '#FEF9C3', border: '1px solid #FDE047', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#854D0E' }}>
        ⚠️ Compensation data shown is for demonstration purposes only.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Base Salary', value: `$${compData.baseSalary.toLocaleString()}`, sub: 'Annual', color: '#6B4FBB' },
          { label: 'Bonus Target', value: `${compData.bonusTarget}%`, sub: 'of base salary', color: '#7C3AED' },
          { label: 'Equity Grants', value: compData.equityGrants.toLocaleString(), sub: 'stock options', color: '#059669' },
          { label: 'Total Comp', value: `$${compData.totalComp.toLocaleString()}`, sub: 'Estimated total', color: '#D97706' },
        ].map(item => (
          <div key={item.label} className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E', marginTop: 4 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Compensation History</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {['Date', 'Type', 'Previous', 'New'].map(col => (
                <th key={col} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: '#6B7280', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compData.history.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{row.date}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>
                  <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {row.type}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 14, color: '#6B7280' }}>{row.oldValue}</td>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#166534' }}>{row.newValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
