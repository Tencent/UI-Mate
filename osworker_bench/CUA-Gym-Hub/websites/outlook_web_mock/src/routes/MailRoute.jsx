import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import MailToolbar from '../components/Mail/MailToolbar';
import FolderPane from '../components/Mail/FolderPane';
import EmailList from '../components/Mail/EmailList';
import ReadingPane from '../components/Mail/ReadingPane';
import ComposeModal from '../components/ComposeModal';

export default function MailRoute() {
  const { state, actions } = useStore();
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeDefaults, setComposeDefaults] = useState(null);
  const [toolbarMenu, setToolbarMenu] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [notice, setNotice] = useState('');

  const selectedEmail = state.emails.find(email => email.id === selectedEmailId);

  const rememberEmails = () => {
    setUndoStack(prev => [state.emails, ...prev].slice(0, 5));
  };

  const downloadSelectedEmail = () => {
    if (!selectedEmail) return;
    const content = [
      `From: ${selectedEmail.from.name} <${selectedEmail.from.email}>`,
      `To: ${selectedEmail.to.map(item => item.email || item.name).join(', ')}`,
      `Subject: ${selectedEmail.subject}`,
      '',
      selectedEmail.body,
    ].join('\n');
    const blob = new Blob([content], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedEmail.subject.replace(/[^a-z0-9]+/gi, '_') || 'message'}.eml`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Message downloaded locally.');
  };

  const handleToolbarAction = (action) => {
    setToolbarMenu(null);
    setNotice('');

    switch (action) {
      case 'new':
        setComposeDefaults(null);
        setIsComposeOpen(true);
        break;
      case 'delete':
        if (selectedEmailId) {
          rememberEmails();
          actions.deleteEmail(selectedEmailId);
          setSelectedEmailId(null);
          setNotice('Message moved to Deleted Items.');
        }
        break;
      case 'markRead':
        if (selectedEmailId) {
          rememberEmails();
          actions.markRead(selectedEmailId, true);
          setNotice('Message marked as read.');
        }
        break;
      case 'flag':
        if (selectedEmailId) {
          rememberEmails();
          actions.toggleFlag(selectedEmailId);
        }
        break;
      case 'archive':
        if (selectedEmailId) {
          rememberEmails();
          actions.moveEmail(selectedEmailId, 'archive');
          setSelectedEmailId(null);
          setNotice('Message moved to Archive.');
        }
        break;
      case 'move':
      case 'categorize':
      case 'more':
        if (selectedEmailId) setToolbarMenu(action);
        break;
      case 'undo':
        if (undoStack.length > 0) {
          actions.restoreEmails(undoStack[0]);
          setUndoStack(prev => prev.slice(1));
          setNotice('Last mail action undone.');
        }
        break;
      default:
        setNotice('Choose an available mail action.');
    }
  };

  const handleEmailSelect = (id) => {
    setSelectedEmailId(id);
    actions.markRead(id, true);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <MailToolbar selectedCount={selectedEmailId ? 1 : 0} onAction={handleToolbarAction} canUndo={undoStack.length > 0} />
      {(toolbarMenu || notice) && (
        <div className="absolute top-10 left-[320px] z-40">
          {notice && (
            <div className="mb-2 rounded bg-neutral-900 text-white text-sm px-3 py-2 shadow-lg">{notice}</div>
          )}
          {toolbarMenu === 'move' && (
            <div className="w-56 rounded border border-neutral-200 bg-white shadow-lg p-2">
              <div className="px-2 py-1 text-xs font-semibold text-neutral-500 uppercase">Move to</div>
              {state.folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => {
                    rememberEmails();
                    actions.moveEmail(selectedEmailId, folder.id);
                    setSelectedEmailId(null);
                    setToolbarMenu(null);
                    setNotice(`Message moved to ${folder.name}.`);
                  }}
                  className="block w-full text-left px-2 py-1.5 rounded text-sm hover:bg-neutral-100"
                >
                  {folder.name}
                </button>
              ))}
            </div>
          )}
          {toolbarMenu === 'categorize' && (
            <div className="w-56 rounded border border-neutral-200 bg-white shadow-lg p-2">
              <div className="px-2 py-1 text-xs font-semibold text-neutral-500 uppercase">Categorize</div>
              {state.categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    rememberEmails();
                    actions.addCategory(selectedEmailId, category.id);
                    setToolbarMenu(null);
                    setNotice(`${category.name} toggled.`);
                  }}
                  className="flex w-full items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-neutral-100"
                >
                  <span className={`h-3 w-3 rounded-full ${category.color.split(' ')[0]}`} />
                  {category.name}
                </button>
              ))}
            </div>
          )}
          {toolbarMenu === 'more' && (
            <div className="w-56 rounded border border-neutral-200 bg-white shadow-lg p-2">
              <button
                onClick={() => {
                  rememberEmails();
                  actions.markRead(selectedEmailId, false);
                  setToolbarMenu(null);
                  setNotice('Message marked as unread.');
                }}
                className="block w-full text-left px-2 py-1.5 rounded text-sm hover:bg-neutral-100"
              >
                Mark as unread
              </button>
              <button
                onClick={() => {
                  window.print();
                  setToolbarMenu(null);
                }}
                className="block w-full text-left px-2 py-1.5 rounded text-sm hover:bg-neutral-100"
              >
                Print
              </button>
              <button
                onClick={() => {
                  downloadSelectedEmail();
                  setToolbarMenu(null);
                }}
                className="block w-full text-left px-2 py-1.5 rounded text-sm hover:bg-neutral-100"
              >
                Download message
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex-1 flex overflow-hidden">
        <FolderPane 
          selectedFolder={selectedFolder} 
          onSelectFolder={(id) => { setSelectedFolder(id); setSelectedEmailId(null); }} 
        />
        <EmailList 
          selectedFolder={selectedFolder}
          selectedEmailId={selectedEmailId}
          onSelectEmail={handleEmailSelect}
        />
        <ReadingPane
          emailId={selectedEmailId}
          onCompose={(defaults) => {
            setComposeDefaults(defaults);
            setIsComposeOpen(true);
          }}
        />
      </div>
      {isComposeOpen && <ComposeModal defaults={composeDefaults} onClose={() => setIsComposeOpen(false)} />}
    </div>
  );
}
