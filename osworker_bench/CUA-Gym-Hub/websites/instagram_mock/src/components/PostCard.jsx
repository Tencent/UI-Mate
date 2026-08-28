import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDistanceToNow } from 'date-fns';
import PostDetailModal from './PostDetailModal';
import RichText from './RichText';
import { CURRENT_USER_ID } from '../utils/mockData';

const PostOptionsMenu = ({ post, onClose, onDelete, onEdit, onGoToPost }) => {
  const { toggleFollow, currentUser } = useData();
  const isOwnPost = post.userId === CURRENT_USER_ID;
  const isFollowing = currentUser.following.includes(post.userId);
  const [reported, setReported] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/p/${post.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => { setCopied(false); onClose(); }, 1200);
  };

  const handleReport = () => {
    setReported(true);
    setTimeout(() => { setReported(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65" onClick={onClose}>
      <div className="bg-white rounded-xl w-[400px] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        {reported ? (
          <div className="py-6 text-center text-sm text-[#8E8E8E]">Report submitted. Thank you for your feedback.</div>
        ) : copied ? (
          <div className="py-6 text-center text-sm text-[#0095F6] font-semibold">Link copied!</div>
        ) : (
          <>
            {isOwnPost ? (
              <>
                <button onClick={onDelete} className="w-full py-3.5 text-sm font-bold text-[#ED4956] border-b border-[#EFEFEF] hover:bg-gray-50 transition-colors">
                  Delete
                </button>
                <button onClick={() => { onEdit(); onClose(); }} className="w-full py-3.5 text-sm border-b border-[#EFEFEF] hover:bg-gray-50 transition-colors">
                  Edit
                </button>
              </>
            ) : (
              <>
                <button onClick={handleReport} className="w-full py-3.5 text-sm font-bold text-[#ED4956] border-b border-[#EFEFEF] hover:bg-gray-50 transition-colors">
                  Report
                </button>
                {isFollowing && (
                  <button
                    onClick={() => { toggleFollow(post.userId); onClose(); }}
                    className="w-full py-3.5 text-sm font-bold text-[#ED4956] border-b border-[#EFEFEF] hover:bg-gray-50 transition-colors"
                  >
                    Unfollow
                  </button>
                )}
              </>
            )}
            <button onClick={handleCopyLink} className="w-full py-3.5 text-sm border-b border-[#EFEFEF] hover:bg-gray-50 transition-colors">
              Copy link
            </button>
            <button onClick={() => { onGoToPost(); onClose(); }} className="w-full py-3.5 text-sm border-b border-[#EFEFEF] hover:bg-gray-50 transition-colors">
              Go to post
            </button>
            <button onClick={onClose} className="w-full py-3.5 text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const EditPostModal = ({ post, onClose, onSave }) => {
  const [caption, setCaption] = useState(post.caption);
  const [location, setLocation] = useState(post.location || '');

  const handleSubmit = () => {
    onSave({ caption, location });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#EFEFEF]">
          <button onClick={onClose} className="text-sm">Cancel</button>
          <h2 className="font-bold text-base">Edit info</h2>
          <button onClick={handleSubmit} className="text-[#0095F6] font-bold text-sm">Done</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#8E8E8E] block mb-1 uppercase">Caption</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value.slice(0, 2200))}
              className="w-full border border-[#DBDBDB] rounded-lg px-3 py-2 text-sm outline-none resize-none h-24 focus:border-[#A8A8A8] transition-colors"
              maxLength={2200}
            />
            <div className="text-xs text-[#C7C7C7] text-right mt-1">{caption.length}/2,200</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8E8E8E] block mb-1 uppercase">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full border border-[#DBDBDB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A8A8A8] transition-colors"
              placeholder="Add location"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SharePostModal = ({ post, onClose }) => {
  const { conversations, users, sendMessage } = useData();
  const [sent, setSent] = useState({});

  const handleSend = (convId) => {
    sendMessage(convId, post.id, 'post_share');
    setSent(prev => ({ ...prev, [convId]: true }));
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65" onClick={onClose}>
      <div className="bg-white rounded-xl w-[400px] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
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
              <div key={conv.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                      {label.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold">{label}</span>
                </div>
                <button
                  onClick={() => handleSend(conv.id)}
                  disabled={isSent}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isSent ? 'bg-[#EFEFEF] text-[#8E8E8E]' : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'}`}
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

// Caption with "more" truncation
const CaptionText = ({ username, caption }) => {
  const [expanded, setExpanded] = useState(false);
  const TRUNCATE_LENGTH = 125;
  const shouldTruncate = caption.length > TRUNCATE_LENGTH;

  return (
    <div className="text-sm mb-1">
      <Link to={`/profile/${username}`} className="font-semibold mr-1.5 hover:opacity-70">{username}</Link>
      {shouldTruncate && !expanded ? (
        <>
          <RichText text={caption.slice(0, TRUNCATE_LENGTH).trimEnd()} />
          <span className="text-[#8E8E8E]">... </span>
          <button
            onClick={() => setExpanded(true)}
            className="text-[#8E8E8E] hover:text-[#262626] transition-colors"
          >
            more
          </button>
        </>
      ) : (
        <RichText text={caption} />
      )}
    </div>
  );
};

const PostCard = ({ post }) => {
  const { users, toggleLike, addComment, toggleSave, deletePost, currentUser, savedPostIds, updatePost } = useData();
  const [commentText, setCommentText] = useState('');
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const postUser = users[post.userId];
  if (!postUser) return null;
  const isLiked = post.likes.includes(CURRENT_USER_ID);
  const isSaved = savedPostIds.includes(post.id);

  const handleLike = () => {
    setLikeAnimating(true);
    toggleLike(post.id);
    setTimeout(() => setLikeAnimating(false), 350);
  };

  const handleDoubleTap = () => {
    if (!isLiked) toggleLike(post.id);
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 1000);
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleDelete = () => {
    deletePost(post.id);
    setShowOptionsMenu(false);
  };

  const handleEditSave = ({ caption, location }) => {
    if (updatePost) updatePost(post.id, { caption, location });
  };

  // Show first 2 preview comments
  const previewComments = post.comments.slice(-2);

  return (
    <>
      <article className="bg-white border-b border-[#EFEFEF] md:border md:border-[#DBDBDB] md:rounded-lg mb-3">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <Link to={`/profile/${postUser.username}`} className="flex items-center gap-2.5">
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <div className="bg-white p-[1.5px] rounded-full">
                <img src={postUser.avatar} alt={postUser.username} className="w-8 h-8 rounded-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-[13px] leading-tight">{postUser.username}</span>
                {postUser.isVerified && (
                  <svg className="w-3.5 h-3.5 text-[#0095F6]" viewBox="0 0 40 40" fill="currentColor">
                    <path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094zM18.37 27.04l-6.77-6.77 2.83-2.83 3.94 3.94 8.52-8.52 2.83 2.83L18.37 27.04z"/>
                  </svg>
                )}
              </div>
              {post.location && <span className="text-[11px] text-[#262626] leading-tight font-normal">{post.location}</span>}
            </div>
          </Link>
          <button onClick={() => setShowOptionsMenu(true)} className="p-2 -mr-2 hover:opacity-50 transition-opacity">
            <MoreHorizontal className="w-5 h-5 text-[#262626]" />
          </button>
        </div>

        {/* Image(s) */}
        <div className="relative aspect-square bg-black overflow-hidden select-none" onDoubleClick={handleDoubleTap}>
          <img
            src={post.images[currentImageIndex]}
            alt="Post"
            className="w-full h-full object-cover"
            draggable="false"
          />

          {/* Carousel Dots */}
          {post.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
              {post.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-[6px] h-[6px] rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-[#0095F6] scale-100' : 'bg-white/60 scale-90'}`}
                />
              ))}
            </div>
          )}

          {/* Carousel Counter (top right) */}
          {post.images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/60 rounded-full px-3 py-1 text-white text-xs font-medium">
              {currentImageIndex + 1}/{post.images.length}
            </div>
          )}

          {/* Carousel Arrows */}
          {post.images.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev - 1); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
              )}
              {currentImageIndex < post.images.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev + 1); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              )}
            </>
          )}

          {/* Heart Animation Overlay */}
          {showHeartOverlay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="w-20 h-20 text-white fill-white animate-heart-burst drop-shadow-lg" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-3 pt-2.5">
          <div className="flex justify-between mb-2">
            <div className="flex gap-4">
              <button onClick={handleLike} className={`transition-transform active:scale-75 ${likeAnimating ? 'animate-like-pop' : ''}`}>
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#ED4956] text-[#ED4956]' : 'text-[#262626] hover:text-[#8E8E8E]'} transition-colors`} />
              </button>
              <button onClick={() => setIsDetailOpen(true)} className="transition-transform active:scale-90">
                <MessageCircle className="w-6 h-6 text-[#262626] hover:text-[#8E8E8E] transition-colors" />
              </button>
              <button onClick={() => setShowShareModal(true)} className="transition-transform active:scale-90">
                <Send className="w-6 h-6 text-[#262626] hover:text-[#8E8E8E] transition-colors -rotate-[20deg]" />
              </button>
            </div>
            <button onClick={() => toggleSave(post.id)} className="transition-transform active:scale-75">
              <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-[#262626] text-[#262626]' : 'text-[#262626] hover:text-[#8E8E8E]'} transition-colors`} />
            </button>
          </div>

          {/* Likes */}
          <div className="font-semibold text-sm mb-1">
            {post.likes.length.toLocaleString()} {post.likes.length === 1 ? 'like' : 'likes'}
          </div>

          {/* Caption with "more" */}
          <CaptionText username={postUser.username} caption={post.caption} />

          {/* Comments preview */}
          {post.comments.length > 2 && (
            <button onClick={() => setIsDetailOpen(true)} className="text-[#8E8E8E] text-sm mb-0.5 block">
              View all {post.comments.length} comments
            </button>
          )}

          {previewComments.map(comment => {
            const cUser = users[comment.userId];
            if (!cUser) return null;
            return (
              <div key={comment.id} className="text-sm mb-0.5">
                <Link to={`/profile/${cUser.username}`} className="font-semibold mr-1.5 hover:opacity-70">{cUser.username}</Link>
                <span className="text-[#262626]">{comment.text.length > 80 ? comment.text.slice(0, 80) + '...' : comment.text}</span>
              </div>
            );
          })}

          {/* Timestamp */}
          <div className="text-[10px] text-[#8E8E8E] uppercase mt-1 mb-2.5 tracking-wide">
            {formatDistanceToNow(new Date(post.created))} ago
          </div>
        </div>

        {/* Add Comment */}
        <form onSubmit={handleSubmitComment} className="border-t border-[#EFEFEF] px-3 py-2.5 flex items-center gap-3">
          <Smile className="w-6 h-6 text-[#262626] flex-shrink-0 cursor-pointer hover:text-[#8E8E8E] transition-colors" />
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 text-sm outline-none bg-transparent placeholder-[#8E8E8E]"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          {commentText.trim() && (
            <button
              type="submit"
              className="text-[#0095F6] font-semibold text-sm hover:text-[#00376B] transition-colors"
            >
              Post
            </button>
          )}
        </form>
      </article>

      {isDetailOpen && <PostDetailModal post={post} onClose={() => setIsDetailOpen(false)} />}
      {showOptionsMenu && <PostOptionsMenu post={post} onClose={() => setShowOptionsMenu(false)} onDelete={handleDelete} onEdit={() => setShowEditModal(true)} onGoToPost={() => setIsDetailOpen(true)} />}
      {showEditModal && <EditPostModal post={post} onClose={() => setShowEditModal(false)} onSave={handleEditSave} />}
      {showShareModal && <SharePostModal post={post} onClose={() => setShowShareModal(false)} />}
    </>
  );
};

export default PostCard;
