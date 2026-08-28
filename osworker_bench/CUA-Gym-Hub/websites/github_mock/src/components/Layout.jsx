
    import React, { useState, useRef, useEffect } from 'react';
    import { Outlet, Link, useNavigate } from 'react-router-dom';
    import { Github as XitHub, Bell, Plus, Search, X, MessageSquare, GitPullRequest, AtSign, AlertCircle, CheckCircle } from 'lucide-react';
    import { useStore } from '../lib/store';
    import KeyboardNav from './KeyboardNav';
    import CommandPalette from './CommandPalette';

    export default function Layout() {
      const { state, dispatch, actions } = useStore();
      const user = state.currentUser;
      const navigate = useNavigate();

      const [searchQuery, setSearchQuery] = useState('');
      const [showSearchResults, setShowSearchResults] = useState(false);
      const [showNotifications, setShowNotifications] = useState(false);
      const [showCreateMenu, setShowCreateMenu] = useState(false);
      const [showProfileMenu, setShowProfileMenu] = useState(false);
      const [utilityPanel, setUtilityPanel] = useState(null);
      const searchRef = useRef(null);
      const searchInputRef = useRef(null);
      const notifRef = useRef(null);
      const createRef = useRef(null);
      const profileRef = useRef(null);

      // Search functionality
      const searchResults = searchQuery.trim() ? {
        repos: state.repos.filter(r =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        issues: state.issues.filter(i =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        users: state.users.filter(u =>
          u.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      } : { repos: [], issues: [], users: [] };

      const hasResults = searchResults.repos.length > 0 ||
                        searchResults.issues.length > 0 ||
                        searchResults.users.length > 0;

      // Close all dropdowns when clicking outside
      useEffect(() => {
        const handleClickOutside = (e) => {
          if (searchRef.current && !searchRef.current.contains(e.target)) {
            setShowSearchResults(false);
          }
          if (notifRef.current && !notifRef.current.contains(e.target)) {
            setShowNotifications(false);
          }
          if (createRef.current && !createRef.current.contains(e.target)) {
            setShowCreateMenu(false);
          }
          if (profileRef.current && !profileRef.current.contains(e.target)) {
            setShowProfileMenu(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, []);

      // "/" keyboard shortcut to focus search
      useEffect(() => {
        const handleKeyDown = (e) => {
          if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            e.preventDefault();
            searchInputRef.current?.focus();
          }
          if (e.key === 'Escape') {
            setUtilityPanel(null);
            closeAllDropdowns();
          }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }, []);

      const closeAllDropdowns = () => {
        setShowNotifications(false);
        setShowCreateMenu(false);
        setShowProfileMenu(false);
      };

      const openUtilityPanel = (panel) => {
        closeAllDropdowns();
        setUtilityPanel(panel);
      };

      const handleSearchSelect = (path) => {
        navigate(path);
        setSearchQuery('');
        setShowSearchResults(false);
      };

      // Get first repo for navigation
      const firstRepo = state.repos[0];
      const repoOwner = state.users.find(u => u.id === firstRepo?.ownerId)?.username || 'admin';

      return (
        <div className="min-h-screen bg-xithub-bg text-xithub-text">
          {/* Header */}
          <header className="bg-xithub-header border-b border-xithub-border py-3 px-6 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-white hover:text-gray-300">
                <XitHub size={32} fill="white" />
              </Link>

              {/* Search Box */}
              <div className="relative" ref={searchRef}>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-2 text-xithub-muted" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search or jump to..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                    className="bg-xithub-bg border border-xithub-border rounded-md py-1.5 pl-9 pr-8 text-sm w-72 focus:ring-2 focus:ring-xithub-accent focus:border-transparent outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                      className="absolute right-8 top-2 text-xithub-muted hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <div className="absolute right-2 top-1.5 border border-xithub-border rounded px-1.5 text-xs text-xithub-muted">/</div>
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery && (
                  <div className="absolute top-full left-0 mt-1 w-96 bg-xithub-card border border-xithub-border rounded-md shadow-lg max-h-96 overflow-auto z-50">
                    {!hasResults ? (
                      <div className="p-4 text-center text-xithub-muted text-sm">
                        No results found for "{searchQuery}"
                      </div>
                    ) : (
                      <>
                        {searchResults.repos.length > 0 && (
                          <div>
                            <div className="px-3 py-2 text-xs font-semibold text-xithub-muted bg-[#161b22]">Repositories</div>
                            {searchResults.repos.map(repo => {
                              const owner = state.users.find(u => u.id === repo.ownerId);
                              return (
                                <button
                                  key={repo.id}
                                  onClick={() => handleSearchSelect(`/${owner?.username}/${repo.name}`)}
                                  className="w-full px-3 py-2 text-left hover:bg-[#161b22] flex items-center gap-2"
                                >
                                  <XitHub size={16} className="text-xithub-muted" />
                                  <span className="text-sm">{owner?.username}/{repo.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {searchResults.issues.length > 0 && (
                          <div>
                            <div className="px-3 py-2 text-xs font-semibold text-xithub-muted bg-[#161b22]">Issues</div>
                            {searchResults.issues.map(issue => {
                              const repo = state.repos.find(r => r.id === issue.repoId);
                              const owner = state.users.find(u => u.id === repo?.ownerId);
                              return (
                                <button
                                  key={issue.id}
                                  onClick={() => handleSearchSelect(`/${owner?.username}/${repo?.name}/issues/${issue.number}`)}
                                  className="w-full px-3 py-2 text-left hover:bg-[#161b22]"
                                >
                                  <div className="text-sm">{issue.title}</div>
                                  <div className="text-xs text-xithub-muted">#{issue.number} in {owner?.username}/{repo?.name}</div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex gap-4 text-sm font-semibold text-white">
                <Link to={firstRepo ? `/${repoOwner}/${firstRepo.name}/pulls` : '/'} className="hover:text-xithub-muted">
                  Pull requests
                </Link>
                <Link to={firstRepo ? `/${repoOwner}/${firstRepo.name}/issues` : '/'} className="hover:text-xithub-muted">
                  Issues
                </Link>
                <button onClick={() => openUtilityPanel('codespaces')} className="hover:text-xithub-muted">Codespaces</button>
                <button onClick={() => openUtilityPanel('marketplace')} className="hover:text-xithub-muted">Marketplace</button>
                <button onClick={() => openUtilityPanel('explore')} className="hover:text-xithub-muted">Explore</button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                {(() => {
                  const notifications = state.notifications || [];
                  const unreadCount = notifications.filter(n => !n.isRead).length;

                  const getNotifIcon = (type) => {
                    switch (type) {
                      case 'issue_comment': return <MessageSquare size={14} className="text-xithub-muted" />;
                      case 'pr_review': return <GitPullRequest size={14} className="text-xithub-muted" />;
                      case 'mention': return <AtSign size={14} className="text-xithub-muted" />;
                      case 'ci_status': return <AlertCircle size={14} className="text-xithub-muted" />;
                      default: return <Bell size={14} className="text-xithub-muted" />;
                    }
                  };

                  const getRelativeTime = (dateStr) => {
                    const diff = Date.now() - new Date(dateStr).getTime();
                    const hours = Math.floor(diff / 3600000);
                    if (hours < 1) return 'just now';
                    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                    const days = Math.floor(hours / 24);
                    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
                    return new Date(dateStr).toLocaleDateString();
                  };

                  const getNotifLink = (notif) => {
                    const nRepo = state.repos.find(r => r.id === notif.repoId);
                    const nOwner = nRepo ? state.users.find(u => u.id === nRepo.ownerId) : null;
                    if (!nRepo || !nOwner || !notif.issueNumber) return '/';
                    const isPR = state.pullRequests.some(p => p.repoId === notif.repoId && p.number === notif.issueNumber);
                    return `/${nOwner.username}/${nRepo.name}/${isPR ? 'pulls' : 'issues'}/${notif.issueNumber}`;
                  };

                  return (
                    <>
                      <button
                        onClick={() => {
                          closeAllDropdowns();
                          setShowNotifications(!showNotifications);
                        }}
                        className="text-white hover:text-gray-300 relative"
                      >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-xithub-accent rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-96 bg-xithub-card border border-xithub-border rounded-md shadow-lg z-50">
                          <div className="px-4 py-3 border-b border-xithub-border flex items-center justify-between">
                            <span className="font-semibold">Notifications</span>
                            {unreadCount > 0 && (
                              <button
                                onClick={() => dispatch({ type: actions.MARK_ALL_NOTIFICATIONS_READ })}
                                className="text-xs text-xithub-accent hover:underline"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                          {notifications.length === 0 ? (
                            <div className="p-6 text-sm text-xithub-muted text-center">
                              No notifications
                            </div>
                          ) : (
                            <div className="max-h-80 overflow-auto divide-y divide-xithub-border">
                              {notifications.map(notif => {
                                const nRepo = state.repos.find(r => r.id === notif.repoId);
                                return (
                                  <button
                                    key={notif.id}
                                    onClick={() => {
                                      dispatch({ type: actions.MARK_NOTIFICATION_READ, payload: { notificationId: notif.id } });
                                      setShowNotifications(false);
                                      if (notif.issueNumber) navigate(getNotifLink(notif));
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-[#161b22] flex items-start gap-3"
                                  >
                                    <div className="pt-0.5">{getNotifIcon(notif.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs text-xithub-muted mb-0.5">{nRepo?.name || 'unknown'}</div>
                                      <div className="text-sm text-xithub-text truncate">{notif.title}</div>
                                      <div className="text-xs text-xithub-muted mt-0.5">{getRelativeTime(notif.date)}</div>
                                    </div>
                                    {!notif.isRead && (
                                      <span className="w-2 h-2 mt-2 rounded-full bg-xithub-accent shrink-0"></span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Create Menu */}
              <div className="relative" ref={createRef}>
                <button
                  onClick={() => {
                    closeAllDropdowns();
                    setShowCreateMenu(!showCreateMenu);
                  }}
                  className="flex items-center gap-1 text-white hover:text-gray-300"
                >
                  <Plus size={18} />
                  <span className="text-xs">▼</span>
                </button>
                {showCreateMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-xithub-card border border-xithub-border rounded-md shadow-lg z-50">
                    <Link
                      to={firstRepo ? `/${repoOwner}/${firstRepo.name}/issues/new` : '/'}
                      className="block px-4 py-2 text-sm hover:bg-[#161b22]"
                      onClick={() => setShowCreateMenu(false)}
                    >
                      New issue
                    </Link>
                    <button
                      onClick={() => {
                        setShowCreateMenu(false);
                        navigate('/new');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[#161b22]"
                    >
                      New repository
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    closeAllDropdowns();
                    setShowProfileMenu(!showProfileMenu);
                  }}
                  className="flex items-center gap-2"
                >
                  <img src={user.avatar} alt="Profile" className="w-5 h-5 rounded-full border border-xithub-border" />
                  <span className="text-xs text-white">▼</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-xithub-card border border-xithub-border rounded-md shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-xithub-border">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-xithub-muted">{user.username}</div>
                    </div>
                    <div className="py-2">
                      <button onClick={() => { setShowProfileMenu(false); navigate(`/profile/${user.username}`); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-[#161b22] cursor-pointer">Your profile</button>
                      <button onClick={() => { setShowProfileMenu(false); navigate('/'); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-[#161b22] cursor-pointer">Your repositories</button>
                      <button onClick={() => { setShowProfileMenu(false); navigate('/'); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-[#161b22] cursor-pointer">Your stars</button>
                    </div>
                    <div className="border-t border-xithub-border py-2">
                      <button onClick={() => { setShowProfileMenu(false); setUtilityPanel('account-settings'); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-[#161b22] cursor-pointer">Settings</button>
                      <button onClick={() => { setShowProfileMenu(false); setUtilityPanel('sign-out'); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-[#161b22] cursor-pointer">Sign out</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {utilityPanel && (
            <div className="fixed inset-0 z-[90] bg-black/60 flex items-start justify-center pt-24 px-4" onClick={() => setUtilityPanel(null)}>
              <div className="w-full max-w-2xl bg-xithub-card border border-xithub-border rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-xithub-border">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {utilityPanel === 'codespaces' && 'Codespaces'}
                      {utilityPanel === 'marketplace' && 'Marketplace'}
                      {utilityPanel === 'explore' && 'Explore'}
                      {utilityPanel === 'account-settings' && 'Account settings'}
                      {utilityPanel === 'sign-out' && 'Sign out'}
                    </h2>
                    <p className="text-sm text-xithub-muted">
                      {utilityPanel === 'codespaces' && 'Local development environments for repositories in this sandbox.'}
                      {utilityPanel === 'marketplace' && 'Sandbox XitHub Apps and Actions available for local workflows.'}
                      {utilityPanel === 'explore' && 'Discover repositories and discussions from the local dataset.'}
                      {utilityPanel === 'account-settings' && 'Local account preferences for the current sandbox user.'}
                      {utilityPanel === 'sign-out' && 'This sandbox keeps the user local, so signing out records a local session state only.'}
                    </p>
                  </div>
                  <button onClick={() => setUtilityPanel(null)} className="text-xithub-muted hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                {utilityPanel === 'codespaces' && (
                  <div className="p-5 space-y-3">
                    {state.repos.slice(0, 3).map(repo => (
                      <div key={repo.id} className="flex items-center justify-between border border-xithub-border rounded-md p-3">
                        <div>
                          <div className="font-semibold text-white">{repo.name}</div>
                          <div className="text-xs text-xithub-muted">main branch · 2-core local sandbox</div>
                        </div>
                        <button onClick={() => navigate(`/${repoOwner}/${repo.name}`)} className="px-3 py-1.5 text-sm rounded-md bg-xithub-success text-white font-semibold">
                          Open repo
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {utilityPanel === 'marketplace' && (
                  <div className="p-5 grid sm:grid-cols-2 gap-3">
                    {['CI / Build', 'CodeQL Analysis', 'Issue Forms', 'Release Drafter'].map(app => (
                      <div key={app} className="border border-xithub-border rounded-md p-3">
                        <div className="font-semibold text-white">{app}</div>
                        <div className="text-xs text-xithub-muted mt-1">Installed locally for sandbox tasks.</div>
                        <button className="mt-3 px-3 py-1.5 text-sm rounded-md border border-xithub-border hover:bg-[#21262d]">
                          Configure
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {utilityPanel === 'explore' && (
                  <div className="p-5 space-y-3">
                    {state.repos.map(repo => {
                      const owner = state.users.find(u => u.id === repo.ownerId);
                      return (
                        <button key={repo.id} onClick={() => navigate(`/${owner?.username}/${repo.name}`)} className="w-full text-left border border-xithub-border rounded-md p-3 hover:bg-[#161b22]">
                          <div className="font-semibold text-xithub-accent">{owner?.username}/{repo.name}</div>
                          <div className="text-sm text-xithub-muted">{repo.description}</div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {utilityPanel === 'account-settings' && (
                  <div className="p-5 space-y-4">
                    <label className="block">
                      <span className="text-sm font-semibold text-white">Display name</span>
                      <input value={user.name} readOnly className="mt-1 w-full bg-[#0d1117] border border-xithub-border rounded-md px-3 py-2 text-sm text-xithub-text" />
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked className="accent-xithub-accent" />
                      Email me local notification summaries
                    </label>
                    <button onClick={() => setUtilityPanel(null)} className="px-4 py-2 rounded-md bg-xithub-success text-white text-sm font-semibold">
                      Save preferences
                    </button>
                  </div>
                )}

                {utilityPanel === 'sign-out' && (
                  <div className="p-5">
                    <div className="border border-xithub-border rounded-md p-4 bg-[#0d1117]">
                      <div className="font-semibold text-white">Signed in as {user.username}</div>
                      <div className="text-sm text-xithub-muted mt-1">Use reset state in task setup to switch users; this local action closes the menu without external account changes.</div>
                      <button onClick={() => setUtilityPanel(null)} className="mt-4 px-4 py-2 rounded-md border border-xithub-border hover:bg-[#21262d] text-sm">
                        Stay signed in
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <main className="min-h-[calc(100vh-60px)]">
            <Outlet />
          </main>

          <KeyboardNav />
          <CommandPalette />
        </div>
      );
    }
