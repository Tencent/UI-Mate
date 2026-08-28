
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Grid3x3, Plus, HelpCircle, Bell, ChevronDown, Cloud, AlertTriangle, Clock, X, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SearchBox } from './SearchBox';
import { format } from 'date-fns';

interface NotificationItem {
  id: string;
  type: 'overdue' | 'escalated' | 'closing_soon';
  title: string;
  description: string;
  path: string;
  timestamp: string;
}

interface TopNavProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onShowToast }) => {
  const { state, updateState } = useApp();
  const navigate = useNavigate();
  const [showAppLauncher, setShowAppLauncher] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const notifications = useMemo(() => {
    const items: NotificationItem[] = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Overdue tasks
    state.activities
      .filter(a => a.type === 'task' && a.status !== 'Completed' && a.dueDate && a.dueDate.split('T')[0] < today)
      .forEach(a => {
        items.push({
          id: `overdue-${a.activityId}`,
          type: 'overdue',
          title: `Overdue Task: ${a.subject}`,
          description: `Due ${a.dueDate ? format(new Date(a.dueDate), 'MMM d, yyyy') : 'unknown'}`,
          path: a.relatedToType && a.relatedToId
            ? `/${a.relatedToType.toLowerCase()}s/${a.relatedToId}`
            : '/calendar',
          timestamp: a.dueDate || a.createdDate,
        });
      });

    // Escalated cases
    state.cases
      .filter(c => c.status === 'Escalated')
      .forEach(c => {
        items.push({
          id: `escalated-${c.caseId}`,
          type: 'escalated',
          title: `Escalated Case: ${c.caseNumber}`,
          description: c.subject,
          path: `/cases/${c.caseId}`,
          timestamp: c.modifiedDate,
        });
      });

    // Opportunities closing within 7 days
    state.opportunities
      .filter(o => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost' && o.closeDate.split('T')[0] <= sevenDaysFromNow && o.closeDate.split('T')[0] >= today)
      .forEach(o => {
        items.push({
          id: `closing-${o.opportunityId}`,
          type: 'closing_soon',
          title: `Closing soon: ${o.name}`,
          description: `$${o.amount.toLocaleString()} - ${format(new Date(o.closeDate), 'MMM d, yyyy')}`,
          path: `/opportunities/${o.opportunityId}`,
          timestamp: o.closeDate,
        });
      });

    return items.filter(n => !state.dismissedNotifications.includes(n.id));
  }, [state.activities, state.cases, state.opportunities, state.dismissedNotifications]);

  const dismissNotification = (notifId: string) => {
    updateState({
      dismissedNotifications: [...state.dismissedNotifications, notifId],
    });
  };

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    updateState({
      dismissedNotifications: [...state.dismissedNotifications, ...allIds],
    });
    onShowToast('All notifications marked as read', 'success');
  };

