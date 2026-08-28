import React, { useState, useRef, useEffect } from 'react';
import { WorkbookState, Sheet } from '../utils/types';

interface MenuBarProps {
  onAction: (action: string, payload?: any) => void;
  state: WorkbookState;
  activeSheet: Sheet;
}

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: string;
  payload?: any;
  separator?: boolean;
  submenu?: MenuItem[];
  checked?: boolean;
}

const MENU_STRUCTURE: Record<string, MenuItem[]> = {
  File: [
    { label: 'New', shortcut: 'Ctrl+N', action: 'new_workbook' },
    { label: 'Open', shortcut: 'Ctrl+O', action: 'open_file' },
    { label: 'Make a copy', action: 'make_copy' },
    { separator: true, label: '' },
    { label: 'Share', action: 'share' },
    { label: 'Email', action: 'email_sheet' },
    { label: 'Download', submenu: [
      { label: 'Microsoft Excel (.xls)', action: 'download_xls' },
      { label: 'CSV (.csv)', action: 'download_csv' },
      { label: 'PDF (.pdf)', action: 'download_pdf' },
    ]},
    { separator: true, label: '' },
    { label: 'Rename', action: 'rename_title' },
    { label: 'Move', action: 'move_file' },
    { label: 'Move to trash', action: 'move_to_trash' },
    { separator: true, label: '' },
    { label: 'Version history', submenu: [
      { label: 'See version history', action: 'version_history' },
    ]},
    { label: 'Print', shortcut: 'Ctrl+P', action: 'print' },
  ],
  Edit: [
    { label: 'Undo', shortcut: 'Ctrl+Z', action: 'undo' },
    { label: 'Redo', shortcut: 'Ctrl+Y', action: 'redo' },
    { separator: true, label: '' },
    { label: 'Cut', shortcut: 'Ctrl+X', action: 'cut' },
    { label: 'Copy', shortcut: 'Ctrl+C', action: 'copy' },
    { label: 'Paste', shortcut: 'Ctrl+V', action: 'paste' },
    { label: 'Paste special', submenu: [
      { label: 'Values only', action: 'paste_values' },
      { label: 'Format only', action: 'paste_format' },
    ]},
    { separator: true, label: '' },
    { label: 'Find and replace', shortcut: 'Ctrl+H', action: 'find_replace' },
    { separator: true, label: '' },
    { label: 'Delete values', action: 'clear_contents' },
    { label: 'Delete row', action: 'delete_row' },
    { label: 'Delete column', action: 'delete_col' },
  ],
  View: [
    { label: 'Show', submenu: [
      { label: 'Formula bar', action: 'formula_bar', checked: true },
      { label: 'Gridlines', action: 'toggle_gridlines', checked: true },
    ]},
    { separator: true, label: '' },
    { label: 'Freeze', submenu: [
      { label: 'No rows', action: 'freeze', payload: { rows: 0, cols: 0 } },
      { label: '1 row', action: 'freeze', payload: { rows: 1, cols: 0 } },
      { label: '2 rows', action: 'freeze', payload: { rows: 2, cols: 0 } },
      { separator: true, label: '' },
      { label: 'No columns', action: 'freeze', payload: { rows: 0, cols: 0 } },
      { label: '1 column', action: 'freeze', payload: { rows: 0, cols: 1 } },
      { label: '2 columns', action: 'freeze', payload: { rows: 0, cols: 2 } },
    ]},
    { separator: true, label: '' },
    { label: 'Zoom', submenu: [
      { label: '50%', action: 'zoom', payload: 50 },
      { label: '75%', action: 'zoom', payload: 75 },
      { label: '90%', action: 'zoom', payload: 90 },
      { label: '100%', action: 'zoom', payload: 100 },
      { label: '125%', action: 'zoom', payload: 125 },
      { label: '150%', action: 'zoom', payload: 150 },
      { label: '200%', action: 'zoom', payload: 200 },
    ]},
  ],
  Insert: [
    { label: 'Row above', action: 'insert_row_above' },
    { label: 'Row below', action: 'insert_row_below' },
    { separator: true, label: '' },
    { label: 'Column left', action: 'insert_col_left' },
    { label: 'Column right', action: 'insert_col_right' },
    { separator: true, label: '' },
    { label: 'Chart', action: 'insert_chart' },
    { label: 'Image', action: 'insert_image' },
    { separator: true, label: '' },
    { label: 'Function', submenu: [
      { label: 'SUM', action: 'insert_function', payload: 'SUM' },
      { label: 'AVERAGE', action: 'insert_function', payload: 'AVERAGE' },
      { label: 'COUNT', action: 'insert_function', payload: 'COUNT' },
      { label: 'MAX', action: 'insert_function', payload: 'MAX' },
      { label: 'MIN', action: 'insert_function', payload: 'MIN' },
    ]},
    { label: 'Note', action: 'insert_note' },
    { label: 'Comment', action: 'insert_comment' },
  ],
  Format: [
    { label: 'Number', submenu: [
      { label: 'Automatic', action: 'format_number', payload: undefined },
      { label: 'Plain text', action: 'format_number', payload: 'text' },
      { separator: true, label: '' },
      { label: 'Number (1,000.12)', action: 'format_number', payload: 'number' },
      { label: 'Currency ($1,000.12)', action: 'format_number', payload: 'currency' },
      { label: 'Percent (10.12%)', action: 'format_number', payload: 'percent' },
      { label: 'Scientific (1.01E+03)', action: 'format_number', payload: 'scientific' },
      { separator: true, label: '' },
      { label: 'Date (12/31/2024)', action: 'format_number', payload: 'date' },
      { label: 'Time (3:59:00 PM)', action: 'format_number', payload: 'time' },
    ]},
    { separator: true, label: '' },
    { label: 'Bold', shortcut: 'Ctrl+B', action: 'bold' },
    { label: 'Italic', shortcut: 'Ctrl+I', action: 'italic' },
    { label: 'Underline', shortcut: 'Ctrl+U', action: 'underline' },
    { label: 'Strikethrough', shortcut: 'Alt+Shift+5', action: 'strikethrough' },
    { separator: true, label: '' },
    { label: 'Align', submenu: [
      { label: 'Left', shortcut: 'Ctrl+Shift+L', action: 'align', payload: 'left' },
      { label: 'Center', shortcut: 'Ctrl+Shift+E', action: 'align', payload: 'center' },
      { label: 'Right', shortcut: 'Ctrl+Shift+R', action: 'align', payload: 'right' },
    ]},
    { separator: true, label: '' },
    { label: 'Clear formatting', shortcut: 'Ctrl+\\', action: 'clear_formatting' },
  ],
  Data: [
    { label: 'Sort sheet A → Z', action: 'sort_asc' },
    { label: 'Sort sheet Z → A', action: 'sort_desc' },
    { separator: true, label: '' },
    { label: 'Create a filter', action: 'create_filter' },
    { separator: true, label: '' },
    { label: 'Data validation', action: 'data_validation' },
    { separator: true, label: '' },
    { label: 'Named ranges', action: 'named_ranges' },
  ],
  Tools: [
    { label: 'Spelling', action: 'spelling' },
    { label: 'Notification settings', action: 'notification_settings' },
  ],
  Extensions: [
    { label: 'Add-ons', action: 'add_ons' },
  ],
  Help: [
    { label: 'Search the menus', action: 'find' },
    { label: 'Keyboard shortcuts', action: 'keyboard_shortcuts' },
  ],
};

