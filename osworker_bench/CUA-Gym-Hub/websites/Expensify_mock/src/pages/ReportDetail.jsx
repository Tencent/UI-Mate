import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Receipt } from 'lucide-react';
import ExpenseDetailModal from '../components/ExpenseDetailModal';

function formatAmount(cents) {
  const dollars = Math.floor(Math.abs(cents) / 100);
  const c = String(Math.abs(cents) % 100).padStart(2, '0');
  return '$' + dollars.toLocaleString() + '.' + c;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CommentAvatar({ authorName }) {
  const colors = ['#E85E95','#0185FF','#03D47C','#F5A623','#8B959E'];
  const idx = (authorName || '').length % colors.length;
  return <div className="comment-avatar" style={{ background: colors[idx] }}>{(authorName || 'S')[0]}</div>;
}

export default function ReportDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qs = searchParams.toString();
  const qsStr = qs ? '?' + qs : '';
  const [commentText, setCommentText] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const report = state.reports.find(r => r.id === id);
  if (!report) return <div style={{ padding: 40 }}>Report not found.</div>;

  const expenses = state.expenses.filter(e => e.reportId === id);
  const comments = state.comments.filter(c => c.reportId === id).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const user = state.currentUser;
  const policy = state.policies.find(p => p.id === report.policyId);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: 'cmt_' + Date.now(),
      reportId: id,
      authorId: user.id,
      authorName: user.displayName,
      authorEmail: user.email,
      type: 'comment',
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_COMMENT', payload: newComment });
    setCommentText('');
  };

  const handleApprove = () => {
    dispatch({ type: 'UPDATE_REPORT', payload: { id, status: 'approved', approvedDate: new Date().toISOString() } });
    dispatch({ type: 'ADD_COMMENT', payload: {
      id: 'cmt_' + Date.now(), reportId: id, authorId: user.id, authorName: user.displayName,
      authorEmail: user.email, type: 'status_change', text: 'Report approved', timestamp: new Date().toISOString()
    }});
    expenses.forEach(e => dispatch({ type: 'UPDATE_EXPENSE', payload: { id: e.id, status: 'approved' } }));
    // Mark related inbox item as read
    const inboxItem = state.inboxItems.find(i => i.relatedId === id && i.actionType === 'approve_report' && !i.read);
    if (inboxItem) dispatch({ type: 'UPDATE_INBOX_ITEM', payload: { id: inboxItem.id, read: true } });
  };

  const openRejectModal = () => {
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = () => {
    const text = rejectReason.trim() ? 'Report rejected: ' + rejectReason.trim() : 'Report rejected';
    dispatch({ type: 'UPDATE_REPORT', payload: { id, status: 'open', isRetracted: true } });
    dispatch({ type: 'ADD_COMMENT', payload: {
      id: 'cmt_' + Date.now(), reportId: id, authorId: user.id, authorName: user.displayName,
      authorEmail: user.email, type: 'status_change', text, timestamp: new Date().toISOString()
    }});
    setShowRejectModal(false);
  };

  const handleSubmit = () => {
    dispatch({ type: 'UPDATE_REPORT', payload: { id, status: 'submitted', submittedDate: new Date().toISOString() } });
    dispatch({ type: 'ADD_COMMENT', payload: {
      id: 'cmt_' + Date.now(), reportId: id, authorId: user.id, authorName: user.displayName,
      authorEmail: user.email, type: 'status_change', text: 'Report submitted', timestamp: new Date().toISOString()
    }});
  };

  // Allow submit: report is open AND (created by current user OR current user is admin)
  const canSubmit = report.status === 'open' && (report.createdBy === user.id || user.role === 'admin');

  // Enforce preventSelfApproval: if policy requires it, approver cannot be same person as creator
  const selfApprovalBlocked = policy && policy.preventSelfApproval && report.createdBy === user.id;
  const canApprove = report.status === 'submitted' && report.submittedTo === user.id && !selfApprovalBlocked;

  return (
    <div>
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-card" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Reject Report</h2></div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Reason (optional)</label>
                <textarea className="form-textarea" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Provide a reason for rejection..." />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleReject}>Reject Report</button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowRejectModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="btn-link" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => navigate('/reports' + qsStr)}>
        <ArrowLeft size={16} /> Back to Reports
      </button>

      <div className="report-detail-header">
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span className={'status-badge ' + report.status} style={{ fontSize: 13, padding: '4px 14px' }}>{report.status}</span>
            <span style={{ color: '#8B959E', fontSize: 13 }}>ID: {report.reportNumber}</span>
            <span style={{ color: '#8B959E', fontSize: 13 }}>Policy: {report.policyName}</span>
          </div>
          <h1 className="report-detail-title">{report.title}</h1>
          <div className="report-detail-meta">
            From: {report.createdByName} &middot; Date: {formatDate(report.startDate)} to {formatDate(report.endDate)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="report-detail-total">{formatAmount(report.total)}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {canApprove && <>
              <button className="btn btn-primary" onClick={handleApprove}>Approve</button>
              <button className="btn btn-danger" onClick={openRejectModal}>Reject</button>
            </>}
            {selfApprovalBlocked && report.status === 'submitted' && report.submittedTo === user.id && (
              <span style={{ fontSize: 12, color: '#D93025', alignSelf: 'center' }}>Self-approval is not allowed by policy</span>
            )}
            {canSubmit && <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>}
          </div>
        </div>
      </div>

      <table className="data-table" style={{ marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Merchant</th>
            <th style={{ width: 40 }}></th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(exp => (
            <tr key={exp.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedExpense(exp)}>
              <td style={{ fontSize: 13, color: '#8B959E' }}>{formatDate(exp.date)}</td>
              <td style={{ fontWeight: 500 }}>{exp.merchant}</td>
              <td>{exp.hasReceipt && <Receipt size={14} style={{ color: '#8B959E' }} />}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatAmount(exp.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>Total</td>
            <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16 }}>{formatAmount(report.total)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="comments-section">
        <div className="comments-title">Report History &amp; Comments</div>
        {comments.map(c => (
          <div key={c.id} className="comment-entry">
            <CommentAvatar authorName={c.authorName} />
            <div className="comment-body">
              <div className="comment-time">{c.authorName} &middot; {formatDate(c.timestamp)}</div>
              <div className={'comment-text' + (c.type !== 'comment' ? ' system' : '')}>{c.text}</div>
            </div>
          </div>
        ))}
        <div className="comment-input-area">
          <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." />
          <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={handleAddComment}>Add Comment</button>
        </div>
      </div>

      {expenses.some(e => e.hasReceipt) && (
        <div style={{ marginTop: 32 }}>
          <div className="comments-title">Receipt Thumbnails</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {expenses.filter(e => e.hasReceipt).map(e => (
              <div key={e.id} style={{ border: '1px solid var(--border-color)', borderRadius: 4, width: 150, padding: 8, cursor: 'pointer' }} onClick={() => setSelectedExpense(e)}>
                {e.receiptUrl ? (
                  <img src={e.receiptUrl} alt="receipt" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }} />
                ) : (
                  <div style={{ width: '100%', height: 120, background: '#F0F2F5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B959E', marginBottom: 8 }}>
                    <Receipt size={24} />
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#8B959E' }}>{formatDate(e.date)}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{e.merchant}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{formatAmount(e.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedExpense && (
        <ExpenseDetailModal expense={selectedExpense} onClose={() => setSelectedExpense(null)} />
      )}
    </div>
  );
}
