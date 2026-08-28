import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { Search, Bell, HelpCircle, User, Grid } from 'lucide-react';

export const TopBar = () => {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between z-10 relative">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <span className="font-bold text-lg text-primary hidden md:block">KnowledgeBase</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <div className="hover:text-blue-600 cursor-pointer">Recent</div>
          <div className="hover:text-blue-600 cursor-pointer">Spaces</div>
          <div className="hover:text-blue-600 cursor-pointer">Apps</div>
          <div className="hover:text-blue-600 cursor-pointer">Templates</div>
          <button 
            onClick={() => {
              // Quick create
              if (state.spaces.length > 0) {
                const spaceId = state.spaces[0].id;
                navigate(`/spaces/${spaceId}`);
              }
            }}
            className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
          >
            Create
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2 top-1.5 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search" 
            className="pl-8 pr-4 py-1.5 bg-gray-100 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all focus:w-64"
          />
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <Bell size={20} className="hover:text-gray-700 cursor-pointer" />
          <HelpCircle size={20} className="hover:text-gray-700 cursor-pointer" />
          <div className="border-l border-gray-300 h-6 mx-1"></div>
          <div className="relative group">
            <img 
              src={state.currentUser.avatar} 
              alt="User" 
              className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer"
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 hidden group-hover:block py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-bold">{state.currentUser.displayName}</p>
                <p className="text-xs text-gray-500">{state.currentUser.email}</p>
              </div>
              {state.users.map(u => (
                <button 
                  key={u.id}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => dispatch({ type: 'SWITCH_USER', payload: u.id })}
                >
                  Switch to {u.username}
                </button>
              ))}
              <Link to="/go" className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-blue-600">
                Debug State (/go)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
