import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatRelativeTime, formatCount, parsePostText, getVerifiedBadgeClass } from '../../utils/helpers';
import ImageGrid from './ImageGrid';
import './Post.css';

export default function PostCard({ post, showFull = false }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showRepostDialog, setShowRepostDialog] = useState(false);

  const author = state.users?.[post.userId];
  const isOwnPost = post.userId === 'user_current';
  const repostOriginal = post.repostOf ? state.posts?.[post.repostOf] : null;
  const repostAuthor = repostOriginal ? state.users?.[repostOriginal.userId] : null;

  if (!author) return null;

  const handleLike = (e) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_LIKE_POST', postId: post.id });
  };

  const handleComment = (e) => {
    e.stopPropagation();
    navigate(`/post/${post.id}`);
  };

  const handleRepost = (e) => {
    e.stopPropagation();
    setShowRepostDialog(true);
  };

  const handleDelete = () => {
    if (window.confirm('确定删除这条微博？')) {
      dispatch({ type: 'DELETE_POST', postId: post.id });
    }
    setShowMoreMenu(false);
  };

  const handleFavorite = () => {
    dispatch({ type: 'FAVORITE_POST', postId: post.id });
    setShowMoreMenu(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/post/${post.id}`);
    setShowMoreMenu(false);
  };

  const badgeClass = getVerifiedBadgeClass(author.verifiedType);
  const shouldTruncate = !showFull && !expanded && post.isLongText && post.text.length > 140;
  const displayText = shouldTruncate ? post.text.slice(0, 140) : post.text;
  const displayParts = parsePostText(displayText);

  return (
    <>
      <div className="post-card card">
        {/* Header */}
        <div className="post-header">
          <img
            src={author.avatar}
            alt={author.screenName}
            className="avatar post-avatar"
            onClick={() => navigate(`/profile/${author.id}`)}
          />
          <div className="post-author-info">
            <div className="post-author-top">
              <span
                className="post-author-name"
                onClick={() => navigate(`/profile/${author.id}`)}
              >
                {author.screenName}
              </span>
              {badgeClass && (
                <span className={`badge-v ${badgeClass}`} title="认证用户">V</span>
              )}
            </div>
            <div className="post-author-top" style={{ gap: 6, marginTop: 1 }}>
              <span className="post-time">{formatRelativeTime(post.createdAt)}</span>
              {post.source && (
                <>
                  <span className="post-meta-sep">·</span>
                  <span className="post-source">来自 {post.source}</span>
                </>
              )}
            </div>
          </div>
          <div className="post-more-menu">
            <button
              className="more-btn"
              onClick={(e) => { e.stopPropagation(); setShowMoreMenu(!showMoreMenu); }}
              aria-label="更多操作"
            >
              ···
            </button>
            {showMoreMenu && (
              <div className="more-dropdown">
                <button onClick={handleFavorite}>
                  {post.isFavorited ? '取消收藏' : '收藏'}
                </button>
                <button onClick={handleCopyLink}>复制链接</button>
                {isOwnPost && (
                  <button onClick={handleDelete} style={{ color: 'var(--color-primary)' }}>删除</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Body */}
        <div className="post-body" onClick={() => !showFull && navigate(`/post/${post.id}`)}>
          <p className="post-text">
            {displayParts.map((part, i) => {
              if (part.type === 'mention') {
                const handle = part.content.slice(1);
                const mentionedUser = Object.values(state.users || {}).find(u => u.handle === handle);
                const userId = mentionedUser ? mentionedUser.id : handle;
                return (
                  <span
                    key={i}
                    className="mention-link"
                    onClick={e => { e.stopPropagation(); navigate(`/profile/${userId}`); }}
                  >
                    {part.content}
                  </span>
                );
              }
              if (part.type === 'topic') {
                const topicName = part.content.replace(/#/g, '');
                return (
                  <span
                    key={i}
                    className="topic-link"
                    onClick={e => { e.stopPropagation(); navigate(`/search?q=${encodeURIComponent(topicName)}`); }}
                  >
                    {part.content}
                  </span>
                );
              }
              return <span key={i}>{part.content}</span>;
            })}
            {shouldTruncate && (
              <span
                className="expand-link"
                onClick={e => { e.stopPropagation(); setExpanded(true); }}
              >
                ...展开
              </span>
            )}
          </p>

          {/* Image Grid */}
          {post.images && post.images.length > 0 && (
            <ImageGrid images={post.images} />
          )}

          {/* Repost box */}
          {post.repostOf && (
            <div className="repost-box" onClick={e => { e.stopPropagation(); navigate(`/post/${post.repostOf}`); }}>
              {repostOriginal ? (
                <>
                  <span className="repost-author">
                    @{repostAuthor?.screenName || '未知用户'}：
                  </span>
                  <span className="repost-text">
                    {repostOriginal.text.slice(0, 80)}
                    {repostOriginal.text.length > 80 ? '...' : ''}
                  </span>
                  {repostOriginal.images && repostOriginal.images.length > 0 && (
                    <img
                      src={repostOriginal.images[0]}
                      alt="转发图片"
                      className="repost-thumb"
                    />
                  )}
                </>
              ) : (
                <span className="repost-deleted">该微博已被删除</span>
              )}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="post-actions">
          <button className="action-btn action-repost" onClick={handleRepost}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9"/>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <span>{post.repostCount > 0 ? formatCount(post.repostCount) : '转发'}</span>
          </button>
          <button className="action-btn action-comment" onClick={handleComment}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{post.commentCount > 0 ? formatCount(post.commentCount) : '评论'}</span>
          </button>
          <button
            className={`action-btn action-like ${post.isLiked ? 'action-liked' : ''}`}
            onClick={handleLike}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{post.isLiked ? formatCount(post.likeCount) : (post.likeCount > 0 ? formatCount(post.likeCount) : '赞')}</span>
          </button>
        </div>
      </div>

      {/* Repost Dialog */}
      {showRepostDialog && (
        <RepostDialog
          post={post}
          onClose={() => setShowRepostDialog(false)}
        />
      )}
    </>
  );
}

function RepostDialog({ post, onClose }) {
  const { state, dispatch } = useApp();
  const [text, setText] = useState('');
  const author = state.users?.[post.userId];

  const handleRepost = () => {
    dispatch({ type: 'REPOST_POST', postId: post.id, text });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span>转发微博</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: 16 }}>
          <textarea
            className="repost-textarea"
            placeholder="说说你的想法..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
          />
          {/* Preview */}
          <div className="repost-preview">
            <span className="repost-author">@{author?.screenName}：</span>
            <span>{post.text.slice(0, 60)}{post.text.length > 60 ? '...' : ''}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button className="btn btn-secondary" onClick={onClose}>取消</button>
            <button className="btn btn-primary" onClick={handleRepost}>转发</button>
          </div>
        </div>
      </div>
    </div>
  );
}
