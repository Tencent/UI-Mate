import React, { useState } from 'react';
import { FileSystemItem } from '../lib/types';
import { Folder, FileText, Image as ImageIcon, Film, Music, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFileSystem } from '../context/FileSystemContext';
import { cn, downloadDriveItem, formatBytes } from '../lib/utils';
import { format } from 'date-fns';
import { ContextMenu } from './ContextMenu';
import { ShareModal } from './ShareModal';
import { RenameModal } from './RenameModal';
import { MoveToDialog } from './MoveToDialog';

interface FileListProps {
  onDetails?: (item: FileSystemItem) => void;
  showOwner?: boolean;
  items: FileSystemItem[];
  onPreview: (item: FileSystemItem) => void;
}

const FileIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'folder': return <Folder className={cn("text-folder fill-folder", className)} />;
    case 'image': return <ImageIcon className={cn("text-red-500", className)} />;
    case 'pdf': return <FileText className={cn("text-red-500", className)} />;
    case 'video': return <Film className={cn("text-red-500", className)} />;
    case 'audio': return <Music className={cn("text-red-500", className)} />;
    default: return <FileText className={cn("text-blue-500", className)} />;
  }
};

export const FileList = ({ items, onPreview, onDetails, showOwner }: FileListProps) => {
  const navigate = useNavigate();
  const { dispatch } = useFileSystem();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: FileSystemItem } | null>(null);
  const [shareItem, setShareItem] = useState<FileSystemItem | null>(null);
  const [renameItem, setRenameItem] = useState<FileSystemItem | null>(null);
  const [moveItem, setMoveItem] = useState<FileSystemItem | null>(null);

  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      navigate(item.parentId === null ? `/` : `/folder/${item.id}`);
    } else {
      dispatch({ type: 'ACCESS_ITEM', payload: { id: item.id } });
      onPreview(item);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: FileSystemItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleContextAction = (action: string, item: FileSystemItem) => {
    setContextMenu(null);
    switch (action) {
      case 'open':
      case 'preview':
        handleItemClick(item);
        break;
      case 'share':
        setShareItem(item);
        break;
      case 'download':
        downloadDriveItem(item);
        break;
      case 'star':
        dispatch({ type: 'TOGGLE_STAR', payload: { id: item.id } });
        break;
      case 'delete':
        dispatch({ type: 'DELETE_ITEM', payload: { id: item.id } });
        break;
      case 'rename':
        setRenameItem(item);
        break;
      case 'move':
        setMoveItem(item);
        break;
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-border text-sm font-medium text-gray-500">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Owner</div>
        <div className="col-span-2">Last modified</div>
        <div className="col-span-2">File size</div>
      </div>
      <div className="flex flex-col pb-20">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
            className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer items-center group"
          >
            <div className="col-span-6 flex items-center gap-3 overflow-hidden">
              <FileIcon type={item.type} className="w-5 h-5 flex-shrink-0" />
              <span className="truncate text-sm text-gray-700 font-medium">{item.name}</span>
              {item.starred && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />}
            </div>
            <div className="col-span-2 text-sm text-gray-500">me</div>
            <div className="col-span-2 text-sm text-gray-500 truncate">
              {format(item.modifiedAt, 'MMM d, yyyy')}
            </div>
            <div className="col-span-2 text-sm text-gray-500 flex items-center justify-between">
              <span>{item.type === 'folder' ? '-' : formatBytes(item.size)}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_STAR', payload: { id: item.id } }); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full transition-all"
              >
                <Star className={cn("w-4 h-4 text-gray-400", item.starred && "fill-yellow-400 text-yellow-400")} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          item={contextMenu.item} 
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}

      {shareItem && (
        <ShareModal 
          isOpen={true} 
          item={shareItem} 
          onClose={() => setShareItem(null)} 
        />
      )}

      {renameItem && (
        <RenameModal
          item={renameItem}
          onClose={() => setRenameItem(null)}
          onRename={(name) => {
            dispatch({ type: 'RENAME_ITEM', payload: { id: renameItem.id, name } });
            setRenameItem(null);
          }}
        />
      )}

      {moveItem && (
        <MoveToDialog
          itemIds={[moveItem.id]}
          onClose={() => setMoveItem(null)}
        />
      )}
    </div>
  );
};