const MENU_NAMES = ['File', 'Edit', 'View', 'Insert', 'Format', 'Data', 'Tools', 'Extensions', 'Help'];

interface DropdownProps {
  items: MenuItem[];
  onAction: (action: string, payload?: any) => void;
  onClose: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({ items, onAction, onClose }) => {
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const submenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleItemClick = (item: MenuItem) => {
    if (item.separator || item.submenu) return;
    if (item.action) {
      onAction(item.action, item.payload);
    }
    onClose();
  };

  const handleMouseEnter = (index: number, hasSubmenu: boolean) => {
    if (submenuTimerRef.current) clearTimeout(submenuTimerRef.current);
    if (hasSubmenu) {
      setActiveSubmenu(index);
    } else {
      submenuTimerRef.current = setTimeout(() => setActiveSubmenu(null), 200);
    }
  };

  return (
    <div
      className="min-w-[220px] bg-white border border-[#DADCE0] rounded shadow-lg py-1 text-sm text-[#202124]"
      style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
    >
      {items.map((item, i) => {
        if (item.separator) {
          return <div key={i} className="border-t border-[#DADCE0] my-1" />;
        }
        return (
          <div
            key={i}
            className="relative flex items-center justify-between px-4 py-1.5 cursor-pointer select-none hover:bg-[#F1F3F4]"
            onClick={() => {
              if (item.submenu) {
                setActiveSubmenu(activeSubmenu === i ? null : i);
                return;
              }
              handleItemClick(item);
            }}
            onMouseEnter={() => handleMouseEnter(i, !!item.submenu)}
          >
            <span className="flex items-center gap-2">
              {item.checked !== undefined && (
                <span className="w-4 text-[#1A73E8]">{item.checked ? '✓' : ''}</span>
              )}
              {item.label}
            </span>
            <span className="flex items-center gap-2">
              {item.shortcut && <span className="text-[#5F6368] text-xs ml-6">{item.shortcut}</span>}
              {item.submenu && <span className="text-[#5F6368] ml-2">▸</span>}
            </span>
            {item.submenu && activeSubmenu === i && (
              <div className="absolute left-full top-0 z-50">
                <Dropdown items={item.submenu} onAction={onAction} onClose={onClose} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const MenuBar: React.FC<MenuBarProps> = ({ onAction, state, activeSheet }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
      }
    };
    if (openMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenu]);

  const handleMenuClick = (name: string) => {
    setOpenMenu(prev => (prev === name ? null : name));
  };

  const handleAction = (action: string, payload?: any) => {
    onAction(action, payload);
    setOpenMenu(null);
  };

  return (
    <div
      ref={menuBarRef}
      className="flex items-center px-2 bg-white h-8 select-none"
      style={{ backgroundColor: '#EDF2FA' }}
    >
      {MENU_NAMES.map(name => (
        <div key={name} className="relative">
          <button
            className={`px-2 py-1 text-sm text-[#202124] rounded-sm transition-colors
              ${openMenu === name ? 'bg-[#D3E3FD]' : 'hover:bg-[#D3E3FD]'}
            `}
            style={{ fontSize: 14, borderRadius: 4 }}
            onClick={() => handleMenuClick(name)}
            onMouseEnter={() => openMenu && openMenu !== name && setOpenMenu(name)}
          >
            {name}
          </button>
          {openMenu === name && (
            <div className="absolute left-0 top-full z-50 mt-0.5">
              <Dropdown
                items={MENU_STRUCTURE[name] || []}
                onAction={handleAction}
                onClose={() => setOpenMenu(null)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
