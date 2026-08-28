import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, MoreHorizontal, Edit, Image, Paperclip, Send, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function formatChatTimestamp(messages) {
  if (!messages || messages.length === 0) return '';
  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || !lastMsg.created) return '';
  try {
    return formatDistanceToNow(new Date(lastMsg.created), { addSuffix: false });
  } catch {
    return '';
  }
}

export default function Messaging() {
  const { state, sendMessage, createChat, deleteChat } = useStore();
  const navigate = useNavigate();
  const [activeChatId, setActiveChatId] = useState(state.chats[0]?.id);
  const [messageText, setMessageText] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatListMenu, setShowChatListMenu] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const fileInputRef = useRef(null);

  const activeChat = state.chats.find(c => c.id === activeChatId);
  const otherParticipantId = activeChat?.participants.find(id => id !== state.currentUser.id);
  const otherParticipant = state.users[otherParticipantId] || { name: 'Unknown User', avatar: '' };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(activeChatId, messageText);
    setMessageText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (messageText.trim()) {
        sendMessage(activeChatId, messageText);
        setMessageText('');
      }
    }
  };

  // Connections who the user can message
  const connections = state.currentUser.connections
    .map(cId => state.users[cId])
    .filter(Boolean);

  const handleNewChat = (userId) => {
    const chatId = createChat(userId);
    setActiveChatId(chatId);
    setShowNewChat(false);
  };

  // Filter chats by search query (participant name or message content)
  const filteredChats = state.chats.filter(chat => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const otherId = chat.participants.find(id => id !== state.currentUser.id);
    const otherUser = state.users[otherId];
    if (otherUser && otherUser.name.toLowerCase().includes(q)) return true;
    return chat.messages.some(m => m.content.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-52px)]">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex overflow-hidden">
        {/* Sidebar List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-sm">Messaging</h2>
            <div className="flex gap-2 text-gray-600 relative">
              <div className="relative">
                <MoreHorizontal size={20} className="cursor-pointer hover:text-xinkedin-blue" onClick={() => setShowChatListMenu(!showChatListMenu)} />
                {showChatListMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-48">
                    <button onClick={() => { setSearchQuery(''); setShowChatListMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Clear search</button>
                    <button onClick={() => { setShowNewChat(true); setShowChatListMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">New conversation</button>
                  </div>
                )}
              </div>
              <Edit size={20} className="cursor-pointer hover:text-xinkedin-blue" title="New message" onClick={() => setShowNewChat(true)} />
            </div>
          </div>
          {showNewChat && (
            <div className="border-b border-gray-200 bg-white">
              <div className="flex justify-between items-center px-3 pt-2 pb-1">
                <span className="text-xs font-semibold text-gray-600">New message</span>
                <button onClick={() => setShowNewChat(false)} className="p-0.5 hover:bg-gray-100 rounded-full">
                  <X size={14} className="text-gray-500" />
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {connections.length > 0 ? connections.map(user => (
                  <div
                    key={user.id}
                    onClick={() => handleNewChat(user.id)}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt={user.name} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.headline}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-gray-500 px-3 py-3">No connections yet. Connect with people to message them.</p>
                )}
              </div>
            </div>
          )}
          <div className="p-2 border-b border-gray-200">
             <div className="relative">
                <Search size={16} className="absolute left-2 top-2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages"
                  className="w-full bg-[#eef3f8] pl-8 pr-4 py-1.5 rounded text-sm outline-none"
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 && searchQuery.trim() ? (
              <p className="text-xs text-gray-500 px-3 py-4 text-center">No conversations match "{searchQuery}"</p>
            ) : (
              filteredChats.map(chat => {
                const otherId = chat.participants.find(id => id !== state.currentUser.id);
                const otherUser = state.users[otherId];
                const lastMsg = chat.messages[chat.messages.length - 1];
                const timeAgo = formatChatTimestamp(chat.messages);

                return (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`flex gap-3 p-3 cursor-pointer hover:bg-gray-100 border-l-4 ${activeChatId === chat.id ? 'border-l-xinkedin-dark bg-blue-50' : 'border-l-transparent'}`}
                  >
                    <img src={otherUser?.avatar} className="w-12 h-12 rounded-full object-cover" alt={otherUser?.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-sm truncate">{otherUser?.name}</h3>
                        {timeAgo && <span className="text-xs text-gray-500 whitespace-nowrap ml-1">{timeAgo}</span>}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{lastMsg?.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-sm">{otherParticipant.name}</h3>
                  <span className="text-xs text-gray-500">{otherParticipant.headline}</span>
                </div>
                <div className="relative">
                  <MoreHorizontal size={20} className="text-gray-600 cursor-pointer hover:text-xinkedin-blue" onClick={() => setShowChatMenu(!showChatMenu)} />
                  {showChatMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-48">
                      <button
                        onClick={() => {
                          navigate(`/profile/${otherParticipantId}`);
                          setShowChatMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        View profile
                      </button>
                      <button
                        onClick={() => {
                          const nextChat = state.chats.find(c => c.id !== activeChatId);
                          deleteChat(activeChatId);
                          setActiveChatId(nextChat?.id || null);
                          setShowChatMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeChat.messages.map(msg => {
                  const isMe = msg.senderId === state.currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg text-sm ${isMe ? 'bg-xinkedin-blue text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSend} className="flex flex-col gap-2">
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full resize-none bg-gray-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-xinkedin-blue"
                    rows={3}
                    placeholder="Write a message... (Enter to send, Shift+Enter for new line)"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 text-gray-500">
                      <Image size={20} className="cursor-pointer hover:text-gray-700" onClick={() => {
                        const imgUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
                        sendMessage(activeChatId, `[Image: ${imgUrl}]`);
                      }} title="Send image" />
                      <Paperclip size={20} className="cursor-pointer hover:text-gray-700" onClick={() => {
                        sendMessage(activeChatId, '[Attachment: document.pdf]');
                      }} title="Send attachment" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="bg-xinkedin-blue text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-xinkedin-dark disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
