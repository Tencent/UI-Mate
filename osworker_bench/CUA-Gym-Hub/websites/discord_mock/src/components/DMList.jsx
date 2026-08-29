import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { User, Mic, MicOff, Headphones, VolumeX, Settings, X, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import UserSettings from './UserSettings';

export default function DMList() {
  const navigate = useNavigate();
  const { channelId } = useParams(); // In DM context, channelId could be userId for simplicity
  const store = useStore();
  const currentUser = store.currentUser;
  const dmUserIds = store.dms || [];
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showFindConversation, setShowFindConversation] = useState(false);
  const [conversationSearch, setConversationSearch] = useState('');
  const [showNewDMModal, setShowNewDMModal] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  // Filter DM users based on search
  const filteredDmUserIds = conversationSearch
    ? dmUserIds.filter(userId => {
        const user = store.users[userId];
        return user && user.username.toLowerCase().includes(conversationSearch.toLowerCase());
      })
    : dmUserIds;

  // All users for new DM modal (excluding current user and already in DMs)
  const allOtherUsers = Object.values(store.users).filter(
    u => u.id !== currentUser.id && !dmUserIds.includes(u.id)
  );

  return (
    <div className="w-60 bg-xiscord-dark flex flex-col shrink-0">
      {/* Search / Find Conversation */}
      <div className="h-12 px-2.5 flex items-center shadow-sm border-b border-xiscord-darker shrink-0">
        {showFindConversation ? (
          <div className="flex items-center w-full bg-xiscord-darker rounded px-2 py-1.5">
            <Search size={14} className="text-xiscord-muted mr-1.5 shrink-0" />
            <input
              type="text"
              value={conversationSearch}
              onChange={(e) => setConversationSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent flex-1 outline-none text-xiscord-lightest text-sm placeholder-xiscord-muted"
              autoFocus
              onBlur={() => {
                if (!conversationSearch) setShowFindConversation(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setConversationSearch('');
                  setShowFindConversation(false);
                }
              }}
            />
            <button
              onClick={() => { setConversationSearch(''); setShowFindConversation(false); }}
              className="text-xiscord-muted hover:text-white ml-1"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowFindConversation(true)}
            className="w-full text-left bg-xiscord-darker text-xiscord-modifier text-sm px-2 py-1.5 rounded hover:text-xiscord-lightest transition-colors truncate"
          >
            Find or start a conversation
          </button>
        )}
      </div>

      {/* DM List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
        {/* Friends Button */}
        <div
          onClick={() => navigate('/channels/@me')}
          className={cn(
            "flex items-center px-2.5 py-2 rounded cursor-pointer group",
            !channelId ? "bg-xiscord-light/60 text-white" : "text-xiscord-modifier hover:bg-xiscord-light/40 hover:text-xiscord-lightest"
          )}
        >
          <div className="w-8 flex justify-center mr-3">
            <User size={24} />
          </div>
          <span className="font-medium">Friends</span>
        </div>

        <div
          className="pt-3 pb-1 px-2.5 text-xs font-bold text-xiscord-modifier hover:text-xiscord-lightest uppercase flex justify-between items-center group cursor-pointer"
          onClick={() => setShowNewDMModal(true)}
        >
          <span>Direct Messages</span>
          <span className="opacity-0 group-hover:opacity-100 text-lg leading-3" title="Create DM">+</span>
        </div>

        {filteredDmUserIds.map(userId => {
          const user = store.users[userId];
          if (!user) return null;

          return (
            <div
              key={userId}
              onClick={() => navigate(`/channels/@me/${userId}`)}
              className={cn(
                "flex items-center px-2.5 py-2 rounded cursor-pointer group relative",
                channelId === userId ? "bg-xiscord-light/60 text-white" : "text-xiscord-modifier hover:bg-xiscord-light/40 hover:text-xiscord-lightest"
              )}
            >
              <div className="relative mr-3">
                <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                <div className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-xiscord-dark",
                  user.status === 'online' ? "bg-xiscord-green" :
                  user.status === 'idle' ? "bg-xiscord-yellow" :
                  user.status === 'dnd' ? "bg-xiscord-dnd" : "bg-xiscord-offline"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{user.username}</div>
                {user.customStatus && (
                  <div className="text-xs truncate opacity-60">{user.customStatus}</div>
                )}
              </div>
              <div
                className="opacity-0 group-hover:opacity-100 text-xiscord-modifier hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  store.removeDM(userId);
                  if (channelId === userId) {
                    navigate('/channels/@me');
                  }
                }}
                title="Close DM"
              >
                <X size={16} />
              </div>
            </div>
          );
        })}

        {conversationSearch && filteredDmUserIds.length === 0 && (
          <div className="px-2.5 py-4 text-sm text-xiscord-muted text-center">
            No conversations found.
          </div>
        )}
      </div>

      {/* User Controls */}
      <div className="h-[52px] bg-xiscord-darker px-2 flex items-center shrink-0 relative">
        <div
          className="group relative mr-2 cursor-pointer shrink-0"
          onClick={() => setShowStatusPicker(!showStatusPicker)}
          title="Set status"
        >
          <div className="relative">
            <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full" />
            <div className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-xiscord-darker",
              currentUser.status === 'online' ? "bg-xiscord-green" :
              currentUser.status === 'idle' ? "bg-xiscord-yellow" :
              currentUser.status === 'dnd' ? "bg-xiscord-dnd" : "bg-xiscord-offline"
            )} />
          </div>
          {/* Status Picker Popup */}
          {showStatusPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowStatusPicker(false); }} />
              <div className="absolute bottom-10 left-0 z-50 w-[200px] bg-[#111214] rounded-lg shadow-xl border border-[#2e2f34] py-1.5" onClick={e => e.stopPropagation()}>
                <div className="px-3 py-1 text-xs font-bold text-xiscord-muted uppercase">Set Status</div>
                {[
                  { label: 'Online', value: 'online', color: 'bg-xiscord-green' },
                  { label: 'Idle', value: 'idle', color: 'bg-xiscord-yellow' },
                  { label: 'Do Not Disturb', value: 'dnd', color: 'bg-xiscord-dnd' },
                  { label: 'Invisible', value: 'offline', color: 'bg-xiscord-offline' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { store.updateUserStatus(opt.value); setShowStatusPicker(false); }}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm hover:bg-xiscord-blurple rounded",
                      currentUser.status === opt.value ? "text-white" : "text-xiscord-lightest"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full mr-3 shrink-0", opt.color)} />
                    {opt.label}
                    {currentUser.status === opt.value && <span className="ml-auto text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex-1 min-w-0 mr-1">
          <div className="text-sm font-medium text-white truncate">{currentUser.username}</div>
          <div className="text-xs text-xiscord-modifier truncate">#{currentUser.discriminator}</div>
        </div>
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
            title="User Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* User Settings Modal */}
      {showUserSettings && <UserSettings onClose={() => setShowUserSettings(false)} />}

      {/* New DM Modal */}
      {showNewDMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowNewDMModal(false)}>
          <div className="w-[440px] bg-xiscord-dark rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <h2 className="text-lg font-bold text-white mb-1">Select Friends</h2>
              <p className="text-sm text-xiscord-muted mb-3">You can add friends to start a DM conversation.</p>
              {allOtherUsers.length > 0 ? (
                <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {allOtherUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => {
                        // Add to DM list and navigate
                        const newDms = [...dmUserIds, user.id];
                        // We need to update the store's dms and possibly create a DM conversation
                        store.removeDM('__noop__'); // trigger to force a re-render; actual add below
                        // Directly set dms in store
                        useStore.setState(state => ({
                          dms: [...(state.dms || []), user.id]
                        }));
                        setShowNewDMModal(false);
                        navigate(`/channels/@me/${user.id}`);
                      }}
                      className="flex items-center px-3 py-2 rounded hover:bg-xiscord-light/40 cursor-pointer"
                    >
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full mr-3" />
                      <span className="text-white font-medium">{user.username}</span>
                      <span className="text-xs text-xiscord-muted ml-1">#{user.discriminator}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xiscord-muted text-sm text-center py-4">All users are already in your DMs.</p>
              )}
            </div>
            <div className="bg-xiscord-darker p-3 flex justify-end">
              <button
                onClick={() => setShowNewDMModal(false)}
                className="px-4 py-1.5 text-sm text-white hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
