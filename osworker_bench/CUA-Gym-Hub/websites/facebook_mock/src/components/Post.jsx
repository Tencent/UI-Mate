import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, X, Bookmark, Edit2, Trash2, EyeOff, Flag, Globe, Users, Lock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import ShareDialog from './ShareDialog';

const REACTIONS = [
  { type: 'like', label: 'Like', icon: '👍', color: 'text-blue-500' },
  { type: 'love', label: 'Love', icon: '❤️', color: 'text-red-500' },
  { type: 'care', label: 'Care', icon: '🥰', color: 'text-yellow-500' },
  { type: 'haha', label: 'Haha', icon: '😆', color: 'text-yellow-500' },
  { type: 'wow', label: 'Wow', icon: '😮', color: 'text-yellow-500' },
  { type: 'sad', label: 'Sad', icon: '😢', color: 'text-yellow-500' },
  { type: 'angry', label: 'Angry', icon: '😡', color: 'text-orange-500' },
];

const Post = ({ post }) => {
  const { currentUser, getUser, getPage, toggleLike, addComment, deletePost, editPost, toggleCommentLike, deleteComment, savePost, hidePost, reportPost, sharePost, state } = useApp();
  const navigate = useNavigate();

  // Determine author (User or Page)
  let author = { name: 'Unknown', avatar: '' };
  if (post.pageId) {
    const page = getPage(post.pageId);
    if (page) author = page;
  } else {
    const user = getUser(post.userId);
    if (user) author = user;
  }

  const isOwnPost = post.userId === currentUser.id && !post.pageId;

  // Safely handle reactions (migration support)
  const reactions = post.reactions || (post.likes ? post.likes.map(uid => ({ userId: uid, type: 'like' })) : []);
  const myReaction = reactions.find(r => r.userId === currentUser.id);

  const isSaved = (state.savedItems || []).some(item => item.type === 'post' && item.referenceId === post.id);
  const isHidden = (state.hiddenPosts || []).includes(post.id);

  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // Comment ID we are replying to
  const [replyText, setReplyText] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [hoveredComment, setHoveredComment] = useState(null);
  const [showCommentMoreMenu, setShowCommentMoreMenu] = useState(null); // commentId
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const moreMenuRef = useRef(null);
  const commentMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
      if (commentMenuRef.current && !commentMenuRef.current.contains(e.target)) {
        setShowCommentMoreMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If post is hidden, don't render
  if (isHidden) return null;

  const handleReaction = (type) => {
    toggleLike(post.id, currentUser.id, type);
  };

  const handleComment = (e, parentId = null) => {
    e.preventDefault();
    const text = parentId ? replyText : commentText;
    if (!text.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      userId: currentUser.id,
      content: text,
      timestamp: Date.now()
    };

    addComment(post.id, newComment, parentId);

    if (parentId) {
      setReplyText('');
      setReplyingTo(null);
    } else {
      setCommentText('');
    }
  };

  const handleDeletePost = () => {
    deletePost(post.id);
    setShowDeleteConfirm(false);
  };

  const handleEditPost = (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    editPost(post.id, editContent);
    setShowEditModal(false);
  };

  const handleSavePost = () => {
    savePost(post.id);
    setShowMoreMenu(false);
  };

  const handleHidePost = () => {
    hidePost(post.id);
    setShowMoreMenu(false);
  };

  const handleReportPost = () => {
    setShowMoreMenu(false);
    setShowReportConfirm(true);
  };

  const confirmReport = () => {
    reportPost(post.id);
    setShowReportConfirm(false);
  };

  const handleShare = (shareType) => {
    sharePost(post.id);
    setShowShareDialog(false);
  };

  // Get top 3 reactions to display
  const reactionCounts = reactions.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  const topReactions = Object.entries(reactionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type]) => REACTIONS.find(r => r.type === type).icon);

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 relative">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            onClick={() => {
              if (post.pageId) navigate(`/pages/${post.pageId}`);
              else if (post.userId === currentUser.id) navigate('/profile');
              else navigate(`/profile/${post.userId}`);
            }}
          />
          <div>
            <h4
              className="font-semibold text-[15px] hover:underline cursor-pointer"
              onClick={() => {
                if (post.pageId) navigate(`/pages/${post.pageId}`);
                else if (post.userId === currentUser.id) navigate('/profile');
                else navigate(`/profile/${post.userId}`);
              }}
            >{author.name}</h4>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>{formatDistanceToNow(post.timestamp, { addSuffix: true })}</span>
              {post.edited && <span className="text-gray-400">· (edited)</span>}
              <span>·</span>
              {post.privacy === 'public' ? <Globe size={12} /> : post.privacy === 'only_me' ? <Lock size={12} /> : <Users size={12} />}
            </div>
            {post.feeling && (
              <p className="text-xs text-gray-500 mt-0.5">
                — feeling {post.feelingEmoji || ''} {post.feeling}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {/* More menu button */}
          <div className="relative" ref={moreMenuRef}>
            <div
              className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
              onClick={() => setShowMoreMenu(v => !v)}
            >
              <MoreHorizontal size={20} className="text-gray-500" />
            </div>
            {showMoreMenu && (
              <div className="absolute right-0 top-10 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-30 py-1 overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] hover:bg-gray-100 text-left"
                  onClick={handleSavePost}
                >
                  <Bookmark size={18} className={isSaved ? 'text-primary fill-primary' : 'text-gray-600'} />
                  <span>{isSaved ? 'Post saved' : 'Save post'}</span>
                </button>
                {isOwnPost && (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] hover:bg-gray-100 text-left"
                    onClick={() => { setShowMoreMenu(false); setEditContent(post.content); setShowEditModal(true); }}
                  >
                    <Edit2 size={18} className="text-gray-600" />
                    <span>Edit post</span>
                  </button>
                )}
                {isOwnPost && (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] hover:bg-gray-100 text-left"
                    onClick={() => { setShowMoreMenu(false); setShowDeleteConfirm(true); }}
                  >
                    <Trash2 size={18} className="text-red-500" />
                    <span className="text-red-500">Delete post</span>
                  </button>
                )}
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] hover:bg-gray-100 text-left"
                  onClick={handleHidePost}
                >
                  <EyeOff size={18} className="text-gray-600" />
                  <span>Hide post</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] hover:bg-gray-100 text-left"
                  onClick={handleReportPost}
                >
                  <Flag size={18} className="text-gray-600" />
                  <span>Report post</span>
                </button>
              </div>
            )}
          </div>
          <div
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
            onClick={handleHidePost}
          >
            <X size={20} className="text-gray-500" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        {post.bgColor ? (
          <div
            className="w-full min-h-[200px] rounded-lg flex items-center justify-center p-6 my-2"
            style={{ background: post.bgColor }}
          >
            <p className="text-white text-xl font-bold text-center">{post.content}</p>
          </div>
        ) : (
          <p className="text-[15px] leading-normal">{post.content}</p>
        )}
      </div>

      {/* Post Attachments */}
      {post.type === 'photo' && post.image && (
        <div className="mt-2 cursor-pointer">
          <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[600px]" />
        </div>
      )}

      {post.type === 'video' && post.video && (
        <div className="mt-2 cursor-pointer relative bg-black h-[400px] flex items-center justify-center">
          <video src={post.video} className="w-full h-full object-contain" controls />
        </div>
      )}

      {post.type === 'link' && post.link && (
        <div className="mt-2 mx-4 border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-50">
          <img src={post.link.image} alt="Link preview" className="w-full h-[200px] object-cover" />
          <div className="p-3 bg-gray-100">
            <div className="text-xs text-gray-500 uppercase mb-1">{new URL(post.link.url).hostname}</div>
            <h3 className="font-bold text-[17px] leading-tight mb-1">{post.link.title}</h3>
            <p className="text-gray-500 text-[15px] line-clamp-2">{post.link.description}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-gray-500 text-[15px]">
        <div className="flex items-center gap-1 cursor-pointer hover:underline">
          {reactions.length > 0 && (
            <>
              <div className="flex -space-x-1">
                {topReactions.map((icon, i) => (
                  <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center bg-transparent text-[18px] z-10 border-white">
                    {icon}
                  </div>
                ))}
              </div>
              <span className="ml-1">{reactions.length}</span>
            </>
          )}
        </div>
        <div className="flex gap-3">
          <span className="cursor-pointer hover:underline" onClick={() => setShowComments(!showComments)}>
            {post.comments.length} comments
          </span>
          <span className="cursor-pointer hover:underline" onClick={() => setShowShareDialog(true)}>
            {post.shares || 0} shares
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 mx-4 border-t border-gray-200 py-1 flex items-center justify-between relative">

        {/* Like Button Container with Hover Effect */}
        <div className="flex-1 group relative">
          {/* Reaction Picker Popup */}
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex bg-white rounded-full shadow-lg p-1 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-gray-100 z-20">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => handleReaction(reaction.type)}
                className="w-10 h-10 hover:scale-125 transition-transform duration-200 flex items-center justify-center text-2xl relative"
                title={reaction.label}
              >
                {reaction.icon}
              </button>
            ))}
          </div>

          <button
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-100 transition-colors ${
              myReaction
                ? REACTIONS.find(r => r.type === myReaction.type)?.color || 'text-primary'
                : 'text-gray-500'
            }`}
            onClick={() => handleReaction(myReaction ? myReaction.type : 'like')}
          >
            {myReaction ? (
              <>
                <span className="text-xl">{REACTIONS.find(r => r.type === myReaction.type)?.icon}</span>
                <span className="font-semibold text-[15px]">{REACTIONS.find(r => r.type === myReaction.type)?.label}</span>
              </>
            ) : (
              <>
                <ThumbsUp size={20} />
                <span className="font-semibold text-[15px]">Like</span>
              </>
            )}
          </button>
        </div>

        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={20} />
          <span className="font-semibold text-[15px]">Comment</span>
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
          onClick={() => setShowShareDialog(true)}
        >
          <Share2 size={20} />
          <span className="font-semibold text-[15px]">Share</span>
        </button>
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <ShareDialog onClose={() => setShowShareDialog(false)} post={post} onShare={handleShare} />
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-2 border-t border-gray-200">
          {/* Comment List */}
          <div className="mb-4 space-y-3" ref={commentMenuRef}>
            {post.comments.map(comment => {
              const commentAuthor = getUser(comment.userId);
              const isOwnComment = comment.userId === currentUser.id;
              const commentLikes = comment.likes || [];
              const commentLiked = commentLikes.includes(currentUser.id);
              return (
                <div
                  key={comment.id}
                  className="flex gap-2"
                  onMouseEnter={() => setHoveredComment(comment.id)}
                  onMouseLeave={() => setHoveredComment(null)}
                >
                  <img src={commentAuthor.avatar} alt={commentAuthor.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
                      <span className="font-semibold text-[13px] block">{commentAuthor.name}</span>
                      <span className="text-[15px]">{comment.content}</span>
                    </div>
                    <div className="flex gap-3 ml-3 mt-1 text-xs text-gray-500 font-semibold items-center">
                      <button
                        className={`cursor-pointer hover:underline ${commentLiked ? 'text-primary' : ''}`}
                        onClick={() => toggleCommentLike(post.id, comment.id, currentUser.id)}
                      >
                        Like{commentLikes.length > 0 ? ` · ${commentLikes.length}` : ''}
                      </button>
                      <span className="cursor-pointer hover:underline" onClick={() => setReplyingTo(comment.id)}>Reply</span>
                      <span>{formatDistanceToNow(comment.timestamp, { addSuffix: true })}</span>
                      {isOwnComment && (hoveredComment === comment.id || showCommentMoreMenu === comment.id) && (
                        <div className="relative ml-1">
                          <button
                            className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400"
                            onClick={() => setShowCommentMoreMenu(v => v === comment.id ? null : comment.id)}
                          >
                            <MoreHorizontal size={14} />
                          </button>
                          {showCommentMoreMenu === comment.id && (
                            <div className="absolute left-0 top-5 w-36 bg-white rounded-lg shadow-lg border border-gray-100 z-30 py-1">
                              <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-gray-100 text-red-500 text-left"
                                onClick={() => { deleteComment(post.id, comment.id); setShowCommentMoreMenu(null); }}
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {comment.replies.map(reply => {
                          const replyAuthor = getUser(reply.userId);
                          const isOwnReply = reply.userId === currentUser.id;
                          const replyLikes = reply.likes || [];
                          const replyLiked = replyLikes.includes(currentUser.id);
                          return (
                            <div
                              key={reply.id}
                              className="flex gap-2"
                              onMouseEnter={() => setHoveredComment(reply.id)}
                              onMouseLeave={() => setHoveredComment(null)}
                            >
                              <img src={replyAuthor.avatar} alt={replyAuthor.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                              <div className="flex-1">
                                <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block">
                                  <span className="font-semibold text-[13px] block">{replyAuthor.name}</span>
                                  <span className="text-[15px]">{reply.content}</span>
                                </div>
                                <div className="flex gap-3 ml-3 mt-1 text-xs text-gray-500 font-semibold items-center">
                                  <button
                                    className={`cursor-pointer hover:underline ${replyLiked ? 'text-primary' : ''}`}
                                    onClick={() => toggleCommentLike(post.id, reply.id, currentUser.id, true, comment.id)}
                                  >
                                    Like{replyLikes.length > 0 ? ` · ${replyLikes.length}` : ''}
                                  </button>
                                  <span>{formatDistanceToNow(reply.timestamp, { addSuffix: true })}</span>
                                  {isOwnReply && (hoveredComment === reply.id || showCommentMoreMenu === reply.id) && (
                                    <div className="relative ml-1">
                                      <button
                                        className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400"
                                        onClick={() => setShowCommentMoreMenu(v => v === reply.id ? null : reply.id)}
                                      >
                                        <MoreHorizontal size={14} />
                                      </button>
                                      {showCommentMoreMenu === reply.id && (
                                        <div className="absolute left-0 top-5 w-36 bg-white rounded-lg shadow-lg border border-gray-100 z-30 py-1">
                                          <button
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-gray-100 text-red-500 text-left"
                                            onClick={() => { deleteComment(post.id, reply.id, true, comment.id); setShowCommentMoreMenu(null); }}
                                          >
                                            <Trash2 size={14} />
                                            <span>Delete</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                      <div className="flex gap-2 mt-2">
                        <img src={currentUser.avatar} className="w-6 h-6 rounded-full object-cover" />
                        <form className="flex-1 bg-gray-100 rounded-full flex items-center px-3" onSubmit={(e) => handleComment(e, comment.id)}>
                          <input
                            type="text"
                            placeholder={`Reply to ${commentAuthor.name}...`}
                            className="w-full bg-transparent border-none outline-none text-[13px] py-1"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            autoFocus
                          />
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Comment Input */}
          <div className="flex gap-2 mb-2">
            <img src={currentUser.avatar} alt="Current User" className="w-8 h-8 rounded-full object-cover" />
            <form className="flex-1 bg-gray-100 rounded-full flex items-center px-3" onSubmit={(e) => handleComment(e)}>
              <input
                type="text"
                placeholder="Write a comment..."
                className="w-full bg-transparent border-none outline-none text-[15px] py-2"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-[400px] mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 text-center">
              <h3 className="text-xl font-bold">Delete post?</h3>
            </div>
            <div className="p-4 text-center text-[15px] text-gray-600">
              Are you sure you want to delete this post? This action can't be undone.
            </div>
            <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
              <button
                className="w-full bg-red-500 text-white py-2.5 rounded-md font-semibold hover:bg-red-600 transition-colors"
                onClick={handleDeletePost}
              >
                Delete
              </button>
              <button
                className="w-full bg-gray-200 text-[#050505] py-2.5 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Confirmation Dialog */}
      {showReportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowReportConfirm(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-[400px] mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 text-center">
              <h3 className="text-xl font-bold">Report post?</h3>
            </div>
            <div className="p-4 text-center text-[15px] text-gray-600">
              Are you sure you want to report this post? Our team will review it.
            </div>
            <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
              <button
                className="w-full bg-red-500 text-white py-2.5 rounded-md font-semibold hover:bg-red-600 transition-colors"
                onClick={confirmReport}
              >
                Report
              </button>
              <button
                className="w-full bg-gray-200 text-[#050505] py-2.5 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                onClick={() => setShowReportConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-[500px] mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">Edit post</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditPost}>
              <div className="p-4">
                <textarea
                  className="w-full border-none outline-none resize-none text-[17px] min-h-[120px]"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  autoFocus
                  placeholder="What's on your mind?"
                />
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={!editContent.trim()}
                  className="w-full bg-primary text-white py-2.5 rounded-md font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
