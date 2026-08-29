import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, MoreHorizontal, Send, Edit, Check, Clock, X, Minus,
  ChevronDown, ChevronRight, Plus, Tag, Activity, Users, Info,
  MessageCircle, Trash2, Copy, FolderOpen, Shield, ShieldCheck, ShieldX, ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ContractEditor from '../components/ContractEditor';
import SendForSignatureModal from '../components/SendForSignatureModal';
import { showToast } from '../components/Toast';

function formatDate(str) {
  if (!str) return '\u2014';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelativeTime(str) {
  if (!str) return '';
  const d = new Date(str);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(str);
}

function StatusBadge({ status }) {
  return <span className={`badge badge-${status?.replace('_', '-')}`}>{status?.replace('_', ' ')}</span>;
}

function SigneeStatusIcon({ status }) {
  if (status === 'signed') return <Check size={14} className="signee-status-signed" />;
  if (status === 'pending') return <Clock size={14} className="signee-status-pending" />;
  if (status === 'rejected') return <X size={14} className="signee-status-rejected" />;
  return <Minus size={14} className="signee-status-not_sent" />;
}

function ApprovalStatusIcon({ status }) {
  if (status === 'approved') return <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} />;
  if (status === 'rejected') return <ShieldX size={14} style={{ color: 'var(--color-danger)' }} />;
  return <ShieldAlert size={14} style={{ color: 'var(--color-warning)' }} />;
}

