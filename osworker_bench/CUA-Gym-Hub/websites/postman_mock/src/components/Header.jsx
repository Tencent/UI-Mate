import React, { useState, useRef } from 'react';
import { useStore } from '../store/StoreContext';
import { Menu, Bell, Settings, ChevronDown, Plus, Upload, X, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Simple notifications panel
const NotificationsPanel = ({ onClose }) => (
  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-72 z-40">
    <div className="fixed inset-0 z-30" onClick={onClose} />
    <div className="relative z-40">
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">Notifications</span>
        <button onClick={onClose} className="p-0.5 text-gray-400 hover:text-gray-600 rounded"><X size={12} /></button>
      </div>
      <div className="px-3 py-3 text-xs text-gray-400 italic">No new notifications</div>
    </div>
  </div>
);

// Import modal
const ImportModal = ({ onClose }) => {
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [activeTab, setActiveTab] = useState('file');
  const fileRef = useRef(null);
  const { dispatch } = useStore();

  const handleImportUrl = () => {
    if (!url.trim()) return;
    // Create a new tab with the URL pre-filled
    dispatch({
      type: 'OPEN_TAB',
      payload: {
        name: url.split('/').pop() || 'Imported Request',
        method: 'GET',
        request: {
          method: 'GET',
          url: url.trim(),
          params: [],
          auth: { type: 'none' },
          headers: [],
          body: { type: 'none', content: '', formData: [], urlencoded: [], graphql: { query: '', variables: '' } },
          preRequest: '',
          tests: '',
        },
        requestId: null,
        collectionId: null,
      }
    });
    onClose();
  };

  const handleImportRaw = () => {
    if (!rawText.trim()) return;
    try {
      const parsed = JSON.parse(rawText);
      // Try to import as a collection
      if (parsed.info && parsed.item) {
        const mapItems = (items) => items.map(item => ({
          id: uuidv4(),
          name: item.name || 'Imported Request',
          description: item.description || '',
          method: item.request?.method || 'GET',
          url: typeof item.request?.url === 'string' ? item.request.url : (item.request?.url?.raw || ''),
          params: [],
          auth: { type: 'none' },
          headers: [],
          body: { type: 'none', content: '', formData: [], urlencoded: [], graphql: { query: '', variables: '' } },
          preRequest: '',
          tests: '',
        }));
        dispatch({
          type: 'CREATE_COLLECTION',
          payload: parsed.info.name || 'Imported Collection',
        });
      }
    } catch {
      // If not JSON, open as a raw request in new tab
      dispatch({
        type: 'OPEN_TAB',
        payload: {
          name: 'Imported Request',
          method: 'GET',
          request: {
            method: 'GET',
            url: rawText.trim(),
            params: [],
            auth: { type: 'none' },
            headers: [],
            body: { type: 'none', content: '', formData: [], urlencoded: [], graphql: { query: '', variables: '' } },
            preRequest: '',
            tests: '',
          },
          requestId: null,
          collectionId: null,
        }
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[460px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Import</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={16} /></button>
        </div>
        <div className="px-5 py-4">
          <div className="flex gap-0 border border-gray-200 rounded overflow-hidden mb-4 text-xs">
            {['file', 'url', 'raw'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 capitalize font-medium transition-colors ${activeTab === t ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {t === 'file' ? 'File' : t === 'url' ? 'URL' : 'Raw Text'}
              </button>
            ))}
          </div>
          {activeTab === 'file' && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg py-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept=".json,.yaml,.yml" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const text = evt.target?.result;
                    if (typeof text === 'string') {
                      setRawText(text);
                      setActiveTab('raw');
                    }
                  };
                  reader.readAsText(file);
                }}
              />
              <Upload size={28} className="text-gray-300 mb-2" />
              <p className="text-xs text-gray-500">Click to upload or drag and drop</p>
              <p className="text-[10px] text-gray-400 mt-1">JSON, YAML supported</p>
            </div>
          )}
          {activeTab === 'url' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">URL</label>
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/api/endpoint"
                className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
                onKeyDown={(e) => { if (e.key === 'Enter') handleImportUrl(); if (e.key === 'Escape') onClose(); }}
                autoFocus
              />
              <div className="flex justify-end mt-3">
                <button onClick={handleImportUrl} disabled={!url.trim()}
                  className="h-8 px-4 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded disabled:opacity-40">
                  Import
                </button>
              </div>
            </div>
          )}
          {activeTab === 'raw' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Paste raw text (JSON/URL)</label>
              <textarea value={rawText} onChange={(e) => setRawText(e.target.value)}
                placeholder='{"info": {...}, "item": [...]} or https://...'
                className="w-full h-28 px-3 py-2 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:border-primary resize-none"
                autoFocus
              />
              <div className="flex justify-end mt-2">
                <button onClick={handleImportRaw} disabled={!rawText.trim()}
                  className="h-8 px-4 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded disabled:opacity-40">
                  Import
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Settings panel
const SettingsPanel = ({ onClose }) => {
  const { state, dispatch } = useStore();
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('json');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[460px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Settings</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={16} /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}
              className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary appearance-none bg-white">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Default Request Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary appearance-none bg-white">
              <option value="json">JSON</option>
              <option value="text">Text</option>
              <option value="xml">XML</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-gray-700">SSL Certificate Verification</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Verify SSL certificates when sending requests</div>
            </div>
            <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-gray-700">Automatically Follow Redirects</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Follow HTTP 3xx redirect responses</div>
            </div>
            <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="h-8 px-4 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
          <button onClick={onClose} className="h-8 px-4 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

// User profile dropdown
const UserMenu = ({ onClose, onOpenEnvModal }) => (
  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-52 z-40">
    <div className="fixed inset-0 z-30" onClick={onClose} />
    <div className="relative z-40">
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-800">John Doe</div>
        <div className="text-[10px] text-gray-500 mt-0.5">john.doe@example.com</div>
      </div>
      <div className="py-1">
        <button onClick={() => { onOpenEnvModal(); onClose(); }}
          className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Manage Environments
        </button>
        <button onClick={onClose}
          className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50">
          Profile Settings
        </button>
        <button onClick={onClose}
          className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50">
          Sign Out
        </button>
      </div>
    </div>
  </div>
);

export const Header = ({ onOpenEnvModal }) => {
  const { state, dispatch } = useStore();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNewWorkspaceInput, setShowNewWorkspaceInput] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleNewRequest = () => {
    dispatch({
      type: 'OPEN_TAB',
      payload: {
        name: 'Untitled Request',
        method: 'GET',
        request: null,
        requestId: null,
        collectionId: null,
      }
    });
  };

  const handleMenuClick = () => {
    // Toggle sidebar by switching panel visibility - dispatch a sidebar toggle
    // For now, navigate to collections panel as "home" action
    dispatch({ type: 'SET_SIDEBAR_PANEL', payload: state.sidebarPanel || 'collections' });
  };

  const handleHomeClick = () => {
    dispatch({ type: 'SET_SIDEBAR_PANEL', payload: 'collections' });
  };

  const handleExploreClick = () => {
    // Open a new tab with a placeholder for explore
    dispatch({
      type: 'OPEN_TAB',
      payload: {
        name: 'Explore',
        method: 'GET',
        request: {
          method: 'GET',
          url: 'https://www.postman.com/explore',
          params: [],
          auth: { type: 'none' },
          headers: [],
          body: { type: 'none', content: '', formData: [], urlencoded: [], graphql: { query: '', variables: '' } },
          preRequest: '',
          tests: '',
        },
        requestId: null,
        collectionId: null,
      }
    });
  };

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) return;
    dispatch({ type: 'CREATE_WORKSPACE', payload: newWorkspaceName.trim() });
    setNewWorkspaceName('');
    setShowNewWorkspaceInput(false);
    setShowWorkspaceMenu(false);
  };

  return (
    <header className="h-12 border-b border-sidebar-border flex items-center px-3 bg-white flex-shrink-0 z-20">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleMenuClick}
          className="p-1 text-gray-500 hover:bg-gray-100 rounded"
          title="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <span
          onClick={handleHomeClick}
          className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer font-medium"
          title="Home - Collections"
        >
          Home
        </span>
        <div className="relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 cursor-pointer font-medium"
          >
            Workspaces
            <ChevronDown size={14} />
          </button>
          {showWorkspaceMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => { setShowWorkspaceMenu(false); setShowNewWorkspaceInput(false); }} />
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-56 z-40">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">My Workspaces</div>
                <div
                  className="px-3 py-2 flex items-center gap-2 bg-orange-50 text-gray-800 text-sm cursor-pointer hover:bg-orange-100"
                  onClick={() => setShowWorkspaceMenu(false)}
                >
                  <Check size={12} className="text-primary flex-shrink-0" />
                  <span className="truncate">{state.workspace?.name || 'My Workspace'}</span>
                </div>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  {showNewWorkspaceInput ? (
                    <div className="px-2 py-1">
                      <input
                        type="text"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        placeholder="Workspace name"
                        className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-primary"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateWorkspace();
                          if (e.key === 'Escape') { setShowNewWorkspaceInput(false); setNewWorkspaceName(''); }
                        }}
                      />
                      <div className="flex gap-1 mt-1 justify-end">
                        <button onClick={() => { setShowNewWorkspaceInput(false); setNewWorkspaceName(''); }}
                          className="text-[10px] px-2 py-1 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                        <button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim()}
                          className="text-[10px] px-2 py-1 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-40">Create</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewWorkspaceInput(true)}
                      className="w-full px-3 py-2 text-left text-xs text-primary hover:bg-orange-50 flex items-center gap-1"
                    >
                      <Plus size={12} /> Create New Workspace
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <span
          onClick={handleExploreClick}
          className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer"
          title="Explore"
        >
          Explore
        </span>
      </div>

      {/* Center section */}
      <div className="flex items-center gap-2 ml-6">
        <span className="text-sm font-medium text-gray-700 mr-2">{state.workspace?.name || 'My Workspace'}</span>
        <button
          onClick={handleNewRequest}
          className="h-7 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded flex items-center gap-1 transition-colors"
        >
          New
        </button>
        <button
          onClick={() => setShowImport(true)}
          className="h-7 px-3 border border-gray-300 text-gray-600 text-xs font-medium rounded hover:bg-gray-50 flex items-center gap-1 transition-colors"
        >
          <Upload size={12} />
          Import
        </button>
      </div>

      {/* Right section - pushed to far right */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Environment selector */}
        <div className="relative mr-2">
          <select
            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded py-1.5 px-3 pr-7 focus:outline-none focus:border-primary cursor-pointer font-medium"
            value={state.activeEnvironmentId || ""}
            onChange={(e) => dispatch({ type: 'SET_ACTIVE_ENVIRONMENT', payload: e.target.value || null })}
          >
            <option value="">No Environment</option>
            {state.environments.map(env => (
              <option key={env.id} value={env.id}>{env.name}</option>
            ))}
          </select>
          <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
            title="Notifications"
          >
            <Bell size={16} />
          </button>
          {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
        </div>

        <button
          onClick={() => setShowSettings(true)}
          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
          title="Settings"
        >
          <Settings size={16} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center ml-1"
            title="User profile"
          >
            JD
          </button>
          {showUserMenu && (
            <UserMenu
              onClose={() => setShowUserMenu(false)}
              onOpenEnvModal={onOpenEnvModal}
            />
          )}
        </div>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </header>
  );
};
