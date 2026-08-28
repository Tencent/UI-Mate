
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  Package,
  Tag,
  Globe,
  Search,
  Bell,
  Code,
  ChevronDown,
  ChevronRight,
  X,
  Megaphone,
  FileText,
  DollarSign,
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, end, badge }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `nav-item ${isActive ? 'active' : ''}`
      }
    >
      <Icon size={20} strokeWidth={1.5} />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto bg-[#e4e5e7] text-[#303030] text-[11px] font-semibold rounded-full px-1.5 min-w-[20px] text-center leading-5">
          {badge}
        </span>
      )}
    </NavLink>
  );
};

const NavSection = ({ title, children }) => (
  <div className="mt-4 pt-4 border-t border-[#e3e3e3]">
    {title && (
      <div className="px-3 py-1 text-xs font-semibold text-[#616161] uppercase tracking-wider">
        {title}
      </div>
    )}
    <div className="space-y-0.5 mt-1">
      {children}
    </div>
  </div>
);

const CollapsibleNav = ({ icon: Icon, label, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="nav-item w-full"
      >
        <Icon size={20} strokeWidth={1.5} />
        <span className="flex-1 text-left">{label}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && (
        <div className="ml-7 space-y-0.5 mt-0.5">
          {children}
        </div>
      )}
    </div>
  );
};

