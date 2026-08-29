import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { Search, Plus, MoreHorizontal, Trash2, PenTool, FileText, Share2, X, Lock } from 'lucide-react';

const Templates = () => {
  const { state, deleteTemplate, createFromTemplate } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const templates = state.templates.filter(t => {
    if (!searchQuery.trim()) return true;
    return t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleUseTemplate = (templateId) => {
    setMenuOpen(null);
    const newId = createFromTemplate(templateId, []);
    if (newId) navigate(`/prepare/${newId}`);
  };

  const handleDeleteTemplate = (id) => {
    deleteTemplate(id);
    setConfirmDelete(null);
    setMenuOpen(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Templates</h1>
        <button
          onClick={() => navigate('/templates/new/edit')}
          className="bg-[#1A3763] hover:bg-[#15305a] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search templates..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Template Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Times Used</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shared</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {templates.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  {searchQuery ? 'No templates match your search' : 'No templates yet. Create one to get started.'}
                </td>
              </tr>
            ) : (
              templates.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{t.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{state.user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {t.lastUsedAt ? formatDistanceToNow(new Date(t.lastUsedAt), { addSuffix: true }) : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.usageCount}</td>
                  <td className="px-4 py-3">
                    {t.shared ? (
                      <Share2 className="w-4 h-4 text-blue-500" title="Shared" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" title="Private" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === t.id ? null : t.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuOpen === t.id && (
                      <div className="absolute right-4 top-full mt-1 w-44 bg-white border rounded-lg shadow-lg z-20">
                        <button
                          onClick={() => handleUseTemplate(t.id)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <PenTool className="w-4 h-4" /> Use
                        </button>
                        <button
                          onClick={() => { setMenuOpen(null); navigate(`/templates/${t.id}/edit`); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => { setMenuOpen(null); setConfirmDelete(t.id); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Delete Template</h3>
              <button onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">Are you sure you want to delete this template? This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">Cancel</button>
              <button onClick={() => handleDeleteTemplate(confirmDelete)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
