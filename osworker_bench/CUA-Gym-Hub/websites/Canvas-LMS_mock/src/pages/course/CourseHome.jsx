import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export default function CourseHome() {
  const { courseId } = useParams();
  const { state } = useAppContext();
  const course = state.courses.find(c => c.id === parseInt(courseId));

  if (!course) return null;

  // Canvas default_view can be 'modules', 'assignments', 'syllabus', 'feed'
  // Redirect to the default view
  const viewMap = {
    modules: 'modules',
    assignments: 'assignments',
    syllabus: 'syllabus',
    feed: 'announcements',
  };

  const target = viewMap[course.default_view] || 'modules';
  return <Navigate to={`/courses/${courseId}/${target}`} replace />;
}
