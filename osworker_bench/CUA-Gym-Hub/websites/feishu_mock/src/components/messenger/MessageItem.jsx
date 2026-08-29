import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import EmojiPicker from './EmojiPicker';

const COMMON_EMOJIS = ['👍', '🎉', '❤️', '😂', '🤔', '👏', '🔥', '✅', '😊', '🙏', '😅', '💪'];

function getFileIcon(filename) {
  if (!filename) return '📁';
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['doc', 'docx'].includes(ext)) return '📄';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '🗜️';
  if (['pdf'].includes(ext)) return '📑';
  if (['ppt', 'pptx'].includes(ext)) return '📊';
  return '📁';
}

export default function MessageItem({ message, showAvatar, conversation, highlighted, searchQuery, onQuoteReply }) {
  const { state, dispatch } = useApp();
  const [hovered, setHovered] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [forwardToast, setForwardToast] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [downloadToast, setDownloadToast] = useState(false);

  const { currentUser, users } = state;
  const sender = users.find(u => u.id === message.senderId);
  const isOwn = message.senderId === currentUser.id;
  const [cardToast, setCardToast] = useState(null);
  const [respondedAction, setRespondedAction] = useState(message.cardResponded || null);

  function formatTime(ts) {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function handleReaction(emoji) {
    dispatch({
      type: 'ADD_REACTION',
      payload: { conversationId: conversation.id, messageId: message.id, emoji, userId: currentUser.id }
    });
    setShowEmojiPicker(false);
  }

  function handleThreadClick() {
    dispatch({ type: 'SET_THREAD_PANEL', payload: message.id });
  }

  function handleDelete() {
    dispatch({ type: 'DELETE_MESSAGE', payload: { conversationId: conversation.id, messageId: message.id } });
    setShowMoreMenu(false);
  }

  function handleSaveEdit() {
    dispatch({ type: 'EDIT_MESSAGE', payload: { conversationId: conversation.id, messageId: message.id, content: editContent } });
    setEditMode(false);
  }

  function handlePin() {
    dispatch({ type: 'PIN_MESSAGE', payload: { conversationId: conversation.id, messageId: message.id, isPinned: true } });
    setShowMoreMenu(false);
  }

  function handleFavorite() {
    dispatch({
      type: 'ADD_FAVORITE',
      payload: { messageId: message.id, conversationId: conversation.id }
    });
    setShowMoreMenu(false);
  }

  function handleCardAction(actionLabel) {
    if (respondedAction) return;
    setRespondedAction(actionLabel);
    dispatch({
      type: 'CARD_ACTION_RESPOND',
      payload: {
        messageId: message.id,
        action: actionLabel,
        conversationId: message.conversationId,
        timestamp: new Date().toISOString(),
      },
    });
    const toastMap = { '接受': '已接受', '拒绝': '已拒绝', '查看任务': '查看任务中...' };
    const toastText = toastMap[actionLabel] || actionLabel;
    setCardToast(toastText);
    setTimeout(() => setCardToast(null), 2500);
  }

  function handleForward(targetConvId) {
    const targetConv = state.conversations.find(c => c.id === targetConvId);
    const forwardedMsg = {
      id: `msg_${Date.now()}`,
      conversationId: targetConvId,
      senderId: currentUser.id,
      content: `[转发] ${message.content}`,
      contentType: 'text',
      timestamp: Date.now(),
      isEdited: false,
      reactions: [],
      threadId: null,
      threadCount: 0,
      threadLastReply: null,
      replyTo: null,
      mentions: [],
      isRead: true,
      isPinned: false,
      attachments: [],
      card: null,
    };
    dispatch({ type: 'SEND_MESSAGE', payload: { message: forwardedMsg } });
    setShowForwardModal(false);
    setForwardToast(`已转发给 ${targetConv?.name || '对话'}`);
    setTimeout(() => setForwardToast(null), 2500);
  }

  // System message
  if (message.contentType === 'system') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 16px' }}>
        <span style={{
          fontSize: 12, color: '#8F959E', background: '#F5F6F7',
          borderRadius: 12, padding: '3px 10px',
        }}>{message.content}</span>
      </div>
    );
  }

  // Render message content
  function renderContent() {
    if (message.contentType === 'card' && message.card) {
      return (
        <div style={{
          borderLeft: `3px solid ${message.card.color || '#3370FF'}`,
          background: '#F7F8FA', borderRadius: '0 8px 8px 0', padding: '8px 12px',
          maxWidth: 320,
        }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1F2329', marginBottom: 6 }}>{message.card.title}</div>
          <div style={{ fontSize: 13, color: '#646A73', lineHeight: '20px', whiteSpace: 'pre-line' }}>{message.card.body}</div>
          {message.card.actions?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {message.card.actions.map(a => {
                const isResponded = respondedAction !== null;
                const isChosen = respondedAction === a.label;
                return (
                  <button
                    key={a.label}
                    onClick={() => handleCardAction(a.label)}
                    disabled={isResponded}
                    style={{
                      padding: '5px 12px', borderRadius: 6, fontSize: 12,
                      cursor: isResponded ? 'default' : 'pointer',
                      border: `1px solid ${isChosen ? '#34C724' : a.type === 'accept' ? '#3370FF' : '#DEE0E3'}`,
                      background: isChosen ? '#34C724' : a.type === 'accept' ? (isResponded ? '#8DB8FF' : '#3370FF') : (isResponded ? '#F5F6F7' : '#fff'),
                      color: isChosen ? '#fff' : a.type === 'accept' ? '#fff' : (isResponded ? '#B0B5BF' : '#646A73'),
                      opacity: isResponded && !isChosen ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}
                  >{a.label}{isChosen ? ' ✓' : ''}</button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (message.contentType === 'image') {
      const filename = message.filename || '图片';
      return (
        <>
          <div
            onClick={() => setShowImageModal(true)}
            style={{ cursor: 'pointer', display: 'inline-block' }}
          >
            {message.imageUrl ? (
              <img
                src={message.imageUrl}
                alt={filename}
                style={{ maxWidth: 300, maxHeight: 200, borderRadius: 8, display: 'block', border: '1px solid #DEE0E3' }}
              />
            ) : (
              <div style={{
                width: 240, height: 160, background: '#F0F1F2', borderRadius: 8,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, border: '1px solid #DEE0E3',
              }}>
                <span style={{ fontSize: 32 }}>🖼️</span>
                <span style={{ fontSize: 12, color: '#8F959E' }}>{filename}</span>
              </div>
            )}
          </div>
          {showImageModal && (
            <div
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onClick={() => setShowImageModal(false)}
            >
              <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                <button
                  onClick={() => setShowImageModal(false)}
                  style={{
                    position: 'absolute', top: -36, right: 0, border: 'none', background: 'transparent',
                    color: '#fff', fontSize: 24, cursor: 'pointer', lineHeight: 1,
                  }}
                >✕</button>
                {message.imageUrl ? (
                  <img src={message.imageUrl} alt={filename} style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 4 }} />
                ) : (
                  <div style={{
                    width: 500, height: 360, background: '#F0F1F2', borderRadius: 8,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: 64 }}>🖼️</span>
                    <span style={{ fontSize: 14, color: '#646A73' }}>{filename}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      );
    }

    if (message.contentType === 'file') {
      const filename = message.filename || '文件';
      const filesize = message.filesize || '';
      const icon = getFileIcon(filename);
      return (
        <>
          <div style={{
            background: '#fff', borderRadius: 4, border: '1px solid #DEE0E3',
            padding: 12, display: 'flex', flexDirection: 'row', alignItems: 'center',
            gap: 12, maxWidth: 300,
          }}>
            <span style={{ fontSize: 32, flexShrink: 0 }}>{icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2329', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{filename}</div>
              {filesize && <div style={{ fontSize: 12, color: '#8F959E', marginTop: 2 }}>{filesize}</div>}
            </div>
            <button
              onClick={() => { setDownloadToast(true); setTimeout(() => setDownloadToast(false), 2500); }}
              title="下载文件"
              style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 18, flexShrink: 0, color: '#646A73', padding: 4, borderRadius: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F0F1F2'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >📥</button>
          </div>
          {downloadToast && (
            <div style={{
              position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(31,35,41,0.88)', color: '#fff', borderRadius: 8,
              padding: '10px 20px', fontSize: 13, zIndex: 9999,
              pointerEvents: 'none', whiteSpace: 'nowrap',
            }}>
              文件下载中...
            </div>
          )}
        </>
      );
    }

    if (editMode) {
      return (
        <div>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            style={{
              width: '100%', minHeight: 60, padding: '6px 10px',
              border: '1px solid #3370FF', borderRadius: 6, fontSize: 14, resize: 'vertical',
              fontFamily: 'inherit',
            }}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); } if (e.key === 'Escape') setEditMode(false); }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button onClick={handleSaveEdit} style={{ padding: '4px 12px', background: '#3370FF', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>保存</button>
            <button onClick={() => setEditMode(false)} style={{ padding: '4px 12px', background: '#fff', color: '#646A73', border: '1px solid #DEE0E3', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>取消</button>
          </div>
        </div>
      );
    }

    // Parse @mentions and highlight
    const content = message.content || '';
    const parts = content.split(/(@\S+)/g);
    return (
      <span style={{ fontSize: 14, color: '#1F2329', lineHeight: '22px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {parts.map((part, i) => {
          if (part.startsWith('@')) {
            return <span key={i} style={{ color: '#3370FF', cursor: 'pointer' }}>{part}</span>;
          }
          if (searchQuery && part.toLowerCase().includes(searchQuery.toLowerCase())) {
            const idx = part.toLowerCase().indexOf(searchQuery.toLowerCase());
            return (
              <span key={i}>
                {part.slice(0, idx)}
                <mark style={{ background: '#FFF8C5', color: '#1F2329' }}>{part.slice(idx, idx + searchQuery.length)}</mark>
                {part.slice(idx + searchQuery.length)}
              </span>
            );
          }
          return part;
        })}
        {message.isEdited && <span style={{ fontSize: 11, color: '#8F959E', marginLeft: 6 }}>(已编辑)</span>}
      </span>
    );
  }

  const reactions = message.reactions || [];
  const hasThreads = message.threadCount > 0;

  return (
    <div
      style={{
        position: 'relative',
        padding: showAvatar ? '8px 16px 2px' : '2px 16px 2px',
        background: highlighted ? '#FFF8E5' : 'transparent',
        transition: 'background 0.1s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowEmojiPicker(false); setShowMoreMenu(false); }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        {/* Avatar area */}
        <div style={{ width: 36, flexShrink: 0 }}>
          {showAvatar ? (
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: sender?.avatarColor || '#8F959E',
              color: '#fff', fontWeight: 600, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {message.senderId === 'bot_feishu' ? '🤖' : message.senderId === 'bot_approval' ? '📋' : (sender?.initials || '?')}
            </div>
          ) : (
            <div style={{ height: '100%' }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Sender name + time */}
          {showAvatar && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#1F2329' }}>
                {message.senderId === 'bot_feishu' ? '飞书助手' : message.senderId === 'bot_approval' ? '审批通知' : (sender?.name || '未知用户')}
              </span>
              <span style={{ fontSize: 12, color: '#8F959E' }}>{formatTime(message.timestamp)}</span>
            </div>
          )}

          {/* Message content */}
          {renderContent()}

          {/* Reactions */}
          {reactions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {reactions.map(r => {
                const userReacted = r.userIds.includes(currentUser.id);
                return (
                  <button
                    key={r.emoji}
                    onClick={() => handleReaction(r.emoji)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      height: 24, borderRadius: 4, padding: '0 7px',
                      background: userReacted ? '#E1EAFF' : '#F0F1F2',
                      border: userReacted ? '1px solid #3370FF' : '1px solid transparent',
                      cursor: 'pointer', fontSize: 13,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{r.emoji}</span>
                    <span style={{ fontSize: 11, color: '#646A73' }}>{r.userIds.length}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Thread link */}
          {hasThreads && (
            <button
              onClick={handleThreadClick}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 12, color: '#3370FF', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              {message.threadCount} 条回复
              {message.threadLastReply && <span style={{ color: '#8F959E' }}>· 最后回复 {formatTimeAgo(message.threadLastReply)}</span>}
            </button>
          )}
        </div>
      </div>

      {/* Hover action bar */}
      {hovered && !editMode && (
        <div style={{
          position: 'absolute', top: 0, right: 16,
          background: '#fff', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          border: '1px solid #DEE0E3', display: 'flex', gap: 2, padding: '2px 4px', zIndex: 10,
        }}>
          <ActionBtn title="添加表情" onClick={() => setShowEmojiPicker(prev => !prev)}>😀</ActionBtn>
          <ActionBtn title="回复话题" onClick={handleThreadClick}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </ActionBtn>
          <ActionBtn title="引用回复" onClick={() => onQuoteReply && onQuoteReply(message, sender)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 00-4-4H4"/></svg>
          </ActionBtn>
          <ActionBtn title="更多" onClick={() => setShowMoreMenu(prev => !prev)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </ActionBtn>

          {/* Emoji picker inline */}
          {showEmojiPicker && (
            <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 20 }}>
              <EmojiPicker onSelect={handleReaction} onClose={() => setShowEmojiPicker(false)} />
            </div>
          )}

          {/* More menu */}
          {showMoreMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, zIndex: 20,
              background: '#fff', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #DEE0E3', minWidth: 140, padding: '4px 0',
            }}>
              {[
                ['转发', () => { setShowMoreMenu(false); setShowForwardModal(true); }],
                ['收藏', handleFavorite],
                ['置顶', handlePin],
                ['复制', () => { navigator.clipboard?.writeText(message.content); setShowMoreMenu(false); }],
                ...(isOwn ? [
                  ['编辑', () => { setEditMode(true); setShowMoreMenu(false); }],
                  ['删除', handleDelete],
                ] : []),
              ].map(([label, fn]) => (
                <button
                  key={label}
                  onClick={fn}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '7px 14px', border: 'none', background: 'transparent',
                    cursor: 'pointer', fontSize: 13,
                    color: label === '删除' ? '#F54A45' : '#1F2329',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F7'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Card action toast */}
      {cardToast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(31,35,41,0.88)', color: '#fff', borderRadius: 8,
          padding: '10px 20px', fontSize: 13, zIndex: 9999,
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          {cardToast}
        </div>
      )}

      {/* Forward toast */}
      {forwardToast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(31,35,41,0.88)', color: '#fff', borderRadius: 8,
          padding: '10px 20px', fontSize: 13, zIndex: 9999,
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          {forwardToast}
        </div>
      )}

      {/* Forward modal */}
      {showForwardModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowForwardModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 12, width: 360, maxHeight: 480,
              boxShadow: '0 16px 48px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{
              padding: '16px 20px 12px', borderBottom: '1px solid #DEE0E3',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: '#1F2329' }}>转发消息</span>
              <button
                onClick={() => setShowForwardModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8F959E', fontSize: 18, lineHeight: 1, padding: 0 }}
              >✕</button>
            </div>

            {/* Preview */}
            <div style={{
              margin: '12px 20px', padding: '10px 12px',
              background: '#F7F8FA', borderRadius: 8, borderLeft: '3px solid #3370FF',
              fontSize: 13, color: '#646A73', maxHeight: 60, overflow: 'hidden',
            }}>
              {message.content?.slice(0, 120)}{message.content?.length > 120 ? '…' : ''}
            </div>

            {/* Conversation list */}
            <div style={{ padding: '0 20px 4px', fontSize: 12, color: '#8F959E' }}>选择转发对象</div>
            <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 8 }}>
              {state.conversations
                .filter(c => c.id !== conversation.id)
                .map(c => {
                  const otherUser = c.type === 'direct'
                    ? users.find(u => u.id !== currentUser.id && (c.members || []).includes(u.id))
                    : null;
                  const displayName = c.type === 'direct' ? (otherUser?.name || c.name) : c.name;
                  const initials = c.type === 'direct' ? (otherUser?.initials || displayName?.[0]) : displayName?.[0];
                  const color = c.type === 'direct' ? (otherUser?.avatarColor || '#8F959E') : '#3370FF';
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleForward(c.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 20px', cursor: 'pointer',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F5F6F7'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: c.type === 'direct' ? '50%' : 8,
                        background: color, color: '#fff', fontWeight: 600, fontSize: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {c.type === 'group' ? '群' : initials}
                      </div>
                      <span style={{ fontSize: 14, color: '#1F2329' }}>{displayName}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ children, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4,
        color: '#646A73', fontSize: 14,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F0F1F2'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

function formatTimeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
