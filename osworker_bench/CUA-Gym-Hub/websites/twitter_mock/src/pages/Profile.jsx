import React, { useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Link as LinkIcon, MapPin, X, Camera } from 'lucide-react';
import { useData } from '../context/DataContext';
import Tweet from '../components/Tweet';
import clsx from 'clsx';

export default function Profile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { state, toggleFollow, updateProfile, pinPost } = useData();
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);
  const [editBanner, setEditBanner] = useState(null);

  // File input refs
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const user = state.users.find(u => u.handle === handle);
  const isCurrentUser = user?.id === state.currentUser.id;
  const isFollowing = state.currentUser.following.includes(user?.id);

  const userTweets = useMemo(() => {
    if (!user) return [];
    return state.tweets
      .filter(t => t.userId === user.id && !t.inReplyToPostId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [state.tweets, user]);

  const userReplies = useMemo(() => {
    if (!user) return [];
    return state.tweets
      .filter(t => t.userId === user.id && t.inReplyToPostId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [state.tweets, user]);

  const userMediaPosts = useMemo(() => {
    if (!user) return [];
    return state.tweets
      .filter(t => t.userId === user.id && t.images && t.images.length > 0)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [state.tweets, user]);

  const userLikedPosts = useMemo(() => {
    if (!user) return [];
    return state.tweets
      .filter(t => (t.likes || []).includes(user.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [state.tweets, user]);

  if (!user) return <div className="p-4 text-[#0F1419]">User not found</div>;

  const pinnedPost = isCurrentUser && state.currentUser.pinnedPostId
    ? state.tweets.find(t => t.id === state.currentUser.pinnedPostId)
    : null;

  const openEditModal = () => {
    setEditName(state.currentUser.name);
    setEditBio(state.currentUser.bio);
    setEditLocation(state.currentUser.location || '');
    setEditWebsite(state.currentUser.website || '');
    setEditAvatar(null);
    setEditBanner(null);
    setShowEditModal(true);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
    // Reset file input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditBanner(ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) return; // Name is required
    if (updateProfile) {
      updateProfile({
        name: editName.trim(),
        bio: editBio,
        location: editLocation,
        website: editWebsite,
        ...(editAvatar !== null && { avatar: editAvatar }),
        ...(editBanner !== null && { banner: editBanner }),
      });
    }
    setShowEditModal(false);
  };

  const getDisplayedPosts = () => {
    switch (activeTab) {
      case 'replies': return userReplies;
      case 'media': return userMediaPosts;
      case 'likes': return userLikedPosts;
      default: return userTweets;
    }
  };

  const displayedPosts = getDisplayedPosts();
  const tabs = ['Posts', 'Replies', 'Media', 'Likes'];

  // Preview images in modal: use edited versions if set, else current user's images
  const previewBanner = editBanner || state.currentUser.banner;
  const previewAvatar = editAvatar || state.currentUser.avatar;

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-4 py-1 flex items-center gap-6 border-b border-[#EFF3F4]">
        <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-[#F7F9F9] transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#0F1419]" />
        </button>
        <div>
          <h2 className="font-extrabold text-[17px] text-[#0F1419] leading-5">{user.name}</h2>
          <span className="text-[13px] text-[#536471]">{userTweets.length} posts</span>
        </div>
      </div>

      <div className="relative">
        <div className="h-48 bg-[#CFD9DE] overflow-hidden">
          <img src={user.banner} alt="Banner" className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-16 left-4">
          <div className="w-[133px] h-[133px] rounded-full border-4 border-white overflow-hidden bg-white">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex justify-end p-4">
          {isCurrentUser ? (
            <button
              onClick={openEditModal}
              className="px-4 py-[6px] border border-[#CFD9DE] rounded-full font-bold text-[15px] text-[#0F1419] hover:bg-[#F7F9F9] transition-colors"
            >
              Edit profile
            </button>
          ) : (
            <button
              onClick={() => toggleFollow(user.id)}
              className={clsx(
                "px-4 py-[6px] rounded-full font-bold text-[15px] border transition-colors",
                isFollowing
                  ? "border-[#CFD9DE] text-[#0F1419] hover:border-[#F4212E]/50 hover:bg-[#F4212E]/10 hover:text-[#F4212E]"
                  : "bg-[#0F1419] text-white hover:bg-[#272C30] border-transparent"
              )}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-12 px-4 pb-4">
        <div className="flex items-center gap-1">
          <h2 className="font-extrabold text-xl text-[#0F1419]">{user.name}</h2>
          {user.verified && (
            <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-5 h-5 text-[#1DA1F2] fill-current">
              <g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g>
            </svg>
          )}
        </div>
        <p className="text-[15px] text-[#536471]">@{user.handle}</p>

        <p className="mt-3 text-[15px] text-[#0F1419]">{user.bio}</p>

        <div className="flex flex-wrap gap-3 mt-3 text-[#536471] text-[15px]">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-[18px] h-[18px]" />
              <span>{user.location}</span>
            </div>
          )}
          {user.website && (
            <div className="flex items-center gap-1">
              <LinkIcon className="w-[18px] h-[18px]" />
              <a href={user.website} className="text-[#1DA1F2] hover:underline" target="_blank" rel="noopener noreferrer">
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-[18px] h-[18px]" />
            <span>Joined {new Date(user.joinedDate || user.joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex gap-5 mt-3 text-[15px]">
          <span className="hover:underline cursor-pointer" onClick={() => navigate(`/profile/${user.handle}/following`)}>
            <span className="font-bold text-[#0F1419]">{user.following.length}</span>{' '}
            <span className="text-[#536471]">Following</span>
          </span>
          <span className="hover:underline cursor-pointer" onClick={() => navigate(`/profile/${user.handle}/followers`)}>
            <span className="font-bold text-[#0F1419]">{user.followers.length}</span>{' '}
            <span className="text-[#536471]">Followers</span>
          </span>
        </div>
      </div>

      {/* Profile tabs */}
      <div className="flex border-b border-[#EFF3F4]">
        {tabs.map(tab => {
          const tabKey = tab.toLowerCase();
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tab}
              className="flex-1 py-4 text-center hover:bg-[#F7F9F9] cursor-pointer transition-colors relative"
              onClick={() => setActiveTab(tabKey)}
            >
              <span className={`text-[15px] ${isActive ? 'font-bold text-[#0F1419]' : 'text-[#536471] font-medium'}`}>
                {tab}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-[3px] bg-[#1DA1F2] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Pinned post */}
      {activeTab === 'posts' && pinnedPost && (
        <div>
          <div className="flex items-center gap-2 px-4 pt-2 text-[13px] text-[#536471]">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <g><path d="M7 4.5C7 3.12 8.12 2 9.5 2h5C15.88 2 17 3.12 17 4.5v5.26L20.12 16H13v5l-1 2-1-2v-5H3.88L7 9.76V4.5z"></path></g>
            </svg>
            Pinned
          </div>
          <Tweet tweet={pinnedPost} />
        </div>
      )}

      {/* Media grid view */}
      {activeTab === 'media' ? (
        <div className="grid grid-cols-3 gap-1 p-1">
          {userMediaPosts.map(post => (
            <div
              key={post.id}
              className="aspect-square overflow-hidden cursor-pointer"
              onClick={() => navigate(`/status/${post.id}`)}
            >
              <img src={post.images[0]} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
            </div>
          ))}
          {userMediaPosts.length === 0 && (
            <div className="col-span-3 p-8 text-center text-[#536471] text-[15px]">
              No media posts yet.
            </div>
          )}
        </div>
      ) : (
        <div>
          {displayedPosts.map(tweet => (
            <Tweet key={tweet.id} tweet={tweet} />
          ))}
          {displayedPosts.length === 0 && (
            <div className="p-8 text-center text-[#536471] text-[15px]">
              {activeTab === 'posts' && 'No posts yet.'}
              {activeTab === 'replies' && 'No replies yet.'}
              {activeTab === 'likes' && 'No liked posts yet.'}
            </div>
          )}
        </div>
      )}

      {/* Hidden file inputs for image upload */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBannerFileChange}
      />

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[5%]" onClick={() => setShowEditModal(false)}>
          <div
            className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#EFF3F4]">
              <div className="flex items-center gap-6">
                <button onClick={() => setShowEditModal(false)} className="p-2 rounded-full hover:bg-[#F7F9F9] transition-colors">
                  <X className="w-5 h-5 text-[#0F1419]" />
                </button>
                <span className="font-extrabold text-[17px] text-[#0F1419]">Edit profile</span>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={!editName.trim()}
                className="bg-[#0F1419] text-white font-bold text-[15px] px-4 py-[6px] rounded-full hover:bg-[#272C30] disabled:opacity-40 transition-colors"
              >
                Save
              </button>
            </div>

            <div>
              {/* Banner */}
              <div className="relative h-48 bg-[#CFD9DE] overflow-hidden">
                <img src={previewBanner} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <button
                    className="p-3 rounded-full bg-black/50 hover:bg-black/60 transition-colors"
                    onClick={() => bannerInputRef.current && bannerInputRef.current.click()}
                    title="Change banner photo"
                    type="button"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Avatar */}
              <div className="relative -mt-16 ml-4 mb-4">
                <div className="w-[112px] h-[112px] rounded-full border-4 border-white overflow-hidden bg-white relative">
                  <img src={previewAvatar} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                    <button
                      className="p-2 rounded-full bg-black/50 hover:bg-black/60 transition-colors"
                      onClick={() => avatarInputRef.current && avatarInputRef.current.click()}
                      title="Change profile photo"
                      type="button"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="px-4 pb-6 space-y-6">
                <div className="relative">
                  <label className="absolute top-2 left-3 text-[13px] text-[#536471]">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value.slice(0, 50))}
                    className="w-full pt-6 pb-2 px-3 border border-[#CFD9DE] rounded text-[17px] text-[#0F1419] focus:outline-none focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2]"
                    maxLength={50}
                  />
                  <span className="absolute top-2 right-3 text-[13px] text-[#536471]">{editName.length}/50</span>
                </div>
                <div className="relative">
                  <label className="absolute top-2 left-3 text-[13px] text-[#536471]">Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value.slice(0, 160))}
                    className="w-full pt-6 pb-2 px-3 border border-[#CFD9DE] rounded text-[17px] text-[#0F1419] focus:outline-none focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2] resize-none"
                    rows={3}
                    maxLength={160}
                  />
                  <span className="absolute top-2 right-3 text-[13px] text-[#536471]">{editBio.length}/160</span>
                </div>
                <div className="relative">
                  <label className="absolute top-2 left-3 text-[13px] text-[#536471]">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full pt-6 pb-2 px-3 border border-[#CFD9DE] rounded text-[17px] text-[#0F1419] focus:outline-none focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2]"
                  />
                </div>
                <div className="relative">
                  <label className="absolute top-2 left-3 text-[13px] text-[#536471]">Website</label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="w-full pt-6 pb-2 px-3 border border-[#CFD9DE] rounded text-[17px] text-[#0F1419] focus:outline-none focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
