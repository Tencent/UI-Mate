import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Go from './pages/Go';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor/:documentId" element={<Editor />} />
          <Route path="/go" element={<Go />} />
          <Route path="*" element={<RedirectWithQuery to="/" />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
