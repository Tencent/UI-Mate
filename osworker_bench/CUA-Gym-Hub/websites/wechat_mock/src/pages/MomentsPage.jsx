
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatTime } from '../utils/helpers';
import './MomentsPage.css';

const MomentsPage = () => {
  const navigate = useNavigate();
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [showCommentDialog, setShowCommentDialog] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [replyToUser, setReplyToUser] = useState(null);
  const [longPressedMoment, setLongPressedMoment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [postLocation, setPostLocation] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const user = useStore(state => state.user);
  const contacts = useStore(state => state.contacts);
  const moments = useStore(state => state.moments);
  const addMoment = useStore(state => state.addMoment);
  const deleteMoment = useStore(state => state.deleteMoment);
  const toggleLike = useStore(state => state.toggleLike);
  const addComment = useStore(state => state.addComment);
  const updateUser = useStore(state => state.updateUser);
  const initialize = useStore(state => state.initialize);

  // Ensure store is initialized (for direct URL navigation)
  useEffect(() => {
    if (!user) {
      initialize();
    }
  }, [user, initialize]);

  if (!user || !contacts) {
    return <div className="moments-page">加载中...</div>;
  }

  const coverOptions = [
    'https://picsum.photos/800/300?random=cover1',
    'https://picsum.photos/800/300?random=cover2',
    'https://picsum.photos/800/300?random=cover3',
    'https://picsum.photos/800/300?random=cover4',
    'https://picsum.photos/800/300?random=cover5',
    'https://picsum.photos/800/300?random=cover6',
  ];

  const placeholderImages = Array.from({ length: 12 }, (_, i) =>
    `https://picsum.photos/200/200?random=pick${i + 1}`
  );

  const locationOptions = [
    '北京·天安门广场',
    '上海·外滩',
    '广州·珠江新城',
    '深圳·南山科技园',
    '杭州·西湖风景区',
  ];

  if (!user) {
    return <div className="moments-page">加载中...</div>;
  }

  const getUserInfo = (userId) => {
    if (userId === user.userId) return user;
    return contacts.find(c => c.userId === userId);
  };

  const handlePost = () => {
    if (postContent.trim() || selectedImages.length > 0) {
      addMoment(postContent.trim(), selectedImages, postLocation);
      setPostContent('');
      setSelectedImages([]);
      setPostLocation('');
      setShowPostDialog(false);
    }
  };

  const handleComment = (postId) => {
    if (commentText.trim()) {
      addComment(postId, commentText.trim(), replyToUser);
      setCommentText('');
      setReplyToUser(null);
      setShowCommentDialog(null);
    }
  };

  const handleReplyToComment = (postId, userId) => {
    const userInfo = getUserInfo(userId);
    setReplyToUser(userId);
    setCommentText('');
    setShowCommentDialog(postId);
  };

  const handleDeleteMoment = (postId) => {
    deleteMoment(postId);
    setShowDeleteConfirm(null);
    setLongPressedMoment(null);
  };

  const handleChangeCover = (imgUrl) => {
    updateUser({ coverImage: imgUrl });
    setShowCoverPicker(false);
  };

  const toggleImageSelection = (imgUrl) => {
    if (selectedImages.includes(imgUrl)) {
      setSelectedImages(prev => prev.filter(u => u !== imgUrl));
    } else if (selectedImages.length < 9) {
      setSelectedImages(prev => [...prev, imgUrl]);
    }
  };

  const handleMomentLongPress = (postId, userId) => {
    if (userId === user.userId) {
      setLongPressedMoment(postId);
    }
  };

  return (
    <div className="moments-page">
      <div className="moments-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <h1>朋友圈</h1>
        <button className="compose-btn" onClick={() => setShowPostDialog(true)} data-testid="compose-btn">📷</button>
      </div>

      <div className="moments-cover" onClick={() => setShowCoverPicker(true)} data-testid="moments-cover">
        <img src={user.coverImage} alt="封面" className="cover-bg" data-testid="cover-image" />
        <div className="cover-user-info">
          <span className="cover-nickname">{user.nickname}</span>
          <img src={user.avatar} alt={user.nickname} className="cover-avatar" />
        </div>
        <div className="cover-change-hint">点击更换封面</div>
      </div>

      <div className="moments-list">
        {moments.map(moment => {
          const author = getUserInfo(moment.userId);
          if (!author) return null;

          const isLiked = moment.likes.includes(user.userId);
          const isOwnMoment = moment.userId === user.userId;

          return (
            <div
              key={moment.postId}
              className="moment-item"
              data-testid={`moment-${moment.postId}`}
              onContextMenu={(e) => {
                e.preventDefault();
                handleMomentLongPress(moment.postId, moment.userId);
              }}
            >
              <img
                src={author.avatar}
                alt={author.nickname}
                className="moment-avatar"
                onClick={() => navigate(`/user/${author.userId}`)}
              />
              <div className="moment-content">
                <div className="moment-author">{author.nickname}</div>
                {moment.content && <div className="moment-text">{moment.content}</div>}

                {moment.images && moment.images.length > 0 && (
                  <div className={`moment-images grid-${Math.min(moment.images.length, 3)}`}>
                    {moment.images.map((img, index) => (
                      <img key={index} src={img} alt="图片" className="moment-image" />
                    ))}
                  </div>
                )}

                <div className="moment-meta">
                  {moment.location && (
                    <span className="moment-location">📍 {moment.location}</span>
                  )}
                  <span className="moment-time">{formatTime(moment.timestamp)}</span>
                </div>

                <div className="moment-interactions">
                  <button
                    className={`like-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => toggleLike(moment.postId)}
                  >
                    {isLiked ? '❤️' : '🤍'}
                  </button>
                  <button
                    className="comment-btn"
                    onClick={() => {
                      setReplyToUser(null);
                      setCommentText('');
                      setShowCommentDialog(moment.postId);
                    }}
                  >
                    💬
                  </button>
                  {isOwnMoment && (
                    <button
                      className="delete-moment-btn"
                      onClick={() => setShowDeleteConfirm(moment.postId)}
                    >
                      🗑️
                    </button>
                  )}
                </div>

                {/* Long press menu for own moments */}
                {longPressedMoment === moment.postId && isOwnMoment && (
                  <div className="moment-context-menu">
                    <button onClick={() => setShowDeleteConfirm(moment.postId)}>删除</button>
                    <button onClick={() => setLongPressedMoment(null)}>取消</button>
                  </div>
                )}

                {(moment.likes.length > 0 || moment.comments.length > 0) && (
                  <div className="moment-feedback">
                    {moment.likes.length > 0 && (
                      <div className="likes-section">
                        <span className="like-icon">❤️</span>
                        <span className="likes-text">
                          {moment.likes.map(userId => getUserInfo(userId)?.nickname).filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}

                    {moment.comments.length > 0 && (
                      <div className="comments-section">
                        {moment.comments.map(comment => {
                          const commenter = getUserInfo(comment.userId);
                          const replyTarget = comment.replyTo ? getUserInfo(comment.replyTo) : null;
                          return (
                            <div
                              key={comment.commentId}
                              className="comment-item"
                              onClick={() => handleReplyToComment(moment.postId, comment.userId)}
                            >
                              {replyTarget ? (
                                <>
                                  <span className="commenter-name">{commenter?.nickname}</span>
                                  <span className="reply-arrow"> 回复 </span>
                                  <span className="commenter-name">{replyTarget?.nickname}</span>
                                  <span className="comment-text">: {comment.content}</span>
                                </>
                              ) : (
                                <>
                                  <span className="commenter-name">{commenter?.nickname}:</span>
                                  <span className="comment-text">{comment.content}</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Compose Dialog */}
      {showPostDialog && (
        <div className="dialog-overlay" onClick={() => setShowPostDialog(false)}>
          <div className="post-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <button className="close-btn" onClick={() => {
                setShowPostDialog(false);
                setSelectedImages([]);
                setPostLocation('');
              }}>取消</button>
              <h3>发表动态</h3>
              <button className="post-submit-btn-sm" onClick={handlePost}>发表</button>
            </div>
            <textarea
              className="post-textarea"
              placeholder="这一刻的想法..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              autoFocus
            />

            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="selected-images-preview">
                {selectedImages.map((img, i) => (
                  <div key={i} className="selected-image-wrapper">
                    <img src={img} alt="" className="selected-image-thumb" />
                    <button className="remove-image-btn" onClick={() => toggleImageSelection(img)}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Image Picker Grid */}
            <div className="image-picker-section">
              <h4>选择图片 ({selectedImages.length}/9)</h4>
              <div className="image-picker-grid">
                {placeholderImages.map((img, i) => (
                  <div
                    key={i}
                    className={`picker-image-wrapper ${selectedImages.includes(img) ? 'selected' : ''}`}
                    onClick={() => toggleImageSelection(img)}
                  >
                    <img src={img} alt="" className="picker-image" />
                    {selectedImages.includes(img) && (
                      <div className="image-check-overlay">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="post-options">
              <button className="post-option-btn" onClick={() => setShowLocationPicker(true)}>
                📍 {postLocation || '所在位置'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Picker */}
      {showLocationPicker && (
        <div className="dialog-overlay" onClick={() => setShowLocationPicker(false)}>
          <div className="location-picker" onClick={(e) => e.stopPropagation()}>
            <div className="location-picker-header">
              <h4>选择位置</h4>
              <button className="close-btn" onClick={() => setShowLocationPicker(false)}>✕</button>
            </div>
            <div className="location-options">
              <div
                className="location-option"
                onClick={() => { setPostLocation(''); setShowLocationPicker(false); }}
              >
                不显示位置
              </div>
              {locationOptions.map((loc, i) => (
                <div
                  key={i}
                  className={`location-option ${postLocation === loc ? 'active' : ''}`}
                  onClick={() => { setPostLocation(loc); setShowLocationPicker(false); }}
                >
                  📍 {loc}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comment Dialog */}
      {showCommentDialog && (
        <div className="comment-bar-overlay" onClick={() => { setShowCommentDialog(null); setReplyToUser(null); }}>
          <div className="comment-bar" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              className="comment-input"
              placeholder={replyToUser ? `回复 ${getUserInfo(replyToUser)?.nickname || ''}` : '评论...'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment(showCommentDialog)}
              autoFocus
            />
            <button className="comment-submit-btn" onClick={() => handleComment(showCommentDialog)}>
              发送
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="dialog-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="delete-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-text">确定删除这条朋友圈？</div>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowDeleteConfirm(null)}>取消</button>
              <button className="confirm-ok danger" onClick={() => handleDeleteMoment(showDeleteConfirm)}>删除</button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Picker */}
      {showCoverPicker && (
        <div className="dialog-overlay" onClick={() => setShowCoverPicker(false)}>
          <div className="cover-picker" onClick={(e) => e.stopPropagation()}>
            <div className="cover-picker-header">
              <h4>更换封面</h4>
              <button className="close-btn" onClick={() => setShowCoverPicker(false)}>✕</button>
            </div>
            <div className="cover-grid">
              {coverOptions.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`封面 ${i + 1}`}
                  className="cover-option"
                  onClick={() => handleChangeCover(img)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MomentsPage;
