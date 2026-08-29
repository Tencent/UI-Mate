
import React from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import Message from './Message';
import './MessageList.css';

function getDateLabel(dateStr) {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMMM do');
}

function getDateKey(dateStr) {
  const date = parseISO(dateStr);
  return format(date, 'yyyy-MM-dd');
}

function MessageList({ messages, channelId, dmId }) {
  const { state } = useApp();

  // Group messages by date for date separators
  const messagesWithSeparators = [];
  let lastDateKey = null;

  for (const message of messages) {
    const dateKey = getDateKey(message.timestamp);
    if (dateKey !== lastDateKey) {
      messagesWithSeparators.push({
        type: 'date-separator',
        key: `sep-${dateKey}`,
        label: getDateLabel(message.timestamp)
      });
      lastDateKey = dateKey;
    }
    messagesWithSeparators.push({
      type: 'message',
      key: message.messageId,
      message
    });
  }

  return (
    <div className="message-list">
      {messagesWithSeparators.map(item => {
        if (item.type === 'date-separator') {
          return (
            <div key={item.key} className="date-separator">
              <div className="date-separator-line" />
              <span className="date-separator-text">{item.label}</span>
              <div className="date-separator-line" />
            </div>
          );
        }
        return (
          <Message
            key={item.key}
            message={item.message}
            channelId={channelId}
            dmId={dmId}
          />
        );
      })}
    </div>
  );
}

export default MessageList;
