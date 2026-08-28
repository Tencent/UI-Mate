import React, { useState } from 'react';
import { FileSystemItem } from '../lib/types';
import { X, Download, Share2, Star, Trash2 } from 'lucide-react';
import { useFileSystem } from '../context/FileSystemContext';
import { cn, downloadDriveItem } from '../lib/utils';
import { ShareModal } from './ShareModal';

interface PreviewModalProps {
  item: FileSystemItem | null;
  onClose: () => void;
}

// Google Workspace file types (doc / spreadsheet / presentation / form) are
// managed by their own dedicated mock apps. Google Drive itself only tracks
// their location, sharing and starring — content viewing/editing must happen
// in the corresponding app. This preview intentionally shows a read-only
// notice instead of any content or cross-app navigation to avoid confusion.
type GoogleAppKind = 'docs' | 'sheets' | 'slides' | 'forms';

interface GoogleAppInfo {
  kind: GoogleAppKind;
  appName: string; // "Google Docs" etc.
  accent: string;  // tailwind text color for header ribbon
}

const GOOGLE_APP_BY_TYPE: Record<string, GoogleAppInfo> = {
  doc:          { kind: 'docs',   appName: 'Google Docs',   accent: 'text-[#1A73E8]' },
  spreadsheet:  { kind: 'sheets', appName: 'Google Sheets', accent: 'text-[#0F9D58]' },
  presentation: { kind: 'slides', appName: 'Google Slides', accent: 'text-[#F4B400]' },
  form:         { kind: 'forms',  appName: 'Google Forms',  accent: 'text-[#673AB7]' },
};

export const PreviewModal = ({ item, onClose }: PreviewModalProps) => {
  const { dispatch } = useFileSystem();
  const [showShare, setShowShare] = useState(false);

  if (!item) return null;

  const handleDelete = () => {
    dispatch({ type: 'DELETE_ITEM', payload: { id: item.id } });
    onClose();
  };

  const handleToggleStar = () => {
    dispatch({ type: 'TOGGLE_STAR', payload: { id: item.id } });
  };

  const handleDownload = () => {
    downloadDriveItem(item);
  };

  const googleApp = GOOGLE_APP_BY_TYPE[item.type];

  const renderContent = () => {
    // ---- Google Workspace files: preview is not supported here ----
    // Show a plain, unambiguous notice; content is edited in the corresponding
    // Google Workspace app, not in Drive.
    if (googleApp) {
      return (
        <div
          className="shadow-2xl rounded-sm w-full max-w-3xl overflow-hidden bg-white"
          style={{ minHeight: '70vh' }}
        >
          <div className="border-b border-gray-200 px-8 py-4 flex items-center gap-3 bg-gray-50">
            <span className={cn('text-sm font-medium', googleApp.accent)}>
              {googleApp.appName}
            </span>
            <span className="text-xs text-gray-500">·</span>
            <span className="text-xs text-gray-500">
              Preview not available in Google Drive.
            </span>
          </div>

          <div className="px-16 py-14 text-center">
            <h1 className="text-3xl font-normal text-gray-800 mb-6">
              {item.name}
            </h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Preview is not supported for {googleApp.appName} files.
              To view or edit this document, open it in {googleApp.appName}.
            </p>
          </div>
        </div>
      );
    }

    switch (item.type) {
      case 'image':
        return <img src={item.thumbnailUrl ?? undefined} alt={item.name} className="max-w-full max-h-[80vh] object-contain" />;
      case 'pdf':
        return (
          <div className="flex flex-col items-center justify-center h-[80vh] bg-gray-100 w-full rounded-lg">
             <img src={item.thumbnailUrl || `https://picsum.photos/800/600?random=${item.id}`} className="max-w-full max-h-full opacity-80" />
             <p className="mt-4 text-gray-600">PDF Preview Mock</p>
          </div>
        );
      case 'video':
        return (
          <div className="flex items-center justify-center h-[60vh] bg-black w-full rounded-lg text-white">
            Video Player Mock
          </div>
        );
      default:
        return (
          <div className="p-8 bg-white rounded-lg shadow-sm max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">{item.name}</h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {item.content || "This is a preview of the file content. In a real application, the text content would be fetched and displayed here."}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      <div className="h-16 flex items-center justify-between px-4 text-white">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </button>
          <span className="font-medium truncate max-w-md">{item.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleStar} className="p-2 hover:bg-white/10 rounded-full">
            <Star className={cn("w-5 h-5", item.starred && "fill-yellow-400 text-yellow-400")} />
          </button>
          <button onClick={handleDelete} className="p-2 hover:bg-white/10 rounded-full">
            <Trash2 className="w-5 h-5" />
          </button>
          <button onClick={() => setShowShare(true)} className="p-2 hover:bg-white/10 rounded-full">
            <Share2 className="w-5 h-5" />
          </button>
          <button onClick={handleDownload} className="px-4 py-2 bg-primary hover:bg-blue-600 rounded text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        {renderContent()}
      </div>

      {showShare && (
        <ShareModal
          isOpen={true}
          item={item}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
};
