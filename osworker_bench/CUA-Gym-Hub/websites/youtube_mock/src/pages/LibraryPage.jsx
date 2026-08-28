
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ListVideo } from 'lucide-react';
import { useData } from '../context/DataContext';
import './LibraryPage.css';

const LibraryPage = () => {
  const navigate = useNavigate();
  const { data } = useData();

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

  const historyVideos = data.user.watchHistory
    .slice(0, 6)
    .map(h => data.videos.find(v => v.videoId === h.videoId))
    .filter(Boolean);

  const watchLaterVideos = data.user.watchLater
    .slice(0, 6)
    .map(id => data.videos.find(v => v.videoId === id))
    .filter(Boolean);

  const likedVideos = data.user.likedVideos
    .slice(0, 6)
    .map(id => data.videos.find(v => v.videoId === id))
    .filter(Boolean);

  const userPlaylists = data.playlists.filter(p => p.creatorId === data.user.userId);

  return (
    <div className="library-page">
      <div className="library-user-section">
        <img src={data.user.avatar} alt={data.user.displayName} className="library-user-avatar" />
        <div className="library-user-info">
          <div className="library-user-name">{data.user.displayName}</div>
          <div className="library-user-handle">{data.user.handle}</div>
        </div>
      </div>

      <VideoCarouselSection
        title="History"
        videos={historyVideos}
        viewAllPath="/history"
        navigate={navigate}
        formatViewCount={formatViewCount}
        formatTimeAgo={formatTimeAgo}
      />

      <VideoCarouselSection
        title="Watch later"
        videos={watchLaterVideos}
        viewAllPath="/watch-later"
        navigate={navigate}
        formatViewCount={formatViewCount}
        formatTimeAgo={formatTimeAgo}
      />

      <VideoCarouselSection
        title="Liked videos"
        videos={likedVideos}
        viewAllPath="/liked"
        navigate={navigate}
        formatViewCount={formatViewCount}
        formatTimeAgo={formatTimeAgo}
      />

      <div className="library-section">
        <div className="library-section-header">
          <h2 className="library-section-title">Playlists</h2>
        </div>
        {userPlaylists.length === 0 ? (
          <div className="library-empty-text">No playlists</div>
        ) : (
          <PlaylistCarousel
            playlists={userPlaylists}
            videos={data.videos}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
};

const VideoCarouselSection = ({ title, videos, viewAllPath, navigate, formatViewCount, formatTimeAgo }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -460, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 460, behavior: 'smooth' });
  };

  return (
    <div className="library-section">
      <div className="library-section-header">
        <h2 className="library-section-title">{title}</h2>
        <button className="library-view-all" onClick={() => navigate(viewAllPath)}>View all</button>
      </div>
      {videos.length === 0 ? (
        <div className="library-empty-text">No videos</div>
      ) : (
        <div className="library-carousel-container">
          <button className="library-scroll-btn left" onClick={scrollLeft}>
            <ChevronLeft size={20} />
          </button>
          <div className="library-carousel" ref={scrollRef}>
            {videos.map(video => (
              <div
                key={video.videoId}
                className="library-video-card"
                onClick={() => navigate(`/watch/${video.videoId}`)}
              >
                <div className="library-thumb-container">
                  <img src={video.thumbnail} alt={video.title} />
                  <span className="library-duration-badge">{video.duration}</span>
                </div>
                <div className="library-card-title">{video.title}</div>
                <div className="library-card-channel">{video.channelName}</div>
                <div className="library-card-meta">
                  {formatViewCount(video.viewCount)} views &bull; {formatTimeAgo(video.uploadDate)}
                </div>
              </div>
            ))}
          </div>
          <button className="library-scroll-btn right" onClick={scrollRight}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

const PlaylistCarousel = ({ playlists, videos, navigate }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -460, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 460, behavior: 'smooth' });
  };

  const getPlaylistThumb = (playlist) => {
    if (playlist.videoIds.length > 0) {
      const firstVideo = videos.find(v => v.videoId === playlist.videoIds[0]);
      return firstVideo ? firstVideo.thumbnail : playlist.thumbnail;
    }
    return playlist.thumbnail;
  };

  return (
    <div className="library-carousel-container">
      <button className="library-scroll-btn left" onClick={scrollLeft}>
        <ChevronLeft size={20} />
      </button>
      <div className="library-carousel" ref={scrollRef}>
        {playlists.map(playlist => (
          <div
            key={playlist.playlistId}
            className="library-playlist-card"
            onClick={() => navigate(`/playlist/${playlist.playlistId}`)}
          >
            <div className="library-playlist-thumb">
              <img src={getPlaylistThumb(playlist)} alt={playlist.name} />
              <div className="library-playlist-overlay">
                <span className="library-playlist-count">
                  <ListVideo size={14} />
                  {playlist.videoIds.length} videos
                </span>
              </div>
            </div>
            <div className="library-playlist-name">{playlist.name}</div>
            <div className="library-playlist-meta">{playlist.privacy}</div>
          </div>
        ))}
      </div>
      <button className="library-scroll-btn right" onClick={scrollRight}>
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default LibraryPage;
