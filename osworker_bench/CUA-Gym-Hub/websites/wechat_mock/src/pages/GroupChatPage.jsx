import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatChatTime, shouldShowTime } from '../utils/helpers';
import { saveToStorage } from '../utils/storage';
import './GroupChatPage.css';

const GroupChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showHongbaoDialog, setShowHongbaoDialog] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [hongbaoAmount, setHongbaoAmount] = useState('');
  const [hongbaoMessage, setHongbaoMessage] = useState('恭喜发财，大吉大利');
  const [contextMenu, setContextMenu] = useState(null);
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const groups = useStore(state => state.groups);
  const contacts = useStore(state => state.contacts);
  const messages = useStore(state => state.messages);
  const conversations = useStore(state => state.conversations);
  const user = useStore(state => state.user);
  const sendGroupMessage = useStore(state => state.sendGroupMessage);
  const markAsRead = useStore(state => state.markAsRead);
  const saveDraft = useStore(state => state.saveDraft);
  const recallMessage = useStore(state => state.recallMessage);

  if (!user || !groups) {
    return <div className="group-chat-page">加载中...</div>;
  }

  const group = groups.find(g => g.groupId === groupId);
  const chatMessages = messages[groupId] || [];
  const conversation = conversations.find(c => c.contactId === groupId);

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '👍', '👎', '👏', '🙏', '❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💞', '💓', '💗', '💖', '💘', '💝'];

  // Load draft on mount
  useEffect(() => {
    if (conversation?.draft && inputText === '') {
      setInputText(conversation.draft);
    }
  }, [groupId]);

  useEffect(() => {
    markAsRead(groupId);
  }, [groupId, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Call timer
  useEffect(() => {
    let interval;
    if (showVoiceCall || showVideoCall) {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [showVoiceCall, showVideoCall]);

  // Save draft on unmount
  useEffect(() => {
    return () => {
      const currentInput = document.querySelector('.group-chat-page .message-input');
      if (currentInput && currentInput.value.trim()) {
        saveDraft(groupId, currentInput.value.trim());
      } else if (user) {
        saveDraft(groupId, '');
      }
    };
  }, [groupId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getUserInfo = (userId) => {
    if (userId === user.userId) return user;
    return contacts.find(c => c.userId === userId) || { nickname: '未知用户', avatar: '' };
  };

  const handleSend = () => {
    if (inputText.trim()) {
      sendGroupMessage(groupId, inputText.trim(), 'text');
      setInputText('');
      saveDraft(groupId, '');
      setShowEmojiPicker(false);
    }
  };

  const handleVoiceSend = () => {
    const duration = Math.floor(Math.random() * 6) + 2;
    sendGroupMessage(groupId, '', 'voice', { duration });
    setIsRecording(false);
  };

  const handleEmojiClick = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        sendGroupMessage(groupId, event.target.result, 'image');
      };
      reader.readAsDataURL(file);
      setShowMoreMenu(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSize = (file.size / (1024 * 1024)).toFixed(1);
      sendGroupMessage(groupId, file.name, 'file', { fileName: file.name, fileSize: `${fileSize}MB` });
      setShowMoreMenu(false);
    }
  };

  const handleLocationSend = (location) => {
    sendGroupMessage(groupId, location, 'location');
    setShowLocationPicker(false);
    setShowMoreMenu(false);
  };

  const handleTransferSend = () => {
    if (transferAmount && parseFloat(transferAmount) > 0) {
      sendGroupMessage(groupId, `¥${parseFloat(transferAmount).toFixed(2)}`, 'transfer');
      setTransferAmount('');
      setShowTransferDialog(false);
      setShowMoreMenu(false);
    }
  };

  const handleHongbaoSend = () => {
    if (hongbaoAmount && parseFloat(hongbaoAmount) > 0) {
      sendGroupMessage(groupId, hongbaoMessage || '恭喜发财，大吉大利', 'hongbao', {
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

  const handleEndCall = () => {
    sendGroupMessage(groupId, `语音通话时长 ${formatCallDuration(callDuration)}`, 'text');
    setShowVoiceCall(false);
    setShowMoreMenu(false);
  };

  const handleEndVideoCall = () => {
    sendGroupMessage(groupId, `视频通话时长 ${formatCallDuration(callDuration)}`, 'text');
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
        recallMessage(groupId, contextMenu.messageId);
        break;
      case 'delete': {
        const state = useStore.getState();
        const msgs = state.messages[groupId] || [];
        const filtered = msgs.filter(m => m.messageId !== contextMenu.messageId);
        useStore.setState({ messages: { ...state.messages, [groupId]: filtered } });
        saveToStorage(useStore.getState(), state._sid);
        break;
      }
    }
    setContextMenu(null);
  };

  const canRecall = (msg) => {
    if (!msg.isSelf) return false;
    return Date.now() - new Date(msg.timestamp).getTime() < 120000;
  };

  const handleMoreAction = (action) => {
    switch (action) {
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
      case 'hongbao':
        setShowMoreMenu(false);
        setShowHongbaoDialog(true);
        break;
      case 'voicecall':
        setShowMoreMenu(false);
        setShowVoiceCall(true);
        break;
      case 'videocall':
        setShowMoreMenu(false);
        setShowVideoCall(true);
        break;
      default:
        setShowMoreMenu(false);
    }
  };

  if (!group) {
    return <div>群聊不存在</div>;
  }

  const renderGroupMessage = (msg) => {
    if (msg.recalled) return null;
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
              <div className="location-map-placeholder"><span>📍</span></div>
              <div className="location-text">{msg.content}</div>
            </div>
          </div>
        );
      case 'transfer':
        return (
          <div className="transfer-message">
            <div className="transfer-header-bar"><span className="transfer-amount-text">{msg.content}</span></div>
            <div className="transfer-footer-bar">微信转账</div>
          </div>
        );
      case 'hongbao':
        return (
          <div className={`hongbao-message ${msg.opened ? 'opened' : ''}`}>
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
    <div className="group-chat-page" onClick={() => setContextMenu(null)}>
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <div className="header-info" onClick={() => navigate(`/group-info/${groupId}`)}>
          <span className="group-name">{group.name}</span>
          <span className="group-member-count">({group.members.length})</span>
        </div>
        <button className="more-btn" onClick={() => navigate(`/group-info/${groupId}`)}>⋯</button>
      </div>

      <div className="messages-container">
        {chatMessages.map((msg, index) => {
          const showTime = shouldShowTime(msg, chatMessages[index - 1]);
          const sender = getUserInfo(msg.senderId);

          if (msg.recalled) {
            return (
              <div key={msg.messageId}>
                {showTime && <div className="message-time">{formatChatTime(msg.timestamp)}</div>}
                <div className="system-message">
                  {msg.isSelf ? '你撤回了一条消息' : `${sender.nickname}撤回了一条消息`}
                </div>
              </div>
            );
          }

          if (msg.type === 'system') {
            return (
              <div key={msg.messageId}>
                <div className="system-message">{msg.content}</div>
              </div>
            );
          }

          return (
            <div key={msg.messageId}>
              {showTime && <div className="message-time">{formatChatTime(msg.timestamp)}</div>}
              <div className={`message ${msg.isSelf ? 'self' : 'other'}`}>
                <img src={sender.avatar} alt={sender.nickname} className="message-avatar" />
                <div className="message-content-wrapper">
                  {!msg.isSelf && <div className="sender-name">{sender.nickname}</div>}
                  <div
                    className={`message-bubble ${msg.type === 'hongbao' ? 'hongbao-bubble' : ''} ${msg.type === 'transfer' ? 'transfer-bubble' : ''} ${msg.type === 'voice' ? 'voice-bubble' : ''}`}
                    onContextMenu={(e) => handleContextMenu(e, msg)}
                    onClick={(e) => handleContextMenu(e, msg)}
                  >
                    {renderGroupMessage(msg)}
                  </div>
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
            style={{ left: Math.min(contextMenu.x, 300), top: Math.max(contextMenu.y - 50, 60) }}
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

      <div className="chat-input-area">
        <button
          className="input-btn voice-toggle-btn"
          onClick={() => setIsVoiceMode(!isVoiceMode)}
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
              <button key={index} className="emoji-item" onClick={() => handleEmojiClick(emoji)}>
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
              <div className="more-icon">🖼️</div>
              <span>图片</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('camera')}>
              <div className="more-icon">📷</div>
              <span>拍摄</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('file')}>
              <div className="more-icon">📁</div>
              <span>文件</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('location')}>
              <div className="more-icon">📍</div>
              <span>位置</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('transfer')}>
              <div className="more-icon">💰</div>
              <span>转账</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('hongbao')}>
              <div className="more-icon">🧧</div>
              <span>红包</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('voicecall')}>
              <div className="more-icon">📞</div>
              <span>语音通话</span>
            </button>
            <button className="more-item" onClick={() => handleMoreAction('videocall')}>
              <div className="more-icon">📹</div>
              <span>视频通话</span>
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
              {['中国广东省深圳市南山区', '中国北京市朝阳区', '中国上海市浦东新区', '中国浙江省杭州市西湖区', '中国广东省广州市天河区'].map((loc, idx) => (
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
            <div className="dialog-header">
              <h3>转账</h3>
              <button className="dialog-close-btn" onClick={() => setShowTransferDialog(false)}>✕</button>
            </div>
            <div className="transfer-content">
              <div className="transfer-input-section">
                <span className="currency-symbol">¥</span>
                <input type="number" className="transfer-amount-input" placeholder="0.00" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} autoFocus />
              </div>
              <div className="transfer-receiver">转入群聊: {group.name}</div>
              <button className="transfer-confirm-btn" onClick={handleTransferSend} disabled={!transferAmount || parseFloat(transferAmount) <= 0}>确认转账</button>
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

      {/* Voice Call Screen */}
      {showVoiceCall && (
        <div className="voice-call-overlay">
          <div className="voice-call-screen">
            <div className="call-contact-info">
              <div className="call-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>👥</div>
              <div className="call-name">{group.name}</div>
              <div className="call-status">群语音通话中...</div>
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
              <div className="call-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '3px solid #576b95', borderRadius: '50%', width: '80px', height: '80px' }}>👥</div>
              <div className="call-name" style={{ color: '#fff' }}>{group.name}</div>
              <div className="call-status" style={{ color: '#aaa' }}>群视频通话中...</div>
            </div>
            <div className="call-duration" style={{ color: '#fff' }}>{formatCallDuration(callDuration)}</div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
              <button className="end-call-btn" style={{ backgroundColor: '#576b95' }} onClick={() => { setShowVideoCall(false); }}>关闭摄像头</button>
              <button className="end-call-btn" onClick={handleEndVideoCall}>结束通话</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChatPage;
