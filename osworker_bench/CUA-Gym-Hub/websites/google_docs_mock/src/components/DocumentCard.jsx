import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Star,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';

function DocumentCard({ doc, viewMode, onOpen, onStar, onDelete, onRename, users }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const owner = users?.find((u) => u.id === doc.ownerId);
  const ownerName = owner ? owner.name : 'Unknown';
  const isShared = doc.sharedWith && doc.sharedWith.length > 0;
  const formattedDate = format(new Date(doc.updated), 'MMM d, yyyy');

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuOpen(true);
  };

  const handleMenuAction = (action) => {
    setMenuOpen(false);
    switch (action) {
      case 'open':
        onOpen(doc.id);
        break;
      case 'star':
        onStar(doc.id);
        break;
      case 'rename':
        onRename(doc.id);
        break;
      case 'delete':
        onDelete(doc.id);
        break;
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  };

  const ContextMenuDropdown = () => (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1 text-sm text-gray-700 z-50"
    >
      <button
        onClick={() => handleMenuAction('open')}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
      >
        <ExternalLink className="w-4 h-4 text-gray-500" /> Open
      </button>
      <button
        onClick={() => handleMenuAction('rename')}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
      >
        <Pencil className="w-4 h-4 text-gray-500" /> Rename
      </button>
      <button
        onClick={() => handleMenuAction('star')}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
      >
        <Star
          className={`w-4 h-4 ${doc.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`}
        />
        {doc.starred ? 'Remove from Starred' : 'Add to Starred'}
      </button>
      <div className="my-1 border-t border-gray-100" />
      <button
        onClick={() => handleMenuAction('delete')}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-red-600"
      >
        <Trash2 className="w-4 h-4" /> Remove
      </button>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onOpen(doc.id)}
        onContextMenu={handleContextMenu}
        className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer items-center group"
      >
        <div className="col-span-5 flex items-center gap-3 overflow-hidden">
          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <span className="truncate text-sm text-gray-700 font-medium">
            {doc.title}
          </span>
          {doc.starred && (
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
          )}
        </div>
        <div className="col-span-2 text-sm text-gray-500 flex items-center gap-2">
          {owner?.avatar && (
            <img
              src={owner.avatar}
              alt={ownerName}
              className="w-5 h-5 rounded-full"
            />
          )}
          <span className="truncate">{ownerName}</span>
        </div>
        <div className="col-span-2 text-sm text-gray-500 truncate">
          {formattedDate}
        </div>
        <div className="col-span-3 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            {isShared && <Users className="w-4 h-4 text-gray-400" />}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStar(doc.id);
              }}
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <Star
                className={`w-4 h-4 ${doc.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
              />
            </button>
            <div className="relative">
              <button
                ref={menuButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              {menuOpen && <ContextMenuDropdown />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  const previewText = stripHtml(doc.content);

  return (
    <div
      onClick={() => onOpen(doc.id)}
      onContextMenu={handleContextMenu}
      className="group relative flex flex-col bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all w-full"
    >
      {/* Content preview area */}
      <div className="h-40 bg-gray-50 rounded-t-lg overflow-hidden border-b border-gray-200 p-4 relative">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-6 whitespace-pre-wrap">
          {previewText}
        </p>
        {/* Hover actions overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStar(doc.id);
            }}
            className="p-1.5 bg-white rounded-full shadow hover:bg-gray-50"
          >
            <Star
              className={`w-4 h-4 ${doc.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
            />
          </button>
        </div>
      </div>

      {/* Document info */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <h3 className="text-sm font-medium text-gray-800 truncate flex-1">
            {doc.title}
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 min-w-0">
            {owner?.avatar && (
              <img
                src={owner.avatar}
                alt={ownerName}
                className="w-5 h-5 rounded-full flex-shrink-0"
              />
            )}
            <span className="truncate">{formattedDate}</span>
            {isShared && <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
          </div>
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            {menuOpen && <ContextMenuDropdown />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;
