
    import React, { useState } from 'react';
    import { useOutletContext, Link } from 'react-router-dom';
    import { useStore } from '../../lib/store';
    import { AlertCircle, MoreHorizontal, Plus } from 'lucide-react';
    import { generateId } from '../../lib/utils';

    export default function ProjectBoard() {
      const { repo, owner } = useOutletContext();
      const { state, dispatch, actions } = useStore();
      const [addingToColumn, setAddingToColumn] = useState(null);
      const [newItemTitle, setNewItemTitle] = useState('');
      const [columnMenu, setColumnMenu] = useState(null);

      const issues = state.issues.filter(i => i.repoId === repo.id);

      const columns = [
        { id: 'todo', title: 'To Do' },
        { id: 'inprogress', title: 'In Progress' },
        { id: 'done', title: 'Done' }
      ];

      const handleDragStart = (e, issueId) => {
        e.dataTransfer.setData('issueId', issueId);
      };

      const handleDragOver = (e) => {
        e.preventDefault();
      };

      const handleDrop = (e, columnId) => {
        const issueId = e.dataTransfer.getData('issueId');
        dispatch({
          type: actions.MOVE_ISSUE_COLUMN,
          payload: { issueId, column: columnId }
        });
      };

      const handleAddItem = (columnId) => {
        if (!newItemTitle.trim()) return;

        const allNumbers = [
          ...state.issues.filter(i => i.repoId === repo.id).map(i => i.number),
          ...state.pullRequests.filter(p => p.repoId === repo.id).map(p => p.number)
        ];
        const nextNumber = allNumbers.length > 0 ? Math.max(...allNumbers) + 1 : 1;

        const newIssue = {
          id: generateId(),
          repoId: repo.id,
          number: nextNumber,
          title: newItemTitle.trim(),
          description: '',
          status: 'open',
          authorId: state.currentUser.id,
          assignees: [],
          labels: [],
          column: columnId,
          createdAt: new Date().toISOString(),
          comments: []
        };

        dispatch({ type: actions.ADD_ISSUE, payload: newIssue });
        setNewItemTitle('');
        setAddingToColumn(null);
      };

      return (
        <div className="h-[calc(100vh-200px)] overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max p-4">
            {columns.map(col => (
              <div
                key={col.id}
                className="w-80 bg-[#010409] border border-xithub-border rounded-md flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="p-3 border-b border-xithub-border flex items-center justify-between bg-[#161b22] rounded-t-md">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${col.id === 'done' ? 'bg-purple-500' : col.id === 'inprogress' ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
                    <span className="font-semibold text-sm">{col.title}</span>
                    <span className="bg-xithub-border px-2 rounded-full text-xs text-xithub-muted">
                      {issues.filter(i => i.column === col.id).length}
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setColumnMenu(columnMenu === col.id ? null : col.id)}
                      className="text-xithub-muted hover:text-white"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {columnMenu === col.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-[#161b22] border border-xithub-border rounded-md shadow-lg z-40 py-1">
                        <button
                          onClick={() => { setAddingToColumn(col.id); setColumnMenu(null); }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d]"
                        >
                          Add item
                        </button>
                        <button
                          onClick={() => setColumnMenu(null)}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d]"
                        >
                          Sort by newest
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-2 overflow-y-auto space-y-2">
                  {issues.filter(i => i.column === col.id).map(issue => (
                    <div
                      key={issue.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, issue.id)}
                      className="bg-[#161b22] border border-xithub-border rounded-md p-3 shadow-sm cursor-move hover:border-xithub-muted group"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <AlertCircle size={14} className="text-green-500 mt-1" />
                        <Link
                          to={`/${owner?.username}/${repo.name}/issues/${issue.number}`}
                          className="text-sm font-medium text-xithub-text group-hover:text-xithub-accent hover:underline"
                        >
                          {issue.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-xithub-muted">
                        <span>#{issue.number}</span>
                        {issue.labels.map(l => (
                          <span key={l} className="w-2 h-2 rounded-full bg-blue-500"></span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {addingToColumn === col.id ? (
                    <div className="bg-[#161b22] border border-xithub-border rounded-md p-2">
                      <input
                        type="text"
                        placeholder="Enter a title"
                        value={newItemTitle}
                        onChange={e => setNewItemTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddItem(col.id);
                          if (e.key === 'Escape') { setAddingToColumn(null); setNewItemTitle(''); }
                        }}
                        className="w-full bg-[#0d1117] border border-xithub-border rounded px-2 py-1 text-sm text-xithub-text focus:ring-1 focus:ring-xithub-accent outline-none mb-2"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddItem(col.id)}
                          className="bg-xithub-success text-white px-2 py-1 rounded text-xs font-semibold hover:bg-opacity-90"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingToColumn(null); setNewItemTitle(''); }}
                          className="text-xithub-muted hover:text-white text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingToColumn(col.id)}
                      className="w-full py-2 text-xithub-muted hover:text-xithub-accent text-sm flex items-center gap-2 px-2"
                    >
                      <Plus size={14} /> Add item
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
