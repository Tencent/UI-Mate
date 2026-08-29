import React, { useState, useEffect, useRef } from 'react';
import { X, Bookmark, CheckCircle2, AlertCircle, Zap, ArrowUp, ArrowDown, KeyRound } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Issue, IssueType, Priority } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface CreateIssueModalProps {
  onClose: () => void;
}

const typeIcons: Record<IssueType, React.ReactNode> = {
  Story: <Bookmark className="text-xira-green" size={16} fill="currentColor" />,
  Task: <CheckCircle2 className="text-xira-blue" size={16} />,
  Bug: <AlertCircle className="text-xira-red" size={16} />,
  Epic: <Zap className="text-purple-600" size={16} />,
  'Access Request': <KeyRound className="text-xira-blue" size={16} />,
};

const priorityIcons: Record<Priority, React.ReactNode> = {
  Highest: <ArrowUp className="text-xira-red" size={16} />,
  High: <ArrowUp className="text-xira-red" size={16} />,
  Medium: <ArrowUp className="text-xira-yellow" size={16} />,
  Low: <ArrowDown className="text-xira-green" size={16} />,
  Lowest: <ArrowDown className="text-xira-blue" size={16} />,
};

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({ onClose }) => {
  const { state, dispatch } = useStore();
  const summaryRef = useRef<HTMLInputElement>(null);

  const [issueType, setIssueType] = useState<IssueType>('Story');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [sprintId, setSprintId] = useState<string | null>(null);
  const [storyPoints, setStoryPoints] = useState(0);
  const [epicId, setEpicId] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [showLabelSuggestions, setShowLabelSuggestions] = useState(false);

  useEffect(() => {
    summaryRef.current?.focus();
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Collect existing labels from all issues
  const existingLabels = Array.from(
    new Set(state.issues.flatMap((i) => i.labels))
  ).sort();

  const filteredLabelSuggestions = existingLabels.filter(
    (l) =>
      l.toLowerCase().includes(labelInput.toLowerCase()) &&
      !labels.includes(l)
  );

  const addLabel = (label: string) => {
    const trimmed = label.trim();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
    }
    setLabelInput('');
    setShowLabelSuggestions(false);
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label));
  };

  const epics = state.issues.filter((i) => i.type === 'Epic');
  const availableSprints = state.sprints.filter(
    (s) => s.state === 'active' || s.state === 'future'
  );

  const handleCreate = () => {
    if (!summary.trim()) return;

    const project = state.projects[0];

    // Compute next issue key from the max numeric suffix among THIS project's
    // issues. Previously hardcoded `projectId === 'p1'`, which broke for any
    // injected state whose project id was not 'p1' (e.g. 'p_ithd') — yielding
    // maxKeyNum=0 and a key like "ITHD-1" instead of "ITHD-101".
    const maxKeyNum = state.issues
      .filter((i) => i.projectId === project.id)
      .reduce((max, i) => {
        const num = parseInt(i.key.split('-')[1], 10);
        return Number.isFinite(num) && num > max ? num : max;
      }, 0);

    const newIssue: Issue = {
      id: uuidv4(),
      key: `${project.key}-${maxKeyNum + 1}`,
      projectId: project.id,
      summary: summary.trim(),
      description,
      type: issueType,
      status: 'To Do',
      priority,
      storyPoints,
      reporterId: state.currentUser.id,
      assigneeId,
      sprintId,
      epicId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      labels,
      subtasks: [],
      linkedIssueIds: [],
    };

    dispatch({ type: 'ADD_ISSUE', payload: newIssue });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-lg z-10">
          <h2 className="text-lg font-bold text-gray-900">Create Issue</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Project (read-only for now) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Project
            </label>
            <div className="flex items-center gap-2 bg-gray-100 rounded px-3 py-2 text-sm text-gray-700">
              <div className="w-5 h-5 bg-xira-blue rounded flex items-center justify-center text-white text-xs font-bold">
                {state.projects[0].key[0]}
              </div>
              {state.projects[0].name} ({state.projects[0].key})
            </div>
          </div>

          {/* Issue Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Issue Type
            </label>
            <div className="relative">
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
              >
                <option value="Story">Story</option>
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Epic">Epic</option>
                <option value="Access Request">Access Request</option>
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {typeIcons[issueType]}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Summary <span className="text-xira-red">*</span>
            </label>
            <input
              ref={summaryRef}
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none"
              placeholder="Enter a brief summary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none resize-y min-h-[80px]"
              placeholder="Add a description..."
              rows={3}
            />
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Assignee
              </label>
              <select
                value={assigneeId || ''}
                onChange={(e) =>
                  setAssigneeId(e.target.value || null)
                }
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
              >
                <option value="">Unassigned</option>
                {state.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
              >
                {(['Highest', 'High', 'Medium', 'Low', 'Lowest'] as Priority[]).map(
                  (p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Sprint */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Sprint
              </label>
              <select
                value={sprintId || ''}
                onChange={(e) =>
                  setSprintId(e.target.value || null)
                }
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
              >
                <option value="">Backlog</option>
                {availableSprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Story Points
              </label>
              <input
                type="number"
                value={storyPoints}
                onChange={(e) =>
                  setStoryPoints(parseInt(e.target.value) || 0)
                }
                min={0}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none"
              />
            </div>
          </div>

          {/* Epic Link */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Epic Link
            </label>
            <select
              value={epicId || ''}
              onChange={(e) => setEpicId(e.target.value || null)}
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
            >
              <option value="">None</option>
              {epics.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.key} - {e.summary}
                </option>
              ))}
            </select>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Labels
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {labels.map((label) => (
                <span
                  key={label}
                  className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                >
                  {label}
                  <button
                    onClick={() => removeLabel(label)}
                    className="hover:text-blue-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => {
                  setLabelInput(e.target.value);
                  setShowLabelSuggestions(true);
                }}
                onFocus={() => setShowLabelSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && labelInput.trim()) {
                    e.preventDefault();
                    addLabel(labelInput);
                  }
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none"
                placeholder="Type to add labels..."
              />
              {showLabelSuggestions && filteredLabelSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b shadow-lg max-h-32 overflow-y-auto">
                  {filteredLabelSuggestions.map((label) => (
                    <button
                      key={label}
                      onClick={() => addLabel(label)}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!summary.trim()}
            className="px-4 py-2 bg-xira-blue text-white rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
