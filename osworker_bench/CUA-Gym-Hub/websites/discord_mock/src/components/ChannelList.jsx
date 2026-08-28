import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Hash, Volume2, ChevronDown, ChevronRight, Plus, Settings, Mic, MicOff, Headphones, VolumeX, PhoneOff, Signal, Megaphone, BellOff, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import UserSettings from './UserSettings';
import ServerSettings from './ServerSettings';

function ServerNotifModal({ server, store, onClose }) {
  const userSettings = store.userSettings || {};
  const settingKey = `serverNotif_${server.id}`;
  const currentSetting = userSettings[settingKey] || 'mentions';
  const [selected, setSelected] = useState(currentSetting);

  const handleSave = () => {
    store.updateUserSettings({ [settingKey]: selected });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-[340px] bg-xiscord-dark rounded-lg shadow-2xl p-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-bold mb-3">Server Notification Settings</h3>
        <p className="text-xs text-xiscord-muted mb-3">{server.name}</p>
        <div className="space-y-2">
          {[
            { label: 'All messages', value: 'all' },
            { label: 'Only @mentions', value: 'mentions' },
            { label: 'Nothing', value: 'nothing' },
          ].map(opt => (
            <label
              key={opt.value}
              className="flex items-center cursor-pointer group"
              onClick={() => setSelected(opt.value)}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center",
                selected === opt.value ? "border-xiscord-blurple" : "border-xiscord-muted"
              )}>
                {selected === opt.value && <div className="w-2 h-2 rounded-full bg-xiscord-blurple" />}
              </div>
              <span className="text-xiscord-lightest text-sm group-hover:text-white">{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-xiscord-muted/20 hover:bg-xiscord-muted/30 text-white text-sm font-medium py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-xiscord-blurple hover:bg-xiscord-blurple/80 text-white text-sm font-medium py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ChannelContextMenuOverlay({ x, y, channel, onClose, onMarkAsRead, onNotificationSettings }) {
  React.useEffect(() => {
    const handleClick = () => onClose();
    const handleCtx = (e) => { e.preventDefault(); onClose(); };
    window.addEventListener('click', handleClick);
    window.addEventListener('contextmenu', handleCtx);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('contextmenu', handleCtx);
    };
  }, [onClose]);

  const menuStyle = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - 200),
    zIndex: 100
  };

  return (
    <div style={menuStyle} className="min-w-[188px] bg-[#111214] rounded-lg shadow-xl border border-[#2e2f34] py-1.5" onClick={e => e.stopPropagation()}>
      <button
        onClick={(e) => { e.stopPropagation(); onMarkAsRead(); }}
        className="w-full text-left px-3 py-1.5 text-sm text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white rounded mx-1.5"
        style={{ width: 'calc(100% - 12px)' }}
      >
        Mark as Read
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNotificationSettings(); }}
        className="w-full text-left px-3 py-1.5 text-sm text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white rounded mx-1.5"
        style={{ width: 'calc(100% - 12px)' }}
      >
        Notification Settings
      </button>
      <div className="h-px bg-[#2e2f34] my-1 mx-2" />
      <button
        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`#${channel.name}`); onClose(); }}
        className="w-full text-left px-3 py-1.5 text-sm text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white rounded mx-1.5"
        style={{ width: 'calc(100% - 12px)' }}
      >
        Copy Channel Link
      </button>
    </div>
  );
}

