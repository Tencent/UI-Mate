import React, { useState } from 'react';
import { X, Maximize2, Minimize2, Paperclip, Image, Smile, Trash2, MoreHorizontal } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ComposeModal({ onClose, defaults = null }) {
  const { actions } = useStore();
  const [to, setTo] = useState(defaults?.to || '');
  const [subject, setSubject] = useState(defaults?.subject || '');
  const [body, setBody] = useState(defaults?.body || '');
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handleSend = () => {
    if (!to.trim() || !subject.trim()) {
      setError('Fill in To and Subject before sending.');
      return;
    }
    actions.sendEmail({
      to: [{ name: to.split('@')[0], email: to }],
      subject,
      body,
      attachments
    });
    onClose();
  };

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [
      ...prev,
      ...files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        contentType: file.type || 'application/octet-stream'
      }))
    ]);
    event.target.value = '';
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-10 z-50 w-72 rounded-t-lg border border-neutral-200 bg-white shadow-2xl">
        <div className="flex h-10 items-center justify-between rounded-t-lg bg-primary px-3 text-white">
          <span className="text-sm font-semibold">New Message</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(false)} className="rounded p-1 hover:bg-primary-dark"><Maximize2 className="h-4 w-4" /></button>
            <button onClick={onClose} className="rounded p-1 hover:bg-primary-dark"><X className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMaximized ? 'fixed inset-6' : 'fixed bottom-0 right-10 w-[600px] h-[500px]'} bg-white shadow-2xl rounded-t-lg border border-neutral-200 flex flex-col z-50`}>
      <div className="h-10 bg-primary text-white flex items-center justify-between px-3 rounded-t-lg flex-shrink-0">
        <span className="font-semibold text-sm">New Message</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-primary-dark rounded"><Minimize2 className="w-4 h-4" /></button>
          <button onClick={() => setIsMaximized(prev => !prev)} className="p-1 hover:bg-primary-dark rounded"><Maximize2 className="w-4 h-4" /></button>
          <button onClick={onClose} className="p-1 hover:bg-primary-dark rounded"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {error && <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="flex items-center gap-2 mb-2">
          <button className="px-3 py-1 bg-white border border-neutral-300 rounded text-sm hover:bg-neutral-50">To</button>
          <input 
            type="text" 
            className="flex-1 outline-none text-sm py-1 border-b border-transparent focus:border-primary"
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="Recipients..."
          />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <button className="px-3 py-1 bg-white border border-neutral-300 rounded text-sm hover:bg-neutral-50">Cc</button>
          <input 
            type="text" 
            className="flex-1 outline-none text-sm py-1 border-b border-transparent focus:border-primary"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Add a subject"
          />
        </div>

        <textarea
          className="flex-1 resize-none outline-none text-sm font-sans"
          placeholder="Type your message here..."
          value={body}
          onChange={e => setBody(e.target.value)}
        />

        {attachments.length > 0 && (
          <div className="mt-3 rounded border border-neutral-200 bg-neutral-50 p-2">
            <div className="mb-1 text-xs font-semibold text-neutral-500">Attachments</div>
            {attachments.map((attachment, index) => (
              <div key={`${attachment.name}-${index}`} className="flex items-center justify-between text-sm">
                <span className="truncate">{attachment.name}</span>
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
                  className="rounded px-2 py-0.5 text-neutral-500 hover:bg-neutral-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-14 border-t border-neutral-200 flex items-center justify-between px-4 flex-shrink-0 bg-neutral-50">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSend}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-1.5 rounded text-sm font-semibold shadow-sm transition-colors"
          >
            Send
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-200 rounded text-neutral-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-neutral-600">
          <label className="p-1.5 hover:bg-neutral-200 rounded cursor-pointer" title="Attach file">
            <Paperclip className="w-4 h-4" />
            <input type="file" className="hidden" multiple onChange={handleFiles} />
          </label>
          <label className="p-1.5 hover:bg-neutral-200 rounded cursor-pointer" title="Insert image">
            <Image className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleFiles} />
          </label>
          <button onClick={() => setBody(prev => `${prev}${prev ? ' ' : ''}:)`) } className="p-1.5 hover:bg-neutral-200 rounded"><Smile className="w-4 h-4" /></button>
          <div className="relative">
            <button onClick={() => setShowMore(prev => !prev)} className="p-1.5 hover:bg-neutral-200 rounded"><MoreHorizontal className="w-4 h-4" /></button>
            {showMore && (
              <div className="absolute bottom-8 right-0 w-44 rounded border border-neutral-200 bg-white p-2 text-sm shadow-lg">
                <button onClick={() => { setSubject(prev => prev || '(No subject)'); setShowMore(false); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-neutral-100">Use no subject</button>
                <button onClick={() => { setBody(prev => `${prev}\n\nSent from Xutlook Mock`); setShowMore(false); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-neutral-100">Insert signature</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
