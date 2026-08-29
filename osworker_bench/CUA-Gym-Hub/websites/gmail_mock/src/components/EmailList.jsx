import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, Square, CheckSquare, Trash2, Archive, Mail, MailOpen, MoreVertical, Tag, Inbox, X, FolderInput, ShieldAlert, ShieldCheck, Clock, CornerUpLeft, ReplyAll, Forward, ChevronDown, Send, File, Zap, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn, formatDate } from '../lib/utils';
import { isToday, isYesterday, startOfMonth, isBefore } from 'date-fns';

const SnoozeMenu = ({ emailId, onClose, position }) => {
  const { snoozeEmail } = useStore();
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getSnoozeTime = (option) => {
    const now = new Date();
    switch (option) {
      case 'later': return new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
      case 'tomorrow': { const t = new Date(now); t.setDate(t.getDate() + 1); t.setHours(9, 0, 0, 0); return t.toISOString(); }
      case 'nextweek': { const t = new Date(now); t.setDate(t.getDate() + ((8 - t.getDay()) % 7 || 7)); t.setHours(9, 0, 0, 0); return t.toISOString(); }
      default: return new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
    }
  };

  const style = position ? { position: 'fixed', top: position.y, left: position.x } : {};

  return (
    <div ref={ref} className="bg-white shadow-xl border border-gray-200 rounded py-2 w-52 z-[100]" style={position ? style : { position: 'absolute', top: '100%', right: 0 }}>
      <div className="px-3 pb-2 border-b border-gray-100 font-medium text-xs text-gray-500">Snooze until:</div>
      {[
        { id: 'later', label: 'Later today', desc: '3 hours from now' },
        { id: 'tomorrow', label: 'Tomorrow', desc: 'Tomorrow 9:00 AM' },
        { id: 'nextweek', label: 'Next week', desc: 'Monday 9:00 AM' },
      ].map(opt => (
        <div key={opt.id} onClick={() => { snoozeEmail(emailId, getSnoozeTime(opt.id)); onClose(); }}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
          <div>{opt.label}</div>
          <div className="text-xs text-gray-400">{opt.desc}</div>
        </div>
      ))}
    </div>
  );
};

