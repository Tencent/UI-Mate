
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatChatTime, shouldShowTime } from '../utils/helpers';
import { getSessionId, saveToStorage } from '../utils/storage';
import './ChatPage.css';

const ChatPage = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [showHongbaoDialog, setShowHongbaoDialog] = useState(false);
  const [hongbaoAmount, setHongbaoAmount] = useState('');
  const [hongbaoMessage, setHongbaoMessage] = useState('恭喜发财，大吉大利');
  const [openingHongbao, setOpeningHongbao] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const contacts = useStore(state => state.contacts);
  const conversations = useStore(state => state.conversations);
  const messages = useStore(state => state.messages);
  const user = useStore(state => state.user);
  const favorites = useStore(state => state.favorites);
  const sendMessage = useStore(state => state.sendMessage);
  const markAsRead = useStore(state => state.markAsRead);
  const saveDraft = useStore(state => state.saveDraft);
  const recallMessage = useStore(state => state.recallMessage);
  const initialize = useStore(state => state.initialize);

  // Ensure store is initialized (for direct URL navigation)
  useEffect(() => {
    if (!user) {
      initialize();
    }
  }, [user, initialize]);

  // Read custom chat background
  const chatBg = (() => {
    try {
      const sid = getSessionId();
      return localStorage.getItem(`wechat_chat_bg_${sid}_${contactId}`) || '';
    } catch { return ''; }
  })();

  const contact = (contacts || []).find(c => c.userId === contactId);
  const chatMessages = (messages || {})[contactId] || [];
  const conversation = (conversations || []).find(c => c.contactId === contactId);

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '👍', '👎', '👏', '🙏', '❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💞', '💓', '💗', '💖', '💘', '💝'];

  // Initialize input from draft
  useEffect(() => {
    if (conversation?.draft && inputText === '') {
      setInputText(conversation.draft);
    }
  }, [contactId]);

  useEffect(() => {
    if (user) markAsRead(contactId);
  }, [contactId, markAsRead, user]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    let interval;
    if (showVoiceCall || showVideoCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [showVoiceCall, showVideoCall]);

  // Save draft when navigating away
  useEffect(() => {
    return () => {
      const currentInput = document.querySelector('.message-input');
      if (currentInput && currentInput.value.trim()) {
        saveDraft(contactId, currentInput.value.trim());
      } else if (user) {
        saveDraft(contactId, '');
      }
    };
  }, [contactId]);

  if (!user || !contacts) {
    return <div className="chat-page">加载中...</div>;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(contactId, inputText.trim(), 'text');
      setInputText('');
      saveDraft(contactId, '');
      setShowEmojiPicker(false);
    }
  };

  const handleVoiceSend = () => {
    const duration = Math.floor(Math.random() * 6) + 2;
    sendMessage(contactId, '', 'voice', { duration });
    setIsRecording(false);
  };

  const handleEmojiClick = (emoji) => {
    setInputText(prev => prev + emoji);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        sendMessage(contactId, event.target.result, 'image');
      };
      reader.readAsDataURL(file);
      setShowMoreMenu(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSize = (file.size / (1024 * 1024)).toFixed(1);
      sendMessage(contactId, file.name, 'file', { fileName: file.name, fileSize: `${fileSize}MB` });
      setShowMoreMenu(false);
    }
  };

  const handleLocationSend = (location) => {
    sendMessage(contactId, location, 'location');
    setShowLocationPicker(false);
    setShowMoreMenu(false);
  };

  const handleTransferSend = () => {
    if (transferAmount && parseFloat(transferAmount) > 0) {
      sendMessage(contactId, `¥${parseFloat(transferAmount).toFixed(2)}`, 'transfer');
      setTransferAmount('');
      setShowTransferDialog(false);
      setShowMoreMenu(false);
    }
  };

  const handleHongbaoSend = () => {
    if (hongbaoAmount && parseFloat(hongbaoAmount) > 0) {
      sendMessage(contactId, hongbaoMessage || '恭喜发财，大吉大利', 'hongbao', {
        amount: parseFloat(hongbaoAmount).toFixed(2),
        greeting: hongbaoMessage || '恭喜发财，大吉大利',
        opened: false
      });
      setHongbaoAmount('');
      setHongbaoMessage('恭喜发财，大吉大利');
      setShowHongbaoDialog(false);
      setShowMoreMenu(false);
    }
  };

  const handleOpenHongbao = (msg) => {
    if (msg.opened) return;
    setOpeningHongbao(msg);
  };

  const confirmOpenHongbao = () => {
    if (!openingHongbao) return;
    // Mark as opened in store
    const state = useStore.getState();
    const msgs = state.messages[contactId] || [];
    const idx = msgs.findIndex(m => m.messageId === openingHongbao.messageId);
    if (idx >= 0) {
      const updatedMsgs = [...msgs];
      updatedMsgs[idx] = { ...updatedMsgs[idx], opened: true };
      useStore.setState({
        messages: { ...state.messages, [contactId]: updatedMsgs }
      });
    }
    setOpeningHongbao(null);
  };

  const handleEndCall = () => {
    sendMessage(contactId, `通话时长 ${formatCallDuration(callDuration)}`, 'text');
    setShowVoiceCall(false);
    setShowMoreMenu(false);
  };

  const handleEndVideoCall = () => {
    sendMessage(contactId, `视频通话时长 ${formatCallDuration(callDuration)}`, 'text');
    setShowVideoCall(false);
    setShowMoreMenu(false);
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      messageId: msg.messageId,
      isSelf: msg.isSelf,
      content: msg.content,
      type: msg.type,
      timestamp: msg.timestamp,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleContextAction = (action) => {
    if (!contextMenu) return;
    switch (action) {
      case 'copy':
        navigator.clipboard?.writeText(contextMenu.content).catch(() => {});
        break;
      case 'recall':
        recallMessage(contactId, contextMenu.messageId);
        break;
      case 'delete':
        // Remove from local messages
        const state = useStore.getState();
        const msgs = state.messages[contactId] || [];
        const filtered = msgs.filter(m => m.messageId !== contextMenu.messageId);
        useStore.setState({
          messages: { ...state.messages, [contactId]: filtered }
        });
        break;
    }
    setContextMenu(null);
  };

  const canRecall = (msg) => {
    if (!msg.isSelf) return false;
    const timeDiff = Date.now() - new Date(msg.timestamp).getTime();
    return timeDiff < 120000; // 2 minutes
  };

  const handleMoreAction = (action) => {
    switch(action) {
      case 'image':
        imageInputRef.current?.click();
        break;
      case 'file':
        fileInputRef.current?.click();
        break;
      case 'camera':
        imageInputRef.current?.click();
        break;
      case 'location':
        setShowMoreMenu(false);
        setShowLocationPicker(true);
        break;
      case 'transfer':
        setShowMoreMenu(false);
        setShowTransferDialog(true);
        break;
      case 'voicecall':
        setShowMoreMenu(false);
        setShowVoiceCall(true);
        break;
      case 'hongbao':
        setShowMoreMenu(false);
        setShowHongbaoDialog(true);
        break;
      case 'videocall':
        setShowMoreMenu(false);
        setShowVideoCall(true);
        break;
      case 'favorites': {
        // Favorite the last text message in the chat
        const state = useStore.getState();
        const chatMsgs = state.messages[contactId] || [];
        const lastMsg = [...chatMsgs].reverse().find(m => m.type === 'text' && !m.recalled);
        if (lastMsg) {
          const newFav = {
            favoriteId: Date.now().toString(),
            type: 'text',
            content: lastMsg.content,
            source: lastMsg.isSelf ? state.user.nickname : (contact ? contact.nickname : '联系人'),
            timestamp: new Date().toISOString()
          };
          const updatedState = { ...state, favorites: [...(state.favorites || []), newFav] };
          useStore.setState({ favorites: updatedState.favorites });
          saveToStorage(updatedState, state._sid);
        }
        setShowMoreMenu(false);
        break;
      }
      default:
        setShowMoreMenu(false);
    }
  };

  if (!contact) {
    return <div className="chat-not-found">联系人不存在</div>;
  }

  const renderMessage = (msg) => {
    if (msg.recalled) {
      return null; // Will be handled as system message
    }

    switch (msg.type) {
      case 'text':
        return <span>{msg.content}</span>;
      case 'image':
        return <img src={msg.content} alt="图片" className="message-image" />;
      case 'file':
        return (
          <div className="file-message">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <div className="file-name">{msg.fileName || msg.content}</div>
              {msg.fileSize && <div className="file-size">{msg.fileSize}</div>}
            </div>
          </div>
        );
      case 'voice':
        return (
          <div className={`voice-message ${msg.isSelf ? 'voice-self' : 'voice-other'}`}>
            <span className="voice-waves">{msg.isSelf ? ')))' : '((('}</span>
            <span className="voice-duration">{msg.duration || 3}"</span>
          </div>
        );
      case 'location':
        return (
          <div className="location-message">
            <div className="location-preview">
              <div className="location-map-placeholder">
                <span>📍</span>
              </div>
              <div className="location-text">{msg.content}</div>
            </div>
          </div>
        );
      case 'transfer':
        return (
          <div className="transfer-message">
            <div className="transfer-header-bar">
              <span className="transfer-amount-text">{msg.content}</span>
            </div>
            <div className="transfer-footer-bar">微信转账</div>
          </div>
        );
      case 'hongbao':
        return (
          <div
            className={`hongbao-message ${msg.opened ? 'opened' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleOpenHongbao(msg); }}
          >
            <div className="hongbao-icon-wrapper">🧧</div>
            <div className="hongbao-info">
              <div className="hongbao-greeting">{msg.greeting || msg.content || '恭喜发财，大吉大利'}</div>
              {msg.opened && <div className="hongbao-status">已领取</div>}
            </div>
            <div className="hongbao-label">微信红包</div>
          </div>
        );
      default:
        return <span>{msg.content}</span>;
    }
  };

  return (
    <div className="chat-page" onClick={() => setContextMenu(null)} data-testid="chat-page">
      <div className="chat-header" data-testid="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <div className="header-info" onClick={() => navigate(`/user/${contactId}`)}>
          <span className="header-name" data-testid="header-name">{contact.nickname}</span>
        </div>
        <button className="more-btn" onClick={() => navigate(`/chat-settings/${contactId}`)}>⋯</button>
      </div>

      <div
        className="messages-container"
        style={chatBg ? {
          background: chatBg.startsWith('url(')
            ? `${chatBg} center/cover no-repeat fixed`
            : chatBg
        } : undefined}
      >
        {chatMessages.map((msg, index) => {
          const showTime = shouldShowTime(msg, chatMessages[index - 1]);
          const sender = msg.isSelf ? user : contact;

          // System message for recalled
          if (msg.recalled) {
            return (
              <div key={msg.messageId}>
                {showTime && (
                  <div className="message-time">{formatChatTime(msg.timestamp)}</div>
                )}
                <div className="system-message">
                  {msg.isSelf ? '你撤回了一条消息' : `${contact.nickname}撤回了一条消息`}
                </div>
              </div>
            );
          }

          // System messages
          if (msg.type === 'system') {
            return (
              <div key={msg.messageId}>
                <div className="system-message">{msg.content}</div>
              </div>
            );
          }

          return (
            <div key={msg.messageId} data-testid={`message-${msg.messageId}`} data-msg-type={msg.type}>
              {showTime && (
                <div className="message-time">{formatChatTime(msg.timestamp)}</div>
              )}
              <div className={`message ${msg.isSelf ? 'self' : 'other'}`}>
                <img src={sender.avatar} alt={sender.nickname} className="message-avatar" />
                <div
                  className={`message-bubble ${msg.type === 'hongbao' ? 'hongbao-bubble' : ''} ${msg.type === 'transfer' ? 'transfer-bubble' : ''} ${msg.type === 'voice' ? 'voice-bubble' : ''}`}
                  onContextMenu={(e) => handleContextMenu(e, msg)}
                  onClick={(e) => handleContextMenu(e, msg)}
                >
                  {renderMessage(msg)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div className="context-menu-overlay" onClick={() => setContextMenu(null)}>
          <div
            className="context-menu"
            style={{
              left: Math.min(contextMenu.x, 300),
              top: Math.max(contextMenu.y - 50, 60)
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => handleContextAction('copy')}>复制</button>
            <button onClick={() => handleContextAction('delete')}>删除</button>
            {contextMenu.isSelf && canRecall({ isSelf: true, timestamp: contextMenu.timestamp }) && (
              <button onClick={() => handleContextAction('recall')}>撤回</button>
            )}
          </div>
        </div>
      )}

      <div className="chat-input-area" data-testid="chat-input-area">
        <button
          className="input-btn voice-toggle-btn"
          onClick={() => setIsVoiceMode(!isVoiceMode)}
          data-testid="voice-toggle-btn"
        >
          {isVoiceMode ? '⌨️' : '🎙'}
        </button>
        {isVoiceMode ? (
          <button
            className="hold-to-talk-btn"
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={handleVoiceSend}
            onMouseLeave={() => setIsRecording(false)}
            onTouchStart={() => setIsRecording(true)}
            onTouchEnd={handleVoiceSend}
          >
            {isRecording ? '松开 发送' : '按住 说话'}
          </button>
        ) : (
          <input
            type="text"
            className="message-input"
            placeholder="发送消息"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        )}
        <button
          className="input-btn emoji-btn"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowMoreMenu(false);
          }}
          data-testid="emoji-btn"
        >
          😊
        </button>
        {inputText.trim() ? (
          <button className="send-btn" onClick={handleSend}>发送</button>
        ) : (
          <button
            className="input-btn more-btn-input"
            onClick={() => {
              setShowMoreMenu(!showMoreMenu);
              setShowEmojiPicker(false);
            }}
            data-testid="more-menu-btn"
          >
            +
          </button>
        )}
      </div>

      {isRecording && (
        <div className="recording-overlay">
          <div className="recording-indicator">
            <div className="recording-waves">
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
            </div>
            <span className="recording-text">松开 发送</span>
          </div>
        </div>
      )}

      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-grid">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                className="emoji-item"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {showMoreMenu && (
        <div className="more-menu">
          <div className="more-grid">
            <button className="more-item" onClick={() => handleMoreAction('image')}>
              <div className="more-icon-box">🖼️</div>
              <span>照片</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('camera')}>
              <div className="more-icon-box">📷</div>
              <span>拍摄</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('videocall')}>
              <div className="more-icon-box">📹</div>
              <span>视频通话</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('location')}>
              <div className="more-icon-box">📍</div>
              <span>位置</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('hongbao')}>
              <div className="more-icon-box">🧧</div>
              <span>红包</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('transfer')}>
              <div className="more-icon-box">💰</div>
              <span>转账</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('voicecall')}>
              <div className="more-icon-box">📞</div>
              <span>语音通话</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('favorites')}>
              <div className="more-icon-box">⭐</div>
              <span>收藏</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
      <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileSelect} />

      {/* Location Picker Dialog */}
      {showLocationPicker && (
        <div className="dialog-overlay" onClick={() => setShowLocationPicker(false)}>
          <div className="location-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>选择位置</h3>
              <button className="dialog-close-btn" onClick={() => setShowLocationPicker(false)}>✕</button>
            </div>
            <div className="location-list">
              {['北京市海淀区中关村', '北京市朝阳区国贸', '上海市浦东新区陆家嘴', '杭州市西湖区', '广州市天河区'].map((loc, idx) => (
                <div key={idx} className="location-item" onClick={() => handleLocationSend(loc)}>
                  <div className="location-icon-item">📍</div>
                  <span>{loc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Dialog */}
      {showTransferDialog && (
        <div className="dialog-overlay" onClick={() => setShowTransferDialog(false)}>
          <div className="transfer-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header"><h3>转账</h3><button className="dialog-close-btn" onClick={() => setShowTransferDialog(false)}>✕</button></div>
            <div className="transfer-content">
              <div className="transfer-input-section"><span className="currency-symbol">¥</span><input type="number" className="transfer-amount-input" placeholder="0.00" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} autoFocus /></div>
              <div className="transfer-receiver">转给: {contact.nickname}</div>
              <button className="transfer-confirm-btn" onClick={handleTransferSend} disabled={!transferAmount || parseFloat(transferAmount) <= 0}>确认转账</button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Call Screen */}
      {showVoiceCall && (
        <div className="voice-call-overlay">
          <div className="voice-call-screen">
            <div className="call-contact-info">
              <img src={contact.avatar} alt={contact.nickname} className="call-avatar" />
              <div className="call-name">{contact.nickname}</div>
              <div className="call-status">语音通话中...</div>
            </div>
            <div className="call-duration">{formatCallDuration(callDuration)}</div>
            <button className="end-call-btn" onClick={handleEndCall}>结束通话</button>
          </div>
        </div>
      )}

      {/* Video Call Screen */}
      {showVideoCall && (
        <div className="voice-call-overlay" style={{ backgroundColor: '#1a1a2e' }}>
          <div className="voice-call-screen">
            <div className="call-contact-info">
              <img src={contact.avatar} alt={contact.nickname} className="call-avatar" style={{ border: '3px solid #576b95' }} />
              <div className="call-name" style={{ color: '#fff' }}>{contact.nickname}</div>
              <div className="call-status" style={{ color: '#aaa' }}>视频通话中...</div>
            </div>
            <div className="call-duration" style={{ color: '#fff' }}>{formatCallDuration(callDuration)}</div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
              <button className="end-call-btn" style={{ backgroundColor: '#576b95' }} onClick={() => { setShowVideoCall(false); setShowMoreMenu(false); }}>关闭摄像头</button>
              <button className="end-call-btn" onClick={handleEndVideoCall}>结束通话</button>
            </div>
          </div>
        </div>
      )}

      {/* Hongbao Dialog */}
      {showHongbaoDialog && (
        <div className="dialog-overlay" onClick={() => setShowHongbaoDialog(false)}>
          <div className="hongbao-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="hongbao-dialog-header"><h3>发红包</h3><button className="dialog-close-btn" onClick={() => setShowHongbaoDialog(false)}>✕</button></div>
            <div className="hongbao-content">
              <div className="hongbao-amount-section"><span className="currency-symbol">¥</span><input type="number" className="hongbao-amount-input" placeholder="0.00" value={hongbaoAmount} onChange={(e) => setHongbaoAmount(e.target.value)} autoFocus /></div>
              <div className="hongbao-message-section"><input type="text" className="hongbao-message-input" placeholder="恭喜发财，大吉大利" value={hongbaoMessage} onChange={(e) => setHongbaoMessage(e.target.value)} maxLength={20} /></div>
              <button className="hongbao-confirm-btn" onClick={handleHongbaoSend} disabled={!hongbaoAmount || parseFloat(hongbaoAmount) <= 0}>塞钱进红包</button>
            </div>
          </div>
        </div>
      )}

      {/* Hongbao Open Overlay */}
      {openingHongbao && (
        <div className="hongbao-open-overlay" onClick={() => setOpeningHongbao(null)}>
          <div className="hongbao-open-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="hongbao-open-header">
              <img src={contact.avatar} alt="" className="hongbao-sender-avatar" />
              <div className="hongbao-sender-name">{openingHongbao.isSelf ? user.nickname : contact.nickname}的红包</div>
              <div className="hongbao-open-greeting">{openingHongbao.greeting || openingHongbao.content || '恭喜发财，大吉大利'}</div>
            </div>
            <button className="hongbao-open-btn" onClick={confirmOpenHongbao}>開</button>
            {openingHongbao.amount && (
              <div className="hongbao-open-amount">¥{openingHongbao.amount}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
