import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trello as Xrello, Search, Bell, HelpCircle, X, Star, Users, Clock, ChevronDown, Layout, Settings, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Navbar = () => {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const users = state.users || {};
  const currentUser = users[state.currentUser];

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTimerRef = useRef(null);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null); // 'workspaces' | 'recent' | 'starred' | 'templates' | 'notifications' | 'profile' | null
  const [utilityPanel, setUtilityPanel] = useState(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (openDropdown && !e.target.closest('.navbar-dropdown-container')) {
        setOpenDropdown(null);
      }
      if (isSearchFocused && searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openDropdown, isSearchFocused]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setUtilityPanel(null);
        setOpenDropdown(null);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search logic with debounce
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimerRef.current = setTimeout(() => {
      const q = query.toLowerCase();
      const results = [];
      for (const cardId of Object.keys(state.cards)) {
        const card = state.cards[cardId];
        if (card.archived) continue;
        const board = state.boards[card.boardId];
        const list = state.lists[card.listId];
        if (!board || !list) continue;

        // Resolve label names for search
        const labelNames = (card.labelIds || [])
          .map(lid => (board.labels || []).find(l => l.id === lid))
          .filter(Boolean)
          .map(l => l.name.toLowerCase());

        const titleMatch = card.title.toLowerCase().includes(q);
        const descMatch = (card.description || '').toLowerCase().includes(q);
        const labelMatch = labelNames.some(n => n.includes(q));

        if (titleMatch || descMatch || labelMatch) {
          results.push({
            cardId: card.id,
            cardTitle: card.title,
            boardId: board.id,
            boardName: board.title,
            listName: list.title,
            boardBg: board.background
          });
        }
        if (results.length >= 10) break;
      }
      setSearchResults(results);
    }, 300);
  }, [state.cards, state.boards, state.lists]);

  const handleSearchResultClick = (result) => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
    navigate(`/board/${result.boardId}?openCard=${result.cardId}`);
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(prev => prev === name ? null : name);
  };

  // Collect all activities for notifications
  const allActivities = [];
  for (const cardId of Object.keys(state.cards)) {
    const card = state.cards[cardId];
    for (const comment of (card.comments || [])) {
      if (comment.type === 'activity') {
        allActivities.push({ ...comment, cardId: card.id, cardTitle: card.title, boardId: card.boardId });
      }
    }
  }
  allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const recentNotifications = allActivities.slice(0, 20);

  // Starred boards
  const starredBoards = state.boardOrder
    .map(id => state.boards[id])
    .filter(b => b && b.starred);

  // Recent boards (by lastVisitedAt or createdAt)
  const recentBoards = [...state.boardOrder]
    .map(id => state.boards[id])
    .filter(Boolean)
    .sort((a, b) => new Date(b.lastVisitedAt || b.createdAt) - new Date(a.lastVisitedAt || a.createdAt))
    .slice(0, 5);

  // Check unread notifications
  const lastReadTimestamp = state.lastReadNotificationAt || null;
  const hasUnread = recentNotifications.length > 0 && (!lastReadTimestamp || new Date(recentNotifications[0].createdAt) > new Date(lastReadTimestamp));

  const formatRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getBoardStyle = (bg) => {
    if (bg && bg.startsWith('http')) return { backgroundImage: `url(${bg})`, backgroundSize: 'cover' };
    return { backgroundColor: bg || '#0079BF' };
  };

  const openUtilityPanel = (panel) => {
    setOpenDropdown(null);
    setUtilityPanel(panel);
  };

  const panelTitle = {
    members: 'Workspace members',
    settings: 'Workspace settings',
    help: 'Help',
    profile: 'Profile and visibility',
    activity: 'Activity',
    cards: 'Cards',
    shortcuts: 'Keyboard shortcuts'
  }[utilityPanel];

  // Template boards
  const templateBoards = [
    { name: 'Kanban Template', bg: '#0079BF', lists: ['To Do', 'Doing', 'Done'] },
    { name: 'Project Management', bg: '#519839', lists: ['Backlog', 'Sprint', 'In Review', 'Done'] },
    { name: 'Weekly Planner', bg: '#D29034', lists: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    { name: 'Bug Tracker', bg: '#B04632', lists: ['Reported', 'Triaged', 'In Progress', 'Fixed'] },
  ];

  const handleCreateFromTemplate = (template) => {
    dispatch({
      type: 'ADD_BOARD_FROM_TEMPLATE',
      payload: {
        title: template.name,
        background: template.bg,
        visibility: 'workspace',
        lists: template.lists
      }
    });
    setOpenDropdown(null);
  };

  return (
    <>
    <nav className="h-12 bg-xrello-dark flex items-center justify-between px-4 text-white relative z-20">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <Xrello size={20} />
          <span className="font-bold text-lg tracking-tight">TrelloClone</span>
        </Link>
        <div className="hidden md:flex gap-1">
          {/* Workspaces Dropdown */}
          <div className="relative navbar-dropdown-container">
            <button
              onClick={() => toggleDropdown('workspaces')}
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${openDropdown === 'workspaces' ? 'bg-white/30' : 'hover:bg-white/20'}`}
            >
              Workspaces <ChevronDown size={14} />
            </button>
            {openDropdown === 'workspaces' && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl text-gray-800 p-3 z-50">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">My Workspace</h4>
                <div className="space-y-1 mb-3">
                  {state.boardOrder.map(id => {
                    const board = state.boards[id];
                    if (!board) return null;
                    return (
                      <Link
                        key={id}
                        to={`/board/${id}`}
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100"
                      >
                        <div className="w-8 h-6 rounded flex-shrink-0" style={getBoardStyle(board.background)}></div>
                        <span className="text-sm font-medium truncate">{board.title}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="border-t border-gray-200 pt-2 space-y-1">
                  <Link to="/" onClick={() => setOpenDropdown(null)} className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                    <Layout size={14} /> Boards
                  </Link>
                  <button
                    onClick={() => openUtilityPanel('members')}
                    className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded w-full text-left"
                    title="Workspace members management"
                  >
                    <Users size={14} /> Members
                  </button>
                  <button
                    onClick={() => openUtilityPanel('settings')}
                    className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded w-full text-left"
                    title="Workspace settings"
                  >
                    <Settings size={14} /> Settings
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Dropdown */}
          <div className="relative navbar-dropdown-container">
            <button
              onClick={() => toggleDropdown('recent')}
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${openDropdown === 'recent' ? 'bg-white/30' : 'hover:bg-white/20'}`}
            >
              Recent <ChevronDown size={14} />
            </button>
            {openDropdown === 'recent' && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl text-gray-800 p-3 z-50">
                {recentBoards.length === 0 ? (
                  <div className="text-sm text-gray-500 p-2">No recently viewed boards</div>
                ) : (
                  <div className="space-y-1">
                    {recentBoards.map(board => (
                      <Link
                        key={board.id}
                        to={`/board/${board.id}`}
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100"
                      >
                        <div className="w-8 h-6 rounded flex-shrink-0" style={getBoardStyle(board.background)}></div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">{board.title}</span>
                          {board.lastVisitedAt && (
                            <span className="text-xs text-gray-400">Viewed {formatRelativeTime(board.lastVisitedAt)}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Starred Dropdown */}
          <div className="relative navbar-dropdown-container">
            <button
              onClick={() => toggleDropdown('starred')}
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${openDropdown === 'starred' ? 'bg-white/30' : 'hover:bg-white/20'}`}
            >
              Starred <ChevronDown size={14} />
            </button>
            {openDropdown === 'starred' && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl text-gray-800 p-3 z-50">
                {starredBoards.length === 0 ? (
                  <div className="text-sm text-gray-500 p-2">No starred boards</div>
                ) : (
                  <div className="space-y-1">
                    {starredBoards.map(board => (
                      <Link
                        key={board.id}
                        to={`/board/${board.id}`}
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100"
                      >
                        <div className="w-8 h-6 rounded flex-shrink-0" style={getBoardStyle(board.background)}></div>
                        <span className="text-sm font-medium truncate">{board.title}</span>
                        <Star size={14} className="ml-auto text-yellow-500" fill="currentColor" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Templates Dropdown */}
          <div className="relative navbar-dropdown-container">
            <button
              onClick={() => toggleDropdown('templates')}
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${openDropdown === 'templates' ? 'bg-white/30' : 'hover:bg-white/20'}`}
            >
              Templates <ChevronDown size={14} />
            </button>
            {openDropdown === 'templates' && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl text-gray-800 p-3 z-50">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Template boards</h4>
                <div className="space-y-1">
                  {templateBoards.map(tmpl => (
                    <button
                      key={tmpl.name}
                      onClick={() => handleCreateFromTemplate(tmpl)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 text-left"
                    >
                      <div className="w-10 h-7 rounded flex-shrink-0" style={{ backgroundColor: tmpl.bg }}></div>
                      <div>
                        <span className="text-sm font-medium block">{tmpl.name}</span>
                        <span className="text-xs text-gray-400">{tmpl.lists.length} lists</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <Link to="/go" className="bg-white/20 px-2 py-1 rounded text-xs hover:bg-white/30">
          Debug State
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <Search size={16} className={`absolute left-2 top-1.5 ${isSearchFocused ? 'text-gray-400' : 'text-white'}`} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search"
            className={`pl-8 pr-2 py-1 rounded text-sm focus:outline-none transition-all ${
              isSearchFocused
                ? 'bg-white text-black placeholder-gray-400 w-72'
                : 'bg-white/20 placeholder-white text-white w-48'
            }`}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setIsSearchFocused(false); setSearchQuery(''); setSearchResults([]); }
              if (e.key === 'Enter' && searchResults.length > 0) { handleSearchResultClick(searchResults[0]); }
            }}
          />
          {isSearchFocused && searchQuery && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-xl text-gray-800 z-50 max-h-[400px] overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">No results</div>
              ) : (
                searchResults.map(result => (
                  <button
                    key={result.cardId}
                    onClick={() => handleSearchResultClick(result)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-0"
                  >
                    <div className="text-xs text-gray-400">{result.boardName}</div>
                    <div className="text-sm font-medium text-gray-800">{result.cardTitle}</div>
                    <div className="text-xs text-gray-400">{result.listName}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative navbar-dropdown-container">
          <button
            onClick={() => {
              toggleDropdown('notifications');
              if (openDropdown !== 'notifications') {
                dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
              }
            }}
            className={`p-1.5 rounded-full relative ${openDropdown === 'notifications' ? 'bg-white/30' : 'hover:bg-white/20'}`}
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
          {openDropdown === 'notifications' && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl text-gray-800 z-50 max-h-[400px] overflow-y-auto">
              <div className="p-3 border-b border-gray-200">
                <h4 className="font-semibold text-gray-700">Notifications</h4>
              </div>
              {recentNotifications.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
              ) : (
                recentNotifications.map(act => {
                  const actUser = users[act.userId];
                  return (
                    <button
                      key={act.id}
                      onClick={() => {
                        setOpenDropdown(null);
                        navigate(`/board/${act.boardId}?openCard=${act.cardId}`);
                      }}
                      className="w-full flex gap-2 px-3 py-2 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                        {actUser && <img src={actUser.avatarUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">
                          <span className="font-semibold">{actUser?.name || act.userId}</span>{' '}
                          <span className="text-gray-600">{act.text}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {act.cardTitle} &middot; {formatRelativeTime(act.createdAt)}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <button onClick={() => openUtilityPanel('help')} className="p-1.5 rounded-full hover:bg-white/20">
          <HelpCircle size={20} />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative navbar-dropdown-container">
          <button
            onClick={() => toggleDropdown('profile')}
            className="ml-2 rounded-full overflow-hidden w-8 h-8 border-2 border-transparent hover:border-white"
            title={currentUser ? currentUser.name : 'User'}
          >
            {currentUser ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              <img src="https://picsum.photos/100/100?random=user1" alt="User" />
            )}
          </button>
          {openDropdown === 'profile' && (
            <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-lg shadow-xl text-gray-800 z-50">
              <div className="p-3 border-b border-gray-200">
                <div className="font-semibold text-gray-800">{currentUser?.name || 'User'}</div>
                <div className="text-sm text-gray-500">{currentUser?.email || ''}</div>
              </div>
              <div className="py-1">
                <button onClick={() => openUtilityPanel('profile')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-600">
                  <User size={14} /> Profile and visibility
                </button>
                <button onClick={() => openUtilityPanel('activity')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-600">
                  Activity
                </button>
                <button onClick={() => openUtilityPanel('cards')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-600">
                  Cards
                </button>
              </div>
              <div className="border-t border-gray-200 py-1">
                <button onClick={() => openUtilityPanel('help')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-600">
                  Help
                </button>
                <button onClick={() => openUtilityPanel('shortcuts')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-600">
                  Shortcuts
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
    {utilityPanel && (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setUtilityPanel(null)}>
        <div className="bg-white text-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">{panelTitle}</h2>
            <button onClick={() => setUtilityPanel(null)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(80vh-64px)]">
            {utilityPanel === 'members' && (
              <div className="space-y-2">
                {Object.values(users).map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded bg-gray-50">
                    <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {utilityPanel === 'settings' && (
              <div className="space-y-3 text-sm">
                <label className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span>Workspace visibility</span>
                  <select className="border rounded px-2 py-1 bg-white" defaultValue="private">
                    <option value="private">Private</option>
                    <option value="workspace">Workspace</option>
                  </select>
                </label>
                <label className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span>Email notifications</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              </div>
            )}
            {utilityPanel === 'profile' && (
              <div className="flex gap-3">
                <img src={currentUser?.avatarUrl} alt={currentUser?.name} className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <div className="font-bold">{currentUser?.name}</div>
                  <div className="text-sm text-gray-500">{currentUser?.email}</div>
                  <div className="text-sm text-gray-600 mt-2">Username: {currentUser?.username}</div>
                </div>
              </div>
            )}
            {utilityPanel === 'activity' && (
              <div className="space-y-2">
                {recentNotifications.slice(0, 10).map(act => (
                  <button
                    key={act.id}
                    onClick={() => {
                      setUtilityPanel(null);
                      navigate(`/board/${act.boardId}?openCard=${act.cardId}`);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
                  >
                    <span className="font-semibold">{users[act.userId]?.name || act.userId}</span> {act.text}
                    <div className="text-xs text-gray-500">{act.cardTitle} · {formatRelativeTime(act.createdAt)}</div>
                  </button>
                ))}
              </div>
            )}
            {utilityPanel === 'cards' && (
              <div className="space-y-2">
                {Object.values(state.cards)
                  .filter(card => (card.memberIds || []).includes(state.currentUser) && !card.archived)
                  .slice(0, 20)
                  .map(card => (
                    <button
                      key={card.id}
                      onClick={() => {
                        setUtilityPanel(null);
                        navigate(`/board/${card.boardId}?openCard=${card.id}`);
                      }}
                      className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
                    >
                      <div className="font-semibold">{card.title}</div>
                      <div className="text-xs text-gray-500">{state.boards[card.boardId]?.title} · {state.lists[card.listId]?.title}</div>
                    </button>
                  ))}
              </div>
            )}
            {utilityPanel === 'help' && (
              <div className="space-y-3 text-sm">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded">Use boards, lists, and cards to organize local sandbox work. Changes persist to the current session state.</div>
                <button onClick={() => openUtilityPanel('shortcuts')} className="w-full text-left bg-gray-100 hover:bg-gray-200 p-2 rounded">View keyboard shortcuts</button>
                <button onClick={() => openUtilityPanel('cards')} className="w-full text-left bg-gray-100 hover:bg-gray-200 p-2 rounded">View assigned cards</button>
              </div>
            )}
            {utilityPanel === 'shortcuts' && (
              <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                <kbd className="bg-gray-100 rounded px-2 py-1 text-center">Enter</kbd><span>Save card or list text</span>
                <kbd className="bg-gray-100 rounded px-2 py-1 text-center">Esc</kbd><span>Close menus and dialogs</span>
                <kbd className="bg-gray-100 rounded px-2 py-1 text-center">/</kbd><span>Focus search</span>
                <kbd className="bg-gray-100 rounded px-2 py-1 text-center">Drag</kbd><span>Move cards and lists</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar;
