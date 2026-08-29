import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const formatCurrency = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatPercent = (n) => (n * 100).toFixed(1) + '%';
const getQualityBadge = (rate, type) => {
  if (type === 'open') {
    if (rate >= 0.40) return { label: 'Excellent', cls: 'excellent' };
    if (rate >= 0.25) return { label: 'Good', cls: 'good' };
    return { label: 'Needs Improvement', cls: 'needs-improvement' };
  }
  if (type === 'click') {
    if (rate >= 0.05) return { label: 'Excellent', cls: 'excellent' };
    if (rate >= 0.02) return { label: 'Good', cls: 'good' };
    return { label: 'Needs Improvement', cls: 'needs-improvement' };
  }
  return null;
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const { state, updateEntity } = useAppContext();
  const campaign = state.campaigns.find(c => c.id === id);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [toast, setToast] = useState(null);

  if (!campaign) {
    return <div className="empty-state"><h3>Campaign not found</h3><p>The campaign you are looking for does not exist.</p><button className="btn btn-secondary" onClick={() => navigate(query ? `/campaigns?${query}` : '/campaigns')}>Back to Campaigns</button></div>;
  }

  const s = campaign.stats;
  const openBadge = getQualityBadge(s.openRate, 'open');
  const clickBadge = getQualityBadge(s.clickRate, 'click');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSendNow = () => {
    updateEntity('campaigns', campaign.id, { status: 'sent', sentAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    showToast('Campaign sent!');
  };

  const handleSchedule = () => {
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    updateEntity('campaigns', campaign.id, { status: 'scheduled', scheduledAt, updatedAt: new Date().toISOString() });
    showToast('Campaign scheduled');
  };

  const handleCancelSchedule = () => {
    updateEntity('campaigns', campaign.id, { status: 'draft', scheduledAt: null, updatedAt: new Date().toISOString() });
    showToast('Schedule cancelled');
  };

  const handleRename = () => {
    if (editName.trim()) {
      updateEntity('campaigns', campaign.id, { name: editName.trim(), updatedAt: new Date().toISOString() });
      showToast('Campaign renamed');
    }
    setEditing(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-secondary" onClick={() => navigate(query ? `/campaigns?${query}` : '/campaigns')} style={{ fontSize: 13 }}>&larr; Back to Campaigns</button>
      </div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {editing ? (
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} onBlur={handleRename} onKeyDown={e => e.key === 'Enter' && handleRename()} autoFocus style={{ fontSize: 24, fontWeight: 700, background: 'transparent', border: '1px solid var(--accent-green)', borderRadius: 6, padding: '4px 12px', color: 'var(--text-primary)' }} />
          ) : (
            <h1 className="page-title" onClick={() => { setEditName(campaign.name); setEditing(true); }} style={{ cursor: 'pointer' }} title="Click to rename">{campaign.name}</h1>
          )}
          <span className={`badge badge-${campaign.status}`}>{campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {campaign.status === 'draft' && (
            <>
              <button className="btn btn-secondary" onClick={handleSchedule}>Schedule</button>
              <button className="btn btn-primary" onClick={handleSendNow}>Send Now</button>
            </>
          )}
          {campaign.status === 'scheduled' && (
            <button className="btn btn-secondary" onClick={handleCancelSchedule}>Cancel Schedule</button>
          )}
        </div>
      </div>

      {campaign.status === 'sent' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value">{s.recipients.toLocaleString()}</div>
              <div className="stat-label">Recipients</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value">{s.delivered.toLocaleString()}</div>
              <div className="stat-label">Delivered</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{formatCurrency(s.revenue)}</div>
              <div className="stat-label">Revenue</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="stat-value" style={{ fontSize: 24 }}>{formatPercent(s.openRate)}</span>
                {openBadge && <span className={`quality-badge ${openBadge.cls}`}>{openBadge.label}</span>}
              </div>
              <div className="stat-label">Open Rate</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="stat-value" style={{ fontSize: 24 }}>{formatPercent(s.clickRate)}</span>
                {clickBadge && <span className={`quality-badge ${clickBadge.cls}`}>{clickBadge.label}</span>}
              </div>
              <div className="stat-label">Click Rate</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-value" style={{ fontSize: 24 }}>{s.ordersPlaced}</div>
              <div className="stat-label">Orders Placed</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Delivery Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <div><div style={{ fontWeight: 600, fontSize: 18 }}>{s.bounced}</div><div className="text-muted" style={{ fontSize: 12 }}>Bounced</div></div>
              <div><div style={{ fontWeight: 600, fontSize: 18 }}>{s.unsubscribed}</div><div className="text-muted" style={{ fontSize: 12 }}>Unsubscribed</div></div>
              <div><div style={{ fontWeight: 600, fontSize: 18 }}>{s.spamComplaints}</div><div className="text-muted" style={{ fontSize: 12 }}>Spam complaints</div></div>
              <div><div style={{ fontWeight: 600, fontSize: 18 }}>{s.uniqueClicks}</div><div className="text-muted" style={{ fontSize: 12 }}>Unique clicks</div></div>
            </div>
          </div>
        </>
      )}

      {campaign.status !== 'sent' && (
        <div className="card">
          <div className="card-title">Campaign Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><span className="text-muted">Channel:</span> <strong>{campaign.channel}</strong></div>
            <div><span className="text-muted">Subject:</span> <strong>{campaign.subject || '(not set)'}</strong></div>
            <div><span className="text-muted">Sender:</span> <strong>{campaign.senderName} ({campaign.senderEmail || 'not set'})</strong></div>
            <div><span className="text-muted">Strategy:</span> <strong>{campaign.sendStrategy}</strong></div>
            {campaign.scheduledAt && <div><span className="text-muted">Scheduled:</span> <strong>{new Date(campaign.scheduledAt).toLocaleString()}</strong></div>}
            <div><span className="text-muted">Tags:</span> <strong>{campaign.tags.length > 0 ? campaign.tags.join(', ') : 'None'}</strong></div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
