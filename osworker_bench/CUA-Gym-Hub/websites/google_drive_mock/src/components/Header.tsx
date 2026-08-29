import React, { useState } from 'react';
import { Search, Settings, HelpCircle, Grip } from 'lucide-react';
import { useFileSystem } from '../context/FileSystemContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { state } = useFileSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [panel, setPanel] = useState<'help' | 'settings' | 'apps' | 'account' | null>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-border flex items-center px-4 justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2 w-60">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo_%282020%29.svg" 
          alt="Logo" 
          className="w-10 h-10"
        />
        <span className="text-xl text-gray-600 font-normal">Drive</span>
      </div>

      <div className="flex-1 max-w-2xl px-4">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-primary" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:bg-white focus:shadow-md transition-all sm:text-sm"
            placeholder="Search in Drive"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-3 w-60 justify-end">
        <button onClick={() => setPanel(panel === 'help' ? null : 'help')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Help">
          <HelpCircle className="w-6 h-6" />
        </button>
        <button onClick={() => setPanel(panel === 'settings' ? null : 'settings')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Settings">
          <Settings className="w-6 h-6" />
        </button>
        <button onClick={() => setPanel(panel === 'apps' ? null : 'apps')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title="Google apps">
          <Grip className="w-6 h-6" />
        </button>
        <button className="ml-2" onClick={() => setPanel(panel === 'account' ? null : 'account')} title="Google Account">
          <img 
            src={state.currentUser.avatar} 
            alt="User" 
            className="w-8 h-8 rounded-full border border-gray-200"
          />
        </button>
      </div>

      {panel && (
        <div className="absolute right-4 top-14 z-40 w-80 bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-sm">
          {panel === 'help' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Drive help</h3>
              <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => navigate('/search?q=Project')}>
                Search for files
              </button>
              <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => navigate('/trash')}>
                Restore items from Trash
              </button>
            </div>
          )}
          {panel === 'settings' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Settings</h3>
              <label className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100">
                <span>Density</span>
                <select className="border border-gray-300 rounded px-2 py-1">
                  <option>Comfortable</option>
                  <option>Compact</option>
                </select>
              </label>
              <label className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100">
                <span>Suggestions</span>
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          )}
          {panel === 'apps' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Google apps</h3>
              <div className="grid grid-cols-3 gap-2">
                {['Docs', 'Sheets', 'Slides', 'Forms', 'Calendar', 'Meet'].map(app => (
                  <button key={app} className="px-2 py-3 rounded hover:bg-gray-100 text-center">{app}</button>
                ))}
              </div>
            </div>
          )}
          {panel === 'account' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={state.currentUser.avatar} alt="User" className="w-12 h-12 rounded-full" />
                <div>
                  <div className="font-medium text-gray-900">{state.currentUser.name}</div>
                  <div className="text-gray-500">{state.currentUser.email}</div>
                </div>
              </div>
              <button className="w-full border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-50">Manage local account</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
