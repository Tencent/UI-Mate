import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../App.jsx';
import { extractHashtags } from '../utils/helpers.js';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = [
  { id: 'food', label: '美食' },
  { id: 'travel', label: '旅行' },
  { id: 'beauty', label: '美妆' },
  { id: 'fashion', label: '穿搭' },
  { id: 'fitness', label: '健身' },
  { id: 'home', label: '家居' },
  { id: 'digital', label: '数码' },
  { id: 'study', label: '学习' },
  { id: 'pets', label: '萌宠' },
];

// Preset placeholder images to "select"
const PRESET_IMAGES = Array.from({ length: 9 }, (_, i) => ({
  id: `preset_${i}`,
  url: `https://picsum.photos/seed/preset${i + 1}/600/800`
}));

export default function PublishNotePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editNoteId = searchParams.get('edit');
  const { state, currentUserId, createNote, editNote } = useApp();
  const showToast = useToast();

  const existingNote = editNoteId ? state?.notes?.[editNoteId] : null;

  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [category, setCategory] = useState(existingNote?.category || 'food');
  const [location, setLocation] = useState(existingNote?.location || '');
  const [selectedImages, setSelectedImages] = useState(existingNote?.images || []);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const isEditing = Boolean(editNoteId && existingNote);

  const toggleImage = (imgUrl) => {
    setSelectedImages(prev => {
      if (prev.includes(imgUrl)) return prev.filter(u => u !== imgUrl);
      if (prev.length >= 9) { showToast('最多选择9张图片'); return prev; }
      return [...prev, imgUrl];
    });
  };

  const removeImage = (imgUrl) => {
    setSelectedImages(prev => prev.filter(u => u !== imgUrl));
  };

  const handlePublish = () => {
    if (!title.trim()) { showToast('请填写标题'); return; }
    if (selectedImages.length === 0) { showToast('请至少选择一张图片'); return; }

    const hashtags = extractHashtags(content);

    if (isEditing) {
      editNote(editNoteId, {
        title: title.trim(),
        content: content.trim(),
        category,
        location: location.trim() || null,
        images: selectedImages,
        hashtags
      });
      showToast('笔记已更新');
      navigate(`/note/${editNoteId}`);
    } else {
      const newNoteId = `n_${uuidv4().slice(0, 8)}`;
      createNote({
        id: newNoteId,
        authorId: currentUserId,
        type: 'image',
        title: title.trim(),
        content: content.trim(),
        images: selectedImages,
        videoUrl: null,
        hashtags,
        location: location.trim() || null,
        category
      });
      showToast('笔记已发布 🎉');
      navigate(`/note/${newNoteId}`);
    }
  };

  return (
    <div className="publish-page">
      <h1 className="publish-title">{isEditing ? '编辑笔记' : '发布笔记'}</h1>

      {/* Image selection */}
      <div style={{ marginBottom: 16 }}>
        <div className="publish-field-label">图片 ({selectedImages.length}/9)</div>
        <div className="publish-images-grid">
          {selectedImages.map((url, i) => (
            <div key={i} className="publish-image-slot">
              <img src={url} alt={`图片${i+1}`} className="publish-selected-img" />
              <button
                className="publish-img-remove"
                onClick={() => removeImage(url)}
              >
                ✕
              </button>
            </div>
          ))}
          {selectedImages.length < 9 && (
            <div
              className="publish-image-slot empty"
              onClick={() => setShowImagePicker(v => !v)}
            >
              +
            </div>
          )}
        </div>

        {showImagePicker && (
          <div style={{
            border: '1px solid var(--xhs-border)',
            borderRadius: 'var(--xhs-radius)',
            padding: 12,
            marginTop: 8
          }}>
            <div style={{ fontSize: 13, color: 'var(--xhs-text-secondary)', marginBottom: 8 }}>
              选择图片（点击选中/取消选中）
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {PRESET_IMAGES.map(img => {
                const isSelected = selectedImages.includes(img.url);
                return (
                  <div
                    key={img.id}
                    onClick={() => toggleImage(img.url)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 4,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      border: isSelected ? '2px solid var(--xhs-red)' : '2px solid transparent'
                    }}
                  >
                    <img
                      src={img.url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {isSelected && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(255,36,66,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 20
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <div className="publish-field-label">标题 *</div>
        <input
          type="text"
          className="publish-title-input"
          placeholder="填写标题（建议20字以内）"
          value={title}
          maxLength={50}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      {/* Content */}
      <div style={{ marginBottom: 16 }}>
        <div className="publish-field-label">正文</div>
        <textarea
          className="publish-content-textarea"
          placeholder="添加正文，#话题 可以让更多人看到你的笔记"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
        />
      </div>

      {/* Category + Location */}
      <div className="publish-row">
        <div style={{ flex: 1 }}>
          <div className="publish-field-label">分类</div>
          <select
            className="publish-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div className="publish-location-wrapper">
          <div className="publish-field-label">位置</div>
          <div style={{ position: 'relative' }}>
            <span className="publish-location-icon">📍</span>
            <input
              type="text"
              className="publish-location-input"
              placeholder="添加地点"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Publish button */}
      <button
        className="publish-btn"
        onClick={handlePublish}
        disabled={!title.trim() || selectedImages.length === 0}
      >
        {isEditing ? '保存修改' : '发布'}
      </button>
    </div>
  );
}
