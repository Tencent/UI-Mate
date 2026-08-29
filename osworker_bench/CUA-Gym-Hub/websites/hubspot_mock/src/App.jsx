import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Companies from './pages/Companies';
import Deals from './pages/Deals';
import Tickets from './pages/Tickets';
import Tasks from './pages/Tasks';
import { Templates, Meetings, Forms } from './pages/Marketing';
import Go from './pages/Go';
import PropertiesSettings from './pages/PropertiesSettings';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

// Patch history.pushState / replaceState so all SPA navigations
// automatically preserve the current ?sid=... query (read once from URL,
// then mirrored from sessionStorage('mock_sid') which getSessionId() also writes).
// This keeps the URL stable for copy-paste / refresh / new-tab use cases.
function SidPersistor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__sidPersistorInstalled) return;
    window.__sidPersistorInstalled = true;

    const readSid = () => {
      try {
        const fromUrl = new URLSearchParams(window.location.search).get('sid');
        if (fromUrl) {
          window.sessionStorage.setItem('mock_sid', fromUrl);
          return fromUrl;
        }
        return window.sessionStorage.getItem('mock_sid');
      } catch (_) {
        return null;
      }
    };

    const injectSid = (url) => {
      const sid = readSid();
      if (!sid) return url;
      if (url == null) return url;
      // Only handle string URLs; skip absolute http(s) URLs that point off-app.
      if (typeof url !== 'string') return url;
      try {
        // Build against current origin so relative paths work.
        const u = new URL(url, window.location.origin);
        if (u.origin !== window.location.origin) return url;
        if (!u.searchParams.has('sid')) {
          u.searchParams.set('sid', sid);
        }
        // Preserve relativity: return path+search+hash if input was relative.
        const isAbsolute = /^[a-z]+:\/\//i.test(url);
        return isAbsolute ? u.toString() : `${u.pathname}${u.search}${u.hash}`;
      } catch (_) {
        return url;
      }
    };

    const origPush = window.history.pushState.bind(window.history);
    const origReplace = window.history.replaceState.bind(window.history);

    window.history.pushState = function (state, title, url) {
      return origPush(state, title, injectSid(url));
    };
    window.history.replaceState = function (state, title, url) {
      return origReplace(state, title, injectSid(url));
    };

    // If the very first URL has no sid but sessionStorage does, fix it in place
    // so refresh / copy-link still works.
    const sid = readSid();
    if (sid && !new URLSearchParams(window.location.search).has('sid')) {
      const u = new URL(window.location.href);
      u.searchParams.set('sid', sid);
      origReplace(window.history.state, '', `${u.pathname}${u.search}${u.hash}`);
    }
  }, []);
  return null;
}

function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter>
          <SidPersistor />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="companies" element={<Companies />} />
              <Route path="deals" element={<Deals />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="templates" element={<Templates />} />
              <Route path="meetings" element={<Meetings />} />
              <Route path="forms" element={<Forms />} />
              <Route path="go" element={<Go />} />
              <Route path="properties" element={<PropertiesSettings />} />
              <Route path="*" element={<RedirectWithQuery to="/" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  );
}

export default App;
