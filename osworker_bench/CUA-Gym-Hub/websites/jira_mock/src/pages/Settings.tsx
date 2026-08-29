import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Breadcrumb } from '../components/Breadcrumb';

export const Settings: React.FC = () => {
  const { state, dispatch } = useStore();
  const project = state.projects[0];

  const [activeTab, setActiveTab] = useState<'details' | 'board'>('details');
  const [name, setName] = useState(project.name);
  const [leadId, setLeadId] = useState(project.leadId);
  const [category, setCategory] = useState(project.category);
  const [description, setDescription] = useState(project.description || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_PROJECT',
      payload: {
        ...project,
        name,
        leadId,
        category,
        description,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const columns = [
    { name: 'To Do', status: 'To Do', color: 'bg-gray-200' },
    { name: 'In Progress', status: 'In Progress', color: 'bg-blue-200' },
    { name: 'In Review', status: 'In Review', color: 'bg-cyan-200' },
    { name: 'Done', status: 'Done', color: 'bg-green-200' },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
      <Breadcrumb pageName="Settings" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Project Settings
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'details'
              ? 'border-xira-blue text-xira-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('board')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'board'
              ? 'border-xira-blue text-xira-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Board
        </button>
      </div>

      {activeTab === 'details' && (
        <div className="max-w-lg">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key
              </label>
              <input
                type="text"
                value={project.key}
                readOnly
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                The project key cannot be changed after creation.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead
              </label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none"
              >
                {state.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none"
              >
                <option value="Software">Software</option>
                <option value="Marketing">Marketing</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-xira-blue focus:ring-1 focus:ring-xira-blue outline-none resize-y min-h-[80px]"
                placeholder="Add a description for your project..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="bg-xira-blue text-white px-4 py-2 rounded font-medium text-sm hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              {saved && (
                <span className="text-sm text-xira-green font-medium">
                  Changes saved successfully
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'board' && (
        <div className="max-w-lg">
          <p className="text-sm text-gray-500 mb-4">
            Board columns are mapped to workflow statuses. Drag to reorder how
            they appear on the board.
          </p>
          <div className="space-y-2">
            {columns.map((col) => (
              <div
                key={col.status}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className={`w-3 h-3 rounded-full ${col.color}`} />
                <span className="text-sm font-medium text-gray-700 flex-1">
                  {col.name}
                </span>
                <span className="text-xs text-gray-400">
                  {col.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
