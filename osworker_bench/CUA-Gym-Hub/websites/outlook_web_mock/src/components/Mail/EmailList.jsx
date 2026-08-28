import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { Flag, Paperclip, Trash2, Pin, ChevronDown, AlertCircle, Reply, ReplyAll, Forward, Archive, Mail, MailOpen, Tag, FolderInput } from 'lucide-react';

function getDateGroup(dateStr) {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  const diff = differenceInDays(new Date(), date);
  if (diff < 7) return 'This week';
  if (diff < 14) return 'Last week';
  if (diff < 30) return 'This month';
  return 'Older';
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

function getCategoryColor(catName) {
  const map = {
    'Blue category': '#0078D4',
    'Green category': '#107C10',
    'Orange category': '#FF8C00',
    'Purple category': '#8764B8',
    'Red category': '#D13438',
    'Yellow category': '#FFB900',
  };
  return map[catName] || '#0078D4';
}

export default function EmailList({ selectedFolder, selectedEmailId, onSelectEmail }) {
  const { state, actions } = useStore();
  const [tab, setTab] = useState('focused');
  const [contextMenu, setContextMenu] = useState(null);

  const isInbox = selectedFolder === 'folder-inbox';
  const focusedInboxEnabled = state.settings?.focusedInbox !== false;
  const showFocusedTabs = isInbox && focusedInboxEnabled;
  const density = state.settings?.density || 'medium';
  const showPreview = state.settings?.previewText !== false;
  const conversationView = state.settings?.conversationView !== false;

  const folderEmails = useMemo(() => {
    let msgs = state.messages.filter(e => e.parentFolderId === selectedFolder);

    // Search filter
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      msgs = state.messages.filter(e =>
        e.subject.toLowerCase().includes(q) ||
        e.bodyPreview.toLowerCase().includes(q) ||
        e.from.name.toLowerCase().includes(q) ||
        e.from.email.toLowerCase().includes(q)
      );
    }

    return msgs.sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.receivedDateTime) - new Date(a.receivedDateTime);
    });
  }, [state.messages, selectedFolder, state.searchQuery]);

  const displayEmails = useMemo(() => {
    if (!showFocusedTabs || state.searchQuery) return folderEmails;
    return folderEmails.filter(e =>
      tab === 'focused' ? e.inferenceClassification === 'focused' : e.inferenceClassification === 'other'
    );
  }, [folderEmails, tab, showFocusedTabs, state.searchQuery]);

  // Group by conversation if conversationView is on
  const conversationGrouped = useMemo(() => {
    if (!conversationView || state.searchQuery) return null;
    const convMap = {};
    displayEmails.forEach(e => {
      const key = e.conversationId || e.id;
      if (!convMap[key]) convMap[key] = [];
      convMap[key].push(e);
    });
    // Return representative email per conversation (most recent), with count
    return displayEmails.filter((e, idx, arr) => {
      const key = e.conversationId || e.id;
      const first = arr.find(m => (m.conversationId || m.id) === key);
      return first === e;
    }).map(e => {
      const key = e.conversationId || e.id;
      const count = convMap[key].length;
      return { ...e, _convCount: count };
    });
  }, [displayEmails, conversationView, state.searchQuery]);

  // Group by date
  const grouped = useMemo(() => {
    const emails = conversationGrouped || displayEmails;
    const groups = [];
    const pinnedMsgs = emails.filter(e => e.isPinned);
    const unpinnedMsgs = emails.filter(e => !e.isPinned);

    if (pinnedMsgs.length > 0) {
      groups.push({ label: 'Pinned', emails: pinnedMsgs });
    }

    const dateGroups = {};
    unpinnedMsgs.forEach(e => {
      const group = getDateGroup(e.receivedDateTime);
      if (!dateGroups[group]) dateGroups[group] = [];
      dateGroups[group].push(e);
    });

    const order = ['Today', 'Yesterday', 'This week', 'Last week', 'This month', 'Older'];
    order.forEach(label => {
      if (dateGroups[label]) groups.push({ label, emails: dateGroups[label] });
    });

    return groups;
  }, [displayEmails, conversationGrouped]);

  const folderName = state.folders.find(f => f.id === selectedFolder)?.displayName || 'Mail';

  return (
    <div className={`w-80 border-r border-neutral-200 flex flex-col h-full bg-white flex-shrink-0 density-${density}`}>
      {/* Folder name header */}
      <div className="px-4 py-2 text-base font-semibold text-neutral-700 border-b border-neutral-200 flex items-center justify-between">
        <span>{state.searchQuery ? `Search: "${state.searchQuery}"` : folderName}</span>
        <button className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700">
          <span>All</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Focused / Other tabs for inbox */}
      {showFocusedTabs && !state.searchQuery && (
        <div className="flex items-center border-b border-neutral-200 text-sm font-semibold">
          <button
            onClick={() => setTab('focused')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              tab === 'focused'
                ? 'border-[#0078D4] text-[#0078D4]'
                : 'border-transparent text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            Focused
          </button>
          <button
            onClick={() => setTab('other')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              tab === 'other'
                ? 'border-[#0078D4] text-[#0078D4]'
                : 'border-transparent text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            Other
          </button>
        </div>
      )}

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        {displayEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 text-sm p-8">
            <p>Nothing here</p>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.label}>
              <div className="px-4 py-1.5 text-xs font-semibold text-neutral-500 bg-white sticky top-0 z-10 border-b border-neutral-100 flex items-center gap-1">
                {group.label === 'Pinned' && <Pin className="w-3 h-3" />}
                {group.label}
              </div>
              {group.emails.map(email => (
                <EmailRow
                  key={email.id}
                  email={email}
                  isSelected={selectedEmailId === email.id}
                  onClick={() => onSelectEmail(email.id)}
                  onDelete={() => actions.deleteMessage(email.id)}
                  onFlag={() => actions.toggleFlag(email.id)}
                  onPin={() => actions.togglePin(email.id)}
                  showPreview={showPreview}
                  convCount={email._convCount}
                  density={density}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ emailId: email.id, x: e.clientX, y: e.clientY });
                  }}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <EmailContextMenu
          email={state.messages.find(m => m.id === contextMenu.emailId)}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          actions={actions}
          state={state}
          folders={state.folders}
        />
      )}
    </div>
  );
}

