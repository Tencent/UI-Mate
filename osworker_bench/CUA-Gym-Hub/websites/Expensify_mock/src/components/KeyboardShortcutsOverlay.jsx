import React from 'react';
import { X } from 'lucide-react';

const shortcuts = [
  { keys: ['N', 'then', 'E'], desc: 'Open New Expense modal' },
  { keys: ['N', 'then', 'R'], desc: 'Open New Report modal' },
  { keys: ['Escape'], desc: 'Close any open modal / overlay' },
  { keys: ['?'], desc: 'Show this keyboard shortcuts help' },
];

export default function KeyboardShortcutsOverlay({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {shortcuts.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px', width: 180 }}>
                    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                      {s.keys.map((k, j) => (
                        k === 'then' ? (
                          <span key={j} style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 2px' }}>then</span>
                        ) : (
                          <kbd key={j} style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            background: '#F5F7F9',
                            border: '1px solid var(--border-color)',
                            borderRadius: 4,
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            color: 'var(--text-primary)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                          }}>{k}</kbd>
                        )
                      ))}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: 14, color: 'var(--text-primary)' }}>
                    {s.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
