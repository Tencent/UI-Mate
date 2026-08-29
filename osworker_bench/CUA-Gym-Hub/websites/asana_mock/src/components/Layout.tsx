
import { useEffect, useState, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import { X } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const tabPressedRef = useRef(false);
  const tabTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isInputFocused = useCallback(() => {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K: focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
        } else {
          navigate('/search');
        }
        return;
      }

      // Cmd/Ctrl+/ : show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }

      // Escape: close shortcuts dialog or any modal
      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        return;
      }

      // Skip Tab-prefixed shortcuts when typing in inputs
      if (isInputFocused()) return;

      // Tab key starts the two-step shortcut sequence
      if (e.key === 'Tab') {
        e.preventDefault();
        tabPressedRef.current = true;
        if (tabTimeoutRef.current) clearTimeout(tabTimeoutRef.current);
        tabTimeoutRef.current = setTimeout(() => {
          tabPressedRef.current = false;
        }, 500);
        return;
      }

      // Second key in Tab+X sequence
      if (tabPressedRef.current) {
        tabPressedRef.current = false;
        if (tabTimeoutRef.current) clearTimeout(tabTimeoutRef.current);

        switch (e.key.toLowerCase()) {
          case 'q':
            // Open quick-add modal - dispatch custom event
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('open-quick-add'));
            break;
          case 'z':
            e.preventDefault();
            navigate('/my-tasks');
            break;
          case 'i':
            e.preventDefault();
            navigate('/inbox');
            break;
          case 'n':
            e.preventDefault();
            // Focus the first "Add task" or "Add card" button in the view
            const addBtn = document.querySelector('.add-task-btn, .board-add-card-btn') as HTMLElement;
            if (addBtn) addBtn.click();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (tabTimeoutRef.current) clearTimeout(tabTimeoutRef.current);
    };
  }, [navigate, showShortcuts, isInputFocused]);

  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: ['Cmd/Ctrl', 'K'], action: 'Search' },
      { keys: ['Tab', 'Z'], action: 'My Tasks' },
      { keys: ['Tab', 'I'], action: 'Inbox' },
    ]},
    { category: 'Actions', items: [
      { keys: ['Tab', 'Q'], action: 'Quick add task' },
      { keys: ['Tab', 'N'], action: 'Add task in current view' },
    ]},
    { category: 'General', items: [
      { keys: ['Cmd/Ctrl', '/'], action: 'Show shortcuts' },
      { keys: ['Escape'], action: 'Close modal/panel' },
    ]},
  ];

  return (
    <div className="layout">
      <TopNav />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-main">
          <Outlet />
        </main>
      </div>

      {showShortcuts && (
        <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
          <div className="shortcuts-dialog" onClick={e => e.stopPropagation()}>
            <div className="shortcuts-dialog-header">
              <h2>Keyboard Shortcuts</h2>
              <button className="shortcuts-close-btn" onClick={() => setShowShortcuts(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="shortcuts-dialog-body">
              {shortcuts.map(group => (
                <div key={group.category} className="shortcuts-group">
                  <h3>{group.category}</h3>
                  {group.items.map((item, idx) => (
                    <div key={idx} className="shortcuts-item">
                      <span className="shortcuts-action">{item.action}</span>
                      <div className="shortcuts-keys">
                        {item.keys.map((key, kidx) => (
                          <span key={kidx}>
                            <kbd>{key}</kbd>
                            {kidx < item.keys.length - 1 && <span className="key-separator">+</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
