import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import GlobalNav from './components/GlobalNav';
import CourseLayout from './components/CourseLayout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Inbox from './pages/Inbox';
import Calendar from './pages/Calendar';
import Go from './pages/Go';
import CourseHome from './pages/course/CourseHome';
import Modules from './pages/course/Modules';
import Assignments from './pages/course/Assignments';
import AssignmentDetail from './pages/course/AssignmentDetail';
import AssignmentForm from './pages/course/AssignmentForm';
import Announcements from './pages/course/Announcements';
import AnnouncementDetail from './pages/course/AnnouncementDetail';
import AnnouncementForm from './pages/course/AnnouncementForm';
import Discussions from './pages/course/Discussions';
import DiscussionDetail from './pages/course/DiscussionDetail';
import DiscussionForm from './pages/course/DiscussionForm';
import Gradebook from './pages/course/Gradebook';
import People from './pages/course/People';
import Pages from './pages/course/Pages';
import PageDetail from './pages/course/PageDetail';
import PageEditor from './pages/course/PageEditor';
import Files from './pages/course/Files';
import Syllabus from './pages/course/Syllabus';
import Settings from './pages/course/Settings';
import Quizzes from './pages/course/Quizzes';
import Groups from './pages/Groups';
import NotificationPreferences from './pages/NotificationPreferences';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function Placeholder({ title }) {
  return (
    <div>
      <h1 style={{ fontWeight: 300, marginBottom: '8px' }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)' }}>This page is under construction.</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-layout">
      <Routes>
        <Route path="/go" element={<Go />} />
        <Route path="*" element={
          <>
            <GlobalNav />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<RedirectWithQuery to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CourseLayout />}>
                  <Route index element={<CourseHome />} />
                  <Route path="modules" element={<Modules />} />
                  <Route path="assignments" element={<Assignments />} />
                  <Route path="assignments/:assignmentId" element={<AssignmentDetail />} />
                  <Route path="assignments/:assignmentId/edit" element={<AssignmentForm />} />
                  <Route path="assignments/new" element={<AssignmentForm />} />
                  <Route path="announcements" element={<Announcements />} />
                  <Route path="announcements/new" element={<AnnouncementForm />} />
                  <Route path="announcements/:announcementId" element={<AnnouncementDetail />} />
                  <Route path="discussion_topics" element={<Discussions />} />
                  <Route path="discussion_topics/new" element={<DiscussionForm />} />
                  <Route path="discussion_topics/:topicId" element={<DiscussionDetail />} />
                  <Route path="grades" element={<Gradebook />} />
                  <Route path="users" element={<People />} />
                  <Route path="pages" element={<Pages />} />
                  <Route path="pages/:pageUrl/edit" element={<PageEditor />} />
                  <Route path="pages/:pageUrl" element={<PageDetail />} />
                  <Route path="files" element={<Files />} />
                  <Route path="syllabus" element={<Syllabus />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="outcomes" element={<Placeholder title="Outcomes" />} />
                  <Route path="quizzes" element={<Quizzes />} />
                </Route>
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/conversations" element={<Inbox />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/notifications" element={<NotificationPreferences />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/account/settings" element={<AccountSettings />} />
                <Route path="*" element={<Placeholder title="Page Not Found" />} />
              </Routes>
            </div>
          </>
        } />
      </Routes>
    </div>
  );
}
