import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import PostCard from '../components/feed/PostCard';
import { Image, Video, Calendar, FileText, X } from 'lucide-react';

const CreatePostModal = ({ onClose, onPost, user }) => {
  const [text, setText] = useState('');
  const [hasMedia, setHasMedia] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onPost(text, hasMedia ? `https://picsum.photos/800/400?random=${Date.now()}` : null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-lg w-full max-w-xl shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Create a post</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <img src={user.avatar} className="w-12 h-12 rounded-full" />
            <div className="font-semibold">{user.name}</div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you want to talk about?"
            className="w-full text-lg min-h-[150px] resize-none outline-none placeholder:text-gray-500"
            autoFocus
          />
          {hasMedia && (
            <div className="relative mt-2 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 h-40 flex items-center justify-center">
              <span className="text-gray-500">Image/Video Preview</span>
              <button 
                onClick={() => setHasMedia(false)}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex gap-4">
            <button onClick={() => setHasMedia(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              <Image size={24} />
            </button>
            <button onClick={() => setHasMedia(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              <Video size={24} />
            </button>
            <button onClick={() => setHasMedia(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              <FileText size={24} />
            </button>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="bg-xinkedin-blue text-white px-6 py-1.5 rounded-full font-semibold hover:bg-xinkedin-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Feed() {
  const { state, addPost } = useStore();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto px-4 py-6">
      {/* Left Sidebar */}
      <div className="hidden md:block md:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-20">
          <div className="h-16 bg-gray-200 relative">
            <img src={state.currentUser.banner} className="w-full h-full object-cover" />
            <img
              src={state.currentUser.avatar}
              className="absolute left-1/2 -translate-x-1/2 top-6 w-16 h-16 rounded-full border-2 border-white cursor-pointer"
              onClick={() => navigate('/profile/me')}
            />
          </div>
          <div className="pt-10 pb-4 px-4 text-center border-b border-gray-200">
            <h2 className="font-semibold hover:underline cursor-pointer" onClick={() => navigate('/profile/me')}>{state.currentUser.name}</h2>
            <p className="text-xs text-gray-500 mt-1">{state.currentUser.headline}</p>
          </div>
          <div className="py-3 px-4 text-xs text-gray-500 font-semibold hover:bg-gray-100 cursor-pointer flex justify-between" onClick={() => navigate('/mynetwork')}>
            <span>Connections</span>
            <span className="text-xinkedin-blue">{state.currentUser.connections.length}</span>
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="col-span-1 md:col-span-6">
        {/* Create Post Trigger */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex gap-3 mb-3">
            <img src={state.currentUser.avatar} className="w-12 h-12 rounded-full" />
            <button 
              onClick={() => setShowModal(true)}
              className="flex-1 text-left border border-gray-300 rounded-full px-4 py-3 text-sm text-gray-500 hover:bg-gray-100 transition-colors font-semibold"
            >
              Start a post
            </button>
          </div>
          <div className="flex justify-between items-center px-2">
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-gray-500 hover:bg-gray-100 px-3 py-2 rounded">
              <Image size={20} className="text-blue-500" />
              <span className="text-sm font-semibold text-gray-600">Media</span>
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-gray-500 hover:bg-gray-100 px-3 py-2 rounded">
              <Calendar size={20} className="text-yellow-600" />
              <span className="text-sm font-semibold text-gray-600">Event</span>
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-gray-500 hover:bg-gray-100 px-3 py-2 rounded">
              <FileText size={20} className="text-orange-600" />
              <span className="text-sm font-semibold text-gray-600">Article</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-[1px] bg-gray-300 flex-1"></div>
          <span className="text-xs text-gray-500 px-2">Sort by: <span className="font-semibold text-black">Top</span></span>
        </div>

        {/* Posts */}
        {state.posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Right Sidebar */}
      <div className="hidden md:block md:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-sm text-gray-600">XinkedIn News</h2>
            <div className="bg-gray-400 rounded-full w-4 h-4 text-white flex items-center justify-center text-xs">i</div>
          </div>
          <ul className="space-y-4">
            <li className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <h3 className="text-sm font-semibold hover:text-xinkedin-blue hover:underline">Tech hiring stabilizes</h3>
              </div>
              <p className="text-xs text-gray-500 pl-4">10h ago • 12,932 readers</p>
            </li>
            <li className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <h3 className="text-sm font-semibold hover:text-xinkedin-blue hover:underline">New AI regulations coming</h3>
              </div>
              <p className="text-xs text-gray-500 pl-4">1d ago • 8,442 readers</p>
            </li>
            <li className="cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <h3 className="text-sm font-semibold hover:text-xinkedin-blue hover:underline">Remote work trends 2024</h3>
              </div>
              <p className="text-xs text-gray-500 pl-4">2d ago • 22,109 readers</p>
            </li>
          </ul>
        </div>
      </div>

      {showModal && (
        <CreatePostModal 
          onClose={() => setShowModal(false)} 
          onPost={addPost} 
          user={state.currentUser}
        />
      )}
    </div>
  );
}