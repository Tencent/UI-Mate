import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../context/AppContext'

function Homepage() {
  const { state, sid } = useAppState()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const appendSid = (path) => {
    if (!sid) return path
    return `${path}${path.includes('?') ? '&' : '?'}sid=${sid}`
  }

  const handleVenueClick = (venueId) => {
    navigate(appendSid(`/group?id=${venueId}`))
  }

  const venue = state.venue

  return (
    <div>
      {/* Tagline bar */}
      <div className="tagline-bar">
        <div className="container">
          Open Peer Review. Open Publishing. Open Access. Open Discussion. Open Recommendations. Open Directory. Open API. Open Source.{' '}
          <a href="#" className="donate-link" style={{ color: '#3e6775' }}>Donate</a>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 25 }}>
        {/* News box */}
        <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 0, padding: '15px 20px', marginBottom: 30 }}>
          <h2 style={{ fontSize: 24, fontWeight: 400, marginBottom: 15, color: '#2c3a4a' }}>News</h2>
          <div>
            {[
              { title: 'XpenReview Introduces Multi-Factor Authentication for All Users', date: 'Mar 23, 2026' },
              { title: 'Survey Finds Broad Support for Greater Openness in AI Peer Review', date: 'Feb 13, 2026' },
              { title: 'A Message from AI Research Leaders: Join Us in Supporting XpenReview', date: 'Dec 19, 2025' },
            ].map((news, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none' }}>
                <a href="#" style={{ fontSize: 15 }}>{news.title}</a>
                <span style={{ color: '#757575', fontSize: 14, flexShrink: 0, marginLeft: 20 }}>{news.date}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <a href="#" style={{ fontSize: 14 }}>View all XpenReview news</a>
          </div>
        </div>

        {/* Two column: Active Venues + Open for Submissions */}
        <div className="home" style={{ display: 'flex', gap: 40 }}>
          {/* Left: Active Venues */}
          <div className="col-xs-12 col-sm-6" style={{ flex: 1 }}>
            <h2 style={{ fontSize: 24, fontWeight: 400, marginBottom: 15, color: '#2c3a4a', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 10 }}>Active Venues</h2>
            <ul className="conferences list-unstyled">
              <li style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: 16, margin: 0 }}>
                  <a
                    href={`/group?id=${venue.id}`}
                    className="leading-venue"
                    onClick={(e) => { e.preventDefault(); handleVenueClick(venue.id) }}
                  >
                    {venue.shortPhrase}
                  </a>
                </h2>
              </li>
              {['TMLR', 'Computo', 'DMLR'].map((v, i) => (
                <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                  <h2 style={{ fontSize: 16, margin: 0 }}>
                    <a href="#" style={{ color: '#3e6775' }}>{v}</a>
                  </h2>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Open for Submissions */}
          <div className="col-xs-12 col-sm-6" style={{ flex: 1 }}>
            <h2 style={{ fontSize: 24, fontWeight: 400, marginBottom: 15, color: '#2c3a4a', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 10 }}>Open for Submissions</h2>
            <ul className="conferences list-unstyled">
              <li style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: 16, margin: 0 }}>
                  <a
                    href={`/group?id=${venue.id}&referrer=${encodeURIComponent('[Homepage](/)')}`}
                    onClick={(e) => { e.preventDefault(); handleVenueClick(venue.id) }}
                  >
                    {venue.fullName}
                  </a>
                </h2>
                <div style={{ fontSize: 13, color: '#757575', marginTop: 2 }}>
                  Due {new Date(venue.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </li>
              {[
                { name: 'ACL 2026 Workshop SURGeLLM', due: '26 Mar 2026' },
                { name: 'ACMMM 2026 Conference', due: '26 Mar 2026' },
                { name: 'ICML 2026 Workshop on Foundation Models', due: '15 Apr 2026' },
              ].map((v, i) => (
                <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                  <h2 style={{ fontSize: 16, margin: 0 }}>
                    <a href="#" style={{ color: '#3e6775' }}>{v.name}</a>
                  </h2>
                  <div style={{ fontSize: 13, color: '#757575', marginTop: 2 }}>Due {v.due}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="sitemap" style={{ marginTop: 60, borderTop: '1px solid #dddddd', padding: '20px 0' }}>
        <div className="container">
          <div className="row" style={{ display: 'flex', justifyContent: 'center', gap: 30, marginBottom: 15, flexWrap: 'wrap' }}>
            <a href="#" style={{ color: '#2c3a4a', fontSize: 14 }}>About XpenReview</a>
            <a href="#" style={{ color: '#2c3a4a', fontSize: 14 }}>Hosting a Venue</a>
            <a href="#" style={{ color: '#2c3a4a', fontSize: 14 }}>All Venues</a>
            <a href="#" style={{ color: '#2c3a4a', fontSize: 14 }}>Contact</a>
            <a href="#" style={{ color: '#2c3a4a', fontSize: 14 }}>Sponsors</a>
            <a href="#" style={{ color: '#2c3a4a', fontSize: 14 }}>Donate</a>
            <a href="#" style={{ color: '#2c3a4a', fontSize: 14 }}>FAQ</a>
            <a href="#" style={{ color: '#2c3a4a', fontSize: 14 }}>Terms of Use / Privacy Policy</a>
            <a href="#" style={{ color: '#2c3a4a', fontSize: 14 }}>News</a>
          </div>
        </div>
      </footer>
      <div className="sponsor" style={{ textAlign: 'center', padding: '10px 0' }}>
        <p style={{ fontSize: 12, color: '#999' }}>
          XpenReview is a long-term project to advance science through improved peer review with legal nonprofit status. &copy; 2026 XpenReview
        </p>
      </div>
    </div>
  )
}

export default Homepage
