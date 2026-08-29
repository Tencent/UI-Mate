import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Bold, Italic, List, ListOrdered, Code, LinkIcon, Paperclip, ChevronDown, ChevronUp, Plus, X, UserPlus, PanelRightClose, PanelRightOpen, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import SlaIndicator from '../components/SlaIndicator.jsx';
import { formatDistanceToNow } from 'date-fns';

export default function TicketDetail() {
  const { ticketId } = useParams();
  const { state, dispatch } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [replyText, setReplyText] = useState('');
  const [replyMode, setReplyMode] = useState('public');
  const [submitStatus, setSubmitStatus] = useState('open');
  const [showSubmitDropdown, setShowSubmitDropdown] = useState(false);
  const [showMacroDropdown, setShowMacroDropdown] = useState(false);
  const [macroFilter, setMacroFilter] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showMoreProperties, setShowMoreProperties] = useState(false);
  const [showFollowerDropdown, setShowFollowerDropdown] = useState(false);
  const [followerSearch, setFollowerSearch] = useState('');
  const [showCcInput, setShowCcInput] = useState(false);
  const [ccInput, setCcInput] = useState('');
  const [ccList, setCcList] = useState([]);
  const [stayOnTicket, setStayOnTicket] = useState(true);
  const [contextPanelOpen, setContextPanelOpen] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const macroDropdownRef = useRef(null);
  const submitDropdownRef = useRef(null);
  const followerDropdownRef = useRef(null);

  const query = searchParams.toString();
  const appendQuery = (p) => query ? `${p}?${query}` : p;

  const tid = parseInt(ticketId);
  const ticket = state.tickets.find(t => t.id === tid);
  const comments = state.comments[tid] || [];

  useEffect(() => {
    if (ticket) {
      dispatch({ type: 'OPEN_TICKET_TAB', payload: tid });
    }
  }, [tid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  // Initialize CC list from ticket collaborator_ids
  useEffect(() => {
    if (ticket) {
      const collabEmails = (ticket.collaborator_ids || [])
        .map(id => state.users.find(u => u.id === id))
        .filter(Boolean)
        .map(u => u.email);
      setCcList(collabEmails);
    }
  }, [tid]);

  // Click-outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMacroDropdown && macroDropdownRef.current && !macroDropdownRef.current.contains(e.target)) {
        setShowMacroDropdown(false);
      }
      if (showSubmitDropdown && submitDropdownRef.current && !submitDropdownRef.current.contains(e.target)) {
        setShowSubmitDropdown(false);
      }
      if (showFollowerDropdown && followerDropdownRef.current && !followerDropdownRef.current.contains(e.target)) {
        setShowFollowerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMacroDropdown, showSubmitDropdown, showFollowerDropdown]);

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setReplyText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(80, textareaRef.current.scrollHeight) + 'px';
    }
  };

  if (!ticket) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#87929D' }}>
        Ticket not found
      </div>
    );
  }

  const requester = state.users.find(u => u.id === ticket.requester_id);
  const assignee = state.users.find(u => u.id === ticket.assignee_id);
  const org = state.organizations.find(o => o.id === ticket.organization_id);
  const group = state.groups.find(g => g.id === ticket.group_id);

  const requesterTickets = state.tickets.filter(t => t.id !== tid && t.requester_id === ticket.requester_id);

  const handleFieldChange = (field, value) => {
    dispatch({ type: 'UPDATE_TICKET', payload: { id: tid, changes: { [field]: value } } });
  };

  const handleSubmit = () => {
    if (!replyText.trim()) return;
    const newComment = {
      id: Date.now(),
      ticket_id: tid,
      author_id: state.currentUser.id,
      body: replyText.trim(),
      html_body: `<p>${replyText.trim().replace(/\n/g, '<br>')}</p>`,
      public: replyMode === 'public',
      type: 'Comment',
      attachments: [],
      created_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_COMMENT', payload: { ticketId: tid, comment: newComment } });
    // Persist CC list as collaborator_ids on the ticket
    const ccUserIds = ccList
      .map(email => state.users.find(u => u.email === email))
      .filter(Boolean)
      .map(u => u.id);
    dispatch({ type: 'UPDATE_TICKET', payload: { id: tid, changes: { status: submitStatus, collaborator_ids: ccUserIds } } });
    setReplyText('');
    if (textareaRef.current) textareaRef.current.style.height = '80px';
    addToast(`Ticket #${tid} updated`);
    if (!stayOnTicket) {
      navigate(appendQuery(`/views/${state.ui.activeView || 1}`));
    }
  };

  const handleApplyMacro = (macro) => {
    dispatch({ type: 'APPLY_MACRO', payload: { ticketId: tid, macro } });
    setShowMacroDropdown(false);
    setMacroFilter('');
    addToast(`Macro applied: ${macro.title}`);
  };

  const handleAddTag = (tag) => {
    if (!ticket.tags.includes(tag)) {
      handleFieldChange('tags', [...ticket.tags, tag]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tag) => {
    handleFieldChange('tags', ticket.tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput.trim().toLowerCase());
    }
  };

  const handleAddFollower = (agentId) => {
    const currentFollowers = ticket.follower_ids || [];
    if (!currentFollowers.includes(agentId)) {
      handleFieldChange('follower_ids', [...currentFollowers, agentId]);
      const agent = state.users.find(u => u.id === agentId);
      addToast(`${agent?.name || 'Agent'} added as follower`);
    }
    setShowFollowerDropdown(false);
    setFollowerSearch('');
  };

  const handleRemoveFollower = (agentId) => {
    handleFieldChange('follower_ids', (ticket.follower_ids || []).filter(id => id !== agentId));
  };

  const handleAddCc = () => {
    if (ccInput.trim() && !ccList.includes(ccInput.trim())) {
      setCcList(prev => [...prev, ccInput.trim()]);
      setCcInput('');
    }
  };

  const handleCcKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCc();
    }
  };

  const handleRemoveCc = (email) => {
    setCcList(prev => prev.filter(e => e !== email));
  };

  const tagSuggestions = tagInput
    ? state.tags.filter(t => t.includes(tagInput.toLowerCase()) && !ticket.tags.includes(t)).slice(0, 8)
    : [];

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch { return '—'; }
  };

  const getUserById = (id) => state.users.find(u => u.id === id);

  const filteredMacros = state.macros.filter(m =>
    m.title.toLowerCase().includes(macroFilter.toLowerCase())
  );

  const agents = state.users.filter(u => u.role === 'agent');

  const availableFollowers = agents.filter(a =>
    !(ticket.follower_ids || []).includes(a.id) &&
    a.name.toLowerCase().includes(followerSearch.toLowerCase())
  );

  // Primary properties (always visible)
  const primaryProperties = ['assignee', 'status', 'type', 'priority', 'group', 'tags'];

  // Rich text formatting helper
  const applyFormat = (prefix, suffix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = replyText;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    setReplyText(newText);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + prefix.length;
      ta.selectionEnd = end + prefix.length;
    }, 0);
  };

  const handleDeleteTicket = () => {
    dispatch({ type: 'DELETE_TICKET', payload: tid });
    setShowDeleteConfirm(false);
    addToast(`Ticket #${tid} deleted`);
    navigate(appendQuery(`/views/${state.ui.activeView || 1}`));
  };

  return (
    <div className="ticket-detail">
      {/* Left Properties Panel */}
      <div className="ticket-properties-panel">
        <div className="breadcrumb">
          {org && (
            <>
              <Link to={appendQuery(`/organizations/${org.id}`)}>{org.name}</Link>
              <span className="breadcrumb-sep">&rsaquo;</span>
            </>
          )}
          {requester && (
            <>
              <Link to={appendQuery(`/customers/${requester.id}`)}>{requester.name}</Link>
              <span className="breadcrumb-sep">&rsaquo;</span>
            </>
          )}
          <span>Ticket #{ticket.id}</span>
          <StatusBadge status={ticket.status} />
        </div>

        <div className="property-group">
          <div className="property-label">Assignee</div>
          <select
            className="property-select"
            value={ticket.assignee_id || ''}
            onChange={e => handleFieldChange('assignee_id', e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">— Unassigned —</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="property-group">
          <div className="property-label">Status</div>
          <select
            className="property-select"
            value={ticket.status}
            onChange={e => handleFieldChange('status', e.target.value)}
          >
            <option value="new">New</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="hold">Hold</option>
            <option value="solved">Solved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="property-group">
          <div className="property-label">Type</div>
          <select
            className="property-select"
            value={ticket.type || ''}
            onChange={e => handleFieldChange('type', e.target.value || null)}
          >
            <option value="">—</option>
            <option value="question">Question</option>
            <option value="incident">Incident</option>
            <option value="problem">Problem</option>
            <option value="task">Task</option>
          </select>
        </div>

        <div className="property-group">
          <div className="property-label">Priority</div>
          <select
            className="property-select"
            value={ticket.priority || ''}
            onChange={e => handleFieldChange('priority', e.target.value || null)}
          >
            <option value="">—</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="property-group">
          <div className="property-label">Group</div>
          <select
            className="property-select"
            value={ticket.group_id || ''}
            onChange={e => handleFieldChange('group_id', parseInt(e.target.value))}
          >
            {state.groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="property-group" style={{ position: 'relative' }}>
          <div className="property-label">Tags</div>
          <div className="tags-container" onClick={() => document.getElementById('tag-input')?.focus()}>
            {ticket.tags.map(tag => (
              <span key={tag} className="tag-pill">
                {tag}
                <button onClick={() => handleRemoveTag(tag)}>&times;</button>
              </span>
            ))}
            <input
              id="tag-input"
              className="tags-input"
              value={tagInput}
              onChange={e => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
              onKeyDown={handleTagKeyDown}
              onFocus={() => setShowTagSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
              placeholder={ticket.tags.length === 0 ? 'Add tags...' : ''}
            />
          </div>
          {showTagSuggestions && tagSuggestions.length > 0 && (
            <div className="tag-suggestions">
              {tagSuggestions.map(tag => (
                <div key={tag} className="tag-suggestion" onMouseDown={() => handleAddTag(tag)}>
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Show more / less toggle */}
        <button
          className="show-more-toggle"
          onClick={() => setShowMoreProperties(prev => !prev)}
        >
          {showMoreProperties ? (
            <><ChevronUp size={14} /> Show less</>
          ) : (
            <><ChevronDown size={14} /> Show more</>
          )}
        </button>

        {showMoreProperties && (
          <>
            {/* Followers with add/remove */}
            <div className="property-group" style={{ position: 'relative' }} ref={followerDropdownRef}>
              <div className="property-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Followers</span>
                <button
                  className="follower-add-btn"
                  onClick={() => setShowFollowerDropdown(!showFollowerDropdown)}
                  title="Add follower"
                >
                  <Plus size={12} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(ticket.follower_ids || []).map(fid => {
                  const u = getUserById(fid);
                  return u ? (
                    <div key={fid} className="follower-chip" title={u.name}>
                      <span className="follower-chip-avatar">{u.initials}</span>
                      <span className="follower-chip-name">{u.name.split(' ')[0]}</span>
                      <button className="follower-chip-remove" onClick={() => handleRemoveFollower(fid)}>
                        <X size={10} />
                      </button>
                    </div>
                  ) : null;
                })}
                {(ticket.follower_ids || []).length === 0 && (
                  <span style={{ fontSize: 12, color: '#87929D' }}>No followers</span>
                )}
              </div>
              {showFollowerDropdown && (
                <div className="follower-dropdown">
                  <div className="follower-dropdown-header">
                    <input
                      placeholder="Search agents..."
                      value={followerSearch}
                      onChange={e => setFollowerSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {availableFollowers.map(agent => (
                    <button
                      key={agent.id}
                      className="follower-dropdown-item"
                      onClick={() => handleAddFollower(agent.id)}
                    >
                      <span className="follower-dropdown-avatar">{agent.initials}</span>
                      {agent.name}
                    </button>
                  ))}
                  {availableFollowers.length === 0 && (
                    <div style={{ padding: 8, fontSize: 12, color: '#87929D', textAlign: 'center' }}>
                      No agents found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SLA Info */}
            <div className="property-group">
              <div className="property-label">SLA</div>
              <SlaIndicator ticket={ticket} />
            </div>

            {/* Custom fields */}
            <div className="property-group">
              <div className="property-label">Channel</div>
              <div style={{ fontSize: 13, color: '#2F3941', padding: '4px 0' }}>
                {ticket.via?.channel || 'web'}
              </div>
            </div>

            <div className="property-group">
              <div className="property-label">Custom fields</div>
              {ticket.custom_fields?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ticket.custom_fields.map((field, index) => (
                    <div key={`${field.id || field.name || index}`} style={{ fontSize: 12, color: '#2F3941' }}>
                      <strong>{field.title || field.name || field.id}:</strong> {String(field.value ?? '')}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#68737D', padding: '4px 0' }}>None configured</div>
              )}
            </div>

            <div className="property-group">
              <div className="property-label">Created</div>
              <div style={{ fontSize: 12, color: '#68737D', padding: '4px 0' }}>
                {new Date(ticket.created_at).toLocaleString()}
              </div>
            </div>

            <div className="property-group">
              <div className="property-label">Updated</div>
              <div style={{ fontSize: 12, color: '#68737D', padding: '4px 0' }}>
                {formatTime(ticket.updated_at)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Center Conversation Panel */}
      <div className="conversation-panel">
        <div className="conversation-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <h2 className="conversation-subject">{ticket.subject}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button
                className="header-btn"
                title="Delete ticket"
                onClick={() => setShowDeleteConfirm(true)}
                style={{ color: '#CC3340' }}
              >
                <Trash2 size={16} />
              </button>
              <button
                className="header-btn"
                title={contextPanelOpen ? 'Hide context panel' : 'Show context panel'}
                onClick={() => setContextPanelOpen(prev => !prev)}
              >
                {contextPanelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <div className="conversation-via">via {ticket.via?.channel || 'web'}</div>
            <SlaIndicator ticket={ticket} />
          </div>
          {ticket.satisfaction_rating && ticket.satisfaction_rating.score && (
            <div style={{ marginTop: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#68737D' }}>Satisfaction:</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: 2,
                fontSize: 11,
                fontWeight: 600,
                background: ticket.satisfaction_rating.score === 'good' ? '#E9F5EF' : '#FDE8E8',
                color: ticket.satisfaction_rating.score === 'good' ? '#186F50' : '#CC3340',
                textTransform: 'uppercase',
              }}>
                {ticket.satisfaction_rating.score}
              </span>
              {ticket.satisfaction_rating.comment && (
                <span style={{ color: '#68737D', fontStyle: 'italic' }}>"{ticket.satisfaction_rating.comment}"</span>
              )}
            </div>
          )}
        </div>

        <div className="conversation-messages">
          {comments.map(comment => {
            const author = getUserById(comment.author_id);
            const isInternal = !comment.public;
            const isAgent = author?.role === 'agent';
            return (
              <div key={comment.id} className={`comment-block ${isInternal ? 'internal' : 'public'}`}>
                {isInternal && (
                  <div className="comment-internal-label">
                    <Lock size={12} />
                    Internal note
                  </div>
                )}
                <div className="comment-header">
                  <div className={`comment-avatar ${isAgent ? 'agent' : 'end-user'}`}>
                    {author?.initials || '??'}
                  </div>
                  <div className="comment-meta">
                    <span className="comment-author">
                      {author?.name || 'Unknown'}
                      {isAgent && <span className="comment-role-badge">Agent</span>}
                    </span>
                    <div className="comment-time">{formatTime(comment.created_at)}</div>
                  </div>
                </div>
                <div className="comment-body">
                  {comment.html_body ? (
                    <div dangerouslySetInnerHTML={{ __html: comment.html_body }} />
                  ) : (
                    comment.body
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Composer */}
        <div className="reply-composer">
          <div className="reply-mode-toggle">
            <button
              className={`reply-mode-btn ${replyMode === 'public' ? 'active public' : ''}`}
              onClick={() => setReplyMode('public')}
            >
              Public reply
            </button>
            <button
              className={`reply-mode-btn ${replyMode === 'internal' ? 'active internal' : ''}`}
              onClick={() => setReplyMode('internal')}
            >
              Internal note
            </button>
          </div>

          {replyMode === 'public' && requester && (
            <div className="reply-to-line">
              <span>To:</span>
              <span className="reply-to-chip">{requester.email}</span>
              {ccList.map(email => (
                <span key={email} className="reply-to-chip">
                  {email}
                  <button
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: 4, color: '#1F73B7', fontSize: 12 }}
                    onClick={() => handleRemoveCc(email)}
                  >
                    &times;
                  </button>
                </span>
              ))}
              {showCcInput ? (
                <input
                  className="cc-input"
                  placeholder="Add CC email..."
                  value={ccInput}
                  onChange={e => setCcInput(e.target.value)}
                  onKeyDown={handleCcKeyDown}
                  onBlur={() => {
                    if (ccInput.trim()) handleAddCc();
                    setShowCcInput(false);
                  }}
                  autoFocus
                />
              ) : (
                <button className="cc-btn" onClick={() => setShowCcInput(true)}>
                  CC
                </button>
              )}
            </div>
          )}

          <div className="reply-toolbar">
            <button title="Bold" onClick={() => applyFormat('**', '**')}><Bold size={14} /></button>
            <button title="Italic" onClick={() => applyFormat('_', '_')}><Italic size={14} /></button>
            <button title="Bullet list" onClick={() => applyFormat('- ', '')}><List size={14} /></button>
            <button title="Numbered list" onClick={() => applyFormat('1. ', '')}><ListOrdered size={14} /></button>
            <button title="Code" onClick={() => applyFormat('`', '`')}><Code size={14} /></button>
            <button title="Link" onClick={() => applyFormat('[', '](url)')}><LinkIcon size={14} /></button>
            <button title="Attachment" onClick={() => addToast('Attachment upload not available in this demo', 'info')}><Paperclip size={14} /></button>
          </div>

          <textarea
            ref={textareaRef}
            className={`reply-textarea ${replyMode === 'internal' ? 'internal-mode' : ''}`}
            placeholder={replyMode === 'public' ? 'Type your reply...' : 'Add an internal note...'}
            value={replyText}
            onChange={handleTextareaChange}
          />

          <div className="reply-footer">
            <div className="reply-footer-left" style={{ position: 'relative' }} ref={macroDropdownRef}>
              <button className="macro-btn" onClick={() => setShowMacroDropdown(!showMacroDropdown)}>
                Apply macro <ChevronDown size={14} />
              </button>
              {showMacroDropdown && (
                <div className="macro-dropdown">
                  <div className="macro-dropdown-header">
                    <input
                      placeholder="Search macros..."
                      value={macroFilter}
                      onChange={e => setMacroFilter(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {filteredMacros.map(macro => (
                    <button
                      key={macro.id}
                      className="macro-dropdown-item"
                      onClick={() => handleApplyMacro(macro)}
                    >
                      {macro.title}
                    </button>
                  ))}
                  {filteredMacros.length === 0 && (
                    <div style={{ padding: 8, fontSize: 12, color: '#87929D', textAlign: 'center' }}>
                      No macros found
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="reply-footer-right" style={{ position: 'relative' }} ref={submitDropdownRef}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#68737D', cursor: 'pointer' }}>
                <input type="checkbox" checked={stayOnTicket} onChange={e => setStayOnTicket(e.target.checked)} /> Stay on ticket
              </label>
              <div className="submit-btn">
                <button className="submit-btn-main" onClick={handleSubmit}>
                  Submit as {submitStatus.charAt(0).toUpperCase() + submitStatus.slice(1)}
                </button>
                <button className="submit-btn-caret" onClick={() => setShowSubmitDropdown(!showSubmitDropdown)}>
                  <ChevronDown size={14} />
                </button>
              </div>
              {showSubmitDropdown && (
                <div className="submit-dropdown">
                  {['new', 'open', 'pending', 'hold', 'solved'].map(s => (
                    <button
                      key={s}
                      className="submit-dropdown-item"
                      onClick={() => { setSubmitStatus(s); setShowSubmitDropdown(false); }}
                    >
                      Submit as {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Context Panel */}
      {contextPanelOpen && (
      <div className="context-panel">
        {requester && (
          <div className="context-requester">
            <div className="context-avatar">{requester.initials}</div>
            <div className="context-name">
              <Link to={appendQuery(`/customers/${requester.id}`)}>{requester.name}</Link>
            </div>
            <div className="context-email">{requester.email}</div>
          </div>
        )}

        <div className="context-section">
          <div className="context-section-title">Contact Info</div>
          {requester?.email && (
            <div className="context-detail">
              <span className="context-detail-label">Email</span>
              <span className="context-detail-value">{requester.email}</span>
            </div>
          )}
          {requester?.phone && (
            <div className="context-detail">
              <span className="context-detail-label">Phone</span>
              <span className="context-detail-value">{requester.phone}</span>
            </div>
          )}
          {org && (
            <div className="context-detail">
              <span className="context-detail-label">Organization</span>
              <span className="context-detail-value">
                <Link to={appendQuery(`/organizations/${org.id}`)}>{org.name}</Link>
              </span>
            </div>
          )}
          {requester?.time_zone && (
            <div className="context-detail">
              <span className="context-detail-label">Timezone</span>
              <span className="context-detail-value">{requester.time_zone}</span>
            </div>
          )}
          {requester?.created_at && (
            <div className="context-detail">
              <span className="context-detail-label">Member since</span>
              <span className="context-detail-value">{new Date(requester.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="context-section">
          <div className="context-section-title">Interaction History</div>
          <div className="context-detail">
            <span className="context-detail-label">Tickets</span>
            <span className="context-detail-value">
              {requesterTickets.length + 1} total ({requesterTickets.filter(t => ['new', 'open', 'pending'].includes(t.status)).length + (ticket.status !== 'solved' && ticket.status !== 'closed' ? 1 : 0)} open)
            </span>
          </div>
        </div>

        {ticket.due_at && (
          <div className="context-section">
            <div className="context-section-title">Due Date</div>
            <div className="context-detail">
              <span className="context-detail-label">Due</span>
              <span className="context-detail-value" style={{ color: new Date(ticket.due_at) < new Date() ? '#CC3340' : '#186F50' }}>
                {new Date(ticket.due_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {requesterTickets.length > 0 && (
          <div className="context-section">
            <div className="context-section-title">Recent Tickets</div>
            {requesterTickets.slice(0, 5).map(rt => (
              <div key={rt.id} className="context-recent-ticket">
                <a
                  className="context-recent-subject"
                  onClick={() => {
                    dispatch({ type: 'OPEN_TICKET_TAB', payload: rt.id });
                    navigate(appendQuery(`/tickets/${rt.id}`));
                  }}
                >
                  {rt.subject}
                </a>
                <div className="context-recent-meta">
                  <StatusBadge status={rt.status} />
                  <span>{formatTime(rt.updated_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete Ticket #{tid}?</div>
            <p style={{ fontSize: 13, color: '#68737D', marginBottom: 16 }}>
              This action cannot be undone. The ticket and all its comments will be permanently deleted.
            </p>
            <div className="modal-actions">
              <button className="modal-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="modal-btn danger" onClick={handleDeleteTicket}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
