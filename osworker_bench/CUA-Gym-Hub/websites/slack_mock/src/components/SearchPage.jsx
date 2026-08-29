
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';
import './SearchPage.css';

function SearchPage() {
  const { state, createDM } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter state
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterIn, setFilterIn] = useState(null);
  const [filterHas, setFilterHas] = useState(null);
  const [filterDate, setFilterDate] = useState(null);

  // Dropdown visibility
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showInDropdown, setShowInDropdown] = useState(false);
  const [showHasDropdown, setShowHasDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const [fromQuery, setFromQuery] = useState('');
  const [inQuery, setInQuery] = useState('');

  const fromRef = useRef(null);
  const inRef = useRef(null);
  const hasRef = useRef(null);
  const dateRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) setShowFromDropdown(false);
      if (inRef.current && !inRef.current.contains(e.target)) setShowInDropdown(false);
      if (hasRef.current && !hasRef.current.contains(e.target)) setShowHasDropdown(false);
      if (dateRef.current && !dateRef.current.contains(e.target)) setShowDateDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchResults = {
    messages: [],
    channels: [],
    people: []
  };

  if (searchQuery.trim() || filterFrom || filterIn || filterHas || filterDate) {
    const query = searchQuery.toLowerCase();

    Object.entries(state.messages).forEach(([key, messages]) => {
      messages.forEach(msg => {
        const matchesQuery = !query || msg.content.toLowerCase().includes(query);
        const matchesFrom = !filterFrom || msg.senderId === filterFrom.userId;
        const matchesIn = !filterIn || key === filterIn.channelId || key === filterIn.dmId;
        const matchesHas = !filterHas ||
          (filterHas === 'reactions' && msg.reactions && msg.reactions.length > 0) ||
          (filterHas === 'files' && msg.attachments && msg.attachments.length > 0) ||
          (filterHas === 'links' && msg.content.match(/https?:\/\//));
        const matchesDate = !filterDate ||
          (filterDate === 'today' && isToday(msg.timestamp)) ||
          (filterDate === 'week' && isThisWeek(msg.timestamp)) ||
          (filterDate === 'month' && isThisMonth(msg.timestamp));

        if (matchesQuery && matchesFrom && matchesIn && matchesHas && matchesDate) {
          const sender = state.users.find(u => u.userId === msg.senderId);
          const channel = state.channels.find(ch => ch.channelId === key);
          const dm = state.dms.find(d => d.dmId === key);

          searchResults.messages.push({
            ...msg,
            sender,
            channel,
            dm,
            locationKey: key
          });
        }
      });
    });

    if (!filterFrom && !filterIn && !filterHas && !filterDate) {
      state.channels.forEach(channel => {
        if (channel.name.toLowerCase().includes(query) ||
            channel.description.toLowerCase().includes(query)) {
          searchResults.channels.push(channel);
        }
      });

      state.users.forEach(user => {
        if (user.fullName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)) {
          searchResults.people.push(user);
        }
      });
    }
  }

  function isToday(ts) {
    const d = new Date(ts);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }

  function isThisWeek(ts) {
    const d = new Date(ts);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 3600000);
    return d >= weekAgo;
  }

  function isThisMonth(ts) {
    const d = new Date(ts);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  const handleMessageClick = (result) => {
    if (result.channel) {
      navigate(withCurrentSearch(`/channel/${result.channel.channelId}`, location.search));
    } else if (result.dm) {
      navigate(withCurrentSearch(`/dm/${result.dm.dmId}`, location.search));
    }
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="search-highlight">{part}</mark>
        : part
    );
  };

  const hasActiveFilters = filterFrom || filterIn || filterHas || filterDate;

  const clearAllFilters = () => {
    setFilterFrom(null);
    setFilterIn(null);
    setFilterHas(null);
    setFilterDate(null);
  };

  const filteredUsers = state.users.filter(u =>
    u.fullName.toLowerCase().includes(fromQuery.toLowerCase()) ||
    u.displayName.toLowerCase().includes(fromQuery.toLowerCase())
  );

  const filteredChannels = state.channels.filter(ch =>
    ch.name.toLowerCase().includes(inQuery.toLowerCase())
  );

  return (
    <div className="search-page">
      <div className="search-header">
        <input
          type="text"
          className="search-input"
          placeholder="Search messages, channels, and people..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="search-filters">
        <div className="filter-chip-wrapper" ref={fromRef}>
          <button
            className={`filter-chip ${filterFrom ? 'active' : ''}`}
            onClick={() => { setShowFromDropdown(!showFromDropdown); setShowInDropdown(false); setShowHasDropdown(false); setShowDateDropdown(false); }}
          >
            {filterFrom ? (
              <>
                <span className="filter-chip-label">From:</span>
                <span className="filter-chip-value">{filterFrom.displayName}</span>
                <span className="filter-chip-remove" onClick={(e) => { e.stopPropagation(); setFilterFrom(null); }}>&#10005;</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zm0 1a5 5 0 1 1 0 10A5 5 0 0 1 8 3zm-1.5 2.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zM5 9.5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v.5H5v-.5z"/></svg>
                From
                <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" className="filter-chevron"><path d="M4 6l4 4 4-4"/></svg>
              </>
            )}
          </button>
          {showFromDropdown && (
            <div className="filter-dropdown">
              <input
                type="text"
                className="filter-dropdown-search"
                placeholder="Search people..."
                value={fromQuery}
                onChange={(e) => setFromQuery(e.target.value)}
                autoFocus
              />
              <div className="filter-dropdown-list">
                {filteredUsers.map(user => (
                  <div
                    key={user.userId}
                    className="filter-dropdown-item"
                    onClick={() => { setFilterFrom(user); setShowFromDropdown(false); setFromQuery(''); }}
                  >
                    <img src={user.avatar} alt={user.displayName} className="filter-dropdown-avatar" />
                    <span>{user.fullName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="filter-chip-wrapper" ref={inRef}>
          <button
            className={`filter-chip ${filterIn ? 'active' : ''}`}
            onClick={() => { setShowInDropdown(!showInDropdown); setShowFromDropdown(false); setShowHasDropdown(false); setShowDateDropdown(false); }}
          >
            {filterIn ? (
              <>
                <span className="filter-chip-label">In:</span>
                <span className="filter-chip-value">#{filterIn.name || filterIn.dmId}</span>
                <span className="filter-chip-remove" onClick={(e) => { e.stopPropagation(); setFilterIn(null); }}>&#10005;</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M5.37 2.257a.75.75 0 0 1 .632.853L5.175 7.5H8.62l.895-4.89a.75.75 0 0 1 1.484.28L10.175 7.5H13a.75.75 0 0 1 0 1.5h-3.1l-.73 4H12a.75.75 0 0 1 0 1.5H8.895l-.9 4.89a.75.75 0 0 1-1.484-.28L7.34 14.5H3.895l-.9 4.89a.75.75 0 0 1-1.484-.28L2.34 14.5H1a.75.75 0 0 1 0-1.5h1.62l.73-4H1a.75.75 0 0 1 0-1.5h2.62l.898-4.89a.75.75 0 0 1 .853-.632zM4.895 9l-.73 4h3.465l.73-4H4.895z"/></svg>
                In
                <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" className="filter-chevron"><path d="M4 6l4 4 4-4"/></svg>
              </>
            )}
          </button>
          {showInDropdown && (
            <div className="filter-dropdown">
              <input
                type="text"
                className="filter-dropdown-search"
                placeholder="Search channels..."
                value={inQuery}
                onChange={(e) => setInQuery(e.target.value)}
                autoFocus
              />
              <div className="filter-dropdown-list">
                {filteredChannels.map(ch => (
                  <div
                    key={ch.channelId}
                    className="filter-dropdown-item"
                    onClick={() => { setFilterIn(ch); setShowInDropdown(false); setInQuery(''); }}
                  >
                    <span className="filter-dropdown-hash">#</span>
                    <span>{ch.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="filter-chip-wrapper" ref={dateRef}>
          <button
            className={`filter-chip ${filterDate ? 'active' : ''}`}
            onClick={() => { setShowDateDropdown(!showDateDropdown); setShowFromDropdown(false); setShowInDropdown(false); setShowHasDropdown(false); }}
          >
            {filterDate ? (
              <>
                <span className="filter-chip-label">Date:</span>
                <span className="filter-chip-value">{filterDate === 'today' ? 'Today' : filterDate === 'week' ? 'This week' : 'This month'}</span>
                <span className="filter-chip-remove" onClick={(e) => { e.stopPropagation(); setFilterDate(null); }}>&#10005;</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M4.5 1a.5.5 0 0 1 .5.5V3h6V1.5a.5.5 0 0 1 1 0V3h1.5A1.5 1.5 0 0 1 15 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-9A1.5 1.5 0 0 1 2.5 3H4V1.5a.5.5 0 0 1 .5-.5zM2.5 4a.5.5 0 0 0-.5.5V6h12V4.5a.5.5 0 0 0-.5-.5h-11zM2 7v6.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V7H2z"/></svg>
                Date
                <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" className="filter-chevron"><path d="M4 6l4 4 4-4"/></svg>
              </>
            )}
          </button>
          {showDateDropdown && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-list">
                <div className="filter-dropdown-item" onClick={() => { setFilterDate('today'); setShowDateDropdown(false); }}>Today</div>
                <div className="filter-dropdown-item" onClick={() => { setFilterDate('week'); setShowDateDropdown(false); }}>This week</div>
                <div className="filter-dropdown-item" onClick={() => { setFilterDate('month'); setShowDateDropdown(false); }}>This month</div>
              </div>
            </div>
          )}
        </div>

        <div className="filter-chip-wrapper" ref={hasRef}>
          <button
            className={`filter-chip ${filterHas ? 'active' : ''}`}
            onClick={() => { setShowHasDropdown(!showHasDropdown); setShowFromDropdown(false); setShowInDropdown(false); setShowDateDropdown(false); }}
          >
            {filterHas ? (
              <>
                <span className="filter-chip-label">Has:</span>
                <span className="filter-chip-value">{filterHas}</span>
                <span className="filter-chip-remove" onClick={(e) => { e.stopPropagation(); setFilterHas(null); }}>&#10005;</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/><path d="M8 4a.75.75 0 0 1 .75.75v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5A.75.75 0 0 1 8 4z"/></svg>
                Has
                <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" className="filter-chevron"><path d="M4 6l4 4 4-4"/></svg>
              </>
            )}
          </button>
          {showHasDropdown && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-list">
                <div className="filter-dropdown-item" onClick={() => { setFilterHas('reactions'); setShowHasDropdown(false); }}>Reactions</div>
                <div className="filter-dropdown-item" onClick={() => { setFilterHas('files'); setShowHasDropdown(false); }}>Files</div>
                <div className="filter-dropdown-item" onClick={() => { setFilterHas('links'); setShowHasDropdown(false); }}>Links</div>
              </div>
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <button className="filter-clear-btn" onClick={clearAllFilters}>
            Clear all
          </button>
        )}
      </div>

      <div className="search-tabs">
        <button
          className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`search-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages ({searchResults.messages.length})
        </button>
        <button
          className={`search-tab ${activeTab === 'channels' ? 'active' : ''}`}
          onClick={() => setActiveTab('channels')}
        >
          Channels ({searchResults.channels.length})
        </button>
        <button
          className={`search-tab ${activeTab === 'people' ? 'active' : ''}`}
          onClick={() => setActiveTab('people')}
        >
          People ({searchResults.people.length})
        </button>
      </div>

      <div className="search-results">
        {!searchQuery.trim() && !hasActiveFilters && (
          <div className="search-empty">
            <p>Start typing to search</p>
          </div>
        )}

        {(searchQuery.trim() || hasActiveFilters) && (activeTab === 'all' || activeTab === 'messages') && searchResults.messages.length > 0 && (
          <div className="search-section">
            <h3>Messages</h3>
            {searchResults.messages.map(result => (
              <div
                key={result.messageId}
                className="search-result-item"
                onClick={() => handleMessageClick(result)}
              >
                <img src={result.sender.avatar} alt={result.sender.displayName} className="result-avatar" />
                <div className="result-content">
                  <div className="result-meta">
                    <span className="result-sender">{result.sender.fullName}</span>
                    <span className="result-location">
                      {result.channel ? `#${result.channel.name}` : 'Direct Message'}
                    </span>
                    <span className="result-time">
                      {formatDistanceToNow(new Date(result.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="result-text">{highlightMatch(result.content, searchQuery)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(searchQuery.trim() || hasActiveFilters) && (activeTab === 'all' || activeTab === 'channels') && searchResults.channels.length > 0 && (
          <div className="search-section">
            <h3>Channels</h3>
            {searchResults.channels.map(channel => (
              <div
                key={channel.channelId}
                className="search-result-item"
                onClick={() => navigate(withCurrentSearch(`/channel/${channel.channelId}`, location.search))}
              >
                <div className="result-icon">{channel.isPrivate ? '🔒' : '#'}</div>
                <div className="result-content">
                  <div className="result-name">{channel.name}</div>
                  <div className="result-desc">{channel.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(searchQuery.trim() || hasActiveFilters) && (activeTab === 'all' || activeTab === 'people') && searchResults.people.length > 0 && (
          <div className="search-section">
            <h3>People</h3>
            {searchResults.people.map(person => {
              const existingDm = state.dms.find(d =>
                d.participants.includes(person.userId) &&
                d.participants.includes(state.currentUser.userId)
              );
              return (
                <div
                  key={person.userId}
                  className="search-result-item"
                  onClick={() => {
                    if (existingDm) {
                      navigate(withCurrentSearch(`/dm/${existingDm.dmId}`, location.search));
                    } else {
                      const newDmId = createDM(person.userId);
                      if (newDmId) navigate(withCurrentSearch(`/dm/${newDmId}`, location.search));
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={person.avatar} alt={person.displayName} className="result-avatar" />
                  <div className="result-content">
                    <div className="result-name">{person.fullName}</div>
                    <div className="result-desc">{person.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(searchQuery.trim() || hasActiveFilters) &&
         searchResults.messages.length === 0 &&
         searchResults.channels.length === 0 &&
         searchResults.people.length === 0 && (
          <div className="search-empty">
            <p>No results found{searchQuery ? ` for "${searchQuery}"` : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
