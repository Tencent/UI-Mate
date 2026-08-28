import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import { Users, Plus, X } from 'lucide-react';

const CreateGroupModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    privacy: 'public',
    category: 'General'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Create New Group</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Group Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="What is your group called?"
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What is your group about?"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Privacy</label>
            <select
              value={form.privacy}
              onChange={e => setForm(p => ({ ...p, privacy: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-primary text-[15px]"
            >
              {['General', 'Technology', 'Art', 'Photography', 'Food', 'Sports', 'Music', 'Travel', 'Education', 'Business'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!form.name.trim()}
            className="w-full bg-primary text-white py-2.5 rounded-md font-semibold hover:bg-blue-600 text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

const Groups = () => {
  const { state, getUser, createGroup, currentUser } = useApp();
  const navigate = useNavigate();
  const [groupSearch, setGroupSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const groups = state.groups || [];
  const filteredGroups = groups.filter(g => !groupSearch || g.name.toLowerCase().includes(groupSearch.toLowerCase()));
  const groupPosts = state.posts.filter(p => p.groupId).sort((a, b) => b.timestamp - a.timestamp);

  const handleCreateGroup = (form) => {
    const newGroup = {
      id: `group_${Date.now()}`,
      name: form.name,
      description: form.description || '',
      cover: `https://picsum.photos/1200/400?random=group_${Date.now()}`,
      members: [currentUser.id],
      posts: [],
      privacy: form.privacy,
      category: form.category,
      createdBy: currentUser.id
    };
    createGroup(newGroup);
    navigate(`/groups/${newGroup.id}`);
  };

  return (
    <div className="bg-[#F0F2F5] min-h-screen pt-14 flex">
      {/* Sidebar */}
      <div className="w-[360px] bg-white h-[calc(100vh-56px)] fixed left-0 overflow-y-auto p-4 shadow-sm hidden lg:block">
        <h2 className="text-2xl font-bold mb-4">Groups</h2>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search groups"
            value={groupSearch}
            onChange={e => setGroupSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-full px-4 py-2 outline-none text-[15px]"
          />
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-primary text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 text-[15px] mb-4"
        >
          <Plus size={18} /> Create New Group
        </button>

        <h3 className="font-semibold text-[17px] mb-2">Your Groups</h3>
        {filteredGroups.map(group => (
          <div
            key={group.id}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            <img src={group.cover} alt={group.name} className="w-12 h-12 rounded-lg object-cover" />
            <div>
              <h4 className="font-semibold text-[15px]">{group.name}</h4>
              <span className="text-xs text-gray-500">Last active 2 hours ago</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Feed */}
      <div className="flex-1 lg:ml-[360px] p-4 flex justify-center">
        <div className="w-full max-w-[680px]">
          <h2 className="text-xl font-bold mb-4 lg:hidden">Groups</h2>

          {/* Group Suggestions */}
          <div className="mb-6 overflow-x-auto pb-2 hide-scrollbar">
             <div className="flex gap-3 w-max">
               {groups.map(group => (
                 <div key={group.id} className="w-[300px] bg-white rounded-lg shadow-sm overflow-hidden flex-shrink-0">
                   <img src={group.cover} alt={group.name} className="w-full h-32 object-cover" />
                   <div className="p-3">
                     <h3 className="font-bold text-[17px] mb-1">{group.name}</h3>
                     <p className="text-sm text-gray-500 mb-3 line-clamp-2">{group.description}</p>
                     <button
                       className="w-full bg-gray-200 text-black font-semibold py-2 rounded-md hover:bg-gray-300"
                       onClick={() => navigate(`/groups/${group.id}`)}
                     >
                       Visit Group
                     </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary">
                 <Users size={24} />
               </div>
               <div>
                 <h3 className="font-semibold">Group Activity</h3>
                 <p className="text-sm text-gray-500">Recent posts from your groups</p>
               </div>
             </div>
          </div>

          <CreatePost />

          {groupPosts.length > 0 ? (
            groupPosts.map(post => {
              const postWithGroup = { ...post, authorName: getUser(post.userId)?.name };
              return <Post key={post.id} post={postWithGroup} />;
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent group posts. Join more groups to see activity here!
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGroup}
        />
      )}
    </div>
  );
};

export default Groups;