function Panel({ title, children, defaultOpen = true, count }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="contract-panel">
      <div className="contract-panel-header" onClick={() => setOpen(!open)}>
        <h3>
          {title}
          {count !== undefined && <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: 6 }}>({count})</span>}
        </h3>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>
      {open && <div className="contract-panel-body">{children}</div>}
    </div>
  );
}

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const {
    state, dispatch, updateContract, deleteContract, addContract,
    addActivity, addComment, requestApproval, respondToApproval, getUserName, generateId,
  } = useApp();
  const sid = searchParams.get('sid');
  const query = sid ? `?sid=${sid}` : '';

  const [editMode, setEditMode] = useState(location.state?.editMode || false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [tagDropOpen, setTagDropOpen] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalResponseId, setApprovalResponseId] = useState(null);
  const [approvalComment, setApprovalComment] = useState('');

  const contract = state.contracts.find(c => c.id === id);

  useEffect(() => {
    if (contract) {
      setEditContent(contract.content || '');
      setTitleInput(contract.title || '');
    }
  }, [contract?.id]);

  // Close more menu on outside click
  useEffect(() => {
    if (moreOpen) {
      const handler = () => setMoreOpen(false);
      setTimeout(() => document.addEventListener('click', handler), 0);
      return () => document.removeEventListener('click', handler);
    }
  }, [moreOpen]);

  if (!contract) {
    return (
      <div className="page">
        <div className="empty-state">
          <h3>Contract not found</h3>
          <button className="btn btn-primary" onClick={() => navigate(`/contracts${query}`)}>
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  const activities = state.activities.filter(a => a.contractId === id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const comments = state.comments.filter(c => c.contractId === id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const tags = contract.tags?.map(tagId => state.tags.find(t => t.id === tagId)).filter(Boolean) || [];
  const unusedTags = state.tags.filter(t => !contract.tags?.includes(t.id));
  const folder = state.folders.find(f => f.id === contract.folderId);
  const approvals = contract.approvals || [];
  const allUsers = [state.currentUser, ...state.users].filter(Boolean);
  const usersNotInApprovals = allUsers.filter(u => !approvals.some(a => a.userId === u.id));

  const handleSave = () => {
    updateContract({ id, content: editContent, title: titleInput || contract.title });
    addActivity({
      contractId: id,
      type: 'edited',
      userId: state.currentUser?.id,
      contactId: null,
      description: `${state.currentUser?.firstName} ${state.currentUser?.lastName} edited the contract`,
      metadata: null,
    });
    setEditMode(false);
    showToast('Contract saved', 'success');
  };

  const handleCancelEdit = () => {
    setEditContent(contract.content || '');
    setEditMode(false);
  };

  const handleTitleSave = () => {
    if (titleInput.trim()) {
      updateContract({ id, title: titleInput.trim() });
    }
    setEditTitle(false);
  };

  const handleDeleteContract = () => {
    deleteContract(id);
    navigate(`/contracts${query}`);
    showToast('Contract deleted', 'info');
  };

  const handleDuplicate = () => {
    const newContract = addContract({
      ...contract,
      id: undefined,
      title: `Copy of ${contract.title}`,
      status: 'draft',
      signedAt: null,
      sentAt: null,
      approvals: [],
      parties: contract.parties?.map(p => ({
        ...p,
        id: `party-${Date.now()}-${Math.random()}`,
        signees: p.signees.map(s => ({ ...s, id: `signee-${Date.now()}-${Math.random()}`, status: 'not_sent', signedAt: null })),
      })) || [],
      createdBy: state.currentUser?.id,
    });
    navigate(`/contracts/${newContract.id}${query}`);
    showToast('Contract duplicated', 'success');
    setMoreOpen(false);
  };

  const handleSigneeAction = (partyId, signeeId, action) => {
    const updatedParties = contract.parties.map(p => {
      if (p.id !== partyId) return p;
      const updatedSignees = p.signees.map(s => {
        if (s.id !== signeeId) return s;
        if (action === 'sign') return { ...s, status: 'signed', signedAt: new Date().toISOString() };
        if (action === 'reject') return { ...s, status: 'rejected' };
        return s;
      });
      return { ...p, signees: updatedSignees };
    });

    const allSignees = updatedParties.flatMap(p => p.signees);
    const allSigned = allSignees.every(s => s.status === 'signed');
    const anyRejected = allSignees.some(s => s.status === 'rejected');

    let newStatus = contract.status;
    let signedAt = contract.signedAt;
    if (allSigned) {
      newStatus = 'signed';
      signedAt = new Date().toISOString();
    } else if (anyRejected && contract.status === 'pending') {
      newStatus = 'rejected';
    }

    updateContract({ id, parties: updatedParties, status: newStatus, signedAt });

    const signee = contract.parties.flatMap(p => p.signees).find(s => s.id === signeeId);
    addActivity({
      contractId: id,
      type: action === 'sign' ? 'signed' : 'rejected',
      userId: signee?.userId || null,
      contactId: signee?.contactId || null,
      description: action === 'sign'
        ? `${signee?.name} signed the contract`
        : `${signee?.name} rejected the contract`,
      metadata: null,
    });

    if (allSigned) {
      showToast('All parties have signed! Contract is now complete.', 'success');
    }
  };

  const handleAddTag = (tagId) => {
    const newTags = [...(contract.tags || []), tagId];
    updateContract({ id, tags: newTags });
    setTagDropOpen(false);
  };

  const handleRemoveTag = (tagId) => {
    const newTags = (contract.tags || []).filter(t => t !== tagId);
    updateContract({ id, tags: newTags });
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    addComment({
      contractId: id,
      userId: state.currentUser?.id,
      content: commentText.trim(),
    });
    setCommentText('');
  };

  const handleRequestApproval = (userId) => {
    requestApproval(id, userId);
    setShowApprovalModal(false);
    showToast(`Approval requested from ${getUserName(userId)}`, 'success');
  };

  const handleRespondToApproval = (approvalId, approved) => {
    respondToApproval(id, approvalId, approved, approvalComment.trim() || null);
    setApprovalResponseId(null);
    setApprovalComment('');
    showToast(approved ? 'Approval granted' : 'Approval rejected', approved ? 'success' : 'error');
  };

  return (
    <div>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px',
        background: 'white', borderBottom: '1px solid var(--color-border-light)',
        position: 'sticky', top: 0, zIndex: 4,
      }}>
        <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/contracts${query}`)}>
          <ArrowLeft size={18} />
        </button>

        {editTitle ? (
          <input
            className="input"
            value={titleInput}
            onChange={e => setTitleInput(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') { setTitleInput(contract.title); setEditTitle(false); } }}
            autoFocus
            style={{ fontSize: 16, fontWeight: 600, flex: 1, maxWidth: 400 }}
          />
        ) : (
          <h2
            style={{ fontSize: 16, fontWeight: 600, cursor: 'pointer', flex: 1 }}
            onClick={() => setEditTitle(true)}
            title="Click to edit title"
          >
            {contract.title}
          </h2>
        )}

        <StatusBadge status={contract.status} />

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {editMode ? (
            <>
              <button className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </>
          ) : (
            <>
              {contract.status === 'draft' && (
                <>
                  <button className="btn btn-secondary" onClick={() => setEditMode(true)}>
                    <Edit size={14} />
                    Edit
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowApprovalModal(true)}>
                    <Shield size={14} />
                    Request Approval
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowSendModal(true)}>
                    <Send size={14} />
                    Send for Signature
                  </button>
                </>
              )}

              <div style={{ position: 'relative' }}>
                <button className="btn btn-secondary btn-icon" onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen); }}>
                  <MoreHorizontal size={16} />
                </button>
                {moreOpen && (
                  <div className="dropdown-menu" style={{ right: 0, top: '100%' }} onClick={e => e.stopPropagation()}>
                    <button className="dropdown-item" onClick={handleDuplicate}>
                      <Copy size={14} /> Duplicate
                    </button>
                    <button className="dropdown-item" onClick={() => { setShowMoveModal(true); setMoreOpen(false); }}>
                      <FolderOpen size={14} /> Move to Folder
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={() => { setShowDeleteConfirm(true); setMoreOpen(false); }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="contract-detail">
        {/* Left: Content */}
        <div className="contract-content-area">
          {editMode ? (
            <ContractEditor
              content={editContent}
              onChange={setEditContent}
            />
          ) : (
            <div
              className="contract-rendered"
              dangerouslySetInnerHTML={{ __html: contract.content || '<p>No content</p>' }}
            />
          )}
        </div>

        {/* Right: Panels */}
        <div className="contract-sidebar-panel">
          {/* Approvals */}
          {approvals.length > 0 && (
            <Panel title="Approvals" count={approvals.length}>
              {approvals.map(approval => {
                const user = allUsers.find(u => u.id === approval.userId);
                const isMyApproval = approval.userId === state.currentUser?.id;
                const canRespond = isMyApproval && approval.status === 'pending';

                return (
                  <div key={approval.id} className="signee-row" style={{ flexWrap: 'wrap' }}>
                    <ApprovalStatusIcon status={approval.status} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        {user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {user?.jobTitle || ''} {approval.status === 'pending' ? '- Pending' : ''}
                      </div>
                      {approval.comment && (
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, fontStyle: 'italic' }}>
                          "{approval.comment}"
                        </div>
                      )}
                    </div>
                    {approval.status !== 'pending' && (
                      <span className={`badge badge-${approval.status === 'approved' ? 'signed' : 'rejected'}`} style={{ fontSize: 10 }}>
                        {approval.status}
                      </span>
                    )}
                    {canRespond && approvalResponseId !== approval.id && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Approve"
                          onClick={() => { setApprovalResponseId(approval.id); setApprovalComment(''); }}
                          style={{ color: 'var(--color-success)' }}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Reject"
                          onClick={() => { setApprovalResponseId(approval.id); setApprovalComment(''); }}
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {approvalResponseId === approval.id && (
                      <div style={{ width: '100%', marginTop: 8 }}>
                        <textarea
                          className="input"
                          placeholder="Add a comment (optional)..."
                          value={approvalComment}
                          onChange={e => setApprovalComment(e.target.value)}
                          rows={2}
                          style={{ fontSize: 12, marginBottom: 8 }}
                        />
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setApprovalResponseId(null)}>Cancel</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleRespondToApproval(approval.id, false)}>Reject</button>
                          <button className="btn btn-primary btn-sm" style={{ background: 'var(--color-success)' }} onClick={() => handleRespondToApproval(approval.id, true)}>Approve</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </Panel>
          )}

          {/* Parties & Signees */}
          <Panel title="Parties & Signees">
            {contract.parties?.map(party => (
              <div key={party.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{party.name}</span>
                  <span className={`badge badge-${party.type}`}>{party.type}</span>
                </div>
                {party.signees.map(signee => (
                  <div key={signee.id} className="signee-row">
                    <SigneeStatusIcon status={signee.status} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{signee.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{signee.email} &middot; {signee.role}</div>
                    </div>
                    {contract.status === 'pending' && signee.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Mark as Signed"
                          onClick={() => handleSigneeAction(party.id, signee.id, 'sign')}
                          style={{ color: 'var(--color-success)' }}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Reject"
                          onClick={() => handleSigneeAction(party.id, signee.id, 'reject')}
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </Panel>

          {/* Details */}
          <Panel title="Details">
            <div className="detail-row"><span className="detail-label">Created</span><span className="detail-value">{formatDate(contract.createdAt)}</span></div>
            <div className="detail-row"><span className="detail-label">Updated</span><span className="detail-value">{formatDate(contract.updatedAt)}</span></div>
            {contract.expiresAt && <div className="detail-row"><span className="detail-label">Expires</span><span className="detail-value">{formatDate(contract.expiresAt)}</span></div>}
            {contract.sentAt && <div className="detail-row"><span className="detail-label">Sent</span><span className="detail-value">{formatDate(contract.sentAt)}</span></div>}
            {contract.signedAt && <div className="detail-row"><span className="detail-label">Signed</span><span className="detail-value">{formatDate(contract.signedAt)}</span></div>}
            {contract.value && <div className="detail-row"><span className="detail-label">Value</span><span className="detail-value">${contract.value.toLocaleString()} {contract.currency}</span></div>}
            {folder && <div className="detail-row"><span className="detail-label">Folder</span><span className="detail-value">{folder.name}</span></div>}
            <div className="detail-row"><span className="detail-label">Created by</span><span className="detail-value">{getUserName(contract.createdBy)}</span></div>
          </Panel>

          {/* Tags */}
          <Panel title="Tags">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {tags.map(tag => (
                <span
                  key={tag.id}
                  className="tag-pill"
                  style={{ background: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: tag.color, lineHeight: 1 }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            {unusedTags.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-primary)', fontSize: 12 }}
                  onClick={() => setTagDropOpen(!tagDropOpen)}
                >
                  <Plus size={12} /> Add tag
                </button>
                {tagDropOpen && (
                  <div className="dropdown-menu" style={{ left: 0, top: '100%', minWidth: 160 }}>
                    {unusedTags.map(tag => (
                      <button key={tag.id} className="dropdown-item" onClick={() => handleAddTag(tag.id)}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: tag.color, display: 'inline-block', marginRight: 4 }} />
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Panel>

          {/* Activity */}
          <Panel title="Activity" count={activities.length}>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {activities.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No activity yet</p>
              ) : (
                activities.map(act => (
                  <div key={act.id} className="activity-item">
                    <div className="activity-icon">
                      <Activity size={12} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="activity-desc">{act.description}</div>
                      <div className="activity-time">{formatRelativeTime(act.timestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>

          {/* Comments */}
          <Panel title="Comments" count={comments.length}>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 12 }}>
              {comments.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No comments yet</p>
              ) : (
                comments.map(comment => {
                  const user = comment.userId === state.currentUser?.id
                    ? state.currentUser
                    : state.users.find(u => u.id === comment.userId);
                  const initials = user
                    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
                    : '?';
                  return (
                    <div key={comment.id} style={{ marginBottom: 12, opacity: comment.resolved ? 0.6 : 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div className="avatar avatar-sm">{initials}</div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>
                          {user ? `${user.firstName} ${user.lastName}` : 'Unknown'}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{formatRelativeTime(comment.createdAt)}</span>
                        {comment.resolved && <span style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 500 }}>Resolved</span>}
                        {!comment.resolved && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 8px', height: 'auto' }}
                            onClick={() => dispatch({ type: 'UPDATE_COMMENT', payload: { id: comment.id, resolved: true } })}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--color-text-primary)', paddingLeft: 32, textDecoration: comment.resolved ? 'line-through' : 'none' }}>
                        {comment.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
            <textarea
              className="input"
              placeholder="Add a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={2}
              style={{ marginBottom: 8 }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePostComment(); }}
            />
            <button className="btn btn-secondary btn-sm" onClick={handlePostComment} disabled={!commentText.trim()}>
              Post
            </button>
          </Panel>
        </div>
      </div>

      {/* Modals */}
      {showSendModal && (
        <SendForSignatureModal
          contractId={id}
          onClose={() => setShowSendModal(false)}
        />
      )}

      {showDeleteConfirm && (
        <div className="confirm-dialog">
          <div className="confirm-dialog-box">
            <h3>Delete Contract</h3>
            <p>Are you sure you want to delete "{contract.title}"? This action cannot be undone.</p>
            <div className="confirm-dialog-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteContract}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showMoveModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowMoveModal(false); }}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <h2>Move to Folder</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowMoveModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <button
                className="dropdown-item"
                style={{ marginBottom: 4 }}
                onClick={() => {
                  updateContract({ id, folderId: null });
                  setShowMoveModal(false);
                  showToast('Moved to root', 'success');
                }}
              >
                No folder (root)
              </button>
              {state.folders.map(f => (
                <button
                  key={f.id}
                  className="dropdown-item"
                  style={{ fontWeight: f.id === contract.folderId ? 600 : 400 }}
                  onClick={() => {
                    updateContract({ id, folderId: f.id });
                    setShowMoveModal(false);
                    showToast(`Moved to ${f.name}`, 'success');
                  }}
                >
                  <FolderOpen size={14} style={{ color: f.color }} />
                  {f.parentId ? '\u00A0\u00A0' : ''}{f.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showApprovalModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowApprovalModal(false); }}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <h2>Request Approval</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowApprovalModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                Select a team member to request approval from:
              </p>
              {usersNotInApprovals.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>All team members already have approval requests.</p>
              ) : (
                usersNotInApprovals.map(user => (
                  <button
                    key={user.id}
                    className="dropdown-item"
                    style={{ marginBottom: 4 }}
                    onClick={() => handleRequestApproval(user.id)}
                  >
                    <div className="avatar avatar-sm" style={{ fontSize: 10 }}>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{user.firstName} {user.lastName}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{user.jobTitle}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
