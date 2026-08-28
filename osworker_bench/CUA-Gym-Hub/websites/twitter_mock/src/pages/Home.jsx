import React, { useState, useMemo } from 'react';
import Composer from '../components/Composer';
import Tweet from '../components/Tweet';
import { useData } from '../context/DataContext';

export default function Home() {
  const { state } = useData();
  const [activeTab, setActiveTab] = useState('foryou');

  const sortedTweets = useMemo(() => {
    const tweets = [...state.tweets].filter(t => !t.inReplyToPostId);

    if (activeTab === 'following') {
      // Only posts from users the currentUser follows, sorted chronologically
      return tweets
        .filter(t => state.currentUser.following.includes(t.userId) || t.userId === state.currentUser.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // "For you" — all posts sorted by engagement (likes + reposts desc)
    return tweets.sort((a, b) => {
      const engA = (a.likes?.length || 0) + (a.reposts?.length || a.retweets?.length || 0);
      const engB = (b.likes?.length || 0) + (b.reposts?.length || b.retweets?.length || 0);
      return engB - engA;
    });
  }, [state.tweets, state.currentUser, activeTab]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#EFF3F4]">
        <h1 className="text-xl font-extrabold text-[#0F1419] px-4 py-3">Home</h1>
        <div className="flex">
          <button
            className="flex-1 py-3 text-center hover:bg-[#F7F9F9] transition-colors relative"
            onClick={() => setActiveTab('foryou')}
          >
            <span className={`text-[15px] ${activeTab === 'foryou' ? 'font-bold text-[#0F1419]' : 'text-[#536471] font-medium'}`}>
              For you
            </span>
            {activeTab === 'foryou' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-[3px] bg-[#1DA1F2] rounded-full" />
            )}
          </button>
          <button
            className="flex-1 py-3 text-center hover:bg-[#F7F9F9] transition-colors relative"
            onClick={() => setActiveTab('following')}
          >
            <span className={`text-[15px] ${activeTab === 'following' ? 'font-bold text-[#0F1419]' : 'text-[#536471] font-medium'}`}>
              Following
            </span>
            {activeTab === 'following' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-[3px] bg-[#1DA1F2] rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="hidden sm:block">
        <Composer />
      </div>
      <div className="h-2 bg-[#F7F9F9] border-y border-[#EFF3F4] sm:hidden" />

      <div>
        {sortedTweets.map(tweet => (
          <Tweet key={tweet.id} tweet={tweet} />
        ))}
        {sortedTweets.length === 0 && (
          <div className="p-8 text-center text-[#536471] text-[15px]">
            No posts to show.
          </div>
        )}
      </div>
    </div>
  );
}
