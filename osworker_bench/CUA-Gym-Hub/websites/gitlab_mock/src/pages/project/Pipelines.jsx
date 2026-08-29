import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import { CheckCircle2, XCircle, Clock, PlayCircle, RotateCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StatusBadge = ({ status }) => {
  const config = {
    success: { icon: CheckCircle2, color: 'text-green-500', bg: 'border-green-200 bg-green-50' },
    failed: { icon: XCircle, color: 'text-red-500', bg: 'border-red-200 bg-red-50' },
    running: { icon: PlayCircle, color: 'text-blue-500', bg: 'border-blue-200 bg-blue-50' },
    pending: { icon: Clock, color: 'text-gray-500', bg: 'border-gray-200 bg-gray-50' }
  };
  
  const { icon: Icon, color, bg } = config[status] || config.pending;

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${bg} ${color}`}>
      <Icon size={14} />
      <span className="capitalize">{status}</span>
    </span>
  );
};

export default function Pipelines() {
  const { projectId } = useParams();
  const { search } = useLocation();
  const { state, updateState } = useStore();
  const pipelines = state.pipelines.filter(p => p.projectId === parseInt(projectId));
  const project = state.projects.find(p => p.id === parseInt(projectId));

  const createPipeline = (source = null) => {
    const nextId = Math.max(0, ...state.pipelines.map(pipeline => pipeline.id)) + 1;
    const branch = source?.branch || project?.branches?.[0] || 'main';
    const pipeline = {
      id: nextId,
      projectId: parseInt(projectId),
      status: 'running',
      branch,
      commit: Math.random().toString(16).slice(2, 9),
      message: source ? `retry: ${source.message}` : `ci: run pipeline for ${branch}`,
      duration: '0s',
      createdAt: new Date().toISOString(),
      stages: [
        { id: nextId * 10 + 1, name: 'build', status: 'running', jobs: [{ id: nextId * 100 + 1, name: 'build', status: 'running', duration: '0s' }] },
        { id: nextId * 10 + 2, name: 'test', status: 'pending', jobs: [{ id: nextId * 100 + 2, name: 'test', status: 'pending', duration: '0s' }] },
        { id: nextId * 10 + 3, name: 'deploy', status: 'pending', jobs: [{ id: nextId * 100 + 3, name: 'deploy', status: 'pending', duration: '0s' }] }
      ]
    };
    updateState(prev => ({ pipelines: [pipeline, ...prev.pipelines] }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pipelines</h1>
        <button onClick={() => createPipeline()} className="bg-xitlab-info text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          Run Pipeline
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Pipeline</th>
              <th className="px-6 py-3 font-medium">Commit</th>
              <th className="px-6 py-3 font-medium">Stages</th>
              <th className="px-6 py-3 font-medium">Duration</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pipelines.map(pipeline => (
              <tr key={pipeline.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link to={`${pipeline.id}${search || ''}`}>
                    <StatusBadge status={pipeline.status} />
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <Link to={`${pipeline.id}${search || ''}`} className="font-medium text-gray-900 hover:text-blue-600">
                    #{pipeline.id}
                  </Link>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                     by {state.currentUser.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded w-fit mb-1">{pipeline.commit}</span>
                    <span className="text-gray-600 truncate max-w-[200px]">{pipeline.message}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {pipeline.stages.map((stage, idx) => (
                      <div key={idx} className="group relative">
                        <div className={`w-3 h-3 rounded-full ${
                          stage.status === 'success' ? 'bg-green-500' :
                          stage.status === 'failed' ? 'bg-red-500' :
                          stage.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                        }`}></div>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          {stage.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {pipeline.duration}
                  </div>
                  <div className="text-xs mt-1">
                    {formatDistanceToNow(new Date(pipeline.createdAt))} ago
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => createPipeline(pipeline)} className="p-2 text-gray-500 hover:bg-gray-100 rounded border border-gray-200 hover:border-gray-300" title="Retry pipeline">
                    <RotateCw size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
