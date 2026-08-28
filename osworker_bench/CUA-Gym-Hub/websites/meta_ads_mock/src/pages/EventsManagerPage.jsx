import { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle, Clock, Settings, Plus, Trash2, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import './EventsManagerPage.css';

function formatNum(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function StatusDot({ status }) {
  const colors = { active: '#31A24C', error: '#FA383E', inactive: '#8A8D91', processing: '#F7B928' };
  return <span className="em-status-dot" style={{ background: colors[status] || '#8A8D91' }} />;
}

function EventRow({ event, expanded, onToggle }) {
  return (
    <>
      <tr className="em-event-row" onClick={onToggle}>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {expanded ? <ChevronDown size={14} color="#65676B" /> : <ChevronRight size={14} color="#65676B" />}
            <span style={{ fontWeight: 500 }}>{event.name}</span>
          </div>
        </td>
        <td>
          <span className={`em-source-badge em-source-badge--${event.source}`}>
            {event.source === 'pixel' ? 'Pixel' : event.source === 'server' ? 'Server' : 'App SDK'}
          </span>
        </td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusDot status={event.status} />
            <span style={{ textTransform: 'capitalize' }}>{event.status}</span>
          </div>
        </td>
        <td style={{ textAlign: 'right' }}>{formatNum(event.eventsReceived)}</td>
        <td style={{ textAlign: 'right' }}>{formatNum(event.eventsMatched)}</td>
        <td style={{ textAlign: 'right' }}>{event.matchRate ? event.matchRate + '%' : '--'}</td>
        <td style={{ color: '#65676B' }}>{event.lastReceived || 'Never'}</td>
      </tr>
      {expanded && (
        <tr className="em-event-detail-row">
          <td colSpan={7}>
            <div className="em-event-details">
              <div className="em-detail-grid">
                <div className="em-detail-item">
                  <div className="em-detail-label">Event ID</div>
                  <div className="em-detail-value">{event.id}</div>
                </div>
                <div className="em-detail-item">
                  <div className="em-detail-label">Parameter tracking</div>
                  <div className="em-detail-value">{event.parameters?.join(', ') || 'None'}</div>
                </div>
                <div className="em-detail-item">
                  <div className="em-detail-label">Attribution window</div>
                  <div className="em-detail-value">{event.attributionWindow || '7-day click, 1-day view'}</div>
                </div>
                <div className="em-detail-item">
                  <div className="em-detail-label">Optimization availability</div>
                  <div className="em-detail-value">{event.optimizationAvailable ? 'Available' : 'Not available'}</div>
                </div>
              </div>
              {event.recentErrors?.length > 0 && (
                <div className="em-errors-section">
                  <div className="em-errors-title">
                    <AlertTriangle size={14} color="#FA383E" />
                    Recent errors ({event.recentErrors.length})
                  </div>
                  {event.recentErrors.map((err, i) => (
                    <div key={i} className="em-error-row">
                      <span>{err.message}</span>
                      <span className="em-error-time">{err.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function EventsManagerPage() {
  const { state, updateState } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [showCreateConversion, setShowCreateConversion] = useState(false);
  const [newConvName, setNewConvName] = useState('');
  const [newConvEvent, setNewConvEvent] = useState('');
  const [newConvRule, setNewConvRule] = useState('url_contains');
  const [newConvValue, setNewConvValue] = useState('');

  const eventsManager = state.eventsManager || {
    pixels: [
      {
        id: 'pixel_001',
        name: 'Acme Corp Pixel',
        status: 'active',
        pixelId: '1234567890123456',
        domain: 'www.example.com',
        lastActivity: '2 minutes ago',
        eventsToday: 4521,
        eventsYesterday: 5102,
        createdAt: '2024-08-15T10:00:00Z'
      }
    ],
    events: [
      { id: 'evt_001', name: 'PageView', source: 'pixel', status: 'active', eventsReceived: 245000, eventsMatched: 198000, matchRate: 80.8, lastReceived: '2 min ago', parameters: ['url', 'referrer', 'user_agent'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
      { id: 'evt_002', name: 'ViewContent', source: 'pixel', status: 'active', eventsReceived: 89200, eventsMatched: 71500, matchRate: 80.2, lastReceived: '5 min ago', parameters: ['content_ids', 'content_type', 'value', 'currency'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
      { id: 'evt_003', name: 'AddToCart', source: 'pixel', status: 'active', eventsReceived: 34500, eventsMatched: 28100, matchRate: 81.4, lastReceived: '8 min ago', parameters: ['content_ids', 'content_type', 'value', 'currency', 'num_items'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
      { id: 'evt_004', name: 'InitiateCheckout', source: 'pixel', status: 'active', eventsReceived: 18700, eventsMatched: 15200, matchRate: 81.3, lastReceived: '12 min ago', parameters: ['value', 'currency', 'num_items'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
      { id: 'evt_005', name: 'Purchase', source: 'pixel', status: 'active', eventsReceived: 8900, eventsMatched: 7400, matchRate: 83.1, lastReceived: '15 min ago', parameters: ['value', 'currency', 'content_ids', 'content_type', 'num_items', 'order_id'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
      { id: 'evt_006', name: 'Lead', source: 'pixel', status: 'active', eventsReceived: 4200, eventsMatched: 3400, matchRate: 81.0, lastReceived: '22 min ago', parameters: ['value', 'currency'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
      { id: 'evt_007', name: 'CompleteRegistration', source: 'pixel', status: 'active', eventsReceived: 2800, eventsMatched: 2200, matchRate: 78.6, lastReceived: '1 hour ago', parameters: ['value', 'currency', 'status'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
      { id: 'evt_008', name: 'Search', source: 'pixel', status: 'active', eventsReceived: 56000, eventsMatched: 44800, matchRate: 80.0, lastReceived: '3 min ago', parameters: ['search_string', 'content_category'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
      { id: 'evt_009', name: 'ServerPurchase', source: 'server', status: 'active', eventsReceived: 3200, eventsMatched: 2900, matchRate: 90.6, lastReceived: '30 min ago', parameters: ['value', 'currency', 'order_id', 'email_hash', 'phone_hash'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: true, recentErrors: [] },
      { id: 'evt_010', name: 'ServerLead', source: 'server', status: 'error', eventsReceived: 1500, eventsMatched: 0, matchRate: 0, lastReceived: '2 days ago', parameters: ['value', 'email_hash'], attributionWindow: '7-day click, 1-day view', optimizationAvailable: false, recentErrors: [
        { message: 'Invalid access token - server-side API token expired', time: '2 days ago' },
        { message: 'Connection timeout to Conversions API endpoint', time: '3 days ago' }
      ] },
    ],
    customConversions: [
      { id: 'cc_001', name: 'High-Value Purchase', rule: 'Purchase event where value > 100', eventSource: 'Purchase', status: 'active', totalFires: 2340, createdAt: '2025-03-01T10:00:00Z' },
      { id: 'cc_002', name: 'Checkout Abandonment', rule: 'InitiateCheckout without Purchase within 24h', eventSource: 'InitiateCheckout', status: 'active', totalFires: 9800, createdAt: '2025-04-15T14:00:00Z' },
      { id: 'cc_003', name: 'Product Page - Sale Items', rule: 'ViewContent where URL contains /sale/', eventSource: 'ViewContent', status: 'active', totalFires: 15600, createdAt: '2025-05-20T08:00:00Z' },
    ],
    diagnostics: {
      overallHealth: 'good',
      pixelFireRate: 98.2,
      eventMatchQuality: 'Great',
      domainVerification: 'verified',
      aggregatedEventMeasurement: true,
      serverEventsDeduplication: 92.1,
    }
  };

  // Save events manager state when it changes
  const pixel = eventsManager.pixels?.[0];
  const events = eventsManager.events || [];
  const customConversions = eventsManager.customConversions || [];
  const diagnostics = eventsManager.diagnostics || {};

  function handleCreateConversion() {
    if (!newConvName.trim()) { showToast('Please enter a conversion name.'); return; }
    const newConversion = {
      id: `cc_${Date.now()}`,
      name: newConvName.trim(),
      rule: `${newConvEvent} where ${newConvRule} ${newConvValue}`,
      eventSource: newConvEvent || 'PageView',
      status: 'active',
      totalFires: 0,
      createdAt: new Date().toISOString()
    };
    updateState(prev => ({
      ...prev,
      eventsManager: {
        ...prev.eventsManager || eventsManager,
        customConversions: [...(prev.eventsManager?.customConversions || customConversions), newConversion]
      }
    }));
    showToast('Custom conversion created.');
    setShowCreateConversion(false);
    setNewConvName('');
    setNewConvEvent('');
    setNewConvValue('');
  }

  function handleDeleteConversion(id) {
    updateState(prev => ({
      ...prev,
      eventsManager: {
        ...prev.eventsManager || eventsManager,
        customConversions: (prev.eventsManager?.customConversions || customConversions).filter(c => c.id !== id)
      }
    }));
    showToast('Custom conversion deleted.');
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'customConversions', label: 'Custom Conversions' },
    { key: 'diagnostics', label: 'Diagnostics' },
    { key: 'settings', label: 'Settings' },
  ];

  const totalEvents = events.reduce((s, e) => s + (e.eventsReceived || 0), 0);
  const totalMatched = events.reduce((s, e) => s + (e.eventsMatched || 0), 0);
  const activeEvents = events.filter(e => e.status === 'active').length;
  const errorEvents = events.filter(e => e.status === 'error').length;

  return (
    <div className="em-page">
      {/* Page header */}
      <div className="em-header">
        <div className="em-header-left">
          <Zap size={24} color="#0866FF" />
          <div>
            <h2 className="em-title">Events Manager</h2>
            <p className="em-subtitle">{pixel?.name || 'Meta Pixel'} &middot; ID: {pixel?.pixelId || 'N/A'}</p>
          </div>
        </div>
        <div className="em-header-actions">
          <button className="btn-outline" onClick={() => showToast('Test events tool opened.')}>
            Test Events
          </button>
          <button className="btn-outline" onClick={() => showToast('Partner integrations opened.')}>
            <ExternalLink size={14} />
            Partner Integrations
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="em-tab-bar">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`em-tab-btn ${activeTab === t.key ? 'em-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="em-content">
          {/* Summary cards */}
          <div className="em-summary-cards">
            <div className="em-summary-card">
              <div className="em-summary-label">Total Events Received</div>
              <div className="em-summary-value">{formatNum(totalEvents)}</div>
              <div className="em-summary-sub">Last 7 days</div>
            </div>
            <div className="em-summary-card">
              <div className="em-summary-label">Events Matched</div>
              <div className="em-summary-value">{formatNum(totalMatched)}</div>
              <div className="em-summary-sub">{totalEvents > 0 ? ((totalMatched / totalEvents) * 100).toFixed(1) : 0}% match rate</div>
            </div>
            <div className="em-summary-card">
              <div className="em-summary-label">Active Events</div>
              <div className="em-summary-value" style={{ color: '#31A24C' }}>{activeEvents}</div>
              <div className="em-summary-sub">of {events.length} total</div>
            </div>
            <div className="em-summary-card">
              <div className="em-summary-label">Events with Errors</div>
              <div className="em-summary-value" style={{ color: errorEvents > 0 ? '#FA383E' : '#31A24C' }}>{errorEvents}</div>
              <div className="em-summary-sub">{errorEvents > 0 ? 'Needs attention' : 'All good'}</div>
            </div>
          </div>

          {/* Pixel info bar */}
          <div className="em-pixel-bar">
            <div className="em-pixel-info">
              <StatusDot status={pixel?.status || 'active'} />
              <span style={{ fontWeight: 600 }}>{pixel?.name}</span>
              <span className="em-pixel-id">ID: {pixel?.pixelId}</span>
              <span className="em-pixel-domain">{pixel?.domain}</span>
            </div>
            <div className="em-pixel-stats">
              <span>Today: <strong>{formatNum(pixel?.eventsToday || 0)}</strong> events</span>
              <span className="em-pixel-divider">|</span>
              <span>Yesterday: <strong>{formatNum(pixel?.eventsYesterday || 0)}</strong></span>
              <span className="em-pixel-divider">|</span>
              <span>Last activity: <strong>{pixel?.lastActivity || 'Unknown'}</strong></span>
            </div>
          </div>

          {/* Events table */}
          <div className="em-section">
            <div className="em-section-header">
              <h3 className="em-section-title">Events ({events.length})</h3>
            </div>
            <table className="data-table-basic em-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Events Received</th>
                  <th style={{ textAlign: 'right' }}>Events Matched</th>
                  <th style={{ textAlign: 'right' }}>Match Rate</th>
                  <th>Last Received</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <EventRow
                    key={event.id}
                    event={event}
                    expanded={expandedEvent === event.id}
                    onToggle={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Server-Side Events section */}
          <div className="em-section">
            <div className="em-section-header">
              <h3 className="em-section-title">Server-Side Events (Conversions API)</h3>
            </div>
            <div className="em-server-info">
              <div className="em-server-card">
                <div className="em-server-icon">
                  <CheckCircle size={20} color="#31A24C" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Conversions API Connected</div>
                  <div style={{ fontSize: 12, color: '#65676B' }}>
                    Server events are being received and deduplicated with browser pixel events.
                    Deduplication rate: {diagnostics.serverEventsDeduplication || 0}%
                  </div>
                </div>
              </div>
              <div className="em-server-stats">
                {events.filter(e => e.source === 'server').map(e => (
                  <div key={e.id} className="em-server-stat-row">
                    <span style={{ fontWeight: 500 }}>{e.name}</span>
                    <span>{formatNum(e.eventsReceived)} received</span>
                    <span>
                      <StatusDot status={e.status} />
                      <span style={{ textTransform: 'capitalize', marginLeft: 4 }}>{e.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Conversions tab */}
      {activeTab === 'customConversions' && (
        <div className="em-content">
          <div className="em-section">
            <div className="em-section-header">
              <h3 className="em-section-title">Custom Conversions ({customConversions.length})</h3>
              <button className="btn-primary" onClick={() => setShowCreateConversion(true)}>
                <Plus size={14} />
                Create Custom Conversion
              </button>
            </div>
            <table className="data-table-basic em-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rule</th>
                  <th>Event Source</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Total Fires</th>
                  <th>Created</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {customConversions.map(cc => (
                  <tr key={cc.id}>
                    <td style={{ fontWeight: 500 }}>{cc.name}</td>
                    <td style={{ color: '#65676B', fontSize: 12 }}>{cc.rule}</td>
                    <td>{cc.eventSource}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StatusDot status={cc.status} />
                        <span style={{ textTransform: 'capitalize' }}>{cc.status}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>{formatNum(cc.totalFires)}</td>
                    <td style={{ color: '#65676B' }}>{new Date(cc.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="em-delete-btn"
                        title="Delete"
                        onClick={() => handleDeleteConversion(cc.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {customConversions.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#65676B', padding: 40 }}>
                      No custom conversions. Create one to track specific user actions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Create Conversion Modal */}
          {showCreateConversion && (
            <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreateConversion(false); }}>
              <div className="modal-container" style={{ width: 520 }}>
                <div className="modal-header">
                  <div className="modal-tabs">
                    <button className="modal-tab modal-tab--active">Create Custom Conversion</button>
                  </div>
                  <button className="modal-close" onClick={() => setShowCreateConversion(false)}>&#10005;</button>
                </div>
                <div className="modal-body" style={{ padding: 20 }}>
                  <div className="field-group">
                    <label className="field-label">Name</label>
                    <input
                      className="field-input"
                      value={newConvName}
                      onChange={e => setNewConvName(e.target.value)}
                      placeholder="e.g. High-Value Purchase"
                      autoFocus
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Data source event</label>
                    <select className="field-select" value={newConvEvent} onChange={e => setNewConvEvent(e.target.value)}>
                      <option value="">Select an event...</option>
                      {events.map(e => (
                        <option key={e.id} value={e.name}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Rule type</label>
                    <select className="field-select" value={newConvRule} onChange={e => setNewConvRule(e.target.value)}>
                      <option value="url_contains">URL contains</option>
                      <option value="url_equals">URL equals</option>
                      <option value="event_parameter">Event parameter</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Value</label>
                    <input
                      className="field-input"
                      value={newConvValue}
                      onChange={e => setNewConvValue(e.target.value)}
                      placeholder={newConvRule === 'event_parameter' ? 'e.g. value > 100' : 'e.g. /thank-you'}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-outline" onClick={() => setShowCreateConversion(false)}>Cancel</button>
                  <div style={{ flex: 1 }} />
                  <button className="btn-primary" onClick={handleCreateConversion}>Create</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diagnostics tab */}
      {activeTab === 'diagnostics' && (
        <div className="em-content">
          <div className="em-section">
            <div className="em-section-header">
              <h3 className="em-section-title">Pixel Health</h3>
            </div>
            <div className="em-diagnostics-grid">
              <div className="em-diag-card">
                <div className="em-diag-header">
                  <CheckCircle size={20} color="#31A24C" />
                  <span>Overall Health</span>
                </div>
                <div className="em-diag-value" style={{ color: '#31A24C', textTransform: 'capitalize' }}>{diagnostics.overallHealth || 'Good'}</div>
                <div className="em-diag-desc">Your pixel is working correctly and receiving events.</div>
              </div>
              <div className="em-diag-card">
                <div className="em-diag-header">
                  <Zap size={20} color="#0866FF" />
                  <span>Pixel Fire Rate</span>
                </div>
                <div className="em-diag-value">{diagnostics.pixelFireRate || 0}%</div>
                <div className="em-diag-desc">Percentage of page loads where the pixel fired correctly.</div>
              </div>
              <div className="em-diag-card">
                <div className="em-diag-header">
                  <CheckCircle size={20} color={diagnostics.eventMatchQuality === 'Great' ? '#31A24C' : '#F7B928'} />
                  <span>Event Match Quality</span>
                </div>
                <div className="em-diag-value" style={{ color: diagnostics.eventMatchQuality === 'Great' ? '#31A24C' : '#F7B928' }}>
                  {diagnostics.eventMatchQuality || 'Good'}
                </div>
                <div className="em-diag-desc">How well your events match Meta user accounts for attribution.</div>
              </div>
              <div className="em-diag-card">
                <div className="em-diag-header">
                  {diagnostics.domainVerification === 'verified'
                    ? <CheckCircle size={20} color="#31A24C" />
                    : <AlertTriangle size={20} color="#FA383E" />}
                  <span>Domain Verification</span>
                </div>
                <div className="em-diag-value" style={{ textTransform: 'capitalize', color: diagnostics.domainVerification === 'verified' ? '#31A24C' : '#FA383E' }}>
                  {diagnostics.domainVerification || 'Unverified'}
                </div>
                <div className="em-diag-desc">Verify your domain to manage link editing and optimize events.</div>
              </div>
              <div className="em-diag-card">
                <div className="em-diag-header">
                  {diagnostics.aggregatedEventMeasurement
                    ? <CheckCircle size={20} color="#31A24C" />
                    : <Clock size={20} color="#F7B928" />}
                  <span>Aggregated Event Measurement</span>
                </div>
                <div className="em-diag-value" style={{ color: diagnostics.aggregatedEventMeasurement ? '#31A24C' : '#F7B928' }}>
                  {diagnostics.aggregatedEventMeasurement ? 'Configured' : 'Not configured'}
                </div>
                <div className="em-diag-desc">Configure events for iOS 14+ web conversions measurement.</div>
              </div>
              <div className="em-diag-card">
                <div className="em-diag-header">
                  <Zap size={20} color="#0866FF" />
                  <span>Server Events Deduplication</span>
                </div>
                <div className="em-diag-value">{diagnostics.serverEventsDeduplication || 0}%</div>
                <div className="em-diag-desc">Rate at which server and browser events are correctly deduplicated.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div className="em-content">
          <div className="em-section">
            <div className="em-section-header">
              <h3 className="em-section-title">Pixel Settings</h3>
            </div>
            <div className="em-settings-card">
              <div className="field-group">
                <label className="field-label">Pixel name</label>
                <input className="field-input" defaultValue={pixel?.name || ''} style={{ maxWidth: 400 }} />
              </div>
              <div className="field-group">
                <label className="field-label">Pixel ID</label>
                <div className="em-readonly-field">{pixel?.pixelId || 'N/A'}</div>
              </div>
              <div className="field-group">
                <label className="field-label">Associated domain</label>
                <div className="em-readonly-field">{pixel?.domain || 'N/A'}</div>
              </div>
              <div className="field-group">
                <label className="field-label">First-party cookies</label>
                <div className="em-toggle-row">
                  <span>Enable first-party cookies for improved tracking</span>
                  <button className="toggle-btn toggle-btn--on" onClick={() => showToast('Setting toggled.')}>
                    <span className="toggle-thumb" />
                  </button>
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Automatic advanced matching</label>
                <div className="em-toggle-row">
                  <span>Send hashed customer info to improve match rates</span>
                  <button className="toggle-btn toggle-btn--on" onClick={() => showToast('Setting toggled.')}>
                    <span className="toggle-thumb" />
                  </button>
                </div>
              </div>
              <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => showToast('Pixel settings saved.')}>
                Save Changes
              </button>
            </div>
          </div>

          <div className="em-section">
            <div className="em-section-header">
              <h3 className="em-section-title">Conversions API</h3>
            </div>
            <div className="em-settings-card">
              <div className="field-group">
                <label className="field-label">Access token</label>
                <div className="em-token-field">
                  <input className="field-input" type="password" defaultValue="EAABw..." style={{ flex: 1 }} readOnly />
                  <button className="btn-outline btn-sm" onClick={() => showToast('Token copied to clipboard.')}>Copy</button>
                  <button className="btn-outline btn-sm" onClick={() => showToast('New token generated.')}>Regenerate</button>
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Server endpoint</label>
                <div className="em-readonly-field">https://graph.facebook.com/v18.0/{pixel?.pixelId}/events</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
