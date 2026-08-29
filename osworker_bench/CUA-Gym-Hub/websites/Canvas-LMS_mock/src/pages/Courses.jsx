import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Courses.css';

export default function Courses() {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState('current');
  const [searchQuery, setSearchQuery] = useState('');

  const enrolledCourses = useMemo(() => {
    return state.enrollments
      .filter(e => e.user_id === state.currentUser.id)
      .map(e => {
        const course = state.courses.find(c => c.id === e.course_id);
        if (!course) return null;
        return { ...course, enrollmentType: e.type, enrollmentState: e.enrollment_state };
      })
      .filter(Boolean);
  }, [state.enrollments, state.courses, state.currentUser.id]);

  const filteredCourses = useMemo(() => {
    let courses = enrolledCourses;
    if (activeTab === 'current') {
      courses = courses.filter(c => c.workflow_state === 'available');
    } else if (activeTab === 'past') {
      courses = courses.filter(c => c.workflow_state === 'completed');
    } else if (activeTab === 'future') {
      courses = courses.filter(c => c.workflow_state === 'unpublished');
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      courses = courses.filter(c => c.name.toLowerCase().includes(q) || c.course_code.toLowerCase().includes(q));
    }
    return courses;
  }, [enrolledCourses, activeTab, searchQuery]);

  function getRoleLabel(type) {
    switch (type) {
      case 'TeacherEnrollment': return 'Teacher';
      case 'TaEnrollment': return 'TA';
      case 'StudentEnrollment': return 'Student';
      default: return type.replace('Enrollment', '');
    }
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>All Courses</h1>
      </div>

      <div className="courses-toolbar">
        <div className="courses-tabs">
          <button className={`courses-tab ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')}>
            Current Courses
          </button>
          <button className={`courses-tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>
            Past Courses
          </button>
          <button className={`courses-tab ${activeTab === 'future' ? 'active' : ''}`} onClick={() => setActiveTab('future')}>
            Future Courses
          </button>
        </div>
        <div className="courses-search">
          <Search size={14} className="courses-search-icon" />
          <input
            type="text"
            placeholder="Search courses..."
            className="courses-search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="courses-table-wrapper">
        <table className="courses-table">
          <thead>
            <tr>
              <th style={{ width: 30 }}></th>
              <th>Course</th>
              <th>Nickname</th>
              <th>Term</th>
              <th>Enrolled as</th>
              <th>Published</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map(course => (
              <tr key={course.id}>
                <td>
                  <Star size={14} stroke="#C7CDD1" fill="none" style={{ cursor: 'pointer' }} />
                </td>
                <td>
                  <Link to={`/courses/${course.id}`} className="courses-name-link">
                    <span className="courses-color-dot" style={{ background: course.color }} />
                    <span>{course.name}</span>
                  </Link>
                  <div className="courses-code">{course.course_code}</div>
                </td>
                <td className="courses-nickname">—</td>
                <td className="courses-term">{course.term}</td>
                <td>
                  <span className="courses-role">{getRoleLabel(course.enrollmentType)}</span>
                </td>
                <td>
                  <span className={`courses-published ${course.workflow_state === 'available' ? 'yes' : 'no'}`}>
                    {course.workflow_state === 'available' ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
            {filteredCourses.length === 0 && (
              <tr>
                <td colSpan={6} className="courses-empty">No courses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
