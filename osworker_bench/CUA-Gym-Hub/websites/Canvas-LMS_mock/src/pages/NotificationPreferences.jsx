import React, { useState } from 'react';
import { Bell, Mail, Smartphone } from 'lucide-react';
import './NotificationPreferences.css';

const NOTIFICATION_TYPES = [
  { id: 'course_activities', label: 'Course Activities', description: 'Due dates, availability changes, course content' },
  { id: 'announcements', label: 'Announcements', description: 'New announcements in your courses' },
  { id: 'grading', label: 'Grading', description: 'Grades posted, submission comments' },
  { id: 'submission_comments', label: 'Submission Comments', description: 'Comments on your submissions' },
  { id: 'discussions', label: 'Discussions', description: 'New discussion posts and replies' },
  { id: 'conversations', label: 'Conversation Messages', description: 'New inbox messages' },
  { id: 'scheduling', label: 'Scheduling', description: 'Calendar events, appointment groups' },
  { id: 'groups', label: 'Groups', description: 'Group membership and activity' },
  { id: 'conferences', label: 'Conferences', description: 'Web conference invitations' },
  { id: 'alerts', label: 'Alerts', description: 'Administrative alerts and notifications' },
];

const FREQUENCY_OPTIONS = [
  { value: 'immediately', label: 'Immediately' },
  { value: 'daily', label: 'Daily Summary' },
  { value: 'weekly', label: 'Weekly Summary' },
  { value: 'off', label: 'Off' },
];

const DEFAULT_PREFS = {};
NOTIFICATION_TYPES.forEach(type => {
  DEFAULT_PREFS[type.id] = {
    email: type.id === 'announcements' || type.id === 'grading' || type.id === 'conversations' ? 'immediately' : 'daily',
    push: type.id === 'conversations' || type.id === 'grading' ? 'immediately' : 'off',
  };
});

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  const updatePref = (typeId, channel, value) => {
    setPrefs(prev => ({
      ...prev,
      [typeId]: { ...prev[typeId], [channel]: value }
    }));
  };

  return (
    <div className="notif-prefs-page">
      <div className="notif-prefs-header">
        <Bell size={24} />
        <div>
          <h1>Notification Preferences</h1>
          <p className="notif-prefs-desc">Choose how and when you want to be notified about activity in your courses.</p>
        </div>
      </div>

      <div className="notif-prefs-table-wrapper">
        <table className="notif-prefs-table">
          <thead>
            <tr>
              <th className="notif-type-col">Notification Type</th>
              <th className="notif-channel-col">
                <div className="channel-header">
                  <Mail size={16} />
                  <span>Email</span>
                </div>
              </th>
              <th className="notif-channel-col">
                <div className="channel-header">
                  <Smartphone size={16} />
                  <span>Push</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {NOTIFICATION_TYPES.map(type => (
              <tr key={type.id}>
                <td className="notif-type-cell">
                  <div className="notif-type-label">{type.label}</div>
                  <div className="notif-type-desc">{type.description}</div>
                </td>
                <td>
                  <select
                    className="notif-freq-select"
                    value={prefs[type.id].email}
                    onChange={e => updatePref(type.id, 'email', e.target.value)}
                  >
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="notif-freq-select"
                    value={prefs[type.id].push}
                    onChange={e => updatePref(type.id, 'push', e.target.value)}
                  >
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="notif-prefs-footer">
        <button className="btn btn-primary">Save Preferences</button>
      </div>
    </div>
  );
}
