import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Inbox, Send, File, AlertOctagon, Trash2, Plus, Tag, Mail, Star, AlertCircle, X, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

const LABEL_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

const CreateLabelDialog = ({ onClose }) => {
  const { createLabel } = useStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState(LABEL_COLORS[0]);

  const handleCreate = () => {
    if (!name.trim()) return;
    createLabel(name.trim(), color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-80 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800">New label</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <input
          autoFocus
          placeholder="Label name"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <div className="flex gap-2 mb-4">
          {LABEL_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className={cn("w-6 h-6 rounded-full border-2", color === c ? "border-gray-800 scale-110" : "border-transparent")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
          <button onClick={handleCreate} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Create</button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { state, setIsComposeOpen } = useStore();
  const location = useLocation();
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const primaryNavItems = [
    { icon: Inbox, label: 'Inbox', path: '/inbox', count: state.emails.filter(e => e.folder === 'inbox' && !e.read).length },
    { icon: Star, label: 'Starred', path: '/starred', count: state.emails.filter(e => e.starred).length },
    { icon: AlertCircle, label: 'Important', path: '/important', count: state.emails.filter(e => e.important && e.folder !== 'trash').length },
    { icon: Clock, label: 'Snoozed', path: '/snoozed', count: state.emails.filter(e => e.folder === 'snoozed').length },
    { icon: Send, label: 'Sent', path: '/sent' },
    { icon: File, label: 'Drafts', path: '/drafts', count: state.emails.filter(e => e.folder === 'drafts').length },
  ];

  const moreNavItems = [
    { icon: AlertOctagon, label: 'Spam', path: '/spam', count: state.emails.filter(e => e.folder === 'spam' && !e.read).length },
    { icon: Trash2, label: 'Trash', path: '/trash' },
    { icon: Mail, label: 'All Mail', path: '/all-mail' },
  ];

  const renderNavItem = (item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) => cn(
        "flex items-center justify-between px-6 py-1.5 rounded-r-full mb-1 text-sm font-medium",
        isActive
          ? "bg-[#d3e3fd] text-[#001d35]"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <div className="flex items-center gap-4">
        <item.icon size={20} />
        {item.label}
      </div>
      {item.count > 0 && (
        <span className="text-xs font-bold">{item.count}</span>
      )}
    </NavLink>
  );

  return (
    <div className="w-64 h-full flex flex-col py-4 pr-4">
      <div className="pl-4 mb-6">
        <button
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center gap-3 bg-[#c2e7ff] hover:shadow-md transition-shadow text-gray-800 px-6 py-4 rounded-2xl font-medium"
        >
          <Plus size={24} />
          Compose
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {primaryNavItems.map(renderNavItem)}

        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-4 px-6 py-1.5 rounded-r-full mb-1 text-sm font-medium text-gray-700 hover:bg-gray-100 w-full"
        >
          {showMore ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          {showMore ? 'Less' : 'More'}
        </button>

        {showMore && moreNavItems.map(renderNavItem)}

        <div className="mt-6 px-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Labels</h3>
            <button onClick={() => setShowCreateLabel(true)}><Plus size={16} className="text-gray-500 cursor-pointer hover:text-gray-700" /></button>
          </div>
          {state.labels.map(label => (
            <NavLink
              key={label.id}
              to={`/label/${label.id}`}
              className={({ isActive }) => cn(
                "flex items-center gap-4 py-1.5 -mx-6 px-6 rounded-r-full text-sm",
                isActive ? "bg-[#d3e3fd] text-[#001d35]" : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Tag size={18} style={{ fill: label.color, stroke: 'none' }} />
              {label.name}
            </NavLink>
          ))}
        </div>
      </nav>
      {showCreateLabel && <CreateLabelDialog onClose={() => setShowCreateLabel(false)} />}
    </div>
  );
};

export default Sidebar;