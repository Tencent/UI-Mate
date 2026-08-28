import React, { useState } from 'react';
import { Video, Search, MoreHorizontal, X } from 'lucide-react';
import { useApp } from '../store/AppContext';

const Rightbar = () => {
  const { state, openChatWith } = useApp();
  const [contactSearch, setContactSearch] = useState(false);
  const [contactQuery, setContactQuery] = useState('');
  const allFriends = Object.values(state.users).filter(u => u.id !== state.currentUser.id);
  const friends = contactQuery
    ? allFriends.filter(f => f.name.toLowerCase().includes(contactQuery.toLowerCase()))
    : allFriends;

  return (
    <div className="hidden xl:block w-[360px] h-screen fixed right-0 top-14 pt-4 px-2 overflow-y-auto pb-20">
      <div className="mb-4">
        <h3 className="text-gray-500 font-semibold text-[17px] mb-2 px-2">Sponsored</h3>
        <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
          <img src="https://picsum.photos/120/120?random=ad1" alt="Ad" className="w-[120px] h-[120px] rounded-lg object-cover" />
          <div className="flex flex-col justify-center">
            <span className="font-semibold text-[15px]">Premium Coffee</span>
            <span className="text-xs text-gray-500">bestcoffee.com</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
          <img src="https://picsum.photos/120/120?random=ad2" alt="Ad" className="w-[120px] h-[120px] rounded-lg object-cover" />
          <div className="flex flex-col justify-center">
            <span className="font-semibold text-[15px]">Learn React Fast</span>
            <span className="text-xs text-gray-500">reactmastery.io</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 my-2 mx-2"></div>

      <div className="px-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-500 font-semibold text-[17px]">Contacts</h3>
          <div className="flex gap-2 text-gray-500">
            <Video size={16} className="cursor-pointer hover:text-gray-700" title="Create room" />
            <Search
              size={16}
              className="cursor-pointer hover:text-gray-700"
              onClick={() => { setContactSearch(v => !v); setContactQuery(''); }}
              title="Search contacts"
            />
            <MoreHorizontal size={16} className="cursor-pointer hover:text-gray-700" title="Options" />
          </div>
        </div>

        {contactSearch && (
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="Search contacts..."
              value={contactQuery}
              onChange={e => setContactQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-full pl-3 pr-8 py-1.5 text-[13px] outline-none"
              autoFocus
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => { setContactSearch(false); setContactQuery(''); }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {friends.map(friend => (
          <div
            key={friend.id}
            className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
            onClick={() => openChatWith(friend.id)}
          >
            <div className="relative">
              <img src={friend.avatar} alt={friend.name} className="w-9 h-9 rounded-full object-cover" />
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${friend.online ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white`}></div>
            </div>
            <span className="font-medium text-[15px]">{friend.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rightbar;