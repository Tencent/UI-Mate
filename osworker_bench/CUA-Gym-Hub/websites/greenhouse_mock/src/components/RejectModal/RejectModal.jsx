import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

export default function RejectModal({ application, candidate, onClose }) {
  const { state, dispatch } = useAppContext();
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(false);

  const handleReject = () => {
    if (!reason) return;
    const now = new Date().toISOString();

    dispatch({
      type: 'REJECT_APPLICATION',
      payload: { applicationId: application.id, rejectionReason: reason, notes }
    });

    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: uuidv4(),
        candidateId: candidate.id,
        applicationId: application.id,
        type: 'rejection',
        actorId: state.currentUser.id,
        description: `${candidate.name} rejected: ${reason}`,
        metadata: { reason },
        createdAt: now
      }
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title">Reject {candidate.name}?</h2>
          <button aria-label="Close dialog" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label" htmlFor="reject-reason">Rejection Reason *</label>
            <select id="reject-reason" className="form-select" value={reason} onChange={e => setReason(e.target.value)}>
              <option value="">Select a reason...</option>
              {state.rejectionReasons.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reject-notes">Notes (optional)</label>
            <textarea
              id="reject-notes"
              className="form-textarea"
              placeholder="Additional notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} />
            Send rejection email to candidate
          </label>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-danger-solid"
            onClick={handleReject}
            disabled={!reason}
            style={{ opacity: !reason ? 0.5 : 1 }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
