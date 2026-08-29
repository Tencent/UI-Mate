import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Plus, ChevronDown, Search, Bell, HelpCircle, Settings, Sparkles, Users, X, Command } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './TopBar.css'

export default function TopBar({ onToggleSidebar }) {
  const { state } = useApp()
  const navigate = useNavigate()
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [inviteDismissed, setInviteDismissed] = useState(false)
  const [showRecentMenu, setShowRecentMenu] = useState(false)
  const [showFavoritesMenu, setShowFavoritesMenu] = useState(false)
  const [showSpacesMenu, setShowSpacesMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const recentCharts = [...state.charts].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5)
  const recentDashboards = [...state.dashboards].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3)

  const searchResults = searchQuery.trim() ? {
    charts: state.charts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())),
    dashboards: state.dashboards.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())),
    cohorts: state.cohorts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())),
  } : {
    charts: state.charts,
    dashboards: state.dashboards,
    cohorts: [],
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn topbar-hamburger" onClick={onToggleSidebar} title="Toggle sidebar">
          <Menu size={20} />
        </button>
        <div className="topbar-create-wrap">
          <button
            className="btn-primary topbar-create"
            onClick={() => setShowCreateMenu(!showCreateMenu)}
          >
            <Plus size={15} /> Create
          </button>
          {showCreateMenu && (
            <>
              <div className="overlay" onClick={() => setShowCreateMenu(false)} />
              <div className="dropdown topbar-create-dropdown">
                <div className="dropdown-label">Chart</div>
                <button className="dropdown-item" onClick={() => { navigate('/chart/new?type=segmentation'); setShowCreateMenu(false) }}>
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>S</span> Event Segmentation
                </button>
                <button className="dropdown-item" onClick={() => { navigate('/chart/new?type=funnel'); setShowCreateMenu(false) }}>
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>F</span> Funnel Analysis
                </button>
                <button className="dropdown-item" onClick={() => { navigate('/chart/new?type=retention'); setShowCreateMenu(false) }}>
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>R</span> Retention
                </button>
                <button className="dropdown-item" onClick={() => { navigate('/paths'); setShowCreateMenu(false) }}>
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>P</span> User Paths
                </button>
                <div className="dropdown-divider" />
                <div className="dropdown-label">Other</div>
                <button className="dropdown-item" onClick={() => { navigate('/dashboard/new'); setShowCreateMenu(false) }}>
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>D</span> Dashboard
                </button>
                <button className="dropdown-item" onClick={() => { navigate('/notebooks/new'); setShowCreateMenu(false) }}>
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>N</span> Notebook
                </button>
                <button className="dropdown-item" onClick={() => { navigate('/cohorts/new'); setShowCreateMenu(false) }}>
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>C</span> Cohort
                </button>
              </div>
            </>
          )}
        </div>
        <div className="topbar-nav">
          <div style={{ position: 'relative' }}>
            <button className="topbar-nav-btn" onClick={() => { setShowRecentMenu(!showRecentMenu); setShowFavoritesMenu(false); setShowSpacesMenu(false) }}>Recent <ChevronDown size={14} /></button>
            {showRecentMenu && (
              <>
                <div className="overlay" onClick={() => setShowRecentMenu(false)} />
                <div className="dropdown" style={{ position: 'absolute', top: 34, left: 0, width: 280, zIndex: 200 }}>
                  <div className="dropdown-label">Recent Charts</div>
                  {recentCharts.map(c => (
                    <button key={c.id} className="dropdown-item" onClick={() => { navigate(`/chart/${c.id}`); setShowRecentMenu(false) }}>
                      <span style={{ width: 18, height: 18, borderRadius: 3, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>
                        {c.type === 'funnel' ? 'F' : c.type === 'retention' ? 'R' : 'S'}
                      </span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    </button>
                  ))}
                  <div className="dropdown-divider" />
                  <div className="dropdown-label">Recent Dashboards</div>
                  {recentDashboards.map(d => (
                    <button key={d.id} className="dropdown-item" onClick={() => { navigate(`/dashboard/${d.id}`); setShowRecentMenu(false) }}>
                      <span style={{ width: 18, height: 18, borderRadius: 3, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#059669' }}>D</span>
                      {d.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button className="topbar-nav-btn" onClick={() => { setShowFavoritesMenu(!showFavoritesMenu); setShowRecentMenu(false); setShowSpacesMenu(false) }}>Favorites <ChevronDown size={14} /></button>
            {showFavoritesMenu && (
              <>
                <div className="overlay" onClick={() => setShowFavoritesMenu(false)} />
                <div className="dropdown" style={{ position: 'absolute', top: 34, left: 0, width: 240, zIndex: 200 }}>
                  <div className="dropdown-label">Favorite Charts</div>
                  {state.charts.slice(0, 3).map(c => (
                    <button key={c.id} className="dropdown-item" onClick={() => { navigate(`/chart/${c.id}`); setShowFavoritesMenu(false) }}>
                      <span style={{ width: 18, height: 18, borderRadius: 3, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>
                        {c.type === 'funnel' ? 'F' : c.type === 'retention' ? 'R' : 'S'}
                      </span>
                      {c.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button className="topbar-nav-btn" onClick={() => { setShowSpacesMenu(!showSpacesMenu); setShowRecentMenu(false); setShowFavoritesMenu(false) }}>Spaces <ChevronDown size={14} /></button>
            {showSpacesMenu && (
              <>
                <div className="overlay" onClick={() => setShowSpacesMenu(false)} />
                <div className="dropdown" style={{ position: 'absolute', top: 34, left: 0, width: 240, zIndex: 200 }}>
                  <div className="dropdown-label">Spaces</div>
                  {(state.spaces || []).map(s => (
                    <button key={s.id} className="dropdown-item" onClick={() => { navigate('/content'); setShowSpacesMenu(false) }}>
                      <span style={{ fontSize: 14 }}>{s.isPersonal ? '👤' : '👥'}</span>
                      {s.name}
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-secondary)' }}>{s.contentIds?.length || 0}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="topbar-center">
        <div className="topbar-search" onClick={() => setShowSearch(true)}>
          <Search size={15} className="topbar-search-icon" />
          <span className="topbar-search-placeholder">Search or ask a question</span>
          <kbd className="topbar-search-kbd">
            <Command size={11} />K
          </kbd>
        </div>
        {showSearch && (
          <>
            <div className="overlay" onClick={() => { setShowSearch(false); setSearchQuery('') }} />
            <div className="search-overlay">
              <div className="search-overlay-input-wrap">
                <Search size={16} className="search-overlay-icon" />
                <input
                  autoFocus
                  className="search-overlay-input"
                  placeholder="Search or ask a question"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery('') } }}
                />
                <button className="icon-btn" onClick={() => { setShowSearch(false); setSearchQuery('') }}><X size={16} /></button>
              </div>
              <div className="search-overlay-results">
                {searchResults.charts.length > 0 && (
                  <div className="search-results-group">
                    <div className="search-results-label">Charts</div>
                    {searchResults.charts.map(c => (
                      <button key={c.id} className="search-result-item" onClick={() => { navigate(`/chart/${c.id}`); setShowSearch(false); setSearchQuery('') }}>
                        <span style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--primary-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>
                          {c.type === 'funnel' ? 'F' : c.type === 'retention' ? 'R' : 'S'}
                        </span>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.dashboards.length > 0 && (
                  <div className="search-results-group">
                    <div className="search-results-label">Dashboards</div>
                    {searchResults.dashboards.map(d => (
                      <button key={d.id} className="search-result-item" onClick={() => { navigate(`/dashboard/${d.id}`); setShowSearch(false); setSearchQuery('') }}>
                        <span style={{ width: 20, height: 20, borderRadius: 4, background: '#ECFDF5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#059669' }}>D</span>
                        {d.name}
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.cohorts.length > 0 && (
                  <div className="search-results-group">
                    <div className="search-results-label">Cohorts</div>
                    {searchResults.cohorts.map(c => (
                      <button key={c.id} className="search-result-item" onClick={() => { navigate('/cohorts'); setShowSearch(false); setSearchQuery('') }}>
                        <span style={{ width: 20, height: 20, borderRadius: 4, background: '#EDE9FE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#6366F1' }}>C</span>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.trim() && searchResults.charts.length === 0 && searchResults.dashboards.length === 0 && searchResults.cohorts.length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No results found</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="topbar-right">
        {!inviteDismissed && (
          <div className="topbar-invite">
            <Users size={15} />
            <span>Invite Members</span>
            <button className="icon-btn topbar-invite-close" onClick={() => setInviteDismissed(true)}>
              <X size={14} />
            </button>
          </div>
        )}
        <div style={{ position: 'relative' }}>
          <button className="icon-btn" title="Notifications" onClick={() => { setShowNotifications(!showNotifications); setShowHelp(false) }}><Bell size={18} /></button>
          {showNotifications && (
            <>
              <div className="overlay" onClick={() => setShowNotifications(false)} />
              <div className="dropdown" style={{ position: 'absolute', top: 36, right: 0, width: 300, zIndex: 200 }}>
                <div style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14, borderBottom: '1px solid var(--border)' }}>Notifications</div>
                <div style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-sep)' }}>
                  Chart "Daily Active Users" was updated by {state.currentUser.name}
                </div>
                <div style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-sep)' }}>
                  Cohort "Power Users" was recomputed - 8 users
                </div>
                <div style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                  Experiment "Homepage CTA Test" is running
                </div>
              </div>
            </>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button className="icon-btn" title="Help" onClick={() => { setShowHelp(!showHelp); setShowNotifications(false) }}><HelpCircle size={18} /></button>
          {showHelp && (
            <>
              <div className="overlay" onClick={() => setShowHelp(false)} />
              <div className="dropdown" style={{ position: 'absolute', top: 36, right: 0, width: 220, zIndex: 200 }}>
                <button className="dropdown-item" onClick={() => setShowHelp(false)}>Documentation</button>
                <button className="dropdown-item" onClick={() => setShowHelp(false)}>API Reference</button>
                <button className="dropdown-item" onClick={() => setShowHelp(false)}>Community Forum</button>
                <button className="dropdown-item" onClick={() => setShowHelp(false)}>Contact Support</button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => setShowHelp(false)}>Keyboard Shortcuts</button>
              </div>
            </>
          )}
        </div>
        <button className="icon-btn" title="Settings" onClick={() => navigate('/home')}><Settings size={18} /></button>
        <button className="topbar-upgrade" onClick={() => navigate('/home')}>
          <Sparkles size={14} /> Upgrade
        </button>
      </div>
    </header>
  )
}
