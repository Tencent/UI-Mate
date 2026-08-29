import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DocsProvider } from './context/DocsContext';
import { ToastProvider } from './components/Toast';
import DocumentList from './pages/DocumentList';
import DocumentEditor from './pages/DocumentEditor';
import GoDebug from './pages/GoDebug';

function App() {
  return (
    <DocsProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DocumentList />} />
            <Route path="/document/:docId" element={<DocumentEditor />} />
            <Route path="/go" element={<GoDebug />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </DocsProvider>
  );
}

export default App;
