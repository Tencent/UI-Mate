import React, { useState, useRef, useEffect } from 'react';

interface FileNameDialogProps {
  title: string;
  defaultName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export const FileNameDialog: React.FC<FileNameDialogProps> = ({ title, defaultName, onConfirm, onCancel }) => {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6" style={{ boxShadow: '0 24px 38px rgba(0,0,0,.14),0 9px 46px rgba(0,0,0,.12),0 11px 15px rgba(0,0,0,.2)' }}>
        <h3 className="text-base font-medium text-[#202124] mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="w-full px-3 py-2 border border-[#DADCE0] rounded focus:outline-none focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] text-sm text-[#202124] mb-6"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-[#1A73E8] hover:bg-[#E8F0FE] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium text-[#1A73E8] hover:bg-[#E8F0FE] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
