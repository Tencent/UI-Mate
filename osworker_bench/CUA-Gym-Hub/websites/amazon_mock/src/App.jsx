import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { ProductListing } from './pages/ProductListing';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Wishlist } from './pages/Wishlist';
import { Profile } from './pages/Profile';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Go } from './pages/Go';

const Footer = () => {
  const year = new Date().getFullYear();
  const [footerPanel, setFooterPanel] = React.useState(null);
  const footerLinks = {
    company: ['Careers', 'Blog', 'About Xmazon', 'Investor Relations', 'Xmazon Devices', 'Xmazon Science'],
    seller: ['Sell products on Xmazon', 'Sell on Xmazon Business', 'Sell apps on Xmazon', 'Become an Affiliate', 'Advertise Your Products', 'Self-Publish with Us'],
    payments: ['Xmazon Business Card', 'Shop with Points', 'Reload Your Balance', 'Xmazon Currency Converter'],
    help: ['Shipping Rates & Policies', 'Returns & Replacements', 'Manage Your Content and Devices', 'Help'],
    legal: ['Conditions of Use', 'Privacy Notice', 'Consumer Health Data Privacy Disclosure', 'Your Ads Privacy Choices'],
  };
  const openFooterPanel = (label) => setFooterPanel(label);
  const FooterButton = ({ children }) => (
    <button type="button" onClick={() => openFooterPanel(children)} className="hover:underline text-left">
      {children}
    </button>
  );
  return (
    <footer className="mt-auto">
      {/* Back to top bar */}
      <div
        className="bg-[#37475a] text-white text-[13px] text-center py-3.5 cursor-pointer hover:bg-[#485769] transition-colors"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        Back to top
      </div>

      {/* Main footer links */}
      <div className="bg-[#232f3e] text-white py-10 px-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-[14px] mb-3">Get to Know Us</h4>
            <ul className="space-y-2 text-[#ddd] text-[13px]">
              {footerLinks.company.map(label => <li key={label}><FooterButton>{label}</FooterButton></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[14px] mb-3">Make Money with Us</h4>
            <ul className="space-y-2 text-[#ddd] text-[13px]">
              {footerLinks.seller.map(label => <li key={label}><FooterButton>{label}</FooterButton></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[14px] mb-3">Xmazon Payment Products</h4>
            <ul className="space-y-2 text-[#ddd] text-[13px]">
              {footerLinks.payments.map(label => <li key={label}><FooterButton>{label}</FooterButton></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[14px] mb-3">Let Us Help You</h4>
            <ul className="space-y-2 text-[#ddd] text-[13px]">
              <li><Link to="/profile" className="hover:underline">Your Account</Link></li>
              <li><Link to="/orders" className="hover:underline">Your Orders</Link></li>
              {footerLinks.help.map(label => <li key={label}><FooterButton>{label}</FooterButton></li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#131a22] text-white border-t border-gray-700 py-6 px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[20px] font-bold tracking-tight">xmazon</span>
          <span className="text-[10px] text-xmazon-orange font-medium">.mock</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-[12px] text-[#999] mb-2">
          {footerLinks.legal.map(label => <FooterButton key={label}>{label}</FooterButton>)}
        </div>
        <div className="text-[12px] text-[#999]">&copy; 1996-{year}, Xmazon.mock, Inc. or its affiliates</div>
      </div>

      {footerPanel && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setFooterPanel(null)}>
          <div className="bg-white text-[#111] rounded-lg shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between gap-4 items-start mb-3">
              <h2 className="text-lg font-bold">{footerPanel}</h2>
              <button type="button" aria-label="Close footer information" onClick={() => setFooterPanel(null)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <p className="text-sm text-gray-700 leading-6">
              This local Xmazon.mock sandbox keeps external company pages inside the training environment. Use the account, orders, wishlist, search, and cart links for task-relevant workflows.
            </p>
            <div className="flex justify-end mt-5">
              <button type="button" onClick={() => setFooterPanel(null)} className="bg-xmazon-yellow hover:bg-xmazon-darkYellow px-5 py-2 rounded text-sm font-bold">Done</button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

const Layout = () => (
  <div className="min-h-screen flex flex-col bg-[#eaeded]">
    <Header />
    <main className="flex-1 pb-6">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<ProductListing />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="orders" element={<Orders />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="/go" element={<Go />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
