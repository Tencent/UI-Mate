import React from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import { GitPullRequest, MessageSquare, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MergeRequests() {
  const { projectId } = useParams();
  const { state } = useStore();
  const navigate = useNavigate();
  const { search } = useLocation();
  const mrs = state.mergeRequests.filter(mr => mr.projectId === parseInt(projectId));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Merge Requests</h1>
        <button 
          onClick={() => navigate(`new${search || ''}`)}
          className="bg-xitlab-info text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          New Merge Request
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex gap-4 text-sm">
          <button className="font-medium text-gray-900 border-b-2 border-orange-500 pb-2.5 -mb-3.5">Open</button>
          <button className="font-medium text-gray-500 hover:text-gray-800 pb-2.5 -mb-3.5">Merged</button>
          <button className="font-medium text-gray-500 hover:text-gray-800 pb-2.5 -mb-3.5">Closed</button>
          <button className="font-medium text-gray-500 hover:text-gray-800 pb-2.5 -mb-3.5">All</button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {mrs.map(mr => (
            <div key={mr.id} className="p-4 flex items-start gap-3 hover:bg-gray-50">
               <div className={`mt-1 ${mr.status === 'merged' ? 'text-blue-500' : mr.status === 'closed' ? 'text-red-500' : 'text-green-500'}`}>
                 <GitPullRequest size={20} />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between">
                    <Link to={`${mr.id}${search || ''}`} className="text-base font-bold text-gray-900 hover:text-blue-600 hover:underline">
                      {mr.title}
                    </Link>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                       <MessageSquare size={14} /> 0
                       <span className="text-xs">updated {formatDistanceToNow(new Date(mr.createdAt))} ago</span>
                    </div>
                 </div>
                 <div className="text-sm text-gray-500 mt-1">
                   !{mr.id} opened by <span className="text-gray-900 font-medium">{mr.author}</span>
                 </div>
                 <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-gray-600">{mr.sourceBranch}</span>
                    <span className="text-gray-400">→</span>
                    <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-mono text-gray-600">{mr.targetBranch}</span>
                 </div>
               </div>
            </div>
          ))}
          {mrs.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No merge requests found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
