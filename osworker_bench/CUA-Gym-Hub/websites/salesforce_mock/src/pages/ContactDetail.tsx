
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '../components/Modal';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { RelatedList } from '../components/RelatedList';
import { InlineEdit } from '../components/InlineEdit';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

interface ContactDetailProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ContactDetail: React.FC<ContactDetailProps> = ({ onShowToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateState } = useApp();
  const [activeTab, setActiveTab] = useState('details');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    department: '',
    email: '',
    phone: '',
    mobile: ''
  });

  const contact = state.contacts.find(c => c.contactId === id);
  const account = state.accounts.find(a => a.accountId === contact?.accountId);
  const owner = state.users.find(u => u.userId === contact?.ownerId);

  useRecentlyViewed('Contact', contact?.contactId, contact ? `${contact.firstName} ${contact.lastName}` : undefined, `/contacts/${id}`);

  if (!contact) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Contact Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The contact you're looking for doesn't exist or may have been deleted.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/contacts')}>
          Back to Contacts
        </button>
      </div>
    );
  }

  const handleEdit = () => {
    setEditData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      title: contact.title,
      department: contact.department,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    const updatedContacts = state.contacts.map(c =>
      c.contactId === id
        ? { ...c, ...editData, modifiedDate: new Date().toISOString() }
        : c
    );
    updateState({ contacts: updatedContacts });
    setShowEditModal(false);
    onShowToast('Contact updated successfully', 'success');
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const updatedContacts = state.contacts.filter(c => c.contactId !== id);
    updateState({ contacts: updatedContacts });
    onShowToast('Contact deleted successfully', 'success');
    navigate('/contacts');
  };

  const updateContactField = (fieldName: string, displayName: string) => (value: string | number) => {
    const updatedContacts = state.contacts.map(c =>
      c.contactId === id
        ? { ...c, [fieldName]: value, modifiedDate: new Date().toISOString() }
        : c
    );
    updateState({ contacts: updatedContacts });
    onShowToast(`${displayName} updated`, 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
              {contact.firstName} {contact.lastName}
            </h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {contact.title} at {account?.name}
              </div>
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
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Contact Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>First Name</label>
                <InlineEdit value={contact.firstName} fieldName="First Name" fieldType="text" onSave={updateContactField('firstName', 'First Name')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Last Name</label>
                <InlineEdit value={contact.lastName} fieldName="Last Name" fieldType="text" onSave={updateContactField('lastName', 'Last Name')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Account Name</label>
                <div>{account?.name}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Title</label>
                <InlineEdit value={contact.title} fieldName="Title" fieldType="text" onSave={updateContactField('title', 'Title')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Department</label>
                <InlineEdit value={contact.department} fieldName="Department" fieldType="text" onSave={updateContactField('department', 'Department')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email</label>
                <InlineEdit value={contact.email} fieldName="Email" fieldType="email" onSave={updateContactField('email', 'Email')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Phone</label>
                <InlineEdit value={contact.phone} fieldName="Phone" fieldType="text" onSave={updateContactField('phone', 'Phone')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Mobile</label>
                <InlineEdit value={contact.mobile} fieldName="Mobile" fieldType="text" onSave={updateContactField('mobile', 'Mobile')} />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Address Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Street</label>
                <InlineEdit value={contact.mailingStreet} fieldName="Street" fieldType="text" onSave={updateContactField('mailingStreet', 'Street')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>City</label>
                <InlineEdit value={contact.mailingCity} fieldName="City" fieldType="text" onSave={updateContactField('mailingCity', 'City')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>State</label>
                <InlineEdit value={contact.mailingState} fieldName="State" fieldType="text" onSave={updateContactField('mailingState', 'State')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Zip Code</label>
                <InlineEdit value={contact.mailingZip} fieldName="Zip Code" fieldType="text" onSave={updateContactField('mailingZip', 'Zip Code')} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>System Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Created Date</label>
                <div>{format(new Date(contact.createdDate), 'MMM d, yyyy h:mm a')}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Last Modified</label>
                <div>{format(new Date(contact.modifiedDate), 'MMM d, yyyy h:mm a')}</div>
              </div>
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
        <ActivityTimeline relatedToType="Contact" relatedToId={contact.contactId} onShowToast={onShowToast} />
      )}

      {activeTab === 'related' && (
        <div>
          <RelatedList
            title="Opportunities"
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'amount', label: 'Amount', render: (v: number) => `$${(v / 1000).toFixed(0)}K` },
              { key: 'stage', label: 'Stage', render: (v: string) => <span className="badge badge-working">{v}</span> },
              { key: 'closeDate', label: 'Close Date', render: (v: string) => format(new Date(v), 'MMM d, yyyy') },
            ]}
            data={state.opportunities.filter(o => o.accountId === contact.accountId)}
            idKey="opportunityId"
            linkPrefix="/opportunities"
            nameKey="name"
          />
          <RelatedList
            title="Cases"
            columns={[
              { key: 'caseNumber', label: 'Case Number' },
              { key: 'subject', label: 'Subject' },
              { key: 'status', label: 'Status', render: (v: string) => <span className={`badge badge-${v.toLowerCase()}`}>{v}</span> },
              { key: 'priority', label: 'Priority' },
            ]}
            data={state.cases.filter(c => c.contactId === contact.contactId)}
            idKey="caseId"
            linkPrefix="/cases"
            nameKey="caseNumber"
          />
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Contact">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input
              type="text"
              className="form-input"
              value={editData.firstName}
              onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input
              type="text"
              className="form-input"
              value={editData.lastName}
              onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-input"
              value={editData.department}
              onChange={(e) => setEditData({ ...editData, department: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-input"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile</label>
            <input
              type="tel"
              className="form-input"
              value={editData.mobile}
              onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
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
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Contact">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>Are you sure you want to delete this contact? This action cannot be undone.</p>
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: '4px'
          }}>
            <strong>{contact.firstName} {contact.lastName}</strong> from <strong>{account?.name}</strong>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete}>
              Delete Contact
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
