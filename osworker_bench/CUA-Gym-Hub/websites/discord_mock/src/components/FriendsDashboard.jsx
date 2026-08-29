import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { MessageSquare, MoreVertical, Search, UserX, Ban, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function FriendsDashboard() {
  const [activeTab, setActiveTab] = useState('online'); // online, all, pending, blocked, add_friend
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendInput, setAddFriendInput] = useState('');
  const [addFriendStatus, setAddFriendStatus] = useState(null); // { type: 'success'|'error', message: '' }
  const [friendContextMenu, setFriendContextMenu] = useState(null); // { userId, x, y }
  const store = useStore();
  const navigate = useNavigate();

  // Get all users except current user
  const friends = Object.values(store.users).filter(u => u.id !== store.currentUser.id);
  const blockedUserIds = store.blockedUsers || [];
  const pendingFriends = store.pendingFriends || [];

  const filteredFriends = friends.filter(friend => {
    // Filter by search query
    if (searchQuery && !friend.username.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Filter by tab
    if (activeTab === 'online') return friend.status !== 'offline' && !blockedUserIds.includes(friend.id);
    if (activeTab === 'all') return !blockedUserIds.includes(friend.id);
    if (activeTab === 'blocked') return blockedUserIds.includes(friend.id);
    if (activeTab === 'pending') return false; // pending handled separately
    return false;
  });

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'idle': return 'Idle';
      case 'dnd': return 'Do Not Disturb';
      case 'offline': return 'Offline';
      default: return 'Offline';
    }
  };

  const handleAddFriend = () => {
    if (!addFriendInput.trim()) return;
    store.addFriendRequest(addFriendInput.trim());
    setAddFriendStatus({ type: 'success', message: `Friend request sent to ${addFriendInput.trim()}!` });
    setAddFriendInput('');
    setTimeout(() => setAddFriendStatus(null), 3000);
  };

  // Active users for the "Active Now" sidebar
  const activeUsers = friends.filter(u =>
    u.status !== 'offline' && u.customStatus && !blockedUserIds.includes(u.id)
  );

  return (
    <div className="flex-1 flex flex-col bg-xiscord-bg min-w-0">
      {/* Header */}
      <div className="h-12 px-4 flex items-center shadow-sm border-b border-xiscord-darker shrink-0">
        <div className="flex items-center mr-4 text-xiscord-modifier">
          <svg className="mr-2" width="24" height="24" viewBox="0 0 24 24">
            <g fill="none" fillRule="evenodd">
              <path fill="currentColor" fillRule="nonzero" d="M0.5,0 L0.5,24 L24.5,24 L24.5,0 L0.5,0 Z M12.5,16 C12.5,16 9.5,16 8.5,16 C7.5,16 6.5,15 6.5,14 C6.5,13 7.5,12 8.5,12 C9.5,12 12.5,12 12.5,12 C12.5,12 15.5,12 16.5,12 C17.5,12 18.5,13 18.5,14 C18.5,15 17.5,16 16.5,16 C15.5,16 12.5,16 12.5,16 Z M12.5,10 C13.8807119,10 15,8.88071187 15,7.5 C15,6.11928813 13.8807119,5 12.5,5 C11.1192881,5 10,6.11928813 10,7.5 C10,8.88071187 11.1192881,10 12.5,10 Z" opacity=".3"></path>
              <path fill="currentColor" d="M12,10 C13.6568542,10 15,8.65685425 15,7 C15,5.34314575 13.6568542,4 12,4 C10.3431458,4 9,5.34314575 9,7 C9,8.65685425 10.3431458,10 12,10 Z M12,12 C9.33333333,12 4,13.3333333 4,16 L4,18 L20,18 L20,16 C20,13.3333333 14.6666667,12 12,12 Z"></path>
            </g>
          </svg>
          <span className="font-bold text-white">Friends</span>
        </div>

        <div className="h-6 w-[1px] bg-xiscord-lightest/20 mx-2"></div>

        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('online')}
            className={cn("px-2 py-0.5 rounded hover:bg-xiscord-light hover:text-xiscord-lightest", activeTab === 'online' ? "text-white bg-xiscord-light/60" : "text-xiscord-modifier")}
          >
            Online
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={cn("px-2 py-0.5 rounded hover:bg-xiscord-light hover:text-xiscord-lightest", activeTab === 'all' ? "text-white bg-xiscord-light/60" : "text-xiscord-modifier")}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={cn("px-2 py-0.5 rounded hover:bg-xiscord-light hover:text-xiscord-lightest", activeTab === 'pending' ? "text-white bg-xiscord-light/60" : "text-xiscord-modifier")}
          >
            Pending
            {pendingFriends.length > 0 && (
              <span className="ml-1 bg-xiscord-red text-white text-[10px] font-bold px-1.5 rounded-full">{pendingFriends.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={cn("px-2 py-0.5 rounded hover:bg-xiscord-light hover:text-xiscord-lightest", activeTab === 'blocked' ? "text-white bg-xiscord-light/60" : "text-xiscord-modifier")}
          >
            Blocked
          </button>
          <button
            onClick={() => setActiveTab('add_friend')}
            className={cn("px-2 py-0.5 rounded font-medium text-sm", activeTab === 'add_friend' ? "bg-transparent text-xiscord-green" : "bg-xiscord-green text-white")}
          >
            Add Friend
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Friends List / Add Friend Panel */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {activeTab === 'add_friend' ? (
            <div>
              <h2 className="text-white font-bold uppercase text-sm mb-2">Add Friend</h2>
              <p className="text-xiscord-muted text-sm mb-4">You can add friends with their Xiscord username.</p>
              <div className="flex items-center bg-xiscord-darker rounded-lg px-4 py-3 border border-xiscord-divider focus-within:border-xiscord-blurple">
                <input
                  type="text"
                  value={addFriendInput}
                  onChange={(e) => setAddFriendInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddFriend(); }}
                  placeholder="You can add friends with their Xiscord username."
                  className="bg-transparent flex-1 outline-none text-xiscord-lightest placeholder-xiscord-muted text-sm"
                  autoFocus
                />
                <button
                  onClick={handleAddFriend}
                  disabled={!addFriendInput.trim()}
                  className={cn(
                    "ml-3 px-4 py-1.5 text-sm font-medium rounded text-white",
                    addFriendInput.trim() ? "bg-xiscord-blurple hover:bg-xiscord-blurple/80" : "bg-xiscord-blurple/50 cursor-not-allowed"
                  )}
                >
                  Send Friend Request
                </button>
              </div>
              {addFriendStatus && (
                <p className={cn("text-sm mt-2", addFriendStatus.type === 'success' ? "text-xiscord-green" : "text-xiscord-red")}>
                  {addFriendStatus.message}
                </p>
              )}
            </div>
          ) : activeTab === 'pending' ? (
            <div>
              <div className="text-xs font-bold text-xiscord-modifier uppercase mb-3">
                Pending &#8212; {pendingFriends.length}
              </div>
              {pendingFriends.length === 0 ? (
                <div className="text-center mt-10 text-xiscord-muted">
                  <p className="text-sm">There are no pending friend requests. Here's Wumpus for now.</p>
                </div>
              ) : (
                <div className="space-y-[1px]">
                  {pendingFriends.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-2.5 rounded hover:bg-xiscord-light/40 border-t border-xiscord-modifier/10">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-xiscord-light flex items-center justify-center mr-3 text-white font-bold">
                          {req.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white">{req.username}</div>
                          <div className="text-xs text-xiscord-modifier">
                            {req.type === 'outgoing' ? 'Outgoing Friend Request' : 'Incoming Friend Request'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          useStore.setState(state => ({
                            pendingFriends: (state.pendingFriends || []).filter(p => p.id !== req.id)
                          }));
                        }}
                        className="p-1.5 rounded-full bg-xiscord-light hover:text-white text-xiscord-modifier"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'blocked' ? (
            <div>
              <div className="text-xs font-bold text-xiscord-modifier uppercase mb-3">
                Blocked &#8212; {filteredFriends.length}
              </div>
              {filteredFriends.length === 0 ? (
                <div className="text-center mt-10 text-xiscord-muted">
                  <p className="text-sm">You haven't blocked anyone.</p>
                </div>
              ) : (
                <div className="space-y-[1px]">
                  {filteredFriends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between p-2.5 rounded hover:bg-xiscord-light/40 border-t border-xiscord-modifier/10">
                      <div className="flex items-center">
                        <div className="relative mr-3">
                          <img src={friend.avatar} alt={friend.username} className="w-8 h-8 rounded-full" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{friend.username}</div>
                          <div className="text-xs text-xiscord-modifier">Blocked</div>
                        </div>
                      </div>
                      <button
                        onClick={() => store.unblockUser(friend.id)}
                        className="px-3 py-1 text-sm bg-xiscord-light hover:bg-xiscord-selected text-white rounded"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-xiscord-darker text-xiscord-lightest px-3 py-2 rounded outline-none"
                />
                <Search className="absolute right-3 top-2.5 text-xiscord-modifier" size={20} />
              </div>

              <div className="text-xs font-bold text-xiscord-modifier uppercase mb-3">
                {activeTab === 'online' ? `Online \u2014 ${filteredFriends.length}` : `All Friends \u2014 ${filteredFriends.length}`}
              </div>

              <div className="space-y-[1px]">
                {filteredFriends.map(friend => (
                  <div
                    key={friend.id}
                    onClick={() => navigate(`/channels/@me/${friend.id}`)}
                    className="group flex items-center justify-between p-2.5 rounded hover:bg-xiscord-light/40 cursor-pointer border-t border-xiscord-modifier/10"
                  >
                    <div className="flex items-center">
                      <div className="relative mr-3">
                        <img src={friend.avatar} alt={friend.username} className="w-8 h-8 rounded-full" />
                        <div className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-xiscord-bg",
                          friend.status === 'online' ? "bg-xiscord-green" :
                          friend.status === 'idle' ? "bg-xiscord-yellow" :
                          friend.status === 'dnd' ? "bg-xiscord-dnd" : "bg-xiscord-offline"
                        )} />
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center">
                          {friend.username}
                          <span className="hidden group-hover:inline text-xs text-xiscord-modifier ml-1">#{friend.discriminator}</span>
                        </div>
                        <div className="text-xs text-xiscord-modifier">
                          {getStatusText(friend.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-xiscord-darker p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1.5 rounded-full bg-xiscord-light hover:text-white text-xiscord-modifier"
                        title="Message"
                        onClick={(e) => { e.stopPropagation(); navigate(`/channels/@me/${friend.id}`); }}
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button
                        className="p-1.5 rounded-full bg-xiscord-light hover:text-white text-xiscord-modifier"
                        title="More"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFriendContextMenu({ userId: friend.id, x: e.clientX, y: e.clientY });
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Active Now Sidebar */}
        <div className="w-[360px] border-l border-xiscord-darker p-4 hidden xl:block">
          <h2 className="text-xl font-bold text-white mb-4">Active Now</h2>
          {activeUsers.length > 0 ? (
            <div className="space-y-3">
              {activeUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center p-2 rounded hover:bg-xiscord-light/40 cursor-pointer"
                  onClick={() => navigate(`/channels/@me/${user.id}`)}
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
                    <div className="font-medium text-white text-sm">{user.username}</div>
                    <div className="text-xs text-xiscord-muted truncate">{user.customStatus}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mt-10">
              <div className="font-bold text-white mb-2">It's quiet for now...</div>
              <div className="text-sm text-xiscord-modifier px-4">
                When a friend starts an activity&#8212;like playing a game or hanging out on voice&#8212;we'll show it here!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Friend Context Menu */}
      {friendContextMenu && (
        <FriendContextMenu
          userId={friendContextMenu.userId}
          x={friendContextMenu.x}
          y={friendContextMenu.y}
          onClose={() => setFriendContextMenu(null)}
        />
      )}
    </div>
  );
}

function FriendContextMenu({ userId, x, y, onClose }) {
  const store = useStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [onClose]);

  const menuStyle = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - 120),
    zIndex: 100
  };

  return (
    <div style={menuStyle} className="min-w-[188px] bg-[#111214] rounded-lg shadow-xl border border-[#2e2f34] py-1.5" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => { navigate(`/channels/@me/${userId}`); onClose(); }}
        className="w-full text-left px-3 py-1.5 text-sm text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white rounded mx-1.5"
        style={{ width: 'calc(100% - 12px)' }}
      >
        Message
      </button>
      <div className="h-px bg-[#2e2f34] my-1 mx-2" />
      <button
        onClick={() => { store.removeFriend(userId); onClose(); }}
        className="w-full text-left px-3 py-1.5 text-sm text-xiscord-red hover:bg-xiscord-red hover:text-white rounded mx-1.5"
        style={{ width: 'calc(100% - 12px)' }}
      >
        Remove Friend
      </button>
      <button
        onClick={() => { store.blockUser(userId); onClose(); }}
        className="w-full text-left px-3 py-1.5 text-sm text-xiscord-red hover:bg-xiscord-red hover:text-white rounded mx-1.5"
        style={{ width: 'calc(100% - 12px)' }}
      >
        Block
      </button>
    </div>
  );
}
