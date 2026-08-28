import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, BarChart3, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';

const FEED_ITEMS = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Popular', icon: TrendingUp, path: '/popular' },
  { label: 'All', icon: BarChart3, path: '/all' },
];

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const { state } = useStore();
  const location = useLocation();
  const [showAllSubs, setShowAllSubs] = useState(false);

  const joinedIds = state.currentUser.joinedSubreddits || [];
  const joinedSubs = state.subreddits
    .filter(s => joinedIds.includes(s.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const displayedSubs = showAllSubs ? joinedSubs : joinedSubs.slice(0, 5);

  const sidebarContent = (
    <div className="py-3 px-5">
      {/* Xeddit Feeds */}
      <h3 className="text-[10px] font-bold uppercase text-[#787C7E] tracking-wide mb-2 px-1">
        Xeddit Feeds
      </h3>
      <ul className="space-y-0.5 mb-3">
        {FEED_ITEMS.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#E8F0FE] text-[#0079D3]"
                    : "text-[#1C1C1C] hover:bg-[#F6F7F8]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Divider */}
      <div className="border-b border-[#EDEFF1] mb-3"></div>

      {/* Subscriptions */}
      <h3 className="text-[10px] font-bold uppercase text-[#787C7E] tracking-wide mb-2 px-1">
        Your Communities
      </h3>
      <ul className="space-y-0.5">
        {displayedSubs.map(sub => {
          const isActive = location.pathname === `/r/${sub.id}`;
          return (
            <li key={sub.id}>
              <Link
                to={`/r/${sub.id}`}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-[#E8F0FE] text-[#0079D3] font-medium"
                    : "text-[#1C1C1C] hover:bg-[#F6F7F8]"
                )}
              >
                <img
                  src={sub.icon}
                  alt=""
                  className="w-5 h-5 rounded-full flex-shrink-0"
                />
                <span className="truncate">r/{sub.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Show more / less */}
      {joinedSubs.length > 5 && (
        <button
          onClick={() => setShowAllSubs(!showAllSubs)}
          className="flex items-center gap-2 px-3 py-1.5 mt-1 text-sm text-[#0079D3] hover:bg-[#F6F7F8] rounded-md w-full transition-colors"
        >
          {showAllSubs ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>See less</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>See more</span>
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-[270px] bg-white border-r border-[#EDEFF1] sticky top-12 h-[calc(100vh-48px)] overflow-y-auto sidebar-scroll flex-shrink-0 hidden md:block">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[300] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-[270px] bg-white overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#EDEFF1]">
              <span className="font-bold text-[#1C1C1C]">Navigation</span>
              <button
                onClick={onMobileClose}
                className="text-[#787C7E] hover:text-[#1C1C1C] p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
