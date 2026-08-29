import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import MessengerModule from './pages/MessengerModule';
import CalendarModule from './pages/CalendarModule';
import DocsModule from './pages/DocsModule';
import DocEditor from './pages/DocEditor';
import ContactsModule from './pages/ContactsModule';
import WorkbenchModule from './pages/WorkbenchModule';
import MeetingsModule from './pages/MeetingsModule';
import TasksModule from './pages/TasksModule';
import SettingsPage from './pages/SettingsPage';
import Go from './pages/Go';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/go" element={<Go />} />
        <Route path="/state-inspector" element={<Go />} />
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/messenger" replace />} />
          <Route path="messenger" element={<MessengerModule />} />
          <Route path="messenger/:conversationId" element={<MessengerModule />} />
          <Route path="calendar" element={<CalendarModule />} />
          <Route path="docs" element={<DocsModule />} />
          <Route path="docs/:docId" element={<DocEditor />} />
          <Route path="meetings" element={<MeetingsModule />} />
          <Route path="contacts" element={<ContactsModule />} />
          <Route path="workbench" element={<WorkbenchModule />} />
          <Route path="workbench/approvals" element={<WorkbenchModule activeTab="approvals" />} />
          <Route path="tasks" element={<TasksModule />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

