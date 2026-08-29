
    import React, { useState } from 'react';
    import { Link } from 'react-router-dom';
    import { Book, Star, Lock } from 'lucide-react';
    import { useStore } from '../lib/store';

    export default function Dashboard() {
      const { state, dispatch, actions } = useStore();
      const { repos, currentUser } = state;
      const [starredRepos, setStarredRepos] = useState({});
      const [showAllSidebar, setShowAllSidebar] = useState(false);

      const myRepos = repos.filter(r => r.ownerId === currentUser.id);
      const sidebarRepos = showAllSidebar ? myRepos : myRepos.slice(0, 5);

      const handleStar = (repoId) => {
        const wasStarred = starredRepos[repoId] || false;
        dispatch({
          type: actions.STAR_REPO,
          payload: { repoId, starred: !wasStarred }
        });
        setStarredRepos(prev => ({ ...prev, [repoId]: !wasStarred }));
      };

      return (
        <div className="container mx-auto px-4 py-8 flex gap-8">
          {/* Sidebar */}
          <aside className="w-1/4 hidden md:block">
            <div className="mb-6">
              <h2 className="font-semibold text-sm mb-2">Top Repositories</h2>
              <div className="flex flex-col gap-1">
                {sidebarRepos.map(repo => (
                  <Link
                    key={repo.id}
                    to={`/${currentUser.username}/${repo.name}`}
                    className="flex items-center gap-2 p-2 hover:bg-xithub-card rounded text-sm"
                  >
                    <img src={`https://picsum.photos/20/20?random=${repo.id}`} alt={repo.name} className="w-4 h-4 rounded-full" />
                    <span className="font-semibold text-white">{currentUser.username}/{repo.name}</span>
                  </Link>
                ))}
              </div>
              {myRepos.length > 5 && (
                <button
                  onClick={() => setShowAllSidebar(!showAllSidebar)}
                  className="mt-4 text-xs text-xithub-muted hover:text-xithub-accent flex items-center gap-1"
                >
                  {showAllSidebar ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>

            <div className="border-t border-xithub-border pt-4">
              <h2 className="font-semibold text-sm mb-2">Recent activity</h2>
              <div className="border border-xithub-border rounded-md p-4 bg-xithub-card text-xs text-xithub-muted text-center">
                When you have activity, we'll show it here.
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-white mb-4">Home</h1>
              <div className="bg-xithub-card border border-xithub-border rounded-md p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Discover interesting projects</h3>
                <p className="text-xithub-muted mb-4">Explore what others are building on GitMock.</p>
                <Link
                  to={repos[0] ? `/${state.users.find(u => u.id === repos[0].ownerId)?.username}/${repos[0].name}` : '/'}
                  className="inline-block bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90"
                >
                  Explore
                </Link>
              </div>
            </div>

            <h2 className="font-semibold text-white mb-3">All Repositories</h2>
            <div className="grid gap-4">
              {repos.map(repo => {
                const owner = state.users.find(u => u.id === repo.ownerId);
                const isStarred = starredRepos[repo.id] || false;
                return (
                  <div key={repo.id} className="bg-xithub-card border border-xithub-border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Book size={16} className="text-xithub-muted" />
                        <Link to={`/${owner?.username}/${repo.name}`} className="text-xithub-accent font-semibold hover:underline text-lg">
                          {owner?.username} / {repo.name}
                        </Link>
                        <span className="text-xs border border-xithub-border rounded-full px-2 py-0.5 text-xithub-muted">
                          {repo.isPrivate ? 'Private' : 'Public'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleStar(repo.id)}
                        className={`border border-xithub-border px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isStarred ? 'bg-[#2d1f00] border-yellow-700 hover:bg-[#3d2a00]' : 'bg-[#21262d] hover:bg-[#30363d]'
                        }`}
                      >
                        <Star size={14} className={isStarred ? 'fill-yellow-400 text-yellow-400' : ''} />
                        {isStarred ? 'Starred' : 'Star'}
                      </button>
                    </div>
                    <p className="text-sm text-xithub-muted mb-4">{repo.description}</p>
                    <div className="flex items-center gap-4 text-xs text-xithub-muted">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                        {repo.language}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} /> {repo.stars}
                      </div>
                      <div>Updated {new Date(repo.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
