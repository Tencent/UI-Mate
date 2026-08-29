import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, MessageSquare, Bell, HelpCircle, X, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Header() {
  const { state, dispatch } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchVal, setSearchVal] = useState('');
  const [showConversations, setShowConversations] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpPanel, setHelpPanel] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const conversationsRef = useRef(null);
  const notificationsRef = useRef(null);
  const helpRef = useRef(null);
  const userMenuRef = useRef(null);

  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  // Click-outside handler for all header dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showConversations && conversationsRef.current && !conversationsRef.current.contains(e.target)) {
        setShowConversations(false);
      }
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (showHelp && helpRef.current && !helpRef.current.contains(e.target)) {
        setShowHelp(false);
      }
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showConversations, showNotifications, showHelp, showUserMenu]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: searchVal.trim() });
      navigate(appendQuery(`/search?q=${encodeURIComponent(searchVal.trim())}`));
    }
  };

  const openTicket = (ticketId) => {
    dispatch({ type: 'OPEN_TICKET_TAB', payload: ticketId });
    navigate(appendQuery(`/tickets/${ticketId}`));
  };

  const closeTab = (e, ticketId) => {
    e.stopPropagation();
    dispatch({ type: 'CLOSE_TICKET_TAB', payload: ticketId });
    const remaining = state.ui.openTicketTabs.filter(id => id !== ticketId);
    if (state.ui.activeTicketId === ticketId) {
      if (remaining.length > 0) {
        const nextId = remaining[remaining.length - 1];
        navigate(appendQuery(`/tickets/${nextId}`));
      } else {
        navigate(appendQuery(`/views/${state.ui.activeView || 1}`));
      }
    }
  };

  const handleAddNew = () => {
    navigate(appendQuery('/tickets/new'));
  };

  const openCount = state.tickets.filter(t => ['new', 'open'].includes(t.status)).length;

  // Tab overflow: show max 8 visible tabs, rest in overflow indicator
  const MAX_VISIBLE_TABS = 8;
  const visibleTabs = state.ui.openTicketTabs.slice(0, MAX_VISIBLE_TABS);
  const overflowTabs = state.ui.openTicketTabs.slice(MAX_VISIBLE_TABS);
  const [showOverflow, setShowOverflow] = useState(false);
  const overflowRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showOverflow && overflowRef.current && !overflowRef.current.contains(e.target)) {
        setShowOverflow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOverflow]);

  // Recent open/new tickets for the conversations panel
  const recentOpenTickets = state.tickets
    .filter(t => ['new', 'open'].includes(t.status))
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  return (
    <header className="header">
      <div className="header-tabs">
        {visibleTabs.map(ticketId => {
          const ticket = state.tickets.find(t => t.id === ticketId);
          if (!ticket) return null;
          const isActive = state.ui.activeTicketId === ticketId;
          return (
            <div
              key={ticketId}
              role="button"
              tabIndex={0}
              className={`header-tab ${isActive ? 'active' : ''}`}
              onClick={() => openTicket(ticketId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openTicket(ticketId);
              }}
            >
              <span className={`status-dot ${ticket.status}`} />
              <span className="header-tab-subject">{ticket.subject}</span>
              <button className="header-tab-close" onClick={(e) => closeTab(e, ticketId)}>
                <X size={12} />
              </button>
            </div>
          );
        })}
        {overflowTabs.length > 0 && (
          <div style={{ position: 'relative' }} ref={overflowRef}>
            <button
              className="header-btn"
              title={`${overflowTabs.length} more tab(s)`}
              onClick={() => setShowOverflow(!showOverflow)}
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              +{overflowTabs.length}
            </button>
            {showOverflow && (
              <div className="header-dropdown" style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #D8DCDE', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 240, zIndex: 200, maxHeight: 300, overflowY: 'auto' }}>
                {overflowTabs.map(ticketId => {
                  const ticket = state.tickets.find(t => t.id === ticketId);
                  if (!ticket) return null;
                  return (
                    <div
                      key={ticketId}
                      role="button"
                      tabIndex={0}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontFamily: 'var(--font-family)' }}
                      onClick={() => { openTicket(ticketId); setShowOverflow(false); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          openTicket(ticketId);
                          setShowOverflow(false);
                        }
                      }}
                    >
                      <span className={`status-dot ${ticket.status}`} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{ticket.subject}</span>
                      <button
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#87929D', padding: 0 }}
                        onClick={(e) => { closeTab(e, ticketId); }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <button className="header-btn add-btn" onClick={handleAddNew} title="Add new ticket">
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="header-center">
        <div className="header-search">
          <Search />
          <input
            type="text"
            placeholder="Search"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <div className="header-right">
        <div style={{ position: 'relative' }} ref={conversationsRef}>
          <button
            className="header-btn"
            title="Conversations"
            onClick={() => { setShowConversations(!showConversations); setShowNotifications(false); setShowHelp(false); }}
          >
            <MessageSquare size={18} />
            {openCount > 0 && <span className="header-badge">{openCount > 9 ? '9+' : openCount}</span>}
          </button>
          {showConversations && (
            <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #D8DCDE', borderRadius: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', width: 320, zIndex: 200 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #D8DCDE', fontWeight: 600, fontSize: 14 }}>
                Open Tickets ({openCount})
              </div>
              {recentOpenTickets.length > 0 ? recentOpenTickets.map(t => (
                <button
                  key={t.id}
                  style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-family)', borderBottom: '1px solid #F0F2F3' }}
                  onClick={() => { openTicket(t.id); setShowConversations(false); }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2F3941', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>#{t.id} {t.subject}</span>
                  <span style={{ fontSize: 12, color: '#87929D', marginTop: 2 }}>{state.users.find(u => u.id === t.requester_id)?.name || 'Unknown'}</span>
                </button>
              )) : (
                <div style={{ padding: 16, fontSize: 13, color: '#87929D', textAlign: 'center' }}>No open tickets</div>
              )}
              <button
                style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#1F73B7', textAlign: 'center', fontFamily: 'var(--font-family)' }}
                onClick={() => { navigate(appendQuery('/views/3')); setShowConversations(false); }}
              >
                View all unsolved tickets
              </button>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={notificationsRef}>
          <button
            className="header-btn"
            title="Notifications"
            onClick={() => { setShowNotifications(!showNotifications); setShowConversations(false); setShowHelp(false); }}
          >
            <Bell size={18} />
          </button>
          {showNotifications && (
            <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #D8DCDE', borderRadius: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', width: 280, zIndex: 200 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #D8DCDE', fontWeight: 600, fontSize: 14 }}>
                Notifications
              </div>
              <div style={{ padding: 24, fontSize: 13, color: '#87929D', textAlign: 'center' }}>
                No new notifications
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={helpRef}>
          <button
            className="header-btn"
            title="Help"
            onClick={() => { setShowHelp(!showHelp); setShowConversations(false); setShowNotifications(false); }}
          >
            <HelpCircle size={18} />
          </button>
          {showHelp && (
            <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #D8DCDE', borderRadius: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', width: 220, zIndex: 200 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #D8DCDE', fontWeight: 600, fontSize: 14 }}>
                Help
              </div>
              <button style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontFamily: 'var(--font-family)', color: '#2F3941' }} onClick={() => { addToast('Keyboard shortcuts: Press ? for help'); setShowHelp(false); }}>
                Keyboard shortcuts
              </button>
              <button style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontFamily: 'var(--font-family)', color: '#2F3941' }} onClick={() => { setHelpPanel('docs'); setShowHelp(false); }}>
                Documentation
              </button>
              <button style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontFamily: 'var(--font-family)', color: '#2F3941' }} onClick={() => { setHelpPanel('support'); setShowHelp(false); }}>
                Support Center
              </button>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <div
            className="header-avatar"
            title={state.currentUser.name}
            onClick={() => { setShowUserMenu(!showUserMenu); setShowConversations(false); setShowNotifications(false); setShowHelp(false); }}
            style={{ cursor: 'pointer' }}
          >
            {state.currentUser.initials}
          </div>
          {showUserMenu && (
            <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #D8DCDE', borderRadius: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', width: 220, zIndex: 200 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #D8DCDE' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#2F3941' }}>{state.currentUser.name}</div>
                <div style={{ fontSize: 12, color: '#87929D' }}>{state.currentUser.email}</div>
              </div>
              <button style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontFamily: 'var(--font-family)', color: '#2F3941' }} onClick={() => { addToast('Profile settings are not available in this demo'); setShowUserMenu(false); }}>
                Profile
              </button>
              <button style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontFamily: 'var(--font-family)', color: '#2F3941' }} onClick={() => { addToast('Sign out is not available in this demo'); setShowUserMenu(false); }}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
      {helpPanel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(47,57,65,0.35)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 520, maxWidth: 'calc(100vw - 32px)', background: '#fff', borderRadius: 6, boxShadow: '0 12px 32px rgba(0,0,0,0.24)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #D8DCDE' }}>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#2F3941' }}>
                {helpPanel === 'docs' ? 'Xendesk Support documentation' : 'Support center'}
              </div>
              <button className="header-btn" onClick={() => setHelpPanel(null)} title="Close help panel">
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: 18, display: 'grid', gap: 12, color: '#2F3941', fontSize: 14, lineHeight: 1.5 }}>
              {helpPanel === 'docs' ? (
                <>
                  <p style={{ margin: 0 }}>Use views to triage queues, open tickets in tabs, update ticket properties in the side panel, and apply macros from the reply composer.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button className="btn-secondary" onClick={() => { navigate(appendQuery('/views/3')); setHelpPanel(null); }}>Browse ticket views</button>
                    <button className="btn-secondary" onClick={() => { navigate(appendQuery('/tickets/new')); setHelpPanel(null); }}>Create a ticket</button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin: 0 }}>Support center summarizes the current sandbox workspace so agents can recover without leaving the mock environment.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ border: '1px solid #D8DCDE', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#68737D' }}>Open tickets</div>
                      <div style={{ fontSize: 24, fontWeight: 600 }}>{openCount}</div>
                    </div>
                    <div style={{ border: '1px solid #D8DCDE', borderRadius: 4, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#68737D' }}>Agents online</div>
                      <div style={{ fontSize: 24, fontWeight: 600 }}>{state.users.filter(u => u.role === 'agent' && u.active).length}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
