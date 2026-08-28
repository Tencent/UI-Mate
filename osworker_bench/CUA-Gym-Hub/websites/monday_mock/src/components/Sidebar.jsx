
    import React, { useState } from 'react';
    import { LayoutGrid, Settings, Plus, Home } from 'lucide-react';
    import { useStore } from '../context/StoreContext';
    import { Link, useLocation } from 'react-router-dom';
    import clsx from 'clsx';

    export default function Sidebar() {
      const { state, updateState } = useStore();
      const location = useLocation();
      const [settingsOpen, setSettingsOpen] = useState(false);
      const search = location.search || '';

      const addBoard = () => {
        const id = `b${Date.now()}`;
        const source = state.boards[0];
        const board = {
          id,
          workspaceId: state.workspaces[0].id,
          name: 'New Board',
          description: 'Local sandbox board',
          columns: source?.columns || [],
          groups: [{ id: `${id}-g1`, title: 'New Group', color: '#579bfc' }],
          items: [],
          updates: [],
          activities: []
        };
        updateState(prev => ({ boards: [...prev.boards, board] }));
      };

      return (
        <div className="w-64 h-screen bg-[#2b2c33] text-white flex flex-col flex-shrink-0">
          {/* Logo Area */}
          <div className="p-4 flex items-center gap-2 border-b border-gray-700">
            <div className="w-8 h-8 bg-brand rounded flex items-center justify-center font-bold text-xl">
              M
            </div>
            <span className="font-bold text-lg tracking-tight">xonday.com</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 mb-6">
              <div className="text-xs text-gray-400 font-semibold mb-2 uppercase">Workspace</div>
              <div className="flex items-center gap-2 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition-colors">
                <Home size={16} />
                <span className="text-sm font-medium truncate">{state.workspaces[0].name}</span>
              </div>
            </div>

            <div className="px-2">
              <div className="px-2 text-xs text-gray-400 font-semibold mb-2 uppercase">Boards</div>
              {state.boards.map(board => (
                <Link
                  key={board.id}
                  to={`/board/${board.id}${search}`}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm mb-1 transition-colors",
                    location.pathname.includes(board.id)
                      ? "bg-primary text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  <LayoutGrid size={16} />
                  <span className="truncate">{board.name}</span>
                </Link>
              ))}

              <button onClick={addBoard} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors mt-2">
                <Plus size={16} />
                <span>Add New Board</span>
              </button>
            </div>
          </div>

          {/* User Footer */}
          <div className="p-4 border-t border-gray-700">
             <div className="flex items-center gap-3">
               <img
                 src={state.currentUser.avatar}
                 alt="User"
                 className="w-8 h-8 rounded-full border border-gray-600"
               />
               <div className="flex-1 min-w-0">
                 <div className="text-sm font-medium truncate">{state.currentUser.name}</div>
                 <div className="text-xs text-gray-400">Online</div>
               </div>
               <button onClick={() => setSettingsOpen(!settingsOpen)} className="text-gray-400 hover:text-white" title="User settings">
                 <Settings size={16} />
               </button>
             </div>
             {settingsOpen && (
               <div className="mt-3 rounded border border-gray-700 bg-gray-800 p-3 text-xs text-gray-300">
                 <div className="font-medium text-white">User settings</div>
                 <div className="mt-1">Theme: default</div>
                 <div>Notifications: enabled</div>
               </div>
             )}
          </div>
        </div>
      );
    }

