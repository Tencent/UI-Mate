import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Groups.css';

export default function Groups() {
  const { state } = useAppContext();
  const navigate = useNavigate();

  // Generate mock study groups based on enrolled courses
  const activeCourses = state.courses.filter(c => c.workflow_state === 'available');
  const mockGroups = activeCourses.slice(0, 3).map((course, idx) => ({
    id: idx + 1,
    name: `${course.course_code} Study Group ${idx + 1}`,
    course_id: course.id,
    course_name: course.name,
    course_code: course.course_code,
    course_color: course.color,
    member_count: Math.floor(Math.random() * 4) + 3,
    description: `Study group for ${course.name}. Share notes, discuss assignments, and prepare for exams.`,
  }));

  return (
    <div className="groups-page">
      <div className="groups-header">
        <h1>Groups</h1>
      </div>

      <div className="groups-section">
        <h2>Current Groups</h2>
        {mockGroups.length > 0 ? (
          <div className="groups-grid">
            {mockGroups.map(group => (
              <div key={group.id} className="group-card">
                <div className="group-card-banner" style={{ background: group.course_color }} />
                <div className="group-card-body">
                  <div className="group-card-name">{group.name}</div>
                  <div className="group-card-course">{group.course_code}</div>
                  <div className="group-card-desc">{group.description}</div>
                  <div className="group-card-members">
                    <Users size={14} />
                    <span>{group.member_count} members</span>
                  </div>
                </div>
                <div className="group-card-footer">
                  <button className="group-action" title="Discussions">
                    <MessageCircle size={16} />
                  </button>
                  <button className="group-action" title="Calendar">
                    <CalendarIcon size={16} />
                  </button>
                  <button className="group-action" title="Files">
                    <FileText size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="groups-empty">
            <Users size={48} />
            <p>You are not currently in any groups.</p>
          </div>
        )}
      </div>
    </div>
  );
}
