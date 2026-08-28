import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/StoreContext';
import { X, ChevronDown, Folder } from 'lucide-react';
import clsx from 'clsx';

export const SaveRequestModal = ({ onClose, initialName = 'Untitled Request' }) => {
  const { state, dispatch } = useStore();
  const [requestName, setRequestName] = useState(initialName);
  const [selectedCollectionId, setSelectedCollectionId] = useState(state.collections[0]?.id || '');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const nameInputRef = useRef(null);

  useEffect(() => {
    nameInputRef.current?.select();
  }, []);

  const selectedCollection = state.collections.find(c => c.id === selectedCollectionId);
  const folders = selectedCollection?.folders || [];

  const handleSave = () => {
    if (!requestName.trim() || !selectedCollectionId) return;

    dispatch({
      type: 'SAVE_REQUEST',
      payload: {
        name: requestName.trim(),
        collectionId: selectedCollectionId,
        folderId: selectedFolderId || null,
      }
    });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[420px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Save Request</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Request Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Request name</label>
            <input
              ref={nameInputRef}
              type="text"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Enter request name"
              autoFocus
            />
          </div>

          {/* Save to Collection */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Save to</label>
            <div className="relative">
              <select
                value={selectedCollectionId}
                onChange={(e) => {
                  setSelectedCollectionId(e.target.value);
                  setSelectedFolderId('');
                }}
                className="w-full h-9 px-3 pr-8 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer bg-white"
              >
                <option value="" disabled>Select a collection</option>
                {state.collections.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
          </div>

          {/* Optional Folder */}
          {folders.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Folder (optional)</label>
              <div className="relative">
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full h-9 px-3 pr-8 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer bg-white"
                >
                  <option value="">Collection root</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>
          )}

          {/* Collection preview */}
          {selectedCollectionId && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Folder size={12} className="text-yellow-500" />
                <span className="font-medium text-gray-700">{selectedCollection?.name}</span>
                {selectedFolderId && (
                  <>
                    <span className="text-gray-400">/</span>
                    <Folder size={11} className="text-amber-500" />
                    <span className="text-gray-600">
                      {folders.find(f => f.id === selectedFolderId)?.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="h-8 px-4 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!requestName.trim() || !selectedCollectionId}
            className="h-8 px-4 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
