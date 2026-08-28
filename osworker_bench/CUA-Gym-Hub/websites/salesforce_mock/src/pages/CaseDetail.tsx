
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '../components/Modal';
import { Case } from '../types';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { InlineEdit } from '../components/InlineEdit';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

interface CaseDetailProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ onShowToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateState } = useApp();
  const [activeTab, setActiveTab] = useState('details');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState({
    subject: '',
    status: '',
    priority: '',
    origin: '',
    description: ''
  });

  const caseItem = state.cases.find(c => c.caseId === id);
  const account = state.accounts.find(a => a.accountId === caseItem?.accountId);
  const contact = state.contacts.find(c => c.contactId === caseItem?.contactId);
  const owner = state.users.find(u => u.userId === caseItem?.ownerId);

  useRecentlyViewed('Case', caseItem?.caseId, caseItem ? `${caseItem.caseNumber} - ${caseItem.subject}` : undefined, `/cases/${id}`);

  if (!caseItem) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Case Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The case you're looking for doesn't exist or may have been deleted.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/cases')}>
          Back to Cases
        </button>
      </div>
    );
  }

  const handleEdit = () => {
    setEditData({
      subject: caseItem.subject,
      status: caseItem.status,
      priority: caseItem.priority,
      origin: caseItem.origin,
      description: caseItem.description
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    const updatedCases = state.cases.map(c =>
      c.caseId === id
        ? { ...c, ...editData, status: editData.status as Case['status'], priority: editData.priority as Case['priority'], modifiedDate: new Date().toISOString() }
        : c
    );
    updateState({ cases: updatedCases });
    setShowEditModal(false);
    onShowToast('Case updated successfully', 'success');
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const updatedCases = state.cases.filter(c => c.caseId !== id);
    updateState({ cases: updatedCases });
    onShowToast('Case deleted successfully', 'success');
    navigate('/cases');
  };

  const updateCaseField = (fieldName: string, displayName: string) => (value: string | number) => {
    const updatedCases = state.cases.map(c =>
      c.caseId === id
        ? { ...c, [fieldName]: value, modifiedDate: new Date().toISOString() }
        : c
    );
    updateState({ cases: updatedCases });
    onShowToast(`${displayName} updated`, 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
              {caseItem.caseNumber}
            </h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className={`badge badge-${caseItem.status.toLowerCase()}`}>{caseItem.status}</span>
              <span className="badge badge-warning">{caseItem.priority}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={handleEdit}>
              <Edit size={18} />
              Edit
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['details', 'activity', 'related'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 0', background: 'none', border: 'none',
                  borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'details' && (
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Case Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Case Number</label>
                <div>{caseItem.caseNumber}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Subject</label>
                <InlineEdit value={caseItem.subject} fieldName="Subject" fieldType="text" onSave={updateCaseField('subject', 'Subject')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Status</label>
                <InlineEdit value={caseItem.status} fieldName="Status" fieldType="select" options={['New', 'Working', 'Escalated', 'Closed']} onSave={updateCaseField('status', 'Status')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Priority</label>
                <InlineEdit value={caseItem.priority} fieldName="Priority" fieldType="select" options={['Low', 'Medium', 'High', 'Critical']} onSave={updateCaseField('priority', 'Priority')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Case Origin</label>
                <InlineEdit value={caseItem.origin} fieldName="Origin" fieldType="select" options={['Phone', 'Email', 'Web', 'Chat']} onSave={updateCaseField('origin', 'Origin')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Account Name</label>
                <div>{account?.name}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Contact Name</label>
                <div>{contact ? `${contact.firstName} ${contact.lastName}` : '—'}</div>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Description</label>
              <InlineEdit value={caseItem.description} fieldName="Description" fieldType="textarea" onSave={updateCaseField('description', 'Description')} />
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>System Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Created Date</label>
                <div>{format(new Date(caseItem.createdDate), 'MMM d, yyyy h:mm a')}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Last Modified</label>
                <div>{format(new Date(caseItem.modifiedDate), 'MMM d, yyyy h:mm a')}</div>
              </div>
              {caseItem.closedDate && (
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Closed Date</label>
                  <div>{format(new Date(caseItem.closedDate), 'MMM d, yyyy h:mm a')}</div>
                </div>
              )}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Owner</label>
                <div>{owner?.firstName} {owner?.lastName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'activity' && (
        <ActivityTimeline relatedToType="Case" relatedToId={caseItem.caseId} onShowToast={onShowToast} />
      )}

      {activeTab === 'related' && (
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Activities</h3>
                <span style={{
                  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px',
                  padding: '2px 8px', fontSize: '12px', color: 'var(--text-secondary)'
                }}>
                  {state.activities.filter(a => a.relatedToType === 'Case' && a.relatedToId === caseItem.caseId).length}
                </span>
              </div>
            </div>
            {state.activities.filter(a => a.relatedToType === 'Case' && a.relatedToId === caseItem.caseId).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No activities</p>
            ) : (
              <table className="table" style={{ fontSize: '13px' }}>
                <thead><tr><th>Subject</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {state.activities.filter(a => a.relatedToType === 'Case' && a.relatedToId === caseItem.caseId).slice(0, 5).map(a => (
                    <tr key={a.activityId}>
                      <td>{a.subject}</td>
                      <td>{a.type}</td>
                      <td><span className={`badge badge-${a.status === 'Completed' ? 'closed' : 'working'}`}>{a.status}</span></td>
                      <td>{a.dueDate ? format(new Date(a.dueDate), 'MMM d, yyyy') : a.startDateTime ? format(new Date(a.startDateTime), 'MMM d, yyyy') : '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Case">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input
              type="text"
              className="form-input"
              value={editData.subject}
              onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            >
              <option value="New">New</option>
              <option value="Working">Working</option>
              <option value="Escalated">Escalated</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={editData.priority}
              onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Case Origin</label>
            <select
              className="form-select"
              value={editData.origin}
              onChange={(e) => setEditData({ ...editData, origin: e.target.value })}
            >
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
              <option value="Web">Web</option>
              <option value="Chat">Chat</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveEdit}>
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Case">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>Are you sure you want to delete this case? This action cannot be undone.</p>
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: '4px'
          }}>
            <strong>{caseItem.caseNumber}</strong> - {caseItem.subject}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete}>
              Delete Case
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
