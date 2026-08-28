import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import Tweet from '../components/Tweet';

const EXPLORE_TABS = ['For you', 'Trending', 'News', 'Sports', 'Entertainment'];

export default function Explore() {
  const { state } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(queryFromUrl);
  const [activeTab, setActiveTab] = useState('For you');

  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const results = useMemo(() => {
    if (!queryFromUrl) return [];
    const query = queryFromUrl.toLowerCase();
    return state.tweets
      .filter(t => t.content.toLowerCase().includes(query))
      .sort((a, b) => (b.likes || []).length - (a.likes || []).length);
  }, [state.tweets, queryFromUrl]);

  const trends = state.trends || [];

  const filteredTrends = useMemo(() => {
    if (activeTab === 'For you' || activeTab === 'Trending') return trends;
    const tabLower = activeTab.toLowerCase();
    return trends.filter(t => t.category.toLowerCase().includes(tabLower));
  }, [trends, activeTab]);

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#EFF3F4]">
        <div className="px-4 py-2">
          <form onSubmit={handleSearch}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-[18px] w-[18px] text-[#536471] group-focus-within:text-[#1DA1F2]" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-[10px] border border-transparent rounded-full bg-[#EFF3F4] text-[15px] text-[#0F1419] placeholder-[#536471] focus:outline-none focus:ring-1 focus:ring-[#1DA1F2] focus:bg-white focus:border-[#1DA1F2]"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          </form>
        </div>

        {!queryFromUrl && (
          <div className="flex overflow-x-auto">
            {EXPLORE_TABS.map(tab => (
              <button
                key={tab}
                className="flex-shrink-0 py-3 px-4 text-center hover:bg-[#F7F9F9] transition-colors relative whitespace-nowrap"
                onClick={() => setActiveTab(tab)}
              >
                <span className={`text-[15px] ${activeTab === tab ? 'font-bold text-[#0F1419]' : 'text-[#536471] font-medium'}`}>
                  {tab}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-[#1DA1F2] rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {queryFromUrl ? (
        <div>
          <div className="px-4 py-3 border-b border-[#EFF3F4]">
            <p className="text-[#536471] text-[15px]">
              {results.length} result{results.length !== 1 ? 's' : ''} for "<span className="text-[#0F1419] font-medium">{queryFromUrl}</span>"
            </p>
          </div>
          {results.map(tweet => (
            <Tweet key={tweet.id} tweet={tweet} />
          ))}
          {results.length === 0 && (
            <div className="p-8 text-center text-[#536471] text-[15px]">
              No posts found matching your search.
            </div>
          )}
        </div>
      ) : (
        <div>
          {filteredTrends.length > 0 ? (
            <div>
              {filteredTrends.map((trend, i) => (
                <div
                  key={trend.id || i}
                  className="px-4 py-3 hover:bg-[#F7F9F9] cursor-pointer transition-colors border-b border-[#EFF3F4]"
                  onClick={() => setSearchParams({ q: trend.name })}
                >
                  <p className="text-[13px] text-[#536471]">{i + 1} &middot; {trend.category}</p>
                  <p className="font-bold text-[15px] text-[#0F1419] mt-0.5">{trend.name}</p>
                  <p className="text-[13px] text-[#536471] mt-0.5">{trend.postCount} posts</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[#536471] text-[15px]">
              No trending topics in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
