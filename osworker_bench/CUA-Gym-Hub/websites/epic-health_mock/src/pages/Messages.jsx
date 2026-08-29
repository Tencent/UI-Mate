import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Search, PenSquare, Paperclip, Send, MoreVertical, X } from 'lucide-react'
import '../styles/common.css'
import './Messages.css'

function getThreads(messages) {
  const threadMap = {}
  messages.forEach(m => {
    if (!threadMap[m.threadId]) threadMap[m.threadId] = []
    threadMap[m.threadId].push(m)
  })
  return Object.values(threadMap).map(msgs => {
    const sorted = [...msgs].sort((a, b) => new Date(b.date) - new Date(a.date))
    const latest = sorted[0]
    const hasUnread = msgs.some(m => !m.isRead && m.folder === 'inbox')
    return { threadId: latest.threadId, latest, messages: sorted, hasUnread }
  }).sort((a, b) => new Date(b.latest.date) - new Date(a.latest.date))
}

function formatRelativeDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }
  if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Messages() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const { threadId } = useParams()
  const [folder, setFolder] = useState('inbox')
  const [search, setSearch] = useState('')
  const [contextMenu, setContextMenu] = useState(null)

  const allMessages = state.messages || []
  const inboxMessages = allMessages.filter(m => m.folder === 'inbox')
  const sentMessages = allMessages.filter(m => m.folder === 'sent')
  const archivedMessages = allMessages.filter(m => m.folder === 'archived')

  const getThreadsForFolder = (msgs) => getThreads(msgs)

  const folderMsgs = folder === 'inbox' ? inboxMessages :
    folder === 'sent' ? sentMessages :
    archivedMessages

  const threads = getThreadsForFolder(folderMsgs).filter(t => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return t.latest.subject.toLowerCase().includes(q) ||
      t.latest.body.toLowerCase().includes(q) ||
      t.latest.from.name.toLowerCase().includes(q)
  })

  const inboxUnread = inboxMessages.filter(m => !m.isRead).length

  const selectedThread = threadId
    ? getThreads(allMessages).find(t => t.threadId === threadId)
    : threads[0]

  const handleThreadClick = (t) => {
    if (t.hasUnread) {
      dispatch({ type: 'MARK_MESSAGE_READ', payload: { threadId: t.threadId } })
    }
    navigate(`/messages/${t.threadId}`)
  }

  const handleContextMenu = (e, t) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, thread: t })
  }

  return (
    <div className="messages-layout">
      {/* Thread List Panel */}
      <div className="messages-list-panel">
        <div className="messages-list-header">
          <div className="tab-nav" style={{ marginBottom: 0 }}>
            <button className={`tab-btn ${folder === 'inbox' ? 'tab-btn--active' : ''}`} onClick={() => setFolder('inbox')}>
              Inbox {inboxUnread > 0 && <span className="tab-count-badge">{inboxUnread}</span>}
            </button>
            <button className={`tab-btn ${folder === 'sent' ? 'tab-btn--active' : ''}`} onClick={() => setFolder('sent')}>
              Sent
            </button>
            <button className={`tab-btn ${folder === 'archived' ? 'tab-btn--active' : ''}`} onClick={() => setFolder('archived')}>
              Archived
            </button>
          </div>
        </div>

        <div className="messages-search-wrap">
          <Search size={14} className="messages-search-icon" />
          <input
            className="messages-search"
            type="text"
            placeholder="Search messages"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="messages-thread-list">
          {threads.length === 0 && (
            <div className="messages-empty">No messages in this folder.</div>
          )}
          {threads.map(t => (
            <div
              key={t.threadId}
              className={`thread-row ${selectedThread?.threadId === t.threadId ? 'thread-row--active' : ''} ${t.hasUnread ? 'thread-row--unread' : ''}`}
              onClick={() => handleThreadClick(t)}
            >
              {t.hasUnread && <div className="unread-dot" />}
              <div className="thread-sender">
                {t.latest.from.name !== state.currentUser?.fullName ? t.latest.from.name : `To: ${t.latest.to.name}`}
              </div>
              <div className="thread-subject">{t.latest.subject}</div>
              <div className="thread-preview">{t.latest.body.replace(/\n/g, ' ').slice(0, 80)}...</div>
              <div className="thread-date">{formatRelativeDate(t.latest.date)}</div>
              <button
                className="thread-more-btn"
                onClick={(e) => handleContextMenu(e, t)}
              >
                <MoreVertical size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="messages-new-btn-wrap">
          <button className="btn btn--primary" onClick={() => navigate('/messages/compose')}>
            <PenSquare size={16} /> New Message
          </button>
        </div>
      </div>

      {/* Thread View Panel */}
      <div className="messages-thread-panel">
        {selectedThread ? (
          <ThreadView thread={selectedThread} state={state} dispatch={dispatch} />
        ) : (
          <div className="messages-no-selection">
            <p>Select a message to read</p>
          </div>
        )}
      </div>

      {/* Context Menu — z bug fixed: z → zIndex */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed', top: contextMenu.y, left: contextMenu.x,
            background: '#fff', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
            zIndex: 999, minWidth: 160
          }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {[
            { label: 'Mark as Unread', action: () => {
              dispatch({ type: 'MARK_MESSAGE_UNREAD', payload: { messageId: contextMenu.thread.latest.id } })
              setContextMenu(null)
            }},
            { label: 'Archive', action: () => {
              dispatch({ type: 'ARCHIVE_THREAD', payload: contextMenu.thread.threadId })
              setContextMenu(null)
            }},
          ].map(item => (
            <button
              key={item.label}
              style={{
                display: 'block', width: '100%', background: 'none', border: 'none',
                padding: '10px 16px', fontSize: 'var(--font-sm)', textAlign: 'left', cursor: 'pointer',
                color: 'var(--color-text-primary)'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--color-section-bg)'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
              onClick={item.action}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ThreadView({ thread, state, dispatch }) {
  const navigate = useNavigate()
  const [replyText, setReplyText] = useState('')
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef(null)

  const sortedMsgs = [...thread.messages].sort((a, b) => new Date(a.date) - new Date(b.date))
  const firstMsg = sortedMsgs[0]

  const handleSend = () => {
    if (!replyText.trim()) return
    const newMsg = {
      id: `msg-reply-${Date.now()}`,
      threadId: thread.threadId,
      parentId: thread.latest.id,
      from: { id: 'patient-1', name: state.currentUser?.fullName || 'Sarah Chen', type: 'patient' },
      to: firstMsg.from.type === 'patient' ? firstMsg.to : firstMsg.from,
      subject: `Re: ${firstMsg.subject}`,
      body: replyText,
      date: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      folder: 'sent',
      hasAttachment: attachments.length > 0,
      attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type })),
      isUrgent: false
    }
    dispatch({ type: 'ADD_MESSAGE', payload: newMsg })
    setReplyText('')
    setAttachments([])
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
    e.target.value = ''
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="thread-view">
      <div className="thread-view-header">
        <h2 className="thread-view-subject">{firstMsg.subject}</h2>
        <div className="thread-view-participants">
          {firstMsg.from.type !== 'patient' ? (
            <span>From: <strong>{firstMsg.from.name}</strong></span>
          ) : (
            <span>To: <strong>{firstMsg.to.name}</strong></span>
          )}
        </div>
      </div>

      <div className="thread-messages">
        {sortedMsgs.map(msg => {
          const isPatient = msg.from.type === 'patient'
          return (
            <div key={msg.id} className={`message-bubble-wrap ${isPatient ? 'message-bubble-wrap--patient' : ''}`}>
              <div className="message-meta">
                <strong>{msg.from.name}</strong>
                <span style={{ marginLeft: 8, color: 'var(--color-text-secondary)', fontSize: 'var(--font-xs)' }}>
                  {new Date(msg.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(msg.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              </div>
              <div className={`message-bubble ${isPatient ? 'message-bubble--patient' : 'message-bubble--provider'}`}>
                {msg.body.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div style={{ marginTop: 8, borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 6 }}>
                    {msg.attachments.map((att, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                        <Paperclip size={10} /> {att.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="thread-reply">
        <textarea
          className="form-textarea"
          placeholder="Type your reply..."
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          rows={4}
        />

        {/* Attachment list in reply */}
        {attachments.length > 0 && (
          <div style={{ marginTop: 6 }}>
            {attachments.map((file, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 8px', background: 'var(--color-section-bg)',
                borderRadius: 'var(--radius-sm)', marginBottom: 3, fontSize: 'var(--font-xs)'
              }}>
                <Paperclip size={11} style={{ color: 'var(--color-text-secondary)' }} />
                <span style={{ flex: 1 }}>{file.name}</span>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 1 }}
                  onClick={() => removeAttachment(i)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button className="btn btn--primary btn--sm" onClick={handleSend} disabled={!replyText.trim()}>
            <Send size={14} /> Send
          </button>
          <button className="btn btn--gray btn--sm" onClick={handleAttachClick}>
            <Paperclip size={14} /> Attach
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  )
}
