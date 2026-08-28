import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Layers, Pencil } from 'lucide-react';
import { Issue, Sprint } from '../types';
import { clsx } from 'clsx';
import { Breadcrumb } from '../components/Breadcrumb';
import { IssueModal } from '../components/IssueModal';
import { BulkEditModal } from '../components/BulkEditModal';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';

export const Backlog: React.FC = () => {
  const { state, dispatch } = useStore();
  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({
    backlog: true,
    ...Object.fromEntries(state.sprints.map((s) => [s.id, true])),
  });
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [sprintToComplete, setSprintToComplete] = useState<Sprint | null>(null);

  // Epic filter
  const [epicFilter, setEpicFilter] = useState<string>('all');
  const epics = state.issues.filter((i) => i.type === 'Epic');

  // Inline editing state
  const [editingSprintName, setEditingSprintName] = useState<string | null>(null);
  const [sprintNameValue, setSprintNameValue] = useState('');
  const [editingSummary, setEditingSummary] = useState<string | null>(null);
  const [summaryValue, setSummaryValue] = useState('');
  const [editingPoints, setEditingPoints] = useState<string | null>(null);
  const [pointsValue, setPointsValue] = useState('');

  const toggleSprint = (id: string) => {
    setExpandedSprints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const issue = state.issues.find((i) => i.id === draggableId);
    if (issue) {
      const newSprintId =
        destination.droppableId === 'backlog' ? null : destination.droppableId;
      dispatch({
        type: 'UPDATE_ISSUE',
        payload: { ...issue, sprintId: newSprintId, updatedAt: new Date().toISOString() },
      });
    }
  };

  const handleCreateIssue = (sprintId: string | null) => {
    const nextKey = state.issues.length + 1;
    const newIssue: Issue = {
      id: uuidv4(),
      key: `${state.projects[0].key}-${nextKey}`,
      projectId: state.projects[0].id,
      summary: 'New Issue',
      description: '',
      type: 'Story',
      status: 'To Do',
      priority: 'Medium',
      storyPoints: 0,
      reporterId: state.currentUser.id,
      assigneeId: null,
      sprintId: sprintId,
      epicId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      labels: [],
      subtasks: [],
      linkedIssueIds: [],
    };
    dispatch({ type: 'ADD_ISSUE', payload: newIssue });
    setSelectedIssue(newIssue);
  };

  const handleCreateSprint = () => {
    const sprintCount = state.sprints.length;
    const now = new Date();
    const newSprint: Sprint = {
      id: uuidv4(),
      projectId: state.projects[0].id,
      name: `Sprint ${sprintCount + 1}`,
      goal: '',
      startDate: addDays(now, 1).toISOString(),
      endDate: addDays(now, 15).toISOString(),
      state: 'future',
    };
    dispatch({ type: 'ADD_SPRINT', payload: newSprint });
    setExpandedSprints((prev) => ({ ...prev, [newSprint.id]: true }));
  };

  const handleStartSprint = (sprint: Sprint) => {
    dispatch({
      type: 'UPDATE_SPRINT',
      payload: {
        ...sprint,
        state: 'active',
        startDate: new Date().toISOString(),
      },
    });
  };

  const handleCompleteSprint = (sprint: Sprint) => {
    setSprintToComplete(sprint);
  };

  const confirmCompleteSprint = () => {
    if (!sprintToComplete) return;
    const incompleteIssues = state.issues.filter(
      (i) => i.sprintId === sprintToComplete.id && i.status !== 'Done'
    );
    incompleteIssues.forEach((issue) => {
      dispatch({
        type: 'UPDATE_ISSUE',
        payload: { ...issue, sprintId: null },
      });
    });

    dispatch({
      type: 'UPDATE_SPRINT',
      payload: {
        ...sprintToComplete,
        state: 'closed',
        endDate: new Date().toISOString(),
      },
    });
    setSprintToComplete(null);
  };

  const toggleIssueSelection = (issueId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIssueIds);
    if (newSet.has(issueId)) {
      newSet.delete(issueId);
    } else {
      newSet.add(issueId);
    }
    setSelectedIssueIds(newSet);
  };

  // Sprint name inline editing
  const startEditingSprintName = (sprint: Sprint, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSprintName(sprint.id);
    setSprintNameValue(sprint.name);
  };

  const saveSprintName = (sprint: Sprint) => {
    if (sprintNameValue.trim()) {
      dispatch({
        type: 'UPDATE_SPRINT',
        payload: { ...sprint, name: sprintNameValue.trim() },
      });
    }
    setEditingSprintName(null);
  };

  // Summary inline editing
  const startEditingSummary = (issue: Issue, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSummary(issue.id);
    setSummaryValue(issue.summary);
  };

  const saveSummary = (issue: Issue) => {
    if (summaryValue.trim()) {
      dispatch({
        type: 'UPDATE_ISSUE',
        payload: { ...issue, summary: summaryValue.trim(), updatedAt: new Date().toISOString() },
      });
    }
    setEditingSummary(null);
  };

  // Points inline editing
  const startEditingPoints = (issue: Issue, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPoints(issue.id);
    setPointsValue(String(issue.storyPoints || 0));
  };

  const savePoints = (issue: Issue) => {
    const pts = parseInt(pointsValue) || 0;
    dispatch({
      type: 'UPDATE_ISSUE',
      payload: { ...issue, storyPoints: pts, updatedAt: new Date().toISOString() },
    });
    setEditingPoints(null);
  };

  const filterByEpic = (issues: Issue[]) => {
    if (epicFilter === 'all') return issues;
    if (epicFilter === 'none') return issues.filter((i) => !i.epicId);
    return issues.filter((i) => i.epicId === epicFilter);
  };

  const renderIssueList = (issues: Issue[], droppableId: string) => (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={clsx(
            'min-h-[40px] transition-colors',
            snapshot.isDraggingOver && 'bg-blue-50'
          )}
        >
          {issues.map((issue, index) => {
            const assignee = state.users.find(
              (u) => u.id === issue.assigneeId
            );
            const isSelected = selectedIssueIds.has(issue.id);
            return (
              <Draggable
                key={issue.id}
                draggableId={issue.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={clsx(
                      'flex items-center gap-3 p-2 hover:bg-gray-100 border-b border-gray-100 bg-white group cursor-pointer',
                      snapshot.isDragging && 'shadow-lg bg-blue-50',
                      isSelected && 'bg-blue-50'
                    )}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div
                      className="pl-2"
                      onClick={(e) => toggleIssueSelection(issue.id, e)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="rounded border-gray-300 text-xira-blue focus:ring-xira-blue cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      <span className="text-gray-500 text-sm w-16 flex-shrink-0">
                        {issue.key}
                      </span>
                      {editingSummary === issue.id ? (
                        <input
                          type="text"
                          value={summaryValue}
                          onChange={(e) => setSummaryValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveSummary(issue);
                            if (e.key === 'Escape') setEditingSummary(null);
                          }}
                          onBlur={() => saveSummary(issue)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 border border-xira-blue rounded px-2 py-0.5 text-sm focus:ring-1 focus:ring-xira-blue outline-none"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="text-gray-900 text-sm truncate"
                          onDoubleClick={(e) => startEditingSummary(issue, e)}
                        >
                          {issue.summary}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div
                        className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                          issue.status === 'Done'
                            ? 'bg-green-100 text-green-800'
                            : issue.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : issue.status === 'In Review'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {issue.status}
                      </div>
                      {assignee ? (
                        <img
                          src={assignee.avatar}
                          className="w-6 h-6 rounded-full"
                          title={assignee.name}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                      )}
                      {editingPoints === issue.id ? (
                        <input
                          type="number"
                          value={pointsValue}
                          onChange={(e) => setPointsValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') savePoints(issue);
                            if (e.key === 'Escape') setEditingPoints(null);
                          }}
                          onBlur={() => savePoints(issue)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-10 h-6 text-center border border-xira-blue rounded text-xs focus:ring-1 focus:ring-xira-blue outline-none"
                          autoFocus
                          min={0}
                        />
                      ) : (
                        <div
                          className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs text-gray-600 font-medium cursor-pointer hover:bg-gray-200"
                          onClick={(e) => startEditingPoints(issue, e)}
                          title="Click to edit story points"
                        >
                          {issue.storyPoints || '-'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCreateIssue(
                droppableId === 'backlog' ? null : droppableId
              );
            }}
            className="w-full text-left p-2 pl-10 text-sm hover:bg-gray-100 text-gray-500 flex items-center gap-2"
          >
            <Plus size={14} /> Create issue
          </button>
        </div>
      )}
    </Droppable>
  );

  return (
    <div className="p-6 h-full overflow-y-auto">
      <Breadcrumb pageName="Backlog" />
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Backlog</h1>
          <select
            value={epicFilter}
            onChange={(e) => setEpicFilter(e.target.value)}
            className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
          >
            <option value="all">All Epics</option>
            {epics.map((epic) => (
              <option key={epic.id} value={epic.id}>
                {epic.summary}
              </option>
            ))}
            <option value="none">Issues without epic</option>
          </select>
        </div>
        {selectedIssueIds.size > 0 && (
          <button
            onClick={() => setShowBulkEdit(true)}
            className="bg-xira-blue text-white px-4 py-2 rounded hover:bg-blue-700 font-medium text-sm flex items-center gap-2"
          >
            <Layers size={16} />
            Bulk Change ({selectedIssueIds.size})
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-6">
          {/* Sprints */}
          {state.sprints
            .filter((s) => s.state !== 'closed')
            .map((sprint) => {
              const sprintIssues = filterByEpic(state.issues.filter(
                (i) => i.sprintId === sprint.id
              ));
              const points = sprintIssues.reduce(
                (acc, i) => acc + (i.storyPoints || 0),
                0
              );

              return (
                <div
                  key={sprint.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                >
                  <div className="p-3 flex items-center justify-between bg-gray-100 border-b border-gray-200">
                    <div
                      className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                      onClick={() => toggleSprint(sprint.id)}
                    >
                      {expandedSprints[sprint.id] ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      {editingSprintName === sprint.id ? (
                        <input
                          type="text"
                          value={sprintNameValue}
                          onChange={(e) => setSprintNameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveSprintName(sprint);
                            if (e.key === 'Escape') setEditingSprintName(null);
                          }}
                          onBlur={() => saveSprintName(sprint)}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-sm border border-xira-blue rounded px-2 py-0.5 focus:ring-1 focus:ring-xira-blue outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="font-semibold text-sm flex items-center gap-1">
                          {sprint.name}
                          <button
                            onClick={(e) => startEditingSprintName(sprint, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded"
                            title="Edit sprint name"
                          >
                            <Pencil size={12} className="text-gray-400" />
                          </button>
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {sprint.startDate
                          ? new Date(sprint.startDate).toLocaleDateString()
                          : ''}{' '}
                        -{' '}
                        {sprint.endDate
                          ? new Date(sprint.endDate).toLocaleDateString()
                          : ''}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({sprintIssues.length} issues)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {points} pts
                      </span>
                      {sprint.state === 'future' && (
                        <button
                          onClick={() => handleStartSprint(sprint)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-xs font-medium"
                        >
                          Start Sprint
                        </button>
                      )}
                      {sprint.state === 'active' && (
                        <button
                          onClick={() => handleCompleteSprint(sprint)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-xs font-medium"
                        >
                          Complete Sprint
                        </button>
                      )}
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                  {expandedSprints[sprint.id] &&
                    renderIssueList(sprintIssues, sprint.id)}
                </div>
              );
            })}

          {/* Create Sprint button */}
          <button
            onClick={handleCreateSprint}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus size={16} /> Create Sprint
          </button>

          {/* Backlog */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-3 flex items-center justify-between bg-gray-100 border-b border-gray-200">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => toggleSprint('backlog')}
              >
                {expandedSprints['backlog'] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                <span className="font-semibold text-sm">Backlog</span>
                <span className="text-xs text-gray-500">
                  ({state.issues.filter((i) => !i.sprintId).length} issues)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {state.issues
                    .filter((i) => !i.sprintId)
                    .reduce((acc, i) => acc + (i.storyPoints || 0), 0)}{' '}
                  pts
                </span>
              </div>
            </div>
            {expandedSprints['backlog'] &&
              renderIssueList(
                filterByEpic(state.issues.filter((i) => !i.sprintId)),
                'backlog'
              )}
          </div>
        </div>
      </DragDropContext>

      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}

      {showBulkEdit && (
        <BulkEditModal
          selectedIssueIds={selectedIssueIds}
          onClose={() => setShowBulkEdit(false)}
          onComplete={() => setSelectedIssueIds(new Set())}
        />
      )}

      {sprintToComplete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Complete sprint?</h2>
            <p className="text-sm text-gray-600 mb-5">
              Complete {sprintToComplete.name}? All incomplete issues will be moved to backlog.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSprintToComplete(null)} className="px-4 py-2 text-sm rounded hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={confirmCompleteSprint} className="px-4 py-2 text-sm rounded bg-xira-blue text-white hover:bg-blue-700">
                Complete sprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
