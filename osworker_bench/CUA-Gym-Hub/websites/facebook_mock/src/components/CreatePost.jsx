import React, { useState, useRef, useEffect } from 'react';
import { Video, Image, Smile, MapPin, X, Globe, UserPlus, Lock, Users, ChevronDown } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getSessionId } from '../store/initialData';

const FEELINGS = [
  { emoji: '😊', label: 'happy' },
  { emoji: '🥰', label: 'loved' },
  { emoji: '😢', label: 'sad' },
  { emoji: '🤩', label: 'excited' },
  { emoji: '😤', label: 'angry' },
  { emoji: '🙏', label: 'thankful' },
  { emoji: '😎', label: 'confident' },
  { emoji: '🤔', label: 'thoughtful' },
  { emoji: '😴', label: 'tired' },
  { emoji: '🥳', label: 'celebrating' },
  { emoji: '😌', label: 'relaxed' },
  { emoji: '💪', label: 'motivated' },
  { emoji: '🤗', label: 'grateful' },
  { emoji: '😍', label: 'in love' },
  { emoji: '🫠', label: 'silly' },
  { emoji: '😇', label: 'blessed' },
];

const BG_COLORS = [
  null, // no background
  '#1877F2',
  '#42b72a',
  '#E4426D',
  '#F7984A',
  '#7B61FF',
  '#00C7A3',
  '#FF6B6B',
  '#FFD93D',
  '#1C1E21',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
];

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone on or off Xacebook' },
  { value: 'friends', label: 'Friends', icon: Users, desc: 'Your friends on Xacebook' },
  { value: 'only_me', label: 'Only me', icon: Lock, desc: 'Only you can see this' },
];

