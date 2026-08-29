import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ChevronRight, ChevronDown, Plus, Folder, Inbox, Send, File, Archive, Trash2, Ban } from 'lucide-react';
import clsx from 'clsx';

const ICON_MAP = {
  Inbox, Send, File, Archive, Trash2, Ban, Folder
};

export default function FolderPane({ selectedFolder, onSelectFolder }) {
  const { state, actions } = useStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [folderName, setFolderName] = useState('');

  // Calculate unread counts
  const getUnreadCount = (folderId) => {
    return state.emails.filter(e => e.folderId === folderId && !e.read).length;
  };

  const handleCreateFolder = (event) => {
    event.preventDefault();
    const name = folderName.trim();
    if (!name) return;
    actions.createFolder(name);
    setFolderName('');
    setShowCreateDialog(false);
  };

  return (
    <div className="w-60 bg-neutral-50 border-r border-neutral-200 flex flex-col h-full overflow-y-auto flex-shrink-0">
      <div className="p-2">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 w-full p-1 hover:bg-neutral-200 rounded text-sm font-semibold text-neutral-600"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span>Folders</span>
        </button>

        {isExpanded && (
          <div className="mt-1 space-y-0.5">
            {state.folders.map(folder => {
              const Icon = ICON_MAP[folder.icon] || Folder;
              const unread = getUnreadCount(folder.id);
              const isActive = selectedFolder === folder.id;

              return (
                <button
                  key={folder.id}
                  onClick={() => onSelectFolder(folder.id)}
                  className={clsx(
                    "flex items-center justify-between w-full px-3 py-2 rounded text-sm group transition-colors",
                    isActive ? "bg-blue-100 text-primary" : "hover:bg-neutral-200 text-neutral-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={clsx("w-4 h-4", isActive ? "text-primary" : "text-neutral-500")} />
                    <span>{folder.name}</span>
                  </div>
                  {unread > 0 && (
                    <span className={clsx(
                      "text-xs font-semibold px-1.5 rounded-full",
                      isActive ? "bg-primary text-white" : "text-primary group-hover:bg-white"
                    )}>
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
            
            <button 
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded text-sm text-primary hover:bg-neutral-200 hover:underline mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create new folder</span>
            </button>
          </div>
        )}
      </div>
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={handleCreateFolder} className="w-80 rounded bg-white p-4 shadow-xl">
            <h3 className="mb-3 text-lg font-semibold text-neutral-800">Create folder</h3>
            <input
              autoFocus
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              className="mb-4 w-full rounded border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Folder name"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreateDialog(false)} className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">Cancel</button>
              <button type="submit" className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
