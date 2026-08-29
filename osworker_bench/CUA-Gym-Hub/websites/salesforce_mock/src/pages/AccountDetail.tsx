
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

interface AccountDetailProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const AccountDetail: React.FC<AccountDetailProps> = ({ onShowToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateState } = useApp();
  const [activeTab, setActiveTab] = useState('details');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    website: '',
    type: '',
    industry: '',
    revenue: 0,
    employees: 0
  });

  const account = state.accounts.find(a => a.accountId === id);
  const owner = state.users.find(u => u.userId === account?.ownerId);
  const contacts = state.contacts.filter(c => c.accountId === id);
  const opportunities = state.opportunities.filter(o => o.accountId === id);

  useRecentlyViewed('Account', account?.accountId, account?.name, `/accounts/${id}`);

  if (!account) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Account Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The account you're looking for doesn't exist or may have been deleted.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/accounts')}>
          Back to Accounts
        </button>
      </div>
    );
  }

  const handleEdit = () => {
    setEditData({
      name: account.name,
      phone: account.phone,
      website: account.website,
      type: account.type,
      industry: account.industry,
      revenue: account.revenue,
      employees: account.employees
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    const updatedAccounts = state.accounts.map(a =>
      a.accountId === id
        ? { ...a, ...editData, modifiedDate: new Date().toISOString() }
        : a
    );
    updateState({ accounts: updatedAccounts });
    setShowEditModal(false);
    onShowToast('Account updated successfully', 'success');
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const updatedAccounts = state.accounts.filter(a => a.accountId !== id);
    updateState({ accounts: updatedAccounts });
    onShowToast('Account deleted successfully', 'success');
    navigate('/accounts');
  };

  const updateAccountField = (fieldName: string, displayName: string) => (value: string | number) => {
    const updatedAccounts = state.accounts.map(a =>
      a.accountId === id
        ? { ...a, [fieldName]: value, modifiedDate: new Date().toISOString() }
        : a
    );
    updateState({ accounts: updatedAccounts });
    onShowToast(`${displayName} updated`, 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
              {account.name}
            </h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="badge badge-working">{account.type}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <img src={owner?.avatar} alt={owner?.firstName} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                {owner?.firstName} {owner?.lastName}
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
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Account Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Account Name</label>
                <InlineEdit value={account.name} fieldName="Account Name" fieldType="text" onSave={updateAccountField('name', 'Account Name')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Phone</label>
                <InlineEdit value={account.phone} fieldName="Phone" fieldType="text" onSave={updateAccountField('phone', 'Phone')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Website</label>
                <InlineEdit value={account.website} fieldName="Website" fieldType="text" onSave={updateAccountField('website', 'Website')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Type</label>
                <InlineEdit value={account.type} fieldName="Type" fieldType="select" options={['Prospect', 'Customer', 'Partner', 'Other']} onSave={updateAccountField('type', 'Type')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Industry</label>
                <InlineEdit value={account.industry} fieldName="Industry" fieldType="text" onSave={updateAccountField('industry', 'Industry')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Annual Revenue</label>
                <InlineEdit value={account.revenue} fieldName="Revenue" fieldType="number" onSave={updateAccountField('revenue', 'Revenue')} formatValue={(v) => `$${(Number(v) / 1000000).toFixed(1)}M`} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Employees</label>
                <InlineEdit value={account.employees} fieldName="Employees" fieldType="number" onSave={updateAccountField('employees', 'Employees')} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Contacts ({contacts.length})</h2>
            {contacts.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Title</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(contact => (
                    <tr key={contact.contactId}>
                      <td>{contact.firstName} {contact.lastName}</td>
                      <td>{contact.title}</td>
                      <td>{contact.email}</td>
                      <td>{contact.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No contacts found</p>
            )}
          </div>

          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Opportunities ({opportunities.length})</h2>
            {opportunities.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Stage</th>
                    <th>Close Date</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map(opp => (
                    <tr key={opp.opportunityId}>
                      <td>{opp.name}</td>
                      <td>${(opp.amount / 1000).toFixed(0)}K</td>
                      <td><span className="badge badge-working">{opp.stage}</span></td>
                      <td>{format(new Date(opp.closeDate), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No opportunities found</p>
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>System Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Created Date</label>
                <div>{format(new Date(account.createdDate), 'MMM d, yyyy h:mm a')}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Last Modified</label>
                <div>{format(new Date(account.modifiedDate), 'MMM d, yyyy h:mm a')}</div>
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
        <ActivityTimeline relatedToType="Account" relatedToId={account.accountId} onShowToast={onShowToast} />
      )}

      {activeTab === 'related' && (
        <div>
          <RelatedList
            title="Contacts"
            columns={[
              { key: 'name', label: 'Name', render: (_v: any, row: any) => `${row.firstName} ${row.lastName}` },
              { key: 'title', label: 'Title' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
            ]}
            data={contacts}
            idKey="contactId"
            linkPrefix="/contacts"
            nameKey="firstName"
          />
          <RelatedList
            title="Opportunities"
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'amount', label: 'Amount', render: (v: number) => `$${(v / 1000).toFixed(0)}K` },
              { key: 'stage', label: 'Stage', render: (v: string) => <span className="badge badge-working">{v}</span> },
              { key: 'closeDate', label: 'Close Date', render: (v: string) => format(new Date(v), 'MMM d, yyyy') },
            ]}
            data={opportunities}
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
            data={state.cases.filter(c => c.accountId === id)}
            idKey="caseId"
            linkPrefix="/cases"
            nameKey="caseNumber"
          />
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Account Name *</label>
            <input
              type="text"
              className="form-input"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
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
            <label className="form-label">Website</label>
            <input
              type="url"
              className="form-input"
              value={editData.website}
              onChange={(e) => setEditData({ ...editData, website: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={editData.type}
              onChange={(e) => setEditData({ ...editData, type: e.target.value })}
            >
              <option value="Prospect">Prospect</option>
              <option value="Customer">Customer</option>
              <option value="Partner">Partner</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Industry</label>
            <input
              type="text"
              className="form-input"
              value={editData.industry}
              onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Annual Revenue</label>
            <input
              type="number"
              className="form-input"
              value={editData.revenue}
              onChange={(e) => setEditData({ ...editData, revenue: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Employees</label>
            <input
              type="number"
              className="form-input"
              value={editData.employees}
              onChange={(e) => setEditData({ ...editData, employees: parseInt(e.target.value) || 0 })}
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
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>Are you sure you want to delete this account? This action cannot be undone.</p>
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: '4px'
          }}>
            <strong>{account.name}</strong>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete}>
              Delete Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
