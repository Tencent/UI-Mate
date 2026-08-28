import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Agreements from './pages/Agreements';
import EnvelopeDetail from './pages/EnvelopeDetail';
import Templates from './pages/Templates';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import PrepareEnvelope from './pages/PrepareEnvelope';
import SigningRoom from './pages/SigningRoom';
import GoEndpoint from './pages/GoEndpoint';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function App() {
  return (
    <StoreProvider>
      <ToastProvider>
      <Router>
        <Routes>
          {/* Main App Routes (with Layout) */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/agreements" element={<Layout><Agreements /></Layout>} />
          <Route path="/agreements/:folder" element={<Layout><Agreements /></Layout>} />
          <Route path="/agreements/detail/:id" element={<Layout><EnvelopeDetail /></Layout>} />
          <Route path="/templates" element={<Layout><Templates /></Layout>} />
          <Route path="/templates/:id/edit" element={<PrepareEnvelope isTemplate />} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />

          {/* Full Screen Editors (no Layout) */}
          <Route path="/prepare/:id" element={<PrepareEnvelope />} />
          <Route path="/sign/:id" element={<SigningRoom />} />

          {/* Debug Endpoint */}
          <Route path="/go" element={<GoEndpoint />} />

          {/* Legacy redirect */}
          <Route path="/documents" element={<RedirectWithQuery to="/agreements" />} />
        </Routes>
      </Router>
      </ToastProvider>
    </StoreProvider>
  );
}

export default App;
