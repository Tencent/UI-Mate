import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, MapPin, ArrowLeft, Smile, ChevronDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import { getSessionId } from '../utils/mockData';

const CreatePostModal = ({ onClose }) => {
  const { createPost, currentUser } = useData();
  const [step, setStep] = useState(1); // 1: Select, 2: Filter, 3: Details
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [filter, setFilter] = useState('none');
  const [sharing, setSharing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [altText, setAltText] = useState('');
  const [hideLikes, setHideLikes] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageSelect = async (event) => {
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
      setSelectedImage(uploaded.url);
      setStep(2);
    } catch (error) {
      setUploadError(error.message || 'Could not upload file');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleShare = () => {
    if (!selectedImage) return;
    setSharing(true);
    setTimeout(() => {
      createPost({
        images: [selectedImage],
        caption,
        location,
        altText,
        hideLikes,
      });
      onClose();
    }, 600);
  };

  const filters = [
    { name: 'Normal', value: 'none' },
    { name: 'Clarendon', value: 'contrast(1.2) saturate(1.35)' },
    { name: 'Gingham', value: 'brightness(1.05) hue-rotate(-10deg)' },
    { name: 'Moon', value: 'grayscale(1) contrast(1.1) brightness(1.1)' },
    { name: 'Lark', value: 'contrast(0.9) brightness(1.15) saturate(1.2)' },
    { name: 'Reyes', value: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)' },
  ];

  const getStepTitle = () => {
    if (step === 1) return 'Create new post';
    if (step === 2) return 'Edit';
    return 'Create new post';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 md:p-10" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-50 hover:opacity-70 transition-opacity">
        <X className="w-7 h-7" />
      </button>

      <div className="bg-white w-full max-w-[710px] rounded-xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#DBDBDB]">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="hover:opacity-50 transition-opacity">
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-6" />
          )}
          <h2 className="font-semibold text-base">{getStepTitle()}</h2>
          {step === 2 ? (
            <button onClick={() => setStep(3)} className="text-[#0095F6] font-semibold text-sm hover:text-[#00376B] transition-colors">
              Next
            </button>
          ) : step === 3 ? (
            <button
              onClick={handleShare}
              disabled={sharing}
              className={`text-[#0095F6] font-semibold text-sm hover:text-[#00376B] transition-colors ${sharing ? 'opacity-50' : ''}`}
            >
              {sharing ? 'Sharing...' : 'Share'}
            </button>
          ) : (
            <div className="w-6" />
          )}
        </div>

        <div className={`${step === 1 ? 'h-[430px]' : step === 2 ? 'h-[430px]' : 'h-[430px]'} flex`}>
          {step === 1 ? (
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <svg className="w-24 h-24 text-[#262626]" viewBox="0 0 97.6 77.3" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16.3 24h.7c1.3 0 2.4-1.1 2.4-2.4v-.7c0-1.3-1.1-2.4-2.4-2.4h-.7c-1.3 0-2.4 1.1-2.4 2.4v.7c0 1.3 1.1 2.4 2.4 2.4zm48-11.2H33.3c-4.4 0-8 3.6-8 8v30.6c0 4.4 3.6 8 8 8h31c4.4 0 8-3.6 8-8V20.8c0-4.4-3.6-8-8-8zm4 38.6c0 2.2-1.8 4-4 4H33.3c-2.2 0-4-1.8-4-4V20.8c0-2.2 1.8-4 4-4h31c2.2 0 4 1.8 4 4v30.6zM48.8 26.6c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="currentColor" stroke="none"/>
                <path d="M16.3 24h.7c1.3 0 2.4-1.1 2.4-2.4v-.7c0-1.3-1.1-2.4-2.4-2.4h-.7c-1.3 0-2.4 1.1-2.4 2.4v.7c0 1.3 1.1 2.4 2.4 2.4z" fill="currentColor" stroke="none"/>
              </svg>
              <p className="text-xl font-light text-[#262626]">Drag photos and videos here</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="ig-btn-primary text-sm"
              >
                {isUploading ? 'Uploading...' : 'Select from computer'}
              </button>
              {uploadError && <p className="text-sm text-[#ED4956]">{uploadError}</p>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          ) : step === 2 ? (
            <div className="flex w-full">
              <div className="flex-1 bg-black flex items-center justify-center">
                <img
                  src={selectedImage}
                  className="max-w-full max-h-full object-contain"
                  style={{ filter: filter !== 'none' ? filter : 'none' }}
                  alt="Preview"
                />
              </div>
              <div className="w-[240px] border-l border-[#DBDBDB] flex flex-col">
                <div className="p-3 border-b border-[#EFEFEF]">
                  <span className="text-sm font-semibold">Filters</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
                  {filters.map(f => (
                    <button
                      key={f.name}
                      onClick={() => setFilter(f.value)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors ${filter === f.value ? 'border border-[#0095F6]' : 'border border-transparent'}`}
                    >
                      <div className="w-full aspect-square rounded overflow-hidden bg-gray-100">
                        <img
                          src={selectedImage}
                          className="w-full h-full object-cover"
                          style={{ filter: f.value !== 'none' ? f.value : 'none' }}
                          alt={f.name}
                        />
                      </div>
                      <span className={`text-xs ${filter === f.value ? 'text-[#0095F6] font-semibold' : 'text-[#8E8E8E]'}`}>{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex w-full">
              <div className="flex-1 bg-black flex items-center justify-center">
                <img
                  src={selectedImage}
                  className="max-w-full max-h-full object-contain"
                  style={{ filter: filter !== 'none' ? filter : 'none' }}
                  alt="Preview"
                />
              </div>
              <div className="w-[280px] border-l border-[#DBDBDB] flex flex-col">
                {/* User info */}
                <div className="flex items-center gap-3 p-4">
                  <img src={currentUser.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <span className="font-semibold text-sm">{currentUser.username}</span>
                </div>

                {/* Caption */}
                <div className="px-4 flex-1">
                  <textarea
                    className="w-full h-32 resize-none outline-none text-sm placeholder-[#8E8E8E]"
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, 2200))}
                  />
                  <div className="flex justify-between items-center text-[#C7C7C7] mb-3">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="hover:text-[#8E8E8E] transition-colors"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute left-0 bottom-7 bg-white border border-[#DBDBDB] rounded-xl shadow-lg p-2 grid grid-cols-6 gap-1 z-10">
                          {['🙂', '😍', '🔥', '✨', '📸', '🎉', '❤️', '👏', '🌊', '☕', '🌿', '💫'].map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setCaption(prev => `${prev}${emoji}`.slice(0, 2200))}
                              className="w-7 h-7 rounded hover:bg-[#EFEFEF]"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs">{caption.length}/2,200</span>
                  </div>
                </div>

                {/* Location */}
                <div className="px-4 py-3 border-t border-[#EFEFEF] flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Add location"
                    className="w-full outline-none text-sm placeholder-[#8E8E8E]"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <MapPin className="w-4 h-4 text-[#8E8E8E] flex-shrink-0" />
                </div>

                {/* Accessibility */}
                <button
                  onClick={() => setShowAccessibility(!showAccessibility)}
                  className="px-4 py-3 border-t border-[#EFEFEF] flex items-center justify-between w-full text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm">Accessibility</span>
                  <ChevronDown className={`w-4 h-4 text-[#8E8E8E] transition-transform ${showAccessibility ? 'rotate-180' : ''}`} />
                </button>
                {showAccessibility && (
                  <div className="px-4 pb-3">
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value.slice(0, 125))}
                      placeholder="Write alt text"
                      className="w-full border border-[#DBDBDB] rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                )}

                {/* Advanced */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="px-4 py-3 border-t border-[#EFEFEF] flex items-center justify-between w-full text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm">Advanced settings</span>
                  <ChevronDown className={`w-4 h-4 text-[#8E8E8E] transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>
                {showAdvanced && (
                  <label className="px-4 pb-3 flex items-center justify-between gap-3 text-sm">
                    <span>Hide like and view counts on this post</span>
                    <input
                      type="checkbox"
                      checked={hideLikes}
                      onChange={(e) => setHideLikes(e.target.checked)}
                      className="w-4 h-4"
                    />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
