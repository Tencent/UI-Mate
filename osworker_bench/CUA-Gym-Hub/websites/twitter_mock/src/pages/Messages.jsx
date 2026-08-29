import React, { useState, useRef, useEffect } from 'react';
import { Settings, Mail, Search, Send, ArrowLeft, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDistanceToNowStrict } from 'date-fns';

export default function Messages() {
  const { state, sendDirectMessage, markConversationRead, createNewConversation } = useData();
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageSearch, setNewMessageSearch] = useState('');
  const messagesEndRef = useRef(null);

  const conversations = (state.conversations || [])
    .slice()
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

  const directMessages = state.directMessages || [];

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  const getOtherUser = (conv) => {
    const otherId = conv.participants.find(id => id !== state.currentUser.id);
    return state.users.find(u => u.id === otherId);
  };

  const getLastMessage = (conv) => {
    const convMessages = directMessages.filter(dm => dm.conversationId === conv.id);
    if (convMessages.length === 0) return null;
    return convMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  };

  const filteredConversations = searchQuery
    ? conversations.filter(conv => {
        const otherUser = getOtherUser(conv);
        return otherUser && (
          otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          otherUser.handle.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : conversations;

  const selectedMessages = selectedConv
    ? directMessages
        .filter(dm => dm.conversationId === selectedConvId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMessages.length]);

  useEffect(() => {
    if (selectedConvId && markConversationRead) {
      markConversationRead(selectedConvId);
    }
  }, [selectedConvId]);

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConvId) return;
    if (sendDirectMessage) {
      sendDirectMessage(selectedConvId, messageInput.trim());
    }
    setMessageInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartNewConversation = (targetUser) => {
    // Check if conversation already exists
    const existing = conversations.find(c =>
      c.participants.includes(state.currentUser.id) && c.participants.includes(targetUser.id)
    );
    if (existing) {
      setSelectedConvId(existing.id);
    } else {
      createNewConversation(targetUser.id);
      // After creating, find the new conversation
      setTimeout(() => {
        const newConv = (state.conversations || []).find(c =>
          c.participants.includes(state.currentUser.id) && c.participants.includes(targetUser.id)
        );
        if (newConv) setSelectedConvId(newConv.id);
      }, 50);
    }
    setShowNewMessageModal(false);
    setNewMessageSearch('');
  };

  const newMsgFilteredUsers = newMessageSearch
    ? state.users.filter(u =>
        u.id !== state.currentUser.id && (
          u.name.toLowerCase().includes(newMessageSearch.toLowerCase()) ||
          u.handle.toLowerCase().includes(newMessageSearch.toLowerCase())
        )
      )
    : state.users.filter(u => u.id !== state.currentUser.id).slice(0, 10);

  const otherUser = selectedConv ? getOtherUser(selectedConv) : null;

  return (
    <div className="flex min-h-screen">
      {/* Conversation list */}
      <div className={`${selectedConvId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[380px] border-r border-[#EFF3F4]`}>
        <div className="sticky top-0 bg-white z-10 px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-extrabold text-[#0F1419]">Messages</h1>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-[#F7F9F9] transition-colors">
                <Settings className="w-5 h-5 text-[#0F1419]" />
              </button>
              <button
                className="p-2 rounded-full hover:bg-[#F7F9F9] transition-colors"
                onClick={() => setShowNewMessageModal(true)}
                title="New message"
              >
                <Mail className="w-5 h-5 text-[#0F1419]" />
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-[18px] w-[18px] text-[#536471]" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2 rounded-full bg-[#EFF3F4] text-[15px] text-[#0F1419] placeholder-[#536471] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#1DA1F2] focus:bg-white focus:border-[#1DA1F2]"
              placeholder="Search Direct Messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-10 h-10 text-[#536471] mx-auto mb-3" />
              <p className="text-[#536471] text-[15px]">No conversations yet.</p>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const user = getOtherUser(conv);
              const lastMsg = getLastMessage(conv);
              if (!user) return null;
              const isSelected = conv.id === selectedConvId;
              const hasUnread = conv.unreadCount > 0;

              return (
                <div
                  key={conv.id}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-[#EFF3F4]' : 'hover:bg-[#F7F9F9]'}`}
                  onClick={() => setSelectedConvId(conv.id)}
                >
                  {hasUnread && <div className="w-2 h-2 bg-[#1DA1F2] rounded-full mt-5 flex-shrink-0" />}
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`text-[15px] truncate ${hasUnread ? 'font-bold text-[#0F1419]' : 'text-[#0F1419]'}`}>{user.name}</span>
                      <span className="text-[15px] text-[#536471] truncate">@{user.handle}</span>
                      <span className="text-[#536471]">&middot;</span>
                      <span className="text-[13px] text-[#536471] whitespace-nowrap">
                        {lastMsg ? formatDistanceToNowStrict(new Date(lastMsg.createdAt)) : ''}
                      </span>
                    </div>
                    {lastMsg && (
                      <p className="text-[14px] text-[#536471] truncate mt-0.5">{lastMsg.content}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Message view */}
      <div className={`${selectedConvId ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
        {selectedConv && otherUser ? (
          <>
            <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-[#EFF3F4] flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-full hover:bg-[#F7F9F9]"
                onClick={() => setSelectedConvId(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="font-bold text-[17px] text-[#0F1419]">{otherUser.name}</p>
                <p className="text-[13px] text-[#536471]">@{otherUser.handle}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectedMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <p className="text-[#536471] text-[15px]">No messages yet. Say hi!</p>
                </div>
              )}
              {selectedMessages.map(msg => {
                const isMine = msg.senderId === state.currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] px-4 py-2 text-[15px] leading-5 ${
                        isMine
                          ? 'bg-[#1DA1F2] text-white rounded-[18px] rounded-br-[4px]'
                          : 'bg-[#EFF3F4] text-[#0F1419] rounded-[18px] rounded-bl-[4px]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-[#EFF3F4] px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 rounded-full bg-[#EFF3F4] text-[15px] text-[#0F1419] placeholder-[#536471] border border-transparent focus:outline-none focus:ring-1 focus:ring-[#1DA1F2] focus:bg-white focus:border-[#1DA1F2]"
                  placeholder="Start a new message"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={handleSend}
                  disabled={!messageInput.trim()}
                  className="p-2 rounded-full text-[#1DA1F2] hover:bg-[#1DA1F2]/10 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <h2 className="text-[31px] font-extrabold text-[#0F1419] mb-2">Select a message</h2>
            <p className="text-[15px] text-[#536471] text-center max-w-sm">
              Choose from your existing conversations, start a new one, or just keep swimming.
            </p>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="mt-6 bg-[#1DA1F2] text-white font-bold text-[17px] px-8 py-3 rounded-full hover:bg-[#1a91da] transition-colors"
            >
              New message
            </button>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[10%]"
          onClick={() => setShowNewMessageModal(false)}
        >
          <div
            className="bg-white w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 px-4 py-3 border-b border-[#EFF3F4]">
              <button onClick={() => setShowNewMessageModal(false)} className="p-2 rounded-full hover:bg-[#F7F9F9] transition-colors">
                <X className="w-5 h-5 text-[#0F1419]" />
              </button>
              <span className="font-extrabold text-[17px] text-[#0F1419]">New message</span>
            </div>
            <div className="px-4 py-2 border-b border-[#EFF3F4]">
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#1DA1F2]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search people"
                  value={newMessageSearch}
                  onChange={e => setNewMessageSearch(e.target.value)}
                  className="w-full pl-7 py-2 text-[15px] text-[#0F1419] placeholder-[#536471] border-none focus:outline-none focus:ring-0"
                />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {newMsgFilteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7F9F9] cursor-pointer transition-colors"
                  onClick={() => handleStartNewConversation(user)}
                >
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px] text-[#0F1419] truncate">{user.name}</p>
                    <p className="text-[15px] text-[#536471] truncate">@{user.handle}</p>
                  </div>
                </div>
              ))}
              {newMsgFilteredUsers.length === 0 && (
                <p className="p-6 text-center text-[#536471]">No results found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
