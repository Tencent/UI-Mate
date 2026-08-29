import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Users, Lock, Globe, MoreHorizontal, Plus, X, Shield, Search } from 'lucide-react';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';

const GroupDetail = () => {
  const { groupId } = useParams();
  const { state, getGroup, getUser, currentUser, joinGroup, leaveGroup } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Discussion');
  const [showJoinedMenu, setShowJoinedMenu] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const group = getGroup(groupId);

  if (!group) {
    return (
      <div className="bg-[#F0F2F5] min-h-screen pt-14 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-600">Group not found</p>
          <button onClick={() => navigate('/groups')} className="mt-3 text-primary hover:underline text-[15px]">
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  const groupPosts = (state.posts || []).filter(p => p.groupId === groupId).sort((a, b) => b.timestamp - a.timestamp);
  const memberUsers = (group.members || []).map(id => getUser(id)).filter(Boolean);
  const isMember = (group.members || []).includes(currentUser.id);
  const isAdmin = group.createdBy === currentUser.id || group.adminId === currentUser.id;

  const filteredMembers = memberSearch
    ? memberUsers.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
    : memberUsers;

  const tabs = ['Discussion', 'Members', 'About', 'Media', 'Events'];

  const handleJoin = () => {
    joinGroup(groupId);
  };

  const handleLeave = () => {
    leaveGroup(groupId);
    setShowJoinedMenu(false);
  };

  return (
    <div className="bg-[#F0F2F5] min-h-screen pt-14">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-[1095px] mx-auto">
          {/* Cover */}
          <div className="relative h-[300px] rounded-b-lg overflow-hidden bg-gray-300">
            <img src={group.cover} alt={group.name} className="w-full h-full object-cover" />
          </div>

          <div className="px-6 pb-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4 mt-4">
              <div className="flex-1">
                <h1 className="text-[28px] font-bold">{group.name}</h1>
                <div className="flex items-center gap-2 text-gray-500 text-[15px] mt-1">
                  {(group.privacy === 'public' || group.privacy === 'Public') ? <Globe size={16} /> : <Lock size={16} />}
                  <span className="capitalize">{group.privacy || 'Public'} group</span>
                  <span>·</span>
                  <Users size={16} />
                  <span>{group.members.length} {group.members.length === 1 ? 'member' : 'members'}</span>
                  {group.category && (
                    <>
                      <span>·</span>
                      <span>{group.category}</span>
                    </>
                  )}
                </div>
                {/* Member avatars preview */}
                <div className="flex -space-x-2 mt-2">
                  {memberUsers.slice(0, 8).map(m => (
                    <img key={m.id} src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full border-2 border-white object-cover" title={m.name} />
                  ))}
                  {memberUsers.length > 8 && (
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600">
                      +{memberUsers.length - 8}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pb-2">
                {isMember ? (
                  <div className="relative">
                    <button
                      className="bg-gray-200 text-black px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-gray-300"
                      onClick={() => setShowJoinedMenu(!showJoinedMenu)}
                    >
                      <Users size={16} /> Joined
                    </button>
                    {showJoinedMenu && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-[15px] text-red-500 font-medium"
                          onClick={handleLeave}
                        >
                          Leave Group
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="bg-primary text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-blue-600" onClick={handleJoin}>
                    <Plus size={16} /> Join Group
                  </button>
                )}
                <button
                  className="bg-gray-200 text-black px-3 py-2 rounded-md hover:bg-gray-300"
                  title="Share group"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-300 mt-4"></div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mt-1 overflow-x-auto">
              {tabs.map(tab => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-semibold text-[15px] rounded-md cursor-pointer whitespace-nowrap ${activeTab === tab ? 'text-primary border-b-[3px] border-primary rounded-b-none' : 'text-gray-500 hover:bg-gray-100'}`}
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

        {/* DISCUSSION TAB */}
        {activeTab === 'Discussion' && (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left */}
            <div className="w-full md:w-[40%] flex flex-col gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-bold mb-3">About</h2>
                <p className="text-[15px] text-gray-700 mb-4">{group.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[15px]">
                    {(group.privacy === 'public' || group.privacy === 'Public') ? <Globe size={18} className="text-gray-500" /> : <Lock size={18} className="text-gray-500" />}
                    <div>
                      <p className="font-semibold capitalize">{group.privacy || 'Public'}</p>
                      <p className="text-xs text-gray-500">
                        {(group.privacy === 'public' || group.privacy === 'Public')
                          ? "Anyone can see who's in the group and what they post."
                          : 'Only members can see who is in the group and what they post.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[15px]">
                    <Users size={18} className="text-gray-500" />
                    <div>
                      <p className="font-semibold">{group.members.length} {group.members.length === 1 ? 'member' : 'members'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Members Preview */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold">Members</h2>
                  <span className="text-primary text-[15px] cursor-pointer hover:underline" onClick={() => setActiveTab('Members')}>See all</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {memberUsers.slice(0, 9).map(member => (
                    <div
                      key={member.id}
                      className="text-center cursor-pointer group"
                      onClick={() => navigate(member.id === currentUser.id ? '/profile' : `/profile/${member.id}`)}
                    >
                      <img src={member.avatar} alt={member.name} className="w-full aspect-square rounded-md object-cover mb-1 group-hover:opacity-90" />
                      <p className="text-xs font-semibold truncate">{member.name.split(' ')[0]}</p>
                      {(group.createdBy === member.id || group.adminId === member.id) && (
                        <p className="text-[10px] text-primary font-semibold">Admin</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="w-full md:w-[60%]">
              {isMember && <CreatePost groupId={groupId} />}
              {groupPosts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                  <p className="text-[17px]">No posts yet. Be the first to post!</p>
                </div>
              ) : (
                groupPosts.map(post => <Post key={post.id} post={post} />)
              )}
            </div>
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'Members' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold">Members</h2>
                  <p className="text-[15px] text-gray-500">{memberUsers.length} members</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Find a member"
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  className="w-full bg-gray-100 rounded-full pl-9 pr-4 py-2 text-[15px] outline-none"
                />
              </div>
            </div>

            {/* Admins */}
            {filteredMembers.filter(m => group.createdBy === m.id || group.adminId === m.id).length > 0 && (
              <div className="mb-4">
                <h3 className="text-[17px] font-bold mb-3 px-1">Admins & moderators</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredMembers.filter(m => group.createdBy === m.id || group.adminId === m.id).map(member => (
                    <div
                      key={member.id}
                      className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(member.id === currentUser.id ? '/profile' : `/profile/${member.id}`)}
                    >
                      <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-[15px]">{member.name}</p>
                        <div className="flex items-center gap-1 text-xs text-primary font-semibold">
                          <Shield size={12} />
                          <span>Admin</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Members */}
            <h3 className="text-[17px] font-bold mb-3 px-1">Members</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredMembers.filter(m => group.createdBy !== m.id && group.adminId !== m.id).map(member => (
                <div
                  key={member.id}
                  className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(member.id === currentUser.id ? '/profile' : `/profile/${member.id}`)}
                >
                  <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-[15px]">{member.name}</p>
                    {member.location && <p className="text-[13px] text-gray-500">{member.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'About' && (
          <div className="max-w-[680px] mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">About this group</h2>
              <p className="text-[15px] text-gray-700 mb-6">{group.description}</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {(group.privacy === 'public' || group.privacy === 'Public') ? <Globe size={20} className="text-gray-500" /> : <Lock size={20} className="text-gray-500" />}
                  <div>
                    <p className="font-semibold text-[15px] capitalize">{group.privacy || 'Public'}</p>
                    <p className="text-[13px] text-gray-500">
                      {(group.privacy === 'public' || group.privacy === 'Public')
                        ? "Anyone can see who's in the group and what they post."
                        : 'Only members can see who is in the group and what they post.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-gray-500" />
                  <div>
                    <p className="font-semibold text-[15px]">{group.members.length} members</p>
                  </div>
                </div>
                {group.category && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 text-gray-500 flex items-center justify-center text-sm">#</div>
                    <div>
                      <p className="font-semibold text-[15px]">{group.category}</p>
                      <p className="text-[13px] text-gray-500">Category</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MEDIA TAB */}
        {activeTab === 'Media' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold">Media</h2>
            </div>
            {groupPosts.filter(p => p.image).length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                <p>No media yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 bg-white rounded-lg shadow-sm overflow-hidden p-1">
                {groupPosts.filter(p => p.image).map(post => (
                  <div key={post.id} className="aspect-square overflow-hidden cursor-pointer">
                    <img src={post.image} alt="Media" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'Events' && (
          <div className="max-w-[680px] mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              <p className="text-[17px]">No events yet for this group.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
