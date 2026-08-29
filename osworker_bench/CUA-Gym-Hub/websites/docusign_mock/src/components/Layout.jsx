import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileCheck, HelpCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const HELP_CONTENT = [
  { title: 'Sending an Envelope', content: 'Click Start > Send an Envelope on the Home page. Add documents by uploading files, add recipients with their email addresses, and place signature fields on documents. Click Send when ready.' },
  { title: 'Signing a Document', content: 'When you receive an envelope to sign, navigate to Agreements > Inbox or click "Sign a Document" from the Home page. Click on each field to fill it in, then click Finish when all required fields are complete.' },
  { title: 'Using Templates', content: 'Templates let you reuse document layouts with predefined roles and fields. Go to Templates to create or manage templates. When sending a new envelope, click "Use a Template" in step 1 to apply a template.' },
  { title: 'Tracking Agreements', content: 'The Agreements page shows all your envelopes organized by status. Use folders (Inbox, Sent, Completed, etc.) to navigate. Click any envelope to see its detailed status and recipient activity.' },
  { title: 'Reports', content: 'The Reports page shows analytics about your envelope activity including completion rate, average completion time, and monthly trends computed from your actual data.' },
];

const NAV_TABS = [
  { label: 'Home', path: '/' },
  { label: 'Agreements', path: '/agreements' },
  { label: 'Templates', path: '/templates' },
  { label: 'Reports', path: '/reports' },
];

const Layout = ({ children }) => {
  const { state } = useStore();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);

  const isActive = (tab) => {
    if (tab.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(tab.path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-[#1A3763] text-white shadow-md relative z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Left - Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <FileCheck className="w-7 h-7" />
            <span className="text-lg font-bold tracking-tight">XocuSign</span>
          </Link>

          {/* Center - Nav Tabs */}
          <nav className="flex items-center gap-1">
            {NAV_TABS.map(tab => {
              // Badge counts
              let badge = 0;
              if (tab.path === '/agreements') {
                badge = state.envelopes.filter(e =>
                  (e.status === 'sent' || e.status === 'delivered') &&
                  e.recipients.some(r => r.email === state.user.email && r.status !== 'signed')
                ).length;
              } else if (tab.path === '/') {
                badge = state.envelopes.filter(e => e.status === 'draft').length +
                  state.envelopes.filter(e =>
                    (e.status === 'sent' || e.status === 'delivered') &&
                    e.recipients.some(r => r.email === state.user.email && r.status !== 'signed')
                  ).length;
              }
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`px-4 py-4 text-sm font-medium transition-colors relative ${
                    isActive(tab)
                      ? 'text-white'
                      : 'text-blue-200 hover:text-white'
                  }`}
                >
                  {tab.label}
                  {badge > 0 && (
                    <span className="absolute -top-0 -right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                  {isActive(tab) && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right - Help + User */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => setShowHelp(true)}
              className="text-blue-200 hover:text-white transition-colors p-1"
              title="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <Link to="/settings" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <img
                src={state.user.avatar}
                alt={state.user.name}
                className="w-8 h-8 rounded-full border-2 border-white/30"
              />
              <span className="text-sm font-medium hidden md:block">{state.user.name}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content - full width */}
      <main className="flex-1">
        {children}
      </main>

      {/* Help Panel */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[560px] max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-[#1A3763] text-white rounded-t-lg">
              <h3 className="font-semibold text-lg">Help Center</h3>
              <button onClick={() => setShowHelp(false)} className="text-blue-200 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 divide-y">
              {HELP_CONTENT.map(item => (
                <div key={item.title} className="p-5">
                  <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.content}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button onClick={() => setShowHelp(false)} className="px-4 py-2 text-sm bg-[#1A3763] text-white rounded-md hover:bg-[#15305a]">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
