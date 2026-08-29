import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Paperclip, Link as LinkIcon, Smile, Image, Trash2, Maximize2, ChevronDown, List, Type } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { generateId } from '../lib/utils';

const DEFAULT_SIGNATURE = `-- \nDemo User\ndemo@example.com`;
const SCHEDULE_OPTIONS = [
  { label: 'Tomorrow morning (8:00 AM)', getDate: () => { const t = new Date(); t.setDate(t.getDate() + 1); t.setHours(8, 0, 0, 0); return t.toISOString(); } },
  { label: 'Tomorrow afternoon (1:00 PM)', getDate: () => { const t = new Date(); t.setDate(t.getDate() + 1); t.setHours(13, 0, 0, 0); return t.toISOString(); } },
  { label: 'Monday morning (8:00 AM)', getDate: () => { const t = new Date(); const day = t.getDay(); const daysUntilMonday = (8 - day) % 7 || 7; t.setDate(t.getDate() + daysUntilMonday); t.setHours(8, 0, 0, 0); return t.toISOString(); } },
];

const ComposeModal = () => {
  const { isComposeOpen, setIsComposeOpen, sendEmail, saveDraft, deleteDraft, currentDraftId, setCurrentDraftId, composePreFill, setComposePreFill } = useStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Fields
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);

  // Visibility toggles
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  // Signature
  const [showSignature, setShowSignature] = useState(true);

  // Validation error state
  const [toError, setToError] = useState(false);

  // Scheduled send
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);
  const scheduleMenuRef = useRef(null);

  // Rich text editor ref
  const bodyRef = useRef(null);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedRangeRef = useRef(null);

  const fileInputRef = useRef(null);
  const skipNextDraftSaveRef = useRef(false);

  // Global keyboard shortcut: Ctrl+Shift+C/B for Cc/Bcc
  useEffect(() => {
    if (!isComposeOpen || isMinimized) return;
    const handleGlobalKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key === 'C' || e.key === 'c') { e.preventDefault(); setShowCc(true); }
        if (e.key === 'B' || e.key === 'b') { e.preventDefault(); setShowBcc(true); }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isComposeOpen, isMinimized]);

  const getFullBody = () => {
    if (!bodyRef.current) return body;
    return bodyRef.current.innerHTML;
  };

  // Load pre-fill data (forward, draft)
  useEffect(() => {
    if (composePreFill && isComposeOpen) {
      setTo(composePreFill.to || '');
      setCc(composePreFill.cc || '');
      setBcc(composePreFill.bcc || '');
      setSubject(composePreFill.subject || '');
      const preBody = composePreFill.body || '';
      setBody(preBody);
      // Use setTimeout to ensure the editor is mounted
      setTimeout(() => {
        if (bodyRef.current) bodyRef.current.innerHTML = preBody;
      }, 0);
      setAttachments(composePreFill.attachments || []);
      if (composePreFill.cc) setShowCc(true);
      if (composePreFill.bcc) setShowBcc(true);
      setComposePreFill(null);
    }
  }, [composePreFill, isComposeOpen]);

  // Auto-insert signature on new compose open (not pre-filled)
  useEffect(() => {
    if (isComposeOpen && !composePreFill && !currentDraftId) {
      const sig = `<br><br><span class="xmail-sig" style="color:#777;font-size:12px;white-space:pre-wrap">${DEFAULT_SIGNATURE}</span>`;
      setBody(sig);
      setShowSignature(true);
      setTimeout(() => {
        if (bodyRef.current) bodyRef.current.innerHTML = sig;
      }, 0);
    }
    if (!isComposeOpen) {
      setShowSignature(true);
    }
  }, [isComposeOpen]);

  // Auto-save timer
  useEffect(() => {
    if (!isComposeOpen) return;
    const timer = setTimeout(() => {
      saveDraft({ to, cc, bcc, subject, body: getFullBody(), attachments });
    }, 2000);
    return () => clearTimeout(timer);
  }, [to, cc, bcc, subject, body, attachments, isComposeOpen]);

  // Close schedule menu on outside click
  useEffect(() => {
    if (!showScheduleMenu) return;
    const handleOutside = (e) => {
      if (scheduleMenuRef.current && !scheduleMenuRef.current.contains(e.target)) {
        setShowScheduleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showScheduleMenu]);

  if (!isComposeOpen) return null;

  const handleSend = () => {
    if (!to.trim()) { setToError(true); return; }
    setToError(false);
    skipNextDraftSaveRef.current = true;
    sendEmail({ to, cc: showCc ? cc : '', bcc: showBcc ? bcc : '', subject, body: getFullBody(), attachments });
    closeModal();
  };

  const handleScheduleSend = (getDate) => {
    if (!to.trim()) { setToError(true); return; }
    setToError(false);
    skipNextDraftSaveRef.current = true;
    sendEmail({ to, cc: showCc ? cc : '', bcc: showBcc ? bcc : '', subject, body: getFullBody(), attachments, scheduledSend: getDate() });
    setShowScheduleMenu(false);
    closeModal();
  };

  const closeModal = () => {
    const currentBody = getFullBody();
    if (!skipNextDraftSaveRef.current && (to || subject || currentBody)) {
      saveDraft({ to, cc, bcc, subject, body: currentBody, attachments });
    }
    skipNextDraftSaveRef.current = false;
    setIsComposeOpen(false);
    setTo('');
    setCc('');
    setBcc('');
    setShowCc(false);
    setShowBcc(false);
    setSubject('');
    setBody('');
    if (bodyRef.current) bodyRef.current.innerHTML = '';
    setAttachments([]);
    setIsMinimized(false);
    setIsMaximized(false);
    setCurrentDraftId(null);
    setShowScheduleMenu(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newAttachments = files.map(file => ({
      id: generateId(),
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      url: `https://picsum.photos/400/300?random=${generateId()}`
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const execFormat = (command, value = null) => {
    if (bodyRef.current) bodyRef.current.focus();
    document.execCommand(command, false, value);
  };

  const insertSignature = () => {
    if (bodyRef.current) {
      const sig = `<br><br><span class="xmail-sig" style="color:#777;font-size:12px;white-space:pre-wrap">${DEFAULT_SIGNATURE}</span>`;
      bodyRef.current.innerHTML = bodyRef.current.innerHTML + sig;
      setBody(bodyRef.current.innerHTML);
      setShowSignature(true);
    }
  };

  const removeSignature = () => {
    if (bodyRef.current) {
      const sigs = bodyRef.current.querySelectorAll('.gmail-sig');
      sigs.forEach(s => {
        let prev = s.previousSibling;
        while (prev && prev.nodeName === 'BR') {
          const toRemove = prev;
          prev = prev.previousSibling;
          toRemove.remove();
        }
        s.remove();
      });
      setBody(bodyRef.current.innerHTML);
      setShowSignature(false);
    }
  };

  const handleInsertLink = () => {
    if (bodyRef.current) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    }
    setLinkUrl('');
    setShowLinkPopover(true);
  };

  const handleConfirmLink = () => {
    if (!linkUrl) { setShowLinkPopover(false); return; }
    if (bodyRef.current) bodyRef.current.focus();
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    document.execCommand('createLink', false, url);
    setShowLinkPopover(false);
    setLinkUrl('');
  };

  const FmtBtn = ({ onClick, title, children }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600 text-xs font-medium"
    >
      {children}
    </button>
  );

  const modalClasses = isMaximized
    ? 'fixed inset-4 z-50 flex flex-col bg-white shadow-2xl rounded-lg'
    : `fixed bottom-0 right-2 sm:right-6 lg:right-20 bg-white shadow-xl rounded-t-lg border border-gray-300 z-50 flex flex-col transition-all duration-200 max-w-[calc(100vw-1rem)] ${isMinimized ? 'h-12 w-64' : 'h-[min(540px,calc(100vh-1rem))] w-[min(500px,calc(100vw-1rem))]'}`;

  return (
    <div className={modalClasses}>
      {/* Header */}
      <div
        className="bg-[#f2f6fc] px-4 py-2 rounded-t-lg flex items-center justify-between cursor-pointer select-none"
        onClick={() => !isMaximized && setIsMinimized(!isMinimized)}
      >
        <span className="font-medium text-sm text-gray-700">New Message</span>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hover:bg-gray-200 p-1 rounded">
            <Minimize2 size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); setIsMinimized(false); }} className="hover:bg-gray-200 p-1 rounded">
            <Maximize2 size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); closeModal(); }} className="hover:bg-gray-200 p-1 rounded">
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* To */}
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="flex items-center">
                <span className="text-gray-500 text-sm w-12 cursor-pointer" onClick={() => document.getElementById('to-input').focus()}>To</span>
                <input
                  id="to-input"
                  type="text"
                  className={`flex-1 outline-none text-sm py-1 ${toError ? 'border-b border-red-500' : ''}`}
                  value={to}
                  onChange={(e) => { setTo(e.target.value); if (e.target.value.trim()) setToError(false); }}
                />
                {toError && (
                  <span className="text-xs text-red-500 ml-2 whitespace-nowrap">Recipient required</span>
                )}
                <div className="flex gap-2 text-sm text-gray-500">
                  {!showCc && <button onClick={() => setShowCc(true)} className="hover:text-gray-800 hover:underline">Cc</button>}
                  {!showBcc && <button onClick={() => setShowBcc(true)} className="hover:text-gray-800 hover:underline">Bcc</button>}
                </div>
              </div>
            </div>

            {showCc && (
              <div className="px-4 py-2 border-b border-gray-100 flex items-center">
                <span className="text-gray-500 text-sm w-12">Cc</span>
                <input type="text" className="flex-1 outline-none text-sm py-1" value={cc} onChange={(e) => setCc(e.target.value)} />
              </div>
            )}

            {showBcc && (
              <div className="px-4 py-2 border-b border-gray-100 flex items-center">
                <span className="text-gray-500 text-sm w-12">Bcc</span>
                <input type="text" className="flex-1 outline-none text-sm py-1" value={bcc} onChange={(e) => setBcc(e.target.value)} />
              </div>
            )}

            <div className="px-4 py-2 border-b border-gray-100">
              <input
                type="text"
                placeholder="Subject"
                className="w-full outline-none text-sm py-1 placeholder-gray-500"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Formatting toolbar */}
            <div className="px-3 py-1 border-b border-gray-100 flex items-center gap-0.5 flex-wrap">
              <FmtBtn onClick={() => execFormat('bold')} title="Bold (Ctrl+B)"><span className="font-bold">B</span></FmtBtn>
              <FmtBtn onClick={() => execFormat('italic')} title="Italic (Ctrl+I)"><span className="italic">I</span></FmtBtn>
              <FmtBtn onClick={() => execFormat('underline')} title="Underline (Ctrl+U)"><span className="underline">U</span></FmtBtn>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <FmtBtn onClick={() => execFormat('insertUnorderedList')} title="Bulleted list"><List size={14} /></FmtBtn>
              <FmtBtn onClick={() => execFormat('insertOrderedList')} title="Numbered list"><span className="font-mono text-xs">1.</span></FmtBtn>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <FmtBtn onClick={() => execFormat('indent')} title="Indent"><span className="font-mono text-xs">→</span></FmtBtn>
              <FmtBtn onClick={() => execFormat('outdent')} title="Outdent"><span className="font-mono text-xs">←</span></FmtBtn>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <FmtBtn onClick={handleInsertLink} title="Insert link (Ctrl+K)"><LinkIcon size={14} /></FmtBtn>
              <FmtBtn onClick={() => execFormat('removeFormat')} title="Remove formatting"><Type size={14} /></FmtBtn>
            </div>

            {/* Link popover */}
            {showLinkPopover && (
              <div className="mx-4 my-1 p-2 bg-gray-50 border border-gray-200 rounded flex items-center gap-2">
                <input
                  autoFocus
                  className="flex-1 outline-none text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Enter URL..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmLink();
                    if (e.key === 'Escape') setShowLinkPopover(false);
                  }}
                />
                <button onClick={handleConfirmLink} className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700">Apply</button>
                <button onClick={() => setShowLinkPopover(false)} className="text-gray-500 hover:bg-gray-200 p-1 rounded"><X size={12} /></button>
              </div>
            )}

            {/* ContentEditable body */}
            <div
              ref={bodyRef}
              contentEditable
              suppressContentEditableWarning
              data-compose-body="true"
              className="flex-1 p-4 outline-none text-sm font-sans min-h-[80px]"
              onInput={() => setBody(bodyRef.current?.innerHTML || '')}
              onKeyDown={(e) => {
                if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleInsertLink();
                }
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded p-2 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[150px]" title={att.name}>{att.name}</span>
                        <span className="text-xs text-gray-500">{att.size}</span>
                      </div>
                      <button onClick={() => removeAttachment(att.id)} className="text-gray-400 hover:text-red-500 p-1" title="Remove">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Toolbar */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
            <div className="flex items-center gap-1">
              {/* Send + Schedule dropdown */}
              <div className="flex items-center mr-1">
                <button
                  onClick={handleSend}
                  className="bg-[#0b57d0] hover:bg-[#0b57d0]/90 text-white pl-5 pr-3 py-2 rounded-l-full text-sm font-medium"
                >
                  Send
                </button>
                <div className="relative" ref={scheduleMenuRef}>
                  <button
                    onClick={() => setShowScheduleMenu(v => !v)}
                    className="bg-[#0b57d0] hover:bg-[#0b57d0]/90 text-white px-2 py-2 rounded-r-full border-l border-blue-400 text-sm"
                    title="Schedule send"
                    aria-label="Schedule send"
                  >
                    <ChevronDown size={16} />
                  </button>
                  {showScheduleMenu && (
                    <div className="absolute bottom-10 left-0 bg-white shadow-xl border border-gray-200 rounded py-2 w-64 z-50">
                      <div className="px-3 pb-2 border-b border-gray-100 font-medium text-xs text-gray-500 uppercase tracking-wide">Schedule send</div>
                      {SCHEDULE_OPTIONS.map(opt => (
                        <div
                          key={opt.label}
                          onClick={() => handleScheduleSend(opt.getDate)}
                          className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-6 w-px bg-gray-200 mx-1" />

              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
              <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:bg-gray-100 p-2 rounded" title="Attach files">
                <Paperclip size={18} />
              </button>

              <button className="text-gray-500 hover:bg-gray-100 p-2 rounded" title="Emoji"><Smile size={18} /></button>
              <button className="text-gray-500 hover:bg-gray-100 p-2 rounded" title="Insert photo"><Image size={18} /></button>

              <button
                onClick={showSignature ? removeSignature : insertSignature}
                className="text-gray-400 hover:bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200 ml-1"
                title={showSignature ? 'Remove signature' : 'Insert signature'}
              >
                {showSignature ? '− Sig' : '+ Sig'}
              </button>
            </div>

            <button
              onClick={() => { if (currentDraftId) deleteDraft(currentDraftId); closeModal(); }}
              className="text-gray-500 hover:bg-gray-100 p-2 rounded"
              title="Discard draft"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ComposeModal;
