import React from 'react';
import { useStore } from '../lib/store';

export default function Account() {
  const { state, updateSettings } = useStore();
  const settings = state.settings || { dividendReinvestment: true, orderNotifications: true, theme: 'dark' };

  const toggleSetting = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  const cycleTheme = () => {
    const themes = ['dark', 'light', 'auto'];
    const currentIdx = themes.indexOf(settings.theme || 'dark');
    const nextTheme = themes[(currentIdx + 1) % themes.length];
    updateSettings({ theme: nextTheme });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Account</h1>

      <div className="bg-surface rounded-xl border border-surface-hover overflow-hidden mb-6">
        <div className="p-6 border-b border-surface-hover flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
            {state.user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-lg font-bold">{state.user.name}</h2>
            <p className="text-sm text-text-muted">{state.user.email}</p>
          </div>
        </div>

        <div className="divide-y divide-surface-hover">
          <div className="px-6 py-4 flex justify-between">
            <span className="text-text-muted">Account Type</span>
            <span className="font-medium">{state.user.accountType}</span>
          </div>
          <div className="px-6 py-4 flex justify-between">
            <span className="text-text-muted">Member Since</span>
            <span className="font-medium">{new Date(state.user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="px-6 py-4 flex justify-between">
            <span className="text-text-muted">Xobinhood Gold</span>
            <span className="font-medium">{state.user.goldMember ? 'Active' : 'Not subscribed'}</span>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-surface-hover overflow-hidden mb-6">
        <div className="p-4 border-b border-surface-hover">
          <h3 className="font-bold">Investing</h3>
        </div>
        <div className="divide-y divide-surface-hover">
          <div
            className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-surface-hover/50 transition-colors"
            onClick={() => toggleSetting('dividendReinvestment')}
          >
            <span className="text-text-muted">Dividend Reinvestment</span>
            <ToggleSwitch enabled={settings.dividendReinvestment !== false} />
          </div>
          <div
            className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-surface-hover/50 transition-colors"
            onClick={() => toggleSetting('orderNotifications')}
          >
            <span className="text-text-muted">Order Notifications</span>
            <ToggleSwitch enabled={settings.orderNotifications !== false} />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-surface-hover overflow-hidden">
        <div className="p-4 border-b border-surface-hover">
          <h3 className="font-bold">App Appearance</h3>
        </div>
        <div className="divide-y divide-surface-hover">
          <div
            className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-surface-hover/50 transition-colors"
            onClick={cycleTheme}
          >
            <span className="text-text-muted">Theme</span>
            <span className="px-3 py-1 bg-surface-hover rounded-full text-sm font-medium capitalize">
              {settings.theme || 'Dark'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ enabled }) {
  return (
    <div className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? 'bg-primary' : 'bg-surface-hover'}`}>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </div>
  );
}
