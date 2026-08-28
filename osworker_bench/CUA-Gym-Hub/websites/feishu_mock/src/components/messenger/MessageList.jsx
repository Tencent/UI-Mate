import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import EmojiPicker from './EmojiPicker';
import MessageItem from './MessageItem';

export default function MessageList({ conversation, searchQuery, onQuoteReply }) {
  const { state } = useApp();
  const bottomRef = useRef(null);
  const [highlightId, setHighlightId] = useState(null);

  const msgs = (state.messages[conversation.id] || []).filter(m => !m.threadId || m.threadId === null);
  // Only show top-level messages (not thread replies)
  const topLevel = msgs.filter(m => !m.threadId);

  useEffect(() => {
    if (!searchQuery) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [topLevel.length, conversation.id]);

  // Group messages for date dividers and same-sender collapsing
  function buildGroups(messages) {
    const groups = [];
    let lastDate = null;
    let lastSender = null;
    let lastTime = null;

    for (const m of messages) {
      const d = new Date(m.timestamp);
      const dateStr = getDateLabel(d);
      if (dateStr !== lastDate) {
        groups.push({ type: 'divider', label: dateStr });
        lastDate = dateStr;
        lastSender = null;
      }
      const sameGroup = lastSender === m.senderId && m.timestamp - lastTime < 120000;
      groups.push({ type: 'message', msg: m, showAvatar: !sameGroup || m.contentType === 'system' });
      lastSender = m.senderId;
      lastTime = m.timestamp;
    }
    return groups;
  }

  const filtered = searchQuery
    ? topLevel.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : topLevel;

  const groups = buildGroups(filtered);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0', background: '#fff' }}>
      {groups.map((item, i) => {
        if (item.type === 'divider') {
          return (
            <div key={`d-${i}`} style={{
              display: 'flex', alignItems: 'center', padding: '8px 16px', gap: 10
            }}>
              <div style={{ flex: 1, height: 1, background: '#DEE0E3' }} />
              <span style={{ fontSize: 12, color: '#8F959E', whiteSpace: 'nowrap' }}>{item.label}</span>
              <div style={{ flex: 1, height: 1, background: '#DEE0E3' }} />
            </div>
          );
        }
        return (
          <MessageItem
            key={item.msg.id}
            message={item.msg}
            showAvatar={item.showAvatar}
            conversation={conversation}
            highlighted={item.msg.id === highlightId}
            searchQuery={searchQuery}
            onQuoteReply={onQuoteReply}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

function getDateLabel(d) {
  const today = new Date();
  const yesterday = new Date(today - 86400000);
  if (d.toDateString() === today.toDateString()) return '今天';
  if (d.toDateString() === yesterday.toDateString()) return '昨天';
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
