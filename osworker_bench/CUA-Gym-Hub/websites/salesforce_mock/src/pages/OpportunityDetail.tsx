
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '../components/Modal';
import { Opportunity } from '../types';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { RelatedList } from '../components/RelatedList';
import { SalesPath } from '../components/SalesPath';
import { InlineEdit } from '../components/InlineEdit';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

interface OpportunityDetailProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const OpportunityDetail: React.FC<OpportunityDetailProps> = ({ onShowToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateState } = useApp();
  const [activeTab, setActiveTab] = useState('details');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    amount: 0,
    closeDate: '',
    stage: '',
    probability: 0,
    type: '',
    nextStep: ''
  });

  const opportunity = state.opportunities.find(o => o.opportunityId === id);
  const account = state.accounts.find(a => a.accountId === opportunity?.accountId);
  const owner = state.users.find(u => u.userId === opportunity?.ownerId);

  useRecentlyViewed('Opportunity', opportunity?.opportunityId, opportunity?.name, `/opportunities/${id}`);

  if (!opportunity) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Opportunity Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The opportunity you're looking for doesn't exist or may have been deleted.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/opportunities')}>
          Back to Opportunities
        </button>
      </div>
    );
  }

  const stages = ['Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  const STAGE_PROBABILITIES: Record<string, number> = {
    'Prospecting': 10,
    'Qualification': 20,
    'Needs Analysis': 30,
    'Value Proposition': 50,
    'Proposal': 60,
    'Negotiation': 80,
    'Closed Won': 100,
    'Closed Lost': 0,
  };

  const stageDetails: Record<string, { fields?: { label: string; type: 'checkbox' | 'text' }[] }> = {
    'Prospecting': { fields: [{ label: 'Initial Contact Made', type: 'checkbox' }] },
    'Qualification': { fields: [{ label: 'Budget Confirmed?', type: 'checkbox' }, { label: 'Decision Maker Identified?', type: 'checkbox' }] },
    'Needs Analysis': { fields: [{ label: 'Requirements Documented', type: 'checkbox' }, { label: 'Pain Points Identified', type: 'checkbox' }] },
    'Value Proposition': { fields: [{ label: 'ROI Presented', type: 'checkbox' }] },
    'Proposal': { fields: [{ label: 'Proposal Sent Date', type: 'text' }, { label: 'Proposal Approved', type: 'checkbox' }] },
    'Negotiation': { fields: [{ label: 'Contract Sent', type: 'checkbox' }, { label: 'Discount Approved', type: 'checkbox' }] },
    'Closed Won': { fields: [{ label: 'Contract Signed Date', type: 'text' }] },
    'Closed Lost': { fields: [{ label: 'Loss Reason', type: 'text' }] },
  };

  const handleStageChange = (newStage: string) => {
    const updatedOpportunities = state.opportunities.map(o =>
      o.opportunityId === id
        ? { ...o, stage: newStage as Opportunity['stage'], probability: STAGE_PROBABILITIES[newStage] ?? o.probability, modifiedDate: new Date().toISOString() }
        : o
    );
    updateState({ opportunities: updatedOpportunities });
    if (newStage === 'Closed Won') {
      onShowToast('Congratulations! Deal closed!', 'success');
    } else {
      onShowToast(`Stage updated to ${newStage}`, 'success');
    }
  };

  const updateOppField = (fieldName: string, displayName: string) => (value: string | number) => {
    const updatedOpportunities = state.opportunities.map(o =>
      o.opportunityId === id
        ? { ...o, [fieldName]: value, modifiedDate: new Date().toISOString() }
        : o
    );
    updateState({ opportunities: updatedOpportunities });
    onShowToast(`${displayName} updated`, 'success');
  };

  const handleEdit = () => {
    setEditData({
      name: opportunity.name,
      amount: opportunity.amount,
      closeDate: opportunity.closeDate.split('T')[0],
      stage: opportunity.stage,
      probability: opportunity.probability,
      type: opportunity.type,
      nextStep: opportunity.nextStep
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    const updatedOpportunities = state.opportunities.map(o =>
      o.opportunityId === id
        ? { ...o, ...editData, stage: editData.stage as Opportunity['stage'], modifiedDate: new Date().toISOString() }
        : o
    );
    updateState({ opportunities: updatedOpportunities });
    setShowEditModal(false);
    onShowToast('Opportunity updated successfully', 'success');
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const updatedOpportunities = state.opportunities.filter(o => o.opportunityId !== id);
    updateState({ opportunities: updatedOpportunities });
    onShowToast('Opportunity deleted successfully', 'success');
    navigate('/opportunities');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
              {opportunity.name}
            </h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="badge badge-working">{opportunity.stage}</span>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                ${(opportunity.amount / 1000).toFixed(0)}K • {opportunity.probability}%
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

        <SalesPath
          stages={stages}
          currentStage={opportunity.stage}
          onStageChange={handleStageChange}
          stageDetails={stageDetails}
          closedWonStage="Closed Won"
        />

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
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Opportunity Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Opportunity Name</label>
                <InlineEdit value={opportunity.name} fieldName="Opportunity Name" fieldType="text" onSave={updateOppField('name', 'Opportunity Name')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Account Name</label>
                <div>{account?.name}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Amount</label>
                <InlineEdit value={opportunity.amount} fieldName="Amount" fieldType="number" onSave={updateOppField('amount', 'Amount')} formatValue={(v) => `$${Number(v).toLocaleString()}`} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Close Date</label>
                <InlineEdit value={opportunity.closeDate.split('T')[0]} fieldName="Close Date" fieldType="date" onSave={updateOppField('closeDate', 'Close Date')} displayValue={format(new Date(opportunity.closeDate), 'MMM d, yyyy')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Stage</label>
                <InlineEdit value={opportunity.stage} fieldName="Stage" fieldType="select" options={stages} onSave={updateOppField('stage', 'Stage')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Probability</label>
                <InlineEdit value={opportunity.probability} fieldName="Probability" fieldType="number" onSave={updateOppField('probability', 'Probability')} formatValue={(v) => `${v}%`} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Type</label>
                <InlineEdit value={opportunity.type} fieldName="Type" fieldType="select" options={['New Business', 'Existing Business', 'Renewal']} onSave={updateOppField('type', 'Type')} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Lead Source</label>
                <InlineEdit value={opportunity.leadSource} fieldName="Lead Source" fieldType="select" options={['Website', 'Referral', 'Trade Show', 'Cold Call', 'LinkedIn', 'Email Campaign']} onSave={updateOppField('leadSource', 'Lead Source')} />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Next Step</label>
              <InlineEdit value={opportunity.nextStep} fieldName="Next Step" fieldType="text" onSave={updateOppField('nextStep', 'Next Step')} />
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Description</label>
              <InlineEdit value={opportunity.description} fieldName="Description" fieldType="textarea" onSave={updateOppField('description', 'Description')} />
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>System Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Created Date</label>
                <div>{format(new Date(opportunity.createdDate), 'MMM d, yyyy h:mm a')}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Last Modified</label>
                <div>{format(new Date(opportunity.modifiedDate), 'MMM d, yyyy h:mm a')}</div>
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
        <ActivityTimeline relatedToType="Opportunity" relatedToId={opportunity.opportunityId} onShowToast={onShowToast} />
      )}

      {activeTab === 'related' && (
        <div>
          <RelatedList
            title="Contact Roles"
            columns={[
              { key: 'name', label: 'Name', render: (_v: any, row: any) => `${row.firstName} ${row.lastName}` },
              { key: 'title', label: 'Title' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
            ]}
            data={state.contacts.filter(c => c.accountId === opportunity.accountId)}
            idKey="contactId"
            linkPrefix="/contacts"
            nameKey="firstName"
          />
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Opportunity">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Opportunity Name *</label>
            <input
              type="text"
              className="form-input"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-input"
              value={editData.amount}
              onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Close Date</label>
            <input
              type="date"
              className="form-input"
              value={editData.closeDate}
              onChange={(e) => setEditData({ ...editData, closeDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Stage</label>
            <select
              className="form-select"
              value={editData.stage}
              onChange={(e) => setEditData({ ...editData, stage: e.target.value })}
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Probability (%)</label>
            <input
              type="number"
              className="form-input"
              value={editData.probability}
              onChange={(e) => setEditData({ ...editData, probability: parseInt(e.target.value) || 0 })}
              min="0"
              max="100"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={editData.type}
              onChange={(e) => setEditData({ ...editData, type: e.target.value })}
            >
              <option value="New Business">New Business</option>
              <option value="Existing Business">Existing Business</option>
              <option value="Renewal">Renewal</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Next Step</label>
            <input
              type="text"
              className="form-input"
              value={editData.nextStep}
              onChange={(e) => setEditData({ ...editData, nextStep: e.target.value })}
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
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Opportunity">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>Are you sure you want to delete this opportunity? This action cannot be undone.</p>
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: '4px'
          }}>
            <strong>{opportunity.name}</strong> - ${opportunity.amount.toLocaleString()}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete}>
              Delete Opportunity
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
