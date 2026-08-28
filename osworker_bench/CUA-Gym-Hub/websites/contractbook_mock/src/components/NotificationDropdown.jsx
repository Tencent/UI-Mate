import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PenTool, Eye, CheckSquare, AlertCircle, Bell, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

const NOTIF_ICONS = {
  signature_received: PenTool,
  contract_viewed: Eye,
  task_assigned: CheckSquare,
  contract_expired: AlertCircle,
  reminder: Bell,
  comment: MessageCircle,
};

export default function NotificationDropdown({ onClose }) {
  const { state, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const query = sid ? `?sid=${sid}` : '';

  const handleNotifClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.contractId) {
      navigate(`/contracts/${notif.contractId}${query}`);
    }
    onClose();
  };

  return (
    <div className="notif-dropdown">
      <div className="notif-header">
        <h3>Notifications</h3>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 12, padding: '4px 8px', color: 'var(--color-primary)' }}
          onClick={markAllNotificationsRead}
        >
          Mark all as read
        </button>
      </div>
      <div className="notif-list">
        {state.notifications.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <Bell size={32} className="empty-state-icon" />
            <p>No notifications</p>
          </div>
        ) : (
          state.notifications.map(notif => {
            const Icon = NOTIF_ICONS[notif.type] || Bell;
            return (
              <div
                key={notif.id}
                className={`notif-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => handleNotifClick(notif)}
              >
                {!notif.read && <div className="notif-unread-dot" />}
                {notif.read && <div style={{ width: 8 }} />}
                <div className="notif-icon">
                  <Icon size={16} />
                </div>
                <div className="notif-content">
                  <div className="notif-title">{notif.title}</div>
                  <div className="notif-desc">{notif.description}</div>
                  <div className="notif-time">{formatRelativeTime(notif.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
