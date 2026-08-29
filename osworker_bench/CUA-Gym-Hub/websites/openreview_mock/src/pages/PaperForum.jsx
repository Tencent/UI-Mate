import React, { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppState } from '../context/AppContext'
import { getNoteTitle, getNoteAuthors, getNoteAuthorIds, getInvitationShortName } from '../utils/dataManager'

const INVITATION_COLORS = {
  'Comment':          { backgroundColor: '#bfb', color: '#2c3a4a' },
  'Official Comment': { backgroundColor: '#bbf', color: '#2c3a4a' },
  'Official_Comment': { backgroundColor: '#bbf', color: '#2c3a4a' },
  'Public Comment':   { backgroundColor: '#bfb', color: '#2c3a4a' },
  'Public_Comment':   { backgroundColor: '#bfb', color: '#2c3a4a' },
  'Review':           { backgroundColor: '#fbb', color: '#2c3a4a' },
  'Meta Review':      { backgroundColor: '#fbf', color: '#2c3a4a' },
  'Meta_Review':      { backgroundColor: '#fbf', color: '#2c3a4a' },
  'Official Review':  { backgroundColor: '#fbb', color: '#2c3a4a' },
  'Official_Review':  { backgroundColor: '#fbb', color: '#2c3a4a' },
  'Decision':         { backgroundColor: '#bff', color: '#2c3a4a' },
}

function getInvitationColor(invitationType) {
  return INVITATION_COLORS[invitationType] || { backgroundColor: '#8cf', color: '#2c3a4a' }
}

