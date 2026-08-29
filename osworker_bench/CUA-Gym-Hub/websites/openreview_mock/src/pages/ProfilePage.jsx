import React, { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppState } from '../context/AppContext'
import { getProfileDisplayInfo, getNoteTitle, getNoteAuthors, getNoteAuthorIds } from '../utils/dataManager'

function ProfilePage() {
  const [searchParams] = useSearchParams()
  const profileId = searchParams.get('id') || searchParams.get('email')
  const { state, sid } = useAppState()

  const appendSid = (path) => {
    if (!sid) return path
    return `${path}${path.includes('?') ? '&' : '?'}sid=${sid}`
  }

  // Find profile by ID or email
  const profile = useMemo(() => {
    if (!profileId) return null
    // Direct ID match
    if (state.profiles[profileId]) return state.profiles[profileId]
    // Search by email
    return Object.values(state.profiles).find(p =>
      p.content?.emails?.includes(profileId) || p.content?.preferredEmail === profileId
    ) || null
  }, [profileId, state.profiles])

  if (!profile) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="alert alert-warning">User profile not found.</div>
      </div>
    )
  }

  const info = getProfileDisplayInfo(profile)
  const nameObj = profile.content?.names?.[0] || {}
  const initials = (nameObj.first?.[0] || '') + (nameObj.last?.[0] || '')

  // Find papers authored by this profile
  const userPapers = useMemo(() => {
    return Object.values(state.notes).filter(n => {
      const authorIds = n.content?.authorids?.value || []
      return authorIds.includes(profile.id) && n.replyto === null
    })
  }, [state.notes, profile.id])

  const history = profile.content?.history || []
  const expertise = info.expertise

  return (
    <div>
      <div className="container" style={{ paddingTop: 20, maxWidth: 800, margin: '0 auto' }}>
        <div className="profile-header">
          <div className="profile-avatar">{initials.toUpperCase()}</div>
          <div className="profile-info">
            <h2>{info.name}</h2>
            {info.title && <p>{info.title}</p>}
            <p>{info.email}</p>
            {profile.content?.homepage && (
              <p>
                <a href={profile.content.homepage} target="_blank" rel="noopener noreferrer">{profile.content.homepage}</a>
              </p>
            )}
          </div>
        </div>

        {expertise.length > 0 && (
          <div style={{ marginBottom: 25 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Expertise</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {expertise.map(kw => (
                <span key={kw} className="keyword-badge">{kw}</span>
              ))}
            </div>
          </div>
        )}

        {profile.content?.dblp && (
          <div style={{ marginBottom: 25 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>External Profiles</h3>
            <p>
              <a href={profile.content.dblp} target="_blank" rel="noopener noreferrer">DBLP Profile</a>
            </p>
          </div>
        )}

        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
            Recent Publications ({userPapers.length})
          </h3>
          {userPapers.length === 0 && (
            <div className="well text-center text-muted">No publications found.</div>
          )}
          <ul className="list-unstyled submissions-list">
            {userPapers.map(note => {
              const title = getNoteTitle(note)
              const authors = getNoteAuthors(note)
              return (
                <li key={note.id}>
                  <div className="note">
                    <h4>
                      <Link to={appendSid(`/forum?id=${note.id}`)}>{title}</Link>
                    </h4>
                    <div className="note-authors" style={{ fontSize: 13, color: '#616161', marginBottom: 4 }}>
                      {authors.join(', ')}
                    </div>
                    <ul className="note-meta-info list-inline" style={{ display: 'flex', gap: 12, listStyle: 'none', padding: 0, fontSize: 12, color: '#757575' }}>
                      <li>{note.content?.venue?.value || ''}</li>
                    </ul>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
