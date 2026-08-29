import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { getInitials, getAvatarColor, formatDate } from '../utils/helpers'

const RATING_LABELS = ['', 'Needs Improvement', 'Below Expectations', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding']
const RATING_COLORS = ['', 'var(--error)', 'var(--warning)', 'var(--blue)', 'var(--success)', 'var(--xusto-green, var(--teal))']

const StarRating = ({ value, onChange, readonly }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map(star => (
      <span
        key={star}
        onClick={() => !readonly && onChange?.(star)}
        style={{
          fontSize: '20px',
          cursor: readonly ? 'default' : 'pointer',
          color: star <= (value || 0) ? '#f5a623' : '#ddd',
          transition: 'color 0.15s'
        }}
      >
        {star <= (value || 0) ? '\u2605' : '\u2606'}
      </span>
    ))}
  </div>
)

const Performance = () => {
  const { state, updateState } = useAppContext()
  const [tab, setTab] = useState('reviews')
  const [selectedReviewId, setSelectedReviewId] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const toast = (msg) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const reviews = state?.performanceReviews || []
  const employees = state?.employees || []
  const pending = reviews.filter(r => r.status === 'Pending')
  const completed = reviews.filter(r => r.status === 'Completed')

  const selectedReview = reviews.find(r => r.id === selectedReviewId)

  const startReview = (review) => {
    setSelectedReviewId(review.id)
    setEditMode(true)
    setEditData({
      overallRating: review.overallRating || 0,
      summary: review.summary || '',
      categories: review.categories.length > 0
        ? review.categories.map(c => ({ ...c }))
        : [
            { name: 'Technical Skills', rating: 0, comment: '' },
            { name: 'Communication', rating: 0, comment: '' },
            { name: 'Teamwork', rating: 0, comment: '' },
            { name: 'Initiative', rating: 0, comment: '' }
          ]
    })
  }

  const saveReview = () => {
    if (!editData || !selectedReviewId) return
    const avgRating = editData.categories.length > 0
      ? Math.round(editData.categories.reduce((s, c) => s + c.rating, 0) / editData.categories.length)
      : editData.overallRating

    updateState(prev => ({
      ...prev,
      performanceReviews: prev.performanceReviews.map(r =>
        r.id === selectedReviewId
          ? {
              ...r,
              status: 'Completed',
              overallRating: avgRating,
              submittedDate: new Date().toISOString().split('T')[0],
              categories: editData.categories,
              summary: editData.summary
            }
          : r
      )
    }))
    setEditMode(false)
    setEditData(null)
    toast('Review submitted successfully')
  }

  const viewReview = (review) => {
    setSelectedReviewId(review.id)
    setEditMode(false)
    setEditData(null)
  }

  return (
    <div className="page-container" style={{ maxWidth: '1100px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Performance</h1>
          <p className="page-subtitle">Q1 2025 Review Cycle</p>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total reviews', value: reviews.length, color: 'var(--teal)' },
          { label: 'Completed', value: completed.length, color: 'var(--success)' },
          { label: 'Pending', value: pending.length, color: 'var(--warning)' },
          { label: 'Avg rating', value: completed.length > 0 ? (completed.reduce((s, r) => s + (r.overallRating || 0), 0) / completed.length).toFixed(1) : '--', color: 'var(--blue)' }
        ].map(item => (
          <div key={item.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--medium-gray)', marginTop: '4px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'reviews' ? 'active' : ''}`} onClick={() => { setTab('reviews'); setSelectedReviewId(null) }}>
          All Reviews ({reviews.length})
        </button>
        <button className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => { setTab('pending'); setSelectedReviewId(null) }}>
          Pending ({pending.length})
        </button>
      </div>

      {/* Detail view */}
      {selectedReview && !editMode && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="avatar avatar-md" style={{ background: getAvatarColor(selectedReview.employeeName) }}>
                {selectedReview.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <h3>{selectedReview.employeeName}</h3>
                <div style={{ fontSize: '13px', color: 'var(--medium-gray)' }}>
                  Reviewed by {selectedReview.reviewerName} | {selectedReview.period}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className={`badge badge-${selectedReview.status.toLowerCase()}`}>{selectedReview.status}</span>
              <button className="btn-outline btn-sm" onClick={() => setSelectedReviewId(null)}>Close</button>
            </div>
          </div>

          {selectedReview.status === 'Completed' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '16px', background: 'var(--light-gray)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--medium-gray)', marginBottom: '4px' }}>Overall Rating</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StarRating value={selectedReview.overallRating} readonly />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: RATING_COLORS[selectedReview.overallRating] }}>
                      {RATING_LABELS[selectedReview.overallRating]}
                    </span>
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--medium-gray)' }}>
                  Submitted {formatDate(selectedReview.submittedDate)}
                </div>
              </div>

              <h4 style={{ marginBottom: '12px' }}>Category Ratings</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {selectedReview.categories.map((cat, i) => (
                  <div key={i} style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>{cat.name}</span>
                      <StarRating value={cat.rating} readonly />
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--medium-gray)', lineHeight: '1.5' }}>{cat.comment}</div>
                  </div>
                ))}
              </div>

              {selectedReview.summary && (
                <div>
                  <h4 style={{ marginBottom: '8px' }}>Summary</h4>
                  <p style={{ fontSize: '14px', color: 'var(--charcoal)', lineHeight: '1.6', background: 'var(--light-gray)', padding: '16px', borderRadius: '8px' }}>
                    {selectedReview.summary}
                  </p>
                </div>
              )}
            </>
          )}

          {selectedReview.status === 'Pending' && (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <p style={{ color: 'var(--medium-gray)', marginBottom: '16px' }}>This review has not been completed yet.</p>
              <button className="btn-primary" onClick={() => startReview(selectedReview)}>Start Review</button>
            </div>
          )}
        </div>
      )}

      {/* Edit/Write review */}
      {editMode && editData && selectedReview && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="avatar avatar-md" style={{ background: getAvatarColor(selectedReview.employeeName) }}>
                {selectedReview.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <h3>Review: {selectedReview.employeeName}</h3>
                <div style={{ fontSize: '13px', color: 'var(--medium-gray)' }}>{selectedReview.period}</div>
              </div>
            </div>
            <button className="btn-outline btn-sm" onClick={() => { setEditMode(false); setSelectedReviewId(null) }}>Cancel</button>
          </div>

          <h4 style={{ marginBottom: '16px' }}>Category Ratings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {editData.categories.map((cat, i) => (
              <div key={i} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '600' }}>{cat.name}</span>
                  <StarRating
                    value={cat.rating}
                    onChange={(val) => {
                      const cats = [...editData.categories]
                      cats[i] = { ...cats[i], rating: val }
                      setEditData({ ...editData, categories: cats })
                    }}
                  />
                </div>
                <textarea
                  placeholder={`Comment on ${cat.name.toLowerCase()}...`}
                  value={cat.comment}
                  onChange={e => {
                    const cats = [...editData.categories]
                    cats[i] = { ...cats[i], comment: e.target.value }
                    setEditData({ ...editData, categories: cats })
                  }}
                  style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
                />
              </div>
            ))}
          </div>

          <div className="form-field">
            <label>Overall Summary</label>
            <textarea
              placeholder="Write an overall summary of this employee's performance..."
              value={editData.summary}
              onChange={e => setEditData({ ...editData, summary: e.target.value })}
              style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button className="btn-outline" onClick={() => { setEditMode(false); setSelectedReviewId(null) }}>Cancel</button>
            <button
              className="btn-primary"
              onClick={saveReview}
              disabled={editData.categories.some(c => c.rating === 0)}
            >
              Submit Review
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {!selectedReview && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Reviewer</th>
                <th>Period</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(tab === 'pending' ? pending : reviews).map(review => {
                const emp = employees.find(e => e.id === review.employeeId)
                return (
                  <tr key={review.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {emp && (
                          <div className="avatar avatar-sm" style={{ background: getAvatarColor(`${emp.firstName} ${emp.lastName}`) }}>
                            {getInitials(emp.firstName, emp.lastName)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '500' }}>{review.employeeName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{emp?.jobTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{review.reviewerName}</td>
                    <td style={{ fontSize: '13px' }}>{review.period}</td>
                    <td>
                      {review.overallRating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <StarRating value={review.overallRating} readonly />
                          <span style={{ fontSize: '12px', color: 'var(--medium-gray)' }}>{review.overallRating}/5</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--medium-gray)', fontSize: '13px' }}>--</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${review.status.toLowerCase()}`}>{review.status}</span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--medium-gray)' }}>
                      {review.submittedDate ? formatDate(review.submittedDate) : '--'}
                    </td>
                    <td>
                      {review.status === 'Completed' ? (
                        <button className="btn-outline btn-sm" onClick={() => viewReview(review)}>View</button>
                      ) : (
                        <button className="btn-primary btn-sm" onClick={() => startReview(review)}>Review</button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {(tab === 'pending' ? pending : reviews).length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--medium-gray)', padding: '32px' }}>No reviews found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showToast && <div className="toast">{toastMsg}</div>}
    </div>
  )
}

export default Performance
