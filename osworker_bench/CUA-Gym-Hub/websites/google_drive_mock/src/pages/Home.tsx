import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileSystem } from '../context/FileSystemContext';
import { FileList } from '../components/FileList';
import { PreviewModal } from '../components/PreviewModal';
import { FileTypeIcon } from '../components/FileTypeIcon';
import { FileSystemItem } from '../lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

const SuggestedCard = ({ item, onClick }: { item: FileSystemItem; onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-44 cursor-pointer group rounded-xl border border-[#DADCE0] overflow-hidden hover:shadow-md transition-all duration-150"
    >
      {/* Thumbnail area */}
      <div className="h-28 bg-[#F8F9FA] flex items-center justify-center relative overflow-hidden">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <FileTypeIcon item={item} size="lg" />
        )}
      </div>
      {/* Info */}
      <div className="p-3 bg-white">
        <p className="text-sm font-medium text-[#202124] truncate">{item.name}</p>
        <p className="text-xs text-[#5F6368] mt-0.5">
          Opened {formatDistanceToNow(item.accessedAt, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export const Home = () => {
  const { getRecentItems, state } = useFileSystem();
  const navigate = useNavigate();
  const [previewItem, setPreviewItem] = useState<FileSystemItem | null>(null);

  const allRecent = getRecentItems();
  // Suggested: top 6 most recently accessed files
  const suggested = allRecent.slice(0, 6);
  // Recent list: all recent items
  const recentList = allRecent;

  const handleSuggestedClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      navigate(`/folder/${item.id}`);
    } else {
      setPreviewItem(item);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="h-14 border-b border-[#DADCE0] flex items-center px-6 flex-shrink-0">
        <h1 className="text-base font-normal text-[#202124]">Home</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Suggested section */}
        {suggested.length > 0 && (
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-sm font-medium text-[#202124] mb-3">Suggested</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {suggested.map(item => (
                <SuggestedCard
                  key={item.id}
                  item={item}
                  onClick={() => handleSuggestedClick(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {suggested.length > 0 && (
          <div className="mx-6 border-t border-[#DADCE0] mb-1" />
        )}

        {/* Recent section */}
        <div className="px-0">
          <div className="px-6 py-3">
            <h2 className="text-sm font-medium text-[#202124]">Recent</h2>
          </div>
          {recentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#5F6368] gap-3">
              <svg viewBox="0 0 24 24" className="w-16 h-16 text-[#DADCE0]" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
              </svg>
              <p className="text-base">No recent files</p>
              <p className="text-sm text-[#9AA0A6]">Files you open will appear here</p>
            </div>
          ) : (
            <FileList items={recentList} onPreview={setPreviewItem} />
          )}
        </div>
      </div>

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
};
