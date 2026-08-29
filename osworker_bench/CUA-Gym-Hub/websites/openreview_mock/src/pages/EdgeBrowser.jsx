import React, { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppState } from '../context/AppContext'
import { getNoteTitle, getNoteAuthors, getProfileDisplayInfo, getInvitationShortName } from '../utils/dataManager'

function EdgeBrowser() {
  const [searchParams] = useSearchParams()
  const { state, updateState, sid } = useAppState()
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [paperSearch, setPaperSearch] = useState('')
  const [reviewerSearch, setReviewerSearch] = useState('')
  const [columnSort, setColumnSort] = useState('default')
  const [hideQuotaReached, setHideQuotaReached] = useState(false)
  const [inviteSearch, setInviteSearch] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')

  const venueId = state.venue.id

  const appendSid = (path) => {
    if (!sid) return path
    return `${path}${path.includes('?') ? '&' : '?'}sid=${sid}`
  }

  // All submission notes
  const allNotes = useMemo(() => {
    return Object.values(state.notes).filter(n => n.replyto === null).sort((a, b) => a.number - b.number)
  }, [state.notes])

  // Current reviewer pool (members of the Reviewers group)
  const reviewerGroup = state.groups[`${venueId}/Reviewers`]
  const reviewerProfileIds = reviewerGroup?.members || []
  const reviewerProfiles = reviewerProfileIds.map(pid => state.profiles[pid]).filter(Boolean)

  // Edge invitation IDs
  const assignmentInvitation = `${venueId}/Reviewers/-/Assignment`
  const affinityInvitation = `${venueId}/Reviewers/-/Affinity_Score`
  const bidInvitation = `${venueId}/Reviewers/-/Bid`
  const conflictInvitation = `${venueId}/Reviewers/-/Conflict`

  const getEdgesForNote = (noteId) => state.edges.filter(e => e.head === noteId && !e.ddate)
  const getAssignmentCount = (noteId) => state.edges.filter(e => e.invitation === assignmentInvitation && e.head === noteId && !e.ddate).length
  const getReviewerLoad = (profileId) => state.edges.filter(e => e.invitation === assignmentInvitation && e.tail === profileId && !e.ddate).length

  // Filter papers
  const filteredNotes = useMemo(() => {
    if (!paperSearch.trim()) return allNotes
    const q = paperSearch.toLowerCase()
    return allNotes.filter(n => {
      const title = getNoteTitle(n).toLowerCase()
      return title.includes(q) || `#${n.number}`.includes(q)
    })
  }, [allNotes, paperSearch])

  // Get reviewer data for selected paper
  const getReviewerDataForNote = (noteId) => {
    const noteEdges = getEdgesForNote(noteId)
    return reviewerProfiles.map(profile => {
      const pid = profile.id
      const info = getProfileDisplayInfo(profile)
      const assignmentEdge = noteEdges.find(e => e.invitation === assignmentInvitation && e.tail === pid)
      const affinityEdge = noteEdges.find(e => e.invitation === affinityInvitation && e.tail === pid)
      const bidEdge = noteEdges.find(e => e.invitation === bidInvitation && e.tail === pid)
      const conflictEdge = noteEdges.find(e => e.invitation === conflictInvitation && e.tail === pid)
      const currentLoad = getReviewerLoad(pid)
      // Check per-reviewer custom max (from edgeBrowserConfig.customMaxPapers)
      const customMax = state.edgeBrowserConfig?.customMaxPapers?.[pid]
      const maxLoad = customMax !== undefined ? customMax : (state.edgeBrowserConfig?.maxPapersPerReviewer || 5)
      return {
        profile, info, assignmentEdge, affinityEdge, bidEdge, conflictEdge,
        isAssigned: !!assignmentEdge, hasConflict: !!conflictEdge,
        currentLoad, maxLoad, totalAssignments: currentLoad,
      }
    })
  }

  // Filter and sort reviewers
  const getFilteredReviewers = (noteId) => {
    let reviewers = getReviewerDataForNote(noteId)
    if (reviewerSearch.trim()) {
      const q = reviewerSearch.toLowerCase()
      reviewers = reviewers.filter(r =>
        r.info.name.toLowerCase().includes(q) ||
        r.info.email.toLowerCase().includes(q) ||
        r.info.expertise.some(k => k.toLowerCase().includes(q))
      )
    }
    if (hideQuotaReached) {
      reviewers = reviewers.filter(r => r.currentLoad < r.maxLoad)
    }
    if (columnSort === affinityInvitation) {
      reviewers.sort((a, b) => (b.affinityEdge?.weight || 0) - (a.affinityEdge?.weight || 0))
    } else if (columnSort === bidInvitation) {
      const bidOrder = { 'Very High': 5, 'High': 4, 'Neutral': 3, 'Low': 2, 'Very Low': 1 }
      reviewers.sort((a, b) => (bidOrder[b.bidEdge?.label] || 0) - (bidOrder[a.bidEdge?.label] || 0))
    } else {
      reviewers.sort((a, b) => (b.isAssigned ? 1 : 0) - (a.isAssigned ? 1 : 0))
    }
    return reviewers
  }

  const handleAssign = (noteId, profileId) => {
    updateState(prev => ({
      ...prev,
      edges: [...prev.edges, {
        id: `edge_asgn_${Date.now()}`,
        invitation: assignmentInvitation,
        head: noteId, tail: profileId,
        label: null, weight: null,
        readers: [venueId], writers: [venueId], nonreaders: [], signatures: [venueId],
        cdate: Date.now(), tcdate: Date.now(), mdate: Date.now(), tmdate: Date.now(), ddate: null,
      }],
    }))
  }

  const handleUnassign = (noteId, profileId) => {
    updateState(prev => ({
      ...prev,
      edges: prev.edges.map(e =>
        (e.invitation === assignmentInvitation && e.head === noteId && e.tail === profileId && !e.ddate)
          ? { ...e, ddate: Date.now() } : e
      ),
    }))
  }

  // =====================================================
  // INVITE REVIEWER — search profiles not yet in the pool
  // =====================================================
  const inviteSearchResults = useMemo(() => {
    if (!inviteSearch.trim() || inviteSearch.trim().length < 2) return []
    const q = inviteSearch.toLowerCase()
    return Object.values(state.profiles)
      .filter(p => {
        // Skip profiles already in reviewer pool
        if (reviewerProfileIds.includes(p.id)) return false
        // Skip the AC themselves
        if (p.id === state.user?.id) return false
        const info = getProfileDisplayInfo(p)
        return info.name.toLowerCase().includes(q) || info.email.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
      })
      .slice(0, 10)
  }, [inviteSearch, state.profiles, reviewerProfileIds, state.user?.id])

  const handleInviteReviewer = (profileId) => {
    const profile = state.profiles[profileId]
    if (!profile) return

    updateState(prev => {
      // 1. Add to Reviewers group
      const reviewerGroupId = `${venueId}/Reviewers`
      const updatedGroups = { ...prev.groups }
      if (updatedGroups[reviewerGroupId]) {
        updatedGroups[reviewerGroupId] = {
          ...updatedGroups[reviewerGroupId],
          members: [...(updatedGroups[reviewerGroupId].members || []), profileId],
        }
      }

      // 2. Auto-generate affinity scores for all papers
      const newEdges = [...prev.edges]
      const profileInfo = getProfileDisplayInfo(profile)
      const profileKeywords = new Set(profileInfo.expertise.map(k => k.toLowerCase()))

      Object.values(prev.notes).filter(n => n.replyto === null).forEach(note => {
        // Compute affinity from keyword overlap
        const paperKeywords = (note.content?.keywords?.value || []).map(k => k.toLowerCase())
        const abstractWords = (note.content?.abstract?.value || '').toLowerCase()
        let overlap = 0
        profileKeywords.forEach(kw => {
          if (paperKeywords.some(pk => pk.includes(kw) || kw.includes(pk))) overlap += 2
          else if (abstractWords.includes(kw)) overlap += 1
        })
        const affinity = Math.min(0.99, Math.max(0.1, overlap / (profileKeywords.size * 2 + 0.01)))
        const roundedAffinity = Math.round(affinity * 1000) / 1000

        newEdges.push({
          id: `affinity_${profileId}_${note.id}`,
          invitation: `${venueId}/Reviewers/-/Affinity_Score`,
          head: note.id, tail: profileId,
          weight: roundedAffinity, label: null,
          readers: [venueId], writers: [venueId], signatures: [venueId],
          cdate: Date.now(), ddate: null,
        })

        // 3. Auto-detect conflicts (same institution as any author)
        const authorIds = note.content?.authorids?.value || []
        for (const aid of authorIds) {
          const authorProfile = prev.profiles[aid]
          if (!authorProfile) continue
          const authorInst = authorProfile.content?.history?.[0]?.institution?.domain || ''
          const reviewerInst = profile.content?.history?.[0]?.institution?.domain || ''
          if (authorInst && reviewerInst && authorInst === reviewerInst) {
            newEdges.push({
              id: `conflict_${profileId}_${note.id}`,
              invitation: `${venueId}/Reviewers/-/Conflict`,
              head: note.id, tail: profileId,
              weight: null, label: `Same institution (${authorInst})`,
              readers: [venueId], writers: [venueId], signatures: [venueId],
              cdate: Date.now(), ddate: null,
            })
            break
          }
          // Check if reviewer is an author on this paper
          if (authorIds.includes(profileId)) {
            newEdges.push({
              id: `conflict_${profileId}_${note.id}_author`,
              invitation: `${venueId}/Reviewers/-/Conflict`,
              head: note.id, tail: profileId,
              weight: null, label: 'Is an author',
              readers: [venueId], writers: [venueId], signatures: [venueId],
              cdate: Date.now(), ddate: null,
            })
            break
          }
        }

        // Check knownConflicts (DBLP co-authorship, grant co-PIs, etc.)
        const knownConflicts = prev.knownConflicts || []
        for (const kc of knownConflicts) {
          if (kc.reviewer === profileId && authorIds.includes(kc.author)) {
            // Check if we already added a conflict for this paper
            const alreadyHas = newEdges.some(e => e.invitation === `${venueId}/Reviewers/-/Conflict` && e.head === note.id && e.tail === profileId)
            if (!alreadyHas) {
              newEdges.push({
                id: `conflict_${profileId}_${note.id}_known`,
                invitation: `${venueId}/Reviewers/-/Conflict`,
                head: note.id, tail: profileId,
                weight: null, label: kc.reason,
                readers: [venueId], writers: [venueId], signatures: [venueId],
                cdate: Date.now(), ddate: null,
              })
            }
          }
        }
      })

      return { ...prev, groups: updatedGroups, edges: newEdges }
    })

    setInviteMessage(`${getProfileDisplayInfo(profile).name} has been added to the reviewer pool.`)
    setInviteSearch('')
    setTimeout(() => setInviteMessage(''), 3000)
  }

  const selectedNote = selectedNoteId ? state.notes[selectedNoteId] : null

  return (
    <div>
      <div className="explore-header">
        <div className="container">
          <h1 id="matching-title" style={{ fontSize: '1.5rem', margin: '10px 0' }}>
            Reviewer Assignment — {state.venue.shortPhrase}
          </h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        {/* Invite Reviewer Section */}
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-heading">
            <strong>Invite Reviewer</strong>
            <span style={{ fontWeight: 'normal', color: '#616161', marginLeft: 8, fontSize: '0.8rem' }}>
              Search by name or email to add a reviewer to the pool
            </span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Enter a valid email address or profile ID..."
                value={inviteSearch}
                onChange={e => setInviteSearch(e.target.value)}
                style={{ maxWidth: 400 }}
              />
              <span style={{ fontSize: 13, color: '#616161' }}>
                {reviewerProfileIds.length} reviewer{reviewerProfileIds.length !== 1 ? 's' : ''} in pool
              </span>
            </div>
            {inviteMessage && (
              <div className="alert alert-success" style={{ marginTop: 8, marginBottom: 0, padding: '6px 12px' }}>
                {inviteMessage}
              </div>
            )}
            {inviteSearchResults.length > 0 && (
              <div style={{ border: '1px solid #eee', marginTop: 8, maxHeight: 250, overflowY: 'auto' }}>
                {inviteSearchResults.map(profile => {
                  const info = getProfileDisplayInfo(profile)
                  return (
                    <div key={profile.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
                      <div>
                        <strong style={{ color: '#2c3a4a' }}>{info.name}</strong>
                        <span style={{ color: '#616161', marginLeft: 8, fontSize: 13 }}>{info.email}</span>
                        <div style={{ fontSize: 12, color: '#757575' }}>{info.title}</div>
                      </div>
                      <button
                        className="btn btn-xs btn-primary"
                        style={{ minWidth: 'auto' }}
                        onClick={() => handleInviteReviewer(profile.id)}
                      >
                        Invite
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            {inviteSearch.trim().length >= 2 && inviteSearchResults.length === 0 && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#757575' }}>No matching profiles found.</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {/* Left column: Papers */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="column">
              <div className="column-header">
                <strong>Submissions ({filteredNotes.length})</strong>
                <input type="search" placeholder="Search papers..." value={paperSearch} onChange={e => setPaperSearch(e.target.value)} />
              </div>
              <div className="column-body">
                {filteredNotes.map(note => {
                  const assignCount = getAssignmentCount(note.id)
                  const isSelected = selectedNoteId === note.id
                  return (
                    <li key={note.id} className={`entry entry-note${assignCount > 0 ? ' is-assigned' : ''}${isSelected ? ' is-selected' : ''}`} onClick={() => setSelectedNoteId(note.id)}>
                      <div className="note-heading">
                        <h3>
                          <a href={appendSid(`/forum?id=${note.id}`)} onClick={e => e.stopPropagation()}>{getNoteTitle(note)}</a>
                          {' '}<span style={{ color: '#616161', fontWeight: 'normal' }}>(#{note.number})</span>
                        </h3>
                        <div style={{ fontSize: 12, color: '#616161', marginTop: 2 }}>
                          {getNoteAuthors(note).slice(0, 3).join(', ')}{getNoteAuthors(note).length > 3 ? '...' : ''}
                        </div>
                      </div>
                      <div className="action-links">
                        <a className="show-assignments" onClick={e => { e.stopPropagation(); setSelectedNoteId(note.id) }}>
                          Assignments ({assignCount}) &raquo;
                        </a>
                      </div>
                    </li>
                  )
                })}
                {filteredNotes.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#757575' }}>No papers found.</div>}
              </div>
            </div>
          </div>

          {/* Right column: Reviewers */}
          {selectedNote && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="column">
                <div className="column-header">
                  <strong>Reviewers for Paper #{selectedNote.number}</strong>
                  <input type="search" placeholder="Search reviewers by name, email, or expertise..." value={reviewerSearch} onChange={e => setReviewerSearch(e.target.value)} />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
                    <label style={{ fontSize: 12 }}>Order By:</label>
                    <select value={columnSort} onChange={e => setColumnSort(e.target.value)} style={{ fontSize: 12, padding: '2px 4px' }}>
                      <option value="default">Assignment</option>
                      <option value={affinityInvitation}>Affinity Score</option>
                      <option value={bidInvitation}>Bid</option>
                    </select>
                    <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="checkbox" checked={hideQuotaReached} onChange={e => setHideQuotaReached(e.target.checked)} />
                      Only show reviewers with fewer than max assigned papers
                    </label>
                  </div>
                </div>
                <div className="column-body">
                  {reviewerProfiles.length === 0 && (
                    <div style={{ padding: 20, textAlign: 'center', color: '#757575' }}>
                      No reviewers in pool yet. Use "Invite Reviewer" above to add reviewers.
                    </div>
                  )}
                  {getFilteredReviewers(selectedNote.id).map(({ profile, info, assignmentEdge, affinityEdge, bidEdge, conflictEdge, isAssigned, hasConflict, currentLoad, maxLoad }) => (
                    <li key={profile.id} className={`entry entry-reviewer${isAssigned ? ' is-assigned' : ''}${hasConflict ? ' has-conflict' : ''}`}>
                      <div className="reviewer-heading">
                        <h3><a href={appendSid(`/profile?id=${profile.id}`)}>{info.name}</a></h3>
                        <p style={{ fontSize: 12, color: '#616161', margin: '2px 0' }}>{info.title}</p>
                      </div>

                      <div className="edit-controls full-width">
                        <label style={{ fontSize: 12, color: '#616161' }}>Assignment:</label>
                        {hasConflict ? (
                          <span style={{ color: '#d9534f', fontWeight: 600, fontSize: 12, marginLeft: 4 }}>Conflict — {conflictEdge?.label || 'Yes'}</span>
                        ) : isAssigned ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                            <span style={{ color: '#5cb85c', fontWeight: 600, fontSize: 12 }}>Assigned</span>
                            <button onClick={() => handleUnassign(selectedNote.id, profile.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d9534f', fontSize: 14, padding: 0 }} title="Remove assignment">🗑</button>
                          </span>
                        ) : (
                          <button className="btn btn-xs btn-default" style={{ minWidth: 'auto', fontSize: 11, padding: '1px 8px', marginLeft: 4 }} onClick={() => handleAssign(selectedNote.id, profile.id)} disabled={currentLoad >= maxLoad}>
                            Assign
                          </button>
                        )}
                      </div>

                      <div className="scores-list">
                        <ul className="list-unstyled" style={{ fontSize: 12, color: '#616161', margin: '4px 0' }}>
                          {affinityEdge && <li>Affinity Score: <strong>{affinityEdge.weight?.toFixed(3)}</strong></li>}
                          {bidEdge && <li>Bid: <strong>{bidEdge.label}</strong></li>}
                          {conflictEdge && <li style={{ color: '#d9534f' }}>Conflict: {conflictEdge.label}</li>}
                          <li>Load: <strong>{currentLoad}/{maxLoad}</strong></li>
                        </ul>
                      </div>

                      <div className="action-links">
                        <span style={{ fontSize: 12, color: '#3e6775' }}>Assignments ({currentLoad}) &raquo;</span>
                      </div>
                    </li>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EdgeBrowser
