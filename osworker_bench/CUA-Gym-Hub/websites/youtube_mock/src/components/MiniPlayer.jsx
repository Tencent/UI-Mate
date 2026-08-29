
import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, X, Maximize2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import './MiniPlayer.css';

const MiniPlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { miniPlayer, setMiniPlayer } = useData();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(true);

  useEffect(() => {
    if (location.pathname.startsWith('/watch/')) {
      setMiniPlayer(null);
    }
  }, [location, setMiniPlayer]);

  if (!miniPlayer || location.pathname.startsWith('/watch/')) {
    return null;
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleExpand = () => {
    navigate(`/watch/${miniPlayer.videoId}`);
  };

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setMiniPlayer(null);
  };

  return (
    <div className="mini-player" ref={playerRef}>
      <video
        ref={videoRef}
        className="mini-player-video"
        src={miniPlayer.videoUrl}
        autoPlay
      />
      <div className="mini-player-controls">
        <div className="mini-player-info">
          <div className="mini-player-title">{miniPlayer.title}</div>
          <div className="mini-player-channel">{miniPlayer.channelName}</div>
        </div>
        <div className="mini-player-buttons">
          <button className="mini-player-button" onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className="mini-player-button" onClick={handleExpand} aria-label="Expand">
            <Maximize2 size={20} />
          </button>
          <button className="mini-player-button" onClick={handleClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
  