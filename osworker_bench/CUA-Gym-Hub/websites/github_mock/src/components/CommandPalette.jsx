
    import React, { useState, useEffect, useRef, useCallback } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Search, FileCode, AlertCircle, GitPullRequest, Settings, BookOpen, PlayCircle, MessageCircle, Tag, GitBranch } from 'lucide-react';
    import { useStore } from '../lib/store';

    export default function CommandPalette() {
      const [isOpen, setIsOpen] = useState(false);
      const [query, setQuery] = useState('');
      const [selectedIndex, setSelectedIndex] = useState(0);
      const navigate = useNavigate();
      const { state } = useStore();
      const inputRef = useRef(null);
      const listRef = useRef(null);

      // Open on Ctrl+K / Cmd+K
      useEffect(() => {
        const handleKeyDown = (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen(prev => !prev);
          }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }, []);

      // Focus input when opening
      useEffect(() => {
        if (isOpen) {
          setQuery('');
          setSelectedIndex(0);
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      }, [isOpen]);

      const getResults = useCallback(() => {
        const results = [];
        const q = query.toLowerCase().trim();

        // Repos
        state.repos.forEach(repo => {
          const owner = state.users.find(u => u.id === repo.ownerId);
          if (!owner) return;
          if (!q || repo.name.toLowerCase().includes(q) || repo.description?.toLowerCase().includes(q)) {
            results.push({
              type: 'repo',
              icon: FileCode,
              title: `${owner.username}/${repo.name}`,
              subtitle: repo.description || '',
              path: `/${owner.username}/${repo.name}`,
            });
          }
        });

        // Issues
        state.issues.forEach(issue => {
          const repo = state.repos.find(r => r.id === issue.repoId);
          const owner = repo ? state.users.find(u => u.id === repo.ownerId) : null;
          if (!repo || !owner) return;
          if (!q || issue.title.toLowerCase().includes(q)) {
            results.push({
              type: 'issue',
              icon: AlertCircle,
              title: `#${issue.number} ${issue.title}`,
              subtitle: `${owner.username}/${repo.name}`,
              path: `/${owner.username}/${repo.name}/issues/${issue.number}`,
            });
          }
        });

        // PRs
        state.pullRequests.forEach(pr => {
          const repo = state.repos.find(r => r.id === pr.repoId);
          const owner = repo ? state.users.find(u => u.id === repo.ownerId) : null;
          if (!repo || !owner) return;
          if (!q || pr.title.toLowerCase().includes(q)) {
            results.push({
              type: 'pr',
              icon: GitPullRequest,
              title: `#${pr.number} ${pr.title}`,
              subtitle: `${owner.username}/${repo.name}`,
              path: `/${owner.username}/${repo.name}/pulls/${pr.number}`,
            });
          }
        });

        // Pages (for first repo)
        if (state.repos.length > 0) {
          const firstRepo = state.repos[0];
          const owner = state.users.find(u => u.id === firstRepo.ownerId);
          if (owner) {
            const basePath = `/${owner.username}/${firstRepo.name}`;
            const pages = [
              { icon: PlayCircle, title: 'Actions', path: `${basePath}/actions` },
              { icon: BookOpen, title: 'Wiki', path: `${basePath}/wiki` },
              { icon: Settings, title: 'Settings', path: `${basePath}/settings` },
              { icon: MessageCircle, title: 'Discussions', path: `${basePath}/discussions` },
              { icon: Tag, title: 'Releases', path: `${basePath}/releases` },
              { icon: GitBranch, title: 'Branches', path: `${basePath}/branches` },
            ];
            pages.forEach(page => {
              if (!q || page.title.toLowerCase().includes(q)) {
                results.push({
                  type: 'page',
                  icon: page.icon,
                  title: page.title,
                  subtitle: `${owner.username}/${firstRepo.name}`,
                  path: page.path,
                });
              }
            });
          }
        }

        return results.slice(0, 15);
      }, [query, state]);

      const results = getResults();

      const handleSelect = (result) => {
        navigate(result.path);
        setIsOpen(false);
      };

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
          e.preventDefault();
          handleSelect(results[selectedIndex]);
        }
      };

      // Scroll selected item into view
      useEffect(() => {
        if (listRef.current) {
          const selected = listRef.current.children[selectedIndex];
          if (selected) {
            selected.scrollIntoView({ block: 'nearest' });
          }
        }
      }, [selectedIndex]);

      // Reset selection when query changes
      useEffect(() => {
        setSelectedIndex(0);
      }, [query]);

      if (!isOpen) return null;

      return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-[640px] max-h-[400px] bg-[#161b22] border border-xithub-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-xithub-border">
              <Search size={18} className="text-xithub-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search or jump to..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-xithub-muted"
              />
              <kbd className="text-[10px] text-xithub-muted border border-xithub-border rounded px-1.5 py-0.5 font-mono">ESC</kbd>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-auto" ref={listRef}>
              {results.length === 0 ? (
                <div className="p-6 text-center text-xithub-muted text-sm">
                  No results found{query ? ` for "${query}"` : ''}
                </div>
              ) : (
                results.map((result, idx) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={`${result.type}-${result.path}-${idx}`}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm ${
                        idx === selectedIndex ? 'bg-[#1f6feb33]' : 'hover:bg-[#21262d]'
                      }`}
                    >
                      <Icon size={16} className="text-xithub-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xithub-text truncate">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-xs text-xithub-muted truncate">{result.subtitle}</div>
                        )}
                      </div>
                      <span className="text-[10px] text-xithub-muted uppercase tracking-wide shrink-0">
                        {result.type}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-xithub-border px-4 py-2 flex items-center gap-4 text-[10px] text-xithub-muted">
              <span className="flex items-center gap-1">
                <kbd className="border border-xithub-border rounded px-1 py-0.5 font-mono">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="border border-xithub-border rounded px-1 py-0.5 font-mono">↵</kbd> select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="border border-xithub-border rounded px-1 py-0.5 font-mono">esc</kbd> close
              </span>
            </div>
          </div>
        </div>
      );
    }
