import React from 'react';
import CreatePost from './CreatePost';
import Post from './Post';
import StoriesCarousel from './StoriesCarousel';
import { useApp } from '../store/AppContext';

const Feed = () => {
  const { state } = useApp();
  const hiddenPosts = state.hiddenPosts || [];
  // Sort posts by timestamp descending, filter out hidden and group/page posts for main feed
  const sortedPosts = [...state.posts]
    .filter(p => !p.groupId && !p.pageId && !hiddenPosts.includes(p.id))
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="flex-1 max-w-[590px] mx-auto pt-4 pb-10">
      {/* Stories */}
      <StoriesCarousel />

      <CreatePost />

      {sortedPosts.map(post => (
        <Post key={post.id} post={post} />
      ))}

      <div className="text-center py-4 text-gray-500">
        <p>No more posts to show</p>
      </div>
    </div>
  );
};

export default Feed;