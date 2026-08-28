import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { IssueStatus, Priority } from '../types';

interface BulkEditModalProps {
  selectedIssueIds: Set<string>;
  onClose: () => void;
  onComplete: () => void;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({ selectedIssueIds, onClose, onComplete }) => {
  const { state, dispatch } = useStore();
  const [fieldToUpdate, setFieldToUpdate] = useState<'status' | 'assigneeId' | 'priority' | 'sprintId'>('status');
  const [value, setValue] = useState<string>('');

  const handleSave = () => {
    if (!value) return;

    selectedIssueIds.forEach(id => {
      const issue = state.issues.find(i => i.id === id);
      if (issue) {
        const updatedIssue = { ...issue, [fieldToUpdate]: value === 'null' ? null : value, updatedAt: new Date().toISOString() };
        dispatch({ type: 'UPDATE_ISSUE', payload: updatedIssue });
      }
    });

    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Bulk Edit ({selectedIssueIds.size} issues)</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Field to Change</label>
            <select
              value={fieldToUpdate}
              onChange={(e) => {
                setFieldToUpdate(e.target.value as any);
                setValue(''); // Reset value when field changes
              }}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-xira-blue focus:border-transparent outline-none"
            >
              <option value="status">Status</option>
              <option value="assigneeId">Assignee</option>
              <option value="priority">Priority</option>
              <option value="sprintId">Sprint</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">New Value</label>
            
            {fieldToUpdate === 'status' && (
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select Status...</option>
                {['To Do', 'In Progress', 'In Review', 'Done'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}

            {fieldToUpdate === 'assigneeId' && (
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select Assignee...</option>
                <option value="null">Unassigned</option>
                {state.users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}

            {fieldToUpdate === 'priority' && (
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select Priority...</option>
                {['Highest', 'High', 'Medium', 'Low', 'Lowest'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}

            {fieldToUpdate === 'sprintId' && (
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select Sprint...</option>
                <option value="null">Backlog (No Sprint)</option>
                {state.sprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.state})</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded font-medium">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={!value}
              className="px-4 py-2 bg-xira-blue text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Confirm Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};