import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { KeyValueEditor } from './KeyValueEditor';
import { Plus, Trash2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const EnvironmentModal = ({ onClose }) => {
  const { state, dispatch } = useStore();
  const [selectedEnvId, setSelectedEnvId] = useState(state.environments[0]?.id || null);
  const [newEnvName, setNewEnvName] = useState('');
  
  const selectedEnv = state.environments.find(e => e.id === selectedEnvId);

  const handleVarsChange = (newVars) => {
    dispatch({ 
      type: 'UPDATE_ENVIRONMENT', 
      payload: { ...selectedEnv, variables: newVars } 
    });
  };

  const addVar = () => {
     dispatch({ 
      type: 'UPDATE_ENVIRONMENT', 
      payload: { ...selectedEnv, variables: [...selectedEnv.variables, { id: uuidv4(), key: "", value: "", enabled: true }] } 
    });
  };

  const removeVar = (id) => {
    dispatch({ 
      type: 'UPDATE_ENVIRONMENT', 
      payload: { ...selectedEnv, variables: selectedEnv.variables.filter(v => v.id !== id) } 
    });
  };

  const createEnvironment = () => {
    const name = newEnvName.trim();
    if (!name) return;
    dispatch({ type: 'CREATE_ENVIRONMENT', payload: name });
    setNewEnvName('');
  };

  const deleteEnvironment = () => {
    if (!selectedEnv) return;
    dispatch({ type: 'DELETE_ENVIRONMENT', payload: selectedEnv.id });
    setSelectedEnvId(state.environments.find(env => env.id !== selectedEnv.id)?.id || null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[800px] h-[600px] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Manage Environments</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-gray-200 bg-gray-50 p-2">
            <div className="flex gap-1 mb-2">
              <input
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createEnvironment(); if (e.key === 'Escape') onClose(); }}
                placeholder="New env"
                className="min-w-0 flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              />
              <button onClick={createEnvironment} className="p-1 bg-primary text-white rounded" title="Add environment">
                <Plus size={14} />
              </button>
            </div>
            {state.environments.map(env => (
              <div 
                key={env.id}
                onClick={() => setSelectedEnvId(env.id)}
                className={`p-2 rounded cursor-pointer text-sm mb-1 ${selectedEnvId === env.id ? 'bg-white shadow text-primary font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                {env.name}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedEnv ? (
              <>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Environment Name</label>
                  <input 
                    type="text" 
                    value={selectedEnv.name}
                    onChange={(e) => dispatch({ type: 'UPDATE_ENVIRONMENT', payload: { ...selectedEnv, name: e.target.value } })}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Variables</label>
                  <KeyValueEditor 
                    pairs={selectedEnv.variables} 
                    onChange={handleVarsChange} 
                    onAdd={addVar} 
                    onRemove={removeVar} 
                  />
                </div>
                <button
                  onClick={deleteEnvironment}
                  className="mt-4 text-xs text-red-600 hover:bg-red-50 px-2 py-1.5 rounded flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete environment
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Select an environment</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
