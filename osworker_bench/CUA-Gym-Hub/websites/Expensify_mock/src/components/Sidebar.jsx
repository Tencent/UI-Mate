import React from 'react';
import { NavLink, Link, useSearchParams } from 'react-router-dom';
import { MessageCircle, FileText, File, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ mobileOpen, onClose }) {
  const { state } = useApp();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const qs = query ? '?' + query : '';
  const user = state.currentUser;
  const initial = user.firstName ? user.firstName[0] : 'S';
  const unreadCount = (state.inboxItems || []).filter(i => !i.read && !i.hidden).length;

  const navItems = [
    { to: '/inbox', icon: MessageCircle, label: 'Inbox', badge: unreadCount },
    { to: '/expenses', icon: FileText, label: 'Expenses' },
    { to: '/reports', icon: File, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className={'sidebar' + (mobileOpen ? ' sidebar-mobile-open' : '')}>
      <Link to={'/profile' + qs} className="sidebar-avatar-section sidebar-avatar-link" onClick={onClose}>
        <div className="sidebar-avatar">{initial}</div>
        <div className="sidebar-email">{user.email}</div>
      </Link>
      <div className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to + qs}
            className={({ isActive }) => 'sidebar-nav-item' + (isActive ? ' active' : '')}
            onClick={onClose}
          >
            <item.icon className="nav-icon" size={20} />
            <span className="nav-label">{item.label}</span>
            {item.badge > 0 && <span className="inbox-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </div>
      <div className="sidebar-wordmark">Xpensify</div>
    </nav>
  );
}
