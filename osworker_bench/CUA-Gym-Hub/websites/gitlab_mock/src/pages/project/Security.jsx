import React from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Security() {
  const { projectId } = useParams();
  const { state, updateState } = useStore();
  const vulns = state.vulnerabilities.filter(v => v.projectId === parseInt(projectId));
  const createSecurityIssue = (vulnerability) => {
    const issueId = Math.max(0, ...state.issues.map(issue => issue.id)) + 1;
    updateState(prev => ({
      issues: [...prev.issues, {
        id: issueId,
        projectId: parseInt(projectId),
        title: `Investigate vulnerability: ${vulnerability.name}`,
        description: `Created from security finding #${vulnerability.id}. Severity: ${vulnerability.severity}.`,
        status: 'open',
        labels: ['security', vulnerability.severity],
        assignee: prev.currentUser.name
      }],
      vulnerabilities: prev.vulnerabilities.map(item => item.id === vulnerability.id ? { ...item, status: 'issue_created', issueId } : item)
    }));
  };

  const severityColor = (sev) => {
    switch(sev) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      default: return 'text-blue-700 bg-blue-100 border-blue-200';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Security Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
         <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm font-medium uppercase">Critical</div>
            <div className="text-3xl font-bold text-red-600 mt-1">{vulns.filter(v => v.severity === 'critical').length}</div>
         </div>
         <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm font-medium uppercase">High</div>
            <div className="text-3xl font-bold text-orange-600 mt-1">{vulns.filter(v => v.severity === 'high').length}</div>
         </div>
         <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm font-medium uppercase">Medium</div>
            <div className="text-3xl font-bold text-yellow-600 mt-1">{vulns.filter(v => v.severity === 'medium').length}</div>
         </div>
         <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-sm font-medium uppercase">Low</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">{vulns.filter(v => v.severity === 'low').length}</div>
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-700">Detected Vulnerabilities</div>
        <div className="divide-y divide-gray-100">
          {vulns.map(v => (
            <div key={v.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
               <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${severityColor(v.severity)}`}>
                    {v.severity}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">{v.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">Detected in source code analysis</div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                 {v.status === 'detected' ? (
                   <button onClick={() => createSecurityIssue(v)} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">Create Issue</button>
                 ) : v.status === 'issue_created' ? (
                   <span className="flex items-center gap-1 text-blue-600 text-sm font-medium"><ShieldAlert size={14} /> Issue #{v.issueId}</span>
                 ) : (
                   <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><CheckCircle size={14} /> Resolved</span>
                 )}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