const CreatePost = ({ groupId = null }) => {
  const { currentUser, addPost } = useApp();
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [privacy, setPrivacy] = useState('friends');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [feeling, setFeeling] = useState(null);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [selectedBg, setSelectedBg] = useState(null);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const modalRef = useRef(null);
  const privacyRef = useRef(null);
  const fileInputRef = useRef(null);

  const resetDraft = () => {
    setContent('');
    setIsExpanded(false);
    setFeeling(null);
    setSelectedBg(null);
    setAttachedImage(null);
    setUploadError('');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const sid = getSessionId();
      const response = await fetch(`/upload${sid ? `?sid=${encodeURIComponent(sid)}` : ''}`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const payload = await response.json();
      const uploaded = payload.files?.[0];
      if (!uploaded?.url) throw new Error('Upload response missing file URL');
      setAttachedImage(uploaded.url);
      setIsExpanded(true);
    } catch (error) {
      setUploadError(error.message || 'Could not upload image');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !attachedImage) return;

    const newPost = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      content: content,
      image: attachedImage,
      likes: [],
      reactions: [],
      comments: [],
      timestamp: Date.now(),
      type: 'status',
      privacy: groupId ? 'public' : privacy,
      shares: 0,
      edited: false,
      ...(feeling ? { feeling: feeling.label, feelingEmoji: feeling.emoji } : {}),
      ...(selectedBg ? { bgColor: selectedBg } : {}),
      ...(groupId ? { groupId } : {}),
    };

    addPost(newPost);
    resetDraft();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsExpanded(false);
        setShowFeelingPicker(false);
      }
      if (privacyRef.current && !privacyRef.current.contains(event.target)) {
        setShowPrivacyMenu(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const selectedPrivacy = PRIVACY_OPTIONS.find(p => p.value === privacy);
  const PrivacyIcon = selectedPrivacy?.icon || Globe;

  return (
    <>
      {/* Collapsed State */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex gap-3 mb-3">
          <img
            src={currentUser.avatar}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90"
          />
          <div
            className="flex-1 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer transition-colors flex items-center px-4 h-10"
            onClick={() => setIsExpanded(true)}
          >
            <span className="text-gray-500 text-[15px]">{`What's on your mind, ${currentUser.name.split(' ')[0]}?`}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3 flex items-center justify-between px-2">
          <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer flex-1 justify-center">
            <Video className="text-red-500" size={24} />
            <span className="font-semibold text-gray-500 text-[15px] hidden sm:inline">Live video</span>
          </div>
          <div
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer flex-1 justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="text-green-500" size={24} />
            <span className="font-semibold text-gray-500 text-[15px] hidden sm:inline">Photo/video</span>
          </div>
          <div
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer flex-1 justify-center"
            onClick={() => { setIsExpanded(true); setTimeout(() => setShowFeelingPicker(true), 100); }}
          >
            <Smile className="text-yellow-500" size={24} />
            <span className="font-semibold text-gray-500 text-[15px] hidden sm:inline">Feeling/activity</span>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && !showFeelingPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-[500px] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative border-b border-gray-200 p-4 text-center">
              <h3 className="text-xl font-bold">Create post</h3>
              <button
                onClick={resetDraft}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <img src={currentUser.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <span className="font-semibold block text-[15px]">
                    {currentUser.name}
                    {feeling && (
                      <span className="font-normal"> is feeling {feeling.emoji} {feeling.label}</span>
                    )}
                  </span>
                  {!groupId && (
                    <div className="relative" ref={privacyRef}>
                      <button
                        className="bg-gray-200 rounded-md px-2 py-0.5 flex items-center gap-1 text-xs font-semibold cursor-pointer mt-0.5 hover:bg-gray-300 transition-colors"
                        onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                      >
                        <PrivacyIcon size={12} />
                        <span>{selectedPrivacy?.label}</span>
                        <ChevronDown size={10} />
                      </button>
                      {showPrivacyMenu && (
                        <div className="absolute top-full left-0 mt-1 w-[280px] bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                          {PRIVACY_OPTIONS.map(opt => {
                            const Icon = opt.icon;
                            return (
                              <button
                                key={opt.value}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 text-left ${privacy === opt.value ? 'bg-blue-50' : ''}`}
                                onClick={() => { setPrivacy(opt.value); setShowPrivacyMenu(false); }}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${privacy === opt.value ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                                  <Icon size={16} />
                                </div>
                                <div>
                                  <p className="font-semibold text-[15px]">{opt.label}</p>
                                  <p className="text-xs text-gray-500">{opt.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Input Area */}
              <div className="mb-4 relative">
                {selectedBg ? (
                  <div
                    className="w-full min-h-[180px] rounded-lg flex items-center justify-center p-6"
                    style={{ background: selectedBg }}
                  >
                    <textarea
                      placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                      className="w-full bg-transparent border-none outline-none resize-none text-xl text-white text-center font-bold placeholder-white/60"
                      style={{ minHeight: '60px' }}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <textarea
                    placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                    className="w-full min-h-[150px] text-xl placeholder-gray-500 resize-none outline-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    autoFocus
                  />
                )}
              </div>

              {attachedImage && (
                <div className="relative mb-4 rounded-lg overflow-hidden border border-gray-200">
                  <img src={attachedImage} alt="Attached upload" className="w-full max-h-[260px] object-cover" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow"
                    onClick={() => setAttachedImage(null)}
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Background Color Picker */}
              <div className="flex items-center gap-1 mb-4">
                <button
                  className={`text-xs font-semibold px-2 py-1 rounded ${showBgPicker ? 'bg-blue-100 text-primary' : 'text-gray-500 hover:bg-gray-100'}`}
                  onClick={() => setShowBgPicker(!showBgPicker)}
                >
                  Aa
                </button>
                {showBgPicker && (
                  <div className="flex gap-1 items-center">
                    {BG_COLORS.map((bg, i) => (
                      <button
                        key={i}
                        className={`w-7 h-7 rounded-md border-2 transition-transform ${selectedBg === bg ? 'border-primary scale-110' : 'border-gray-200 hover:scale-105'}`}
                        style={{ background: bg || '#FFFFFF' }}
                        onClick={() => setSelectedBg(bg)}
                      >
                        {bg === null && <span className="text-[10px] text-gray-400">Aa</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add to Post Options */}
              <div className="border border-gray-300 rounded-lg p-3 flex items-center justify-between mb-4 shadow-sm">
                <span className="font-semibold text-[15px]">Add to your post</span>
                <div className="flex gap-1">
                  <div
                    className="w-9 h-9 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer text-green-500"
                    title="Photo/Video"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image size={24} />
                  </div>
                  <div className="w-9 h-9 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer text-blue-500" title="Tag People">
                    <UserPlus size={24} />
                  </div>
                  <div
                    className="w-9 h-9 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer text-yellow-500"
                    title="Feeling/Activity"
                    onClick={() => setShowFeelingPicker(true)}
                  >
                    <Smile size={24} />
                  </div>
                  <div className="w-9 h-9 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer text-red-500" title="Check-in">
                    <MapPin size={24} />
                  </div>
                </div>
              </div>

              {uploadError && (
                <p className="text-sm text-red-600 mb-3">{uploadError}</p>
              )}

              {/* Post Button */}
              <button
                onClick={handleSubmit}
                disabled={(!content.trim() && !attachedImage) || isUploading}
                className={`w-full py-2 rounded-md font-semibold text-[15px] transition-colors ${
                  (content.trim() || attachedImage) && !isUploading
                    ? 'bg-primary text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isUploading ? 'Uploading...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feeling/Activity Picker Modal */}
      {isExpanded && showFeelingPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[500px]" onClick={e => e.stopPropagation()}>
            <div className="relative border-b border-gray-200 p-4 text-center">
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                onClick={() => setShowFeelingPicker(false)}
              >
                <ChevronDown size={20} className="rotate-90" />
              </button>
              <h3 className="text-xl font-bold">How are you feeling?</h3>
              <button
                onClick={() => { setShowFeelingPicker(false); setIsExpanded(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
              {FEELINGS.map(f => (
                <button
                  key={f.label}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${feeling?.label === f.label ? 'bg-blue-50 ring-2 ring-primary' : 'hover:bg-gray-100'}`}
                  onClick={() => { setFeeling(f); setShowFeelingPicker(false); }}
                >
                  <span className="text-2xl">{f.emoji}</span>
                  <span className="font-medium text-[15px] capitalize">{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </>
  );
};

export default CreatePost;
