
    import React, { useState } from 'react';
    import { Outlet, useParams, Link, useLocation, useNavigate } from 'react-router-dom';
    import { Code, AlertCircle, GitPullRequest, PlayCircle, BookOpen, Shield, Settings, Eye, Star, GitFork, BarChart2, MessageCircle } from 'lucide-react';
    import { useStore } from '../../lib/store';
    import { cn } from '../../lib/utils';

    export default function RepoLayout() {
      const { username, repoName } = useParams();
      const location = useLocation();
      const navigate = useNavigate();
      const { state, dispatch, actions } = useStore();
      const [isStarred, setIsStarred] = useState(false);
      const [isWatching, setIsWatching] = useState(false);

      const repo = state.repos.find(r => r.name === repoName);
      const owner = state.users.find(u => u.username === username);

      if (!repo) return <div className="p-8 text-center">Repository not found</div>;

      const tabs = [
        { name: 'Code', icon: Code, path: '' },
        { name: 'Issues', icon: AlertCircle, path: '/issues', count: state.issues.filter(i => i.repoId === repo.id && i.status === 'open').length },
        { name: 'Pull requests', icon: GitPullRequest, path: '/pulls', count: state.pullRequests.filter(p => p.repoId === repo.id && p.status === 'open').length },
        { name: 'Discussions', icon: MessageCircle, path: '/discussions' },
        { name: 'Actions', icon: PlayCircle, path: '/actions' },
        { name: 'Projects', icon: BookOpen, path: '/projects' },
        { name: 'Wiki', icon: BookOpen, path: '/wiki' },
        { name: 'Security', icon: Shield, path: '/security' },
        { name: 'Insights', icon: BarChart2, path: '/insights' },
        { name: 'Settings', icon: Settings, path: '/settings' },
      ];

      const isCurrentTab = (path) => {
        if (path === '') return location.pathname === `/${username}/${repoName}`;
        return location.pathname.startsWith(`/${username}/${repoName}${path}`);
      };

      const handleStar = () => {
        dispatch({
          type: actions.STAR_REPO,
          payload: { repoId: repo.id, starred: !isStarred }
        });
        setIsStarred(!isStarred);
      };

      const handleWatch = () => {
        dispatch({
          type: actions.WATCH_REPO,
          payload: { repoId: repo.id, watched: !isWatching }
        });
        setIsWatching(!isWatching);
      };

      const handleFork = () => {
        // Check if current user already forked this repo
        const alreadyForked = state.repos.find(r => r.forkedFrom === repo.id && r.ownerId === state.currentUser.id);
        if (alreadyForked) {
          navigate(`/${state.currentUser.username}/${alreadyForked.name}`);
          return;
        }
        dispatch({
          type: actions.FORK_REPO,
          payload: { repoId: repo.id }
        });
        // Navigate to the forked repo
        navigate(`/${state.currentUser.username}/${repo.name}`);
      };

      return (
        <div className="bg-xithub-bg min-h-screen">
          <div className="bg-xithub-bg border-b border-xithub-border pt-4 px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-lg">
                <BookOpen size={18} className="text-xithub-muted" />
                <Link to="/" className="text-xithub-accent hover:underline">{owner?.username}</Link>
                <span className="text-xithub-muted">/</span>
                <Link to={`/${owner?.username}/${repo.name}`} className="text-xithub-accent font-semibold hover:underline">{repo.name}</Link>
                <span className="text-xs border border-xithub-border rounded-full px-2 py-0.5 text-xithub-muted ml-2">
                  {repo.isPrivate ? 'Private' : 'Public'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={handleWatch}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1 border border-xithub-border rounded-l-md text-xithub-text transition-colors",
                      isWatching ? "bg-[#30363d] hover:bg-[#21262d]" : "bg-[#21262d] hover:bg-[#30363d]"
                    )}
                  >
                    <Eye size={16} /> {isWatching ? 'Unwatch' : 'Watch'}
                  </button>
                  <div className="bg-[#21262d] border-y border-r border-xithub-border px-2 py-1 rounded-r-md text-xithub-text font-semibold">{repo.watchers || 12}</div>
                </div>
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={handleFork}
                    className="flex items-center gap-2 px-3 py-1 bg-[#21262d] border border-xithub-border rounded-l-md hover:bg-[#30363d] text-xithub-text"
                  >
                    <GitFork size={16} /> Fork
                  </button>
                  <div className="bg-[#21262d] border-y border-r border-xithub-border px-2 py-1 rounded-r-md text-xithub-text font-semibold">{repo.forks}</div>
                </div>
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={handleStar}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1 border border-xithub-border rounded-l-md text-xithub-text transition-colors",
                      isStarred
                        ? "bg-[#2d1f00] hover:bg-[#3d2a00] border-yellow-700"
                        : "bg-[#21262d] hover:bg-[#30363d]"
                    )}
                  >
                    <Star size={16} className={isStarred ? "fill-yellow-400 text-yellow-400" : ""} />
                    {isStarred ? 'Starred' : 'Star'}
                  </button>
                  <div className="bg-[#21262d] border-y border-r border-xithub-border px-2 py-1 rounded-r-md text-xithub-text font-semibold">{repo.stars}</div>
                </div>
              </div>
            </div>

            <nav className="flex gap-1 overflow-x-auto">
              {tabs.map(tab => (
                <Link
                  key={tab.name}
                  to={`/${username}/${repoName}${tab.path}`}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors whitespace-nowrap",
                    isCurrentTab(tab.path)
                      ? "border-[#fd8c73] text-white font-semibold"
                      : "border-transparent text-xithub-text hover:border-xithub-border hover:text-xithub-muted"
                  )}
                >
                  <tab.icon size={16} />
                  {tab.name}
                  {tab.count !== undefined && (
                    <span className="bg-[#30363d] text-white text-xs px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <Outlet context={{ repo, owner }} />
          </div>
        </div>
      );
    }
