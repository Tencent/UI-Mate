
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Edit, Trash2, Mail, Phone, Copy, RefreshCw, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '../components/Modal';
import { Lead } from '../types';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { SalesPath } from '../components/SalesPath';
import { InlineEdit } from '../components/InlineEdit';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

interface LeadDetailProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({ onShowToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, updateState } = useApp();
  const [activeTab, setActiveTab] = useState('details');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [convertData, setConvertData] = useState({
    createAccount: true,
    accountName: '',
    createContact: true,
    createOpportunity: true,
    opportunityName: '',
    amount: '',
    closeDate: '',
    stage: 'Prospecting'
  });
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    title: '',
    email: '',
    phone: '',
    status: '',
    rating: ''
  });

  const lead = state.leads.find(l => l.leadId === id);
  const owner = state.users.find(u => u.userId === lead?.ownerId);

  useRecentlyViewed('Lead', lead?.leadId, lead ? `${lead.firstName} ${lead.lastName}` : undefined, `/leads/${id}`);

  if (!lead) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Lead Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The lead you're looking for doesn't exist or may have been deleted.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/leads')}>
          Back to Leads
        </button>
      </div>
    );
  }

  const handleConvert = () => {
    let newAccountId = '';
    
    if (convertData.createAccount) {
      const accountId = `account-${Date.now()}`;
      const newAccount = {
        accountId,
        name: convertData.accountName || lead.company,
        phone: lead.phone,
        website: lead.website,
        type: 'Prospect',
        industry: lead.industry,
        revenue: lead.revenue,
        employees: lead.employees,
        description: lead.description,
        ownerId: lead.ownerId,
        billingStreet: lead.street,
        billingCity: lead.city,
        billingState: lead.state,
        billingZip: lead.zip,
        billingCountry: lead.country,
        shippingStreet: lead.street,
        shippingCity: lead.city,
        shippingState: lead.state,
        shippingZip: lead.zip,
        shippingCountry: lead.country,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString()
      };
      updateState({ accounts: [...state.accounts, newAccount] });
      newAccountId = accountId;
    }

    if (convertData.createContact) {
      const contactId = `contact-${Date.now()}`;
      const newContact = {
        contactId,
        accountId: newAccountId,
        firstName: lead.firstName,
        lastName: lead.lastName,
        title: lead.title,
        department: '',
        email: lead.email,
        phone: lead.phone,
        mobile: lead.mobile,
        mailingStreet: lead.street,
        mailingCity: lead.city,
        mailingState: lead.state,
        mailingZip: lead.zip,
        mailingCountry: lead.country,
        ownerId: lead.ownerId,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString()
      };
      updateState({ contacts: [...state.contacts, newContact] });
    }

    if (convertData.createOpportunity && newAccountId) {
      const opportunityId = `opp-${Date.now()}`;
      const newOpportunity = {
        opportunityId,
        name: convertData.opportunityName || `${lead.company} - Opportunity`,
        accountId: newAccountId,
        amount: parseFloat(convertData.amount) || 0,
        closeDate: convertData.closeDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        stage: convertData.stage as any,
        probability: 10,
        type: 'New Business',
        leadSource: lead.source,
        nextStep: 'Initial contact',
        description: lead.description,
        ownerId: lead.ownerId,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString()
      };
      updateState({ opportunities: [...state.opportunities, newOpportunity] });
    }

    const updatedLeads = state.leads.map(l =>
      l.leadId === lead.leadId ? { ...l, status: 'Qualified' as any } : l
    );
    updateState({ leads: updatedLeads });

    setShowConvertModal(false);
    onShowToast('Lead converted successfully', 'success');
    
    if (newAccountId) {
      navigate(`/accounts/${newAccountId}`);
    }
  };

  const handleClone = () => {
    const newLeadId = `lead-${Date.now()}`;
    const clonedLead = {
      ...lead,
      leadId: newLeadId,
      firstName: lead.firstName + ' (Clone)',
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString()
    };
    updateState({ leads: [...state.leads, clonedLead] });
    onShowToast('Lead cloned successfully', 'success');
    navigate(`/leads/${newLeadId}`);
  };

  const handleEdit = () => {
    setEditData({
      firstName: lead.firstName,
      lastName: lead.lastName,
      company: lead.company,
      title: lead.title,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      rating: lead.rating
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    // 表单验证
    const errors: string[] = [];
    
    if (!editData.firstName || !editData.firstName.trim()) {
      errors.push('First name is required');
    }
    
    if (!editData.lastName || !editData.lastName.trim()) {
      errors.push('Last name is required');
    }
    
    if (!editData.company || !editData.company.trim()) {
      errors.push('Company is required');
    }
    
    if (editData.email && editData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.email)) {
        errors.push('Invalid email format');
      }
    }
    
    if (errors.length > 0) {
      onShowToast(errors.join(', '), 'error');
      return;
    }
    
    const updatedLeads = state.leads.map(l =>
      l.leadId === id
        ? { ...l, ...editData, status: editData.status as Lead['status'], rating: editData.rating as Lead['rating'], modifiedDate: new Date().toISOString() }
        : l
    );
    updateState({ leads: updatedLeads });
    setShowEditModal(false);
    onShowToast('Lead updated successfully', 'success');
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const updatedLeads = state.leads.filter(l => l.leadId !== id);
    updateState({ leads: updatedLeads });
    onShowToast('Lead deleted successfully', 'success');
    navigate('/leads');
  };

  const leadStatusStages = ['New', 'Working', 'Qualified', 'Converted'];

  const leadStageDetails: Record<string, { fields?: { label: string; type: 'checkbox' | 'text' }[] }> = {
    'New': { fields: [{ label: 'Initial Contact Made', type: 'checkbox' }] },
    'Working': { fields: [{ label: 'Contacted Via', type: 'text' }, { label: 'Interest Confirmed', type: 'checkbox' }] },
    'Qualified': { fields: [{ label: 'Budget Confirmed', type: 'checkbox' }, { label: 'Timeline Identified', type: 'checkbox' }] },
    'Converted': { fields: [{ label: 'Conversion Notes', type: 'text' }] },
  };

  const handleLeadStatusChange = (newStatus: string) => {
    const updatedLeads = state.leads.map(l =>
      l.leadId === id
        ? { ...l, status: newStatus as Lead['status'], modifiedDate: new Date().toISOString() }
        : l
    );
    updateState({ leads: updatedLeads });
    if (newStatus === 'Converted') {
      onShowToast('Lead converted! Consider creating an Account and Opportunity.', 'success');
    } else {
      onShowToast(`Lead status updated to ${newStatus}`, 'success');
    }
  };

  const updateLeadField = (fieldName: string, displayName: string) => (value: string | number) => {
    const updatedLeads = state.leads.map(l =>
      l.leadId === id
        ? { ...l, [fieldName]: value, modifiedDate: new Date().toISOString() }
        : l
    );
    updateState({ leads: updatedLeads });
    onShowToast(`${displayName} updated`, 'success');
  };

  const handleCreateEmailDraft = () => {
    const draft = {
      draftId: `draft-${Date.now()}`,
      to: lead.email,
      subject: `Follow up with ${lead.firstName} ${lead.lastName}`,
      body: `Hi ${lead.firstName},\n\n`,
      relatedToType: 'Lead',
      relatedToId: lead.leadId,
      status: 'draft' as const,
      createdDate: new Date().toISOString(),
    };
    updateState({ emailDrafts: [draft, ...(state.emailDrafts || [])] });
    onShowToast(`Email draft created for ${lead.firstName} ${lead.lastName}`, 'success');
  };

  const handleLogCallTask = () => {
    const now = new Date().toISOString();
    updateState({
      activities: [
        {
          activityId: `call-${Date.now()}`,
          type: 'task',
          subject: `Call ${lead.firstName} ${lead.lastName}`,
          status: 'Not Started',
          priority: lead.rating === 'Hot' ? 'High' : 'Normal',
          dueDate: now,
          relatedToType: 'Lead',
          relatedToId: lead.leadId,
          assignedToId: state.user.userId,
          description: `Call ${lead.phone || lead.mobile || 'lead phone'} about ${lead.company}.`,
          createdDate: now,
        },
        ...state.activities,
      ],
    });
    onShowToast(`Call task created for ${lead.firstName} ${lead.lastName}`, 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
              {lead.firstName} {lead.lastName}
            </h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span>
              <span className={`badge badge-${lead.rating.toLowerCase()}`}>{lead.rating}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <img src={owner?.avatar} alt={owner?.firstName} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                {owner?.firstName} {owner?.lastName}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleEdit}>
              <Edit size={18} />
              Edit
            </button>
            <button className="btn btn-secondary" onClick={handleCreateEmailDraft}>
              <Mail size={18} />
              Email
            </button>
            <button className="btn btn-secondary" onClick={handleLogCallTask}>
              <Phone size={18} />
              Call
            </button>
            <button className="btn btn-success" onClick={() => setShowConvertModal(true)}>
              <RefreshCw size={18} />
              Convert
            </button>
            <button className="btn btn-secondary" onClick={handleClone}>
              <Copy size={18} />
              Clone
            </button>
            <button className="btn btn-secondary" onClick={() => {
              const leadUrl = window.location.href;
              navigator.clipboard.writeText(leadUrl).then(() => {
                onShowToast('Lead URL copied to clipboard', 'success');
              }).catch(() => {
                onShowToast('Link: ' + leadUrl, 'info');
              });
            }} title="More Actions">
              <MoreHorizontal size={18} />
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        <SalesPath
          stages={leadStatusStages}
          currentStage={lead.status === 'Unqualified' ? 'New' : (leadStatusStages.includes(lead.status) ? lead.status : 'New')}
          onStageChange={handleLeadStatusChange}
          stageDetails={leadStageDetails}
          closedWonStage="Converted"
        />

        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['details', 'activity', 'chatter', 'related'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab ? 600 : 400,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
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
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Lead Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>First Name</label>
                  <InlineEdit value={lead.firstName} fieldName="First Name" fieldType="text" onSave={updateLeadField('firstName', 'First Name')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Last Name</label>
                  <InlineEdit value={lead.lastName} fieldName="Last Name" fieldType="text" onSave={updateLeadField('lastName', 'Last Name')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Company</label>
                  <InlineEdit value={lead.company} fieldName="Company" fieldType="text" onSave={updateLeadField('company', 'Company')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Title</label>
                  <InlineEdit value={lead.title} fieldName="Title" fieldType="text" onSave={updateLeadField('title', 'Title')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email</label>
                  <InlineEdit value={lead.email} fieldName="Email" fieldType="email" onSave={updateLeadField('email', 'Email')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Phone</label>
                  <InlineEdit value={lead.phone} fieldName="Phone" fieldType="text" onSave={updateLeadField('phone', 'Phone')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Mobile</label>
                  <InlineEdit value={lead.mobile} fieldName="Mobile" fieldType="text" onSave={updateLeadField('mobile', 'Mobile')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Lead Status</label>
                  <InlineEdit value={lead.status} fieldName="Status" fieldType="select" options={['New', 'Working', 'Qualified', 'Unqualified']} onSave={updateLeadField('status', 'Status')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Lead Source</label>
                  <InlineEdit value={lead.source} fieldName="Source" fieldType="select" options={['Website', 'Referral', 'Trade Show', 'Cold Call', 'LinkedIn', 'Email Campaign']} onSave={updateLeadField('source', 'Source')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Rating</label>
                  <InlineEdit value={lead.rating} fieldName="Rating" fieldType="select" options={['Hot', 'Warm', 'Cold']} onSave={updateLeadField('rating', 'Rating')} />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Address Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Street</label>
                  <InlineEdit value={lead.street} fieldName="Street" fieldType="text" onSave={updateLeadField('street', 'Street')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>City</label>
                  <InlineEdit value={lead.city} fieldName="City" fieldType="text" onSave={updateLeadField('city', 'City')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>State</label>
                  <InlineEdit value={lead.state} fieldName="State" fieldType="text" onSave={updateLeadField('state', 'State')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Zip Code</label>
                  <InlineEdit value={lead.zip} fieldName="Zip Code" fieldType="text" onSave={updateLeadField('zip', 'Zip Code')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Country</label>
                  <InlineEdit value={lead.country} fieldName="Country" fieldType="text" onSave={updateLeadField('country', 'Country')} />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Additional Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Industry</label>
                  <InlineEdit value={lead.industry} fieldName="Industry" fieldType="text" onSave={updateLeadField('industry', 'Industry')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Employees</label>
                  <InlineEdit value={lead.employees} fieldName="Employees" fieldType="number" onSave={updateLeadField('employees', 'Employees')} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Annual Revenue</label>
                  <InlineEdit value={lead.revenue} fieldName="Revenue" fieldType="number" onSave={updateLeadField('revenue', 'Revenue')} formatValue={(v) => `$${(Number(v) / 1000000).toFixed(1)}M`} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Website</label>
                  <InlineEdit value={lead.website} fieldName="Website" fieldType="text" onSave={updateLeadField('website', 'Website')} />
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Description</label>
                <InlineEdit value={lead.description} fieldName="Description" fieldType="textarea" onSave={updateLeadField('description', 'Description')} />
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>System Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Created Date</label>
                  <div>{format(new Date(lead.createdDate), 'MMM d, yyyy h:mm a')}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Last Modified</label>
                  <div>{format(new Date(lead.modifiedDate), 'MMM d, yyyy h:mm a')}</div>
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
        <ActivityTimeline relatedToType="Lead" relatedToId={lead.leadId} onShowToast={onShowToast} />
      )}

      {activeTab === 'chatter' && (
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Chatter</h2>
          {(() => {
            const leadPosts = state.chatterPosts.filter(p => p.relatedToId === lead.leadId || p.relatedToType === 'Lead');
            if (leadPosts.length === 0) {
              return <p style={{ color: 'var(--text-secondary)' }}>No posts yet. Post updates in the Chatter section.</p>;
            }
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {leadPosts.map(post => {
                  const poster = state.users.find(u => u.userId === (post.authorId || post.userId));
                  return (
                    <div key={post.postId} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <img src={poster?.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{poster?.firstName} {poster?.lastName}</div>
                          <div style={{ fontSize: '14px', margin: '4px 0' }}>{post.body || post.content}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{post.createdDate}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
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
                  {state.activities.filter(a => a.relatedToType === 'Lead' && a.relatedToId === lead.leadId).length}
                </span>
              </div>
            </div>
            {state.activities.filter(a => a.relatedToType === 'Lead' && a.relatedToId === lead.leadId).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No activities</p>
            ) : (
              <table className="table" style={{ fontSize: '13px' }}>
                <thead><tr><th>Subject</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {state.activities.filter(a => a.relatedToType === 'Lead' && a.relatedToId === lead.leadId).slice(0, 5).map(a => (
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
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Files</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No files attached to this lead</p>
          </div>
        </div>
      )}

      <Modal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        title="Convert Lead"
        size="large"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <input
                type="checkbox"
                checked={convertData.createAccount}
                onChange={(e) => setConvertData({ ...convertData, createAccount: e.target.checked })}
              />
              <span style={{ fontWeight: 600 }}>Create Account</span>
            </label>
            {convertData.createAccount && (
              <div className="form-group">
                <label className="form-label">Account Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={convertData.accountName}
                  onChange={(e) => setConvertData({ ...convertData, accountName: e.target.value })}
                  placeholder={lead.company}
                />
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <input
                type="checkbox"
                checked={convertData.createContact}
                onChange={(e) => setConvertData({ ...convertData, createContact: e.target.checked })}
              />
              <span style={{ fontWeight: 600 }}>Create Contact</span>
            </label>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginLeft: '28px' }}>
              Contact will be created with lead information
            </p>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <input
                type="checkbox"
                checked={convertData.createOpportunity}
                onChange={(e) => setConvertData({ ...convertData, createOpportunity: e.target.checked })}
              />
              <span style={{ fontWeight: 600 }}>Create Opportunity</span>
            </label>
            {convertData.createOpportunity && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Opportunity Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={convertData.opportunityName}
                    onChange={(e) => setConvertData({ ...convertData, opportunityName: e.target.value })}
                    placeholder={`${lead.company} - Opportunity`}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-input"
                    value={convertData.amount}
                    onChange={(e) => setConvertData({ ...convertData, amount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Close Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={convertData.closeDate}
                    onChange={(e) => setConvertData({ ...convertData, closeDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stage</label>
                  <select
                    className="form-select"
                    value={convertData.stage}
                    onChange={(e) => setConvertData({ ...convertData, stage: e.target.value })}
                  >
                    <option value="Prospecting">Prospecting</option>
                    <option value="Qualification">Qualification</option>
                    <option value="Needs Analysis">Needs Analysis</option>
                    <option value="Value Proposition">Value Proposition</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={() => setShowConvertModal(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleConvert}>
              Convert Lead
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Lead">
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
            <label className="form-label">Company *</label>
            <input
              type="text"
              className="form-input"
              value={editData.company}
              onChange={(e) => setEditData({ ...editData, company: e.target.value })}
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
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            >
              <option value="New">New</option>
              <option value="Working">Working</option>
              <option value="Qualified">Qualified</option>
              <option value="Unqualified">Unqualified</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Rating</label>
            <select
              className="form-select"
              value={editData.rating}
              onChange={(e) => setEditData({ ...editData, rating: e.target.value })}
            >
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
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
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Lead">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>Are you sure you want to delete this lead? This action cannot be undone.</p>
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: '4px'
          }}>
            <strong>{lead.firstName} {lead.lastName}</strong> from <strong>{lead.company}</strong>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete}>
              Delete Lead
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
