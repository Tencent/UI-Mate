import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send } from 'lucide-react';
import { useData } from '../context/DataContext';

const StoryViewer = ({ storiesList, initialUserIndex, onClose }) => {
  const { markStoryViewed } = useData();
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');

  const currentUserData = storiesList[currentUserIndex];
  const currentStory = currentUserData.stories[currentStoryIndex];
  const STORY_DURATION = 5000;

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      if (!isPaused) {
        setProgress(prev => {
          if (prev >= 100) return 100;
          return prev + (100 / (STORY_DURATION / 50));
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentUserIndex, currentStoryIndex, isPaused]);

  const handleNext = useCallback(() => {
    if (currentStoryIndex < currentUserData.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentUserIndex < storiesList.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  }, [currentStoryIndex, currentUserIndex, currentUserData, storiesList, onClose]);

  useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext]);

  useEffect(() => {
    markStoryViewed(currentStory.id);
  }, [currentStory.id, markStoryViewed]);

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleNext, onClose]);

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(storiesList[currentUserIndex - 1].stories.length - 1);
    }
  };

  const timeAgo = (date) => {
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return `${Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60))}m`;
    return `${hours}h`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1a2e] flex items-center justify-center">
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-50 p-2 hover:opacity-70 transition-opacity">
        <X className="w-7 h-7" />
      </button>

      {/* Xnstagram logo */}
      <div className="absolute top-5 left-5 z-50">
        <span className="text-white text-lg font-semibold" style={{ fontFamily: "'Satisfy', cursive" }}>Xnstagram</span>
      </div>

      {/* Prev user card preview (desktop) */}
      {currentUserIndex > 0 && (
        <div className="hidden lg:block absolute left-[calc(50%-280px)] w-[100px] h-[160px] bg-gray-800 rounded-lg overflow-hidden opacity-40 -translate-x-full">
          <img src={storiesList[currentUserIndex - 1].stories[0].image} className="w-full h-full object-cover" alt="" />
        </div>
      )}

      {/* Main Content */}
      <div
        className="relative w-full max-w-[420px] h-full max-h-[95vh] bg-black rounded-lg overflow-hidden shadow-2xl"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <div className="absolute top-2 left-0 right-0 z-30 flex gap-1 px-2">
          {currentUserData.stories.map((story, idx) => (
            <div key={story.id} className="h-[2px] flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: idx < currentStoryIndex ? '100%' :
                         idx === currentStoryIndex ? `${progress}%` : '0%',
                  transition: idx === currentStoryIndex ? 'width 50ms linear' : 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-5 left-3 right-3 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={currentUserData.user.avatar} className="w-8 h-8 rounded-full border-2 border-white/80 object-cover" alt="" />
            <span className="text-white font-semibold text-sm">{currentUserData.user.username}</span>
            <span className="text-white/60 text-xs">{timeAgo(currentStory.created)}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="md:hidden">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Story Image */}
        <img
          src={currentStory.image}
          className="w-full h-full object-cover"
          alt="Story"
          draggable="false"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 pointer-events-none" />

        {/* Tap zones */}
        <div className="absolute inset-0 flex z-20">
          <div className="w-1/3 h-full" onClick={handlePrev} />
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full" onClick={handleNext} />
        </div>

        {/* Reply bar at bottom */}
        <div className="absolute bottom-4 left-3 right-3 z-30 flex items-center gap-2">
          <div className="flex-1 border border-white/50 rounded-full px-4 py-2 flex items-center">
            <input
              type="text"
              placeholder={`Reply to ${currentUserData.user.username}...`}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/60"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => { setIsPaused(false); setReplyText(''); }}
            />
          </div>
          <button className="p-1 hover:opacity-70 transition-opacity">
            <Heart className="w-6 h-6 text-white" />
          </button>
          <button className="p-1 hover:opacity-70 transition-opacity">
            <Send className="w-6 h-6 text-white -rotate-[20deg]" />
          </button>
        </div>
      </div>

      {/* Next user card preview (desktop) */}
      {currentUserIndex < storiesList.length - 1 && (
        <div className="hidden lg:block absolute right-[calc(50%-280px)] w-[100px] h-[160px] bg-gray-800 rounded-lg overflow-hidden opacity-40 translate-x-full">
          <img src={storiesList[currentUserIndex + 1].stories[0].image} className="w-full h-full object-cover" alt="" />
        </div>
      )}

      {/* Desktop Nav Buttons */}
      {currentUserIndex > 0 && (
        <button onClick={handlePrev} className="hidden md:flex absolute left-4 text-white p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {(currentStoryIndex < currentUserData.stories.length - 1 || currentUserIndex < storiesList.length - 1) && (
        <button onClick={handleNext} className="hidden md:flex absolute right-4 text-white p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors items-center justify-center">
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default StoryViewer;
