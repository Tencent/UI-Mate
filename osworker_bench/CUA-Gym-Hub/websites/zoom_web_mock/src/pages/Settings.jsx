import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function Settings() {
  const { settings, updateSettings, user, updateUser } = useStore();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ username: user.username, email: user.email });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      setEditingProfile(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const saveProfile = (event) => {
    event.preventDefault();
    updateUser(profileDraft);
    setEditingProfile(false);
    setNotice('Profile updated locally');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Profile</h3>
          <div className="flex items-center space-x-6">
            <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-gray-50" />
            <div>
              <div className="font-medium text-lg">{user.username}</div>
              <div className="text-gray-500">{user.email}</div>
              <div className="text-sm text-gray-400 mt-1">User Type: Licensed</div>
            </div>
            <button onClick={() => setEditingProfile(true)} className="ml-auto text-xoom-blue hover:underline text-sm font-medium">Edit Profile</button>
          </div>
        </div>

        {/* Audio/Video */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Audio & Video</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Microphone</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                value={settings.audio.input}
                onChange={(e) => updateSettings({ audio: { ...settings.audio, input: e.target.value }})}
              >
                <option>Default Microphone (Built-in)</option>
                <option>External Microphone (USB)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Speakers</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                value={settings.audio.output}
                onChange={(e) => updateSettings({ audio: { ...settings.audio, output: e.target.value }})}
              >
                <option>Default Speakers (Built-in)</option>
                <option>Headphones</option>
              </select>
            </div>
            <div className="pt-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={settings.video.hd}
                  onChange={(e) => updateSettings({ video: { ...settings.video, hd: e.target.checked }})}
                  className="rounded text-xoom-blue"
                />
                <span className="text-sm text-gray-700">Enable HD Video</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Email Notifications</span>
              <div className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${settings.notifications.email ? 'bg-xoom-blue' : 'bg-gray-300'}`}
                onClick={() => updateSettings({ notifications: { ...settings.notifications, email: !settings.notifications.email }})}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${settings.notifications.email ? 'translate-x-5' : ''}`}></div>
              </div>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Desktop Notifications</span>
              <div className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${settings.notifications.push ? 'bg-xoom-blue' : 'bg-gray-300'}`}
                onClick={() => updateSettings({ notifications: { ...settings.notifications, push: !settings.notifications.push }})}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${settings.notifications.push ? 'translate-x-5' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {editingProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button onClick={() => setEditingProfile(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={saveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={profileDraft.username}
                  onChange={event => setProfileDraft({ ...profileDraft, username: event.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={profileDraft.email}
                  onChange={event => setProfileDraft({ ...profileDraft, email: event.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingProfile(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-xoom-blue text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notice && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl text-sm">
          {notice}
          <button className="ml-3 text-gray-300" onClick={() => setNotice('')}>Close</button>
        </div>
      )}
    </div>
  );
}