function EmailRow({ email, isSelected, onClick, onDelete, onFlag, onPin, onContextMenu, showPreview = true, convCount, density }) {
  const densityClass = density === 'compact' ? 'px-3 py-1.5' : density === 'full' ? 'px-3 py-4' : 'px-3 py-2.5';
  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`${densityClass} cursor-pointer group relative border-l-[3px] transition-colors email-row ${
        isSelected
          ? 'bg-[#EBF3FC] border-l-[#0078D4]'
          : !email.isRead
            ? 'bg-white border-l-[#0078D4] hover:bg-neutral-50'
            : 'bg-white border-l-transparent hover:bg-neutral-50'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5 ${
            !email.isRead ? '' : 'opacity-70'
          }`}
          style={{ backgroundColor: !email.isRead ? '#0078D4' : '#A19F9D' }}
        >
          {email.from.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Row 1: Sender + Time */}
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm truncate ${!email.isRead ? 'font-semibold text-neutral-700' : 'text-neutral-600'}`}>
              {email.from.name}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Hover actions */}
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-0.5 hover:bg-neutral-200 rounded text-neutral-400 hover:text-danger"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onFlag(); }}
                  className={`p-0.5 hover:bg-neutral-200 rounded ${email.flag.flagStatus === 'flagged' ? 'text-danger' : 'text-neutral-400'}`}
                  title="Flag"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onPin(); }}
                  className={`p-0.5 hover:bg-neutral-200 rounded ${email.isPinned ? 'text-[#0078D4]' : 'text-neutral-400'}`}
                  title="Pin"
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Time - hidden on hover */}
              <span className="text-xs text-neutral-400 whitespace-nowrap group-hover:hidden">
                {formatTime(email.receivedDateTime)}
              </span>
            </div>
          </div>

          {/* Row 2: Subject */}
          <div className={`text-sm truncate ${!email.isRead ? 'font-semibold text-neutral-800' : 'text-neutral-600'}`}>
            {email.importance === 'high' && <AlertCircle className="w-3 h-3 inline mr-1 text-danger" />}
            {email.subject}
            {convCount > 1 && (
              <span className="ml-1 text-xs text-neutral-400 font-normal">({convCount})</span>
            )}
          </div>

          {/* Row 3: Preview + Indicators */}
          {showPreview && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-neutral-400 truncate flex-1">
                {email.bodyPreview}
              </span>
              {/* Category dots */}
              {email.categories.map(cat => (
                <span
                  key={cat}
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(cat) }}
                />
              ))}
              {email.hasAttachments && <Paperclip className="w-3 h-3 text-neutral-400 flex-shrink-0" />}
              {email.flag.flagStatus === 'flagged' && !email.categories.length && (
                <Flag className="w-3 h-3 text-danger flex-shrink-0" />
              )}
            </div>
          )}
          {!showPreview && (email.categories.length > 0 || email.hasAttachments || email.flag.flagStatus === 'flagged') && (
            <div className="flex items-center gap-1.5 mt-0.5">
              {email.categories.map(cat => (
                <span
                  key={cat}
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(cat) }}
                />
              ))}
              {email.hasAttachments && <Paperclip className="w-3 h-3 text-neutral-400 flex-shrink-0" />}
              {email.flag.flagStatus === 'flagged' && <Flag className="w-3 h-3 text-danger flex-shrink-0" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmailContextMenu({ email, x, y, onClose, actions, state, folders }) {
  if (!email) return null;

  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);
  const [showCategorizeSubmenu, setShowCategorizeSubmenu] = useState(false);

  const menuItems = [
    { label: 'Reply', icon: Reply, action: () => actions.setComposeState({ mode: 'reply', replyTo: email, to: email.from.email, subject: `Re: ${email.subject}` }) },
    { label: 'Reply All', icon: ReplyAll, action: () => actions.setComposeState({ mode: 'replyAll', replyTo: email, to: [email.from, ...email.toRecipients].filter(r => r.email !== state.user.email).map(r => r.email).join(', '), subject: `Re: ${email.subject}` }) },
    { label: 'Forward', icon: Forward, action: () => actions.setComposeState({ mode: 'forward', forwardFrom: email, subject: `Fw: ${email.subject}`, body: email.body.content }) },
    { type: 'separator' },
    { label: email.isRead ? 'Mark as unread' : 'Mark as read', icon: email.isRead ? Mail : MailOpen, action: () => actions.toggleRead(email.id) },
    { label: email.flag.flagStatus === 'flagged' ? 'Unflag' : 'Flag', icon: Flag, action: () => actions.toggleFlag(email.id) },
    { label: email.isPinned ? 'Unpin' : 'Pin', icon: Pin, action: () => actions.togglePin(email.id) },
    { type: 'separator' },
    { label: 'Delete', icon: Trash2, action: () => actions.deleteMessage(email.id), danger: true },
    { label: 'Archive', icon: Archive, action: () => actions.archiveMessage(email.id) },
    { label: 'Move to...', icon: FolderInput, submenu: 'move' },
    { label: 'Categorize', icon: Tag, submenu: 'categorize' },
  ];

  const handleAction = (item) => {
    if (item.submenu === 'move') {
      setShowMoveSubmenu(!showMoveSubmenu);
      setShowCategorizeSubmenu(false);
      return;
    }
    if (item.submenu === 'categorize') {
      setShowCategorizeSubmenu(!showCategorizeSubmenu);
      setShowMoveSubmenu(false);
      return;
    }
    item.action();
    onClose();
  };

  const menuStyle = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 220),
    top: Math.min(y, window.innerHeight - 400),
    zIndex: 60,
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }}>
      <div
        className="bg-white rounded-lg shadow-xl border border-neutral-200 py-1 w-52"
        style={menuStyle}
        onClick={e => e.stopPropagation()}
      >
        {menuItems.map((item, idx) =>
          item.type === 'separator' ? (
            <div key={idx} className="h-px bg-neutral-200 my-1" />
          ) : (
            <div key={idx} className="relative">
              <button
                onClick={() => handleAction(item)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-neutral-100 transition-colors ${
                  item.danger ? 'text-[#D13438]' : 'text-neutral-700'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.submenu && <ChevronDown className="w-3 h-3 -rotate-90" />}
              </button>

              {item.submenu === 'move' && showMoveSubmenu && (
                <div className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-neutral-200 py-1 w-48">
                  {folders.filter(f => f.id !== email.parentFolderId).map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => { actions.moveMessage(email.id, folder.id); onClose(); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      {folder.displayName}
                    </button>
                  ))}
                </div>
              )}

              {item.submenu === 'categorize' && showCategorizeSubmenu && (
                <div className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-neutral-200 py-1 w-48">
                  {state.categories.map(cat => {
                    const isActive = email.categories.includes(cat.displayName);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { actions.categorizeMessage(email.id, cat.displayName); onClose(); }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-neutral-100 ${isActive ? 'font-semibold' : ''}`}
                      >
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-neutral-700">{cat.displayName}</span>
                        {isActive && <span className="text-[#0078D4] ml-auto text-xs">&#10003;</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
