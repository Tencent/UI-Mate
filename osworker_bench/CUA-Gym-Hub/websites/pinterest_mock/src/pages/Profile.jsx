import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import MasonryGrid from '../components/MasonryGrid';
import PinModal from '../components/PinModal';
import { Plus, X, Camera, Share2, Settings, Search } from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { state, createBoard, updateProfile, followUser } = useStore();
  const [activeTab, setActiveTab] = useState('saved');
  const [selectedPin, setSelectedPin] = useState(null);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardPrivacy, setNewBoardPrivacy] = useState('public');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [boardFilter, setBoardFilter] = useState('');

  // Edit profile form state
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef(null);

  const user = state.users.find(u => u.id === userId);
  const isCurrentUser = state.currentUser.id === userId;

  if (!user) return (
    <div className="pt-[56px] min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">User not found</h1>
        <button className="px-6 py-2 bg-xinterest-red text-white rounded-full font-semibold" onClick={() => navigate('/')}>
          Go home
        </button>
      </div>
    </div>
  );

  const isFollowing = state.currentUser.following.includes(userId);
  const userBoards = state.boards.filter(b => b.userId === userId && !b.archived);
  const createdPins = state.pins.filter(p => p.userId === userId);
  const savedPinIds = userBoards.flatMap(b => b.pins);
  const savedPins = state.pins.filter(p => savedPinIds.includes(p.id));

  const filteredBoards = boardFilter
    ? userBoards.filter(b => b.name.toLowerCase().includes(boardFilter.toLowerCase()))
    : userBoards;

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      createBoard({ name: newBoardName, privacy: newBoardPrivacy });
      setNewBoardName('');
      setNewBoardPrivacy('public');
      setShowCreateBoard(false);
    }
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      });
    } else {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const openEditProfile = () => {
    setEditName(state.currentUser.name);
    setEditUsername(state.currentUser.username);
    setEditBio(state.currentUser.bio || '');
    setEditWebsite(state.currentUser.website || '');
    setEditAvatar(state.currentUser.avatar);
    setAvatarPreview('');
    setShowEditProfile(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setEditAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: editName.trim() || state.currentUser.name,
      username: editUsername.trim() || state.currentUser.username,
      bio: editBio,
      website: editWebsite,
      avatar: editAvatar
    });
    setShowEditProfile(false);
  };

  // Board cover: show mosaic of first 3 pins
  const BoardCover = ({ board }) => {
    const boardPins = board.pins.slice(0, 3).map(pid => state.pins.find(p => p.id === pid)).filter(Boolean);

    if (boardPins.length === 0) {
      return <div className="w-full h-full bg-[#e5e5e0] flex items-center justify-center rounded-2xl">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#91918c" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
      </div>;
    }

    if (boardPins.length === 1) {
      return <img src={boardPins[0].image} alt="" className="w-full h-full object-cover rounded-2xl" />;
    }

    return (
      <div className="board-mosaic rounded-2xl overflow-hidden h-full">
        <div className="overflow-hidden">
          <img src={boardPins[0].image} alt="" className="w-full h-full object-cover" />
        </div>
        {boardPins[1] && (
          <div className="overflow-hidden">
            <img src={boardPins[1].image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        {boardPins[2] ? (
          <div className="overflow-hidden">
            <img src={boardPins[2].image} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="bg-[#e5e5e0]" />
        )}
      </div>
    );
  };

  return (
    <div className="pt-[56px] min-h-screen bg-white pb-20">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-8 pb-4">
        <img src={user.avatar} alt={user.name} className="w-[120px] h-[120px] rounded-full object-cover mb-3" />
        <h1 className="text-[36px] font-bold mb-1">{user.name}</h1>
        <p className="text-[15px] text-gray-500 mb-1">@{user.username}</p>
        {user.bio && <p className="text-[15px] text-gray-600 mb-2 max-w-md text-center">{user.bio}</p>}
        {user.website && (
          <a href={user.website} target="_blank" rel="noreferrer" className="text-sm text-black font-semibold hover:underline mb-2">
            {user.website.replace(/^https?:\/\//, '')}
          </a>
        )}
        <div className="flex gap-1 text-[15px] font-semibold text-gray-800 mb-4">
          <span>{user.followers.length} followers</span>
          <span className="text-gray-400 mx-1">&middot;</span>
          <span>{user.following.length} following</span>
        </div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2.5 bg-[#e5e5e0] hover:bg-[#d5d5d0] rounded-full font-semibold text-sm flex items-center gap-1.5"
            onClick={handleShareProfile}
          >
            <Share2 size={16} />
            Share
          </button>
          {isCurrentUser ? (
            <button
              className="px-4 py-2.5 bg-[#e5e5e0] hover:bg-[#d5d5d0] rounded-full font-semibold text-sm"
              onClick={openEditProfile}
            >
              Edit profile
            </button>
          ) : (
            <button
              className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-colors ${
                isFollowing
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-xinterest-red text-white hover:bg-xinterest-hover'
              }`}
              onClick={() => followUser(userId)}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
          {isCurrentUser && (
            <button
              className="w-10 h-10 bg-[#e5e5e0] hover:bg-[#d5d5d0] rounded-full flex items-center justify-center"
              onClick={() => navigate('/settings')}
            >
              <Settings size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6 px-4">
        <button
          className={`px-1 pb-3 font-semibold text-[15px] border-b-3 transition-colors ${
            activeTab === 'created'
              ? 'border-b-[3px] border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
          onClick={() => setActiveTab('created')}
        >
          Created
        </button>
        <button
          className={`px-1 pb-3 font-semibold text-[15px] transition-colors ${
            activeTab === 'saved'
              ? 'border-b-[3px] border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </button>
      </div>

      {activeTab === 'created' ? (
        <div>
          {createdPins.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-bold text-gray-600 mb-2">No pins created yet</p>
              {isCurrentUser && (
                <button
                  className="px-6 py-2.5 bg-xinterest-red text-white rounded-full font-semibold mt-2"
                  onClick={() => navigate('/create')}
                >
                  Create a Pin
                </button>
              )}
            </div>
          ) : (
            <MasonryGrid pins={createdPins} onPinClick={setSelectedPin} />
          )}
        </div>
      ) : (
        <div className="px-4 max-w-[1400px] mx-auto">
          {/* Board filter + create */}
          <div className="flex items-center justify-between mb-6">
            {userBoards.length > 4 && (
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search boards"
                  className="w-full pl-9 pr-3 py-2 bg-[#e5e5e0] rounded-full text-sm outline-none"
                  value={boardFilter}
                  onChange={(e) => setBoardFilter(e.target.value)}
                />
              </div>
            )}
            <div className="flex-shrink-0 ml-auto">
              {isCurrentUser && (
                <button
                  className="w-10 h-10 rounded-full bg-[#e5e5e0] hover:bg-[#d5d5d0] flex items-center justify-center"
                  onClick={() => setShowCreateBoard(true)}
                  title="Create board"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Boards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
            {filteredBoards.map(board => (
              <div
                key={board.id}
                className="cursor-pointer group"
                onClick={() => navigate(`/board/${board.id}`)}
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-2 relative">
                  <BoardCover board={board} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl" />
                  {board.privacy === 'secret' && (
                    <div className="absolute top-2 left-2 bg-black/50 p-1.5 rounded-full text-white">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-[15px] truncate">{board.name}</h3>
                <p className="text-xs text-gray-500">{board.pins.length} Pins</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPin && (
        <PinModal pin={selectedPin} onClose={() => setSelectedPin(null)} />
      )}

      {/* Create Board Modal */}
      {showCreateBoard && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={() => setShowCreateBoard(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-center">Create board</h2>
            <form onSubmit={handleCreateBoard}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-xinterest-focus-blue focus:border-transparent outline-none"
                  placeholder='Like "Places to Go" or "Recipes to Make"'
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <input
                  type="checkbox"
                  id="new-board-secret"
                  checked={newBoardPrivacy === 'secret'}
                  onChange={e => setNewBoardPrivacy(e.target.checked ? 'secret' : 'public')}
                  className="w-5 h-5 rounded border-gray-300 text-xinterest-red focus:ring-xinterest-red cursor-pointer"
                />
                <label htmlFor="new-board-secret" className="text-sm font-medium cursor-pointer">
                  Keep this board secret
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-full font-semibold hover:bg-gray-100"
                  onClick={() => setShowCreateBoard(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full font-semibold bg-xinterest-red text-white hover:bg-xinterest-hover disabled:opacity-50"
                  disabled={!newBoardName.trim()}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={() => setShowEditProfile(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setShowEditProfile(false)}
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center">Edit profile</h2>

            <div className="space-y-5">
              <div className="flex flex-col items-center mb-2">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img
                    src={avatarPreview || editAvatar}
                    alt="Profile"
                    className="w-[100px] h-[100px] rounded-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-2 text-sm font-semibold text-gray-600 hover:text-black"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First and last name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-xinterest-focus-blue focus:border-transparent outline-none"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-xinterest-focus-blue focus:border-transparent outline-none"
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value.replace(/\s/g, '_'))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-xinterest-focus-blue focus:border-transparent outline-none resize-none"
                  rows={3}
                  maxLength={500}
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="Tell your story"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{editBio.length}/500</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-xinterest-focus-blue focus:border-transparent outline-none"
                  value={editWebsite}
                  onChange={e => setEditWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                className="px-5 py-3 rounded-full font-semibold hover:bg-gray-100"
                onClick={() => setShowEditProfile(false)}
              >
                Reset
              </button>
              <button
                className="px-5 py-3 rounded-full font-semibold bg-xinterest-red text-white hover:bg-xinterest-hover disabled:opacity-50"
                disabled={!editName.trim()}
                onClick={handleSaveProfile}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg z-[100] text-sm font-semibold">
          Profile link copied!
        </div>
      )}
    </div>
  );
};

export default Profile;
