
    import React, { useState } from 'react';
    import { useOutletContext, Link, useSearchParams } from 'react-router-dom';
    import { AlertCircle, CheckCircle, MessageSquare, Search, Milestone as MilestoneIcon, Pin } from 'lucide-react';
    import { useStore } from '../../lib/store';
    import LabelBadge from '../../components/LabelBadge';

    export default function Issues() {
      const { repo, owner } = useOutletContext();
      const { state } = useStore();
      const [searchParams] = useSearchParams();
      const [filter, setFilter] = useState('open');
      const [searchQuery, setSearchQuery] = useState('');
      const [sortBy, setSortBy] = useState('newest');
      const [showSortMenu, setShowSortMenu] = useState(false);
      const [labelFilter, setLabelFilter] = useState(null);
      const [showLabelMenu, setShowLabelMenu] = useState(false);
      const [milestoneFilter, setMilestoneFilter] = useState(() => searchParams.get('milestone') || null);
      const [showMilestoneMenu, setShowMilestoneMenu] = useState(false);

      const allIssues = state.issues.filter(i => i.repoId === repo.id);
      const openCount = allIssues.filter(i => i.status === 'open').length;
      const closedCount = allIssues.filter(i => i.status === 'closed').length;

      // Get all unique labels across issues
      const allLabels = [...new Set(allIssues.flatMap(i => i.labels || []))];

      // Get all milestones for this repo
      const repoMilestones = (state.milestones || []).filter(m => m.repoId === repo.id);
      const allMilestoneNames = [...new Set(allIssues.map(i => i.milestone).filter(Boolean))];

      let filteredByStatus = allIssues.filter(i => i.status === filter);

      // Label filter
      if (labelFilter) {
        filteredByStatus = filteredByStatus.filter(i => (i.labels || []).includes(labelFilter));
      }

      // Milestone filter
      if (milestoneFilter) {
        filteredByStatus = filteredByStatus.filter(i => i.milestone === milestoneFilter);
      }

      // Search filter
      const issues = searchQuery.trim()
        ? filteredByStatus.filter(i => {
            const query = searchQuery.toLowerCase();
            return i.title.toLowerCase().includes(query) || (i.description || '').toLowerCase().includes(query);
          })
        : filteredByStatus;

      // Sort
      const sortedIssues = [...issues].sort((a, b) => {
        // Pinned issues always come first
        const aPinned = a.isPinned ? 1 : 0;
        const bPinned = b.isPinned ? 1 : 0;
        if (aPinned !== bPinned) return bPinned - aPinned;
        switch (sortBy) {
          case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
          case 'most-commented': return (b.comments?.length || 0) - (a.comments?.length || 0);
          case 'least-commented': return (a.comments?.length || 0) - (b.comments?.length || 0);
          default: return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });

      const closeAllMenus = () => {
        setShowLabelMenu(false);
        setShowSortMenu(false);
        setShowMilestoneMenu(false);
      };

      return (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
             <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-xithub-muted" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0d1117] border border-xithub-border rounded-md pl-9 pr-3 py-1.5 text-sm text-white placeholder-xithub-muted focus:outline-none focus:border-xithub-accent"
                />
             </div>
             <div className="flex items-center gap-2 ml-4">
               <Link
                 to={`/${owner.username}/${repo.name}/milestones`}
                 className="flex items-center gap-1 px-3 py-1.5 border border-xithub-border rounded-md text-sm text-xithub-text hover:bg-[#30363d]"
               >
                 <MilestoneIcon size={14} />
                 Milestones
                 <span className="bg-[#30363d] text-white text-xs px-1.5 py-0.5 rounded-full ml-1">
                   {repoMilestones.filter(m => m.state === 'open').length}
                 </span>
               </Link>
               <Link to="new" className="bg-xithub-success text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-opacity-90">
                  New Issue
               </Link>
             </div>
          </div>

          {/* Active milestone filter indicator */}
          {milestoneFilter && (
            <div className="mb-3 flex items-center gap-2 text-sm">
              <span className="text-xithub-muted">Milestone:</span>
              <span className="bg-[#21262d] text-xithub-text px-2 py-0.5 rounded-md text-xs font-medium">{milestoneFilter}</span>
              <button
                onClick={() => setMilestoneFilter(null)}
                className="text-xithub-muted hover:text-white text-xs"
              >
                Clear
              </button>
            </div>
          )}

          <div className="bg-xithub-card border border-xithub-border rounded-md overflow-hidden">
            <div className="bg-[#161b22] border-b border-xithub-border p-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => setFilter('open')}
                  className={`flex items-center gap-1 ${filter === 'open' ? 'font-semibold text-white' : 'text-xithub-muted hover:text-white'}`}
                >
                  <AlertCircle size={16} /> {openCount} Open
                </button>
                <button
                  onClick={() => setFilter('closed')}
                  className={`flex items-center gap-1 ${filter === 'closed' ? 'font-semibold text-white' : 'text-xithub-muted hover:text-white'}`}
                >
                  <CheckCircle size={16} /> {closedCount} Closed
                </button>
              </div>
              <div className="flex gap-4 text-sm text-xithub-muted">
                 {/* Label filter */}
                 <div className="relative">
                   <button
                     onClick={() => { closeAllMenus(); setShowLabelMenu(!showLabelMenu); }}
                     className="hover:text-white cursor-pointer"
                   >
                     Label &#x25BE;
                   </button>
                   {showLabelMenu && (
                     <div className="absolute right-0 top-full mt-1 w-48 bg-[#161b22] border border-xithub-border rounded-md shadow-lg z-40 py-1">
                       <button
                         onClick={() => { setLabelFilter(null); setShowLabelMenu(false); }}
                         className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] ${!labelFilter ? 'text-white font-semibold' : ''}`}
                       >
                         All labels
                       </button>
                       {allLabels.map(label => (
                         <button
                           key={label}
                           onClick={() => { setLabelFilter(label); setShowLabelMenu(false); }}
                           className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] ${labelFilter === label ? 'text-white font-semibold' : ''}`}
                         >
                           {label}
                         </button>
                       ))}
                       {allLabels.length === 0 && <div className="px-3 py-1.5 text-xs text-xithub-muted">No labels</div>}
                     </div>
                   )}
                 </div>

                 {/* Milestone filter */}
                 <div className="relative">
                   <button
                     onClick={() => { closeAllMenus(); setShowMilestoneMenu(!showMilestoneMenu); }}
                     className="hover:text-white cursor-pointer"
                   >
                     Milestone &#x25BE;
                   </button>
                   {showMilestoneMenu && (
                     <div className="absolute right-0 top-full mt-1 w-48 bg-[#161b22] border border-xithub-border rounded-md shadow-lg z-40 py-1">
                       <button
                         onClick={() => { setMilestoneFilter(null); setShowMilestoneMenu(false); }}
                         className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] ${!milestoneFilter ? 'text-white font-semibold' : ''}`}
                       >
                         All milestones
                       </button>
                       {repoMilestones.map(ms => (
                         <button
                           key={ms.id}
                           onClick={() => { setMilestoneFilter(ms.title); setShowMilestoneMenu(false); }}
                           className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] ${milestoneFilter === ms.title ? 'text-white font-semibold' : ''}`}
                         >
                           {ms.title}
                         </button>
                       ))}
                       {repoMilestones.length === 0 && <div className="px-3 py-1.5 text-xs text-xithub-muted">No milestones</div>}
                     </div>
                   )}
                 </div>

                 {/* Sort filter */}
                 <div className="relative">
                   <button
                     onClick={() => { closeAllMenus(); setShowSortMenu(!showSortMenu); }}
                     className="hover:text-white cursor-pointer"
                   >
                     Sort &#x25BE;
                   </button>
                   {showSortMenu && (
                     <div className="absolute right-0 top-full mt-1 w-48 bg-[#161b22] border border-xithub-border rounded-md shadow-lg z-40 py-1">
                       {[
                         { id: 'newest', label: 'Newest' },
                         { id: 'oldest', label: 'Oldest' },
                         { id: 'most-commented', label: 'Most commented' },
                         { id: 'least-commented', label: 'Least commented' },
                       ].map(opt => (
                         <button
                           key={opt.id}
                           onClick={() => { setSortBy(opt.id); setShowSortMenu(false); }}
                           className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] ${sortBy === opt.id ? 'text-white font-semibold' : ''}`}
                         >
                           {opt.label}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
              </div>
            </div>

            <div className="divide-y divide-xithub-border">
              {sortedIssues.map(issue => {
                const author = state.users.find(u => u.id === issue.authorId);
                return (
                  <div key={issue.id} className="p-3 hover:bg-[#161b22] flex items-start gap-2 group">
                    <div className="pt-1">
                      {issue.isPinned ? (
                        <Pin size={16} className="text-xithub-accent" />
                      ) : issue.status === 'open' ? (
                        <AlertCircle size={16} className="text-green-500" />
                      ) : (
                        <CheckCircle size={16} className="text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`${issue.number}`} className="font-semibold text-white hover:text-xithub-accent hover:underline">
                          {issue.title}
                        </Link>
                        {(issue.labels || []).map(label => (
                          <LabelBadge key={label} name={label} repoId={issue.repoId} />
                        ))}
                      </div>
                      <div className="text-xs text-xithub-muted">
                        #{issue.number} opened on {new Date(issue.createdAt).toLocaleDateString()} by {author?.username}
                        {issue.milestone && (
                          <span className="ml-2">
                            <MilestoneIcon size={11} className="inline mr-0.5" />
                            {issue.milestone}
                          </span>
                        )}
                      </div>
                    </div>
                    {(issue.comments?.length || 0) > 0 && (
                      <div className="flex items-center gap-1 text-xithub-muted text-xs">
                        <MessageSquare size={14} /> {issue.comments.length}
                      </div>
                    )}
                  </div>
                );
              })}

              {sortedIssues.length === 0 && (
                 <div className="p-12 text-center text-xithub-muted">
                    <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-white">Welcome to issues!</h3>
                    <p>Issues are used to track todos, bugs, feature requests, and more.</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      );
    }
