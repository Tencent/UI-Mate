import React, { useState, useRef } from 'react';
import { useAppState } from '../context/AppContext';
import { formatCurrency } from '../utils/dataManager';
import StatusBadge from '../components/StatusBadge';
import { AlertCircle, Upload, CheckCircle, Paperclip } from 'lucide-react';

function formatDate(ts) {
  if (!ts) return '—';
  const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Disputes() {
  const { state, dispatch } = useAppState();
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [evidenceSubmitted, setEvidenceSubmitted] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files.map(f => f.name)]);
  }

  function handleUploadZoneClick() {
    fileInputRef.current?.click();
  }

  function handleUploadZoneDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('upload-zone-active');
    const files = Array.from(e.dataTransfer.files || []);
    setUploadedFiles(prev => [...prev, ...files.map(f => f.name)]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('upload-zone-active');
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove('upload-zone-active');
  }

  function handleOpenModal(dispute) {
    setSelectedDispute(dispute);
    setExplanation('');
    setUploadedFiles([]);
  }

  function handleCloseModal() {
    setSelectedDispute(null);
    setEvidenceSubmitted(false);
    setExplanation('');
    setUploadedFiles([]);
  }

  const handleSubmitEvidence = (e) => {
    e.preventDefault();
    if (!explanation.trim()) return;

    // Update the dispute status in state
    dispatch({
      type: 'UPDATE_DISPUTE',
      payload: {
        id: selectedDispute.id,
        updates: {
          status: 'under_review',
          evidence_submitted_at: Math.floor(Date.now() / 1000),
        },
      },
    });

    setEvidenceSubmitted(true);
    setTimeout(() => {
      handleCloseModal();
    }, 1800);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Disputes</h1>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Payment ID</th>
              <th>Evidence Due</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.disputes.map(dispute => (
              <tr key={dispute.id}>
                <td className="font-mono">
                  {formatCurrency(dispute.amount)}
                </td>
                <td>
                  <StatusBadge status={dispute.status} />
                </td>
                <td style={{ textTransform: 'capitalize' }}>
                  {(dispute.reason || '').replace(/_/g, ' ')}
                </td>
                <td className="font-mono" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {dispute.charge}
                </td>
                <td style={{ color: 'var(--color-text-secondary)' }}>
                  {formatDate(dispute.evidence_due_by)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {dispute.status === 'needs_response' && (
                    <button
                      onClick={() => handleOpenModal(dispute)}
                      className="btn-link"
                    >
                      Respond
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {state.disputes.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-secondary)' }}>
                  No disputes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedDispute && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {evidenceSubmitted ? (
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <CheckCircle size={48} style={{ color: 'var(--color-success)', margin: '0 auto 16px' }} />
                <h3 className="modal-title">Evidence Submitted</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}>The dispute evidence has been uploaded successfully. Status changed to <strong>Under Review</strong>.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '24px 24px 0' }}>
                  <div style={{ padding: 8, background: '#FEF3C7', borderRadius: '50%', color: '#D97706' }}>
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="modal-title">Respond to Dispute</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginTop: 4 }}>
                      Payment ID: <span className="font-mono">{selectedDispute.charge}</span>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitEvidence}>
                  <div style={{ padding: '16px 24px' }}>
                    <div style={{ marginBottom: 16 }}>
                      <label className="form-label">Explanation *</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Explain why this charge is valid..."
                        required
                        style={{ height: 96 }}
                        value={explanation}
                        onChange={e => setExplanation(e.target.value)}
                      ></textarea>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label className="form-label">Evidence Files</label>
                      <div
                        className="upload-zone"
                        onClick={handleUploadZoneClick}
                        onDrop={handleUploadZoneDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          tabIndex={-1}
                        />
                        <Upload size={24} style={{ color: 'var(--color-text-muted)', marginBottom: 8 }} />
                        <p style={{ fontSize: 13, fontWeight: 500 }}>Click to upload documents</p>
                        <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>PDF, JPG, or PNG (max 5MB)</p>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {uploadedFiles.map((name, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                              <Paperclip size={12} />
                              <span>{name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-actions" style={{ padding: '0 24px 24px' }}>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Submit Evidence
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
