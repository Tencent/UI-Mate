import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { CheckCircle, Clock, AlertCircle, Search, Filter, X, Send, MessageSquare, ChevronDown } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../lib/utils';

const typeColors = {
  Approval: 'bg-orange-100 text-orange-600',
  Review: 'bg-blue-100 text-blue-600',
  Compliance: 'bg-red-100 text-red-600',
  Information: 'bg-gray-100 text-gray-600',
  'To-Do': 'bg-green-100 text-green-600',
};

const typeIcons = {
  Approval: <CheckCircle size={20} />,
  Review: <Clock size={20} />,
  Compliance: <AlertCircle size={20} />,
  Information: <AlertCircle size={20} />,
  'To-Do': <CheckCircle size={20} />,
};

const priorityColors = {
  High: 'bg-red-100 text-red-700',
  Normal: 'bg-gray-100 text-gray-600',
  Low: 'bg-blue-100 text-blue-600',
};

function TaskDetailPanel({ task, onClose, dispatch, currentUserName, addToast }) {
  const [comment, setComment] = useState('');
  const [showDenyConfirm, setShowDenyConfirm] = useState(false);
  const [showSendBack, setShowSendBack] = useState(false);
  const [sendBackFeedback, setSendBackFeedback] = useState('');

  const handleAddComment = () => {
    if (!comment.trim()) return;
    dispatch({ type: 'ADD_TASK_COMMENT', payload: { taskId: task.taskId, text: comment } });
    setComment('');
  };

  const handleApprove = () => {
    dispatch({ type: 'COMPLETE_TASK', payload: task.taskId });
    if (addToast) addToast('Task approved successfully', 'success');
    onClose();
  };

  const handleDeny = () => {
    dispatch({ type: 'DENY_TASK', payload: task.taskId });
    if (addToast) addToast('Task denied', 'error');
    setShowDenyConfirm(false);
    onClose();
  };

  const handleSendBack = () => {
    dispatch({ type: 'SEND_BACK_TASK', payload: { taskId: task.taskId, feedback: sendBackFeedback } });
    if (addToast) addToast('Task sent back with feedback', 'info');
    setShowSendBack(false);
    setSendBackFeedback('');
  };

  const timeSince = (dateStr) => {
    if (!dateStr) return '';
    const diff = (new Date() - new Date(dateStr)) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="bg-black/30 absolute inset-0" />
      <div className="relative w-[420px] bg-white h-full shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
          <h2 className="font-bold text-lg text-gray-900">Task Details</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Title and type */}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{task.description}</h3>
            {task.businessProcess && (
              <p className="text-sm text-primary font-medium mt-1">{task.businessProcess}</p>
            )}
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4">
            {task.initiator && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Initiator</p>
                <p className="text-sm text-gray-900">{task.initiator}</p>
              </div>
            )}
            {task.createdDate && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Created</p>
                <p className="text-sm text-gray-900">{formatDate(task.createdDate)}</p>
              </div>
            )}
            {task.dueDate && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Due Date</p>
                <p className="text-sm text-gray-900">{formatDate(task.dueDate)}</p>
              </div>
            )}
            {task.priority && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Priority</p>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                  {task.priority}
                </span>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Status</p>
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
              task.status === 'Completed' ? 'bg-green-100 text-green-700' :
              task.status === 'Denied' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {task.status}
            </span>
          </div>

          {/* Action buttons for pending tasks */}
          {task.status === 'Pending' && (
            <div className="pt-2 border-t border-gray-100">
              {task.type === 'Approval' ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleApprove}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setShowSendBack(true)}
                    className="px-4 py-2 border-2 border-orange-400 text-orange-600 hover:bg-orange-50 rounded-md text-sm font-medium transition-colors"
                  >
                    Send Back
                  </button>
                  <button
                    onClick={() => setShowDenyConfirm(true)}
                    className="px-4 py-2 border-2 border-red-400 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                  >
                    Deny
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleApprove}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
                >
                  Mark Complete
                </button>
              )}
            </div>
          )}

          {/* Deny Confirm Dialog */}
          {showDenyConfirm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-3">Are you sure you want to deny this request?</p>
              <div className="flex gap-2">
                <button onClick={handleDeny} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
                  Yes, Deny
                </button>
                <button onClick={() => setShowDenyConfirm(false)} className="px-3 py-1.5 bg-white border border-gray-300 text-sm rounded-md hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Send Back Dialog */}
          {showSendBack && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-800 mb-2">Send back with feedback:</p>
              <textarea
                value={sendBackFeedback}
                onChange={e => setSendBackFeedback(e.target.value)}
                className="w-full p-2 border border-orange-300 rounded-md text-sm mb-2"
                rows={3}
                placeholder="Provide feedback for the initiator..."
              />
              <div className="flex gap-2">
                <button onClick={handleSendBack} className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700">
                  Send Back
                </button>
                <button onClick={() => setShowSendBack(false)} className="px-3 py-1.5 bg-white border border-gray-300 text-sm rounded-md hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <MessageSquare size={16} />
              Comments ({(task.comments || []).length})
            </h4>
            <div className="space-y-3 mb-4">
              {(task.comments || []).length === 0 ? (
                <p className="text-xs text-gray-400 italic">No comments yet.</p>
              ) : (
                (task.comments || []).map(c => (
                  <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{c.author}</span>
                      <span className="text-[11px] text-gray-400">{timeSince(c.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {task.status === 'Pending' && (
              <div className="flex gap-2">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm resize-none"
                  rows={2}
                  placeholder="Add a comment..."
                />
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  aria-label="Add Comment"
                  className="self-end px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Inbox() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const { tasks } = state;
  const [activeTab, setActiveTab] = useState('actions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const actionsTasks = tasks.filter(t => t.status === 'Pending');
  const archiveTasks = tasks.filter(t => t.status !== 'Pending');

  const currentTasks = activeTab === 'actions' ? actionsTasks : archiveTasks;

  const filteredTasks = useMemo(() => {
    let result = currentTasks;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t =>
        (t.description || '').toLowerCase().includes(lower) ||
        (t.type || '').toLowerCase().includes(lower) ||
        (t.initiator || '').toLowerCase().includes(lower) ||
        (t.businessProcess || '').toLowerCase().includes(lower)
      );
    }
    if (filterType !== 'All Types') {
      result = result.filter(t => t.type === filterType);
    }
    return result;
  }, [currentTasks, searchTerm, filterType]);

  const selectedTask = tasks.find(t => t.taskId === selectedTaskId);

  const toggleSelect = (taskId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const handleBulkApprove = () => {
    selectedIds.forEach(id => {
      dispatch({ type: 'COMPLETE_TASK', payload: id });
    });
    addToast(`${selectedIds.size} task(s) approved`, 'success');
    setSelectedIds(new Set());
  };

  const taskTypes = ['All Types', 'Approval', 'Review', 'Compliance', 'Information', 'To-Do'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Inbox</h1>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
        <button
          onClick={() => { setActiveTab('actions'); setSelectedIds(new Set()); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'actions' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Actions
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
            activeTab === 'actions' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {actionsTasks.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('archive'); setSelectedIds(new Set()); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'archive' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Archive
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
            activeTab === 'archive' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {archiveTasks.length}
          </span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter size={16} />
            {filterType}
            <ChevronDown size={14} />
          </button>
          {showFilterDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              {taskTypes.map(type => (
                <button
                  key={type}
                  onClick={() => { setFilterType(type); setShowFilterDropdown(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    filterType === type ? 'text-primary font-medium' : 'text-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && activeTab === 'actions' && (
        <div className="flex items-center gap-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-primary">{selectedIds.size} selected</span>
          <button
            onClick={handleBulkApprove}
            className="px-3 py-1.5 bg-primary text-white text-sm rounded-md font-medium hover:bg-primary-hover"
          >
            Approve All
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Task list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredTasks.length === 0 ? (
            searchTerm || filterType !== 'All Types' ? (
              <EmptyState
                type="search"
                title="No matching tasks"
                description="Try adjusting your search terms or filters."
              />
            ) : (
              <EmptyState
                type="inbox"
                title={activeTab === 'actions' ? 'All caught up!' : 'No archived tasks'}
                description={activeTab === 'actions' ? 'You have no pending tasks.' : 'Completed tasks will appear here.'}
              />
            )
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.taskId}
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  activeTab === 'archive' ? 'opacity-60' : 'hover:bg-blue-50/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox for actions tab */}
                  {activeTab === 'actions' && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(task.taskId)}
                      onChange={() => toggleSelect(task.taskId)}
                      className="mt-2 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  )}
                  <div className={`mt-0.5 p-2 rounded-full ${typeColors[task.type] || 'bg-gray-100 text-gray-600'}`}>
                    {typeIcons[task.type] || <Clock size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.description}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                      {task.initiator && <span>{task.initiator}</span>}
                      {task.initiator && <span className="w-1 h-1 bg-gray-300 rounded-full"></span>}
                      <span>Due: {formatDate(task.dueDate)}</span>
                      {task.priority && task.priority !== 'Normal' && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {task.status === 'Pending' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedTaskId(task.taskId)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Details
                    </button>
                    {task.type === 'Approval' ? (
                      <>
                        <button
                          onClick={() => {
                            dispatch({ type: 'COMPLETE_TASK', payload: task.taskId });
                            addToast('Task approved successfully', 'success');
                          }}
                          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
                        >
                          Approve
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          dispatch({ type: 'COMPLETE_TASK', payload: task.taskId });
                          addToast('Task completed successfully', 'success');
                        }}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shrink-0 ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'Denied' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {task.status}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          dispatch={dispatch}
          currentUserName={state.currentUser.name}
          addToast={addToast}
        />
      )}
    </div>
  );
}
