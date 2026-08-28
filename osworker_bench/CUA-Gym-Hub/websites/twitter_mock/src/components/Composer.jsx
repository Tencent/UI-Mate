import React, { useState, useRef, useEffect } from 'react';
import { Image, Smile, Calendar, MapPin, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';

const EMOJI_LIST = ['😀','😂','😍','🥰','😎','🤔','😢','😡','🎉','🔥','❤️','👍','👎','🙏','💯','✨','🚀','🌟','😊','🤣','😜','😏','🤩','😴','🥳','👀','💪','🎯','💥','🙌'];

export default function Composer({ onClose, isModal = false, replyToId = null, initialContent = '', quoteTweetId = null }) {
  const { state, addTweet, addReply, addQuotePost } = useData();
  const [searchParams] = useSearchParams();

  // Resolve quote tweet id from prop or URL param
  const resolvedQuoteId = quoteTweetId || searchParams.get('quote') || null;
  const quotedTweet = resolvedQuoteId ? state.tweets.find(t => t.id === resolvedQuoteId) : null;
  const quotedAuthor = quotedTweet ? state.users.find(u => u.id === quotedTweet.userId) : null;

  const [content, setContent] = useState(initialContent);
  const [images, setImages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    if (resolvedQuoteId && !replyToId) {
      addQuotePost(content, resolvedQuoteId);
    } else if (replyToId) {
      addReply(replyToId, content);
    } else {
      addTweet(content, images);
    }

    setContent('');
    setImages([]);
    setShowEmojiPicker(false);
    if (onClose) onClose();
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [content]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = 4 - images.length;
    const toAdd = files.slice(0, remaining);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => prev.length < 4 ? [...prev, ev.target.result] : prev);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const insertEmoji = (emoji) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const charCount = content.length;
  const isOverLimit = charCount > 280;
  const remaining = 280 - charCount;

  // SVG ring progress
  const circumference = 2 * Math.PI * 9;
  const progress = Math.min(charCount / 280, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const ringColor = charCount > 280 ? '#F4212E' : charCount > 260 ? '#FFAD1F' : '#1DA1F2';

  const canSubmit = (content.trim() || images.length > 0) && !isOverLimit;

  return (
    <div className={clsx("flex gap-3", isModal ? "p-4" : "p-4 border-b border-[#EFF3F4]")}>
      <img
        src={state.currentUser.avatar}
        alt="Profile"
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={replyToId ? "Post your reply" : resolvedQuoteId ? "Add a comment" : "What is happening?!"}
          className="w-full mt-2 text-xl text-[#0F1419] placeholder-[#536471] border-none focus:ring-0 resize-none outline-none bg-transparent"
          rows={isModal ? 3 : 1}
        />

        {/* Image preview */}
        {images.length > 0 && (
          <div className={clsx(
            "mt-2 rounded-2xl overflow-hidden border border-[#EFF3F4] grid gap-0.5",
            images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}>
            {images.map((src, idx) => (
              <div key={idx} className="relative">
                <img src={src} alt={`upload ${idx + 1}`} className="w-full h-[200px] object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quoted tweet preview */}
        {quotedTweet && quotedAuthor && (
          <div className="mt-2 border border-[#EFF3F4] rounded-2xl p-3 text-[13px]">
            <div className="flex items-center gap-1 mb-1">
              <img src={quotedAuthor.avatar} alt="" className="w-4 h-4 rounded-full" />
              <span className="font-bold text-[#0F1419]">{quotedAuthor.name}</span>
              <span className="text-[#536471]">@{quotedAuthor.handle}</span>
            </div>
            <p className="text-[#0F1419] line-clamp-2">{quotedTweet.content}</p>
          </div>
        )}

        <div className="border-t border-[#EFF3F4] mt-3 pt-3 flex items-center justify-between">
          <div className="flex gap-0 text-[#1DA1F2] relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              className="p-2 rounded-full hover:bg-[#1DA1F2]/10 transition-colors disabled:opacity-40"
              onClick={handleImageClick}
              disabled={images.length >= 4}
              title="Add image"
            >
              <Image className="w-5 h-5" />
            </button>
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-[#1DA1F2]/10 transition-colors"
                onClick={() => setShowEmojiPicker(prev => !prev)}
                title="Add emoji"
              >
                <span className="w-5 h-5 flex items-center justify-center text-[18px] leading-none">😊</span>
              </button>
              {showEmojiPicker && (
                <div className="absolute top-10 left-0 z-50 bg-white border border-[#EFF3F4] rounded-2xl shadow-xl p-3 w-[260px]">
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJI_LIST.map((emoji, i) => (
                      <button
                        key={i}
                        onClick={() => insertEmoji(emoji)}
                        className="text-xl hover:bg-[#F7F9F9] rounded p-1 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="p-2 rounded-full hover:bg-[#1DA1F2]/10 transition-colors opacity-40 cursor-not-allowed" title="Schedule (not available)">
              <Calendar className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-[#1DA1F2]/10 transition-colors opacity-40 cursor-not-allowed" title="Location (not available)">
              <MapPin className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {charCount > 0 && (
              <div className="flex items-center gap-2">
                {remaining <= 20 && (
                  <span className={clsx("text-[13px] font-medium", isOverLimit ? "text-[#F4212E]" : "text-[#536471]")}>
                    {remaining}
                  </span>
                )}
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" fill="none" stroke="#EFF3F4" strokeWidth="2" />
                  <circle
                    cx="10" cy="10" r="9"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="2"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 10 10)"
                  />
                </svg>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-[#1DA1F2] text-white font-bold text-[15px] px-4 py-[6px] rounded-full disabled:opacity-50 hover:bg-[#1a91da] transition-colors"
            >
              {replyToId ? 'Reply' : resolvedQuoteId ? 'Quote' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
