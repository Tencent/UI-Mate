import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/Avatar.jsx'
import { formatDate } from '../utils/dataManager.js'

function PeerNominationPanel({ cycle, myReview, users, currentUser, onSubmit }) {
  const [selectedPeers, setSelectedPeers] = useState(new Set(myReview?.nominatedPeerIds || []))

  const eligibleUsers = users.filter(u => u.id !== currentUser.id)

  const togglePeer = (uid) => {
    setSelectedPeers(prev => {
      const next = new Set(prev)
      if (next.has(uid)) next.delete(uid)
      else next.add(uid)
      return next
    })
  }

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Nominate Peers</h2>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
        Select colleagues who should provide feedback for your review. Choose 2–5 peers.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {eligibleUsers.map(u => {
          const checked = selectedPeers.has(u.id)
          return (
            <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, border: `1px solid ${checked ? '#6B4FBB' : '#E5E7EB'}`, background: checked ? '#EFF6FF' : '#fff', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => togglePeer(u.id)}
                style={{ accentColor: '#6B4FBB' }}
              />
              <Avatar user={u} size={32} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{u.firstName} {u.lastName}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{u.title}</div>
              </div>
            </label>
          )
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>{selectedPeers.size} peer{selectedPeers.size !== 1 ? 's' : ''} selected</span>
        <button
          className="btn btn-primary"
          disabled={selectedPeers.size < 2}
          onClick={() => onSubmit([...selectedPeers])}
        >
          Confirm Nominations
        </button>
      </div>
    </div>
  )
}

function SelfReviewForm({ cycle, review, currentUser, onSubmit, onClose }) {
  const [overallAssessment, setOverallAssessment] = useState('')
  const [competencyRatings, setCompetencyRatings] = useState({
    'Communication': 0, 'Leadership': 0, 'Execution': 0, 'Collaboration': 0, 'Technical Skills': 0,
  })
  const [responses, setResponses] = useState({
    'What are your key accomplishments this quarter?': '',
    'What challenges did you face and how did you overcome them?': '',
    'What are your goals for the next quarter?': '',
  })

  const handleSubmit = () => {
    const selfReview = {
      reviewerId: currentUser.id,
      type: 'self',
      overallRating: 'meets_expectations',
      overallAssessment,
      responses: Object.entries(responses).map(([question, answer]) => ({ question, answer })),
      competencyRatings: Object.entries(competencyRatings).map(([competency, rating]) => ({ competency, rating })),
      submittedAt: new Date().toISOString(),
    }
    onSubmit(selfReview)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <span className="modal-title">Self-Review</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Overall self-assessment</label>
            <textarea
              className="form-textarea"
              placeholder="Summarize your performance this quarter..."
              value={overallAssessment}
              onChange={e => setOverallAssessment(e.target.value)}
              style={{ minHeight: 100 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ marginBottom: 12 }}>Competency Ratings (1-5)</label>
            {Object.entries(competencyRatings).map(([comp, rating]) => (
              <div key={comp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>{comp}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      onClick={() => setCompetencyRatings(prev => ({ ...prev, [comp]: val }))}
                      style={{
                        width: 32, height: 32, borderRadius: 6,
                        border: `1px solid ${rating >= val ? '#6B4FBB' : '#E5E7EB'}`,
                        background: rating >= val ? '#6B4FBB' : '#fff',
                        color: rating >= val ? '#fff' : '#374151',
                        fontWeight: 600, cursor: 'pointer', fontSize: 13,
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(responses).map(question => (
            <div key={question} className="form-group">
              <label className="form-label">{question}</label>
              <textarea
                className="form-textarea"
                placeholder="Your response..."
                value={responses[question]}
                onChange={e => setResponses(prev => ({ ...prev, [question]: e.target.value }))}
                style={{ minHeight: 80 }}
              />
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Submit Self-Review</button>
        </div>
      </div>
    </div>
  )
}

export default function ReviewDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, updateState } = useApp()
  const [expandedReviewee, setExpandedReviewee] = useState(null)
  const [showSelfReview, setShowSelfReview] = useState(false)
  const [showNominate, setShowNominate] = useState(false)

  if (!state) return null
  const { reviewCycles, reviews, users, currentUser } = state

  const cycle = reviewCycles.find(rc => rc.id === id)
  if (!cycle) {
    return (
      <div style={{ padding: 32 }}>
        <button className="btn btn-outline" onClick={() => navigate('/reviews')}>← Back to Reviews</button>
        <p style={{ marginTop: 20, color: '#6B7280' }}>Review cycle not found.</p>
      </div>
    )
  }

  const cycleReviews = reviews.filter(r => r.cycleId === id)
  const total = cycleReviews.length
  const completed = cycleReviews.filter(r => r.status === 'completed').length
  const stillReceiving = cycleReviews.filter(r => r.status === 'still_receiving').length
  const notStarted = cycleReviews.filter(r => r.status === 'not_started').length

  const myReview = cycleReviews.find(r => r.revieweeId === currentUser.id)

  const steps = [
    { id: 'nominate_peers', label: 'Nominate peers' },
    { id: 'manage_team', label: 'Manage team' },
    { id: 'share_results', label: 'Share results' },
  ]

  const handleNominationSubmit = (peerIds) => {
    updateState(prev => ({
      ...prev,
      reviews: prev.reviews.map(r => {
        if (r.cycleId !== id || r.revieweeId !== currentUser.id) return r
        return { ...r, nominatedPeerIds: peerIds }
      }),
      reviewCycles: prev.reviewCycles.map(rc => {
        if (rc.id !== id) return rc
        return { ...rc, nominationsSubmitted: true }
      }),
    }))
    setShowNominate(false)
  }

  const handleSelfReviewSubmit = (selfReview) => {
    updateState(prev => ({
      ...prev,
      reviews: prev.reviews.map(r => {
        if (r.cycleId !== id || r.revieweeId !== currentUser.id) return r
        return {
          ...r,
          status: 'completed',
          selfReviewSubmitted: true,
          reviews: [...(r.reviews || []), selfReview],
        }
      }),
      tasks: prev.tasks.map(t =>
        t.type === 'review' && t.relatedEntityId === id
          ? { ...t, completed: true }
          : t
      ),
    }))
  }

  const statusBadge = {
    completed: { label: 'COMPLETED', bg: '#DCFCE7', color: '#166534' },
    still_receiving: { label: 'STILL RECEIVING', bg: '#FEF9C3', color: '#854D0E' },
    not_started: { label: 'NOT STARTED', bg: '#F3F4F6', color: '#374151' },
    in_progress: { label: 'IN PROGRESS', bg: '#EFF6FF', color: '#1D4ED8' },
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dark header */}
      <div style={{ background: '#1B3A4B', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>{cycle.name}</h1>
        <button onClick={() => navigate('/reviews')} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 22 }}>×</button>
      </div>

      <div style={{ display: 'flex', flex: 1, background: '#F8F9FA' }}>
        {/* Left steps */}
        <div style={{ width: 240, background: '#fff', borderRight: '1px solid #E5E7EB', padding: '24px 20px' }}>
          {steps.map((step, idx) => {
            const stepIdx = cycle.steps.indexOf(step.id)
            const currentIdx = cycle.steps.indexOf(cycle.currentStep)
            const isDone = stepIdx < currentIdx || (stepIdx === currentIdx && cycle.status === 'completed')
            const isCurrent = stepIdx === currentIdx
            const isUpcoming = stepIdx > currentIdx

            return (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  border: `2px solid ${isDone ? '#22C55E' : isCurrent ? '#6B4FBB' : '#D1D5DB'}`,
                  background: isDone ? '#22C55E' : 'transparent',
                  color: isDone ? '#fff' : isCurrent ? '#6B4FBB' : '#9CA3AF',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {isDone ? '✓' : isCurrent ? '●' : '○'}
                </div>
                <span style={{ fontSize: 14, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? '#1A1A2E' : isUpcoming ? '#9CA3AF' : '#374151' }}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          {/* Progress card */}
          <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Progress</h2>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', height: 16, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                  {total > 0 && (
                    <>
                      <div style={{ width: `${completed / total * 100}%`, background: '#22C55E' }} title={`Completed: ${completed}`} />
                      <div style={{ width: `${stillReceiving / total * 100}%`, background: '#F59E0B' }} title={`Still receiving: ${stillReceiving}`} />
                      <div style={{ width: `${notStarted / total * 100}%`, background: '#E5E7EB' }} title={`Not started: ${notStarted}`} />
                    </>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {completed} of {total} reviews complete
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                  <span style={{ fontSize: 13 }}>Completed <strong>{completed}</strong> review{completed !== 1 ? 's' : ''} <strong style={{ color: '#6B7280' }}>{total > 0 ? Math.round(completed / total * 100) : 0}%</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                  <span style={{ fontSize: 13 }}>Still receiving <strong>{stillReceiving}</strong> review{stillReceiving !== 1 ? 's' : ''} <strong style={{ color: '#6B7280' }}>{total > 0 ? Math.round(stillReceiving / total * 100) : 0}%</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#9CA3AF', display: 'inline-block' }} />
                  <span style={{ fontSize: 13 }}>Not started <strong>{notStarted}</strong> review{notStarted !== 1 ? 's' : ''} <strong style={{ color: '#6B7280' }}>{total > 0 ? Math.round(notStarted / total * 100) : 0}%</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Self-review prompt */}
          {myReview && !myReview.selfReviewSubmitted && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1E40AF', marginBottom: 2 }}>Your self-review is pending</div>
                <div style={{ fontSize: 13, color: '#3B82F6' }}>Complete your self-review to finish this cycle</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowSelfReview(true)}>Complete self-review</button>
            </div>
          )}

          {/* Peer nomination prompt */}
          {myReview && !cycle.nominationsSubmitted && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 2 }}>Peer nominations needed</div>
                <div style={{ fontSize: 13, color: '#B45309' }}>Nominate colleagues to review your work this cycle</div>
              </div>
              <button className="btn btn-primary btn-sm" style={{ background: '#D97706', borderColor: '#D97706' }} onClick={() => setShowNominate(!showNominate)}>
                {showNominate ? 'Hide nominations' : 'Nominate peers'}
              </button>
            </div>
          )}

          {/* Peer nomination panel */}
          {showNominate && myReview && (
            <div style={{ marginBottom: 24 }}>
              <PeerNominationPanel
                cycle={cycle}
                myReview={myReview}
                users={users}
                currentUser={currentUser}
                onSubmit={handleNominationSubmit}
              />
            </div>
          )}

          {/* Manage your team */}
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Manage your team</h2>
          <div className="card" style={{ padding: 0 }}>
            {cycleReviews.map((review, idx) => {
              const reviewee = users.find(u => u.id === review.revieweeId)
              if (!reviewee) return null
              const badge = statusBadge[review.status] || { label: review.status.toUpperCase(), bg: '#F3F4F6', color: '#374151' }
              const isExpanded = expandedReviewee === review.id

              return (
                <div key={review.id} style={{ borderBottom: idx < cycleReviews.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <Avatar user={reviewee} size={48} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{reviewee.firstName} {reviewee.lastName}</div>
                      <div style={{ fontSize: 13, color: '#6B7280' }}>{reviewee.title}</div>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color, fontWeight: 700, letterSpacing: '0.5px' }}>
                      {badge.label}
                    </span>
                    <button
                      onClick={() => setExpandedReviewee(isExpanded ? null : review.id)}
                      style={{ fontSize: 13, color: '#6B4FBB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                    >
                      {isExpanded ? 'Hide reviewers ▲' : 'Show reviewers ▼'}
                    </button>
                  </div>
                  {isExpanded && review.nominatedPeerIds?.length > 0 && (
                    <div style={{ padding: '0 20px 16px 84px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reviewers</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {review.nominatedPeerIds.map(peerId => {
                          const peer = users.find(u => u.id === peerId)
                          if (!peer) return null
                          return (
                            <div key={peerId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Avatar user={peer} size={28} />
                              <span style={{ fontSize: 13 }}>{peer.firstName} {peer.lastName}</span>
                              <span style={{ fontSize: 12, color: '#6B7280' }}>— {peer.title}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showSelfReview && (
        <SelfReviewForm
          cycle={cycle}
          review={myReview}
          currentUser={currentUser}
          onSubmit={handleSelfReviewSubmit}
          onClose={() => setShowSelfReview(false)}
        />
      )}
    </div>
  )
}
