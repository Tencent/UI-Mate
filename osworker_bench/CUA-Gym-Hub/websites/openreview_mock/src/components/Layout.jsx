import React, { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAppState } from '../context/AppContext'
import { getProfileDisplayInfo } from '../utils/dataManager'

function Layout() {
  const { state, sid } = useAppState()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)
  const location = useLocation()

  const appendSid = (path) => {
    if (!sid) return path
    return `${path}${path.includes('?') ? '&' : '?'}sid=${sid}`
  }

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const userProfile = state?.profiles?.[state?.user?.id]
  const userInfo = userProfile ? getProfileDisplayInfo(userProfile) : null
  const userName = userInfo?.name || state?.user?.id || 'User'
  const isHomepage = location.pathname === '/' || location.pathname === ''

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-inverse" role="navigation">
        <div className="container">
          {/* Logo */}
          <div className="navbar-header">
            <Link to={appendSid('/')} className="navbar-brand home push-link">
              <span style={{ fontWeight: 400, fontSize: '1.375rem', color: '#b8b8b8' }}>Open</span>
              <span style={{ fontWeight: 700, fontSize: '1.375rem', color: '#fff' }}>Review</span>
              <span style={{ fontWeight: 400, fontSize: '1.375rem', color: '#b8b8b8' }}>.net</span>
            </Link>
          </div>

          <div id="navbar" className="navbar-collapse collapse" style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
            {/* Search */}
            <form className="navbar-form navbar-left profile-search" style={{ flex: 1, maxWidth: 380, margin: '0 30px' }}>
              <div className="navbar-search">
                <input
                  type="text"
                  placeholder="Search XpenReview..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Nav links */}
            <ul className="navbar-nav">
              {state?.user?.role === 'area_chair' && (
                <li><Link to={appendSid('/console/area-chairs')}>Tasks</Link></li>
              )}
              <li ref={dropdownRef} id="user-menu" className="dropdown">
                <button
                  className="nav-link"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {userName} &#9662;
                </button>
                <div className={`dropdown-menu${dropdownOpen ? ' show' : ''}`}>
                  <div className="dropdown-header">{userName}</div>
                  <div className="dropdown-divider" />
                  <Link to={appendSid(`/profile?id=${state?.user?.id}`)} onClick={() => setDropdownOpen(false)}>Profile</Link>
                  <Link to={appendSid('/console/area-chairs')} onClick={() => setDropdownOpen(false)}>Area Chair Console</Link>
                  <Link to={appendSid('/console/reviewers')} onClick={() => setDropdownOpen(false)}>Reviewer Console</Link>
                  <div className="dropdown-divider" />
                  <button onClick={() => setDropdownOpen(false)}>Logout</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Back to Homepage breadcrumb (on non-homepage pages) */}
      {!isHomepage && (
        <div style={{ background: '#fffdfa', borderBottom: '1px solid rgba(0,0,0,0.1)', padding: '8px 0' }}>
          <div className="container">
            <Link to={appendSid('/')} style={{ fontSize: 14 }}>&larr; Back to Homepage</Link>
          </div>
        </div>
      )}

      <div id="content" style={{ minHeight: 'calc(100vh - 50px)' }}>
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
