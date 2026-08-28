import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Phone, Video, Send, ThumbsUp, Smile } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDistanceToNow } from 'date-fns';

const EMOJIS = ['😀','😂','❤️','👍','😍','🔥','😢','😮','🙏','🎉','😎','🥰'];

const ChatWindow = ({ convKey, onClose }) => {
  const { state, getUser, currentUser, sendMessage } = useApp();
  const [input, setInput] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef(null);

  const userId = convKey.replace('conv_', '');
  const partner = getUser(userId);
  const messages = (state.messages || {})[convKey] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!partner) return null;

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendMessage(convKey, input.trim(), currentUser.id);
    setInput('');
    setShowEmojis(false);
  };

  const handleThumbsUp = () => {
    sendMessage(convKey, '👍', currentUser.id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by sender for spacing
  return (
    <div className="w-[330px] bg-white rounded-t-xl shadow-xl border border-gray-200 flex flex-col h-[450px]">
      {/* Header */}
      <div className="p-2 border-b border-gray-200 flex items-center justify-between shadow-sm rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img src={partner.avatar} alt={partner.name} className="w-9 h-9 rounded-full object-cover" />
            {partner.online && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <span className="font-semibold text-[15px] block leading-tight">{partner.name}</span>
            <span className="text-xs text-gray-500">{partner.online ? 'Active now' : 'Offline'}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-primary">
          <button className="p-1.5 hover:bg-gray-100 rounded-full"><Phone size={17} /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-full"><Video size={17} /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-full"><Minus size={17} /></button>
          <button className="p-1.5 hover:bg-gray-100 rounded-full" onClick={() => onClose(convKey)}><X size={17} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-white">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <img src={partner.avatar} alt={partner.name} className="w-14 h-14 rounded-full object-cover mb-2" />
            <p className="font-semibold text-[15px] text-gray-700">{partner.name}</p>
            <p className="text-[13px] mt-1">Say hi to start a conversation</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === currentUser.id;
          const prevMsg = messages[i - 1];
          const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);
          return (
            <div key={msg.id} className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <div className="w-7 h-7 flex-shrink-0">
                  {showAvatar && (
                    <img src={partner.avatar} className="w-7 h-7 rounded-full object-cover" alt={partner.name} />
                  )}
                </div>
              )}
              <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-[15px] leading-snug ${
                isMe
                  ? 'bg-[#1877F2] text-white rounded-br-sm'
                  : 'bg-[#E4E6EB] text-black rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker */}
      {showEmojis && (
        <div className="border-t border-gray-100 p-2 grid grid-cols-6 gap-1 bg-white">
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => { setInput(prev => prev + e); setShowEmojis(false); }}
              className="text-xl p-1 hover:bg-gray-100 rounded-md"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-2 border-t border-gray-200 flex items-center gap-2">
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          className="p-1.5 text-primary hover:bg-gray-100 rounded-full flex-shrink-0"
        >
          <Smile size={20} />
        </button>
        <div className="flex-1 bg-gray-100 rounded-full px-3 py-2">
          <input
            type="text"
            placeholder="Aa"
            className="w-full bg-transparent outline-none text-[15px]"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        {input.trim() ? (
          <button onClick={handleSend} className="flex-shrink-0 text-primary hover:text-blue-600">
            <Send size={20} />
          </button>
        ) : (
          <button onClick={handleThumbsUp} className="flex-shrink-0 text-primary hover:text-blue-600">
            <ThumbsUp size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
