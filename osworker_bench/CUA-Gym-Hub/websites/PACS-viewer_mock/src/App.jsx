import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudyList from './pages/StudyList.jsx';
import Viewer from './pages/Viewer.jsx';
import StateInspector from './pages/StateInspector.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/studies" replace />} />
      <Route path="/studies" element={<StudyList />} />
      <Route path="/viewer/:studyId" element={<Viewer />} />
      <Route path="/go" element={<StateInspector />} />
      <Route path="*" element={<Navigate to="/studies" replace />} />
    </Routes>
  );
}
