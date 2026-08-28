
    import React, { useEffect, useState, useRef, useCallback } from 'react';
    import { useNavigate, useLocation } from 'react-router-dom';
    import { useStore } from '../lib/store';

    const NAV_MAP = {
      c: { path: '', label: 'Code' },
      i: { path: '/issues', label: 'Issues' },
      p: { path: '/pulls', label: 'Pull requests' },
      a: { path: '/actions', label: 'Actions' },
      w: { path: '/wiki', label: 'Wiki' },
      d: { path: '/discussions', label: 'Discussions' },
    };

    export default function KeyboardNav() {
      const navigate = useNavigate();
      const location = useLocation();
      const { state } = useStore();
      const [toast, setToast] = useState(null);
      const gKeyPressed = useRef(false);
      const gTimeout = useRef(null);
      const toastTimeout = useRef(null);

      const showToast = useCallback((message) => {
        setToast(message);
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToast(null), 2000);
      }, []);

      useEffect(() => {
        const handleKeyDown = (e) => {
          // Skip if focused in input/textarea/select
          if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
          if (e.target.isContentEditable) return;

          const key = e.key.toLowerCase();

          if (key === 'g' && !gKeyPressed.current) {
            gKeyPressed.current = true;
            if (gTimeout.current) clearTimeout(gTimeout.current);
            gTimeout.current = setTimeout(() => {
              gKeyPressed.current = false;
            }, 500);
            return;
          }

          if (gKeyPressed.current && NAV_MAP[key]) {
            e.preventDefault();
            gKeyPressed.current = false;
            if (gTimeout.current) clearTimeout(gTimeout.current);

            // Detect current repo context from URL
            const pathParts = location.pathname.split('/').filter(Boolean);
            if (pathParts.length >= 2) {
              const [username, repoName] = pathParts;
              // Verify it's a valid repo
              const repo = state.repos.find(r => r.name === repoName);
              const owner = state.users.find(u => u.username === username);
              if (repo && owner) {
                const target = `/${username}/${repoName}${NAV_MAP[key].path}`;
                showToast(`Go to: ${NAV_MAP[key].label}`);
                navigate(target);
                return;
              }
            }

            // If not in a repo context, try first repo
            const firstRepo = state.repos[0];
            if (firstRepo) {
              const owner = state.users.find(u => u.id === firstRepo.ownerId);
              if (owner) {
                const target = `/${owner.username}/${firstRepo.name}${NAV_MAP[key].path}`;
                showToast(`Go to: ${NAV_MAP[key].label}`);
                navigate(target);
              }
            }
          }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
          if (gTimeout.current) clearTimeout(gTimeout.current);
          if (toastTimeout.current) clearTimeout(toastTimeout.current);
        };
      }, [navigate, location, state, showToast]);

      if (!toast) return null;

      return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
          <div className="bg-[#2d333b] border border-xithub-border text-white text-sm px-4 py-2 rounded-lg shadow-xl flex items-center gap-2">
            <kbd className="bg-[#21262d] border border-xithub-border rounded px-1.5 py-0.5 text-xs font-mono">G</kbd>
            <span className="text-xithub-muted">+</span>
            <span className="font-medium">{toast}</span>
          </div>
        </div>
      );
    }
