import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { KeyValueEditor } from './KeyValueEditor';
import { CodeEditor } from './CodeEditor';
import { executeRequest } from '../utils/mockNetwork';
import { Save, Send, ChevronDown, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export const RequestPanel = () => {
  const { state, dispatch } = useStore();
  const { currentRequest, activeEnvironmentId, environments } = state;
  const [activeTab, setActiveTab] = useState('params');
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [requestName, setRequestName] = useState(currentRequest.name || 'New Request');

  const activeEnvironment = environments.find(e => e.id === activeEnvironmentId);

  const updateRequest = (field, value) => {
    dispatch({ type: 'UPDATE_CURRENT_REQUEST', payload: { [field]: value } });
  };

  const handleSend = async () => {
    setIsLoading(true);
    dispatch({ type: 'SET_RESPONSE', payload: null });
    
    try {
      const response = await executeRequest(currentRequest, activeEnvironment);
      dispatch({ type: 'SET_RESPONSE', payload: response });
      dispatch({ 
        type: 'ADD_TO_HISTORY', 
        payload: { method: currentRequest.method, url: currentRequest.url } 
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    setRequestName(currentRequest.name || 'New Request');
    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    const name = requestName.trim();
    if (!name) return;
    dispatch({ type: 'SAVE_REQUEST', payload: { name } });
    setShowSaveDialog(false);
  };

  // Helper for KeyValueEditor
  const handleParamsChange = (newParams) => updateRequest('params', newParams);
  const addParam = () => updateRequest('params', [...currentRequest.params, { id: uuidv4(), key: "", value: "", enabled: true }]);
  const removeParam = (id) => updateRequest('params', currentRequest.params.filter(p => p.id !== id));

  const handleHeadersChange = (newHeaders) => updateRequest('headers', newHeaders);
  const addHeader = () => updateRequest('headers', [...currentRequest.headers, { id: uuidv4(), key: "", value: "", enabled: true }]);
  const removeHeader = (id) => updateRequest('headers', currentRequest.headers.filter(p => p.id !== id));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Bar */}
      <div className="p-4 border-b border-gray-200 flex gap-2 items-center bg-gray-50">
        <div className="flex flex-1 gap-0 shadow-sm rounded-md">
          <div className="relative">
            <select 
              value={currentRequest.method}
              onChange={(e) => updateRequest('method', e.target.value)}
              className="h-10 px-3 bg-gray-100 border border-gray-300 rounded-l-md font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none pr-8 cursor-pointer"
              style={{
                color: currentRequest.method === 'GET' ? '#16a34a' : 
                       currentRequest.method === 'POST' ? '#ca8a04' : 
                       currentRequest.method === 'DELETE' ? '#dc2626' : '#2563eb'
              }}
            >
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>
          <input
            type="text"
            value={currentRequest.url}
            onChange={(e) => updateRequest('url', e.target.value)}
            placeholder="Enter URL or paste text"
            className="flex-1 h-10 px-4 border-y border-r border-gray-300 rounded-r-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono"
            onKeyDown={(e) => { if(e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend(); }}
          />
        </div>
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="h-10 px-6 bg-primary hover:bg-primary-hover text-white font-semibold rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : <><Send size={16} /> Send</>}
        </button>
        <button 
          onClick={handleSave}
          className="h-10 px-3 text-gray-600 hover:bg-gray-200 rounded-md flex items-center gap-2 transition-colors"
        >
          <Save size={16} /> <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-4">
        {['Params', 'Headers', 'Body', 'Tests', 'Pre-request'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={clsx(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.toLowerCase() 
                ? "border-primary text-gray-800" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab}
            {tab === 'Params' && currentRequest.params.length > 0 && <span className="ml-1 text-[10px] text-green-600">●</span>}
            {tab === 'Headers' && currentRequest.headers.length > 0 && <span className="ml-1 text-[10px] text-green-600">●</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'params' && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase">Query Params</h3>
            <KeyValueEditor 
              pairs={currentRequest.params} 
              onChange={handleParamsChange} 
              onAdd={addParam} 
              onRemove={removeParam} 
            />
          </div>
        )}

        {activeTab === 'headers' && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase">Headers</h3>
            <KeyValueEditor 
              pairs={currentRequest.headers} 
              onChange={handleHeadersChange} 
              onAdd={addHeader} 
              onRemove={removeHeader} 
            />
          </div>
        )}

        {activeTab === 'body' && (
          <div className="h-full flex flex-col">
            <div className="flex gap-4 mb-2 text-xs">
              {['none', 'json', 'text'].map(type => (
                <label key={type} className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="bodyType" 
                    checked={currentRequest.body.type === type}
                    onChange={() => updateRequest('body', { ...currentRequest.body, type })}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
            {currentRequest.body.type !== 'none' && (
              <div className="flex-1 border border-gray-200 rounded">
                <CodeEditor 
                  code={currentRequest.body.content} 
                  onChange={(val) => updateRequest('body', { ...currentRequest.body, content: val })}
                  language="json"
                />
              </div>
            )}
            {currentRequest.body.type === 'none' && (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                This request does not have a body
              </div>
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="h-full flex flex-col">
            <div className="text-xs text-gray-500 mb-2">Write tests using <code>pm.test</code> syntax (mocked)</div>
            <div className="flex-1 border border-gray-200 rounded">
              <CodeEditor 
                code={currentRequest.tests} 
                onChange={(val) => updateRequest('tests', val)}
                language="javascript"
              />
            </div>
          </div>
        )}
        
        {activeTab === 'pre-request' && (
           <div className="h-full flex flex-col">
            <div className="text-xs text-gray-500 mb-2">Scripts to execute before the request</div>
            <div className="flex-1 border border-gray-200 rounded">
              <CodeEditor 
                code={currentRequest.preRequest || ""} 
                onChange={(val) => updateRequest('preRequest', val)}
                language="javascript"
              />
            </div>
          </div>
        )}
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Save request</h3>
              <button onClick={() => setShowSaveDialog(false)} className="text-gray-500 hover:text-gray-900">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase">Request name</label>
              <input
                autoFocus
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') confirmSave(); if (e.key === 'Escape') setShowSaveDialog(false); }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowSaveDialog(false)} className="px-3 py-1.5 text-sm rounded hover:bg-gray-100">Cancel</button>
                <button onClick={confirmSave} className="px-3 py-1.5 text-sm rounded bg-primary text-white hover:bg-primary-hover">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
