
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { getSessionId } from '../data/initialData';
import { Star, X, CheckCircle2, Circle, Heart, ChevronDown, ChevronLeft, ChevronRight, Paperclip, Download, Upload } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import './ProjectDetail.css';

type ViewTab = 'list' | 'board' | 'timeline' | 'calendar' | 'dashboard';

interface Filters {
  assigneeId: string;
  priorities: Set<string>;
  dueDateRange: string;
}

function getPriorityValue(task: Task): string | null {
  const val = task.customFieldValues['field-1'];
  if (val && typeof val === 'string' && ['High', 'Medium', 'Low'].includes(val)) {
    return val;
  }
  return null;
}

function PriorityBadge({ task }: { task: Task }) {
  const priority = getPriorityValue(task);
  if (!priority) return null;
  const cls = priority === 'High' ? 'priority-high' : priority === 'Medium' ? 'priority-medium' : 'priority-low';
  return <span className={`priority-badge ${cls}`}>{priority}</span>;
}

function formatDueDate(dateStr: string): { text: string; isOverdue: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const due = new Date(dateStr + 'T00:00:00');

  if (due < today) {
    return { text: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isOverdue: true };
  }
  if (due.getTime() === today.getTime()) {
    return { text: 'Today', isOverdue: false };
  }
  if (due.getTime() === tomorrow.getTime()) {
    return { text: 'Tomorrow', isOverdue: false };
  }
  return {
    text: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    isOverdue: false
  };
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { state, toggleProjectStar, toggleTaskComplete, updateTask, addTask, addComment, addAttachment, toggleCommentLike } = useApp();

  const [activeTab, setActiveTab] = useState<ViewTab>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Inline add task state
  const [addingInSection, setAddingInSection] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const addTaskInputRef = useRef<HTMLInputElement>(null);

  // Board inline add
  const [addingInBoardSection, setAddingInBoardSection] = useState<string | null>(null);
  const [newBoardTaskName, setNewBoardTaskName] = useState('');
  const addBoardTaskInputRef = useRef<HTMLInputElement>(null);

  // Task detail dropdowns
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [showDueDateInput, setShowDueDateInput] = useState(false);
  const [dueDateValue, setDueDateValue] = useState('');

  // Comments
  const [newComment, setNewComment] = useState('');

  // Tags
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Subtasks
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');

  // Timeline state
  const [timelineOffset, setTimelineOffset] = useState(0);

  // Calendar state
  const [calDate, setCalDate] = useState(new Date());

  const [filters, setFilters] = useState<Filters>({
    assigneeId: '',
    priorities: new Set<string>(),
    dueDateRange: '',
  });

  const project = state.projects.find(p => p.projectId === projectId);
  const safeProjectId = project?.projectId || projectId || '';

  useEffect(() => {
    if (addingInSection && addTaskInputRef.current) {
      addTaskInputRef.current.focus();
    }
  }, [addingInSection]);

  useEffect(() => {
    if (addingInBoardSection && addBoardTaskInputRef.current) {
      addBoardTaskInputRef.current.focus();
    }
  }, [addingInBoardSection]);

  const projectTasks = state.tasks.filter(t => t.projectId === projectId && !t.parentTaskId);

  const projectMembers = useMemo(() => {
    const memberIds = new Set(projectTasks.map(t => t.assigneeId).filter(Boolean));
    return state.users.filter(u => memberIds.has(u.userId));
  }, [projectTasks, state.users]);

  const filteredTasks = useMemo(() => {
    return projectTasks.filter(task => {
      if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false;
      if (filters.priorities.size > 0) {
        const priority = getPriorityValue(task);
        if (!priority || !filters.priorities.has(priority)) return false;
      }
      if (filters.dueDateRange && task.dueDate) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const taskDue = new Date(task.dueDate);
        if (filters.dueDateRange === 'overdue') {
          if (taskDue >= today) return false;
        } else if (filters.dueDateRange === 'next3days') {
          const threeDays = new Date(today);
          threeDays.setDate(threeDays.getDate() + 3);
          if (taskDue < today || taskDue > threeDays) return false;
        } else if (filters.dueDateRange === 'thisweek') {
          const endOfWeek = new Date(today);
          endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
          if (taskDue < today || taskDue > endOfWeek) return false;
        }
      } else if (filters.dueDateRange && !task.dueDate) {
        return false;
      }
      return true;
    });
  }, [projectTasks, filters]);

  const hasActiveFilters = filters.assigneeId || filters.priorities.size > 0 || filters.dueDateRange;

  const togglePriorityFilter = (priority: string) => {
    setFilters(prev => {
      const next = new Set(prev.priorities);
      if (next.has(priority)) next.delete(priority);
      else next.add(priority);
      return { ...prev, priorities: next };
    });
  };

  const clearFilters = () => {
    setFilters({ assigneeId: '', priorities: new Set(), dueDateRange: '' });
  };

  const selectedTask = selectedTaskId ? state.tasks.find(t => t.taskId === selectedTaskId) : null;

  if (!project) {
    return <div className="project-detail-page">Project not found</div>;
  }

  const openTaskDetail = (task: Task) => {
    setSelectedTaskId(task.taskId);
    setEditName(task.name);
    setEditDescription(task.description);
    setShowAssigneeDropdown(false);
    setShowPriorityDropdown(false);
    setShowSectionDropdown(false);
    setShowDueDateInput(false);
    setDueDateValue(task.dueDate || '');
    setNewComment('');
    setAddingTag(false);
    setNewTag('');
    setAddingSubtask(false);
    setNewSubtaskName('');
  };

  const closeTaskDetail = () => {
    if (selectedTask) {
      if (editName !== selectedTask.name || editDescription !== selectedTask.description) {
        updateTask(selectedTask.taskId, { name: editName, description: editDescription });
      }
    }
    setSelectedTaskId(null);
  };

  useEffect(() => {
    if (!selectedTaskId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeTaskDetail();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTaskId, selectedTask, editName, editDescription]);

  const saveTaskEdits = () => {
    if (selectedTask) {
      updateTask(selectedTask.taskId, { name: editName, description: editDescription });
    }
  };

  // Inline add task handlers
  const handleAddTaskInSection = (sectionId: string) => {
    setAddingInSection(sectionId);
    setNewTaskName('');
  };

  const commitNewTask = (sectionId: string) => {
    if (newTaskName.trim()) {
      const task: Task = {
        taskId: `task-${Date.now()}`,
        name: newTaskName.trim(),
        projectId: safeProjectId,
        sectionId,
        description: '',
        assigneeId: undefined,
        creatorId: state.currentUser.userId,
        completed: false,
        dependencies: [],
        tags: [],
        attachmentIds: [],
        customFieldValues: {},
        likeCount: 0,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString()
      };
      addTask(task);
    }
    setAddingInSection(null);
    setNewTaskName('');
  };

  const handleAddTaskInBoard = (sectionId: string) => {
    setAddingInBoardSection(sectionId);
    setNewBoardTaskName('');
  };

  const commitNewBoardTask = (sectionId: string) => {
    if (newBoardTaskName.trim()) {
      const task: Task = {
        taskId: `task-${Date.now()}`,
        name: newBoardTaskName.trim(),
        projectId: project.projectId,
        sectionId,
        description: '',
        assigneeId: undefined,
        creatorId: state.currentUser.userId,
        completed: false,
        dependencies: [],
        tags: [],
        attachmentIds: [],
        customFieldValues: {},
        likeCount: 0,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString()
      };
      addTask(task);
    }
    setAddingInBoardSection(null);
    setNewBoardTaskName('');
  };

  // Comment submit
  const handleSubmitComment = () => {
    if (!selectedTask || !newComment.trim()) return;
    addComment({
      commentId: `comment-${Date.now()}`,
      taskId: selectedTask.taskId,
      userId: state.currentUser.userId,
      content: newComment.trim(),
      createdDate: new Date().toISOString(),
      likedBy: []
    });
    setNewComment('');
  };

  // Tag management
  const handleAddTag = () => {
    if (!selectedTask || !newTag.trim()) return;
    const updatedTags = [...selectedTask.tags, newTag.trim()];
    updateTask(selectedTask.taskId, { tags: updatedTags });
    setNewTag('');
    setAddingTag(false);
  };

  const handleAddSubtask = () => {
    if (!selectedTask || !newSubtaskName.trim()) return;
    const subtask: Task = {
      taskId: `task-${Date.now()}`,
      name: newSubtaskName.trim(),
      projectId: selectedTask.projectId,
      sectionId: selectedTask.sectionId,
      description: '',
      assigneeId: undefined,
      creatorId: state.currentUser.userId,
      parentTaskId: selectedTask.taskId,
      completed: false,
      dependencies: [],
      tags: [],
      attachmentIds: [],
      customFieldValues: {},
      likeCount: 0,
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString()
    };
    addTask(subtask);
    setNewSubtaskName('');
    setAddingSubtask(false);
  };

  const handleRemoveTag = (tag: string) => {
    if (!selectedTask) return;
    updateTask(selectedTask.taskId, { tags: selectedTask.tags.filter(t => t !== tag) });
  };

  const handleAttachmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTask || !event.target.files?.length) return;

    const files = Array.from(event.target.files);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    setUploadingAttachment(true);
    setAttachmentError('');

    try {
      const sid = getSessionId();
      const url = sid ? `/upload?sid=${encodeURIComponent(sid)}` : '/upload';
      const response = await fetch(url, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);
      const result = await response.json();
      const uploadedFiles = Array.isArray(result.files) ? result.files : [];
      const newIds: string[] = [];

      uploadedFiles.forEach((file: any, index: number) => {
        const attachmentId = `attach-${Date.now()}-${index}`;
        newIds.push(attachmentId);
        addAttachment({
          attachmentId,
          taskId: selectedTask.taskId,
          fileName: file.original_name || file.stored_name || `attachment-${index + 1}`,
          fileType: file.content_type || 'application/octet-stream',
          fileSize: file.size || 0,
          fileUrl: file.url,
          uploaderId: state.currentUser.userId,
          uploadDate: new Date().toISOString(),
        });
      });

      if (newIds.length > 0) {
        updateTask(selectedTask.taskId, {
          attachmentIds: [...selectedTask.attachmentIds, ...newIds],
        });
      }
    } catch (error) {
      setAttachmentError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingAttachment(false);
      event.target.value = '';
    }
  };

  const tabs: { key: ViewTab; label: string }[] = [
    { key: 'list', label: 'List' },
    { key: 'board', label: 'Board' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'dashboard', label: 'Dashboard' },
  ];

  const renderFilterBar = () => (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Assignee:</label>
        <select
          value={filters.assigneeId}
          onChange={e => setFilters(prev => ({ ...prev, assigneeId: e.target.value }))}
        >
          <option value="">All</option>
          {projectMembers.map(u => (
            <option key={u.userId} value={u.userId}>{u.name}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Priority:</label>
        <div className="filter-priority-checks">
          {['High', 'Medium', 'Low'].map(p => (
            <label key={p}>
              <input
                type="checkbox"
                checked={filters.priorities.has(p)}
                onChange={() => togglePriorityFilter(p)}
              />
              {p}
            </label>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <label>Due:</label>
        <select
          value={filters.dueDateRange}
          onChange={e => setFilters(prev => ({ ...prev, dueDateRange: e.target.value }))}
        >
          <option value="">Any time</option>
          <option value="overdue">Overdue</option>
          <option value="next3days">Due next 3 days</option>
          <option value="thisweek">Due this week</option>
        </select>
      </div>
      {hasActiveFilters && (
        <button className="clear-filters-btn" onClick={clearFilters}>
          Clear filters
        </button>
      )}
    </div>
  );

  const renderListView = () => (
    <div className="project-content">
      {projectTasks.length === 0 && (
        <div className="project-empty-state">
          <p>No tasks yet. Click "+ Add task" to get started.</p>
        </div>
      )}
      {project.sections.map(section => {
        const sectionTasks = filteredTasks.filter(t => t.sectionId === section.sectionId);
        return (
          <div key={section.sectionId} className="project-section">
            <div className="project-section-header">
              <h2>{section.name}</h2>
              <span className="section-task-count">{sectionTasks.length}</span>
            </div>
            <div className="project-section-tasks">
              {sectionTasks.map(task => {
                const assignee = state.users.find(u => u.userId === task.assigneeId);
                return (
                  <div key={task.taskId} className="project-task-item">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskComplete(task.taskId)}
                    />
                    <div className="project-task-content">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="project-task-name-link"
                          onClick={() => openTaskDetail(task)}
                        >
                          {task.name}
                        </button>
                        <PriorityBadge task={task} />
                      </div>
                      <div className="project-task-meta">
                        {assignee && (
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="task-assignee-avatar"
                            title={assignee.name}
                          />
                        )}
                        {task.dueDate && (() => {
                          const { text, isOverdue } = formatDueDate(task.dueDate);
                          return (
                            <span className={`project-task-due ${isOverdue ? 'overdue' : ''}`}>
                              {text}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
              {addingInSection === section.sectionId ? (
                <div className="project-task-item inline-add-row">
                  <span className="add-row-check" aria-hidden="true" />
                  <input
                    ref={addTaskInputRef}
                    className="inline-add-input"
                    type="text"
                    placeholder="Task name"
                    value={newTaskName}
                    onChange={e => setNewTaskName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitNewTask(section.sectionId);
                      if (e.key === 'Escape') { setAddingInSection(null); setNewTaskName(''); }
                    }}
                    onBlur={() => commitNewTask(section.sectionId)}
                  />
                </div>
              ) : (
                <button className="add-task-btn" onClick={() => handleAddTaskInSection(section.sectionId)}>
                  + Add task
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const handleDragEnd = useCallback((result: DropResult) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    updateTask(draggableId, { sectionId: destination.droppableId });
  }, [updateTask]);

  const renderBoardView = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="board-view-container">
        {project.sections.map(section => {
          const sectionTasks = filteredTasks.filter(t => t.sectionId === section.sectionId);
          return (
            <div key={section.sectionId} className="board-column">
              <div className="board-column-header">
                <h3>{section.name}</h3>
                <span className="board-column-count">{sectionTasks.length}</span>
              </div>
              <Droppable droppableId={section.sectionId}>
                {(provided, snapshot) => (
                  <div
                    className={`board-column-tasks ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {sectionTasks.map((task, idx) => {
                      const assignee = state.users.find(u => u.userId === task.assigneeId);
                      return (
                        <Draggable key={task.taskId} draggableId={task.taskId} index={idx}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`board-task-card ${dragSnapshot.isDragging ? 'dragging' : ''}`}
                              onClick={() => openTaskDetail(task)}
                            >
                              <div className="board-task-card-title">{task.name}</div>
                              <div className="board-task-card-footer">
                                <div className="board-task-card-left">
                                  {assignee && (
                                    <img
                                      src={assignee.avatar}
                                      alt={assignee.name}
                                      className="board-task-card-avatar"
                                      title={assignee.name}
                                    />
                                  )}
                                  {task.dueDate && (() => {
                                    const { text, isOverdue } = formatDueDate(task.dueDate);
                                    return (
                                      <span className={`board-task-card-due ${isOverdue ? 'overdue' : ''}`}>
                                        {text}
                                      </span>
                                    );
                                  })()}
                                </div>
                                <PriorityBadge task={task} />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {addingInBoardSection === section.sectionId ? (
                      <div className="board-task-card inline-board-add">
                        <input
                          ref={addBoardTaskInputRef}
                          className="inline-add-input"
                          type="text"
                          placeholder="Task name"
                          value={newBoardTaskName}
                          onChange={e => setNewBoardTaskName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitNewBoardTask(section.sectionId);
                            if (e.key === 'Escape') { setAddingInBoardSection(null); setNewBoardTaskName(''); }
                          }}
                          onBlur={() => commitNewBoardTask(section.sectionId)}
                        />
                      </div>
                    ) : (
                      <button
                        className="board-add-card-btn"
                        onClick={() => handleAddTaskInBoard(section.sectionId)}
                      >
                        + Add card
                      </button>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );

  const renderTaskDetailModal = () => {
    if (!selectedTask) return null;
    const assignee = state.users.find(u => u.userId === selectedTask.assigneeId);
    const section = project.sections.find(s => s.sectionId === selectedTask.sectionId);
    const priority = getPriorityValue(selectedTask);
    const taskComments = state.comments
      .filter(c => c.taskId === selectedTask.taskId)
      .sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());

    return (
      <div className="task-detail-overlay" onClick={closeTaskDetail}>
        <div className="task-detail-panel" onClick={e => e.stopPropagation()}>
          <div className="task-detail-header">
            <div className="task-detail-header-actions">
              <button
                className={`task-complete-btn ${selectedTask.completed ? 'completed' : ''}`}
                onClick={() => toggleTaskComplete(selectedTask.taskId)}
              >
                {selectedTask.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                {selectedTask.completed ? 'Completed' : 'Mark complete'}
              </button>
            </div>
            <button className="task-detail-close-btn" onClick={closeTaskDetail}>
              <X size={20} />
            </button>
          </div>

          <div className="task-detail-body">
            <input
              className="task-detail-title-input"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={saveTaskEdits}
            />

            <div className="task-detail-fields">
              {/* Assignee picker */}
              <div className="task-detail-field">
                <span className="task-detail-field-label">Assignee</span>
                <div className="task-detail-field-value-container">
                  <button
                    className="task-detail-field-btn"
                    onClick={() => {
                      setShowAssigneeDropdown(!showAssigneeDropdown);
                      setShowPriorityDropdown(false);
                      setShowSectionDropdown(false);
                      setShowDueDateInput(false);
                    }}
                  >
                    {assignee ? (
                      <span className="assignee-display">
                        <img src={assignee.avatar} alt={assignee.name} className="field-avatar" />
                        {assignee.name}
                      </span>
                    ) : (
                      <span className="field-placeholder">Unassigned</span>
                    )}
                    <ChevronDown size={14} />
                  </button>
                  {showAssigneeDropdown && (
                    <div className="field-dropdown">
                      <button
                        className="field-dropdown-item"
                        onClick={() => {
                          updateTask(selectedTask.taskId, { assigneeId: undefined });
                          setShowAssigneeDropdown(false);
                        }}
                      >
                        <span className="field-avatar-placeholder">?</span>
                        Unassigned
                      </button>
                      {state.users.map(u => (
                        <button
                          key={u.userId}
                          className={`field-dropdown-item ${u.userId === selectedTask.assigneeId ? 'selected' : ''}`}
                          onClick={() => {
                            updateTask(selectedTask.taskId, { assigneeId: u.userId });
                            setShowAssigneeDropdown(false);
                          }}
                        >
                          <img src={u.avatar} alt={u.name} className="field-avatar" />
                          {u.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Due date picker */}
              <div className="task-detail-field">
                <span className="task-detail-field-label">Due date</span>
                <div className="task-detail-field-value-container">
                  {showDueDateInput ? (
                    <div className="due-date-editor">
                      <input
                        type="date"
                        className="due-date-input"
                        value={dueDateValue}
                        onChange={e => {
                          setDueDateValue(e.target.value);
                          updateTask(selectedTask.taskId, { dueDate: e.target.value || undefined });
                        }}
                        autoFocus
                        onBlur={() => setShowDueDateInput(false)}
                      />
                      <button
                        className="clear-date-btn"
                        onMouseDown={e => {
                          e.preventDefault();
                          updateTask(selectedTask.taskId, { dueDate: undefined });
                          setDueDateValue('');
                          setShowDueDateInput(false);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <button
                      className="task-detail-field-btn"
                      onClick={() => {
                        setShowDueDateInput(true);
                        setDueDateValue(selectedTask.dueDate || '');
                        setShowAssigneeDropdown(false);
                        setShowPriorityDropdown(false);
                        setShowSectionDropdown(false);
                      }}
                    >
                      {selectedTask.dueDate ? (() => {
                        const { text, isOverdue } = formatDueDate(selectedTask.dueDate);
                        return <span className={isOverdue ? 'overdue-text' : ''}>{text}</span>;
                      })() : (
                        <span className="field-placeholder">No due date</span>
                      )}
                      <ChevronDown size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Priority dropdown */}
              <div className="task-detail-field">
                <span className="task-detail-field-label">Priority</span>
                <div className="task-detail-field-value-container">
                  <button
                    className="task-detail-field-btn"
                    onClick={() => {
                      setShowPriorityDropdown(!showPriorityDropdown);
                      setShowAssigneeDropdown(false);
                      setShowSectionDropdown(false);
                      setShowDueDateInput(false);
                    }}
                  >
                    {priority ? <PriorityBadge task={selectedTask} /> : <span className="field-placeholder">None</span>}
                    <ChevronDown size={14} />
                  </button>
                  {showPriorityDropdown && (
                    <div className="field-dropdown">
                      {['High', 'Medium', 'Low'].map(p => {
                        const cls = p === 'High' ? 'priority-high' : p === 'Medium' ? 'priority-medium' : 'priority-low';
                        return (
                          <button
                            key={p}
                            className={`field-dropdown-item ${priority === p ? 'selected' : ''}`}
                            onClick={() => {
                              updateTask(selectedTask.taskId, {
                                customFieldValues: { ...selectedTask.customFieldValues, 'field-1': p }
                              });
                              setShowPriorityDropdown(false);
                            }}
                          >
                            <span className={`priority-badge ${cls}`}>{p}</span>
                          </button>
                        );
                      })}
                      <button
                        className="field-dropdown-item"
                        onClick={() => {
                          const { 'field-1': _, ...rest } = selectedTask.customFieldValues;
                          updateTask(selectedTask.taskId, { customFieldValues: rest });
                          setShowPriorityDropdown(false);
                        }}
                      >
                        None
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Section/status dropdown */}
              <div className="task-detail-field">
                <span className="task-detail-field-label">Status</span>
                <div className="task-detail-field-value-container">
                  <button
                    className="task-detail-field-btn"
                    onClick={() => {
                      setShowSectionDropdown(!showSectionDropdown);
                      setShowAssigneeDropdown(false);
                      setShowPriorityDropdown(false);
                      setShowDueDateInput(false);
                    }}
                  >
                    {section ? section.name : 'Unknown'}
                    <ChevronDown size={14} />
                  </button>
                  {showSectionDropdown && (
                    <div className="field-dropdown">
                      {project.sections.map(s => (
                        <button
                          key={s.sectionId}
                          className={`field-dropdown-item ${s.sectionId === selectedTask.sectionId ? 'selected' : ''}`}
                          onClick={() => {
                            updateTask(selectedTask.taskId, { sectionId: s.sectionId });
                            setShowSectionDropdown(false);
                          }}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="task-detail-field">
                <span className="task-detail-field-label">Tags</span>
                <div className="task-detail-tags">
                  {selectedTask.tags.map(tag => (
                    <span key={tag} className="task-detail-tag">
                      {tag}
                      <button className="tag-remove-btn" onClick={() => handleRemoveTag(tag)}>x</button>
                    </span>
                  ))}
                  {addingTag ? (
                    <input
                      className="tag-add-input"
                      type="text"
                      placeholder="Tag name"
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddTag();
                        if (e.key === 'Escape') { setAddingTag(false); setNewTag(''); }
                      }}
                      onBlur={() => { if (newTag.trim()) handleAddTag(); else setAddingTag(false); }}
                      autoFocus
                    />
                  ) : (
                    <button className="tag-add-btn" onClick={() => setAddingTag(true)}>+ Add tag</button>
                  )}
                </div>
              </div>
            </div>

            {/* Attachments section */}
            {(() => {
              const taskAttachments = state.attachments.filter(
                (a: any) => selectedTask.attachmentIds.includes(a.attachmentId)
              );
              return (
                <div className="task-detail-attachments-section">
                  <div className="task-detail-attachments-label">
                    <Paperclip size={14} />
                    <span>Attachments ({taskAttachments.length})</span>
                    <label className={`attachment-upload-btn ${uploadingAttachment ? 'is-uploading' : ''}`}>
                      <Upload size={14} />
                      {uploadingAttachment ? 'Uploading...' : 'Add attachment'}
                      <input
                        type="file"
                        multiple
                        onChange={handleAttachmentUpload}
                        disabled={uploadingAttachment}
                      />
                    </label>
                  </div>
                  {attachmentError && <div className="attachment-error">{attachmentError}</div>}
                  {taskAttachments.length > 0 ? (
                    <div className="task-detail-attachments-list">
                      {taskAttachments.map((att: any) => (
                        <a
                          key={att.attachmentId}
                          href={att.fileUrl}
                          className="task-detail-attachment-item"
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <div className="attachment-icon">
                            <Paperclip size={16} />
                          </div>
                          <div className="attachment-info">
                            <span className="attachment-name">{att.fileName}</span>
                            <span className="attachment-meta">
                              {att.fileSize > 1048576
                                ? `${(att.fileSize / 1048576).toFixed(1)} MB`
                                : `${(att.fileSize / 1024).toFixed(0)} KB`}
                            </span>
                          </div>
                          <Download size={14} className="attachment-download-icon" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="attachment-empty">No files attached yet.</div>
                  )}
                </div>
              );
            })()}

            {/* Subtasks section */}
            {(() => {
              const subtasks = state.tasks.filter(t => t.parentTaskId === selectedTask.taskId);
              return (
                <div className="subtasks-section">
                  <div className="subtasks-label">Subtasks</div>
                  {subtasks.length > 0 && (
                    <div className="subtasks-list">
                      {subtasks.map(sub => {
                        const subAssignee = state.users.find(u => u.userId === sub.assigneeId);
                        return (
                          <div key={sub.taskId} className="subtask-row">
                            <input
                              type="checkbox"
                              checked={sub.completed}
                              onChange={() => toggleTaskComplete(sub.taskId)}
                            />
                            <span
                              className={`subtask-name ${sub.completed ? 'completed' : ''}`}
                              onClick={() => openTaskDetail(sub)}
                            >
                              {sub.name}
                            </span>
                            {subAssignee && (
                              <img src={subAssignee.avatar} alt={subAssignee.name} className="subtask-avatar" title={subAssignee.name} />
                            )}
                            {sub.dueDate && (
                              <span className={`subtask-due ${sub.dueDate < new Date().toISOString().split('T')[0] && !sub.completed ? 'overdue' : ''}`}>
                                {new Date(sub.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {addingSubtask ? (
                    <div className="subtask-add-row">
                      <span className="add-row-check small" aria-hidden="true" />
                      <input
                        className="subtask-add-input"
                        type="text"
                        placeholder="Subtask name"
                        value={newSubtaskName}
                        onChange={e => setNewSubtaskName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddSubtask();
                          if (e.key === 'Escape') { setAddingSubtask(false); setNewSubtaskName(''); }
                        }}
                        onBlur={() => { if (newSubtaskName.trim()) handleAddSubtask(); else setAddingSubtask(false); }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button className="subtask-add-btn" onClick={() => setAddingSubtask(true)}>
                      + Add subtask
                    </button>
                  )}
                </div>
              );
            })()}

            <div className="task-detail-description-label">Description</div>
            <textarea
              className="task-detail-description-input"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              onBlur={saveTaskEdits}
              placeholder="Add a description..."
            />

            {/* Comments section */}
            <div className="task-detail-comments-section">
              <div className="task-detail-comments-label">Comments</div>
              {taskComments.length > 0 && (
                <div className="task-detail-comments-list">
                  {taskComments.map(comment => {
                    const commenter = state.users.find(u => u.userId === comment.userId);
                    return (
                      <div key={comment.commentId} className="comment-item">
                        <img
                          src={commenter?.avatar || ''}
                          alt={commenter?.name || ''}
                          className="comment-avatar"
                        />
                        <div className="comment-body">
                          <div className="comment-header">
                            <span className="comment-author">{commenter?.name || 'Unknown'}</span>
                            <span className="comment-time">
                              {formatDistanceToNow(new Date(comment.createdDate), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="comment-text">{comment.content}</div>
                          <button className="comment-like-btn" onClick={() => toggleCommentLike(comment.commentId)}>
                            <Heart
                              size={14}
                              fill={comment.likedBy.includes(state.currentUser.userId) ? '#f06a6a' : 'none'}
                              color={comment.likedBy.includes(state.currentUser.userId) ? '#f06a6a' : '#6d6e6f'}
                            />
                            {comment.likedBy.length > 0 && (
                              <span className="comment-like-count">{comment.likedBy.length}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="comment-input-row">
                <img
                  src={state.currentUser.avatar}
                  alt={state.currentUser.name}
                  className="comment-avatar"
                />
                <input
                  className="comment-input"
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmitComment(); }}
                />
                <button
                  className="comment-submit-btn"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="project-detail-page">
      <div className="project-detail-header">
        <div className="project-title-section">
          <div className="project-icon-large" style={{ backgroundColor: project.color }}>
            <img src={project.icon} alt="" />
          </div>
          <div>
            <h1>{project.name}</h1>
            <p className="project-description-detail">{project.description}</p>
          </div>
        </div>
        <button
          className="star-btn-large"
          onClick={() => toggleProjectStar(project.projectId)}
        >
          <Star
            size={20}
            fill={project.starred ? '#f06a6a' : 'none'}
            color={project.starred ? '#f06a6a' : '#6d6e6f'}
          />
        </button>
      </div>

      <div className="project-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`project-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(activeTab === 'list' || activeTab === 'board') && renderFilterBar()}

      {activeTab === 'list' && renderListView()}
      {activeTab === 'board' && renderBoardView()}
      {activeTab === 'timeline' && (() => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7 + timelineOffset * 7);
        const days: Date[] = [];
        for (let i = 0; i < 28; i++) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          days.push(d);
        }
        const toDateStr = (d: Date) => d.toISOString().split('T')[0];
        const todayStr = toDateStr(today);
        const timelineTasks = projectTasks.filter(t => t.dueDate || t.startDate);
        const noDateTasks = projectTasks.filter(t => !t.dueDate && !t.startDate);

        return (
          <div className="timeline-container">
            <div className="timeline-nav">
              <button onClick={() => setTimelineOffset(o => o - 1)} className="timeline-nav-btn">
                <ChevronLeft size={18} />
              </button>
              <span className="timeline-nav-label">
                {days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {days[27].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <button onClick={() => setTimelineOffset(o => o + 1)} className="timeline-nav-btn">
                <ChevronRight size={18} />
              </button>
              <button onClick={() => setTimelineOffset(0)} className="timeline-today-btn">Today</button>
            </div>
            <div className="timeline-grid">
              <div className="timeline-header-row">
                <div className="timeline-task-label-header">Task</div>
                {days.map((d, i) => (
                  <div
                    key={i}
                    className={`timeline-day-header ${toDateStr(d) === todayStr ? 'today-col' : ''} ${d.getDay() === 0 || d.getDay() === 6 ? 'weekend' : ''}`}
                  >
                    <span className="timeline-day-name">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="timeline-day-num">{d.getDate()}</span>
                  </div>
                ))}
              </div>
              {timelineTasks.map(task => {
                const taskStart = task.startDate || task.createdDate.split('T')[0];
                const taskEnd = task.dueDate || taskStart;
                const assignee = state.users.find(u => u.userId === task.assigneeId);
                return (
                  <div key={task.taskId} className="timeline-task-row">
                    <div className="timeline-task-label" onClick={() => openTaskDetail(task)} title={task.name}>
                      {task.name}
                    </div>
                    {days.map((d, i) => {
                      const dStr = toDateStr(d);
                      const isStart = dStr === taskStart;
                      const isEnd = dStr === taskEnd;
                      const isInRange = dStr >= taskStart && dStr <= taskEnd;
                      const isToday = dStr === todayStr;
                      return (
                        <div
                          key={i}
                          className={`timeline-cell ${isToday ? 'today-col' : ''} ${d.getDay() === 0 || d.getDay() === 6 ? 'weekend' : ''}`}
                        >
                          {isInRange && (
                            <div
                              className={`timeline-bar ${isStart ? 'bar-start' : ''} ${isEnd ? 'bar-end' : ''} ${task.completed ? 'bar-completed' : ''}`}
                              style={{ backgroundColor: task.completed ? '#059669' : (project.color || '#4186E0') }}
                              title={`${task.name}${assignee ? ` (${assignee.name})` : ''}`}
                              onClick={(e) => { e.stopPropagation(); openTaskDetail(task); }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {noDateTasks.length > 0 && (
                <div className="timeline-no-dates">
                  <div className="timeline-task-label" style={{ fontStyle: 'italic', color: '#a2a0a2' }}>No dates ({noDateTasks.length} tasks)</div>
                  {days.map((d, i) => (
                    <div key={i} className={`timeline-cell ${toDateStr(d) === todayStr ? 'today-col' : ''} ${d.getDay() === 0 || d.getDay() === 6 ? 'weekend' : ''}`} />
                  ))}
                </div>
              )}
            </div>
            {todayStr >= toDateStr(days[0]) && todayStr <= toDateStr(days[27]) && (
              <div
                className="timeline-today-line"
                style={{
                  left: `calc(180px + ${days.findIndex(d => toDateStr(d) === todayStr)} * ((100% - 180px) / 28) + ((100% - 180px) / 56))`
                }}
              />
            )}
          </div>
        );
      })()}
      {activeTab === 'calendar' && (() => {
        const calYear = calDate.getFullYear();
        const calMonth = calDate.getMonth();
        const firstDay = new Date(calYear, calMonth, 1);
        const lastDay = new Date(calYear, calMonth + 1, 0);
        const startPad = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        const todayStr = new Date().toISOString().split('T')[0];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const calDays: { date: Date; day: number; isCurrent: boolean }[] = [];
        for (let i = startPad - 1; i >= 0; i--) {
          const d = new Date(calYear, calMonth, -i);
          calDays.push({ date: d, day: d.getDate(), isCurrent: false });
        }
        for (let i = 1; i <= daysInMonth; i++) {
          calDays.push({ date: new Date(calYear, calMonth, i), day: i, isCurrent: true });
        }
        const rem = 42 - calDays.length;
        for (let i = 1; i <= rem; i++) {
          const d = new Date(calYear, calMonth + 1, i);
          calDays.push({ date: d, day: d.getDate(), isCurrent: false });
        }

        const toStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        return (
          <div className="proj-calendar-container">
            <div className="proj-calendar-header">
              <button className="proj-calendar-nav" onClick={() => setCalDate(new Date(calYear, calMonth - 1, 1))}>
                <ChevronLeft size={18} />
              </button>
              <h2>{monthNames[calMonth]} {calYear}</h2>
              <button className="proj-calendar-nav" onClick={() => setCalDate(new Date(calYear, calMonth + 1, 1))}>
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="proj-calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="proj-cal-day-header">{d}</div>
              ))}
              {calDays.map((info, idx) => {
                const dateStr = toStr(info.date);
                const dayTasks = projectTasks.filter(t => t.dueDate === dateStr);
                const isToday = dateStr === todayStr;
                return (
                  <div key={idx} className={`proj-cal-cell ${!info.isCurrent ? 'other-month' : ''} ${isToday ? 'today' : ''}`}>
                    <div className={`proj-cal-date ${isToday ? 'today-mark' : ''}`}>{info.day}</div>
                    <div className="proj-cal-tasks">
                      {dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task.taskId}
                          className={`proj-cal-pill ${task.completed ? 'done' : ''} ${dateStr < todayStr && !task.completed ? 'overdue' : ''}`}
                          style={{ borderLeftColor: project.color }}
                          onClick={() => openTaskDetail(task)}
                          title={task.name}
                        >
                          {task.name}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="proj-cal-more">+{dayTasks.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
      {activeTab === 'dashboard' && (() => {
        const totalTasks = projectTasks.length;
        const completedCount = projectTasks.filter(t => t.completed).length;
        const incompleteCount = totalTasks - completedCount;
        const completionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
        const todayStr = new Date().toISOString().split('T')[0];
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const weekStr = weekFromNow.toISOString().split('T')[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString();

        const overdueCount = projectTasks.filter(t => t.dueDate && t.dueDate < todayStr && !t.completed).length;
        const dueThisWeek = projectTasks.filter(t => t.dueDate && t.dueDate >= todayStr && t.dueDate <= weekStr && !t.completed).length;
        const completedThisWeek = projectTasks.filter(t => t.completed && t.completedDate && t.completedDate >= weekAgoStr).length;

        const sectionData = project.sections.map(s => ({
          name: s.name,
          count: projectTasks.filter(t => t.sectionId === s.sectionId).length
        }));
        const maxSectionCount = Math.max(...sectionData.map(s => s.count), 1);

        const assigneeData: { name: string; avatar: string; count: number }[] = [];
        const assigneeCounts = new Map<string, number>();
        projectTasks.forEach(t => {
          const key = t.assigneeId || 'unassigned';
          assigneeCounts.set(key, (assigneeCounts.get(key) || 0) + 1);
        });
        assigneeCounts.forEach((count, userId) => {
          if (userId === 'unassigned') {
            assigneeData.push({ name: 'Unassigned', avatar: '', count });
          } else {
            const u = state.users.find(us => us.userId === userId);
            if (u) assigneeData.push({ name: u.name, avatar: u.avatar, count });
          }
        });
        assigneeData.sort((a, b) => b.count - a.count);
        const maxAssigneeCount = Math.max(...assigneeData.map(a => a.count), 1);

        const circumference = 2 * Math.PI * 45;
        const dashOffset = circumference - (completionPct / 100) * circumference;

        return (
          <div className="dashboard-container">
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Task Completion</h3>
                <div className="donut-chart">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke="#059669"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                    <text x="50" y="46" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1f1f1f">
                      {completedCount}/{totalTasks}
                    </text>
                    <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#6d6e6f">
                      complete
                    </text>
                  </svg>
                </div>
              </div>

              <div className="dashboard-card">
                <h3>Tasks by Section</h3>
                <div className="bar-chart">
                  {sectionData.map(s => (
                    <div key={s.name} className="bar-row">
                      <span className="bar-label">{s.name}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(s.count / maxSectionCount) * 100}%`,
                            backgroundColor: project.color
                          }}
                        />
                      </div>
                      <span className="bar-value">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-card">
                <h3>Tasks by Assignee</h3>
                <div className="bar-chart">
                  {assigneeData.map(a => (
                    <div key={a.name} className="bar-row">
                      <span className="bar-label assignee-label">
                        {a.avatar && <img src={a.avatar} alt="" className="bar-avatar" />}
                        {a.name}
                      </span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(a.count / maxAssigneeCount) * 100}%`,
                            backgroundColor: '#4186E0'
                          }}
                        />
                      </div>
                      <span className="bar-value">{a.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-card summary-card">
                <h3>Status Overview</h3>
                <div className="summary-items">
                  <div className="summary-item overdue-item">
                    <span className="summary-count">{overdueCount}</span>
                    <span className="summary-label">tasks overdue</span>
                  </div>
                  <div className="summary-item upcoming-item">
                    <span className="summary-count">{dueThisWeek}</span>
                    <span className="summary-label">due this week</span>
                  </div>
                  <div className="summary-item completed-item">
                    <span className="summary-count">{completedThisWeek}</span>
                    <span className="summary-label">completed this week</span>
                  </div>
                  <div className="summary-item incomplete-item">
                    <span className="summary-count">{incompleteCount}</span>
                    <span className="summary-label">incomplete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {renderTaskDetailModal()}
    </div>
  );
}
