import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import PostCard from '../components/PostCard';
import { Cake, ArrowBigUp, Bookmark, MessageSquare } from 'lucide-react';
import { formatNumber } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

const TABS = ['Overview', 'Posts', 'Comments', 'Saved'];

function CommentPreview({ comment, allPosts, allSubreddits }) {
  const post = allPosts.find(p => p.id === comment.postId);
  const subreddit = post ? allSubreddits.find(s => s.id === post.subredditId) : null;
  const score = comment.upvotes - comment.downvotes;

  return (
    <div className="bg-white border border-[#CCCCCC] rounded-md hover:border-[#898989] transition-colors mb-2.5 overflow-hidden">
      {post && (
        <div className="bg-[#F6F7F8] px-4 py-2 border-b border-[#EDEFF1] text-metadata text-[#787C7E]">
          <span>Comment in </span>
          <Link to={`/post/${post.id}`} className="font-bold text-[#0079D3] hover:underline">{post.title}</Link>
          {subreddit && (
            <>
              <span> &middot; </span>
              <Link to={`/r/${subreddit.id}`} className="text-[#0079D3] hover:underline">r/{subreddit.name}</Link>
            </>
          )}
        </div>
      )}
      <div className="p-4">
        <p className="text-comment-body text-[#1C1C1C] mb-3">{comment.content}</p>
        <div className="flex items-center gap-3 text-metadata text-[#787C7E]">
          <div className="flex items-center gap-1">
            <ArrowBigUp className="w-4 h-4" />
            <span className="font-bold">{formatNumber(score)} points</span>
          </div>
          <span>&middot;</span>
          <span>{formatDistanceToNow(new Date(comment.created))} ago</span>
          {comment.isEdited && <span className="italic text-[#A8AAAB]">(edited)</span>}
        </div>
      </div>
    </div>
  );
}

export default function UserPage() {
  const { id } = useParams();
  const { state } = useStore();
  const [activeTab, setActiveTab] = useState('Overview');

  const user = state.users.find(u => u.id === id);
  const isOwnProfile = id === state.currentUser.id;

  if (!user) return <div className="text-center py-10 text-[#787C7E]">User not found</div>;

  const userPosts = state.posts.filter(p => p.userId === id);
  const userComments = state.comments.filter(c => c.userId === id && c.content !== '[deleted]');

  // Overview: mix posts + comments, sorted by newest first
  const overviewItems = [
    ...userPosts.map(p => ({ type: 'post', created: p.created, data: p })),
    ...userComments.map(c => ({ type: 'comment', created: c.created, data: c })),
  ].sort((a, b) => new Date(b.created) - new Date(a.created));

  // Saved content (only visible on own profile)
  const savedPostIds = state.currentUser.savedPosts || [];
  const savedCommentIds = state.currentUser.savedComments || [];
  const savedPosts = state.posts.filter(p => savedPostIds.includes(p.id));
  const savedComments = state.comments.filter(c => savedCommentIds.includes(c.id) && c.content !== '[deleted]');

  const tabs = isOwnProfile ? TABS : TABS.filter(t => t !== 'Saved');

  return (
    <div className="max-w-5xl mx-auto py-4 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_312px] gap-6">
        <div>
          {/* Tab bar */}
          <div className="flex items-center gap-0 mb-4 border-b border-[#EDEFF1]">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 border-b-2 font-bold text-sm uppercase tracking-wide transition-colors ${
                  activeTab === tab
                    ? 'border-[#0079D3] text-[#0079D3]'
                    : 'border-transparent text-[#787C7E] hover:text-[#1C1C1C]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === 'Overview' && (
            <div>
              {overviewItems.length === 0 ? (
                <div className="text-center py-10 text-[#787C7E]">u/{user.username} hasn't posted or commented yet</div>
              ) : (
                overviewItems.map(item => (
                  item.type === 'post'
                    ? <PostCard key={`post-${item.data.id}`} post={item.data} />
                    : <CommentPreview key={`comment-${item.data.id}`} comment={item.data} allPosts={state.posts} allSubreddits={state.subreddits} />
                ))
              )}
            </div>
          )}

          {/* Posts tab */}
          {activeTab === 'Posts' && (
            <div>
              {userPosts.length === 0 ? (
                <div className="text-center py-10 text-[#787C7E]">u/{user.username} hasn't posted anything yet</div>
              ) : (
                userPosts.map(post => <PostCard key={post.id} post={post} />)
              )}
            </div>
          )}

          {/* Comments tab */}
          {activeTab === 'Comments' && (
            <div>
              {userComments.length === 0 ? (
                <div className="text-center py-10 text-[#787C7E]">u/{user.username} hasn't commented yet</div>
              ) : (
                userComments
                  .slice()
                  .sort((a, b) => new Date(b.created) - new Date(a.created))
                  .map(comment => (
                    <CommentPreview key={comment.id} comment={comment} allPosts={state.posts} allSubreddits={state.subreddits} />
                  ))
              )}
            </div>
          )}

          {/* Saved tab (own profile only) */}
          {activeTab === 'Saved' && isOwnProfile && (
            <div>
              {savedPosts.length === 0 && savedComments.length === 0 ? (
                <div className="text-center py-10 text-[#787C7E]">
                  <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>Nothing saved yet</p>
                  <p className="text-sm mt-1">Save posts and comments to find them here later</p>
                </div>
              ) : (
                <div>
                  {savedPosts.map(post => <PostCard key={post.id} post={post} />)}
                  {savedComments.map(comment => (
                    <CommentPreview key={comment.id} comment={comment} allPosts={state.posts} allSubreddits={state.subreddits} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile sidebar */}
        <div className="hidden lg:block">
          <div className="bg-white border border-[#CCCCCC] rounded-md overflow-hidden relative">
            <div className="h-24" style={{ backgroundColor: '#33a8ff' }}></div>
            <div className="px-4 pb-4">
              <div className="relative -top-12 mb-[-40px]">
                <div className="w-[88px] h-[88px] rounded-full border-4 border-white bg-white overflow-hidden">
                  <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                </div>
              </div>

              <div className="mt-12">
                <h1 className="text-xl font-bold text-[#1C1C1C]">{user.username}</h1>
                <div className="text-sm text-[#787C7E] mb-2">u/{user.username}</div>
                {user.about && (
                  <p className="text-sm text-[#1C1C1C] mb-3">{user.about}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[#EDEFF1] pt-3">
                  <div>
                    <div className="font-bold text-[#1C1C1C]">{formatNumber(user.postKarma || 0)}</div>
                    <div className="text-metadata text-[#787C7E]">Post Karma</div>
                  </div>
                  <div>
                    <div className="font-bold text-[#1C1C1C]">{formatNumber(user.commentKarma || 0)}</div>
                    <div className="text-metadata text-[#787C7E]">Comment Karma</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#787C7E] mb-4">
                  <Cake className="w-4 h-4" />
                  <span>{user.cakeDay ? new Date(user.cakeDay).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
