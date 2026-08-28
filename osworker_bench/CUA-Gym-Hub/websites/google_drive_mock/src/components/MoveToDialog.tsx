import React, { useState } from 'react';
import { FileSystemItem } from '../lib/types';
import { useFileSystem } from '../context/FileSystemContext';
import { useToast } from '../context/ToastContext';
import { ChevronRight, ChevronDown, FolderOpen, X, FolderPlus } from 'lucide-react';
import { cn } from '../lib/utils';

interface MoveToDialogProps {
  itemIds: string[];
  onClose: () => void;
}

const FolderNode = ({
  folder,
  selectedId,
  onSelect,
  level = 0,
}: {
  folder: FileSystemItem;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  level?: number;
}) => {
  const { getFolderContents } = useFileSystem();
  const [isOpen, setIsOpen] = useState(level === 0);

  const children = getFolderContents(folder.id).filter(i => i.type === 'folder');
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        onClick={() => onSelect(folder.id)}
        className={cn(
          "flex items-center gap-1.5 cursor-pointer rounded-lg transition-colors text-sm h-8",
          selectedId === folder.id
            ? "bg-[#C2E7FF] text-[#001D35]"
            : "hover:bg-[#F1F3F4] text-[#202124]"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px`, paddingRight: '8px' }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className={cn("w-5 h-5 flex items-center justify-center rounded hover:bg-[#DADCE0] flex-shrink-0", !hasChildren && "invisible")}
        >
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        <FolderOpen className="w-4 h-4 flex-shrink-0 text-[#F4B400]" />
        <span className="truncate ml-1">{folder.name}</span>
      </div>

      {isOpen && hasChildren && (
        <div>
          {children.map(child => (
            <FolderNode
              key={child.id}
              folder={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MoveToDialog = ({ itemIds, onClose }: MoveToDialogProps) => {
  const { state, getFolderContents, dispatch } = useFileSystem();
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rootFolders = getFolderContents(null).filter(i => i.type === 'folder');
  const itemNames = itemIds.map(id => state.items[id]?.name).filter(Boolean);

  const handleMove = () => {
    const targetName = selectedId
      ? state.items[selectedId]?.name || 'selected folder'
      : 'My Drive';

    itemIds.forEach(id => {
      dispatch({ type: 'MOVE_ITEM', payload: { id, newParentId: selectedId } });
    });
    dispatch({ type: 'CLEAR_SELECTION' });

    showToast(
      `${itemIds.length} item${itemIds.length > 1 ? 's' : ''} moved to ${targetName}`,
      () => {
        // Undo: move back to original parents
        itemIds.forEach(id => {
          const item = state.items[id];
          if (item) {
            dispatch({ type: 'MOVE_ITEM', payload: { id, newParentId: item.parentId } });
          }
        });
      }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-96 max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DADCE0]">
          <h2 className="text-base font-medium text-[#202124]">
            Move {itemIds.length === 1 ? `"${itemNames[0]}"` : `${itemIds.length} items`}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F1F3F4] rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-[#5F6368]" />
          </button>
        </div>

        {/* Folder tree */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* My Drive root option */}
          <div
            onClick={() => setSelectedId(null)}
            className={cn(
              "flex items-center gap-2 cursor-pointer rounded-lg transition-colors text-sm h-8 px-2",
              selectedId === null
                ? "bg-[#C2E7FF] text-[#001D35]"
                : "hover:bg-[#F1F3F4] text-[#202124]"
            )}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 text-[#4285F4]" fill="currentColor">
              <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
            <span className="font-medium">My Drive</span>
          </div>

          {/* Folder tree */}
          {rootFolders.map(folder => (
            <FolderNode
              key={folder.id}
              folder={folder}
              selectedId={selectedId}
              onSelect={setSelectedId}
              level={0}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#DADCE0]">
          <button
            className="flex items-center gap-1.5 text-sm text-[#1A73E8] hover:bg-[#E8F0FE] rounded-full px-3 py-1.5 font-medium transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            New folder
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="text-sm font-medium text-[#5F6368] hover:text-[#202124] px-4 py-2 rounded-full hover:bg-[#F1F3F4] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              className="text-sm font-medium text-white bg-[#1A73E8] hover:bg-[#1557B0] px-4 py-2 rounded-full transition-colors"
            >
              Move here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
