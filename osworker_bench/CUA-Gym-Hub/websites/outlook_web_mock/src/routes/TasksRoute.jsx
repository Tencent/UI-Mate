import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { format, isToday, isBefore } from 'date-fns';
import { CheckCircle, Circle, Plus, Calendar, Flag, Trash2 } from 'lucide-react';

export default function TasksRoute() {
  const { state, actions } = useStore();
  const [filter, setFilter] = useState('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);

  const tasks = state.tasks || [];

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const impOrder = { high: 0, normal: 1, low: 2 };
    if ((impOrder[a.importance] || 1) !== (impOrder[b.importance] || 1)) {
      return (impOrder[a.importance] || 1) - (impOrder[b.importance] || 1);
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const activeTasks = tasks.filter(t => !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    actions.createTask(newTaskTitle.trim());
    setNewTaskTitle('');
    setShowNewTask(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTask();
    if (e.key === 'Escape') { setShowNewTask(false); setNewTaskTitle(''); }
  };

  return (
    <div className="flex h-full w-full bg-white">
      {/* Sidebar */}
      <div className="w-60 border-r border-neutral-200 flex flex-col bg-neutral-50">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-700">To Do</h2>
          <p className="text-xs text-neutral-500 mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="flex-1 p-2">
          <button
            onClick={() => setFilter('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm ${
              filter === 'all' ? 'bg-[#EBF3FC] text-[#0078D4] font-semibold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <span>All tasks</span>
            <span className="text-xs">{tasks.length}</span>
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm ${
              filter === 'active' ? 'bg-[#EBF3FC] text-[#0078D4] font-semibold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <span>Active</span>
            <span className="text-xs">{activeTasks}</span>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm ${
              filter === 'completed' ? 'bg-[#EBF3FC] text-[#0078D4] font-semibold' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <span>Completed</span>
            <span className="text-xs">{completedTasks}</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b border-neutral-200 flex items-center justify-between px-4 flex-shrink-0">
          <h3 className="text-base font-semibold text-neutral-700">
            {filter === 'all' ? 'All tasks' : filter === 'active' ? 'Active tasks' : 'Completed tasks'}
          </h3>
          <button
            onClick={() => setShowNewTask(true)}
            className="bg-[#0078D4] hover:bg-[#106EBE] text-white px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add task
          </button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto p-4">
          {showNewTask && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-[#EBF3FC] rounded-lg border border-[#0078D4]">
              <Circle className="w-5 h-5 text-neutral-300 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter task title and press Enter"
                className="flex-1 text-sm bg-transparent outline-none placeholder-neutral-400"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button onClick={handleAddTask} className="text-sm text-[#0078D4] font-semibold hover:underline">
                Add
              </button>
              <button onClick={() => { setShowNewTask(false); setNewTaskTitle(''); }} className="text-sm text-neutral-500 hover:underline">
                Cancel
              </button>
            </div>
          )}

          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
              <CheckCircle className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">{filter === 'completed' ? 'No completed tasks' : filter === 'active' ? 'All tasks completed!' : 'No tasks yet'}</p>
              {!showNewTask && (
                <button
                  onClick={() => setShowNewTask(true)}
                  className="mt-3 text-sm text-[#0078D4] hover:underline"
                >
                  + Add a task
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => actions.toggleTaskComplete(task.id)}
                  onDelete={() => actions.deleteTask(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  const isOverdue = task.dueDate && !task.completed && isBefore(new Date(task.dueDate), new Date());
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group hover:bg-neutral-50 transition-colors ${
      task.completed ? 'opacity-60' : ''
    }`}>
      <button
        onClick={onToggle}
        className={`flex-shrink-0 ${task.completed ? 'text-[#107C10]' : 'text-neutral-300 hover:text-[#0078D4]'}`}
      >
        {task.completed ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className={`text-sm ${task.completed ? 'line-through text-neutral-500' : 'text-neutral-800'}`}>
          {task.importance === 'high' && !task.completed && (
            <Flag className="w-3 h-3 inline mr-1 text-[#D13438]" />
          )}
          {task.title}
        </div>
        {task.dueDate && (
          <div className={`text-xs mt-0.5 flex items-center gap-1 ${
            isOverdue ? 'text-[#D13438]'
            : isDueToday ? 'text-[#0078D4]'
            : 'text-neutral-400'
          }`}>
            <Calendar className="w-3 h-3" />
            {isOverdue ? 'Overdue' : isDueToday ? 'Due today' : `Due ${format(new Date(task.dueDate), 'MMM d')}`}
          </div>
        )}
      </div>

      {task.importance === 'high' && !task.completed && (
        <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-[#D13438] rounded font-medium flex-shrink-0">
          High
        </span>
      )}

      <button
        onClick={onDelete}
        className="p-1 text-neutral-300 hover:text-[#D13438] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        title="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
