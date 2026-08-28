import React, { useEffect, useRef } from 'react';
import { FileSystemItem } from '../lib/types';
import { Eye, Share2, Star, Trash2, Edit2, Download, FolderOpen, FolderInput } from 'lucide-react';
import { cn } from '../lib/utils';

interface ContextMenuProps {
  x: number;
  y: number;
  item: FileSystemItem;
  onClose: () => void;
  onAction: (action: string, item: FileSystemItem) => void;
}

export const ContextMenu = ({ x, y, item, onClose, onAction }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position to keep within viewport
  const style = {
    top: y,
    left: x,
  };

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 text-sm text-gray-700 animate-in fade-in zoom-in-95 duration-100"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b border-gray-100 mb-1">
        <p className="font-medium truncate text-gray-900">{item.name}</p>
      </div>
      
      <button 
        onClick={() => onAction('preview', item)}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
      >
        <Eye className="w-4 h-4 text-gray-500" /> Preview
      </button>
      
      {item.type === 'folder' && (
        <button 
          onClick={() => onAction('open', item)}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
        >
          <FolderOpen className="w-4 h-4 text-gray-500" /> Open
        </button>
      )}

      <button 
        onClick={() => onAction('share', item)}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
      >
        <Share2 className="w-4 h-4 text-gray-500" /> Share
      </button>

      <button 
        onClick={() => onAction('download', item)}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
      >
        <Download className="w-4 h-4 text-gray-500" /> Download
      </button>

      <button 
        onClick={() => onAction('star', item)}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
      >
        <Star className={cn("w-4 h-4", item.starred ? "fill-yellow-400 text-yellow-400" : "text-gray-500")} />
        {item.starred ? 'Remove from Starred' : 'Add to Starred'}
      </button>

      <button 
        onClick={() => onAction('move', item)}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
      >
        <FolderInput className="w-4 h-4 text-gray-500" /> Move to...
      </button>

      <button 
        onClick={() => onAction('rename', item)}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
      >
        <Edit2 className="w-4 h-4 text-gray-500" /> Rename
      </button>

      <div className="my-1 border-t border-gray-100" />

      <button 
        onClick={() => onAction('delete', item)}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-red-600"
      >
        <Trash2 className="w-4 h-4" /> Move to Trash
      </button>
    </div>
  );
};
