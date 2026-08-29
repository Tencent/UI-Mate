import React, { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppState } from '../context/AppContext'
import { getNoteTitle, getNoteAuthors, getNoteAuthorIds, getProfileDisplayInfo, getInvitationShortName } from '../utils/dataManager'

function ACConsole() {
  const { state, sid } = useAppState()
  const [activeTab, setActiveTab] = useState('assigned')
  const [expandedPaper, setExpandedPaper] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const venueId = state.venue.id
  const assignmentInvitation = `${venueId}/Reviewers/-/Assignment`
  const acAssignmentInvitation = `${venueId}/Area_Chairs/-/Assignment`

  const appendSid = (path) => {
    if (!sid) return path
    return `${path}${path.includes('?') ? '&' : '?'}sid=${sid}`
  }

  // Papers assigned to this AC via edges
  const myNoteIds = useMemo(() => {
    return state.edges
      .filter(e => e.invitation === acAssignmentInvitation && e.tail === state.user.id && !e.ddate)
      .map(e => e.head)
  }, [state.edges, state.user.id, acAssignmentInvitation])

  const myNotes = useMemo(() => {
    return myNoteIds.map(id => state.notes[id]).filter(Boolean).sort((a, b) => a.number - b.number)
  }, [myNoteIds, state.notes])

  // Filter notes
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return myNotes
    const q = searchQuery.toLowerCase()

    // Support query-style filtering like "+numReviewersAssigned>2"
    const queryMatch = q.match(/^\+?(\w+)\s*([><=!]+)\s*(.+)$/)
    if (queryMatch) {
      const [, prop, op, val] = queryMatch
      return myNotes.filter(note => {
        let noteVal
        if (prop === 'number') noteVal = note.number
        else if (prop === 'title') noteVal = getNoteTitle(note).toLowerCase()
        else if (prop === 'numreviewersassigned' || prop === 'numreviewers') {
          noteVal = state.edges.filter(e => e.invitation === assignmentInvitation && e.head === note.id && !e.ddate).length
        }
        else return true

        const numVal = parseFloat(val)
        if (!isNaN(numVal) && typeof noteVal === 'number') {
          if (op === '>') return noteVal > numVal
          if (op === '>=') return noteVal >= numVal
          if (op === '<') return noteVal < numVal
          if (op === '<=') return noteVal <= numVal
          if (op === '==' || op === '=') return noteVal === numVal
          if (op === '!=') return noteVal !== numVal
        }
        return true
      })
    }

    return myNotes.filter(note => {
      const title = getNoteTitle(note).toLowerCase()
      const num = note.number.toString()
      return title.includes(q) || num.includes(q)
    })
  }, [myNotes, searchQuery, state.edges, assignmentInvitation])

  // Get reviewer assignments for a note
  const getReviewerAssignments = (noteId) => {
    const reviewerEdges = state.edges.filter(e => e.invitation === assignmentInvitation && e.head === noteId && !e.ddate)
    return reviewerEdges.map(edge => {
      const profile = state.profiles[edge.tail]
      const info = profile ? getProfileDisplayInfo(profile) : { name: edge.tail, email: '' }
      // Find reviews for this paper by this reviewer
      const reviews = Object.values(state.reviews).filter(r => r.forum === noteId)
      // Check if this reviewer's anonymous group has submitted
      const reviewerGroups = Object.entries(state.groups)
        .filter(([gid, g]) => g.members?.includes(edge.tail) && gid.includes('Reviewer_'))
        .map(([gid]) => gid)
      const review = reviews.find(r => r.signatures.some(s => reviewerGroups.includes(s)))
      return { edge, profile, info, review }
    })
  }

  const getReviewsForNote = (noteId) => {
    return Object.values(state.reviews).filter(r => r.forum === noteId && r.invitations?.[0]?.includes('Official_Review'))
  }

  const minReviewers = state.edgeBrowserConfig?.minReviewersPerPaper || 3

  const handleExport = () => {
    const rows = [['#', 'Title', 'Authors', 'Reviewers Assigned', 'Reviews Done', 'Avg Rating']]
    filteredNotes.forEach(note => {
      const revAssign = getReviewerAssignments(note.id)
      const reviews = getReviewsForNote(note.id)
      const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => {
            const val = r.content?.rating?.value || ''
            const num = parseInt(val)
            return s + (isNaN(num) ? 0 : num)
          }, 0) / reviews.length).toFixed(2)
        : 'N/A'
      rows.push([
        note.number,
        getNoteTitle(note),
        getNoteAuthors(note).join('; '),
        revAssign.length,
        reviews.length,
        avgRating,
      ])
    })
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ac_console_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="container" style={{ paddingTop: 20 }}>
        <h2 className="venue-title">
          {state.venue.fullName || state.venue.shortPhrase}
        </h2>

        {/* Tabs */}
        <div className="tabs-container">
          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation" className={activeTab === 'assigned' ? 'active' : ''}>
              <a href="#assigned-papers" role="tab" onClick={(e) => { e.preventDefault(); setActiveTab('assigned') }}>
                Assigned Papers
                <span className="badge" style={{ marginLeft: 6, backgroundColor: '#777', color: '#fff' }}>{myNotes.length}</span>
              </a>
            </li>
            <li role="presentation" className={activeTab === 'tasks' ? 'active' : ''}>
              <a href="#tasks" role="tab" onClick={(e) => { e.preventDefault(); setActiveTab('tasks') }}>
                Area Chair Tasks
              </a>
            </li>
          </ul>
        </div>

        {/* Assigned Papers Tab */}
        {activeTab === 'assigned' && (
          <div>
            {/* Menu bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter search query or type + to filter..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ maxWidth: 350 }}
                />
                <span style={{ fontSize: 13, color: '#777' }}>
                  {filteredNotes.length} paper{filteredNotes.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button className="btn btn-default btn-sm" onClick={handleExport}>
                Export
              </button>
            </div>

            {/* Table */}
            <table className="table console-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Submission Summary</th>
                  <th style={{ width: 280 }}>Official Review</th>
                  <th style={{ width: 170 }}>Decision</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map(note => {
                  const reviewerInfos = getReviewerAssignments(note.id)
                  const reviews = getReviewsForNote(note.id)
                  const completedReviews = reviews.length
                  const isExpanded = expandedPaper === note.id
                  const authors = getNoteAuthors(note)
                  const authorIds = getNoteAuthorIds(note)

                  return (
                    <tr key={note.id}>
                      {/* # */}
                      <td className="note-number" style={{ fontWeight: 600, color: '#555' }}>
                        {note.number}
                      </td>

                      {/* Submission Summary */}
                      <td>
                        <div>
                          <Link
                            to={appendSid(`/forum?id=${note.id}`)}
                            style={{ fontSize: 15, fontWeight: 600, color: '#3e6775', lineHeight: 1.4, display: 'block', marginBottom: 6 }}
                          >
                            {getNoteTitle(note)}
                          </Link>

                          <div style={{ marginBottom: 6 }}>
                            <a href={note.content?.pdf?.value} style={{ fontSize: 13, color: '#3e6775' }}>
                              Download PDF
                            </a>
                          </div>

                          <div className="note-authors" style={{ fontSize: 13, color: '#555', marginBottom: 6, lineHeight: 1.6 }}>
                            {authors.map((name, i) => (
                              <span key={i}>
                                {i > 0 && ', '}
                                {authorIds[i] ? (
                                  <Link to={appendSid(`/profile?id=${authorIds[i]}`)} style={{ color: '#333' }}>
                                    {name}
                                  </Link>
                                ) : name}
                              </span>
                            ))}
                          </div>

                          <div style={{ marginBottom: 6 }}>
                            <span className="label label-default" style={{ fontSize: 11 }}>
                              {note.content?.venue?.value || state.venue.shortPhrase}
                            </span>
                          </div>

                          <button
                            onClick={() => setExpandedPaper(isExpanded ? null : note.id)}
                            style={{ background: 'none', border: 'none', color: '#3e6775', cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'inherit' }}
                          >
                            {isExpanded ? 'Hide details' : 'Show details'}
                          </button>

                          {isExpanded && (
                            <div style={{ marginTop: 10, padding: '10px 12px', background: '#f9f9f9', borderRadius: 4, fontSize: 13 }}>
                              <div style={{ marginBottom: 8 }}>
                                <strong className="note-content-field">Abstract:</strong>
                                <p className="note-content-value" style={{ marginTop: 4, lineHeight: 1.6, color: '#444' }}>
                                  {note.content?.abstract?.value || ''}
                                </p>
                              </div>
                              {note.content?.keywords?.value?.length > 0 && (
                                <div>
                                  <strong className="note-content-field">Keywords:</strong>{' '}
                                  <span className="note-content-value">{note.content.keywords.value.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Official Review */}
                      <td>
                        {completedReviews > 0 ? (
                          <div>
                            <div style={{ marginBottom: 8 }}>
                              <Link
                                to={appendSid(`/forum?id=${note.id}`)}
                                style={{ color: completedReviews >= minReviewers ? '#5cb85c' : '#f0ad4e', fontWeight: 600, fontSize: 14 }}
                              >
                                {completedReviews} of {reviewerInfos.length} Reviews Submitted
                              </Link>
                            </div>
                            {reviews.map(review => {
                              const sig = review.signatures[0] || ''
                              const sigShort = getInvitationShortName(sig) || sig.split('/').pop()
                              const rating = review.content?.rating?.value || 'N/A'
                              const confidence = review.content?.confidence?.value || 'N/A'
                              return (
                                <div key={review.id} style={{ fontSize: 13, marginBottom: 4 }}>
                                  <strong>{sigShort}:</strong>{' '}
                                  Rating: {rating} / Confidence: {confidence}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div>
                            <span style={{ color: '#d9534f', fontWeight: 600, fontSize: 14 }}>
                              No Reviews Yet
                            </span>
                            <div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>
                              {reviewerInfos.length}/{minReviewers} reviewers assigned
                            </div>
                          </div>
                        )}

                        <div style={{ marginTop: 10 }}>
                          <Link
                            to={appendSid(`/edges/browse?traverse=${assignmentInvitation}&head=${note.id}`)}
                            style={{ fontSize: 13, color: '#3e6775' }}
                          >
                            Modify Reviewer Assignments
                          </Link>
                        </div>
                      </td>

                      {/* Decision */}
                      <td>
                        <span style={{ color: '#999', fontSize: 13 }}>
                          {completedReviews >= minReviewers ? (
                            <Link to={appendSid(`/forum?id=${note.id}`)} className="btn btn-primary btn-xs">
                              Write Meta Review
                            </Link>
                          ) : (
                            'Awaiting reviews'
                          )}
                        </span>
                      </td>
                    </tr>
                  )
                })}

                {filteredNotes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted" style={{ padding: 40 }}>
                      {searchQuery ? 'No papers match your search.' : 'No papers assigned to you as Area Chair.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Area Chair Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 15 }}>Area Chair Checklist</h3>
            <div className="panel">
              <div className="panel-body">
                <div style={{ lineHeight: 2.2 }}>
                  {[
                    { label: 'Verify all papers have 3 reviewers assigned', done: myNotes.every(n => state.edges.filter(e => e.invitation === assignmentInvitation && e.head === n.id && !e.ddate).length >= minReviewers) },
                    { label: 'Check reviewer diversity (seniority, geography, institution)', done: false },
                    { label: 'Verify paper formatting and anonymization', done: false },
                    { label: 'Check for conflicts of interest', done: false },
                    { label: 'Review quality check (after reviews submitted)', done: false },
                    { label: 'Write meta-reviews for all papers', done: false },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: item.done ? '#5cb85c' : '#ccc', fontSize: 18 }}>
                        {item.done ? '\u2611' : '\u2610'}
                      </span>
                      <span style={{ color: item.done ? '#5cb85c' : '#333' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 500, marginTop: 25, marginBottom: 15 }}>Quick Links</h3>
            <ul style={{ listStyle: 'disc', paddingLeft: 20, lineHeight: 2 }}>
              <li>
                <Link to={appendSid(`/group?id=${venueId}`)}>View All Submissions</Link>
              </li>
              {myNotes.map(n => (
                <li key={n.id}>
                  <Link to={appendSid(`/edges/browse?traverse=${assignmentInvitation}&head=${n.id}`)}>
                    Modify Reviewer Assignments -- Paper #{n.number}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ACConsole
