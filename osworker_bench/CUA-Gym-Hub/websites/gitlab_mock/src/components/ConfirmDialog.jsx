import { useEffect } from 'react'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const confirmClass = confirmVariant === 'danger' ? 'gl-btn-danger' : 'gl-btn-primary'

  return (
    <div className="gl-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div className="gl-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" onMouseDown={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="gl-modal-header" id="confirm-dialog-title">{title}</div>
        <div className="gl-modal-body" style={{ color: 'var(--gl-text-secondary)', lineHeight: 1.5 }}>
          {message}
        </div>
        <div className="gl-modal-footer">
          <button className="gl-btn gl-btn-secondary" onClick={onClose}>{cancelText}</button>
          <button className={`gl-btn ${confirmClass}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
