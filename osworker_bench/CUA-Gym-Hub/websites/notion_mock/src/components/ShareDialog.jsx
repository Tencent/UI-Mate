import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { X, Link2, Globe, ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export const ShareDialog = ({ pageId, onClose }) => {
  const { state, updatePage } = useStore();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('Can edit');
  const [showPermDropdown, setShowPermDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/page/${pageId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    const page = state.pages[pageId];
    if (!page) return;

    // Add invited user to page permissions stored in page properties
    const currentSharedWith = page.properties?.sharedWith || [];
    const alreadyShared = currentSharedWith.some(entry => entry.email === trimmedEmail);
    if (!alreadyShared) {
      const updatedSharedWith = [
        ...currentSharedWith,
        { email: trimmedEmail, permission, addedDate: new Date().toISOString() }
      ];
      updatePage(pageId, { properties: { ...page.properties, sharedWith: updatedSharedWith } });
    }

    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setEmail('');
    }, 2000);
  };

  const permissions = ['Can edit', 'Can view', 'Can comment'];
  const page = state.pages[pageId];
  const sharedWith = page?.properties?.sharedWith || [];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div ref={ref} className="bg-white rounded-xl shadow-2xl w-[480px] overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-sm">Share</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-500">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {/* Email input + permission dropdown */}
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Add people, groups, or emails"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && email.trim()) handleInvite(); }}
            />
            <div className="relative">
              <button
                className="border border-gray-300 rounded-md px-3 py-2 text-sm flex items-center gap-1 hover:bg-gray-50 min-w-[120px] justify-between"
                onClick={() => setShowPermDropdown(!showPermDropdown)}>
                {permission}
                <ChevronDown size={14} />
              </button>
              {showPermDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[140px] z-10">
                  {permissions.map(p => (
                    <button key={p}
                      className={clsx('w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50',
                        permission === p && 'bg-gray-50 font-medium')}
                      onClick={() => { setPermission(p); setShowPermDropdown(false); }}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {email.trim() && (
            <button
              className={clsx(
                'w-full text-white text-sm rounded-md py-2 mb-4 flex items-center justify-center gap-2 transition-colors',
                inviteSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
              )}
              onClick={handleInvite}>
              {inviteSuccess ? (
                <><Check size={14} /> Invited!</>
              ) : (
                'Invite'
              )}
            </button>
          )}

          {/* Current access */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-xs font-medium text-gray-500 mb-2">Who has access</div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <img src={state.user.avatar} alt="" className="w-7 h-7 rounded-full" />
                <div>
                  <div className="text-sm font-medium">{state.user.name} (you)</div>
                  <div className="text-xs text-gray-400">{state.user.email}</div>
                </div>
              </div>
              <span className="text-xs text-gray-500">Full access</span>
            </div>
            {sharedWith.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {entry.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{entry.email}</div>
                    <div className="text-xs text-gray-400">Invited</div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{entry.permission}</span>
              </div>
            ))}
          </div>

          {/* Copy link */}
          <div className="border-t border-gray-200 pt-4 mt-2">
            <button
              className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md w-full"
              onClick={handleCopyLink}>
              <Link2 size={16} className="text-gray-500" />
              <span>{copied ? 'Link copied!' : 'Copy link'}</span>
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-500 px-3 py-2 mt-1">
              <Globe size={16} />
              <span className="text-xs">Anyone with the link can view this page</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
