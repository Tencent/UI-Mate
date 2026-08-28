import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Star, GitFork, Clock, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { state, updateState } = useStore();
  const { search } = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setIsModalOpen(false);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  const handleCreateProject = (e) => {
    e.preventDefault();
    const newProject = {
      id: state.projects.length + 1,
      name: newProjectName,
      description: "No description provided.",
      visibility: "private",
      stars: 0,
      forks: 0,
      updatedAt: new Date().toISOString(),
      branches: ["main"],
      files: [{ name: "README.md", type: "file", content: `# ${newProjectName}` }]
    };
    
    updateState(prev => ({ projects: [...prev.projects, newProject] }));
    setIsModalOpen(false);
    setNewProjectName('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-xitlab-info text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      <div className="grid gap-4">
        {state.projects.map(project => (
          <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all hover:shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl font-bold text-gray-500 uppercase">
                  {project.name.charAt(0)}
                </div>
                <div>
                  <Link to={`/projects/${project.id}${search || ''}`} className="text-lg font-bold text-gray-800 hover:text-blue-600 hover:underline">
                    {state.currentUser.username} / {project.name}
                  </Link>
                  <p className="text-gray-500 text-sm mt-1">{project.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Star size={12} /> {project.stars}</span>
                    <span className="flex items-center gap-1"><GitFork size={12} /> {project.forks}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> Updated {formatDistanceToNow(new Date(project.updatedAt))} ago</span>
                    <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-xs font-medium">{project.visibility}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="my-awesome-project"
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
