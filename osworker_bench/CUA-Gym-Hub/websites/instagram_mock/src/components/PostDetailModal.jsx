import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { formatDistanceToNow } from 'date-fns';
import RichText from './RichText';
import { CURRENT_USER_ID } from '../utils/mockData';

const ShareModal = ({ post, conversations, onClose }) => {
  const { users, sendMessage } = useData();
  const [sent, setSent] = useState({});
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getConvLabel = (conv) => {
    const others = conv.participants
      .filter(id => id !== CURRENT_USER_ID)
      .map(id => users[id])
      .filter(Boolean);
    return others.map(u => u.username).join(', ');
  };

  const getConvAvatar = (conv) => {
    const others = conv.participants
      .filter(id => id !== CURRENT_USER_ID)
      .map(id => users[id])
      .filter(Boolean);
    return others.length === 1 ? others[0].avatar : null;
  };

  const handleSend = (convId) => {
    sendMessage(convId, post.id, 'post_share');
    setSent(prev => ({ ...prev, [convId]: true }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div ref={modalRef} className="bg-white rounded-xl w-[400px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#EFEFEF]">
          <div className="w-6" />
          <h2 className="font-bold text-base">Share</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {conversations.map(conv => {
            const label = getConvLabel(conv);
            const avatar = getConvAvatar(conv);
            const isSent = sent[conv.id];
            return (
              <div key={conv.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                      {label.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold">{label}</span>
                </div>
                <button
                  onClick={() => handleSend(conv.id)}
                  disabled={isSent}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${isSent ? 'bg-[#EFEFEF] text-[#8E8E8E]' : 'bg-[#0095F6] text-white hover:bg-blue-600'}`}
                >
                  {isSent ? 'Sent' : 'Send'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PostDetailModal = ({ post, onClose }) => {
  const { users, toggleLike, toggleCommentLike, addComment, addReply, toggleSave, deleteComment, savedPostIds, currentUser, conversations, sendMessage } = useData();
  const [commentText, setCommentText] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, username }
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const commentInputRef = useRef(null);
  const optionsRef = useRef(null);
  const [reported, setReported] = useState(false);
  const [copied, setCopied] = useState(false);

  const postUser = users[post.userId];
  if (!postUser) return null;
  const isLiked = post.likes.includes(CURRENT_USER_ID);
  const isSaved = savedPostIds.includes(post.id);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = () => toggleLike(post.id);

  const handleDoubleTap = () => {
    if (!isLiked) toggleLike(post.id);
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 1000);
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (replyingTo) {
      addReply(post.id, replyingTo.commentId, commentText.trim());
      setReplyingTo(null);
    } else {
      addComment(post.id, commentText);
    }
    setCommentText('');
  };

  const handleReply = (comment) => {
    const commentUser = users[comment.userId];
    setReplyingTo({ commentId: comment.id, username: commentUser ? commentUser.username : '' });
    setCommentText(`@${commentUser ? commentUser.username : ''} `);
    commentInputRef.current?.focus();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/p/${post.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => { setCopied(false); setShowOptionsMenu(false); }, 1500);
  };

  const handleReport = () => {
    setReported(true);
    setTimeout(() => { setReported(false); setShowOptionsMenu(false); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 md:p-10" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-50 hover:opacity-70 transition-opacity">
        <X className="w-7 h-7" />
      </button>

      <div className="bg-white w-full max-w-6xl max-h-[90vh] h-full flex rounded-lg overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Image Section */}
        <div
          className="hidden md:flex bg-black flex-1 items-center justify-center relative overflow-hidden"
          onDoubleClick={handleDoubleTap}
        >
           <img
              src={post.images[currentImageIndex]}
              alt="Post"
              className="max-w-full max-h-full object-contain select-none"
            />
            {post.images.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev - 1); }}
                    className="absolute left-4 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-white"
                  >
                    <span className="text-sm">&larr;</span>
                  </button>
                )}
                {currentImageIndex < post.images.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev + 1); }}
                    className="absolute right-4 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-white"
                  >
                    <span className="text-sm">&rarr;</span>
                  </button>
                )}
                {/* Carousel dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                  {post.images.map((_, idx) => (
                    <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-[#0095F6]' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}

            {/* Heart Animation Overlay */}
            {showHeartOverlay && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart className="w-32 h-32 text-white fill-white animate-heart drop-shadow-lg" />
              </div>
            )}
        </div>

        {/* Sidebar Section */}
        <div className="w-full md:w-[400px] lg:w-[500px] flex flex-col h-full bg-white border-l border-[#DBDBDB]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#EFEFEF]">
            <Link to={`/profile/${postUser.username}`} onClick={onClose} className="flex items-center gap-3">
              <img src={postUser.avatar} alt={postUser.username} className="w-8 h-8 rounded-full object-cover" />
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{postUser.username}</span>
                {postUser.isVerified && (
                  <svg className="w-3.5 h-3.5 text-[#0095F6]" viewBox="0 0 40 40" fill="currentColor">
                    <path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094zM18.37 27.04l-6.77-6.77 2.83-2.83 3.94 3.94 8.52-8.52 2.83 2.83L18.37 27.04z"/>
                  </svg>
                )}
              </div>
            </Link>
            <div className="relative" ref={optionsRef}>
              <button onClick={() => setShowOptionsMenu(!showOptionsMenu)}>
                <MoreHorizontal className="w-5 h-5 text-[#262626] cursor-pointer" />
              </button>
              {showOptionsMenu && (
                <div className="absolute right-0 top-7 bg-white border border-[#DBDBDB] rounded-xl shadow-lg w-48 z-10 overflow-hidden">
                  {reported ? (
                    <div className="py-3 px-4 text-sm text-[#8E8E8E] text-center">Report submitted.</div>
                  ) : copied ? (
                    <div className="py-3 px-4 text-sm text-[#0095F6] text-center font-semibold">Link copied!</div>
                  ) : (
                    <>
                      {post.userId !== CURRENT_USER_ID && (
                        <button onClick={handleReport} className="w-full py-3 px-4 text-sm font-bold text-[#ED4956] hover:bg-gray-50 text-left border-b border-[#EFEFEF]">Report</button>
                      )}
                      <button onClick={handleCopyLink} className="w-full py-3 px-4 text-sm hover:bg-gray-50 text-left">Copy link</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comments Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Caption as first comment */}
            <div className="flex gap-3">
              <Link to={`/profile/${postUser.username}`} onClick={onClose} className="flex-shrink-0">
                <img src={postUser.avatar} className="w-8 h-8 rounded-full object-cover" />
              </Link>
              <div className="text-sm">
                <Link to={`/profile/${postUser.username}`} onClick={onClose} className="font-semibold mr-2 hover:opacity-70">{postUser.username}</Link>
                <RichText text={post.caption} />
                <div className="text-xs text-[#8E8E8E] mt-1">{formatDistanceToNow(new Date(post.created))} ago</div>
              </div>
            </div>

            {/* Actual Comments */}
            {post.comments.map(comment => {
              const commentUser = users[comment.userId];
              if (!commentUser) return null;
              const isCommentLiked = comment.likes && comment.likes.includes(CURRENT_USER_ID);
              const isOwnComment = comment.userId === CURRENT_USER_ID;
              const isReply = comment.isReply;

              return (
                <div key={comment.id} className={`flex gap-3 group ${isReply ? 'ml-10' : ''}`}>
                  <Link to={`/profile/${commentUser.username}`} onClick={onClose} className="flex-shrink-0">
                    <img src={commentUser.avatar} className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} rounded-full object-cover`} />
                  </Link>
                  <div className="text-sm flex-1">
                    <Link to={`/profile/${commentUser.username}`} onClick={onClose} className="font-semibold mr-2 hover:opacity-70">{commentUser.username}</Link>
                    <RichText text={comment.text} />
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#8E8E8E]">
                      <span>{formatDistanceToNow(new Date(comment.created))} ago</span>
                      {comment.likes && comment.likes.length > 0 && (
                        <span className="font-semibold">{comment.likes.length} {comment.likes.length === 1 ? 'like' : 'likes'}</span>
                      )}
                      {!isReply && (
                        <button
                          onClick={() => handleReply(comment)}
                          className="font-semibold hover:text-[#262626]"
                        >
                          Reply
                        </button>
                      )}
                      {isOwnComment && (
                        <button
                          onClick={() => deleteComment(post.id, comment.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ED4956] hover:text-red-700"
                          title="Delete comment"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => toggleCommentLike(post.id, comment.id)} className="flex-shrink-0 mt-2">
                    <Heart className={`w-3 h-3 cursor-pointer ${isCommentLiked ? 'fill-[#ED4956] text-[#ED4956]' : 'text-[#8E8E8E] hover:text-[#262626]'}`} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-[#EFEFEF] p-4">
            <div className="flex justify-between mb-3">
              <div className="flex gap-4">
                <button onClick={handleLike} className="transition-transform active:scale-90">
                  <Heart className={`w-7 h-7 ${isLiked ? 'fill-[#ED4956] text-[#ED4956]' : 'text-[#262626] hover:text-[#8E8E8E]'}`} />
                </button>
                <button onClick={() => commentInputRef.current?.focus()} className="transition-transform active:scale-90">
                  <MessageCircle className="w-7 h-7 text-[#262626] hover:text-[#8E8E8E] cursor-pointer" />
                </button>
                <button onClick={() => setShowShareModal(true)} className="transition-transform active:scale-90">
                  <Send className="w-7 h-7 text-[#262626] hover:text-[#8E8E8E] cursor-pointer -rotate-[20deg]" />
                </button>
              </div>
              <button onClick={() => toggleSave(post.id)} className="transition-transform active:scale-90">
                <Bookmark className={`w-7 h-7 ${isSaved ? 'fill-[#262626] text-[#262626]' : 'text-[#262626] hover:text-[#8E8E8E]'}`} />
              </button>
            </div>
            <div className="font-semibold text-sm mb-1">{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</div>
            <div className="text-[10px] text-[#8E8E8E] uppercase mb-3">
              {formatDistanceToNow(new Date(post.created))} ago
            </div>

            {replyingTo && (
              <div className="flex items-center justify-between text-xs text-[#8E8E8E] bg-[#FAFAFA] px-2 py-1 rounded mb-1">
                <span>Replying to <span className="font-semibold text-[#0095F6]">@{replyingTo.username}</span></span>
                <button onClick={() => { setReplyingTo(null); setCommentText(''); }} className="ml-2 text-[#8E8E8E] hover:text-[#262626]">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitComment} className="flex items-center gap-2 mt-2">
              <Smile className="w-6 h-6 text-[#8E8E8E] flex-shrink-0" />
              <input
                ref={commentInputRef}
                type="text"
                placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a comment...'}
                className="flex-1 text-sm outline-none bg-transparent"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="text-[#0095F6] font-semibold text-sm disabled:opacity-30"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareModal post={post} conversations={conversations} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
};

export default PostDetailModal;
