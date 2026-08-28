
    import React from 'react';
    import { useOutletContext } from 'react-router-dom';
    import { PlayCircle, Check, X, Clock, RefreshCw, GitBranch } from 'lucide-react';
    import { useStore } from '../../lib/store';
    import { generateId } from '../../lib/utils';

    export default function Actions() {
      const { repo } = useOutletContext();
      const { state, dispatch, actions } = useStore();

      const repoActions = (state.actions || []).filter(a => a.repoId === repo.id);

      const getStatusIcon = (status) => {
        switch (status) {
          case 'success': return <Check size={16} className="text-green-500" />;
          case 'failure': return <X size={16} className="text-red-500" />;
          case 'running': return <Clock size={16} className="text-yellow-500 animate-pulse" />;
          case 'queued': return <Clock size={16} className="text-gray-400" />;
          default: return <Clock size={16} className="text-gray-400" />;
        }
      };

      const getStatusBadge = (status) => {
        switch (status) {
          case 'success': return <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-400 border border-green-700">Success</span>;
          case 'failure': return <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-400 border border-red-700">Failure</span>;
          case 'running': return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/50 text-yellow-400 border border-yellow-700">Running</span>;
          case 'queued': return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800/50 text-gray-400 border border-gray-600">Queued</span>;
          default: return null;
        }
      };

      const getRelativeDate = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'just now';
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        return new Date(dateStr).toLocaleDateString();
      };

      const handleRerun = (action) => {
        const maxRunNumber = Math.max(0, ...repoActions.map(a => a.runNumber || 0));
        const newAction = {
          id: `a_${Date.now()}`,
          repoId: repo.id,
          name: action.name,
          status: 'running',
          runNumber: maxRunNumber + 1,
          branch: action.branch,
          event: 'workflow_dispatch',
          duration: '0m 00s',
          date: new Date().toISOString(),
          triggeredBy: state.currentUser.id
        };
        dispatch({ type: actions.ADD_ACTION, payload: newAction });
      };

      // Group by workflow name
      const workflowNames = [...new Set(repoActions.map(a => a.name))];

      return (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Workflows</h2>

          {repoActions.length === 0 ? (
            <div className="bg-xithub-card border border-xithub-border rounded-md p-12 text-center">
              <PlayCircle size={48} className="mx-auto mb-4 text-xithub-muted opacity-50" />
              <h3 className="text-lg font-semibold text-white mb-2">Get started with XitHub Actions</h3>
              <p className="text-xithub-muted text-sm">No workflow runs found for this repository.</p>
            </div>
          ) : (
            <div className="flex gap-6">
              {/* Sidebar - Workflow list */}
              <div className="w-64 shrink-0">
                <div className="bg-xithub-card border border-xithub-border rounded-md overflow-hidden">
                  <div className="bg-[#161b22] border-b border-xithub-border p-3 text-sm font-semibold">
                    All workflows
                  </div>
                  <div className="divide-y divide-xithub-border">
                    {workflowNames.map(name => {
                      const latest = repoActions.find(a => a.name === name);
                      return (
                        <div key={name} className="p-3 hover:bg-[#161b22] flex items-center gap-2 text-sm cursor-pointer">
                          {getStatusIcon(latest?.status)}
                          <span className="text-white truncate">{name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Main content - Run list */}
              <div className="flex-1">
                <div className="bg-xithub-card border border-xithub-border rounded-md overflow-hidden">
                  <div className="bg-[#161b22] border-b border-xithub-border p-3 text-sm font-semibold">
                    Workflow runs
                  </div>
                  <div className="divide-y divide-xithub-border">
                    {repoActions.map(action => {
                      const triggeredUser = state.users.find(u => u.id === action.triggeredBy);
                      return (
                        <div key={action.id} className="p-3 hover:bg-[#161b22] flex items-center gap-3">
                          <div className="shrink-0">
                            {getStatusIcon(action.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-semibold text-white truncate">{action.name}</span>
                              {getStatusBadge(action.status)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-xithub-muted">
                              <span className="flex items-center gap-1">
                                <GitBranch size={12} />
                                <span className="font-mono">{action.branch}</span>
                              </span>
                              <span>{action.event}</span>
                              <span>#{action.runNumber}</span>
                              {triggeredUser && <span>by {triggeredUser.username}</span>}
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-3">
                            <span className="text-xs text-xithub-muted">{action.duration}</span>
                            <span className="text-xs text-xithub-muted">{getRelativeDate(action.date)}</span>
                            <button
                              onClick={() => handleRerun(action)}
                              className="p-1.5 rounded-md border border-xithub-border hover:bg-[#30363d] text-xithub-muted hover:text-white"
                              title="Re-run workflow"
                            >
                              <RefreshCw size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
