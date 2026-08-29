import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Image, Link as LinkIcon, FileText, EyeOff, AlertTriangle } from 'lucide-react';

export default function CreatePostPage() {
  const { state, actions } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [title, setTitle] = useState('');
  const [selectedTab, setSelectedTab] = useState('text');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [subredditId, setSubredditId] = useState(
    searchParams.get('subreddit') && state.subreddits.find(s => s.id === searchParams.get('subreddit'))
      ? searchParams.get('subreddit')
      : (state.subreddits[0]?.id || '')
  );
  const [selectedFlairId, setSelectedFlairId] = useState(null);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isNSFW, setIsNSFW] = useState(false);

  const selectedSubreddit = state.subreddits.find(s => s.id === subredditId);
  const availableFlairs = selectedSubreddit?.flairs || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !subredditId) return;
    if ((selectedTab === 'image' || selectedTab === 'link') && !url.trim()) return;

    const postId = actions.addPost({
      subredditId,
      title,
      content: selectedTab === 'text' ? content : '',
      type: selectedTab,
      url: selectedTab !== 'text' ? url : null,
      flairId: selectedFlairId,
      isSpoiler,
      isNSFW,
    });

    navigate(`/post/${postId}`);
  };

  const isSubmitDisabled = !title.trim() || !subredditId ||
    ((selectedTab === 'image' || selectedTab === 'link') && !url.trim());

  return (
    <div className="max-w-3xl mx-auto py-4 px-4">
      <div className="flex items-center justify-between mb-4 border-b border-[#EDEFF1] pb-2">
        <h1 className="text-lg font-medium text-[#1C1C1C]">Create a post</h1>
      </div>

      <div className="mb-4">
        <select
          value={subredditId}
          onChange={(e) => { setSubredditId(e.target.value); setSelectedFlairId(null); }}
          className="w-64 p-2 border border-[#EDEFF1] rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0079D3] focus:border-[#0079D3]"
        >
          <option value="" disabled>Choose a community</option>
          {state.subreddits.map(sub => (
            <option key={sub.id} value={sub.id}>r/{sub.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-md border border-[#CCCCCC] overflow-hidden">
        <div className="flex border-b border-[#EDEFF1]">
          <button
            onClick={() => setSelectedTab('text')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold text-sm border-b-2 transition-colors ${selectedTab === 'text' ? 'border-[#0079D3] text-[#0079D3] bg-blue-50/50' : 'border-transparent text-[#878A8C] hover:bg-[#F6F7F8]'}`}
          >
            <FileText className="w-5 h-5" /> Post
          </button>
          <button
            onClick={() => setSelectedTab('image')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold text-sm border-b-2 transition-colors ${selectedTab === 'image' ? 'border-[#0079D3] text-[#0079D3] bg-blue-50/50' : 'border-transparent text-[#878A8C] hover:bg-[#F6F7F8]'}`}
          >
            <Image className="w-5 h-5" /> Image & Video
          </button>
          <button
            onClick={() => setSelectedTab('link')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold text-sm border-b-2 transition-colors ${selectedTab === 'link' ? 'border-[#0079D3] text-[#0079D3] bg-blue-50/50' : 'border-transparent text-[#878A8C] hover:bg-[#F6F7F8]'}`}
          >
            <LinkIcon className="w-5 h-5" /> Link
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            placeholder="Title"
            className="w-full p-2.5 border border-[#EDEFF1] rounded-md mb-3 focus:outline-none focus:ring-1 focus:ring-[#0079D3] focus:border-[#0079D3] text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={300}
          />

          {/* Flair Picker */}
          {availableFlairs.length > 0 && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#787C7E] font-medium">Flair:</span>
              {availableFlairs.map(flair => (
                <button
                  key={flair.id}
                  type="button"
                  onClick={() => setSelectedFlairId(selectedFlairId === flair.id ? null : flair.id)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${selectedFlairId === flair.id ? 'ring-2 ring-[#0079D3] ring-offset-1' : 'hover:opacity-80'}`}
                  style={{ backgroundColor: flair.bgColor, color: flair.color }}
                >
                  {flair.text}
                </button>
              ))}
            </div>
          )}

          {selectedTab === 'text' && (
            <textarea
              placeholder="Text (optional)"
              className="w-full p-2.5 border border-[#EDEFF1] rounded-md min-h-[200px] focus:outline-none focus:ring-1 focus:ring-[#0079D3] focus:border-[#0079D3] text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}

          {selectedTab === 'image' && (
            <div className="border-2 border-dashed border-[#EDEFF1] rounded-md p-8 text-center">
              <input
                type="text"
                placeholder="Image URL (e.g. https://picsum.photos/800/400)"
                className="w-full p-2.5 border border-[#EDEFF1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0079D3] text-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="mt-2 text-sm text-[#A8AAAB]">Paste an image URL here</p>
            </div>
          )}

          {selectedTab === 'link' && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Url"
                className="w-full p-2.5 border border-[#EDEFF1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#0079D3] text-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          )}

          {/* Spoiler / NSFW Toggles */}
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsSpoiler(!isSpoiler)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-colors ${isSpoiler ? 'bg-[#1C1C1C] border-[#1C1C1C] text-white' : 'border-[#EDEFF1] text-[#787C7E] hover:border-[#1C1C1C] hover:text-[#1C1C1C]'}`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              Spoiler
            </button>
            <button
              type="button"
              onClick={() => setIsNSFW(!isNSFW)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-colors ${isNSFW ? 'bg-red-500 border-red-500 text-white' : 'border-[#EDEFF1] text-[#787C7E] hover:border-red-400 hover:text-red-500'}`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              NSFW
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-[#EDEFF1] flex justify-end gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-1.5 border border-[#0079D3] text-[#0079D3] font-bold rounded-full hover:bg-blue-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="px-4 py-1.5 bg-[#0079D3] text-white font-bold rounded-full hover:bg-[#1484D6] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
