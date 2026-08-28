import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Comment } from '../types';
import { formatRelativeTime } from '../utils/timeHelper';

interface CommentSectionProps {
  targetId: string;
  commentCount: number;
  targetType?: 'answer' | 'article' | 'idea';
}

const CommentSection: React.FC<CommentSectionProps> = ({ targetId, commentCount, targetType = 'answer' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ commentId: string; authorName: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showToast, setShowToast] = useState(false);

  const comments = useStore(state => state.comments[targetId] || []);
  const users = useStore(state => state.users);
  const currentUser = useStore(state => state.currentUser);
  const userCommentVoteups = useStore(state => state.userCommentVoteups);
  const addComment = useStore(state => state.addComment);
  const addCommentReply = useStore(state => state.addCommentReply);
  const toggleCommentVoteup = useStore(state => state.toggleCommentVoteup);

  const getUserById = (userId: string) => users.find(u => u.userId === userId);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      commentId: 'c_' + Date.now(),
      targetId,
      targetType: targetType,
      authorId: currentUser.userId,
      content: newComment.trim(),
      createdTime: Date.now(),
      voteupCount: 0,
      replies: [],
    };

    addComment(targetId, comment, targetType);
    setNewComment('');
    showToastBriefly();
  };

  const handleAddReply = (parentCommentId: string) => {
    if (!replyText.trim()) return;

    const reply: Comment = {
      commentId: 'c_' + Date.now(),
      targetId: parentCommentId,
      targetType: 'comment',
      authorId: currentUser.userId,
      content: replyText.trim(),
      createdTime: Date.now(),
      voteupCount: 0,
      replies: [],
    };

    addCommentReply(targetId, parentCommentId, reply);
    setReplyText('');
    setReplyTo(null);
    showToastBriefly();
  };

  const showToastBriefly = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const actualCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
  const displayCount = Math.max(commentCount, actualCount);

  const renderComment = (comment: Comment, isReply: boolean = false, replyToAuthor?: string) => {
    const author = getUserById(comment.authorId);
    if (!author) return null;

    const isVoted = userCommentVoteups[comment.commentId];

    return (
      <div key={comment.commentId} style={{
        ...styles.commentItem,
        ...(isReply ? styles.replyItem : {}),
      }}>
        <img src={author.avatar} alt="" style={styles.commentAvatar} />
        <div style={styles.commentBody}>
          <div style={styles.commentHeader}>
            <Link to={`/user/${author.userId}`} style={styles.commentAuthor}>
              {author.nickname}
            </Link>
            {isReply && replyToAuthor && (
              <span style={styles.replyLabel}> 回复 <span style={styles.replyTarget}>{replyToAuthor}</span></span>
            )}
          </div>
          <div style={styles.commentText}>{comment.content}</div>
          <div style={styles.commentMeta}>
            <span style={styles.commentTime}>{formatRelativeTime(comment.createdTime)}</span>
            <button
              style={{
                ...styles.commentVoteBtn,
                ...(isVoted ? styles.commentVoteBtnActive : {}),
              }}
              onClick={() => toggleCommentVoteup(comment.commentId, targetId)}
            >
              👍 {comment.voteupCount > 0 ? comment.voteupCount : ''}
            </button>
            {!isReply && (
              <button
                style={styles.replyBtn}
                onClick={() => {
                  if (replyTo?.commentId === comment.commentId) {
                    setReplyTo(null);
                    setReplyText('');
                  } else {
                    setReplyTo({ commentId: comment.commentId, authorName: author.nickname });
                    setReplyText('');
                  }
                }}
              >
                回复
              </button>
            )}
          </div>

          {/* Reply input for this comment */}
          {replyTo?.commentId === comment.commentId && (
            <div style={styles.replyInputRow}>
              <input
                type="text"
                placeholder={`回复 @${replyTo.authorName}`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddReply(comment.commentId);
                }}
                style={styles.replyInput}
                autoFocus
              />
              <button
                style={{
                  ...styles.replySubmitBtn,
                  ...(replyText.trim() ? {} : styles.replySubmitBtnDisabled),
                }}
                disabled={!replyText.trim()}
                onClick={() => handleAddReply(comment.commentId)}
              >
                发布
              </button>
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div style={styles.repliesList}>
              {comment.replies.map(reply => renderComment(reply, true, author.nickname))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <button style={styles.toggleBtn} onClick={handleToggle}>
        💬 {displayCount} 条评论
      </button>

      {isOpen && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>{displayCount} 条评论</span>
            <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          <div style={styles.commentsList}>
            {comments.length === 0 ? (
              <div style={styles.emptyState}>暂无评论，来写下第一条评论吧</div>
            ) : (
              comments.map(comment => renderComment(comment))
            )}
          </div>

          <div style={styles.writeCommentBar}>
            <img src={currentUser.avatar} alt="" style={styles.writeAvatar} />
            <input
              type="text"
              placeholder="写下你的评论..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddComment();
              }}
              style={styles.writeInput}
            />
            <button
              style={{
                ...styles.writeSubmitBtn,
                ...(newComment.trim() ? {} : styles.writeSubmitBtnDisabled),
              }}
              disabled={!newComment.trim()}
              onClick={handleAddComment}
            >
              发布
            </button>
          </div>
        </div>
      )}

      {showToast && <div className="toast">评论已发布</div>}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginTop: '8px',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  section: {
    marginTop: '12px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    background: 'var(--bg-color)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px',
  },
  commentsList: {
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '8px 0',
  },
  emptyState: {
    padding: '24px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  commentItem: {
    display: 'flex',
    gap: '10px',
    padding: '12px 16px',
  },
  replyItem: {
    paddingLeft: '0',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
  commentAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  commentBody: {
    flex: 1,
    minWidth: 0,
  },
  commentHeader: {
    fontSize: '13px',
    marginBottom: '4px',
  },
  commentAuthor: {
    fontWeight: '600',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontSize: '13px',
  },
  replyLabel: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  replyTarget: {
    color: 'var(--primary-color)',
    fontWeight: '500',
  },
  commentText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  commentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  commentTime: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  commentVoteBtn: {
    background: 'none',
    border: 'none',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: '2px',
  },
  commentVoteBtnActive: {
    color: 'var(--primary-color)',
  },
  replyBtn: {
    background: 'none',
    border: 'none',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '2px 6px',
  },
  repliesList: {
    marginTop: '8px',
    marginLeft: '0px',
    paddingLeft: '0px',
    borderLeft: '2px solid var(--border-color)',
  },
  replyInputRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  replyInput: {
    flex: 1,
    padding: '6px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
  },
  replySubmitBtn: {
    padding: '6px 14px',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  replySubmitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  writeCommentBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderTop: '1px solid var(--border-color)',
  },
  writeAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  writeInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    fontSize: '14px',
    outline: 'none',
    background: 'var(--bg-secondary)',
  },
  writeSubmitBtn: {
    padding: '8px 16px',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  writeSubmitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default CommentSection;
