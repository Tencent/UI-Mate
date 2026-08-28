import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { ArrowRight, GitPullRequest } from 'lucide-react';

export default function CreateMergeRequest() {
  const { projectId } = useParams();
  const { state, updateState } = useStore();
  const navigate = useNavigate();
  const project = state.projects.find(p => p.id === parseInt(projectId));
  
  const [sourceBranch, setSourceBranch] = useState(project?.branches?.[0] || '');
  const [targetBranch, setTargetBranch] = useState('main');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  if (!project) return <div>Project not found</div>;

  const handleCompare = () => {
    if (sourceBranch && targetBranch && sourceBranch !== targetBranch) {
      setShowDiff(true);
      setTitle(`Merge ${sourceBranch} into ${targetBranch}`);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const newMr = {
      id: (state.mergeRequests?.length || 0) + 1,
      projectId: parseInt(projectId),
      title,
      description,
      sourceBranch,
      targetBranch,
      status: 'open',
      author: state.currentUser.name,
      createdAt: new Date().toISOString(),
      reviewers: []
    };

    updateState(prev => ({
      mergeRequests: [...(prev.mergeRequests || []), newMr]
    }));

    navigate(`../${newMr.id}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Merge Request</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">Source branch</label>
            <select 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={sourceBranch}
              onChange={(e) => { setSourceBranch(e.target.value); setShowDiff(false); }}
            >
              {project.branches?.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="pb-3 text-gray-400">
            <ArrowRight size={20} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">Target branch</label>
            <select 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={targetBranch}
              onChange={(e) => { setTargetBranch(e.target.value); setShowDiff(false); }}
            >
              {project.branches?.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleCompare}
            disabled={sourceBranch === targetBranch}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-[38px]"
          >
            Compare branches
          </button>
        </div>

        {showDiff && (
          <div className="border-t border-gray-200 pt-6">
             <h3 className="text-lg font-bold text-gray-800 mb-4">New Merge Request</h3>
             <form onSubmit={handleCreate}>
               <div className="mb-4">
                 <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                 <input 
                   type="text" 
                   required
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                 />
               </div>
               <div className="mb-6">
                 <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                 <textarea 
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-32"
                 />
               </div>

               <div className="mb-6">
                 <h4 className="text-sm font-bold text-gray-700 mb-2">Changes</h4>
                 <div className="border border-gray-200 rounded overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-sm font-mono">
                      src/App.jsx
                    </div>
                    <div className="p-4 bg-white font-mono text-sm overflow-x-auto">
                       <div className="text-gray-400">  // ... existing code ...</div>
                       <div className="text-red-800 bg-red-50">- const oldFeature = true;</div>
                       <div className="text-green-800 bg-green-50">+ const newFeature = true;</div>
                       <div className="text-gray-400">  // ... existing code ...</div>
                    </div>
                 </div>
               </div>

               <div className="flex justify-end gap-2">
                 <button 
                   type="button"
                   onClick={() => navigate('..')} 
                   className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded flex items-center gap-2"
                 >
                   <GitPullRequest size={16} /> Create merge request
                 </button>
               </div>
             </form>
          </div>
        )}
      </div>
    </div>
  );
}