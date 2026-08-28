import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Settings, UserPlus, Bell, HelpCircle, ChevronDown, X, Copy, Check } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { withCurrentSearch } from '../utils/navigation.js'

function HotjarFlame() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2C14 2 8 8 8 14C8 17.3137 9.68629 19.6863 12 21C11.3 19.5 11 17.5 12 16C13 17.5 13.5 19 13 21C13 21 18 18.5 18 14C18 12 17 10.5 17 10.5C17 10.5 16.5 13 15 14C15 14 16 11 14 8C14 8 13 10.5 12 12C12 12 11 9 12.5 7C12.5 7 10 9 10 13C10 13 9 11 9 9.5C9 9.5 7 12 7 15C7 19.4183 10.134 23 14 24C17.866 23 21 19.4183 21 15C21 9 14 2 14 2Z" fill="#FF3C00"/>
    </svg>
  )
}

export default function Header() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Viewer')
  const [inviteSent, setInviteSent] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notifItems, setNotifItems] = useState([
    { id: 'n1', text: 'New rage click detected on checkout page', time: '2 hours ago', read: false },
    { id: 'n2', text: 'Survey "Exit Intent" received 12 new responses', time: '5 hours ago', read: false },
    { id: 'n3', text: 'Heatmap for /pricing is ready to view', time: '1 day ago', read: true },
    { id: 'n4', text: 'Weekly digest: 1,240 new recordings captured', time: '2 days ago', read: true },
  ])
  const inviteRef = useRef(null)
  const notifRef = useRef(null)
  const helpRef = useRef(null)

  const activeSite = state.sites.find(s => s.id === state.activeSiteId) || state.sites[0]
  const unreadCount = notifItems.filter(n => !n.read).length

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleSiteChange(siteId) {
    dispatch({ type: 'SET_ACTIVE_SITE', payload: siteId })
    setSiteDropdownOpen(false)
  }

  function handleInvite() {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) return
    setInviteSent(true)
    setTimeout(() => {
      setInviteOpen(false)
      setInviteEmail('')
      setInviteRole('Viewer')
      setInviteSent(false)
      showToast(`Invitation sent to ${inviteEmail}`)
    }, 1200)
  }

  function markAllRead() {
    setNotifItems(prev => prev.map(n => ({ ...n, read: true })))
  }

  function markRead(id) {
    setNotifItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const helpArticles = [
    { title: 'Getting Started with Xotjar', desc: 'Learn how to install the tracking code and set up your first heatmap.' },
    { title: 'Understanding Recordings', desc: 'Watch real user sessions to identify UX issues and conversion blockers.' },
    { title: 'Creating Effective Surveys', desc: 'Best practices for designing surveys that capture actionable feedback.' },
    { title: 'Interpreting Heatmaps', desc: 'Learn to read click, move, and scroll heatmaps to optimize your pages.' },
    { title: 'Funnel Analysis', desc: 'Track where users drop off in your conversion flows.' },
  ]

  return (
    <header className="header">
      <Link to={withCurrentSearch('/', location.search)} className="header-logo">
        <HotjarFlame />
        <span className="header-logo-text">xotjar</span>
      </Link>

      <div className="site-selector" onClick={() => setSiteDropdownOpen(!siteDropdownOpen)}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="site-selector-name">{activeSite?.name}</div>
          <div className="site-selector-url">{activeSite?.url}</div>
        </div>
        <ChevronDown size={14} color="#6B7280" />

        {siteDropdownOpen && (
          <div className="site-dropdown" onClick={e => e.stopPropagation()}>
            {state.sites.map(site => (
              <div
                key={site.id}
                className={`site-dropdown-item ${site.id === state.activeSiteId ? 'active' : ''}`}
                onClick={() => handleSiteChange(site.id)}
              >
                <div style={{ fontWeight: 500, fontSize: 14 }}>{site.name}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{site.url}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="header-spacer" />

      <div className="header-actions">
        <button className="header-icon-btn" title="Settings" onClick={() => navigate(withCurrentSearch('/settings', location.search))}>
          <Settings size={18} />
        </button>
        <button className="header-icon-btn" title="Invite users" onClick={() => { setInviteOpen(true); setNotifOpen(false); setHelpOpen(false) }}>
          <UserPlus size={18} />
        </button>
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="header-icon-btn" title="Notifications" onClick={() => { setNotifOpen(!notifOpen); setHelpOpen(false) }}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-badge" />}
          </button>
          {notifOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, width: 340, background: '#FFFFFF',
              border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200,
              marginTop: 6, overflow: 'hidden'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#FF3C00', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifItems.map(n => (
                  <div key={n.id} onClick={() => markRead(n.id)} style={{
                    padding: '12px 16px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer',
                    background: n.read ? 'transparent' : '#FFF7F5'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : '#FFF7F5'}
                  >
                    <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 500 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div ref={helpRef} style={{ position: 'relative' }}>
          <button className="header-icon-btn" title="Help" onClick={() => { setHelpOpen(!helpOpen); setNotifOpen(false) }}>
            <HelpCircle size={18} />
          </button>
          {helpOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, width: 340, background: '#FFFFFF',
              border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200,
              marginTop: 6, overflow: 'hidden'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Help &amp; Resources</span>
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {helpArticles.map((a, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
                    onClick={() => { setHelpOpen(false); showToast(`Opened: ${a.title}`) }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{a.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid #E5E7EB', textAlign: 'center' }}>
                <a href="https://help.hotjar.com" target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); setHelpOpen(false); showToast('Help center opened') }}
                  style={{ fontSize: 13, color: '#FF3C00', textDecoration: 'none', fontWeight: 500 }}>
                  Visit Help Center
                </a>
              </div>
            </div>
          )}
        </div>
        <div className="user-avatar" title={state.currentUser?.name}>
          <img
            src={state.currentUser?.avatar}
            alt={state.currentUser?.name}
          />
        </div>
      </div>

      {/* Invite Modal */}
      {inviteOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setInviteOpen(false) }}>
          <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, width: 420, maxWidth: '90vw', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Invite team member</h3>
              <button onClick={() => setInviteOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }}>Email address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }}>Role</label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 14, outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
              >
                <option value="Viewer">Viewer - Can view data</option>
                <option value="Editor">Editor - Can create and edit</option>
                <option value="Admin">Admin - Full access</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setInviteOpen(false)} style={{ padding: '8px 16px', border: '1px solid #D1D5DB', borderRadius: 6, background: '#FFFFFF', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button onClick={handleInvite} disabled={inviteSent} style={{
                padding: '8px 16px', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500,
                background: inviteSent ? '#10B981' : '#FF3C00', color: '#FFFFFF',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                {inviteSent ? <><Check size={14} /> Sending...</> : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#2D3038', color: '#FFFFFF', padding: '10px 20px',
          borderRadius: 8, fontSize: 13, zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', pointerEvents: 'none'
        }}>
          {toast}
        </div>
      )}
    </header>
  )
}
