import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const SHORTCUT_SECTIONS = [
  {
    title: 'Compose',
    shortcuts: [
      { keys: 'C', desc: 'Compose new message' },
      { keys: 'Ctrl + Enter', desc: 'Send message' },
      { keys: 'Ctrl + Shift + C', desc: 'Add Cc recipients' },
      { keys: 'Ctrl + Shift + B', desc: 'Add Bcc recipients' },
      { keys: 'Ctrl + K', desc: 'Insert a link' },
      { keys: 'Ctrl + B', desc: 'Bold text' },
      { keys: 'Ctrl + I', desc: 'Italic text' },
      { keys: 'Ctrl + U', desc: 'Underline text' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: 'G then I', desc: 'Go to Inbox' },
      { keys: 'G then T', desc: 'Go to Sent' },
      { keys: 'G then D', desc: 'Go to Drafts' },
      { keys: 'G then S', desc: 'Go to Starred' },
      { keys: 'J', desc: 'Older conversation' },
      { keys: 'K', desc: 'Newer conversation' },
      { keys: 'O or Enter', desc: 'Open conversation' },
      { keys: 'U', desc: 'Return to thread list' },
      { keys: '/', desc: 'Search' },
    ],
  },
  {
    title: 'Thread List',
    shortcuts: [
      { keys: 'X', desc: 'Select/deselect conversation' },
      { keys: 'S', desc: 'Star/unstar conversation' },
      { keys: '+ or =', desc: 'Mark as important' },
      { keys: '-', desc: 'Mark as not important' },
      { keys: 'E', desc: 'Archive' },
      { keys: '#', desc: 'Delete' },
      { keys: 'Shift + I', desc: 'Mark as read' },
      { keys: 'Shift + U', desc: 'Mark as unread' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: 'R', desc: 'Reply' },
      { keys: 'Shift + R', desc: 'Reply all' },
      { keys: 'F', desc: 'Forward' },
      { keys: '!', desc: 'Report as spam' },
      { keys: 'B', desc: 'Snooze' },
      { keys: 'V', desc: 'Move to folder' },
      { keys: 'L', desc: 'Label conversation' },
      { keys: 'Z', desc: 'Undo last action' },
      { keys: 'Shift + ?', desc: 'Show keyboard shortcuts' },
    ],
  },
];

const ShortcutsModal = () => {
  const { showShortcutsModal, setShowShortcutsModal } = useStore();

  useEffect(() => {
    if (!showShortcutsModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowShortcutsModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcutsModal, setShowShortcutsModal]);

  if (!showShortcutsModal) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setShowShortcutsModal(false)}
      />
      <div className="relative bg-white rounded-lg shadow-2xl w-[720px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Keyboard shortcuts</h2>
          <button
            onClick={() => setShowShortcutsModal(false)}
            className="p-1 hover:bg-gray-100 rounded text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-2 gap-6">
            {SHORTCUT_SECTIONS.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-100">
                  {section.title}
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    {section.shortcuts.map((s) => (
                      <tr key={s.keys} className="border-b border-gray-50">
                        <td className="py-1.5 pr-4 w-40">
                          <kbd className="inline-block bg-gray-100 text-gray-700 text-xs font-mono px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                            {s.keys}
                          </kbd>
                        </td>
                        <td className="py-1.5 text-gray-600">{s.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
          Press <kbd className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded border border-gray-200 font-mono">?</kbd> to toggle this help screen
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
