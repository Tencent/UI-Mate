import { useEffect } from 'react'

export default function SandboxDialog({ title, children, actions, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="card"
        onClick={event => event.stopPropagation()}
        style={{ width: 'min(520px, 92vw)', maxHeight: '90vh', overflow: 'auto', padding: 0 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid var(--color-border-gray)' }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <button className="btn-ghost" aria-label="Close dialog" onClick={onClose} style={{ padding: 6 }}>x</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
        {actions && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '1px solid var(--color-border-gray)' }}>
            {actions}
          </div>
        )}
      </section>
    </div>
  )
}
