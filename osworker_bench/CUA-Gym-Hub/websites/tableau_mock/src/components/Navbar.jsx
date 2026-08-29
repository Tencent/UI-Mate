import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { state, navigate, openWorkbook } = useApp()
  const { currentUser, uiState } = state
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const userMenuRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase()
      const results = state.workbooks
        .filter(wb => wb.name.toLowerCase().includes(q) || wb.tags.some(t => t.includes(q)))
        .slice(0, 5)
        .map(wb => ({ type: 'workbook', id: wb.id, name: wb.name, project: wb.project }))
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, state.workbooks])

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'recents', label: 'Recents' },
    { id: 'shared', label: 'Shared with Me' },
  ]

  const currentPage = uiState.currentPage

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo" onClick={() => navigate('home')} title="Xableau">
          <svg width="32" height="32" viewBox="0 0 32 32">
            <rect x="14" y="2" width="4" height="8" fill="#E8762D"/>
            <rect x="14" y="22" width="4" height="8" fill="#E8762D"/>
            <rect x="2" y="14" width="8" height="4" fill="#C72037"/>
            <rect x="22" y="14" width="8" height="4" fill="#C72037"/>
            <rect x="14" y="12" width="4" height="8" fill="#5B879B"/>
            <rect x="6" y="6" width="4" height="4" fill="#5C6692"/>
            <rect x="22" y="6" width="4" height="4" fill="#5C6692"/>
            <rect x="6" y="22" width="4" height="4" fill="#5C6692"/>
            <rect x="22" y="22" width="4" height="4" fill="#5C6692"/>
            <rect x="10" y="8" width="4" height="4" fill="#1F77B4"/>
            <rect x="18" y="8" width="4" height="4" fill="#1F77B4"/>
            <rect x="10" y="20" width="4" height="4" fill="#1F77B4"/>
            <rect x="18" y="20" width="4" height="4" fill="#1F77B4"/>
            <rect x="8" y="12" width="4" height="8" fill="#6B6B6B"/>
            <rect x="20" y="12" width="4" height="8" fill="#6B6B6B"/>
          </svg>
        </div>
        <div className="navbar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`navbar-nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="navbar-center" ref={searchRef}>
        <div className={`navbar-search ${searchFocused ? 'focused' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#9CA3AF" strokeWidth="1.5"/>
            <line x1="11" y1="11" x2="14" y2="14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            placeholder="Search for views, workbooks, and more"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <svg width="14" height="14" viewBox="0 0 14 14"><line x1="3" y1="3" x2="11" y2="11" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/><line x1="11" y1="3" x2="3" y2="11" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>
        {searchFocused && searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.map(r => (
              <div key={r.id} className="search-result" onClick={() => { openWorkbook(r.id); setSearchFocused(false); setSearchQuery('') }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="#6B7280" strokeWidth="1.2"/>
                  <rect x="4" y="8" width="2" height="4" fill="#1F77B4"/>
                  <rect x="7" y="6" width="2" height="6" fill="#FF7F0E"/>
                  <rect x="10" y="4" width="2" height="8" fill="#2CA02C"/>
                </svg>
                <div className="search-result-text">
                  <div className="search-result-name">{r.name}</div>
                  <div className="search-result-meta">{r.project}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="navbar-right">
        <button className="navbar-icon-btn" onClick={() => navigate('datasources')} title="Data Sources">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <ellipse cx="9" cy="5" rx="6" ry="2.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M3 5v8c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M3 9c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
        </button>
        <button className="navbar-icon-btn" onClick={() => navigate('projects')} title="Projects">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 5h5l2-2h7v12H2V5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="navbar-icon-btn" onClick={() => navigate('admin')} title="Site Administration">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="navbar-user" ref={userMenuRef}>
          <button className="navbar-avatar" onClick={() => setUserMenuOpen(!userMenuOpen)}>
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </button>
          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-dropdown-avatar">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="user-dropdown-name">{currentUser.name}</div>
                  <div className="user-dropdown-email">{currentUser.email}</div>
                  <div className="user-dropdown-role">{currentUser.siteRole}</div>
                </div>
              </div>
              <div className="user-dropdown-divider" />
              <div className="user-dropdown-item" onClick={() => { navigate('admin'); setUserMenuOpen(false) }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2"/></svg>
                My Account
              </div>
              <div className="user-dropdown-item" onClick={() => { navigate('admin'); setUserMenuOpen(false) }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1.5v1.5M7 11v1.5M1.5 7H3M11 7h1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Site Settings
              </div>
              <div className="user-dropdown-divider" />
              <div className="user-dropdown-item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M5 7h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
