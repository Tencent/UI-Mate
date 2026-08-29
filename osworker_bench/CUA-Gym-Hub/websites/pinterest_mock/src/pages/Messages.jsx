import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { relativeTime } from '../lib/utils';
import { Search, Send, Plus, ArrowLeft } from 'lucide-react';

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { state, sendMessage, createConversation } = useStore();
  const [messageText, setMessageText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const messagesEndRef = useRef(null);

  const conversations = (state.messages || [])
    .filter(conv => conv.participants.includes(state.currentUser.id))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  const activeConv = conversationId
    ? conversations.find(c => c.id === conversationId)
    : null;

  const filteredConversations = searchFilter
    ? conversations.filter(conv => {
        const otherUserId = conv.participants.find(id => id !== state.currentUser.id);
        const otherUser = state.users.find(u => u.id === otherUserId);
        return otherUser && (
          otherUser.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          otherUser.username.toLowerCase().includes(searchFilter.toLowerCase())
        );
      })
    : conversations;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages?.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConv) return;
    sendMessage(activeConv.id, messageText.trim());
    setMessageText('');
  };

  const handleStartConversation = (userId) => {
    const convId = createConversation(userId);
    setShowNewConversation(false);
    navigate(`/messages/${convId}`);
  };

  const otherUsers = state.users.filter(u => u.id !== state.currentUser.id);
  const existingConvUserIds = conversations.map(conv =>
    conv.participants.find(id => id !== state.currentUser.id)
  );
  const newConversationUsers = otherUsers.filter(u => !existingConvUserIds.includes(u.id));

  return (
    <div className="pt-[56px] min-h-screen bg-white">
      <div className="max-w-5xl mx-auto flex h-[calc(100vh-56px)]">
        {/* Conversation List */}
        <div className={`w-full md:w-[340px] border-r border-gray-200 flex flex-col flex-shrink-0 ${
          activeConv ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-xl font-bold">Messages</h2>
            <button
              className="w-8 h-8 rounded-full bg-[#e5e5e0] hover:bg-[#d5d5d0] flex items-center justify-center"
              onClick={() => setShowNewConversation(true)}
              title="New message"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="px-4 py-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations"
                className="w-full pl-9 pr-3 py-2 bg-[#e5e5e0] rounded-full text-sm outline-none focus:ring-2 focus:ring-xinterest-focus-blue"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No conversations yet
              </div>
            ) : (
              filteredConversations.map(conv => {
                const otherUserId = conv.participants.find(id => id !== state.currentUser.id);
                const otherUser = state.users.find(u => u.id === otherUserId);
                const lastMsg = conv.messages[conv.messages.length - 1];
                const isActive = activeConv?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => navigate(`/messages/${conv.id}`)}
                  >
                    <img
                      src={otherUser?.avatar || ''}
                      alt={otherUser?.name || ''}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[14px] truncate">{otherUser?.name}</p>
                      {lastMsg && (
                        <p className="text-xs text-gray-400 truncate">
                          {lastMsg.senderId === state.currentUser.id ? 'You: ' : ''}
                          {lastMsg.text}
                        </p>
                      )}
                    </div>
                    {lastMsg && (
                      <span className="text-[11px] text-gray-400 flex-shrink-0">
                        {relativeTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <button
                  className="md:hidden p-2 rounded-full hover:bg-gray-100"
                  onClick={() => navigate('/messages')}
                >
                  <ArrowLeft size={20} />
                </button>
                {(() => {
                  const otherUserId = activeConv.participants.find(id => id !== state.currentUser.id);
                  const otherUser = state.users.find(u => u.id === otherUserId);
                  return (
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate(`/profile/${otherUserId}`)}
                    >
                      <img src={otherUser?.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-[14px]">{otherUser?.name}</p>
                        <p className="text-xs text-gray-400">@{otherUser?.username}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {activeConv.messages.map(msg => {
                  const isMe = msg.senderId === state.currentUser.id;
                  const sender = state.users.find(u => u.id === msg.senderId);
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <img src={sender?.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" />
                      )}
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-[20px] text-[14px] ${
                        isMe
                          ? 'bg-xinterest-red text-white rounded-br-sm'
                          : 'bg-[#e5e5e0] text-black rounded-bl-sm'
                      }`}>
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                          {relativeTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-4 py-3 border-t border-gray-100">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-[#e5e5e0] rounded-full text-[14px] outline-none focus:ring-2 focus:ring-xinterest-focus-blue"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="w-10 h-10 rounded-full bg-xinterest-red hover:bg-xinterest-hover text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#e5e5e0] flex items-center justify-center mx-auto mb-4">
                  <Send size={24} className="text-gray-400" />
                </div>
                <p className="text-lg font-bold text-gray-600 mb-1">Your messages</p>
                <p className="text-sm">Send messages to friends about Pins you love</p>
                <button
                  className="mt-4 px-6 py-2.5 bg-xinterest-red text-white rounded-full font-semibold hover:bg-xinterest-hover"
                  onClick={() => setShowNewConversation(true)}
                >
                  Send message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={() => setShowNewConversation(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-center">New message</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {otherUsers.map(user => (
                <button
                  key={user.id}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                  onClick={() => handleStartConversation(user.id)}
                >
                  <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-[14px]">{user.name}</p>
                    <p className="text-xs text-gray-400">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
