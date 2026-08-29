import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { UserPlus, UserCheck, UserMinus, MessageCircle, MoreHorizontal, Briefcase, GraduationCap, MapPin, Heart, Calendar, Flag, EyeOff } from 'lucide-react';
import Post from '../components/Post';

const UserProfile = () => {
  const { userId } = useParams();
  const { state, currentUser, getUser, sendFriendRequest, unfriend, openChatWith } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Posts');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const user = getUser(userId);

  if (!user) {
    return (
      <div className="bg-[#F0F2F5] min-h-screen pt-14 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-600">User not found</p>
          <button onClick={() => navigate(-1)} className="mt-3 text-primary hover:underline text-[15px]">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const isFriend = currentUser?.friends?.includes(userId);
  const hasRequested = (state.outgoingFriendRequests || []).includes(userId);
  const userPosts = (state.posts || []).filter(p => p.userId === userId && !p.groupId).sort((a, b) => b.timestamp - a.timestamp);
  const userPhotoPosts = userPosts.filter(p => p.type === 'photo' && p.image);
  const friendUsers = (user.friends || []).map(fid => getUser(fid)).filter(Boolean);
  const mutualFriends = (user.friends || []).filter(fid => currentUser?.friends?.includes(fid));

  const tabs = ['Posts', 'About', 'Friends', 'Photos'];

  const handleFriendAction = () => {
    if (isFriend) {
      unfriend(userId);
    } else if (!hasRequested) {
      sendFriendRequest(userId);
    }
  };

  return (
    <div className="bg-[#F0F2F5] min-h-screen pt-14">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-[1095px] mx-auto">
          {/* Cover Photo */}
          <div className="relative h-[350px] rounded-b-lg overflow-hidden bg-gray-300">
            <img src={user.cover} alt="Cover" className="w-full h-full object-cover" />
          </div>

          {/* Profile Info */}
          <div className="px-8 pb-4 relative">
            <div className="flex flex-col md:flex-row items-end md:items-end -mt-8 md:-mt-16 gap-4">
              {/* Avatar */}
              <div className="w-[168px] h-[168px] rounded-full border-4 border-white overflow-hidden bg-white flex-shrink-0">
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>

              {/* Name & Friends */}
              <div className="flex-1 mb-4 text-center md:text-left">
                <h1 className="text-[32px] font-bold leading-tight">{user.name}</h1>
                <p className="text-gray-500 text-[15px] mt-1">{user.bio}</p>
                {mutualFriends.length > 0 && (
                  <p className="text-[13px] text-gray-500 mt-1">
                    {mutualFriends.length} mutual {mutualFriends.length === 1 ? 'friend' : 'friends'}
                  </p>
                )}
                <div className="flex justify-center md:justify-start -space-x-2 mt-1">
                  {friendUsers.slice(0, 5).map(f => (
                    <img key={f.id} src={f.avatar} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt={f.name} />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-4">
                {isFriend ? (
                  <button
                    className="bg-gray-200 text-black px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-300"
                    onClick={handleFriendAction}
                    title="Unfriend"
                  >
                    <UserCheck size={16} /> Friends
                  </button>
                ) : hasRequested ? (
                  <button
                    className="bg-gray-200 text-black px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-300"
                    disabled
                  >
                    <UserPlus size={16} /> Request Sent
                  </button>
                ) : (
                  <button
                    className="bg-primary text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-blue-600"
                    onClick={handleFriendAction}
                  >
                    <UserPlus size={16} /> Add Friend
                  </button>
                )}
                <button
                  className="bg-gray-200 text-black px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-300"
                  onClick={() => openChatWith(userId)}
                >
                  <MessageCircle size={16} /> Message
                </button>
                <div className="relative" ref={moreMenuRef}>
                  <button
                    className="bg-gray-200 text-black p-2 rounded-md font-semibold hover:bg-gray-300"
                    onClick={() => setShowMoreMenu(v => !v)}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] hover:bg-gray-100 text-left"
                        onClick={() => { unfriend(userId); setShowMoreMenu(false); }}
                      >
                        <UserMinus size={18} className="text-gray-600" />
                        <span>{isFriend ? 'Unfriend' : 'Block'}</span>
                      </button>
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] hover:bg-gray-100 text-left"
                        onClick={() => setShowMoreMenu(false)}
                      >
                        <EyeOff size={18} className="text-gray-600" />
                        <span>Unfollow {user.name.split(' ')[0]}</span>
                      </button>
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] hover:bg-gray-100 text-left text-red-500"
                        onClick={() => setShowMoreMenu(false)}
                      >
                        <Flag size={18} />
                        <span>Report profile</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-300 mt-8"></div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mt-1">
              {tabs.map(tab => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-semibold text-[15px] rounded-md cursor-pointer ${activeTab === tab ? 'text-primary border-b-[3px] border-primary rounded-b-none' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1095px] mx-auto py-4 px-4">

        {/* POSTS TAB */}
        {activeTab === 'Posts' && (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left Column - Intro */}
            <div className="w-full md:w-[40%] flex flex-col gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-bold mb-3">Intro</h2>
                <p className="text-center text-[15px] mb-4">{user.bio}</p>
                <div className="space-y-3">
                  {user.workplace && (
                    <div className="flex items-center gap-2 text-[15px]">
                      <Briefcase size={18} className="text-gray-500 flex-shrink-0" />
                      <span>Works at <strong>{user.workplace}</strong></span>
                    </div>
                  )}
                  {user.education && (
                    <div className="flex items-center gap-2 text-[15px]">
                      <GraduationCap size={18} className="text-gray-500 flex-shrink-0" />
                      <span>Studied at <strong>{user.education}</strong></span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-2 text-[15px]">
                      <MapPin size={18} className="text-gray-500 flex-shrink-0" />
                      <span>Lives in <strong>{user.location}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full md:w-[60%]">
              {userPosts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                  <p className="text-[17px]">No posts yet</p>
                </div>
              ) : (
                userPosts.map(post => <Post key={post.id} post={post} />)
              )}
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'About' && (
          <div className="max-w-[680px] mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">About {user.name.split(' ')[0]}</h2>
              <div className="space-y-4">
                {user.workplace && (
                  <div className="flex items-center gap-3">
                    <Briefcase size={20} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-[15px]">Works at <strong>{user.workplace}</strong></p>
                    </div>
                  </div>
                )}
                {user.education && (
                  <div className="flex items-center gap-3">
                    <GraduationCap size={20} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-[15px]">Studied at <strong>{user.education}</strong></p>
                    </div>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-[15px]">Lives in <strong>{user.location}</strong></p>
                    </div>
                  </div>
                )}
                {user.relationship && (
                  <div className="flex items-center gap-3">
                    <Heart size={20} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-[15px]">{user.relationship}</p>
                    </div>
                  </div>
                )}
                {user.joinedDate && (
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-[15px]">Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
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
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold">{user.name.split(' ')[0]}'s Friends</h2>
              <p className="text-[15px] text-gray-500">{friendUsers.length} friends</p>
            </div>
            {friendUsers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                <p>No friends to show</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {friendUsers.map(friend => {
                  const mutual = (friend.friends || []).filter(fid => currentUser?.friends?.includes(fid)).length;
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
                <p>No photos to show</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 bg-white rounded-lg shadow-sm overflow-hidden p-1">
                {userPhotoPosts.map(post => (
                  <div key={post.id} className="aspect-square overflow-hidden cursor-pointer">
                    <img
                      src={post.image}
                      alt="Photo"
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
