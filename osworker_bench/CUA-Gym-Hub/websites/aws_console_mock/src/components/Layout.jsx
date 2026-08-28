import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, ChevronDown, ChevronRight, X, Server, HardDrive, Database, Zap, Shield, DollarSign, RefreshCw, Settings, Star, Info } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import FlashMessages from './FlashMessages';

const REGIONS = [
  { group: 'US East', regions: [
    { name: 'US East (N. Virginia)', code: 'us-east-1' },
    { name: 'US East (Ohio)', code: 'us-east-2' },
  ]},
  { group: 'US West', regions: [
    { name: 'US West (N. California)', code: 'us-west-1' },
    { name: 'US West (Oregon)', code: 'us-west-2' },
  ]},
  { group: 'Asia Pacific', regions: [
    { name: 'Asia Pacific (Mumbai)', code: 'ap-south-1' },
    { name: 'Asia Pacific (Singapore)', code: 'ap-southeast-1' },
    { name: 'Asia Pacific (Sydney)', code: 'ap-southeast-2' },
    { name: 'Asia Pacific (Tokyo)', code: 'ap-northeast-1' },
  ]},
  { group: 'Europe', regions: [
    { name: 'Europe (Frankfurt)', code: 'eu-central-1' },
    { name: 'Europe (Ireland)', code: 'eu-west-1' },
    { name: 'Europe (London)', code: 'eu-west-2' },
  ]},
  { group: 'South America', regions: [
    { name: 'South America (Sao Paulo)', code: 'sa-east-1' },
  ]},
];

const REGION_DISPLAY = {};
REGIONS.forEach(g => g.regions.forEach(r => { REGION_DISPLAY[r.code] = r.name.match(/\(([^)]+)\)/)?.[1] || r.code; }));

const SERVICE_CATEGORIES = [
  { name: 'Compute', items: [
    { id: 'ec2', name: 'EC2', path: '/ec2', icon: Server, color: '#FF9900' },
    { id: 'lambda', name: 'Lambda', path: '/lambda', icon: Zap, color: '#FF9900' },
  ]},
  { name: 'Storage', items: [
    { id: 's3', name: 'S3', path: '/s3', icon: HardDrive, color: '#3ECF8E' },
  ]},
  { name: 'Database', items: [
    { id: 'rds', name: 'RDS', path: '/rds', icon: Database, color: '#3B48CC' },
  ]},
  { name: 'Security, Identity, & Compliance', items: [
    { id: 'iam', name: 'IAM', path: '/iam', icon: Shield, color: '#D13212' },
  ]},
  { name: 'Cloud Financial Management', items: [
    { id: 'billing', name: 'Billing', path: '/billing', icon: DollarSign, color: '#1D8102' },
  ]},
];

const ALL_SERVICES = SERVICE_CATEGORIES.flatMap(c => c.items);

