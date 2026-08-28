import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import './Syllabus.css';

function formatDate(dateStr) {
  if (!dateStr) return 'No Date';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function Syllabus() {
  const { courseId } = useParams();
  const { state } = useAppContext();
  const cid = parseInt(courseId);

  const course = state.courses.find(c => c.id === cid);

  const assignmentSchedule = useMemo(() => {
    return state.assignments
      .filter(a => a.course_id === cid && a.published)
      .sort((a, b) => {
        if (!a.due_at && !b.due_at) return 0;
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;
        return new Date(a.due_at) - new Date(b.due_at);
      });
  }, [state.assignments, cid]);

  return (
    <div className="syllabus-page">
      <h1>Syllabus</h1>

      {course?.syllabus_body && (
        <div className="syllabus-body" dangerouslySetInnerHTML={{ __html: course.syllabus_body }} />
      )}

      <div className="syllabus-schedule">
        <h2>Course Summary</h2>
        <table className="syllabus-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Details</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {assignmentSchedule.map(a => (
              <tr key={a.id}>
                <td className="syllabus-date">{formatDate(a.due_at)}</td>
                <td>
                  <Link to={`/courses/${courseId}/assignments/${a.id}`} className="syllabus-link">
                    {a.name}
                  </Link>
                </td>
                <td className="syllabus-time">
                  {a.due_at ? formatTime(a.due_at) : '—'}
                </td>
              </tr>
            ))}
            {assignmentSchedule.length === 0 && (
              <tr>
                <td colSpan={3} className="syllabus-empty">No assignments scheduled.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
