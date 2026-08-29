import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Layers, LayoutGrid, FileImage, Users, PieChart, CreditCard, Settings, ChevronRight, ChevronLeft, ChevronDown, Check, Plus, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast';
import './Sidebar.css';

const navItems = [
  { label: 'Account overview', to: '/account-overview', icon: BarChart3 },
  null, // divider
  { label: 'Campaigns', to: '/campaigns', icon: Layers },
  { label: 'Ad sets', to: '/ad-sets', icon: LayoutGrid },
  { label: 'Ads', to: '/ads', icon: FileImage },
  null, // divider
  { label: 'Audiences', to: '/audiences', icon: Users },
  { label: 'Events Manager', to: '/events-manager', icon: Zap },
  { label: 'Reporting', to: '/reporting', icon: PieChart },
  null,
  { label: 'Billing', to: '/billing', icon: CreditCard },
  { label: 'Ad Account Settings', to: '/settings', icon: Settings },
];

const MOCK_ACCOUNTS = [
  { id: 'act_987654321', name: 'Acme Corp Ad Account' },
  { id: 'act_111222333', name: 'TechCorp Ad Account' },
  { id: 'act_555444333', name: 'StartupXYZ' },
];

export default function Sidebar() {
  const { state, setSidebarCollapsed, updateAccount } = useApp();
  const { showToast } = useToast();
  const collapsed = state.sidebarCollapsed;
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const currentAccountId = state.account?.id || MOCK_ACCOUNTS[0].id;
  const currentAccount = MOCK_ACCOUNTS.find(a => a.id === currentAccountId) || MOCK_ACCOUNTS[0];

  useEffect(() => {
    function handler(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectAccount = (acct) => {
    if (acct.id === currentAccountId) { setAccountOpen(false); return; }
    updateAccount({ id: acct.id, name: acct.name });
    showToast(`Switched to ${acct.name}`);
    setAccountOpen(false);
  };

  const handleCreateAccount = () => {
    const newId = `act_${Date.now()}`;
    const newName = `Ad Account ${MOCK_ACCOUNTS.length + 1}`;
    MOCK_ACCOUNTS.push({ id: newId, name: newName });
    updateAccount({ id: newId, name: newName });
    showToast(`Created and switched to ${newName}`);
    setAccountOpen(false);
  };

  return (
    <nav className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar-account" ref={accountRef}>
        {!collapsed && (
          <button
            className="sidebar-account-btn"
            onClick={() => setAccountOpen(v => !v)}
            title="Switch ad account"
          >
            <div className="sidebar-account-info">
              <div className="sidebar-account-name">{state.account.name}</div>
              <div className="sidebar-account-id">{state.account.id}</div>
            </div>
            <ChevronDown size={14} className={`sidebar-account-chevron ${accountOpen ? 'sidebar-account-chevron--open' : ''}`} />
          </button>
        )}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setSidebarCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {accountOpen && !collapsed && (
          <div className="sidebar-account-dropdown">
            <div className="sidebar-account-dropdown-title">Ad Accounts</div>
            {MOCK_ACCOUNTS.map(acct => (
              <button
                key={acct.id}
                className={`sidebar-account-option ${acct.id === currentAccountId ? 'sidebar-account-option--active' : ''}`}
                onClick={() => handleSelectAccount(acct)}
              >
                <div className="sidebar-account-option-info">
                  <div className="sidebar-account-option-name">{acct.name}</div>
                  <div className="sidebar-account-option-id">{acct.id}</div>
                </div>
                {acct.id === currentAccountId && <Check size={14} color="#0866FF" />}
              </button>
            ))}
            <div className="sidebar-account-dropdown-divider" />
            <button className="sidebar-account-create" onClick={handleCreateAccount}>
              <Plus size={14} />
              <span>Create new account</span>
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-nav">
        {navItems.map((item, i) => {
          if (!item) return <div key={i} className="sidebar-divider" />;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="sidebar-item-icon" />
              {!collapsed && <span className="sidebar-item-label">{item.label}</span>}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
