import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { X, Clock } from 'lucide-react';

// Generate fake history entries for a page
const generateHistory = (page, userName) => {
  const now = Date.now();
  const entries = [
    { id: 'h1', action: 'edited', time: now - 30 * 60 * 1000 },
    { id: 'h2', action: 'added blocks to', time: now - 2 * 60 * 60 * 1000 },
    { id: 'h3', action: 'changed title of', time: now - 5 * 60 * 60 * 1000 },
    { id: 'h4', action: 'edited', time: now - 24 * 60 * 60 * 1000 },
    { id: 'h5', action: 'reorganized', time: now - 2 * 24 * 60 * 60 * 1000 },
    { id: 'h6', action: 'created', time: now - 5 * 24 * 60 * 60 * 1000 },
    { id: 'h7', action: 'added cover to', time: now - 7 * 24 * 60 * 60 * 1000 },
    { id: 'h8', action: 'shared', time: now - 14 * 24 * 60 * 60 * 1000 },
  ];

  return entries.map(e => ({
    ...e,
    userName,
    timestamp: new Date(e.time).toISOString(),
  }));
};

const getRelativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
};

export const PageHistoryPanel = ({ pageId, onClose }) => {
  const { state } = useStore();
  const page = state.pages[pageId];
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!page) return null;

  const history = generateHistory(page, state.user.name);

  return (
    <div ref={ref} className="fixed right-0 top-0 h-full w-[320px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Clock size={16} />
          Page history
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {history.map((entry, idx) => (
          <div key={entry.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
            <div className="relative flex-shrink-0">
              <img src={state.user.avatar} alt="" className="w-7 h-7 rounded-full" />
              {idx < history.length - 1 && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-6 bg-gray-200" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm">
                <span className="font-medium">{entry.userName}</span>
                {' '}<span className="text-gray-500">{entry.action}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{getRelativeTime(entry.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">Page history is available for the last 30 days</p>
      </div>
    </div>
  );
};
