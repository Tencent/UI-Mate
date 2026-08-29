import React, { useEffect } from 'react';

export const InfoDialog = ({ title, children, onClose, actions = null }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        width: 'min(560px, 100%)',
        maxHeight: '85vh',
        overflow: 'auto',
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '18px 20px',
          borderBottom: '1px solid var(--bc-gray-border)',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--bc-text-medium)' }}
          >
            x
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          padding: '14px 20px',
          borderTop: '1px solid var(--bc-gray-border)',
        }}>
          {actions}
          <button className="btn btn--primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};
