import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppContext';
import { generateId } from '../utils/dataManager';
import { Eye, EyeOff, Save, CheckCircle, Plus, Trash2, X } from 'lucide-react';

export default function Settings() {
  const { state, dispatch } = useAppState();
  const [activeTab, setActiveTab] = useState('account');
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [webhookForm, setWebhookForm] = useState({ url: '', description: '' });
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyCreated, setNewKeyCreated] = useState(null);

  const business = state.business || {
    name: 'Rocket Rides',
    support_email: 'support@rocketrides.io',
    currency: 'usd',
  };

  const taxSettings = state.taxSettings || { collect_automatically: false };
  const webhooks = state.webhooks || [];

  // Controlled form state for account tab
  const [accountForm, setAccountForm] = useState({
    name: business.name || '',
    support_email: business.support_email || '',
    currency: (business.currency || 'usd').toUpperCase(),
  });

  // Keep form in sync when state changes externally
  useEffect(() => {
    setAccountForm({
      name: business.name || '',
      support_email: business.support_email || '',
      currency: (business.currency || 'usd').toUpperCase(),
    });
  }, [state.business]);

  const tabs = [
    { id: 'account', label: 'Account Details' },
    { id: 'api', label: 'API Keys' },
    { id: 'webhooks', label: 'Webhooks' },
    { id: 'tax', label: 'Tax' },
  ];

  function handleSaveAccount() {
    dispatch({
      type: 'UPDATE_BUSINESS',
      payload: {
        name: accountForm.name,
        support_email: accountForm.support_email,
        currency: accountForm.currency.toLowerCase(),
      },
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }

  function handleToggleTax(e) {
    dispatch({
      type: 'UPDATE_TAX_SETTINGS',
      payload: { collect_automatically: e.target.checked },
    });
  }

  function handleAddWebhook(e) {
    e.preventDefault();
    if (!webhookForm.url) return;
    dispatch({
      type: 'ADD_WEBHOOK',
      payload: {
        id: generateId('we'),
        url: webhookForm.url,
        description: webhookForm.description || null,
        status: 'enabled',
        created: Math.floor(Date.now() / 1000),
        events: ['*'],
      },
    });
    setWebhookForm({ url: '', description: '' });
    setShowAddWebhook(false);
  }

  function handleDeleteWebhook(id) {
    dispatch({ type: 'DELETE_WEBHOOK', payload: id });
  }

  function handleCreateKey(e) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const generated = 'sk_live_' + Array.from({ length: 32 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('');
    setNewKeyCreated(generated);
  }

  return (
    <div className="page-content" style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 className="page-title">Settings</h1>

      <div className="tab-row" style={{ marginBottom: 24 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        {activeTab === 'account' && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 24 }}>Public Business Information</h2>
            <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label">Business Name</label>
                <input
                  type="text"
                  value={accountForm.name}
                  onChange={e => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Support Email</label>
                <input
                  type="email"
                  value={accountForm.support_email}
                  onChange={e => setAccountForm({ ...accountForm, support_email: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Default Currency</label>
                <select
                  value={accountForm.currency}
                  onChange={e => setAccountForm({ ...accountForm, currency: e.target.value })}
                  className="form-input"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  onClick={handleSaveAccount}
                >
                  <Save size={16} /> Save changes
                </button>
                {saveSuccess && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-success)', fontSize: 13 }}>
                    <CheckCircle size={14} /> Saved
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 500 }}>API Keys</h2>
              <button className="btn-link" onClick={() => { setNewKeyName(''); setNewKeyCreated(null); setShowCreateKey(true); }}>+ Create secret key</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Publishable key</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-background)', padding: '2px 8px', borderRadius: 4 }}>Live</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-secondary)', background: 'var(--color-background)', padding: 8, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  pk_live_51Hzxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                </div>
              </div>

              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Secret key</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-background)', padding: '2px 8px', borderRadius: 4 }}>Live</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-secondary)', background: 'var(--color-background)', padding: 8, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      {showKey ? 'sk_test_51Hzxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' : 'sk_test_.........................'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px' }}
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
                  Use this key to authenticate requests on your server. Do not expose this key in your frontend code.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 500 }}>Hosted Endpoints</h2>
              <button className="btn-link" onClick={() => { setWebhookForm({ url: '', description: '' }); setShowAddWebhook(true); }}>+ Add endpoint</button>
            </div>

            {webhooks.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontWeight: 500 }}>No webhooks configured</p>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>Listen for events on your account so your integration can automatically trigger reactions.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {webhooks.map(hook => (
                  <div key={hook.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-background)' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{hook.url}</div>
                      {hook.description && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{hook.description}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, background: '#ECFDF3', color: '#067647', padding: '2px 8px', borderRadius: 4 }}>{hook.status}</span>
                      <button onClick={() => handleDeleteWebhook(hook.id)} style={{ color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }} title="Remove endpoint">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tax' && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 24 }}>Tax Settings</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <input
                type="checkbox"
                id="collect_tax"
                checked={taxSettings.collect_automatically}
                onChange={handleToggleTax}
                style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <label htmlFor="collect_tax" style={{ fontSize: 13, cursor: 'pointer' }}>Collect tax automatically based on customer address</label>
            </div>
          </div>
        )}
      </div>

      {/* Add Webhook Modal */}
      {showAddWebhook && (
        <div className="modal-overlay" onClick={() => setShowAddWebhook(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add webhook endpoint</div>
              <button className="modal-close" onClick={() => setShowAddWebhook(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddWebhook}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Endpoint URL *</label>
                  <input
                    className="form-input"
                    type="url"
                    required
                    placeholder="https://example.com/webhook"
                    value={webhookForm.url}
                    onChange={e => setWebhookForm({ ...webhookForm, url: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    className="form-input"
                    placeholder="Optional description"
                    value={webhookForm.description}
                    onChange={e => setWebhookForm({ ...webhookForm, description: e.target.value })}
                  />
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  This endpoint will receive all event types. You can filter events after creation.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddWebhook(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add endpoint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Secret Key Modal */}
      {showCreateKey && (
        <div className="modal-overlay" onClick={() => !newKeyCreated && setShowCreateKey(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {newKeyCreated ? (
              <>
                <div className="modal-header">
                  <div className="modal-title">Your new secret key</div>
                </div>
                <div className="modal-body">
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                    Copy this key now. For security, it will not be shown again.
                  </p>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--color-background)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', wordBreak: 'break-all' }}>
                    {newKeyCreated}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-primary" onClick={() => { setShowCreateKey(false); setNewKeyCreated(null); }}>Done</button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-header">
                  <div className="modal-title">Create secret key</div>
                  <button className="modal-close" onClick={() => setShowCreateKey(false)}>&times;</button>
                </div>
                <form onSubmit={handleCreateKey}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="form-label">Key name *</label>
                      <input
                        className="form-input"
                        required
                        placeholder="e.g. My production key"
                        value={newKeyName}
                        onChange={e => setNewKeyName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => setShowCreateKey(false)}>Cancel</button>
                    <button type="submit" className="btn-primary">Create key</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
