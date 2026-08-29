import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import Tweet from '../components/Tweet';
import Composer from '../components/Composer';

export default function TweetDetail() {
  const { id } = useParams();
  const { state } = useData();

  const tweet = state.tweets.find(t => t.id === id);
  const author = tweet ? state.users.find(u => u.id === tweet.userId) : null;

  if (!tweet || !author) return <div className="p-4 text-[#0F1419]">Post not found</div>;

  const replies = state.replies
    .filter(r => (r.tweetId === id || r.postId === id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Transform replies to look like tweets for the Tweet component
  const replyTweets = replies.map(r => ({
    ...r,
    replies: [],
    retweets: [],
    reposts: [],
    likes: r.likes || [],
    images: [],
    bookmarks: [],
    views: 0,
  }));

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center gap-6 border-b border-[#EFF3F4]">
        <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-[#F7F9F9] transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#0F1419]" />
        </button>
        <h2 className="font-extrabold text-xl text-[#0F1419]">Post</h2>
      </div>

      <Tweet tweet={tweet} />

      <div className="border-b border-[#EFF3F4]">
        <Composer
          replyToId={tweet.id}
          initialContent={`@${author.handle} `}
        />
      </div>

      <div>
        {replyTweets.map(reply => (
          <Tweet key={reply.id} tweet={reply} isReply />
        ))}
      </div>
    </div>
  );
}
