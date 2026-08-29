
import React, { useEffect, useState } from 'react';
import './MentionAutocomplete.css';

function MentionAutocomplete({ users, query, onSelect, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter users based on query
  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(query) ||
    user.fullName.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  ).slice(0, 5); // Limit to 5 results

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (filteredUsers.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
          break;
        case 'Enter':
          e.preventDefault();
          onSelect(filteredUsers[selectedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredUsers, selectedIndex, onSelect, onClose]);

  if (filteredUsers.length === 0) {
    return null;
  }

  return (
    <div className="mention-autocomplete">
      <div className="mention-autocomplete-header">
        Mention a user
      </div>
      <div className="mention-autocomplete-list">
        {filteredUsers.map((user, index) => (
          <div
            key={user.userId}
            className={`mention-autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => onSelect(user)}
          >
            <img
              src={user.avatar}
              alt={user.displayName}
              className="mention-user-avatar"
            />
            <div className="mention-user-info">
              <div className="mention-user-name">
                {user.displayName}
                <span className="mention-user-fullname">({user.fullName})</span>
              </div>
              <div className="mention-user-title">{user.title}</div>
            </div>
            <div className={`mention-user-status ${user.status}`}>
              {user.status === 'online' && '🟢'}
              {user.status === 'away' && '🟡'}
              {user.status === 'busy' && '🔴'}
            </div>
          </div>
        ))}
      </div>
      <div className="mention-autocomplete-footer">
        Use ↑ ↓ to navigate, Enter to select, Esc to dismiss
      </div>
    </div>
  );
}

export default MentionAutocomplete;
