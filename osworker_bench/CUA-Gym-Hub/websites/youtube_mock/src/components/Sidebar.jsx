
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Play, Folder, User, History, Clock, ThumbsUp, ListVideo, TrendingUp, Music, Gamepad2, Newspaper, Trophy, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { useData } from '../context/DataContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, isMini }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, showToast } = useData();
  const [showAllSubscriptions, setShowAllSubscriptions] = useState(false);

  const isActive = (path) => location.pathname === path;

  const allSubscribedChannels = data.channels.filter(channel =>
    data.user.subscribedChannels.includes(channel.channelId)
  );

  const subscribedChannels = showAllSubscriptions
    ? allSubscribedChannels
    : allSubscribedChannels.slice(0, 7);

  const handleExploreCategory = (category) => {
    navigate(`/trending?category=${encodeURIComponent(category)}`);
  };

  return (
    <aside className={`sidebar ${isMini ? 'mini' : ''} ${!isOpen ? 'closed' : ''}`}>
      <div className="sidebar-section">
        <Link to="/" className={`sidebar-item ${isActive('/') ? 'active' : ''}`}>
          <Home size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">Home</span>
        </Link>
        <Link to="/shorts" className={`sidebar-item ${isActive('/shorts') ? 'active' : ''}`}>
          <Play size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">Shorts</span>
        </Link>
        <Link to="/subscriptions" className={`sidebar-item ${isActive('/subscriptions') ? 'active' : ''}`}>
          <Folder size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">Subscriptions</span>
        </Link>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">You</div>
        <Link to={`/channel/${data.user.userId}`} className="sidebar-item">
          <User size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">Your channel</span>
        </Link>
        <Link to="/history" className={`sidebar-item ${isActive('/history') ? 'active' : ''}`}>
          <History size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">History</span>
        </Link>
        <Link to="/watch-later" className={`sidebar-item ${isActive('/watch-later') ? 'active' : ''}`}>
          <Clock size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">Watch later</span>
        </Link>
        <Link to="/liked" className={`sidebar-item ${isActive('/liked') ? 'active' : ''}`}>
          <ThumbsUp size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">Liked videos</span>
        </Link>
        <Link to="/library" className={`sidebar-item ${isActive('/library') ? 'active' : ''}`}>
          <ListVideo size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">Library</span>
        </Link>
      </div>

      {allSubscribedChannels.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">Subscriptions</div>
          {subscribedChannels.map(channel => (
            <Link
              key={channel.channelId}
              to={`/channel/${channel.channelId}`}
              className="subscription-item"
            >
              <img src={channel.avatar} alt={channel.name} className="subscription-avatar" />
              <span className="subscription-name">{channel.name}</span>
            </Link>
          ))}
          {allSubscribedChannels.length > 7 && (
            <button
              className="show-more-button"
              onClick={() => setShowAllSubscriptions(!showAllSubscriptions)}
            >
              {showAllSubscriptions ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              <span>
                {showAllSubscriptions
                  ? 'Show less'
                  : `Show ${allSubscribedChannels.length - 7} more`}
              </span>
            </button>
          )}
        </div>
      )}

      <div className="sidebar-section">
        <div className="sidebar-section-title">Explore</div>
        <Link to="/trending" className={`sidebar-item ${isActive('/trending') ? 'active' : ''}`}>
          <TrendingUp size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">Trending</span>
        </Link>
        <div className="sidebar-item" style={{ cursor: 'pointer' }} onClick={() => handleExploreCategory('Music')}>
          <Music size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">Music</span>
        </div>
        <div className="sidebar-item" style={{ cursor: 'pointer' }} onClick={() => handleExploreCategory('Gaming')}>
          <Gamepad2 size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">Gaming</span>
        </div>
        <div className="sidebar-item" style={{ cursor: 'pointer' }} onClick={() => handleExploreCategory('News')}>
          <Newspaper size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">News</span>
        </div>
        <div className="sidebar-item" style={{ cursor: 'pointer' }} onClick={() => handleExploreCategory('Sports')}>
          <Trophy size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">Sports</span>
        </div>
        <div className="sidebar-item" style={{ cursor: 'pointer' }} onClick={() => handleExploreCategory('Learning')}>
          <GraduationCap size={24} className="sidebar-item-icon" />
          <span className="sidebar-item-text">Learning</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-links">
          <span>About</span>
          <span>Press</span>
          <span>Copyright</span>
          <span>Contact us</span>
          <span>Creators</span>
          <span>Advertise</span>
          <span>Developers</span>
        </div>
        <div className="sidebar-footer-links">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Policy & Safety</span>
          <span>How XouTube works</span>
          <span>Test new features</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
  