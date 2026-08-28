import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './ConversationList.css'

const FILTER_TABS = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'at', label: '@我' },
  { key: 'group', label: '群聊' },
  { key: 'dm', label: '单聊' },
]

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) {
    const h = d.getHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  }
  if (diff < 172800) return '昨天'
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}月${day}日`
}

export default function ConversationList({ onSelect, activeId }) {
  const { state, dispatch } = useApp()
  const [activeFilter, setActiveFilter] = useState('all')
  const [contextMenu, setContextMenu] = useState(null)

  const unreadTotal = state.conversations.reduce((s, c) => s + (c.isMuted ? 0 : c.unreadCount), 0)

  const atMeConvIds = (() => {
    const currentName = state.currentUser?.name || ''
    return new Set(
      state.messages
        .filter(m => m.content && (m.content.includes('@' + currentName) || m.content.includes('@user_001')))
        .map(m => m.conversationId)
    )
  })()

  const atCount = state.conversations.filter(c => atMeConvIds.has(c.id)).length

  const getFilteredConvs = () => {
    let list = [...state.conversations]
    if (activeFilter === 'unread') list = list.filter(c => c.unreadCount > 0)
    if (activeFilter === 'at') list = list.filter(c => atMeConvIds.has(c.id))
    if (activeFilter === 'group') list = list.filter(c => c.isGroup)
    if (activeFilter === 'dm') list = list.filter(c => !c.isGroup)
    // Sort: pinned first, then by last message timestamp
    list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1
      const ta = a.lastMessage?.timestamp || a.createdAt
      const tb = b.lastMessage?.timestamp || b.createdAt
      return new Date(tb) - new Date(ta)
    })
    return list
  }

  const getConvAvatar = (conv) => {
    if (conv.isGroup) return conv.avatar || '#1890FF'
    const other = state.users.find(u => conv.memberIds.includes(u.id) && !u.isCurrentUser)
    return other?.avatar || '#1890FF'
  }

  const getConvAvatarName = (conv) => {
    if (conv.isGroup) return conv.name.charAt(0)
    const other = state.users.find(u => conv.memberIds.includes(u.id) && !u.isCurrentUser)
    return other?.name.charAt(0) || '?'
  }

  const handleContextMenu = (e, conv) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, conv })
  }

  const closeContextMenu = () => setContextMenu(null)

  const handlePin = (conv) => {
    dispatch({ type: 'PIN_CONVERSATION', id: conv.id })
    closeContextMenu()
  }

  const handleMute = (conv) => {
    dispatch({ type: 'MUTE_CONVERSATION', id: conv.id })
    closeContextMenu()
  }

  const handleDelete = (conv) => {
    dispatch({ type: 'DELETE_CONVERSATION', id: conv.id })
    closeContextMenu()
  }

  const convs = getFilteredConvs()

  return (
    <div className="conv-list-wrap" onClick={closeContextMenu}>
      {/* Filter tabs */}
      <div className="filter-tabs">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            className={`filter-tab ${activeFilter === tab.key ? 'filter-tab-active' : ''}`}
            onClick={() => setActiveFilter(tab.key)}
          >
            {tab.label}
            {tab.key === 'unread' && unreadTotal > 0 && (
              <span className="tab-badge">{unreadTotal}</span>
            )}
            {tab.key === 'at' && atCount > 0 && (
              <span className="tab-badge">{atCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="conv-list">
        {convs.length === 0 && (
          <div className="conv-list-empty">暂无会话</div>
        )}
        {convs.map(conv => (
          <div
            key={conv.id}
            className={`conv-item ${activeId === conv.id ? 'conv-item-active' : ''} ${conv.isPinned ? 'conv-pinned' : ''}`}
            onClick={() => onSelect(conv.id)}
            onContextMenu={(e) => handleContextMenu(e, conv)}
          >
            <div className="conv-avatar-wrap">
              <div
                className="avatar-circle avatar-md"
                style={{ background: getConvAvatar(conv) }}
              >
                {getConvAvatarName(conv)}
              </div>
              {conv.isMuted && <span className="muted-icon">🔇</span>}
            </div>
            <div className="conv-info">
              <div className="conv-info-top">
                <span className="conv-name">
                  {conv.isPinned && <span className="pin-icon">📌 </span>}
                  {conv.name}
                </span>
                <span className="conv-time">
                  {formatTime(conv.lastMessage?.timestamp)}
                </span>
              </div>
              <div className="conv-info-bottom">
                <span className="conv-preview">
                  {conv.lastMessage?.text || '暂无消息'}
                </span>
                {conv.unreadCount > 0 && (
                  <span className={`badge ${conv.isMuted ? 'badge-muted' : ''}`}>
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => handlePin(contextMenu.conv)}>
            {contextMenu.conv.isPinned ? '取消置顶' : '置顶'}
          </button>
          <button onClick={() => handleMute(contextMenu.conv)}>
            {contextMenu.conv.isMuted ? '取消免打扰' : '消息免打扰'}
          </button>
          <button className="danger" onClick={() => handleDelete(contextMenu.conv)}>
            删除聊天
          </button>
        </div>
      )}
    </div>
  )
}