export default function ChannelList() {
  const { serverId, channelId } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const server = store.servers[serverId];
  const currentUser = store.currentUser;
  const activeVoiceChannelId = store.activeVoiceChannel;
  const markChannelAsRead = store.markChannelAsRead;

  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showCustomStatusModal, setShowCustomStatusModal] = useState(false);
  const [customStatusText, setCustomStatusText] = useState('');
  const [customStatusEmoji, setCustomStatusEmoji] = useState('');
  const [customStatusClearAfter, setCustomStatusClearAfter] = useState('dont_clear');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showServerNotifSettings, setShowServerNotifSettings] = useState(false);
  const [channelContextMenu, setChannelContextMenu] = useState(null);
  const [notificationPopover, setNotificationPopover] = useState(null);
  const [dragState, setDragState] = useState(null); // { channelId, category, fromIndex }
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Mark channel as read when switching to it
  useEffect(() => {
    if (channelId) {
      markChannelAsRead(channelId);
    }
  }, [channelId]);

  if (!server) return null;

  const serverChannels = server.channels.map(id => store.channels[id]).filter(Boolean);

  // Use server categories if available, otherwise group by channel.category
  const categoryOrder = server.categories
    ? server.categories.map(cat => cat.name)
    : [...new Set(serverChannels.map(ch => ch.category || 'Uncategorized'))];

  const channelsByCategory = {};
  if (server.categories) {
    server.categories.forEach(cat => {
      channelsByCategory[cat.name] = cat.channelIds.map(id => store.channels[id]).filter(Boolean);
    });
  } else {
    serverChannels.forEach(ch => {
      const cat = ch.category || 'Uncategorized';
      if (!channelsByCategory[cat]) channelsByCategory[cat] = [];
      channelsByCategory[cat].push(ch);
    });
  }

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleCreateChannel = () => {
    store.showChannelCreationModal(serverId);
  };

  const handleVoiceChannelClick = (channel) => {
    if (activeVoiceChannelId === channel.id) {
      navigate(`/channels/${serverId}/${channel.id}`);
    } else {
      store.joinVoice(channel.id);
      navigate(`/channels/${serverId}/${channel.id}`);
    }
  };

  const activeVoiceChannel = activeVoiceChannelId ? store.channels[activeVoiceChannelId] : null;

  return (
    <div className="w-60 bg-xiscord-dark flex flex-col shrink-0 h-full">
      {/* Server Header */}
      <div className="relative">
        <div
          className="h-12 px-4 flex items-center justify-between shadow-sm hover:bg-xiscord-light transition-colors cursor-pointer border-b border-xiscord-darker shrink-0"
          onClick={() => setShowServerDropdown(!showServerDropdown)}
        >
          <h1 className="font-bold text-white truncate">{server.name}</h1>
          <ChevronDown size={16} className={cn("text-xiscord-lightest transition-transform", showServerDropdown && "rotate-180")} />
        </div>
        {showServerDropdown && (
          <div className="absolute top-full left-2 right-2 mt-1 bg-[#111214] rounded-lg shadow-xl border border-xiscord-divider z-50 p-1.5" onMouseLeave={() => setShowServerDropdown(false)}>
            <button
              onClick={() => { setShowServerSettings(true); setShowServerDropdown(false); }}
              className="w-full text-left px-2 py-1.5 text-sm text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white rounded flex items-center"
            >
              <Settings size={14} className="mr-2" /> Server Settings
            </button>
            <button
              onClick={() => { handleCreateChannel(); setShowServerDropdown(false); }}
              className="w-full text-left px-2 py-1.5 text-sm text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white rounded flex items-center"
            >
              <Plus size={14} className="mr-2" /> Create Channel
            </button>
            <div className="h-px bg-xiscord-divider my-1" />
            <button
              onClick={() => { setShowInviteModal(true); setShowServerDropdown(false); }}
              className="w-full text-left px-2 py-1.5 text-sm text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white rounded flex items-center"
            >
              <UserPlus size={14} className="mr-2" /> Invite People
            </button>
            <button
              onClick={() => { setShowServerNotifSettings(true); setShowServerDropdown(false); }}
              className="w-full text-left px-2 py-1.5 text-sm text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white rounded"
            >
              Notification Settings
            </button>
          </div>
        )}
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
        {categoryOrder.map(category => {
          const channels = channelsByCategory[category] || [];
          if (channels.length === 0) return null;

          // Category unread count
          const categoryUnread = channels.reduce((sum, ch) => sum + (ch.unreadCount || 0), 0);

          return (
            <div key={category}>
              <div
                className="flex items-center justify-between px-0.5 mb-1 text-xs font-bold text-xiscord-muted uppercase hover:text-xiscord-lightest cursor-pointer group"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center flex-1">
                  {collapsedCategories[category] ? (
                    <ChevronRight size={12} className="mr-0.5" />
                  ) : (
                    <ChevronDown size={12} className="mr-0.5" />
                  )}
                  {category}
                  {categoryUnread > 0 && (
                    <span className="ml-1 text-xiscord-lightest">({categoryUnread})</span>
                  )}
                </div>
                <Plus
                  size={14}
                  className="cursor-pointer hover:text-white opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateChannel();
                  }}
                />
              </div>

              {!collapsedCategories[category] && (
                <div className="space-y-[2px]">
                  {channels.map((channel, chIdx) => {
                    const isVoice = channel.type === 'voice';
                    const isAnnouncement = channel.type === 'announcement';
                    const isActive = channelId === channel.id;
                    const isConnected = activeVoiceChannelId === channel.id;
                    const hasUnread = (channel.unreadCount || 0) > 0;
                    const isMuted = channel.muted || channel.notificationSetting === 'nothing';

                    return (
                      <div key={channel.id}>
                        {/* Drag drop indicator */}
                        {dragState && dragState.category === category && dragOverIndex === chIdx && (
                          <div className="h-0.5 bg-xiscord-blurple mx-2 rounded" />
                        )}
                        <div
                          draggable
                          onDragStart={(e) => {
                            setDragState({ channelId: channel.id, category, fromIndex: chIdx });
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragState && dragState.category === category) {
                              setDragOverIndex(chIdx);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (dragState && dragState.category === category && dragState.fromIndex !== chIdx) {
                              store.reorderChannel(serverId, category, dragState.fromIndex, chIdx);
                            }
                            setDragState(null);
                            setDragOverIndex(null);
                          }}
                          onDragEnd={() => { setDragState(null); setDragOverIndex(null); }}
                          onClick={() => {
                            if (isVoice) {
                              handleVoiceChannelClick(channel);
                            } else {
                              navigate(`/channels/${serverId}/${channel.id}`);
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setChannelContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              channel
                            });
                          }}
                          className={cn(
                            "flex items-center px-2 py-1.5 rounded mx-1 cursor-pointer group",
                            isActive
                              ? "bg-xiscord-selected text-white"
                              : hasUnread
                                ? "text-white hover:bg-xiscord-light/50"
                                : "text-xiscord-muted hover:bg-xiscord-light/50 hover:text-xiscord-lightest",
                            dragState?.channelId === channel.id && "opacity-50"
                          )}
                        >
                          {isVoice ? (
                            <Volume2 size={20} className="mr-1.5 text-xiscord-muted shrink-0" />
                          ) : isAnnouncement ? (
                            <Megaphone size={20} className="mr-1.5 text-xiscord-muted shrink-0" />
                          ) : (
                            <Hash size={20} className="mr-1.5 text-xiscord-muted shrink-0" />
                          )}
                          <span className={cn(
                            "truncate flex-1",
                            hasUnread && !isActive ? "font-bold" : "font-medium",
                            isConnected && "text-white",
                            isMuted && "line-through opacity-60"
                          )}>
                            {channel.name}
                          </span>
                          {isMuted && (
                            <BellOff size={14} className="text-xiscord-muted shrink-0 ml-1" />
                          )}
                          {hasUnread && !isActive && (
                            <span className="ml-auto bg-xiscord-muted text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 shrink-0">
                              {channel.unreadCount}
                            </span>
                          )}
                        </div>

                        {/* Voice Participants List */}
                        {isVoice && isConnected && (
                          <div className="pl-9 pr-2 py-1 space-y-1">
                            <div className="flex items-center group cursor-pointer">
                              <img src={currentUser.avatar} className="w-6 h-6 rounded-full mr-2 border-2 border-xiscord-dark" alt="" />
                              <span className="text-white text-sm truncate font-medium">{currentUser.username}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Voice Connection Status Panel */}
      {activeVoiceChannel && (
        <div className="bg-xiscord-darker border-b border-xiscord-bg px-2 py-2 flex items-center shrink-0">
          <div className="text-xiscord-green mr-2">
            <Signal size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xiscord-green text-xs font-bold uppercase">Voice Connected</div>
            <div className="text-xiscord-lightest text-xs truncate">{activeVoiceChannel.name} / {server.name}</div>
          </div>
          <button
            onClick={() => store.leaveVoice()}
            className="p-1.5 rounded hover:bg-xiscord-light text-xiscord-lightest hover:text-white"
            title="Disconnect"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      )}

      {/* User Controls */}
      <div className="h-[52px] bg-xiscord-darker px-2 flex items-center shrink-0 relative">
        <div className="group relative mr-2 cursor-pointer" onClick={() => setShowStatusMenu(!showStatusMenu)}>
          <div className="relative">
            <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full" />
            <div className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-xiscord-darker",
              currentUser.status === 'online' ? "bg-xiscord-online" :
              currentUser.status === 'idle' ? "bg-xiscord-idle" :
              currentUser.status === 'dnd' ? "bg-xiscord-dnd" : "bg-xiscord-offline"
            )} />
          </div>
        </div>
        <div className="flex-1 min-w-0 mr-1">
          <div className="text-sm font-medium text-white truncate">{currentUser.username}</div>
          <div className="text-xs text-xiscord-muted truncate">
            {currentUser.customStatus || `#${currentUser.discriminator}`}
          </div>
        </div>

        {/* Status Menu */}
        {showStatusMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-[300px] bg-[#111214] rounded-lg shadow-xl border border-xiscord-divider z-50 p-2" onMouseLeave={() => setShowStatusMenu(false)}>
            <div className="px-2 py-1.5 mb-1">
              <div className="flex items-center mb-2">
                <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <div className="font-bold text-white">{currentUser.username}</div>
                  <div className="text-xs text-xiscord-muted">#{currentUser.discriminator}</div>
                </div>
              </div>
            </div>
            <div className="h-px bg-xiscord-divider mx-1 my-1" />
            {[
              { status: 'online', label: 'Online', color: 'bg-xiscord-online', icon: <div className="w-3 h-3 rounded-full bg-xiscord-online" /> },
              { status: 'idle', label: 'Idle', color: 'bg-xiscord-idle', icon: <div className="w-3 h-3 rounded-full bg-xiscord-idle relative"><div className="absolute top-0 left-0 w-2 h-2 bg-[#111214] rounded-full" /></div> },
              { status: 'dnd', label: 'Do Not Disturb', color: 'bg-xiscord-dnd', icon: <div className="w-3 h-3 rounded-full bg-xiscord-dnd flex items-center justify-center"><div className="w-1.5 h-0.5 bg-[#111214] rounded-full" /></div> },
              { status: 'offline', label: 'Invisible', color: 'bg-xiscord-offline', icon: <div className="w-3 h-3 rounded-full border-2 border-xiscord-offline bg-transparent" /> },
            ].map(opt => (
              <button
                key={opt.status}
                onClick={() => {
                  store.updateUserStatus(opt.status);
                  setShowStatusMenu(false);
                }}
                className={cn(
                  "w-full text-left px-2 py-1.5 text-sm rounded flex items-center",
                  currentUser.status === opt.status
                    ? "bg-xiscord-blurple text-white"
                    : "text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white"
                )}
              >
                <span className="mr-3 flex items-center justify-center w-4">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
            <div className="h-px bg-xiscord-divider mx-1 my-1" />
            <button
              onClick={() => { setShowCustomStatusModal(true); setShowStatusMenu(false); }}
              className="w-full text-left px-2 py-1.5 text-sm text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white rounded"
            >
              Set Custom Status
            </button>
            {currentUser.customStatus && (
              <button
                onClick={() => { store.updateCustomStatus(''); setShowStatusMenu(false); }}
                className="w-full text-left px-2 py-1.5 text-sm text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white rounded"
              >
                Clear Custom Status
              </button>
            )}
          </div>
        )}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => store.toggleMute()}
            className={cn("p-1.5 rounded hover:bg-xiscord-light", currentUser.isMuted ? "text-xiscord-red" : "text-xiscord-lightest")}
            title={currentUser.isMuted ? "Unmute" : "Mute"}
          >
            {currentUser.isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            onClick={() => store.toggleDeafen()}
            className={cn("p-1.5 rounded hover:bg-xiscord-light", currentUser.isDeafened ? "text-xiscord-red" : "text-xiscord-lightest")}
            title={currentUser.isDeafened ? "Undeafen" : "Deafen"}
          >
            {currentUser.isDeafened ? <VolumeX size={18} /> : <Headphones size={18} />}
          </button>
          <button
            onClick={() => setShowUserSettings(true)}
            className="p-1.5 rounded hover:bg-xiscord-light text-xiscord-lightest"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showUserSettings && <UserSettings onClose={() => setShowUserSettings(false)} />}
      {showServerSettings && <ServerSettings serverId={serverId} onClose={() => setShowServerSettings(false)} />}

      {/* Channel Context Menu */}
      {channelContextMenu && (
        <ChannelContextMenuOverlay
          x={channelContextMenu.x}
          y={channelContextMenu.y}
          channel={channelContextMenu.channel}
          onClose={() => setChannelContextMenu(null)}
          onMarkAsRead={() => { markChannelAsRead(channelContextMenu.channel.id); setChannelContextMenu(null); }}
          onNotificationSettings={() => { setNotificationPopover(channelContextMenu.channel); setChannelContextMenu(null); }}
        />
      )}

      {/* Notification Settings Popover */}
      {notificationPopover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setNotificationPopover(null)}>
          <div className="w-[300px] bg-xiscord-dark rounded-lg shadow-2xl p-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-3">Notification Settings</h3>
            <p className="text-xs text-xiscord-muted mb-3">#{notificationPopover.name}</p>
            <div className="space-y-2">
              {[
                { label: 'Use server default', value: 'default' },
                { label: 'All messages', value: 'all' },
                { label: 'Only @mentions', value: 'mentions' },
                { label: 'Nothing', value: 'nothing' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className="flex items-center cursor-pointer group"
                  onClick={() => {
                    store.setChannelNotification(notificationPopover.id, opt.value);
                    setNotificationPopover({ ...notificationPopover, notificationSetting: opt.value });
                  }}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center",
                    (notificationPopover.notificationSetting || 'default') === opt.value ? "border-xiscord-blurple" : "border-xiscord-muted"
                  )}>
                    {(notificationPopover.notificationSetting || 'default') === opt.value && <div className="w-2 h-2 rounded-full bg-xiscord-blurple" />}
                  </div>
                  <span className="text-xiscord-lightest text-sm group-hover:text-white">{opt.label}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => setNotificationPopover(null)}
              className="mt-4 w-full bg-xiscord-blurple hover:bg-xiscord-blurple/80 text-white text-sm font-medium py-2 rounded"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Invite People Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowInviteModal(false)}>
          <div className="w-[440px] bg-xiscord-dark rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <h2 className="text-lg font-bold text-white mb-1">Invite friends to {server.name}</h2>
              <p className="text-sm text-xiscord-muted mb-4">Share this link with others to grant access to your server!</p>
              <div className="flex items-center bg-xiscord-darker rounded px-3 py-2">
                <input
                  type="text"
                  readOnly
                  value={`https://discord.gg/${serverId}`}
                  className="bg-transparent flex-1 outline-none text-xiscord-lightest text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://discord.gg/${serverId}`);
                  }}
                  className="ml-2 bg-xiscord-blurple hover:bg-xiscord-blurple/80 text-white text-sm font-medium px-4 py-1 rounded"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-xiscord-muted mt-2">Your invite link expires in 7 days.</p>
            </div>
          </div>
        </div>
      )}

      {/* Server Notification Settings Modal */}
      {showServerNotifSettings && (
        <ServerNotifModal
          server={server}
          store={store}
          onClose={() => setShowServerNotifSettings(false)}
        />
      )}

      {/* Custom Status Modal */}
      {showCustomStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowCustomStatusModal(false)}>
          <div className="w-[440px] bg-xiscord-dark rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <h2 className="text-xl font-bold text-white mb-4">Set a custom status</h2>
              <div className="mb-4">
                <label className="text-xs font-bold text-xiscord-muted uppercase block mb-2">What's cookin'?</label>
                <div className="flex items-center bg-xiscord-darker rounded px-3 py-2">
                  <button
                    onClick={() => {
                      const emojis = ['😀','😎','🎮','💻','🎵','📚','🔥','✨','🌙','☕','🏠','💪'];
                      setCustomStatusEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
                    }}
                    className="text-xl mr-2 hover:bg-xiscord-light rounded p-1"
                  >
                    {customStatusEmoji || '😀'}
                  </button>
                  <input
                    type="text"
                    value={customStatusText}
                    onChange={(e) => setCustomStatusText(e.target.value.slice(0, 128))}
                    placeholder="Support your favorite creators!"
                    maxLength={128}
                    className="bg-transparent flex-1 outline-none text-xiscord-lightest placeholder-xiscord-muted text-sm"
                    autoFocus
                  />
                </div>
                <div className="text-xs text-xiscord-muted text-right mt-1">{customStatusText.length}/128</div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-bold text-xiscord-muted uppercase block mb-2">Clear after</label>
                <select
                  value={customStatusClearAfter}
                  onChange={(e) => setCustomStatusClearAfter(e.target.value)}
                  className="w-full bg-xiscord-darker text-xiscord-lightest px-3 py-2 rounded outline-none border border-xiscord-darker focus:border-xiscord-blurple text-sm"
                >
                  <option value="dont_clear">Don't clear</option>
                  <option value="30min">30 minutes</option>
                  <option value="1hour">1 hour</option>
                  <option value="4hours">4 hours</option>
                  <option value="today">Today</option>
                </select>
              </div>
            </div>
            <div className="bg-xiscord-darker p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowCustomStatusModal(false)}
                className="px-4 py-2 text-sm font-medium text-white hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const status = customStatusEmoji && customStatusText
                    ? `${customStatusEmoji} ${customStatusText}`
                    : customStatusText || customStatusEmoji || '';
                  store.updateCustomStatus(status);
                  setShowCustomStatusModal(false);
                  setCustomStatusText('');
                  setCustomStatusEmoji('');
                }}
                className="px-4 py-2 text-sm font-medium bg-xiscord-blurple hover:bg-xiscord-blurple/80 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
