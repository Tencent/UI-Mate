import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle, Calendar, Clock, Mail, FileText, Split, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CampaignNew() {
  const { state, addCampaign, updateCampaign, addToast } = useApp();
  const navigate = useNavigate();
  const params = useParams();
  const isNew = !params.id || params.id === 'new';
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [showSendTest, setShowSendTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const [campaign, setCampaign] = useState(() => {
    if (!isNew) {
      return state.campaigns.find(c => c.id === params.id) || null;
    }
    return {
      id: `camp_${Date.now()}`,
      name: 'Untitled Campaign',
      type: 'regular',
      status: 'draft',
      audienceId: 'aud_1',
      segmentId: null,
      recipients: { listName: state.audiences[0]?.name || '', segmentName: null, count: state.audiences[0]?.stats?.subscribed || 0 },
      fromName: state.user.defaultFromName,
      fromEmail: state.user.defaultFromEmail,
      replyTo: state.user.defaultReplyTo,
      subject: '',
      previewText: '',
      templateId: null,
      content: [],
      scheduledAt: null,
      sentAt: null,
      report: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const [expandedStep, setExpandedStep] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');

  if (!campaign) {
    navigate('/campaigns');
    return null;
  }

  const recipientsDone = !!campaign.audienceId;
  const fromDone = !!campaign.fromName && !!campaign.fromEmail;
  const subjectDone = !!campaign.subject;
  const contentDone = campaign.content && campaign.content.length > 0;
  const allDone = recipientsDone && fromDone && subjectDone && contentDone;

  const saveCampaign = (updates) => {
    const updated = { ...campaign, ...updates, updatedAt: new Date().toISOString() };
    setCampaign(updated);
    if (isNew) {
      if (!state.campaigns.find(c => c.id === updated.id)) {
        addCampaign(updated);
      } else {
        updateCampaign(updated.id, updates);
      }
    } else {
      updateCampaign(updated.id, updates);
    }
  };

  const handleSend = () => {
    const recipientCount = campaign.recipients?.count || 0;
    const report = {
      campaignId: campaign.id,
      sent: recipientCount,
      delivered: Math.floor(recipientCount * (0.97 + Math.random() * 0.02)),
      opens: 0, uniqueOpens: 0, openRate: 0,
      clicks: 0, uniqueClicks: 0, clickRate: 0,
      bounces: 0, hardBounces: 0, softBounces: 0,
      unsubscribes: 0, complaints: 0, forwards: 0,
      topLinks: [], opensByHour: new Array(24).fill(0)
    };
    report.bounces = recipientCount - report.delivered;
    report.hardBounces = Math.floor(report.bounces * 0.3);
    report.softBounces = report.bounces - report.hardBounces;
    const openRate = 0.2 + Math.random() * 0.25;
    report.uniqueOpens = Math.floor(report.delivered * openRate);
    report.opens = Math.floor(report.uniqueOpens * 1.2);
    report.openRate = openRate;
    const clickRate = 0.05 + Math.random() * 0.1;
    report.uniqueClicks = Math.floor(report.delivered * clickRate);
    report.clicks = Math.floor(report.uniqueClicks * 1.2);
    report.clickRate = clickRate;
    report.unsubscribes = Math.floor(Math.random() * 10);
    report.complaints = Math.floor(Math.random() * 3);
    report.forwards = Math.floor(Math.random() * 15);
    report.topLinks = [
      { url: 'https://example.com/main', clicks: Math.floor(report.clicks * 0.6), uniqueClicks: Math.floor(report.uniqueClicks * 0.6) },
      { url: 'https://example.com/secondary', clicks: Math.floor(report.clicks * 0.3), uniqueClicks: Math.floor(report.uniqueClicks * 0.3) }
    ];
    report.opensByHour = Array.from({ length: 24 }, (_, i) => Math.floor(report.uniqueOpens * Math.max(0, Math.sin((i - 8) * Math.PI / 12)) * 0.15));

    saveCampaign({ status: 'sent', sentAt: new Date().toISOString(), report });
    addToast(`Campaign sent to ${recipientCount.toLocaleString()} contacts!`);
    setShowSendConfirm(false);
    navigate(`/campaigns/${campaign.id}/report`);
  };

  const handleSchedule = () => {
    if (!scheduleDate || !scheduleTime) return;
    const dt = new Date(`${scheduleDate}T${scheduleTime}`);
    saveCampaign({ status: 'scheduled', scheduledAt: dt.toISOString() });
    addToast('Campaign scheduled!');
    setShowSchedule(false);
    navigate('/campaigns');
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button className="back-link" onClick={() => navigate('/campaigns')}><ArrowLeft size={16} /> Back to all campaigns</button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-outlined" onClick={() => { saveCampaign({}); navigate('/campaigns'); }}>Finish Later</button>
          <button className="btn btn-outlined" onClick={() => setShowSchedule(true)} disabled={!allDone}>Schedule</button>
          <button className="btn btn-outlined" onClick={() => setShowSendTest(true)}>Send Test</button>
          <button className="btn btn-primary" onClick={() => setShowSendConfirm(true)} disabled={!allDone}>Send</button>
        </div>
      </div>

      {editingName ? (
        <input
          autoFocus
          value={campaign.name}
          onChange={e => setCampaign({ ...campaign, name: e.target.value })}
          onBlur={() => { setEditingName(false); saveCampaign({ name: campaign.name }); }}
          onKeyDown={e => { if (e.key === 'Enter') { setEditingName(false); saveCampaign({ name: campaign.name }); } }}
          style={{ fontSize: 24, fontWeight: 700, border: 'none', borderBottom: '2px solid #007C89', outline: 'none', background: 'transparent', width: '100%', marginBottom: 24 }}
        />
      ) : (
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, cursor: 'pointer' }} onClick={() => setEditingName(true)}>{campaign.name}</h1>
      )}

      {/* Step 1: Recipients */}
      <div className="wizard-step">
        <div className="wizard-step-header" onClick={() => setExpandedStep(expandedStep === 'to' ? null : 'to')}>
          <div className={`wizard-step-icon ${recipientsDone ? 'complete' : 'incomplete'}`}>
            {recipientsDone ? <Check size={16} /> : <AlertCircle size={16} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>To</div>
            <div className="text-muted text-sm">{campaign.recipients?.listName || 'Select audience'}{campaign.recipients?.segmentName ? ` - ${campaign.recipients.segmentName}` : ''}</div>
          </div>
        </div>
        {expandedStep === 'to' && (
          <div className="wizard-step-content" style={{ padding: '16px 20px' }}>
            <div className="form-group">
              <label>Audience</label>
              <select value={campaign.audienceId} onChange={e => {
                const aud = state.audiences.find(a => a.id === e.target.value);
                saveCampaign({
                  audienceId: e.target.value,
                  recipients: { ...campaign.recipients, listName: aud?.name || '', count: aud?.stats?.subscribed || 0 }
                });
              }}>
                {state.audiences.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Segment (optional)</label>
              <select value={campaign.segmentId || ''} onChange={e => {
                const seg = state.segments.find(s => s.id === e.target.value);
                saveCampaign({
                  segmentId: e.target.value || null,
                  recipients: { ...campaign.recipients, segmentName: seg?.name || null, count: seg?.memberCount || state.audiences[0]?.stats?.subscribed || 0 }
                });
              }}>
                <option value="">All contacts</option>
                {state.segments.map(s => <option key={s.id} value={s.id}>{s.name} ({s.memberCount})</option>)}
              </select>
            </div>
            <p className="text-sm text-muted">Estimated recipients: {campaign.recipients?.count?.toLocaleString() || 0}</p>
          </div>
        )}
      </div>

      {/* Step 2: From */}
      <div className="wizard-step">
        <div className="wizard-step-header" onClick={() => setExpandedStep(expandedStep === 'from' ? null : 'from')}>
          <div className={`wizard-step-icon ${fromDone ? 'complete' : 'incomplete'}`}>
            {fromDone ? <Check size={16} /> : <AlertCircle size={16} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>From</div>
            <div className="text-muted text-sm">{campaign.fromName} &lt;{campaign.fromEmail}&gt;</div>
          </div>
        </div>
        {expandedStep === 'from' && (
          <div className="wizard-step-content" style={{ padding: '16px 20px' }}>
            <div className="form-group">
              <label>From Name</label>
              <input value={campaign.fromName} onChange={e => saveCampaign({ fromName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>From Email</label>
              <input value={campaign.fromEmail} onChange={e => saveCampaign({ fromEmail: e.target.value })} />
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Subject */}
      <div className="wizard-step">
        <div className="wizard-step-header" onClick={() => setExpandedStep(expandedStep === 'subject' ? null : 'subject')}>
          <div className={`wizard-step-icon ${subjectDone ? 'complete' : 'incomplete'}`}>
            {subjectDone ? <Check size={16} /> : <AlertCircle size={16} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Subject</div>
            <div className="text-muted text-sm">{campaign.subject || 'Add a subject line'}</div>
          </div>
        </div>
        {expandedStep === 'subject' && (
          <div className="wizard-step-content" style={{ padding: '16px 20px' }}>
            <div className="form-group">
              <label>Subject Line <span className="text-muted text-xs">({campaign.subject?.length || 0} characters)</span></label>
              <input value={campaign.subject} onChange={e => saveCampaign({ subject: e.target.value })} placeholder="Enter subject line" />
            </div>
            <div className="form-group">
              <label>Preview Text</label>
              <input value={campaign.previewText} onChange={e => saveCampaign({ previewText: e.target.value })} placeholder="Enter preview text" />
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Content */}
      <div className="wizard-step">
        <div className="wizard-step-header" onClick={() => setExpandedStep(expandedStep === 'content' ? null : 'content')}>
          <div className={`wizard-step-icon ${contentDone ? 'complete' : 'incomplete'}`}>
            {contentDone ? <Check size={16} /> : <AlertCircle size={16} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Content</div>
            <div className="text-muted text-sm">{contentDone ? `${campaign.content.length} blocks` : 'Design your email'}</div>
          </div>
        </div>
        {expandedStep === 'content' && (
          <div className="wizard-step-content" style={{ padding: '16px 20px' }}>
            <button className="btn btn-primary" onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}>Design Email</button>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="modal-overlay" onClick={() => setShowSchedule(false)}>
          <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Schedule Your Campaign</h2></div>
            <div className="modal-body">
              <div className="form-group">
                <label><Calendar size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />Delivery Date</label>
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label><Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />Delivery Time</label>
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select defaultValue={state.user.timezone}>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setShowSchedule(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSchedule}>Schedule Campaign</button>
            </div>
          </div>
        </div>
      )}

      {/* Send Confirm Modal */}
      {showSendConfirm && (
        <div className="modal-overlay" onClick={() => setShowSendConfirm(false)}>
          <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Send Campaign</h2></div>
            <div className="modal-body">
              <p>Send "{campaign.name}" to {campaign.recipients?.count?.toLocaleString()} contacts now?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setShowSendConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSend}>Send Now</button>
            </div>
          </div>
        </div>
      )}
      {/* Send Test Modal */}
      {showSendTest && (
        <div className="modal-overlay" onClick={() => setShowSendTest(false)}>
          <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Test Email</h2>
              <button onClick={() => setShowSendTest(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-muted mb-16">Send a test email to check how your campaign looks before sending to your full audience.</p>
              <div className="form-group">
                <label>Send to email address</label>
                <input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="email@example.com" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outlined" onClick={() => setShowSendTest(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { addToast(`Test email sent to ${testEmail || state.user.email}`); setShowSendTest(false); }}>Send Test</button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Type Step (shown for new campaigns) */}
      {isNew && !state.campaigns.find(c => c.id === campaign.id) && (
        <div className="wizard-step" style={{ marginBottom: 12, borderLeft: '4px solid #FFE01B' }}>
          <div className="wizard-step-header">
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Campaign Type</div>
              <div className="text-muted text-sm">{campaign.type === 'regular' ? 'Regular' : campaign.type === 'plaintext' ? 'Plain Text' : 'A/B Test'}</div>
            </div>
          </div>
          <div className="wizard-step-content" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { type: 'regular', label: 'Regular', icon: Mail, desc: 'Design a branded email with our editor' },
                { type: 'plaintext', label: 'Plain Text', icon: FileText, desc: 'Simple text-only email' },
                { type: 'ab_test', label: 'A/B Test', icon: Split, desc: 'Test different versions' }
              ].map(opt => (
                <div key={opt.type}
                  style={{
                    padding: 16, borderRadius: 8, border: `2px solid ${campaign.type === opt.type ? '#007C89' : '#E5E5E5'}`,
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    background: campaign.type === opt.type ? '#E0F7FA' : '#fff'
                  }}
                  onClick={() => saveCampaign({ type: opt.type })}>
                  <opt.icon size={24} style={{ color: campaign.type === opt.type ? '#007C89' : '#707070', marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
                  <div className="text-xs text-muted" style={{ marginTop: 4 }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
