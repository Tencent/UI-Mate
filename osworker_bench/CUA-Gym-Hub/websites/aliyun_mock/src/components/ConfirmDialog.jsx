import React, { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ title, message, confirmText = '确认', cancelText = '取消', danger = false, requireTyping = null, onConfirm, onCancel }) {
  const [typedValue, setTypedValue] = useState('')

  const canConfirm = !requireTyping || typedValue === requireTyping

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="confirm-header">
          <AlertTriangle size={24} color={danger ? '#FF3333' : '#FFA003'} />
          <div className="modal-title" style={{ marginBottom: 0 }}>{title}</div>
        </div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: '20px' }}>{message}</div>
        {requireTyping && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#333', marginBottom: 6 }}>
              请输入 <strong style={{ fontFamily: 'monospace' }}>{requireTyping}</strong> 以确认操作：
            </div>
            <input
              className="form-input"
              value={typedValue}
              onChange={e => setTypedValue(e.target.value)}
              placeholder={requireTyping}
              autoFocus
            />
          </div>
        )}
        <div className="modal-actions">
          <button className="btn-normal" onClick={onCancel}>{cancelText}</button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={() => canConfirm && onConfirm()}
            disabled={!canConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
