import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Banner from './components/Banner';
import Navigator from './components/Navigator';
import Dashboard from './pages/Dashboard';
import StateInspector from './pages/StateInspector';
import IncidentList from './pages/IncidentList';
import IncidentForm from './pages/IncidentForm';
import ProblemList from './pages/ProblemList';
import ProblemForm from './pages/ProblemForm';
import ChangeList from './pages/ChangeList';
import ChangeForm from './pages/ChangeForm';
import ServiceCatalog from './pages/ServiceCatalog';
import CatalogCategory from './pages/CatalogCategory';
import CatalogItemDetail from './pages/CatalogItemDetail';
import ShoppingCart from './pages/ShoppingCart';
import KnowledgeBase from './pages/KnowledgeBase';
import KnowledgeArticle from './pages/KnowledgeArticle';
import CMDBList from './pages/CMDBList';
import CMDBDetail from './pages/CMDBDetail';
import Reports from './pages/Reports';
import GlobalSearch from './pages/GlobalSearch';

function NotFound() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const sp = sid ? `?sid=${sid}` : '';
  return (
    <div className="sn-page-body" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Page Not Found</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>The page you are looking for does not exist.</p>
      <button className="sn-btn sn-btn-primary" onClick={() => navigate('/' + sp)}>Go to Home</button>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const isGoPage = location.pathname === '/go';

  if (isGoPage) {
    return <StateInspector />;
  }

  return (
    <div className="sn-app">
      <Banner />
      <div className="sn-app-body">
        <Navigator />
        <main className="sn-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incident/list" element={<IncidentList />} />
            <Route path="/incident/create" element={<IncidentForm />} />
            <Route path="/incident/:id" element={<IncidentForm />} />
            <Route path="/problem/list" element={<ProblemList />} />
            <Route path="/problem/create" element={<ProblemForm />} />
            <Route path="/problem/:id" element={<ProblemForm />} />
            <Route path="/change/list" element={<ChangeList />} />
            <Route path="/change/create" element={<ChangeForm />} />
            <Route path="/change/:id" element={<ChangeForm />} />
            <Route path="/catalog" element={<ServiceCatalog />} />
            <Route path="/catalog/category/:id" element={<CatalogCategory />} />
            <Route path="/catalog/item/:id" element={<CatalogItemDetail />} />
            <Route path="/catalog/cart" element={<ShoppingCart />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="/knowledge/article/:id" element={<KnowledgeArticle />} />
            <Route path="/cmdb/list" element={<CMDBList />} />
            <Route path="/cmdb/:id" element={<CMDBDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/search" element={<GlobalSearch />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/go" element={<StateInspector />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
