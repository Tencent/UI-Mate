import React, { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppState } from '../context/AppContext'
import { getNoteTitle, getInvitationShortName } from '../utils/dataManager'

function ReviewerConsole() {
  const { state, updateState, sid } = useAppState()
  const [editingReview, setEditingReview] = useState(null)
  const [reviewForm, setReviewForm] = useState({
    title: '',
    review: '',
    rating: '5: Borderline',
    confidence: '3: High',
    strengths: '',
    weaknesses: '',
    questions: '',
    limitations: ''
  })

  const venueId = state.venue.id
  const assignmentInvitation = `${venueId}/Reviewers/-/Assignment`

  const appendSid = (path) => {
    if (!sid) return path
    return `${path}${path.includes('?') ? '&' : '?'}sid=${sid}`
  }

  // Notes assigned to this reviewer via edges
  const myNoteIds = useMemo(() => {
    return state.edges
      .filter(e => e.invitation === assignmentInvitation && e.tail === state.user.id && !e.ddate)
      .map(e => e.head)
  }, [state.edges, state.user.id, assignmentInvitation])

  const myNotes = useMemo(() => {
    return myNoteIds.map(id => state.notes[id]).filter(Boolean).sort((a, b) => a.number - b.number)
  }, [myNoteIds, state.notes])

  // Find reviews by user for each note
  const getMyReview = (noteId) => {
    // Check if user has an anonymous reviewer group for this submission
    const reviews = Object.values(state.reviews).filter(r => r.forum === noteId && r.invitations?.[0]?.includes('Official_Review'))
    // Find review by this user's anonymous group
    for (const review of reviews) {
      const sig = review.signatures[0]
      const group = state.groups[sig]
      if (group && group.members?.includes(state.user.id)) {
        return review
      }
    }
    // Direct signature match
    return reviews.find(r => r.signatures.includes(state.user.id)) || null
  }

  const paperStatuses = myNotes.map(note => {
    const myReview = getMyReview(note.id)
    return {
      note,
      review: myReview,
      status: myReview ? 'Review Submitted' : 'Pending Review',
    }
  })

  const handleStartReview = (note) => {
    setEditingReview(note.id)
    const existing = getMyReview(note.id)
    if (existing) {
      setReviewForm({
        title: existing.content?.title?.value || '',
        review: existing.content?.review?.value || '',
        rating: existing.content?.rating?.value || '5: Borderline',
        confidence: existing.content?.confidence?.value || '3: High',
        strengths: existing.content?.strengths?.value || '',
        weaknesses: existing.content?.weaknesses?.value || '',
        questions: existing.content?.questions?.value || '',
        limitations: existing.content?.limitations?.value || '',
      })
    } else {
      setReviewForm({
        title: '',
        review: '',
        rating: '5: Borderline',
        confidence: '3: High',
        strengths: '',
        weaknesses: '',
        questions: '',
        limitations: '',
      })
    }
  }

  const handleSubmitReview = (noteId) => {
    const note = state.notes[noteId]
    if (!note) return
    const reviewId = `review_${Date.now()}`
    const newReview = {
      id: reviewId,
      forum: noteId,
      invitations: [`${venueId}/Submission${note.number}/-/Official_Review`],
      domain: venueId,
      number: Object.values(state.reviews).filter(r => r.forum === noteId).length + 1,
      cdate: Date.now(),
      tcdate: Date.now(),
      mdate: Date.now(),
      tmdate: Date.now(),
      ddate: null,
      pdate: null,
      odate: null,
      replyto: noteId,
      signatures: [state.user.id],
      readers: [`${venueId}/Program_Chairs`, `${venueId}/Submission${note.number}/Area_Chairs`, `${venueId}/Submission${note.number}/Reviewers`],
      writers: [venueId, state.user.id],
      nonreaders: [],
      license: null,
      content: {
        title: { value: reviewForm.title || 'Review' },
        review: { value: reviewForm.review },
        rating: { value: reviewForm.rating },
        confidence: { value: reviewForm.confidence },
        strengths: { value: reviewForm.strengths },
        weaknesses: { value: reviewForm.weaknesses },
        questions: { value: reviewForm.questions },
        limitations: { value: reviewForm.limitations },
        soundness: { value: '3 good' },
        presentation: { value: '3 good' },
        contribution: { value: '3 good' },
      },
      details: {
        writable: true,
        presentation: [
          { name: 'title', fieldName: 'title' },
          { name: 'review', fieldName: 'review', markdown: true },
          { name: 'rating', fieldName: 'rating' },
          { name: 'confidence', fieldName: 'confidence' },
          { name: 'strengths', fieldName: 'strengths', markdown: true },
          { name: 'weaknesses', fieldName: 'weaknesses', markdown: true },
          { name: 'questions', fieldName: 'questions', markdown: true },
          { name: 'limitations', fieldName: 'limitations', markdown: true },
        ],
        signatures: [{ id: state.user.id, members: [state.user.id], readers: [venueId] }],
      },
    }

    updateState(prev => {
      // Check if editing existing review
      const existing = getMyReview(noteId)
      if (existing) {
        return {
          ...prev,
          reviews: {
            ...prev.reviews,
            [existing.id]: { ...existing, ...newReview, id: existing.id, mdate: Date.now(), tmdate: Date.now() },
          },
        }
      }
      return {
        ...prev,
        reviews: { ...prev.reviews, [reviewId]: newReview },
      }
    })
    setEditingReview(null)
  }

  return (
    <div>
      <div className="container" style={{ paddingTop: 20 }}>
        <div className="page-header">
          <h1 style={{ fontSize: 24 }}>Reviewer Console</h1>
          <p style={{ color: '#666', margin: '4px 0' }}>{state.venue.shortPhrase}</p>
        </div>

        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th>Title</th>
              <th style={{ width: 140 }}>Status</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paperStatuses.map(({ note, review, status }) => (
              <tr key={note.id}>
                <td>{note.number}</td>
                <td>
                  <Link to={appendSid(`/forum?id=${note.id}`)} style={{ fontWeight: 500 }}>
                    {getNoteTitle(note)}
                  </Link>
                </td>
                <td>
                  <span className={`badge ${status === 'Review Submitted' ? 'badge-success' : 'badge-warning'}`}>
                    {status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={() => handleStartReview(note)}
                  >
                    {review ? 'Edit Review' : 'Write Review'}
                  </button>
                  {' '}
                  <Link to={appendSid(`/forum?id=${note.id}`)} className="btn btn-default btn-xs">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {myNotes.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted" style={{ padding: 30 }}>
                  No papers assigned to you for review.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {editingReview && (
          <div className="panel" style={{ marginTop: 20 }}>
            <div className="panel-heading">
              Write Review for: {getNoteTitle(state.notes[editingReview])}
            </div>
            <div className="panel-body">
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Review Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={reviewForm.title}
                  onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="Brief summary of your review"
                />
              </div>
              <div style={{ display: 'flex', gap: 15, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Rating</label>
                  <select
                    className="form-control"
                    value={reviewForm.rating}
                    onChange={e => setReviewForm({ ...reviewForm, rating: e.target.value })}
                  >
                    {['1: Strong Reject', '3: Reject', '5: Borderline', '7: Accept', '8: Strong Accept', '10: Award'].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Confidence</label>
                  <select
                    className="form-control"
                    value={reviewForm.confidence}
                    onChange={e => setReviewForm({ ...reviewForm, confidence: e.target.value })}
                  >
                    {['1: Low', '2: Medium', '3: High', '4: Very High'].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Review</label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={reviewForm.review}
                  onChange={e => setReviewForm({ ...reviewForm, review: e.target.value })}
                  placeholder="Main review body..."
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Strengths</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={reviewForm.strengths}
                  onChange={e => setReviewForm({ ...reviewForm, strengths: e.target.value })}
                  placeholder="List the main strengths..."
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Weaknesses</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={reviewForm.weaknesses}
                  onChange={e => setReviewForm({ ...reviewForm, weaknesses: e.target.value })}
                  placeholder="List the main weaknesses..."
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Questions for Authors</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={reviewForm.questions}
                  onChange={e => setReviewForm({ ...reviewForm, questions: e.target.value })}
                  placeholder="Questions..."
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Limitations</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={reviewForm.limitations}
                  onChange={e => setReviewForm({ ...reviewForm, limitations: e.target.value })}
                  placeholder="Limitations acknowledgment..."
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSubmitReview(editingReview)}
                  disabled={!reviewForm.review.trim()}
                >
                  Submit Review
                </button>
                <button
                  className="btn btn-default"
                  onClick={() => setEditingReview(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewerConsole
