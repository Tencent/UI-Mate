import React, { useState } from 'react';
import { X, Globe, User, Link2, Check } from 'lucide-react';
import { FileSystemItem, SharedUser } from '../lib/types';
import { useFileSystem } from '../context/FileSystemContext';
import { useToast } from '../context/ToastContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FileSystemItem;
}

export const ShareModal = ({ isOpen, onClose, item }: ShareModalProps) => {
  const { dispatch, state } = useFileSystem();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'commenter'>('editor');
  const [copied, setCopied] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    const newUser: SharedUser = {
      userId: trimmedEmail,
      role: role,
      addedAt: new Date().toISOString()
    };

    dispatch({
      type: 'SHARE_ITEM',
      payload: { id: item.id, users: [newUser] }
    });
    showToast(`Shared with ${trimmedEmail}`);
    setEmail('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://drive.google.com/file/d/${item.id}/view?usp=sharing`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getOwnerUser = () => {
    if (item.ownerId === state.currentUser.id) return state.currentUser;
    return state.users?.[item.ownerId] || { name: 'Unknown', email: 'unknown@example.com', avatar: '' };
  };

  const getSharedUser = (userId: string) => {
    if (userId.includes('@')) {
      return { name: userId, email: userId, avatar: '' };
    }
    const user = state.users?.[userId];
    return user || { name: userId, email: userId, avatar: '' };
  };

  const roleLabel = { viewer: 'Viewer', editor: 'Editor', commenter: 'Commenter' };
  const owner = getOwnerUser();

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ boxShadow: '0 24px 38px rgba(0,0,0,.14), 0 9px 46px rgba(0,0,0,.12)' }}>
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <h3 className="text-lg text-[#202124]">Share "{item.name}"</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F1F3F4] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#5F6368]" />
          </button>
        </div>

        {/* Share input */}
        <div className="px-6 pb-4">
          <form onSubmit={handleShare}>
            <div className="flex items-center bg-[#F1F3F4] rounded-2xl px-4 h-12 gap-2 focus-within:bg-white focus-within:shadow-md focus-within:ring-1 focus-within:ring-[#1A73E8] transition-all">
              <input
                type="text"
                placeholder="Add people and groups"
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#202124] placeholder-[#5F6368]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {email.trim() && (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                      className="flex items-center gap-1 text-sm text-[#5F6368] hover:text-[#202124] px-2 py-1 rounded"
                    >
                      {roleLabel[role]}
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                    </button>
                    {roleDropdownOpen && (
                      <div className="absolute right-0 top-8 w-36 bg-white rounded-lg shadow-xl border border-[#DADCE0] py-1 z-50">
                        {(['editor', 'commenter', 'viewer'] as const).map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => { setRole(r); setRoleDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-[#202124] hover:bg-[#F1F3F4] flex items-center justify-between"
                          >
                            {roleLabel[r]}
                            {role === r && <Check className="w-4 h-4 text-[#1A73E8]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="text-sm font-medium text-[#1A73E8] hover:bg-[#E8F0FE] px-3 py-1 rounded-md transition-colors"
                  >
                    Send
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* People with access */}
        <div className="px-6 pb-4">
          <p className="text-xs font-medium text-[#5F6368] mb-3 uppercase tracking-wide">People with access</p>
          <div className="space-y-3">
            {/* Owner */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1A73E8] flex items-center justify-center flex-shrink-0">
                {owner.avatar
                  ? <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" />
                  : <User className="w-5 h-5 text-white" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#202124] truncate">{owner.name} {item.ownerId === state.currentUser.id ? '(you)' : ''}</p>
                <p className="text-xs text-[#5F6368] truncate">{owner.email}</p>
              </div>
              <span className="text-sm text-[#5F6368] flex-shrink-0">Owner</span>
            </div>

            {/* Shared users */}
            {item.sharedWith.map((shared, idx) => {
              const user = getSharedUser(shared.userId);
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-[#9C27B0] flex items-center justify-center flex-shrink-0">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      : <span className="text-white text-sm font-medium">{user.name[0].toUpperCase()}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#202124] truncate">{user.name}</p>
                    <p className="text-xs text-[#5F6368] truncate">{user.email}</p>
                  </div>
                  <span className="text-sm text-[#5F6368] flex-shrink-0 capitalize">{shared.role}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* General access footer */}
        <div className="px-6 py-4 border-t border-[#DADCE0] bg-[#F8F9FA] rounded-b-2xl flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-sm font-medium text-[#1A73E8] hover:bg-[#E8F0FE] px-4 py-2 rounded-md transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            {copied ? 'Link copied!' : 'Copy link'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1A73E8] text-white text-sm font-medium rounded-md hover:bg-[#1557B0] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
