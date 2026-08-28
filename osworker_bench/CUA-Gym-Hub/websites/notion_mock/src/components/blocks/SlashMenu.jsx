import React, { useEffect, useState, useRef } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  MessageSquare,
  Minus,
  Image,
  ListTree,
  Table,
  Code,
  ToggleRight,
  Columns,
  Search
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'text', label: 'Text', icon: Type, description: 'Just start writing with plain text.' },
  { id: 'heading-1', label: 'Heading 1', icon: Heading1, description: 'Big section heading.' },
  { id: 'heading-2', label: 'Heading 2', icon: Heading2, description: 'Medium section heading.' },
  { id: 'heading-3', label: 'Heading 3', icon: Heading3, description: 'Small section heading.' },
  { id: 'bullet-list', label: 'Bulleted list', icon: List, description: 'Create a simple bulleted list.' },
  { id: 'numbered-list', label: 'Numbered list', icon: ListOrdered, description: 'Create a list with numbering.' },
  { id: 'todo', label: 'To-do list', icon: CheckSquare, description: 'Track tasks with a to-do list.' },
  { id: 'table', label: 'Table', icon: Table, description: 'Add a simple table.' },
  { id: 'quote', label: 'Quote', icon: Quote, description: 'Capture a quote.' },
  { id: 'callout', label: 'Callout', icon: MessageSquare, description: 'Make writing stand out.' },
  { id: 'code', label: 'Code', icon: Code, description: 'Capture a code snippet.' },
  { id: 'toggle', label: 'Toggle', icon: ToggleRight, description: 'Toggles can hide and show content.' },
  { id: 'divider', label: 'Divider', icon: Minus, description: 'Visually divide blocks.' },
  { id: 'image', label: 'Image', icon: Image, description: 'Upload or embed with a link.' },
  { id: 'toc', label: 'Table of Contents', icon: ListTree, description: 'Overview of page headings.' },
  { id: 'column-layout-2', label: '2 Columns', icon: Columns, description: 'Split content into 2 columns.' },
  { id: 'column-layout-3', label: '3 Columns', icon: Columns, description: 'Split content into 3 columns.' },
];

export const SlashMenu = ({ onClose, onSelect, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const filteredItems = query.trim()
    ? MENU_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase())
      )
    : MENU_ITEMS;

  // Reset selectedIndex when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (searchRef.current) searchRef.current.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept typing in the search input
      if (e.target === searchRef.current) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(filteredItems.length, 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + Math.max(filteredItems.length, 1)) % Math.max(filteredItems.length, 1));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex].id);
          }
        } else if (e.key === 'Escape') {
          onClose();
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(filteredItems.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(filteredItems.length, 1)) % Math.max(filteredItems.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredItems, onClose, onSelect]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-72 bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden"
      style={{ top: '100%', left: 0, marginTop: '4px' }}
    >
      {/* Search input */}
      <div className="flex items-center border-b border-gray-100 px-3 py-2">
        <Search size={13} className="text-gray-400 mr-2 flex-shrink-0" />
        <input
          ref={searchRef}
          className="flex-1 text-sm outline-none placeholder-gray-400"
          placeholder="Search block types..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className="max-h-72 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">No results found</div>
        ) : (
          <>
            <div className="p-2 text-xs font-medium text-gray-500">Basic blocks</div>
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center px-3 py-2 cursor-pointer text-sm ${
                  index === selectedIndex ? 'bg-xotion-hover' : 'hover:bg-xotion-hover'
                }`}
                onClick={() => onSelect(item.id)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="mr-3 p-1 border border-gray-200 rounded bg-white shadow-sm text-gray-600">
                  <item.icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-xotion-text">{item.label}</div>
                  <div className="text-xs text-gray-400 truncate">{item.description}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