const SIDEBAR_CONFIG = {
  '/': [
    { label: 'Recently visited', path: '/', section: true },
    { label: 'All services', path: '/' },
  ],
  '/ec2': [
    { label: 'Dashboard', path: '/ec2' },
    { label: 'Instances', path: '/ec2' },
    { label: 'Instance Types', path: '/local/ec2/instance-types' },
    { label: 'Launch Templates', path: '/local/ec2/launch-templates' },
    { label: 'AMIs', path: '/local/ec2/amis' },
    { label: 'Volumes', path: '/local/ec2/volumes' },
    { label: 'Snapshots', path: '/local/ec2/snapshots' },
    { label: 'Security Groups', path: '/ec2/security-groups' },
    { label: 'Key Pairs', path: '/ec2/key-pairs' },
    { label: 'Elastic IPs', path: '/local/ec2/elastic-ips' },
    { label: 'Load Balancers', path: '/local/ec2/load-balancers' },
    { label: 'Target Groups', path: '/local/ec2/target-groups' },
    { label: 'Auto Scaling Groups', path: '/local/ec2/auto-scaling-groups' },
  ],
  '/s3': [
    { label: 'Buckets', path: '/s3' },
    { label: 'Access Points', path: '/local/s3/access-points' },
    { label: 'Batch Operations', path: '/local/s3/batch-operations' },
    { label: 'Storage Lens', path: '/local/s3/storage-lens' },
  ],
  '/lambda': [
    { label: 'Dashboard', path: '/local/lambda/dashboard' },
    { label: 'Functions', path: '/lambda' },
    { label: 'Applications', path: '/local/lambda/applications' },
    { label: 'Layers', path: '/local/lambda/layers' },
  ],
  '/rds': [
    { label: 'Dashboard', path: '/local/rds/dashboard' },
    { label: 'Databases', path: '/rds' },
    { label: 'Query Editor', path: '/local/rds/query-editor' },
    { label: 'Performance Insights', path: '/local/rds/performance-insights' },
    { label: 'Snapshots', path: '/local/rds/snapshots' },
    { label: 'Automated backups', path: '/local/rds/automated-backups' },
    { label: 'Subnet groups', path: '/local/rds/subnet-groups' },
    { label: 'Parameter groups', path: '/local/rds/parameter-groups' },
  ],
  '/iam': [
    { label: 'Dashboard', path: '/iam' },
    { label: 'Users', path: '/iam/users' },
    { label: 'User groups', path: '/iam/groups' },
    { label: 'Roles', path: '/iam/roles' },
    { label: 'Policies', path: '/iam/policies' },
    { label: 'Identity providers', path: '/local/iam/identity-providers' },
    { label: 'Account settings', path: '/local/iam/account-settings' },
  ],
  '/billing': [
    { label: 'Home', path: '/billing' },
    { label: 'Bills', path: '/local/billing/bills' },
    { label: 'Cost Explorer', path: '/billing/cost-explorer' },
    { label: 'Budgets', path: '/local/billing/budgets' },
    { label: 'Payment methods', path: '/local/billing/payment-methods' },
    { label: 'Tax settings', path: '/local/billing/tax-settings' },
  ],
};

function getSidebarItems(pathname) {
  if (pathname === '/go') return [];
  for (const prefix of ['/ec2', '/s3', '/lambda', '/rds', '/iam', '/billing']) {
    if (pathname.startsWith(prefix)) return SIDEBAR_CONFIG[prefix] || [];
  }
  return SIDEBAR_CONFIG['/'] || [];
}

function getServiceName(pathname) {
  if (pathname.startsWith('/ec2')) return 'EC2';
  if (pathname.startsWith('/s3')) return 'S3';
  if (pathname.startsWith('/lambda')) return 'Lambda';
  if (pathname.startsWith('/rds')) return 'RDS';
  if (pathname.startsWith('/iam')) return 'IAM';
  if (pathname.startsWith('/billing')) return 'Billing';
  if (pathname === '/go') return 'State Inspector';
  return null;
}

function getPageName(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return null;
  const last = segments[segments.length - 1];
  const map = {
    'security-groups': 'Security Groups',
    'key-pairs': 'Key Pairs',
    'users': 'Users',
    'groups': 'User Groups',
    'roles': 'Roles',
    'policies': 'Policies',
    'cost-explorer': 'Cost Explorer',
  };
  return map[last] || decodeURIComponent(last);
}

