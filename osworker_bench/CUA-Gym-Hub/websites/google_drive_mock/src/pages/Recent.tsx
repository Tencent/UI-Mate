import React, { useState } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { FileList } from '../components/FileList';
import { FileGrid } from '../components/FileGrid';
import { PreviewModal } from '../components/PreviewModal';
import { FileSystemItem } from '../lib/types';
import { LayoutGrid, List as ListIcon, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export const Recent = () => {
  const { getRecentItems, state, dispatch } = useFileSystem();
  const [previewItem, setPreviewItem] = useState<FileSystemItem | null>(null);
  const items = getRecentItems();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="h-14 border-b border-[#DADCE0] flex items-center justify-between px-4 flex-shrink-0">
        <h1 className="text-base font-normal text-[#202124]">Recent</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
            className={cn("p-2 rounded-full transition-colors", state.viewMode === 'list' ? 'bg-[#C2E7FF] text-[#001D35]' : 'hover:bg-[#F1F3F4] text-[#5F6368]')}
            title="List view"
          >
            <ListIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
            className={cn("p-2 rounded-full transition-colors", state.viewMode === 'grid' ? 'bg-[#C2E7FF] text-[#001D35]' : 'hover:bg-[#F1F3F4] text-[#5F6368]')}
            title="Grid view"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#5F6368] gap-3">
            <Clock className="w-16 h-16 text-[#DADCE0]" />
            <p className="text-base font-medium">No recent items</p>
            <p className="text-sm text-[#9AA0A6]">Files you open will appear here</p>
          </div>
        ) : state.viewMode === 'grid' ? (
          <FileGrid items={items} onPreview={setPreviewItem} />
        ) : (
          <FileList items={items} onPreview={setPreviewItem} />
        )}
      </div>
      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
};
