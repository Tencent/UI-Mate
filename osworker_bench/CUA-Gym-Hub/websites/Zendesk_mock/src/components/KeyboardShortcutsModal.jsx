import React from 'react';
import { X } from 'lucide-react';

const shortcuts = [
  { key: '/', description: 'Focus search bar' },
  { key: 'n', description: 'Create new ticket' },
  { key: 'j', description: 'Next ticket in list' },
  { key: 'k', description: 'Previous ticket in list' },
  { key: '?', description: 'Show this help dialog' },
  { key: 'Esc', description: 'Close modals/dropdowns' },
];

export default function KeyboardShortcutsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ minWidth: 360, maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="modal-title" style={{ marginBottom: 0 }}>Keyboard Shortcuts</div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#68737D', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {shortcuts.map(s => (
              <tr key={s.key} style={{ borderBottom: '1px solid #F0F2F3' }}>
                <td style={{ padding: '10px 0', width: 80 }}>
                  <kbd className="kbd-key">{s.key}</kbd>
                </td>
                <td style={{ padding: '10px 0', fontSize: 13, color: '#2F3941' }}>
                  {s.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
