import React, { useState } from 'react';
import { Search, Grid, Settings, HelpCircle, Bell } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const { state } = useStore();
  const [panel, setPanel] = useState(null);

  return (
    <header className="h-12 bg-primary text-white flex items-center justify-between px-3 flex-shrink-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setPanel(panel === 'apps' ? null : 'apps')} className="rounded p-1 hover:bg-primary-dark" title="Apps">
            <Grid className="w-5 h-5" />
          </button>
          <span className="font-semibold text-lg tracking-tight">Xutlook</span>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-4 py-1.5 rounded bg-primary-light text-neutral-800 placeholder-neutral-600 focus:outline-none focus:bg-white transition-colors text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => setPanel(panel === 'settings' ? null : 'settings')} className="p-1.5 hover:bg-primary-dark rounded" title="Settings"><Settings className="w-5 h-5" /></button>
          <button onClick={() => setPanel(panel === 'help' ? null : 'help')} className="p-1.5 hover:bg-primary-dark rounded" title="Help"><HelpCircle className="w-5 h-5" /></button>
          <button onClick={() => setPanel(panel === 'notifications' ? null : 'notifications')} className="p-1.5 hover:bg-primary-dark rounded" title="Notifications"><Bell className="w-5 h-5" /></button>
        </div>
        <button onClick={() => setPanel(panel === 'account' ? null : 'account')} className="w-8 h-8 rounded-full overflow-hidden border border-white/30 cursor-pointer" title="Account">
          <img src={state.user.avatar} alt="User" className="w-full h-full object-cover" />
        </button>
      </div>

      {panel && (
        <div className="absolute right-3 top-12 z-50 w-72 rounded border border-neutral-200 bg-white p-4 text-neutral-800 shadow-xl">
          {panel === 'apps' && (
            <>
              <h3 className="mb-3 font-semibold">Microsoft 365 apps</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {['Mail', 'Calendar', 'People', 'To Do'].map(item => <div key={item} className="rounded bg-neutral-50 px-3 py-2">{item}</div>)}
              </div>
            </>
          )}
          {panel === 'settings' && (
            <>
              <h3 className="mb-3 font-semibold">Quick settings</h3>
              <label className="mb-2 flex items-center justify-between text-sm"><span>Focused Inbox</span><input type="checkbox" defaultChecked /></label>
              <label className="flex items-center justify-between text-sm"><span>Desktop notifications</span><input type="checkbox" defaultChecked /></label>
            </>
          )}
          {panel === 'help' && (
            <>
              <h3 className="mb-2 font-semibold">Help</h3>
              <p className="text-sm text-neutral-600">Search, compose mail, manage folders, contacts, calendar events, and tasks inside this local sandbox.</p>
            </>
          )}
          {panel === 'notifications' && (
            <>
              <h3 className="mb-2 font-semibold">Notifications</h3>
              <p className="text-sm text-neutral-600">No new notifications. Sent mail and local edits appear in state inspection.</p>
            </>
          )}
          {panel === 'account' && (
            <>
              <h3 className="font-semibold">{state.user.name}</h3>
              <p className="text-sm text-neutral-600">{state.user.email}</p>
            </>
          )}
        </div>
      )}
    </header>
  );
}
