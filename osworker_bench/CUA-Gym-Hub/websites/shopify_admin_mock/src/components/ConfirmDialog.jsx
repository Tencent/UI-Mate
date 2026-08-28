import React from 'react';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35" onClick={onCancel}>
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="border-b px-5 py-4" style={{ borderColor: '#e3e3e3' }}>
          <h2 className="text-[16px] font-semibold text-[#202223]">{title}</h2>
        </div>
        <div className="px-5 py-4 text-[13px] text-[#616161]">{message}</div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button className="btn-secondary text-[13px]" onClick={onCancel}>Cancel</button>
          <button className="btn-danger text-[13px]" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
