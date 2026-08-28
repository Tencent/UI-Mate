import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, Clock, DollarSign, Heart,
  TrendingUp, Users, Inbox, User,
  ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Inbox, label: 'Inbox', path: '/inbox' },
];

const myInfoItems = [
  { icon: Clock, label: 'Time & Absence', path: '/time' },
  { icon: DollarSign, label: 'Pay', path: '/pay' },
  { icon: Heart, label: 'Benefits', path: '/benefits' },
  { icon: TrendingUp, label: 'Performance', path: '/performance' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const orgItems = [
  { icon: Users, label: 'Directory', path: '/directory' },
];

function NavSection({ title, items, collapsed }) {
  return (
    <div className="mb-2">
      {!collapsed && (
        <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      )}
      {collapsed && <div className="h-2" />}
      <ul className="space-y-0.5 px-2">
        {items.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => cn(
                "flex items-center rounded-md text-sm font-medium transition-colors relative",
                collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-light-blue text-primary border-l-[3px] border-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-transparent"
              )}
            >
              <item.icon size={18} />
              {!collapsed && item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Sidebar({ isOpen, collapsed, onToggleCollapse, onClose }) {
  if (!isOpen) return null;

  const sidebarWidth = collapsed ? 'w-[52px]' : 'w-60';

  return (
    <aside className={`${sidebarWidth} bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-30 transition-all duration-200`}>
      {/* Logo area */}
      <div className="h-14 flex items-center gap-2.5 px-3 border-b border-gray-100 shrink-0">
        {!collapsed && (
          <>
            <div className="relative w-7 h-7 ml-2">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center text-white font-bold text-base">
                W
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 border-t-2 border-r-2 border-xorkday-orange rounded-tr-full"></div>
            </div>
            <span className="font-bold text-base text-gray-800 tracking-tight">
              xorkday
            </span>
          </>
        )}
        {collapsed && (
          <div className="relative w-7 h-7 mx-auto">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center text-white font-bold text-base">
              W
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 border-t-2 border-r-2 border-xorkday-orange rounded-tr-full"></div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        <NavSection title="Menu" items={menuItems} collapsed={collapsed} />
        <NavSection title="My Information" items={myInfoItems} collapsed={collapsed} />
        <NavSection title="Organization" items={orgItems} collapsed={collapsed} />
      </nav>

      {/* Collapse toggle button */}
      {onToggleCollapse && (
        <div className="p-2 border-t border-gray-100">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={16} /> : (
              <>
                <ChevronsLeft size={16} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
