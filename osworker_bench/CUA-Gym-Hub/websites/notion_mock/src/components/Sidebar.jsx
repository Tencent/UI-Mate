import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/store';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash,
  Trash2,
  Settings,
  Search,
  Bell,
  MoreHorizontal,
  FileText,
  LayoutTemplate,
  ChevronsLeft,
  Menu,
  Star,
  Copy,
  Files,
  FolderInput,
  Pencil,
  RotateCcw,
  X,
  GripVertical
} from 'lucide-react';
import clsx from 'clsx';
import { SettingsModal } from './SettingsModal';
import { NotificationsPanel } from './NotificationsPanel';
import { TemplatesModal } from './TemplatesModal';

// Context menu for sidebar page items
const PageContextMenu = ({ page, position, onClose }) => {
  const { state, updatePage, trashPage, duplicatePage } = useStore();
  const navigate = useNavigate();
  const ref = useRef(null);
  const [showMoveTo, setShowMoveTo] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(page.title || '');
  const renameRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    if (renaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renaming]);

  const allPages = Object.values(state.pages).filter(p => p.id !== page.id && p.type !== 'database');

  if (renaming) {
    return (
      <div ref={ref} className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2 min-w-[220px]" style={{ top: position.top, left: position.left }}>
        <input
          ref={renameRef}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updatePage(page.id, { title: renameValue });
              onClose();
            }
            if (e.key === 'Escape') onClose();
          }}
          onBlur={() => {
            updatePage(page.id, { title: renameValue });
            onClose();
          }}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[200px] text-sm" style={{ top: position.top, left: position.left }}>
      <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-red-600" onClick={() => {
        trashPage(page.id);
        const remaining = Object.values(state.pages).filter(p => p.id !== page.id && !p.parentId);
        if (remaining.length > 0) navigate(`/page/${remaining[0].id}`);
        onClose();
      }}>
        <Trash2 size={14} className="mr-2" /> Delete
      </button>
      <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700" onClick={() => {
        duplicatePage(page.id);
        onClose();
      }}>
        <Files size={14} className="mr-2 text-gray-500" /> Duplicate
      </button>
      <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700" onClick={() => {
        setRenaming(true);
      }}>
        <Pencil size={14} className="mr-2 text-gray-500" /> Rename
      </button>
      <div className="relative">
        <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between text-gray-700" onClick={() => setShowMoveTo(!showMoveTo)}>
          <span className="flex items-center"><FolderInput size={14} className="mr-2 text-gray-500" /> Move to</span>
          <ChevronRight size={12} className="text-gray-400" />
        </button>
        {showMoveTo && (
          <div className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[200px] max-h-[300px] overflow-y-auto z-50">
            {allPages.map(p => (
              <button key={p.id} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700 text-xs" onClick={() => {
                updatePage(page.id, { parentId: p.id });
                onClose();
              }}>
                <span className="mr-2">{p.icon || '\u{1F4C4}'}</span>
                <span className="truncate">{p.title || 'Untitled'}</span>
              </button>
            ))}
            <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-gray-500 text-xs" onClick={() => {
              updatePage(page.id, { parentId: null });
              onClose();
            }}>
              Move to root
            </button>
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 my-1" />
      <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700" onClick={() => {
        updatePage(page.id, { favorite: !page.favorite });
        onClose();
      }}>
        <Star size={14} className="mr-2 text-gray-500" />
        {page.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
      <button className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center text-gray-700" onClick={() => {
        navigator.clipboard.writeText(window.location.origin + `/page/${page.id}`);
        onClose();
      }}>
        <Copy size={14} className="mr-2 text-gray-500" /> Copy link
      </button>
    </div>
  );
};

