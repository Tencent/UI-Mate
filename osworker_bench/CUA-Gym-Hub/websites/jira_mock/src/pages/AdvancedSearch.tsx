import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Layers, ChevronUp, ChevronDown, X } from 'lucide-react';
import { IssueModal } from '../components/IssueModal';
import { BulkEditModal } from '../components/BulkEditModal';
import { Issue, IssueType, IssueStatus, Priority } from '../types';

type SortColumn = 'key' | 'summary' | 'status' | 'priority' | 'assignee';
type SortDirection = 'asc' | 'desc';

const PRIORITY_ORDER: Record<string, number> = {
  Highest: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Lowest: 4,
};

const STATUS_ORDER: Record<string, number> = {
  'To Do': 0,
  'In Progress': 1,
  'In Review': 2,
  Done: 3,
};

export const AdvancedSearch: React.FC = () => {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  // Filter state
  const [typeFilter, setTypeFilter] = useState<IssueType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  // Sort state
  const [sortColumn, setSortColumn] = useState<SortColumn>('key');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const hasFilters = typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || query !== '';

  const clearAllFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setQuery('');
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedIssues = useMemo(() => {
    let result = state.issues.filter((issue) => {
      // Text search
      if (query) {
        const lowerQuery = query.toLowerCase();
        const matchesText =
          issue.summary.toLowerCase().includes(lowerQuery) ||
          issue.key.toLowerCase().includes(lowerQuery) ||
          issue.status.toLowerCase().includes(lowerQuery) ||
          issue.priority.toLowerCase().includes(lowerQuery);
        if (!matchesText) return false;
      }

      // Dropdown filters
      if (typeFilter !== 'all' && issue.type !== typeFilter) return false;
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned') {
          if (issue.assigneeId !== null) return false;
        } else if (issue.assigneeId !== assigneeFilter) {
          return false;
        }
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortColumn) {
        case 'key': {
          const numA = parseInt(a.key.split('-')[1], 10);
          const numB = parseInt(b.key.split('-')[1], 10);
          cmp = numA - numB;
          break;
        }
        case 'summary':
          cmp = a.summary.localeCompare(b.summary);
          break;
        case 'status':
          cmp = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0);
          break;
        case 'priority':
          cmp = (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
          break;
        case 'assignee': {
          const nameA = state.users.find((u) => u.id === a.assigneeId)?.name || 'zzz';
          const nameB = state.users.find((u) => u.id === b.assigneeId)?.name || 'zzz';
          cmp = nameA.localeCompare(nameB);
          break;
        }
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [state.issues, state.users, query, typeFilter, statusFilter, priorityFilter, assigneeFilter, sortColumn, sortDirection]);

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

  const toggleSelectAll = () => {
    if (selectedIssueIds.size === filteredAndSortedIssues.length) {
      setSelectedIssueIds(new Set());
    } else {
      setSelectedIssueIds(new Set(filteredAndSortedIssues.map((i) => i.id)));
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp size={14} className="inline ml-1" />
    ) : (
      <ChevronDown size={14} className="inline ml-1" />
    );
  };

  const thClass = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none';

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Advanced Search</h1>
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

      {/* Search input */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={20} />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-xira-blue focus:ring-1 focus:ring-xira-blue sm:text-sm"
          placeholder="Search issues by summary, key, status, or priority..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as IssueType | 'all')}
          className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
        >
          <option value="all">All Types</option>
          <option value="Story">Story</option>
          <option value="Task">Task</option>
          <option value="Bug">Bug</option>
          <option value="Epic">Epic</option>
          <option value="Access Request">Access Request</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'all')}
          className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="In Review">In Review</option>
          <option value="Done">Done</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
          className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="Highest">Highest</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Lowest">Lowest</option>
        </select>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
        >
          <option value="all">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {state.users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-xira-blue hover:underline flex items-center gap-1"
          >
            <X size={14} /> Clear all filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={filteredAndSortedIssues.length > 0 && selectedIssueIds.size === filteredAndSortedIssues.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-xira-blue focus:ring-xira-blue cursor-pointer"
                />
              </th>
              <th className={thClass} onClick={() => handleSort('key')}>
                Key
                <SortIcon column="key" />
              </th>
              <th className={thClass} onClick={() => handleSort('summary')}>
                Summary
                <SortIcon column="summary" />
              </th>
              <th className={thClass} onClick={() => handleSort('status')}>
                Status
                <SortIcon column="status" />
              </th>
              <th className={thClass} onClick={() => handleSort('priority')}>
                Priority
                <SortIcon column="priority" />
              </th>
              <th className={thClass} onClick={() => handleSort('assignee')}>
                Assignee
                <SortIcon column="assignee" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedIssues.map((issue) => {
              const assignee = state.users.find((u) => u.id === issue.assigneeId);
              const isSelected = selectedIssueIds.has(issue.id);
              return (
                <tr
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={(e) => toggleIssueSelection(issue.id, e)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded border-gray-300 text-xira-blue focus:ring-xira-blue cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-xira-blue">
                    {issue.key}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {issue.summary}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        issue.status === 'Done'
                          ? 'bg-green-100 text-green-800'
                          : issue.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : issue.status === 'In Review'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issue.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {assignee ? (
                        <>
                          <img
                            className="h-6 w-6 rounded-full"
                            src={assignee.avatar}
                            alt=""
                          />
                          <span className="ml-2 text-sm text-gray-500">
                            {assignee.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredAndSortedIssues.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No issues found matching your criteria.
          </div>
        )}
      </div>

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
    </div>
  );
};