const ContextMenu = ({ email, position, onClose }) => {
  const navigate = useNavigate();
  const { toggleStar, toggleRead, archiveEmails, deleteEmails, bulkUpdateEmails, forwardEmail, showToast, state, addLabel, snoozeEmail } = useStore();
  const ref = useRef(null);
  const [subMenu, setSubMenu] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => { document.removeEventListener('mousedown', handleClickOutside); document.removeEventListener('keydown', handleEsc); };
  }, [onClose]);

  const menuItems = [
    { label: 'Reply', action: () => { navigate(`/email/${email.threadId}`); onClose(); } },
    { label: 'Reply All', action: () => { navigate(`/email/${email.threadId}`); onClose(); } },
    { label: 'Forward', action: () => { forwardEmail(email); onClose(); } },
    { divider: true },
    { label: 'Archive', action: () => { archiveEmails([email.id]); onClose(); } },
    { label: 'Delete', action: () => { deleteEmails([email.id]); onClose(); } },
    { label: 'Mark as spam', action: () => { bulkUpdateEmails([email.id], { folder: 'spam' }); showToast('Marked as spam', null); onClose(); } },
    { divider: true },
    { label: email.read ? 'Mark as unread' : 'Mark as read', action: () => { toggleRead(email.id, !email.read); onClose(); } },
    { label: email.starred ? 'Unstar' : 'Star', action: () => { toggleStar(email.id); onClose(); } },
    { divider: true },
    { label: 'Move to', hasSubmenu: true, submenuId: 'moveto' },
    { label: 'Label as', hasSubmenu: true, submenuId: 'label' },
  ];

  const folders = [
    { id: 'inbox', label: 'Inbox' },
    { id: 'spam', label: 'Spam' },
    { id: 'trash', label: 'Trash' },
    { id: 'all-mail', label: 'Archive' },
  ];

  return (
    <div ref={ref} className="fixed bg-white shadow-xl border border-gray-200 rounded py-1 w-48 z-[100]" style={{ top: position.y, left: position.x }}>
      {menuItems.map((item, i) => {
        if (item.divider) return <div key={i} className="border-t border-gray-100 my-1" />;
        return (
          <div key={i} className="relative">
            <div
              onClick={item.action}
              onMouseEnter={() => item.hasSubmenu && setSubMenu(item.submenuId)}
              onMouseLeave={() => item.hasSubmenu && setSubMenu(null)}
              className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer text-sm flex items-center justify-between"
            >
              {item.label}
              {item.hasSubmenu && <span className="text-gray-400 text-xs">&#9654;</span>}
            </div>
            {item.hasSubmenu && subMenu === item.submenuId && (
              <div className="absolute left-full top-0 bg-white shadow-xl border border-gray-200 rounded py-1 w-40"
                onMouseEnter={() => setSubMenu(item.submenuId)} onMouseLeave={() => setSubMenu(null)}>
                {item.submenuId === 'moveto' && folders.map(f => (
                  <div key={f.id} onClick={() => { bulkUpdateEmails([email.id], { folder: f.id }); showToast(`Moved to ${f.label}`, null); onClose(); }}
                    className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer text-sm">{f.label}</div>
                ))}
                {item.submenuId === 'label' && state.labels.map(l => (
                  <div key={l.id} onClick={() => { addLabel(email.id, l.id); onClose(); }}
                    className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                    {l.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const MoveToMenu = ({ emailIds, onClose }) => {
  const { bulkUpdateEmails, showToast } = useStore();
  const folders = [
    { id: 'inbox', label: 'Inbox' },
    { id: 'spam', label: 'Spam' },
    { id: 'trash', label: 'Trash' },
    { id: 'all-mail', label: 'Archive' },
  ];
  return (
    <div className="absolute top-10 right-0 bg-white shadow-xl border border-gray-200 rounded py-2 w-40 z-50">
      <div className="px-3 pb-2 border-b border-gray-100 font-medium text-xs text-gray-500">Move to:</div>
      {folders.map(f => (
        <div key={f.id} onClick={() => { bulkUpdateEmails(emailIds, { folder: f.id }); showToast(`Moved to ${f.label}`, null); onClose(); }}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">{f.label}</div>
      ))}
    </div>
  );
};

const EmailRow = ({ email, isSelected, toggleSelect, folder, threadCount, isFocused }) => {
  const navigate = useNavigate();
  const { toggleStar, toggleImportant, toggleRead, archiveEmails, deleteEmails, bulkUpdateEmails, openDraft, showToast, state } = useStore();
  const [showSnooze, setShowSnooze] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const handleRowClick = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    if (email.folder === 'drafts') {
      openDraft(email.id);
      return;
    }
    navigate(`/email/${email.threadId}`);
    if (!email.read) toggleRead(email.id, true);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
    {contextMenu && <ContextMenu email={email} position={contextMenu} onClose={() => setContextMenu(null)} />}
    {showSnooze && <SnoozeMenu emailId={email.id} onClose={() => setShowSnooze(null)} position={showSnooze} />}
    <div
      onClick={handleRowClick}
      onContextMenu={handleContextMenu}
      className={cn(
        "group flex items-center py-2 px-4 border-b border-gray-100 cursor-pointer hover:shadow-md relative z-0",
        email.read ? "bg-white" : "bg-[#f2f6fc]",
        isSelected && "bg-[#c2dbff]",
        isFocused && !isSelected && "ring-2 ring-inset ring-blue-400"
      )}
    >
      <div className="flex items-center gap-2 mr-4 w-12 flex-shrink-0">
        <button onClick={() => toggleSelect(email.id)} className="text-gray-400 hover:text-gray-600" title="Select">
          {isSelected ? <CheckSquare size={20} className="text-black" /> : <Square size={20} />}
        </button>
        <button
            onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }}
            className={cn("hover:text-yellow-400", email.starred ? "text-yellow-400 fill-current" : "text-gray-400")}
            title={email.starred ? "Starred" : "Star"}
        >
          <Star size={20} fill={email.starred ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mr-2 flex-shrink-0">
         <button
            onClick={(e) => { e.stopPropagation(); toggleImportant(email.id); }}
            className={cn(email.important ? "text-yellow-500" : "text-gray-300 hover:text-gray-400")}
            title={email.important ? "Important" : "Mark as important"}
         >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={email.important ? "#F4B400" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         </button>
      </div>

      <div className={cn("w-48 truncate pr-4 flex-shrink-0", !email.read && "font-bold text-black")}>
        {email.from.name}
        {threadCount > 1 && (
          <span className="ml-1 text-gray-500 font-normal text-xs">({threadCount})</span>
        )}
      </div>

      <div className="flex-1 flex items-center min-w-0">
        <div className="truncate text-gray-600 text-sm">
          <span className={cn("text-gray-900", !email.read && "font-bold")}>{email.subject}</span>
          <span className="mx-2 text-gray-400">-</span>
          <span>{email.snippet}</span>
        </div>

        <div className="flex gap-1 ml-2">
            {email.labels.map(labelId => {
                const label = state.labels.find(l => l.id === labelId);
                return label ? (
                    <div key={labelId} className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} title={label.name} />
                ) : null;
            })}
        </div>
      </div>

      <div className="w-24 text-right text-xs font-medium text-gray-500 flex-shrink-0 group-hover:hidden">
        {formatDate(email.timestamp)}
      </div>

      <div className="hidden group-hover:flex items-center justify-end gap-2 w-28 pl-2 bg-inherit">
        <button onClick={(e) => { e.stopPropagation(); archiveEmails([email.id]); }} className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Archive"><Archive size={16} /></button>
        <button onClick={(e) => { e.stopPropagation(); deleteEmails([email.id]); }} className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Delete"><Trash2 size={16} /></button>
        <button onClick={(e) => { e.stopPropagation(); toggleRead(email.id, !email.read); }} className="p-1 hover:bg-gray-200 rounded text-gray-600" title={email.read ? "Mark as unread" : "Mark as read"}>
          {email.read ? <MailOpen size={16} /> : <Mail size={16} />}
        </button>
        {email.folder === 'spam' ? (
          <button onClick={(e) => { e.stopPropagation(); bulkUpdateEmails([email.id], { folder: 'inbox' }); showToast('Marked as not spam', null); }} className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Not spam"><ShieldCheck size={16} /></button>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); bulkUpdateEmails([email.id], { folder: 'spam' }); showToast('Marked as spam', null); }} className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Report spam"><ShieldAlert size={16} /></button>
        )}
        <button onClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          setShowSnooze(showSnooze ? null : { x: rect.right - 208, y: rect.bottom + 4 });
        }} className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Snooze"><Clock size={16} /></button>
      </div>
    </div>
    </>
  );
};

// Date group header divider
const DateGroupHeader = ({ label }) => (
  <div className="flex items-center gap-3 px-4 py-1.5 bg-white border-b border-gray-100">
    <span className="text-xs font-medium text-gray-500">{label}</span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

// Get date group label for an email
const getDateGroup = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  const startOfThisMonth = startOfMonth(now);
  if (!isBefore(date, startOfThisMonth)) return 'This month';
  return 'Older';
};

// Empty state configurations per folder
const EMPTY_STATES = {
  inbox: {
    icon: Inbox,
    title: 'Your Primary tab is empty',
    desc: 'Tip: Messages in other tabs won\'t interrupt what you\'re doing here.',
  },
  starred: {
    icon: Star,
    title: 'No starred messages',
    desc: 'Stars let you give messages a special status to make them easier to find. To star a message, click the star outline beside any message or conversation.',
  },
  important: {
    icon: null,
    svgPath: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z',
    title: 'Nothing in Important',
    desc: 'Xmail automatically marks messages as important based on how you read and reply to them.',
  },
  sent: {
    icon: Send,
    title: 'No sent messages',
    desc: 'Messages you send will appear here.',
  },
  drafts: {
    icon: File,
    title: 'You don\'t have any saved drafts',
    desc: 'Saving a draft allows you to keep a message you aren\'t ready to send yet.',
  },
  snoozed: {
    icon: Clock,
    title: 'No snoozed messages',
    desc: 'Snooze messages to temporarily remove them from your inbox and be reminded when you want.',
  },
  spam: {
    icon: ShieldCheck,
    title: 'Hooray, no spam here!',
    desc: 'Xmail protects you from spam messages. Messages marked as spam are deleted after 30 days.',
  },
  trash: {
    icon: Trash2,
    title: 'No conversations in Trash',
    desc: 'Messages deleted from Trash cannot be recovered.',
  },
  'all-mail': {
    icon: Mail,
    title: 'You have no mail!',
    desc: 'All Mail includes all your messages, including Spam and Trash.',
  },
};

// Select dropdown component
const SelectDropdown = ({ threads, selectedEmails, setSelectedEmails, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const options = [
    { label: 'All', action: () => setSelectedEmails(threads.map(e => e.id)) },
    { label: 'None', action: () => setSelectedEmails([]) },
    { label: 'Read', action: () => setSelectedEmails(threads.filter(e => e.read).map(e => e.id)) },
    { label: 'Unread', action: () => setSelectedEmails(threads.filter(e => !e.read).map(e => e.id)) },
    { label: 'Starred', action: () => setSelectedEmails(threads.filter(e => e.starred).map(e => e.id)) },
    { label: 'Unstarred', action: () => setSelectedEmails(threads.filter(e => !e.starred).map(e => e.id)) },
  ];

  return (
    <div ref={ref} className="absolute top-10 left-0 bg-white shadow-xl border border-gray-200 rounded py-1 w-36 z-50">
      {options.map(opt => (
        <div
          key={opt.label}
          onClick={() => { opt.action(); onClose(); }}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
        >
          {opt.label}
        </div>
      ))}
    </div>
  );
};

const EmailList = ({ folder = 'inbox' }) => {
  const { state, searchQuery, selectedEmails, setSelectedEmails, bulkUpdateEmails, deleteEmails, archiveEmails, emptyTrash, addLabel, removeLabel, showToast, focusedEmailIndex } = useStore();
  const { labelId } = useParams();
  const [activeTab, setActiveTab] = React.useState('primary');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showMoveTo, setShowMoveTo] = useState(false);
  const [showSelectDropdown, setShowSelectDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);

  // Close more menu on outside click
  useEffect(() => {
    if (!showMoreMenu) return;
    const handler = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMoreMenu]);

  // Listen for 'L' (label list) and 'V' (move-to list) keyboard events
  useEffect(() => {
    const onLabel = () => setShowLabelPicker(v => !v);
    const onMoveTo = () => setShowMoveTo(v => !v);
    window.addEventListener('xmail:label-list', onLabel);
    window.addEventListener('xmail:move-to-list', onMoveTo);
    return () => {
      window.removeEventListener('xmail:label-list', onLabel);
      window.removeEventListener('xmail:move-to-list', onMoveTo);
    };
  }, []);

  const filteredEmails = state.emails.filter(email => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      if (query.includes('has:attachment') && (!email.attachments || email.attachments.length === 0)) return false;
      if (query.includes('from:')) {
        const fromQuery = query.split('from:')[1].split(' ')[0].toLowerCase();
        if (!email.from.name.toLowerCase().includes(fromQuery) &&
            !email.from.email.toLowerCase().includes(fromQuery)) return false;
      }
      if (query.includes('to:')) {
        const toQuery = query.split('to:')[1].split(' ')[0].toLowerCase();
        const toAddresses = (email.to || []).concat(email.cc || []).concat(email.bcc || []);
        if (!toAddresses.some(r => r.email?.toLowerCase().includes(toQuery) || r.name?.toLowerCase().includes(toQuery))) return false;
      }
      if (query.includes('is:starred') && !email.starred) return false;
      if (query.includes('is:important') && !email.important) return false;
      if (query.includes('is:unread') && email.read) return false;
      if (query.includes('is:read') && !email.read) return false;
      if (query.includes('in:spam') && email.folder !== 'spam') return false;
      if (query.includes('in:trash') && email.folder !== 'trash') return false;
      if (query.includes('in:sent') && email.folder !== 'sent') return false;

      // Strip known operators from the raw query for free-text matching
      const textQuery = query
        .replace(/has:\S+/g, '')
        .replace(/from:\S+/g, '')
        .replace(/to:\S+/g, '')
        .replace(/is:\S+/g, '')
        .replace(/in:\S+/g, '')
        .trim();

      if (!textQuery) return true; // Only operators — already filtered above

      return (
        email.subject.toLowerCase().includes(textQuery) ||
        email.from.name.toLowerCase().includes(textQuery) ||
        email.from.email.toLowerCase().includes(textQuery) ||
        email.body.toLowerCase().includes(textQuery)
      );
    }

    if (labelId) {
      return email.labels.includes(labelId) && email.folder !== 'trash';
    }

    // Special folders based on properties
    if (folder === 'starred') return email.starred && email.folder !== 'trash';
    if (folder === 'important') return email.important && email.folder !== 'trash';

    if (folder === 'inbox') {
      if (email.folder !== 'inbox') return false;
      return email.category === activeTab;
    }

    if (folder === 'all-mail') {
        return email.folder !== 'trash' && email.folder !== 'spam';
    }

    return email.folder === folder;
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const threads = React.useMemo(() => {
      const threadMap = new Map();
      filteredEmails.forEach(email => {
          if (!threadMap.has(email.threadId)) {
              threadMap.set(email.threadId, []);
          }
          threadMap.get(email.threadId).push(email);
      });

      return Array.from(threadMap.values()).map(threadEmails => {
          threadEmails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          return threadEmails[0];
      });
  }, [filteredEmails]);

  // Thread count map: threadId -> total count across ALL emails (not just filtered)
  const threadCountMap = React.useMemo(() => {
    const map = {};
    state.emails.forEach(email => {
      map[email.threadId] = (map[email.threadId] || 0) + 1;
    });
    return map;
  }, [state.emails]);

  // Unread count per inbox category tab
  const unreadByCategory = React.useMemo(() => {
    const counts = { primary: 0, social: 0, promotions: 0, updates: 0, forums: 0 };
    state.emails.forEach(email => {
      if (email.folder === 'inbox' && !email.read && counts[email.category] !== undefined) {
        counts[email.category]++;
      }
    });
    return counts;
  }, [state.emails]);

  // Group threads by date
  const groupedThreads = React.useMemo(() => {
    const groups = [];
    let lastGroup = null;
    threads.forEach(email => {
      const groupLabel = getDateGroup(email.timestamp);
      if (groupLabel !== lastGroup) {
        groups.push({ type: 'header', label: groupLabel });
        lastGroup = groupLabel;
      }
      groups.push({ type: 'email', email });
    });
    return groups;
  }, [threads]);

  const toggleSelect = (id) => {
    if (selectedEmails.includes(id)) {
      setSelectedEmails(selectedEmails.filter(eId => eId !== id));
    } else {
      setSelectedEmails([...selectedEmails, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedEmails.length === threads.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(threads.map(e => e.id));
    }
  };

  const emptyState = EMPTY_STATES[folder] || EMPTY_STATES['all-mail'];

  const inboxTabs = [
    { id: 'primary', icon: Inbox, label: 'Primary', color: 'border-red-500 text-red-600' },
    { id: 'social', icon: Tag, label: 'Social', color: 'border-blue-500 text-blue-600' },
    { id: 'promotions', icon: Tag, label: 'Promotions', color: 'border-green-500 text-green-600' },
    { id: 'updates', icon: Zap, label: 'Updates', color: 'border-yellow-500 text-yellow-600' },
    { id: 'forums', icon: MessageSquare, label: 'Forums', color: 'border-teal-500 text-teal-600' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-tl-2xl shadow-sm overflow-hidden">
      <div className="h-12 border-b border-gray-200 flex items-center px-4 gap-4">
        <div className="relative flex items-center">
          <button onClick={toggleSelectAll} className="text-gray-600 hover:bg-gray-100 p-1 rounded" title="Select">
            {selectedEmails.length > 0 && selectedEmails.length === threads.length ? <CheckSquare size={20} /> : <Square size={20} />}
          </button>
          <button
            onClick={() => setShowSelectDropdown(v => !v)}
            className="text-gray-500 hover:bg-gray-100 p-0.5 rounded"
            title="More select options"
          >
            <ChevronDown size={14} />
          </button>
          {showSelectDropdown && (
            <SelectDropdown
              threads={threads}
              selectedEmails={selectedEmails}
              setSelectedEmails={setSelectedEmails}
              onClose={() => setShowSelectDropdown(false)}
            />
          )}
        </div>

        {selectedEmails.length > 0 ? (
          <div className="flex items-center gap-2">
            <button onClick={() => archiveEmails(selectedEmails)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Archive">
              <Archive size={18} />
            </button>
            <button onClick={() => deleteEmails(selectedEmails)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Delete">
              <Trash2 size={18} />
            </button>
            <button onClick={() => bulkUpdateEmails(selectedEmails, { folder: 'inbox', read: true })} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Mark as read">
              <Mail size={18} />
            </button>
            <div className="relative">
                <button
                    onClick={() => setShowLabelPicker(!showLabelPicker)}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                    title="Label"
                >
                  <Tag size={18} />
                </button>
                {showLabelPicker && (
                    <div className="absolute top-10 left-0 bg-white shadow-xl border border-gray-200 rounded py-2 w-48 z-50">
                        <div className="px-3 pb-2 border-b border-gray-100 font-medium text-xs text-gray-500">Apply label:</div>
                        {state.labels.map(label => (
                                <div
                                    key={label.id}
                                    onClick={() => {
                                        selectedEmails.forEach(emailId => {
                                            addLabel(emailId, label.id);
                                        });
                                        setShowLabelPicker(false);
                                    }}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-sm"
                                >
                                    <Tag size={14} style={{ fill: label.color, stroke: 'none' }} />
                                    {label.name}
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
            <div className="relative">
                <button onClick={() => setShowMoveTo(!showMoveTo)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Move to">
                  <FolderInput size={18} />
                </button>
                {showMoveTo && <MoveToMenu emailIds={selectedEmails} onClose={() => setShowMoveTo(false)} />}
            </div>
            <button onClick={() => { bulkUpdateEmails(selectedEmails, { folder: folder === 'spam' ? 'inbox' : 'spam' }); showToast(folder === 'spam' ? 'Marked as not spam' : 'Reported as spam', null); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title={folder === 'spam' ? 'Not spam' : 'Report spam'}>
              {folder === 'spam' ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
            </button>
          </div>
        ) : (
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(v => !v)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
              title="More options"
            >
              <MoreVertical size={18} />
            </button>
            {showMoreMenu && (
              <div className="absolute top-10 left-0 bg-white shadow-xl border border-gray-200 rounded py-1 w-52 z-50">
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                  onClick={() => {
                    const visibleIds = threads.map(e => e.id);
                    bulkUpdateEmails(visibleIds, { read: true });
                    showToast('Marked all as read');
                    setShowMoreMenu(false);
                  }}
                >
                  Mark all as read
                </div>
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                  onClick={() => {
                    setSelectedEmails(threads.map(e => e.id));
                    setShowMoreMenu(false);
                  }}
                >
                  Select all
                </div>
                {folder === 'trash' && (
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-red-600"
                    onClick={() => { emptyTrash(); setShowMoreMenu(false); }}
                  >
                    Empty Trash
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {folder === 'trash' && (
            <button onClick={emptyTrash} className="ml-auto text-sm text-blue-600 hover:underline font-medium">
                Empty Trash Now
            </button>
        )}
      </div>

      {folder === 'inbox' && !searchQuery && !labelId && (
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {inboxTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors border-b-2",
                activeTab === tab.id ? `${tab.color} bg-gray-50` : "border-transparent text-gray-500"
              )}
            >
              <tab.icon size={18} />
              <span className="font-medium text-sm">{tab.label}</span>
              {unreadByCategory[tab.id] > 0 && (
                <span className="ml-1 text-xs font-semibold rounded-full px-1.5 py-0.5 bg-gray-700 text-white min-w-[20px] text-center">
                  {unreadByCategory[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 px-8 text-center">
            <div className="bg-gray-100 p-8 rounded-full mb-4">
              {emptyState.svgPath ? (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                  <path d={emptyState.svgPath} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : emptyState.icon ? (
                React.createElement(emptyState.icon, { size: 48, className: "text-gray-300" })
              ) : (
                <Inbox size={48} className="text-gray-300" />
              )}
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">{emptyState.title}</p>
            <p className="text-sm text-gray-500 max-w-sm">{emptyState.desc}</p>
          </div>
        ) : (
          (() => {
            let emailIdx = 0;
            return groupedThreads.map((item, i) => {
              if (item.type === 'header') {
                return <DateGroupHeader key={`header-${item.label}-${i}`} label={item.label} />;
              }
              const currentIdx = emailIdx++;
              return (
                <EmailRow
                  key={item.email.id}
                  email={item.email}
                  isSelected={selectedEmails.includes(item.email.id)}
                  toggleSelect={toggleSelect}
                  folder={folder}
                  threadCount={threadCountMap[item.email.threadId] || 1}
                  isFocused={focusedEmailIndex === currentIdx}
                />
              );
            });
          })()
        )}
      </div>
    </div>
  );
};

export default EmailList;
