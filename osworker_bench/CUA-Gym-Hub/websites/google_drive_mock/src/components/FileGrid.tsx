import React, { useState } from 'react';
import { FileSystemItem } from '../lib/types';
import { Folder, FileText, Image as ImageIcon, Film, Music, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFileSystem } from '../context/FileSystemContext';
import { cn, downloadDriveItem } from '../lib/utils';
import { ContextMenu } from './ContextMenu';
import { ShareModal } from './ShareModal';
import { RenameModal } from './RenameModal';
import { MoveToDialog } from './MoveToDialog';

interface FileGridProps {
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

export const FileGrid = ({ items, onPreview }: FileGridProps) => {
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
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
            className="group relative flex flex-col bg-white border border-border rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all"
          >
            <div className="h-32 bg-gray-50 rounded-t-lg flex items-center justify-center overflow-hidden relative border-b border-border">
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <FileIcon type={item.type} className="w-12 h-12" />
              )}
              
              {/* Hover Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_STAR', payload: { id: item.id } }); }}
                  className="p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <Star className={cn("w-4 h-4", item.starred && "fill-yellow-400 text-yellow-400")} />
                </button>
              </div>
            </div>
            
            <div className="p-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileIcon type={item.type} className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
                </div>
              </div>
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
    </>
  );
};