const SidebarItem = ({ page, depth = 0, onDragStart, onDragOver, onDrop, onDragEnd, isDragOver }) => {
  const { state, addPage } = useStore();
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === `/page/${page.id}`;
  const [contextMenu, setContextMenu] = useState(null);
  const moreRef = useRef(null);

  const childPages = Object.values(state.pages).filter(p => p.parentId === page.id);
  const hasChildren = childPages.length > 0;

  const handleExpand = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setExpanded(!expanded);
  };

  const handleAddChild = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addPage(page.id);
    setExpanded(true);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (moreRef.current) {
      const rect = moreRef.current.getBoundingClientRect();
      setContextMenu({ top: rect.bottom + 2, left: rect.left });
    }
  };

  return (
    <div>
      <div
        draggable={depth === 0}
        onDragStart={(e) => onDragStart?.(e, page.id)}
        onDragOver={(e) => onDragOver?.(e, page.id)}
        onDrop={(e) => onDrop?.(e, page.id)}
        onDragEnd={onDragEnd}
        className={clsx(isDragOver && 'border-t-2 border-blue-400')}
      >
        <Link
          to={`/page/${page.id}`}
          className={clsx(
            "group flex items-center min-h-[28px] py-1 pr-2 text-sm rounded-sm cursor-pointer select-none hover:bg-xotion-hover text-xotion-textGray hover:text-xotion-text",
            isActive && "bg-xotion-hover text-xotion-text font-medium"
          )}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          <div
            className={clsx(
              "flex items-center justify-center w-5 h-5 rounded-sm hover:bg-gray-300 mr-1 transition-colors",
              !hasChildren && "opacity-0 group-hover:opacity-100"
            )}
            onClick={handleExpand}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          <span className="mr-2 text-lg leading-none">{page.icon || '\u{1F4C4}'}</span>
          <span className="truncate flex-1">{page.title || 'Untitled'}</span>

          <div className="flex items-center opacity-0 group-hover:opacity-100">
            <button className="p-1 hover:bg-gray-300 rounded" onClick={handleAddChild}>
              <Plus size={14} />
            </button>
            <button ref={moreRef} className="p-1 hover:bg-gray-300 rounded ml-1" onClick={handleMoreClick}>
              <MoreHorizontal size={14} />
            </button>
          </div>
        </Link>
      </div>

      {contextMenu && (
        <PageContextMenu
          page={page}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}

      {expanded && (
        <div>
          {childPages.map(child => (
            <SidebarItem key={child.id} page={child} depth={depth + 1} />
          ))}
          {childPages.length === 0 && (
            <div
              className="pl-8 py-1 text-xs text-gray-400 ml-4"
              style={{ paddingLeft: `${(depth + 1) * 12 + 24}px` }}
            >
              No pages inside
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Trash slide-over panel
const TrashPanel = ({ onClose }) => {
  const { state, restorePage, permanentDelete } = useStore();
  const trash = state.trash || [];
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const getDaysAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div ref={ref} className="fixed right-0 top-0 h-full w-[360px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm">Trash</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={16} className="text-gray-500" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {trash.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Trash size={32} className="mb-2" />
            <span className="text-sm">Trash is empty</span>
          </div>
        ) : (
          <div className="py-2">
            {trash.map(item => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 group">
                <div className="flex items-center min-w-0 flex-1">
                  <span className="mr-2 text-lg flex-shrink-0">{item.page.icon || '\u{1F4C4}'}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{item.page.title || 'Untitled'}</div>
                    <div className="text-xs text-gray-400">Deleted {getDaysAgo(item.deletedDate)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2">
                  <button
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-blue-600"
                    title="Restore"
                    onClick={() => restorePage(item.id)}
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600"
                    title="Delete permanently"
                    onClick={() => permanentDelete(item.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Search modal
export const SearchModal = ({ onClose }) => {
  const { state } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const allPages = Object.values(state.pages).filter(p => p.type !== 'database' || p.title);

  const getBreadcrumb = (page) => {
    const parts = [];
    let pid = page.parentId;
    while (pid && state.pages[pid]) {
      parts.unshift(state.pages[pid].title || 'Untitled');
      pid = state.pages[pid].parentId;
    }
    return parts.join(' / ');
  };

  let results;
  if (query.trim()) {
    const q = query.toLowerCase();
    results = allPages.filter(p => (p.title || '').toLowerCase().includes(q));
  } else {
    results = [...allPages]
      .sort((a, b) => new Date(b.lastEditedDate || b.createdDate) - new Date(a.lastEditedDate || a.createdDate))
      .slice(0, 5);
  }

  const clampedIndex = Math.max(0, Math.min(selectedIndex, results.length - 1));

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
      return;
    }
    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      const page = results[clampedIndex];
      if (page) {
        navigate(`/page/${page.id}`);
        onClose();
      }
      return;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center pt-[15vh] z-50">
      <div ref={modalRef} className="bg-white rounded-xl shadow-2xl w-[560px] max-h-[480px] flex flex-col overflow-hidden border border-gray-200">
        <div className="flex items-center px-4 py-3 border-b border-gray-200">
          <Search size={18} className="text-gray-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 outline-none text-sm placeholder-gray-400"
            placeholder="Search pages..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <button onClick={onClose} className="ml-2 text-xs text-gray-400 border border-gray-300 rounded px-1.5 py-0.5">
            ESC
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {!query.trim() && results.length > 0 && (
            <div className="px-4 py-1 text-xs text-gray-400 font-medium">Recent</div>
          )}
          {results.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
              No results found
            </div>
          ) : (
            results.map((page, index) => (
              <div
                key={page.id}
                className={clsx(
                  "flex items-center px-4 py-2 cursor-pointer text-sm",
                  index === clampedIndex ? "bg-xotion-hover" : "hover:bg-gray-50"
                )}
                onClick={() => {
                  navigate(`/page/${page.id}`);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="mr-2 text-lg flex-shrink-0">{page.icon || '\u{1F4C4}'}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{page.title || 'Untitled'}</div>
                  {getBreadcrumb(page) && (
                    <div className="text-xs text-gray-400 truncate">{getBreadcrumb(page)}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const { state, addPage, reorderPages } = useStore();
  const [width, setWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const sidebarRef = useRef(null);

  // Drag state for sidebar reorder
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // Listen for toggle-sidebar event from keyboard shortcut
  useEffect(() => {
    const handler = () => setIsCollapsed(prev => !prev);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  // Get ordered root pages
  const pageOrder = state.pageOrder || [];
  const allRootPages = Object.values(state.pages).filter(p => !p.parentId);
  // Use pageOrder if available, fallback to natural order
  const rootPages = pageOrder.length > 0
    ? pageOrder.map(id => state.pages[id]).filter(Boolean)
    : allRootPages;
  // Add any root pages not in pageOrder
  const orderedIds = new Set(pageOrder);
  const extraRootPages = allRootPages.filter(p => !orderedIds.has(p.id));
  const allOrderedRootPages = [...rootPages, ...extraRootPages];

  const favoritePages = Object.values(state.pages).filter(p => p.favorite);
  const sharedPages = Object.values(state.pages).filter(p => (p.properties?.sharedWith || []).length > 0);

  const unreadNotifCount = (state.notifications || []).filter(n => !n.read).length;

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 150 && newWidth < 480) {
        setWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  // Drag handlers for sidebar reorder
  const handleDragStart = (e, pageId) => {
    setDragId(pageId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', pageId);
  };

  const handleDragOver = (e, pageId) => {
    e.preventDefault();
    if (dragId && dragId !== pageId) {
      setDragOverId(pageId);
    }
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;

    const currentOrder = allOrderedRootPages.map(p => p.id);
    const fromIdx = currentOrder.indexOf(dragId);
    const toIdx = currentOrder.indexOf(targetId);

    if (fromIdx !== -1 && toIdx !== -1) {
      const newOrder = [...currentOrder];
      const [moved] = newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, moved);
      reorderPages(newOrder);
    }

    setDragId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

  if (isCollapsed) {
    return (
      <>
        <div className="w-12 h-full bg-xotion-sidebar border-r border-xotion-border flex flex-col items-center py-4 group relative z-50">
          <button
            className="p-2 hover:bg-gray-200 rounded text-gray-500 mb-4"
            onClick={() => setIsCollapsed(false)}
            title="Expand sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="w-8 h-8 bg-orange-400 rounded flex items-center justify-center text-xs text-white font-bold mb-4 cursor-pointer">
            {state.workspace.name[0]}
          </div>
          <div className="flex flex-col space-y-4 mt-2">
             <Search size={20} className="text-gray-500 cursor-pointer hover:text-black" onClick={() => setShowSearch(true)} />
             <div className="relative">
               <Bell size={20} className="text-gray-500 cursor-pointer hover:text-black" onClick={() => setShowNotifications(true)} />
               {unreadNotifCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">{unreadNotifCount}</span>
               )}
             </div>
             <Settings size={20} className="text-gray-500 cursor-pointer hover:text-black" onClick={() => setShowSettings(true)} />
          </div>
        </div>
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
      </>
    );
  }

  return (
    <>
      <div
        ref={sidebarRef}
        className="bg-xotion-sidebar border-r border-xotion-border flex flex-col h-full select-none flex-shrink-0 relative group"
        style={{ width: width }}
      >
        {/* Collapse Button */}
        <div
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer p-1 hover:bg-gray-300 rounded text-gray-500"
          onClick={() => setIsCollapsed(true)}
          title="Collapse sidebar"
        >
          <ChevronsLeft size={16} />
        </div>

        {/* Workspace Header */}
        <div className="h-12 flex items-center px-4 hover:bg-xotion-hover cursor-pointer transition-colors m-2 rounded-md">
          <div className="w-5 h-5 bg-orange-400 rounded flex items-center justify-center text-xs text-white mr-2 font-bold">
            {state.workspace.name[0]}
          </div>
          <span className="font-medium text-sm truncate flex-1">{state.workspace.name}</span>
          <ChevronDown size={14} className="text-gray-500" />
        </div>

        {/* Quick Links */}
        <div className="px-2 mb-4">
          <div
            className="flex items-center px-3 py-1 text-sm text-xotion-textGray hover:bg-xotion-hover rounded cursor-pointer"
            onClick={() => setShowSearch(true)}
          >
            <Search size={16} className="mr-2" />
            <span>Search</span>
          </div>
          <div
            className="flex items-center px-3 py-1 text-sm text-xotion-textGray hover:bg-xotion-hover rounded cursor-pointer"
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={16} className="mr-2" />
            <span>Updates</span>
            {unreadNotifCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unreadNotifCount}</span>
            )}
          </div>
          <div
            className="flex items-center px-3 py-1 text-sm text-xotion-textGray hover:bg-xotion-hover rounded cursor-pointer"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={16} className="mr-2" />
            <span>Settings & Members</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto sidebar-scroll px-2">

          {/* Favorites Section */}
          {favoritePages.length > 0 && (
            <div className="mb-4">
               <div className="mb-1 px-3 text-xs font-semibold text-gray-500 flex items-center group/header">
                  <span>Favorites</span>
               </div>
               {favoritePages.map(page => (
                 <SidebarItem key={page.id} page={page} />
               ))}
            </div>
          )}

          {/* Shared Section (Mock) */}
          <div className="mb-4">
             <div className="mb-1 px-3 text-xs font-semibold text-gray-500">Shared</div>
             {sharedPages.length > 0 ? (
               sharedPages.map(page => (
                 <SidebarItem key={page.id} page={page} />
               ))
             ) : (
               <div className="px-3 py-1 text-sm text-gray-400 italic">Share a page to list it here</div>
             )}
          </div>

          {/* Private Section */}
          <div className="mb-2 px-3 text-xs font-semibold text-gray-500">Private</div>
          {allOrderedRootPages.map(page => (
            <SidebarItem
              key={page.id}
              page={page}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragOver={dragOverId === page.id}
            />
          ))}

          <div
            className="flex items-center px-3 py-1 mt-2 text-sm text-xotion-textGray hover:bg-xotion-hover rounded cursor-pointer"
            onClick={() => addPage(null)}
          >
            <Plus size={16} className="mr-2" />
            <span>New Page</span>
          </div>

          {/* Templates Section */}
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500">Templates</div>
          <div
            className="flex items-center px-3 py-1 text-sm text-xotion-textGray hover:bg-xotion-hover rounded cursor-pointer"
            onClick={() => setShowTemplates(true)}
          >
            <LayoutTemplate size={16} className="mr-2" />
            <span>Templates</span>
          </div>
          <div
            className="flex items-center px-3 py-1 text-sm text-xotion-textGray hover:bg-xotion-hover rounded cursor-pointer"
            onClick={() => setShowTemplates(true)}
          >
            <Plus size={16} className="mr-2" />
            <span>Create from template</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-2 border-t border-xotion-border">
          <div
            className="flex items-center px-3 py-1 text-sm text-xotion-textGray hover:bg-xotion-hover rounded cursor-pointer"
            onClick={() => setShowTrash(true)}
          >
            <Trash size={16} className="mr-2" />
            <span>Trash</span>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-gray-300 transition-colors z-20"
          onMouseDown={startResizing}
        />
      </div>

      {/* Trash Panel */}
      {showTrash && <TrashPanel onClose={() => setShowTrash(false)} />}

      {/* Search Modal */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Notifications Panel */}
      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}

      {/* Templates Modal */}
      {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} />}
    </>
  );
};
