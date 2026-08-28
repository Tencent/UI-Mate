import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users, Briefcase, BarChart2, Mail, Globe, FileText, Zap,
  ChevronRight, Settings, Bell, Search, X, LogOut, User,
  CreditCard, LayoutDashboard, List, Share2, Radio, MousePointer,
  Layout, Megaphone, Activity, Database, BookOpen, ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV_SECTIONS = [
  {
    id: 'crm',
    label: 'CRM',
    icon: Users,
    items: [
      { label: 'Contacts', path: '/contacts', icon: Users },
      { label: 'Companies', path: '/companies', icon: Briefcase },
      { label: 'Deals', path: '/deals', icon: BarChart2 },
      { label: 'Lists', path: '/lists', icon: List }
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    items: [
      { label: 'Campaigns', path: '/marketing/campaigns', icon: Activity },
      { label: 'Email', path: '/marketing/email', icon: Mail },
      { label: 'Social', path: '/marketing/social', icon: Share2 },
      { label: 'Ads', path: '/marketing/ads', icon: Radio },
      { label: 'Forms', path: '/marketing/forms', icon: FileText },
      { label: 'CTAs', path: '/marketing/ctas', icon: MousePointer }
    ]
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    items: [
      { label: 'Landing Pages', path: '/marketing/landing-pages', icon: Layout },
      { label: 'Website Pages', path: '/marketing/landing-pages', icon: Globe }
    ]
  },
  {
    id: 'automations',
    label: 'Automations',
    icon: Zap,
    items: [
      { label: 'Workflows', path: '/automations/workflows', icon: Zap }
    ]
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: BarChart2,
    items: [
      { label: 'Dashboards', path: '/reports/dashboards', icon: LayoutDashboard },
      { label: 'Analytics', path: '/reports/analytics', icon: BarChart2 }
    ]
  }
];

export default function Sidebar({ collapsed, onToggle }) {
  const [activeSection, setActiveSection] = useState(null);
  const [flyoutPos, setFlyoutPos] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const sectionRefs = useRef({});
  const { state } = useApp();

  const handleSectionClick = (sectionId, e) => {
    if (activeSection === sectionId) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionId);
      const el = sectionRefs.current[sectionId];
      if (el) {
        setFlyoutPos(el.getBoundingClientRect().top);
      }
    }
  };

  const handleItemClick = (path) => {
    navigate(path);
    setActiveSection(null);
  };

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getSectionActive = (section) => {
    return section.items.some(item => isActivePath(item.path));
  };

  // Close flyout on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.sidebar') && !e.target.closest('.sidebar-flyout')) {
        setActiveSection(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const flyoutSection = NAV_SECTIONS.find(s => s.id === activeSection);

  return (
    <>
      <div
        className="sidebar"
        style={{
          width: collapsed ? 56 : 240,
          minWidth: collapsed ? 56 : 240,
          height: '100vh',
          background: 'var(--hs-sidebar-bg)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          transition: 'width 0.2s ease',
          overflowX: 'hidden'
        }}
      >
        {/* Logo area */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            flexShrink: 0
          }}
          onClick={() => navigate('/')}
        >
          <SprocketIcon />
          {!collapsed && (
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginLeft: 10 }}>
              HubSpot
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
          {/* Dashboard */}
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            collapsed={collapsed}
            active={location.pathname === '/'}
            onClick={() => { navigate('/'); setActiveSection(null); }}
          />
          <div style={{ height: 8 }} />
          {NAV_SECTIONS.map(section => {
            const SectionIcon = section.icon;
            const isActive = getSectionActive(section);
            const isOpen = activeSection === section.id;
            return (
              <div
                key={section.id}
                ref={el => sectionRefs.current[section.id] = el}
              >
                <NavItem
                  icon={SectionIcon}
                  label={section.label}
                  collapsed={collapsed}
                  active={isActive}
                  isOpen={isOpen}
                  hasChildren
                  onClick={(e) => handleSectionClick(section.id, e)}
                />
              </div>
            );
          })}
        </nav>

        {/* Bottom: settings */}
        <div style={{ padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <NavItem
            icon={Settings}
            label="Settings"
            collapsed={collapsed}
            active={location.pathname === '/settings'}
            onClick={() => { navigate('/settings'); setActiveSection(null); }}
          />
        </div>
      </div>

      {/* Flyout sub-menu */}
      {flyoutSection && (
        <div
          className="sidebar-flyout"
          style={{
            position: 'fixed',
            left: collapsed ? 56 : 240,
            top: 0,
            bottom: 0,
            width: 220,
            background: '#fff',
            boxShadow: '4px 0 16px rgba(0,0,0,0.12)',
            zIndex: 49,
            borderLeft: '1px solid var(--hs-border)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            borderBottom: '1px solid var(--hs-border)',
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--hs-text-primary)'
          }}>
            {flyoutSection.label}
          </div>
          <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
            {flyoutSection.items.map(item => {
              const ItemIcon = item.icon;
              const active = isActivePath(item.path);
              return (
                <div
                  key={item.path + item.label}
                  onClick={() => handleItemClick(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 16px',
                    cursor: 'pointer',
                    background: active ? 'var(--hs-table-selected)' : 'transparent',
                    color: active ? 'var(--hs-teal)' : 'var(--hs-text-primary)',
                    fontSize: 14,
                    borderLeft: active ? '3px solid var(--hs-teal)' : '3px solid transparent',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--hs-table-hover)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <ItemIcon size={16} />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Flyout overlay */}
      {flyoutSection && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 48 }}
          onClick={() => setActiveSection(null)}
        />
      )}
    </>
  );
}

function NavItem({ icon: Icon, label, collapsed, active, isOpen, hasChildren, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 10,
        padding: collapsed ? '10px 0' : '9px 16px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        cursor: 'pointer',
        background: active ? 'var(--hs-sidebar-active)' : isOpen ? 'var(--hs-sidebar-hover)' : 'transparent',
        borderLeft: active ? '3px solid var(--hs-orange)' : '3px solid transparent',
        color: '#fff',
        fontSize: 14,
        transition: 'background 0.1s',
        position: 'relative',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--hs-sidebar-hover)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'var(--hs-sidebar-active)' : isOpen ? 'var(--hs-sidebar-hover)' : 'transparent'; }}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      {!collapsed && (
        <>
          <span style={{ flex: 1 }}>{label}</span>
          {hasChildren && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
        </>
      )}
    </div>
  );
}

function SprocketIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="#FF7A59" />
      <text x="14" y="19" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">H</text>
    </svg>
  );
}
