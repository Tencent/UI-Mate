import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Clipboard, Calendar, UserPlus, ArrowRight, FileText, AtSign, Bell } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

const typeIcons = {
  scorecard_due: Clipboard,
  interview_reminder: Calendar,
  candidate_applied: UserPlus,
  stage_change: ArrowRight,
  offer_update: FileText,
  mention: AtSign
};

export default function NotificationsPanel({ onClose }) {
  const { state, dispatch } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ref = useRef(null);
  const sid = searchParams.get('sid');

  const buildLink = (path) => sid ? `${path}?sid=${sid}` : path;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotifClick = (notif) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { id: notif.id } });
    navigate(buildLink(notif.link));
    onClose();
  };

  const markAllRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  };

  const unreadCount = state.notifications.filter(n => !n.isRead).length;

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 8,
        width: 340,
        maxHeight: 420,
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Notifications</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
              Mark all as read
            </button>
          )}
          <button aria-label="Close notifications" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {state.notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No notifications
          </div>
        ) : (
          state.notifications.map(notif => {
            const Icon = typeIcons[notif.type] || Bell;
            return (
              <div
                role="button"
                tabIndex={0}
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNotifClick(notif);
                  }
                }}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--divider)',
                  background: notif.isRead ? 'transparent' : '#F0FBF7',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = notif.isRead ? 'var(--divider)' : '#E0F5ED'}
                onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? 'transparent' : '#F0FBF7'}
              >
                {/* Unread dot */}
                <div style={{ flexShrink: 0, paddingTop: 4 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: notif.isRead ? 'transparent' : '#2563EB'
                  }} />
                </div>
                <div style={{ width: 32, height: 32, background: 'var(--divider)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color="var(--text-secondary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: notif.isRead ? 400 : 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, lineHeight: 1.4 }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
