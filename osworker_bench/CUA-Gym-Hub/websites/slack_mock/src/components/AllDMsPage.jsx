
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../context/AppContext';
import { withCurrentSearch } from '../utils/navigation';
import './AllDMsPage.css';

function AllDMsPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#2BAC76';
      case 'away': return '#E8912D';
      case 'busy': return '#E01E5A';
      default: return '#CCCCCC';
    }
  };

  const filteredDMs = state.dms
    .filter(dm => {
      const otherUserId = dm.participants.find(id => id !== state.currentUser.userId);
      const otherUser = state.users.find(u => u.userId === otherUserId);
      return otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

  return (
    <div className="all-dms-page">
      <div className="all-dms-header">
        <h2>Direct Messages</h2>
        <input
          type="text"
          className="dm-search"
          placeholder="Search direct messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="dms-list">
        {filteredDMs.map(dm => {
          const otherUserId = dm.participants.find(id => id !== state.currentUser.userId);
          const otherUser = state.users.find(u => u.userId === otherUserId);

          return (
            <div
              key={dm.dmId}
              className={`dm-list-item ${dm.unreadCount > 0 ? 'has-unread' : ''}`}
              onClick={() => navigate(withCurrentSearch(`/dm/${dm.dmId}`, location.search))}
            >
              <div className="dm-list-avatar-container">
                <img src={otherUser.avatar} alt={otherUser.displayName} className="dm-list-avatar" />
                <span
                  className="dm-list-status-dot"
                  style={{ backgroundColor: getStatusColor(otherUser.status) }}
                />
              </div>
              <div className="dm-list-content">
                <div className="dm-list-header">
                  <span className="dm-list-name">{otherUser.fullName}</span>
                  <span className="dm-list-time">
                    {formatDistanceToNow(new Date(dm.lastTime), { addSuffix: true })}
                  </span>
                </div>
                <div className="dm-list-message">{dm.lastMessage}</div>
              </div>
              {dm.unreadCount > 0 && (
                <span className="dm-list-unread">{dm.unreadCount}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AllDMsPage;
