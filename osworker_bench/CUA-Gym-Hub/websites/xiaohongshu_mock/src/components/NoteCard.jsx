import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../App.jsx';
import { formatCount, getNoteCover } from '../utils/helpers.js';

export default function NoteCard({ note }) {
  const { state, currentUserId, likeNote } = useApp();
  const showToast = useToast();
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!note) return null;
  const author = state?.users?.[note.authorId];
  const isLiked = note.likedByIds?.includes(currentUserId);

  const handleLike = (e) => {
    e.stopPropagation();
    likeNote(note.id);
  };

  const handleClick = () => {
    navigate(`/note/${note.id}`);
  };

  const coverUrl = getNoteCover(note);
  const multipleImages = note.images && note.images.length > 1;

  return (
    <div className="waterfall-item">
      <div className="note-card" onClick={handleClick}>
        <div className="note-card-image-wrapper">
          {!imgLoaded && !imgError && (
            <div className="note-card-image-placeholder" />
          )}
          {!imgError && (
            <img
              src={coverUrl}
              alt={note.title}
              className="note-card-image"
              style={{ display: imgLoaded ? 'block' : 'none' }}
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgError(true); setImgLoaded(true); }}
            />
          )}
          {imgError && (
            <div
              className="note-card-image-placeholder"
              style={{ paddingTop: '133%', background: 'linear-gradient(135deg, #f5c6cb, #ffecd2)' }}
            />
          )}
          {note.type === 'video' && (
            <span className="note-card-video-badge">▶ 视频</span>
          )}
          {multipleImages && (
            <span className="note-card-count-badge">
              🖼 {note.images.length}
            </span>
          )}
        </div>
        <div className="note-card-body">
          <div className="note-card-title">{note.title}</div>
          <div className="note-card-footer">
            <div className="note-card-author">
              <img
                src={author?.avatar || 'https://i.pravatar.cc/150?u=default'}
                alt={author?.nickname}
                className="note-card-author-avatar"
                onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
              />
              <span className="note-card-author-name">{author?.nickname}</span>
            </div>
            <div className={`note-card-likes ${isLiked ? 'liked' : ''}`}>
              <button
                className="heart-btn"
                onClick={handleLike}
                aria-label={isLiked ? '取消点赞' : '点赞'}
              >
                {isLiked ? '❤️' : '🤍'}
              </button>
              <span>{formatCount(note.likedByIds?.length || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
