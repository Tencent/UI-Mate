import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronLeft, Printer, Share2 } from 'lucide-react'
import '../styles/common.css'

export default function TestResultDetail() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [shareOpen, setShareOpen] = useState(false)
  const [shareProvider, setShareProvider] = useState('')
  const [shareSuccess, setShareSuccess] = useState(false)

  const result = (state.testResults || []).find(r => r.id === id)
  const providers = state.providers || []

  // Use targeted action instead of full SET_STATE
  useEffect(() => {
    if (result && !result.isReviewed) {
      dispatch({ type: 'MARK_TEST_REVIEWED', payload: id })
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!result) {
    return (
      <div>
        <button className="back-btn" onClick={() => navigate('/test-results')}>
          <ChevronLeft size={16} /> Back to Test Results
        </button>
        <p style={{ marginTop: 20, color: 'var(--color-text-secondary)' }}>Test result not found.</p>
      </div>
    )
  }

  const getValueStyle = (status) => {
    if (status === 'Critical High' || status === 'Critical Low') {
      return { color: 'var(--color-danger)', fontWeight: 700, background: 'var(--color-danger-light)', padding: '2px 6px', borderRadius: '4px' }
    }
    if (status === 'High' || status === 'Low') return { color: 'var(--color-danger)', fontWeight: 700 }
    if (status === 'Normal') return { color: 'var(--color-success)' }
    return {}
  }

  const handleShare = () => {
    const provider = providers.find(p => p.id === shareProvider)
    if (!provider) return
    dispatch({
      type: 'SHARE_TEST_RESULT',
      payload: {
        testResultId: id,
        providerId: provider.id,
        providerName: provider.fullName
      }
    })
    setShareSuccess(true)
    setTimeout(() => {
      setShareOpen(false)
      setShareSuccess(false)
      setShareProvider('')
    }, 2000)
  }

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/test-results')}>
        <ChevronLeft size={16} /> Back to Test Results
      </button>

      <div style={{ marginTop: 16, marginBottom: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">{result.testName}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={`badge ${result.status === 'Final' ? 'badge--green' : result.status === 'Pending' ? 'badge--yellow' : 'badge--orange'}`}>
              {result.status}
            </span>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
              Ordered: {result.orderedDate} | Resulted: {result.resultDate?.split('T')[0]}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn--gray btn--sm" onClick={() => window.print()}>
            <Printer size={14} /> Print Results
          </button>
          <button className="btn btn--outline btn--sm" onClick={() => setShareOpen(true)}>
            <Share2 size={14} /> Share with Provider
          </button>
        </div>
      </div>

      {/* Provider comment */}
      {result.providerComment && (
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Provider Comment</h2>
          </div>
          <div className="section-card-body">
            <p style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', lineHeight: 1.6, padding: '8px 12px', background: 'var(--color-section-bg)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-primary)' }}>
              &ldquo;{result.providerComment}&rdquo;
            </p>
            <p style={{ marginTop: 8, fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
              — {result.orderedBy}
            </p>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Results</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Your Value</th>
                <th>Units</th>
                <th>Reference Range</th>
                <th>Flag</th>
              </tr>
            </thead>
            <tbody>
              {(result.observations || []).map((obs, i) => (
                <tr key={obs.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>{obs.name}</td>
                  <td>
                    <span style={getValueStyle(obs.status)}>
                      {obs.value}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{obs.unit}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{obs.referenceRange}</td>
                  <td>
                    {obs.flag ? (
                      <span className={`badge ${obs.flag === 'H' || obs.flag === 'HH' ? 'badge--red' : 'badge--blue'}`}>
                        {obs.flag}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-xs)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared with providers list */}
      {result.sharedWith && result.sharedWith.length > 0 && (
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Shared With</h2>
          </div>
          <div className="section-card-body">
            {result.sharedWith.map((s, i) => (
              <div key={i} style={{ fontSize: 'var(--font-sm)', padding: '6px 0', borderBottom: i < result.sharedWith.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <strong>{s.providerName}</strong>
                <span style={{ color: 'var(--color-text-secondary)', marginLeft: 8, fontSize: 'var(--font-xs)' }}>
                  {new Date(s.sharedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: 8, padding: '8px 0' }}>
        Ordered by: {result.orderedBy} | Collected: {result.collectedDate?.split('T')[0]} | Category: {result.category}
      </div>

      {/* Share with Provider Modal */}
      {shareOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 500, padding: 20
          }}
          onClick={() => { setShareOpen(false); setShareSuccess(false) }}
        >
          <div
            style={{
              background: '#fff', borderRadius: 8, padding: 24,
              maxWidth: 420, width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {shareSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                <p style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: 'var(--font-md)' }}>
                  Shared successfully!
                </p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 12 }}>Share with Provider</h3>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                  Select a provider to share <strong>{result.testName}</strong> results with.
                </p>
                <div className="form-group">
                  <label className="form-label">Provider</label>
                  <select
                    className="form-select"
                    value={shareProvider}
                    onChange={e => setShareProvider(e.target.value)}
                  >
                    <option value="">Select a provider...</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} — {p.specialty}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button
                    className="btn btn--primary"
                    onClick={handleShare}
                    disabled={!shareProvider}
                  >
                    Share Results
                  </button>
                  <button className="btn btn--gray" onClick={() => setShareOpen(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
