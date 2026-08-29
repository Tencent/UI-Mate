import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../store';
import { CheckCircle2, XCircle, PlayCircle, Clock, ChevronRight, Terminal } from 'lucide-react';

export default function PipelineDetail() {
  const { projectId, pipelineId } = useParams();
  const { state } = useStore();
  const pipeline = state.pipelines.find(p => p.id === parseInt(pipelineId));
  const [selectedJob, setSelectedJob] = useState(null);

  if (!pipeline) return <div>Pipeline not found</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <h1 className="text-2xl font-bold text-gray-800">Pipeline #{pipeline.id}</h1>
             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
               pipeline.status === 'success' ? 'bg-green-100 text-green-700' :
               pipeline.status === 'failed' ? 'bg-red-100 text-red-700' :
               'bg-blue-100 text-blue-700'
             }`}>{pipeline.status}</span>
          </div>
          <p className="text-gray-500 flex items-center gap-2 text-sm">
            <span className="font-mono bg-gray-100 px-1 rounded">{pipeline.commit}</span>
            <span>{pipeline.message}</span>
          </p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Graph */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex items-start gap-8 min-w-max p-4">
            {pipeline.stages.map((stage, stageIdx) => (
              <div key={stage.id} className="flex items-center gap-8">
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">{stage.name}</div>
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 space-y-2">
                    {stage.jobs.map(job => (
                      <button 
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`w-full flex items-center justify-between p-3 rounded border transition-all ${
                          selectedJob?.id === job.id 
                            ? 'border-blue-500 ring-1 ring-blue-500 bg-white shadow-sm' 
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        <span className="font-medium text-sm text-gray-700">{job.name}</span>
                        {job.status === 'success' && <CheckCircle2 size={16} className="text-green-500" />}
                        {job.status === 'failed' && <XCircle size={16} className="text-red-500" />}
                        {job.status === 'running' && <PlayCircle size={16} className="text-blue-500 animate-pulse" />}
                        {job.status === 'pending' && <Clock size={16} className="text-gray-400" />}
                      </button>
                    ))}
                  </div>
                </div>
                {stageIdx < pipeline.stages.length - 1 && (
                   <div className="h-px w-8 bg-gray-300 mt-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Console Output Sidebar */}
        {selectedJob && (
          <div className="w-[500px] flex flex-col border border-gray-800 rounded-lg overflow-hidden bg-[#1e1e1e] shadow-xl">
            <div className="bg-[#252526] px-4 py-2 flex justify-between items-center border-b border-gray-700">
              <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                <Terminal size={14} />
                {selectedJob.name}
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-gray-500 hover:text-white"
              >
                <XCircle size={16} />
              </button>
            </div>
            <div className="flex-1 p-4 font-mono text-xs text-gray-300 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
              {selectedJob.logs ? selectedJob.logs : (
                <>
                  <span className="text-green-400">$</span> preparing environment...{'\n'}
                  <span className="text-green-400">$</span> git clone repository...{'\n'}
                  Cloning into 'project'...{'\n'}
                  <span className="text-green-400">$</span> npm install{'\n'}
                  added 123 packages in 5s{'\n'}
                  <span className="text-green-400">$</span> npm run {selectedJob.name.split('-')[0]}{'\n'}
                  {'> project@0.0.0 '}{selectedJob.name.split('-')[0]}{'\n'}
                  {'> vite '}{selectedJob.name.split('-')[0]}{'\n'}
                  {'\n'}
                  {selectedJob.status === 'success' ? (
                    <span className="text-green-500">Job succeeded</span>
                  ) : selectedJob.status === 'failed' ? (
                    <span className="text-red-500">Job failed with exit code 1</span>
                  ) : (
                    <span className="text-blue-400">Running...</span>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
