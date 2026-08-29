import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { FlaskConical } from 'lucide-react'
import '../styles/common.css'

const CATEGORIES = ['All', 'Lab', 'Imaging', 'Pathology']

export default function TestResults() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All')

  const results = (state.testResults || [])
    .filter(r => activeCategory === 'All' || r.category === activeCategory)
    .sort((a, b) => new Date(b.resultDate) - new Date(a.resultDate))

  const getStatusBadge = (status) => {
    if (status === 'Final') return 'badge--green'
    if (status === 'Pending') return 'badge--yellow'
    if (status === 'Preliminary') return 'badge--orange'
    return 'badge--gray'
  }

  const hasAbnormal = (r) => r.observations?.some(o => o.flag && o.flag !== null)

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <FlaskConical size={22} style={{ color: 'var(--color-primary)' }} />
        Test Results
      </h1>

      {/* Category filter tabs */}
      <div className="tab-nav">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`tab-btn ${activeCategory === cat ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="section-card">
        {results.length === 0 ? (
          <div className="section-card-body" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
            <FlaskConical size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>No test results found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Ordered Date</th>
                <th>Result Date</th>
                <th>Ordered By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr
                  key={r.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/test-results/${r.id}`)}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {!r.isReviewed && (
                        <span style={{
                          background: 'var(--color-primary)', color: '#fff',
                          fontSize: '10px', fontWeight: 700, padding: '2px 6px',
                          borderRadius: '3px', flexShrink: 0
                        }}>NEW</span>
                      )}
                      <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                        {r.testName}
                      </span>
                      {hasAbnormal(r) && (
                        <span style={{ color: 'var(--color-danger)', fontSize: 'var(--font-xs)', fontWeight: 700 }}>⚠</span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
                    {r.orderedDate}
                  </td>
                  <td style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
                    {r.resultDate?.split('T')[0]}
                  </td>
                  <td style={{ fontSize: 'var(--font-sm)' }}>{r.orderedBy}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
