import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Plane, Bed, Car, Package, MapPin, Ship, ChevronDown, Globe, User } from 'lucide-react'
import { useApp } from '../context/AppContext'
import SandboxDialog from './SandboxDialog'
import './Header.css'

const navItems = [
  { label: 'Stays', icon: Bed, path: '/hotels', tab: 'stays' },
  { label: 'Flights', icon: Plane, path: '/flights', tab: 'flights' },
  { label: 'Cars', icon: Car, path: '/cars', tab: 'cars' },
  { label: 'Packages', icon: Package, path: '/packages', tab: 'packages' },
  { label: 'Things to Do', icon: MapPin, path: '/activities', tab: 'things' },
  { label: 'Cruises', icon: Ship, path: '/cruises', tab: 'cruises' }
]

export default function Header() {
  const { state, updateUser, updateState } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [languageDraft, setLanguageDraft] = useState(state?.user?.language || 'English')
  const menuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const user = state?.user
  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`
    : 'SJ'

  const isHome = location.pathname === '/'
  const isTransparent = isHome && !scrolled

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''} ${isTransparent ? 'header-transparent' : ''}`}>
      <div className="header-inner container">
        {/* Logo - Xpedia style with yellow dot */}
        <Link to="/" className="header-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="logo-dot">
            <circle cx="12" cy="12" r="10" fill="#FFC72C" />
            <path d="M10 8 L16 12 L10 16Z" fill="#00355F" />
          </svg>
          <span className="logo-text">xpedia</span>
        </Link>

        {/* Navigation */}
        <nav className="header-nav">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = item.path && location.pathname.startsWith(item.path)
            return (
              <button
                key={item.tab}
                className={`header-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (item.path) navigate(item.path)
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="header-right">
          <button className="header-icon-btn" title="Language" onClick={() => setLanguageOpen(true)}>
            <Globe size={18} />
          </button>

          <Link to="/trips" className="header-trips-link">
            Your trips
          </Link>

          {user && (
            <div className="one-key-badge">
              <span className="one-key-dot">&#9733;</span>
              <span className="one-key-tier">{user.oneKeyTier}</span>
            </div>
          )}

          <div
            className="header-avatar"
            ref={menuRef}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="avatar-initials">{initials}</span>
            <ChevronDown size={14} className={`avatar-chevron ${showUserMenu ? 'open' : ''}`} />
            {showUserMenu && (
              <div className="user-menu" onClick={e => e.stopPropagation()}>
                <div className="user-menu-header">
                  <div className="avatar-initials avatar-large">{initials}</div>
                  <div>
                    <div className="user-name">{user?.firstName} {user?.lastName}</div>
                    <div className="user-email">{user?.email}</div>
                    <div className="user-tier-label">
                      <span className="tier-star">&#9733;</span>
                      {user?.oneKeyTier} member
                    </div>
                  </div>
                </div>
                <div className="user-menu-divider" />
                <Link to="/account" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                  <User size={16} />
                  Account settings
                </Link>
                <Link to="/trips" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                  <Plane size={16} />
                  Your trips
                </Link>
                <div className="user-menu-divider" />
                <div className="user-menu-item loyalty">
                  <span>One Key Cash</span>
                  <strong className="one-key-cash-value">${user?.oneKeyCash?.toFixed(2)}</strong>
                </div>
                <div className="user-menu-item loyalty">
                  <span>Saved properties</span>
                  <strong>{user?.savedProperties?.length || 0}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {languageOpen && (
        <SandboxDialog
          title="Language and region"
          onClose={() => setLanguageOpen(false)}
          actions={(
            <>
              <button className="btn-secondary" onClick={() => setLanguageOpen(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={() => {
                  updateUser({ language: languageDraft })
                  updateState(prev => ({
                    ...prev,
                    preferenceChanges: [
                      ...(prev.preferenceChanges || []),
                      { field: 'language', value: languageDraft, changedAt: new Date().toISOString() }
                    ]
                  }))
                  setLanguageOpen(false)
                }}
              >
                Save
              </button>
            </>
          )}
        >
          <div style={{ display: 'grid', gap: 10 }}>
            {['English', 'English (UK)', 'Español', 'Français', 'Deutsch', '日本語'].map(language => (
              <label key={language} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="language"
                  checked={languageDraft === language}
                  onChange={() => setLanguageDraft(language)}
                />
                <span>{language}</span>
              </label>
            ))}
          </div>
        </SandboxDialog>
      )}
    </header>
  )
}
