import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import PaymentDetail from './pages/PaymentDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Subscriptions from './pages/Subscriptions';
import SubscriptionDetail from './pages/SubscriptionDetail';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Balance from './pages/Balance';
import Reports from './pages/Reports';
import Disputes from './pages/Disputes';
import Settings from './pages/Settings';
import Developers from './pages/Developers';
import Go from './pages/Go';

function RedirectWithQuery({ to }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/go" element={<Go />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />

            <Route path="payments" element={<Payments />} />
            <Route path="payments/:id" element={<PaymentDetail />} />

            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />

            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="subscriptions/:id" element={<SubscriptionDetail />} />
            {/* /invoices/new is a dedicated route to prevent conflict with /invoices/:id */}
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<Invoices />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />

            <Route path="balance" element={<Balance />} />
            <Route path="balances" element={<Balance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="disputes" element={<Disputes />} />

            <Route path="settings" element={<Settings />} />
            <Route path="developers" element={<Developers />} />
            <Route path="*" element={<RedirectWithQuery to="/" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

