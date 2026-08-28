import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDistanceToNow } from 'date-fns';

const STORY_DURATION = 5000;

const SAMPLE_IMAGES = [
  'https://picsum.photos/420/740?random=sample1',
  'https://picsum.photos/420/740?random=sample2',
  'https://picsum.photos/420/740?random=sample3',
  'https://picsum.photos/420/740?random=sample4',
  'https://picsum.photos/420/740?random=sample5',
  'https://picsum.photos/420/740?random=sample6',
];

const BG_COLORS = [
  '#1877F2', '#42b72a', '#E4426D', '#F7984A',
  '#7B61FF', '#00C7A3', '#FF6B6B', '#FFD93D'
];

// StoryOverlay: full-screen story viewer
const StoryOverlay = ({ stories, startIndex, onClose }) => {
  const { state, getUser, markStoryViewed } = useApp();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const currentStory = stories[currentIndex];
  const author = getUser(currentStory?.userId);

  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      startTimeRef.current = Date.now();
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      startTimeRef.current = Date.now();
    }
  };

  useEffect(() => {
    if (currentStory && markStoryViewed) {
      markStoryViewed(currentStory.id);
    }
  }, [currentIndex]);

  useEffect(() => {
    setProgress(0);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed >= STORY_DURATION) {
        goNext();
      }
    }, 50);
    return () => clearInterval(intervalRef.current);
  }, [currentIndex]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center" onClick={onClose}>
      {/* Story container */}
      <div
        className="relative w-full max-w-[420px] h-screen flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
          {stories.map((s, i) => (
            <div key={s.id} className="flex-1 h-0.5 bg-white/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        {author && (
          <div className="absolute top-8 left-3 right-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <img src={author.avatar} alt={author.name} className="w-9 h-9 rounded-full border-2 border-white object-cover" />
              <div>
                <p className="text-white font-semibold text-sm drop-shadow">{author.name}</p>
                <p className="text-white/70 text-xs">{formatDistanceToNow(currentStory.timestamp, { addSuffix: true })}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        )}

        {/* Story image */}
        <div className="w-full h-full">
          {currentStory.bgColor ? (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: currentStory.bgColor }}
            >
              <p className="text-white text-2xl font-bold text-center px-6 drop-shadow-lg">{currentStory.text || ''}</p>
            </div>
          ) : (
            <img
              src={currentStory.image}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Left / Right click zones */}
        <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" onClick={goPrev} />
        <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" onClick={goNext} />

        {/* Arrow buttons */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight size={22} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

// CreateStoryModal
const CreateStoryModal = ({ onClose }) => {
  const { addStory, currentUser } = useApp();
  const [mode, setMode] = useState('color'); // 'color' | 'image'
  const [selectedColor, setSelectedColor] = useState(BG_COLORS[0]);
  const [storyText, setStoryText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleShare = () => {
    if (mode === 'color') {
      if (!storyText.trim()) return;
      addStory({
        id: `story_${Date.now()}`,
        userId: currentUser.id,
        bgColor: selectedColor,
        text: storyText,
        timestamp: Date.now(),
        viewed: false
      });
    } else {
      if (!selectedImage) return;
      addStory({
        id: `story_${Date.now()}`,
        userId: currentUser.id,
        image: selectedImage,
        timestamp: Date.now(),
        viewed: false
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-[480px] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Create Story</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Mode tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('color')}
              className={`flex-1 py-2 rounded-md text-[15px] font-semibold transition-colors ${mode === 'color' ? 'bg-blue-100 text-primary' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              Text / Color
            </button>
            <button
              onClick={() => setMode('image')}
              className={`flex-1 py-2 rounded-md text-[15px] font-semibold transition-colors ${mode === 'image' ? 'bg-blue-100 text-primary' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              Select Image
            </button>
          </div>

          {mode === 'color' ? (
            <>
              {/* Preview */}
              <div
                className="w-full h-48 rounded-lg mb-4 flex items-center justify-center"
                style={{ backgroundColor: selectedColor }}
              >
                <p className="text-white text-xl font-bold text-center px-4 break-words">
                  {storyText || 'Your text here...'}
                </p>
              </div>
              {/* Color picker */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {BG_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {/* Text input */}
              <textarea
                value={storyText}
                onChange={e => setStoryText(e.target.value)}
                placeholder="Type something..."
                className="w-full border border-gray-200 rounded-lg p-3 text-[15px] resize-none h-24 outline-none focus:border-primary"
                maxLength={200}
              />
            </>
          ) : (
            <>
              <p className="text-[15px] text-gray-600 mb-3">Select a sample image for your story:</p>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_IMAGES.map(img => (
                  <div
                    key={img}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-[9/16] rounded-lg overflow-hidden cursor-pointer border-4 transition-all ${selectedImage === img ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} alt="Sample" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handleShare}
            disabled={mode === 'color' ? !storyText.trim() : !selectedImage}
            className="w-full py-2.5 bg-primary text-white font-semibold rounded-md text-[15px] hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Share to Story
          </button>
        </div>
      </div>
    </div>
  );
};

// Main StoriesCarousel component
const StoriesCarousel = () => {
  const { state, getUser } = useApp();
  const [viewingStoryIndex, setViewingStoryIndex] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const stories = state.stories || [];

  return (
    <>
      <div className="flex gap-2 mb-6 overflow-x-auto relative h-[200px] pb-1 scrollbar-hide">
        {/* Create Story Card */}
        <div
          className="w-[110px] h-full bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer relative group flex-shrink-0 hover:shadow-md transition-shadow"
          onClick={() => setShowCreateModal(true)}
        >
          <img
            src={state.currentUser.avatar}
            alt="Me"
            className="w-full h-[75%] object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-[38px] left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full border-4 border-white flex items-center justify-center">
            <span className="text-white text-xl font-bold leading-none">+</span>
          </div>
          <div className="absolute bottom-0 w-full h-[25%] bg-white flex items-center justify-center">
            <span className="text-xs font-semibold text-center leading-tight px-1">Create story</span>
          </div>
        </div>

        {/* Friend Stories */}
        {stories.map((story, i) => {
          const author = getUser(story.userId);
          if (!author) return null;
          return (
            <div
              key={story.id}
              className="w-[110px] h-full rounded-xl shadow-sm overflow-hidden cursor-pointer relative group flex-shrink-0 hover:shadow-md transition-shadow"
              onClick={() => setViewingStoryIndex(i)}
            >
              {story.bgColor ? (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: story.bgColor }}>
                  <p className="text-white text-sm font-semibold text-center px-2 line-clamp-4">{story.text}</p>
                </div>
              ) : (
                <img
                  src={story.image}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-90 group-hover:brightness-100"
                  alt={`${author.name}'s story`}
                />
              )}
              {/* Avatar ring: blue = unviewed */}
              <div className={`absolute top-3 left-3 w-9 h-9 rounded-full border-4 ${story.viewed ? 'border-gray-400' : 'border-primary'} overflow-hidden`}>
                <img src={author.avatar} className="w-full h-full object-cover" alt={author.name} />
              </div>
              <span className="absolute bottom-2 left-3 right-3 text-white font-semibold text-[13px] drop-shadow-md truncate">{author.name}</span>
            </div>
          );
        })}
      </div>

      {/* Story Viewer Overlay */}
      {viewingStoryIndex !== null && stories.length > 0 && (
        <StoryOverlay
          stories={stories}
          startIndex={viewingStoryIndex}
          onClose={() => setViewingStoryIndex(null)}
        />
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <CreateStoryModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
};

export default StoriesCarousel;
export { CreateStoryModal };
