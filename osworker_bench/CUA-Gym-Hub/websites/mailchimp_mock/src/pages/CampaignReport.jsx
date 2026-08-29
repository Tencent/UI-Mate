import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Eye, MousePointer, AlertTriangle, Share2, UserMinus, DollarSign, Monitor, Smartphone, Tablet, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CampaignReport() {
  const { state } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const campaign = state.campaigns.find(c => c.id === id);
  const [activeTab, setActiveTab] = useState('overview');

  if (!campaign || !campaign.report) {
    navigate('/campaigns');
    return null;
  }

  const r = campaign.report;
  const sentDate = campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const sentTime = campaign.sentAt ? new Date(campaign.sentAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
  const maxOpens = Math.max(...(r.opensByHour || [1]));
  const maxClicks = Math.max(...(r.clicksByDay || [1]));

  const metricCards = [
    { icon: Mail, label: 'Delivered', value: r.delivered, rate: ((r.delivered / r.sent) * 100).toFixed(1), color: '#007C89' },
    { icon: Eye, label: 'Opened', value: r.uniqueOpens, rate: (r.openRate * 100).toFixed(1), color: '#1565C0' },
    { icon: MousePointer, label: 'Clicked', value: r.uniqueClicks, rate: (r.clickRate * 100).toFixed(1), color: '#2E7D32' },
    { icon: AlertTriangle, label: 'Bounced', value: r.bounces, rate: ((r.bounces / r.sent) * 100).toFixed(1), color: '#E65100' }
  ];

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/campaigns')}><ArrowLeft size={16} /> All Campaigns</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{campaign.name}</h1>
          <p className="text-muted">Sent {sentDate} at {sentTime}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 13, color: '#707070' }}>
            <span>To: {campaign.recipients?.listName}{campaign.recipients?.segmentName ? ` / ${campaign.recipients.segmentName}` : ''}</span>
            <span>&middot;</span>
            <span>Subject: {campaign.subject}</span>
          </div>
        </div>
        {r.revenue > 0 && (
          <div style={{ background: '#E8F5E9', borderRadius: 8, padding: '12px 20px', textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#2E7D32', fontWeight: 500 }}>Revenue</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#2E7D32' }}>${r.revenue.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="report-metrics">
        {metricCards.map(m => (
          <div key={m.label} className="report-metric" style={{ borderTop: `3px solid ${m.color}` }}>
            <div className="metric-icon" style={{ color: m.color }}><m.icon size={24} /></div>
            <div className="metric-value">{m.value?.toLocaleString()}</div>
            <div className="metric-rate">{m.rate}%</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'links', label: 'Click Performance' },
          { key: 'subscribers', label: 'Subscriber Activity' }
        ].map(t => (
          <button key={t.key} className={`filter-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="two-columns-60-40">
          <div>
            {/* 24-Hour Opens */}
            <div className="card mb-16">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>24-Hour Open Performance</h3>
              <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 2, padding: '0 4px' }}>
                {(r.opensByHour || []).map((val, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${maxOpens > 0 ? (val / maxOpens) * 160 : 0}px`,
                        background: `linear-gradient(180deg, #007C89 0%, rgba(0,124,137,0.6) 100%)`,
                        borderRadius: '2px 2px 0 0',
                        minHeight: val > 0 ? 2 : 0,
                        transition: 'height 0.3s'
                      }}
                      title={`${i}:00 - ${val} opens`}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span className="text-xs text-muted">12am</span>
                <span className="text-xs text-muted">6am</span>
                <span className="text-xs text-muted">12pm</span>
                <span className="text-xs text-muted">6pm</span>
                <span className="text-xs text-muted">11pm</span>
              </div>
            </div>

            {/* Click Performance by Day */}
            {r.clicksByDay && (
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Clicks Over First 7 Days</h3>
                <div style={{ height: 140, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 4px' }}>
                  {r.clicksByDay.map((val, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 11, color: '#707070' }}>{val}</span>
                      <div
                        style={{
                          width: '100%',
                          height: `${maxClicks > 0 ? (val / maxClicks) * 100 : 0}px`,
                          background: '#1565C0',
                          borderRadius: '3px 3px 0 0',
                          minHeight: val > 0 ? 2 : 0
                        }}
                      />
                      <span className="text-xs text-muted">Day {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {/* Device Stats */}
            {r.deviceStats && (
              <div className="card mb-16">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Opens by Device</h3>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  {[
                    { icon: Monitor, label: 'Desktop', value: r.deviceStats.desktop },
                    { icon: Smartphone, label: 'Mobile', value: r.deviceStats.mobile },
                    { icon: Tablet, label: 'Tablet', value: r.deviceStats.tablet }
                  ].map(d => (
                    <div key={d.label} style={{ flex: 1, textAlign: 'center', padding: 12, background: '#F6F6F4', borderRadius: 8 }}>
                      <d.icon size={20} style={{ color: '#007C89', marginBottom: 4 }} />
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{d.value}%</div>
                      <div className="text-xs text-muted">{d.label}</div>
                    </div>
                  ))}
                </div>
                {/* Stacked bar */}
                <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${r.deviceStats.desktop}%`, background: '#007C89' }} />
                  <div style={{ width: `${r.deviceStats.mobile}%`, background: '#1565C0' }} />
                  <div style={{ width: `${r.deviceStats.tablet}%`, background: '#7B1FA2' }} />
                </div>
              </div>
            )}

            {/* Location Stats */}
            {r.locationStats && (
              <div className="card mb-16">
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                  <Globe size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Top Locations
                </h3>
                {r.locationStats.map((loc, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < r.locationStats.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                    <span className="text-sm">{loc.country}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${(loc.opens / r.locationStats[0].opens) * 100}%`, height: '100%', background: '#007C89', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 13, minWidth: 40, textAlign: 'right' }}>{loc.opens}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Campaign Details */}
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Campaign Details</h3>
              {[
                ['Subject', campaign.subject],
                ['Preview Text', campaign.previewText],
                ['From', `${campaign.fromName} <${campaign.fromEmail}>`],
                ['Sent Date', sentDate],
                ['Audience', campaign.recipients?.listName],
                ['Segment', campaign.recipients?.segmentName || 'All contacts']
              ].map(([label, value]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div className="text-xs text-muted" style={{ marginBottom: 2 }}>{label}</div>
                  <div className="text-sm">{value || '--'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'links' && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Click Performance</h3>
          {r.topLinks && r.topLinks.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Total Clicks</th>
                  <th>Unique Clicks</th>
                  <th>Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {r.topLinks.map((link, i) => (
                  <tr key={i}>
                    <td>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007C89', wordBreak: 'break-all' }}>{link.url}</a>
                    </td>
                    <td>{link.clicks}</td>
                    <td>{link.uniqueClicks}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 6, background: '#F0F0F0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${(link.clicks / (r.topLinks[0]?.clicks || 1)) * 100}%`, height: '100%', background: '#007C89', borderRadius: 3 }} />
                        </div>
                        <span className="text-sm">{((link.uniqueClicks / r.delivered) * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">No link click data available for this campaign.</p>
          )}
        </div>
      )}

      {activeTab === 'subscribers' && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Subscriber Activity</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { icon: Mail, label: 'Successful Deliveries', value: r.delivered, color: '#007C89' },
              { icon: Eye, label: 'Total Opens', value: r.opens, color: '#1565C0' },
              { icon: Eye, label: 'Unique Opens', value: r.uniqueOpens, color: '#1565C0' },
              { icon: MousePointer, label: 'Total Clicks', value: r.clicks, color: '#2E7D32' },
              { icon: MousePointer, label: 'Unique Clicks', value: r.uniqueClicks, color: '#2E7D32' },
              { icon: Share2, label: 'Forwarded', value: r.forwards, color: '#7B1FA2' },
              { icon: UserMinus, label: 'Unsubscribed', value: r.unsubscribes, color: '#D5432F' },
              { icon: AlertTriangle, label: 'Spam Complaints', value: r.complaints, color: '#D5432F' },
              { icon: AlertTriangle, label: 'Hard Bounces', value: r.hardBounces, color: '#E65100' },
              { icon: AlertTriangle, label: 'Soft Bounces', value: r.softBounces, color: '#E65100' }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F6F6F4', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <item.icon size={16} style={{ color: item.color }} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{(item.value || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
