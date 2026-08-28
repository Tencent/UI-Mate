
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import DraftOrders from './pages/DraftOrders';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Analytics from './pages/Analytics';
import Marketing from './pages/Marketing';
import Discounts from './pages/Discounts';
import Collections from './pages/Collections';
import OnlineStore from './pages/OnlineStore';
import Themes from './pages/Themes';
import BlogPosts from './pages/BlogPosts';
import Pages from './pages/Pages';
import Navigation from './pages/Navigation';
import Preferences from './pages/Preferences';
import Settings from './pages/Settings';
import Content from './pages/Content';
import Go from './pages/Go';

function RedirectWithQuery({ to }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Main App Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />

            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />

            <Route path="collections" element={<Collections />} />

            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />

            <Route path="draft-orders" element={<DraftOrders />} />

            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />

            <Route path="content" element={<Content />} />

            <Route path="analytics" element={<Analytics />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="discounts" element={<Discounts />} />

            {/* Online Store sub-routes */}
            <Route path="online-store" element={<OnlineStore />} />
            <Route path="online-store/themes" element={<Themes />} />
            <Route path="online-store/blog-posts" element={<BlogPosts />} />
            <Route path="online-store/pages" element={<Pages />} />
            <Route path="online-store/navigation" element={<Navigation />} />
            <Route path="online-store/preferences" element={<Preferences />} />

            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Special Route for State Inspection */}
          <Route path="/go" element={<Go />} />

          <Route path="*" element={<RedirectWithQuery to="/" />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
