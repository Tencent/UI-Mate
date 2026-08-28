import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Receipt, Landmark, Users, BarChart3,
  Calculator, Briefcase, ChevronRight, ChevronDown, Menu, Search,
  Bell, Settings, HelpCircle, Grid3X3, Pencil, BookOpen, X, Building2,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '../lib/store';

// Sidebar menu configuration
const MENU_ITEMS = [
  {
    id: 'dashboards', label: 'Dashboards', icon: LayoutDashboard, path: '/',
    children: [{ label: 'Business overview', path: '/' }],
  },
  {
    id: 'transactions', label: 'Transactions', icon: Landmark, path: '/transactions',
    children: [
      { label: 'Banking', path: '/transactions' },
      { label: 'Bank rules', path: '/transactions/rules' },
      { label: 'Receipts', path: '/transactions/receipts' },
    ],
  },
  {
    id: 'sales', label: 'Sales', icon: FileText, path: '/sales',
    children: [
      { label: 'All Sales', path: '/sales' },
      { label: 'Invoices', path: '/sales/invoices' },
      { label: 'Customers', path: '/sales/customers' },
      { label: 'Products & Services', path: '/sales/products' },
    ],
  },
  {
    id: 'expenses', label: 'Expenses', icon: Receipt, path: '/expenses',
    children: [
      { label: 'Expenses', path: '/expenses' },
      { label: 'Bills', path: '/expenses/bills' },
      { label: 'Vendors', path: '/expenses/vendors' },
    ],
  },
  {
    id: 'customers', label: 'Customers & leads', icon: Users, path: '/customers',
    children: null,
  },
  {
    id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports',
    children: null,
  },
  {
    id: 'payroll', label: 'Payroll', icon: Users, path: '/payroll',
    children: [
      { label: 'Overview', path: '/payroll' },
      { label: 'Employees', path: '/payroll/employees' },
      { label: 'Contractors', path: '/payroll/contractors' },
    ],
  },
  {
    id: 'projects', label: 'Projects', icon: Briefcase, path: '/projects',
    children: null,
  },
  {
    id: 'budgets', label: 'Budgets', icon: BookOpen, path: '/budgets',
    children: null,
  },
  {
    id: 'taxes', label: 'Taxes', icon: Calculator, path: '/taxes',
    children: [{ label: 'Sales tax', path: '/taxes' }],
  },
  {
    id: 'accountant', label: 'My Accountant', icon: Users, path: '/accountant',
    children: null,
  },
  {
    id: 'accounting', label: 'Accounting', icon: BookOpen, path: '/accounting',
    children: [
      { label: 'Chart of Accounts', path: '/accounting' },
      { label: 'Reconcile', path: '/accounting/reconcile' },
    ],
  },
];

const BOOKMARKS = [
  { label: 'Invoices', path: '/sales/invoices' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Profit and Loss', path: '/reports/profit-loss' },
];

// Quick Create dropdown items
const QUICK_CREATE = {
  Customers: [
    { label: 'Invoice', path: '/sales/new-invoice' },
    { label: 'Receive payment', path: '/sales' },
    { label: 'Estimate', path: '/sales' },
    { label: 'Sales receipt', path: '/sales' },
    { label: 'Refund receipt', path: '/sales' },
    { label: 'Credit memo', path: '/sales' },
  ],
  Vendors: [
    { label: 'Expense', path: '/expenses' },
    { label: 'Bill', path: '/expenses/bills' },
    { label: 'Pay bills', path: '/expenses/bills' },
    { label: 'Purchase order', path: '/expenses' },
    { label: 'Vendor credit', path: '/expenses' },
  ],
  Employees: [
    { label: 'Payroll', path: '/payroll' },
  ],
  Other: [
    { label: 'Bank deposit', path: '/transactions' },
    { label: 'Transfer', path: '/transactions' },
    { label: 'Journal entry', path: '/accounting' },
  ],
};

// Mock notifications
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'warning', title: 'Invoice #1003 is overdue', desc: 'Jeff\'s Jalopies — $1,200.00 overdue', time: '2 hours ago' },
  { id: 2, type: 'info', title: 'New bank transaction imported', desc: '6 transactions are ready to review', time: '4 hours ago' },
  { id: 3, type: 'warning', title: 'Bill due in 3 days', desc: 'Office Depot — $234.50 due soon', time: '1 day ago' },
  { id: 4, type: 'info', title: 'Payroll reminder', desc: 'Bi-weekly payroll runs in 5 days', time: '2 days ago' },
];