export default function Layout({ children }) {
  const { state, dispatch } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const accountRef = useRef(null);
  const regionRef = useRef(null);

  const unreadCount = state.notifications.filter(n => !n.read).length;
  const sidebarItems = getSidebarItems(location.pathname);
  const serviceName = getServiceName(location.pathname);
  const pageName = getPageName(location.pathname);
  const showSidebar = location.pathname !== '/go';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (regionRef.current && !regionRef.current.contains(e.target)) setRegionOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut Alt+S for search
  useEffect(() => {
    const handleKey = (e) => {
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const HELP_CONTENT = {
    '/': {
      title: 'XWS Console Help',
      content: 'Welcome to the XWS Management Console. Use the navigation to explore services like EC2, S3, Lambda, RDS, IAM, and Billing. You can search for services using the search bar or browse all services via the Services menu.',
      links: [
        { label: 'Getting Started with AWS', topic: 'getting-started' },
        { label: 'AWS Documentation', topic: 'aws-documentation' },
        { label: 'AWS Pricing', topic: 'aws-pricing' },
        { label: 'AWS Free Tier', topic: 'aws-free-tier' },
        { label: 'AWS Support', topic: 'aws-support' },
      ]
    },
    '/ec2': {
      title: 'Amazon EC2',
      content: 'Amazon Elastic Compute Cloud (Amazon EC2) provides resizable compute capacity in the cloud. It is designed to make web-scale cloud computing easier for developers. Amazon EC2 reduces the time required to obtain and boot new server instances to minutes, allowing you to quickly scale capacity, both up and down, as your computing requirements change.',
      links: [
        { label: 'EC2 User Guide', topic: 'ec2-user-guide' },
        { label: 'Instance Types', topic: 'ec2-instance-types' },
        { label: 'Security Groups', topic: 'ec2-security-groups-guide' },
        { label: 'Key Pairs', topic: 'ec2-key-pairs-guide' },
        { label: 'Pricing', topic: 'pricing' },
      ]
    },
    '/s3': {
      title: 'Amazon S3',
      content: 'Amazon Simple Storage Service (Amazon S3) is an object storage service offering industry-leading scalability, data availability, security, and performance. You can use Amazon S3 to store and retrieve any amount of data at any time, from anywhere on the web.',
      links: [
        { label: 'S3 User Guide', topic: 's3-user-guide' },
        { label: 'Bucket Policies', topic: 's3-bucket-policies' },
        { label: 'Access Control Lists', topic: 's3-acls' },
        { label: 'Versioning', topic: 's3-versioning' },
        { label: 'Pricing', topic: 'pricing' },
      ]
    },
    '/lambda': {
      title: 'AWS Lambda',
      content: 'AWS Lambda lets you run code without provisioning or managing servers. You pay only for the compute time you consume. With Lambda, you can run code for virtually any type of application or backend service. Just upload your code and Lambda takes care of everything required to run and scale your code with high availability.',
      links: [
        { label: 'Lambda Developer Guide', topic: 'lambda-developer-guide' },
        { label: 'Function Configuration', topic: 'lambda-function-config' },
        { label: 'Triggers', topic: 'lambda-triggers' },
        { label: 'Layers', topic: 'lambda-layers' },
        { label: 'Pricing', topic: 'pricing' },
      ]
    },
    '/rds': {
      title: 'Amazon RDS',
      content: 'Amazon Relational Database Service (Amazon RDS) makes it easy to set up, operate, and scale a relational database in the cloud. It provides cost-efficient and resizable capacity while automating time-consuming administration tasks such as hardware provisioning, database setup, patching and backups.',
      links: [
        { label: 'RDS User Guide', topic: 'rds-user-guide' },
        { label: 'DB Instance Classes', topic: 'rds-instance-classes' },
        { label: 'Multi-AZ Deployments', topic: 'rds-multi-az' },
        { label: 'Read Replicas', topic: 'rds-read-replicas' },
        { label: 'Pricing', topic: 'pricing' },
      ]
    },
    '/iam': {
      title: 'AWS IAM',
      content: 'AWS Identity and Access Management (IAM) enables you to manage access to AWS services and resources securely. Using IAM, you can create and manage AWS users and groups, and use permissions to allow and deny their access to AWS resources.',
      links: [
        { label: 'IAM User Guide', topic: 'iam-user-guide' },
        { label: 'Policies and Permissions', topic: 'iam-policies' },
        { label: 'Roles', topic: 'iam-roles-guide' },
        { label: 'Best Practices', topic: 'iam-best-practices' },
        { label: 'Access Analyzer', topic: 'iam-access-analyzer' },
      ]
    },
    '/billing': {
      title: 'AWS Billing',
      content: 'AWS Billing and Cost Management is the service that you use to pay your AWS bill, monitor your usage, and analyze and control your costs. AWS automatically charges the credit card that you provided when you signed up for a new account with AWS.',
      links: [
        { label: 'Billing User Guide', topic: 'billing-user-guide' },
        { label: 'Cost Explorer', topic: 'billing-user-guide' },
        { label: 'Budgets', topic: 'billing-budgets' },
        { label: 'Cost Allocation Tags', topic: 'billing-cost-tags' },
        { label: 'Pricing', topic: 'pricing' },
      ]
    },
  };

  const helpContent = (() => {
    for (const prefix of ['/ec2', '/s3', '/lambda', '/rds', '/iam', '/billing']) {
      if (location.pathname.startsWith(prefix)) return HELP_CONTENT[prefix];
    }
    return HELP_CONTENT['/'];
  })();

  const searchResults = searchQuery.trim()
    ? ALL_SERVICES.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchNav = (path) => {
    navigate(path);
    setSearchQuery('');
    setSearchFocused(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchNav(searchResults[0].path);
    }
  };

  const filteredCategories = menuSearch.trim()
    ? SERVICE_CATEGORIES.map(cat => ({
        ...cat,
        items: cat.items.filter(i => i.name.toLowerCase().includes(menuSearch.toLowerCase()))
      })).filter(cat => cat.items.length > 0)
    : SERVICE_CATEGORIES;

  return (
    <div className="min-h-screen flex flex-col bg-aws-bg">
      {/* Top Navigation Bar */}
      <header className="bg-aws-squid text-white h-12 flex items-center px-4 justify-between z-50 fixed w-full top-0" style={{ minHeight: 48 }}>
        <div className="flex items-center gap-3">
          {/* AWS Logo */}
          <Link to="/" className="flex items-center gap-1 hover:opacity-80 mr-1">
            <svg viewBox="0 0 60 36" className="h-6" style={{ width: 42 }}>
              <text x="2" y="22" fill="white" fontSize="22" fontWeight="bold" fontFamily="'Helvetica Neue', Arial, sans-serif">aws</text>
              <path d="M5 28 Q30 36 55 28" stroke="#FF9900" fill="none" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </Link>

          {/* Services Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1 text-sm hover:text-aws-orange transition-colors px-2 py-1"
          >
            Services <ChevronDown size={12} />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search for services, features, blogs, docs, and more"
              className="w-full text-white text-sm pl-9 pr-16 py-1.5 focus:outline-none focus:ring-1 focus:ring-aws-orange placeholder-gray-400"
              style={{ background: '#1B2A3B', border: '1px solid #4a5568', borderRadius: 2 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">[Alt+S]</span>
          </div>
          {/* Search Results Dropdown */}
          {searchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white text-aws-text shadow-lg border border-aws-border z-50 max-h-80 overflow-y-auto" style={{ borderRadius: 2 }}>
              <div className="px-3 py-2 text-xs font-bold text-aws-text-secondary uppercase border-b">Services</div>
              {searchResults.map(s => (
                <button
                  key={s.id}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 text-left"
                  onMouseDown={() => handleSearchNav(s.path)}
                >
                  <s.icon size={16} style={{ color: s.color }} />
                  <span className="text-sm font-medium text-aws-blue">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Right Cluster */}
        <div className="flex items-center gap-1 text-sm">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setAccountOpen(false); setRegionOpen(false); }}
              className="relative p-2 hover:text-aws-orange transition-colors"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-aws-orange text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ fontSize: 10 }}>
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-1 w-96 bg-white text-aws-text shadow-xl border border-aws-border z-50 max-h-96 overflow-y-auto" style={{ borderRadius: 2 }}>
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="font-bold text-sm">Notifications ({unreadCount} unread)</span>
                  <button
                    className="text-xs text-aws-blue hover:underline"
                    onClick={() => {
                      state.notifications.forEach(n => {
                        if (!n.read) dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id });
                      });
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
                {state.notifications.length === 0 ? (
                  <div className="p-6 text-center text-aws-text-secondary text-sm">No notifications</div>
                ) : (
                  state.notifications.map(n => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-blue-50/30' : ''}`}
                      onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
                    >
                      {!n.read && <div className="w-2 h-2 rounded-full bg-aws-blue mt-1.5 flex-shrink-0" />}
                      {n.read && <div className="w-2 h-2 mt-1.5 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{n.title}</div>
                        <div className="text-xs text-aws-text-secondary truncate">{n.message}</div>
                        <div className="text-xs text-aws-text-disabled mt-1">{n.service} &middot; {new Date(n.timestamp).toLocaleDateString()}</div>
                      </div>
                      <button
                        className="text-aws-text-disabled hover:text-aws-error flex-shrink-0"
                        onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id }); }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Help */}
          <button
            className="p-2 hover:text-aws-orange transition-colors"
            onClick={() => helpContent && setInfoOpen(true)}
            title={helpContent ? `Help: ${helpContent.title}` : 'Help'}
          >
            <HelpCircle size={16} />
          </button>

          {/* Account Dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => { setAccountOpen(!accountOpen); setNotifOpen(false); setRegionOpen(false); }}
              className="flex items-center gap-1 px-2 py-1 hover:text-aws-orange transition-colors"
            >
              <span className="text-sm">{state.user.name}</span>
              <ChevronDown size={12} />
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-white text-aws-text shadow-xl border border-aws-border z-50" style={{ borderRadius: 2 }}>
                <div className="px-4 py-3 border-b bg-gray-50">
                  <div className="text-xs text-aws-text-secondary">Account ID</div>
                  <div className="font-mono text-sm">{state.user.accountId}</div>
                  <div className="text-xs text-aws-text-secondary mt-1">{state.user.accountAlias}</div>
                </div>
                <div className="py-1">
                  <Link to="/billing" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 text-aws-blue">My Account</Link>
                  <Link to="/billing" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 text-aws-blue">My Billing Dashboard</Link>
                  <Link to="/iam" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50 text-aws-blue">My Security Credentials</Link>
                </div>
                <div className="border-t py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-aws-blue"
                    onClick={() => { dispatch({ type: 'ADD_FLASH', payload: { type: 'info', message: 'Switch role draft opened locally' } }); setAccountOpen(false); }}
                  >
                    Switch Role
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-aws-blue"
                    onClick={() => { dispatch({ type: 'ADD_FLASH', payload: { type: 'info', message: 'Signed out of this local sandbox session' } }); setAccountOpen(false); }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Region Selector */}
          <div className="relative" ref={regionRef}>
            <button
              onClick={() => { setRegionOpen(!regionOpen); setNotifOpen(false); setAccountOpen(false); }}
              className="flex items-center gap-1 px-2 py-1 hover:text-aws-orange transition-colors"
            >
              <span className="text-sm">{REGION_DISPLAY[state.user.region] || state.user.region}</span>
              <ChevronDown size={12} />
            </button>
            {regionOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-aws-dark text-white shadow-xl border border-gray-700 z-50 max-h-96 overflow-y-auto" style={{ borderRadius: 2, background: '#1B2A3B' }}>
                {REGIONS.map(group => (
                  <div key={group.group}>
                    <div className="px-3 py-1 text-xs text-gray-400 border-b border-gray-700">{group.group}</div>
                    {group.regions.map(r => (
                      <button
                        key={r.code}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-700 ${state.user.region === r.code ? 'text-aws-orange font-bold' : ''}`}
                        onClick={() => {
                          dispatch({ type: 'SET_REGION', payload: r.code });
                          setRegionOpen(false);
                        }}
                      >
                        <span>{r.name}</span>
                        <span className="text-xs text-gray-400 font-mono">{r.code}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Services Mega Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-12 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-white shadow-xl border-r border-aws-border overflow-y-auto" style={{ width: 480, height: 'calc(100vh - 48px)' }} onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center gap-3">
              <Search size={16} className="text-gray-400" />
              <input
                className="flex-1 text-sm focus:outline-none"
                placeholder="Search services..."
                value={menuSearch}
                onChange={e => setMenuSearch(e.target.value)}
                autoFocus
              />
              <button onClick={() => setIsMenuOpen(false)}><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-6">
              {filteredCategories.map(cat => (
                <div key={cat.name}>
                  <h3 className="text-xs font-bold text-aws-text-secondary uppercase mb-2">{cat.name}</h3>
                  {cat.items.map(item => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 py-1.5 text-sm text-aws-blue hover:underline"
                    >
                      <item.icon size={14} style={{ color: item.color }} />
                      {item.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 pt-12">
        {/* Contextual Sidebar */}
        {showSidebar && sidebarItems.length > 0 && (
          <aside className="w-56 bg-white border-r border-aws-border flex-shrink-0 overflow-y-auto fixed left-0 top-12" style={{ height: 'calc(100vh - 48px)', width: 220 }}>
            <nav className="py-2">
              {serviceName && (
                <div className="px-4 py-2 text-sm font-bold text-aws-text border-b border-gray-100 mb-1">
                  {serviceName}
                </div>
              )}
              {/* Favorited items at the top */}
              {(state.favorites || []).length > 0 && (
                <>
                  <div className="px-4 py-1 text-xs text-aws-text-disabled uppercase font-bold">Favorites</div>
                  {(state.favorites || []).map(favPath => {
                    const svc = ALL_SERVICES.find(s => s.path === favPath);
                    if (!svc) return null;
                    const isActive = location.pathname.startsWith(svc.path);
                    return (
                      <div key={`fav-${svc.id}`} className="flex items-center group">
                        <Link
                          to={svc.path}
                          className={`aws-sidebar-item flex-1 ${isActive ? 'active' : ''}`}
                        >
                          {svc.name}
                        </Link>
                        <button
                          className="pr-3 text-aws-orange"
                          onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FAVORITE', payload: svc.path }); }}
                        >
                          <Star size={12} fill="#FF9900" />
                        </button>
                      </div>
                    );
                  })}
                  <div className="border-b border-gray-100 my-1" />
                </>
              )}
              {sidebarItems.map((item, idx) => {
                const isActive = item.path === location.pathname ||
                  (item.path === '/ec2' && location.pathname === '/ec2') ||
                  (item.path === '/s3' && location.pathname === '/s3');
                const isFav = (state.favorites || []).includes(item.path);
                return (
                  <div key={idx} className="flex items-center group">
                    <Link
                      to={item.path}
                      className={`aws-sidebar-item flex-1 ${isActive ? 'active' : ''}`}
                    >
                      {item.label}
                    </Link>
                    {item.path && (
                      <button
                        className={`pr-3 transition-opacity ${isFav ? 'text-aws-orange opacity-100' : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-aws-orange'}`}
                        onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FAVORITE', payload: item.path }); }}
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star size={12} fill={isFav ? '#FF9900' : 'none'} />
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto ${showSidebar && sidebarItems.length > 0 ? 'ml-[220px]' : ''}`}>
          {/* Flash Messages */}
          <FlashMessages />

          {/* Breadcrumb */}
          {serviceName && location.pathname !== '/' && (
            <div className="px-6 pt-4 pb-0 flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Link to="/" className="text-aws-blue hover:underline">AWS</Link>
                <ChevronRight size={12} className="text-aws-text-secondary" />
                {pageName ? (
                  <>
                    <Link to={`/${location.pathname.split('/')[1]}`} className="text-aws-blue hover:underline">{serviceName}</Link>
                    <ChevronRight size={12} className="text-aws-text-secondary" />
                    <span className="text-aws-text-secondary">{pageName}</span>
                  </>
                ) : (
                  <span className="text-aws-text-secondary">{serviceName}</span>
                )}
              </div>
              {helpContent && (
                <button
                  className="flex items-center gap-1 text-xs text-aws-blue hover:underline"
                  onClick={() => setInfoOpen(true)}
                >
                  <Info size={14} /> Info
                </button>
              )}
            </div>
          )}

          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Info/Help Side Panel */}
        {infoOpen && helpContent && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setInfoOpen(false)} />
            <aside
              className="fixed right-0 top-12 bg-white border-l border-aws-border shadow-xl z-50 overflow-y-auto"
              style={{ width: 300, height: 'calc(100vh - 48px)', animation: 'slideInRight 0.2s ease-out' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-aws-border bg-gray-50">
                <h3 className="font-bold text-sm">{helpContent.title}</h3>
                <button onClick={() => setInfoOpen(false)} className="text-gray-500 hover:text-aws-text">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-aws-text-secondary leading-relaxed">{helpContent.content}</p>
                <div>
                  <h4 className="font-bold text-xs text-aws-text-secondary uppercase mb-2">Related links</h4>
                  <ul className="space-y-1">
                    {helpContent.links.map(link => (
                      <li key={link.topic}>
                        <button
                          className="text-sm text-aws-blue hover:underline text-left"
                          onClick={() => { setInfoOpen(false); navigate(`/help/${link.topic}`); }}
                        >{link.label}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(300px); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
