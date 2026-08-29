
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChannelsPage.css';

const ChannelsPage = () => {
  const navigate = useNavigate();
  const [playingVideo, setPlayingVideo] = useState(null);
  const [likedVideos, setLikedVideos] = useState({});
  const [followedCreators, setFollowedCreators] = useState({});
  const [starredVideos, setStarredVideos] = useState({});
  const [commentedVideos, setCommentedVideos] = useState({});
  const [activeTab, setActiveTab] = useState('推荐');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showComments, setShowComments] = useState(null);
  const [commentText, setCommentText] = useState('');

  const videos = [
    {
      id: 'v1',
      creator: '旅行摄影师小李',
      creatorAvatar: 'https://i.pravatar.cc/100?img=11',
      title: '日落时分的西湖，美得让人窒息',
      thumbnail: 'https://picsum.photos/400/700?random=channel1',
      likes: 12800,
      comments: 856,
      shares: 324,
      isFollowing: true
    },
    {
      id: 'v2',
      creator: '美食探店达人',
      creatorAvatar: 'https://i.pravatar.cc/100?img=22',
      title: '上海最好吃的小笼包，排队2小时也值得！',
      thumbnail: 'https://picsum.photos/400/700?random=channel2',
      likes: 45200,
      comments: 2340,
      shares: 1280,
      isFollowing: false
    },
    {
      id: 'v3',
      creator: '科技数码圈',
      creatorAvatar: 'https://i.pravatar.cc/100?img=33',
      title: '2025年最值得买的三款手机，你选哪个？',
      thumbnail: 'https://picsum.photos/400/700?random=channel3',
      likes: 8900,
      comments: 1567,
      shares: 890,
      isFollowing: true
    },
    {
      id: 'v4',
      creator: '健身教练Amy',
      creatorAvatar: 'https://i.pravatar.cc/100?img=44',
      title: '每天10分钟，在家就能练出马甲线',
      thumbnail: 'https://picsum.photos/400/700?random=channel4',
      likes: 23400,
      comments: 987,
      shares: 2100,
      isFollowing: false
    }
  ];

  const formatCount = (num) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const toggleLike = (videoId) => {
    setLikedVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  const toggleFollow = (creatorName) => {
    setFollowedCreators(prev => ({
      ...prev,
      [creatorName]: !prev[creatorName]
    }));
  };

  const toggleStar = (videoId) => {
    setStarredVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  const handleShare = (video) => {
    // Show a toast-style feedback (we just toggle a local state for visual feedback)
    setCommentedVideos(prev => ({ ...prev, [`share_${video.id}`]: true }));
    setTimeout(() => setCommentedVideos(prev => { const n = { ...prev }; delete n[`share_${video.id}`]; return n; }), 2000);
  };

  const filteredVideos = activeTab === '关注'
    ? videos.filter(v => v.isFollowing || followedCreators[v.creator])
    : videos;

  const displayVideos = searchQuery.trim()
    ? filteredVideos.filter(v => v.title.includes(searchQuery) || v.creator.includes(searchQuery))
    : filteredVideos;

  return (
    <div className="channels-page">
      <div className="channels-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <div className="channels-tabs">
          {['关注', '推荐', '热门'].map(tab => (
            <span
              key={tab}
              className={`channels-tab ${activeTab === tab ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveTab(tab)}
            >{tab}</span>
          ))}
        </div>
        <button className="channels-search-btn" onClick={() => setShowSearch(true)}>🔍</button>
      </div>

      {showSearch && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            placeholder="搜索视频号"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            style={{ flex: 1, padding: '6px 12px', border: '1px solid #ddd', borderRadius: '16px', fontSize: '14px', outline: 'none' }}
          />
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', color: '#576b95', cursor: 'pointer', fontSize: '14px' }}>取消</button>
        </div>
      )}

      <div className="channels-feed">
        {displayVideos.length === 0 && activeTab === '关注' ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📺</div>
            <p>关注创作者后，这里会显示他们的最新视频</p>
          </div>
        ) : (
          displayVideos.map(video => {
            const isCreatorFollowed = video.isFollowing || followedCreators[video.creator];
            return (
              <div key={video.id} className="channel-card">
                <div className="video-thumbnail-wrapper" onClick={() => setPlayingVideo(playingVideo === video.id ? null : video.id)}>
                  <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                  {playingVideo !== video.id && (
                    <div className="play-icon-overlay">
                      <div className="play-icon">▶</div>
                    </div>
                  )}
                  {playingVideo === video.id && (
                    <div className="video-playing-overlay">
                      <div className="video-playing-text">视频播放中...</div>
                      <div className="video-progress-bar">
                        <div className="video-progress-fill"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="video-info">
                  <div className="video-title">{video.title}</div>
                  <div className="video-creator-row">
                    <img src={video.creatorAvatar} alt={video.creator} className="creator-avatar" />
                    <span className="creator-name">{video.creator}</span>
                    {!isCreatorFollowed && (
                      <button className="follow-btn" onClick={() => toggleFollow(video.creator)}>+ 关注</button>
                    )}
                    {isCreatorFollowed && video.isFollowing === false && (
                      <button
                        className="follow-btn"
                        style={{ backgroundColor: '#f0f0f0', color: '#888', border: 'none' }}
                        onClick={() => toggleFollow(video.creator)}
                      >已关注</button>
                    )}
                  </div>
                  <div className="video-actions">
                    <button
                      className={`video-action-btn ${likedVideos[video.id] ? 'liked' : ''}`}
                      onClick={() => toggleLike(video.id)}
                    >
                      <span className="action-icon">{likedVideos[video.id] ? '❤️' : '🤍'}</span>
                      <span className="action-count">{formatCount(video.likes + (likedVideos[video.id] ? 1 : 0))}</span>
                    </button>
                    <button className="video-action-btn" onClick={() => setShowComments(video.id)}>
                      <span className="action-icon">💬</span>
                      <span className="action-count">{formatCount(video.comments + (commentedVideos[video.id] ? 1 : 0))}</span>
                    </button>
                    <button
                      className="video-action-btn"
                      onClick={() => handleShare(video)}
                      style={commentedVideos[`share_${video.id}`] ? { color: '#07c160' } : {}}
                    >
                      <span className="action-icon">↗️</span>
                      <span className="action-count">{formatCount(video.shares)}</span>
                    </button>
                    <button
                      className={`video-action-btn ${starredVideos[video.id] ? 'liked' : ''}`}
                      onClick={() => toggleStar(video.id)}
                    >
                      <span className="action-icon">{starredVideos[video.id] ? '⭐' : '☆'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comments Sheet */}
      {showComments && (
        <div className="dialog-overlay" onClick={() => setShowComments(null)}>
          <div
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderRadius: '16px 16px 0 0', maxHeight: '60vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>评论</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} onClick={() => setShowComments(null)}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', marginBottom: '12px' }}>抢沙发，发表第一条评论</div>
            </div>
            <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="说点什么..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '16px', fontSize: '14px', outline: 'none' }}
              />
              <button
                style={{ padding: '8px 16px', backgroundColor: commentText.trim() ? '#07c160' : '#ccc', color: '#fff', border: 'none', borderRadius: '16px', cursor: commentText.trim() ? 'pointer' : 'default', fontSize: '14px' }}
                onClick={() => {
                  if (commentText.trim()) {
                    setCommentedVideos(prev => ({ ...prev, [showComments]: true }));
                    setCommentText('');
                    setShowComments(null);
                  }
                }}
              >发送</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelsPage;

