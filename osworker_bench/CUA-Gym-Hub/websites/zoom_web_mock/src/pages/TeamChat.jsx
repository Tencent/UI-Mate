import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Hash, ChevronDown, ChevronRight, Pencil, Star, Phone, Video, Info, Send, Users, MessageSquare, Pin, PinOff, Lock, Globe, X, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn, generateId } from '../lib/utils';
import { format, isToday, isYesterday } from 'date-fns';

function formatTimestamp(ts) {
  const d = new Date(ts);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday ' + format(d, 'h:mm a');
  return format(d, 'MMM d, h:mm a');
}

export default function TeamChat() {
  const { channelId: paramChannelId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const { user, channels, messages, contacts, sendMessage, addReaction, editMessage, deleteMessage, addChannel, pinMessage, incrementReplyCount } = useStore();

  const [activeChannelId, setActiveChannelId] = useState(paramChannelId || (channels.length > 0 ? channels[0].channelId : null));
  const [composerText, setComposerText] = useState('');
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ starred: true, channels: true, recents: true });
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showThreadPanel, setShowThreadPanel] = useState(null); // messageId of thread being viewed
  const [threadReplyText, setThreadReplyText] = useState('');
  const messagesEndRef = useRef(null);

  const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👀', '✅', '❌', '🙏', '💯', '🚀', '👏', '💪', '🤔', '😊', '🫡', '⭐', '🎯'];

  useEffect(() => {
    if (paramChannelId && paramChannelId !== activeChannelId) {
      setActiveChannelId(paramChannelId);
    }
  }, [paramChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannelId, messages[activeChannelId]?.length]);

  const activeChannel = channels.find(ch => ch.channelId === activeChannelId);
  const channelMessages = messages[activeChannelId] || [];

  const handleSend = () => {
    if (!composerText.trim() || !activeChannelId) return;
    const msg = {
      messageId: `msg_${generateId()}`,
      channelId: activeChannelId,
      senderId: user.userId,
      senderName: user.username,
      senderAvatar: user.avatar,
      text: composerText.trim(),
      timestamp: new Date().toISOString(),
      reactions: [],
      replyTo: null,
      replyCount: 0,
      edited: false,
      pinned: false,
    };
    sendMessage(activeChannelId, msg);
    setComposerText('');
  };

  const switchChannel = (chId) => {
    setActiveChannelId(chId);
    const path = query ? `/chat/${chId}?${query}` : `/chat/${chId}`;
    navigate(path, { replace: true });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getChannelDisplayName = (ch) => {
    if (ch.type === 'dm') {
      const otherMemberId = ch.members.find(m => m !== user.userId);
      const contact = contacts.find(c => c.contactId === otherMemberId);
      return contact ? contact.name : 'Unknown';
    }
    return ch.name || 'Unnamed';
  };

  const getChannelAvatar = (ch) => {
    if (ch.type === 'dm') {
      const otherMemberId = ch.members.find(m => m !== user.userId);
      const contact = contacts.find(c => c.contactId === otherMemberId);
      return contact?.avatar || '';
    }
    return null;
  };

  const starredChannels = channels.filter(ch => ch.starred);
  const channelsList = channels.filter(ch => ch.type === 'channel');
  const recentDMs = channels.filter(ch => ch.type === 'dm' || ch.type === 'group_dm');

  const handleCreateChannel = (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    const chId = `ch_${generateId()}`;
    addChannel({
      channelId: chId,
      name: newChannelName.trim(),
      type: 'channel',
      private: newChannelPrivate,
      members: [user.userId],
      description: newChannelDesc.trim(),
      starred: false,
      unreadCount: 0,
      lastMessage: null,
    });
    setShowCreateChannel(false);
    setNewChannelName('');
    setNewChannelDesc('');
    setNewChannelPrivate(false);
    switchChannel(chId);
  };

  const handleEditSave = () => {
    if (editingMsg && editText.trim()) {
      editMessage(activeChannelId, editingMsg, editText.trim());
    }
    setEditingMsg(null);
    setEditText('');
  };

  const handlePinToggle = (msg) => {
    pinMessage(activeChannelId, msg.messageId, !msg.pinned);
  };

  const handleThreadReply = () => {
    if (!threadReplyText.trim() || !showThreadPanel) return;
    const parentMsg = channelMessages.find(m => m.messageId === showThreadPanel);
    if (!parentMsg) return;
    const replyMsg = {
      messageId: `msg_${generateId()}`,
      channelId: activeChannelId,
      senderId: user.userId,
      senderName: user.username,
      senderAvatar: user.avatar,
      text: threadReplyText.trim(),
      timestamp: new Date().toISOString(),
      reactions: [],
      replyTo: showThreadPanel,
      replyCount: 0,
      edited: false,
      pinned: false,
    };
    sendMessage(activeChannelId, replyMsg);
    incrementReplyCount(activeChannelId, showThreadPanel);
    setThreadReplyText('');
  };

  const handleApplyFormatting = (type) => {
    const textarea = document.getElementById('chat-composer');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = composerText.substring(start, end);
    let wrapped = selected;
    if (type === 'bold') wrapped = `**${selected}**`;
    if (type === 'italic') wrapped = `_${selected}_`;
    if (type === 'strike') wrapped = `~~${selected}~~`;
    const newText = composerText.substring(0, start) + wrapped + composerText.substring(end);
    setComposerText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + (type === 'bold' ? 2 : 1), end + (type === 'bold' ? 2 : 1));
    }, 0);
  };

  const pinnedMessages = channelMessages.filter(m => m.pinned);

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <div className="w-60 bg-white border-r border-xoom-border flex flex-col shrink-0">
        {/* Sidebar header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-xoom-border">
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-xoom-dark text-sm">Team Chat</span>
            <ChevronDown className="w-3.5 h-3.5 text-xoom-gray" />
          </div>
          <button
            onClick={() => setShowCreateChannel(true)}
            className="p-1 text-xoom-blue hover:bg-xoom-hover rounded transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Starred section */}
          {starredChannels.length > 0 && (
            <div className="mb-2">
              <button
                onClick={() => toggleSection('starred')}
                className="flex items-center px-4 py-1 text-xs text-xoom-gray font-semibold uppercase tracking-wider w-full hover:bg-gray-50"
              >
                {expandedSections.starred ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                Starred
              </button>
              {expandedSections.starred && starredChannels.map(ch => (
                <SidebarItem
                  key={ch.channelId}
                  channel={ch}
                  isActive={ch.channelId === activeChannelId}
                  onClick={() => switchChannel(ch.channelId)}
                  displayName={getChannelDisplayName(ch)}
                  avatar={getChannelAvatar(ch)}
                />
              ))}
            </div>
          )}

          {/* Channels section */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('channels')}
              className="flex items-center px-4 py-1 text-xs text-xoom-gray font-semibold uppercase tracking-wider w-full hover:bg-gray-50"
            >
              {expandedSections.channels ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
              Channels
              <button
                onClick={(e) => { e.stopPropagation(); setShowCreateChannel(true); }}
                className="ml-auto text-xoom-gray hover:text-xoom-blue"
              >
                +
              </button>
            </button>
            {expandedSections.channels && channelsList.map(ch => (
              <SidebarItem
                key={ch.channelId}
                channel={ch}
                isActive={ch.channelId === activeChannelId}
                onClick={() => switchChannel(ch.channelId)}
                displayName={getChannelDisplayName(ch)}
                avatar={getChannelAvatar(ch)}
              />
            ))}
          </div>

          {/* Recents section */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('recents')}
              className="flex items-center px-4 py-1 text-xs text-xoom-gray font-semibold uppercase tracking-wider w-full hover:bg-gray-50"
            >
              {expandedSections.recents ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
              Recents
            </button>
            {expandedSections.recents && recentDMs.map(ch => (
              <SidebarItem
                key={ch.channelId}
                channel={ch}
                isActive={ch.channelId === activeChannelId}
                onClick={() => switchChannel(ch.channelId)}
                displayName={getChannelDisplayName(ch)}
                avatar={getChannelAvatar(ch)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Center message area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {activeChannel ? (
          <>
            {/* Channel header */}
            <div className="h-12 flex items-center justify-between px-4 border-b border-xoom-border shrink-0">
              <div className="flex items-center space-x-2 min-w-0">
                {activeChannel.type === 'channel' && <Hash className="w-4 h-4 text-xoom-gray shrink-0" />}
                {activeChannel.type === 'dm' && (
                  <img src={getChannelAvatar(activeChannel)} className="w-6 h-6 rounded-full shrink-0" alt="" />
                )}
                <span className="font-semibold text-xoom-dark text-sm truncate">{getChannelDisplayName(activeChannel)}</span>
                <span className="text-xs text-xoom-gray">{activeChannel.members.length} members</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => navigate(query ? `/?${query}` : '/')}
                  className="p-1.5 text-xoom-gray hover:bg-gray-100 rounded"
                  title="Audio call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const meetingId = generateId();
                    navigate(query ? `/room/${meetingId}?${query}` : `/room/${meetingId}`);
                  }}
                  className="p-1.5 text-xoom-gray hover:bg-gray-100 rounded"
                  title="Video call"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowInfoPanel(!showInfoPanel)}
                  className={cn('p-1.5 rounded', showInfoPanel ? 'text-xoom-blue bg-xoom-hover' : 'text-xoom-gray hover:bg-gray-100')}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pinned messages banner */}
            {pinnedMessages.length > 0 && (
              <div className="px-4 py-1.5 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-800">
                📌 {pinnedMessages.length} pinned message{pinnedMessages.length > 1 ? 's' : ''}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {channelMessages.map(msg => (
                <div
                  key={msg.messageId}
                  className="flex space-x-3 py-1.5 group relative hover:bg-gray-50 rounded px-2 -mx-2"
                  onMouseEnter={() => setHoveredMsg(msg.messageId)}
                  onMouseLeave={() => { setHoveredMsg(null); setShowEmojiPicker(null); }}
                >
                  <img src={msg.senderAvatar} alt="" className="w-9 h-9 rounded-full shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline space-x-2">
                      <span className="font-semibold text-sm text-xoom-dark">{msg.senderName}</span>
                      <span className="text-xs text-xoom-gray">{formatTimestamp(msg.timestamp)}</span>
                      {msg.edited && <span className="text-xs text-xoom-gray italic">(edited)</span>}
                    </div>
                    {editingMsg === msg.messageId ? (
                      <div className="mt-1">
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className="w-full border border-xoom-border rounded px-2 py-1 text-sm resize-none"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex space-x-2 mt-1">
                          <button onClick={handleEditSave} className="text-xs text-white bg-xoom-blue px-3 py-1 rounded">Save</button>
                          <button onClick={() => { setEditingMsg(null); setEditText(''); }} className="text-xs text-xoom-gray px-3 py-1 rounded hover:bg-gray-100">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-xoom-dark mt-0.5 whitespace-pre-wrap break-words">{msg.text}</p>
                    )}

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {msg.reactions.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => addReaction(activeChannelId, msg.messageId, r.emoji)}
                            className={cn(
                              'inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs border transition-colors',
                              r.users.includes(user.userId)
                                ? 'border-xoom-blue bg-blue-50 text-xoom-blue'
                                : 'border-xoom-border bg-gray-50 text-xoom-dark hover:bg-gray-100'
                            )}
                          >
                            <span>{r.emoji}</span>
                            <span>{r.users.length}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Thread indicator */}
                    {msg.replyCount > 0 && (
                      <button
                        onClick={() => setShowThreadPanel(showThreadPanel === msg.messageId ? null : msg.messageId)}
                        className="text-xs text-xoom-blue mt-1 hover:underline flex items-center space-x-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>{msg.replyCount} {msg.replyCount === 1 ? 'reply' : 'replies'}</span>
                      </button>
                    )}
                  </div>

                  {/* Hover actions */}
                  {hoveredMsg === msg.messageId && editingMsg !== msg.messageId && (
                    <div className="absolute top-0 right-2 flex items-center space-x-0.5 bg-white border border-xoom-border rounded shadow-sm">
                      <button
                        onClick={() => setShowEmojiPicker(showEmojiPicker === msg.messageId ? null : msg.messageId)}
                        className="p-1 text-xoom-gray hover:text-xoom-blue hover:bg-xoom-hover rounded text-xs"
                        title="React"
                      >
                        😊
                      </button>
                      <button
                        onClick={() => handlePinToggle(msg)}
                        className={cn('p-1 rounded', msg.pinned ? 'text-xoom-blue hover:bg-xoom-hover' : 'text-xoom-gray hover:text-xoom-blue hover:bg-xoom-hover')}
                        title={msg.pinned ? 'Unpin' : 'Pin'}
                      >
                        {msg.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                      </button>
                      {msg.senderId === user.userId && (
                        <>
                          <button
                            onClick={() => { setEditingMsg(msg.messageId); setEditText(msg.text); }}
                            className="p-1 text-xoom-gray hover:text-xoom-blue hover:bg-xoom-hover rounded"
                            title="Edit"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(msg.messageId)}
                            className="p-1 text-xoom-gray hover:text-red-500 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Emoji picker */}
                  {showEmojiPicker === msg.messageId && (
                    <div className="absolute top-8 right-2 bg-white border border-xoom-border rounded-lg shadow-lg p-2 z-30 w-64">
                      <div className="grid grid-cols-10 gap-1">
                        {COMMON_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              addReaction(activeChannelId, msg.messageId, emoji);
                              setShowEmojiPicker(null);
                            }}
                            className="text-lg hover:bg-gray-100 rounded p-0.5 leading-none"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="px-4 pb-3 pt-1 border-t border-xoom-border shrink-0">
              <div className="border border-xoom-border rounded-lg overflow-hidden focus-within:border-xoom-blue transition-colors">
                <textarea
                  id="chat-composer"
                  value={composerText}
                  onChange={e => setComposerText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder={`Message ${activeChannel.type === 'channel' ? '#' : ''}${getChannelDisplayName(activeChannel)}`}
                  className="w-full px-3 py-2 text-sm resize-none outline-none bg-white"
                  rows={2}
                />
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50">
                  <div className="flex space-x-1 text-xoom-gray">
                    <button
                      onClick={() => handleApplyFormatting('bold')}
                      className="p-1 hover:bg-gray-200 rounded text-xs font-bold"
                      title="Bold"
                    >B</button>
                    <button
                      onClick={() => handleApplyFormatting('italic')}
                      className="p-1 hover:bg-gray-200 rounded text-xs italic"
                      title="Italic"
                    >I</button>
                    <button
                      onClick={() => handleApplyFormatting('strike')}
                      className="p-1 hover:bg-gray-200 rounded text-xs line-through"
                      title="Strikethrough"
                    >S</button>
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!composerText.trim()}
                    className={cn(
                      'p-1.5 rounded transition-colors',
                      composerText.trim()
                        ? 'text-white bg-xoom-blue hover:bg-blue-600'
                        : 'text-xoom-gray bg-gray-200 cursor-not-allowed'
                    )}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xoom-gray">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a channel or conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Right info panel */}
      {showInfoPanel && activeChannel && !showThreadPanel && (
        <div className="w-72 bg-white border-l border-xoom-border flex flex-col shrink-0">
          <div className="h-12 flex items-center justify-between px-4 border-b border-xoom-border">
            <span className="font-semibold text-sm text-xoom-dark">
              {activeChannel.type === 'channel' ? 'Explore This Channel' : 'Conversation Info'}
            </span>
            <button onClick={() => setShowInfoPanel(false)} className="text-xoom-gray hover:text-xoom-dark">
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeChannel.description && (
              <div>
                <h4 className="text-xs font-semibold text-xoom-gray uppercase mb-1">Description</h4>
                <p className="text-sm text-xoom-dark">{activeChannel.description}</p>
              </div>
            )}
            <div>
              <h4 className="text-xs font-semibold text-xoom-gray uppercase mb-2">Members ({activeChannel.members.length})</h4>
              <div className="space-y-2">
                {activeChannel.members.map(memberId => {
                  const isUser = memberId === user.userId;
                  const contact = contacts.find(c => c.contactId === memberId);
                  const name = isUser ? user.username : (contact?.name || 'Unknown');
                  const avatar = isUser ? user.avatar : (contact?.avatar || '');
                  return (
                    <div key={memberId} className="flex items-center space-x-2">
                      <img src={avatar} alt="" className="w-7 h-7 rounded-full" />
                      <span className="text-sm text-xoom-dark">{name}</span>
                      {isUser && <span className="text-xs text-xoom-gray">(you)</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            {pinnedMessages.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-xoom-gray uppercase mb-1">Pinned Messages</h4>
                {pinnedMessages.map(m => (
                  <div key={m.messageId} className="text-xs text-xoom-dark bg-gray-50 rounded p-2 mb-1">
                    <span className="font-semibold">{m.senderName}:</span> {m.text.substring(0, 80)}{m.text.length > 80 ? '...' : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thread panel */}
      {showThreadPanel && activeChannel && (() => {
        const parentMsg = channelMessages.find(m => m.messageId === showThreadPanel);
        if (!parentMsg) return null;
        const threadReplies = channelMessages.filter(m => m.replyTo === showThreadPanel);
        return (
          <div className="w-80 bg-white border-l border-xoom-border flex flex-col shrink-0">
            <div className="h-12 flex items-center justify-between px-4 border-b border-xoom-border">
              <span className="font-semibold text-sm text-xoom-dark">Thread</span>
              <button onClick={() => setShowThreadPanel(null)} className="text-xoom-gray hover:text-xoom-dark">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Parent message */}
            <div className="px-4 py-3 border-b border-xoom-border bg-gray-50">
              <div className="flex space-x-2">
                <img src={parentMsg.senderAvatar} alt="" className="w-7 h-7 rounded-full shrink-0" />
                <div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xs font-semibold text-xoom-dark">{parentMsg.senderName}</span>
                    <span className="text-[10px] text-xoom-gray">{formatTimestamp(parentMsg.timestamp)}</span>
                  </div>
                  <p className="text-xs text-xoom-dark mt-0.5">{parentMsg.text}</p>
                </div>
              </div>
            </div>
            {/* Thread separator */}
            <div className="px-4 py-1.5 text-xs text-xoom-gray font-semibold border-b border-xoom-border">
              {threadReplies.length} {threadReplies.length === 1 ? 'reply' : 'replies'}
            </div>
            {/* Replies */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
              {threadReplies.map(reply => (
                <div key={reply.messageId} className="flex space-x-2">
                  <img src={reply.senderAvatar} alt="" className="w-7 h-7 rounded-full shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-xs font-semibold text-xoom-dark">{reply.senderName}</span>
                      <span className="text-[10px] text-xoom-gray">{formatTimestamp(reply.timestamp)}</span>
                    </div>
                    <p className="text-xs text-xoom-dark mt-0.5">{reply.text}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Thread reply composer */}
            <div className="px-3 pb-3 pt-1 border-t border-xoom-border">
              <div className="border border-xoom-border rounded-lg overflow-hidden focus-within:border-xoom-blue transition-colors">
                <textarea
                  value={threadReplyText}
                  onChange={e => setThreadReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleThreadReply(); } }}
                  placeholder="Reply in thread..."
                  className="w-full px-3 py-2 text-xs resize-none outline-none"
                  rows={2}
                />
                <div className="flex justify-end px-2 py-1.5 bg-gray-50">
                  <button
                    onClick={handleThreadReply}
                    disabled={!threadReplyText.trim()}
                    className={cn(
                      'p-1.5 rounded transition-colors',
                      threadReplyText.trim() ? 'text-white bg-xoom-blue hover:bg-blue-600' : 'text-xoom-gray bg-gray-200 cursor-not-allowed'
                    )}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete message confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs p-6">
            <h3 className="font-semibold text-xoom-dark mb-2">Delete Message</h3>
            <p className="text-sm text-xoom-gray mb-4">This will permanently delete this message. This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button
                onClick={() => { deleteMessage(activeChannelId, showDeleteConfirm); setShowDeleteConfirm(null); }}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-xoom-dark">Create Channel</h3>
              <button onClick={() => setShowCreateChannel(false)} className="text-gray-400 hover:text-gray-600">x</button>
            </div>
            <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name</label>
                <input
                  type="text"
                  required
                  value={newChannelName}
                  onChange={e => setNewChannelName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., marketing"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={e => setNewChannelDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="What is this channel about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel Type</label>
                <div className="flex space-x-3">
                  <label className={cn(
                    'flex-1 flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors',
                    !newChannelPrivate ? 'border-xoom-blue bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  )}>
                    <input
                      type="radio"
                      name="channelType"
                      checked={!newChannelPrivate}
                      onChange={() => setNewChannelPrivate(false)}
                      className="text-xoom-blue"
                    />
                    <Globe className="w-4 h-4 text-xoom-gray" />
                    <div>
                      <div className="text-sm font-medium text-xoom-dark">Public</div>
                      <div className="text-xs text-xoom-gray">Anyone can join</div>
                    </div>
                  </label>
                  <label className={cn(
                    'flex-1 flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors',
                    newChannelPrivate ? 'border-xoom-blue bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  )}>
                    <input
                      type="radio"
                      name="channelType"
                      checked={newChannelPrivate}
                      onChange={() => setNewChannelPrivate(true)}
                      className="text-xoom-blue"
                    />
                    <Lock className="w-4 h-4 text-xoom-gray" />
                    <div>
                      <div className="text-sm font-medium text-xoom-dark">Private</div>
                      <div className="text-xs text-xoom-gray">Invite only</div>
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowCreateChannel(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-xoom-blue rounded-lg hover:bg-blue-600">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ channel, isActive, onClick, displayName, avatar }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center px-4 py-1.5 text-sm transition-colors',
        isActive ? 'bg-xoom-hover text-xoom-blue' : 'text-xoom-dark hover:bg-gray-50'
      )}
    >
      {channel.type === 'channel' ? (
        <Hash className="w-4 h-4 mr-2 shrink-0 text-xoom-gray" />
      ) : avatar ? (
        <img src={avatar} alt="" className="w-5 h-5 rounded-full mr-2 shrink-0" />
      ) : (
        <Users className="w-4 h-4 mr-2 shrink-0 text-xoom-gray" />
      )}
      <span className="truncate flex-1 text-left">{displayName}</span>
      {channel.unreadCount > 0 && (
        <span className="ml-auto bg-xoom-blue text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium">
          {channel.unreadCount}
        </span>
      )}
    </button>
  );
}
