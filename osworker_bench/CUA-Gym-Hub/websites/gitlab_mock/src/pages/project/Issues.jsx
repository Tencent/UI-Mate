import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Plus, MoreHorizontal } from 'lucide-react';

const IssueCard = ({ issue, onDragStart }) => (
  <div 
    draggable
    onDragStart={(e) => onDragStart(e, issue.id)}
    className="bg-white p-3 rounded shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow mb-3"
  >
    <h4 className="font-medium text-gray-900 text-sm mb-1">{issue.title}</h4>
    <div className="flex items-center gap-2 mb-2">
      {issue.labels.map(label => (
        <span key={label} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-medium uppercase">{label}</span>
      ))}
    </div>
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span>#{issue.id}</span>
      {issue.assignee && (
        <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-[10px]">
          {issue.assignee.charAt(0)}
        </div>
      )}
    </div>
  </div>
);

export default function Issues() {
  const { projectId } = useParams();
  const { state, updateState } = useStore();
  const issues = state.issues.filter(i => i.projectId === parseInt(projectId));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', description: '', labels: 'bug' });

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setIsModalOpen(false);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('issueId', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const issueId = parseInt(e.dataTransfer.getData('issueId'));
    updateState(prev => ({
      issues: prev.issues.map(i => i.id === issueId ? { ...i, status } : i)
    }));
  };

  const columns = [
    { id: 'open', title: 'Open', color: 'border-gray-300' },
    { id: 'in_progress', title: 'In Progress', color: 'border-blue-400' },
    { id: 'closed', title: 'Done', color: 'border-green-400' }
  ];

  const createIssue = (event) => {
    event.preventDefault();
    const issue = {
      id: Math.max(0, ...state.issues.map(item => item.id)) + 1,
      projectId: parseInt(projectId),
      title: newIssue.title,
      description: newIssue.description,
      status: 'open',
      labels: newIssue.labels.split(',').map(label => label.trim()).filter(Boolean),
      assignee: state.currentUser.name
    };
    updateState(prev => ({ issues: [...prev.issues, issue] }));
    setNewIssue({ title: '', description: '', labels: 'bug' });
    setIsModalOpen(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Issue Board</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-xitlab-info text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus size={16} /> New Issue
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => (
          <div 
            key={col.id} 
            className="min-w-[300px] w-[300px] bg-gray-100 rounded-lg flex flex-col h-full max-h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className={`p-3 font-bold text-gray-700 flex justify-between items-center border-t-4 ${col.color} bg-gray-200 rounded-t-lg`}>
              <span>{col.title}</span>
              <span className="bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {issues.filter(i => i.status === col.id).length}
              </span>
            </div>
            <div className="p-2 flex-1 overflow-y-auto">
              {issues.filter(i => i.status === col.id).map(issue => (
                <IssueCard key={issue.id} issue={issue} onDragStart={handleDragStart} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">New Issue</h2>
            <form onSubmit={createIssue}>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input required value={newIssue.title} onChange={(event) => setNewIssue(prev => ({ ...prev, title: event.target.value }))} className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea value={newIssue.description} onChange={(event) => setNewIssue(prev => ({ ...prev, description: event.target.value }))} className="mb-4 h-28 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <label className="mb-1 block text-sm font-medium text-gray-700">Labels</label>
              <input value={newIssue.labels} onChange={(event) => setNewIssue(prev => ({ ...prev, labels: event.target.value }))} className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="rounded bg-xitlab-info px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create issue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
