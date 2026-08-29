import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart2,
  Settings, Tag, Megaphone, Globe, FileText, Image, MessageSquare,
  Palette, Plug, UserCog, Wrench, ChevronRight, ChevronDown,
  PanelLeftClose, PanelLeft, Percent
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', submenu: [
    { label: 'Home', path: '/' },
    { label: 'Updates', path: '/wp/updates', badge: 3 },
  ]},
  { id: 'posts', label: 'Posts', icon: FileText, path: '/wp/posts', submenu: [] },
  { id: 'media', label: 'Media', icon: Image, path: '/wp/media', submenu: [] },
  { id: 'pages', label: 'Pages', icon: FileText, path: '/wp/pages', submenu: [] },
  { id: 'comments', label: 'Comments', icon: MessageSquare, path: '/wp/comments', badge: 2, submenu: [] },
  { id: 'separator1', separator: true },
  { id: 'xoocommerce', label: 'XooCommerce', icon: null, isWC: true, path: '/woocommerce', submenu: [
    { label: 'Home', path: '/' },
    { label: 'Orders', path: '/orders' },
    { label: 'Customers', path: '/customers' },
    { label: 'Coupons', path: '/coupons' },
    { label: 'Settings', path: '/settings/general' },
  ]},
  { id: 'products', label: 'Products', icon: Package, path: '/products', submenu: [
    { label: 'All Products', path: '/products' },
    { label: 'Add New', path: '/products/new' },
    { label: 'Categories', path: '/products/categories' },
    { label: 'Tags', path: '/products/tags' },
  ]},
  { id: 'analytics', label: 'Analytics', icon: BarChart2, path: '/analytics/revenue', submenu: [
    { label: 'Revenue', path: '/analytics/revenue' },
    { label: 'Orders', path: '/analytics/orders' },
    { label: 'Products', path: '/analytics/products' },
    { label: 'Categories', path: '/analytics/categories' },
    { label: 'Coupons', path: '/analytics/coupons' },
    { label: 'Taxes', path: '/analytics/taxes' },
    { label: 'Downloads', path: '/analytics/downloads' },
    { label: 'Stock', path: '/analytics/stock' },
    { label: 'Customers', path: '/analytics/customers' },
    { label: 'Settings', path: '/analytics/settings' },
  ]},
  { id: 'marketing', label: 'Marketing', icon: Megaphone, path: '/wp/marketing', submenu: [
    { label: 'Overview', path: '/wp/marketing' },
    { label: 'Coupons', path: '/coupons' },
  ]},
  { id: 'separator2', separator: true },
  { id: 'appearance', label: 'Appearance', icon: Palette, path: '/wp/appearance', submenu: [] },
  { id: 'plugins', label: 'Plugins', icon: Plug, path: '/wp/plugins', submenu: [] },
  { id: 'users', label: 'Users', icon: UserCog, path: '/wp/users', submenu: [] },
  { id: 'tools', label: 'Tools', icon: Wrench, path: '/wp/tools', submenu: [] },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings/general', submenu: [] },
]

const WCIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect width="20" height="20" rx="2" fill="#7f54b3"/>
    <text x="10" y="14" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">W</text>
  </svg>
)

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [openMenus, setOpenMenus] = useState(() => {
    const path = location.pathname
    const open = {}
    for (const item of menuItems) {
      if (item.submenu && item.submenu.length > 0) {
        if (item.path === path || item.submenu.some(s => path.startsWith(s.path) && s.path !== '/') || (item.path === '/' && path === '/')) {
          open[item.id] = true
        }
      }
    }
    return open
  })

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const isMenuActive = (item) => {
    if (!item.submenu || item.submenu.length === 0) return isActive(item.path)
    return item.submenu.some(s => isActive(s.path))
  }

  const toggleMenu = (id) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleNavClick = (item) => {
    if (item.submenu && item.submenu.length > 0) {
      if (!collapsed) {
        toggleMenu(item.id)
      }
    }
    if (item.path) {
      const sid = new URL(window.location.href).searchParams.get('sid')
      const target = sid ? `${item.path}?sid=${sid}` : item.path
      navigate(target)
    }
  }

  const handleSubmenuClick = (path) => {
    const sid = new URL(window.location.href).searchParams.get('sid')
    const target = sid ? `${path}?sid=${sid}` : path
    navigate(target)
  }

  return (
    <nav className={`wp-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <ul className="wp-sidebar-menu">
        {menuItems.map(item => {
          if (item.separator) {
            return <li key={item.id} className="wp-sidebar-separator" />
          }

          const active = isMenuActive(item)
          const isOpen = openMenus[item.id]

          return (
            <li key={item.id} className={`wp-sidebar-item ${isOpen ? 'open' : ''}`}>
              <button
                className={`wp-sidebar-link ${active ? 'active' : ''} ${item.isWC ? 'wc-active' : ''}`}
                onClick={() => handleNavClick(item)}
                title={collapsed ? item.label : ''}
              >
                <span className="wp-sidebar-icon">
                  {item.isWC ? <WCIcon /> : item.icon ? <item.icon size={16} /> : null}
                </span>
                <span className="wp-sidebar-label">{item.label}</span>
                {item.badge && !collapsed && (
                  <span style={{ background: '#d63638', color: '#fff', fontSize: '10px', borderRadius: '10px', padding: '1px 5px', marginLeft: 'auto' }}>
                    {item.badge}
                  </span>
                )}
                {item.submenu && item.submenu.length > 0 && !collapsed && (
                  <span style={{ marginLeft: 'auto', opacity: 0.6 }}>
                    {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </span>
                )}
              </button>
              {item.submenu && item.submenu.length > 0 && !collapsed && (
                <ul className="wp-sidebar-submenu">
                  {item.submenu.map(sub => (
                    <li key={sub.path}>
                      <button
                        className={`wp-sidebar-submenu-link ${isActive(sub.path) && !(sub.path === '/' && location.pathname !== '/') ? 'active' : ''}`}
                        onClick={() => handleSubmenuClick(sub.path)}
                        style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                      >
                        {sub.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
      <button className="wp-sidebar-collapse-btn" onClick={onToggleCollapse} title={collapsed ? 'Expand menu' : 'Collapse menu'}>
        <span className="wp-sidebar-icon">
          {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
        </span>
        <span className="wp-sidebar-label">Collapse menu</span>
      </button>
    </nav>
  )
}
