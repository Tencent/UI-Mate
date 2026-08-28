
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckSquare, Calendar as CalendarIcon, Plus, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { CreateModal } from './CreateModal';
import { Activity } from '../types';

interface ActivityTimelineProps {
  relatedToType: string;
  relatedToId: string;
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ relatedToType, relatedToId, onShowToast }) => {
  const { state, updateState } = useApp();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const activities = state.activities
    .filter(a => a.relatedToType === relatedToType && a.relatedToId === relatedToId)
    .sort((a, b) => {
      const dateA = a.dueDate || a.startDateTime || a.createdDate;
      const dateB = b.dueDate || b.startDateTime || b.createdDate;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  const toggleTaskCompletion = (activityId: string) => {
    const updatedActivities = state.activities.map(a => {
      if (a.activityId === activityId && a.type === 'task') {
        const newStatus = a.status === 'Completed' ? 'Not Started' : 'Completed';
        return { ...a, status: newStatus };
      }
      return a;
    });
    updateState({ activities: updatedActivities });
    const activity = state.activities.find(a => a.activityId === activityId);
    if (activity) {
      const newStatus = activity.status === 'Completed' ? 'Not Started' : 'Completed';
      onShowToast(`Task marked as ${newStatus}`, 'success');
    }
  };

  const taskFields = [
    { name: 'subject', label: 'Subject', type: 'text' as const, required: true },
    { name: 'status', label: 'Status', type: 'select' as const, options: ['Not Started', 'In Progress', 'Completed'], required: true },
    { name: 'priority', label: 'Priority', type: 'select' as const, options: ['Low', 'Normal', 'High'] },
    { name: 'dueDate', label: 'Due Date', type: 'text' as const },
    { name: 'description', label: 'Description', type: 'textarea' as const },
  ];

  const eventFields = [
    { name: 'subject', label: 'Subject', type: 'text' as const, required: true },
    { name: 'startDateTime', label: 'Start Date/Time', type: 'text' as const, required: true },
    { name: 'endDateTime', label: 'End Date/Time', type: 'text' as const, required: true },
    { name: 'description', label: 'Description', type: 'textarea' as const },
  ];

  const handleCreateTask = (data: any) => {
    const newActivity: Activity = {
      activityId: 'activity_' + Date.now(),
      type: 'task',
      subject: data.subject,
      status: data.status || 'Not Started',
      priority: data.priority || 'Normal',
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      relatedToType,
      relatedToId,
      assignedToId: state.user.userId,
      description: data.description || '',
      createdDate: new Date().toISOString(),
    };
    updateState({ activities: [...state.activities, newActivity] });
    onShowToast('Task created successfully', 'success');
  };

  const handleCreateEvent = (data: any) => {
    const newActivity: Activity = {
      activityId: 'activity_' + Date.now(),
      type: 'event',
      subject: data.subject,
      status: 'Scheduled',
      priority: 'Normal',
      startDateTime: data.startDateTime ? new Date(data.startDateTime).toISOString() : undefined,
      endDateTime: data.endDateTime ? new Date(data.endDateTime).toISOString() : undefined,
      relatedToType,
      relatedToId,
      assignedToId: state.user.userId,
      description: data.description || '',
      createdDate: new Date().toISOString(),
    };
    updateState({ activities: [...state.activities, newActivity] });
    onShowToast('Event created successfully', 'success');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed': return 'badge-closed';
      case 'In Progress': return 'badge-working';
      case 'Scheduled': return 'badge-working';
      default: return 'badge-new';
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Activity Timeline</h2>
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddMenu(!showAddMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={16} />
            New Activity
            <ChevronDown size={14} />
          </button>
          {showAddMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '4px',
              background: 'white', border: '1px solid var(--border)', borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '160px', zIndex: 10
            }}>
              <button
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}
                onClick={() => { setShowAddMenu(false); setShowTaskModal(true); }}
              >
                New Task
              </button>
              <button
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}
                onClick={() => { setShowAddMenu(false); setShowEventModal(true); }}
              >
                New Event
              </button>
            </div>
          )}
        </div>
      </div>

      {activities.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No activities yet. Create a task or event to get started.</p>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '32px' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute', left: '11px', top: '0', bottom: '0',
            width: '2px', background: 'var(--primary)', opacity: 0.3
          }} />

          {activities.map(activity => {
            const isTask = activity.type === 'task';
            const isCompleted = activity.status === 'Completed';
            const assignee = state.users.find(u => u.userId === activity.assignedToId);
            const nodeColor = isCompleted ? 'var(--success)' : isTask ? 'var(--primary)' : '#FF9A3C';
            const dateStr = isTask
              ? (activity.dueDate ? format(new Date(activity.dueDate), 'MMM d, yyyy') : 'No due date')
              : (activity.startDateTime
                ? `${format(new Date(activity.startDateTime), 'MMM d, yyyy h:mm a')}${activity.endDateTime ? ` - ${format(new Date(activity.endDateTime), 'h:mm a')}` : ''}`
                : 'No date');

            return (
              <div key={activity.activityId} style={{ marginBottom: '20px', position: 'relative' }}>
                {/* Timeline node */}
                <div style={{
                  position: 'absolute', left: '-27px', top: '4px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: nodeColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid white', boxShadow: '0 0 0 2px ' + nodeColor
                }}>
                  {isCompleted && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* Checkbox for tasks */}
                  {isTask && (
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleTaskCompletion(activity.activityId)}
                      style={{ marginTop: '4px', cursor: 'pointer', accentColor: 'var(--success)' }}
                    />
                  )}
                  {!isTask && (
                    <CalendarIcon size={16} style={{ marginTop: '4px', color: '#FF9A3C', flexShrink: 0 }} />
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {isTask && <CheckSquare size={14} style={{ color: nodeColor }} />}
                      <span style={{
                        fontWeight: 600, fontSize: '14px',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)'
                      }}>
                        {activity.subject}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {dateStr}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${getStatusBadgeClass(activity.status)}`} style={{ fontSize: '11px' }}>
                        {activity.status}
                      </span>
                      {assignee && (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {assignee.firstName} {assignee.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="New Task"
        fields={taskFields}
        onSubmit={handleCreateTask}
      />
      <CreateModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title="New Event"
        fields={eventFields}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
};
