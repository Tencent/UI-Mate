import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { X, User, Settings, Bell, Users, Building2, Globe, Monitor, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { id: 'account', label: 'Account', icon: User, section: 'Account' },
  { id: 'preferences', label: 'Preferences', icon: Settings, section: 'Account' },
  { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Account' },
  { id: 'general', label: 'General', icon: Building2, section: 'Workspace' },
  { id: 'people', label: 'People', icon: Users, section: 'Workspace' },
  { id: 'teamspaces', label: 'Teamspaces', icon: Globe, section: 'Workspace' },
];

const AccountTab = () => {
  const { state, updateSettings } = useStore();
  const [name, setName] = useState(state.user.name);
  const [email, setEmail] = useState(state.user.email);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">My account</h2>
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <img src={state.user.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
        <div>
          <div className="font-medium text-lg">{name}</div>
          <div className="text-sm text-gray-500">{email}</div>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Preferred name</label>
          <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-400"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => updateSettings({ userName: name })} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-400 text-gray-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => updateSettings({ userEmail: email })} />
        </div>
      </div>
    </div>
  );
};

const PreferencesTab = () => {
  const { state, updateSettings } = useStore();
  const settings = state.settings || { appearance: 'light', startWeekMonday: false, fontSize: 'default' };

  const handleAppearance = (mode) => {
    updateSettings({ appearance: mode });
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('font-small', 'font-default', 'font-large');
    } else if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleFontSize = (size) => {
    updateSettings({ fontSize: size });
    document.documentElement.classList.remove('font-small', 'font-default', 'font-large');
    document.documentElement.classList.add(`font-${size}`);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Preferences</h2>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Appearance</label>
          <div className="flex gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor },
            ].map(mode => (
              <button key={mode.id}
                className={clsx('flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-colors',
                  settings.appearance === mode.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50')}
                onClick={() => handleAppearance(mode.id)}>
                <mode.icon size={16} />
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Start week on Monday</div>
            <div className="text-xs text-gray-500">This will change how your calendars display</div>
          </div>
          <button
            className={clsx('w-10 h-6 rounded-full transition-colors relative',
              settings.startWeekMonday ? 'bg-blue-500' : 'bg-gray-300')}
            onClick={() => updateSettings({ startWeekMonday: !settings.startWeekMonday })}>
            <div className={clsx('w-4 h-4 bg-white rounded-full absolute top-1 transition-transform',
              settings.startWeekMonday ? 'translate-x-5' : 'translate-x-1')} />
          </button>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Font size</label>
          <div className="flex gap-3">
            {['small', 'default', 'large'].map(size => (
              <button key={size}
                className={clsx('px-4 py-2 rounded-md border text-sm capitalize transition-colors',
                  settings.fontSize === size ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50')}
                onClick={() => handleFontSize(size)}>
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationsTab = () => {
  const { state, updateSettings } = useStore();
  const settings = state.settings || {};
  const notifDesktop = settings.notifDesktop !== undefined ? settings.notifDesktop : true;
  const notifEmail = settings.notifEmail !== undefined ? settings.notifEmail : false;
  const notifMobile = settings.notifMobile !== undefined ? settings.notifMobile : true;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Notifications</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm font-medium">Desktop notifications</div>
            <div className="text-xs text-gray-500">Receive notifications for updates</div>
          </div>
          <button
            className={clsx('w-10 h-6 rounded-full relative transition-colors', notifDesktop ? 'bg-blue-500' : 'bg-gray-300')}
            onClick={() => updateSettings({ notifDesktop: !notifDesktop })}>
            <div className={clsx('w-4 h-4 bg-white rounded-full absolute top-1 transition-transform', notifDesktop ? 'translate-x-5' : 'translate-x-1')} />
          </button>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm font-medium">Email notifications</div>
            <div className="text-xs text-gray-500">Get email updates for important changes</div>
          </div>
          <button
            className={clsx('w-10 h-6 rounded-full relative transition-colors', notifEmail ? 'bg-blue-500' : 'bg-gray-300')}
            onClick={() => updateSettings({ notifEmail: !notifEmail })}>
            <div className={clsx('w-4 h-4 bg-white rounded-full absolute top-1 transition-transform', notifEmail ? 'translate-x-5' : 'translate-x-1')} />
          </button>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm font-medium">Mobile push notifications</div>
            <div className="text-xs text-gray-500">Stay updated on mobile</div>
          </div>
          <button
            className={clsx('w-10 h-6 rounded-full relative transition-colors', notifMobile ? 'bg-blue-500' : 'bg-gray-300')}
            onClick={() => updateSettings({ notifMobile: !notifMobile })}>
            <div className={clsx('w-4 h-4 bg-white rounded-full absolute top-1 transition-transform', notifMobile ? 'translate-x-5' : 'translate-x-1')} />
          </button>
        </div>
      </div>
    </div>
  );
};

const GeneralTab = () => {
  const { state, updateWorkspace } = useStore();
  const [name, setName] = useState(state.workspace.name);
  const [icon, setIcon] = useState(state.workspace.icon);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">General</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Workspace name</label>
          <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-400"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => updateWorkspace({ name })} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Workspace icon</label>
          <div className="flex items-center gap-3">
            <span className="text-4xl cursor-pointer hover:bg-gray-100 rounded-lg p-2">{icon}</span>
            <div className="flex flex-wrap gap-1">
              {['\u{1F680}', '\u{1F4BC}', '\u{1F3E2}', '\u{1F4BB}', '\u{1F30D}', '\u2B50', '\u{1F525}', '\u{1F389}'].map(e => (
                <button key={e} className="text-xl p-1 hover:bg-gray-100 rounded" onClick={() => { setIcon(e); updateWorkspace({ icon: e }); }}>{e}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PeopleTab = () => {
  const { state } = useStore();
  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">People</h2>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 grid grid-cols-3">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
        </div>
        <div className="px-4 py-3 flex items-center grid grid-cols-3">
          <div className="flex items-center gap-2">
            <img src={state.user.avatar} alt="" className="w-7 h-7 rounded-full" />
            <span className="text-sm font-medium">{state.user.name}</span>
          </div>
          <span className="text-sm text-gray-500">{state.user.email}</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded w-fit">Admin</span>
        </div>
      </div>
    </div>
  );
};

const TeamspacesTab = () => {
  const { state, dispatch } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const teamspaces = state.settings?.teamspaces || [];

  const handleCreate = () => {
    if (!newName.trim()) return;
    const updated = [...teamspaces, { id: Date.now().toString(), name: newName.trim() }];
    dispatch({ type: 'UPDATE_SETTINGS', payload: { updates: { teamspaces: updated } } });
    setNewName('');
    setShowCreate(false);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Teamspaces</h2>
      {teamspaces.length === 0 && !showCreate ? (
        <div className="text-center py-12 text-gray-400">
          <Users size={40} className="mx-auto mb-3" />
          <p className="text-sm">No teamspaces yet</p>
          <p className="text-xs mt-1">Teamspaces help organize pages by team or project</p>
          <button className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => setShowCreate(true)}>
            Create Teamspace
          </button>
        </div>
      ) : (
        <div>
          {teamspaces.map(ts => (
            <div key={ts.id} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-sm font-bold">{ts.name[0]}</div>
                <span className="text-sm font-medium">{ts.name}</span>
              </div>
            </div>
          ))}
          {showCreate ? (
            <div className="flex gap-2 mt-4">
              <input className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="Teamspace name" value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false); }}
                autoFocus />
              <button className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600" onClick={handleCreate}>Create</button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          ) : (
            <button className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => setShowCreate(true)}>
              + New Teamspace
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const SettingsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('preferences');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const renderTab = () => {
    switch (activeTab) {
      case 'account': return <AccountTab />;
      case 'preferences': return <PreferencesTab />;
      case 'notifications': return <NotificationsTab />;
      case 'general': return <GeneralTab />;
      case 'people': return <PeopleTab />;
      case 'teamspaces': return <TeamspacesTab />;
      default: return <PreferencesTab />;
    }
  };

  let currentSection = '';

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div ref={ref} className="bg-white rounded-xl shadow-2xl w-[720px] max-h-[80vh] flex overflow-hidden border border-gray-200">
        {/* Left sidebar */}
        <div className="w-[220px] bg-gray-50 border-r border-gray-200 py-4 flex-shrink-0">
          {TABS.map(tab => {
            const showSection = tab.section !== currentSection;
            currentSection = tab.section;
            return (
              <React.Fragment key={tab.id}>
                {showSection && (
                  <div className="px-4 py-1 text-xs font-semibold text-gray-400 mt-3 first:mt-0">{tab.section}</div>
                )}
                <button
                  className={clsx('w-full text-left px-4 py-1.5 text-sm flex items-center gap-2 transition-colors',
                    activeTab === tab.id ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100')}
                  onClick={() => setActiveTab(tab.id)}>
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        {/* Right content */}
        <div className="flex-1 p-6 overflow-y-auto relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded text-gray-500">
            <X size={18} />
          </button>
          {renderTab()}
        </div>
      </div>
    </div>
  );
};