const SubNavItem = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-3 py-1.5 text-[13px] rounded-md transition-colors ${
          isActive
            ? 'text-[#303030] font-medium bg-[#f0f0f0]'
            : 'text-[#616161] hover:text-[#303030] hover:bg-[#f0f0f0]'
        }`
      }
    >
      {label}
    </NavLink>
  );
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef(null);

  // Global search across products, orders, customers
  const searchResults = (() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results = [];

    (state.products || []).forEach(p => {
      if (p.title?.toLowerCase().includes(q) || p.vendor?.toLowerCase().includes(q)) {
        results.push({ type: 'Product', label: p.title, sub: p.vendor, link: `/products/${p.id}` });
      }
    });
    (state.orders || []).forEach(o => {
      if (o.name?.toLowerCase().includes(q) || `${o.customer?.firstName} ${o.customer?.lastName}`.toLowerCase().includes(q)) {
        results.push({ type: 'Order', label: o.name, sub: o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : o.email, link: `/orders/${o.id}` });
      }
    });
    (state.customers || []).forEach(c => {
      if (`${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)) {
        results.push({ type: 'Customer', label: `${c.firstName} ${c.lastName}`, sub: c.email, link: `/customers/${c.id}` });
      }
    });
    return results.slice(0, 8);
  })();

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const recentOrders = (state.orders || [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const storeName = state.store?.name || state.settings?.storeName || 'My Store';

  const unfulfilledCount = (state.orders || []).filter(o => !o.fulfillmentStatus && o.financialStatus === 'paid').length;

  return (
    <div className="flex h-screen" style={{ background: '#f1f1f1' }}>
      {/* Sidebar */}
      <aside
        className="w-[240px] flex flex-col flex-shrink-0 border-r overflow-hidden"
        style={{ background: '#f6f6f7', borderColor: '#e3e3e3' }}
      >
        {/* Store header */}
        <div className="px-3 py-3 flex items-center gap-2 border-b" style={{ borderColor: '#e3e3e3' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#008060' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15.5 4.5L14.5 2.5C14.3 2.2 14 2 13.5 2H6.5C6 2 5.7 2.2 5.5 2.5L4.5 4.5C4.2 5 4 5.5 4 6V16C4 17.1 4.9 18 6 18H14C15.1 18 16 17.1 16 16V6C16 5.5 15.8 5 15.5 4.5Z" fill="white"/>
              <path d="M8 8C8 9.1 8.9 10 10 10C11.1 10 12 9.1 12 8" stroke="#008060" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[#303030] truncate">{storeName}</div>
          </div>
          <ChevronDown size={16} className="text-[#616161] flex-shrink-0" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          <NavItem to="/" icon={LayoutDashboard} label="Home" end />
          <NavItem to="/orders" icon={Package} label="Orders" badge={unfulfilledCount} />
          <NavItem to="/products" icon={ShoppingBag} label="Products" />
          <NavItem to="/customers" icon={Users} label="Customers" />
          <NavItem to="/content" icon={FileText} label="Content" />
          <NavItem to="/analytics" icon={BarChart3} label="Analytics" />
          <NavItem to="/marketing" icon={Megaphone} label="Marketing" />
          <NavItem to="/discounts" icon={Tag} label="Discounts" />

          <NavSection title="Sales channels">
            <CollapsibleNav icon={Globe} label="Online Store" defaultOpen={location.pathname.startsWith('/online-store')}>
              <SubNavItem to="/online-store/themes" label="Themes" />
              <SubNavItem to="/online-store/blog-posts" label="Blog posts" />
              <SubNavItem to="/online-store/pages" label="Pages" />
              <SubNavItem to="/online-store/navigation" label="Navigation" />
              <SubNavItem to="/online-store/preferences" label="Preferences" />
            </CollapsibleNav>
          </NavSection>
        </nav>

        {/* Bottom nav */}
        <div className="border-t px-2 py-2 space-y-0.5" style={{ borderColor: '#e3e3e3' }}>
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header
          className="h-14 flex items-center justify-between px-4 flex-shrink-0 border-b"
          style={{ background: '#ffffff', borderColor: '#e3e3e3' }}
        >
          {/* Center: Search */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-[480px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={16} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search"
                className="w-full pl-9 pr-16 py-[7px] text-[13px] rounded-lg border-0"
                style={{ background: '#f1f1f1' }}
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              />
              {searchQuery ? (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                >
                  <X size={14} className="text-[#616161]" />
                </button>
              ) : (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#616161] border rounded px-1.5 py-0.5"
                  style={{ borderColor: '#d0d0d0', background: '#fff' }}
                >
                  Cmd+K
                </span>
              )}

              {/* Search Results Dropdown */}
              {searchOpen && searchQuery && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border shadow-modal z-40 overflow-hidden"
                  style={{ borderColor: '#e3e3e3' }}
                >
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-[13px] text-[#616161] text-center">No results found for "{searchQuery}"</div>
                  ) : (
                    searchResults.map((r, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#f9fafb] flex items-center gap-3 border-b last:border-0"
                        style={{ borderColor: '#f3f3f3' }}
                        onMouseDown={() => {
                          navigate(r.link);
                          setSearchQuery('');
                          setSearchOpen(false);
                        }}
                      >
                        <span className="badge badge-info text-[11px]">{r.type}</span>
                        <div>
                          <div className="text-[13px] font-medium text-[#303030]">{r.label}</div>
                          {r.sub && <div className="text-[12px] text-[#616161]">{r.sub}</div>}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-3 ml-4 relative">
            <button
              className="relative p-1.5 text-[#616161] hover:bg-[#f1f1f1] rounded-lg transition-colors"
              onClick={() => setShowNotifications(v => !v)}
            >
              <Bell size={20} strokeWidth={1.5} />
              {recentOrders.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#d72c0d] rounded-full"></span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div
                className="absolute top-10 right-8 w-80 bg-white rounded-xl border shadow-modal z-50 overflow-hidden"
                style={{ borderColor: '#e3e3e3' }}
                onBlur={() => setShowNotifications(false)}
              >
                <div className="p-3 border-b font-semibold text-[13px] text-[#303030] flex justify-between" style={{ borderColor: '#e3e3e3' }}>
                  Notifications
                  <button onClick={() => setShowNotifications(false)}><X size={16} className="text-[#616161]" /></button>
                </div>
                <div className="divide-y" style={{ divideColor: '#f3f3f3' }}>
                  {recentOrders.length === 0 ? (
                    <div className="p-4 text-[13px] text-[#616161]">No new notifications</div>
                  ) : (
                    recentOrders.map(order => (
                      <button
                        key={order.id}
                        className="w-full text-left p-3 hover:bg-[#f9fafb] block"
                        onClick={() => { navigate(`/orders/${order.id}`); setShowNotifications(false); }}
                      >
                        <div className="text-[13px] font-medium text-[#303030]">New order {order.name}</div>
                        <div className="text-[12px] text-[#616161]">${parseFloat(order.totalPrice).toFixed(2)} — {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Guest'}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold text-white"
                style={{ background: '#8c6e4f' }}
              >
                AC
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto" style={{ background: '#f1f1f1' }}>
          <div className="max-w-[1000px] mx-auto px-8 py-6 pb-20">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
