import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Calendar, MessageSquare, HelpCircle, User, Settings, Bell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './GlobalNav.css';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { id: 'courses', icon: BookOpen, label: 'Courses', path: null },
  { id: 'groups', icon: Users, label: 'Groups', path: '/groups' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', path: '/calendar' },
  { id: 'inbox', icon: MessageSquare, label: 'Inbox', path: '/conversations' },
];

export default function GlobalNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAppContext();
  const [accountOpen, setAccountOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const accountRef = useRef(null);
  const coursesRef = useRef(null);

  const unreadCount = state.conversations.filter(c => c.workflow_state === 'unread').length;

  const activeCourses = state.courses.filter(c => c.workflow_state === 'available');

  const isActive = (id) => {
    if (id === 'dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    if (id === 'courses') return location.pathname.startsWith('/courses');
    if (id === 'calendar') return location.pathname === '/calendar';
    if (id === 'inbox') return location.pathname === '/conversations';
    if (id === 'groups') return location.pathname === '/groups';
    return false;
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (coursesRef.current && !coursesRef.current.contains(e.target)) setCoursesOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNavClick = (item) => {
    if (item.id === 'courses') {
      navigate('/courses');
      setCoursesOpen(false);
      setAccountOpen(false);
    } else if (item.path) {
      navigate(item.path);
      setAccountOpen(false);
      setCoursesOpen(false);
    }
  };

  return (
    <nav className="global-nav">
      {/* Logo */}
      <button className="nav-item nav-logo" onClick={() => navigate('/dashboard')}>
        <div className="canvas-logo">
          <svg viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="15" fill="#E74C3C" />
            <text x="16" y="22" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" fontFamily="Lato, sans-serif">C</text>
          </svg>
        </div>
      </button>

      {/* Account */}
      <div className="nav-item-wrapper" ref={accountRef}>
        <button
          className={`nav-item ${accountOpen ? 'active' : ''}`}
          onClick={() => { setAccountOpen(!accountOpen); setCoursesOpen(false); }}
        >
          <div className="nav-avatar">
            {state.currentUser.name.charAt(0)}
          </div>
          <span className="nav-label">Account</span>
        </button>
        {accountOpen && (
          <div className="nav-flyout account-flyout">
            <div className="flyout-header">
              <div className="flyout-avatar">{state.currentUser.name.charAt(0)}</div>
              <div>
                <div className="flyout-name">{state.currentUser.name}</div>
                <div className="flyout-email">{state.currentUser.email}</div>
              </div>
            </div>
            <div className="flyout-divider" />
            <button className="flyout-item" onClick={() => { setAccountOpen(false); navigate('/profile'); }}>
              <User size={16} /> Profile
            </button>
            <button className="flyout-item" onClick={() => { setAccountOpen(false); navigate('/account/settings'); }}>
              <Settings size={16} /> Settings
            </button>
            <button className="flyout-item" onClick={() => { setAccountOpen(false); navigate('/notifications'); }}>
              <Bell size={16} /> Notifications
            </button>
          </div>
        )}
      </div>

      {/* Main nav items */}
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        if (item.id === 'courses') {
          return (
            <div className="nav-item-wrapper" key={item.id} ref={coursesRef}>
              <button
                className={`nav-item ${isActive(item.id) ? 'active' : ''}`}
                onClick={() => handleNavClick(item)}
              >
                <div className="nav-icon-wrap">
                  <Icon size={22} />
                </div>
                <span className="nav-label">{item.label}</span>
              </button>
              {coursesOpen && (
                <div className="nav-flyout courses-flyout">
                  <div className="flyout-title">Courses</div>
                  {activeCourses.slice(0, 7).map(course => (
                    <button
                      key={course.id}
                      className="flyout-item flyout-course-item"
                      onClick={() => { setCoursesOpen(false); navigate(`/courses/${course.id}`); }}
                    >
                      <span className="course-dot" style={{ background: course.color }} />
                      <span className="course-name-text">{course.name}</span>
                    </button>
                  ))}
                  <div className="flyout-divider" />
                  <button
                    className="flyout-item flyout-all-courses"
                    onClick={() => { setCoursesOpen(false); navigate('/courses'); }}
                  >
                    All Courses
                  </button>
                </div>
              )}
            </div>
          );
        }

        return (
          <button
            key={item.id}
            className={`nav-item ${isActive(item.id) ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <div className="nav-icon-wrap">
              <Icon size={22} />
              {item.id === 'inbox' && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}

      {/* Spacer */}
      <div className="nav-spacer" />

      {/* Help */}
      <button className="nav-item" onClick={() => {}}>
        <div className="nav-icon-wrap">
          <HelpCircle size={22} />
        </div>
        <span className="nav-label">Help</span>
      </button>
    </nav>
  );
}
