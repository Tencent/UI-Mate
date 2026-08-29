import React from 'react';
import { useApp } from '../context/AppContext';

export default function NotificationPrefs() {
  const { state, dispatch, showToast } = useApp();
  if (!state) return null;
  const { settings } = state;

  const prefs = [
    { key: 'emailOrderConfirmation', label: 'Order Confirmation', desc: 'Email when a new order is placed' },
    { key: 'emailReturnRequest', label: 'Return Request', desc: 'Email when a buyer initiates a return' },
    { key: 'emailBuyerMessage', label: 'Buyer Message', desc: 'Email when a buyer sends a message' },
    { key: 'emailInventoryAlert', label: 'Inventory Alert', desc: 'Email when inventory is running low' },
    { key: 'emailPromotions', label: 'Promotions', desc: 'Promotional emails and newsletters from Amazon' },
    { key: 'emailReports', label: 'Reports', desc: 'Scheduled reports and analytics summaries' },
    { key: 'emailFeedback', label: 'Feedback Alerts', desc: 'Email when a buyer leaves feedback on an order' },
    { key: 'emailAdvertisingAlerts', label: 'Advertising Alerts', desc: 'Budget and performance alerts for ad campaigns' }
  ];

  const toggle = (key) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { notificationPreferences: { ...settings.notificationPreferences, [key]: !settings.notificationPreferences[key] } } });
    showToast('Preference saved', 'success');
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Notification Preferences</h1>
      <div className="card">
        <div className="card-title">Email Notifications</div>
        {prefs.map((p, i) => (
          <div key={p.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < prefs.length - 1 ? '1px solid #eee' : 'none' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{p.desc}</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={settings.notificationPreferences[p.key]} onChange={() => toggle(p.key)} />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
