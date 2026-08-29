import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { FileText, Users, Settings } from 'lucide-react';

export const SpaceView = () => {
  const { spaceId } = useParams();
  const { state } = useStore();
  
  const space = state.spaces.find(s => s.id === spaceId);
  const pages = state.pages.filter(p => p.spaceId === spaceId);
  const recentPages = [...pages].sort((a, b) => new Date(b.updated) - new Date(a.updated)).slice(0, 5);

  if (!space) return <div>Space not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-3xl font-bold shadow-md">
          {space.key[0]}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{space.name}</h1>
          <p className="text-gray-500">{space.description || 'No description provided.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-500" /> Overview
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Key:</strong> {space.key}</p>
            <p><strong>Pages:</strong> {pages.length}</p>
            <p><strong>Created by:</strong> Admin</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
           <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Users size={18} className="text-green-500" /> Team
          </h3>
          <div className="flex -space-x-2">
            {state.users.map(u => (
              <img key={u.id} src={u.avatar} className="w-8 h-8 rounded-full border-2 border-white" title={u.displayName} />
            ))}
            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
              +2
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Pages</h2>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {recentPages.map(page => (
          <Link 
            key={page.id} 
            to={`/spaces/${spaceId}/pages/${page.id}`}
            className="block p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-blue-600 mb-1">{page.title}</div>
            <div className="text-xs text-gray-500">
              Updated {new Date(page.updated).toLocaleDateString()} by {state.users.find(u => u.id === page.authorId)?.displayName}
            </div>
          </Link>
        ))}
        {recentPages.length === 0 && (
          <div className="p-8 text-center text-gray-400 italic">
            No pages created yet.
          </div>
        )}
      </div>
    </div>
  );
};
