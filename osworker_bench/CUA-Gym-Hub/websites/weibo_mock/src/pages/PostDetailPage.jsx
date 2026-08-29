import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PostCard from '../components/Post/PostCard';
import { formatRelativeTime, formatCount, getVerifiedBadgeClass } from '../utils/helpers';
import './Pages.css';

export default function PostDetailPage() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [commentSort, setCommentSort] = useState('hot');
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const commentRef = useRef(null);

  const post = state.posts?.[id];

  useEffect(() => {
    window.scrollTo(0, 0);
    setVisibleCount(20);
  }, [id]);

  // Reset visible count when sort changes
  useEffect(() => {
    setVisibleCount(20);
  }, [commentSort]);

  if (!post) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">😕</div>
        <p>该微博不存在或已被删除</p>
      </div>
    );
  }

  const postComments = Object.values(state.comments || {})
    .filter(c => c.postId === id && !c.replyToId);

  const sortedComments = commentSort === 'hot'
    ? [...postComments].sort((a, b) => b.likeCount - a.likeCount)
    : [...postComments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getReplies = (commentId) => Object.values(state.comments || {})
    .filter(c => c.replyToId === commentId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    dispatch({
      type: 'ADD_COMMENT',
      postId: id,
      text: commentText.trim(),
      replyToId: replyTo?.id || null,
      replyToUserId: replyTo?.userId || null,
    });
    setCommentText('');
    setReplyTo(null);
  };

  const handleReply = (comment) => {
    const user = state.users?.[comment.userId];
    setReplyTo(comment);
    setCommentText(`回复 @${user?.handle || comment.userId}：`);
    commentRef.current?.focus();
  };

  return (
    <div className="page-content">
      <PostCard post={post} showFull={true} />

      {/* Comments section */}
      <div className="card" style={{ marginTop: 8 }}>
        {/* Sort tabs */}
        <div className="comment-tabs">
          <button
            className={`comment-tab-btn ${commentSort === 'hot' ? 'comment-tab-active' : ''}`}
            onClick={() => setCommentSort('hot')}
          >
            最热
          </button>
          <button
            className={`comment-tab-btn ${commentSort === 'new' ? 'comment-tab-active' : ''}`}
            onClick={() => setCommentSort('new')}
          >
            最新
          </button>
        </div>

        {/* Comment compose */}
        <div className="comment-compose">
          <img
            src={state.currentUser?.avatar}
            alt="我"
            className="avatar"
            style={{ width: 36, height: 36 }}
          />
          <div className="comment-compose-input">
            <textarea
              ref={commentRef}
              placeholder={replyTo ? '' : '写评论...'}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={2}
              className="comment-textarea"
              onKeyDown={e => {
                if (e.key === 'Enter' && e.ctrlKey) handleAddComment();
              }}
            />
            <div className="comment-compose-footer">
              {replyTo && (
                <span className="reply-label">
                  回复中
                  <button onClick={() => { setReplyTo(null); setCommentText(''); }} className="cancel-reply">✕</button>
                </span>
              )}
              <button
                className="btn btn-primary"
                style={{ fontSize: 13, padding: '4px 16px' }}
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                发布
              </button>
            </div>
          </div>
        </div>

        {/* Comments list */}
        <div className="comments-list">
          {sortedComments.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <p>暂无评论，快来抢沙发！</p>
            </div>
          ) : (
            <>
              {sortedComments.slice(0, visibleCount).map(comment => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  replies={getReplies(comment.id)}
                  onReply={handleReply}
                />
              ))}
              {visibleCount < sortedComments.length && (
                <div style={{ padding: '14px 16px', textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    className="view-more-replies"
                    style={{ fontSize: 14, padding: '6px 0' }}
                    onClick={() => setVisibleCount(c => c + 20)}
                  >
                    加载更多评论（还有 {sortedComments.length - visibleCount} 条）
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentCard({ comment, replies, onReply }) {
  const { state, dispatch } = useApp();
  const [showAllReplies, setShowAllReplies] = useState(false);
  const author = state.users?.[comment.userId];
  const badgeClass = getVerifiedBadgeClass(author?.verifiedType);
  const visibleReplies = showAllReplies ? replies : replies.slice(0, 3);

  if (!author) return null;

  return (
    <div className="comment-card">
      <img
        src={author.avatar}
        alt={author.screenName}
        className="avatar"
        style={{ width: 36, height: 36, flexShrink: 0 }}
      />
      <div className="comment-content">
        <div className="comment-header">
          <Link to={`/profile/${author.id}`} className="comment-author-name">{author.screenName}</Link>
          {badgeClass && <span className={`badge-v ${badgeClass}`} style={{ fontSize: 10, width: 14, height: 14 }}>V</span>}
          <span className="comment-time">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="comment-text">{comment.text}</p>
        <div className="comment-actions">
          <button
            className={`comment-action-btn ${comment.isLiked ? 'comment-liked' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_LIKE_COMMENT', commentId: comment.id })}
          >
            {comment.isLiked ? '❤️' : '🤍'} {comment.likeCount > 0 ? comment.likeCount : ''}
          </button>
          <button className="comment-action-btn" onClick={() => onReply(comment)}>
            回复
          </button>
        </div>

        {/* Nested replies */}
        {visibleReplies.length > 0 && (
          <div className="replies-list">
            {visibleReplies.map(reply => (
              <ReplyCard key={reply.id} comment={reply} onReply={onReply} />
            ))}
            {replies.length > 3 && !showAllReplies && (
              <button
                className="view-more-replies"
                onClick={() => setShowAllReplies(true)}
              >
                查看更多回复 ({replies.length - 3})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReplyCard({ comment, onReply }) {
  const { state, dispatch } = useApp();
  const author = state.users?.[comment.userId];
  const replyToUser = comment.replyToUserId ? state.users?.[comment.replyToUserId] : null;

  if (!author) return null;

  return (
    <div className="reply-card">
      <img
        src={author.avatar}
        alt={author.screenName}
        className="avatar"
        style={{ width: 28, height: 28, flexShrink: 0 }}
      />
      <div className="reply-content">
        <Link to={`/profile/${author.id}`} className="comment-author-name" style={{ fontSize: 13 }}>
          {author.screenName}
        </Link>
        {replyToUser && (
          <span className="reply-to-label"> 回复 <Link to={`/profile/${replyToUser.id}`} style={{ color: 'var(--color-text-mention)' }}>@{replyToUser.handle}</Link>：</span>
        )}
        <span className="reply-text">{comment.replyToId && !replyToUser ? comment.text : (replyToUser ? comment.text.replace(`回复 @${replyToUser.handle}：`, '') : comment.text)}</span>
        <div className="comment-actions" style={{ marginTop: 4 }}>
          <span className="comment-time">{formatRelativeTime(comment.createdAt)}</span>
          <button
            className={`comment-action-btn ${comment.isLiked ? 'comment-liked' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_LIKE_COMMENT', commentId: comment.id })}
          >
            {comment.isLiked ? '❤️' : '🤍'} {comment.likeCount > 0 ? comment.likeCount : ''}
          </button>
          <button className="comment-action-btn" onClick={() => onReply(comment)}>
            回复
          </button>
        </div>
      </div>
    </div>
  );
}
