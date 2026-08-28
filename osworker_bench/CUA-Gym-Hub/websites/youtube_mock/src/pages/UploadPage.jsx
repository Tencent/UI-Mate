import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Upload, X, Film, Globe, Lock, Users } from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();
  const { showToast, addUploadedVideo } = useData();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState('select'); // select, details, done
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [publishedVideoId, setPublishedVideoId] = useState(null);
  const [progress, setProgress] = useState(0);

  const getSid = () => new URLSearchParams(window.location.search).get('sid') || sessionStorage.getItem('mock_sid') || '';

  const handleFileSelect = async (file) => {
    if (!file) return;
    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
    setStep('uploading');
    setProgress(12);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const sid = getSid();
      const response = await fetch(`/upload${sid ? `?sid=${encodeURIComponent(sid)}` : ''}`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      setProgress(100);
      const result = await response.json();
      setUploadedFile(result.files?.[0] || null);
      setStep('details');
      showToast('Upload complete');
    } catch (error) {
      setProgress(100);
      setUploadedFile({
        original_name: file.name,
        stored_name: file.name,
        size: file.size,
        content_type: file.type || 'video/mp4',
        url: ''
      });
      setStep('details');
      showToast('Local upload ready');
    }
  };

  const handlePublish = () => {
    if (!title.trim()) {
      showToast('Please enter a video title');
      return;
    }
    const videoId = `video-upload-${Date.now()}`;
    addUploadedVideo({
      videoId,
      title: title.trim(),
      description,
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      visibility,
      videoUrl: uploadedFile?.url || '',
      sourceFile: uploadedFile || (selectedFile ? {
        original_name: selectedFile.name,
        size: selectedFile.size,
        content_type: selectedFile.type
      } : null)
    });
    setPublishedVideoId(videoId);
    setStep('done');
    showToast('Video published successfully!');
  };

  const categories = ['Film & Animation', 'Autos & Vehicles', 'Music', 'Pets & Animals', 'Sports', 'Travel & Events', 'Gaming', 'People & Blogs', 'Comedy', 'Entertainment', 'News & Politics', 'Howto & Style', 'Education', 'Science & Technology'];

  const visibilityOptions = [
    { value: 'public', label: 'Public', icon: <Globe size={18} />, desc: 'Everyone can watch' },
    { value: 'unlisted', label: 'Unlisted', icon: <Users size={18} />, desc: 'Anyone with the link can watch' },
    { value: 'private', label: 'Private', icon: <Lock size={18} />, desc: 'Only you can watch' },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Upload video</h1>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', color: 'var(--text-primary)' }}
        >
          <X size={24} />
        </button>
      </div>

      {step === 'select' && (
        <div style={{
          border: '2px dashed var(--border-color, #ccc)',
          borderRadius: 12,
          padding: '80px 40px',
          textAlign: 'center',
          background: 'var(--bg-secondary, #f9f9f9)',
        }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFileSelect(event.dataTransfer.files?.[0]);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={(event) => handleFileSelect(event.target.files?.[0])}
          />
          <div style={{ marginBottom: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--bg-tertiary, #e5e5e5)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Upload size={36} style={{ color: 'var(--text-secondary, #606060)' }} />
            </div>
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Drag and drop video files to upload</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary, #606060)', marginBottom: 24 }}>
            Your videos will be private until you publish them.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#065FD4',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Select Files
          </button>
        </div>
      )}

      {step === 'uploading' && (
        <div style={{
          border: '1px solid var(--border-color, #ccc)',
          borderRadius: 12,
          padding: '60px 40px',
          textAlign: 'center',
        }}>
          <Film size={48} style={{ color: 'var(--text-secondary)', marginBottom: 16 }} />
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Uploading video...</p>
          <div style={{
            width: '100%', maxWidth: 400, height: 4, background: 'var(--bg-tertiary, #e5e5e5)',
            borderRadius: 2, margin: '0 auto 12px',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%', background: '#065FD4',
              borderRadius: 2, transition: 'width 0.3s',
            }} />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{Math.round(progress)}% uploaded</p>
        </div>
      )}

      {step === 'details' && (
        <div style={{ border: '1px solid var(--border-color, #ccc)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '24px 24px 0' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Details</h2>
            {selectedFile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                border: '1px solid var(--border-color, #ccc)', borderRadius: 8,
                marginBottom: 20, background: 'var(--bg-secondary, #f9f9f9)'
              }}>
                <Film size={28} style={{ color: 'var(--text-secondary)' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {Math.max(1, Math.round(selectedFile.size / 1024))} KB uploaded
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Title (required)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: 14,
                  border: '1px solid var(--border-color, #ccc)', borderRadius: 4,
                  background: 'var(--bg-primary, white)', color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: 14,
                  border: '1px solid var(--border-color, #ccc)', borderRadius: 4,
                  background: 'var(--bg-primary, white)', color: 'var(--text-primary)',
                  boxSizing: 'border-box', resize: 'vertical',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Tags</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: 14,
                  border: '1px solid var(--border-color, #ccc)', borderRadius: 4,
                  background: 'var(--bg-primary, white)', color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Separate tags with commas</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  padding: '10px 12px', fontSize: 14, minWidth: 200,
                  border: '1px solid var(--border-color, #ccc)', borderRadius: 4,
                  background: 'var(--bg-primary, white)', color: 'var(--text-primary)',
                }}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 10 }}>Visibility</label>
              {visibilityOptions.map(opt => (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                    border: `1px solid ${visibility === opt.value ? '#065FD4' : 'var(--border-color, #ccc)'}`,
                    borderRadius: 8, marginBottom: 8, cursor: 'pointer',
                    background: visibility === opt.value ? 'rgba(6,95,212,0.05)' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={opt.value}
                    checked={visibility === opt.value}
                    onChange={() => setVisibility(opt.value)}
                  />
                  {opt.icon}
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color, #ccc)',
            display: 'flex', justifyContent: 'flex-end', gap: 12,
          }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 500,
                border: '1px solid var(--border-color, #ccc)', borderRadius: 4,
                background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 500,
                border: 'none', borderRadius: 4,
                background: '#065FD4', color: 'white', cursor: 'pointer',
              }}
            >
              Publish
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div style={{
          border: '1px solid var(--border-color, #ccc)',
          borderRadius: 12,
          padding: '60px 40px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#0f9d58',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Video published!</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
            "{title}" has been published as {visibility}.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => navigate(`/watch/${publishedVideoId}`)}
              style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 500,
                border: 'none', borderRadius: 4,
                background: '#065FD4', color: 'white', cursor: 'pointer',
              }}
            >
              Watch Video
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 500,
                border: '1px solid var(--border-color, #ccc)', borderRadius: 4,
                background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)',
              }}
            >
              Go to Home
            </button>
            <button
              onClick={() => { setStep('select'); setTitle(''); setDescription(''); setTags(''); setSelectedFile(null); setUploadedFile(null); setPublishedVideoId(null); setProgress(0); }}
              style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 500,
                border: '1px solid var(--border-color, #ccc)', borderRadius: 4,
                background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)',
              }}
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
