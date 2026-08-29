import React from 'react';
import { Trash2, Archive, MailOpen, Flag, FolderInput, Tag, MoreHorizontal, Undo } from 'lucide-react';

export default function MailToolbar({ selectedCount, onAction, canUndo = false }) {
  const ActionButton = ({ icon: Icon, label, action, color = "text-neutral-600" }) => {
    const disabled = action === 'undo' ? !canUndo : selectedCount === 0 && action !== 'new';

    return (
    <button 
      onClick={() => onAction(action)}
      className={`flex items-center gap-1.5 px-3 py-1.5 hover:bg-neutral-100 rounded text-sm font-medium ${color} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={disabled}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden lg:inline">{label}</span>
    </button>
    );
  };

  return (
    <div className="h-10 border-b border-neutral-200 flex items-center px-2 bg-white flex-shrink-0 overflow-x-auto">
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onAction('new')}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded text-sm font-semibold flex items-center gap-2 mr-2 transition-colors"
        >
          <span className="text-lg leading-none">+</span> New mail
        </button>
        
        <div className="w-px h-5 bg-neutral-300 mx-1" />
        
        <ActionButton icon={Trash2} label="Delete" action="delete" />
        <ActionButton icon={Archive} label="Archive" action="archive" />
        <ActionButton icon={MailOpen} label="Mark read" action="markRead" />
        <ActionButton icon={Flag} label="Flag" action="flag" />
        
        <div className="w-px h-5 bg-neutral-300 mx-1" />
        
        <ActionButton icon={FolderInput} label="Move to" action="move" />
        <ActionButton icon={Tag} label="Categorize" action="categorize" />
        
        <div className="w-px h-5 bg-neutral-300 mx-1" />
        
        <ActionButton icon={Undo} label="Undo" action="undo" />
        <ActionButton icon={MoreHorizontal} label="..." action="more" />
      </div>
    </div>
  );
}
