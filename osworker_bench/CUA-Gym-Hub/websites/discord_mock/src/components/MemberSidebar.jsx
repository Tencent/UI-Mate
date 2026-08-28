import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { MessageSquare, X } from 'lucide-react';

export default function MemberSidebar() {
  const { serverId } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const server = store.servers[serverId];
  const [profilePopup, setProfilePopup] = useState(null); // { memberId, x, y }

  if (!server) return null;

  // Get full member objects
  const members = server.members.map(id => store.users[id]).filter(Boolean);

  // Get all roles sorted by position (highest first)
  const serverRoles = (server.roles || [])
    .map(id => store.roles[id])
    .filter(Boolean)
    .sort((a, b) => (b.position || 0) - (a.position || 0));

  // Group members by their highest hoist role
  const hoistRoles = serverRoles.filter(r => r.hoist);
  const grouped = {};
  const ungroupedOnline = [];
  const ungroupedOffline = [];

  members.forEach(member => {
    const memberRoleIds = member.roles || [];
    // Find highest hoist role for this member
    const highestHoistRole = hoistRoles.find(r => memberRoleIds.includes(r.id));

    if (highestHoistRole && member.status !== 'offline') {
      if (!grouped[highestHoistRole.id]) {
        grouped[highestHoistRole.id] = { role: highestHoistRole, members: [] };
      }
      grouped[highestHoistRole.id].members.push(member);
    } else if (member.status === 'offline') {
      ungroupedOffline.push(member);
    } else {
      ungroupedOnline.push(member);
    }
  });

  const handleMemberClick = (member, e) => {
    setProfilePopup({ memberId: member.id, x: e.currentTarget.getBoundingClientRect().left - 240, y: e.currentTarget.getBoundingClientRect().top });
  };

  const MemberItem = ({ member }) => {
    const memberRoles = (member.roles || [])
      .map(id => store.roles[id])
      .filter(Boolean)
      .sort((a, b) => (b.position || 0) - (a.position || 0));
    const topRole = memberRoles[0];

    return (
      <div
        className="flex items-center px-2 py-1.5 rounded hover:bg-xiscord-light cursor-pointer group"
        onClick={(e) => handleMemberClick(member, e)}
      >
        <div className="relative mr-3 shrink-0">
          <img src={member.avatar} alt={member.username} className={cn("w-8 h-8 rounded-full", member.status === 'offline' && "opacity-40")} />
          <div className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-xiscord-dark",
            member.status === 'online' ? "bg-xiscord-online" :
            member.status === 'idle' ? "bg-xiscord-idle" :
            member.status === 'dnd' ? "bg-xiscord-dnd" : "bg-xiscord-offline"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span
              className={cn("font-medium text-sm truncate", member.status === 'offline' && "opacity-40")}
              style={{ color: topRole?.color || '#9ca3af' }}
            >
              {member.username}
            </span>
            {member.isBot && (
              <span className="bg-xiscord-blurple text-white text-[9px] font-bold px-1 py-0 rounded ml-1 shrink-0">BOT</span>
            )}
          </div>
          {/* Role badges */}
          {memberRoles.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {memberRoles.slice(0, 3).map(role => (
                <span key={role.id} className="flex items-center text-[9px] bg-xiscord-darker rounded px-1 py-0">
                  <span className="w-1.5 h-1.5 rounded-full mr-0.5 shrink-0" style={{ backgroundColor: role.color }} />
                  <span className="text-xiscord-lightest truncate">{role.name}</span>
                </span>
              ))}
              {memberRoles.length > 3 && (
                <span className="text-[9px] text-xiscord-muted">+{memberRoles.length - 3}</span>
              )}
            </div>
          )}
          {member.customStatus && (
            <div className="text-[10px] text-xiscord-muted truncate max-w-[140px]">
              {member.customStatus}
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProfilePopup = ({ memberId, x, y }) => {
    const member = store.users[memberId];
    if (!member) return null;
    const memberRoles = (member.roles || []).map(id => store.roles[id]).filter(Boolean);
    const dms = store.dms || [];

    const handleOpenDM = () => {
      if (!dms.includes(memberId)) {
        useStore.setState(state => ({ dms: [...(state.dms || []), memberId] }));
      }
      setProfilePopup(null);
      navigate(`/channels/@me/${memberId}`);
    };

    return (
      <div
        className="fixed z-50"
        style={{ left: Math.max(8, x), top: Math.min(y, window.innerHeight - 300), width: 280 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-xiscord-dark rounded-lg overflow-hidden shadow-2xl border border-xiscord-darker">
          <div className="h-[60px]" style={{ backgroundColor: member.bannerColor || '#5865F2' }} />
          <div className="px-4 pb-4 relative">
            <div className="flex items-end justify-between -mt-10 mb-2">
              <div className="w-[72px] h-[72px] rounded-full border-[5px] border-xiscord-dark bg-xiscord-dark overflow-hidden">
                <img src={member.avatar} alt={member.username} className="w-full h-full rounded-full" />
              </div>
              <button
                onClick={() => setProfilePopup(null)}
                className="text-xiscord-muted hover:text-white p-1 mb-1"
              >
                <X size={16} />
              </button>
            </div>
            <div className="font-bold text-white text-lg">{member.username}</div>
            <div className="text-xiscord-muted text-xs mb-2">#{member.discriminator}</div>
            {member.customStatus && (
              <div className="text-xs text-xiscord-lightest mb-2">{member.customStatus}</div>
            )}
            {member.aboutMe && (
              <div className="border-t border-xiscord-divider pt-2 mb-3">
                <div className="text-xs font-bold text-xiscord-muted uppercase mb-1">About Me</div>
                <div className="text-xs text-xiscord-lightest">{member.aboutMe}</div>
              </div>
            )}
            {memberRoles.length > 0 && (
              <div className="border-t border-xiscord-divider pt-2 mb-3">
                <div className="text-xs font-bold text-xiscord-muted uppercase mb-1">Roles</div>
                <div className="flex flex-wrap gap-1">
                  {memberRoles.map(role => (
                    <span key={role.id} className="flex items-center text-xs bg-xiscord-darker rounded px-1.5 py-0.5 border border-xiscord-divider">
                      <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: role.color }} />
                      <span className="text-xiscord-lightest">{role.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {memberId !== store.currentUser.id && (
              <button
                onClick={handleOpenDM}
                className="w-full flex items-center justify-center bg-xiscord-blurple hover:bg-xiscord-blurple/80 text-white text-sm font-medium px-3 py-2 rounded"
              >
                <MessageSquare size={14} className="mr-2" />
                Message
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-60 bg-xiscord-dark shrink-0 hidden lg:flex flex-col p-3 overflow-y-auto custom-scrollbar relative">
      {/* Grouped by hoist role */}
      {Object.values(grouped).map(({ role, members: roleMembers }) => (
        <div key={role.id} className="mb-4">
          <h3 className="text-xs font-bold text-xiscord-muted uppercase mb-2 px-2">
            {role.name} — {roleMembers.length}
          </h3>
          <div className="space-y-0.5">
            {roleMembers.map(member => (
              <MemberItem key={member.id} member={member} />
            ))}
          </div>
        </div>
      ))}

      {/* Online members without hoist roles */}
      {ungroupedOnline.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-bold text-xiscord-muted uppercase mb-2 px-2">
            Online — {ungroupedOnline.length}
          </h3>
          <div className="space-y-0.5">
            {ungroupedOnline.map(member => (
              <MemberItem key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Offline */}
      {ungroupedOffline.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-xiscord-muted uppercase mb-2 px-2">
            Offline — {ungroupedOffline.length}
          </h3>
          <div className="space-y-0.5">
            {ungroupedOffline.map(member => (
              <MemberItem key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Profile Popup (click outside to close) */}
      {profilePopup && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setProfilePopup(null)} />
          <ProfilePopup memberId={profilePopup.memberId} x={profilePopup.x} y={profilePopup.y} />
        </>
      )}
    </div>
  );
}

