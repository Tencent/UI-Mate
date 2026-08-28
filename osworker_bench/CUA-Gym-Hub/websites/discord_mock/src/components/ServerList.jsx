import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ServerList() {
  const navigate = useNavigate();
  const { serverId } = useParams();
  const servers = useStore((state) => state.servers);
  const channels = useStore((state) => state.channels);
  const createServer = useStore((state) => state.createServer);
  const dmConversations = useStore((state) => state.dmConversations);

  const showServerCreationModalAction = useStore((state) => state.showServerCreationModal);

  const handleCreateServer = () => {
    showServerCreationModalAction();
  };

  // Check if server has unread messages
  const getServerUnreadCount = (server) => {
    let total = 0;
    (server.channels || []).forEach(chId => {
      const ch = channels[chId];
      if (ch && ch.unreadCount > 0) total += ch.unreadCount;
    });
    return total;
  };

  // Check if any DM has unreads
  const dmUnreadCount = Object.values(dmConversations || {}).reduce((sum, dm) => sum + (dm.unreadCount || 0), 0);

  return (
    <nav className="w-[72px] bg-xiscord-darker flex flex-col items-center py-3 space-y-2 overflow-y-auto hide-scrollbar shrink-0">
      {/* Home / DM Button */}
      <div
        onClick={() => navigate('/channels/@me')}
        className="group relative flex items-center justify-center cursor-pointer"
        title="Direct Messages"
      >
        <div className={cn(
          "absolute left-0 bg-white rounded-r-full transition-all duration-200 w-1",
          serverId === '@me' || !serverId ? "h-10" : "h-2 group-hover:h-5 opacity-0 group-hover:opacity-100"
        )} />
        <div className={cn(
          "w-12 h-12 rounded-[24px] transition-all duration-200 flex items-center justify-center overflow-hidden relative",
          serverId === '@me' || !serverId ? "bg-xiscord-blurple rounded-[16px]" : "bg-xiscord-bg group-hover:bg-xiscord-blurple group-hover:rounded-[16px]"
        )}>
          <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
            <path d="M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4062 0.461742 17.1749 0.934541 16.9708 1.4184C15.003 1.12145 12.9974 1.12145 11.0292 1.4184C10.8251 0.934541 10.5939 0.461742 10.3417 0C8.49011 0.322332 6.68577 0.884842 4.97344 1.68382C1.26923 7.13802 0.235146 12.4507 0.751773 17.6893C2.86005 19.2649 5.24757 20.4128 7.79226 21.0636C8.33365 20.3189 8.81061 19.5278 9.21862 18.6978C8.43332 18.4047 7.67554 18.0397 6.95443 17.6084C7.15816 17.4556 7.35685 17.2959 7.5506 17.1365C12.0773 19.219 17.0212 19.219 21.4927 17.1365C21.6892 17.2998 21.8877 17.4596 22.0886 17.6084C21.3654 18.0418 20.6054 18.4088 19.8178 18.7023C20.2293 19.5394 20.7053 20.3238 21.247 21.0636C23.7933 20.4152 26.182 19.2678 28.2916 17.6893C28.8953 11.5988 27.2974 6.3343 23.0212 1.67671ZM9.68041 14.4874C8.25837 14.4874 7.09327 13.1857 7.09327 11.5903C7.09327 9.99482 8.22821 8.69083 9.68041 8.69083C11.1326 8.69083 12.2972 9.99482 12.2676 11.5903C12.2676 13.1857 11.1326 14.4874 9.68041 14.4874ZM19.3696 14.4874C17.9467 14.4874 16.7825 13.1857 16.7825 11.5903C16.7825 9.99482 17.9167 8.69083 19.3696 8.69083C20.8218 8.69083 21.9867 9.99482 21.9567 11.5903C21.9567 13.1857 20.8245 14.4874 19.3696 14.4874Z" fill="currentColor"/>
          </svg>
          {dmUnreadCount > 0 && (
            <div className="absolute bottom-0 right-0 bg-xiscord-red text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 border-2 border-xiscord-darker">
              {dmUnreadCount}
            </div>
          )}
        </div>
      </div>

      <div className="w-8 h-[2px] bg-xiscord-bg rounded-lg mx-auto" />

      {/* Server List */}
      {Object.values(servers).map((server) => {
        const unreadCount = getServerUnreadCount(server);
        const hasUnread = unreadCount > 0;
        const isSelected = serverId === server.id;

        return (
          <div
            key={server.id}
            onClick={() => navigate(`/channels/${server.id}`)}
            className="group relative flex items-center justify-center cursor-pointer"
            title={server.name}
          >
            {/* Left pill indicator */}
            <div className={cn(
              "absolute left-0 bg-white rounded-r-full transition-all duration-200 w-1",
              isSelected ? "h-10" :
              hasUnread ? "h-2" :
              "h-2 group-hover:h-5 opacity-0 group-hover:opacity-100"
            )} />
            <div className="relative">
              <img
                src={server.icon}
                alt={server.name}
                className={cn(
                  "w-12 h-12 rounded-[24px] transition-all duration-200 object-cover",
                  isSelected ? "rounded-[16px]" : "group-hover:rounded-[16px]"
                )}
              />
              {/* Unread badge */}
              {hasUnread && !isSelected && (
                <div className="absolute bottom-0 right-0 bg-xiscord-red text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 border-2 border-xiscord-darker">
                  {unreadCount}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Server */}
      <div
        onClick={handleCreateServer}
        className="group relative flex items-center justify-center cursor-pointer text-xiscord-green hover:text-white"
        title="Add a Server"
      >
        <div className="w-12 h-12 rounded-[24px] bg-xiscord-bg group-hover:bg-xiscord-green group-hover:rounded-[16px] transition-all duration-200 flex items-center justify-center">
          <Plus size={24} />
        </div>
      </div>
    </nav>
  );
}
