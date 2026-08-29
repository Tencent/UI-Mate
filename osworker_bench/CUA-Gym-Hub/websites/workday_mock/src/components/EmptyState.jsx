import React from 'react';
import { Inbox, Target, DollarSign, Search, Megaphone, CheckCircle, FileText, Calendar } from 'lucide-react';

const emptyIcons = {
  inbox: Inbox,
  goals: Target,
  pay: DollarSign,
  search: Search,
  announcements: Megaphone,
  tasks: CheckCircle,
  documents: FileText,
  calendar: Calendar,
};

export default function EmptyState({ type = 'tasks', title, description }) {
  const Icon = emptyIcons[type] || CheckCircle;

  const defaults = {
    inbox: { title: 'All caught up!', description: 'You have no pending tasks in your inbox.' },
    goals: { title: 'No goals yet', description: 'Create your first goal to start tracking your progress.' },
    pay: { title: 'No pay history', description: 'Your paystub history will appear here after your first pay period.' },
    search: { title: 'No results found', description: 'Try adjusting your search terms or filters.' },
    announcements: { title: 'No announcements', description: 'Company announcements will appear here.' },
    tasks: { title: 'No tasks', description: 'Tasks assigned to you will appear here.' },
    documents: { title: 'No documents', description: 'Your documents will appear here.' },
    calendar: { title: 'No events', description: 'No events or time off requests for this period.' },
  };

  const d = defaults[type] || defaults.tasks;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title || d.title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{description || d.description}</p>
    </div>
  );
}
