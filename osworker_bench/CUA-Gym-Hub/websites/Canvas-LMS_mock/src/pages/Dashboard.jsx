import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List, Megaphone, ClipboardList, MessageCircle, Folder, Settings, X, Calendar as CalendarIcon, ClipboardCheck, FileText, BarChart2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import CourseColorModal from '../components/CourseColorModal';
import './Dashboard.css';

export default function Dashboard() {
  const { state, setState } = useAppContext();
  const navigate = useNavigate();
  const dashboardView = state.dashboardView || 'cards';
  const [colorModalCourse, setColorModalCourse] = useState(null);

  const availableCourses = state.courses.filter(c => c.workflow_state === 'available');

  const getUnreadAnnouncementCount = (courseId) => {
    return state.announcements.filter(a => a.course_id === courseId && a.read_state === 'unread').length;
  };

  const getNeedsGradingCount = (courseId) => {
    return state.assignments.filter(a => a.course_id === courseId && a.needs_grading_count > 0)
      .reduce((sum, a) => sum + a.needs_grading_count, 0);
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, '0');
    return `${months[d.getMonth()]} ${d.getDate()} at ${h}:${m}${ampm}`;
  };

  const dismissTodo = (todoId) => {
    setState(prev => ({
      ...prev,
      todoItems: prev.todoItems.filter(t => t.id !== todoId)
    }));
  };

  const getCourse = (courseId) => state.courses.find(c => c.id === courseId);

  const upcomingItems = [...state.calendarEvents, ...state.assignments.filter(a => a.published && a.due_at)]
    .map(item => {
      const isEvent = !!item.start_at;
      const dateStr = isEvent ? item.start_at : item.due_at;
      const course = isEvent
        ? (item.context_code.startsWith('course_') ? getCourse(parseInt(item.context_code.split('_')[1])) : null)
        : getCourse(item.course_id);
      return {
        id: isEvent ? `event_${item.id}` : `assignment_${item.id}`,
        title: isEvent ? item.title : item.name,
        date: dateStr,
        course,
        isEvent,
        courseColor: course?.color || '#6B7780'
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="pill-toggle">
          <button
            className={dashboardView === 'cards' ? 'active' : ''}
            onClick={() => setState(prev => ({ ...prev, dashboardView: 'cards' }))}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={dashboardView === 'list' ? 'active' : ''}
            onClick={() => setState(prev => ({ ...prev, dashboardView: 'list' }))}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="dashboard-main">
          {dashboardView === 'cards' ? (
            <div className="course-cards-grid">
              {availableCourses.map(course => {
                const unreadAnn = getUnreadAnnouncementCount(course.id);
                const needsGrading = getNeedsGradingCount(course.id);
                return (
                  <div key={course.id} className="course-card" onClick={() => navigate(`/courses/${course.id}`)}>
                    <div className="course-card-header" style={{ background: course.color }}>
                      <button className="card-settings-btn" onClick={(e) => { e.stopPropagation(); setColorModalCourse(course); }}>
                        <Settings size={16} />
                      </button>
                    </div>
                    <div className="course-card-body">
                      <div className="course-card-name">{course.name}</div>
                      <div className="course-card-code">{course.course_code}</div>
                      <div className="course-card-term">{course.term}</div>
                    </div>
                    <div className="course-card-footer">
                      <button className="card-footer-icon" title="Announcements" onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}/announcements`); }}>
                        <Megaphone size={16} />
                        {unreadAnn > 0 && <span className="icon-badge">{unreadAnn}</span>}
                      </button>
                      <button className="card-footer-icon" title="Assignments" onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}/assignments`); }}>
                        <ClipboardList size={16} />
                        {needsGrading > 0 && <span className="icon-badge">{needsGrading}</span>}
                      </button>
                      <button className="card-footer-icon" title="Discussions" onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}/discussion_topics`); }}>
                        <MessageCircle size={16} />
                      </button>
                      <button className="card-footer-icon" title="Files" onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}/files`); }}>
                        <Folder size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <DashboardListView state={state} navigate={navigate} />
          )}
        </div>

        <div className="dashboard-sidebar">
          {/* To Do */}
          <div className="sidebar-section">
            <h2 className="sidebar-section-title">To Do</h2>
            <div className="todo-list">
              {state.todoItems.slice(0, 5).map(todo => {
                const course = getCourse(todo.course_id);
                return (
                  <div key={todo.id} className="todo-item">
                    <div className="todo-icon">
                      <ClipboardCheck size={18} style={{ color: course?.color || 'var(--text-secondary)' }} />
                    </div>
                    <div className="todo-content">
                      <a className="todo-title" onClick={() => navigate(`/courses/${todo.course_id}/assignments/${todo.assignment_id}`)}>{todo.title}</a>
                      <div className="todo-meta">
                        {course?.course_code || 'Course'}
                      </div>
                      <div className="todo-meta">
                        {todo.points_possible} points &middot; {formatDueDate(todo.due_at)}
                      </div>
                    </div>
                    <button className="todo-dismiss" onClick={() => dismissTodo(todo.id)}>
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
              {state.todoItems.length > 5 && (
                <div className="todo-more">{state.todoItems.length - 5} more...</div>
              )}
              {state.todoItems.length === 0 && (
                <div className="todo-empty">Nothing for now!</div>
              )}
            </div>
          </div>

          {/* Coming Up */}
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <h2 className="sidebar-section-title">Coming Up</h2>
              <a className="view-calendar-link" onClick={() => navigate('/calendar')}>
                <CalendarIcon size={14} /> View Calendar
              </a>
            </div>
            <div className="coming-up-list">
              {upcomingItems.map(item => (
                <div key={item.id} className="coming-up-item">
                  <div className="coming-up-indicator" style={{ background: item.courseColor }} />
                  <div className="coming-up-content">
                    <a className="coming-up-title">{item.title}</a>
                    <div className="coming-up-meta">
                      {item.course?.course_code || 'Personal'} &middot; {formatDueDate(item.date)}
                    </div>
                  </div>
                </div>
              ))}
              {upcomingItems.length === 0 && (
                <div className="todo-empty">Nothing coming up.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {colorModalCourse && (
        <CourseColorModal
          course={colorModalCourse}
          onClose={() => setColorModalCourse(null)}
          onApply={({ courseId, nickname, color }) => {
            setState(prev => ({
              ...prev,
              courses: prev.courses.map(c =>
                c.id === courseId
                  ? { ...c, color, ...(nickname ? { nickname } : {}) }
                  : c
              )
            }));
          }}
        />
      )}
    </div>
  );
}

function DashboardListView({ state, navigate }) {
  const activeCourses = state.courses.filter(c => c.workflow_state === 'available');

  const activities = useMemo(() => {
    const items = [];
    // Announcements
    state.announcements.forEach(a => {
      const course = state.courses.find(c => c.id === a.course_id);
      if (course && course.workflow_state === 'available') {
        items.push({
          id: `ann_${a.id}`, type: 'announcement', title: a.title,
          course, date: a.posted_at,
          icon: 'megaphone', link: `/courses/${a.course_id}/announcements/${a.id}`,
          unread: a.read_state === 'unread'
        });
      }
    });
    // Assignments with due dates
    state.assignments.filter(a => a.published && a.due_at).forEach(a => {
      const course = state.courses.find(c => c.id === a.course_id);
      if (course && course.workflow_state === 'available') {
        items.push({
          id: `asgn_${a.id}`, type: 'assignment', title: a.name,
          course, date: a.due_at,
          icon: 'assignment', link: `/courses/${a.course_id}/assignments/${a.id}`,
          unread: false, points: a.points_possible
        });
      }
    });
    // Discussion topics
    state.discussionTopics.forEach(d => {
      const course = state.courses.find(c => c.id === d.course_id);
      if (course && course.workflow_state === 'available') {
        items.push({
          id: `disc_${d.id}`, type: 'discussion', title: d.title,
          course, date: d.last_reply_at || d.posted_at,
          icon: 'discussion', link: `/courses/${d.course_id}/discussion_topics/${d.id}`,
          unread: d.unread_count > 0
        });
      }
    });
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [state.announcements, state.assignments, state.discussionTopics, state.courses]);

  function getDateGroup(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = Math.floor((today - itemDate) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getIcon(type) {
    switch (type) {
      case 'announcement': return <Megaphone size={16} />;
      case 'assignment': return <ClipboardList size={16} />;
      case 'discussion': return <MessageCircle size={16} />;
      default: return <FileText size={16} />;
    }
  }

  const grouped = {};
  activities.forEach(a => {
    const group = getDateGroup(a.date);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(a);
  });

  return (
    <div className="dashboard-list-view">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="list-view-group">
          <div className="list-view-group-header">{group}</div>
          {items.map(item => (
            <div key={item.id} className="list-view-item" onClick={() => navigate(item.link)}>
              <div className="list-view-color-dot" style={{ background: item.course.color }} />
              <div className="list-view-icon">{getIcon(item.type)}</div>
              <div className="list-view-content">
                <div className="list-view-title">{item.title}</div>
                <div className="list-view-meta">
                  {item.course.course_code}
                  {item.points ? ` \u00B7 ${item.points} pts` : ''}
                </div>
              </div>
              <div className="list-view-time">
                {new Date(item.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
              {item.unread && <div className="list-view-unread" />}
            </div>
          ))}
        </div>
      ))}
      {activities.length === 0 && (
        <div className="list-view-empty">No recent activity.</div>
      )}
    </div>
  );
}
