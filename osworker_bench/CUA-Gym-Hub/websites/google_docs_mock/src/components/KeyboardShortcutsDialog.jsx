import React, { useState, useEffect, useCallback } from 'react';
import { X, Search } from 'lucide-react';

const SHORTCUTS = [
  {
    category: 'Text formatting',
    items: [
      { action: 'Bold', shortcut: 'Ctrl+B' },
      { action: 'Italic', shortcut: 'Ctrl+I' },
      { action: 'Underline', shortcut: 'Ctrl+U' },
      { action: 'Strikethrough', shortcut: 'Alt+Shift+5' },
      { action: 'Superscript', shortcut: 'Ctrl+.' },
      { action: 'Subscript', shortcut: 'Ctrl+,' },
      { action: 'Clear formatting', shortcut: 'Ctrl+\\' },
    ],
  },
  {
    category: 'Paragraph styles',
    items: [
      { action: 'Heading 1', shortcut: 'Ctrl+Alt+1' },
      { action: 'Heading 2', shortcut: 'Ctrl+Alt+2' },
      { action: 'Heading 3', shortcut: 'Ctrl+Alt+3' },
      { action: 'Normal text', shortcut: 'Ctrl+Alt+0' },
    ],
  },
  {
    category: 'Alignment',
    items: [
      { action: 'Align left', shortcut: 'Ctrl+Shift+L' },
      { action: 'Align center', shortcut: 'Ctrl+Shift+E' },
      { action: 'Align right', shortcut: 'Ctrl+Shift+R' },
      { action: 'Justify', shortcut: 'Ctrl+Shift+J' },
    ],
  },
  {
    category: 'Lists',
    items: [
      { action: 'Bulleted list', shortcut: 'Ctrl+Shift+8' },
      { action: 'Numbered list', shortcut: 'Ctrl+Shift+7' },
      { action: 'Increase indent', shortcut: 'Tab / Ctrl+]' },
      { action: 'Decrease indent', shortcut: 'Shift+Tab / Ctrl+[' },
    ],
  },
  {
    category: 'Editing',
    items: [
      { action: 'Undo', shortcut: 'Ctrl+Z' },
      { action: 'Redo', shortcut: 'Ctrl+Y' },
      { action: 'Cut', shortcut: 'Ctrl+X' },
      { action: 'Copy', shortcut: 'Ctrl+C' },
      { action: 'Paste', shortcut: 'Ctrl+V' },
      { action: 'Paste without formatting', shortcut: 'Ctrl+Shift+V' },
      { action: 'Select all', shortcut: 'Ctrl+A' },
      { action: 'Find and replace', shortcut: 'Ctrl+H' },
    ],
  },
  {
    category: 'Insert',
    items: [
      { action: 'Insert link', shortcut: 'Ctrl+K' },
      { action: 'Page break', shortcut: 'Ctrl+Enter' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { action: 'Go to beginning', shortcut: 'Ctrl+Home' },
      { action: 'Go to end', shortcut: 'Ctrl+End' },
      { action: 'Move word forward', shortcut: 'Ctrl+→' },
      { action: 'Move word backward', shortcut: 'Ctrl+←' },
    ],
  },
  {
    category: 'View',
    items: [
      { action: 'Print', shortcut: 'Ctrl+P' },
      { action: 'Full screen', shortcut: 'F11' },
      { action: 'Keyboard shortcuts', shortcut: 'Ctrl+/' },
    ],
  },
];

function KeyboardShortcutsDialog({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  const filteredCategories = SHORTCUTS.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !searchQuery ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortcut.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Keyboard shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts"
              autoFocus
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {filteredCategories.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No shortcuts found for "{searchQuery}"</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {filteredCategories.map((cat) => (
                <div key={cat.category}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{cat.category}</h3>
                  <div className="space-y-1">
                    {cat.items.map((item) => (
                      <div key={item.action} className="flex items-center justify-between py-0.5">
                        <span className="text-sm text-gray-700">{item.action}</span>
                        <kbd className="text-xs bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 font-mono text-gray-600 ml-4 whitespace-nowrap">
                          {item.shortcut}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsDialog;
