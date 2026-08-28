import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../store';
import ReactMarkdown from 'react-markdown';
import { Edit, Save } from 'lucide-react';

export default function Wiki() {
  const { projectId } = useParams();
  const { state, updateState } = useStore();
  const pages = state.wiki.filter(p => p.projectId === parseInt(projectId));
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const selectedPage = pages.find(p => p.id === selectedPageId);

  const handleEdit = () => {
    setEditContent(selectedPage.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateState(prev => ({
      wiki: prev.wiki.map(p => p.id === selectedPageId ? { ...p, content: editContent } : p)
    }));
    setIsEditing(false);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className="w-64 border-r border-gray-200 pr-4">
        <h3 className="font-bold text-gray-900 mb-4 px-2">Pages</h3>
        <nav className="space-y-1">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => { setSelectedPageId(page.id); setIsEditing(false); }}
              className={`w-full text-left px-3 py-2 rounded text-sm ${
                selectedPageId === page.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page.title}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedPage ? (
          <>
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <h1 className="text-2xl font-bold text-gray-900">{selectedPage.title}</h1>
              {isEditing ? (
                <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">
                  <Save size={16} /> Save
                </button>
              ) : (
                <button onClick={handleEdit} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 px-3 py-1.5 border border-gray-300 rounded text-sm">
                  <Edit size={16} /> Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea 
                className="w-full h-[500px] border border-gray-300 rounded p-4 font-mono text-sm focus:outline-none focus:border-blue-500"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            ) : (
              <div className="prose max-w-none">
                <ReactMarkdown>{selectedPage.content}</ReactMarkdown>
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500 text-center mt-20">Select a page to view</div>
        )}
      </div>
    </div>
  );
}