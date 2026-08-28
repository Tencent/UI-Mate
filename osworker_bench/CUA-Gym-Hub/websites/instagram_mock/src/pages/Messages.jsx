import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Info, Send, Heart, Image, PenSquare, MessageCircle, X, Search as SearchIcon, Phone, Video, ChevronLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { CURRENT_USER_ID, getSessionId } from '../utils/mockData';

const NewMessageModal = ({ onClose }) => {
  const { users, currentUser, conversations } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const allUsers = Object.values(users).filter(u => u.id !== currentUser.id);
  const filteredUsers = searchTerm.trim()
    ? allUsers.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allUsers;

  const handleSelectUser = (userId) => {
    const existingConv = conversations.find(c =>
      c.participants.length === 2 &&
      c.participants.includes(userId) &&
      c.participants.includes(CURRENT_USER_ID)
    );
    if (existingConv) {
      navigate(`/direct/t/${existingConv.id}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65" onClick={onClose}>
      <div className="bg-white rounded-xl w-[400px] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#EFEFEF]">
          <button onClick={onClose}><X className="w-5 h-5" /></button>
          <h2 className="font-bold text-base">New message</h2>
          <button className="text-[#0095F6] font-semibold text-sm">Next</button>
        </div>
        <div className="px-4 py-2 border-b border-[#EFEFEF] flex items-center gap-3">
          <span className="font-semibold text-sm">To:</span>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 placeholder-[#8E8E8E]"
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#8E8E8E]">No account found.</div>
          ) : (
            filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-left transition-colors"
              >
                <div className="relative">
                  <img src={user.avatar} alt={user.username} className="w-11 h-11 rounded-full object-cover" />
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#12B76A] rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm flex items-center gap-1">
                    {user.username}
                    {user.isVerified && (
                      <svg className="w-3 h-3 text-[#0095F6]" viewBox="0 0 40 40" fill="currentColor">
                        <path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094zM18.37 27.04l-6.77-6.77 2.83-2.83 3.94 3.94 8.52-8.52 2.83 2.83L18.37 27.04z"/>
                      </svg>
                    )}
                  </div>
                  <div className="text-xs text-[#8E8E8E]">{user.name}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const UnsendModal = ({ onClose, onUnsend }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65" onClick={onClose}>
      <div className="bg-white rounded-xl w-[400px] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <h3 className="font-bold text-lg mb-2">Unsend Message?</h3>
          <p className="text-sm text-[#8E8E8E]">Unsending will remove the message for everyone. People may have seen it already.</p>
        </div>
        <button onClick={onUnsend} className="w-full py-3.5 text-sm font-bold text-[#ED4956] border-t border-[#EFEFEF] hover:bg-gray-50 transition-colors">
          Unsend
        </button>
        <button onClick={onClose} className="w-full py-3.5 text-sm border-t border-[#EFEFEF] hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
};

const ConversationInfoModal = ({ conversation, onClose }) => {
  const { users } = useData();
  const participants = conversation.participants.map(id => users[id]).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65" onClick={onClose}>
      <div className="bg-white rounded-xl w-[360px] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#EFEFEF]">
          <button onClick={onClose}><X className="w-5 h-5" /></button>
          <h2 className="font-bold text-base">Details</h2>
          <div className="w-5" />
        </div>
        <div className="p-4">
          <h3 className="text-xs font-semibold text-[#8E8E8E] uppercase mb-3">Members</h3>
          {participants.map(user => (
            <Link key={user.id} to={`/profile/${user.username}`} onClick={onClose} className="flex items-center gap-3 py-2.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
              <div className="relative">
                <img src={user.avatar} alt={user.username} className="w-14 h-14 rounded-full object-cover" />
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#12B76A] rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <div className="font-semibold text-sm">{user.username}</div>
                <div className="text-xs text-[#8E8E8E]">{user.name}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="border-t border-[#EFEFEF] p-4">
          <button className="w-full text-sm text-[#ED4956] font-semibold text-left hover:opacity-70 transition-opacity">Delete chat</button>
        </div>
      </div>
    </div>
  );
};

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { conversations, users, currentUser, sendMessage, markConversationRead, getConversationMessages, state, unsendMessage } = useData();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [unsendMsgId, setUnsendMsgId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  const activeConvId = conversationId || null;

  useEffect(() => {
    if (activeConvId) markConversationRead(activeConvId);
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, conversations, state?.messages?.length]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConvId) return;
    sendMessage(activeConvId, messageText.trim());
    setMessageText('');
  };

  const handleSendHeart = () => {
    if (!activeConvId) return;
    sendMessage(activeConvId, '\u2764\uFE0F');
  };

  const handleSendImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !activeConvId) return;

    setIsImageUploading(true);
    setImageUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const sid = getSessionId();
      const response = await fetch(`/upload${sid ? `?sid=${encodeURIComponent(sid)}` : ''}`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const payload = await response.json();
      const uploaded = payload.files?.[0];
      if (!uploaded?.url) throw new Error('Upload response missing file URL');
      sendMessage(activeConvId, uploaded.url, 'image');
    } catch (error) {
      setImageUploadError(error.message || 'Could not send image');
    } finally {
      setIsImageUploading(false);
      event.target.value = '';
    }
  };

  const getOtherParticipants = (conv) => {
    return conv.participants
      .filter(id => id !== CURRENT_USER_ID)
      .map(id => users[id])
      .filter(Boolean);
  };

  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
  );

  const activeConversation = conversations.find(c => c.id === activeConvId);
  const activeMessages = activeConvId ? getConversationMessages(activeConvId) : [];
  const otherUsers = activeConversation ? getOtherParticipants(activeConversation) : [];

  const formatMessageTime = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday ' + format(date, 'h:mm a');
    return format(date, 'MMM d, h:mm a');
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    if (msg.senderId === CURRENT_USER_ID) {
      setContextMenu({ x: e.clientX, y: e.clientY, msgId: msg.id });
    }
  };

  // Close context menu on click
  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  return (
    <div className="flex h-screen max-h-screen">
      {/* Conversation List */}
      <div className={`${activeConvId ? 'hidden md:flex' : 'flex'} w-full md:w-[397px] flex-col border-r border-[#DBDBDB] bg-white flex-shrink-0`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EFEFEF]">
          <div className="flex items-center gap-1">
            <h2 className="font-bold text-xl">{currentUser.username}</h2>
            <svg className="w-3 h-3 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <button onClick={() => setShowNewMessageModal(true)} className="hover:opacity-50 transition-opacity">
            <PenSquare className="w-6 h-6" />
          </button>
        </div>

        {/* Messages / Requests header */}
        <div className="flex items-center justify-between px-6 py-3">
          <span className="font-bold text-base">Messages</span>
          <button onClick={() => setShowRequestsModal(true)} className="text-sm text-[#8E8E8E] hover:text-[#262626] transition-colors">Requests</button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {sortedConversations.map(conv => {
            const others = getOtherParticipants(conv);
            const isActive = conv.id === activeConvId;
            const displayName = others.length > 1
              ? others.map(u => u.username).join(', ')
              : others[0]?.username || 'Unknown';
            const hasOnline = others.some(u => u.isOnline);

            return (
              <button
                key={conv.id}
                onClick={() => navigate(`/direct/t/${conv.id}`)}
                className={`flex items-center gap-3 w-full px-6 py-2 hover:bg-[#EFEFEF]/50 transition-colors ${isActive ? 'bg-[#EFEFEF]' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  {others.length === 1 ? (
                    <>
                      <img src={others[0].avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
                      {others[0].isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#12B76A] rounded-full border-[2.5px] border-white animate-online-pulse" />
                      )}
                    </>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                      {others.length}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className={`text-sm ${conv.unreadCount > 0 ? 'font-bold' : 'font-normal'}`}>{displayName}</div>
                  <div className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-[#262626] font-semibold' : 'text-[#8E8E8E]'}`}>
                    {conv.lastMessage}
                    <span className="text-[#8E8E8E] font-normal"> · {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: false }).replace('about ', '')}</span>
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="w-2 h-2 rounded-full bg-[#0095F6] flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      {activeConvId && activeConversation ? (
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#EFEFEF]">
            <div className="flex items-center gap-3">
              {/* Mobile back button */}
              <button onClick={() => navigate('/direct/inbox')} className="md:hidden p-1">
                <ChevronLeft className="w-6 h-6" />
              </button>
              {otherUsers.length === 1 ? (
                <Link to={`/profile/${otherUsers[0].username}`} className="flex items-center gap-3">
                  <div className="relative">
                    <img src={otherUsers[0].avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    {otherUsers[0].isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#12B76A] rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-base flex items-center gap-1">
                      {otherUsers[0].username}
                      {otherUsers[0].isVerified && (
                        <svg className="w-3.5 h-3.5 text-[#0095F6]" viewBox="0 0 40 40" fill="currentColor">
                          <path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094zM18.37 27.04l-6.77-6.77 2.83-2.83 3.94 3.94 8.52-8.52 2.83 2.83L18.37 27.04z"/>
                        </svg>
                      )}
                    </div>
                    <div className="text-xs text-[#8E8E8E]">{otherUsers[0].isOnline ? 'Active now' : 'Active recently'}</div>
                  </div>
                </Link>
              ) : (
                <button onClick={() => setShowInfoModal(true)} className="font-semibold text-base hover:opacity-70 transition-opacity">
                  {otherUsers.map(u => u.username).join(', ')}
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button className="hover:opacity-50 transition-opacity hidden sm:block">
                <Phone className="w-6 h-6" />
              </button>
              <button className="hover:opacity-50 transition-opacity hidden sm:block">
                <Video className="w-6 h-6" />
              </button>
              <button onClick={() => setShowInfoModal(true)} className="hover:opacity-50 transition-opacity">
                <Info className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Other user profile card at top of messages */}
          {otherUsers.length === 1 && (
            <div className="flex flex-col items-center py-6 border-b border-[#EFEFEF]">
              <img src={otherUsers[0].avatar} alt="" className="w-24 h-24 rounded-full object-cover mb-3" />
              <div className="font-bold text-lg">{otherUsers[0].name}</div>
              <div className="text-sm text-[#8E8E8E] mb-3">{otherUsers[0].username} · Xnstagram</div>
              <Link
                to={`/profile/${otherUsers[0].username}`}
                className="ig-btn-secondary text-xs px-4 py-1.5"
              >
                View profile
              </Link>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
            {activeMessages.map((msg, idx) => {
              const isMine = msg.senderId === CURRENT_USER_ID;
              const sender = users[msg.senderId];
              const showAvatar = !isMine && (idx === 0 || activeMessages[idx - 1]?.senderId !== msg.senderId);
              const isLastInGroup = idx === activeMessages.length - 1 || activeMessages[idx + 1]?.senderId !== msg.senderId;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}
                  onContextMenu={(e) => handleContextMenu(e, msg)}
                >
                  {!isMine && (
                    <div className="w-7 mr-2 flex-shrink-0">
                      {showAvatar && sender ? (
                        <img src={sender.avatar} alt="" className="w-7 h-7 rounded-full mt-1 object-cover" />
                      ) : null}
                    </div>
                  )}
                  <div className={`max-w-[60%] relative`}>
                    {msg.type === 'image' && msg.imageUrl ? (
                      <img src={msg.imageUrl} alt="Shared" className="rounded-2xl max-w-full max-h-64 object-cover" />
                    ) : msg.type === 'post_share' && msg.sharedPostId ? (
                      (() => {
                        const sharedPost = state && state.posts
                          ? state.posts.find(p => p.id === msg.sharedPostId)
                          : null;
                        const sharedUser = sharedPost ? users[sharedPost.userId] : null;
                        return (
                          <div className="rounded-2xl overflow-hidden text-sm border border-[#EFEFEF]" style={{ maxWidth: '240px' }}>
                            {sharedPost && sharedPost.images[0] ? (
                              <img src={sharedPost.images[0]} alt="Shared post" className="w-full h-40 object-cover" />
                            ) : (
                              <div className="w-full h-20 bg-gray-200 flex items-center justify-center text-xs text-[#8E8E8E]">Post</div>
                            )}
                            <div className="px-3 py-2 bg-white">
                              {sharedUser && (
                                <div className="flex items-center gap-2 mb-1">
                                  <img src={sharedUser.avatar} alt="" className="w-4 h-4 rounded-full" />
                                  <span className="text-xs font-semibold">{sharedUser.username}</span>
                                </div>
                              )}
                              {sharedPost && (
                                <p className="text-xs text-[#8E8E8E] line-clamp-1">{sharedPost.caption}</p>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : msg.text === '\u2764\uFE0F' ? (
                      <div className="text-4xl py-1">{msg.text}</div>
                    ) : (
                      <div className={`px-4 py-2.5 text-sm ${
                        isMine
                          ? 'bg-[#3797F0] text-white rounded-[20px] rounded-br-[4px]'
                          : 'bg-[#EFEFEF] text-[#262626] rounded-[20px] rounded-bl-[4px]'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                    )}
                    {isLastInGroup && (
                      <div className={`text-[10px] text-[#8E8E8E] mt-0.5 ${isMine ? 'text-right' : 'text-left'}`}>
                        {formatMessageTime(msg.created)}
                      </div>
                    )}

                    {/* Unsend context action (visible on hover for own messages) */}
                    {isMine && (
                      <button
                        onClick={() => setUnsendMsgId(msg.id)}
                        className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full"
                        title="More"
                      >
                        <svg className="w-4 h-4 text-[#8E8E8E]" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-[#EFEFEF]">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3 border border-[#DBDBDB] rounded-full px-4 py-2.5">
              <Smile className="w-6 h-6 text-[#262626] cursor-pointer hover:opacity-50 transition-opacity flex-shrink-0" />
              <input
                type="text"
                placeholder="Message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent placeholder-[#8E8E8E]"
              />
              {messageText.trim() ? (
                <button type="submit" className="text-[#0095F6] font-semibold text-sm hover:text-[#00376B] transition-colors">Send</button>
              ) : (
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isImageUploading} className="hover:opacity-50 transition-opacity disabled:opacity-40">
                    <Image className="w-6 h-6 text-[#262626]" />
                  </button>
                  <button type="button" onClick={handleSendHeart} className="hover:opacity-50 transition-opacity">
                    <Heart className="w-6 h-6 text-[#262626]" />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSendImage}
              />
            </form>
            {imageUploadError && <p className="text-xs text-[#ED4956] mt-2 px-4">{imageUploadError}</p>}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-white">
          <div className="w-24 h-24 rounded-full border-2 border-[#262626] flex items-center justify-center mb-4">
            <Send className="w-10 h-10 stroke-1 -rotate-[20deg]" />
          </div>
          <h3 className="text-xl font-normal mb-1">Your messages</h3>
          <p className="text-sm text-[#8E8E8E] mb-5">Send a message to start a chat.</p>
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="ig-btn-primary"
          >
            Send message
          </button>
        </div>
      )}

      {showNewMessageModal && <NewMessageModal onClose={() => setShowNewMessageModal(false)} />}
      {showInfoModal && activeConversation && (
        <ConversationInfoModal conversation={activeConversation} onClose={() => setShowInfoModal(false)} />
      )}
      {showRequestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65" onClick={() => setShowRequestsModal(false)}>
          <div className="bg-white rounded-xl w-[360px] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#EFEFEF]">
              <button onClick={() => setShowRequestsModal(false)}><X className="w-5 h-5" /></button>
              <h2 className="font-bold text-base">Message requests</h2>
              <div className="w-5" />
            </div>
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-[#8E8E8E]" />
              <h3 className="font-semibold text-sm mb-1">No message requests</h3>
              <p className="text-sm text-[#8E8E8E]">Requests from people you do not follow will appear here.</p>
            </div>
          </div>
        </div>
      )}
      {unsendMsgId && (
        <UnsendModal
          onClose={() => setUnsendMsgId(null)}
          onUnsend={() => {
            unsendMessage(unsendMsgId);
            setUnsendMsgId(null);
          }}
        />
      )}
    </div>
  );
};

export default Messages;
