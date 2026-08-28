
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { Save, ArrowLeft } from 'lucide-react';

interface PartnerDetailProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const PartnerDetail: React.FC<PartnerDetailProps> = ({ onShowToast }) => {
  const { id: partnerId } = useParams<{ id: string }>();
  const { state, updateState } = useApp();
  const partners = state.partners ?? [];

  const partner = partners.find(p => p.partnerId === partnerId);

  const [editFields, setEditFields] = useState<any>({
    name: partner?.name || '',
    stage: partner?.stage || 'Prospect',
    nextAction: partner?.nextAction || '',
    nextActionDate: partner?.nextActionDate || '',
    notes: partner?.notes || '',
    coMarketingStatus: partner?.coMarketingStatus || 'Not Started',
    primaryContact: partner?.primaryContact || '',
    contactEmail: partner?.contactEmail || '',
    dealRegistration: partner?.dealRegistration || 'Disabled',
  });
  const [isEditing, setIsEditing] = useState(false);

  if (!partner) {
    return (
      <div>
        <Link to="/partners" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary)', textDecoration: 'none' }}>
          <ArrowLeft size={18} />
          Back to Partners
        </Link>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Partner not found.</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    const updated = partners.map(p =>
      p.partnerId === partnerId
        ? {
            ...p,
            name: editFields.name,
            stage: editFields.stage,
            nextAction: editFields.nextAction,
            nextActionDate: editFields.nextActionDate,
            notes: editFields.notes,
            coMarketingStatus: editFields.coMarketingStatus,
            primaryContact: editFields.primaryContact,
            contactEmail: editFields.contactEmail,
            dealRegistration: editFields.dealRegistration,
            modifiedDate: new Date().toISOString(),
          }
        : p
    );
    updateState({ partners: updated });
    setIsEditing(false);
    onShowToast('Partner updated successfully', 'success');
  };

  const owner = state.users.find(u => u.userId === partner.ownerId);

  return (
    <div>
      <Link to="/partners" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary)', textDecoration: 'none' }}>
        <ArrowLeft size={18} />
        Back to Partners
      </Link>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600 }}>
              {partner.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>{partner.name}</h1>
              <span className={`badge badge-${partner.stage.toLowerCase().replace(' ', '-')}`}>{partner.stage}</span>
            </div>
          </div>
          <button
            className={isEditing ? "btn btn-primary" : "btn btn-secondary"}
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
                setEditFields({
                  name: partner.name,
                  stage: partner.stage,
                  nextAction: partner.nextAction,
                  nextActionDate: partner.nextActionDate,
                  notes: partner.notes,
                  coMarketingStatus: partner.coMarketingStatus,
                  primaryContact: partner.primaryContact,
                  contactEmail: partner.contactEmail,
                  dealRegistration: partner.dealRegistration,
                });
              }
            }}
          >
            <Save size={18} />
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>Partner Information</h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Partner Name</label>
              {isEditing ? (
                <input type="text" className="form-input" value={editFields.name} onChange={e => setEditFields({ ...editFields, name: e.target.value })} />
              ) : (
                <div style={{ fontSize: '14px' }}>{partner.name}</div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Partner Stage</label>
              {isEditing ? (
                <select className="form-select" value={editFields.stage} onChange={e => setEditFields({ ...editFields, stage: e.target.value })}>
                  <option value="Prospect">Prospect</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Contract Sent">Contract Sent</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              ) : (
                <span className={`badge badge-${partner.stage.toLowerCase().replace(' ', '-')}`}>{partner.stage}</span>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Next Action</label>
              {isEditing ? (
                <input type="text" className="form-input" value={editFields.nextAction} onChange={e => setEditFields({ ...editFields, nextAction: e.target.value })} />
              ) : (
                <div style={{ fontSize: '14px' }}>{partner.nextAction || '-'}</div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Next Action Date</label>
              {isEditing ? (
                <input type="date" className="form-input" value={editFields.nextActionDate ? editFields.nextActionDate.split('T')[0] : ''} onChange={e => setEditFields({ ...editFields, nextActionDate: e.target.value ? new Date(e.target.value).toISOString() : '' })} />
              ) : (
                <div style={{ fontSize: '14px' }}>{partner.nextActionDate ? new Date(partner.nextActionDate).toLocaleDateString() : '-'}</div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Co-Marketing Status</label>
              {isEditing ? (
                <select className="form-select" value={editFields.coMarketingStatus} onChange={e => setEditFields({ ...editFields, coMarketingStatus: e.target.value })}>
                  <option value="Not Started">Not Started</option>
                  <option value="Interested">Interested</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="Committed">Committed</option>
                  <option value="Complete">Complete</option>
                </select>
              ) : (
                <span className={`badge badge-${partner.coMarketingStatus.toLowerCase().replace(' ', '-')}`}>{partner.coMarketingStatus}</span>
              )}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>Contact & Additional Info</h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Primary Contact</label>
              {isEditing ? (
                <input type="text" className="form-input" value={editFields.primaryContact} onChange={e => setEditFields({ ...editFields, primaryContact: e.target.value })} />
              ) : (
                <div style={{ fontSize: '14px' }}>{partner.primaryContact || '-'}</div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Contact Email</label>
              {isEditing ? (
                <input type="email" className="form-input" value={editFields.contactEmail} onChange={e => setEditFields({ ...editFields, contactEmail: e.target.value })} />
              ) : (
                <div style={{ fontSize: '14px' }}>{partner.contactEmail || '-'}</div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Deal Registration</label>
              {isEditing ? (
                <select className="form-select" value={editFields.dealRegistration} onChange={e => setEditFields({ ...editFields, dealRegistration: e.target.value })}>
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                  <option value="Pending">Pending</option>
                </select>
              ) : (
                <div style={{ fontSize: '14px' }}>{partner.dealRegistration}</div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Owner</label>
              <div style={{ fontSize: '14px' }}>{owner?.firstName} {owner?.lastName}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>Notes</h3>
          {isEditing ? (
            <textarea className="form-input" style={{ minHeight: '120px', width: '100%' }} value={editFields.notes} onChange={e => setEditFields({ ...editFields, notes: e.target.value })} />
          ) : (
            <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{partner.notes || '-'}</div>
          )}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '24px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div>Created: {new Date(partner.createdDate).toLocaleDateString()}</div>
          <div>Modified: {new Date(partner.modifiedDate).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
};
