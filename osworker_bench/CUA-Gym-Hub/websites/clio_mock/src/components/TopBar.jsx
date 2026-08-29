import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Bell, Plus, ChevronDown, Play, Pause, Square,
  Clock, Briefcase, Users, FileText, CheckSquare, Calendar,
  MessageSquare, DollarSign, X
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from './Toast'

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function TopBar({ sidebarWidth }) {
  const { state, dispatch } = useApp()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showRecents, setShowRecents] = useState(false)
  const [showCreateNew, setShowCreateNew] = useState(false)
  const [showTimerDropdown, setShowTimerDropdown] = useState(false)
  const [elapsed, setElapsed] = useState(state.timer.elapsed)
  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const recentsRef = useRef(null)
  const createRef = useRef(null)
  const timerRef = useRef(null)

  const user = state.users.find(u => u.id === state.currentUserId)
  const unreadCount = state.notifications.filter(n => !n.read).length

  // Timer ticker
  useEffect(() => {
    if (!state.timer.isRunning) {
      setElapsed(state.timer.elapsed)
      return
    }
    const interval = setInterval(() => {
      const now = Date.now()
      const newElapsed = state.timer.elapsed + (now - (state.timer.startTime || now))
      setElapsed(newElapsed)
    }, 1000)
    return () => clearInterval(interval)
  }, [state.timer.isRunning, state.timer.elapsed, state.timer.startTime])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (recentsRef.current && !recentsRef.current.contains(e.target)) setShowRecents(false)
      if (createRef.current && !createRef.current.contains(e.target)) setShowCreateNew(false)
      if (timerRef.current && !timerRef.current.contains(e.target)) setShowTimerDropdown(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchResults(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Search handler
  useEffect(() => {
    if (!searchValue.trim()) { setSearchResults(null); return }
    const q = searchValue.toLowerCase()
    const matters = state.matters.filter(m =>
      m.matterNumber.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.clientName.toLowerCase().includes(q)
    ).slice(0, 5)
    const contacts = state.contacts.filter(c =>
      c.displayName.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q))
    ).slice(0, 5)
    const tasks = state.tasks.filter(t => t.name.toLowerCase().includes(q)).slice(0, 3)
    const documents = state.documents.filter(d => d.name.toLowerCase().includes(q)).slice(0, 3)
    setSearchResults({ matters, contacts, tasks, documents })
  }, [searchValue])

  const handleTimerPlay = () => {
    if (state.timer.isRunning) {
      // Pause
      const now = Date.now()
      const newElapsed = state.timer.elapsed + (now - (state.timer.startTime || now))
      dispatch({ type: 'UPDATE_TIMER', payload: { isRunning: false, elapsed: newElapsed, startTime: null } })
      addToast('Timer paused', 'info')
    } else {
      // Start
      dispatch({ type: 'UPDATE_TIMER', payload: { isRunning: true, startTime: Date.now() } })
      addToast('Timer started', 'info')
    }
  }

  const handleTimerStop = () => {
    const now = Date.now()
    const finalElapsed = state.timer.isRunning
      ? state.timer.elapsed + (now - (state.timer.startTime || now))
      : state.timer.elapsed
    const hours = finalElapsed / 3600000
    dispatch({ type: 'UPDATE_TIMER', payload: { isRunning: false, elapsed: 0, startTime: null } })
    setElapsed(0)
    // Open time entry modal - dispatch a custom event
    window.dispatchEvent(new CustomEvent('openTimerEntry', { detail: { duration: Math.round(hours * 100) / 100, description: state.timer.description, matterId: state.timer.matterId } }))
    addToast('Timer stopped', 'info')
  }

  const handleCreateNew = (type) => {
    setShowCreateNew(false)
    window.dispatchEvent(new CustomEvent('openModal', { detail: { type } }))
  }

  const handleNotificationClick = (notif) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id })
    setShowNotifications(false)
    if (notif.referenceType === 'matter') navigate(`/matters/${notif.referenceId}`)
    else if (notif.referenceType === 'task') navigate('/tasks')
    else if (notif.referenceType === 'bill') navigate(`/billing/${notif.referenceId}`)
    else if (notif.referenceType === 'event') navigate('/calendar')
    else if (notif.referenceType === 'document') navigate('/documents')
  }

  const getNotifIcon = (type) => {
    const icons = { task_due: CheckSquare, bill_overdue: DollarSign, event_reminder: Calendar, matter_update: Briefcase, document_shared: FileText }
    const Icon = icons[type] || Bell
    return <Icon size={14} />
  }

  const getRelativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs/24)}d ago`
  }

  const recentMatters = (state.recentMatters || []).slice(0, 5).map(id => state.matters.find(m => m.id === id)).filter(Boolean)
  const recentContacts = (state.recentContacts || []).slice(0, 5).map(id => state.contacts.find(c => c.id === id)).filter(Boolean)

  const getBadgeClass = (status) => {
    const map = { Open: 'badge-open', Pending: 'badge-pending', Closed: 'badge-closed', Overdue: 'badge-overdue', Draft: 'badge-draft', Sent: 'badge-sent', Paid: 'badge-paid' }
    return map[status] || 'badge-closed'
  }

  const currentElapsed = state.timer.isRunning
    ? elapsed
    : state.timer.elapsed

  return (
    <header style={{
      height: 52,
      background: '#FFFFFF',
      borderBottom: '1px solid #E0E0E0',
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px 0 20px',
      gap: 12,
      position: 'fixed',
      top: 0,
      left: sidebarWidth,
      right: 0,
      zIndex: 90,
      transition: 'left 0.2s ease',
    }}>
      {/* Xlio Manage dropdown */}
      <button style={{
        display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
        cursor: 'pointer', color: '#1A73E8', fontSize: 14, fontWeight: 600, padding: '4px 8px', borderRadius: 4
      }}
      onClick={() => navigate('/')}>
        Xlio Manage
        <ChevronDown size={14} />
      </button>

      {/* Search */}
      <div ref={searchRef} style={{ position: 'relative', width: 240, marginLeft: 8 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9AA0A6', pointerEvents: 'none' }} />
        <input
          className="input-field search-input"
          style={{ height: 34, fontSize: 13, width: '100%', paddingLeft: 32 }}
          placeholder={`Search ${state.firmSettings.firmName}`}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && setSearchResults(null)}
        />
        {searchResults && (
          <div className="dropdown-menu dropdown-menu-left" style={{ width: 400, maxHeight: 500, overflowY: 'auto' }}>
            {searchResults.matters.length > 0 && (
              <>
                <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Matters</div>
                {searchResults.matters.map(m => (
                  <div key={m.id} className="dropdown-item" onClick={() => { navigate(`/matters/${m.id}`); setSearchValue(''); setSearchResults(null) }}>
                    <Briefcase size={14} color="#6B8CC7" />
                    <div>
                      <div style={{ fontWeight: 500 }}>{m.matterNumber}</div>
                      <div style={{ fontSize: 12, color: '#5F6368' }}>{m.description}</div>
                    </div>
                    <span className={`badge ${getBadgeClass(m.status)}`} style={{ marginLeft: 'auto' }}>{m.status}</span>
                  </div>
                ))}
              </>
            )}
            {searchResults.contacts.length > 0 && (
              <>
                <div className="dropdown-divider" />
                <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contacts</div>
                {searchResults.contacts.map(c => (
                  <div key={c.id} className="dropdown-item" onClick={() => { navigate(`/contacts/${c.id}`); setSearchValue(''); setSearchResults(null) }}>
                    <Users size={14} color="#6B8CC7" />
                    <div>
                      <div style={{ fontWeight: 500 }}>{c.displayName}</div>
                      <div style={{ fontSize: 12, color: '#5F6368' }}>{c.email}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {searchResults.tasks.length > 0 && (
              <>
                <div className="dropdown-divider" />
                <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tasks</div>
                {searchResults.tasks.map(t => (
                  <div key={t.id} className="dropdown-item" onClick={() => { navigate('/tasks'); setSearchValue(''); setSearchResults(null) }}>
                    <CheckSquare size={14} color="#6B8CC7" />
                    <span>{t.name}</span>
                  </div>
                ))}
              </>
            )}
            {searchResults.documents.length > 0 && (
              <>
                <div className="dropdown-divider" />
                <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Documents</div>
                {searchResults.documents.map(d => (
                  <div key={d.id} className="dropdown-item" onClick={() => { navigate('/documents'); setSearchValue(''); setSearchResults(null) }}>
                    <FileText size={14} color="#6B8CC7" />
                    <span>{d.name}</span>
                  </div>
                ))}
              </>
            )}
            {!searchResults.matters.length && !searchResults.contacts.length && !searchResults.tasks.length && !searchResults.documents.length && (
              <div style={{ padding: '16px', color: '#9AA0A6', textAlign: 'center', fontSize: 13 }}>No results found</div>
            )}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Recents */}
      <div ref={recentsRef} className="dropdown">
        <button className="btn btn-secondary btn-sm" onClick={() => setShowRecents(!showRecents)} style={{ height: 32 }}>
          Recents <ChevronDown size={12} />
        </button>
        {showRecents && (
          <div className="dropdown-menu" style={{ width: 300 }}>
            <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recent Matters</div>
            {recentMatters.length === 0 && <div style={{ padding: '8px 16px', color: '#9AA0A6', fontSize: 13 }}>No recent matters</div>}
            {recentMatters.map(m => (
              <div key={m.id} className="dropdown-item" onClick={() => { navigate(`/matters/${m.id}`); setShowRecents(false) }}>
                <Briefcase size={14} color="#6B8CC7" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{m.matterNumber}</div>
                  <div style={{ fontSize: 11, color: '#5F6368' }}>{m.description}</div>
                </div>
                <span className={`badge ${getBadgeClass(m.status)}`}>{m.status}</span>
              </div>
            ))}
            <div className="dropdown-divider" />
            <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recent Contacts</div>
            {recentContacts.length === 0 && <div style={{ padding: '8px 16px', color: '#9AA0A6', fontSize: 13 }}>No recent contacts</div>}
            {recentContacts.map(c => (
              <div key={c.id} className="dropdown-item" onClick={() => { navigate(`/contacts/${c.id}`); setShowRecents(false) }}>
                <Users size={14} color="#6B8CC7" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.displayName}</div>
                  <div style={{ fontSize: 11, color: '#5F6368' }}>{c.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timer */}
      <div ref={timerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, background: '#F5F6FA', borderRadius: 6, padding: '4px 10px', border: '1px solid #E0E0E0' }}>
        <Clock size={14} color="#5F6368" />
        <span
          style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: state.timer.isRunning ? '#1A73E8' : '#1A1A2E', cursor: 'pointer', minWidth: 70 }}
          onClick={() => setShowTimerDropdown(!showTimerDropdown)}
        >
          {formatTime(currentElapsed)}
        </span>
        <button
          className="btn-icon"
          onClick={handleTimerPlay}
          style={{ width: 26, height: 26, borderRadius: '50%', background: '#1A73E8', color: '#fff', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {state.timer.isRunning ? <Pause size={12} /> : <Play size={12} />}
        </button>
        {(state.timer.isRunning || state.timer.elapsed > 0) && (
          <button className="btn-icon" onClick={handleTimerStop} title="Stop and create time entry" style={{ padding: 2 }}>
            <Square size={12} color="#EA4335" />
          </button>
        )}
        {showTimerDropdown && (
          <div className="dropdown-menu" style={{ right: 0, width: 260, padding: 12 }}>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">Matter</label>
              <select className="select-field" style={{ fontSize: 13 }}
                value={state.timer.matterId || ''}
                onChange={e => dispatch({ type: 'UPDATE_TIMER', payload: { matterId: e.target.value || null } })}>
                <option value="">No matter selected</option>
                {state.matters.filter(m => m.status === 'Open').map(m => (
                  <option key={m.id} value={m.id}>{m.matterNumber} - {m.description}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description</label>
              <input className="input-field" style={{ fontSize: 13 }} placeholder="What are you working on?"
                value={state.timer.description || ''}
                onChange={e => dispatch({ type: 'UPDATE_TIMER', payload: { description: e.target.value } })} />
            </div>
          </div>
        )}
      </div>

      {/* Create New */}
      <div ref={createRef} className="dropdown">
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateNew(!showCreateNew)} style={{ height: 32, gap: 4 }}>
          <Plus size={14} /> Create new <ChevronDown size={12} />
        </button>
        {showCreateNew && (
          <div className="dropdown-menu" style={{ width: 220 }}>
            {[
              { type: 'matter', label: 'New Matter', icon: Briefcase },
              { type: 'contact', label: 'New Contact', icon: Users },
              { type: 'timeEntry', label: 'New Time Entry', icon: Clock },
              { type: 'expense', label: 'New Expense', icon: DollarSign },
              { type: 'task', label: 'New Task', icon: CheckSquare },
              { type: 'event', label: 'New Calendar Event', icon: Calendar },
              { type: 'communication', label: 'New Communication', icon: MessageSquare },
              { type: 'bill', label: 'New Bill', icon: DollarSign },
            ].map(({ type, label, icon: Icon }) => (
              <div key={type} className="dropdown-item" onClick={() => handleCreateNew(type)}>
                <Icon size={14} color="#6B8CC7" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button className="btn-icon" onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative' }}>
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2, background: '#EA4335', color: '#fff',
              fontSize: 9, fontWeight: 700, borderRadius: 10, padding: '1px 4px', minWidth: 14, textAlign: 'center', lineHeight: '14px'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
        {showNotifications && (
          <div className="dropdown-menu" style={{ width: 340, maxHeight: 440, overflowY: 'auto', right: 0 }}>
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EEEEEE' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
              {unreadCount > 0 && (
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A73E8', fontSize: 12 }}
                  onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}>
                  Mark all as read
                </button>
              )}
            </div>
            {state.notifications.length === 0 && (
              <div style={{ padding: '20px 16px', color: '#9AA0A6', textAlign: 'center', fontSize: 13 }}>No notifications</div>
            )}
            {state.notifications.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(notif => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                style={{
                  display: 'flex', gap: 10, padding: '10px 16px', cursor: 'pointer',
                  background: notif.read ? 'transparent' : '#EEF4FD',
                  borderBottom: '1px solid #EEEEEE'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8F9FA'}
                onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : '#EEF4FD'}
              >
                <div style={{ color: '#1A73E8', marginTop: 2, flexShrink: 0 }}>{getNotifIcon(notif.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: notif.read ? 400 : 600, color: '#1A1A2E', lineHeight: '18px' }}>{notif.title}</div>
                  <div style={{ fontSize: 12, color: '#5F6368', marginTop: 2, lineHeight: '16px' }}>{notif.message}</div>
                  <div style={{ fontSize: 11, color: '#9AA0A6', marginTop: 4 }}>{getRelativeTime(notif.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {user && (
        <div className="avatar" style={{ background: user.avatarColor, cursor: 'pointer' }} title={user.name}>
          {user.initials}
        </div>
      )}
    </header>
  )
}
