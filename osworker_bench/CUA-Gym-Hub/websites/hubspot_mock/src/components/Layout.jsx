import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Users, Building2, Briefcase, Ticket, BarChart3,
  Settings, Search, Bell, HelpCircle, Mail, Calendar, FileText, CheckSquare, X,
  SlidersHorizontal
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-xubspot-dark text-white border-l-4 border-xubspot'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`
    }
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

function GlobalSearch() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getResults = (q) => {
    if (!q || q.trim().length < 1) return null;
    const lower = q.toLowerCase();
    const contacts = state.contacts
      .filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(lower) || (c.email || '').toLowerCase().includes(lower))
      .slice(0, 4)
      .map(c => ({ type: 'contact', id: c.id, name: `${c.firstName} ${c.lastName}`, subtitle: c.email }));
    const companies = state.companies
      .filter(c => (c.name || '').toLowerCase().includes(lower) || (c.domain || '').toLowerCase().includes(lower))
      .slice(0, 3)
      .map(c => ({ type: 'company', id: c.id, name: c.name, subtitle: c.domain }));
    const deals = state.deals
      .filter(d => (d.name || '').toLowerCase().includes(lower))
      .slice(0, 3)
      .map(d => ({ type: 'deal', id: d.id, name: d.name, subtitle: `$${(d.amount || 0).toLocaleString()}` }));
    const tickets = state.tickets
      .filter(t => (t.subject || '').toLowerCase().includes(lower))
      .slice(0, 3)
      .map(t => ({ type: 'ticket', id: t.id, name: t.subject, subtitle: t.status?.replace(/_/g, ' ') }));
    return { contacts, companies, deals, tickets };
  };

  const results = getResults(query);
  const hasResults = results && (results.contacts.length || results.companies.length || results.deals.length || results.tickets.length);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    if (item.type === 'contact') navigate(`/contacts?highlight=${item.id}`);
    else if (item.type === 'company') navigate(`/companies?highlight=${item.id}`);
    else if (item.type === 'deal') navigate(`/deals?highlight=${item.id}`);
    else if (item.type === 'ticket') navigate(`/tickets?highlight=${item.id}`);
  };

  const typeIcon = (type) => {
    if (type === 'contact') return <Users size={14} className="text-blue-500" />;
    if (type === 'company') return <Building2 size={14} className="text-purple-500" />;
    if (type === 'deal') return <Briefcase size={14} className="text-green-500" />;
    if (type === 'ticket') return <Ticket size={14} className="text-orange-500" />;
    return null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search CRM..."
        className="pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-md focus:bg-white focus:border-xubspot focus:outline-none focus:ring-1 focus:ring-xubspot w-64 text-sm transition-all"
        value={query}
        onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={e => { if (e.key === 'Escape') { setIsOpen(false); setQuery(''); } }}
      />
      {isOpen && query.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {!hasResults ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">No results found</div>
          ) : (
            <div>
              {[
                { key: 'contacts', label: 'Contacts', items: results.contacts },
                { key: 'companies', label: 'Companies', items: results.companies },
                { key: 'deals', label: 'Deals', items: results.deals },
                { key: 'tickets', label: 'Tickets', items: results.tickets },
              ].map(group => group.items.length > 0 && (
                <div key={group.key}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                    {group.label}
                  </div>
                  {group.items.map((item, i) => (
                    <button
                      key={`${item.type}-${i}`}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left text-sm"
                      onClick={() => handleSelect(item)}
                    >
                      {typeIcon(item.type)}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 truncate">{item.name}</div>
                        <div className="text-xs text-gray-400 truncate">{item.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    taskReminders: true,
    compactTables: false,
    owner: state.appState?.currentUser?.name || 'Admin User',
  });
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const recentNotifications = [
    ...state.tasks.filter(t => t.status !== 'completed').slice(0, 3).map(t => ({
      id: t.id, type: 'task', text: `Task due: "${t.title}"`, time: t.dueDate
    })),
    ...state.tickets.filter(t => t.status === 'new').slice(0, 3).map(t => ({
      id: t.id, type: 'ticket', text: `New ticket: "${t.subject}"`, time: t.createDate
    })),
  ]
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
    .slice(0, 5);

  const getHeaderTitle = () => {
    const path = location.pathname.split('/')[1];
    const titles = {
      '': 'Dashboard',
      'contacts': 'Contacts',
      'companies': 'Companies',
      'deals': 'Deals',
      'tickets': 'Service Tickets',
      'tasks': 'Tasks',
      'templates': 'Email Templates',
      'meetings': 'Meetings',
      'forms': 'Forms',
      'go': 'State Inspector',
      'properties': 'Properties Settings',
    };
    return titles[path] || 'XubSpot Mock';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2D3E50] text-white flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 bg-[#253342] border-b border-gray-700">
          <div className="w-8 h-8 bg-xubspot rounded-full flex items-center justify-center mr-3 font-bold text-xs">
            HS
          </div>
          <span className="font-bold text-lg tracking-tight">XubSpot Mock</span>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            CRM
          </div>
          <NavItem to="/" icon={BarChart3} label="Dashboard" />
          <NavItem to="/contacts" icon={Users} label="Contacts" />
          <NavItem to="/companies" icon={Building2} label="Companies" />
          <NavItem to="/deals" icon={Briefcase} label="Deals" />
          <NavItem to="/tickets" icon={Ticket} label="Tickets" />
          <NavItem to="/tasks" icon={CheckSquare} label="Tasks" />

          <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Marketing & Sales
          </div>
          <NavItem to="/templates" icon={Mail} label="Email Templates" />
          <NavItem to="/meetings" icon={Calendar} label="Meetings" />
          <NavItem to="/forms" icon={FileText} label="Forms" />

          <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            System
          </div>
          <NavItem to="/go" icon={Settings} label="State Inspector" />
          <NavItem to="/properties" icon={SlidersHorizontal} label="Properties Settings" />
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-xubspot border border-gray-600 flex items-center justify-center text-white text-xs font-bold">
              AU
            </div>
            <div className="text-sm">
              <div className="font-medium">{state.appState?.currentUser?.name || 'Admin User'}</div>
              <div className="text-xs text-gray-400 truncate w-32">{state.appState?.currentUser?.email || 'admin@example.com'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-xubspot-text">{getHeaderTitle()}</h1>

          <div className="flex items-center gap-4">
            <GlobalSearch />

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full hover:text-xubspot relative"
                title="Notifications"
              >
                <Bell size={20} />
                {recentNotifications.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                    <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                  </div>
                  {recentNotifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm">No new notifications</div>
                  ) : (
                    <div>
                      {recentNotifications.map(n => (
                        <div key={n.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 last:border-0">
                          <p className="text-sm text-gray-700">{n.text}</p>
                          {n.time && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(n.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full hover:text-xubspot"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => addToast('XubSpot Mock — Version 1.0. For help, visit the State Inspector (/go).', 'info', 5000)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full hover:text-xubspot"
              title="Help"
            >
              <HelpCircle size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-xubspot-light p-6">
          <Outlet />
        </main>
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Account settings</h3>
              <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default owner</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={settingsForm.owner}
                  onChange={e => setSettingsForm({ ...settingsForm, owner: e.target.value })}
                />
              </div>
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium text-gray-800">Email notifications</span>
                  <span className="block text-xs text-gray-500">Show notifications for new tickets and task activity.</span>
                </span>
                <input
                  type="checkbox"
                  checked={settingsForm.emailNotifications}
                  onChange={e => setSettingsForm({ ...settingsForm, emailNotifications: e.target.checked })}
                  className="rounded border-gray-300 text-xubspot focus:ring-xubspot"
                />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium text-gray-800">Task reminders</span>
                  <span className="block text-xs text-gray-500">Include open task reminders in the bell menu.</span>
                </span>
                <input
                  type="checkbox"
                  checked={settingsForm.taskReminders}
                  onChange={e => setSettingsForm({ ...settingsForm, taskReminders: e.target.checked })}
                  className="rounded border-gray-300 text-xubspot focus:ring-xubspot"
                />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium text-gray-800">Compact tables</span>
                  <span className="block text-xs text-gray-500">Save a local display preference for dense CRM views.</span>
                </span>
                <input
                  type="checkbox"
                  checked={settingsForm.compactTables}
                  onChange={e => setSettingsForm({ ...settingsForm, compactTables: e.target.checked })}
                  className="rounded border-gray-300 text-xubspot focus:ring-xubspot"
                />
              </label>
            </div>
            <div className="flex justify-between items-center gap-3 px-6 pb-6">
              <button
                onClick={() => { setSettingsOpen(false); navigate('/go'); }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50"
              >
                Open state inspector
              </button>
              <button
                onClick={() => {
                  dispatch({
                    type: 'UPDATE_APP_STATE',
                    payload: {
                      crmSettings: {
                        emailNotifications: settingsForm.emailNotifications,
                        taskReminders: settingsForm.taskReminders,
                        compactTables: settingsForm.compactTables,
                      },
                      currentUser: {
                        ...(state.appState?.currentUser || {}),
                        name: settingsForm.owner || 'Admin User',
                      },
                    }
                  });
                  setSettingsOpen(false);
                  addToast('Settings saved locally for this session.', 'success');
                }}
                className="px-4 py-2 bg-xubspot text-white rounded text-sm hover:bg-xubspot-hover"
              >
                Save settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
