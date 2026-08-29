import React, { useState } from 'react';
import { Search, Edit, X } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDistanceToNow } from 'date-fns';

const MessengerDropdown = () => {
  const { state, getUser, openChatWith } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');

  const messages = state.messages || {};

  // Build conversation list from messages
  const conversations = Object.entries(messages).map(([convKey, msgs]) => {
    const userId = convKey.replace('conv_', '');
    const partner = getUser(userId);
    if (!partner) return null;
    const lastMsg = msgs[msgs.length - 1] || null;
    const unreadCount = msgs.filter(m => !m.read && m.senderId !== 'user_1').length;
    return { convKey, userId, partner, lastMsg, unreadCount };
  }).filter(Boolean);

  const filtered = conversations.filter(c =>
    !searchQuery || c.partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Users for new chat search
  const allUsers = Object.values(state.users || {}).filter(u => u.id !== state.currentUser?.id);
  const filteredNewChat = newChatSearch
    ? allUsers.filter(u => u.name.toLowerCase().includes(newChatSearch.toLowerCase()))
    : allUsers.slice(0, 5);

  return (
    <div
      className="absolute top-12 right-0 w-[360px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">{showNewChat ? 'New Message' : 'Chats'}</h3>
        <div className="flex gap-2">
          {showNewChat ? (
            <button
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              onClick={() => setShowNewChat(false)}
            >
              <X size={18} className="text-gray-700" />
            </button>
          ) : (
            <button
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              onClick={() => { setShowNewChat(true); setNewChatSearch(''); }}
            >
              <Edit size={18} className="text-gray-700" />
            </button>
          )}
        </div>
      </div>

      {showNewChat ? (
        <>
          {/* New Chat Search */}
          <div className="px-4 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search people..."
                value={newChatSearch}
                onChange={e => setNewChatSearch(e.target.value)}
                className="w-full bg-gray-100 rounded-full pl-9 pr-4 py-2 text-[15px] outline-none focus:bg-gray-200 transition-colors"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredNewChat.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => { openChatWith(user.id); setShowNewChat(false); }}
              >
                <div className="relative flex-shrink-0">
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                  {user.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[15px]">{user.name}</p>
                  {user.online && <p className="text-[13px] text-green-500">Active now</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Search */}
          <div className="px-4 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search Messenger"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 rounded-full pl-9 pr-4 py-2 text-[15px] outline-none focus:bg-gray-200 transition-colors"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="max-h-[380px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-[15px]">No conversations found</div>
            ) : (
              filtered.map(({ convKey, userId, partner, lastMsg, unreadCount }) => (
                <div
                  key={convKey}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => openChatWith(userId)}
                >
                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    <img src={partner.avatar} alt={partner.name} className="w-12 h-12 rounded-full object-cover" />
                    {partner.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-[15px] ${unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>{partner.name}</span>
                      {lastMsg && (
                        <span className="text-[12px] text-gray-500 flex-shrink-0 ml-2">
                          {formatDistanceToNow(lastMsg.timestamp, { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    {lastMsg && (
                      <p className={`text-[13px] truncate ${unreadCount > 0 ? 'font-semibold text-black' : 'text-gray-500'}`}>
                        {lastMsg.senderId === 'user_1' ? 'You: ' : ''}{lastMsg.content}
                      </p>
                    )}
                  </div>

                  {/* Unread dot */}
                  {unreadCount > 0 && (
                    <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MessengerDropdown;
