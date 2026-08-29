import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, DollarSign, Clock, Heart, Users, User, TrendingUp, Inbox, Home, HelpCircle } from 'lucide-react';

const sections = [
  {
    title: 'Frequently Used',
    items: [
      { icon: DollarSign, label: 'Pay', path: '/pay' },
      { icon: Clock, label: 'Time & Absence', path: '/time' },
      { icon: Heart, label: 'Benefits', path: '/benefits' },
      { icon: Users, label: 'Directory', path: '/directory' },
    ],
  },
  {
    title: 'My Information',
    items: [
      { icon: User, label: 'Profile', path: '/profile' },
      { icon: DollarSign, label: 'Pay', path: '/pay' },
      { icon: Heart, label: 'Benefits', path: '/benefits' },
    ],
  },
  {
    title: 'My Team',
    items: [
      { icon: Users, label: 'Directory', path: '/directory' },
      { icon: TrendingUp, label: 'Performance', path: '/performance' },
    ],
  },
  {
    title: 'Applications',
    items: [
      { icon: Home, label: 'Home', path: '/' },
      { icon: Inbox, label: 'Inbox', path: '/inbox' },
      { icon: TrendingUp, label: 'Performance', path: '/performance' },
      { icon: HelpCircle, label: 'Help', path: '/' },
    ],
  },
];

export default function GlobalNav({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div
        className={`fixed inset-y-0 left-0 w-[300px] bg-white z-50 shadow-2xl transform transition-transform duration-200 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center text-white font-bold text-base">
                W
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 border-t-2 border-r-2 border-xorkday-orange rounded-tr-full"></div>
            </div>
            <span className="font-bold text-base text-gray-800 tracking-tight">xorkday</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 overflow-y-auto py-4">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="mb-4">
              <p className="px-5 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {section.title}
              </p>
              <div className="space-y-0.5 px-3">
                {section.items.map((item, iIdx) => (
                  <button
                    key={iIdx}
                    onClick={() => handleClick(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-light-blue hover:text-primary transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <item.icon size={16} />
                    </div>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
