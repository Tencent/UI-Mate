import React from 'react';
import { Share, PenLine, X } from 'lucide-react';

const ShareDialog = ({ onClose, post, onShare }) => {
  const handleShare = (type) => {
    if (onShare) onShare(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-center flex-1">Share</h3>
          <button onClick={onClose} className="bg-gray-100 rounded-full p-2 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors text-left" onClick={() => handleShare('public')}>
            <div className="bg-gray-200 p-2 rounded-full">
              <Share size={24} />
            </div>
            <div>
              <span className="font-semibold block text-[17px]">Share now (Public)</span>
              <span className="text-xs text-gray-500">Instantly share to your Feed</span>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors text-left" onClick={() => handleShare('feed')}>
            <div className="bg-gray-200 p-2 rounded-full">
              <PenLine size={24} />
            </div>
            <div>
              <span className="font-semibold block text-[17px]">Share to Feed</span>
              <span className="text-xs text-gray-500">Write a post with this attachment</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;