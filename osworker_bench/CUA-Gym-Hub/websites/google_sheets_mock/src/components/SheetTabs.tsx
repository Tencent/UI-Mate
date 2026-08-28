import React, { useState, useRef, useEffect } from 'react';
import { Plus, Menu } from 'lucide-react';
import { Sheet } from '../utils/types';

interface SheetTabsProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onTabColor: (id: string, color: string | null) => void;
}

const TAB_COLORS = [
  '#EA4335', '#FBBC04', '#34A853', '#4285F4', '#AB47BC', '#26C6DA',
  '#FF7043', '#66BB6A', '#42A5F5', '#7E57C2', '#EC407A', null,
];

export const SheetTabs: React.FC<SheetTabsProps> = ({
  sheets, activeSheetId, onSwitch, onAdd, onRename, onDelete, onDuplicate, onTabColor
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sheetId: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
        setShowColorPicker(null);
      }
    };
    if (contextMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [contextMenu]);

  const handleDoubleClick = (sheet: Sheet) => {
    setEditName(sheet.name);
    setEditingId(sheet.id);
  };

  const commitRename = (id: string) => {
    const trimmed = editName.trim();
    if (trimmed) onRename(id, trimmed);
    setEditingId(null);
  };

  const handleContextMenu = (e: React.MouseEvent, sheetId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, sheetId });
  };

  return (
    <div
      className="flex items-center h-9 border-t select-none"
      style={{ backgroundColor: '#F8F9FA', borderColor: '#DADCE0' }}
    >
      <button
        onClick={onAdd}
        className="p-1.5 hover:bg-gray-200 rounded mx-1 text-gray-600 flex-shrink-0"
        title="Add sheet"
      >
        <Plus size={18} />
      </button>

      <button className="p-1.5 hover:bg-gray-200 rounded mr-1 text-gray-600 flex-shrink-0" title="All sheets">
        <Menu size={18} />
      </button>

      <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {sheets.map(sheet => {
          const isActive = sheet.id === activeSheetId;
          const tabColor = sheet.tabColor;

          return (
            <div
              key={sheet.id}
              onClick={() => onSwitch(sheet.id)}
              onDoubleClick={() => handleDoubleClick(sheet)}
              onContextMenu={(e) => handleContextMenu(e, sheet.id)}
              className={`
                relative flex items-center gap-1 px-4 cursor-pointer text-sm transition-colors min-w-[80px] max-w-[150px]
                border-l border-r border-t border-b-0
                ${isActive
                  ? 'bg-white text-[#202124] font-medium z-10'
                  : 'bg-[#F8F9FA] text-[#5F6368] hover:bg-[#EBEBEB]'}
              `}
              style={{
                height: 36,
                borderColor: '#DADCE0',
                borderBottomColor: isActive ? 'white' : 'transparent',
                marginBottom: isActive ? -1 : 0,
              }}
            >
              {/* Colored bottom bar */}
              {tabColor && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b"
                  style={{ backgroundColor: tabColor }}
                />
              )}
              {!tabColor && isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0F9D58]" />
              )}

              {editingId === sheet.id ? (
                <input
                  ref={inputRef}
                  className="text-sm bg-transparent border-b border-[#1A73E8] outline-none w-full px-0"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => commitRename(sheet.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename(sheet.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span className="truncate">{sheet.name}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white border border-[#DADCE0] rounded shadow-lg py-1 text-sm text-[#202124]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            minWidth: 180,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          <button
            className="w-full text-left px-4 py-1.5 hover:bg-[#F1F3F4]"
            onClick={() => {
              onDuplicate(contextMenu.sheetId);
              setContextMenu(null);
            }}
          >
            Duplicate
          </button>
          <button
            className="w-full text-left px-4 py-1.5 hover:bg-[#F1F3F4]"
            onClick={() => {
              const sheet = sheets.find(s => s.id === contextMenu.sheetId);
              if (sheet) handleDoubleClick(sheet);
              setContextMenu(null);
            }}
          >
            Rename
          </button>
          <button
            className="w-full text-left px-4 py-1.5 hover:bg-[#F1F3F4]"
            onClick={() => {
              onDelete(contextMenu.sheetId);
              setContextMenu(null);
            }}
          >
            Delete
          </button>
          <div className="border-t border-[#DADCE0] my-1" />
          <div className="relative">
            <button
              className="w-full text-left px-4 py-1.5 hover:bg-[#F1F3F4] flex items-center justify-between"
              onClick={() => setShowColorPicker(contextMenu.sheetId)}
            >
              Change color
              <span className="text-[#5F6368]">▸</span>
            </button>
            {showColorPicker === contextMenu.sheetId && (
              <div
                className="absolute left-full top-0 bg-white border border-[#DADCE0] rounded shadow-lg p-2 z-50"
                style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
              >
                <div className="grid grid-cols-6 gap-1">
                  {TAB_COLORS.map((c, i) => (
                    <button
                      key={i}
                      className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c || 'transparent' }}
                      title={c || 'None'}
                      onClick={() => {
                        onTabColor(contextMenu.sheetId, c);
                        setContextMenu(null);
                        setShowColorPicker(null);
                      }}
                    >
                      {!c && <span className="text-gray-400 text-xs">✕</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
