import React, { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { useToast } from './Toast';

function MenuDropdown({ label, items, isOpen, onToggle, onClose, editor }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className={clsx(
          'px-2.5 py-1 text-sm rounded-md hover:bg-gray-100',
          isOpen && 'bg-gray-100'
        )}
      >
        {label}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-0.5 w-[280px] bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return <div key={index} className="border-t border-gray-200 my-1" />;
            }
            if (item.type === 'submenu') {
              return <SubmenuItem key={index} item={item} editor={editor} onClose={onClose} />;
            }
            return (
              <button
                key={index}
                onClick={() => {
                  item.action?.();
                  onClose();
                }}
                disabled={item.disabled}
                className={clsx(
                  'w-full text-left px-4 py-1.5 text-sm flex items-center justify-between',
                  item.disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-700'
                )}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-gray-400 ml-4">{item.shortcut}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubmenuItem({ item, editor, onClose }) {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const ref = useRef(null);

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={() => setShowSubmenu(true)}
      onMouseLeave={() => setShowSubmenu(false)}
    >
      <button className="w-full text-left px-4 py-1.5 text-sm flex items-center justify-between hover:bg-gray-100 text-gray-700">
        <span>{item.label}</span>
        <span className="text-gray-400">&#9656;</span>
      </button>
      {showSubmenu && (
        <div className="absolute left-full top-0 w-[220px] bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          {item.items.map((subItem, idx) => {
            if (subItem.type === 'divider') {
              return <div key={idx} className="border-t border-gray-200 my-1" />;
            }
            return (
              <button
                key={idx}
                onClick={() => {
                  subItem.action?.();
                  onClose();
                }}
                disabled={subItem.disabled}
                className={clsx(
                  'w-full text-left px-4 py-1.5 text-sm flex items-center justify-between',
                  subItem.disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-700'
                )}
              >
                <span>{subItem.label}</span>
                {subItem.shortcut && (
                  <span className="text-xs text-gray-400 ml-4">{subItem.shortcut}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const MenuBar = ({ editor, onAction }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const { showToast } = useToast();

  const handleToggle = useCallback((menuName) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  }, []);

  const handleClose = useCallback(() => {
    setOpenMenu(null);
  }, []);

  const triggerAction = useCallback((actionName, payload) => {
    if (onAction) {
      onAction(actionName, payload);
    }
  }, [onAction]);

  const toast = useCallback((msg) => {
    showToast(msg);
  }, [showToast]);

  const downloadBlob = useCallback((filename, type, content) => {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  const downloadDocument = useCallback((format) => {
    if (!editor) return;
    const text = editor.getText();
    const html = editor.getHTML();
    const safeText = text || 'Untitled document';

    if (format === 'docx') {
      downloadBlob('document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', html);
      toast('Downloaded Microsoft Word file');
      return;
    }
    if (format === 'pdf') {
      downloadBlob('document.pdf', 'application/pdf', `%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n% ${safeText}\n%%EOF`);
      toast('Downloaded PDF file');
      return;
    }
    if (format === 'txt') {
      downloadBlob('document.txt', 'text/plain', safeText);
      toast('Downloaded plain text file');
      return;
    }
    if (format === 'rtf') {
      downloadBlob('document.rtf', 'application/rtf', `{\\rtf1\\ansi ${safeText.replace(/[{}\\]/g, '\\$&')}}`);
      toast('Downloaded rich text file');
      return;
    }
    if (format === 'html') {
      downloadBlob('document.html', 'text/html', `<!doctype html><html><body>${html}</body></html>`);
      toast('Downloaded web page');
    }
  }, [downloadBlob, editor, toast]);

  const menus = [
    {
      label: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', action: () => triggerAction('newDocument') },
        { label: 'Open', shortcut: 'Ctrl+O', action: () => triggerAction('openDocument') },
        { label: 'Make a copy', action: () => triggerAction('copyDocument') },
        { type: 'divider' },
        { label: 'Share', action: () => triggerAction('share') },
        { label: 'Email', type: 'submenu', items: [
          { label: 'Email this file', action: () => triggerAction('emailDraft', 'file') },
          { label: 'Email collaborators', action: () => triggerAction('emailDraft', 'collaborators') },
        ]},
        { type: 'divider' },
        { label: 'Download', type: 'submenu', items: [
          { label: 'Microsoft Word (.docx)', action: () => downloadDocument('docx') },
          { label: 'PDF Document (.pdf)', action: () => downloadDocument('pdf') },
          { label: 'Plain Text (.txt)', action: () => downloadDocument('txt') },
          { label: 'Rich Text Format (.rtf)', action: () => downloadDocument('rtf') },
          { label: 'Web Page (.html)', action: () => downloadDocument('html') },
        ]},
        { type: 'divider' },
        { label: 'Rename', action: () => triggerAction('rename') },
        { label: 'Move', action: () => triggerAction('move') },
        { label: 'Move to trash', action: () => triggerAction('delete') },
        { type: 'divider' },
        { label: 'Version history', type: 'submenu', items: [
          { label: 'Name current version', action: () => triggerAction('nameVersion') },
          { label: 'See version history', shortcut: 'Ctrl+Alt+Shift+H', action: () => triggerAction('versionHistory') },
        ]},
        { type: 'divider' },
        { label: 'Page setup', action: () => triggerAction('pageSetup') },
        { label: 'Print', shortcut: 'Ctrl+P', action: () => window.print() },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => editor?.chain().focus().undo().run() },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => editor?.chain().focus().redo().run() },
        { type: 'divider' },
        { label: 'Cut', shortcut: 'Ctrl+X', action: () => toast('Use Ctrl+X to cut') },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => toast('Use Ctrl+C to copy') },
        { label: 'Paste', shortcut: 'Ctrl+V', action: () => toast('Use Ctrl+V to paste') },
        { label: 'Paste without formatting', shortcut: 'Ctrl+Shift+V', action: () => toast('Use Ctrl+Shift+V to paste without formatting') },
        { type: 'divider' },
        { label: 'Select all', shortcut: 'Ctrl+A', action: () => editor?.chain().focus().selectAll().run() },
        { label: 'Delete', action: () => editor?.chain().focus().deleteSelection().run() },
        { type: 'divider' },
        { label: 'Find and replace', shortcut: 'Ctrl+H', action: () => triggerAction('findReplace') },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Mode', type: 'submenu', items: [
          { label: 'Editing', action: () => triggerAction('setViewMode', 'editing') },
          { label: 'Viewing', action: () => triggerAction('setViewMode', 'viewing') },
        ]},
        { type: 'divider' },
        { label: 'Show print layout', action: () => triggerAction('toggleUiFlag', 'printLayout') },
        { label: 'Show ruler', action: () => triggerAction('toggleUiFlag', 'rulerOpen') },
        { label: 'Show outline', action: () => triggerAction('toggleUiFlag', 'outlineOpen') },
        { label: 'Show equation toolbar', action: () => triggerAction('toggleUiFlag', 'equationToolbarOpen') },
        { type: 'divider' },
        { label: 'Full screen', action: () => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
        }},
      ],
    },
    {
      label: 'Insert',
      items: [
        { label: 'Image', type: 'submenu', items: [
          { label: 'Upload from computer', action: () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  editor?.chain().focus().setImage({ src: reader.result }).run();
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          }},
          { label: 'Search the web', action: () => triggerAction('imageSearch') },
          { label: 'By URL', action: () => {
            editor?.chain().focus().setImage({ src: 'https://picsum.photos/800/450?random=docs-menu-image' }).run();
          }},
        ]},
        { label: 'Table', type: 'submenu', items: [
          { label: '2x2 Table', action: () => editor?.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run() },
          { label: '3x3 Table', action: () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
          { label: '4x4 Table', action: () => editor?.chain().focus().insertTable({ rows: 4, cols: 4, withHeaderRow: true }).run() },
          { label: '5x5 Table', action: () => editor?.chain().focus().insertTable({ rows: 5, cols: 5, withHeaderRow: true }).run() },
        ]},
        { type: 'divider' },
        { label: 'Horizontal line', action: () => editor?.chain().focus().setHorizontalRule().run() },
        { type: 'divider' },
        { label: 'Link', shortcut: 'Ctrl+K', action: () => {
          editor?.chain().focus().extendMarkRange('link').setLink({ href: 'https://example.com' }).run();
        }},
        { label: 'Bookmark', action: () => editor?.chain().focus().insertContent(`<span data-bookmark-id="bookmark-${Date.now()}">[Bookmark]</span>`).run() },
        { type: 'divider' },
        { label: 'Special characters', action: () => triggerAction('specialCharacters') },
        { label: 'Equation', action: () => editor?.chain().focus().insertContent('<span data-equation="true">E = mc^2</span>').run() },
        { type: 'divider' },
        { label: 'Headers & footers', type: 'submenu', items: [
          { label: 'Header', action: () => triggerAction('sectionText', 'header') },
          { label: 'Footer', action: () => triggerAction('sectionText', 'footer') },
          { label: 'Page number', action: () => editor?.chain().focus().insertContent('<p>Page 1</p>').run() },
        ]},
        { label: 'Page break', action: () => editor?.chain().focus().insertContent('<hr data-page-break="true" />').run() },
      ],
    },
    {
      label: 'Format',
      items: [
        { label: 'Text', type: 'submenu', items: [
          { label: 'Bold', shortcut: 'Ctrl+B', action: () => editor?.chain().focus().toggleBold().run() },
          { label: 'Italic', shortcut: 'Ctrl+I', action: () => editor?.chain().focus().toggleItalic().run() },
          { label: 'Underline', shortcut: 'Ctrl+U', action: () => editor?.chain().focus().toggleUnderline().run() },
          { label: 'Strikethrough', shortcut: 'Alt+Shift+5', action: () => editor?.chain().focus().toggleStrike().run() },
          { type: 'divider' },
          { label: 'Superscript', shortcut: 'Ctrl+.', action: () => editor?.chain().focus().insertContent('<sup>superscript</sup>').run() },
          { label: 'Subscript', shortcut: 'Ctrl+,', action: () => editor?.chain().focus().insertContent('<sub>subscript</sub>').run() },
        ]},
        { label: 'Paragraph styles', type: 'submenu', items: [
          { label: 'Normal text', action: () => editor?.chain().focus().setParagraph().run() },
          { label: 'Title', action: () => editor?.chain().focus().setHeading({ level: 1 }).run() },
          { label: 'Subtitle', action: () => editor?.chain().focus().setHeading({ level: 2 }).run() },
          { type: 'divider' },
          { label: 'Heading 1', action: () => editor?.chain().focus().setHeading({ level: 1 }).run() },
          { label: 'Heading 2', action: () => editor?.chain().focus().setHeading({ level: 2 }).run() },
          { label: 'Heading 3', action: () => editor?.chain().focus().setHeading({ level: 3 }).run() },
          { label: 'Heading 4', action: () => editor?.chain().focus().setHeading({ level: 4 }).run() },
          { label: 'Heading 5', action: () => editor?.chain().focus().setHeading({ level: 5 }).run() },
          { label: 'Heading 6', action: () => editor?.chain().focus().setHeading({ level: 6 }).run() },
        ]},
        { label: 'Align & indent', type: 'submenu', items: [
          { label: 'Left', shortcut: 'Ctrl+Shift+L', action: () => editor?.chain().focus().setTextAlign('left').run() },
          { label: 'Center', shortcut: 'Ctrl+Shift+E', action: () => editor?.chain().focus().setTextAlign('center').run() },
          { label: 'Right', shortcut: 'Ctrl+Shift+R', action: () => editor?.chain().focus().setTextAlign('right').run() },
          { label: 'Justify', shortcut: 'Ctrl+Shift+J', action: () => editor?.chain().focus().setTextAlign('justify').run() },
        ]},
        { type: 'divider' },
        { label: 'Line & paragraph spacing', type: 'submenu', items: [
          { label: 'Single', action: () => triggerAction('formatPreference', { lineSpacing: 'single' }) },
          { label: '1.15', action: () => triggerAction('formatPreference', { lineSpacing: '1.15' }) },
          { label: '1.5', action: () => triggerAction('formatPreference', { lineSpacing: '1.5' }) },
          { label: 'Double', action: () => triggerAction('formatPreference', { lineSpacing: 'double' }) },
        ]},
        { label: 'Columns', action: () => triggerAction('columns') },
        { label: 'Bullets & numbering', type: 'submenu', items: [
          { label: 'Bulleted list', action: () => editor?.chain().focus().toggleBulletList().run() },
          { label: 'Numbered list', action: () => editor?.chain().focus().toggleOrderedList().run() },
          { label: 'Checklist', action: () => editor?.chain().focus().toggleTaskList().run() },
        ]},
        { type: 'divider' },
        { label: 'Clear formatting', shortcut: 'Ctrl+\\', action: () => editor?.chain().focus().clearNodes().unsetAllMarks().run() },
      ],
    },
    {
      label: 'Tools',
      items: [
        { label: 'Spelling and grammar', type: 'submenu', items: [
          { label: 'Spell check', action: () => triggerAction('documentCheck', 'spelling') },
          { label: 'Grammar check', action: () => triggerAction('documentCheck', 'grammar') },
        ]},
        { label: 'Word count', action: () => {
          if (editor) {
            const text = editor.getText();
            const words = text.trim().split(/\s+/).filter(Boolean).length;
            const chars = text.length;
            const charsNoSpaces = text.replace(/\s/g, '').length;
            toast(`Words: ${words} | Characters: ${chars} | No spaces: ${charsNoSpaces}`);
          }
        }},
        { type: 'divider' },
        { label: 'Review suggested edits', action: () => triggerAction('suggestedEdits') },
        { label: 'Compare documents', action: () => triggerAction('compareDocuments') },
        { type: 'divider' },
        { label: 'Dictionary', action: () => triggerAction('dictionary') },
        { label: 'Translate document', action: () => triggerAction('translate') },
        { type: 'divider' },
        { label: 'Preferences', action: () => triggerAction('preferences') },
        { label: 'Accessibility', action: () => triggerAction('accessibility') },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'Search the menus', action: () => triggerAction('menuSearch') },
        { type: 'divider' },
        { label: 'Help', action: () => triggerAction('helpCenter') },
        { label: 'Training', action: () => triggerAction('training') },
        { label: 'Updates', action: () => triggerAction('updates') },
        { type: 'divider' },
        { label: 'Keyboard shortcuts', shortcut: 'Ctrl+/', action: () => triggerAction('keyboardShortcuts') },
        { type: 'divider' },
        { label: 'Report a problem', action: () => triggerAction('reportProblem') },
        { label: 'Report abuse/copyright', action: () => triggerAction('reportAbuse') },
      ],
    },
  ];

  return (
    <div className="flex items-center px-2 py-0.5 bg-white border-b border-gray-100">
      {menus.map((menu) => (
        <MenuDropdown
          key={menu.label}
          label={menu.label}
          items={menu.items}
          isOpen={openMenu === menu.label}
          onToggle={() => handleToggle(menu.label)}
          onClose={handleClose}
          editor={editor}
        />
      ))}
    </div>
  );
};

export default MenuBar;
