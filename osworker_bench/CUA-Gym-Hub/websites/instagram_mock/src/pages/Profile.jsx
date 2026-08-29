import React, { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Settings, Grid, Bookmark, User as UserIcon, Heart, MessageCircle, X, Camera, ChevronDown } from 'lucide-react';
import PostDetailModal from '../components/PostDetailModal';
import UserListModal from '../components/UserListModal';
import { CURRENT_USER_ID, getSessionId } from '../utils/mockData';

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [website, setWebsite] = useState(user.website || '');
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = () => {
    onSave({ name, username, website, bio, avatar });
    onClose();
  };

  const handleChangePhoto = async (event) => {
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
      setAvatar(uploaded.url);
    } catch (error) {
      setUploadError(error.message || 'Could not upload profile photo');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#EFEFEF]">
          <button onClick={onClose} className="text-sm">Cancel</button>
          <h2 className="font-bold text-base">Edit profile</h2>
          <button onClick={handleSubmit} className="text-[#0095F6] font-bold text-sm">Done</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover" />
            </div>
            <div>
              <div className="font-semibold text-sm">{user.username}</div>
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="text-[#0095F6] text-sm font-semibold hover:text-[#00376B] transition-colors disabled:opacity-50">
                {isUploading ? 'Uploading...' : 'Change profile photo'}
              </button>
              {uploadError && <p className="text-xs text-[#ED4956] mt-1">{uploadError}</p>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChangePhoto}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#8E8E8E] block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              className="w-full border border-[#DBDBDB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A8A8A8] transition-colors"
              maxLength={30}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#8E8E8E] block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 30))}
              className="w-full border border-[#DBDBDB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A8A8A8] transition-colors"
              maxLength={30}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#8E8E8E] block mb-1">Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full border border-[#DBDBDB] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A8A8A8] transition-colors"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#8E8E8E] block mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 150))}
              className="w-full border border-[#DBDBDB] rounded-lg px-3 py-2 text-sm outline-none resize-none h-20 focus:border-[#A8A8A8] transition-colors"
              maxLength={150}
            />
            <div className="text-xs text-[#C7C7C7] text-right mt-0.5">{bio.length}/150</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { username } = useParams();
  const { users, getUserPosts, currentUser, toggleFollow, getSavedPosts, updateUserProfile, getTaggedPosts } = useData();
  const [selectedPost, setSelectedPost] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const profileUser = Object.values(users).find(u => u.username === username);

  if (!profileUser) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#262626]">
      <h2 className="text-2xl font-semibold mb-2">Sorry, this page isn't available.</h2>
      <p className="text-sm text-[#8E8E8E]">The link you followed may be broken, or the page may have been removed.</p>
      <Link to="/" className="text-[#0095F6] mt-4 text-sm font-semibold">Go back to Xnstagram.</Link>
    </div>
  );

  const posts = getUserPosts(profileUser.id);
  const savedPosts = getSavedPosts();
  const taggedPosts = getTaggedPosts ? getTaggedPosts(profileUser.id) : [];
  const isOwnProfile = currentUser.id === profileUser.id;
  const isFollowing = currentUser.following.includes(profileUser.id);

  const displayPosts = activeTab === 'saved' ? savedPosts : activeTab === 'tagged' ? taggedPosts : posts;

  const handleEditSave = (updates) => {
    updateUserProfile(updates);
  };

  const formatCount = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 10000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  return (
    <div className="max-w-[935px] mx-auto pt-8 px-4 md:px-5 pb-16 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-0 mb-10">
        {/* Avatar */}
        <div className="md:w-[290px] flex justify-center flex-shrink-0">
          <div className="relative group">
            <div className="p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <div className="p-[3px] bg-white rounded-full">
                <img
                  src={profileUser.avatar}
                  alt={profileUser.username}
                  className="w-[77px] h-[77px] md:w-[150px] md:h-[150px] rounded-full object-cover"
                />
              </div>
            </div>
            {isOwnProfile && (
              <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          {/* Username row */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-normal">{profileUser.username}</h2>
              {profileUser.isVerified && (
                <svg className="w-5 h-5 text-[#0095F6]" viewBox="0 0 40 40" fill="currentColor">
                  <path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094zM18.37 27.04l-6.77-6.77 2.83-2.83 3.94 3.94 8.52-8.52 2.83 2.83L18.37 27.04z"/>
                </svg>
              )}
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="ig-btn-secondary text-sm"
                  >
                    Edit profile
                  </button>
                  <button onClick={() => setShowArchiveModal(true)} className="ig-btn-secondary text-sm">
                    View archive
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleFollow(profileUser.id)}
                    className={`text-sm font-semibold px-6 py-1.5 rounded-lg transition-colors ${
                      isFollowing
                        ? 'bg-[#EFEFEF] text-[#262626] hover:bg-[#DBDBDB]'
                        : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <Link to="/direct/inbox" className="ig-btn-secondary text-sm">
                    Message
                  </Link>
                </>
              )}
              <button onClick={() => setShowSettingsModal(true)} className="p-2 hover:opacity-50 transition-opacity">
                <Settings className="w-6 h-6 text-[#262626]" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-around md:justify-start md:gap-10 border-t md:border-none py-3 md:py-0 border-[#EFEFEF] -mx-4 md:mx-0 px-4 md:px-0">
            <div className="text-center md:text-left text-sm">
              <span className="font-semibold">{formatCount(posts.length)}</span>
              <span className="text-[#262626]"> posts</span>
            </div>
            <button
              onClick={() => setShowFollowers(true)}
              className="text-center md:text-left text-sm hover:opacity-60 transition-opacity"
            >
              <span className="font-semibold">{formatCount(profileUser.followers.length)}</span>
              <span className="text-[#262626]"> followers</span>
            </button>
            <button
              onClick={() => setShowFollowing(true)}
              className="text-center md:text-left text-sm hover:opacity-60 transition-opacity"
            >
              <span className="font-semibold">{formatCount(profileUser.following.length)}</span>
              <span className="text-[#262626]"> following</span>
            </button>
          </div>

          {/* Bio */}
          <div className="hidden md:block">
            <div className="font-semibold text-sm">{profileUser.name}</div>
            <div className="whitespace-pre-wrap text-sm mt-0.5 leading-relaxed">{profileUser.bio}</div>
            {profileUser.website && (
              <a href={profileUser.website} className="text-[#00376B] font-semibold text-sm mt-1 block hover:underline" target="_blank" rel="noopener noreferrer">
                {profileUser.website.replace('https://', '')}
              </a>
            )}
          </div>
        </div>

        {/* Mobile Bio */}
        <div className="md:hidden w-full -mt-4">
          <div className="font-semibold text-sm">{profileUser.name}</div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{profileUser.bio}</div>
          {profileUser.website && (
            <a href={profileUser.website} className="text-[#00376B] font-semibold text-sm" target="_blank" rel="noopener noreferrer">
              {profileUser.website.replace('https://', '')}
            </a>
          )}
        </div>
      </div>

      {/* Story Highlights */}
      <div className="mb-4 flex gap-6 overflow-x-auto no-scrollbar px-4 md:px-0">
        {['Travel', 'Food', 'Pets', 'Work'].map((label, i) => {
          const cover = posts.length ? posts[i % posts.length]?.images?.[0] : null;
          return (
            <div key={label} className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer">
              <div className="w-[77px] h-[77px] rounded-full border border-[#DBDBDB] flex items-center justify-center bg-[#FAFAFA] overflow-hidden">
                {cover ? (
                  <img src={cover} alt={label} className="w-[67px] h-[67px] rounded-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-[67px] h-[67px] rounded-full bg-[#EFEFEF]" />
                )}
              </div>
              <span className="text-xs font-semibold text-[#262626] truncate max-w-[70px]">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-t border-[#DBDBDB] flex justify-center gap-14">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-1.5 py-3 -mt-px border-t transition-colors ${activeTab === 'posts' ? 'border-[#262626] text-[#262626]' : 'border-transparent text-[#8E8E8E]'}`}
        >
          <Grid className="w-3 h-3" />
          <span className="text-xs font-semibold tracking-widest uppercase">Posts</span>
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 py-3 -mt-px border-t transition-colors ${activeTab === 'saved' ? 'border-[#262626] text-[#262626]' : 'border-transparent text-[#8E8E8E]'}`}
          >
            <Bookmark className="w-3 h-3" />
            <span className="text-xs font-semibold tracking-widest uppercase">Saved</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('tagged')}
          className={`flex items-center gap-1.5 py-3 -mt-px border-t transition-colors ${activeTab === 'tagged' ? 'border-[#262626] text-[#262626]' : 'border-transparent text-[#8E8E8E]'}`}
        >
          <UserIcon className="w-3 h-3" />
          <span className="text-xs font-semibold tracking-widest uppercase">Tagged</span>
        </button>
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-1 mb-10">
        {displayPosts.map(post => (
          <div
            key={post.id}
            className="relative aspect-square group cursor-pointer bg-[#EFEFEF] overflow-hidden"
            onClick={() => setSelectedPost(post)}
          >
            <img
              src={post.images[0]}
              alt="Post"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white font-bold text-sm">
              <div className="flex items-center gap-1.5">
                <Heart className="fill-white w-5 h-5" />
                <span>{post.likes.length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="fill-white w-5 h-5" />
                <span>{post.comments.length}</span>
              </div>
            </div>
            {post.images.length > 1 && (
              <div className="absolute top-2 right-2 pointer-events-none">
                <svg className="w-5 h-5 text-white drop-shadow" viewBox="0 0 48 48" fill="currentColor">
                  <path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2-.1-1.2.6z"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {displayPosts.length === 0 && (
        <div className="text-center py-16 text-[#8E8E8E]">
          {activeTab === 'saved' ? (
            <>
              <Bookmark className="w-16 h-16 mx-auto mb-4 stroke-[0.5]" />
              <h3 className="text-2xl font-light text-[#262626] mb-2">Save</h3>
              <p className="text-sm">Save photos and videos that you want to see again. No one is notified, and only you can see what you've saved.</p>
            </>
          ) : activeTab === 'tagged' ? (
            <>
              <UserIcon className="w-16 h-16 mx-auto mb-4 stroke-[0.5]" />
              <h3 className="text-2xl font-light text-[#262626] mb-2">Photos of you</h3>
              <p className="text-sm">When people tag you in photos, they'll appear here.</p>
            </>
          ) : isOwnProfile ? (
            <>
              <Camera className="w-16 h-16 mx-auto mb-4 stroke-[0.5]" />
              <h3 className="text-3xl font-extrabold text-[#262626] mb-2">Share Photos</h3>
              <p className="text-sm">When you share photos, they will appear on your profile.</p>
            </>
          ) : (
            <>
              <Camera className="w-16 h-16 mx-auto mb-4 stroke-[0.5]" />
              <h3 className="text-2xl font-light text-[#262626] mb-2">No Posts Yet</h3>
            </>
          )}
        </div>
      )}

      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      {showFollowers && (
        <UserListModal
          title="Followers"
          userIds={profileUser.followers}
          onClose={() => setShowFollowers(false)}
        />
      )}

      {showFollowing && (
        <UserListModal
          title="Following"
          userIds={profileUser.following}
          onClose={() => setShowFollowing(false)}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}

      {showArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onClick={() => setShowArchiveModal(false)}>
          <div className="bg-white w-full max-w-md rounded-xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#EFEFEF]">
              <button onClick={() => setShowArchiveModal(false)}><X className="w-5 h-5" /></button>
              <h2 className="font-bold text-base">Archive</h2>
              <div className="w-5" />
            </div>
            <div className="p-4 space-y-3">
              {posts.slice(0, 3).map(post => (
                <button key={post.id} onClick={() => { setSelectedPost(post); setShowArchiveModal(false); }} className="flex items-center gap-3 w-full text-left hover:bg-[#FAFAFA] rounded-lg p-2">
                  <img src={post.images[0]} alt="Archived post" className="w-14 h-14 object-cover rounded" />
                  <div>
                    <div className="text-sm font-semibold">Post archive</div>
                    <div className="text-xs text-[#8E8E8E] line-clamp-1">{post.caption || 'No caption'}</div>
                  </div>
                </button>
              ))}
              {posts.length === 0 && <p className="text-sm text-[#8E8E8E] text-center py-8">No archived posts yet.</p>}
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-white w-full max-w-md rounded-xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#EFEFEF]">
              <button onClick={() => setShowSettingsModal(false)}><X className="w-5 h-5" /></button>
              <h2 className="font-bold text-base">Settings and activity</h2>
              <div className="w-5" />
            </div>
            <div className="divide-y divide-[#EFEFEF]">
              <button onClick={() => { setShowSettingsModal(false); setShowEditModal(true); }} className="w-full px-4 py-3 text-left text-sm hover:bg-[#FAFAFA]">Account center</button>
              <button onClick={() => { setActiveTab('saved'); setShowSettingsModal(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-[#FAFAFA]">Saved</button>
              <button onClick={() => { setShowArchiveModal(true); setShowSettingsModal(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-[#FAFAFA]">Archive</button>
              <button onClick={() => setShowSettingsModal(false)} className="w-full px-4 py-3 text-left text-sm text-[#ED4956] hover:bg-[#FAFAFA]">Close settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