  return (
    <nav style={{ 
      height: '60px', 
      background: 'white', 
      borderBottom: '1px solid var(--border)', 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0 16px',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <button
        onClick={() => setShowAppLauncher(!showAppLauncher)}
        style={{ padding: '8px', position: 'relative' }}
        title="App Launcher"
      >
        <Grid3x3 size={20} />
        {showAppLauncher && (
          <>
            <div
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
              onClick={(e) => { e.stopPropagation(); setShowAppLauncher(false); }}
            />
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              padding: '16px',
              minWidth: '300px',
              zIndex: 1001
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Apps</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <Link to="/leads" style={{ padding: '12px', textAlign: 'center', borderRadius: '4px', background: 'var(--bg)' }} onClick={() => setShowAppLauncher(false)}>Leads</Link>
                <Link to="/accounts" style={{ padding: '12px', textAlign: 'center', borderRadius: '4px', background: 'var(--bg)' }} onClick={() => setShowAppLauncher(false)}>Accounts</Link>
                <Link to="/contacts" style={{ padding: '12px', textAlign: 'center', borderRadius: '4px', background: 'var(--bg)' }} onClick={() => setShowAppLauncher(false)}>Contacts</Link>
                <Link to="/opportunities" style={{ padding: '12px', textAlign: 'center', borderRadius: '4px', background: 'var(--bg)' }} onClick={() => setShowAppLauncher(false)}>Opportunities</Link>
              </div>
            </div>
          </>
        )}
      </button>

      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '18px' }}>
        <Cloud size={24} />
        Xalesforce
      </Link>

      <SearchBox onShowToast={onShowToast} />

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={18} />
            New
          </button>
      {showCreateMenu && (
            <>
              <div
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                onClick={() => setShowCreateMenu(false)}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                minWidth: '200px',
                zIndex: 1001
              }}>
              <div style={{ fontWeight: 600 }}>Quick Create</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Navigate to the new record form</div>
                <Link to="/leads?create=1" style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--border)' }} onClick={() => setShowCreateMenu(false)}>Lead</Link>
                <Link to="/accounts?create=1" style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--border)' }} onClick={() => setShowCreateMenu(false)}>Account</Link>
                <Link to="/contacts?create=1" style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--border)' }} onClick={() => setShowCreateMenu(false)}>Contact</Link>
                <Link to="/opportunities?create=1" style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--border)' }} onClick={() => setShowCreateMenu(false)}>Opportunity</Link>
                <Link to="/cases?create=1" style={{ display: 'block', padding: '12px 16px' }} onClick={() => setShowCreateMenu(false)}>Case</Link>
              </div>
            </>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button style={{ padding: '8px' }} title="Help & Training" onClick={() => setShowHelp(!showHelp)}>
            <HelpCircle size={20} />
          </button>
          {showHelp && (
            <>
              <div
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                onClick={() => setShowHelp(false)}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                width: '300px',
                zIndex: 1001,
                padding: '16px',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Help & Training</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Local sandbox resources for common CRM workflows.
                </div>
                {[
                  ['Create records', 'Use New to create leads, accounts, contacts, opportunities, and cases.'],
                  ['Track activity', 'Open a record and use Email, Call, Activity, and Chatter actions.'],
                  ['Files and reports', 'Upload files locally and export report summaries as CSV.'],
                ].map(([title, body]) => (
                  <div key={title} style={{ padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{body}</div>
                  </div>
                ))}
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '12px' }}
                  onClick={() => {
                    setShowHelp(false);
                  }}
                >
                  Close Help
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button
            style={{ padding: '8px', position: 'relative' }}
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: 'var(--error)',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{notifications.length}</span>
            )}
          </button>
          {showNotifications && (
            <>
              <div
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                onClick={() => setShowNotifications(false)}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1001,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      Mark All as Read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      style={{
                        display: 'flex',
                        gap: '10px',
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        alignItems: 'flex-start',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                    >
                      <div style={{ flexShrink: 0, marginTop: '2px' }}>
                        {notif.type === 'overdue' && <AlertTriangle size={18} color="var(--warning)" />}
                        {notif.type === 'escalated' && <Bell size={18} color="var(--error)" />}
                        {notif.type === 'closing_soon' && <Clock size={18} color="var(--primary)" />}
                      </div>
                      <div
                        style={{ flex: 1, minWidth: 0 }}
                        onClick={() => { navigate(notif.path); setShowNotifications(false); }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{notif.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.description}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id); }}
                        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-secondary)' }}
                        title="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <Link to="/setup" style={{ padding: '8px', display: 'flex', alignItems: 'center' }} title="Setup">
          <Settings size={20} />
        </Link>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px' }}
          >
            <img 
              src={state.user.avatar} 
              alt={state.user.firstName}
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
            <ChevronDown size={16} />
          </button>
          {showUserMenu && (
            <>
              <div
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                onClick={() => setShowUserMenu(false)}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                minWidth: '200px',
                zIndex: 1001
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600 }}>{state.user.firstName} {state.user.lastName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{state.user.email}</div>
                </div>
                <button
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '14px' }}
                  onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                >
                  My Profile
                </button>
                <button
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '14px' }}
                  onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                >
                  My Settings
                </button>
                <button
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                  onClick={() => {
                    // Clear all state keys from localStorage
                    Object.keys(localStorage).forEach(key => {
                      if (key.includes('xalesforce')) localStorage.removeItem(key);
                    });
                    window.location.href = '/';
                  }}
                >
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
