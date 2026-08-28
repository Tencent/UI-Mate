import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Plus, Phone, Mail, CheckSquare, Trash2, Edit2, ChevronUp, ChevronDown, Search, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronDown size={13} className="ml-1 text-gray-300 opacity-50" />;
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="ml-1 text-xubspot" />
    : <ChevronDown size={13} className="ml-1 text-xubspot" />;
}

const TYPE_ICONS = {
  call: <Phone size={14} className="text-blue-500" />,
  email: <Mail size={14} className="text-purple-500" />,
  to_do: <CheckSquare size={14} className="text-green-500" />,
};

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
};

const STATUS_COLORS = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

function formatDueDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const taskDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (taskDay < today) return { text: 'Overdue', className: 'text-red-600 font-semibold' };
  if (taskDay.getTime() === today.getTime()) return { text: 'Today', className: 'text-orange-600 font-semibold' };
  if (taskDay.getTime() === tomorrow.getTime()) return { text: 'Tomorrow', className: 'text-yellow-600 font-semibold' };
  return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), className: 'text-gray-600' };
}

const EMPTY_FORM = {
  title: '', type: 'to_do', status: 'not_started', priority: 'medium',
  dueDate: '', notes: '', owner: 'Admin User',
  contactId: '', companyId: '', dealId: ''
};

