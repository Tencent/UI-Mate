
    import React from 'react';
    import { useOutletContext, Link } from 'react-router-dom';
    import { useStore } from '../../lib/store';
    import { Users } from 'lucide-react';

    export default function Contributors() {
      const { repo, owner } = useOutletContext();
      const { state } = useStore();

      const repoCommits = state.commits.filter(c => c.repoId === repo.id);

      // Group commits by authorId
      const contributorMap = {};
      repoCommits.forEach(c => {
        if (!contributorMap[c.authorId]) {
          contributorMap[c.authorId] = {
            authorId: c.authorId,
            count: 0,
            additions: 0,
            deletions: 0,
            lastDate: c.date,
            firstDate: c.date,
          };
        }
        contributorMap[c.authorId].count++;
        contributorMap[c.authorId].additions += c.additions || 0;
        contributorMap[c.authorId].deletions += c.deletions || 0;
        if (new Date(c.date) > new Date(contributorMap[c.authorId].lastDate)) {
          contributorMap[c.authorId].lastDate = c.date;
        }
        if (new Date(c.date) < new Date(contributorMap[c.authorId].firstDate)) {
          contributorMap[c.authorId].firstDate = c.date;
        }
      });

      const contributors = Object.values(contributorMap).sort((a, b) => b.count - a.count);
      const maxCommits = Math.max(...contributors.map(c => c.count), 1);

      const timeAgo = (dateStr) => {
        const now = new Date();
        const d = new Date(dateStr);
        const diffMs = now - d;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'today';
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 30) return `${diffDays} days ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
      };

      return (
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Users size={20} className="text-xithub-muted" />
            <h2 className="text-xl font-semibold text-white">Contributors</h2>
            <span className="text-sm text-xithub-muted">({contributors.length})</span>
          </div>

          {contributors.length === 0 ? (
            <div className="bg-xithub-card border border-xithub-border rounded-md p-12 text-center">
              <Users size={48} className="mx-auto mb-4 text-xithub-muted opacity-50" />
              <h3 className="text-lg font-semibold text-white">No contributors yet</h3>
              <p className="text-xithub-muted text-sm">There are no commits in this repository.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contributors.map((contributor, index) => {
                const user = state.users.find(u => u.id === contributor.authorId);
                const barWidth = (contributor.count / maxCommits) * 100;
                return (
                  <div key={contributor.authorId} className="bg-xithub-card border border-xithub-border rounded-md overflow-hidden">
                    <div className="p-4 flex items-center gap-4">
                      <span className="text-xithub-muted text-sm font-mono w-6 text-right shrink-0">#{index + 1}</span>
                      <img
                        src={user?.avatar || `https://avatars.githubusercontent.com/u/0?v=4`}
                        alt={user?.username || 'unknown'}
                        className="w-10 h-10 rounded-full border border-xithub-border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/profile/${user?.username || 'unknown'}`}
                            className="font-semibold text-xithub-accent hover:underline"
                          >
                            {user?.username || 'unknown'}
                          </Link>
                          {user?.name && (
                            <span className="text-sm text-xithub-muted">{user.name}</span>
                          )}
                        </div>
                        <div className="text-xs text-xithub-muted mt-0.5">
                          {contributor.count} {contributor.count === 1 ? 'commit' : 'commits'}
                          {' / '}
                          <span className="text-green-400">++{contributor.additions}</span>
                          {' '}
                          <span className="text-red-400">--{contributor.deletions}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-xithub-muted">Last commit {timeAgo(contributor.lastDate)}</div>
                      </div>
                    </div>
                    <div className="px-4 pb-3">
                      <div className="h-2 bg-[#0d1117] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-xithub-success rounded-full transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
