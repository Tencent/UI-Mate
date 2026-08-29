import React, { useRef, useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Folder, FileJson, Plus, Trash2, ChevronRight, ChevronDown, History, Download, Upload, X } from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = () => {
  const { state, dispatch } = useStore();
  const [activeTab, setActiveTab] = useState('collections');
  const [expandedCollections, setExpandedCollections] = useState({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const fileInputRef = useRef(null);

  const toggleCollection = (id) => {
    setExpandedCollections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const loadRequest = (req) => {
    dispatch({ type: 'LOAD_REQUEST', payload: req });
  };

  const createCollection = () => {
    const name = collectionName.trim();
    if (!name) return;
    dispatch({ type: 'CREATE_COLLECTION', payload: name });
    setCollectionName('');
    setShowCreateDialog(false);
  };

  const exportCollections = () => {
    const payload = {
      info: { name: 'Xostman Mock Export', exportedAt: new Date().toISOString() },
      collections: state.collections
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'xostman-mock-collections.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importCollections = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const collections = Array.isArray(parsed.collections) ? parsed.collections : [parsed];
        collections.forEach((collection, index) => {
          dispatch({
            type: 'IMPORT_COLLECTION',
            payload: {
              id: collection.id || `imported_${Date.now()}_${index}`,
              name: collection.name || collection.info?.name || `Imported Collection ${index + 1}`,
              folders: Array.isArray(collection.folders) ? collection.folders : [],
              requests: Array.isArray(collection.requests) ? collection.requests : []
            }
          });
        });
      } catch (error) {
        console.error('Import failed', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="flex border-b border-gray-200">
        <button
          className={clsx("flex-1 py-3 text-sm font-medium", activeTab === 'collections' ? "text-primary border-b-2 border-primary" : "text-gray-500")}
          onClick={() => setActiveTab('collections')}
        >
          Collections
        </button>
        <button
          className={clsx("flex-1 py-3 text-sm font-medium", activeTab === 'history' ? "text-primary border-b-2 border-primary" : "text-gray-500")}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'collections' ? (
          <div>
            <div className="flex justify-between items-center px-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">My Collections</span>
              <div className="flex items-center gap-1">
                <button onClick={() => fileInputRef.current?.click()} className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Import Collections">
                  <Upload size={14} />
                </button>
                <button onClick={exportCollections} className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Export Collections">
                  <Download size={14} />
                </button>
                <button onClick={() => setShowCreateDialog(true)} className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Create Collection">
                  <Plus size={16} />
                </button>
                <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={importCollections} />
              </div>
            </div>
            {state.collections.map(collection => (
              <div key={collection.id} className="mb-1">
                <div 
                  className="flex items-center px-2 py-1.5 hover:bg-gray-200 rounded cursor-pointer select-none"
                  onClick={() => toggleCollection(collection.id)}
                >
                  {expandedCollections[collection.id] ? <ChevronDown size={14} className="mr-1 text-gray-500" /> : <ChevronRight size={14} className="mr-1 text-gray-500" />}
                  <Folder size={16} className="mr-2 text-yellow-500" />
                  <span className="text-sm text-gray-700 truncate">{collection.name}</span>
                </div>
                
                {expandedCollections[collection.id] && (
                  <div className="ml-4 pl-2 border-l border-gray-300 mt-1">
                    {collection.requests.map(req => (
                      <div 
                        key={req.id}
                        className="flex items-center px-2 py-1.5 hover:bg-gray-200 rounded cursor-pointer group"
                        onClick={() => loadRequest(req)}
                      >
                        <span className={clsx("text-[10px] font-bold w-10 mr-1", 
                          req.method === 'GET' ? 'text-green-600' : 
                          req.method === 'POST' ? 'text-yellow-600' : 
                          req.method === 'DELETE' ? 'text-red-600' : 'text-blue-600'
                        )}>{req.method}</span>
                        <span className="text-sm text-gray-600 truncate">{req.name}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_REQUEST', payload: req.id }); }}
                          className="ml-auto text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                          title="Delete request"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {collection.requests.length === 0 && <div className="text-xs text-gray-400 italic px-2 py-1">No requests</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
             <div className="flex justify-between items-center px-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Recent</span>
              <button onClick={() => dispatch({ type: 'CLEAR_HISTORY' })} className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Clear History">
                <Trash2 size={14} />
              </button>
            </div>
            {state.history.map(item => (
              <div 
                key={item.id} 
                className="px-2 py-2 hover:bg-gray-100 border-b border-gray-100 cursor-pointer"
                onClick={() => dispatch({ type: 'LOAD_REQUEST', payload: { ...state.currentRequest, method: item.method, url: item.url } })}
              >
                <div className="flex items-center mb-1">
                  <span className={clsx("text-[10px] font-bold mr-2", 
                    item.method === 'GET' ? 'text-green-600' : 
                    item.method === 'POST' ? 'text-yellow-600' : 
                    item.method === 'DELETE' ? 'text-red-600' : 'text-blue-600'
                  )}>{item.method}</span>
                  <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-xs text-gray-700 truncate font-mono">{item.url}</div>
              </div>
            ))}
            {state.history.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-10 text-gray-400">
                <History size={32} className="mb-2 opacity-50" />
                <span className="text-sm">No history yet</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Create collection</h3>
              <button onClick={() => setShowCreateDialog(false)} className="text-gray-500 hover:text-gray-900">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase">Collection name</label>
              <input
                autoFocus
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createCollection(); if (e.key === 'Escape') setShowCreateDialog(false); }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowCreateDialog(false)} className="px-3 py-1.5 text-sm rounded hover:bg-gray-100">Cancel</button>
                <button onClick={createCollection} className="px-3 py-1.5 text-sm rounded bg-primary text-white hover:bg-primary-hover">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
