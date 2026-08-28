import React, { useState, useRef, useEffect } from 'react';
import {
  BrowserRouter, Routes, Route, Navigate, Link, NavLink,
  useNavigate, useSearchParams
} from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Home from './pages/Home';
import PeopleDirectory from './pages/PeopleDirectory';
import OrgChart from './pages/OrgChart';
import EmployeeProfile from './pages/EmployeeProfile';
import Hiring from './pages/Hiring';
import HiringDetail from './pages/HiringDetail';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import Go from './pages/Go';
import TimeOffModal from './components/TimeOffModal';
import TimeOff from './pages/TimeOff';
import SettingsPage from './pages/Settings';
import FilesPage from './pages/Files';
import HelpPage from './pages/Help';
import {
  Search, Bell, HelpCircle, Settings, ChevronDown, Menu,
  Plus, User, Megaphone, Calendar, X
} from 'lucide-react';
import './index.css';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

function getAvatarColor(id) {
  const colors = ['#73C41D','#2196F3','#FF5722','#9C27B0','#FF9800','#00BCD4','#795548','#607D8B'];
  return colors[(id || 0) % colors.length];
}

function Avatar({ employee, size = 32, className = '' }) {
  const name = employee ? (employee.preferredName || employee.firstName) + ' ' + employee.lastName : '?';
  const initials = getInitials(name);
  const bg = getAvatarColor(employee?.id || 0);
  return (
    <div
      className={`avatar ${className}`}
      style={{
        width: size, height: size, background: bg,
        fontSize: size < 40 ? 11 : size < 60 ? 14 : 20
      }}
    >
      {initials}
    </div>
  );
}

