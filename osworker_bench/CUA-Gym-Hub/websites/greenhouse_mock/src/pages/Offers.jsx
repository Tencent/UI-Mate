import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Plus, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

function Avatar({ user, size = 28 }) {
  if (!user) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--accent)',
      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.38), fontWeight: 600, flexShrink: 0
    }}>
      {user.firstName?.[0]}{user.lastName?.[0]}
    </div>
  );
}

export default function Offers() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  const [activeTab, setActiveTab] = useState('all');
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [offerForm, setOfferForm] = useState({ applicationId: '', salary: '', equity: '', signingBonus: '', startDate: '', expiresAt: '' });

  const enrichedOffers = state.offers.map(o => {
    const app = state.applications.find(a => a.id === o.applicationId);
    const cand = o.candidateId ? state.candidates.find(c => c.id === o.candidateId) : (app ? state.candidates.find(c => c.id === app.candidateId) : null);
    const job = state.jobs.find(j => j.id === o.jobId);
    const creator = state.users.find(u => u.id === o.createdBy);
    return { ...o, app, cand, job, creator };
  });

  const statusGroups = {
    all: enrichedOffers,
    pending_approval: enrichedOffers.filter(o => o.status === 'pending_approval'),
    sent: enrichedOffers.filter(o => o.status === 'sent'),
    accepted: enrichedOffers.filter(o => o.status === 'accepted'),
    rejected: enrichedOffers.filter(o => o.status === 'rejected' || o.status === 'declined'),
  };

  const displayed = statusGroups[activeTab] || enrichedOffers;

  const pendingCount = enrichedOffers.filter(o => o.status === 'pending_approval').length;
  const sentCount = enrichedOffers.filter(o => o.status === 'sent').length;
  const acceptedCount = enrichedOffers.filter(o => o.status === 'accepted').length;
  const avgSalary = enrichedOffers.length > 0
    ? Math.round(enrichedOffers.reduce((sum, o) => sum + o.salary, 0) / enrichedOffers.length)
    : 0;

  const statusBadgeMap = {
    draft: { cls: 'badge-gray', label: 'Draft' },
    pending_approval: { cls: 'badge-yellow', label: 'Pending Approval' },
    approved: { cls: 'badge-blue', label: 'Approved' },
    sent: { cls: 'badge-blue', label: 'Sent' },
    accepted: { cls: 'badge-green', label: 'Accepted' },
    rejected: { cls: 'badge-red', label: 'Rejected' },
    declined: { cls: 'badge-red', label: 'Declined' },
  };

  const handleApprove = (offerId, approverId) => {
    const offer = state.offers.find(o => o.id === offerId);
    if (!offer) return;
    const updatedApprovers = offer.approvers.map(ap =>
      ap.userId === approverId ? { ...ap, status: 'approved', respondedAt: new Date().toISOString() } : ap
    );
    const allApproved = updatedApprovers.every(ap => ap.status === 'approved');
    dispatch({
      type: 'UPDATE_OFFER',
      payload: { id: offerId, approvers: updatedApprovers, status: allApproved ? 'approved' : 'pending_approval' }
    });
  };

  const handleSendOffer = (offerId) => {
    dispatch({ type: 'UPDATE_OFFER', payload: { id: offerId, status: 'sent' } });
  };

  const handleCreateOffer = () => {
    if (!offerForm.applicationId || !offerForm.salary) return;
    const app = state.applications.find(a => a.id === offerForm.applicationId);
    if (!app) return;
    const newOffer = {
      id: uuidv4(),
      applicationId: offerForm.applicationId,
      jobId: app.jobId,
      candidateId: app.candidateId,
      status: 'pending_approval',
      salary: parseInt(offerForm.salary),
      equity: offerForm.equity || null,
      signingBonus: offerForm.signingBonus ? parseInt(offerForm.signingBonus) : 0,
      currency: 'USD',
      startDate: offerForm.startDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      expiresAt: offerForm.expiresAt || new Date(Date.now() + 14 * 86400000).toISOString(),
      createdBy: state.currentUser.id,
      approvers: [{ userId: 'user-8', status: 'pending', respondedAt: null }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_OFFER', payload: newOffer });
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: uuidv4(),
        candidateId: app.candidateId,
        applicationId: app.id,
        type: 'offer_created',
        actorId: state.currentUser.id,
        description: `Offer created for $${parseInt(offerForm.salary).toLocaleString()}`,
        metadata: { offerId: newOffer.id, salary: parseInt(offerForm.salary) },
        createdAt: new Date().toISOString()
      }
    });
    setShowCreateOffer(false);
    setOfferForm({ applicationId: '', salary: '', equity: '', signingBonus: '', startDate: '', expiresAt: '' });
  };

  const activeAppsInOfferStage = state.applications.filter(a => {
    if (a.status !== 'active') return false;
    const stage = state.jobStages.find(s => s.id === a.currentStageId);
    return stage && (stage.stageType === 'offer' || stage.stageType === 'onsite');
  });

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Offers</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateOffer(true)}>
          <Plus size={16} /> Create Offer
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Pending Approval', value: pendingCount, color: 'var(--yellow)', icon: AlertCircle },
          { label: 'Sent', value: sentCount, color: 'var(--blue)', icon: Clock },
          { label: 'Accepted', value: acceptedCount, color: 'var(--green)', icon: CheckCircle },
          { label: 'Avg Salary', value: `$${avgSalary.toLocaleString()}`, color: 'var(--text-primary)', icon: DollarSign },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'all', label: `All (${enrichedOffers.length})` },
          { key: 'pending_approval', label: `Pending (${pendingCount})` },
          { key: 'sent', label: `Sent (${sentCount})` },
          { key: 'accepted', label: `Accepted (${acceptedCount})` },
        ].map(tab => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Offer list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayed.length === 0 ? (
          <div className="empty-state"><h3>No offers found</h3></div>
        ) : displayed.map(offer => {
          const badge = statusBadgeMap[offer.status] || { cls: 'badge-gray', label: offer.status };
          return (
            <div key={offer.id} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    {offer.cand && <Avatar user={offer.cand} size={40} />}
                    <div>
                      <div
                        style={{ fontWeight: 600, fontSize: 16, color: 'var(--accent)', cursor: 'pointer' }}
                        onClick={() => offer.cand && navigate(buildLink(`/candidates/${offer.cand.id}`))}
                      >
                        {offer.cand?.name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{offer.job?.title}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Salary</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>${offer.salary.toLocaleString()}</div>
                    </div>
                    {offer.equity && (
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Equity</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{offer.equity}</div>
                      </div>
                    )}
                    {offer.signingBonus > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Signing Bonus</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>${offer.signingBonus.toLocaleString()}</div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Start Date</div>
                      <div style={{ fontSize: 13 }}>{format(parseISO(offer.startDate), 'MMM d, yyyy')}</div>
                    </div>
                  </div>
                  {/* Approvers */}
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Approvers:</span>
                    {offer.approvers.map(ap => {
                      const approver = state.users.find(u => u.id === ap.userId);
                      return (
                        <span key={ap.userId} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, background: ap.status === 'approved' ? '#DCFCE7' : ap.status === 'rejected' ? '#FEE2E2' : '#FEF3C7', padding: '2px 8px', borderRadius: 10 }}>
                          {ap.status === 'approved' ? <CheckCircle size={11} color="#16A34A" /> : ap.status === 'rejected' ? <XCircle size={11} color="#DC2626" /> : <Clock size={11} color="#92400E" />}
                          {approver?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Expires {format(parseISO(offer.expiresAt), 'MMM d, yyyy')}
                  </div>
                  {offer.status === 'pending_approval' && (
                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleApprove(offer.id, state.currentUser.id); }}>
                      Approve
                    </button>
                  )}
                  {offer.status === 'approved' && (
                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleSendOffer(offer.id); }}>
                      Send Offer
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Offer Modal */}
      {showCreateOffer && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateOffer(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 className="modal-title">Create Offer</h2>
              <button onClick={() => setShowCreateOffer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Candidate / Application *</label>
                <select className="form-select" value={offerForm.applicationId} onChange={e => setOfferForm(p => ({ ...p, applicationId: e.target.value }))}>
                  <option value="">Select candidate...</option>
                  {activeAppsInOfferStage.map(a => {
                    const c = state.candidates.find(cc => cc.id === a.candidateId);
                    const j = state.jobs.find(jj => jj.id === a.jobId);
                    return <option key={a.id} value={a.id}>{c?.name} - {j?.title}</option>;
                  })}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Base Salary *</label>
                  <input className="form-input" type="number" placeholder="e.g. 150000" value={offerForm.salary} onChange={e => setOfferForm(p => ({ ...p, salary: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Equity</label>
                  <input className="form-input" placeholder="e.g. 0.05%" value={offerForm.equity} onChange={e => setOfferForm(p => ({ ...p, equity: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Signing Bonus</label>
                  <input className="form-input" type="number" placeholder="e.g. 10000" value={offerForm.signingBonus} onChange={e => setOfferForm(p => ({ ...p, signingBonus: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" value={offerForm.startDate} onChange={e => setOfferForm(p => ({ ...p, startDate: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowCreateOffer(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateOffer} disabled={!offerForm.applicationId || !offerForm.salary}>Create Offer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
