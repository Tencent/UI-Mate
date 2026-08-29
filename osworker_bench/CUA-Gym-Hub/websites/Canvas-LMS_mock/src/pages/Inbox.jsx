import React, { useState, useMemo } from 'react';
import { PenSquare, Reply, ReplyAll, Archive, Trash2, Star, ChevronDown, Search, Paperclip, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Inbox.css';

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getAvatarColor(userId) {
  const colors = ['#0374B5', '#EE0612', '#0B874B', '#FC5E13', '#6B3FA0', '#394B58', '#D97706', '#7C3AED'];
  return colors[(userId || 0) % colors.length];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const oneDay = 86400000;
  if (diff < oneDay && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (diff < oneDay * 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Inbox() {
  const { state, setState } = useAppContext();
  const [selectedId, setSelectedId] = useState(null);
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Compose modal state
  const [composeCourse, setComposeCourse] = useState('');
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const activeCourses = state.courses.filter(c => c.workflow_state === 'available');

  const conversations = useMemo(() => {
    let convs = [...state.conversations];
    if (courseFilter !== 'all') {
      convs = convs.filter(c => c.context_id === parseInt(courseFilter));
    }
    if (typeFilter === 'unread') {
      convs = convs.filter(c => c.workflow_state === 'unread');
    } else if (typeFilter === 'starred') {
      convs = convs.filter(c => c.starred);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      convs = convs.filter(c => c.subject.toLowerCase().includes(q) || c.last_message.toLowerCase().includes(q));
    }
    return convs.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
  }, [state.conversations, courseFilter, typeFilter, searchQuery]);

  const selectedConversation = state.conversations.find(c => c.id === selectedId);
  const selectedMessages = useMemo(() => {
    if (!selectedId) return [];
    return state.conversationMessages
      .filter(m => m.conversation_id === selectedId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [state.conversationMessages, selectedId]);

  const getUser = (userId) => state.users.find(u => u.id === userId);

  const handleSelectConversation = (id) => {
    setSelectedId(id);
    setReplyText('');
    // Mark as read
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c =>
        c.id === id && c.workflow_state === 'unread'
          ? { ...c, workflow_state: 'read' }
          : c
      )
    }));
  };

  const handleToggleStar = (e, convId) => {
    e.stopPropagation();
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c =>
        c.id === convId ? { ...c, starred: !c.starred } : c
      )
    }));
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedId) return;
    const newMsg = {
      id: Math.max(0, ...state.conversationMessages.map(m => m.id)) + 1,
      conversation_id: selectedId,
      author_id: state.currentUser.id,
      body: replyText.trim(),
      created_at: new Date().toISOString(),
      generated: false,
      attachments: []
    };
    setState(prev => ({
      ...prev,
      conversationMessages: [...prev.conversationMessages, newMsg],
      conversations: prev.conversations.map(c =>
        c.id === selectedId
          ? { ...c, last_message: replyText.trim(), last_message_at: new Date().toISOString(), message_count: c.message_count + 1 }
          : c
      )
    }));
    setReplyText('');
  };

  const handleArchive = () => {
    if (!selectedId) return;
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c =>
        c.id === selectedId ? { ...c, workflow_state: 'archived' } : c
      )
    }));
    setSelectedId(null);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.filter(c => c.id !== selectedId),
      conversationMessages: prev.conversationMessages.filter(m => m.conversation_id !== selectedId)
    }));
    setSelectedId(null);
  };

  const handleSendMessage = () => {
    if (!composeSubject.trim() || !composeBody.trim() || !composeTo) return;
    const toUser = state.users.find(u => u.name.toLowerCase().includes(composeTo.toLowerCase()));
    if (!toUser) return;
    const newConvId = Math.max(0, ...state.conversations.map(c => c.id)) + 1;
    const newMsgId = Math.max(0, ...state.conversationMessages.map(m => m.id)) + 1;
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      conversations: [
        {
          id: newConvId,
          subject: composeSubject.trim(),
          workflow_state: 'read',
          last_message: composeBody.trim(),
          last_message_at: now,
          message_count: 1,
          starred: false,
          private: true,
          participants: [state.currentUser.id, toUser.id],
          context_name: composeCourse ? activeCourses.find(c => c.id === parseInt(composeCourse))?.course_code || '' : '',
          context_id: composeCourse ? parseInt(composeCourse) : null
        },
        ...prev.conversations
      ],
      conversationMessages: [
        ...prev.conversationMessages,
        {
          id: newMsgId,
          conversation_id: newConvId,
          author_id: state.currentUser.id,
          body: composeBody.trim(),
          created_at: now,
          generated: false,
          attachments: []
        }
      ]
    }));
    setShowCompose(false);
    setComposeCourse('');
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setSelectedId(newConvId);
  };

  const getParticipantName = (conv) => {
    const otherId = conv.participants.find(id => id !== state.currentUser.id);
    const user = getUser(otherId);
    return user ? user.name : 'Unknown';
  };

  return (
    <div className="inbox-page">
      <div className="inbox-toolbar">
        <div className="inbox-toolbar-left">
          <button className="btn btn-primary btn-sm" onClick={() => setShowCompose(true)}>
            <PenSquare size={14} /> Compose
          </button>
          <button className="btn btn-secondary btn-sm" disabled={!selectedId} onClick={handleReply}>
            <Reply size={14} />
          </button>
          <button className="btn btn-secondary btn-sm" disabled={!selectedId}>
            <ReplyAll size={14} />
          </button>
          <button className="btn btn-secondary btn-sm" disabled={!selectedId} onClick={handleArchive}>
            <Archive size={14} />
          </button>
          <button className="btn btn-secondary btn-sm" disabled={!selectedId} onClick={handleDelete}>
            <Trash2 size={14} />
          </button>
        </div>
        <div className="inbox-toolbar-right">
          <select className="inbox-filter" value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
            <option value="all">All Courses</option>
            {activeCourses.map(c => (
              <option key={c.id} value={c.id}>{c.course_code}</option>
            ))}
          </select>
          <select className="inbox-filter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="inbox">Inbox</option>
            <option value="unread">Unread</option>
            <option value="starred">Starred</option>
            <option value="sent">Sent</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="inbox-layout">
        {/* Left Panel - Conversation List */}
        <div className="inbox-list-panel">
          <div className="inbox-search">
            <Search size={14} className="inbox-search-icon" />
            <input
              type="text"
              placeholder="Search messages..."
              className="inbox-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="inbox-conversations">
            {conversations.length === 0 ? (
              <div className="inbox-empty-list">No conversations found.</div>
            ) : (
              conversations.map(conv => {
                const otherId = conv.participants.find(id => id !== state.currentUser.id);
                const user = getUser(otherId);
                return (
                  <div
                    key={conv.id}
                    className={`inbox-conv-item ${selectedId === conv.id ? 'selected' : ''} ${conv.workflow_state === 'unread' ? 'unread' : ''}`}
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <div className="inbox-conv-avatar">
                      <div className="avatar" style={{ background: getAvatarColor(otherId), width: 36, height: 36, fontSize: 13 }}>
                        {user ? getInitials(user.name) : '?'}
                      </div>
                    </div>
                    <div className="inbox-conv-content">
                      <div className="inbox-conv-header">
                        <span className="inbox-conv-name">{user ? user.name : 'Unknown'}</span>
                        <span className="inbox-conv-time">{formatDate(conv.last_message_at)}</span>
                      </div>
                      <div className="inbox-conv-subject">{conv.subject}</div>
                      <div className="inbox-conv-preview">{conv.last_message}</div>
                      {conv.context_name && (
                        <div className="inbox-conv-course">{conv.context_name}</div>
                      )}
                    </div>
                    <button
                      className={`inbox-star-btn ${conv.starred ? 'starred' : ''}`}
                      onClick={(e) => handleToggleStar(e, conv.id)}
                    >
                      <Star size={14} fill={conv.starred ? '#FC5E13' : 'none'} stroke={conv.starred ? '#FC5E13' : '#6B7780'} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Conversation Detail */}
        <div className="inbox-detail-panel">
          {selectedConversation ? (
            <>
              <div className="inbox-detail-header">
                <h2>{selectedConversation.subject}</h2>
                {selectedConversation.context_name && (
                  <span className="inbox-detail-course">{selectedConversation.context_name}</span>
                )}
              </div>
              <div className="inbox-messages">
                {selectedMessages.map(msg => {
                  const author = getUser(msg.author_id);
                  return (
                    <div key={msg.id} className="inbox-message">
                      <div className="inbox-message-avatar">
                        <div className="avatar" style={{ background: getAvatarColor(msg.author_id), width: 36, height: 36, fontSize: 13 }}>
                          {author ? getInitials(author.name) : '?'}
                        </div>
                      </div>
                      <div className="inbox-message-content">
                        <div className="inbox-message-meta">
                          <span className="inbox-message-author">{author?.name || 'Unknown'}</span>
                          <span className="inbox-message-date">
                            {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="inbox-message-body">{msg.body}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="inbox-reply-area">
                <textarea
                  className="inbox-reply-textarea"
                  placeholder="Reply..."
                  rows={3}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
                <div className="inbox-reply-actions">
                  <button className="btn btn-secondary btn-sm">
                    <Paperclip size={14} />
                  </button>
                  <div>
                    <button className="btn btn-primary btn-sm" onClick={handleReply} disabled={!replyText.trim()}>
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="inbox-no-selection">
              <p>No conversation selected</p>
              <p className="inbox-no-selection-sub">Select a conversation from the list to view messages</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="inbox-compose-overlay" onClick={() => setShowCompose(false)}>
          <div className="inbox-compose-modal" onClick={e => e.stopPropagation()}>
            <div className="inbox-compose-header">
              <h2>Compose Message</h2>
              <button className="inbox-compose-close" onClick={() => setShowCompose(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="inbox-compose-body">
              <div className="inbox-compose-field">
                <label>Course</label>
                <select value={composeCourse} onChange={e => setComposeCourse(e.target.value)}>
                  <option value="">Select a course...</option>
                  {activeCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.course_code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="inbox-compose-field">
                <label>To</label>
                <input
                  type="text"
                  placeholder="Search for a person..."
                  value={composeTo}
                  onChange={e => setComposeTo(e.target.value)}
                />
              </div>
              <div className="inbox-compose-field">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="Subject"
                  value={composeSubject}
                  onChange={e => setComposeSubject(e.target.value)}
                />
              </div>
              <div className="inbox-compose-field">
                <label>Message</label>
                <textarea
                  placeholder="Write your message..."
                  rows={8}
                  value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                />
              </div>
            </div>
            <div className="inbox-compose-footer">
              <button className="btn btn-secondary btn-sm">
                <Paperclip size={14} /> Attach
              </button>
              <div className="inbox-compose-footer-right">
                <button className="btn btn-secondary" onClick={() => setShowCompose(false)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={!composeSubject.trim() || !composeBody.trim() || !composeTo.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
