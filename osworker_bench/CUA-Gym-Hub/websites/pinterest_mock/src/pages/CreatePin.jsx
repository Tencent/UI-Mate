import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowUpCircle } from 'lucide-react';

const isValidUrl = (str) => {
  if (!str) return true; // Empty is allowed (optional field)
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const CreatePin = () => {
  const { state, addPin } = useStore();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const [boardId, setBoardId] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const getSid = () => new URLSearchParams(window.location.search).get('sid') || sessionStorage.getItem('mock_sid') || '';

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const localPreview = URL.createObjectURL(file);
      setImagePreview(localPreview);

      try {
        const formData = new FormData();
        formData.append('file', file);
        const sid = getSid();
        const response = await fetch(`/upload${sid ? `?sid=${encodeURIComponent(sid)}` : ''}`, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) throw new Error('Upload failed');
        const result = await response.json();
        const uploaded = result.files?.[0];
        if (uploaded?.url) {
          setUploadedFile(uploaded);
          setImagePreview(uploaded.url);
        }
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setUploadedFile({
            original_name: file.name,
            size: file.size,
            content_type: file.type
          });
        };
        reader.readAsDataURL(file);
      } finally {
        setUploading(false);
      }
    }
  };

  const handlePublish = () => {
    if (!title || !imagePreview) return;
    if (link && !isValidUrl(link)) {
      setLinkError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    addPin({
      title,
      description,
      url: link || 'https://example.com',
      image: imagePreview,
      boardId: boardId || null,
      sourceFile: uploadedFile
    });

    navigate('/');
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-4xl shadow-sm flex flex-col md:flex-row gap-8">
        
        {/* Image Upload Area */}
        <div className="w-full md:w-1/3 bg-gray-100 rounded-[32px] border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden min-h-[400px]">
          {imagePreview ? (
            <div className="relative w-full h-full group">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => { setImagePreview(null); setUploadedFile(null); }}
                className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Upload size={20} className="rotate-45" />
              </button>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                  Uploading...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-4">
              <div className="mx-auto w-12 h-12 mb-4 text-gray-500">
                <ArrowUpCircle size={48} />
              </div>
              <p className="text-gray-700 font-medium mb-8">Choose a file or drag and drop it here</p>
              <label className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full font-semibold cursor-pointer">
                Choose File
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              <p className="text-xs text-gray-400 mt-8">We recommend using high quality .jpg files less than 20MB.</p>
            </div>
          )}
        </div>

        {/* Form Area */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Create Pin</h2>
            <button 
              onClick={handlePublish}
              disabled={!imagePreview || !title}
              className="bg-xinterest-red text-white px-6 py-3 rounded-full font-bold hover:bg-xinterest-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publish
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Title</label>
              <input 
                type="text" 
                placeholder="Add your title" 
                className="w-full text-3xl font-bold border-b-2 border-gray-200 focus:border-blue-500 outline-none py-2 placeholder-gray-300"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <img src={state.currentUser.avatar} alt="User" className="w-10 h-10 rounded-full" />
                <span className="font-semibold">{state.currentUser.name}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Description</label>
              <textarea 
                placeholder="Tell everyone what your Pin is about" 
                className="w-full text-lg border-b-2 border-gray-200 focus:border-blue-500 outline-none py-2 placeholder-gray-300 resize-none h-24"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Link</label>
              <input
                type="url"
                placeholder="Add a destination link"
                className={`w-full text-lg border-b-2 ${linkError ? 'border-red-500' : 'border-gray-200'} focus:border-[#0074E8] outline-none py-2 placeholder-gray-300`}
                value={link}
                onChange={e => {
                  setLink(e.target.value);
                  if (linkError) setLinkError('');
                }}
                onBlur={() => {
                  if (link && !isValidUrl(link)) {
                    setLinkError('Please enter a valid URL starting with http:// or https://');
                  } else {
                    setLinkError('');
                  }
                }}
              />
              {linkError && <p className="text-red-500 text-xs mt-1">{linkError}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Board</label>
              <select 
                className="w-full p-3 bg-gray-100 rounded-lg outline-none cursor-pointer"
                value={boardId}
                onChange={e => setBoardId(e.target.value)}
              >
                <option value="">Select a board</option>
                {state.boards.filter(b => b.userId === state.currentUser.id && !b.archived).map(board => (
                  <option key={board.id} value={board.id}>{board.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePin;
