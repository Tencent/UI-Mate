import React, { useEffect, useRef, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmailList from './components/EmailList';
import ThreadView from './components/ThreadView';
import ComposeModal from './components/ComposeModal';
import ShortcutsModal from './components/ShortcutsModal';
import ErrorBoundary from './components/ErrorBoundary';
import SettingsPage from './pages/Settings';
import { INITIAL_STATE, calculateStateDiff } from './data/mockData';
import { X } from 'lucide-react';

const Toast = () => {
  const { toast, dismissToast } = useStore();
  if (!toast) return null;
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-[#323232] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-4 text-sm">
      <span>{toast.message}</span>
      {toast.undoAction && (
        <button data-undo-btn onClick={() => { toast.undoAction(); dismissToast(); }} className="text-[#8ab4f8] font-medium hover:underline">Undo</button>
      )}
      <button onClick={dismissToast} className="text-gray-400 hover:text-white ml-2"><X size={16} /></button>
    </div>
  );
};

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

const GoRoute = () => {
  const { state, initialState } = useStore();

  // Use tracked initial state if available, otherwise use INITIAL_STATE
  const initial = initialState || INITIAL_STATE;
  const diff = calculateStateDiff(initial, state);

  return (
    <pre className="p-4 bg-gray-100 rounded overflow-auto h-screen text-xs">
      {JSON.stringify({
        initial_state: initial,
        current_state: state,
        state_diff: diff
      }, null, 2)}
    </pre>
  );
};

const KeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state,
    setIsComposeOpen,
    isComposeOpen,
    selectedEmails,
    setSelectedEmails,
    archiveEmails,
    deleteEmails,
    bulkUpdateEmails,
    forwardEmail,
    showToast,
    focusedEmailIndex,
    setFocusedEmailIndex,
    setShowShortcutsModal,
    dismissToast,
    toggleStar,
  } = useStore();

  const pendingGRef = useRef(false);
  const pendingGTimerRef = useRef(null);

  // Determine if we're in a thread view
  const isThreadView = location.pathname.startsWith('/email/');
  // Extract threadId from pathname: /email/<threadId>
  const threadIdMatch = location.pathname.match(/^\/email\/([^/?]+)/);
  const currentThreadId = threadIdMatch ? threadIdMatch[1] : null;

  // Get the current visible email list (mirroring EmailList logic for inbox)
  const visibleEmails = React.useMemo(() => {
    const hash = location.hash.replace(/^#/, '') || '/inbox';
    // Parse folder from hash
    let folder = 'inbox';
    if (hash.startsWith('/starred')) folder = 'starred';
    else if (hash.startsWith('/sent')) folder = 'sent';
    else if (hash.startsWith('/drafts')) folder = 'drafts';
    else if (hash.startsWith('/spam')) folder = 'spam';
    else if (hash.startsWith('/trash')) folder = 'trash';
    else if (hash.startsWith('/all-mail')) folder = 'all-mail';
    else if (hash.startsWith('/snoozed')) folder = 'snoozed';
    else if (hash.startsWith('/important')) folder = 'important';

    const filtered = state.emails
      .filter(email => {
        if (folder === 'starred') return email.starred && email.folder !== 'trash';
        if (folder === 'important') return email.important && email.folder !== 'trash';
        if (folder === 'inbox') return email.folder === 'inbox';
        if (folder === 'all-mail') return email.folder !== 'trash' && email.folder !== 'spam';
        return email.folder === folder;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Deduplicate by threadId (keep most recent per thread), matching EmailList threads logic
    const threadMap = new Map();
    filtered.forEach(email => {
      if (!threadMap.has(email.threadId)) {
        threadMap.set(email.threadId, []);
      }
      threadMap.get(email.threadId).push(email);
    });
    return Array.from(threadMap.values()).map(threadEmails => {
      threadEmails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return threadEmails[0];
    });
  }, [state.emails, location.hash]);

  // Get thread emails for current thread view
  const threadEmails = React.useMemo(() => {
    if (!currentThreadId) return [];
    return state.emails
      .filter(e => e.threadId === currentThreadId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [state.emails, currentThreadId]);

  const lastThreadEmail = threadEmails[threadEmails.length - 1];

  const handleKeyDown = useCallback((e) => {
    // Ignore if typing in input/textarea/contenteditable
    const tag = document.activeElement.tagName;
    if (['INPUT', 'TEXTAREA'].includes(tag)) return;
    if (document.activeElement.isContentEditable) return;
    // Ignore if compose is open (except Z for undo)
    if (isComposeOpen && e.key !== 'Escape') return;

    const key = e.key;
    const isShift = e.shiftKey;

    // Handle pending G + second key
    if (pendingGRef.current) {
      pendingGRef.current = false;
      if (pendingGTimerRef.current) clearTimeout(pendingGTimerRef.current);
      switch (key.toLowerCase()) {
        case 'i':
          e.preventDefault();
          navigate('/inbox');
          return;
        case 't':
          e.preventDefault();
          navigate('/sent');
          return;
        case 'd':
          e.preventDefault();
          navigate('/drafts');
          return;
        case 's':
          e.preventDefault();
          navigate('/starred');
          return;
        default:
          return;
      }
    }

    switch (key) {
      case 'c':
        if (!isShift) {
          e.preventDefault();
          setIsComposeOpen(true);
        }
        break;

      case '/':
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search mail"]');
        if (searchInput) {
          searchInput.focus();
          setTimeout(() => { if (searchInput.value === '/') searchInput.value = ''; }, 0);
        }
        break;

      case 'g':
      case 'G':
        e.preventDefault();
        pendingGRef.current = true;
        pendingGTimerRef.current = setTimeout(() => {
          pendingGRef.current = false;
        }, 1000);
        break;

      case 'j':
      case 'J':
        e.preventDefault();
        if (!isThreadView) {
          const nextIdx = Math.min(focusedEmailIndex + 1, visibleEmails.length - 1);
          setFocusedEmailIndex(nextIdx);
        }
        break;

      case 'k':
      case 'K':
        e.preventDefault();
        if (!isThreadView) {
          const prevIdx = Math.max(focusedEmailIndex - 1, 0);
          setFocusedEmailIndex(prevIdx);
        }
        break;

      case 'Enter':
      case 'o':
      case 'O':
        if (!isThreadView && focusedEmailIndex >= 0 && focusedEmailIndex < visibleEmails.length) {
          e.preventDefault();
          const email = visibleEmails[focusedEmailIndex];
          navigate(`/email/${email.threadId}`);
        }
        break;

      case 'u':
      case 'U':
        if (key === 'U' && isShift) {
          // Shift+U → mark as unread
          e.preventDefault();
          const idsU = isThreadView && threadEmails.length > 0
            ? threadEmails.map(em => em.id)
            : selectedEmails;
          if (idsU.length > 0) bulkUpdateEmails(idsU, { read: false });
        } else if (!isShift && isThreadView) {
          // U → return to thread list
          e.preventDefault();
          navigate(-1);
        }
        break;

      case 'i':
      case 'I':
        if (key === 'I' && isShift) {
          // Shift+I → mark as read
          e.preventDefault();
          const idsI = isThreadView && threadEmails.length > 0
            ? threadEmails.map(em => em.id)
            : selectedEmails;
          if (idsI.length > 0) bulkUpdateEmails(idsI, { read: true });
        }
        break;

      case 'e':
      case 'E':
        e.preventDefault();
        if (selectedEmails.length > 0) {
          archiveEmails(selectedEmails);
        } else if (isThreadView && threadEmails.length > 0) {
          archiveEmails(threadEmails.map(em => em.id));
          navigate(-1);
        }
        break;

      case '#':
        e.preventDefault();
        if (selectedEmails.length > 0) {
          deleteEmails(selectedEmails);
        } else if (isThreadView && threadEmails.length > 0) {
          deleteEmails(threadEmails.map(em => em.id));
          navigate(-1);
        }
        break;

      case 'x':
      case 'X': {
        e.preventDefault();
        if (!isThreadView && focusedEmailIndex >= 0 && focusedEmailIndex < visibleEmails.length) {
          const email = visibleEmails[focusedEmailIndex];
          if (selectedEmails.includes(email.id)) {
            setSelectedEmails(selectedEmails.filter(id => id !== email.id));
          } else {
            setSelectedEmails([...selectedEmails, email.id]);
          }
        }
        break;
      }

      case '+':
      case '=': {
        e.preventDefault();
        const targetEmail = isThreadView ? lastThreadEmail : (focusedEmailIndex >= 0 ? visibleEmails[focusedEmailIndex] : null);
        if (targetEmail) bulkUpdateEmails([targetEmail.id], { important: true });
        break;
      }

      case '-': {
        e.preventDefault();
        const targetEmail = isThreadView ? lastThreadEmail : (focusedEmailIndex >= 0 ? visibleEmails[focusedEmailIndex] : null);
        if (targetEmail) bulkUpdateEmails([targetEmail.id], { important: false });
        break;
      }

      case '!': {
        e.preventDefault();
        const ids = isThreadView && threadEmails.length > 0
          ? threadEmails.map(em => em.id)
          : selectedEmails.length > 0 ? selectedEmails
          : (focusedEmailIndex >= 0 ? [visibleEmails[focusedEmailIndex]?.id].filter(Boolean) : []);
        if (ids.length > 0) {
          bulkUpdateEmails(ids, { folder: 'spam' });
          showToast('Reported as spam', null);
          if (isThreadView) navigate(-1);
        }
        break;
      }

      case 'r':
      case 'R': {
        if (isShift && isThreadView && lastThreadEmail) {
          e.preventDefault();
          // Trigger reply all — dispatch a custom event for ThreadView to catch
          window.dispatchEvent(new CustomEvent('xmail:reply-all'));
        } else if (!isShift && isThreadView && lastThreadEmail) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('xmail:reply'));
        }
        break;
      }

      case 'f':
      case 'F': {
        if (!isShift && isThreadView && lastThreadEmail) {
          e.preventDefault();
          forwardEmail(lastThreadEmail);
        }
        break;
      }

      case 's':
      case 'S': {
        if (!isShift) {
          e.preventDefault();
          // Star the focused email (list view) or the latest email in thread (thread view)
          const starTarget = isThreadView
            ? lastThreadEmail
            : (focusedEmailIndex >= 0 && focusedEmailIndex < visibleEmails.length
              ? visibleEmails[focusedEmailIndex]
              : null);
          if (starTarget) {
            toggleStar(starTarget.id);
          } else if (selectedEmails.length > 0) {
            selectedEmails.forEach(id => toggleStar(id));
          }
        }
        break;
      }

      case 'b':
      case 'B': {
        if (!isShift) {
          e.preventDefault();
          if (isThreadView) {
            window.dispatchEvent(new CustomEvent('xmail:snooze'));
          } else if (focusedEmailIndex >= 0) {
            window.dispatchEvent(new CustomEvent('xmail:snooze', { detail: { emailId: visibleEmails[focusedEmailIndex]?.id } }));
          }
        }
        break;
      }

      case 'v':
      case 'V': {
        e.preventDefault();
        if (isThreadView) {
          window.dispatchEvent(new CustomEvent('xmail:move-to'));
        } else {
          window.dispatchEvent(new CustomEvent('xmail:move-to-list'));
        }
        break;
      }

      case 'l':
      case 'L': {
        e.preventDefault();
        if (isThreadView) {
          window.dispatchEvent(new CustomEvent('xmail:label'));
        } else {
          window.dispatchEvent(new CustomEvent('xmail:label-list'));
        }
        break;
      }

      case 'z':
      case 'Z': {
        e.preventDefault();
        // Trigger the undo of the current toast if available
        window.dispatchEvent(new CustomEvent('xmail:undo'));
        break;
      }

      case '?': {
        e.preventDefault();
        setShowShortcutsModal(true);
        break;
      }

      default:
        break;
    }
  }, [
    isComposeOpen, navigate, location, setIsComposeOpen,
    selectedEmails, setSelectedEmails, archiveEmails, deleteEmails,
    bulkUpdateEmails, forwardEmail, toggleStar,
    showToast, focusedEmailIndex, setFocusedEmailIndex,
    setShowShortcutsModal, dismissToast,
    visibleEmails, threadEmails, lastThreadEmail, isThreadView,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle Z (undo) via custom event
  useEffect(() => {
    const handleUndo = () => {
      // Access toast from store and call undo
      const toastEl = document.querySelector('[data-undo-btn]');
      if (toastEl) toastEl.click();
    };
    window.addEventListener('xmail:undo', handleUndo);
    return () => window.removeEventListener('xmail:undo', handleUndo);
  }, []);

  return null;
};

const Layout = ({ children }) => {
  const { sidebarCollapsed } = useStore();
  return (
    <div className="h-screen w-screen flex flex-col bg-[#f6f8fc] overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <div
          className="overflow-hidden transition-all duration-200 flex-shrink-0"
          style={{ width: sidebarCollapsed ? 0 : 256 }}
        >
          <Sidebar />
        </div>
        <main className="flex-1 p-4 pl-0 overflow-hidden relative">
            {children}
        </main>
      </div>
      <ComposeModal />
      <KeyboardShortcuts />
      <ShortcutsModal />
      <Toast />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<RedirectWithQuery to="/inbox" />} />
            <Route path="/inbox" element={<Layout><EmailList folder="inbox" /></Layout>} />
            <Route path="/starred" element={<Layout><EmailList folder="starred" /></Layout>} />
            <Route path="/important" element={<Layout><EmailList folder="important" /></Layout>} />
            <Route path="/sent" element={<Layout><EmailList folder="sent" /></Layout>} />
            <Route path="/drafts" element={<Layout><EmailList folder="drafts" /></Layout>} />
            <Route path="/snoozed" element={<Layout><EmailList folder="snoozed" /></Layout>} />
            <Route path="/spam" element={<Layout><EmailList folder="spam" /></Layout>} />
            <Route path="/trash" element={<Layout><EmailList folder="trash" /></Layout>} />
            <Route path="/all-mail" element={<Layout><EmailList folder="all-mail" /></Layout>} />
            <Route path="/label/:labelId" element={<Layout><EmailList /></Layout>} />
            <Route path="/email/:threadId" element={<Layout><ThreadView /></Layout>} />
            <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
            <Route path="/go" element={<GoRoute />} />
          </Routes>
        </HashRouter>
      </StoreProvider>
    </ErrorBoundary>
  );
}

export default App;
