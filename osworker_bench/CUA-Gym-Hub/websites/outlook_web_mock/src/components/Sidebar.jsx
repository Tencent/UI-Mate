import React, { useState } from 'react';
import { Mail, Calendar, Users, CheckSquare, MoreHorizontal } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const NavItem = ({ to, icon: Icon, label, search }) => {
  const href = search ? `${to}${search}` : to;

  return (
    <NavLink
      to={href}
      className={({ isActive }) => clsx(
        "flex flex-col items-center justify-center w-12 h-12 mb-1 rounded hover:bg-neutral-100 transition-colors text-neutral-600",
        isActive && "text-primary bg-neutral-100"
      )}
      title={label}
    >
      <Icon className="w-6 h-6" />
    </NavLink>
  );
};

export default function Sidebar() {
  const [showMore, setShowMore] = useState(false);
  const { search } = useLocation();

  return (
    <nav className="w-16 bg-neutral-50 border-r border-neutral-200 flex flex-col items-center py-2 flex-shrink-0">
      <NavItem to="/" icon={Mail} label="Mail" search={search} />
      <NavItem to="/calendar" icon={Calendar} label="Calendar" search={search} />
      <NavItem to="/people" icon={Users} label="People" search={search} />
      <NavItem to="/tasks" icon={CheckSquare} label="To Do" search={search} />
      
      <div className="mt-auto">
        <button
          onClick={() => setShowMore(prev => !prev)}
          className="flex flex-col items-center justify-center w-12 h-12 mb-1 rounded hover:bg-neutral-100 text-neutral-600"
          title="More apps"
        >
          <MoreHorizontal className="w-6 h-6" />
        </button>
        {showMore && (
          <div className="absolute bottom-2 left-16 z-50 w-48 rounded border border-neutral-200 bg-white p-2 text-sm shadow-xl">
            {['Files', 'Notes', 'Bookings', 'Groups'].map(item => (
              <button key={item} className="block w-full rounded px-3 py-2 text-left text-neutral-700 hover:bg-neutral-100">
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
