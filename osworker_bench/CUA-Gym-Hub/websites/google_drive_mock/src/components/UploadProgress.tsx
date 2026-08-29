import React, { useEffect, useState } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { X, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { FileTypeIcon } from './FileTypeIcon';
import { FileSystemItem } from '../lib/types';

export const UploadProgress = () => {
  const { state } = useFileSystem();
  const [minimized, setMinimized] = useState(false);
  const [visible, setVisible] = useState(false);
  const [prevQueueLen, setPrevQueueLen] = useState(0);

  const activeUploads = state.uploadQueue.filter(item => item.status === 'uploading');
  const completedUploads = state.uploadQueue.filter(item => item.status === 'completed');
  const errorUploads = state.uploadQueue.filter(item => item.status === 'error');

  useEffect(() => {
    if (state.uploadQueue.length > prevQueueLen) {
      setVisible(true);
      setMinimized(false);
    }
    setPrevQueueLen(state.uploadQueue.length);
  }, [state.uploadQueue.length]);

  if (!visible || state.uploadQueue.length === 0) return null;

  const headerLabel = activeUploads.length > 0
    ? `Uploading ${activeUploads.length} item${activeUploads.length !== 1 ? 's' : ''}`
    : errorUploads.length > 0
      ? `${errorUploads.length} upload${errorUploads.length !== 1 ? 's' : ''} failed`
      : `${completedUploads.length} upload${completedUploads.length !== 1 ? 's' : ''} complete`;

  return (
    <div className={cn(
      "fixed bottom-0 right-8 bg-white shadow-2xl border border-[#DADCE0] rounded-t-lg transition-all duration-300 z-50 w-80 overflow-hidden",
    )}>
      {/* Header */}
      <div
        className="bg-[#202124] text-white px-4 py-3 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setMinimized(!minimized)}
      >
        <span className="text-sm font-medium">{headerLabel}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setMinimized(!minimized); }}
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
            title={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setVisible(false); }}
            className="hover:bg-white/20 p-1 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items list */}
      {!minimized && (
        <div className="overflow-y-auto max-h-72 bg-white divide-y divide-[#F1F3F4]">
          {state.uploadQueue.slice().reverse().map((item) => {
            // Create a minimal fake FileSystemItem for the icon
            const fakeItem: FileSystemItem = {
              id: item.id,
              name: item.name,
              type: 'unknown',
              parentId: null,
              size: 0,
              ownerId: '',
              sharedWith: [],
              starred: false,
              trashed: false,
              createdAt: 0,
              modifiedAt: 0,
              accessedAt: 0,
            };
            // Guess type from extension
            const ext = item.name.split('.').pop()?.toLowerCase() || '';
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) fakeItem.type = 'image';
            else if (ext === 'pdf') fakeItem.type = 'pdf';
            else if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) fakeItem.type = 'video';
            else if (['mp3', 'wav', 'aac', 'flac'].includes(ext)) fakeItem.type = 'audio';
            else if (['txt', 'md'].includes(ext)) fakeItem.type = 'text';
            else if (['zip', 'tar', 'gz', 'rar'].includes(ext)) fakeItem.type = 'archive';
            else if (['doc', 'docx'].includes(ext)) fakeItem.type = 'doc';
            else if (['xls', 'xlsx', 'csv'].includes(ext)) fakeItem.type = 'spreadsheet';
            else if (['ppt', 'pptx'].includes(ext)) fakeItem.type = 'presentation';
            else if (['js', 'ts', 'py', 'java', 'cpp', 'html', 'css'].includes(ext)) fakeItem.type = 'code';

            return (
              <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  <FileTypeIcon item={fakeItem} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#202124] truncate mb-1.5">{item.name}</p>
                  {item.status === 'uploading' ? (
                    <div className="space-y-1">
                      <div className="w-full bg-[#F1F3F4] rounded-full h-1.5">
                        <div
                          className="bg-[#1A73E8] h-1.5 rounded-full transition-all duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#5F6368]">{item.progress}%</p>
                    </div>
                  ) : item.status === 'completed' ? (
                    <span className="text-xs text-[#0B8043] flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Upload complete
                    </span>
                  ) : (
                    <span className="text-xs text-[#EA4335] flex items-center gap-1">
                      <X className="w-3 h-3" /> Upload failed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
