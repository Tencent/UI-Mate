import React, { useState } from 'react';
import { Search, Play, ThumbsUp, MessageCircle, Share2, Bookmark, Volume2, VolumeX, Maximize, Send } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDistanceToNow } from 'date-fns';

const VideoCard = ({ post, author }) => {
  const { currentUser, state, toggleLike, addComment, sharePost, savePost } = useApp();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const videoRef = React.useRef(null);

  const reactions = post.reactions || (post.likes ? post.likes.map(uid => ({ userId: uid, type: 'like' })) : []);
  const myReaction = reactions.find(r => r.userId === currentUser.id);

  const handlePlay = () => {
    if (!post.video) return;
    if (playing) {
      videoRef.current?.pause();
      setPlaying(false);
    } else {
      videoRef.current?.play();
      setPlaying(true);
    }
  };

  const handleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleFullscreen = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.requestFullscreen?.();
    }
  };

  const handleLike = () => {
    toggleLike(post.id, currentUser.id, 'like');
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      id: `c_${Date.now()}`,
      userId: currentUser.id,
      content: commentText,
      timestamp: Date.now()
    };
    addComment(post.id, newComment);
    setCommentText('');
  };

  const handleShare = () => {
    sharePost(post.id);
  };

  const reactionCount = reactions.length;
  const commentCount = (post.comments || []).length;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
      {/* Video Player */}
      <div className="relative bg-black aspect-video cursor-pointer" onClick={handlePlay}>
        {post.video ? (
          <video
            ref={videoRef}
            src={post.video}
            className="w-full h-full object-contain"
            onEnded={() => setPlaying(false)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <img
              src={post.image || `https://picsum.photos/800/450?random=${post.id}`}
              alt={post.content}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-white text-base font-semibold bg-black/50 px-4 py-2 rounded-md">Video not available</p>
            </div>
          </div>
        )}
        {post.video && !playing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
              <Play size={28} className="text-white ml-1" fill="white" />
            </div>
          </div>
        )}
        {/* Controls overlay */}
        {post.video && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/70 opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <button onClick={handlePlay} className="text-white hover:text-gray-200">
              <Play size={18} fill={playing ? 'none' : 'white'} />
            </button>
            <button onClick={handleMute} className="text-white hover:text-gray-200">
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
          <button onClick={handleFullscreen} className="text-white hover:text-gray-200">
            <Maximize size={18} />
          </button>
        </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {author && (
            <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[17px] leading-snug mb-0.5 line-clamp-2">{post.content}</h3>
            <div className="flex items-center gap-2 text-[13px] text-[#65676B]">
              {author && <span className="font-semibold text-[#050505]">{author.name}</span>}
              <span>·</span>
              <span>{formatDistanceToNow(post.timestamp, { addSuffix: true })}</span>
            </div>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            title="Save video"
            onClick={() => savePost(post.id)}
          >
            <Bookmark size={20} className={(state.savedItems || []).some(item => item.type === 'post' && item.referenceId === post.id) ? 'fill-current text-primary' : ''} />
          </button>
        </div>

        {/* Reaction Stats */}
        {(reactionCount > 0 || commentCount > 0) && (
          <div className="flex items-center justify-between mt-3 pb-3 border-b border-gray-200 text-[13px] text-[#65676B]">
            {reactionCount > 0 && <span>{reactionCount} {reactionCount === 1 ? 'reaction' : 'reactions'}</span>}
            <div className="flex items-center gap-3 ml-auto">
              {commentCount > 0 && <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center mt-1">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-100 font-semibold text-[15px] transition-colors ${myReaction ? 'text-primary' : 'text-[#65676B]'}`}
            onClick={handleLike}
          >
            <ThumbsUp size={18} className={myReaction ? 'fill-current' : ''} /> {myReaction ? 'Liked' : 'Like'}
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-100 text-[#65676B] font-semibold text-[15px] transition-colors"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={18} /> Comment
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-gray-100 text-[#65676B] font-semibold text-[15px] transition-colors"
            onClick={handleShare}
          >
            <Share2 size={18} /> Share
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            {(post.comments || []).map(comment => {
              const commentAuthor = author; // simplified - in real app would look up each user
              return (
                <div key={comment.id} className="flex gap-2 mb-2">
                  <img src={currentUser.avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block">
                    <span className="font-semibold text-[13px] block">{comment.userId === currentUser.id ? currentUser.name : (author?.name || 'User')}</span>
                    <span className="text-[14px]">{comment.content}</span>
                  </div>
                </div>
              );
            })}
            <form onSubmit={handleComment} className="flex gap-2 mt-2">
              <img src={currentUser.avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 bg-gray-100 rounded-full flex items-center px-3">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="w-full bg-transparent border-none outline-none text-[14px] py-1.5"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                {commentText.trim() && (
                  <button type="submit" className="text-primary ml-1 flex-shrink-0">
                    <Send size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const Watch = () => {
  const { state, getUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('home');

  const videoPosts = (state.posts || []).filter(p => p.type === 'video');
  const photoPosts = (state.posts || []).filter(p => p.type === 'photo' && !p.groupId && !p.pageId);
  const allVideoPosts = [...videoPosts, ...photoPosts.slice(0, 4)];

  // Saved video posts
  const savedVideoIds = (state.savedItems || [])
    .filter(item => item.type === 'post')
    .map(item => item.referenceId);
  const savedVideoPosts = allVideoPosts.filter(p => savedVideoIds.includes(p.id));

  const filteredPosts = allVideoPosts.filter(p =>
    !searchQuery || p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'live', label: 'Live' },
    { id: 'reels', label: 'Reels' },
    { id: 'saved', label: 'Saved Videos' },
  ];

  return (
    <div className="bg-[#F0F2F5] min-h-screen pt-14 flex">
      {/* Left Sidebar */}
      <div className="w-[360px] bg-white h-[calc(100vh-56px)] fixed left-0 overflow-y-auto p-4 shadow-sm hidden lg:block">
        <h2 className="text-2xl font-bold mb-4">Watch</h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search videos"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 outline-none text-[15px]"
          />
        </div>

        <nav className="space-y-1 mb-4">
          {navItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer font-medium text-[15px] ${activeNav === item.id ? 'bg-blue-50 text-primary' : 'hover:bg-gray-100 text-[#050505]'}`}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-200 my-3" />

        <div className="px-2">
          <h3 className="font-semibold text-[17px] mb-2">Your Watch List</h3>
          {savedVideoPosts.length === 0 ? (
            <p className="text-[15px] text-gray-500">Save videos to watch later</p>
          ) : (
            savedVideoPosts.slice(0, 5).map(post => {
              const postAuthor = getUser(post.userId);
              return (
                <div key={post.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer" onClick={() => setActiveNav('home')}>
                  <img src={post.image || `https://picsum.photos/80/45?random=${post.id}`} alt="" className="w-16 h-9 rounded object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate">{post.content.slice(0, 40)}</p>
                    {postAuthor && <p className="text-[11px] text-gray-500">{postAuthor.name}</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Feed */}
      <div className="flex-1 lg:ml-[360px] p-4 flex justify-center">
        <div className="w-full max-w-[680px]">
          <h2 className="text-xl font-bold mb-4">
            {activeNav === 'home' ? 'Videos for You' :
             activeNav === 'live' ? 'Live Videos' :
             activeNav === 'reels' ? 'Reels' :
             'Saved Videos'}
          </h2>

          {activeNav === 'saved' ? (
            savedVideoPosts.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-xl font-semibold text-gray-700 mb-1">No saved videos</p>
                <p className="text-[15px]">Videos you save will appear here</p>
              </div>
            ) : (
              savedVideoPosts.map(post => (
                <VideoCard
                  key={post.id}
                  post={post}
                  author={post.userId ? getUser(post.userId) : null}
                />
              ))
            )
          ) : activeNav === 'live' ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-xl font-semibold text-gray-700 mb-1">No live videos right now</p>
              <p className="text-[15px]">Check back later for live broadcasts</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-xl font-semibold text-gray-700 mb-1">No videos found</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <VideoCard
                key={post.id}
                post={post}
                author={post.userId ? getUser(post.userId) : null}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Watch;
