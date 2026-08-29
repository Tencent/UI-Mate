import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Inbox from './pages/Inbox';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import Settings from './pages/Settings';
import ProfileSettings from './pages/ProfileSettings';
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
          <Route path="/go" element={<Go />} />
          <Route path="/" element={<RedirectWithQuery to="/inbox" />} />
          <Route element={<Layout />}>
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/:id" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
            <Route path="/settings" element={<RedirectWithQuery to="/settings/workspace/pol_001/basics" />} />
            <Route path="/settings/workspace/:policyId/:tab" element={<Settings />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/profile" element={<ProfileSettings />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
