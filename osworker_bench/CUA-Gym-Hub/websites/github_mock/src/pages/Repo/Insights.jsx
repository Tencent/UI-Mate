
    import React from 'react';
    import { useOutletContext, Link } from 'react-router-dom';
    import { useStore } from '../../lib/store';

    export default function Insights() {
      const { repo, owner } = useOutletContext();
      const { state } = useStore();

      const repoCommits = state.commits.filter(c => c.repoId === repo.id);

      // Contributors data
      const contributorMap = {};
      repoCommits.forEach(c => {
        if (!contributorMap[c.authorId]) {
          contributorMap[c.authorId] = { authorId: c.authorId, count: 0, lastDate: c.date };
        }
        contributorMap[c.authorId].count++;
        if (new Date(c.date) > new Date(contributorMap[c.authorId].lastDate)) {
          contributorMap[c.authorId].lastDate = c.date;
        }
      });
      const contributors = Object.values(contributorMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      const maxCommits = Math.max(...contributors.map(c => c.count), 1);

      // Commit activity - fake weekly data based on real commits
      const weeklyActivity = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const count = repoCommits.filter(c => {
          const d = new Date(c.date);
          return d >= weekStart && d < weekEnd;
        }).length;
        // Fallback: use a deterministic value based on week index instead of Math.random()
        weeklyActivity.push({
          week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: count > 0 ? count : 0
        });
      }
      const maxWeekly = Math.max(...weeklyActivity.map(w => w.count), 1);

      // Code frequency data - additions/deletions from commits
      const codeFrequency = repoCommits
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-8)
        .map(c => ({
          label: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          additions: c.additions || 0,
          deletions: c.deletions || 0,
        }));
      const maxCodeFreq = Math.max(
        ...codeFrequency.map(cf => Math.max(cf.additions, cf.deletions)),
        1
      );

      // SVG chart helpers
      const svgWidth = 600;
      const svgHeight = 200;
      const padding = { top: 20, right: 20, bottom: 30, left: 50 };
      const chartW = svgWidth - padding.left - padding.right;
      const chartH = svgHeight - padding.top - padding.bottom;

      // Build line chart points for commit activity
      const linePoints = weeklyActivity.map((w, i) => {
        const x = padding.left + (i / (weeklyActivity.length - 1 || 1)) * chartW;
        const y = padding.top + chartH - (w.count / maxWeekly) * chartH;
        return `${x},${y}`;
      }).join(' ');

      return (
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Insights</h2>
            <Link
              to={`/${owner?.username}/${repo.name}/graphs/contributors`}
              className="text-sm text-xithub-accent hover:underline"
            >
              View all contributors
            </Link>
          </div>

          {/* Contributors bar chart */}
          <div className="bg-xithub-card border border-xithub-border rounded-md mb-6">
            <div className="border-b border-xithub-border p-4">
              <h3 className="text-base font-semibold text-white">Contributors</h3>
              <p className="text-sm text-xithub-muted mt-1">Top contributors by commit count</p>
            </div>
            <div className="p-6">
              {contributors.length === 0 ? (
                <p className="text-xithub-muted text-sm text-center py-8">No commit data available</p>
              ) : (
                <div className="space-y-3">
                  {contributors.map(contributor => {
                    const user = state.users.find(u => u.id === contributor.authorId);
                    const barWidth = (contributor.count / maxCommits) * 100;
                    return (
                      <div key={contributor.authorId} className="flex items-center gap-3">
                        <div className="w-28 flex items-center gap-2 shrink-0">
                          <img
                            src={user?.avatar || `https://avatars.githubusercontent.com/u/0?v=4`}
                            alt={user?.username || 'unknown'}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-sm text-xithub-text truncate">{user?.username || 'unknown'}</span>
                        </div>
                        <div className="flex-1 h-6 bg-[#0d1117] rounded-sm overflow-hidden relative">
                          <div
                            className="h-full bg-xithub-success rounded-sm transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="text-xs text-xithub-muted w-12 text-right shrink-0">{contributor.count} commits</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Commit activity line chart */}
          <div className="bg-xithub-card border border-xithub-border rounded-md mb-6">
            <div className="border-b border-xithub-border p-4">
              <h3 className="text-base font-semibold text-white">Commit activity</h3>
              <p className="text-sm text-xithub-muted mt-1">Commits per week over the last 12 weeks</p>
            </div>
            <div className="p-6">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" style={{ maxHeight: '250px' }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = padding.top + chartH - pct * chartH;
                  return (
                    <g key={i}>
                      <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="#30363d" strokeWidth="0.5" />
                      <text x={padding.left - 8} y={y + 4} fill="#8b949e" fontSize="10" textAnchor="end">
                        {Math.round(maxWeekly * pct)}
                      </text>
                    </g>
                  );
                })}
                {/* X-axis labels */}
                {weeklyActivity.map((w, i) => {
                  if (i % 3 !== 0 && i !== weeklyActivity.length - 1) return null;
                  const x = padding.left + (i / (weeklyActivity.length - 1 || 1)) * chartW;
                  return (
                    <text key={i} x={x} y={svgHeight - 5} fill="#8b949e" fontSize="9" textAnchor="middle">
                      {w.week}
                    </text>
                  );
                })}
                {/* Area fill */}
                <polygon
                  points={`${padding.left},${padding.top + chartH} ${linePoints} ${padding.left + chartW},${padding.top + chartH}`}
                  fill="#238636"
                  fillOpacity="0.15"
                />
                {/* Line */}
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#238636"
                  strokeWidth="2"
                />
                {/* Data points */}
                {weeklyActivity.map((w, i) => {
                  const x = padding.left + (i / (weeklyActivity.length - 1 || 1)) * chartW;
                  const y = padding.top + chartH - (w.count / maxWeekly) * chartH;
                  return (
                    <circle key={i} cx={x} cy={y} r="3" fill="#238636" stroke="#0d1117" strokeWidth="1.5" />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Code frequency chart */}
          <div className="bg-xithub-card border border-xithub-border rounded-md">
            <div className="border-b border-xithub-border p-4">
              <h3 className="text-base font-semibold text-white">Code frequency</h3>
              <p className="text-sm text-xithub-muted mt-1">Additions and deletions per commit</p>
            </div>
            <div className="p-6">
              {codeFrequency.length === 0 ? (
                <p className="text-xithub-muted text-sm text-center py-8">No commit data available</p>
              ) : (
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" style={{ maxHeight: '250px' }}>
                  {/* Grid */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                    const y = padding.top + chartH - pct * chartH;
                    return (
                      <line key={i} x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="#30363d" strokeWidth="0.5" />
                    );
                  })}
                  {/* Bars */}
                  {codeFrequency.map((cf, i) => {
                    const barGroupWidth = chartW / codeFrequency.length;
                    const barW = barGroupWidth * 0.35;
                    const x = padding.left + i * barGroupWidth + barGroupWidth * 0.1;
                    const addH = (cf.additions / maxCodeFreq) * chartH;
                    const delH = (cf.deletions / maxCodeFreq) * chartH;
                    return (
                      <g key={i}>
                        {/* Additions bar */}
                        <rect
                          x={x}
                          y={padding.top + chartH - addH}
                          width={barW}
                          height={addH}
                          fill="#238636"
                          rx="2"
                        />
                        {/* Deletions bar */}
                        <rect
                          x={x + barW + 2}
                          y={padding.top + chartH - delH}
                          width={barW}
                          height={delH}
                          fill="#da3633"
                          rx="2"
                        />
                        {/* X label */}
                        <text
                          x={x + barW}
                          y={svgHeight - 5}
                          fill="#8b949e"
                          fontSize="9"
                          textAnchor="middle"
                        >
                          {cf.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
              <div className="flex items-center gap-4 justify-center mt-4 text-xs text-xithub-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-xithub-success inline-block"></span>
                  Additions
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-xithub-danger inline-block"></span>
                  Deletions
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
