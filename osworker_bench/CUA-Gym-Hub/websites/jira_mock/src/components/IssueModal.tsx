import React, { useState, useEffect } from 'react';
import { X, Send, Trash2, Calendar, Clock, Paperclip, Link as LinkIcon, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Code, CheckSquare, Plus, Bookmark, CheckCircle2, AlertCircle, Zap, KeyRound } from 'lucide-react';
import { Issue, User, Comment, IssueStatus, IssueType, Priority, Subtask } from '../types';
import { useStore } from '../context/StoreContext';
import { formatDistanceToNow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface IssueModalProps {
  issue: Issue | null;
  onClose: () => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({ issue, onClose }) => {
  const { state, dispatch } = useStore();
  const [editedIssue, setEditedIssue] = useState<Issue | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [labelInput, setLabelInput] = useState('');
  const [showLabelSuggestions, setShowLabelSuggestions] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkType, setLinkType] = useState('relates to');
  const [linkSearch, setLinkSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [deletePending, setDeletePending] = useState(false);

  useEffect(() => {
    setEditedIssue(issue);
  }, [issue]);

  if (!issue || !editedIssue) return null;

  const handleChange = (field: keyof Issue, value: any) => {
    setEditedIssue((prev) => {
      const updated = { ...prev!, [field]: value, updatedAt: new Date().toISOString() };
      dispatch({ type: 'UPDATE_ISSUE', payload: updated });
      return updated;
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: uuidv4(),
      issueId: issue.id,
      userId: state.currentUser.id,
      content: newComment,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_COMMENT', payload: comment });
    setNewComment('');
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSubtask: Subtask = {
      id: uuidv4(),
      title: newSubtaskTitle,
      completed: false,
    };
    const updatedSubtasks = [...(editedIssue.subtasks || []), newSubtask];
    handleChange('subtasks', updatedSubtasks);
    setNewSubtaskTitle('');
    setShowSubtaskInput(false);
  };

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = (editedIssue.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    handleChange('subtasks', updatedSubtasks);
  };

  const deleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = (editedIssue.subtasks || []).filter(
      (st) => st.id !== subtaskId
    );
    handleChange('subtasks', updatedSubtasks);
  };

  const calculateProgress = () => {
    const subtasks = editedIssue.subtasks || [];
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter((st) => st.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  // Labels
  const existingLabels = Array.from(
    new Set(state.issues.flatMap((i) => i.labels))
  ).sort();

  const filteredLabelSuggestions = existingLabels.filter(
    (l) =>
      l.toLowerCase().includes(labelInput.toLowerCase()) &&
      !(editedIssue.labels || []).includes(l)
  );

  const addLabel = (label: string) => {
    const trimmed = label.trim();
    if (trimmed && !(editedIssue.labels || []).includes(trimmed)) {
      handleChange('labels', [...(editedIssue.labels || []), trimmed]);
    }
    setLabelInput('');
    setShowLabelSuggestions(false);
  };

  const removeLabel = (label: string) => {
    handleChange(
      'labels',
      (editedIssue.labels || []).filter((l) => l !== label)
    );
  };

  const issueComments = state.comments
    .filter((c) => c.issueId === issue.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Workflow Logic
  const workflow = state.workflows[0];
  const allowedTransitions =
    workflow.transitions.find((t) => t.from === editedIssue.status)?.to || [];
  const validStatuses = [
    ...new Set([editedIssue.status, ...allowedTransitions]),
  ];

  const reporter = state.users.find((u) => u.id === editedIssue.reporterId);

  const getTypeIcon = (type: IssueType) => {
    switch (type) {
      case 'Bug':
        return <AlertCircle className="text-xira-red" size={16} />;
      case 'Story':
        return <Bookmark className="text-xira-green" size={16} fill="currentColor" />;
      case 'Task':
        return <CheckCircle2 className="text-xira-blue" size={16} />;
      case 'Epic':
        return <Zap className="text-purple-600" size={16} />;
      case 'Access Request':
        return <KeyRound className="text-xira-blue" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-lg z-10">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {getTypeIcon(editedIssue.type)}
            <span className="font-medium text-xira-subtext">{issue.key}</span>
            <span>/</span>
            <span>{issue.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeletePending(true)}
              className="p-2 hover:bg-gray-100 rounded text-red-600"
              title="Delete Issue"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {deletePending && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-2xl p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Delete issue?</h2>
              <p className="text-sm text-gray-600 mb-5">
                This removes {issue.key} from the local Xira project state.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeletePending(false)} className="px-4 py-2 text-sm rounded hover:bg-gray-100">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    dispatch({ type: 'DELETE_ISSUE', payload: issue.id });
                    setDeletePending(false);
                    onClose();
                  }}
                  className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* Main Content */}
          <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
            <input
              type="text"
              value={editedIssue.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              className="text-2xl font-semibold text-gray-900 w-full border-transparent hover:border-gray-300 border rounded px-2 py-1 mb-4 focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none transition-colors"
            />

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Description
              </h3>
              <div className="border border-gray-300 rounded-md focus-within:border-xira-blue focus-within:ring-1 focus-within:ring-xira-blue transition-all">
                <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Bold"><Bold size={16} /></button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Italic"><Italic size={16} /></button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Underline"><Underline size={16} /></button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Bullet List"><List size={16} /></button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Ordered List"><ListOrdered size={16} /></button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Align Left"><AlignLeft size={16} /></button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Align Center"><AlignCenter size={16} /></button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Align Right"><AlignRight size={16} /></button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Code Block"><Code size={16} /></button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Link"><LinkIcon size={16} /></button>
                </div>
                <textarea
                  value={editedIssue.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full min-h-[150px] p-3 border-none outline-none resize-y text-gray-700 text-sm bg-transparent rounded-b-md"
                  placeholder="Add a description..."
                />
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  Subtasks
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-xira-blue transition-all duration-300"
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {calculateProgress()}% done
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {(editedIssue.subtasks || []).map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded group"
                  >
                    <button
                      onClick={() => toggleSubtask(subtask.id)}
                      className={`text-gray-400 hover:text-xira-blue ${
                        subtask.completed
                          ? 'text-xira-green hover:text-xira-green'
                          : ''
                      }`}
                    >
                      <CheckSquare
                        size={18}
                        fill={subtask.completed ? 'currentColor' : 'none'}
                      />
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        subtask.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-900'
                      }`}
                    >
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => deleteSubtask(subtask.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {showSubtaskInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleAddSubtask()
                    }
                    placeholder="What needs to be done?"
                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded text-sm font-medium text-gray-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowSubtaskInput(false)}
                    className="hover:bg-gray-100 px-2 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSubtaskInput(true)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:bg-gray-100 px-2 py-1.5 rounded w-full"
                >
                  <Plus size={16} /> Create subtask
                </button>
              )}
            </div>

            {/* Issue Links */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Issue Links
              </h3>
              <div className="space-y-2 mb-2">
                {(editedIssue.linkedIssueIds || []).map((linkedId) => {
                  const linkedIssue = state.issues.find((i) => i.id === linkedId);
                  if (!linkedIssue) return null;
                  return (
                    <div
                      key={linkedId}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded group"
                    >
                      <span className="text-xs text-gray-500">relates to</span>
                      <span className="text-sm font-medium text-xira-blue">
                        {linkedIssue.key}
                      </span>
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {linkedIssue.summary}
                      </span>
                      <button
                        onClick={() => {
                          const newLinks = (editedIssue.linkedIssueIds || []).filter(
                            (id) => id !== linkedId
                          );
                          handleChange('linkedIssueIds', newLinks);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              {showLinkForm ? (
                <div className="border border-gray-200 rounded p-3 space-y-2">
                  <select
                    value={linkType}
                    onChange={(e) => setLinkType(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="blocks">blocks</option>
                    <option value="is blocked by">is blocked by</option>
                    <option value="relates to">relates to</option>
                    <option value="duplicates">duplicates</option>
                  </select>
                  <input
                    type="text"
                    value={linkSearch}
                    onChange={(e) => setLinkSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    placeholder="Search issue key or summary..."
                  />
                  {linkSearch && (
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded">
                      {state.issues
                        .filter(
                          (i) =>
                            i.id !== editedIssue.id &&
                            !(editedIssue.linkedIssueIds || []).includes(i.id) &&
                            (i.key.toLowerCase().includes(linkSearch.toLowerCase()) ||
                              i.summary.toLowerCase().includes(linkSearch.toLowerCase()))
                        )
                        .slice(0, 5)
                        .map((i) => (
                          <button
                            key={i.id}
                            onClick={() => {
                              handleChange('linkedIssueIds', [
                                ...(editedIssue.linkedIssueIds || []),
                                i.id,
                              ]);
                              setLinkSearch('');
                              setShowLinkForm(false);
                            }}
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 flex items-center gap-2"
                          >
                            <span className="text-xira-blue font-medium">
                              {i.key}
                            </span>
                            <span className="text-gray-700 truncate">
                              {i.summary}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowLinkForm(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLinkForm(true)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:bg-gray-100 px-2 py-1.5 rounded"
                >
                  <Plus size={16} /> Link issue
                </button>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Attachments
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Paperclip size={20} />
                  <span className="text-sm">
                    Drop files to attach, or{' '}
                    <span className="text-xira-blue">browse</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Comments & Activity Tabs */}
            <div className="mb-6">
              <div className="flex gap-4 border-b border-gray-200 mb-4">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'comments'
                      ? 'border-xira-blue text-xira-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Comments
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'activity'
                      ? 'border-xira-blue text-xira-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Activity
                </button>
              </div>

              {activeTab === 'comments' && (
                <>
                  <div className="flex gap-3 mb-6">
                    <img
                      src={state.currentUser.avatar}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none text-sm"
                        placeholder="Add a comment..."
                        rows={2}
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={handleAddComment}
                          className="bg-xira-blue text-white px-4 py-1.5 rounded hover:bg-blue-700 font-medium text-sm disabled:opacity-50 transition-colors"
                          disabled={!newComment.trim()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {issueComments.map((comment) => {
                      const user = state.users.find(
                        (u) => u.id === comment.userId
                      );
                      return (
                        <div key={comment.id} className="flex gap-3">
                          <img
                            src={user?.avatar}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {user?.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(
                                  new Date(comment.createdAt)
                                )}{' '}
                                ago
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {/* Generated activity entries */}
                  {(() => {
                    const creatorUser = state.users.find(
                      (u) => u.id === editedIssue.reporterId
                    );
                    const assigneeUser = editedIssue.assigneeId
                      ? state.users.find((u) => u.id === editedIssue.assigneeId)
                      : null;
                    const activities = [
                      {
                        user: creatorUser,
                        text: 'created this issue',
                        time: editedIssue.createdAt,
                      },
                    ];
                    if (
                      assigneeUser &&
                      editedIssue.assigneeId !== editedIssue.reporterId
                    ) {
                      activities.push({
                        user: assigneeUser,
                        text: 'was assigned',
                        time: editedIssue.updatedAt,
                      });
                    }
                    if (editedIssue.status !== 'To Do') {
                      activities.push({
                        user: assigneeUser || creatorUser,
                        text: `changed status to ${editedIssue.status}`,
                        time: editedIssue.updatedAt,
                      });
                    }
                    return activities.map((act, idx) => (
                      <div key={idx} className="flex gap-3">
                        <img
                          src={act.user?.avatar}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {act.user?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(act.time))} ago
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{act.text}</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-80 p-6 bg-gray-50 overflow-y-auto">
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Status
              </label>
              <select
                value={editedIssue.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1.5 text-sm font-medium hover:bg-gray-200 cursor-pointer focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
              >
                {validStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Allowed transitions:{' '}
                {allowedTransitions.join(', ') || 'None'}
              </p>
            </div>

            {/* Issue Type */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Issue Type
              </label>
              <div className="flex items-center gap-2">
                {getTypeIcon(editedIssue.type)}
                <select
                  value={editedIssue.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="flex-1 bg-transparent border border-transparent hover:bg-gray-200 rounded px-2 py-1.5 text-sm cursor-pointer focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
                >
                  {(['Story', 'Task', 'Bug', 'Epic', 'Access Request'] as IssueType[]).map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Assignee
              </label>
              <select
                value={editedIssue.assigneeId || ''}
                onChange={(e) =>
                  handleChange('assigneeId', e.target.value || null)
                }
                className="w-full bg-transparent border border-transparent hover:bg-gray-200 rounded px-2 py-1.5 text-sm cursor-pointer focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
              >
                <option value="">Unassigned</option>
                {state.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reporter */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Reporter
              </label>
              <div className="flex items-center gap-2 px-2 py-1.5">
                {reporter && (
                  <>
                    <img
                      src={reporter.avatar}
                      alt={reporter.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-700">
                      {reporter.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Priority
              </label>
              <select
                value={editedIssue.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full bg-transparent border border-transparent hover:bg-gray-200 rounded px-2 py-1.5 text-sm cursor-pointer focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
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

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Story Points
              </label>
              <input
                type="number"
                value={editedIssue.storyPoints}
                onChange={(e) =>
                  handleChange('storyPoints', parseInt(e.target.value) || 0)
                }
                className="w-full bg-transparent border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
              />
            </div>

            {/* Labels */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Labels
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {(editedIssue.labels || []).map((label) => (
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
                  onBlur={() =>
                    setTimeout(() => setShowLabelSuggestions(false), 200)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && labelInput.trim()) {
                      e.preventDefault();
                      addLabel(labelInput);
                    }
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none"
                  placeholder="Add a label..."
                />
                {showLabelSuggestions &&
                  filteredLabelSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b shadow-lg max-h-32 overflow-y-auto">
                      {filteredLabelSuggestions.map((label) => (
                        <button
                          key={label}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            addLabel(label);
                          }}
                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Custom Fields */}
            <div className="mb-6 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Custom Fields
              </h4>

              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-1">
                  Target Release
                </label>
                <input
                  type="text"
                  placeholder="e.g. v2.0"
                  className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-1">
                  Environment
                </label>
                <select className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm">
                  <option>None</option>
                  <option>Production</option>
                  <option>Staging</option>
                  <option>Development</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>
                  Created{' '}
                  {new Date(editedIssue.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>
                  Updated{' '}
                  {formatDistanceToNow(new Date(editedIssue.updatedAt))} ago
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
