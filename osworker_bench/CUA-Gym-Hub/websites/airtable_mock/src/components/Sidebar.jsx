import React from 'react';
import { useStore } from '../store/store';
import { Database, Plus, Search, Settings, HelpCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar = () => {
  const { state, dispatch, ACTIONS } = useStore();
  const [baseQuery, setBaseQuery] = React.useState('');
  const [panel, setPanel] = React.useState(null);
  const [newBaseName, setNewBaseName] = React.useState('');
  const filteredBases = Object.values(state.bases).filter(base =>
    base.name.toLowerCase().includes(baseQuery.toLowerCase())
  );

  const createBase = (e) => {
    e.preventDefault();
    const name = newBaseName.trim();
    if (!name) return;
    dispatch({ type: ACTIONS.CREATE_BASE, payload: { name } });
    dispatch({ type: ACTIONS.ADD_ACTIVITY, payload: { type: 'create_base', label: `Created base ${name}` } });
    setNewBaseName('');
    setPanel(null);
  };

  return (
    <div className="w-[260px] bg-[#333333] text-white flex flex-col h-full border-r border-gray-800">
      <div className="p-4 flex items-center gap-2 border-b border-gray-700">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-xl">A</div>
        <span className="font-bold text-lg tracking-tight">AirTableMock</span>
      </div>

      <div className="p-3">
        <div className="flex items-center bg-[#444] rounded px-2 py-1.5 text-sm text-gray-300 mb-4">
          <Search size={14} className="mr-2" />
          <input type="text" value={baseQuery} onChange={(e) => setBaseQuery(e.target.value)} placeholder="Find a base..." className="bg-transparent outline-none w-full placeholder-gray-400" />
        </div>

        <div className="text-xs font-bold text-gray-400 uppercase mb-2 px-2">My Bases</div>
        
        <div className="space-y-1">
          {filteredBases.map(base => (
            <div 
              key={base.id}
              onClick={() => {
                const tableId = base.tables[0];
                dispatch({ type: ACTIONS.SET_ACTIVE_TABLE, payload: tableId });
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors",
                state.activeBaseId === base.id ? "bg-[#444] text-white" : "text-gray-400 hover:bg-[#3a3a3a] hover:text-gray-200"
              )}
            >
              <div className={cn("w-6 h-6 rounded flex items-center justify-center text-[10px]", base.color || "bg-blue-500")}>
                <Database size={12} className="text-white" />
              </div>
              <span className="text-sm font-medium">{base.name}</span>
            </div>
          ))}
          
          <div className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white cursor-pointer" onClick={() => setPanel('base')}>
            <div className="w-6 h-6 rounded border border-gray-600 border-dashed flex items-center justify-center">
              <Plus size={12} />
            </div>
            <span className="text-sm">Add a base</span>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-gray-700 p-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-[#3a3a3a] rounded cursor-pointer" onClick={() => setPanel('settings')}>
          <Settings size={16} />
          <span className="text-sm">Settings</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-[#3a3a3a] rounded cursor-pointer" onClick={() => setPanel('help')}>
          <HelpCircle size={16} />
          <span className="text-sm">Help</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-[#3a3a3a] rounded cursor-pointer" onClick={() => setPanel('account')}>
          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-[10px] text-white font-bold">JD</div>
          <span className="text-sm">John Doe</span>
        </div>
      </div>

      {panel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 text-gray-900" onClick={() => setPanel(null)}>
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {panel === 'base' && 'Add a base'}
                {panel === 'settings' && 'Workspace settings'}
                {panel === 'help' && 'Help'}
                {panel === 'account' && 'Account'}
              </h2>
              <button className="rounded p-1 hover:bg-gray-100" onClick={() => setPanel(null)}><X size={16} /></button>
            </div>

            {panel === 'base' && (
              <form onSubmit={createBase}>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Base name</label>
                <input className="mb-4 w-full rounded border px-3 py-2 text-sm outline-none focus:border-primary" value={newBaseName} onChange={(e) => setNewBaseName(e.target.value)} autoFocus />
                <button className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-hover">Create base</button>
              </form>
            )}

            {panel === 'settings' && (
              <div className="space-y-3 text-sm">
                <div className="rounded border p-3"><div className="font-medium">Workspace</div><div className="text-gray-500">AirTableMock workspace, local sandbox mode.</div></div>
                <label className="flex items-center justify-between rounded border p-3"><span>Email notifications</span><input type="checkbox" defaultChecked /></label>
                <label className="flex items-center justify-between rounded border p-3"><span>Compact rows</span><input type="checkbox" /></label>
              </div>
            )}

            {panel === 'help' && (
              <div className="space-y-2 text-sm text-gray-600">
                <p>Use table tabs to switch data, views to change layout, and the grid to edit cells inline.</p>
                <p>All data stays local to this sandbox and is inspectable through `/go?sid=...`.</p>
              </div>
            )}

            {panel === 'account' && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 font-bold text-white">JD</div>
                  <div><div className="font-medium">John Doe</div><div className="text-gray-500">john.doe@example.com</div></div>
                </div>
                <button className="rounded border px-3 py-1.5 hover:bg-gray-50">Manage local profile</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