function SidebarMenuItem({ item }) {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;

  const isActive = location.pathname === item.path ||
    (item.children && item.children.some(c => location.pathname === c.path)) ||
    (item.path !== '/' && location.pathname.startsWith(item.path));

  // Auto-expand if a child path is currently active (initialize from isActive)
  const [expanded, setExpanded] = useState(isActive && hasChildren);

  // Re-sync expanded state when location changes
  useEffect(() => {
    if (isActive && hasChildren && !expanded) {
      setExpanded(true);
    }
  }, [location.pathname]);

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
  };

  return (
    <div>
      <div className="flex items-center">
        <Link
          to={item.path}
          onClick={hasChildren ? (e) => { e.preventDefault(); handleClick(); } : undefined}
          className={clsx(
            'flex items-center flex-1 px-4 py-2 text-[13px] font-medium transition-colors',
            isActive
              ? 'text-qb-green bg-qb-green-light border-l-[3px] border-qb-green'
              : 'text-gray-700 hover:bg-gray-100 border-l-[3px] border-transparent'
          )}
        >
          <item.icon className={clsx('w-[18px] h-[18px] mr-3 flex-shrink-0', isActive ? 'text-qb-green' : 'text-gray-500')} />
          <span className="flex-1">{item.label}</span>
          {hasChildren && (
            expanded
              ? <ChevronDown className="w-4 h-4 text-gray-400" />
              : <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </Link>
      </div>
      {hasChildren && expanded && (
        <div className="ml-[42px] border-l border-gray-200">
          {item.children.map(child => (
            <Link
              key={child.path}
              to={child.path}
              className={clsx(
                'block pl-3 py-1.5 text-[13px] transition-colors',
                location.pathname === child.path
                  ? 'text-qb-green font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickCreateDropdown({ onClose }) {
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-0 right-0 mx-4 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fade-in"
    >
      <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-1">
        {Object.entries(QUICK_CREATE).map(([section, items]) => (
          <div key={section} className={section === 'Other' ? 'col-span-2 border-t border-gray-100 pt-2 mt-1' : ''}>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{section}</div>
            {items.map(item => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className="block w-full text-left py-1 px-2 text-[13px] rounded transition-colors text-qb-green hover:bg-qb-green-light"
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Notifications dropdown
function NotificationsDropdown({ onClose, notifications }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-800">Notifications</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
        {notifications.map(n => (
          <div key={n.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-start gap-2">
              <div className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', n.type === 'warning' ? 'bg-orange-400' : 'bg-blue-400')} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{n.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 truncate">{n.desc}</div>
                <div className="text-xs text-gray-400 mt-0.5">{n.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-gray-100 text-center">
        <button className="text-xs text-qb-blue hover:underline">Mark all as read</button>
      </div>
    </div>
  );
}

// Settings modal
function SettingsModal({ onClose, company }) {
  const [activeTab, setActiveTab] = useState('company');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Account and Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex flex-1 min-h-0">
          {/* Left tabs */}
          <div className="w-44 border-r border-gray-200 py-4 flex-shrink-0">
            {[
              { key: 'company', label: 'Company' },
              { key: 'sales', label: 'Sales' },
              { key: 'expenses', label: 'Expenses' },
              { key: 'advanced', label: 'Advanced' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'w-full text-left px-4 py-2.5 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-qb-green-light text-qb-green border-r-2 border-qb-green'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'company' && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Company information</h3>
                {[
                  { label: 'Company name', value: company?.name || 'Acme Corp' },
                  { label: 'Legal name', value: company?.name || 'Acme Corp' },
                  { label: 'EIN / Tax ID', value: company?.taxId || '12-3456789' },
                  { label: 'Industry', value: company?.industry || 'Technology Services' },
                  { label: 'Email', value: company?.email || 'admin@acmecorp.com' },
                  { label: 'Phone', value: company?.phone || '(415) 555-0100' },
                  { label: 'Address', value: company?.address || '123 Business Rd, San Francisco CA 94105' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-medium text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'sales' && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Sales settings</h3>
                {[
                  { label: 'Default payment terms', value: 'Net 30' },
                  { label: 'Preferred invoice delivery', value: 'Email' },
                  { label: 'Sales tax', value: '8%' },
                  { label: 'Shipping', value: 'Off' },
                  { label: 'Custom transaction numbers', value: 'On' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-medium text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'expenses' && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Expense settings</h3>
                {[
                  { label: 'Bills and expenses tracking', value: 'On' },
                  { label: 'Default expense category', value: 'Office Supplies' },
                  { label: 'Purchase orders', value: 'Off' },
                  { label: 'Billable expenses', value: 'Off' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-medium text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Advanced settings</h3>
                {[
                  { label: 'Accounting method', value: company?.accountingMethod || 'Accrual' },
                  { label: 'Fiscal year start', value: company?.fiscalYearStart || 'January' },
                  { label: 'Currency', value: 'USD ($)' },
                  { label: 'Chart of accounts automation', value: 'On' },
                  { label: 'Close the books', value: 'Off' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-medium text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

// User avatar dropdown
function UserDropdown({ onClose, companyName, navigate }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{companyName}</div>
            <div className="text-xs text-gray-500">Admin</div>
          </div>
        </div>
      </div>
      <div className="py-1">
        <button
          onClick={() => { onClose(); navigate('/accountant'); }}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Building2 className="w-4 h-4 text-gray-400" />
          Company profile
        </button>
        <button
          onClick={() => { onClose(); window.location.href = '/'; }}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

// Search bar overlay
function SearchOverlay({ onClose, navigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Simple search across reports
  const SEARCHABLE = [
    { label: 'Profit and Loss Report', path: '/reports/profit-loss', type: 'Report' },
    { label: 'Balance Sheet', path: '/reports/balance-sheet', type: 'Report' },
    { label: 'Invoice List', path: '/reports/invoice-list', type: 'Report' },
    { label: 'Sales by Customer', path: '/reports/sales-by-customer', type: 'Report' },
    { label: 'Expenses by Vendor', path: '/reports/expenses-by-vendor', type: 'Report' },
    { label: 'Unpaid Bills', path: '/reports/unpaid-bills', type: 'Report' },
    { label: 'Payroll Summary', path: '/reports/payroll-summary', type: 'Report' },
    { label: 'Invoices', path: '/sales/invoices', type: 'Page' },
    { label: 'Customers', path: '/sales/customers', type: 'Page' },
    { label: 'Expenses', path: '/expenses', type: 'Page' },
    { label: 'Vendors', path: '/expenses/vendors', type: 'Page' },
    { label: 'Banking', path: '/transactions', type: 'Page' },
    { label: 'Payroll', path: '/payroll', type: 'Page' },
    { label: 'Projects', path: '/projects', type: 'Page' },
    { label: 'Budgets', path: '/budgets', type: 'Page' },
  ];

  const results = query.length >= 2
    ? SEARCHABLE.filter(r => r.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-lg mx-4">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search reports, pages, customers..."
            className="flex-1 text-sm outline-none"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && onClose()}
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        {results.length > 0 && (
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
            {results.map(r => (
              <button
                key={r.path}
                onClick={() => handleSelect(r.path)}
                className="flex items-center justify-between w-full px-4 py-2.5 text-left hover:bg-gray-50"
              >
                <span className="text-sm text-gray-900">{r.label}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{r.type}</span>
              </button>
            ))}
          </div>
        )}
        {query.length >= 2 && results.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-gray-400">No results found for "{query}"</div>
        )}
        {query.length < 2 && (
          <div className="px-4 py-4 text-xs text-gray-400">Type at least 2 characters to search...</div>
        )}
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const { data } = useStore();
  const navigate = useNavigate();
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAppsMenu, setShowAppsMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const appsRef = useRef(null);

  const pendingTxCount = data.transactions.filter(tx => tx.status === 'pending').length;

  return (
    <div className="flex h-screen bg-qb-bg font-sans">
      {/* Modals */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} company={data.company} />}
      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} navigate={navigate} />}

      {/* Sidebar */}
      <aside className={clsx(
        'bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 transition-all duration-200',
        sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-[240px]'
      )}>
        {/* Logo area */}
        <div className="px-4 pt-4 pb-3 flex items-center">
          <div className="w-7 h-7 bg-qb-green rounded-full flex items-center justify-center text-white font-bold text-xs mr-2 flex-shrink-0">qb</div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">Intuit</span>
            <span className="text-[13px] font-bold text-gray-800 -mt-0.5">XuickBooks</span>
          </div>
        </div>

        {/* + New button */}
        <div className="px-4 py-2 relative">
          <button
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            className="w-full bg-qb-green hover:bg-qb-green-hover text-white rounded-md py-2.5 px-4 font-semibold transition-colors shadow-sm flex items-center justify-center text-sm"
          >
            <span className="text-lg mr-1.5 leading-none">+</span> New
          </button>
          {showQuickCreate && <QuickCreateDropdown onClose={() => setShowQuickCreate(false)} />}
        </div>

        {/* Scrollable menu */}
        <div className="flex-1 overflow-y-auto">
          {/* Bookmarks section */}
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Bookmarks</span>
              <Pencil className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            {BOOKMARKS.map(bm => (
              <Link
                key={bm.path}
                to={bm.path}
                className="block py-1 px-2 text-[13px] text-gray-600 hover:text-qb-green hover:bg-gray-50 rounded transition-colors"
              >
                {bm.label}
              </Link>
            ))}
          </div>

          {/* Menu section */}
          <div className="pt-2 pb-4">
            <div className="flex items-center justify-between px-4 mb-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Menu</span>
              <Pencil className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            {MENU_ITEMS.map(item => (
              <SidebarMenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-100 p-3">
          <button className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
            Menu settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={clsx(
        'flex-1 flex flex-col min-w-0 transition-all duration-200',
        sidebarCollapsed ? 'ml-0' : 'ml-[240px]'
      )}>
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors mr-2"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-800">{data.company?.name || 'Acme Corp'}</span>
          </div>

          <div className="flex items-center space-x-1">
            {/* My Experts */}
            <button
              onClick={() => navigate('/accountant')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="My Experts"
            >
              <Users className="w-[18px] h-[18px] text-gray-500" />
            </button>

            {/* Help */}
            <button
              onClick={() => { window.open('https://quickbooks.intuit.com/learn-support/', '_blank', 'noopener'); }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Help"
            >
              <HelpCircle className="w-[18px] h-[18px] text-gray-500" />
            </button>

            {/* Apps grid */}
            <div className="relative" ref={appsRef}>
              <button
                onClick={() => { setShowAppsMenu(!showAppsMenu); setShowNotifications(false); setShowUserMenu(false); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Apps"
              >
                <Grid3X3 className="w-[18px] h-[18px] text-gray-500" />
              </button>
              {showAppsMenu && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Intuit Apps</p>
                  {[
                    { name: 'XuickBooks', desc: 'Accounting', path: '/' },
                    { name: 'Payroll', desc: 'Employee pay', path: '/payroll' },
                    { name: 'Time Tracking', desc: 'Track hours', path: '/projects' },
                    { name: 'Reports', desc: 'Business insights', path: '/reports' },
                  ].map(app => (
                    <button
                      key={app.name}
                      className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50 text-left"
                      onClick={() => { setShowAppsMenu(false); navigate(app.path); }}
                    >
                      <div className="w-8 h-8 bg-qb-green/10 text-qb-green rounded flex items-center justify-center text-xs font-bold">
                        {app.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{app.name}</div>
                        <div className="text-xs text-gray-500">{app.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Search"
            >
              <Search className="w-[18px] h-[18px] text-gray-500" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-[18px] h-[18px] text-gray-500" />
                {pendingTxCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingTxCount > 9 ? '9+' : pendingTxCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationsDropdown
                  onClose={() => setShowNotifications(false)}
                  notifications={MOCK_NOTIFICATIONS}
                />
              )}
            </div>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Settings"
            >
              <Settings className="w-[18px] h-[18px] text-gray-500" />
            </button>

            {/* User avatar */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold ml-1 cursor-pointer hover:bg-purple-700 transition-colors"
                title="Account"
              >
                A
              </button>
              {showUserMenu && (
                <UserDropdown
                  onClose={() => setShowUserMenu(false)}
                  companyName={data.company?.name || 'Acme Corp'}
                  navigate={navigate}
                />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
