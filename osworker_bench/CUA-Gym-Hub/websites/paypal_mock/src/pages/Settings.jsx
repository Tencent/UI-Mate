import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function Settings() {
  const { state, updateSettings } = useStore();
  const [formData, setFormData] = useState(state.settings || {});
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Local account preferences for this sandbox session.</p>
      </div>

      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          Settings saved.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Language
            <select
              value={formData.language || 'English'}
              onChange={(event) => setFormData({ ...formData, language: event.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>Chinese</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Timezone
            <select
              value={formData.timezone || 'America/New_York'}
              onChange={(event) => setFormData({ ...formData, timezone: event.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 p-2"
            >
              <option>America/New_York</option>
              <option>America/Los_Angeles</option>
              <option>Asia/Shanghai</option>
              <option>UTC</option>
            </select>
          </label>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <label className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-4">
            <span>
              <span className="block font-medium text-gray-900">Security emails</span>
              <span className="text-sm text-gray-500">Receive account and login alerts.</span>
            </span>
            <input
              type="checkbox"
              checked={!!formData.securityEmails}
              onChange={(event) => setFormData({ ...formData, securityEmails: event.target.checked })}
              className="h-5 w-5 accent-brand"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-4">
            <span>
              <span className="block font-medium text-gray-900">Product emails</span>
              <span className="text-sm text-gray-500">Receive occasional sandbox product updates.</span>
            </span>
            <input
              type="checkbox"
              checked={!!formData.marketingEmails}
              onChange={(event) => setFormData({ ...formData, marketingEmails: event.target.checked })}
              className="h-5 w-5 accent-brand"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="rounded-full bg-brand px-6 py-2 font-bold text-white hover:bg-brand-dark">
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
