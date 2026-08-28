
    import React, { useState } from 'react';
    import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
    import { StoreProvider } from './context/StoreContext';
    import Navbar from './components/Navbar';
    import CartDrawer from './components/CartDrawer';
    import CartSwitchDialog from './components/CartSwitchDialog';
    import Home from './pages/Home';
    import RestaurantDetails from './pages/RestaurantDetails';
    import Checkout from './pages/Checkout';
    import Orders from './pages/Orders';
    import GoEndpoint from './pages/GoEndpoint';

    function RedirectWithQuery({ to }) {
      const [searchParams] = useSearchParams();
      const query = searchParams.toString();
      return <Navigate to={query ? `${to}?${query}` : to} replace />;
    }

    function Layout({ children }) {
      const [isCartOpen, setIsCartOpen] = useState(false);
      const location = useLocation();

      // Don't show layout on /go
      if (location.pathname === '/go') {
        return children;
      }

      return (
        <div className="min-h-screen bg-white">
          <Navbar toggleCart={() => setIsCartOpen(true)} />
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          <CartSwitchDialog />
          <main>
            {children}
          </main>
        </div>
      );
    }

    export default function App() {
      return (
        <StoreProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/go" element={<GoEndpoint />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </StoreProvider>
      );
    }
