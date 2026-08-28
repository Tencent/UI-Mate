import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Globe, LogOut } from 'lucide-react'
import './Header.css'

const LANGUAGES = ['English', 'Spanish', 'Chinese (Simplified)', 'Chinese (Traditional)', 'French', 'Portuguese', 'German']

export default function Header() {
  const { state, dispatch } = useApp()
  const user = state.currentUser

  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const langRef = useRef(null)
  const userRef = useRef(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setShowLangMenu(false)
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLanguageSelect = (lang) => {
    dispatch({ type: 'UPDATE_PATIENT_INFO', payload: { preferredLanguage: lang } })
    setShowLangMenu(false)
  }

  const handleSignOut = () => {
    setShowSignOutConfirm(false)
    dispatch({ type: 'SIGN_OUT' })
    window.location.href = '/'
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="mychart-logo">
          <span className="logo-main">MyChart</span>
          <span className="logo-sub">by Xpic</span>
        </div>
      </div>
      <div className="header-right">
        {/* Language picker */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            className="header-icon-btn"
            title={`Language: ${user.preferredLanguage || 'English'}`}
            onClick={() => setShowLangMenu(v => !v)}
          >
            <Globe size={20} color="#fff" />
          </button>
          {showLangMenu && (
            <div className="header-dropdown" style={{ right: 0, minWidth: 200 }}>
              <div className="header-dropdown-title">Select Language</div>
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  className={`header-dropdown-item ${(user.preferredLanguage || 'English') === lang ? 'header-dropdown-item--active' : ''}`}
                  onClick={() => handleLanguageSelect(lang)}
                >
                  {lang}
                  {(user.preferredLanguage || 'English') === lang && (
                    <span style={{ marginLeft: 'auto', color: 'var(--color-primary)' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User info with switch menu */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <div
            className="header-user"
            onClick={() => setShowUserMenu(v => !v)}
            style={{ cursor: 'pointer' }}
          >
            <div
              className="user-avatar"
              style={{ background: user.avatarColor }}
            >
              {user.avatarInitials}
            </div>
            <div className="user-info">
              <span className="user-name">{user.fullName}</span>
              <span className="user-switch">Switch ▼</span>
            </div>
          </div>
          {showUserMenu && (
            <div className="header-dropdown" style={{ right: 0, minWidth: 220 }}>
              <div className="header-dropdown-title">Signed in as</div>
              <div className="header-dropdown-item header-dropdown-item--active" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: user.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700 }}>
                    {user.avatarInitials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{user.fullName}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{user.email}</div>
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />
              <button
                className="header-dropdown-item"
                onClick={() => { setShowUserMenu(false); setShowSignOutConfirm(true) }}
                style={{ color: 'var(--color-danger)' }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Sign Out button */}
        <button
          className="header-icon-btn"
          title="Sign out"
          onClick={() => setShowSignOutConfirm(true)}
        >
          <LogOut size={20} color="#fff" />
        </button>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20
          }}
          onClick={() => setShowSignOutConfirm(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 8, padding: 24,
              maxWidth: 360, width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 12 }}>Sign Out</h3>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Are you sure you want to sign out of MyChart?
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn--danger"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
              <button
                className="btn btn--gray"
                onClick={() => setShowSignOutConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
