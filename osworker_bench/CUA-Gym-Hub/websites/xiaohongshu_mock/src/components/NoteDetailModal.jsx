import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../App.jsx';
import { relativeTime, formatCount, parseContentSegments } from '../utils/helpers.js';

function ContentWithLinks({ content, onHashtagClick }) {
  const segments = parseContentSegments(content);
  return (
    <div className="note-detail-body">
      {segments.map((seg, i) => {
        if (seg.type === 'hashtag') {
          return (
            <span
              key={i}
              className="hashtag"
              onClick={() => onHashtagClick(seg.value)}
            >
              #{seg.value}
            </span>
          );
        }
        if (seg.type === 'mention') {
          return <span key={i} className="mention">@{seg.value}</span>;
        }
        return <span key={i}>{seg.value}</span>;
      })}
    </div>
  );
}

export default function NoteDetailModal({ note, onClose }) {
  const { state, currentUserId, likeNote, bookmarkNote, followUser, addComment, likeComment, deleteNote, editNote, pinNote } = useApp();
  const showToast = useToast();
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { commentId, authorName }
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const commentInputRef = useRef(null);

  if (!note || !state) return null;

  const author = state.users?.[note.authorId];
  const currentUser = state.users?.[currentUserId];
  const images = note.images || [];
  const isLiked = note.likedByIds?.includes(currentUserId);
  const isBookmarked = note.bookmarkedByIds?.includes(currentUserId);
  const isFollowing = currentUser?.followingIds?.includes(note.authorId);
  const isOwnNote = note.authorId === currentUserId;
  const isOwnProfile = note.authorId === currentUserId;

  // Get comments for this note sorted by createdAt desc (top-level first)
  const allComments = Object.values(state.comments || {}).filter(c => c.noteId === note.id);
  const topLevelComments = allComments
    .filter(c => !c.parentCommentId)
    .sort((a, b) => b.createdAt - a.createdAt);
  const getReplies = (commentId) =>
    allComments
      .filter(c => c.parentCommentId === commentId)
      .sort((a, b) => a.createdAt - b.createdAt);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setImgIndex(i => (i > 0 ? i - 1 : images.length - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setImgIndex(i => (i < images.length - 1 ? i + 1 : 0));
  };

  const handleLike = () => likeNote(note.id);
  const handleBookmark = () => bookmarkNote(note.id);

  const handleShare = () => {
    const url = `${window.location.origin}/note/${note.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    showToast('链接已复制');
  };

  const handleFollow = () => followUser(note.authorId);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    addComment(note.id, text, replyTo?.commentId || null);
    setCommentText('');
    setReplyTo(null);
  };

  const handleReply = (comment) => {
    const author = state.users?.[comment.authorId];
    setReplyTo({ commentId: comment.id, authorName: author?.nickname || '' });
    setCommentText(`@${author?.nickname || ''} `);
    commentInputRef.current?.focus();
  };

  const handleHashtagClick = (tag) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
    // Do NOT call onClose() here — navigating away is sufficient
  };

  const handleAuthorClick = () => {
    navigate(`/user/${note.authorId}`);
    // Do NOT call onClose() here — navigating away is sufficient
  };

  const handleDeleteNote = () => {
    deleteNote(note.id);
    setShowConfirmDelete(false);
    showToast('笔记已删除');
    navigate(-1);
  };

  const handlePinNote = () => {
    pinNote(note.id);
    showToast(note.isPinned ? '已取消置顶' : '已置顶到主页');
    setShowOptions(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && images.length > 1) setImgIndex(i => (i > 0 ? i - 1 : images.length - 1));
      if (e.key === 'ArrowRight' && images.length > 1) setImgIndex(i => (i < images.length - 1 ? i + 1 : 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="note-detail-modal" onClick={e => e.stopPropagation()}>
        {/* Left: Image panel */}
        <div className="note-detail-images">
          {images.length > 0 ? (
            <>
              <img
                src={images[imgIndex]}
                alt={`图片 ${imgIndex + 1}`}
                className="note-detail-img"
                onError={e => { e.target.src = `https://picsum.photos/seed/${note.id}_fallback/600/800`; }}
              />
              {images.length > 1 && (
                <>
                  <button className="carousel-btn prev" onClick={prevImage}>‹</button>
                  <button className="carousel-btn next" onClick={nextImage}>›</button>
                  <div className="carousel-dots">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        className={`carousel-dot ${i === imgIndex ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                      />
                    ))}
                  </div>
                  <div className="carousel-counter">{imgIndex + 1}/{images.length}</div>
                </>
              )}
            </>
          ) : (
            <div style={{ color: 'var(--xhs-text-secondary)', fontSize: '48px', opacity: 0.3 }}>🖼</div>
          )}
        </div>

        {/* Right: Content panel */}
        <div className="note-detail-content">
          {/* Close button */}
          <button className="modal-close-btn" onClick={onClose}>✕</button>

          {/* Note options (if own note) */}
          {isOwnNote && (
            <div style={{ position: 'absolute', top: '12px', right: '48px', zIndex: 10 }}>
              <button
                className="note-options-btn"
                onClick={(e) => { e.stopPropagation(); setShowOptions(v => !v); }}
              >
                ···
              </button>
              {showOptions && (
                <div className="note-options-menu">
                  <div
                    className="note-option-item"
                    onClick={() => { navigate(`/publish?edit=${note.id}`); setShowOptions(false); }}
                  >
                    ✏️ 编辑
                  </div>
                  <div className="note-option-item" onClick={handlePinNote}>
                    📌 {note.isPinned ? '取消置顶' : '置顶'}
                  </div>
                  <div
                    className="note-option-item danger"
                    onClick={() => { setShowConfirmDelete(true); setShowOptions(false); }}
                  >
                    🗑 删除
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="note-detail-scrollable">
            {/* Author */}
            <div className="note-detail-author">
              <img
                src={author?.avatar}
                alt={author?.nickname}
                className="note-detail-author-avatar"
                onClick={handleAuthorClick}
                onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
              />
              <span className="note-detail-author-name" onClick={handleAuthorClick}>
                {author?.nickname}
                {author?.verified && <span style={{ color: 'var(--xhs-red)', marginLeft: 4 }}>✓</span>}
              </span>
              {!isOwnProfile && (
                <button
                  className={`follow-btn ${isFollowing ? 'following' : 'not-following'}`}
                  onClick={handleFollow}
                >
                  {isFollowing ? '已关注' : '关注'}
                </button>
              )}
            </div>

            {/* Title */}
            <div className="note-detail-title">{note.title}</div>

            {/* Content */}
            <ContentWithLinks content={note.content} onHashtagClick={handleHashtagClick} />

            {/* Meta */}
            <div className="note-detail-meta">
              {note.location && (
                <span className="note-detail-location">
                  📍 {note.location}
                </span>
              )}
              <span>{relativeTime(note.createdAt)}</span>
            </div>

            {/* Engagement */}
            <div className="note-detail-engagement">
              <button
                className={`engagement-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <span className="icon">{isLiked ? '❤️' : '🤍'}</span>
                <span>{formatCount(note.likedByIds?.length || 0)}</span>
              </button>
              <button
                className={`engagement-btn ${isBookmarked ? 'bookmarked' : ''}`}
                onClick={handleBookmark}
              >
                <span className="icon">{isBookmarked ? '⭐' : '☆'}</span>
                <span>{formatCount(note.bookmarkedByIds?.length || 0)}</span>
              </button>
              <button className="engagement-btn" onClick={() => commentInputRef.current?.focus()}>
                <span className="icon">💬</span>
                <span>{formatCount(note.commentCount || 0)}</span>
              </button>
              <button className="engagement-btn" onClick={handleShare}>
                <span className="icon">↗️</span>
                <span>分享</span>
              </button>
            </div>

            {/* Comments */}
            <div className="comments-section">
              <div className="comments-header">
                共 {allComments.length} 条评论
              </div>
              {topLevelComments.map(comment => {
                const commentAuthor = state.users?.[comment.authorId];
                const commentLiked = comment.likedByIds?.includes(currentUserId);
                const replies = getReplies(comment.id);
                return (
                  <div key={comment.id} className="comment-item">
                    <img
                      src={commentAuthor?.avatar}
                      alt={commentAuthor?.nickname}
                      className="comment-avatar"
                      onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
                    />
                    <div className="comment-body">
                      <div
                        className="comment-author"
                        onClick={() => navigate(`/user/${comment.authorId}`)}
                      >
                        {commentAuthor?.nickname}
                      </div>
                      <div className="comment-text">{comment.content}</div>
                      <div className="comment-meta">
                        <span>{relativeTime(comment.createdAt)}</span>
                        <button
                          className={`comment-like-btn ${commentLiked ? 'liked' : ''}`}
                          onClick={() => likeComment(comment.id)}
                        >
                          {commentLiked ? '❤️' : '🤍'} {comment.likedByIds?.length > 0 ? comment.likedByIds.length : ''}
                        </button>
                        <button
                          className="comment-reply-btn"
                          onClick={() => handleReply(comment)}
                        >
                          回复
                        </button>
                      </div>

                      {/* Replies */}
                      {replies.length > 0 && (
                        <div className="comment-replies">
                          {replies.map(reply => {
                            const replyAuthor = state.users?.[reply.authorId];
                            const replyLiked = reply.likedByIds?.includes(currentUserId);
                            return (
                              <div key={reply.id} className="reply-item">
                                <img
                                  src={replyAuthor?.avatar}
                                  alt={replyAuthor?.nickname}
                                  className="reply-avatar"
                                  onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
                                />
                                <div className="comment-body">
                                  <div className="comment-author" style={{ fontSize: '12px' }}>
                                    {replyAuthor?.nickname}
                                  </div>
                                  <div className="comment-text" style={{ fontSize: '13px' }}>
                                    {reply.content}
                                  </div>
                                  <div className="comment-meta">
                                    <span>{relativeTime(reply.createdAt)}</span>
                                    <button
                                      className={`comment-like-btn ${replyLiked ? 'liked' : ''}`}
                                      onClick={() => likeComment(reply.id)}
                                    >
                                      {replyLiked ? '❤️' : '🤍'} {reply.likedByIds?.length > 0 ? reply.likedByIds.length : ''}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comment input */}
          <form className="comment-input-area" onSubmit={handleSubmitComment}>
            <img
              src={currentUser?.avatar}
              alt="me"
              className="comment-input-avatar"
              onError={e => { e.target.src = 'https://i.pravatar.cc/150?u=default'; }}
            />
            <input
              ref={commentInputRef}
              type="text"
              className="comment-input-field"
              placeholder={replyTo ? `回复 @${replyTo.authorName}...` : '说点什么...'}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={!commentText.trim()}
            >
              发布
            </button>
          </form>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      {showConfirmDelete && (
        <div className="confirm-dialog-overlay" onClick={e => e.stopPropagation()}>
          <div className="confirm-dialog">
            <div className="confirm-dialog-title">确定删除这条笔记吗？</div>
            <div className="confirm-dialog-text">删除后不可恢复</div>
            <div className="confirm-dialog-btns">
              <button className="btn-cancel" onClick={() => setShowConfirmDelete(false)}>取消</button>
              <button
                className="btn-save"
                style={{ background: 'var(--xhs-danger)' }}
                onClick={handleDeleteNote}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
