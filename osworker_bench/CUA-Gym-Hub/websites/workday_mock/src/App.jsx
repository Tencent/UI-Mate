import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TimeTracking from './pages/TimeTracking';
import Pay from './pages/Pay';
import Benefits from './pages/Benefits';
import Directory from './pages/Directory';
import Inbox from './pages/Inbox';
import Profile from './pages/Profile';
import Go from './pages/Go';
import Performance from './pages/Performance';

// Preserve ?sid= query parameter across Navigate redirects
function RedirectWithQuery({ to, replace = true }) {
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const target = queryString ? `${to}?${queryString}` : to;
  return <Navigate to={target} replace={replace} />;
}

function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="time" element={<TimeTracking />} />
              <Route path="pay" element={<Pay />} />
              <Route path="benefits" element={<Benefits />} />
              <Route path="directory" element={<Directory />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="profile" element={<Profile />} />
              <Route path="performance" element={<Performance />} />
              <Route path="go" element={<Go />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  );
}

export default App;
