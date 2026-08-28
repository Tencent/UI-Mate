import React, { useMemo, useState } from 'react';
import { Search, Bell, HelpCircle, Plus, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store';

export default function TopBar() {
  const { state } = useStore();
  const user = state.currentUser;
  const { search } = useLocation();
  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState(null);

  const searchResults = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return state.projects
      .filter(project => `${project.name} ${project.description}`.toLowerCase().includes(value))
      .slice(0, 5);
  }, [query, state.projects]);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search or jump to..." 
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-gray-100 border border-transparent focus:bg-white focus:border-blue-400 rounded-md text-sm outline-none transition-all"
          />
          {query.trim() && (
            <div className="absolute left-0 top-10 z-50 w-80 rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">Projects</div>
              {searchResults.map(project => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}${search || ''}`}
                  onClick={() => setQuery('')}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span className="font-semibold">{project.name}</span>
                  <span className="block truncate text-xs text-gray-500">{project.description}</span>
                </Link>
              ))}
              {searchResults.length === 0 && <div className="px-3 py-3 text-sm text-gray-500">No matching projects</div>}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => setPanel(panel === 'create' ? null : 'create')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="Create new">
          <Plus size={20} />
        </button>
        <button onClick={() => setPanel(panel === 'notifications' ? null : 'notifications')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative" title="Notifications">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-xitlab-orange rounded-full border-2 border-white"></span>
        </button>
        <button onClick={() => setPanel(panel === 'help' ? null : 'help')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="Help">
          <HelpCircle size={20} />
        </button>
        
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        
        <button onClick={() => setPanel(panel === 'account' ? null : 'account')} className="flex items-center gap-2 hover:bg-gray-100 p-1 pr-3 rounded-full" title="Account">
          <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
          <span className="text-sm font-medium text-gray-700">{user.name}</span>
        </button>
      </div>

      {panel && (
        <div className="absolute right-4 top-14 z-50 w-72 rounded-md border border-gray-200 bg-white p-3 shadow-lg">
          {panel === 'create' && (
            <div className="space-y-1 text-sm">
              <Link to={`/${search || ''}`} onClick={() => setPanel(null)} className="block rounded px-3 py-2 hover:bg-gray-50">New project</Link>
              <Link to={`/snippets${search || ''}`} onClick={() => setPanel(null)} className="block rounded px-3 py-2 hover:bg-gray-50">New snippet</Link>
              {state.projects[0] && (
                <Link to={`/projects/${state.projects[0].id}/merge_requests/new${search || ''}`} onClick={() => setPanel(null)} className="block rounded px-3 py-2 hover:bg-gray-50">New merge request</Link>
              )}
            </div>
          )}
          {panel === 'notifications' && (
            <>
              <h3 className="mb-2 font-semibold text-gray-800">Notifications</h3>
              <p className="text-sm text-gray-600">Pipeline #103 is running and 2 issues need triage.</p>
            </>
          )}
          {panel === 'help' && (
            <>
              <h3 className="mb-2 font-semibold text-gray-800">Help</h3>
              <p className="text-sm text-gray-600">Use this local XitLab sandbox to manage projects, issues, merge requests, pipelines, snippets, registry images, wiki pages, releases, and security findings.</p>
            </>
          )}
          {panel === 'account' && (
            <>
              <h3 className="font-semibold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-600">@{user.username}</p>
            </>
          )}
        </div>
      )}
    </header>
  );
}
