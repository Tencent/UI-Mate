import React, { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
  return (d.getMonth() + 1) + '月' + d.getDate() + '日'
}

const COLORS = ['#FF5000', '#1890FF', '#52C41A', '#FAAD14', '#722ED1', '#13C2C2', '#FA8C16', '#2F54EB']
function getBuyerColor(name) { return COLORS[name.charCodeAt(0) % COLORS.length] }

export default function MessageCenter() {
  const { state, dispatch } = useAppContext()
  const [activeConvId, setActiveConvId] = useState(null)
  const [inputText, setInputText] = useState('')
  const [showQuickReply, setShowQuickReply] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const quickReplyRef = useRef(null)

  const activeConv = state.conversations.find(c => c.id === activeConvId)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeConvId, activeConv?.messages])

  useEffect(() => {
    function handleClick(e) {
      if (quickReplyRef.current && !quickReplyRef.current.contains(e.target)) {
        setShowQuickReply(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectConv(conv) {
    setActiveConvId(conv.id)
    if (conv.unreadCount > 0) {
      dispatch({ type: 'MARK_CONVERSATION_READ', payload: conv.id })
    }
  }

  function sendMessage() {
    if (!inputText.trim() || !activeConvId) return
    const message = {
      id: `msg_${Date.now()}`,
      senderId: 'seller',
      senderType: 'seller',
      content: inputText.trim(),
      time: new Date().toISOString()
    }
    dispatch({ type: 'ADD_MESSAGE', payload: { conversationId: activeConvId, message } })
    setInputText('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sortedConvs = [...state.conversations].sort(
    (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
  )

  return (
    <div style={{ height: 'calc(100vh - 56px - 40px)', display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
      {/* Conversation list */}
      <div style={{ width: 300, borderRight: '1px solid var(--color-border)', background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: 15 }}>
          消息
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {sortedConvs.map(conv => (
            <div
              key={conv.id}
              className="conversation-item"
              role="button"
              tabIndex={0}
              aria-label={conv.buyerName}
              onClick={() => selectConv(conv)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectConv(conv) } }}
              style={{
                padding: '10px 12px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center',
                background: conv.id === activeConvId ? '#FFF7E6' : 'transparent',
                borderBottom: '1px solid var(--color-border-light)',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => { if (conv.id !== activeConvId) e.currentTarget.style.background = '#FAFAFA' }}
              onMouseLeave={e => { if (conv.id !== activeConvId) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: getBuyerColor(conv.buyerName),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 600, fontSize: 14
                }}>
                  {conv.buyerName.charAt(0)}
                </div>
                {conv.unreadCount > 0 && (
                  <span className="count-badge" style={{ position: 'absolute', top: -2, right: -2 }}>
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontWeight: conv.unreadCount > 0 ? 700 : 400, fontSize: 14 }}>{conv.buyerName}</span>
                  <span style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>{formatTime(conv.lastMessageTime)}</span>
                </div>
                <div style={{
                  fontSize: 12, color: conv.unreadCount > 0 ? '#333' : '#999',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {conv.lastMessage}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      {!activeConv ? (
        <div style={{ flex: 1, background: '#FAFAFA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
          <p style={{ fontSize: 14 }}>选择一个会话开始聊天</p>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {/* Chat header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: getBuyerColor(activeConv.buyerName),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 600, fontSize: 14
            }}>
              {activeConv.buyerName.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{activeConv.buyerName}</div>
              <div style={{ fontSize: 12, color: '#52C41A' }}>在线</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {activeConv.messages.map((msg, i) => {
              const isSeller = msg.senderType === 'seller'
              return (
                <div key={msg.id} style={{
                  display: 'flex',
                  flexDirection: isSeller ? 'row-reverse' : 'row',
                  gap: 8, marginBottom: 12, alignItems: 'flex-end'
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isSeller ? 'var(--color-primary)' : getBuyerColor(activeConv.buyerName),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 12, fontWeight: 700
                  }}>
                    {isSeller ? '我' : activeConv.buyerName.charAt(0)}
                  </div>
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{
                      padding: '8px 12px', borderRadius: isSeller ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                      background: isSeller ? 'var(--color-primary)' : '#F5F5F5',
                      color: isSeller ? '#fff' : '#333',
                      fontSize: 14, lineHeight: 1.6, wordBreak: 'break-all'
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 3, textAlign: isSeller ? 'right' : 'left' }}>
                      {formatTime(msg.time)}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ position: 'relative' }} ref={quickReplyRef}>
                <button
                  className="btn btn-default btn-sm"
                  onClick={() => setShowQuickReply(v => !v)}
                >
                  快捷回复
                </button>
                {showQuickReply && (
                  <div style={{
                    position: 'absolute', bottom: '100%', left: 0, width: 320,
                    background: '#fff', border: '1px solid var(--color-border)',
                    borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: 13 }}>
                      快捷回复
                    </div>
                    {state.quickReplies.map(qr => (
                      <div
                        key={qr.id}
                        onClick={() => {
                          setInputText(qr.content)
                          setShowQuickReply(false)
                          inputRef.current?.focus()
                        }}
                        style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--color-border-light)' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{qr.label}</div>
                        <div style={{ fontSize: 12, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{qr.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <textarea
                ref={inputRef}
                style={{ flex: 1, height: 72, resize: 'none', padding: '8px 12px', fontSize: 14 }}
                className="form-input"
                placeholder="输入消息，Enter发送，Shift+Enter换行"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="btn btn-primary" style={{ alignSelf: 'flex-end', minWidth: 64 }} onClick={sendMessage}>
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