function ForumReply({ note, depth, state, appendSid }) {
  const [collapsed, setCollapsed] = useState(false)
  const [contentExpanded, setContentExpanded] = useState(true)

  const invitationId = note.invitations?.[0] || ''
  const invitationType = getInvitationShortName(invitationId)
  const invitationColor = getInvitationColor(invitationType)
  const depthClass = depth % 2 === 0 ? 'depth-even' : 'depth-odd'
  const title = getNoteTitle(note) || note.content?.title?.value || invitationType
  const signature = note.signatures?.[0] || 'Anonymous'
  const signatureDisplay = signature.split('/').pop().replace(/_/g, ' ')
  const date = new Date(note.cdate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const readers = note.readers || []

  // Get content fields to display (skip title, authors, authorids, and _ prefixed)
  const omitFields = new Set(['title', 'authors', 'authorids', 'venue', 'venueid', 'pdf', 'html'])
  const contentFields = Object.entries(note.content || {}).filter(([key]) => {
    return !omitFields.has(key) && !key.startsWith('_')
  })

  if (collapsed) {
    return (
      <div className="note" data-id={note.id} style={{ marginLeft: depth * 16 }}>
        <div className="heading" onClick={() => setCollapsed(false)} style={{ cursor: 'pointer' }}>
          <h4 className="minimal-title">
            <strong>{title}</strong> &bull;{' '}
            <span className="signatures">by {signatureDisplay}</span>
          </h4>
        </div>
      </div>
    )
  }

  return (
    <div className={`note ${depthClass}`} data-id={note.id} style={{ marginLeft: depth * 16 }}>
      <div className="heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 onClick={() => setCollapsed(true)} style={{ cursor: 'pointer' }}>
          <strong>{title}</strong>
        </h4>
      </div>
      <div className="subheading" style={{ marginBottom: 8, fontSize: '0.75rem', color: '#616161' }}>
        <span className="invitation highlight" style={{ ...invitationColor, display: 'inline-block', padding: '0 4px', borderRadius: 2, fontSize: '0.75rem', fontWeight: 'bold', marginRight: 8 }}>
          {invitationType}
        </span>
        <span className="signatures" style={{ paddingRight: 8 }}>by {signatureDisplay}</span>
        <span className="created-date" style={{ paddingRight: 8 }}>{date}</span>
        <span className="readers" style={{ paddingRight: 8 }}>
          Readers: {readers.includes('everyone') ? 'Everyone' : readers.map(r => r.split('/').pop().replace(/_/g, ' ')).join(', ')}
        </span>
        <span className="revisions">
          <a href="#" onClick={e => e.preventDefault()}>Revisions</a>
        </span>
      </div>

      {/* Note content */}
      {contentExpanded && (
        <div className="note-content">
          {contentFields.map(([key, fieldObj]) => {
            const value = fieldObj?.value
            if (value === undefined || value === null) return null
            const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            const displayValue = Array.isArray(value) ? value.join(', ') : String(value)
            return (
              <div key={key}>
                <strong className="note-content-field disable-tex-rendering">{displayKey}:</strong>
                <span className="note-content-value" style={{ whiteSpace: 'pre-wrap' }}> {displayValue}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Reply invitations */}
      <div className="invitations-container mt-2" style={{ textAlign: 'right', marginTop: 8 }}>
        <div className="invitation-buttons">
          <span className="hint" style={{ color: '#616161', marginRight: 4, fontSize: '0.75rem' }}>Add:</span>
          <button className="btn btn-xs" style={{ fontSize: '0.75rem', minWidth: 'auto' }}>Official Comment</button>
        </div>
      </div>
    </div>
  )
}

function PaperForum() {
  const [searchParams] = useSearchParams()
  const forumId = searchParams.get('id')
  const { state, updateState, sid } = useAppState()
  const [commentText, setCommentText] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [sortOrder, setSortOrder] = useState('date-desc')
  const [filterKeyword, setFilterKeyword] = useState('')

  const venueId = state.venue.id

  const appendSid = (path) => {
    if (!sid) return path
    return `${path}${path.includes('?') ? '&' : '?'}sid=${sid}`
  }

  const note = state.notes[forumId]
  if (!note) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="alert alert-danger">Forum note not found.</div>
      </div>
    )
  }

  // Get all replies (reviews + comments)
  const replies = useMemo(() => {
    const allReplies = Object.values(state.reviews).filter(r => r.forum === forumId)
    let sorted = [...allReplies]
    if (sortOrder === 'date-asc') {
      sorted.sort((a, b) => a.cdate - b.cdate)
    } else {
      sorted.sort((a, b) => b.cdate - a.cdate)
    }
    if (filterKeyword.trim()) {
      const q = filterKeyword.toLowerCase()
      sorted = sorted.filter(r => {
        const text = Object.entries(r.content || {}).map(([, v]) => String(v?.value || '')).join(' ').toLowerCase()
        return text.includes(q)
      })
    }
    return sorted
  }, [state.reviews, forumId, sortOrder, filterKeyword])

  const publishDate = new Date(note.cdate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const authors = getNoteAuthors(note)
  const authorIds = getNoteAuthorIds(note)
  const title = getNoteTitle(note)

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    const commentId = `comment_${Date.now()}`
    const newComment = {
      id: commentId,
      forum: forumId,
      invitations: [`${venueId}/Submission${note.number}/-/Official_Comment`],
      domain: venueId,
      number: replies.length + 1,
      cdate: Date.now(),
      tcdate: Date.now(),
      mdate: Date.now(),
      tmdate: Date.now(),
      ddate: null,
      pdate: null,
      odate: null,
      replyto: forumId,
      signatures: [state.user.id],
      readers: ['everyone'],
      writers: [venueId, state.user.id],
      nonreaders: [],
      license: null,
      content: {
        title: { value: 'Comment' },
        comment: { value: commentText.trim() },
      },
      details: {
        writable: true,
        presentation: [
          { name: 'title', fieldName: 'title' },
          { name: 'comment', fieldName: 'comment', markdown: true },
        ],
        signatures: [{ id: state.user.id, members: [state.user.id], readers: ['everyone'] }],
      },
    }
    updateState(prev => ({
      ...prev,
      reviews: { ...prev.reviews, [commentId]: newComment },
    }))
    setCommentText('')
    setShowCommentForm(false)
  }

  // Omit certain fields from display
  const omitFields = new Set(['title', 'authors', 'authorids', 'venue', 'venueid', 'pdf', 'html'])
  const contentFields = Object.entries(note.content || {}).filter(([key]) => {
    return !omitFields.has(key) && !key.startsWith('_')
  })

  return (
    <div>
      <div className="container" style={{ paddingTop: 20, maxWidth: 900, margin: '0 auto' }}>
        {/* Forum note */}
        <div className="forum-note">
          <div className="forum-title mt-2 mb-2">
            <h2 className="citation_title">{title}</h2>
            <a className="citation_pdf_url" href={note.content?.pdf?.value}>PDF</a>
          </div>
          <div className="forum-authors mb-2">
            <h3 className="paper-authors">
              {authors.map((name, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  {authorIds[i] ? (
                    <Link to={appendSid(`/profile?id=${authorIds[i]}`)}>{name}</Link>
                  ) : name}
                </span>
              ))}
            </h3>
          </div>
          <div className="clearfix mb-1">
            <div className="forum-meta paper-meta">
              <span className="date item">Published: {publishDate}</span>
              <span className="item">{note.content?.venue?.value || state.venue.shortPhrase}</span>
              <span className="readers item">
                Readers: {note.readers?.includes('everyone') ? 'Everyone' : (note.readers || []).join(', ')}
              </span>
              <span className="item"><a href="#" onClick={e => e.preventDefault()}>Revisions</a></span>
              <span className="item"><a href="#" onClick={e => e.preventDefault()}>BibTeX</a></span>
              {note.license && <span className="item">{note.license}</span>}
            </div>
            <div className="invitation-buttons" style={{ textAlign: 'right', marginBottom: '1rem' }}>
              <a href={note.content?.pdf?.value} className="pdf-link" style={{ marginRight: 6 }}>PDF</a>
              <button className="btn btn-default btn-xs" onClick={() => setShowCommentForm(!showCommentForm)} style={{ marginLeft: 6 }}>Reply</button>
            </div>
          </div>

          {/* Note content */}
          <div className="note-content">
            {contentFields.map(([key, fieldObj]) => {
              const value = fieldObj?.value
              if (value === undefined || value === null) return null
              const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
              const displayValue = Array.isArray(value) ? value.join(', ') : String(value)
              return (
                <div key={key} className="note-content-field">
                  <strong>{displayKey}:</strong>
                  <span className="note-content-value"> {displayValue}</span>
                </div>
              )
            })}
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid rgba(0,0,0,0.1)', margin: '1.5rem 0' }} />

        {/* Filter controls */}
        <form className="form-inline filter-controls">
          <div className="wrap" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select style={{ minWidth: 160 }}>
              <option>Filter by reply type...</option>
              <option>Official Review</option>
              <option>Official Comment</option>
            </select>
            <select style={{ minWidth: 140 }}>
              <option>Filter by author...</option>
            </select>
            <input
              id="keyword-input"
              type="text"
              placeholder="Search keywords..."
              value={filterKeyword}
              onChange={e => setFilterKeyword(e.target.value)}
              style={{ minWidth: 140 }}
            />
            <select
              id="sort-dropdown"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="date-desc">Sort: Newest First</option>
              <option value="date-asc">Sort: Oldest First</option>
            </select>
          </div>
          <em className="filter-count">{replies.length} / {replies.length} replies shown</em>
        </form>

        {/* Comment form */}
        {showCommentForm && (
          <form onSubmit={handleSubmitComment} style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 10 }}>
              <textarea
                className="form-control"
                placeholder="Write your comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={4}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!commentText.trim()}>
              Submit Comment
            </button>
            <button type="button" className="btn btn-default btn-sm" onClick={() => setShowCommentForm(false)} style={{ marginLeft: 8 }}>
              Cancel
            </button>
          </form>
        )}

        {/* Replies */}
        <div id="forum-replies" className="forum-replies-container">
          {replies.length === 0 && (
            <div className="well text-center text-muted">
              No replies have been submitted yet.
            </div>
          )}
          {replies.map((reply, i) => (
            <ForumReply
              key={reply.id}
              note={reply}
              depth={0}
              state={state}
              appendSid={appendSid}
            />
          ))}
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}

export default PaperForum
