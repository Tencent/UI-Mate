import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useStore } from '../context/StoreContext';
import { IssueCard } from '../components/IssueCard';
import { IssueModal } from '../components/IssueModal';
import { Issue, IssueStatus } from '../types';
import { Breadcrumb } from '../components/Breadcrumb';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { clsx } from 'clsx';

const COLUMNS: IssueStatus[] = ['To Do', 'In Progress', 'In Review', 'Done'];

export const Board: React.FC = () => {
  const { state, dispatch } = useStore();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState<string | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [groupByEpic, setGroupByEpic] = useState(false);

  // Quick filter chips
  const [onlyMyIssues, setOnlyMyIssues] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState(false);
  const [activeLabels, setActiveLabels] = useState<Set<string>>(new Set());

  const activeSprint = state.sprints.find((s) => s.state === 'active');

  // Get all unique labels from active sprint issues
  const sprintLabels = useMemo(() => {
    if (!activeSprint) return [];
    const labels = new Set<string>();
    state.issues
      .filter((i) => i.sprintId === activeSprint.id)
      .forEach((i) => i.labels.forEach((l) => labels.add(l)));
    return Array.from(labels).sort();
  }, [state.issues, activeSprint]);

  const toggleLabel = (label: string) => {
    const next = new Set(activeLabels);
    if (next.has(label)) {
      next.delete(label);
    } else {
      next.add(label);
    }
    setActiveLabels(next);
  };

  const filteredIssues = useMemo(() => {
    if (!activeSprint) return [];

    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    return state.issues.filter((issue) => {
      if (issue.sprintId !== activeSprint.id) return false;

      // Text search
      if (search) {
        const lower = search.toLowerCase();
        if (
          !issue.summary.toLowerCase().includes(lower) &&
          !issue.key.toLowerCase().includes(lower)
        )
          return false;
      }

      // User avatar filter
      if (userFilter !== 'all' && issue.assigneeId !== userFilter) return false;

      // Quick filters
      if (onlyMyIssues && issue.assigneeId !== state.currentUser.id) return false;
      if (recentlyUpdated) {
        const updated = new Date(issue.updatedAt).getTime();
        if (now - updated > twentyFourHours) return false;
      }
      if (activeLabels.size > 0) {
        const hasAllLabels = Array.from(activeLabels).every((l) =>
          issue.labels.includes(l)
        );
        if (!hasAllLabels) return false;
      }

      return true;
    });
  }, [
    state.issues,
    activeSprint,
    search,
    userFilter,
    onlyMyIssues,
    recentlyUpdated,
    activeLabels,
    state.currentUser.id,
  ]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    setError(null);

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const issue = state.issues.find((i) => i.id === draggableId);
    if (issue) {
      // Handle swimlane droppable IDs like "In Progress__i24"
      const destParts = destination.droppableId.split('__');
      const newStatus = destParts[0] as IssueStatus;

      // Workflow Validation
      const workflow = state.workflows[0];
      const allowedTransitions =
        workflow.transitions.find((t) => t.from === issue.status)?.to || [];

      if (
        issue.status !== newStatus &&
        !allowedTransitions.includes(newStatus)
      ) {
        setError(
          `Invalid transition: Cannot move from "${issue.status}" to "${newStatus}"`
        );
        return;
      }

      dispatch({
        type: 'UPDATE_ISSUE',
        payload: { ...issue, status: newStatus, updatedAt: new Date().toISOString() },
      });
    }
  };

  const getWipBadgeClass = (count: number) => {
    if (count > 8) return 'bg-red-200 text-red-800';
    if (count > 5) return 'bg-yellow-200 text-yellow-800';
    return 'bg-gray-200 text-gray-600';
  };

  if (!activeSprint) {
    const project = state.projects[0];
    return (
      <div className="p-10 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            No Active Sprint
          </h2>
          <p className="text-gray-500 mb-6">
            Start a sprint in the Backlog to see the board.
          </p>
          <Link
            to={`/project/${project.key}/backlog`}
            className="inline-flex items-center gap-2 bg-xira-blue text-white px-4 py-2 rounded hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            Go to Backlog
          </Link>
        </div>
      </div>
    );
  }

  const hasQuickFilters =
    onlyMyIssues || recentlyUpdated || activeLabels.size > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="p-6 pb-0">
        <Breadcrumb pageName="Board" />
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeSprint.name}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {filteredIssues.length} issues
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 font-bold"
            >
              x
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 mb-3">
          <input
            type="text"
            placeholder="Search this board"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex -space-x-2">
            {state.users.map((user) => (
              <button
                key={user.id}
                onClick={() =>
                  setUserFilter(userFilter === user.id ? 'all' : user.id)
                }
                className={`w-8 h-8 rounded-full border-2 border-white overflow-hidden transition-transform hover:z-10 hover:scale-110 ${
                  userFilter === user.id
                    ? 'ring-2 ring-xira-blue z-10'
                    : ''
                }`}
                title={user.name}
              >
                <img src={user.avatar} alt={user.name} className="w-full h-full" />
              </button>
            ))}
          </div>
          {userFilter !== 'all' && (
            <button
              onClick={() => setUserFilter('all')}
              className="text-sm text-xira-blue hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Quick filter chips */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setOnlyMyIssues(!onlyMyIssues)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              onlyMyIssues
                ? 'bg-xira-blue/10 text-xira-blue border-xira-blue'
                : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
            )}
          >
            Only My Issues
          </button>
          <button
            onClick={() => setRecentlyUpdated(!recentlyUpdated)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              recentlyUpdated
                ? 'bg-xira-blue/10 text-xira-blue border-xira-blue'
                : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
            )}
          >
            Recently Updated
          </button>
          {sprintLabels.map((label) => (
            <button
              key={label}
              onClick={() => toggleLabel(label)}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                activeLabels.has(label)
                  ? 'bg-xira-blue/10 text-xira-blue border-xira-blue'
                  : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
              )}
            >
              {label}
            </button>
          ))}
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <button
            onClick={() => setGroupByEpic(!groupByEpic)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1',
              groupByEpic
                ? 'bg-purple-100 text-purple-700 border-purple-300'
                : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
            )}
          >
            <Zap size={12} /> Group by Epic
          </button>
          {hasQuickFilters && (
            <button
              onClick={() => {
                setOnlyMyIssues(false);
                setRecentlyUpdated(false);
                setActiveLabels(new Set());
              }}
              className="text-xs text-xira-blue hover:underline ml-1"
            >
              Clear quick filters
            </button>
          )}
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-auto px-6 pb-6">
        <DragDropContext onDragEnd={onDragEnd}>
          {groupByEpic ? (
            // Epic Swimlane View
            <div className="min-w-[1000px]">
              {/* Column headers */}
              <div className="flex gap-4 mb-2 sticky top-0 z-10 bg-white pb-2">
                {COLUMNS.map((columnId) => (
                  <div key={columnId} className="w-80 p-2 text-xs font-semibold text-gray-500 uppercase text-center">
                    {columnId}
                  </div>
                ))}
              </div>
              {/* Swimlanes */}
              {(() => {
                const epics = state.issues.filter((i) => i.type === 'Epic');
                const epicGroups: { id: string | null; name: string }[] = [
                  ...epics.map((e) => ({ id: e.id, name: e.summary })),
                  { id: null, name: 'No Epic' },
                ];

                return epicGroups.map((epic) => {
                  const swimlaneIssues = filteredIssues.filter((i) =>
                    epic.id ? i.epicId === epic.id : !i.epicId
                  );
                  if (swimlaneIssues.length === 0) return null;

                  return (
                    <div key={epic.id || 'no-epic'} className="mb-4">
                      <div className="flex items-center gap-2 px-2 py-2 bg-gray-50 rounded-t border border-gray-200">
                        {epic.id && <Zap size={14} className="text-purple-600" />}
                        <span className="text-sm font-semibold text-gray-700">{epic.name}</span>
                        <span className="text-xs text-gray-400">({swimlaneIssues.length})</span>
                      </div>
                      <div className="flex gap-4 border border-t-0 border-gray-200 rounded-b bg-white p-2">
                        {COLUMNS.map((columnId) => {
                          const colIssues = swimlaneIssues.filter((i) => i.status === columnId);
                          const droppableId = `${columnId}__${epic.id || 'no-epic'}`;
                          return (
                            <div key={columnId} className="w-80 min-h-[60px] bg-xira-gray/50 rounded p-1">
                              <Droppable droppableId={droppableId}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={clsx('min-h-[40px] transition-colors', snapshot.isDraggingOver && 'bg-blue-50')}
                                  >
                                    {colIssues.map((issue, index) => (
                                      <IssueCard
                                        key={issue.id}
                                        issue={issue}
                                        index={index}
                                        users={state.users}
                                        onClick={setSelectedIssue}
                                      />
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            // Flat Column View
            <div className="flex h-full gap-4 min-w-[1000px]">
              {COLUMNS.map((columnId) => {
                const columnIssues = filteredIssues.filter(
                  (i) => i.status === columnId
                );
                const count = columnIssues.length;

                return (
                  <div
                    key={columnId}
                    className="flex flex-col w-80 bg-xira-gray rounded-lg max-h-full"
                  >
                    <div className="p-3 text-xs font-semibold text-gray-500 uppercase flex justify-between">
                      <span>{columnId}</span>
                      <span
                        className={clsx(
                          'px-2 rounded-full',
                          getWipBadgeClass(count)
                        )}
                      >
                        {count}
                      </span>
                    </div>
                    <Droppable droppableId={columnId}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-2 overflow-y-auto min-h-[100px] transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-50' : ''
                          }`}
                        >
                          {columnIssues.map((issue, index) => (
                            <IssueCard
                              key={issue.id}
                              issue={issue}
                              index={index}
                              users={state.users}
                              onClick={setSelectedIssue}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          )}
        </DragDropContext>
      </div>

      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};
