import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Camera, PenLine, Plus, MoreHorizontal, Briefcase, GraduationCap, MapPin, Heart, Calendar, X } from 'lucide-react';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import { CreateStoryModal } from '../components/StoriesCarousel';

const EditProfileModal = ({ currentUser, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: currentUser.name || '',
    bio: currentUser.bio || '',
    workplace: currentUser.workplace || '',
    education: currentUser.education || '',
    location: currentUser.location || '',
    relationship: currentUser.relationship || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              rows={3}
              placeholder="Tell people about yourself..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Workplace</label>
            <input
              type="text"
              value={form.workplace}
              onChange={e => setForm(p => ({ ...p, workplace: e.target.value }))}
              placeholder="Where do you work?"
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Education</label>
            <input
              type="text"
              value={form.education}
              onChange={e => setForm(p => ({ ...p, education: e.target.value }))}
              placeholder="Where did you study?"
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              placeholder="Where do you live?"
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Relationship Status</label>
            <select
              value={form.relationship}
              onChange={e => setForm(p => ({ ...p, relationship: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            >
              <option value="">Not specified</option>
              <option value="Single">Single</option>
              <option value="In a relationship">In a relationship</option>
              <option value="Married">Married</option>
              <option value="Engaged">Engaged</option>
              <option value="It's complicated">It's complicated</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2.5 rounded-md font-semibold hover:bg-blue-600 text-[15px]"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

const Profile = () => {
  const { currentUser, state, getUser, updateProfile } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Posts');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  const userPosts = (state.posts || []).filter(p => p.userId === currentUser.id && !p.groupId).sort((a, b) => b.timestamp - a.timestamp);
  const userPhotoPosts = userPosts.filter(p => p.type === 'photo' && p.image);
  const userVideoPosts = userPosts.filter(p => p.type === 'video');
  const friendUsers = (currentUser.friends || []).map(fid => getUser(fid)).filter(Boolean);

  const tabs = ['Posts', 'About', 'Friends', 'Photos', 'Videos', 'Check-ins'];

  return (
    <div className="bg-[#F0F2F5] min-h-screen pt-14">
      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightboxImage(null)}
          >
            <X size={32} />
          </button>
          <img
            src={lightboxImage}
            alt="Photo"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Create Story Modal */}
      {showStoryModal && (
        <CreateStoryModal onClose={() => setShowStoryModal(false)} />
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          currentUser={currentUser}
          onClose={() => setShowEditModal(false)}
          onSave={(updates) => updateProfile(updates)}
        />
      )}

      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-[1095px] mx-auto">
          {/* Cover Photo */}
          <div className="relative h-[350px] rounded-b-lg overflow-hidden bg-gray-300">
            <img src={currentUser.cover} alt="Cover" className="w-full h-full object-cover" />
            <button
              className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-md font-semibold text-sm flex items-center gap-2 hover:bg-gray-100"
              onClick={() => setShowEditModal(true)}
            >
              <Camera size={16} /> Edit cover photo
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-8 pb-4 relative">
            <div className="flex flex-col md:flex-row items-end md:items-end -mt-8 md:-mt-16 gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-[168px] h-[168px] rounded-full border-4 border-white overflow-hidden bg-white">
                  <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div
                  className="absolute bottom-2 right-2 bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-gray-300 border-2 border-white"
                  onClick={() => setShowEditModal(true)}
                >
                  <Camera size={20} />
                </div>
              </div>

              {/* Name & Friends */}
              <div className="flex-1 mb-4 text-center md:text-left">
                <h1 className="text-[32px] font-bold leading-tight">{currentUser.name}</h1>
                <span className="text-gray-500 font-semibold text-[15px]">{currentUser.friends.length} friends</span>
                <div className="flex justify-center md:justify-start -space-x-2 mt-1">
                  {currentUser.friends.map((fid) => (
                    <img key={fid} src={`https://picsum.photos/100/100?random=${fid}`} className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-4">
                <button
                  className="bg-primary text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-blue-600"
                  onClick={() => setShowStoryModal(true)}
                >
                  <Plus size={16} /> Add to story
                </button>
                <button
                  className="bg-gray-200 text-black px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-300"
                  onClick={() => setShowEditModal(true)}
                >
                  <PenLine size={16} /> Edit profile
                </button>
              </div>
            </div>

            <div className="border-t border-gray-300 mt-8"></div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mt-1 overflow-x-auto">
              {tabs.map(tab => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-semibold text-[15px] rounded-md cursor-pointer whitespace-nowrap flex-shrink-0 ${activeTab === tab ? 'text-primary border-b-[3px] border-primary rounded-b-none' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {tab}
                </div>
              ))}
              <div className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer ml-auto">
                <MoreHorizontal size={20} className="text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-[1095px] mx-auto py-4 px-4">

        {/* POSTS TAB */}
        {activeTab === 'Posts' && (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left Column */}
            <div className="w-full md:w-[40%] flex flex-col gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-bold mb-3">Intro</h2>
                <p className="text-center text-[15px] mb-4">{currentUser.bio}</p>
                <button
                  className="w-full bg-gray-200 py-2 rounded-md font-semibold text-sm hover:bg-gray-300 mb-3"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit bio
                </button>
                <div className="space-y-3">
                  {currentUser.workplace && (
                    <div className="flex items-center gap-2 text-[15px]">
                      <Briefcase size={18} className="text-gray-500" />
                      <span>Works at <strong>{currentUser.workplace}</strong></span>
                    </div>
                  )}
                  {currentUser.education && (
                    <div className="flex items-center gap-2 text-[15px]">
                      <GraduationCap size={18} className="text-gray-500" />
                      <span>Studied at <strong>{currentUser.education}</strong></span>
                    </div>
                  )}
                  {currentUser.location && (
                    <div className="flex items-center gap-2 text-[15px]">
                      <MapPin size={18} className="text-gray-500" />
                      <span>Lives in <strong>{currentUser.location}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold">Photos</h2>
                  <span
                    className="text-primary text-[15px] cursor-pointer hover:underline"
                    onClick={() => setActiveTab('Photos')}
                  >
                    See all photos
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
                  {userPhotoPosts.slice(0, 9).map((post, i) => (
                    <img
                      key={post.id}
                      src={post.image}
                      className="w-full aspect-square object-cover cursor-pointer hover:opacity-90"
                      alt="Photo"
                      onClick={() => setLightboxImage(post.image)}
                    />
                  ))}
                  {userPhotoPosts.length === 0 && [1,2,3,4,5,6].map(i => (
                    <img key={i} src={`https://picsum.photos/300/300?random=photo${i}`} className="w-full aspect-square object-cover cursor-pointer hover:opacity-90" alt="Photo" onClick={() => setLightboxImage(`https://picsum.photos/300/300?random=photo${i}`)} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Feed) */}
            <div className="w-full md:w-[60%]">
              <CreatePost />
              {userPosts.map(post => (
                <Post key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'About' && (
          <div className="max-w-[680px] mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">About</h2>
                <button
                  className="bg-gray-200 px-3 py-1.5 rounded-md font-semibold text-sm hover:bg-gray-300"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Details
                </button>
              </div>
              <div className="space-y-4">
                {currentUser.workplace && (
                  <div className="flex items-center gap-3">
                    <Briefcase size={20} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-[15px]">Works at <strong>{currentUser.workplace}</strong></p>
                    </div>
                  </div>
                )}
                {currentUser.education && (
                  <div className="flex items-center gap-3">
                    <GraduationCap size={20} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-[15px]">Studied at <strong>{currentUser.education}</strong></p>
                    </div>
                  </div>
                )}
                {currentUser.location && (
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-[15px]">Lives in <strong>{currentUser.location}</strong></p>
                    </div>
                  </div>
                )}
                {currentUser.relationship && (
                  <div className="flex items-center gap-3">
                    <Heart size={20} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-[15px]">{currentUser.relationship}</p>
                    </div>
                  </div>
                )}
                {currentUser.joinedDate && (
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-[15px]">Joined {new Date(currentUser.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FRIENDS TAB */}
        {activeTab === 'Friends' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Friends</h2>
                <p className="text-[15px] text-gray-500">{friendUsers.length} friends</p>
              </div>
            </div>
            {friendUsers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                <p>No friends yet. Add friends to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {friendUsers.map(friend => {
                  const mutual = (friend.friends || []).filter(fid => currentUser.friends.includes(fid) && fid !== friend.id).length;
                  return (
                    <div
                      key={friend.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/profile/${friend.id}`)}
                    >
                      <img src={friend.avatar} alt={friend.name} className="w-full h-32 object-cover" />
                      <div className="p-3">
                        <p className="font-semibold text-[15px]">{friend.name}</p>
                        {mutual > 0 && (
                          <p className="text-[13px] text-gray-500">{mutual} mutual {mutual === 1 ? 'friend' : 'friends'}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'Photos' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold">Photos</h2>
              <p className="text-[15px] text-gray-500">{userPhotoPosts.length} photos</p>
            </div>
            {userPhotoPosts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                <p>No photos yet. Share photos with friends and they will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 bg-white rounded-lg shadow-sm overflow-hidden p-1">
                {userPhotoPosts.map(post => (
                  <div
                    key={post.id}
                    className="aspect-square overflow-hidden cursor-pointer group relative"
                    onClick={() => setLightboxImage(post.image)}
                  >
                    <img
                      src={post.image}
                      alt="Photo"
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'Videos' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold">Videos</h2>
              <p className="text-[15px] text-gray-500">{userVideoPosts.length} videos</p>
            </div>
            {userVideoPosts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                <p className="text-[17px]">No videos to show yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {userVideoPosts.map(post => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer relative aspect-video">
                    <video src={post.video} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                      <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                        <span className="text-2xl ml-1">▶</span>
                      </div>
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-2 text-white text-xs truncate">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHECK-INS TAB */}
        {activeTab === 'Check-ins' && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500 max-w-[680px] mx-auto">
            <p className="text-[17px]">No check-ins yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
