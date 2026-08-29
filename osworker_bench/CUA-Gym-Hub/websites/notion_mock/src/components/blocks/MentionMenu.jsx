import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/store';
import clsx from 'clsx';

export const MentionMenu = ({ onSelect, onClose, filter = '' }) => {
  const { state } = useStore();
  const ref = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allPages = Object.values(state.pages).filter(p => !p.parentId || p.type !== undefined);
  const members = [{ id: state.user.id, name: state.user.name, avatar: state.user.avatar, type: 'person' }];

  const q = filter.toLowerCase();
  const pageResults = allPages
    .filter(p => (p.title || '').toLowerCase().includes(q))
    .slice(0, 6)
    .map(p => ({ id: p.id, label: p.title || 'Untitled', icon: p.icon || '\u{1F4C4}', type: 'page' }));

  const personResults = members
    .filter(m => m.name.toLowerCase().includes(q))
    .map(m => ({ id: m.id, label: m.name, avatar: m.avatar, type: 'person' }));

  const results = [...personResults, ...pageResults];

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        onSelect(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [results, selectedIndex, onSelect, onClose]);

  if (results.length === 0) {
    return (
      <div ref={ref} className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-2 px-3 min-w-[240px] text-sm text-gray-400">
        No results
      </div>
    );
  }

  return (
    <div ref={ref} className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[240px] max-h-[280px] overflow-y-auto text-sm">
      <div className="px-3 py-1 text-xs font-medium text-gray-400">Mention a page or person</div>
      {results.map((item, idx) => (
        <div
          key={`${item.type}-${item.id}`}
          className={clsx(
            'flex items-center px-3 py-1.5 cursor-pointer',
            idx === selectedIndex ? 'bg-xotion-hover' : 'hover:bg-gray-50'
          )}
          onClick={() => onSelect(item)}
          onMouseEnter={() => setSelectedIndex(idx)}
        >
          {item.type === 'person' ? (
            <img src={item.avatar} alt="" className="w-5 h-5 rounded-full mr-2" />
          ) : (
            <span className="mr-2 text-lg">{item.icon}</span>
          )}
          <span className="truncate">{item.label}</span>
          <span className="ml-auto text-xs text-gray-400">{item.type === 'person' ? 'Person' : 'Page'}</span>
        </div>
      ))}
    </div>
  );
};
