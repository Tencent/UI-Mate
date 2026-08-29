import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ConversationList from '../components/ConversationList'
import ChatView from '../components/ChatView'
import CreateConversationModal from '../components/CreateConversationModal'
import './MessagesPage.css'

export default function MessagesPage() {
  const { conversationId } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  const getPath = (path) => sid ? `${path}?sid=${sid}` : path

  useEffect(() => {
    if (conversationId && state.activeConversationId !== conversationId) {
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', id: conversationId })
    } else if (!conversationId && state.activeConversationId) {
      navigate(getPath(`/messages/${state.activeConversationId}`), { replace: true })
    }
  }, [conversationId, state.activeConversationId])

  const activeConv = state.conversations.find(c => c.id === (conversationId || state.activeConversationId))

  const handleSelectConv = (id) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', id })
    dispatch({ type: 'MARK_AS_READ', conversationId: id })
    navigate(getPath(`/messages/${id}`))
  }

  const handleSearchChange = (q) => {
    dispatch({ type: 'SET_SEARCH_QUERY', query: q })
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    const lower = q.toLowerCase()
    const contacts = state.users.filter(u => !u.isCurrentUser && u.name.includes(q))
    const groups = state.conversations.filter(c => c.isGroup && c.name.includes(q))
    const msgs = state.messages.filter(m => m.type === 'text' && m.content.includes(q)).slice(0, 5)
    setSearchResults([
      ...contacts.map(u => ({ type: 'contact', id: u.id, label: u.name, sub: u.title })),
      ...groups.map(c => ({ type: 'group', id: c.id, label: c.name, sub: `${c.memberIds.length}人` })),
      ...msgs.map(m => ({ type: 'message', id: m.conversationId, label: m.content.slice(0, 30), sub: '聊天记录' })),
    ])
  }

  const handleSearchResultClick = (result) => {
    setSearchFocused(false)
    dispatch({ type: 'SET_SEARCH_QUERY', query: '' })
    setSearchResults([])
    if (result.type === 'contact') {
      // Find or create DM
      const existing = state.conversations.find(c => c.type === 'dm' && c.memberIds.includes(result.id))
      if (existing) handleSelectConv(existing.id)
      else {
        dispatch({ type: 'CREATE_CONVERSATION', userIds: [result.id], convType: 'dm' })
      }
    } else {
      handleSelectConv(result.id)
    }
  }

  return (
    <div className="messages-page">
      {/* Middle panel */}
      <div className="list-panel">
        <div className="list-panel-header">
          <div className="search-wrap" style={{ position: 'relative' }}>
            <div className={`search-bar ${searchFocused ? 'search-focused' : ''}`}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="搜索联系人、群组、聊天记录"
                value={state.searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              />
            </div>
            {searchFocused && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map((r, i) => (
                  <div key={i} className="search-result-item" onMouseDown={() => handleSearchResultClick(r)}>
                    <div className="search-result-label">{r.label}</div>
                    <div className="search-result-sub">{r.sub}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="icon-btn" onClick={() => setShowCreateModal(true)} title="发起聊天">
            ✏️
          </button>
        </div>

        <ConversationList onSelect={handleSelectConv} activeId={conversationId || state.activeConversationId} />
      </div>

      {/* Right: chat area */}
      <div className="chat-panel">
        {activeConv ? (
          <ChatView conversation={activeConv} />
        ) : (
          <div className="no-conv-selected">
            <div className="no-conv-icon">💬</div>
            <div>选择一个会话开始聊天</div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateConversationModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}
