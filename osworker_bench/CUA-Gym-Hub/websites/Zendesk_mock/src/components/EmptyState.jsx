import React from 'react';
import { Inbox, Search, FileQuestion, Users, Building2 } from 'lucide-react';

const iconMap = {
  tickets: Inbox,
  search: Search,
  default: FileQuestion,
  customers: Users,
  organizations: Building2,
};

export default function EmptyState({ type = 'default', title, subtitle, action }) {
  const Icon = iconMap[type] || iconMap.default;

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={48} strokeWidth={1} />
      </div>
      <h3 className="empty-state-title">{title || 'Nothing here yet'}</h3>
      {subtitle && <p className="empty-state-subtitle">{subtitle}</p>}
      {action && (
        <button className="empty-state-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