function NotificationPanel({ onClose }) {
  const { state, dispatch } = useApp();
  const notifications = state.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  function handleClick(n) {
    dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id });
    onClose();
    const sid = searchParams.get('sid');
    const url = sid ? `${n.linkTo}?sid=${sid}` : n.linkTo;
    navigate(url);
  }

  function markAllRead() {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  }

  function relTime(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  return (
    <div style={{
      position: 'absolute', top: '56px', right: '50px', width: '380px',
      maxHeight: '480px', background: 'white', border: '1px solid #E0E0E0',
      borderRadius: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      zIndex: 500, overflow: 'hidden', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Notifications</span>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ color: '#73C41D', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
            Mark All Read
          </button>
        )}
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>No notifications</div>
        ) : notifications.map(n => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            style={{
              padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start',
              borderLeft: n.isRead ? '3px solid transparent' : '3px solid #73C41D',
              background: n.isRead ? 'white' : '#f8fdf6',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: '#edf8e0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Bell size={14} color="#73C41D" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: '#333', lineHeight: 1.4, marginBottom: 3 }}>
                {n.message}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#999' }}>{relTime(n.timestamp)}</span>
                {n.isPastDue && <span className="badge badge-past-due">PAST DUE</span>}
              </div>
            </div>
            {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#73C41D', marginTop: 4, flexShrink: 0 }} />}
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid #E0E0E0', textAlign: 'center' }}>
        <Link to="/" style={{ fontSize: 13, color: '#73C41D' }} onClick={onClose}>View All Notifications</Link>
      </div>
    </div>
  );
}

function GlobalSearch({ onClose }) {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = query.length >= 2
    ? (state.employees || []).filter(e => {
        const q = query.toLowerCase();
        const dept = state.departments.find(d => d.id === e.departmentId);
        return (
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q) ||
          e.displayName.toLowerCase().includes(q) ||
          (e.jobTitle || '').toLowerCase().includes(q) ||
          (dept?.name || '').toLowerCase().includes(q) ||
          (e.email || '').toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  function handleSelect(emp) {
    const sid = searchParams.get('sid');
    const url = sid ? `/people/${emp.id}?sid=${sid}` : `/people/${emp.id}`;
    navigate(url);
    onClose();
  }

  return (
    <div style={{
      position: 'absolute', top: '56px', right: '10px', width: '400px',
      background: 'white', border: '1px solid #E0E0E0', borderRadius: '4px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 500
    }}>
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #E0E0E0' }}>
        <Search size={16} color="#999" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search employees..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#333' }}
        />
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}><X size={14} /></button>
      </div>
      {query.length >= 2 && (
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>No results found</div>
          ) : results.map(emp => {
            const dept = state.departments.find(d => d.id === emp.departmentId);
            return (
              <div
                key={emp.id}
                onClick={() => handleSelect(emp)}
                style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <Avatar employee={emp} size={32} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{emp.displayName}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{emp.jobTitle} · {dept?.name || ''}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AnnouncementModal({ onClose }) {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!body.trim()) { setError('Body is required.'); return; }
    const announcements = state.announcements || [];
    const nextId = Math.max(0, ...announcements.map(a => a.id)) + 1;
    dispatch({
      type: 'ADD_ANNOUNCEMENT',
      announcement: {
        id: nextId,
        title: title.trim(),
        body: body.trim(),
        isPinned,
        authorId: state.currentUser?.employeeId || 1,
        createdAt: new Date().toISOString()
      }
    });
    const notifs = state.notifications || [];
    const nextNotifId = Math.max(0, ...notifs.map(n => n.id)) + 1;
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        id: nextNotifId,
        type: 'announcement',
        message: `New announcement posted: "${title.trim()}"`,
        timestamp: new Date().toISOString(),
        isRead: false,
        icon: 'megaphone',
        linkTo: '/',
        isPastDue: false,
        dueDate: null
      }
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 520 }}>
        <div className="modal-header">
          <h2>New Announcement</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" />
        </div>
        <div className="form-group">
          <label className="form-label">Body *</label>
          <textarea className="form-textarea" value={body} onChange={e => setBody(e.target.value)} placeholder="Write your announcement..." style={{ minHeight: 100 }} />
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" id="pinAnnounce" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} style={{ cursor: 'pointer' }} />
          <label htmlFor="pinAnnounce" style={{ fontSize: 13, color: '#333', cursor: 'pointer' }}>Pin this announcement to the top</label>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Post Announcement</button>
        </div>
      </div>
    </div>
  );
}

function NewEmployeeModal({ onClose }) {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', hireDate: '', departmentId: '', locationId: '', jobTitle: '' });
  const [error, setError] = useState('');

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleSubmit() {
    if (!form.firstName.trim() || !form.lastName.trim()) { setError('First and last name are required.'); return; }
    if (!form.email.trim()) { setError('Email is required.'); return; }
    if (!form.hireDate) { setError('Hire date is required.'); return; }
    const employees = state.employees || [];
    const nextId = Math.max(0, ...employees.map(e => e.id)) + 1;
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const newEmployee = {
      id: nextId,
      firstName,
      middleName: '',
      lastName,
      preferredName: '',
      displayName: `${firstName} ${lastName}`,
      avatar: null,
      email: form.email.trim(),
      homeEmail: '',
      workPhone: '', workPhoneExt: '', mobilePhone: '', homePhone: '',
      dateOfBirth: '', gender: '', maritalStatus: '',
      address1: '', address2: '', city: '', state: '', zipcode: '', country: '',
      hireDate: form.hireDate,
      terminationDate: null,
      status: 'Active',
      employmentStatus: 'Full-Time',
      jobTitle: form.jobTitle.trim() || '',
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      locationId: form.locationId ? Number(form.locationId) : null,
      divisionId: null,
      reportsToId: null,
      employeeNumber: String(nextId),
      payRate: null, payType: 'Salary', payFrequency: 'Twice a Month',
      standardHoursPerWeek: 40,
      socialMediaLinks: { linkedin: '', twitter: '', facebook: '' },
      emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
      ssn: ''
    };
    dispatch({ type: 'ADD_EMPLOYEE', employee: newEmployee });
    const notifs = state.notifications || [];
    const nextNotifId = Math.max(0, ...notifs.map(n => n.id)) + 1;
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        id: nextNotifId,
        type: 'new_employee',
        message: `New employee added: ${firstName} ${lastName}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        icon: 'user',
        linkTo: `/people/${nextId}`,
        isPastDue: false,
        dueDate: null
      }
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 560 }}>
        <div className="modal-header">
          <h2>Add New Employee</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">First Name *</label>
            <input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="First name" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Last Name *</label>
            <input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Last name" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Work Email *</label>
          <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="employee@company.com" />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Hire Date *</label>
            <input className="form-input" type="date" value={form.hireDate} onChange={e => set('hireDate', e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Job Title</label>
            <input className="form-input" value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} placeholder="Job title" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Department</label>
            <select className="form-select" value={form.departmentId} onChange={e => set('departmentId', e.target.value)}>
              <option value="">Select department</option>
              {(state.departments || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Location</label>
            <select className="form-select" value={form.locationId} onChange={e => set('locationId', e.target.value)}>
              <option value="">Select location</option>
              {(state.locations || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Add Employee</button>
        </div>
      </div>
    </div>
  );
}

function NewDropdown({ onClose, onNewEmployee, onNewAnnouncement, onNewTimeOff }) {
  const items = [
    { label: 'New Employee', icon: <User size={14} />, action: () => { onClose(); onNewEmployee(); } },
    { label: 'New Announcement', icon: <Megaphone size={14} />, action: () => { onClose(); onNewAnnouncement(); } },
    { label: 'New Time Off Request', icon: <Calendar size={14} />, action: () => { onClose(); onNewTimeOff(); } },
  ];

  return (
    <div style={{
      position: 'absolute', top: '36px', right: 0,
      background: 'white', border: '1px solid #E0E0E0', borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 500, minWidth: 200
    }}>
      {items.map(item => (
        <button
          key={item.label}
          onClick={item.action}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', fontSize: 13, color: '#333', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  );
}

function TopNav() {
  const { state, dispatch } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showEmployee, setShowEmployee] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showTimeOff, setShowTimeOff] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentUser = state.currentUser;
  const me = state.employees?.find(e => e.id === currentUser?.employeeId);
  const unreadCount = (state.notifications || []).filter(n => !n.isRead).length;

  const sid = searchParams.get('sid');
  const navTo = (path) => sid ? `${path}?sid=${sid}` : path;

  function closeAll() {
    setNotifOpen(false);
    setSearchOpen(false);
    setNewOpen(false);
    setUserMenuOpen(false);
  }

  const navLinks = [
    { label: 'Home', path: navTo('/') },
    { label: 'My Info', path: navTo('/my-info') },
    { label: 'People', path: navTo('/people') },
    { label: 'Hiring', path: navTo('/hiring') },
    { label: 'Time Off', path: navTo('/time-off') },
    { label: 'Reports', path: navTo('/reports') },
    { label: 'Files', path: navTo('/files') },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
      background: 'white', borderBottom: '1px solid #E0E0E0',
      display: 'flex', alignItems: 'center', padding: '0 16px', zIndex: 300,
      gap: 16
    }}>
      {/* Logo */}
      <Link to={navTo('/')} style={{ textDecoration: 'none', flexShrink: 0 }} onClick={closeAll}>
        <span style={{ fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: '#73C41D', letterSpacing: '-0.5px' }}>
          bamboo<span style={{ fontWeight: 400 }}>HR</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1, marginLeft: 8 }}>
        {navLinks.map(({ label, path }) => (
          <NavLink
            key={label}
            to={path}
            end={path.replace(/\?.*/, '') === '/'}
            onClick={closeAll}
            style={({ isActive }) => ({
              padding: '18px 14px', fontSize: 14, fontWeight: 500, textDecoration: 'none',
              color: isActive ? '#73C41D' : '#555',
              borderBottom: isActive ? '3px solid #73C41D' : '3px solid transparent',
              transition: 'color 0.15s',
            })}
            onMouseEnter={e => { if (!e.currentTarget.className.includes('active')) e.currentTarget.style.color = '#333'; }}
            onMouseLeave={e => { if (!e.currentTarget.className.includes('active')) e.currentTarget.style.color = '#555'; }}
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
        {/* Search */}
        <button
          onClick={() => { setSearchOpen(s => !s); setNotifOpen(false); setNewOpen(false); }}
          style={{ padding: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#666', borderRadius: '4px' }}
          title="Search"
        >
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button
          onClick={() => { setNotifOpen(n => !n); setSearchOpen(false); setNewOpen(false); }}
          style={{ padding: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#666', borderRadius: '4px', position: 'relative' }}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4, background: '#E53935',
              color: 'white', borderRadius: '50%', width: 16, height: 16,
              fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Help */}
        <button
          onClick={() => { navigate(navTo('/help')); closeAll(); }}
          style={{ padding: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}
          title="Help"
        >
          <HelpCircle size={18} />
        </button>

        {/* Settings */}
        <button
          onClick={() => { navigate(navTo('/settings')); closeAll(); }}
          style={{ padding: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}
          title="Settings"
        >
          <Settings size={18} />
        </button>

        {/* User avatar */}
        <button
          onClick={() => { setUserMenuOpen(u => !u); setNotifOpen(false); setSearchOpen(false); }}
          style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: 4 }}
        >
          <Avatar employee={me} size={32} />
        </button>

        {/* New button (on home) */}
        <div style={{ position: 'relative', marginLeft: 8 }}>
          <button
            onClick={() => { setNewOpen(n => !n); setNotifOpen(false); setSearchOpen(false); }}
            className="btn btn-primary"
            style={{ fontSize: 13, padding: '6px 12px' }}
          >
            <Plus size={14} /> New... <ChevronDown size={12} />
          </button>
          {newOpen && (
            <NewDropdown
              onClose={() => setNewOpen(false)}
              onNewEmployee={() => setShowEmployee(true)}
              onNewAnnouncement={() => setShowAnnouncement(true)}
              onNewTimeOff={() => setShowTimeOff(true)}
            />
          )}
        </div>

        {/* Panels */}
        {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}

        {/* Modals (lifted out of NewDropdown so they persist after dropdown closes) */}
        {showEmployee && <NewEmployeeModal onClose={() => setShowEmployee(false)} />}
        {showAnnouncement && <AnnouncementModal onClose={() => setShowAnnouncement(false)} />}
        {showTimeOff && <TimeOffModal employeeId={state.currentUser?.employeeId || 1} onClose={() => setShowTimeOff(false)} />}

        {/* User menu */}
        {userMenuOpen && (
          <div style={{
            position: 'absolute', top: '56px', right: 0, width: 200,
            background: 'white', border: '1px solid #E0E0E0', borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 500
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E0E0E0' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{me?.displayName || 'Charlotte Abbott'}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{me?.jobTitle}</div>
            </div>
            <button
              onClick={() => { navigate(navTo('/my-info')); setUserMenuOpen(false); }}
              style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: 13, color: '#333', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              My Profile
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function Layout({ children }) {
  return (
    <div style={{ paddingTop: '56px', minHeight: '100vh', background: '#F5F5F5' }}>
      <TopNav />
      {children}
    </div>
  );
}

function PayrollPage() {
  const { state } = useApp();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const navTo = (path) => sid ? `${path}?sid=${sid}` : path;
  const activeEmps = (state.employees || []).filter(e => e.status === 'Active' && e.payRate);
  const totalPayroll = activeEmps.reduce((sum, e) => sum + (e.payRate || 0), 0);
  const avgSalary = activeEmps.length > 0 ? totalPayroll / activeEmps.length : 0;

  return (
    <Layout>
      <div style={{ background: '#F5F5F5', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ background: 'white', borderBottom: '1px solid #E0E0E0', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 18, padding: '14px 0' }}>Payroll</span>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Total Annual Payroll', value: `$${Math.round(totalPayroll).toLocaleString()}` },
              { label: 'Average Salary', value: `$${Math.round(avgSalary).toLocaleString()}` },
              { label: 'Employees on Payroll', value: activeEmps.length },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#333' }}>{stat.value}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>Employee</th><th>Department</th><th>Pay Rate</th><th>Pay Type</th><th>Pay Frequency</th></tr>
              </thead>
              <tbody>
                {activeEmps.sort((a, b) => b.payRate - a.payRate).map(emp => {
                  const dept = state.departments?.find(d => d.id === emp.departmentId);
                  return (
                    <tr key={emp.id}>
                      <td style={{ fontSize: 13, fontWeight: 500 }}>{emp.displayName}</td>
                      <td style={{ fontSize: 13 }}>{dept?.name || '---'}</td>
                      <td style={{ fontSize: 13, fontWeight: 500 }}>{emp.payType === 'Salary' ? `$${emp.payRate.toLocaleString()}/yr` : `$${emp.payRate}/hr`}</td>
                      <td style={{ fontSize: 13 }}>{emp.payType}</td>
                      <td style={{ fontSize: 13 }}>{emp.payFrequency}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/my-info" element={<Layout><EmployeeProfile myInfo /></Layout>} />
      <Route path="/my-info/:tab" element={<Layout><EmployeeProfile myInfo /></Layout>} />
      <Route path="/people" element={<Layout><PeopleDirectory /></Layout>} />
      <Route path="/people/org-chart" element={<Layout><OrgChart /></Layout>} />
      <Route path="/people/:id" element={<Layout><EmployeeProfile /></Layout>} />
      <Route path="/people/:id/:tab" element={<Layout><EmployeeProfile /></Layout>} />
      <Route path="/hiring" element={<Layout><Hiring /></Layout>} />
      <Route path="/hiring/:id" element={<Layout><HiringDetail /></Layout>} />
      <Route path="/time-off" element={<Layout><TimeOff /></Layout>} />
      <Route path="/reports" element={<Layout><Reports /></Layout>} />
      <Route path="/reports/:id" element={<Layout><ReportDetail /></Layout>} />
      <Route path="/files" element={<Layout><FilesPage /></Layout>} />
      <Route path="/payroll" element={<PayrollPage />} />
      <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
      <Route path="/help" element={<Layout><HelpPage /></Layout>} />
      <Route path="/go" element={<Go />} />
      <Route path="*" element={<RedirectWithQuery to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
