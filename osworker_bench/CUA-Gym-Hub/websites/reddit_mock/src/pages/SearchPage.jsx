import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import PostCard from '../components/PostCard';
import { formatNumber } from '../lib/utils';
import { ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'hot', label: 'Hot' },
  { value: 'top', label: 'Top' },
  { value: 'new', label: 'New' },
  { value: 'comments', label: 'Comments' },
];

const TIME_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'hour', label: 'Past Hour' },
  { value: 'day', label: 'Past 24 Hours' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: 'year', label: 'Past Year' },
];

function getTimeThreshold(timeFilter) {
  const now = Date.now();
  switch (timeFilter) {
    case 'hour': return now - 3600 * 1000;
    case 'day': return now - 24 * 3600 * 1000;
    case 'week': return now - 7 * 24 * 3600 * 1000;
    case 'month': return now - 30 * 24 * 3600 * 1000;
    case 'year': return now - 365 * 24 * 3600 * 1000;
    default: return 0;
  }
}

function sortPosts(posts, sort) {
  const arr = [...posts];
  switch (sort) {
    case 'hot':
      return arr.sort((a, b) =>
        (b.upvotes + (b.commentIds || []).length) - (a.upvotes + (a.commentIds || []).length)
      );
    case 'top':
      return arr.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    case 'new':
      return arr.sort((a, b) => new Date(b.created) - new Date(a.created));
    case 'comments':
      return arr.sort((a, b) => (b.commentIds || []).length - (a.commentIds || []).length);
    case 'relevance':
    default:
      return arr; // already filtered by match, keep as-is
  }
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { state, actions } = useStore();
  const joinedSubs = state.currentUser.joinedSubreddits || [];

  const [activeTab, setActiveTab] = useState('Posts');
  const [postSort, setPostSort] = useState('relevance');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const sortMenuRef = useRef(null);
  const timeMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setShowSortMenu(false);
      }
      if (timeMenuRef.current && !timeMenuRef.current.contains(e.target)) {
        setShowTimeMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const lowerQuery = query.toLowerCase();
  const timeThreshold = getTimeThreshold(timeFilter);

  const matchedSubreddits = state.subreddits.filter(sub =>
    sub.name.toLowerCase().includes(lowerQuery) ||
    (sub.description || '').toLowerCase().includes(lowerQuery)
  );

  const matchedUsers = (state.users || []).filter(user =>
    user.username.toLowerCase().includes(lowerQuery) ||
    (user.about || '').toLowerCase().includes(lowerQuery)
  );

  const matchedPosts = sortPosts(
    state.posts.filter(post => {
      const textMatch = post.title.toLowerCase().includes(lowerQuery) ||
        (post.content || '').toLowerCase().includes(lowerQuery);
      if (!textMatch) return false;
      if (timeFilter !== 'all' && new Date(post.created).getTime() < timeThreshold) return false;
      return true;
    }),
    postSort
  );

  const TABS = ['Posts', 'Communities', 'People'];

  return (
    <div className="max-w-5xl mx-auto py-4 px-4">
      <h1 className="text-lg font-medium text-[#787C7E] mb-4">
        Search results for "<span className="text-[#1C1C1C] font-bold">{query}</span>"
      </h1>

      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-[#EDEFF1] mb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 border-b-2 font-bold text-sm uppercase tracking-wide transition-colors ${
              activeTab === tab
                ? 'border-[#0079D3] text-[#0079D3]'
                : 'border-transparent text-[#787C7E] hover:text-[#1C1C1C]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_312px] gap-6">
        <div className="space-y-4">

          {/* Posts tab */}
          {activeTab === 'Posts' && (
            <div>
              {/* Sort + Time filters */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-metadata text-[#787C7E] font-bold uppercase tracking-wide">Sort by:</span>
                {/* Sort dropdown */}
                <div className="relative" ref={sortMenuRef}>
                  <button
                    onClick={() => { setShowSortMenu(!showSortMenu); setShowTimeMenu(false); }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F6F7F8] hover:bg-[#EDEFF1] text-[#0079D3] font-bold text-sm border border-[#EDEFF1]"
                  >
                    {SORT_OPTIONS.find(o => o.value === postSort)?.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showSortMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setPostSort(opt.value); setShowSortMenu(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F6F7F8] ${postSort === opt.value ? 'text-[#0079D3] font-bold' : 'text-[#1C1C1C]'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Time filter dropdown */}
                <div className="relative" ref={timeMenuRef}>
                  <button
                    onClick={() => { setShowTimeMenu(!showTimeMenu); setShowSortMenu(false); }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F6F7F8] hover:bg-[#EDEFF1] text-[#787C7E] font-bold text-sm border border-[#EDEFF1]"
                  >
                    {TIME_OPTIONS.find(o => o.value === timeFilter)?.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showTimeMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20 min-w-[150px]">
                      {TIME_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setTimeFilter(opt.value); setShowTimeMenu(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F6F7F8] ${timeFilter === opt.value ? 'text-[#0079D3] font-bold' : 'text-[#1C1C1C]'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-metadata text-[#787C7E] mb-3">
                {matchedPosts.length} result{matchedPosts.length !== 1 ? 's' : ''} for "{query}"
              </div>

              {matchedPosts.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-md border border-[#CCCCCC] text-[#787C7E]">
                  No posts found matching your search.
                </div>
              ) : (
                matchedPosts.map(post => <PostCard key={post.id} post={post} />)
              )}
            </div>
          )}

          {/* Communities tab */}
          {activeTab === 'Communities' && (
            <div>
              <div className="text-metadata text-[#787C7E] mb-3">
                {matchedSubreddits.length} communit{matchedSubreddits.length !== 1 ? 'ies' : 'y'} for "{query}"
              </div>
              {matchedSubreddits.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-md border border-[#CCCCCC] text-[#787C7E]">
                  No communities found matching your search.
                </div>
              ) : (
                <div className="bg-white border border-[#CCCCCC] rounded-md overflow-hidden">
                  <div className="bg-[#F6F7F8] px-4 py-2 border-b border-[#EDEFF1] text-sidebar-heading text-[#787C7E] uppercase tracking-wide">
                    Communities
                  </div>
                  <div className="divide-y divide-[#EDEFF1]">
                    {matchedSubreddits.map(sub => (
                      <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-[#F6F7F8]">
                        <div className="flex items-center gap-3">
                          <img src={sub.icon} className="w-10 h-10 rounded-full" alt="" />
                          <div>
                            <Link to={`/r/${sub.id}`} className="font-bold text-[#1C1C1C] hover:underline">r/{sub.name}</Link>
                            <div className="text-metadata text-[#787C7E]">{formatNumber(sub.members)} members</div>
                            <div className="text-sm text-[#787C7E] line-clamp-2">{sub.description}</div>
                          </div>
                        </div>
                        {joinedSubs.includes(sub.id) ? (
                          <button
                            onClick={() => actions.leaveSubreddit(sub.id)}
                            className="px-4 py-1 rounded-full text-sm font-bold bg-white border border-[#EDEFF1] text-[#787C7E] hover:border-red-400 hover:text-red-500 transition-colors flex-shrink-0"
                            onMouseEnter={e => e.target.textContent = 'Leave'}
                            onMouseLeave={e => e.target.textContent = 'Joined'}
                          >
                            Joined
                          </button>
                        ) : (
                          <button
                            onClick={() => actions.joinSubreddit(sub.id)}
                            className="px-4 py-1 rounded-full text-sm font-bold bg-[#0079D3] text-white hover:bg-[#1484D6] flex-shrink-0"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* People tab */}
          {activeTab === 'People' && (
            <div>
              <div className="text-metadata text-[#787C7E] mb-3">
                {matchedUsers.length} user{matchedUsers.length !== 1 ? 's' : ''} for "{query}"
              </div>
              {matchedUsers.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-md border border-[#CCCCCC] text-[#787C7E]">
                  No users found matching your search.
                </div>
              ) : (
                <div className="bg-white border border-[#CCCCCC] rounded-md overflow-hidden">
                  <div className="bg-[#F6F7F8] px-4 py-2 border-b border-[#EDEFF1] text-sidebar-heading text-[#787C7E] uppercase tracking-wide">
                    People
                  </div>
                  <div className="divide-y divide-[#EDEFF1]">
                    {matchedUsers.map(user => {
                      const totalKarma = (user.postKarma || 0) + (user.commentKarma || 0);
                      return (
                        <div key={user.id} className="p-4 flex items-center gap-4 hover:bg-[#F6F7F8]">
                          <img
                            src={user.avatar}
                            className="w-12 h-12 rounded-full flex-shrink-0"
                            alt=""
                          />
                          <div className="flex-1 min-w-0">
                            <Link to={`/user/${user.id}`} className="font-bold text-[#1C1C1C] hover:underline">
                              u/{user.username}
                            </Link>
                            <div className="text-metadata text-[#787C7E]">
                              {formatNumber(totalKarma)} karma
                            </div>
                            {user.about && (
                              <div className="text-sm text-[#787C7E] line-clamp-1 mt-0.5">{user.about}</div>
                            )}
                          </div>
                          <Link
                            to={`/user/${user.id}`}
                            className="px-4 py-1 rounded-full text-sm font-bold bg-[#0079D3] text-white hover:bg-[#1484D6] flex-shrink-0"
                          >
                            View Profile
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <div className="bg-white border border-[#CCCCCC] rounded-md p-4">
            <h3 className="font-bold text-[#1C1C1C] mb-2">Search Tips</h3>
            <ul className="list-disc list-inside text-sm text-[#787C7E] space-y-1">
              <li>Check your spelling</li>
              <li>Try more general keywords</li>
              <li>Try different keywords</li>
              <li>Use the tabs to find Posts, Communities, or People</li>
              <li>Filter posts by time using the time dropdown</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
