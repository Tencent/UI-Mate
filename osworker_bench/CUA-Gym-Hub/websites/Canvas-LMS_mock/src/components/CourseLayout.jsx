import React from 'react';
import { NavLink, Outlet, useParams, Link } from 'react-router-dom';
import { Home, Megaphone, ClipboardList, MessageCircle, BarChart3, Users, FileText, Folder, BookOpen, Target, HelpCircle, Layers, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './CourseLayout.css';

const COURSE_NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, path: '' },
  { id: 'announcements', label: 'Announcements', icon: Megaphone, path: '/announcements' },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList, path: '/assignments' },
  { id: 'discussion_topics', label: 'Discussions', icon: MessageCircle, path: '/discussion_topics' },
  { id: 'grades', label: 'Grades', icon: BarChart3, path: '/grades' },
  { id: 'users', label: 'People', icon: Users, path: '/users' },
  { id: 'pages', label: 'Pages', icon: FileText, path: '/pages' },
  { id: 'files', label: 'Files', icon: Folder, path: '/files' },
  { id: 'syllabus', label: 'Syllabus', icon: BookOpen, path: '/syllabus' },
  { id: 'outcomes', label: 'Outcomes', icon: Target, path: '/outcomes', hidden: true },
  { id: 'quizzes', label: 'Quizzes', icon: HelpCircle, path: '/quizzes', hidden: true },
  { id: 'modules', label: 'Modules', icon: Layers, path: '/modules' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function CourseLayout() {
  const { courseId } = useParams();
  const { state } = useAppContext();

  const course = state.courses.find(c => c.id === parseInt(courseId));

  if (!course) {
    return (
      <div className="course-layout">
        <div className="course-content-area" style={{ padding: '24px' }}>
          <h1>Course Not Found</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            The course you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-layout">
      <div className="course-breadcrumbs">
        <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
        <span className="breadcrumb-sep">&gt;</span>
        <Link to={`/courses/${course.id}`} className="breadcrumb-link">{course.name}</Link>
      </div>
      <div className="course-body">
        <nav className="course-nav-sidebar">
          {COURSE_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const fullPath = `/courses/${courseId}${item.path}`;
            return (
              <NavLink
                key={item.id}
                to={fullPath}
                end={item.path === ''}
                className={({ isActive }) =>
                  `course-nav-item ${isActive ? 'active' : ''} ${item.hidden ? 'hidden-item' : ''}`
                }
              >
                <span className="course-nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="course-content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