export default function Tasks() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const tasks = state.tasks || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortCol, setSortCol] = useState('dueDate');
  const [sortDir, setSortDir] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openCreate = () => {
    setEditTask(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title || '',
      type: task.type || 'to_do',
      status: task.status || 'not_started',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
      notes: task.notes || '',
      owner: task.owner || 'Admin User',
      contactId: task.contactId || '',
      companyId: task.companyId || '',
      dealId: task.dealId || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      contactId: form.contactId || null,
      companyId: form.companyId || null,
      dealId: form.dealId || null,
    };
    if (editTask) {
      dispatch({ type: 'UPDATE_TASK', payload: { ...editTask, ...payload } });
      addToast('Task updated successfully.', 'success');
    } else {
      dispatch({
        type: 'ADD_TASK',
        payload: { ...payload, id: uuidv4(), createDate: new Date().toISOString(), completedDate: null }
      });
      addToast('Task created successfully.', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const task = tasks.find(t => t.id === id);
    setDeleteConfirm({ id, title: task?.title || 'this task' });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    dispatch({ type: 'DELETE_TASK', payload: deleteConfirm.id });
    addToast('Task deleted.', 'success');
    setDeleteConfirm(null);
  };

  const handleComplete = (id) => {
    const task = tasks.find(t => t.id === id);
    const isCurrentlyCompleted = task?.status === 'completed';
    dispatch({ type: 'COMPLETE_TASK', payload: id });
    addToast(isCurrentlyCompleted ? 'Task marked as not started.' : 'Task marked as completed.', 'success');
  };

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      const contact = t.contactId ? state.contacts.find(c => c.id === t.contactId) : null;
      const contactName = contact ? `${contact.firstName} ${contact.lastName}`.toLowerCase() : '';
      if (!(t.title || '').toLowerCase().includes(q) && !contactName.includes(q) && !(t.notes || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    let aVal, bVal;
    if (sortCol === 'dueDate') {
      if (!a.dueDate) return 1; if (!b.dueDate) return -1;
      return sortDir === 'asc' ? new Date(a.dueDate) - new Date(b.dueDate) : new Date(b.dueDate) - new Date(a.dueDate);
    } else if (sortCol === 'priority') {
      return sortDir === 'asc' ? (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1) : (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
    } else if (sortCol === 'title') { aVal = (a.title || '').toLowerCase(); bVal = (b.title || '').toLowerCase(); }
    else if (sortCol === 'type') { aVal = a.type || ''; bVal = b.type || ''; }
    else if (sortCol === 'status') { aVal = a.status || ''; bVal = b.status || ''; }
    else { aVal = ''; bVal = ''; }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const thClass = "px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors";

  // Pagination
  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);
  const totalTasks = sorted.length;
  const totalPages = Math.ceil(totalTasks / PAGE_SIZE);
  const startIdx = (page - 1) * PAGE_SIZE;
  const paged = sorted.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
          <p className="text-gray-500 text-sm">{tasks.filter(t => t.status !== 'completed').length} open tasks</p>
        </div>
        <div className="flex gap-3">
          <select
            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="to_do">To-do</option>
            <option value="call">Call</option>
            <option value="email">Email</option>
          </select>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-xubspot text-white rounded-md text-sm font-medium hover:bg-xubspot-hover flex items-center gap-2"
          >
            <Plus size={16} /> Create Task
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search tasks by title, contact, or notes..."
          className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
              <th className="px-4 py-3 w-10"></th>
              <th className={thClass} onClick={() => handleSort('title')}>
                <span className="flex items-center">Task <SortIcon col="title" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('type')}>
                <span className="flex items-center">Type <SortIcon col="type" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('dueDate')}>
                <span className="flex items-center">Due Date <SortIcon col="dueDate" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('priority')}>
                <span className="flex items-center">Priority <SortIcon col="priority" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className="px-4 py-3">Associated Contact</th>
              <th className={thClass} onClick={() => handleSort('status')}>
                <span className="flex items-center">Status <SortIcon col="status" sortCol={sortCol} sortDir={sortDir} /></span>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sorted.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-10 text-center text-gray-400 text-sm">
                  No tasks found. Create your first task to get started.
                </td>
              </tr>
            )}
            {paged.map(task => {
              const contact = task.contactId ? state.contacts.find(c => c.id === task.contactId) : null;
              const due = formatDueDate(task.dueDate);
              const isCompleted = task.status === 'completed';
              return (
                <tr key={task.id} className={`hover:bg-gray-50 group transition-colors ${isCompleted ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleComplete(task.id)}
                      className="rounded border-gray-300 text-xubspot focus:ring-xubspot cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium text-sm text-xubspot-text ${isCompleted ? 'line-through' : ''}`}>
                      {task.title}
                    </span>
                    {task.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{task.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 capitalize">
                      {TYPE_ICONS[task.type]}
                      {task.type === 'to_do' ? 'To-do' : task.type}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {typeof due === 'object' ? (
                      <span className={due.className}>{due.text}</span>
                    ) : (
                      <span className="text-gray-500">{due}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${PRIORITY_COLORS[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                      {task.priority || 'none'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {contact ? `${contact.firstName} ${contact.lastName}` : <span className="text-gray-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-600'}`}>
                      {task.status === 'not_started' ? 'Not Started' : task.status === 'in_progress' ? 'In Progress' : 'Completed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(task)}
                        className="p-1 text-gray-400 hover:text-xubspot"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalTasks > PAGE_SIZE && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
            <span>Showing {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, totalTasks)} of {totalTasks} tasks</span>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">&lt; Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded text-xs font-medium ${page === p ? 'bg-xubspot text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>{p}</button>;
              })}
              <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">Next &gt;</button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
          <div className="bg-white h-full w-full max-w-md shadow-xl flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{editTask ? 'Edit Task' : 'Create Task'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="to_do">To-do</option>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.owner}
                  onChange={e => setForm({ ...form, owner: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot resize-none"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Add notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Associate with Contact</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.contactId}
                  onChange={e => setForm({ ...form, contactId: e.target.value })}
                >
                  <option value="">None</option>
                  {state.contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Associate with Company</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.companyId}
                  onChange={e => setForm({ ...form, companyId: e.target.value })}
                >
                  <option value="">None</option>
                  {state.companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Associate with Deal</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-xubspot focus:border-xubspot"
                  value={form.dealId}
                  onChange={e => setForm({ ...form, dealId: e.target.value })}
                >
                  <option value="">None</option>
                  {state.deals.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-xubspot text-white rounded text-sm hover:bg-xubspot-hover"
                >
                  {editTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete task "{deleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
