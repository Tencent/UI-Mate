import React from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Flag, Calendar } from 'lucide-react';

export default function Milestones() {
  const { projectId } = useParams();
  const { state } = useStore();
  const milestones = state.milestones.filter(m => m.projectId === parseInt(projectId));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Milestones</h1>
        <button className="bg-xitlab-info text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          New Milestone
        </button>
      </div>

      <div className="space-y-4">
        {milestones.map(m => (
          <div key={m.id} className="bg-white border border-gray-200 rounded-lg p-4">
             <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800">{m.title}</h3>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                   <Calendar size={14} /> Due {m.dueDate}
                </div>
             </div>
             <div className="mb-2">
               <div className="flex justify-between text-xs text-gray-500 mb-1">
                 <span>Progress</span>
                 <span>{m.progress}%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                 <div className="bg-green-500 h-2 rounded-full" style={{ width: `${m.progress}%` }}></div>
               </div>
             </div>
             <div className="flex gap-4 text-sm text-gray-500 mt-3">
                <span><strong>12</strong> Issues</span>
                <span><strong>5</strong> Merge Requests</span>
                <span className="text-green-600"><strong>3</strong> Closed</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}