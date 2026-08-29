import React, { useState, useRef, useEffect } from 'react';
import { ThumbsUp, MessageSquare, Repeat2, Send, MoreHorizontal, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const REACTION_TYPES = [
  { key: 'like', emoji: '\uD83D\uDC4D', label: 'Like', color: 'text-xinkedin-blue' },
  { key: 'celebrate', emoji: '\uD83D\uDC4F', label: 'Celebrate', color: 'text-green-600' },
  { key: 'love', emoji: '\u2764\uFE0F', label: 'Love', color: 'text-red-500' },
  { key: 'insightful', emoji: '\uD83D\uDCA1', label: 'Insightful', color: 'text-yellow-600' },
  { key: 'funny', emoji: '\uD83D\uDE04', label: 'Funny', color: 'text-orange-500' },
  { key: 'curious', emoji: '\uD83E\uDD14', label: 'Curious', color: 'text-purple-600' },
];

function getConnectionDegree(userId, currentUser, users) {
  if (currentUser.connections.includes(userId)) return '1st';
  const user = users[userId];
  if (user && user.connections) {
    for (const connId of user.connections) {
      if (currentUser.connections.includes(connId)) return '2nd';
    }
  }
  return '3rd+';
}

function renderContentWithHashtags(text, onHashtagClick) {
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('#')) {
      return (
        <span
          key={i}
          className="text-xinkedin-blue font-semibold hover:underline cursor-pointer"
          onClick={() => onHashtagClick && onHashtagClick(part)}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

function getTotalReactions(reactions) {
  if (!reactions) return 0;
  return Object.values(reactions).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
}

function getTopReactionEmojis(reactions) {
  if (!reactions) return [];
  const counts = REACTION_TYPES
    .map(r => ({ emoji: r.emoji, count: (reactions[r.key] || []).length }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count);
  return counts.slice(0, 3).map(r => r.emoji);
}

function getUserReaction(reactions, userId) {
  if (!reactions) return null;
  for (const type of REACTION_TYPES) {
    if (reactions[type.key] && reactions[type.key].includes(userId)) {
      return type;
    }
  }
  return null;
}

// Modal for "Share with thoughts" - compose a repost with a comment
function ShareWithThoughtsModal({ post, author, onClose, onShare }) {
  const { state } = useStore();
  const [thoughtText, setThoughtText] = useState('');

  const handleSubmit = () => {
    onShare(thoughtText.trim(), post.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-lg w-full max-w-xl shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Share post</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <img src={state.currentUser.avatar} className="w-10 h-10 rounded-full" alt={state.currentUser.name} />
            <span className="font-semibold">{state.currentUser.name}</span>
          </div>
          <textarea
            value={thoughtText}
            onChange={(e) => setThoughtText(e.target.value)}
            placeholder="What do you want to say about this?"
            className="w-full text-base min-h-[100px] resize-none outline-none placeholder:text-gray-500 border border-gray-200 rounded p-3 mb-3"
            autoFocus
          />
          {/* Original post preview */}
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <img src={author?.avatar} className="w-8 h-8 rounded-full" alt={author?.name} />
              <div>
                <p className="text-sm font-semibold">{author?.name}</p>
                <p className="text-xs text-gray-500">{author?.headline}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-xinkedin-blue text-white px-6 py-1.5 rounded-full font-semibold hover:bg-xinkedin-dark"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal for "Send" - share post via DM
function SendPostModal({ post, author, onClose }) {
  const { state, createChat, sendMessage } = useStore();
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const connections = state.currentUser.connections
    .map(id => state.users[id])
    .filter(Boolean);

  const handleSend = () => {
    if (!selectedUserId) return;
    const chatId = createChat(selectedUserId);
    const postLink = `[Shared post by ${author?.name}]: "${post.content.slice(0, 80)}${post.content.length > 80 ? '...' : ''}"`;
    const messageContent = note.trim() ? `${note}\n\n${postLink}` : postLink;
    sendMessage(chatId, messageContent);
    setSent(true);
    setTimeout(() => {
      onClose();
      navigate('/messaging');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Send post</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          {sent ? (
            <p className="text-center text-green-600 font-semibold py-4">Sent! Redirecting to messages...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">Send this post to a connection</p>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded mb-3">
                {connections.length === 0 ? (
                  <p className="text-sm text-gray-500 p-3">No connections to send to.</p>
                ) : (
                  connections.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${selectedUserId === user.id ? 'bg-blue-50 border-l-2 border-xinkedin-blue' : ''}`}
                    >
                      <img src={user.avatar} className="w-8 h-8 rounded-full" alt={user.name} />
                      <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{user.headline}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a message (optional)"
                className="w-full border border-gray-200 rounded p-2 text-sm resize-none h-20 focus:outline-none focus:border-xinkedin-blue"
              />
            </>
          )}
        </div>
        {!sent && (
          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-full">Cancel</button>
            <button
              onClick={handleSend}
              disabled={!selectedUserId}
              className="bg-xinkedin-blue text-white px-6 py-1.5 rounded-full font-semibold hover:bg-xinkedin-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostCard({ post }) {
  const { state, toggleReaction, addComment, deletePost, addPost, toggleCommentLike } = useStore();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showShareWithThoughts, setShowShareWithThoughts] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const menuRef = useRef(null);
  const shareMenuRef = useRef(null);

  const author = post.userId === state.currentUser.id ? state.currentUser : state.users[post.userId];
  const userReaction = getUserReaction(post.reactions, state.currentUser.id);
  const totalReactions = getTotalReactions(post.reactions);
  const topEmojis = getTopReactionEmojis(post.reactions);
  const isOwnPost = post.userId === state.currentUser.id;
  const degree = !isOwnPost ? getConnectionDegree(post.userId, state.currentUser, state.users) : null;

  // Repost handling
  const isRepost = post.repostOf && post.repostedBy;
  const reposter = isRepost ? (post.repostedBy === state.currentUser.id ? state.currentUser : state.users[post.repostedBy]) : null;
  // Original post for reposts
  const originalPost = isRepost ? state.posts.find(p => p.id === post.repostOf) : null;
  const originalAuthor = originalPost
    ? (originalPost.userId === state.currentUser.id ? state.currentUser : state.users[originalPost.userId])
    : null;

  // Content truncation
  const shouldTruncate = post.content.length > 250;

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleReactionHover = () => {
    clearTimeout(hoverTimeoutRef.current);
    setShowReactionPicker(true);
  };

  const handleReactionLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker(false);
    }, 300);
  };

  const handleSelectReaction = (type) => {
    toggleReaction(post.id, type);
    setShowReactionPicker(false);
  };

  const handleRepost = () => {
    addPost('', null, post.id);
    setShowShareMenu(false);
  };

  const handleShareWithThoughts = () => {
    setShowShareMenu(false);
    setShowShareWithThoughts(true);
  };

  const handleShareWithThoughtsSubmit = (thoughtText, originalPostId) => {
    addPost(thoughtText, null, originalPostId);
  };

  const handleHashtagClick = (hashtag) => {
    const query = hashtag.slice(1); // remove leading #
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) setShowShareMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeReactionStyle = userReaction ? userReaction.color : 'text-gray-600';
  const activeReactionEmoji = userReaction ? userReaction.emoji : null;
  const activeReactionLabel = userReaction ? userReaction.label : 'Like';

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
        {/* Repost header */}
        {isRepost && reposter && (
          <div className="px-4 pt-3 pb-1 flex items-center gap-2 text-xs text-gray-500">
            <Repeat2 size={14} />
            <span className="font-semibold hover:text-xinkedin-blue cursor-pointer" onClick={() => navigate(reposter.id === state.currentUser.id ? '/profile/me' : `/profile/${reposter.id}`)}>{reposter.name}</span>
            <span>reposted this</span>
          </div>
        )}

        {/* Header */}
        <div className="p-4 flex gap-3">
          <img src={author?.avatar} alt={author?.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 cursor-pointer" onClick={() => navigate(author?.id === state.currentUser.id ? '/profile/me' : `/profile/${author?.id}`)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-sm hover:text-xinkedin-blue cursor-pointer" onClick={() => navigate(author?.id === state.currentUser.id ? '/profile/me' : `/profile/${author?.id}`)}>{author?.name}</h3>
              {degree && <span className="text-xs text-gray-500">&#183; {degree}</span>}
            </div>
            <p className="text-xs text-gray-500 line-clamp-1">{author?.headline}</p>
            <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.created))} ago &#183; <span title="Public">&#127758;</span></p>
          </div>
          {/* 3-dot menu for own posts */}
          {isOwnPost && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <MoreHorizontal size={18} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 w-48">
                  <button
                    onClick={() => { deletePost(post.id); setShowMenu(false); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <Trash2 size={16} /> Delete post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pb-2">
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {shouldTruncate && !isExpanded ? (
              <>
                {renderContentWithHashtags(post.content.slice(0, 250), handleHashtagClick)}...
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-xinkedin-blue font-semibold hover:underline ml-1"
                >
                  see more
                </button>
              </>
            ) : (
              renderContentWithHashtags(post.content, handleHashtagClick)
            )}
          </div>
        </div>
        {post.image && (
          <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
        )}

        {/* Repost: show original post content inline */}
        {isRepost && (
          <div className="mx-4 mb-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
            {originalPost && originalAuthor ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <img src={originalAuthor.avatar} className="w-8 h-8 rounded-full" alt={originalAuthor.name} />
                  <div>
                    <p className="text-sm font-semibold">{originalAuthor.name}</p>
                    <p className="text-xs text-gray-500">{originalAuthor.headline}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-4">{originalPost.content}</p>
                {originalPost.image && (
                  <img src={originalPost.image} alt="Original post" className="w-full h-auto rounded mt-2 max-h-48 object-cover" />
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">Original post is no longer available.</p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="px-4 py-2 border-b border-gray-100 flex justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            {totalReactions > 0 && (
              <>
                <span className="flex">{topEmojis.join('')}</span>
                <span>{totalReactions}</span>
              </>
            )}
          </span>
          <span className="hover:text-xinkedin-blue hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>
            {post.comments.length > 0 ? `${post.comments.length} comment${post.comments.length !== 1 ? 's' : ''}` : ''}
          </span>
        </div>

        {/* Actions */}
        <div className="px-2 py-1 flex justify-between relative">
          {/* Like/React button with picker */}
          <div
            className="relative flex-1"
            onMouseEnter={handleReactionHover}
            onMouseLeave={handleReactionLeave}
          >
            {showReactionPicker && (
              <div
                className="absolute bottom-full left-0 mb-1 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1.5 flex gap-1 z-20 animate-fade-in"
                onMouseEnter={handleReactionHover}
                onMouseLeave={handleReactionLeave}
              >
                {REACTION_TYPES.map(r => (
                  <button
                    key={r.key}
                    onClick={() => handleSelectReaction(r.key)}
                    className="w-9 h-9 flex items-center justify-center text-xl hover:scale-125 transition-transform rounded-full hover:bg-gray-100"
                    title={r.label}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => handleSelectReaction(userReaction ? userReaction.key : 'like')}
              className={`flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-100 w-full justify-center transition-colors ${activeReactionStyle}`}
            >
              {activeReactionEmoji ? (
                <span className="text-lg leading-none">{activeReactionEmoji}</span>
              ) : (
                <ThumbsUp size={18} />
              )}
              <span className="font-semibold text-sm">{activeReactionLabel}</span>
            </button>
          </div>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-100 flex-1 justify-center text-gray-600"
          >
            <MessageSquare size={18} />
            <span className="font-semibold text-sm">Comment</span>
          </button>

          {/* Share/Repost */}
          <div className="relative flex-1" ref={shareMenuRef}>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-100 w-full justify-center text-gray-600"
            >
              <Repeat2 size={18} />
              <span className="font-semibold text-sm">Repost</span>
            </button>
            {showShareMenu && (
              <div className="absolute bottom-full left-0 mb-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-56">
                <button
                  onClick={handleRepost}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Repeat2 size={18} /> Repost
                </button>
                <button
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={handleShareWithThoughts}
                >
                  <MessageSquare size={18} /> Share with thoughts
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 px-4 py-3 rounded hover:bg-gray-100 flex-1 justify-center text-gray-600"
          >
            <Send size={18} />
            <span className="font-semibold text-sm">Send</span>
          </button>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="p-4 bg-gray-50">
            <form onSubmit={handleComment} className="flex gap-2 mb-4">
              <img src={state.currentUser.avatar} className="w-8 h-8 rounded-full" alt="You" />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-1 text-sm focus:outline-none focus:border-gray-500"
              />
            </form>
            <div className="space-y-4">
              {post.comments.map(comment => {
                const commenter = comment.userId === state.currentUser.id ? state.currentUser : state.users[comment.userId];
                const commentLikes = comment.likes || [];
                const isCommentLikedByMe = commentLikes.includes(state.currentUser.id);
                return (
                  <div key={comment.id} className="flex gap-2">
                    <img src={commenter?.avatar} className="w-8 h-8 rounded-full flex-shrink-0" alt={commenter?.name} />
                    <div>
                      <div className="bg-gray-100 p-2 rounded-r-lg rounded-bl-lg">
                        <h4 className="text-xs font-semibold">{commenter?.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">{commenter?.headline}</p>
                        <p className="text-xs text-gray-700 mt-1">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 px-2">
                        <span
                          onClick={() => toggleCommentLike(post.id, comment.id)}
                          className={`text-xs font-semibold cursor-pointer ${isCommentLikedByMe ? 'text-xinkedin-blue' : 'text-gray-500 hover:text-xinkedin-blue'}`}
                        >
                          {isCommentLikedByMe ? 'Liked' : 'Like'}
                          {commentLikes.length > 0 && <span className="ml-1 font-normal text-gray-500">({commentLikes.length})</span>}
                        </span>
                        <span className="text-xs text-gray-400">&#183;</span>
                        <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.created))} ago</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Share with thoughts modal */}
      {showShareWithThoughts && (
        <ShareWithThoughtsModal
          post={post}
          author={author}
          onClose={() => setShowShareWithThoughts(false)}
          onShare={handleShareWithThoughtsSubmit}
        />
      )}

      {/* Send post via DM modal */}
      {showSendModal && (
        <SendPostModal
          post={post}
          author={author}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </>
  );
}
