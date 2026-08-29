import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { FileSystemItem } from '../lib/types';

interface RenameModalProps {
  item: FileSystemItem;
  onClose: () => void;
  onRename: (name: string) => void;
}

export const RenameModal = ({ item, onClose, onRename }: RenameModalProps) => {
  const [name, setName] = useState(item.name);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextName = name.trim();
    if (nextName && nextName !== item.name) {
      onRename(nextName);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center" onClick={onClose}>
      <form
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-normal">Rename</h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="rename-input">
            Name
          </label>
          <input
            id="rename-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded hover:bg-gray-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Rename
          </button>
        </div>
      </form>
    </div>
  );
};
