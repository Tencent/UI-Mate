
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';
import './QuickSwitcher.css';

function QuickSwitcher({ isOpen, onClose }) {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !state) return null;

  const lowerQuery = query.toLowerCase().trim();

  // Build filtered results: channels first, then DMs
  const channelResults = state.channels
    .filter(ch => !lowerQuery || ch.name.toLowerCase().includes(lowerQuery))
    .map(ch => ({
      type: 'channel',
      id: ch.channelId,
      name: ch.name,
      isPrivate: ch.isPrivate,
      path: `/channel/${ch.channelId}`
    }));

  const dmResults = state.dms
    .map(dm => {
      const otherUser = state.users.find(u =>
        u.userId !== state.currentUser.userId && dm.participants.includes(u.userId)
      );
      return otherUser ? {
        type: 'dm',
        id: dm.dmId,
        name: otherUser.displayName,
        fullName: otherUser.fullName,
        avatar: otherUser.avatar,
        path: `/dm/${dm.dmId}`
      } : null;
    })
    .filter(Boolean)
    .filter(dm => !lowerQuery || dm.name.toLowerCase().includes(lowerQuery) || dm.fullName.toLowerCase().includes(lowerQuery));

  const allResults = [...channelResults, ...dmResults].slice(0, 10);

  const handleSelect = (result) => {
    navigate(withCurrentSearch(result.path, location.search));
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && allResults.length > 0) {
      handleSelect(allResults[0]);
    }
  };

  return (
    <div className="quick-switcher-overlay" onClick={onClose}>
      <div className="quick-switcher-modal" onClick={e => e.stopPropagation()}>
        <div className="quick-switcher-input-wrapper">
          <svg className="quick-switcher-search-icon" viewBox="0 0 16 16" width="16" height="16" fill="#616061">
            <path d="M11.5 7a4.5 4.5 0 1 0-2.03 3.77l3.13 3.13a.75.75 0 1 0 1.06-1.06l-3.13-3.13A4.5 4.5 0 0 0 11.5 7zM7 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="quick-switcher-input"
            placeholder="Search for channels, people, or DMs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        {allResults.length > 0 && (
          <div className="quick-switcher-results">
            {allResults.map(result => (
              <div
                key={result.id}
                className="quick-switcher-item"
                onClick={() => handleSelect(result)}
              >
                {result.type === 'channel' ? (
                  <span className="quick-switcher-icon">
                    {result.isPrivate ? (
                      <svg viewBox="0 0 16 16" width="16" height="16" fill="#616061"><path d="M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zm2.5 6h-5V5a2.5 2.5 0 0 1 5 0v2z"/></svg>
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: '16px', color: '#616061' }}>#</span>
                    )}
                  </span>
                ) : (
                  <img src={result.avatar} alt={result.name} className="quick-switcher-avatar" />
                )}
                <span className="quick-switcher-name">{result.type === 'channel' ? result.name : result.fullName}</span>
                <span className="quick-switcher-hint">{result.type === 'channel' ? 'Channel' : 'Direct Message'}</span>
              </div>
            ))}
          </div>
        )}
        {lowerQuery && allResults.length === 0 && (
          <div className="quick-switcher-empty">
            No results for "{query}"
          </div>
        )}
        <div className="quick-switcher-footer">
          <span className="quick-switcher-tip">
            <kbd>Enter</kbd> to select &middot; <kbd>Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}

export default QuickSwitcher;
