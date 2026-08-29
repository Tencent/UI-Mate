import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Hash, Bell, Pin, Users, Search, PlusCircle, Gift, Smile, Sticker, MessageSquare, Bold, Italic, Code, X, Pencil, Trash2, Reply, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

// Simple Markdown Parser Component
const MarkdownText = ({ content }) => {
  if (!content) return null;

  // Split by multiline code blocks first, then inline code
  const codeBlockRegex = /(```[\s\S]*?```)/g;
  const topParts = content.split(codeBlockRegex);

  return (
    <span>
      {topParts.map((part, index) => {
        // Multiline code block
        if (part.startsWith('```') && part.endsWith('```')) {
          const inner = part.slice(3, -3);
          const newlineIdx = inner.indexOf('\n');
          const lang = newlineIdx > 0 ? inner.slice(0, newlineIdx).trim() : '';
          const code = newlineIdx > 0 ? inner.slice(newlineIdx + 1) : inner;
          return (
            <div key={index} className="bg-xiscord-darker border border-xiscord-divider rounded-md my-1 overflow-hidden">
              {lang && (
                <div className="text-xs text-xiscord-muted px-3 py-1 border-b border-xiscord-divider">{lang}</div>
              )}
              <pre className="px-3 py-2 text-sm font-mono text-xiscord-lightest overflow-x-auto">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Process inline code
        const inlineParts = part.split(/(`[^`]+`)/g);
        return (
          <span key={index}>
            {inlineParts.map((iPart, iIdx) => {
              if (iPart.startsWith('`') && iPart.endsWith('`') && iPart.length > 1) {
                return (
                  <code key={iIdx} className="bg-xiscord-darker px-1 py-0.5 rounded text-sm font-mono text-xiscord-lightest">
                    {iPart.slice(1, -1)}
                  </code>
                );
              }

              // Process blockquotes
              const lines = iPart.split('\n');
              const result = [];
              let blockquoteLines = [];

              const flushBlockquote = () => {
                if (blockquoteLines.length > 0) {
                  result.push(
                    <div key={`bq-${result.length}`} className="border-l-4 border-xiscord-divider pl-3 my-1 text-xiscord-modifier">
                      {blockquoteLines.map((l, li) => <div key={li}>{processInline(l)}</div>)}
                    </div>
                  );
                  blockquoteLines = [];
                }
              };

              for (let li = 0; li < lines.length; li++) {
                const line = lines[li];
                if (line.startsWith('> ')) {
                  blockquoteLines.push(line.slice(2));
                } else {
                  flushBlockquote();
                  // Headers
                  if (line.startsWith('### ')) {
                    result.push(<div key={`h3-${li}`} className="text-base font-bold mt-1">{processInline(line.slice(4))}</div>);
                  } else if (line.startsWith('## ')) {
                    result.push(<div key={`h2-${li}`} className="text-lg font-bold mt-1">{processInline(line.slice(3))}</div>);
                  } else if (line.startsWith('# ')) {
                    result.push(<div key={`h1-${li}`} className="text-xl font-bold mt-1">{processInline(line.slice(2))}</div>);
                  } else if (line.startsWith('- ') || line.startsWith('* ')) {
                    result.push(<div key={`li-${li}`} className="flex"><span className="mr-2">{'•'}</span>{processInline(line.slice(2))}</div>);
                  } else {
                    result.push(<span key={`t-${li}`}>{processInline(line)}{li < lines.length - 1 ? '\n' : ''}</span>);
                  }
                }
              }
              flushBlockquote();

              return <span key={iIdx}>{result}</span>;
            })}
          </span>
        );
      })}
    </span>
  );
};

// Process inline formatting: bold, italic, strikethrough, underline, spoiler, @mentions
function processInline(text) {
  if (!text) return text;

  // Process @mentions first, then inline formatting
  const regex = /(@\w+|\|\|[^|]+\|\||~~[^~]+~~|__[^_]+__|(\*\*[^*]+\*\*)|(\*[^*]+\*))/g;
  const parts = text.split(regex).filter(p => p !== undefined);

  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith('@') && part.length > 1) {
      return (
        <span key={idx} className="bg-[#5865f233] text-[#dee0fc] rounded px-0.5 hover:underline cursor-pointer">
          {part}
        </span>
      );
    }
    if (part.startsWith('||') && part.endsWith('||') && part.length > 4) {
      return <SpoilerText key={idx} text={part.slice(2, -2)} />;
    }
    if (part.startsWith('~~') && part.endsWith('~~') && part.length > 4) {
      return <s key={idx}>{part.slice(2, -2)}</s>;
    }
    if (part.startsWith('__') && part.endsWith('__') && part.length > 4) {
      return <u key={idx}>{part.slice(2, -2)}</u>;
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function SpoilerText({ text }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span
      onClick={() => setRevealed(!revealed)}
      className={cn(
        "rounded px-0.5 cursor-pointer transition-all",
        revealed ? "bg-xiscord-muted/30" : "bg-xiscord-muted text-transparent"
      )}
      style={!revealed ? { filter: 'blur(4px)', WebkitFilter: 'blur(4px)' } : {}}
    >
      {text}
    </span>
  );
}

// Embed Component
const EmbedComponent = ({ embed }) => {
  if (!embed) return null;
  return (
    <div className="mt-2 max-w-[400px] border-l-4 bg-xiscord-darker rounded p-3" style={{ borderColor: embed.color || '#5865F2' }}>
      {embed.author && (
        <div className="text-xs text-xiscord-modifier mb-1">{embed.author.name}</div>
      )}
      {embed.title && (
        <a href={embed.url} target="_blank" rel="noopener noreferrer" className="font-bold text-xiscord-blurple hover:underline block mb-1">
          {embed.title}
        </a>
      )}
      {embed.description && (
        <p className="text-sm text-xiscord-lightest mb-2">{embed.description}</p>
      )}
      {embed.thumbnail && (
        <div className="rounded overflow-hidden inline-block">
          <img src={embed.thumbnail.url} alt="Thumbnail" className="max-w-[80px] max-h-[80px] object-cover" />
        </div>
      )}
      {embed.image && (
        <div className="rounded overflow-hidden mt-2">
          <img src={embed.image.url} alt="Embed" className="max-w-full h-auto max-h-[300px] object-contain" />
        </div>
      )}
      {embed.footer && (
        <div className="text-xs text-xiscord-muted mt-2">{embed.footer.text}</div>
      )}
    </div>
  );
};

const UrlEmbed = ({ url }) => {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('picsum.photos');
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');

  if (isImage) {
    return (
      <div className="mt-2 max-w-[400px] rounded-lg overflow-hidden border border-xiscord-darker bg-xiscord-dark">
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <img src={url} alt="Embed" className="max-w-full h-auto max-h-[300px] object-contain" />
        </a>
      </div>
    );
  }

  if (isYoutube) {
    return (
      <div className="mt-2 max-w-[400px] border-l-4 border-[#ff0000] bg-xiscord-darker rounded p-3">
        <div className="text-xs text-xiscord-muted mb-1">YouTube</div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-bold text-xiscord-blurple hover:underline block mb-2">
          Video Title (Mock)
        </a>
        <div className="relative aspect-video bg-black rounded overflow-hidden group cursor-pointer">
          <img
            src={`https://picsum.photos/400/225?random=${encodeURIComponent(url)}`}
            alt="Video Thumbnail"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center border-2 border-white">
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[16px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="mt-2 max-w-[400px] border-l-4 border-xiscord-divider bg-xiscord-darker rounded p-3">
        <div className="text-xs text-xiscord-muted mb-1">Website</div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-bold text-xiscord-blurple hover:underline block mb-1">
          {new URL(url).hostname}
        </a>
      </div>
    );
  } catch { return null; }
};

// User Profile Modal
const UserProfileModal = ({ userId, onClose }) => {
  const store = useStore();
  const user = store.users[userId];

  if (!user) return null;

  const userRoles = (user.roles || []).map(roleId => store.roles[roleId]).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-[300px] bg-xiscord-dark rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="h-[60px]" style={{ backgroundColor: user.bannerColor || '#5865F2' }}></div>
        <div className="px-4 relative">
          <div className="w-[80px] h-[80px] rounded-full border-[6px] border-xiscord-dark absolute -top-[40px] bg-xiscord-dark">
            <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full" />
            <div className={cn(
              "absolute bottom-0 right-0 w-5 h-5 rounded-full border-[4px] border-xiscord-dark",
              user.status === 'online' ? "bg-xiscord-online" :
              user.status === 'idle' ? "bg-xiscord-idle" :
              user.status === 'dnd' ? "bg-xiscord-dnd" : "bg-xiscord-offline"
            )} />
          </div>
        </div>
        <div className="mt-12 px-4 pb-4">
          <div className="font-bold text-xl text-white">{user.username}</div>
          <div className="text-xiscord-muted text-sm">#{user.discriminator}</div>
          {user.isBot && (
            <span className="inline-block bg-xiscord-blurple text-white text-xs font-bold px-1.5 py-0.5 rounded mt-1">BOT</span>
          )}
          {user.customStatus && (
            <div className="text-sm text-xiscord-lightest mt-2">{user.customStatus}</div>
          )}
          <div className="mt-4 border-t border-xiscord-modifier/20 pt-3">
            <div className="text-xs font-bold text-xiscord-modifier uppercase mb-1">About Me</div>
            <div className="text-sm text-xiscord-lightest">{user.aboutMe || 'No bio yet.'}</div>
          </div>
          <div className="mt-4">
            <div className="text-xs font-bold text-xiscord-modifier uppercase mb-1">Roles</div>
            <div className="flex flex-wrap gap-1">
              {userRoles.length > 0 ? userRoles.map(role => (
                <div key={role.id} className="flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-xiscord-darker border border-xiscord-modifier/20">
                  <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: role.color }}></div>
                  <span className="text-xiscord-lightest">{role.name}</span>
                </div>
              )) : (
                <div className="text-xs text-xiscord-muted">No roles</div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder={`Message @${user.username}`}
              className="w-full bg-xiscord-darker text-sm px-2 py-2 rounded outline-none text-xiscord-lightest placeholder-xiscord-muted"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Thread Panel Component
function ThreadPanel({ threadId, onClose }) {
  const [threadInput, setThreadInput] = useState('');
  const threadEndRef = useRef(null);
  const store = useStore();
  const thread = store.threads[threadId];
  const users = store.users;
  const roles = store.roles;

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages?.length]);

  if (!thread) return null;

  const parentMessage = store.messages[thread.messageId];
  const parentUser = parentMessage ? users[parentMessage.userId] : null;

  const handleSendThreadMessage = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (threadInput.trim()) {
        store.sendThreadMessage(threadId, threadInput);
        setThreadInput('');
      }
    }
  };

  return (
    <div className="w-[400px] bg-xiscord-dark border-l border-xiscord-darker flex flex-col shrink-0 h-full">
      {/* Thread Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-xiscord-darker shrink-0">
        <div className="flex items-center min-w-0">
          <MessageSquare size={20} className="text-xiscord-modifier mr-2 shrink-0" />
          <h3 className="font-bold text-white truncate">{thread.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-xiscord-light rounded text-xiscord-modifier hover:text-white shrink-0 ml-2"
        >
          <X size={20} />
        </button>
      </div>

      {/* Parent Message */}
      {parentMessage && (
        <div className="px-4 py-3 border-b border-xiscord-darker">
          <div className="flex items-center mb-1">
            <img src={parentUser?.avatar} alt="" className="w-6 h-6 rounded-full mr-2" />
            <span className="font-medium text-sm text-white">{parentUser?.username}</span>
            <span className="text-xs text-xiscord-muted ml-2">
              {format(new Date(parentMessage.timestamp), 'MM/dd/yyyy h:mm aa')}
            </span>
          </div>
          <div className="text-sm text-xiscord-lightest line-clamp-3">
            <MarkdownText content={parentMessage.content} />
          </div>
        </div>
      )}

      {/* Thread count */}
      <div className="px-4 py-2 text-xs text-xiscord-muted border-b border-xiscord-darker">
        {thread.messages.length} {thread.messages.length === 1 ? 'reply' : 'replies'}
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-2">
        {thread.messages.map(msg => {
          const msgUser = users[msg.userId];
          const roleId = msgUser?.roles?.[0];
          const roleColor = roleId ? roles[roleId]?.color : null;
          return (
            <div key={msg.id} className="flex py-2 hover:bg-xiscord-hover/30">
              <div className="w-8 h-8 mr-3 shrink-0 mt-0.5">
                <img src={msgUser?.avatar || 'https://picsum.photos/128/128'} alt="" className="w-full h-full rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="font-medium text-sm mr-2" style={{ color: roleColor || '#fff' }}>
                    {msgUser?.username || 'Unknown'}
                  </span>
                  <span className="text-xs text-xiscord-muted">
                    {format(new Date(msg.timestamp), 'MM/dd/yyyy h:mm aa')}
                  </span>
                </div>
                <div className="text-sm text-xiscord-lightest whitespace-pre-wrap break-words">
                  <MarkdownText content={msg.content} />
                </div>
              </div>
            </div>
          );
        })}
        <div ref={threadEndRef} />
      </div>

      {/* Thread Input */}
      <div className="px-3 pb-4 pt-2 shrink-0">
        <div className="bg-xiscord-light rounded-lg px-3 py-2 flex items-center">
          <input
            type="text"
            value={threadInput}
            onChange={(e) => setThreadInput(e.target.value)}
            onKeyDown={handleSendThreadMessage}
            placeholder={`Reply to thread...`}
            className="bg-transparent flex-1 outline-none text-xiscord-lightest placeholder-xiscord-muted/70 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

// Image Lightbox Component
function ImageLightbox({ src, alt, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="max-w-[90vw] max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
        <img src={src} alt={alt} className="max-w-full max-h-[90vh] object-contain rounded" />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
        >
          <X size={18} />
        </button>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 text-xs text-xiscord-muted hover:text-white bg-black/50 px-2 py-1 rounded"
        >
          Open Original
        </a>
      </div>
    </div>
  );
}

// Date Divider Component
function DateDivider({ date }) {
  const d = new Date(date);
  let label;
  if (isToday(d)) label = 'Today';
  else if (isYesterday(d)) label = 'Yesterday';
  else label = format(d, 'MMMM d, yyyy');

  return (
    <div className="flex items-center px-4 my-2">
      <div className="flex-1 h-px bg-xiscord-divider" />
      <span className="px-2 text-xs font-bold text-xiscord-muted">{label}</span>
      <div className="flex-1 h-px bg-xiscord-divider" />
    </div>
  );
}

// Context Menu Component
function ContextMenu({ x, y, items, onClose }) {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleContextMenu = (e) => { e.preventDefault(); onClose(); };
    window.addEventListener('click', handleClick);
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const menuStyle = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - items.length * 36 - 20),
    zIndex: 100
  };

  return (
    <div style={menuStyle} className="min-w-[188px] bg-[#111214] rounded-lg shadow-xl border border-[#2e2f34] py-1.5" onClick={e => e.stopPropagation()}>
      {items.map((item, idx) => {
        if (item.separator) {
          return <div key={idx} className="h-px bg-[#2e2f34] my-1 mx-2" />;
        }
        return (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); item.onClick(); onClose(); }}
            className={cn(
              "w-full text-left px-2 mx-1.5 py-1.5 text-sm rounded flex items-center",
              item.danger
                ? "text-xiscord-red hover:bg-xiscord-red hover:text-white"
                : "text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white"
            )}
            style={{ width: 'calc(100% - 12px)' }}
          >
            {item.icon && <span className="mr-2 w-4 flex justify-center">{item.icon}</span>}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function Message({ message, user, roleColor, onUserClick, onOpenThread, onReply, triggerEdit, onEditTriggered }) {
  const addReaction = useStore(state => state.addReaction);
  const createThread = useStore(state => state.createThread);
  const editMessage = useStore(state => state.editMessage);
  const deleteMessage = useStore(state => state.deleteMessage);
  const togglePinMessage = useStore(state => state.togglePinMessage);
  const threads = useStore(state => state.threads);
  const currentUserId = useStore(state => state.currentUser.id);
  const users = useStore(state => state.users);
  const messages = useStore(state => state.messages);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showThreadDialog, setShowThreadDialog] = useState(false);
  const [threadName, setThreadName] = useState('');

  const isOwn = message.userId === currentUserId;

  // Handle triggered edit from keyboard shortcut (Up arrow)
  useEffect(() => {
    if (triggerEdit && isOwn && !isEditing) {
      setIsEditing(true);
      setEditValue(message.content);
      if (onEditTriggered) onEditTriggered();
    }
  }, [triggerEdit]);

  // Find thread associated with this message
  const thread = message.threadId ? threads[message.threadId] : null;

  // Extract URLs for auto-embeds (only if no explicit embeds)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = (message.embeds && message.embeds.length > 0) ? [] : (message.content.match(urlRegex) || []);

  // Referenced (reply) message
  const referencedMessage = message.referencedMessageId ? messages[message.referencedMessageId] : null;
  const referencedUser = referencedMessage ? users[referencedMessage.userId] : null;

  const handleCreateThread = () => {
    if (thread) {
      onOpenThread(thread.id);
      return;
    }
    setThreadName(`${message.content.slice(0, 32) || 'New thread'}`);
    setShowThreadDialog(true);
  };

  const handleConfirmThread = (e) => {
    e.preventDefault();
    const name = threadName.trim();
    if (name) {
      const threadId = createThread(message.id, name);
      if (threadId) onOpenThread(threadId);
    }
    setShowThreadDialog(false);
    setThreadName('');
  };

  const handleEditSave = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editValue.trim() && editValue !== message.content) {
        editMessage(message.id, editValue);
      }
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setEditValue(message.content);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    deleteMessage(message.id);
    setShowDeleteConfirm(false);
  };

  // Check if user is mentioned
  const isMentioned = (message.mentions || []).includes(currentUserId);

  const handleContextMenu = (e) => {
    e.preventDefault();
    const menuItems = [
      { label: 'Reply', icon: <Reply size={14} />, onClick: () => onReply(message) },
      { label: thread ? 'View Thread' : 'Create Thread', icon: <MessageSquare size={14} />, onClick: handleCreateThread },
      { label: message.pinned ? 'Unpin Message' : 'Pin Message', icon: <Pin size={14} />, onClick: () => togglePinMessage(message.id) },
      { label: 'Copy Text', onClick: () => navigator.clipboard.writeText(message.content) },
      { separator: true },
    ];
    if (isOwn) {
      menuItems.push({ label: 'Edit Message', icon: <Pencil size={14} />, onClick: () => setIsEditing(true) });
    }
    if (isOwn) {
      menuItems.push({ label: 'Delete Message', icon: <Trash2 size={14} />, onClick: () => setShowDeleteConfirm(true), danger: true });
    }
    setContextMenu({ x: e.clientX, y: e.clientY, items: menuItems });
  };

  return (
    <>
      <div
        className={cn(
          "group flex px-4 py-1 hover:bg-xiscord-hover/30 mt-0.5 relative",
          isMentioned && "bg-[#5865f20a] border-l-[3px] border-xiscord-blurple pl-[13px]"
        )}
        onContextMenu={handleContextMenu}
      >
        <div
          className="w-10 h-10 mr-4 shrink-0 cursor-pointer mt-0.5"
          onClick={() => onUserClick(user?.id)}
        >
          <img
            src={user?.avatar || 'https://picsum.photos/128/128'}
            alt={user?.username}
            className="w-full h-full rounded-full hover:opacity-80"
          />
        </div>
        <div className="flex-1 min-w-0">
          {/* Reply reference */}
          {referencedMessage && (
            <div className="flex items-center text-xs text-xiscord-muted mb-0.5 ml-0">
              <div className="w-8 h-4 border-l-2 border-t-2 border-xiscord-muted/40 rounded-tl-lg mr-1 -mb-1"></div>
              <img src={referencedUser?.avatar} alt="" className="w-4 h-4 rounded-full mr-1" />
              <span className="font-medium text-xiscord-modifier mr-1">{referencedUser?.username || 'Unknown'}</span>
              <span className="truncate max-w-[300px] text-xiscord-muted hover:text-xiscord-lightest cursor-pointer">
                {referencedMessage.content.slice(0, 60)}{referencedMessage.content.length > 60 ? '...' : ''}
              </span>
            </div>
          )}

          <div className="flex items-center">
            <span
              className="font-medium mr-2 hover:underline cursor-pointer"
              style={{ color: roleColor || '#fff' }}
              onClick={() => onUserClick(user?.id)}
            >
              {user?.username || 'Unknown User'}
            </span>
            {user?.isBot && (
              <span className="bg-xiscord-blurple text-white text-[10px] font-bold px-1 py-0 rounded mr-1">BOT</span>
            )}
            <span className="text-xs text-xiscord-muted ml-1">
              {format(new Date(message.timestamp), 'MM/dd/yyyy h:mm aa')}
            </span>
            {message.isEdited && (
              <span className="text-xs text-xiscord-muted ml-1">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleEditSave}
                className="w-full bg-xiscord-light text-xiscord-lightest rounded px-2 py-1 outline-none resize-none text-sm mt-1"
                rows={2}
                autoFocus
              />
              <div className="text-xs text-xiscord-muted mt-1">
                escape to <span className="text-xiscord-blurple cursor-pointer" onClick={() => { setEditValue(message.content); setIsEditing(false); }}>cancel</span> {'•'} enter to <span className="text-xiscord-blurple cursor-pointer" onClick={() => { if (editValue.trim()) { editMessage(message.id, editValue); setIsEditing(false); } }}>save</span>
              </div>
            </div>
          ) : (
            <div className="text-xiscord-lightest whitespace-pre-wrap break-words">
              <MarkdownText content={message.content} />
            </div>
          )}

          {/* Explicit embeds from data */}
          {(message.embeds || []).map((embed, idx) => (
            <EmbedComponent key={idx} embed={embed} />
          ))}

          {/* Attachments */}
          {(message.attachments || []).map((att) => (
            <div key={att.id} className="mt-2 max-w-[400px]">
              {att.contentType?.startsWith('image/') ? (
                <div
                  className="rounded-lg overflow-hidden border border-xiscord-darker cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setLightboxImage({ src: att.url, alt: att.filename })}
                >
                  <img src={att.url} alt={att.filename} className="max-w-full h-auto max-h-[300px] object-contain" />
                  <div className="bg-xiscord-darker px-2 py-1 flex items-center justify-between">
                    <span className="text-xs text-xiscord-muted truncate">{att.filename}</span>
                    <span className="text-xs text-xiscord-muted">{att.size ? `${(att.size / 1024).toFixed(0)} KB` : ''}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center bg-xiscord-darker border border-xiscord-divider rounded p-3 hover:bg-xiscord-light/30 cursor-pointer">
                  <span className="mr-3 text-2xl shrink-0">📄</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xiscord-blurple text-sm font-medium truncate">{att.filename}</div>
                    <div className="text-xs text-xiscord-muted">{att.size ? `${(att.size / 1024).toFixed(0)} KB` : 'Unknown size'}</div>
                  </div>
                  <span className="text-xs text-xiscord-muted ml-2 shrink-0">Download</span>
                </div>
              )}
            </div>
          ))}

          {/* Auto URL Embeds (only if no explicit embeds) */}
          {urls.length > 0 && (
            <div className="space-y-2">
              {urls.map((url, idx) => (
                <UrlEmbed key={idx} url={url} />
              ))}
            </div>
          )}

          {/* Reactions */}
          {Object.keys(message.reactions || {}).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(message.reactions).map(([emoji, userIds]) => (
                <button
                  key={emoji}
                  onClick={() => addReaction(message.id, emoji)}
                  className={cn(
                    "flex items-center px-1.5 py-0.5 rounded-[4px] border border-transparent bg-xiscord-dark hover:border-xiscord-blurple/50",
                    userIds.includes(currentUserId) && "bg-xiscord-blurple/10 border-xiscord-blurple/50"
                  )}
                >
                  <span className="mr-1">{emoji}</span>
                  <span className="text-xs font-bold text-xiscord-modifier">{userIds.length}</span>
                </button>
              ))}
              <button
                onClick={() => addReaction(message.id, '👍')}
                className="flex items-center px-1.5 py-0.5 rounded-[4px] border border-dashed border-xiscord-divider hover:border-xiscord-modifier text-xiscord-muted hover:text-xiscord-modifier"
              >
                <Smile size={14} />
              </button>
            </div>
          )}

          {/* Thread Indicator */}
          {thread && (
            <div className="mt-2 flex items-center cursor-pointer" onClick={() => onOpenThread(thread.id)}>
              <div className="h-8 w-6 border-l-2 border-b-2 border-xiscord-divider rounded-bl-lg mr-2 -mt-4 ml-2"></div>
              <div className="flex items-center bg-xiscord-darker hover:bg-xiscord-light px-2 py-1 rounded transition-colors">
                <MessageSquare size={16} className="text-xiscord-modifier mr-2" />
                <span className="font-bold text-xiscord-blurple text-sm mr-2">{thread.name}</span>
                <span className="text-xs text-xiscord-muted">{thread.messages.length} {thread.messages.length === 1 ? 'reply' : 'replies'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Hover Actions */}
        {!isEditing && (
          <div className="hidden group-hover:flex absolute right-4 top-[-10px] bg-xiscord-dark border border-xiscord-divider rounded shadow-sm z-10">
            <button
              className="p-1.5 hover:bg-xiscord-light rounded text-xiscord-muted hover:text-xiscord-lightest"
              onClick={() => addReaction(message.id, '👍')}
              title="Add Reaction"
            >
              <Smile size={18} />
            </button>
            <button
              className="p-1.5 hover:bg-xiscord-light rounded text-xiscord-muted hover:text-xiscord-lightest"
              onClick={() => onReply(message)}
              title="Reply"
            >
              <Reply size={18} />
            </button>
            <button
              className="p-1.5 hover:bg-xiscord-light rounded text-xiscord-muted hover:text-xiscord-lightest"
              onClick={handleCreateThread}
              title={thread ? "View Thread" : "Create Thread"}
            >
              <MessageSquare size={18} />
            </button>
            <div className="relative">
              <button
                className="p-1.5 hover:bg-xiscord-light rounded text-xiscord-muted hover:text-xiscord-lightest"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                title="More"
              >
                <MoreHorizontal size={18} />
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-xiscord-darker rounded-lg shadow-xl border border-xiscord-divider z-50 py-1.5" onMouseLeave={() => setShowMoreMenu(false)}>
                  {isOwn && (
                    <button
                      onClick={() => { setIsEditing(true); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white flex items-center"
                    >
                      <Pencil size={14} className="mr-2" /> Edit Message
                    </button>
                  )}
                  <button
                    onClick={() => { togglePinMessage(message.id); setShowMoreMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-sm text-xiscord-lightest hover:bg-xiscord-blurple hover:text-white flex items-center"
                  >
                    <Pin size={14} className="mr-2" /> {message.pinned ? 'Unpin' : 'Pin'} Message
                  </button>
                  {isOwn && (
                    <button
                      onClick={() => { setShowDeleteConfirm(true); setShowMoreMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-xiscord-red hover:bg-xiscord-red hover:text-white flex items-center"
                    >
                      <Trash2 size={14} className="mr-2" /> Delete Message
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowDeleteConfirm(false)}>
          <div className="w-[440px] bg-xiscord-dark rounded-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <h2 className="text-xl font-bold text-white mb-2">Delete Message</h2>
              <p className="text-xiscord-modifier mb-4">Are you sure you want to delete this message? This cannot be undone.</p>
              <div className="bg-xiscord-bg rounded p-3 mb-4">
                <div className="flex items-center mb-1">
                  <img src={user?.avatar} alt="" className="w-6 h-6 rounded-full mr-2" />
                  <span className="font-medium text-sm text-white mr-2">{user?.username}</span>
                  <span className="text-xs text-xiscord-muted">{format(new Date(message.timestamp), 'MM/dd/yyyy h:mm aa')}</span>
                </div>
                <p className="text-sm text-xiscord-lightest line-clamp-2">{message.content}</p>
              </div>
            </div>
            <div className="bg-xiscord-darker p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-white hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium bg-xiscord-red hover:bg-xiscord-red/80 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showThreadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <form onSubmit={handleConfirmThread} className="w-[420px] rounded-lg bg-xiscord-dark p-5 shadow-xl">
            <h3 className="mb-2 text-xl font-semibold text-white">Create thread</h3>
            <p className="mb-4 text-sm text-xiscord-muted">Start a local thread from this message.</p>
            <input
              autoFocus
              value={threadName}
              onChange={(e) => setThreadName(e.target.value)}
              className="mb-5 w-full rounded bg-xiscord-darker px-3 py-2 text-sm text-xiscord-lightest outline-none focus:ring-2 focus:ring-xiscord-blurple"
              placeholder="Thread name"
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowThreadDialog(false)} className="rounded px-4 py-2 text-sm font-medium text-xiscord-lightest hover:underline">Cancel</button>
              <button type="submit" className="rounded bg-xiscord-blurple px-4 py-2 text-sm font-medium text-white hover:bg-xiscord-blurple/80">Create</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default function ChatArea() {
  const { serverId, channelId } = useParams();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(false);
  const [topicValue, setTopicValue] = useState('');
  const searchTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const store = useStore();
  const channel = store.channels[channelId];
  const allMessages = store.messages;
  const messages = Object.values(allMessages)
    .filter(m => m.channelId === channelId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Search: find messages across all channels in this server
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim() || !serverId) return [];
    const server = store.servers[serverId];
    if (!server) return [];
    const query = searchQuery.toLowerCase();
    return Object.values(allMessages)
      .filter(m => {
        const ch = store.channels[m.channelId];
        return ch && ch.serverId === serverId && m.content.toLowerCase().includes(query);
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
  }, [searchQuery, allMessages, serverId]);

  const sendMessage = store.sendMessage;
  const toggleMemberSidebar = store.toggleMemberSidebar;
  const pinnedPanel = store.ui?.pinnedPanelOpen;
  const setPinnedPanel = store.setPinnedPanel;
  const updateChannelTopic = store.updateChannelTopic;

  // Server members for mention autocomplete
  const server = serverId ? store.servers[serverId] : null;
  const serverMembers = server ? server.members.map(id => store.users[id]).filter(Boolean) : [];
  const mentionCandidates = mentionQuery !== null
    ? serverMembers.filter(u => u.username.toLowerCase().includes(mentionQuery.toLowerCase()))
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, channelId]);

  // Close thread when channel changes
  useEffect(() => {
    setActiveThreadId(null);
    setReplyingTo(null);
    setMentionQuery(null);
  }, [channelId]);

  // Listen for Up-arrow edit-last-message event from global keyboard handler
  const [editingMessageId, setEditingMessageId] = useState(null);
  useEffect(() => {
    const handler = (e) => {
      setEditingMessageId(e.detail.messageId);
    };
    window.addEventListener('xiscord-edit-last-message', handler);
    return () => window.removeEventListener('xiscord-edit-last-message', handler);
  }, []);

  // Typing indicator: show mock "other user typing" after sending
  const triggerMockTyping = () => {
    const otherUsers = serverMembers.filter(u => u.id !== store.currentUser.id && u.status !== 'offline' && !u.isBot);
    if (otherUsers.length > 0) {
      const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      setTimeout(() => {
        setTypingUsers([randomUser.username]);
        setTimeout(() => setTypingUsers([]), 3000);
      }, 1500);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    // Check for @ mention trigger
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (user) => {
    const cursorPos = inputRef.current?.selectionStart || inputValue.length;
    const textBeforeCursor = inputValue.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    if (atMatch) {
      const beforeAt = textBeforeCursor.slice(0, atMatch.index);
      const afterCursor = inputValue.slice(cursorPos);
      setInputValue(`${beforeAt}@${user.username} ${afterCursor}`);
    }
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    // Handle mention autocomplete navigation
    if (mentionQuery !== null && mentionCandidates.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % mentionCandidates.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + mentionCandidates.length) % mentionCandidates.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionCandidates[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        // Extract mentioned usernames from the message
        const mentionMatches = inputValue.match(/@(\w+)/g) || [];
        const mentionedIds = mentionMatches
          .map(m => m.slice(1))
          .map(name => serverMembers.find(u => u.username === name))
          .filter(Boolean)
          .map(u => u.id);

        sendMessage(channelId, inputValue, {
          referencedMessageId: replyingTo?.id || null,
          mentions: mentionedIds
        });
        setInputValue('');
        setShowEmojiPicker(false);
        setReplyingTo(null);
        setMentionQuery(null);
        triggerMockTyping();
      }
    }
    if (e.key === 'Escape' && replyingTo) {
      setReplyingTo(null);
    }
  };

  const handleAttachmentUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    const sid = new URLSearchParams(window.location.search).get('sid') || sessionStorage.getItem('mock_sid');
    const formData = new FormData();
    files.forEach(file => formData.append('file', file));

    try {
      const response = await fetch(`/upload${sid ? `?sid=${encodeURIComponent(sid)}` : ''}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      const attachments = data.files.map(file => ({
        id: file.stored_name,
        filename: file.original_name,
        name: file.original_name,
        size: file.size,
        url: file.url,
        contentType: file.content_type,
      }));
      const label = attachments.map(file => file.name).join(', ');
      sendMessage(channelId, inputValue.trim() || `Uploaded ${label}`, {
        referencedMessageId: replyingTo?.id || null,
        attachments,
      });
      setInputValue('');
      setReplyingTo(null);
      triggerMockTyping();
    } catch (error) {
      setInputValue(prev => `${prev}${prev ? ' ' : ''}[Upload failed: ${error.message}]`);
    }
  };

  const insertFormat = (fmt) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = inputValue;

    let newText = '';
    let newCursorPos = 0;

    if (fmt === 'bold') {
      newText = text.substring(0, start) + '**' + text.substring(start, end) + '**' + text.substring(end);
      newCursorPos = end + 4;
    } else if (fmt === 'italic') {
      newText = text.substring(0, start) + '*' + text.substring(start, end) + '*' + text.substring(end);
      newCursorPos = end + 2;
    } else if (fmt === 'code') {
      newText = text.substring(0, start) + '`' + text.substring(start, end) + '`' + text.substring(end);
      newCursorPos = end + 2;
    }

    setInputValue(newText);
    input.focus();
    setTimeout(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const addEmoji = (emoji) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  // Get pinned messages for current channel
  const pinnedMessages = messages.filter(m => m.pinned);

  if (!channel) return <div className="flex-1 bg-xiscord-bg flex items-center justify-center text-xiscord-muted">Select a channel</div>;

  return (
    <div className="flex-1 flex min-w-0">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-xiscord-bg min-w-0 relative">
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between shadow-sm border-b border-xiscord-darker shrink-0">
          <div className="flex items-center min-w-0">
            <Hash size={24} className="text-xiscord-muted mr-2 shrink-0" />
            <h3 className="font-bold text-white mr-4 shrink-0">{channel.name}</h3>
            {editingTopic ? (
              <div className="flex items-center border-l border-xiscord-muted pl-4 hidden md:flex">
                <input
                  type="text"
                  value={topicValue}
                  onChange={(e) => setTopicValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateChannelTopic(channelId, topicValue);
                      setEditingTopic(false);
                    }
                    if (e.key === 'Escape') {
                      setEditingTopic(false);
                    }
                  }}
                  onBlur={() => {
                    updateChannelTopic(channelId, topicValue);
                    setEditingTopic(false);
                  }}
                  className="bg-xiscord-darker text-xiscord-lightest text-sm px-2 py-0.5 rounded outline-none border border-xiscord-blurple min-w-[200px]"
                  autoFocus
                  placeholder="Add a topic"
                />
              </div>
            ) : (
              <span
                className="text-xiscord-muted text-sm truncate hidden md:block border-l border-xiscord-muted pl-4 cursor-pointer hover:text-xiscord-lightest"
                onClick={() => { setTopicValue(channel.topic || ''); setEditingTopic(true); }}
              >
                {channel.topic || 'Click to add a topic'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4 text-xiscord-muted shrink-0">
            <Bell size={24} className="cursor-pointer hover:text-xiscord-lightest" />
            <Pin
              size={24}
              className={cn("cursor-pointer hover:text-xiscord-lightest", pinnedPanel && "text-white")}
              onClick={() => setPinnedPanel(!pinnedPanel)}
            />
            <Users
              size={24}
              className="cursor-pointer hover:text-xiscord-lightest"
              onClick={toggleMemberSidebar}
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) setSearchOpen(true);
                  else setSearchOpen(false);
                }}
                onFocus={() => { if (searchQuery.trim()) setSearchOpen(true); }}
                className="bg-xiscord-darker text-sm px-2 py-1 rounded transition-all w-36 focus:w-60 outline-none text-xiscord-lightest"
              />
              <Search size={16} className="absolute right-2 top-1.5" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-4">
          {messages.length === 0 ? (
            <div className="mt-auto px-4 mb-6">
              <div className="w-16 h-16 bg-xiscord-light rounded-full flex items-center justify-center mb-4">
                <Hash size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to #{channel.name}!</h1>
              <p className="text-xiscord-muted">This is the start of the #{channel.name} channel.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const user = store.users[msg.userId];
              const roleId = user?.roles?.[0];
              const roleColor = roleId ? store.roles[roleId]?.color : null;

              // Date divider: show if first message or different day from previous
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const showDateDivider = !prevMsg || !isSameDay(new Date(msg.timestamp), new Date(prevMsg.timestamp));

              return (
                <React.Fragment key={msg.id}>
                  {showDateDivider && <DateDivider date={msg.timestamp} />}
                  <Message
                    message={msg}
                    user={user}
                    roleColor={roleColor}
                    onUserClick={setSelectedUserId}
                    onOpenThread={setActiveThreadId}
                    onReply={handleReply}
                    triggerEdit={editingMessageId === msg.id}
                    onEditTriggered={() => setEditingMessageId(null)}
                  />
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-1 shrink-0 flex items-center text-xs text-xiscord-modifier">
            <div className="flex space-x-0.5 mr-2">
              <span className="w-1.5 h-1.5 bg-xiscord-lightest rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-xiscord-lightest rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
              <span className="w-1.5 h-1.5 bg-xiscord-lightest rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
            </div>
            <span className="font-medium text-white">{typingUsers.join(', ')}</span>
            <span className="ml-1">{typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}

        {/* Reply Bar */}
        {replyingTo && (
          <div className="px-4 pt-2 shrink-0">
            <div className="bg-xiscord-dark rounded-t-lg px-3 py-2 flex items-center justify-between text-sm">
              <div className="flex items-center text-xiscord-modifier min-w-0">
                <Reply size={14} className="mr-2 shrink-0" />
                <span className="mr-1 shrink-0">Replying to</span>
                <span className="font-medium text-xiscord-lightest mr-2 shrink-0">@{store.users[replyingTo.userId]?.username || 'Unknown'}</span>
                <span className="text-xiscord-muted truncate">{replyingTo.content.slice(0, 50)}{replyingTo.content.length > 50 ? '...' : ''}</span>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-xiscord-muted hover:text-white shrink-0 ml-2">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={cn("px-4 pb-6 shrink-0 relative", !replyingTo && "pt-2")}>
          {!replyingTo && (
            <div className="absolute top-[-30px] left-4 flex space-x-1 bg-xiscord-darker rounded-t-lg px-2 py-1 border border-b-0 border-xiscord-darker">
              <button onClick={() => insertFormat('bold')} className="p-1 hover:bg-xiscord-light rounded text-xiscord-muted hover:text-white" title="Bold">
                <Bold size={14} />
              </button>
              <button onClick={() => insertFormat('italic')} className="p-1 hover:bg-xiscord-light rounded text-xiscord-muted hover:text-white" title="Italic">
                <Italic size={14} />
              </button>
              <button onClick={() => insertFormat('code')} className="p-1 hover:bg-xiscord-light rounded text-xiscord-muted hover:text-white" title="Code">
                <Code size={14} />
              </button>
            </div>
          )}

          <div className={cn(
            "bg-xiscord-light rounded-lg px-4 py-2.5 flex items-center relative z-10",
            !replyingTo && "rounded-tl-none",
            replyingTo && "rounded-t-none"
          )}>
            <button
              className="text-xiscord-muted hover:text-xiscord-lightest mr-3"
              onClick={() => fileInputRef.current?.click()}
              title="Upload a file"
            >
              <PlusCircle size={24} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleAttachmentUpload}
            />
            <div className="flex-1 relative">
              {/* Mentions Autocomplete */}
              {mentionQuery !== null && mentionCandidates.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-xiscord-darker border border-xiscord-divider rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                  {mentionCandidates.map((user, idx) => (
                    <div
                      key={user.id}
                      onClick={() => insertMention(user)}
                      className={cn(
                        "flex items-center px-3 py-2 cursor-pointer",
                        idx === mentionIndex ? "bg-xiscord-blurple" : "hover:bg-xiscord-light"
                      )}
                    >
                      <img src={user.avatar} alt="" className="w-6 h-6 rounded-full mr-2" />
                      <span className="text-sm text-white font-medium">{user.username}</span>
                      <span className="text-xs text-xiscord-muted ml-1">#{user.discriminator}</span>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`Message #${channel.name}`}
                className="bg-transparent w-full outline-none text-xiscord-lightest placeholder-xiscord-muted/70"
              />
            </div>
            <div className="flex items-center space-x-3 text-xiscord-muted relative">
              <button onClick={() => setInputValue(prev => `${prev}${prev ? ' ' : ''}:gift:`)} className="hover:text-xiscord-lightest" title="Insert gift">
                <Gift size={24} />
              </button>
              <button onClick={() => setInputValue(prev => `${prev}${prev ? ' ' : ''}:sticker:`)} className="hover:text-xiscord-lightest" title="Insert sticker">
                <Sticker size={24} />
              </button>
              <div className="relative">
                <Smile
                  size={24}
                  className={cn("cursor-pointer hover:text-xiscord-lightest", showEmojiPicker && "text-xiscord-blurple")}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                />

                {showEmojiPicker && (
                  <div className="absolute bottom-10 right-0 w-64 bg-xiscord-dark border border-xiscord-darker rounded-lg shadow-xl p-2 z-50">
                    <div className="grid grid-cols-7 gap-1 h-48 overflow-y-auto custom-scrollbar">
                      {['😀','😂','😍','🔥','👍','👎','🎉','❤️','😎','🤔','😭','👀','✨','🚀','💯','💩','🤡','👻','💀','👽','🤖','🎃','🎄','🎁','🎈','💪','🙏','🤝','👋','😤','🥳','😱','🫡','💜','🧡','💚','💙','🖤','🤍','⭐','🏆','💎','🫠','😮','🤯','🥺','😈','👑','🎵','🎮'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => addEmoji(emoji)}
                          className="hover:bg-xiscord-light rounded p-1 text-xl flex items-center justify-center"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Modal */}
        {selectedUserId && (
          <UserProfileModal
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
          />
        )}
      </div>

      {/* Pinned Messages Panel */}
      {pinnedPanel && (
        <div className="w-[420px] bg-xiscord-dark border-l border-xiscord-darker flex flex-col shrink-0 h-full">
          <div className="h-12 px-4 flex items-center justify-between border-b border-xiscord-darker shrink-0">
            <h3 className="font-bold text-white">Pinned Messages</h3>
            <button onClick={() => setPinnedPanel(false)} className="p-1 hover:bg-xiscord-light rounded text-xiscord-muted hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {pinnedMessages.length === 0 ? (
              <div className="text-center mt-10">
                <Pin size={40} className="mx-auto text-xiscord-muted mb-4" />
                <p className="text-xiscord-muted text-sm">This channel doesn't have any pinned messages yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pinnedMessages.map(msg => {
                  const msgUser = store.users[msg.userId];
                  return (
                    <div key={msg.id} className="bg-xiscord-bg rounded-lg p-3 hover:bg-xiscord-hover transition-colors">
                      <div className="flex items-center mb-2">
                        <img src={msgUser?.avatar} alt="" className="w-6 h-6 rounded-full mr-2" />
                        <span className="font-medium text-sm text-white mr-2">{msgUser?.username}</span>
                        <span className="text-xs text-xiscord-muted">
                          {format(new Date(msg.timestamp), 'MM/dd/yyyy h:mm aa')}
                        </span>
                      </div>
                      <div className="text-sm text-xiscord-lightest">
                        <MarkdownText content={msg.content} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results Panel */}
      {searchOpen && searchQuery.trim() && (
        <div className="w-[420px] bg-xiscord-dark border-l border-xiscord-darker flex flex-col shrink-0 h-full">
          <div className="h-12 px-4 flex items-center justify-between border-b border-xiscord-darker shrink-0">
            <h3 className="font-bold text-white">Search Results</h3>
            <div className="flex items-center">
              <span className="text-xs text-xiscord-muted mr-3">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="p-1 hover:bg-xiscord-light rounded text-xiscord-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {searchResults.length === 0 ? (
              <div className="text-center mt-10">
                <Search size={40} className="mx-auto text-xiscord-muted mb-4" />
                <p className="text-xiscord-muted text-sm">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map(msg => {
                  const msgUser = store.users[msg.userId];
                  const msgChannel = store.channels[msg.channelId];
                  // Highlight search term
                  const highlightContent = (content) => {
                    const idx = content.toLowerCase().indexOf(searchQuery.toLowerCase());
                    if (idx === -1) return content;
                    return (
                      <>
                        {content.slice(0, idx)}
                        <mark className="bg-yellow-500/30 text-white rounded px-0.5">{content.slice(idx, idx + searchQuery.length)}</mark>
                        {content.slice(idx + searchQuery.length)}
                      </>
                    );
                  };
                  return (
                    <div
                      key={msg.id}
                      className="bg-xiscord-bg rounded-lg p-3 hover:bg-xiscord-hover transition-colors cursor-pointer"
                      onClick={() => {
                        navigate(`/channels/${serverId}/${msg.channelId}`);
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="flex items-center mb-1">
                        <Hash size={14} className="text-xiscord-muted mr-1" />
                        <span className="text-xs text-xiscord-muted">{msgChannel?.name}</span>
                      </div>
                      <div className="flex items-center mb-1">
                        <img src={msgUser?.avatar} alt="" className="w-5 h-5 rounded-full mr-2" />
                        <span className="font-medium text-sm text-white mr-2">{msgUser?.username}</span>
                        <span className="text-xs text-xiscord-muted">
                          {format(new Date(msg.timestamp), 'MM/dd/yyyy h:mm aa')}
                        </span>
                      </div>
                      <div className="text-sm text-xiscord-lightest line-clamp-3">
                        {highlightContent(msg.content)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thread Panel */}
      {activeThreadId && !searchOpen && (
        <ThreadPanel
          threadId={activeThreadId}
          onClose={() => setActiveThreadId(null)}
        />
      )}
    </div>
  );
}
