import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ServerList from './components/ServerList';
import ChannelList from './components/ChannelList';
import ChatArea from './components/ChatArea';
import MemberSidebar from './components/MemberSidebar';
import DMList from './components/DMList';
import FriendsDashboard from './components/FriendsDashboard';
import Go from './routes/Go';
import { useStore } from './store/useStore';
import { Hash, PlusCircle, Smile, Search, Volume2, Megaphone, X, Lock } from 'lucide-react';
import { cn } from './lib/utils';
import { format } from 'date-fns';

// Preserve query params (e.g. ?sid=xxx) when redirecting
function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function MainLayout() {
  return (
    <div className="flex h-screen bg-xiscord-bg text-white overflow-hidden font-sans">
      <ServerList />
      <Outlet />
    </div>
  );
}

function ServerLayout() {
  const ui = useStore((state) => state.ui);
  return (
    <>
      <ChannelList />
      <ChatArea />
      {ui?.memberSidebarVisible !== false && <MemberSidebar />}
    </>
  );
}

function DMLayout() {
  const { channelId } = useParams();

  return (
    <>
      <DMList />
      {channelId ? (
        <DMChatArea userId={channelId} />
      ) : (
        <FriendsDashboard />
      )}
    </>
  );
}

function DMChatArea({ userId }) {
  const [inputValue, setInputValue] = useState('');
  const [showMutualServers, setShowMutualServers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const store = useStore();
  const navigate = useNavigate();
  const user = store.users[userId];
  const sendDMMessage = store.sendDMMessage;
  const dmConversations = store.dmConversations || {};

  // Find the DM conversation for this user
  const dmConvo = Object.values(dmConversations).find(dm => dm.recipientId === userId);
  const dmMessages = dmConvo ? dmConvo.messages : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [dmMessages.length, userId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && dmConvo) {
        sendDMMessage(dmConvo.id, inputValue);
        setInputValue('');
      }
    }
  };

  if (!user) return <div className="flex-1 flex items-center justify-center text-xiscord-muted">User not found</div>;

  const statusColor = user.status === 'online' ? 'bg-xiscord-online' :
    user.status === 'idle' ? 'bg-xiscord-idle' :
    user.status === 'dnd' ? 'bg-xiscord-dnd' : 'bg-xiscord-offline';

  return (
    <div className="flex-1 flex flex-col bg-xiscord-bg min-w-0">
      {/* Header */}
      <div className="h-12 px-4 flex items-center shadow-sm border-b border-xiscord-darker shrink-0">
        <div className="flex items-center text-xiscord-muted mr-2">
          <span className="text-2xl mr-2">@</span>
        </div>
        <h3 className="font-bold text-white mr-4">{user.username}</h3>
        <div className={cn("w-2 h-2 rounded-full", statusColor)} title={user.status}></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-4 px-4">
        {/* Beginning of DM history */}
        <div className="mt-auto mb-6">
          <div className="w-20 h-20 rounded-full mb-4 overflow-hidden">
            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
          <p className="text-xiscord-muted">This is the beginning of your direct message history with <strong className="text-xiscord-modifier">@{user.username}</strong>.</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowMutualServers(!showMutualServers)}
              className="bg-xiscord-light hover:bg-xiscord-selected text-white px-3 py-1 rounded text-sm"
            >
              Mutual Servers
            </button>
            <button
              onClick={() => {
                store.removeDM(userId);
                navigate('/channels/@me');
              }}
              className="bg-xiscord-light hover:bg-xiscord-selected text-white px-3 py-1 rounded text-sm"
            >
              Remove Friend
            </button>
            <button
              onClick={() => {
                store.blockUser(userId);
                navigate('/channels/@me');
              }}
              className="bg-xiscord-light hover:bg-xiscord-selected text-white px-3 py-1 rounded text-sm"
            >
              Block
            </button>
          </div>
          {showMutualServers && (
            <div className="mt-3 bg-xiscord-darker rounded-lg p-3">
              <div className="text-xs font-bold text-xiscord-muted uppercase mb-2">Mutual Servers</div>
              {Object.values(store.servers).filter(s => s.members.includes(userId)).length > 0 ? (
                Object.values(store.servers).filter(s => s.members.includes(userId)).map(s => (
                  <div
                    key={s.id}
                    className="flex items-center px-2 py-1.5 rounded hover:bg-xiscord-light cursor-pointer"
                    onClick={() => navigate(`/channels/${s.id}/${s.channels[0]}`)}
                  >
                    <img src={s.icon} alt="" className="w-6 h-6 rounded-full mr-2" />
                    <span className="text-sm text-white">{s.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-xiscord-muted">No mutual servers.</p>
              )}
            </div>
          )}
        </div>

        {/* DM Messages */}
        {dmMessages.map(msg => {
          const msgUser = store.users[msg.userId];
          return (
            <div key={msg.id} className="flex px-0 py-1 hover:bg-xiscord-dark/30 mt-0.5">
              <div className="w-10 h-10 mr-4 shrink-0 mt-0.5">
                <img
                  src={msgUser?.avatar || 'https://picsum.photos/128/128'}
                  alt={msgUser?.username}
                  className="w-full h-full rounded-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="font-medium mr-2 text-white">
                    {msgUser?.username || 'Unknown User'}
                  </span>
                  <span className="text-xs text-xiscord-muted ml-1">
                    {format(new Date(msg.timestamp), 'MM/dd/yyyy h:mm aa')}
                  </span>
                </div>
                <div className="text-xiscord-lightest whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-6 pt-2 shrink-0">
        <div className="bg-xiscord-light rounded-lg px-4 py-2.5 flex items-center">
          <button
            className="text-xiscord-muted hover:text-xiscord-lightest mr-3"
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*,video/*,.pdf,.txt,.doc,.docx';
              fileInput.onchange = (e) => {
                const file = e.target.files?.[0];
                if (file && dmConvo) {
                  sendDMMessage(dmConvo.id, `[Attached: ${file.name}]`);
                }
              };
              fileInput.click();
            }}
            title="Upload a file"
          >
            <PlusCircle size={24} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message @${user.username}`}
            className="bg-transparent flex-1 outline-none text-xiscord-lightest placeholder-xiscord-muted/70"
          />
          <div className="relative">
            <Smile
              size={24}
              className={cn("cursor-pointer hover:text-xiscord-lightest", showEmojiPicker ? "text-xiscord-blurple" : "text-xiscord-muted")}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            {showEmojiPicker && (
              <div className="absolute bottom-10 right-0 w-64 bg-xiscord-dark border border-xiscord-darker rounded-lg shadow-xl p-2 z-50">
                <div className="grid grid-cols-7 gap-1 h-48 overflow-y-auto custom-scrollbar">
                  {['😀','😂','😍','🔥','👍','👎','🎉','❤️','😎','🤔','😭','👀','✨','🚀','💯','💩','🤡','👻','💀','👽','🤖','🎃','🎄','🎁','🎈','💪','🙏','🤝','👋','😤','🥳','😱','🫡','💜','🧡','💚','💙','🖤','🤍','⭐','🏆','💎','🫠','😮','🤯','🥺','😈','👑','🎵','🎮'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => { setInputValue(prev => prev + emoji); setShowEmojiPicker(false); }}
                      className="hover:bg-xiscord-light rounded p-1 text-xl flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Switcher Component
function QuickSwitcher({ onClose }) {
  const navigate = useNavigate();
  const store = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Build results list
  const results = React.useMemo(() => {
    const items = [];
    const q = query.toLowerCase();

    // Servers
    Object.values(store.servers).forEach(server => {
      if (!q || server.name.toLowerCase().includes(q)) {
        items.push({
          type: 'server',
          id: server.id,
          name: server.name,
          icon: server.icon,
          path: `/channels/${server.id}`
        });
      }
      // Channels
      (server.channels || []).forEach(chId => {
        const ch = store.channels[chId];
        if (ch && (!q || ch.name.toLowerCase().includes(q))) {
          items.push({
            type: 'channel',
            id: ch.id,
            name: ch.name,
            channelType: ch.type,
            serverName: server.name,
            path: `/channels/${server.id}/${ch.id}`
          });
        }
      });
    });

    // DMs
    Object.values(store.dmConversations || {}).forEach(dm => {
      const user = store.users[dm.recipientId];
      if (user && (!q || user.username.toLowerCase().includes(q))) {
        items.push({
          type: 'dm',
          id: dm.id,
          name: user.username,
          avatar: user.avatar,
          path: `/channels/@me/${dm.recipientId}`
        });
      }
    });

    return items.slice(0, 10);
  }, [query, store.servers, store.channels, store.dmConversations, store.users]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(results[selectedIndex].path);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/70" onClick={onClose}>
      <div className="w-[560px] bg-xiscord-dark rounded-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4">
          <div className="flex items-center bg-xiscord-darker rounded-lg px-3 py-2">
            <Search size={20} className="text-xiscord-muted mr-2 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Where would you like to go?"
              className="bg-transparent flex-1 outline-none text-xiscord-lightest placeholder-xiscord-muted text-lg"
            />
          </div>
        </div>

        {results.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto pb-2 px-2">
            {!query && <div className="text-xs font-bold text-xiscord-muted uppercase px-3 py-1.5">Recent</div>}
            {results.map((item, idx) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => { navigate(item.path); onClose(); }}
                className={cn(
                  "flex items-center px-3 py-2 rounded cursor-pointer",
                  idx === selectedIndex ? "bg-xiscord-light" : "hover:bg-xiscord-light/50"
                )}
              >
                {item.type === 'server' && (
                  <>
                    <img src={item.icon} alt="" className="w-6 h-6 rounded-full mr-3" />
                    <span className="text-white font-medium">{item.name}</span>
                    <span className="text-xs text-xiscord-muted ml-2">Server</span>
                  </>
                )}
                {item.type === 'channel' && (
                  <>
                    {item.channelType === 'voice' ? (
                      <Volume2 size={18} className="text-xiscord-muted mr-3 shrink-0" />
                    ) : (
                      <Hash size={18} className="text-xiscord-muted mr-3 shrink-0" />
                    )}
                    <span className="text-white">{item.name}</span>
                    <span className="text-xs text-xiscord-muted ml-2">{item.serverName}</span>
                  </>
                )}
                {item.type === 'dm' && (
                  <>
                    <img src={item.avatar} alt="" className="w-6 h-6 rounded-full mr-3" />
                    <span className="text-white">{item.name}</span>
                    <span className="text-xs text-xiscord-muted ml-2">DM</span>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="p-8 text-center text-xiscord-muted">
            <p>No results found for "{query}"</p>
          </div>
        ) : null}

        <div className="border-t border-xiscord-divider px-4 py-2 flex items-center text-xs text-xiscord-muted">
          <span className="bg-xiscord-darker px-1.5 py-0.5 rounded text-[10px] mr-1 font-mono">TAB</span> or
          <span className="bg-xiscord-darker px-1.5 py-0.5 rounded text-[10px] mx-1 font-mono">&uarr;&darr;</span> to navigate
          <span className="bg-xiscord-darker px-1.5 py-0.5 rounded text-[10px] mx-1 font-mono">ENTER</span> to select
          <span className="bg-xiscord-darker px-1.5 py-0.5 rounded text-[10px] mx-1 font-mono">ESC</span> to dismiss
        </div>
      </div>
    </div>
  );
}

// Channel Creation Modal
function ChannelCreationModal({ serverId, onClose }) {
  const store = useStore();
  const navigate = useNavigate();
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('text');
  const [isPrivate, setIsPrivate] = useState(false);
  const server = store.servers[serverId];

  const handleCreate = () => {
    if (!channelName.trim()) return;
    store.createChannel(serverId, channelName, channelType, isPrivate ? 'PRIVATE CHANNELS' : 'TEXT CHANNELS');
    onClose();
  };

  // Auto-format: lowercase, replace spaces with hyphens
  const handleNameChange = (e) => {
    setChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="w-[460px] bg-xiscord-dark rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-1">Create Channel</h2>
          <p className="text-sm text-xiscord-muted mb-4">in {server?.name}</p>

          <div className="mb-4">
            <label className="text-xs font-bold text-xiscord-muted uppercase block mb-2">Channel Type</label>
            <div className="space-y-2">
              <label
                className={cn(
                  "flex items-center p-3 rounded-lg cursor-pointer border",
                  channelType === 'text' ? "border-xiscord-muted bg-xiscord-light/30" : "border-transparent bg-xiscord-darker hover:bg-xiscord-light/20"
                )}
                onClick={() => setChannelType('text')}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center shrink-0",
                  channelType === 'text' ? "border-xiscord-blurple" : "border-xiscord-muted"
                )}>
                  {channelType === 'text' && <div className="w-2.5 h-2.5 rounded-full bg-xiscord-blurple" />}
                </div>
                <Hash size={20} className="text-xiscord-muted mr-2 shrink-0" />
                <div>
                  <div className="text-white font-medium text-sm">Text</div>
                  <div className="text-xs text-xiscord-muted">Send messages, images, GIFs, emoji, opinions, and puns</div>
                </div>
              </label>
              <label
                className={cn(
                  "flex items-center p-3 rounded-lg cursor-pointer border",
                  channelType === 'voice' ? "border-xiscord-muted bg-xiscord-light/30" : "border-transparent bg-xiscord-darker hover:bg-xiscord-light/20"
                )}
                onClick={() => setChannelType('voice')}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center shrink-0",
                  channelType === 'voice' ? "border-xiscord-blurple" : "border-xiscord-muted"
                )}>
                  {channelType === 'voice' && <div className="w-2.5 h-2.5 rounded-full bg-xiscord-blurple" />}
                </div>
                <Volume2 size={20} className="text-xiscord-muted mr-2 shrink-0" />
                <div>
                  <div className="text-white font-medium text-sm">Voice</div>
                  <div className="text-xs text-xiscord-muted">Hang out together with voice, video, and screen share</div>
                </div>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-xiscord-muted uppercase block mb-2">Channel Name</label>
            <div className="flex items-center bg-xiscord-darker rounded px-3 py-2">
              {channelType === 'text' ? (
                <Hash size={18} className="text-xiscord-muted mr-2 shrink-0" />
              ) : (
                <Volume2 size={18} className="text-xiscord-muted mr-2 shrink-0" />
              )}
              <input
                type="text"
                value={channelName}
                onChange={handleNameChange}
                placeholder="new-channel"
                className="bg-transparent flex-1 outline-none text-xiscord-lightest placeholder-xiscord-muted text-sm"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <Lock size={16} className="text-xiscord-muted mr-2" />
              <div>
                <div className="text-xiscord-lightest text-sm font-medium">Private Channel</div>
                <div className="text-xs text-xiscord-muted">Only selected members and roles will be able to view this channel.</div>
              </div>
            </div>
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className={cn(
                "w-10 h-6 rounded-full transition-colors relative shrink-0 ml-2",
                isPrivate ? "bg-xiscord-green" : "bg-xiscord-muted/40"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full bg-white absolute top-1 transition-all",
                isPrivate ? "left-5" : "left-1"
              )} />
            </button>
          </div>
        </div>
        <div className="bg-xiscord-darker p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!channelName.trim()}
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded",
              channelName.trim() ? "bg-xiscord-blurple hover:bg-xiscord-blurple/80" : "bg-xiscord-blurple/50 cursor-not-allowed"
            )}
          >
            Create Channel
          </button>
        </div>
      </div>
    </div>
  );
}

// Server Creation Modal
function ServerCreationModal({ onClose }) {
  const store = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState('choose'); // 'choose' | 'create' | 'join'
  const [serverName, setServerName] = useState(`${store.currentUser.username}'s server`);
  const [serverIconPreview, setServerIconPreview] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState(null);

  const handleCreate = () => {
    if (!serverName.trim()) return;
    const newId = store.createServer(serverName, serverIconPreview);
    navigate(`/channels/${newId}`);
    onClose();
  };

  const handleJoinServer = () => {
    if (!inviteCode.trim()) return;
    // Simulate joining: find a server by ID or fake an invite
    const allServers = Object.values(store.servers);
    const found = allServers.find(s => s.inviteCode === inviteCode.trim() || s.id === inviteCode.trim());
    if (found) {
      navigate(`/channels/${found.id}`);
      onClose();
    } else {
      setJoinError('Invalid invite code or link. Try "gang" or any server ID.');
    }
  };

  const handleIconClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setServerIconPreview(url);
      }
    };
    fileInput.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="w-[440px] bg-xiscord-dark rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {step === 'choose' ? (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Create a server</h2>
            <p className="text-xiscord-muted text-sm mb-6">Your server is where you and your friends hang out. Make yours and start talking.</p>
            <button
              onClick={() => setStep('create')}
              className="w-full text-left px-4 py-3 bg-xiscord-bg hover:bg-xiscord-light rounded-lg border border-xiscord-divider mb-3 flex items-center justify-between group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-xiscord-light rounded-full flex items-center justify-center mr-3 group-hover:bg-xiscord-selected">
                  <span className="text-2xl">🎮</span>
                </div>
                <span className="text-white font-medium">Create My Own</span>
              </div>
              <span className="text-xiscord-muted text-xl">&rarr;</span>
            </button>
            <button
              onClick={() => setStep('join')}
              className="w-full text-left px-4 py-3 bg-xiscord-bg hover:bg-xiscord-light rounded-lg border border-xiscord-divider flex items-center justify-between group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-xiscord-light rounded-full flex items-center justify-center mr-3 group-hover:bg-xiscord-selected">
                  <span className="text-2xl">🔗</span>
                </div>
                <span className="text-white font-medium">Join a Server</span>
              </div>
              <span className="text-xiscord-muted text-xl">&rarr;</span>
            </button>
          </div>
        ) : step === 'join' ? (
          <>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-1 text-center">Join a Server</h2>
              <p className="text-xiscord-muted text-sm mb-6 text-center">Enter an invite code to join an existing server.</p>
              <label className="text-xs font-bold text-xiscord-muted uppercase block mb-2">Invite Link</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => { setInviteCode(e.target.value); setJoinError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleJoinServer(); }}
                placeholder="xiscord.gg/hTKzmak"
                className="w-full bg-xiscord-darker text-xiscord-lightest px-3 py-2 rounded outline-none border border-xiscord-darker focus:border-xiscord-blurple text-sm"
                autoFocus
              />
              {joinError && <p className="text-xiscord-red text-xs mt-2">{joinError}</p>}
            </div>
            <div className="bg-xiscord-darker p-4 flex justify-between">
              <button onClick={() => setStep('choose')} className="px-4 py-2 text-sm text-white hover:underline">Back</button>
              <button
                onClick={handleJoinServer}
                disabled={!inviteCode.trim()}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-white rounded",
                  inviteCode.trim() ? "bg-xiscord-blurple hover:bg-xiscord-blurple/80" : "bg-xiscord-blurple/50 cursor-not-allowed"
                )}
              >
                Join Server
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Customize your server</h2>
              <p className="text-xiscord-muted text-sm mb-6">Give your new server a personality with a name and an icon. You can always change it later.</p>
              <div className="flex justify-center mb-6">
                <div
                  className="w-20 h-20 rounded-full bg-xiscord-light border-2 border-dashed border-xiscord-muted flex items-center justify-center cursor-pointer hover:border-xiscord-lightest overflow-hidden"
                  onClick={handleIconClick}
                >
                  {serverIconPreview ? (
                    <img src={serverIconPreview} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-xiscord-muted">{serverName.charAt(0).toUpperCase()}</div>
                      <div className="text-[9px] text-xiscord-muted uppercase font-bold">Upload</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-left">
                <label className="text-xs font-bold text-xiscord-muted uppercase block mb-2">Server Name</label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full bg-xiscord-darker text-xiscord-lightest px-3 py-2 rounded outline-none border border-xiscord-darker focus:border-xiscord-blurple"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-xiscord-muted mt-4 text-left">By creating a server, you agree to Xiscord's <span className="text-xiscord-blurple">Community Guidelines</span>.</p>
            </div>
            <div className="bg-xiscord-darker p-4 flex justify-between">
              <button
                onClick={() => setStep('choose')}
                className="px-4 py-2 text-sm font-medium text-white hover:underline"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!serverName.trim()}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-white rounded",
                  serverName.trim() ? "bg-xiscord-blurple hover:bg-xiscord-blurple/80" : "bg-xiscord-blurple/50 cursor-not-allowed"
                )}
              >
                Create
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Keyboard Shortcuts Modal
function KeyboardShortcutsModal({ onClose }) {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], desc: 'Quick Switcher' },
    { keys: ['Ctrl', 'Shift', 'M'], desc: 'Toggle Mute' },
    { keys: ['Escape'], desc: 'Mark Channel as Read' },
    { keys: ['Ctrl', '/'], desc: 'Keyboard Shortcuts' },
    { keys: ['Up'], desc: 'Edit Last Message (when input empty)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="w-[660px] bg-xiscord-dark rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
            <button onClick={onClose} className="text-xiscord-muted hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {shortcuts.map((sc, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-xiscord-lightest">{sc.desc}</span>
                <div className="flex items-center gap-1">
                  {sc.keys.map((key, ki) => (
                    <React.Fragment key={ki}>
                      {ki > 0 && <span className="text-xiscord-muted text-xs">+</span>}
                      <kbd className="bg-xiscord-darker text-xiscord-lightest text-xs px-2 py-1 rounded border border-xiscord-divider font-mono min-w-[28px] text-center">
                        {key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// App-level modals wrapper that needs router context
function AppWithModals() {
  const navigate = useNavigate();
  const store = useStore();
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+K / Cmd+K - Quick Switcher
      if (mod && e.key === 'k') {
        e.preventDefault();
        setShowQuickSwitcher(prev => !prev);
        return;
      }

      // Ctrl+/ - Keyboard Shortcuts
      if (mod && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
        return;
      }

      // Ctrl+Shift+M - Toggle mute
      if (mod && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        store.toggleMute();
        return;
      }

      // Escape - close modals or mark channel as read
      if (e.key === 'Escape') {
        if (showQuickSwitcher) { setShowQuickSwitcher(false); return; }
        if (showKeyboardShortcuts) { setShowKeyboardShortcuts(false); return; }
        // Mark current channel as read when no modal is open
        const pathMatch = window.location.pathname.match(/\/channels\/[^/]+\/([^/]+)/);
        if (pathMatch && pathMatch[1] !== '@me') {
          store.markChannelAsRead(pathMatch[1]);
        }
        return;
      }

      // Up arrow when input is empty - edit last own message
      if (e.key === 'ArrowUp' && !mod && !e.shiftKey) {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && activeEl.value === '') {
          const pathMatch = window.location.pathname.match(/\/channels\/[^/]+\/([^/]+)/);
          if (pathMatch) {
            const chId = pathMatch[1];
            const channelMessages = Object.values(store.messages || {})
              .filter(m => m.channelId === chId && m.userId === store.currentUser.id)
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            if (channelMessages.length > 0) {
              window.dispatchEvent(new CustomEvent('xiscord-edit-last-message', { detail: { messageId: channelMessages[0].id } }));
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQuickSwitcher, showKeyboardShortcuts, store]);

  return (
    <>
      <Routes>
        <Route path="/go" element={<Go />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<RedirectWithQuery to="/channels/@me" />} />

          <Route path="channels/@me" element={<DMLayout />} />
          <Route path="channels/@me/:channelId" element={<DMLayout />} />

          <Route path="channels/:serverId" element={<div className="flex-1 flex"><ChannelList /><div className="flex-1 bg-xiscord-bg flex items-center justify-center text-xiscord-modifier">Select a channel</div></div>} />

          <Route path="channels/:serverId/:channelId" element={<ServerLayout />} />
        </Route>
      </Routes>

      {showQuickSwitcher && <QuickSwitcher onClose={() => setShowQuickSwitcher(false)} />}
      {showKeyboardShortcuts && <KeyboardShortcutsModal onClose={() => setShowKeyboardShortcuts(false)} />}
      {store.ui?.channelCreationServerId && (
        <ChannelCreationModal
          serverId={store.ui.channelCreationServerId}
          onClose={() => store.hideChannelCreationModal()}
        />
      )}
      {store.ui?.serverCreationModalOpen && (
        <ServerCreationModal onClose={() => store.hideServerCreationModal()} />
      )}
    </>
  );
}

export default function App() {
  const store = useStore();
  const isLoading = store._loading;

  // Hydrate the store on mount (session-aware)
  useEffect(() => {
    store._hydrate();
  }, []);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-xiscord-bg text-white">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <AppWithModals />
    </BrowserRouter>
  );
}
