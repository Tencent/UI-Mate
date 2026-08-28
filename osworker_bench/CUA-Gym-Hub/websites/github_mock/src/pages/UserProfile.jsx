
import React, { useState } from 'react';
    import { useParams, Link } from 'react-router-dom';
    import { MapPin, Building, LinkIcon, Calendar, Star, GitFork, Book } from 'lucide-react';
    import { useStore } from '../lib/store';

    export default function UserProfile() {
      const { username } = useParams();
      const { state } = useStore();
      const [profileNotice, setProfileNotice] = useState('');

      const user = state.users.find(u => u.username === username);
      if (!user) return <div className="p-8 text-center text-xithub-muted">User not found</div>;

      // Get full user info (currentUser has more fields)
      const fullUser = state.currentUser.id === user.id ? state.currentUser : user;

      // Get user repos sorted by stars
      const userRepos = state.repos
        .filter(r => r.ownerId === user.id)
        .sort((a, b) => (b.stars || 0) - (a.stars || 0))
        .slice(0, 6);

      // Language colors
      const langColors = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        CSS: '#563d7c',
        HTML: '#e34c26',
        Python: '#3572A5',
        Java: '#b07219',
        Markdown: '#083fa1',
      };

      // Contribution graph (decorative) — uses a stable seed based on username
      const weeks = 52;
      const days = 7;
      const generateContribData = () => {
        // Use a seeded pseudo-random approach based on username for stable output
        const seed = (fullUser.username || 'user').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const data = [];
        let n = seed;
        const next = () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 0xffffffff; };
        for (let w = 0; w < weeks; w++) {
          const week = [];
          for (let d = 0; d < days; d++) {
            const rand = next();
            let level = 0;
            if (rand > 0.7) level = 1;
            if (rand > 0.85) level = 2;
            if (rand > 0.93) level = 3;
            if (rand > 0.97) level = 4;
            week.push(level);
          }
          data.push(week);
        }
        return data;
      };

      const contribData = React.useMemo(generateContribData, []);
      const contribColors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      };

      return (
        <div className="container mx-auto px-4 py-8 flex gap-8">
          {/* Left sidebar - Profile info */}
          <div className="w-72 shrink-0">
            <img
              src={fullUser.avatar}
              alt={fullUser.username}
              className="w-72 h-72 rounded-full border-2 border-xithub-border mb-4"
            />
            <h1 className="text-2xl font-bold text-white">{fullUser.name || fullUser.username}</h1>
            <p className="text-xl text-xithub-muted mb-4">{fullUser.username}</p>

            {fullUser.bio && (
              <p className="text-sm text-xithub-text mb-4">{fullUser.bio}</p>
            )}

            <div className="space-y-1 mb-4">
              {fullUser.company && (
                <div className="flex items-center gap-2 text-sm text-xithub-muted">
                  <Building size={16} />
                  <span>{fullUser.company}</span>
                </div>
              )}
              {fullUser.location && (
                <div className="flex items-center gap-2 text-sm text-xithub-muted">
                  <MapPin size={16} />
                  <span>{fullUser.location}</span>
                </div>
              )}
              {fullUser.website && (
                <div className="flex items-center gap-2 text-sm">
                  <LinkIcon size={16} className="text-xithub-muted" />
                  <button type="button" onClick={() => {
                    navigator.clipboard.writeText(fullUser.website).catch(() => {});
                    setProfileNotice('Website URL copied');
                  }} className="text-xithub-accent hover:underline">
                    {fullUser.website.replace(/^https?:\/\//, '')}
                  </button>
                </div>
              )}
              {profileNotice && <div className="text-xs text-xithub-muted">{profileNotice}</div>}
              {fullUser.joinedAt && (
                <div className="flex items-center gap-2 text-sm text-xithub-muted">
                  <Calendar size={16} />
                  <span>Joined {formatDate(fullUser.joinedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Popular Repositories */}
            <h2 className="text-lg font-semibold text-white mb-4">Popular repositories</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {userRepos.map(repo => {
                const owner = state.users.find(u => u.id === repo.ownerId);
                return (
                  <div key={repo.id} className="bg-xithub-card border border-xithub-border rounded-md p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Book size={16} className="text-xithub-muted" />
                      <Link
                        to={`/${owner?.username}/${repo.name}`}
                        className="text-xithub-accent font-semibold hover:underline"
                      >
                        {repo.name}
                      </Link>
                      <span className="text-xs border border-xithub-border rounded-full px-2 py-0.5 text-xithub-muted">
                        {repo.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                    {repo.description && (
                      <p className="text-xs text-xithub-muted mb-3 line-clamp-2">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-xithub-muted">
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: langColors[repo.language] || '#8b949e' }}></span>
                          {repo.language}
                        </div>
                      )}
                      {(repo.stars || 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <Star size={12} /> {repo.stars}
                        </div>
                      )}
                      {(repo.forks || 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <GitFork size={12} /> {repo.forks}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {userRepos.length === 0 && (
                <div className="col-span-2 text-sm text-xithub-muted">No repositories yet.</div>
              )}
            </div>

            {/* Contribution Graph */}
            <h2 className="text-lg font-semibold text-white mb-4">Contribution activity</h2>
            <div className="bg-xithub-card border border-xithub-border rounded-md p-4">
              <div className="overflow-x-auto">
                <div className="flex gap-0.5" style={{ minWidth: '700px' }}>
                  {contribData.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-0.5">
                      {week.map((level, di) => (
                        <div
                          key={di}
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ backgroundColor: contribColors[level] }}
                          title={`${level} contributions`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs text-xithub-muted justify-end">
                <span>Less</span>
                {contribColors.map((color, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
