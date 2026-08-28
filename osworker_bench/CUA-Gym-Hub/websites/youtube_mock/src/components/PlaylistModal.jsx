
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import './ShareModal.css';
import './PlaylistModal.css';

const PlaylistModal = ({ isOpen, onClose, videoId }) => {
  const { data, addToPlaylist, removeFromPlaylist, createPlaylist, showToast } = useData();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistPrivacy, setNewPlaylistPrivacy] = useState('Public');

  if (!isOpen) return null;

  const userPlaylists = data.playlists.filter(p => p.creatorId === data.user.userId);

  const handlePlaylistToggle = (playlistId) => {
    const playlist = userPlaylists.find(p => p.playlistId === playlistId);
    const isInPlaylist = playlist.videoIds.includes(videoId);

    if (isInPlaylist) {
      removeFromPlaylist(playlistId, videoId);
      showToast('Removed from playlist');
    } else {
      addToPlaylist(playlistId, videoId);
      showToast('Added to playlist');
    }
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName, '', newPlaylistPrivacy);
      showToast('Playlist created');
      setNewPlaylistName('');
      setShowCreateForm(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content playlist-modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Save to playlist</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="playlist-list">
          {userPlaylists.map(playlist => {
            const isInPlaylist = playlist.videoIds.includes(videoId);
            return (
              <div
                key={playlist.playlistId}
                className="playlist-item"
                onClick={() => handlePlaylistToggle(playlist.playlistId)}
              >
                <input
                  type="checkbox"
                  className="playlist-checkbox"
                  checked={isInPlaylist}
                  onChange={() => handlePlaylistToggle(playlist.playlistId)}
                />
                <div className="playlist-info">
                  <div className="playlist-name">{playlist.name}</div>
                  <div className="playlist-count">{playlist.videoIds.length} videos • {playlist.privacy}</div>
                </div>
              </div>
            );
          })}
        </div>

        {!showCreateForm ? (
          <button
            className="create-playlist-button"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={20} />
            <span>Create new playlist</span>
          </button>
        ) : (
          <div className="create-playlist-form">
            <input
              type="text"
              className="form-input"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              autoFocus
            />
            <select
              className="form-select"
              value={newPlaylistPrivacy}
              onChange={(e) => setNewPlaylistPrivacy(e.target.value)}
            >
              <option value="Public">Public</option>
              <option value="Unlisted">Unlisted</option>
              <option value="Private">Private</option>
            </select>
            <div className="form-buttons">
              <button
                className="form-button cancel"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPlaylistName('');
                }}
              >
                Cancel
              </button>
              <button
                className="form-button create"
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistModal;
  