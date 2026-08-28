import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import StoreSelector from './pages/StoreSelector';
import ProductBrowser from './pages/ProductBrowser';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';
import Account from './pages/Account';
import Go from './pages/Go';

function RedirectWithQuery({ to, replace }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace={replace} />;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/go" element={<Go />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<StoreSelector />} />
            <Route path="store/:storeId" element={<ProductBrowser />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-status" element={<OrderStatus />} />
            <Route path="orders" element={<RedirectWithQuery to="/order-status" replace />} />
            <Route path="account" element={<Account />} />
            <Route path="profile" element={<RedirectWithQuery to="/account" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
