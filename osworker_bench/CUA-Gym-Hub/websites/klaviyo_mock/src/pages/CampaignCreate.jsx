import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function CampaignCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const { state, addEntity } = useAppContext();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    channel: '',
    audienceInclude: [],
    audienceExclude: [],
    smartSending: true,
    subject: '',
    previewText: '',
    senderName: state.account.defaultSenderName,
    senderEmail: state.account.defaultSenderEmail,
    templateType: '',
  });

  const steps = ['Type', 'Audience', 'Content', 'Review'];

  const updateForm = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const estimateRecipients = () => {
    if (form.audienceInclude.length === 0) return 0;
    const included = new Set();
    state.profiles.forEach(profile => {
      const inIncluded = form.audienceInclude.some(id => profile.listIds.includes(id) || profile.segmentIds.includes(id));
      const inExcluded = form.audienceExclude.some(id => profile.listIds.includes(id) || profile.segmentIds.includes(id));
      if (inIncluded && !inExcluded && (form.channel !== 'sms' || profile.consent.sms === 'subscribed')) included.add(profile.id);
    });
    return included.size;
  };

  const buildStats = (recipients) => {
    const delivered = Math.max(0, Math.round(recipients * 0.985));
    const uniqueOpens = form.channel === 'sms' ? 0 : Math.round(delivered * 0.38);
    const uniqueClicks = Math.round(delivered * (form.channel === 'sms' ? 0.09 : 0.12));
    return {
      recipients,
      delivered,
      opens: uniqueOpens + Math.round(uniqueOpens * 0.18),
      uniqueOpens,
      clicks: uniqueClicks + Math.round(uniqueClicks * 0.12),
      uniqueClicks,
      bounced: recipients - delivered,
      unsubscribed: Math.round(delivered * 0.003),
      spamComplaints: form.channel === 'sms' ? 0 : Math.round(delivered * 0.001),
      revenue: parseFloat((uniqueClicks * 18.75).toFixed(2)),
      ordersPlaced: Math.round(uniqueClicks * 0.18),
      openRate: delivered ? uniqueOpens / delivered : 0,
      clickRate: delivered ? uniqueClicks / delivered : 0,
      conversionRate: delivered ? Math.round(uniqueClicks * 0.18) / delivered : 0
    };
  };

  const handleCreate = (mode = 'draft') => {
    const recipients = estimateRecipients();
    const now = new Date().toISOString();
    const newCampaign = {
      id: `camp_${Date.now()}`,
      name: form.subject || 'Untitled Campaign',
      status: mode === 'send' ? 'sent' : 'draft',
      channel: form.channel,
      subject: form.subject,
      previewText: form.previewText,
      senderName: form.senderName,
      senderEmail: form.senderEmail,
      templateId: form.templateType,
      audienceInclude: form.audienceInclude,
      audienceExclude: form.audienceExclude,
      sendStrategy: 'immediate',
      scheduledAt: null,
      sentAt: mode === 'send' ? now : null,
      createdAt: now,
      updatedAt: now,
      tags: [],
      trackingOptions: { isTrackingOpens: true, isTrackingClicks: true, addUtm: true },
      stats: mode === 'send' ? buildStats(recipients) : { recipients, delivered: 0, opens: 0, uniqueOpens: 0, clicks: 0, uniqueClicks: 0, bounced: 0, unsubscribed: 0, spamComplaints: 0, revenue: 0, ordersPlaced: 0, openRate: 0, clickRate: 0, conversionRate: 0 }
    };
    addEntity('campaigns', newCampaign);
    navigate(query ? `/campaigns/${newCampaign.id}?${query}` : `/campaigns/${newCampaign.id}`);
  };

  const allAudiences = [...state.lists.map(l => ({ id: l.id, name: l.name, type: 'list' })), ...state.segments.map(s => ({ id: s.id, name: s.name, type: 'segment' }))];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-secondary" onClick={() => navigate(query ? `/campaigns?${query}` : '/campaigns')} style={{ fontSize: 13 }}>&larr; Back to Campaigns</button>
      </div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Create Campaign</h1>

      <div className="stepper">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="stepper-step">
              <div className={`stepper-number ${step === i + 1 ? 'active' : step > i + 1 ? 'completed' : ''}`}>{step > i + 1 ? '✓' : i + 1}</div>
              <span className={`stepper-label ${step === i + 1 ? 'active' : ''}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`stepper-line ${step > i + 1 ? 'completed' : ''}`}></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Choose campaign type</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {['email', 'sms'].map(type => (
                <div key={type} onClick={() => { updateForm('channel', type); setStep(2); }} style={{ border: `2px solid ${form.channel === type ? 'var(--accent-green)' : 'var(--border-color)'}`, borderRadius: 8, padding: 24, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{type === 'email' ? '✉' : '📱'}</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{type === 'email' ? 'Email' : 'SMS'}</div>
                  <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{type === 'email' ? 'Send an email campaign' : 'Send a text message campaign'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Select audience</h2>
            <div className="form-group">
              <label>Send to</label>
              <select multiple style={{ height: 120 }} value={form.audienceInclude} onChange={e => updateForm('audienceInclude', Array.from(e.target.selectedOptions, o => o.value))}>
                {allAudiences.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Don't send to (exclude)</label>
              <select multiple style={{ height: 80 }} value={form.audienceExclude} onChange={e => updateForm('audienceExclude', Array.from(e.target.selectedOptions, o => o.value))}>
                {allAudiences.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="toggle">
                <div className={`toggle-switch ${form.smartSending ? 'active' : ''}`} onClick={() => updateForm('smartSending', !form.smartSending)}></div>
                Smart sending
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Content</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div className="form-group">
                  <label>Subject line</label>
                  <input type="text" value={form.subject} onChange={e => updateForm('subject', e.target.value)} placeholder="Enter subject line" />
                </div>
                <div className="form-group">
                  <label>Preview text</label>
                  <input type="text" value={form.previewText} onChange={e => updateForm('previewText', e.target.value)} placeholder="Enter preview text" />
                </div>
                <div className="form-group">
                  <label>Sender name</label>
                  <input type="text" value={form.senderName} onChange={e => updateForm('senderName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Sender email</label>
                  <input type="email" value={form.senderEmail} onChange={e => updateForm('senderEmail', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Template type</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { id: 'drag-drop', label: 'Drag and drop', desc: 'Visual email editor', popular: true },
                    { id: 'text-only', label: 'Text only', desc: 'Simple plain text' },
                    { id: 'html', label: 'HTML', desc: 'Custom HTML code' }
                  ].map(t => (
                    <div key={t.id} onClick={() => updateForm('templateType', t.id)} style={{ border: `1px solid ${form.templateType === t.id ? 'var(--accent-green)' : 'var(--border-color)'}`, borderRadius: 8, padding: 12, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong>{t.label}</strong>
                        {t.popular && <span className="badge badge-scheduled" style={{ fontSize: 10 }}>Popular</span>}
                      </div>
                      <div className="text-muted" style={{ fontSize: 12 }}>{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>Continue</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Review & Send</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div><strong>Channel:</strong> {form.channel}</div>
              <div><strong>Subject:</strong> {form.subject || '(not set)'}</div>
              <div><strong>From:</strong> {form.senderName} ({form.senderEmail})</div>
              <div><strong>Template:</strong> {form.templateType || '(not selected)'}</div>
              <div><strong>Send to:</strong> {form.audienceInclude.length} list(s)/segment(s)</div>
              <div><strong>Exclude:</strong> {form.audienceExclude.length} list(s)/segment(s)</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setStep(3)}>Back</button>
              <button className="btn btn-primary" onClick={() => handleCreate('draft')}>Save as Draft</button>
              <button className="btn btn-primary" style={{ background: 'var(--accent-green)', borderColor: 'var(--accent-green)' }} onClick={() => handleCreate('send')}>Send Now</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
