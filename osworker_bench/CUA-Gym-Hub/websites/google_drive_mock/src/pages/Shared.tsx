import React, { useState } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { FileList } from '../components/FileList';
import { FileGrid } from '../components/FileGrid';
import { PreviewModal } from '../components/PreviewModal';
import { FileSystemItem } from '../lib/types';
import { LayoutGrid, List as ListIcon, Users } from 'lucide-react';

export const Shared = () => {
  const { state, getSharedWithMeItems, dispatch } = useFileSystem();
  const [previewItem, setPreviewItem] = useState<FileSystemItem | null>(null);
  const items = getSharedWithMeItems();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="h-12 border-b border-[#DADCE0] flex items-center justify-between px-4 flex-shrink-0">
        <h1 className="text-base font-normal text-[#202124]">Shared with me</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
            className={`p-2 rounded-full text-sm ${state.viewMode === 'list' ? 'bg-[#C2E7FF] text-[#001D35]' : 'hover:bg-[#F1F3F4] text-[#5F6368]'}`}
          >
            <ListIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
            className={`p-2 rounded-full text-sm ${state.viewMode === 'grid' ? 'bg-[#C2E7FF] text-[#001D35]' : 'hover:bg-[#F1F3F4] text-[#5F6368]'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#5F6368] gap-3">
            <Users className="w-16 h-16 text-[#DADCE0]" />
            <p className="text-base">Nothing shared with you yet</p>
            <p className="text-sm text-[#9AA0A6]">Files and folders that people share with you will appear here</p>
          </div>
        ) : (
          state.viewMode === 'grid'
            ? <FileGrid items={items} onPreview={setPreviewItem} />
            : <FileList items={items} onPreview={setPreviewItem} showOwner />
        )}
      </div>

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
};
