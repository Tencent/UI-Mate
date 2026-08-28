import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Printer, ExternalLink, MoreVertical, Reply, ReplyAll, Forward, Trash2, Archive, CornerUpLeft, Mail, MailOpen, Download, Paperclip, X, ShieldAlert, FolderInput, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatDate, cn, generateId } from '../lib/utils';

const ThreadMoveToMenu = ({ emailIds, onClose }) => {
  const { bulkUpdateEmails, showToast } = useStore();
  const navigate = useNavigate();
  const folders = [
    { id: 'inbox', label: 'Inbox' },
    { id: 'spam', label: 'Spam' },
    { id: 'trash', label: 'Trash' },
    { id: 'all-mail', label: 'Archive' },
  ];
  return (
    <div className="absolute top-10 left-0 bg-white shadow-xl border border-gray-200 rounded py-2 w-40 z-50">
      <div className="px-3 pb-2 border-b border-gray-100 font-medium text-xs text-gray-500">Move to:</div>
      {folders.map(f => (
        <div key={f.id} onClick={() => { bulkUpdateEmails(emailIds, { folder: f.id }); showToast(`Moved to ${f.label}`, null); onClose(); navigate(-1); }}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">{f.label}</div>
      ))}
    </div>
  );
};

const ThreadView = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { state, toggleStar, replyToEmail, archiveEmails, deleteEmails, bulkUpdateEmails, forwardEmail, showToast, snoozeEmail } = useStore();
  const [replyBody, setReplyBody] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [isReplyAll, setIsReplyAll] = useState(false);
  const [showMoveTo, setShowMoveTo] = useState(false);
  const [showSnooze, setShowSnooze] = useState(false);
  const replyRef = useRef(null);
  const replyFileInputRef = useRef(null);

  // Auto-mark all unread emails in the thread as read on open
  useEffect(() => {
    const unreadIds = state.emails
      .filter(e => e.threadId === threadId && !e.read)
      .map(e => e.id);
    if (unreadIds.length > 0) {
      bulkUpdateEmails(unreadIds, { read: true });
    }
    // Only run when the thread changes, not on every state update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  // Listen for keyboard shortcut events from the global handler
  useEffect(() => {
    const onReply = () => { setIsReplying(true); setIsReplyAll(false); };
    const onReplyAll = () => { setIsReplying(true); setIsReplyAll(true); };
    const onMoveTo = () => setShowMoveTo(v => !v);
    const onSnooze = () => setShowSnooze(v => !v);
    window.addEventListener('xmail:reply', onReply);
    window.addEventListener('xmail:reply-all', onReplyAll);
    window.addEventListener('xmail:move-to', onMoveTo);
    window.addEventListener('xmail:snooze', onSnooze);
    return () => {
      window.removeEventListener('xmail:reply', onReply);
      window.removeEventListener('xmail:reply-all', onReplyAll);
      window.removeEventListener('xmail:move-to', onMoveTo);
      window.removeEventListener('xmail:snooze', onSnooze);
    };
  }, []);

  const threadEmails = state.emails
    .filter(e => e.threadId === threadId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (threadEmails.length === 0) {
    return <div className="p-8 text-center">Thread not found</div>;
  }

  const subject = threadEmails[0].subject;
  const lastEmail = threadEmails[threadEmails.length - 1];

  const handleReply = () => {
    if (!replyBody.trim() && replyAttachments.length === 0) return;
    replyToEmail(lastEmail, replyBody, isReplyAll, replyAttachments);
    setReplyBody('');
    setReplyAttachments([]);
    setIsReplying(false);
    setIsReplyAll(false);
  };

  const handleReplyFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const newAttachments = files.map(file => ({
      id: generateId(),
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      url: `https://picsum.photos/400/300?random=${generateId()}`
    }));

    setReplyAttachments(prev => [...prev, ...newAttachments]);

    if (replyFileInputRef.current) {
      replyFileInputRef.current.value = '';
    }
  };

  const removeReplyAttachment = (id) => {
    setReplyAttachments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-tl-2xl shadow-sm overflow-hidden">
      <div className="h-16 border-b border-gray-200 flex items-center px-4 gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center gap-2">
           <button onClick={() => { archiveEmails(threadEmails.map(e => e.id)); navigate(-1); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Archive"><Archive size={18} /></button>
           <button onClick={() => { deleteEmails(threadEmails.map(e => e.id)); navigate(-1); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Delete"><Trash2 size={18} /></button>
           <button onClick={() => { const allRead = threadEmails.every(e => e.read); bulkUpdateEmails(threadEmails.map(e => e.id), { read: !allRead }); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Mark as read/unread">
             {threadEmails.every(e => e.read) ? <MailOpen size={18} /> : <Mail size={18} />}
           </button>
           <button onClick={() => { bulkUpdateEmails(threadEmails.map(e => e.id), { folder: 'spam' }); showToast('Reported as spam', null); navigate(-1); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Report spam"><ShieldAlert size={18} /></button>
           <div className="relative">
             <button onClick={() => setShowMoveTo(!showMoveTo)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Move to"><FolderInput size={18} /></button>
             {showMoveTo && <ThreadMoveToMenu emailIds={threadEmails.map(e => e.id)} onClose={() => setShowMoveTo(false)} />}
           </div>
           <div className="relative">
             <button onClick={() => setShowSnooze(!showSnooze)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Snooze"><Clock size={18} /></button>
             {showSnooze && (
               <div className="absolute top-10 left-0 bg-white shadow-xl border border-gray-200 rounded py-2 w-52 z-50">
                 <div className="px-3 pb-2 border-b border-gray-100 font-medium text-xs text-gray-500">Snooze until:</div>
                 {[
                   { id: 'later', label: 'Later today', time: () => new Date(Date.now() + 3*3600000).toISOString() },
                   { id: 'tomorrow', label: 'Tomorrow', time: () => { const t = new Date(); t.setDate(t.getDate()+1); t.setHours(9,0,0,0); return t.toISOString(); } },
                   { id: 'nextweek', label: 'Next week', time: () => { const t = new Date(); t.setDate(t.getDate() + ((8-t.getDay())%7||7)); t.setHours(9,0,0,0); return t.toISOString(); } },
                 ].map(opt => (
                   <div key={opt.id} onClick={() => { threadEmails.forEach(e => snoozeEmail(e.id, opt.time())); setShowSnooze(false); navigate(-1); }}
                     className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">{opt.label}</div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-gray-800 font-normal">{subject}</h1>
          <div className="flex items-center gap-2">
             {lastEmail.folder && lastEmail.folder !== 'inbox' && (
               <div className="bg-gray-200 text-xs px-2 py-1 rounded capitalize">{lastEmail.folder === 'all-mail' ? 'Archive' : lastEmail.folder}</div>
             )}
             {lastEmail.folder === 'inbox' && (
               <div className="bg-gray-200 text-xs px-2 py-1 rounded">Inbox</div>
             )}
             {lastEmail.labels.map(labelId => {
               const label = state.labels.find(l => l.id === labelId);
               return label ? (
                 <div key={labelId} className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: label.color }}>{label.name}</div>
               ) : null;
             })}
          </div>
        </div>

        <div className="space-y-4">
          {threadEmails.map((email, index) => (
            <div key={email.id} className={cn("border border-gray-200 rounded-lg overflow-hidden", index === threadEmails.length - 1 ? "bg-white" : "bg-gray-50")}>
              <div className="flex items-start p-4 gap-4 cursor-pointer">
                <img src={email.from.avatar} alt="" className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{email.from.name}</span>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatDate(email.timestamp)}</span>
                      <button onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }}>
                        <Star size={18} className={cn(email.starred ? "text-yellow-400 fill-current" : "text-gray-400")} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setIsReplying(true); setIsReplyAll(false); }} title="Reply"><CornerUpLeft size={18} className="text-gray-500 hover:text-gray-800" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setIsReplying(true); setIsReplyAll(true); }} title="Reply All"><ReplyAll size={18} className="text-gray-500 hover:text-gray-800" /></button>
                      <button onClick={(e) => { e.stopPropagation(); forwardEmail(email); }} title="Forward"><Forward size={18} className="text-gray-500 hover:text-gray-800" /></button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 truncate">to {email.to.map(t => t.name).join(', ')}</div>
                </div>
              </div>

              <div className="px-16 pb-8 text-gray-800 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: email.body }} />

              {email.attachments && email.attachments.length > 0 && (
                <div className="px-16 pb-8 flex flex-wrap gap-4">
                    {email.attachments.map(att => {
                        const isImage = att.type && /^image\//i.test(att.type) || /\.(png|jpg|jpeg|gif|webp)$/i.test(att.name || '');
                        const ext = (att.name || '').split('.').pop()?.toUpperCase() || 'FILE';
                        return (
                          <a key={att.id} href={att.url} download={att.name} className="border rounded-lg p-2 w-48 cursor-pointer hover:bg-gray-50 block no-underline text-inherit" onClick={(e) => { if (!att.url || att.url === '#') e.preventDefault(); }}>
                              <div className="h-24 bg-gray-100 mb-2 overflow-hidden rounded flex items-center justify-center">
                                  {isImage ? (
                                    <img src={att.url} className="w-full h-full object-cover" alt={att.name} />
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      <Paperclip size={24} className="text-gray-400" />
                                      <span className="text-xs font-semibold text-gray-500">{ext}</span>
                                    </div>
                                  )}
                              </div>
                              <div className="flex items-center justify-between gap-1">
                                  <div className="text-sm font-medium truncate" title={att.name}>{att.name}</div>
                                  <Download size={14} className="text-gray-500 flex-shrink-0" />
                              </div>
                              <div className="text-xs text-gray-500">{att.size || ''}</div>
                          </a>
                        );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4 items-start">
            <img src={state.user.avatar} className="w-10 h-10 rounded-full" />
            <div 
                className={cn("flex-1 border border-gray-300 rounded-lg shadow-sm transition-all", isReplying ? "h-auto" : "h-12 overflow-hidden")}
                onClick={() => setIsReplying(true)}
            >
                {!isReplying ? (
                    <div className="p-3 text-gray-500 flex items-center gap-4 cursor-text">
                        <div className="flex items-center gap-2" onClick={() => { setIsReplying(true); setIsReplyAll(false); }}>
                          <Reply size={18} /> Reply
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700" onClick={(e) => { e.stopPropagation(); setIsReplying(true); setIsReplyAll(true); }}>
                          <ReplyAll size={18} /> Reply All
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700" onClick={(e) => { e.stopPropagation(); forwardEmail(lastEmail); }}>
                          <Forward size={18} /> Forward
                        </div>
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                            <CornerUpLeft size={16} />
                            <span>{isReplyAll ? 'Replying all' : 'Replying'} to {lastEmail.from.name}</span>
                            <button onClick={() => setIsReplyAll(!isReplyAll)} className="ml-2 text-xs text-blue-600 hover:underline">
                              {isReplyAll ? 'Switch to Reply' : 'Switch to Reply All'}
                            </button>
                        </div>
                        <textarea
                            ref={replyRef}
                            autoFocus
                            className="w-full min-h-[100px] outline-none resize-none"
                            placeholder="Type your reply..."
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                        />
                        {replyAttachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
                                {replyAttachments.map(att => (
                                    <div key={att.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded p-2 text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium truncate max-w-[150px]" title={att.name}>{att.name}</span>
                                            <span className="text-xs text-gray-500">{att.size}</span>
                                        </div>
                                        <button
                                            onClick={() => removeReplyAttachment(att.id)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                            title="Remove attachment"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleReply}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700"
                                >
                                    Send
                                </button>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    ref={replyFileInputRef}
                                    onChange={handleReplyFileSelect}
                                />
                                <button
                                    onClick={() => replyFileInputRef.current?.click()}
                                    className="text-gray-500 hover:bg-gray-100 p-2 rounded"
                                    title="Attach files"
                                >
                                    <Paperclip size={18} />
                                </button>
                            </div>
                            <button onClick={() => { setIsReplying(false); setReplyAttachments([]); }} className="text-gray-500 hover:bg-gray-100 p-2 rounded">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadView;