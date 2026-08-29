import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Search, UserPlus, ArrowUpDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './People.css';

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getAvatarColor(userId) {
  const colors = ['#0374B5', '#EE0612', '#0B874B', '#FC5E13', '#6B3FA0', '#394B58', '#D97706', '#7C3AED'];
  return colors[userId % colors.length];
}

function getRoleLabel(type) {
  switch (type) {
    case 'TeacherEnrollment': return 'Teacher';
    case 'TaEnrollment': return 'TA';
    case 'StudentEnrollment': return 'Student';
    case 'ObserverEnrollment': return 'Observer';
    case 'DesignerEnrollment': return 'Designer';
    default: return type.replace('Enrollment', '');
  }
}

function randomActivity(userId) {
  // Generate consistent "last activity" based on userId
  const hours = (userId * 7 + 3) % 48;
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function randomTotalActivity(userId) {
  const hours = ((userId * 13 + 5) % 60) + 10;
  return `${hours}:${String((userId * 17) % 60).padStart(2, '0')}`;
}

export default function People() {
  const { courseId } = useParams();
  const { state } = useAppContext();
  const cid = parseInt(courseId);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Get enrollments for this course
  const enrollments = useMemo(() => {
    return state.enrollments.filter(
      e => e.course_id === cid && e.enrollment_state === 'active'
    );
  }, [state.enrollments, cid]);

  // Get course sections
  const course = state.courses.find(c => c.id === cid);

  const people = useMemo(() => {
    return enrollments
      .map(e => {
        const user = state.users.find(u => u.id === e.user_id);
        if (!user) return null;
        return {
          ...user,
          enrollmentType: e.type,
          sectionId: e.course_section_id,
          enrolledAt: e.created_at
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.sortable_name.localeCompare(b.sortable_name));
  }, [enrollments, state.users]);

  // Apply filters and sorting
  const filteredPeople = useMemo(() => {
    let result = people;
    if (roleFilter !== 'all') {
      result = result.filter(p => p.enrollmentType === roleFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.sortable_name.localeCompare(b.sortable_name); break;
        case 'login': cmp = a.email.localeCompare(b.email); break;
        case 'role': cmp = getRoleLabel(a.enrollmentType).localeCompare(getRoleLabel(b.enrollmentType)); break;
        default: cmp = a.sortable_name.localeCompare(b.sortable_name);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [people, roleFilter, searchQuery, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // Available roles in this course
  const availableRoles = useMemo(() => {
    const roles = [...new Set(people.map(p => p.enrollmentType))];
    return roles.sort();
  }, [people]);

  return (
    <div className="people-page">
      <div className="people-header">
        <h1>People</h1>
        <button className="btn btn-primary">
          <UserPlus size={16} /> People
        </button>
      </div>

      <div className="people-toolbar">
        <div className="people-search">
          <Search size={14} className="people-search-icon" />
          <input
            type="text"
            placeholder="Search people..."
            className="people-search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="people-filters">
          <select
            className="people-role-filter"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {availableRoles.map(r => (
              <option key={r} value={r}>{getRoleLabel(r)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="people-count">
        {filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'}
      </div>

      <div className="people-table-wrapper">
        <table className="people-table">
          <thead>
            <tr>
              <th className="people-th-sortable" onClick={() => toggleSort('name')}>Name <ArrowUpDown size={12} /></th>
              <th className="people-th-sortable" onClick={() => toggleSort('login')}>Login ID <ArrowUpDown size={12} /></th>
              <th>Section</th>
              <th className="people-th-sortable" onClick={() => toggleSort('role')}>Role <ArrowUpDown size={12} /></th>
              <th>Last Activity</th>
              <th>Total Activity</th>
            </tr>
          </thead>
          <tbody>
            {filteredPeople.map(person => (
              <tr key={`${person.id}-${person.enrollmentType}`}>
                <td className="people-name-cell">
                  <div className="avatar" style={{ background: getAvatarColor(person.id), width: 28, height: 28, fontSize: 11 }}>
                    {getInitials(person.name)}
                  </div>
                  <span className="people-name">{person.name}</span>
                </td>
                <td className="people-login">{person.email}</td>
                <td className="people-section">
                  {course ? `${course.course_code} Section ${person.sectionId}` : `Section ${person.sectionId}`}
                </td>
                <td>
                  <span className={`role-badge role-${getRoleLabel(person.enrollmentType).toLowerCase()}`}>
                    {getRoleLabel(person.enrollmentType)}
                  </span>
                </td>
                <td className="people-activity">{randomActivity(person.id)}</td>
                <td className="people-activity">{randomTotalActivity(person.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPeople.length === 0 && (
        <div className="people-empty">No people found matching your criteria.</div>
      )}
    </div>
  );
}
