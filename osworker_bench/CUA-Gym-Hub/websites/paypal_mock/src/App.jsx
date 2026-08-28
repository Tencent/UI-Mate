
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Send from './pages/Send';
import Wallet from './pages/Wallet';
import Activity from './pages/Activity';
import Invoices from './pages/Invoices';
import PaymentLinks from './pages/PaymentLinks';
import Go from './pages/Go';
import Settings from './pages/Settings';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

// Fallback component for 404
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
    <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
  </div>
);

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/send" element={<Send />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payment-links" element={<PaymentLinks />} />
            <Route path="/go" element={<Go />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<RedirectWithQuery to="/" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
