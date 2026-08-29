import React from 'react';

export default function ConfirmDialog({ isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-2xl"
        style={{ width: '380px', maxWidth: '95vw', padding: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#3C4043', marginBottom: '8px' }}>
            {title}
          </h3>
        )}
        {message && (
          <p style={{ fontSize: '14px', color: '#5F6368', marginBottom: '20px', lineHeight: 1.5 }}>
            {message}
          </p>
        )}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded font-medium"
            style={{ color: '#1A73E8' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E8F0FE'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded font-medium text-white"
            style={{ backgroundColor: danger ? '#D93025' : '#1A73E8' }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            {confirmLabel || 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}
