import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, Music, MoreHorizontal, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { CURRENT_USER_ID } from '../utils/mockData';
import PostDetailModal from '../components/PostDetailModal';

const Reels = () => {
  const { getExplore, users, toggleLike, toggleSave, savedPostIds, currentUser, toggleFollow, conversations, sendMessage } = useData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [sharePost, setSharePost] = useState(null);
  const [shareSent, setShareSent] = useState({});
  const [likeAnimations, setLikeAnimations] = useState({});

  const reels = getExplore();

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const cardHeight = e.target.clientHeight;
    const newIndex = Math.round(scrollTop / cardHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }
  };

  const handleDoubleTapLike = (postId) => {
    const post = reels.find(r => r.id === postId);
    if (post && !post.likes.includes(CURRENT_USER_ID)) {
      toggleLike(postId);
    }
    setLikeAnimations(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => setLikeAnimations(prev => ({ ...prev, [postId]: false })), 1000);
  };

  if (reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p className="text-sm">No reels available</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="h-screen overflow-y-auto snap-y snap-mandatory bg-black"
        onScroll={handleScroll}
      >
        {reels.map((post, index) => {
          const postUser = users[post.userId];
          if (!postUser) return null;
          const isLiked = post.likes.includes(CURRENT_USER_ID);
          const isSaved = savedPostIds.includes(post.id);
          const isFollowing = currentUser.following.includes(post.userId);
          const isOwnPost = post.userId === CURRENT_USER_ID;

          return (
            <div
              key={post.id}
              className="snap-start h-screen w-full relative flex items-center justify-center"
              onDoubleClick={() => handleDoubleTapLike(post.id)}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={post.images[0]}
                  alt="Reel"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
              </div>

              {/* Heart animation on double-tap */}
              {likeAnimations[post.id] && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <Heart className="w-24 h-24 text-white fill-white animate-heart-burst drop-shadow-lg" />
                </div>
              )}

              {/* Right side action buttons */}
              <div className="absolute right-4 bottom-28 flex flex-col items-center gap-5 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }}
                  className="flex flex-col items-center"
                >
                  <Heart className={`w-7 h-7 ${isLiked ? 'fill-[#ED4956] text-[#ED4956]' : 'text-white'} transition-colors`} />
                  <span className="text-white text-xs mt-1 font-semibold">{post.likes.length}</span>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                  className="flex flex-col items-center"
                >
                  <MessageCircle className="w-7 h-7 text-white" />
                  <span className="text-white text-xs mt-1 font-semibold">{post.comments.length}</span>
                </button>

                <button onClick={(e) => { e.stopPropagation(); setSharePost(post); }} className="flex flex-col items-center">
                  <Send className="w-7 h-7 text-white -rotate-[20deg]" />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); toggleSave(post.id); }}
                  className="flex flex-col items-center"
                >
                  <Bookmark className={`w-7 h-7 ${isSaved ? 'fill-white text-white' : 'text-white'} transition-colors`} />
                </button>

                <div className="w-7 h-7 rounded-md overflow-hidden border border-white/40 mt-2">
                  <img src={postUser.avatar} alt="" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Bottom left overlay info */}
              <div className="absolute bottom-16 left-4 right-16 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Link to={`/profile/${postUser.username}`} onClick={(e) => e.stopPropagation()}>
                    <img src={postUser.avatar} alt={postUser.username} className="w-9 h-9 rounded-full border-2 border-white/60 object-cover" />
                  </Link>
                  <Link to={`/profile/${postUser.username}`} className="text-white font-semibold text-sm" onClick={(e) => e.stopPropagation()}>
                    {postUser.username}
                  </Link>
                  {postUser.isVerified && (
                    <svg className="w-3.5 h-3.5 text-[#0095F6]" viewBox="0 0 40 40" fill="currentColor">
                      <path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094zM18.37 27.04l-6.77-6.77 2.83-2.83 3.94 3.94 8.52-8.52 2.83 2.83L18.37 27.04z"/>
                    </svg>
                  )}
                  {!isOwnPost && !isFollowing && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFollow(post.userId); }}
                      className="ml-1 px-3 py-1 border border-white/70 rounded-lg text-white text-xs font-semibold hover:bg-white/20 transition-colors"
                    >
                      Follow
                    </button>
                  )}
                </div>

                <p className="text-white text-sm leading-relaxed line-clamp-2 mb-2">
                  {post.caption}
                </p>

                {/* Audio bar */}
                <div className="flex items-center gap-2">
                  <Music className="w-3 h-3 text-white flex-shrink-0" />
                  <div className="overflow-hidden max-w-[200px]">
                    <p className="text-white text-xs whitespace-nowrap animate-marquee">
                      Original audio - {postUser.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      {sharePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65" onClick={() => setSharePost(null)}>
          <div className="bg-white rounded-xl w-[400px] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#EFEFEF]">
              <div className="w-6" />
              <h2 className="font-bold text-base">Share</h2>
              <button onClick={() => setSharePost(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {conversations.map(conv => {
                const others = conv.participants.filter(id => id !== CURRENT_USER_ID).map(id => users[id]).filter(Boolean);
                const label = others.map(u => u.username).join(', ');
                const avatar = others.length === 1 ? others[0].avatar : null;
                const isSent = shareSent[conv.id];
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
                      onClick={() => { sendMessage(conv.id, sharePost.id, 'post_share'); setShareSent(prev => ({ ...prev, [conv.id]: true })); }}
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
      )}
    </>
  );
};

export default Reels;
