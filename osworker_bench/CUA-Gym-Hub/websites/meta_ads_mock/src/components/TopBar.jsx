import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, ChevronDown, CheckCircle, XCircle, AlertTriangle, Info, Keyboard, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast';
import './TopBar.css';

const MOCK_ACCOUNTS = [
  { id: 'act_987654321', name: 'Acme Corp Ad Account' },
  { id: 'act_111222333', name: 'TechCorp Ad Account' },
  { id: 'act_555444333', name: 'StartupXYZ' },
];

function NotificationIcon({ type }) {
  if (type === 'ad_approved') return <CheckCircle size={16} color="#31A24C" />;
  if (type === 'ad_rejected') return <XCircle size={16} color="#FA383E" />;
  if (type === 'budget_alert') return <AlertTriangle size={16} color="#F7B928" />;
  if (type === 'performance_alert') return <Info size={16} color="#0866FF" />;
  if (type === 'account_update') return <Info size={16} color="#65676B" />;
  return <Info size={16} color="#65676B" />;
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="topbar-toast">
      <span>{message}</span>
      <button className="topbar-toast-close" onClick={onClose}><X size={14} /></button>
    </div>
  );
}

// P2.9: Review and Publish side panel
function ReviewPublishPanel({ drafts, onPublish, onDiscard, onClose }) {
  function getBudgetSummary(draft) {
    if (draft.dailyBudget) return `$${draft.dailyBudget.toFixed(2)}/day`;
    if (draft.lifetimeBudget) return `$${draft.lifetimeBudget.toFixed(2)} lifetime`;
    return 'No budget set';
  }
  return (
    <div className="review-panel-overlay" onClick={onClose}>
      <div className="review-panel" onClick={e => e.stopPropagation()}>
        <div className="review-panel-header">
          <div className="review-panel-title">Review and Publish</div>
          <button className="review-panel-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="review-panel-desc">
          You have {drafts.length} draft campaign{drafts.length !== 1 ? 's' : ''} ready to review.
        </div>
        <div className="review-panel-list">
          {drafts.map(d => (
            <div key={d.id} className="review-panel-item">
              <div className="review-panel-item-name">{d.name}</div>
              <div className="review-panel-item-meta">
                <span className="review-panel-objective">{d.objective ? d.objective.charAt(0).toUpperCase() + d.objective.slice(1) : 'Unknown'}</span>
                <span className="review-panel-budget">{getBudgetSummary(d)}</span>
              </div>
              <div className="review-panel-item-actions">
                <button
                  className="review-publish-btn"
                  onClick={() => onPublish(d.id)}
                >
                  Publish
                </button>
                <button
                  className="review-discard-btn"
                  onClick={() => onDiscard(d.id)}
                >
                  Discard
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TopBar() {
  const { state, markNotificationRead, markAllNotificationsRead, publishCampaign, deleteCampaign, updateAccount } = useApp();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const helpRef = useRef(null);
  const userRef = useRef(null);

  const unread = state.notifications.filter(n => !n.read).length;
  // P2.9: draft campaigns count
  const draftCampaigns = (state.campaigns || []).filter(c => c.status === 'draft');
  const draftCount = draftCampaigns.length;

  const showToast = (msg) => setToast(msg);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search results: search across campaigns, adSets, ads
  const searchResults = searchQuery.trim().length < 2 ? [] : (() => {
    const q = searchQuery.trim().toLowerCase();
    const campaigns = (state.campaigns || [])
      .filter(c => c.status !== 'deleted' && c.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map(c => ({ type: 'Campaign', label: c.name, id: c.id, url: `/campaigns/${c.id}` }));
    const adSets = (state.adSets || [])
      .filter(a => a.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map(a => ({ type: 'Ad Set', label: a.name, id: a.id, url: `/ad-sets` }));
    const ads = (state.ads || [])
      .filter(a => a.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map(a => ({ type: 'Ad', label: a.name, id: a.id, url: `/ads` }));
    return [...campaigns, ...adSets, ...ads];
  })();

  const handleSearchResult = (result) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(result.url);
  };

  function handlePublish(id) {
    publishCampaign(id);
    showToast('Campaign published and is now active.');
  }

  function handleDiscard(id) {
    deleteCampaign(id);
    showToast('Draft campaign discarded.');
  }

  const shortcuts = [
    { key: 'C', desc: 'Create new campaign' },
    { key: '/', desc: 'Focus search' },
    { key: 'E', desc: 'Edit selected row' },
    { key: 'Esc', desc: 'Close modal / cancel' },
    { key: 'Enter', desc: 'Save inline edit' },
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#0866FF"/>
            <path d="M8.5 14c0-2.8 1.3-4.5 3-4.5 1.2 0 2 .8 2.5 2l.5 1.2.5-1.2c.5-1.2 1.3-2 2.5-2 1.7 0 3 1.7 3 4.5s-1.3 4.5-3 4.5c-1.2 0-2-.8-2.5-2L14.5 15l-.5 1.2c-.5 1.2-1.3 2-2.5 2-1.7 0-3-1.7-3-4.5z" fill="white" stroke="white" strokeWidth="1"/>
          </svg>
          <span className="topbar-brand">Ads Manager</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* P2.9: Review and Publish button */}
        {draftCount > 0 && (
          <button
            className="review-publish-topbar-btn"
            onClick={() => setShowReviewPanel(true)}
          >
            Review and Publish
            <span className="review-publish-badge">{draftCount}</span>
          </button>
        )}

        {/* Search */}
        <div className="topbar-search-wrapper" ref={searchRef}>
          <button
            className={`topbar-icon-btn ${searchOpen ? 'topbar-icon-btn--active' : ''}`}
            title="Search"
            onClick={() => { setSearchOpen(v => !v); setHelpOpen(false); setUserOpen(false); }}
          >
            <Search size={18} />
          </button>
          {searchOpen && (
            <div className="topbar-search-dropdown">
              <div className="topbar-search-input-row">
                <Search size={14} color="#65676B" />
                <input
                  autoFocus
                  className="topbar-search-input"
                  placeholder="Search campaigns, ad sets, ads..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="topbar-search-clear" onClick={() => setSearchQuery('')}><X size={12} /></button>
                )}
              </div>
              {searchQuery.trim().length >= 2 && (
                <div className="topbar-search-results">
                  {searchResults.length === 0 ? (
                    <div className="topbar-search-empty">No results for "{searchQuery}"</div>
                  ) : (
                    (() => {
                      const groups = {};
                      searchResults.forEach(r => {
                        if (!groups[r.type]) groups[r.type] = [];
                        groups[r.type].push(r);
                      });
                      return Object.entries(groups).map(([type, items]) => (
                        <div key={type}>
                          <div className="topbar-search-group-label">{type}s</div>
                          {items.map(r => (
                            <button
                              key={r.id}
                              className="topbar-search-result-item"
                              onClick={() => handleSearchResult(r)}
                            >
                              <span className="topbar-search-result-label">{r.label}</span>
                              <span className="topbar-search-result-type">{r.type}</span>
                            </button>
                          ))}
                        </div>
                      ));
                    })()
                  )}
                </div>
              )}
              {searchQuery.trim().length < 2 && (
                <div className="topbar-search-hint">Type at least 2 characters to search</div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="notif-wrapper" ref={notifRef}>
          <button
            className="topbar-icon-btn"
            title="Notifications"
            onClick={() => setNotifOpen(v => !v)}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span className="notif-title">Notifications</span>
                {unread > 0 && (
                  <button className="notif-mark-all" onClick={markAllNotificationsRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {state.notifications.length === 0 ? (
                  <div className="notif-empty">No notifications</div>
                ) : (
                  state.notifications.map(n => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}
                      onClick={() => {
                        markNotificationRead(n.id);
                        setNotifOpen(false);
                        if (n.actionUrl) navigate(n.actionUrl);
                      }}
                    >
                      <div className="notif-item-icon">
                        <NotificationIcon type={n.type} />
                      </div>
                      <div className="notif-item-content">
                        <div className={`notif-item-title ${!n.read ? 'notif-item-title--bold' : ''}`}>
                          {n.title}
                        </div>
                        <div className="notif-item-msg">{n.message}</div>
                        <div className="notif-item-time">{timeAgo(n.timestamp)}</div>
                      </div>
                      {!n.read && <div className="notif-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <div className="topbar-help-wrapper" ref={helpRef}>
          <button
            className={`topbar-icon-btn ${helpOpen ? 'topbar-icon-btn--active' : ''}`}
            title="Help"
            onClick={() => { setHelpOpen(v => !v); setSearchOpen(false); setUserOpen(false); }}
          >
            <HelpCircle size={18} />
          </button>
          {helpOpen && (
            <div className="topbar-help-dropdown">
              <div className="topbar-help-header">Help & Support</div>
              <button
                className="topbar-help-item"
                onClick={() => { showToast('Opening help center...'); setHelpOpen(false); }}
              >
                <Info size={14} />
                <span>Xeta Ads Help Center</span>
              </button>
              <div className="topbar-help-divider" />
              <div className="topbar-help-section-label">Keyboard Shortcuts</div>
              <div className="topbar-help-shortcuts">
                {shortcuts.map(s => (
                  <div key={s.key} className="topbar-help-shortcut-row">
                    <kbd className="topbar-kbd">{s.key}</kbd>
                    <span>{s.desc}</span>
                  </div>
                ))}
              </div>
              <div className="topbar-help-divider" />
              <button
                className="topbar-help-item"
                onClick={() => { showToast('Support request submitted.'); setHelpOpen(false); }}
              >
                <CheckCircle size={14} />
                <span>Contact Support</span>
              </button>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="topbar-user-wrapper" ref={userRef}>
          <button
            className="topbar-avatar"
            title={state.user.name}
            onClick={() => { setUserOpen(v => !v); setSearchOpen(false); setHelpOpen(false); }}
          >
            {state.user.name.charAt(0)}
          </button>
          {userOpen && (
            <div className="topbar-user-dropdown">
              <div className="topbar-user-header">
                <div className="topbar-user-avatar-lg">{state.user.name.charAt(0)}</div>
                <div className="topbar-user-info">
                  <div className="topbar-user-name">{state.user.name}</div>
                  <div className="topbar-user-email">{state.user.email || 'sarah.chen@acmecorp.com'}</div>
                </div>
              </div>
              <div className="topbar-user-divider" />
              <button
                className="topbar-user-item"
                onClick={() => { setUserOpen(false); navigate('/settings'); }}
              >
                Account settings
              </button>
              <button
                className="topbar-user-item"
                onClick={() => {
                  const currentId = state.account?.id || MOCK_ACCOUNTS[0].id;
                  const currentIdx = MOCK_ACCOUNTS.findIndex(a => a.id === currentId);
                  const nextIdx = (currentIdx + 1) % MOCK_ACCOUNTS.length;
                  const next = MOCK_ACCOUNTS[nextIdx];
                  updateAccount({ id: next.id, name: next.name });
                  showToast(`Switched to ${next.name}`);
                  setUserOpen(false);
                }}
              >
                Switch accounts
              </button>
              <div className="topbar-user-divider" />
              <button
                className="topbar-user-item topbar-user-item--logout"
                onClick={() => { showToast('Logged out successfully.'); setUserOpen(false); }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* P2.9: Review and Publish Panel */}
      {showReviewPanel && (
        <ReviewPublishPanel
          drafts={draftCampaigns}
          onPublish={(id) => { handlePublish(id); if (draftCampaigns.length <= 1) setShowReviewPanel(false); }}
          onDiscard={(id) => { handleDiscard(id); if (draftCampaigns.length <= 1) setShowReviewPanel(false); }}
          onClose={() => setShowReviewPanel(false)}
        />
      )}
    </header>
  );
}
