import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './ChatView.css'

// Group detail sidebar component
function GroupDetailSidebar({ conversation, users, onClose, dispatch, navigate }) {
  const members = users.filter(u => conversation.memberIds.includes(u.id))
  const [editingName, setEditingName] = useState(false)
  const [groupName, setGroupName] = useState(conversation.name)
  const [announcement, setAnnouncement] = useState(conversation.announcement || '')
  const [editingAnnouncement, setEditingAnnouncement] = useState(false)

  const handleNameBlur = () => {
    const trimmed = groupName.trim()
    if (trimmed && trimmed !== conversation.name) {
      dispatch({ type: 'UPDATE_GROUP_NAME', id: conversation.id, name: trimmed })
    } else {
      setGroupName(conversation.name)
    }
    setEditingName(false)
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); e.target.blur() }
    if (e.key === 'Escape') { setGroupName(conversation.name); setEditingName(false) }
  }

  const handleAnnouncementBlur = () => {
    if (announcement !== (conversation.announcement || '')) {
      dispatch({ type: 'UPDATE_GROUP_ANNOUNCEMENT', id: conversation.id, announcement })
    }
    setEditingAnnouncement(false)
  }

  const handleLeaveGroup = () => {
    dispatch({ type: 'DELETE_CONVERSATION', id: conversation.id })
    onClose()
    if (navigate) navigate('/messages')
  }

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, width: 280, height: '100%',
      background: 'white', borderLeft: '1px solid var(--border)', zIndex: 50,
      boxShadow: '-4px 0 16px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column',
      animation: 'slideInRight 0.2s ease'
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>聊天设置</span>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#8F959E' }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {conversation.isGroup ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>群名称</span>
                {!editingName && (
                  <button
                    onClick={() => setEditingName(true)}
                    style={{ border: 'none', background: 'none', fontSize: 12, color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                  >编辑</button>
                )}
              </div>
              {editingName ? (
                <input
                  autoFocus
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  style={{
                    width: '100%', fontSize: 14, fontWeight: 600, border: '1px solid var(--primary)',
                    borderRadius: 4, padding: '4px 8px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              ) : (
                <div
                  onClick={() => setEditingName(true)}
                  style={{ fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '2px 0' }}
                  title="点击编辑群名称"
                >{conversation.name}</div>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>群成员 ({members.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {members.map(u => (
                  <div key={u.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 48 }}>
                    <div className="avatar-circle avatar-sm" style={{ background: u.avatar }}>{u.name.charAt(0)}</div>
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{u.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>群公告</span>
                {!editingAnnouncement && (
                  <button
                    onClick={() => setEditingAnnouncement(true)}
                    style={{ border: 'none', background: 'none', fontSize: 12, color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                  >编辑</button>
                )}
              </div>
              {editingAnnouncement ? (
                <div>
                  <textarea
                    autoFocus
                    value={announcement}
                    onChange={e => setAnnouncement(e.target.value)}
                    onBlur={handleAnnouncementBlur}
                    rows={4}
                    style={{
                      width: '100%', fontSize: 12, border: '1px solid var(--primary)',
                      borderRadius: 4, padding: '6px 8px', outline: 'none', resize: 'vertical',
                      boxSizing: 'border-box', fontFamily: 'inherit'
                    }}
                  />
                  <button
                    onMouseDown={(e) => { e.preventDefault(); handleAnnouncementBlur() }}
                    style={{
                      marginTop: 4, padding: '4px 12px', fontSize: 12, borderRadius: 4,
                      border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer'
                    }}
                  >保存</button>
                </div>
              ) : (
                <div
                  onClick={() => setEditingAnnouncement(true)}
                  style={{
                    fontSize: 12, color: announcement ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer', background: '#f7f8fa', borderRadius: 4, padding: '6px 8px',
                    minHeight: 32, lineHeight: '1.5'
                  }}
                >
                  {announcement || '暂无群公告，点击添加'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {(() => {
              const other = users.find(u => conversation.memberIds.includes(u.id) && !u.isCurrentUser)
              return other ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div className="avatar-circle" style={{ width: 56, height: 56, fontSize: 20, background: other.avatar, margin: '0 auto 8px' }}>{other.name.charAt(0)}</div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{other.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{other.title}</div>
                  </div>
                  <div style={{ background: '#f7f8fa', borderRadius: 6, padding: '10px 12px', fontSize: 12 }}>
                    <div style={{ marginBottom: 6 }}><span style={{ color: 'var(--text-secondary)' }}>手机: </span>{other.phone}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>邮箱: </span>{other.email}</div>
                  </div>
                </>
              ) : null
            })()}
          </div>
        )}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13 }}>消息免打扰</span>
            <button
              onClick={() => dispatch({ type: 'MUTE_CONVERSATION', id: conversation.id })}
              style={{
                width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: conversation.isMuted ? 'var(--primary)' : '#ccc',
                position: 'relative', transition: 'background 0.2s'
              }}
            >
              <span style={{
                position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
                left: conversation.isMuted ? 18 : 2
              }} />
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>置顶聊天</span>
            <button
              onClick={() => dispatch({ type: 'PIN_CONVERSATION', id: conversation.id })}
              style={{
                width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: conversation.isPinned ? 'var(--primary)' : '#ccc',
                position: 'relative', transition: 'background 0.2s'
              }}
            >
              <span style={{
                position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
                left: conversation.isPinned ? 18 : 2
              }} />
            </button>
          </div>
        </div>
      </div>
      {conversation.isGroup && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLeaveGroup}
            style={{
              width: '100%', padding: '9px 0', borderRadius: 6, border: '1px solid #ff4d4f',
              background: 'white', color: '#ff4d4f', fontSize: 14, cursor: 'pointer',
              fontWeight: 500, transition: 'background 0.15s, color 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ff4d4f'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#ff4d4f' }}
          >退出群聊</button>
        </div>
      )}
    </div>
  )
}

const EMOJI_CATEGORIES = [
  {
    key: 'common', label: '常用', icon: '😊',
    emojis: ['😊','😂','🤣','❤️','😍','🙏','😭','😘','👍','😎','🎉','🔥','✨','💕','😅','🤔','💪','😁','🥰','😢','🤗','😏','😉','🎊','💯','🤩','😜','🥳','💖','🙌','😀','😃','😄','😆','😋','😌','🥲','😤','😮','🤐']
  },
  {
    key: 'animals', label: '动物', icon: '🐱',
    emojis: ['🐱','🐶','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🦆','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🦂','🐢','🐍']
  },
  {
    key: 'food', label: '食物', icon: '🍔',
    emojis: ['🍔','🍟','🍕','🌭','🥪','🌮','🌯','🥗','🥘','🍲','🍜','🍝','🍛','🍣','🍱','🍤','🦪','🥟','🦞','🦐','🥫','🧆','🥙','🥚','🍳','🥞','🧇','🥓','🥩','🍗','🍖','🌽','🫑','🍅','🫒','🧅','🥑','🍆','🥦','🥬']
  },
  {
    key: 'activity', label: '活动', icon: '⚽',
    emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🎱','🏓','🏸','🥊','🥋','🎽','🛹','🛷','🎿','⛷','🏂','🪂','🏋','🤼','🤸','🤺','🤾','🏌','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅']
  },
  {
    key: 'travel', label: '旅行', icon: '✈️',
    emojis: ['✈️','🚀','🛸','🚁','🛶','⛵','🚤','🛥','🛳','⛴','🚢','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🚚','🚛','🚜','🛴']
  },
]

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = (now - d) / 86400000
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekDays = ['日','一','二','三','四','五','六']
  const weekDay = weekDays[d.getDay()]
  if (diff < 1 && d.getDate() === now.getDate()) return `今天`
  if (diff < 2) return `昨天`
  return `${month}月${day}日 星期${weekDay}`
}

function shouldShowDate(msgs, idx) {
  if (idx === 0) return true
  const prev = new Date(msgs[idx - 1].timestamp)
  const curr = new Date(msgs[idx].timestamp)
  return curr - prev > 5 * 60 * 1000 // 5min gap
}

export default function ChatView({ conversation }) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [inputText, setInputText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [emojiCategory, setEmojiCategory] = useState('common')
  const [contextMenu, setContextMenu] = useState(null)
  const [showReadReceipt, setShowReadReceipt] = useState(null)
  const [showDetailSidebar, setShowDetailSidebar] = useState(false)
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [showForwardModal, setShowForwardModal] = useState(null)
  const [toast, setToast] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const autoReplyTimer = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const messages = state.messages
    .filter(m => m.conversationId === conversation.id)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const getUser = (id) => state.users.find(u => u.id === id)

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) return
    dispatch({ type: 'SEND_MESSAGE', conversationId: conversation.id, text, replyTo: replyTo?.id })
    setInputText('')
    setReplyTo(null)
    setShowEmoji(false)

    // Auto-reply for conversations with other members
    const others = conversation.memberIds.filter(id => id !== state.currentUser.id)
    if (others.length > 0) {
      clearTimeout(autoReplyTimer.current)
      const delay = 1000 + Math.random() * 1500
      const responderId = others[Math.floor(Math.random() * others.length)]
      autoReplyTimer.current = setTimeout(() => {
        dispatch({ type: 'ADD_AUTO_REPLY', conversationId: conversation.id, senderId: responderId })
      }, delay)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiClick = (emoji) => {
    const ta = inputRef.current
    if (ta) {
      const start = ta.selectionStart
      const end = ta.selectionEnd
      setInputText(prev => prev.slice(0, start) + emoji + prev.slice(end))
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + emoji.length
        ta.focus()
      }, 0)
    } else {
      setInputText(prev => prev + emoji)
    }
    setShowEmoji(false)
  }

  const handleMsgContextMenu = (e, msg) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, msg })
  }

  const closeContextMenu = () => setContextMenu(null)

  const handleReply = (msg) => {
    setReplyTo(msg)
    inputRef.current?.focus()
    closeContextMenu()
  }

  const handleCopy = (msg) => {
    navigator.clipboard?.writeText(msg.content).catch(() => {})
    closeContextMenu()
  }

  const handleRecall = (msg) => {
    dispatch({ type: 'RECALL_MESSAGE', id: msg.id })
    closeContextMenu()
  }

  const handleDelete = (msg) => {
    dispatch({ type: 'DELETE_MESSAGE', id: msg.id })
    closeContextMenu()
  }

  const handleForward = (msg) => {
    setShowForwardModal(msg)
    closeContextMenu()
  }

  const canRecall = (msg) => {
    if (msg.senderId !== state.currentUser.id) return false
    const diff = (new Date() - new Date(msg.timestamp)) / 60000
    return diff < 2
  }

  const handleMentionSelect = (member) => {
    const ta = inputRef.current
    const mention = `@${member.name} `
    if (ta) {
      const start = ta.selectionStart
      const end = ta.selectionEnd
      setInputText(prev => prev.slice(0, start) + mention + prev.slice(end))
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + mention.length
        ta.focus()
      }, 0)
    } else {
      setInputText(prev => prev + mention)
    }
    setShowMentionDropdown(false)
  }

  const handleFileAttach = () => {
    dispatch({
      type: 'SEND_MESSAGE',
      conversationId: conversation.id,
      text: '示例文件.pdf',
      fileData: { type: 'file', fileName: '示例文件.pdf', fileSize: '1.2 MB' }
    })
  }

  const memberCount = conversation.memberIds.length

  const getConvTitle = () => {
    if (!conversation.isGroup) {
      const other = state.users.find(u => conversation.memberIds.includes(u.id) && !u.isCurrentUser)
      return other?.name || conversation.name
    }
    return conversation.name
  }

  return (
    <div className="chat-view" onClick={closeContextMenu} style={{ position: 'relative' }}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <span className="chat-header-name">{getConvTitle()}</span>
          {conversation.isGroup && (
            <span className="chat-header-count">{memberCount}人</span>
          )}
        </div>
        <div className="chat-header-actions">
          <button className="icon-btn" title="更多" onClick={(e) => { e.stopPropagation(); setShowDetailSidebar(v => !v) }}>⋯</button>
        </div>
      </div>

      {/* Messages */}
      <div className="message-list">
        {messages.map((msg, idx) => {
          const isOwn = msg.senderId === state.currentUser.id
          const sender = getUser(msg.senderId)
          const showDate = shouldShowDate(messages, idx)
          const prevMsg = idx > 0 ? messages[idx - 1] : null
          const showSender = !isOwn && conversation.isGroup &&
            (!prevMsg || prevMsg.senderId !== msg.senderId || shouldShowDate(messages, idx))

          if (msg.type === 'system') {
            return (
              <div key={msg.id}>
                {showDate && <div className="date-sep">{formatDate(msg.timestamp)}</div>}
                <div className="system-msg">{msg.content}</div>
              </div>
            )
          }

          return (
            <div key={msg.id}>
              {showDate && <div className="date-sep">{formatDate(msg.timestamp)}</div>}
              <div
                className={`msg-row ${isOwn ? 'msg-own' : 'msg-other'}`}
                onContextMenu={(e) => msg.type !== 'system' && handleMsgContextMenu(e, msg)}
              >
                {!isOwn && (
                  <div className="avatar-circle avatar-sm" style={{ background: sender?.avatar || '#ccc', flexShrink: 0, alignSelf: 'flex-start', marginTop: showSender ? 0 : 0 }}>
                    {sender?.name.charAt(0)}
                  </div>
                )}
                {msg.type !== 'system' && (
                  <button
                    className="msg-more-btn"
                    title="更多"
                    onClick={(e) => { e.stopPropagation(); handleMsgContextMenu(e, msg) }}
                  >⋯</button>
                )}
                <div className="msg-content-wrap">
                  {showSender && <div className="msg-sender">{sender?.name}</div>}
                  {msg.replyTo && (() => {
                    const replied = state.messages.find(m => m.id === msg.replyTo)
                    const replySender = replied ? getUser(replied.senderId) : null
                    return replied ? (
                      <div className="reply-quote">
                        <span className="reply-sender">{replySender?.name}: </span>
                        {replied.content?.slice(0, 40)}
                      </div>
                    ) : null
                  })()}
                  <div className={`msg-bubble ${isOwn ? 'bubble-own' : 'bubble-other'} ${msg.type === 'file' ? 'bubble-file' : ''}`}>
                    {msg.type === 'file' ? (
                      <div className="file-msg">
                        <span className="file-icon">📄</span>
                        <div className="file-info">
                          <div className="file-name">{msg.fileName || msg.content}</div>
                          <div className="file-size">{msg.fileSize || ''}</div>
                        </div>
                        <button className="file-download">⬇</button>
                      </div>
                    ) : (
                      <span className="msg-text">{msg.content}</span>
                    )}
                  </div>
                  <div className="msg-meta">
                    {isOwn && conversation.isGroup && (
                      <button
                        className="read-receipt-btn"
                        onClick={(e) => { e.stopPropagation(); setShowReadReceipt(showReadReceipt === msg.id ? null : msg.id) }}
                      >
                        已读 {msg.readBy.filter(id => id !== state.currentUser.id).length}人
                      </button>
                    )}
                    <span className="msg-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  {showReadReceipt === msg.id && (
                    <div className="read-receipt-panel">
                      <div className="read-receipt-col">
                        <div className="receipt-header">已读 ({msg.readBy.filter(id => id !== state.currentUser.id).length})</div>
                        {msg.readBy.filter(id => id !== state.currentUser.id).map(id => {
                          const u = getUser(id)
                          return <div key={id} className="receipt-user">
                            <div className="avatar-circle" style={{ width:20, height:20, fontSize:10, background: u?.avatar || '#ccc' }}>{u?.name.charAt(0)}</div>
                            <span>{u?.name}</span>
                          </div>
                        })}
                      </div>
                      <div className="read-receipt-col">
                        <div className="receipt-header">未读 ({conversation.memberIds.filter(id => id !== state.currentUser.id && !msg.readBy.includes(id)).length})</div>
                        {conversation.memberIds.filter(id => id !== state.currentUser.id && !msg.readBy.includes(id)).map(id => {
                          const u = getUser(id)
                          return <div key={id} className="receipt-user">
                            <div className="avatar-circle" style={{ width:20, height:20, fontSize:10, background: u?.avatar || '#ccc' }}>{u?.name.charAt(0)}</div>
                            <span>{u?.name}</span>
                          </div>
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {isOwn && (
                  <div className="avatar-circle avatar-sm" style={{ background: state.currentUser.avatar, flexShrink: 0, alignSelf: 'flex-start' }}>
                    {state.currentUser.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="chat-input-bar">
        {replyTo && (
          <div className="reply-preview">
            <span className="reply-preview-text">
              回复 {getUser(replyTo.senderId)?.name}: {replyTo.content?.slice(0, 40)}
            </span>
            <button onClick={() => setReplyTo(null)}>✕</button>
          </div>
        )}
        <div className="input-toolbar">
          <button className="toolbar-btn" title="表情" onClick={() => setShowEmoji(!showEmoji)}>😊</button>
          <button className="toolbar-btn" title="附件" onClick={handleFileAttach}>📎</button>
          <button className="toolbar-btn" title="截图" onClick={() => {
            dispatch({
              type: 'SEND_MESSAGE',
              conversationId: conversation.id,
              text: '截图_' + new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit', second:'2-digit'}) + '.png',
              fileData: { type: 'file', fileName: '截图_' + new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit', second:'2-digit'}) + '.png', fileSize: '256 KB' }
            })
            showToast('截图已发送')
          }}>✂️</button>
          {conversation.isGroup && (
            <div style={{ position: 'relative' }}>
              <button className="toolbar-btn" title="@成员" onClick={(e) => { e.stopPropagation(); setShowMentionDropdown(v => !v) }}>@</button>
              {showMentionDropdown && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: 0, background: 'white',
                  border: '1px solid var(--border)', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  zIndex: 100, minWidth: 160, maxHeight: 200, overflowY: 'auto'
                }} onClick={e => e.stopPropagation()}>
                  {state.users.filter(u => conversation.memberIds.includes(u.id) && !u.isCurrentUser).map(member => (
                    <div key={member.id} onClick={() => handleMentionSelect(member)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f6f7'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="avatar-circle avatar-sm" style={{ background: member.avatar }}>{member.name.charAt(0)}</div>
                      <span style={{ fontSize: 13 }}>{member.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="input-row">
          <textarea
            ref={inputRef}
            className="chat-textarea"
            placeholder="输入消息..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!inputText.trim()}
          >
            发送
          </button>
        </div>
        <div className="input-hint">Enter 发送，Shift+Enter 换行</div>

        {showEmoji && (
          <div className="emoji-picker" style={{ width: 280, height: 300, display: 'flex', flexDirection: 'column' }}>
            {/* Category tabs at bottom */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2
              }}>
                {(EMOJI_CATEGORIES.find(c => c.key === emojiCategory)?.emojis || []).map(e => (
                  <button key={e} className="emoji-btn" onClick={() => handleEmojiClick(e)} style={{ fontSize: 20 }}>{e}</button>
                ))}
              </div>
            </div>
            <div style={{
              display: 'flex', borderTop: '1px solid var(--border)', padding: '4px 0'
            }}>
              {EMOJI_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setEmojiCategory(cat.key)}
                  title={cat.label}
                  style={{
                    flex: 1, background: emojiCategory === cat.key ? '#EBF4FF' : 'none',
                    border: 'none', cursor: 'pointer', padding: '4px 0', fontSize: 18,
                    borderRadius: 4
                  }}
                >
                  {cat.icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => handleReply(contextMenu.msg)}>回复</button>
          <button onClick={() => handleForward(contextMenu.msg)}>转发</button>
          <button onClick={() => handleCopy(contextMenu.msg)}>复制</button>
          {canRecall(contextMenu.msg) && (
            <button onClick={() => handleRecall(contextMenu.msg)}>撤回</button>
          )}
          <button className="danger" onClick={() => handleDelete(contextMenu.msg)}>删除</button>
        </div>
      )}

      {/* Group detail sidebar */}
      {showDetailSidebar && (
        <GroupDetailSidebar
          conversation={conversation}
          users={state.users}
          onClose={() => setShowDetailSidebar(false)}
          dispatch={dispatch}
          navigate={navigate}
        />
      )}

      {/* Forward modal */}
      {showForwardModal && (
        <ForwardModal
          msg={showForwardModal}
          conversations={state.conversations.filter(c => c.id !== conversation.id)}
          users={state.users}
          currentUser={state.currentUser}
          onClose={() => setShowForwardModal(null)}
          onSend={(targetConversationId, comment) => {
            const senderUser = state.users.find(u => u.id === showForwardModal.senderId)
            dispatch({
              type: 'FORWARD_MESSAGE',
              targetConversationId,
              originalMsg: { ...showForwardModal, senderName: senderUser?.name },
              comment
            })
            showToast('已转发')
            setShowForwardModal(null)
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)', color: 'white', padding: '8px 16px',
          borderRadius: 6, fontSize: 13, zIndex: 200, pointerEvents: 'none'
        }}>{toast}</div>
      )}
    </div>
  )
}

function ForwardModal({ msg, conversations, users, currentUser, onClose, onSend }) {
  const [selectedConvId, setSelectedConvId] = useState(null)
  const [comment, setComment] = useState('')

  const getConvName = (conv) => {
    if (conv.isGroup) return conv.name
    const other = users.find(u => conv.memberIds.includes(u.id) && u.id !== currentUser.id)
    return other?.name || conv.name
  }

  const getConvAvatar = (conv) => {
    if (conv.isGroup) return conv.avatar || '#1890FF'
    const other = users.find(u => conv.memberIds.includes(u.id) && u.id !== currentUser.id)
    return other?.avatar || '#1890FF'
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 8, width: 400, maxHeight: '70vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>转发消息</span>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#8F959E' }}>✕</button>
        </div>
        <div style={{ padding: '12px 20px', background: '#f7f8fa', margin: '0 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
          原消息: {msg.content?.slice(0, 60)}{msg.content?.length > 60 ? '...' : ''}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id === selectedConvId ? null : conv.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                cursor: 'pointer',
                background: selectedConvId === conv.id ? '#EBF4FF' : 'transparent'
              }}
              onMouseEnter={e => { if (selectedConvId !== conv.id) e.currentTarget.style.background = '#f5f6f7' }}
              onMouseLeave={e => { if (selectedConvId !== conv.id) e.currentTarget.style.background = 'transparent' }}
            >
              <div className="avatar-circle avatar-sm" style={{ background: getConvAvatar(conv), flexShrink: 0 }}>
                {getConvName(conv).charAt(0)}
              </div>
              <span style={{ fontSize: 13 }}>{getConvName(conv)}</span>
              {selectedConvId === conv.id && <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontSize: 16 }}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
          <input
            placeholder="附言（可选）"
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{
              width: '100%', border: '1px solid var(--border)', borderRadius: 6,
              padding: '7px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              marginBottom: 12
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              onClick={onClose}
              style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: 13 }}
            >取消</button>
            <button
              onClick={() => selectedConvId && onSend(selectedConvId, comment)}
              disabled={!selectedConvId}
              style={{
                padding: '7px 16px', borderRadius: 6, border: 'none',
                background: selectedConvId ? 'var(--primary)' : '#ccc',
                color: 'white', cursor: selectedConvId ? 'pointer' : 'default', fontSize: 13
              }}
            >发送</button>
          </div>
        </div>
      </div>
    </div>
  )
}
