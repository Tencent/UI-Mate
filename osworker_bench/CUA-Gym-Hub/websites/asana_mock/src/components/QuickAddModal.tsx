
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { X } from 'lucide-react';
import './QuickAddModal.css';

interface QuickAddModalProps {
  onClose: () => void;
}

export default function QuickAddModal({ onClose }: QuickAddModalProps) {
  const { state, addTask } = useApp();
  const [taskName, setTaskName] = useState('');
  const [projectId, setProjectId] = useState(state.projects[0]?.projectId || '');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const selectedProject = state.projects.find(p => p.projectId === projectId);
  const defaultSectionId = selectedProject?.sections[0]?.sectionId || '';

  const handleCreate = () => {
    if (!taskName.trim()) return;

    const task: Task = {
      taskId: `task-${Date.now()}`,
      name: taskName.trim(),
      projectId,
      sectionId: defaultSectionId,
      description: description.trim(),
      assigneeId: assigneeId || undefined,
      creatorId: state.currentUser.userId,
      dueDate: dueDate || undefined,
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
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quick-add-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Task</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Task name</label>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && taskName.trim()) handleCreate(); }}
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label>For project</label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
            >
              {state.projects.map(p => (
                <option key={p.projectId} value={p.projectId}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="modal-field-row">
            <div className="modal-field">
              <label>Assignee</label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {state.users.map(u => (
                  <option key={u.userId} value={u.userId}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-field">
            <label>Description</label>
            <textarea
              placeholder="Add details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="modal-primary-btn"
            onClick={handleCreate}
            disabled={!taskName.trim()}
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
