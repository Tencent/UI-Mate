
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';

interface ChatterProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Chatter: React.FC<ChatterProps> = ({ onShowToast }) => {
  const { state, updateState } = useApp();
  const [newPost, setNewPost] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handlePost = () => {
    if (!newPost.trim()) return;

    const post = {
      postId: `post-${Date.now()}`,
      userId: state.user.userId,
      content: newPost,
      createdDate: new Date().toISOString(),
      likeCount: 0,
      commentCount: 0,
      likes: [],
      comments: []
    };

    updateState({
      chatterPosts: [post, ...state.chatterPosts]
    });

    setNewPost('');
    onShowToast('Post created successfully', 'success');
  };

  const handleLike = (postId: string) => {
    const updatedPosts = state.chatterPosts.map(post => {
      if (post.postId === postId) {
        const hasLiked = post.likes.includes(state.user.userId);
        return {
          ...post,
          likes: hasLiked
            ? post.likes.filter(id => id !== state.user.userId)
            : [...post.likes, state.user.userId],
          likeCount: hasLiked ? post.likeCount - 1 : post.likeCount + 1
        };
      }
      return post;
    });

    updateState({ chatterPosts: updatedPosts });
  };

  const handleComment = (postId: string) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    const updatedPosts = state.chatterPosts.map(post => {
      if (post.postId === postId) {
        const newComment = {
          commentId: `comment-${Date.now()}`,
          userId: state.user.userId,
          content: commentText,
          createdDate: new Date().toISOString(),
          likeCount: 0,
          likes: []
        };
        return {
          ...post,
          comments: [...post.comments, newComment],
          commentCount: post.commentCount + 1
        };
      }
      return post;
    });

    updateState({ chatterPosts: updatedPosts });
    setCommentInputs({ ...commentInputs, [postId]: '' });
    onShowToast('Comment added', 'success');
  };

  const handleFollow = (userId: string) => {
    const isFollowing = state.following.includes(userId);
    const updatedFollowing = isFollowing
      ? state.following.filter(id => id !== userId)
      : [...state.following, userId];

    updateState({ following: updatedFollowing });
    onShowToast(isFollowing ? 'Unfollowed user' : 'Following user', 'success');
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '24px' }}>Chatter</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <img
                src={state.user.avatar}
                alt={state.user.firstName}
                style={{ width: '48px', height: '48px', borderRadius: '50%' }}
              />
              <div style={{ flex: 1 }}>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share an update..."
                  className="form-textarea"
                  style={{ minHeight: '80px', marginBottom: '12px' }}
                />
                <button
                  onClick={handlePost}
                  className="btn btn-primary"
                  disabled={!newPost.trim()}
                >
                  <Send size={18} />
                  Post
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {state.chatterPosts.map(post => {
              const user = state.users.find(u => u.userId === post.userId);
              const hasLiked = post.likes.includes(state.user.userId);

              return (
                <div key={post.postId} className="card">
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <img
                      src={user?.avatar}
                      alt={user?.firstName}
                      style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {format(new Date(post.createdDate), 'MMM d, yyyy h:mm a')}
                      </div>
                      <p style={{ marginBottom: '16px' }}>{post.content}</p>

                      <div style={{ display: 'flex', gap: '24px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                        <button
                          onClick={() => handleLike(post.postId)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: hasLiked ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: hasLiked ? 600 : 400
                          }}
                        >
                          <ThumbsUp size={16} fill={hasLiked ? 'var(--primary)' : 'none'} />
                          {post.likeCount} {post.likeCount === 1 ? 'Like' : 'Likes'}
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <MessageSquare size={16} />
                          {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
                        </button>
                      </div>

                      {post.comments.length > 0 && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                          {post.comments.map(comment => {
                            const commentUser = state.users.find(u => u.userId === comment.userId);
                            return (
                              <div key={comment.commentId} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <img
                                  src={commentUser?.avatar}
                                  alt={commentUser?.firstName}
                                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                />
                                <div style={{ flex: 1, background: 'var(--bg)', padding: '8px 12px', borderRadius: '8px' }}>
                                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                                    {commentUser?.firstName} {commentUser?.lastName}
                                  </div>
                                  <div style={{ fontSize: '14px' }}>{comment.content}</div>
                                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    {format(new Date(comment.createdDate), 'MMM d, h:mm a')}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <img
                          src={state.user.avatar}
                          alt={state.user.firstName}
                          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                        />
                        <input
                          type="text"
                          value={commentInputs[post.postId] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.postId]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(post.postId)}
                          placeholder="Write a comment..."
                          className="form-input"
                          style={{ flex: 1 }}
                        />
                        <button
                          onClick={() => handleComment(post.postId)}
                          className="btn btn-primary"
                          disabled={!commentInputs[post.postId]?.trim()}
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>People to Follow</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {state.users.filter(u => u.userId !== state.user.userId).slice(0, 5).map(user => {
                const isFollowing = state.following.includes(user.userId);
                return (
                  <div key={user.userId} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {user.title}
                      </div>
                    </div>
                    <button
                      className={isFollowing ? "btn btn-primary" : "btn btn-secondary"}
                      style={{ padding: '4px 12px', fontSize: '12px' }}
                      onClick={() => handleFollow(user.userId)}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
