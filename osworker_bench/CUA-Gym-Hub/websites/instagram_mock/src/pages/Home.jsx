import React, { useEffect, useState } from 'react';
import StoryTray from '../components/StoryTray';
import PostCard from '../components/PostCard';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { getFeed, users, currentUser, toggleFollow, loadMorePosts } = useData();
  const feed = getFeed();

  // Suggest users to follow (excluding self and already followed)
  const suggestions = Object.values(users)
    .filter(u => u.id !== currentUser.id && !currentUser.following.includes(u.id))
    .slice(0, 5);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMorePosts();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMorePosts]);

  return (
    <div className="flex justify-center gap-0 pt-0 md:pt-4 pb-16 md:pb-8">
      {/* Main Feed */}
      <div className="w-full max-w-[470px] flex flex-col px-0 md:px-0 md:ml-8 lg:ml-0">
        <StoryTray />
        <div className="flex flex-col">
          {feed.length === 0 ? (
            <div className="text-center py-10 text-[#8E8E8E]">
              <p className="text-sm">No posts yet. Follow more people or create a post!</p>
            </div>
          ) : (
            feed.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>

      {/* Right Sidebar (Desktop only) */}
      <div className="hidden lg:block w-[320px] ml-16 pt-4 flex-shrink-0">
        <div className="fixed w-[320px]">
          {/* Current user */}
          <div className="flex items-center justify-between mb-5">
            <Link to={`/profile/${currentUser.username}`} className="flex items-center gap-3">
              <img src={currentUser.avatar} alt="Me" className="w-11 h-11 rounded-full object-cover" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{currentUser.username}</span>
                <span className="text-[#8E8E8E] text-sm">{currentUser.name}</span>
              </div>
            </Link>
            <button className="text-[#0095F6] text-xs font-semibold hover:text-[#00376B] transition-colors">
              Switch
            </button>
          </div>

          {/* Suggestions header */}
          {suggestions.length > 0 && (
            <>
              <div className="flex justify-between mb-3">
                <span className="text-[#8E8E8E] font-semibold text-sm">Suggested for you</span>
                <button className="text-xs font-semibold text-[#262626] hover:text-[#8E8E8E] transition-colors">See All</button>
              </div>

              {/* Suggestion items */}
              <div className="flex flex-col gap-2 mb-6">
                {suggestions.map(user => (
                  <div key={user.id} className="flex items-center justify-between py-1">
                    <Link to={`/profile/${user.username}`} className="flex items-center gap-3 min-w-0">
                      <img src={user.avatar} alt={user.username} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate flex items-center gap-1">
                          {user.username}
                          {user.isVerified && (
                            <svg className="w-3 h-3 text-[#0095F6] flex-shrink-0" viewBox="0 0 40 40" fill="currentColor">
                              <path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094zM18.37 27.04l-6.77-6.77 2.83-2.83 3.94 3.94 8.52-8.52 2.83 2.83L18.37 27.04z"/>
                            </svg>
                          )}
                        </span>
                        <span className="text-[#8E8E8E] text-xs truncate">Suggested for you</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => toggleFollow(user.id)}
                      className="text-[#0095F6] text-xs font-semibold hover:text-[#00376B] transition-colors flex-shrink-0 ml-2"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Footer links */}
          <div className="text-[11px] text-[#C7C7C7] space-y-3">
            <div className="flex flex-wrap gap-x-1 gap-y-0.5 leading-relaxed">
              <span className="hover:underline cursor-pointer">About</span>
              <span>.</span>
              <span className="hover:underline cursor-pointer">Help</span>
              <span>.</span>
              <span className="hover:underline cursor-pointer">Press</span>
              <span>.</span>
              <span className="hover:underline cursor-pointer">API</span>
              <span>.</span>
              <span className="hover:underline cursor-pointer">Jobs</span>
              <span>.</span>
              <span className="hover:underline cursor-pointer">Privacy</span>
              <span>.</span>
              <span className="hover:underline cursor-pointer">Terms</span>
              <span>.</span>
              <span className="hover:underline cursor-pointer">Locations</span>
              <span>.</span>
              <span className="hover:underline cursor-pointer">Language</span>
              <span>.</span>
              <span className="hover:underline cursor-pointer">Meta Verified</span>
            </div>
            <p className="text-[#C7C7C7]">&copy; {new Date().getFullYear()} XNSTAGRAM FROM META</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
