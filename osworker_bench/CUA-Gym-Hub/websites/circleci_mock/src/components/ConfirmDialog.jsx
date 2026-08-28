import { useEffect } from 'react';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
      if (event.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel, onConfirm]);

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" onClick={e => e.stopPropagation()}>
        <div id="confirm-dialog-title" className="modal-title">{title}</div>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>{cancelLabel}</button>
          <button className={destructive ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
