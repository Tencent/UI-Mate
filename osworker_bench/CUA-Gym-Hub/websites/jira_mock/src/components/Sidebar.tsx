import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layout, List, BarChart2, Search, PlusCircle, Database, Bell, Settings } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface SidebarProps {
  onCreateIssue: () => void;
  onToggleNotifications: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCreateIssue, onToggleNotifications }) => {
  const { state } = useStore();
  const project = state.projects[0];
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
      isActive ? 'bg-xira-blue/10 text-xira-blue font-medium' : 'text-xira-text hover:bg-gray-100'
    }`;

  return (
    <div className="w-64 bg-xira-gray border-r border-xira-border h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-xira-blue rounded flex items-center justify-center text-white font-bold">
          {project.key.substring(0, 1)}
        </div>
        <div>
          <h1 className="font-bold text-xira-text truncate w-32">{project.name}</h1>
          <p className="text-xs text-xira-subtext">{project.category}</p>
        </div>
      </div>

      {/* Create Button */}
      <div className="px-4 mb-3">
        <button
          onClick={onCreateIssue}
          className="w-full flex items-center justify-center gap-2 bg-xira-blue text-white rounded-md py-2 px-4 font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={18} />
          Create
        </button>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        <NavLink to="/" className={navClass}>
          <Layout size={20} /> Dashboard
        </NavLink>
        <NavLink to={`/project/${project.key}/board`} className={navClass}>
          <BarChart2 size={20} className="rotate-90" /> Board
        </NavLink>
        <NavLink to={`/project/${project.key}/backlog`} className={navClass}>
          <List size={20} /> Backlog
        </NavLink>
        <NavLink to={`/project/${project.key}/reports`} className={navClass}>
          <BarChart2 size={20} /> Reports
        </NavLink>
        <NavLink to={`/project/${project.key}/settings`} className={navClass}>
          <Settings size={20} /> Settings
        </NavLink>
        <div className="my-4 border-t border-xira-border mx-2"></div>
        <NavLink to="/search" className={navClass}>
          <Search size={20} /> Advanced Search
        </NavLink>
        <NavLink to="/go" className={navClass}>
          <Database size={20} /> State Inspector
        </NavLink>
      </nav>

      {/* Notification bell + user info */}
      <div className="p-4 border-t border-xira-border">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onToggleNotifications}
            className="relative p-2 hover:bg-gray-200 rounded-md transition-colors"
            title="Notifications"
          >
            <Bell size={20} className="text-xira-subtext" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-xira-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <img src={state.currentUser.avatar} alt="User" className="w-8 h-8 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-xira-text truncate">{state.currentUser.name}</p>
            <p className="text-xs text-xira-subtext truncate">{state.currentUser.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
