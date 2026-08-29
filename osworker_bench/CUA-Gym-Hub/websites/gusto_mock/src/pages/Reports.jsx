import { useState } from 'react'
import { useAppContext } from '../context/AppContext'

const REPORTS = [
  { id: 'payroll-journal', title: 'Payroll Journal', description: 'Detailed payroll records by pay period', icon: '💰' },
  { id: 'tax-payments', title: 'Tax Payments', description: 'Taxes paid by quarter', icon: '🏛️' },
  { id: 'pto-balances', title: 'PTO Balances', description: 'Current vacation and sick balances', icon: '🏖️' },
  { id: 'headcount', title: 'Headcount Report', description: 'Employee count over time', icon: '👥' },
  { id: 'contractor-payments', title: 'Contractor Payments', description: '1099 payments by contractor', icon: '📋' },
]

const Reports = () => {
  const { addReportHistory } = useAppContext()
  const [showToast, setShowToast] = useState(false)

  const toast = (msg) => {
    setShowToast(msg)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleDownload = (r) => {
    addReportHistory(r.id, 'download')
    toast(`${r.title} report downloaded`)
  }

  const handleView = (r) => {
    addReportHistory(r.id, 'view')
    toast(`${r.title} report generated`)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {REPORTS.map(r => (
          <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px' }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>{r.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--medium-gray)', marginTop: '3px' }}>{r.description}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary btn-sm" onClick={() => handleDownload(r)}>
                Download
              </button>
              <button className="btn-outline btn-sm" onClick={() => handleView(r)}>
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {showToast && (
        <div className="toast">{showToast}</div>
      )}
    </div>
  )
}

export default Reports
