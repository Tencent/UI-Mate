import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, children, title }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[5%]" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#EFF3F4]">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#F7F9F9] transition-colors">
            <X className="w-5 h-5 text-[#0F1419]" />
          </button>
          {title && <span className="font-extrabold text-[17px] text-[#0F1419]">{title}</span>}
          <div className="w-9" />
        </div>
        <div className="p-2">
          {children}
        </div>
      </div>
    </div>
  );
}
