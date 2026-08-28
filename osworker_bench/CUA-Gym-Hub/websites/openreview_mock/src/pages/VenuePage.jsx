import React, { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppState } from '../context/AppContext'
import { getNoteTitle, getNoteAuthors, getNoteAuthorIds } from '../utils/dataManager'

function VenuePage() {
  const [searchParams] = useSearchParams()
  const venueId = searchParams.get('id')
  const { state, sid } = useAppState()
  const [activeTab, setActiveTab] = useState('submissions')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState('number')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const perPage = 10

  const appendSid = (path) => {
    if (!sid) return path
    return `${path}${path.includes('?') ? '&' : '?'}sid=${sid}`
  }

  const venue = state.venue
  const allNotes = useMemo(() => {
    return Object.values(state.notes).filter(n => n.replyto === null).sort((a, b) => a.number - b.number)
  }, [state.notes])

  const filteredPapers = useMemo(() => {
    let papers = [...allNotes]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      papers = papers.filter(p => {
        const title = getNoteTitle(p).toLowerCase()
        const authors = getNoteAuthors(p).join(' ').toLowerCase()
        const keywords = (p.content?.keywords?.value || []).join(' ').toLowerCase()
        return title.includes(q) || authors.includes(q) || keywords.includes(q)
      })
    }
    papers.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'number') cmp = a.number - b.number
      else if (sortBy === 'title') cmp = getNoteTitle(a).localeCompare(getNoteTitle(b))
      else if (sortBy === 'date') cmp = a.cdate - b.cdate
      return sortDir === 'desc' ? -cmp : cmp
    })
    return papers
  }, [allNotes, searchQuery, sortBy, sortDir])

  const totalPages = Math.ceil(filteredPapers.length / perPage)
  const pagedPapers = filteredPapers.slice((page - 1) * perPage, page * perPage)

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  // Find AC/reviewer assignments for user
  const acAssignmentInv = `${venue.id}/Area_Chairs/-/Assignment`
  const revAssignmentInv = `${venue.id}/Reviewers/-/Assignment`
  const myACPaperCount = state.edges.filter(e => e.invitation === acAssignmentInv && e.tail === state.user.id && !e.ddate).length
  const myRevPaperCount = state.edges.filter(e => e.invitation === revAssignmentInv && e.tail === state.user.id && !e.ddate).length

  return (
    <div>
      <div className="container" style={{ paddingTop: 20 }}>
        <div className="page-header">
          <h1 className="venue-title">{venue.fullName || venue.shortPhrase}</h1>
          <p style={{ fontSize: 13, color: '#999' }}>
            <a href={venue.website} target="_blank" rel="noopener noreferrer">{venue.website}</a>
            {' '}&nbsp;|&nbsp;{' '}
            Submission Deadline: {venue.dates?.submission} &nbsp;|&nbsp;
            Review Period: {venue.dates?.review} &nbsp;|&nbsp;
            Decisions: {venue.dates?.decision}
          </p>
        </div>

        <div className="tabs-container">
          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation" className={activeTab === 'consoles' ? 'active' : ''}>
              <a href="#consoles" role="tab" onClick={e => { e.preventDefault(); setActiveTab('consoles') }}>Your Consoles</a>
            </li>
            <li role="presentation" className={activeTab === 'authors' ? 'active' : ''}>
              <a href="#authors" role="tab" onClick={e => { e.preventDefault(); setActiveTab('authors') }}>Authors</a>
            </li>
            <li role="presentation" className={activeTab === 'submissions' ? 'active' : ''}>
              <a href="#submissions" role="tab" onClick={e => { e.preventDefault(); setActiveTab('submissions') }}>
                All Submissions
                <span className="badge" style={{ marginLeft: 6, backgroundColor: '#777', color: '#fff' }}>{allNotes.length}</span>
              </a>
            </li>
          </ul>
        </div>

        {activeTab === 'consoles' && (
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 15 }}>Your Console Links</h3>
            {(state.user.role === 'area_chair' || state.user.role === 'program_chair') && (
              <div className="panel">
                <div className="panel-heading">Area Chair Console</div>
                <div className="panel-body">
                  <p>You are assigned as Area Chair for <strong>{myACPaperCount}</strong> papers.</p>
                  <Link to={appendSid('/console/area-chairs')} className="btn btn-primary" style={{ marginTop: 8 }}>
                    Go to AC Console
                  </Link>
                </div>
              </div>
            )}
            <div className="panel">
              <div className="panel-heading">Reviewer Console</div>
              <div className="panel-body">
                <p>You have <strong>{myRevPaperCount}</strong> papers assigned for review.</p>
                <Link to={appendSid('/console/reviewers')} className="btn btn-primary" style={{ marginTop: 8 }}>
                  Go to Reviewer Console
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'authors' && (
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 15 }}>Author Information</h3>
            <div className="well">
              <p>Papers can be submitted via the XpenReview submission portal. Please ensure your paper follows the conference formatting guidelines before submission.</p>
              <p style={{ marginTop: 8 }}>
                <strong>Submission deadline:</strong> {new Date(venue.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div>
            <div className="flex-between" style={{ marginBottom: 15 }}>
              <div style={{ flex: 1, maxWidth: 400 }}>
                <form className="form-inline notes-search-form" role="search">
                  <div className="form-group search-content has-feedback">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search submissions..."
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setPage(1) }}
                    />
                  </div>
                </form>
              </div>
              <div className="sort-controls">
                Sort by:
                <button className={sortBy === 'number' ? 'active' : ''} onClick={() => handleSort('number')}>
                  # {sortBy === 'number' ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
                </button>
                <button className={sortBy === 'title' ? 'active' : ''} onClick={() => handleSort('title')}>
                  Title {sortBy === 'title' ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
                </button>
                <button className={sortBy === 'date' ? 'active' : ''} onClick={() => handleSort('date')}>
                  Date {sortBy === 'date' ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : ''}
                </button>
              </div>
            </div>

            <ul className="list-unstyled submissions-list">
              {pagedPapers.map(note => {
                const title = getNoteTitle(note)
                const authors = getNoteAuthors(note)
                const authorIds = getNoteAuthorIds(note)
                const keywords = note.content?.keywords?.value || []
                return (
                  <li key={note.id}>
                    <div className="note">
                      <h4>
                        <Link to={appendSid(`/forum?id=${note.id}`)}>{title}</Link>
                      </h4>
                      <div className="note-authors" style={{ fontSize: 13, color: '#616161', marginBottom: 4 }}>
                        {authors.map((name, i) => (
                          <span key={i}>
                            {i > 0 && ', '}
                            {authorIds[i] ? (
                              <Link to={appendSid(`/profile?id=${authorIds[i]}`)} style={{ color: '#616161' }}>{name}</Link>
                            ) : name}
                          </span>
                        ))}
                      </div>
                      <ul className="note-meta-info list-inline" style={{ display: 'flex', gap: 12, listStyle: 'none', padding: 0, fontSize: 12, color: '#757575' }}>
                        <li>{new Date(note.cdate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</li>
                        <li>{note.content?.venue?.value || state.venue.shortPhrase}</li>
                        <li className="readers">Readers: {note.readers?.includes('everyone') ? 'Everyone' : 'Limited'}</li>
                      </ul>
                      {keywords.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                          {keywords.map(kw => (
                            <span key={kw} className="keyword-badge">{kw}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
              {pagedPapers.length === 0 && (
                <li>
                  <p className="empty-message text-center text-muted" style={{ padding: 40 }}>
                    No papers match your search.
                  </p>
                </li>
              )}
            </ul>

            {totalPages > 1 && (
              <ul className="pagination">
                <li className={page <= 1 ? 'disabled' : ''}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))}>&laquo;</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i + 1} className={page === i + 1 ? 'active' : ''}>
                    <button onClick={() => setPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={page >= totalPages ? 'disabled' : ''}>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}>&raquo;</button>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VenuePage
