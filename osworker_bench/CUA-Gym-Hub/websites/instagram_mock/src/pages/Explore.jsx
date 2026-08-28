import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import PostDetailModal from '../components/PostDetailModal';
import { Heart, MessageCircle, Search as SearchIcon, X, Film } from 'lucide-react';

const Explore = () => {
  const { getExplore, loadMorePosts } = useData();
  const location = useLocation();
  const posts = getExplore();
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (location.state && location.state.search) {
      setSearchTerm(location.state.search);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMorePosts();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMorePosts]);

  const filteredPosts = searchTerm.trim()
    ? posts.filter(post =>
        post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.location && post.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : posts;

  // Create Xnstagram's signature explore grid pattern
  // Pattern: rows of 3 small, then 1 large + 2 small (alternating sides)
  const renderGrid = () => {
    const items = [];
    let postIndex = 0;

    while (postIndex < filteredPosts.length) {
      const rowGroup = Math.floor(postIndex / 15); // every 15 posts = 1 full pattern
      const posInGroup = postIndex % 15;

      // First 3 rows (9 posts): all small squares
      if (posInGroup < 9) {
        items.push(
          <GridItem
            key={filteredPosts[postIndex].id}
            post={filteredPosts[postIndex]}
            onClick={() => setSelectedPost(filteredPosts[postIndex])}
            className="aspect-square"
          />
        );
        postIndex++;
      }
      // Row 4: large left + 2 stacked right
      else if (posInGroup === 9) {
        const bigPost = filteredPosts[postIndex];
        const small1 = filteredPosts[postIndex + 1];
        const small2 = filteredPosts[postIndex + 2];

        items.push(
          <div key={`row-large-${postIndex}`} className="col-span-3 grid grid-cols-3 gap-1">
            <div className="col-span-1 row-span-2 aspect-auto" style={{ gridRow: 'span 2' }}>
              <GridItem
                post={bigPost}
                onClick={() => setSelectedPost(bigPost)}
                className="h-full"
              />
            </div>
            {small1 && (
              <div className="col-span-2 aspect-square">
                <GridItem
                  post={small1}
                  onClick={() => setSelectedPost(small1)}
                  className="h-full"
                />
              </div>
            )}
            {small2 && (
              <div className="col-span-2 aspect-square">
                <GridItem
                  post={small2}
                  onClick={() => setSelectedPost(small2)}
                  className="h-full"
                />
              </div>
            )}
          </div>
        );
        postIndex += 3;
      }
      // Row 5-6: 3 more small
      else if (posInGroup >= 12 && posInGroup < 15) {
        items.push(
          <GridItem
            key={filteredPosts[postIndex].id}
            post={filteredPosts[postIndex]}
            onClick={() => setSelectedPost(filteredPosts[postIndex])}
            className="aspect-square"
          />
        );
        postIndex++;
      }
      else {
        postIndex++;
      }
    }

    return items;
  };

  return (
    <div className="max-w-[935px] mx-auto px-0 md:px-5 pt-2 md:pt-6 pb-16 md:pb-8">
      {/* Search Bar */}
      <div className="mb-4 relative max-w-md mx-auto md:mx-0 px-4 md:px-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-[#8E8E8E]" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2.5 border border-transparent rounded-lg leading-5 bg-[#EFEFEF] placeholder-[#8E8E8E] text-[#262626] focus:outline-none text-sm"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setSearchTerm('')}
            >
              <div className="w-4 h-4 bg-[#C7C7C7] rounded-full flex items-center justify-center">
                <X className="w-2.5 h-2.5 text-white" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Explore Grid */}
      <div className="grid grid-cols-3 gap-[3px]">
        {filteredPosts.map((post, index) => (
          <GridItem
            key={post.id}
            post={post}
            onClick={() => setSelectedPost(post)}
            className="aspect-square"
          />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-16 text-[#8E8E8E]">
          {searchTerm.trim()
            ? <p className="text-sm">No results for "<span className="font-semibold text-[#262626]">{searchTerm}</span>"</p>
            : <p className="text-sm">No posts available.</p>
          }
        </div>
      )}

      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

const GridItem = ({ post, onClick, className = '' }) => {
  return (
    <div
      className={`relative group cursor-pointer overflow-hidden bg-[#EFEFEF] ${className}`}
      onClick={onClick}
    >
      <img
        src={post.images[0]}
        alt="Post"
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white font-bold text-sm">
        <div className="flex items-center gap-1.5">
          <Heart className="fill-white w-5 h-5" />
          <span>{post.likes.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="fill-white w-5 h-5" />
          <span>{post.comments.length}</span>
        </div>
      </div>

      {/* Multi-image indicator */}
      {post.images.length > 1 && (
        <div className="absolute top-2 right-2 pointer-events-none">
          <svg className="w-5 h-5 text-white drop-shadow" viewBox="0 0 48 48" fill="currentColor">
            <path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2-.1-1.2.6z"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default Explore;
