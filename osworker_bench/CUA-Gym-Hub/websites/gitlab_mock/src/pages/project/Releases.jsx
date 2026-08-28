import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Tag, Plus, Box } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Releases() {
  const { projectId } = useParams();
  const { state, updateState } = useStore();
  const releases = state.releases ? state.releases.filter(r => r.projectId === parseInt(projectId)) : [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRelease, setNewRelease] = useState({ tagName: '', name: '', description: '' });

  const handleCreateRelease = (e) => {
    e.preventDefault();
    const release = {
      id: (state.releases?.length || 0) + 1,
      projectId: parseInt(projectId),
      tagName: newRelease.tagName,
      name: newRelease.name,
      description: newRelease.description,
      createdAt: new Date().toISOString(),
      author: state.currentUser.name
    };
    
    updateState(prev => ({ 
      releases: [...(prev.releases || []), release] 
    }));
    setIsModalOpen(false);
    setNewRelease({ tagName: '', name: '', description: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Releases</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-xitlab-info text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> New Release
        </button>
      </div>

      <div className="space-y-6">
        {releases.map(release => (
          <div key={release.id} className="flex gap-6">
             <div className="w-48 flex-shrink-0 text-right pt-2">
                <div className="text-sm font-bold text-gray-900">{release.tagName}</div>
                <div className="text-xs text-gray-500 flex items-center justify-end gap-1 mt-1">
                   <Tag size={12} />
                   <span>{formatDistanceToNow(new Date(release.createdAt))} ago</span>
                </div>
             </div>
             <div className="flex-1 border border-gray-200 rounded-lg bg-white">
                <div className="p-4 border-b border-gray-100">
                   <h2 className="text-xl font-bold text-gray-800">{release.name}</h2>
                   <div className="flex items-center gap-2 mt-2">
                      <img src={state.currentUser.avatarUrl} className="w-5 h-5 rounded-full" />
                      <span className="text-sm text-gray-600">Released by <strong>{release.author}</strong></span>
                   </div>
                </div>
                <div className="p-4">
                   <p className="text-gray-700 whitespace-pre-wrap">{release.description}</p>
                   
                   <div className="mt-6">
                      <h3 className="text-sm font-bold text-gray-900 uppercase mb-2">Assets</h3>
                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer">
                            <Box size={16} /> Source code (zip)
                         </div>
                         <div className="flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer">
                            <Box size={16} /> Source code (tar.gz)
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        ))}
        {releases.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
             <Tag size={48} className="mx-auto mb-4 text-gray-300" />
             <h3 className="text-lg font-medium text-gray-900">No releases yet</h3>
             <p className="mt-1">Create a release to package your software.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Release</h2>
            <form onSubmit={handleCreateRelease}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
                <input 
                  type="text" 
                  required
                  value={newRelease.tagName}
                  onChange={(e) => setNewRelease({...newRelease, tagName: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="v1.0.0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Release Title</label>
                <input 
                  type="text" 
                  required
                  value={newRelease.name}
                  onChange={(e) => setNewRelease({...newRelease, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="My Awesome Release"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  value={newRelease.description}
                  onChange={(e) => setNewRelease({...newRelease, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-24"
                  placeholder="Describe the release..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-white bg-xitlab-info hover:bg-blue-700 rounded-md"
                >
                  Create Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}