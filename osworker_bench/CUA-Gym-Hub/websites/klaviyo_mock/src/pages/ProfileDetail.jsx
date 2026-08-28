import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const formatCurrency = (n) => '$' + n.toFixed(2);

export default function ProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const { state, updateEntity } = useAppContext();
  const profile = state.profiles.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState('activity');
  const [toast, setToast] = useState(null);

  if (!profile) {
    return <div className="empty-state"><h3>Profile not found</h3><button className="btn btn-secondary" onClick={() => navigate(query ? `/audience/profiles?${query}` : '/audience/profiles')}>Back to Profiles</button></div>;
  }

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const handleToggleConsent = (type) => {
    const current = profile.consent[type];
    const next = current === 'subscribed' ? 'unsubscribed' : 'subscribed';
    updateEntity('profiles', profile.id, { consent: { ...profile.consent, [type]: next } });
    showToast(`${type} consent updated to ${next}`);
  };

  const profileLists = state.lists.filter(l => profile.listIds.includes(l.id));
  const profileSegments = state.segments.filter(s => profile.segmentIds.includes(s.id));

  const mockEvents = [
    { name: 'Placed Order', details: `$${(profile.customProperties.avg_order_value || 65.44).toFixed(2)} - 2 items`, time: profile.lastActive, color: 'var(--accent-green)' },
    { name: 'Opened Email', details: 'Spring Sale 2025 - 20% Off', time: '2025-03-15T10:30:00Z', color: 'var(--accent-blue)' },
    { name: 'Clicked Email', details: 'Spring Sale 2025 - 20% Off', time: '2025-03-15T10:32:00Z', color: 'var(--accent-blue)' },
    { name: 'Viewed Product', details: 'Leather Crossbody Bag', time: '2025-03-14T16:00:00Z', color: 'var(--accent-purple)' },
    { name: 'Active on Site', details: '3 pages viewed', time: '2025-03-14T15:55:00Z', color: 'var(--accent-yellow)' },
    { name: 'Received Email', details: 'New Arrivals Alert', time: '2025-03-08T10:00:00Z', color: 'var(--text-muted)' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-secondary" onClick={() => navigate(query ? `/audience/profiles?${query}` : '/audience/profiles')} style={{ fontSize: 13 }}>&larr; Back to Profiles</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24 }}>
        {/* Left column */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{profile.firstName} {profile.lastName}</h2>
            <div className="text-muted" style={{ marginBottom: 4 }}>{profile.email}</div>
            <div className="text-muted" style={{ fontSize: 13 }}>{profile.location.city}, {profile.location.region}, {profile.location.country}</div>
            {profile.title && <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{profile.title}{profile.organization ? ` at ${profile.organization}` : ''}</div>}
          </div>

          <div className="tabs">
            <button className={`tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity</button>
            <button className={`tab ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>Properties</button>
            <button className={`tab ${activeTab === 'lists' ? 'active' : ''}`} onClick={() => setActiveTab('lists')}>Lists & Segments</button>
          </div>

          {activeTab === 'activity' && (
            <div className="card">
              {mockEvents.map((ev, i) => (
                <div key={i} className="timeline-event">
                  <div className="timeline-dot" style={{ background: ev.color || 'var(--accent-green)' }}></div>
                  <div className="timeline-content">
                    <div className="timeline-title">{ev.name}</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>{ev.details}</div>
                    <div className="timeline-time">{new Date(ev.time).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="card">
              <table className="data-table">
                <thead>
                  <tr><th>Property</th><th>Value</th></tr>
                </thead>
                <tbody>
                  {Object.entries(profile.customProperties).map(([key, val]) => (
                    <tr key={key}>
                      <td style={{ fontWeight: 500 }}>{key.replace(/_/g, ' ')}</td>
                      <td>{typeof val === 'number' ? (key.includes('value') ? formatCurrency(val) : val) : String(val)}</td>
                    </tr>
                  ))}
                  <tr><td style={{ fontWeight: 500 }}>phone</td><td>{profile.phone}</td></tr>
                  <tr><td style={{ fontWeight: 500 }}>created at</td><td>{new Date(profile.createdAt).toLocaleDateString()}</td></tr>
                  <tr><td style={{ fontWeight: 500 }}>last active</td><td>{new Date(profile.lastActive).toLocaleDateString()}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'lists' && (
            <div>
              <div className="card">
                <div className="card-title">Lists</div>
                {profileLists.length > 0 ? profileLists.map(l => (
                  <div key={l.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{l.name}</span>
                    <span className="text-muted">{l.memberCount.toLocaleString()} members</span>
                  </div>
                )) : <div className="text-muted">Not a member of any lists</div>}
              </div>
              <div className="card">
                <div className="card-title">Segments</div>
                {profileSegments.length > 0 ? profileSegments.map(s => (
                  <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{s.name}</span>
                    <span className="text-muted">{s.memberCount.toLocaleString()} members</span>
                  </div>
                )) : <div className="text-muted">Not a member of any segments</div>}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div>
          <div className="card">
            <div className="card-title">Predictive Analytics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Predicted LTV</span><span style={{ fontWeight: 600 }}>{formatCurrency(profile.predictedLTV)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Predicted Gender</span><span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{profile.predictedGender}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Churn Risk</span><span style={{ fontWeight: 600 }}>{profile.customProperties.lifetime_value > 500 ? 'Low' : profile.customProperties.lifetime_value > 100 ? 'Medium' : 'High'}</span></div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Consent</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Email</span>
                <span className={`badge ${profile.consent.email === 'subscribed' ? 'badge-live' : 'badge-draft'}`} style={{ cursor: 'pointer' }} onClick={() => handleToggleConsent('email')}>
                  {profile.consent.email === 'subscribed' ? 'Subscribed' : profile.consent.email === 'unsubscribed' ? 'Unsubscribed' : 'Not subscribed'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>SMS</span>
                <span className={`badge ${profile.consent.sms === 'subscribed' ? 'badge-live' : 'badge-draft'}`} style={{ cursor: 'pointer' }} onClick={() => handleToggleConsent('sms')}>
                  {profile.consent.sms === 'subscribed' ? 'Subscribed' : 'Not subscribed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
