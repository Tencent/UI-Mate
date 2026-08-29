import React from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { GitPullRequest, Check, ThumbsUp } from 'lucide-react';

export default function MergeRequestDetail() {
  const { projectId, mrId } = useParams();
  const { state, updateState } = useStore();
  const mr = state.mergeRequests.find(m => m.id === parseInt(mrId));

  if (!mr) return <div>Merge Request not found</div>;

  const handleMerge = () => {
    updateState(prev => ({
      mergeRequests: prev.mergeRequests.map(m => 
        m.id === mr.id ? { ...m, status: 'merged' } : m
      )
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{mr.title} <span className="text-gray-400 font-normal">!{mr.id}</span></h1>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded font-bold text-white ${
              mr.status === 'open' ? 'bg-green-500' : 
              mr.status === 'merged' ? 'bg-blue-500' : 'bg-red-500'
            } uppercase text-xs`}>{mr.status}</span>
            <span className="text-gray-600">
              Opened by <strong>{mr.author}</strong> • {new Date(mr.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
               <Check size={20} />
            </div>
            <div>
               <div className="font-bold text-gray-900">Ready to merge!</div>
               <div className="text-sm text-gray-500">Pipeline passed. No conflicts.</div>
            </div>
         </div>
         {mr.status === 'open' && (
           <button 
             onClick={handleMerge}
             className="bg-xitlab-info text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
           >
             Merge
           </button>
         )}
         {mr.status === 'merged' && (
           <div className="text-blue-600 font-bold flex items-center gap-2">
             <GitPullRequest size={20} /> Merged
           </div>
         )}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-medium text-sm flex justify-between">
           <span>Changes</span>
           <span className="text-gray-500">Showing 1 file</span>
        </div>
        <div className="p-0">
          <div className="border-b border-gray-100 px-4 py-2 bg-white text-sm font-mono text-gray-700">
            src/components/Login.jsx
          </div>
          <div className="font-mono text-sm bg-white overflow-x-auto">
             <div className="flex">
               <div className="w-10 bg-gray-50 text-right pr-2 text-gray-400 select-none border-r border-gray-200 py-1">1</div>
               <div className="flex-1 px-4 py-1 text-gray-400">{'  const Login = () => {'}</div>
             </div>
             <div className="flex bg-red-50">
               <div className="w-10 bg-red-100 text-right pr-2 text-gray-400 select-none border-r border-gray-200 py-1">2</div>
               <div className="flex-1 px-4 py-1 text-red-900">{'-   return <div>Login</div>;'}</div>
             </div>
             <div className="flex bg-green-50">
               <div className="w-10 bg-green-100 text-right pr-2 text-gray-400 select-none border-r border-gray-200 py-1">2</div>
               <div className="flex-1 px-4 py-1 text-green-900">{'+   return <div><LoginForm /></div>;'}</div>
             </div>
             <div className="flex">
               <div className="w-10 bg-gray-50 text-right pr-2 text-gray-400 select-none border-r border-gray-200 py-1">3</div>
               <div className="flex-1 px-4 py-1 text-gray-400">  {'}'}</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
