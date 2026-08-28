
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import './ChannelPage.css';

const ChannelPage = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { data, toggleSubscription, showToast } = useData();
  const [activeTab, setActiveTab] = useState('home');

  const channel = data.channels.find(c => c.channelId === channelId);
  const channelVideos = data.videos.filter(v => v.channelId === channelId);
  const channelPlaylists = data.playlists.filter(p => p.creatorId === channelId);
  const isSubscribed = channel ? data.user.subscribedChannels.includes(channelId) : false;
  const communityPosts = data.communityPosts?.[channelId] || [];
  const channelShorts = (data.shorts || []).filter(s => s.channelId === channelId);

  if (!channel) {
    return <div className="channel-not-found">Channel not found</div>;
  }

  const formatViewCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    return 'Today';
  };

  const handleSubscribe = () => {
    toggleSubscription(channelId);
    showToast(isSubscribed ? 'Unsubscribed' : 'Subscribed');
  };

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  const tabs = ['Home', 'Videos', 'Shorts', 'Playlists', 'Community', 'About'];

  return (
    <div className="channel-page">
      <div className="channel-banner-container">
        <img src={channel.banner} alt={channel.name} className="channel-banner" />
      </div>

      <div className="channel-header">
        <div className="channel-header-content">
          <img src={channel.avatar} alt={channel.name} className="channel-avatar-xl" />
          <div className="channel-info">
            <div className="channel-name-row">
              <h1 className="channel-name-large">{channel.name}</h1>
              {channel.verified && (
                <CheckCircle size={14} className="channel-verified-badge" />
              )}
            </div>
            <div className="channel-meta-line">
              <span className="channel-handle">{channel.handle}</span>
              <span className="channel-meta-dot">.</span>
              <span>{formatViewCount(channel.subscriberCount)} subscribers</span>
              <span className="channel-meta-dot">.</span>
              <span>{channel.videoCount} videos</span>
            </div>
            <div className="channel-description-preview">
              {channel.description.slice(0, 80)}{channel.description.length > 80 ? '...' : ''}
            </div>
          </div>
          <div className="channel-header-actions">
            <button
              className={`subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
              onClick={handleSubscribe}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
            {isSubscribed && (
              <button className="notification-bell-button" onClick={() => showToast('Notifications updated')}>
                <Bell size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="channel-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`channel-tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.toLowerCase())}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="channel-content">
        {activeTab === 'home' && (
          <div>
            {channelVideos.length > 0 && (
              <div className="channel-section">
                <h2 className="channel-section-title">Videos</h2>
                <div className="channel-videos-grid">
                  {channelVideos.slice(0, 8).map(video => (
                    <div
                      key={video.videoId}
                      className="video-card"
                      onClick={() => handleVideoClick(video.videoId)}
                    >
                      <div className="video-thumbnail-container">
                        <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                        <span className="video-duration">{video.duration}</span>
                      </div>
                      <div className="video-info" style={{ paddingRight: 0 }}>
                        <div className="video-details" style={{ marginLeft: 0 }}>
                          <div className="video-title">{video.title}</div>
                          <div className="video-metadata">
                            {formatViewCount(video.viewCount)} views . {formatTimeAgo(video.uploadDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="channel-videos-grid">
            {channelVideos.length === 0 ? (
              <div className="channel-empty">This channel has no videos</div>
            ) : (
              channelVideos.map(video => (
                <div
                  key={video.videoId}
                  className="video-card"
                  onClick={() => handleVideoClick(video.videoId)}
                >
                  <div className="video-thumbnail-container">
                    <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                    <span className="video-duration">{video.duration}</span>
                  </div>
                  <div className="video-info" style={{ paddingRight: 0 }}>
                    <div className="video-details" style={{ marginLeft: 0 }}>
                      <div className="video-title">{video.title}</div>
                      <div className="video-metadata">
                        {formatViewCount(video.viewCount)} views . {formatTimeAgo(video.uploadDate)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'shorts' && (
          <div className="channel-shorts-grid">
            {channelShorts.length === 0 ? (
              <div className="channel-empty">This channel has no Shorts</div>
            ) : (
              channelShorts.map(short => (
                <div key={short.shortId} className="channel-short-card" onClick={() => navigate('/shorts')}>
                  <div className="channel-short-thumb">
                    <img src={short.thumbnail} alt={short.title} />
                    <div className="channel-short-views">{formatViewCount(short.viewCount)} views</div>
                  </div>
                  <div className="channel-short-title">{short.title}</div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div>
            {channelPlaylists.length === 0 ? (
              <div className="channel-empty">No playlists available</div>
            ) : (
              <div className="channel-videos-grid">
                {channelPlaylists.map(playlist => {
                  const firstVideo = playlist.videoIds.length > 0
                    ? data.videos.find(v => v.videoId === playlist.videoIds[0])
                    : null;
                  return (
                    <div
                      key={playlist.playlistId}
                      className="video-card"
                      onClick={() => navigate(`/playlist/${playlist.playlistId}`)}
                    >
                      <div className="video-thumbnail-container">
                        <img
                          src={firstVideo ? firstVideo.thumbnail : 'https://picsum.photos/seed/pldefault/640/360'}
                          alt={playlist.name}
                          className="video-thumbnail"
                        />
                        <span className="video-duration">{playlist.videoIds.length} videos</span>
                      </div>
                      <div className="video-info" style={{ paddingRight: 0 }}>
                        <div className="video-details" style={{ marginLeft: 0 }}>
                          <div className="video-title">{playlist.name}</div>
                          <div className="video-metadata">
                            {playlist.privacy} . {playlist.videoIds.length} videos
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'community' && (
          <div className="channel-community">
            {communityPosts.length === 0 ? (
              <div className="channel-empty">No community posts yet</div>
            ) : (
              communityPosts.map(post => (
                <div key={post.postId} className="community-post">
                  <div className="community-post-header">
                    <img src={channel.avatar} alt={channel.name} className="community-post-avatar" />
                    <div>
                      <span className="community-post-author">{channel.name}</span>
                      <span className="community-post-time">{formatTimeAgo(post.timestamp)}</span>
                    </div>
                  </div>
                  <div className="community-post-text">{post.text}</div>
                  <div className="community-post-actions">
                    <span className="community-post-stat">{formatViewCount(post.likeCount)} likes</span>
                    <span className="community-post-stat">{post.commentCount} comments</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="channel-about">
            <div className="about-section">
              <h3>Description</h3>
              <p>{channel.description}</p>
            </div>
            <div className="about-section">
              <h3>Stats</h3>
              <p>Joined {new Date(channel.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>{formatViewCount(channel.subscriberCount)} subscribers</p>
              <p>{channel.videoCount} videos</p>
            </div>
            {channel.links && channel.links.length > 0 && (
              <div className="about-section">
                <h3>Links</h3>
                <div className="about-links">
                  {channel.links.map((link, index) => (
                    <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="about-link">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelPage;
