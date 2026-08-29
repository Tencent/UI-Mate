
    import React, { useState } from 'react';
    import { X, Zap, Plus, ArrowRight, Play } from 'lucide-react';
    import { useStore } from '../context/StoreContext';

    export default function AutomationsPanel({ board, onClose }) {
      const { state, updateState } = useStore();
      const [simulating, setSimulating] = useState(null);
      const [notice, setNotice] = useState('');
      const [customName, setCustomName] = useState('');

      const addAutomation = (name) => {
        const automation = {
          id: Date.now().toString(),
          boardId: board.id,
          name,
          enabled: true,
          lastRunAt: null
        };
        updateState(prev => ({
          automations: [...(prev.automations || []), automation]
        }));
        setNotice(`Added automation: ${name}`);
      };

      const handleSimulate = (id) => {
        setSimulating(id);
        setTimeout(() => {
          setSimulating(null);
          updateState(prev => ({
            automations: (prev.automations || []).map(automation => automation.id === id ? { ...automation, lastRunAt: new Date().toISOString() } : automation)
          }));
          setNotice('Automation executed successfully');
        }, 1500);
      };

      return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white w-[800px] h-[600px] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                  <Zap size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Automations</h2>
                  <p className="text-sm text-gray-500">Streamline your workflow with automated actions</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-surface-gray">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Status Change</span>
                  </div>
                  <div className="text-lg text-gray-800 mb-4">
                    When <span className="font-bold border-b-2 border-orange-300">Status</span> changes to <span className="font-bold border-b-2 border-green-300">Done</span>, move item to <span className="font-bold border-b-2 border-purple-300">Group</span>
                  </div>
                  <button onClick={() => addAutomation('When Status changes to Done, move item to Group')} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Add to Board
                  </button>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-4">
                    <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded">Due Date</span>
                  </div>
                  <div className="text-lg text-gray-800 mb-4">
                    When <span className="font-bold border-b-2 border-blue-300">Date</span> arrives, notify <span className="font-bold border-b-2 border-yellow-300">Person</span>
                  </div>
                  <button onClick={() => addAutomation('When Date arrives, notify Person')} className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Add to Board
                  </button>
                </div>
              </div>

              {notice && <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div>}

              <h3 className="font-bold text-gray-700 mb-4">Active Automations</h3>
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                {[
                  { id: 'default-notify-owner', name: 'When Status changes to Done, notify Owner' },
                  ...(state.automations || []).filter(automation => automation.boardId === board.id)
                ].map(automation => (
                <div key={automation.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                       <Zap size={16} />
                     </div>
                     <span className="text-gray-700">{automation.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleSimulate(automation.id)}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-primary transition-colors border border-gray-200 px-2 py-1 rounded hover:bg-gray-50"
                      disabled={simulating === automation.id}
                    >
                      {simulating === automation.id ? (
                        <span className="animate-pulse">Running...</span>
                      ) : (
                        <>
                          <Play size={12} />
                          Run Now
                        </>
                      )}
                    </button>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5" defaultChecked/>
                      <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-green-400 cursor-pointer"></label>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>

            <form onSubmit={(event) => {
              event.preventDefault();
              if (!customName.trim()) return;
              addAutomation(customName.trim());
              setCustomName('');
            }} className="p-4 border-t border-gray-200 bg-white flex justify-center gap-2">
              <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Custom automation name" className="w-72 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary" />
              <button type="submit" className="flex items-center gap-2 text-primary font-medium hover:bg-blue-50 px-4 py-2 rounded transition-colors">
                <Plus size={18} />
                Create Custom Automation
              </button>
            </form>
          </div>
        </div>
      );
    }

