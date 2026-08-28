import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { FileText, Folder, Download, History, GitBranch } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const FileTreeItem = ({ item, depth = 0, onSelectFile, selectedFile }) => {
  const isSelected = selectedFile?.name === item.name && item.type === 'file';

  return (
    <div>
      <div 
        onClick={() => item.type === 'file' && onSelectFile(item)}
        className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 border-b border-gray-100 text-sm cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {item.type === 'folder' ? (
          <Folder size={16} className="text-blue-400 fill-current" />
        ) : (
          <FileText size={16} className="text-gray-400" />
        )}
        <span className="text-gray-700">{item.name}</span>
        <span className="ml-auto text-xs text-gray-400">Last commit 2 days ago</span>
      </div>
      {item.children && item.children.map((child, idx) => (
        <FileTreeItem key={idx} item={child} depth={depth + 1} onSelectFile={onSelectFile} selectedFile={selectedFile} />
      ))}
    </div>
  );
};

export default function ProjectOverview() {
  const { projectId } = useParams();
  const { state } = useStore();
  const project = state.projects.find(p => p.id === parseInt(projectId));
  const [selectedBranch, setSelectedBranch] = useState(project?.branches?.[0] || 'main');
  const [selectedFile, setSelectedFile] = useState(null);

  if (!project) return <div>Project not found</div>;

  const readme = project.files.find(f => f.name === 'README.md');
  const previewFile = selectedFile || readme;
  const branches = project.branches?.length ? project.branches : ['main'];

  const downloadProject = () => {
    const payload = JSON.stringify({
      project: project.name,
      branch: selectedBranch,
      files: project.files
    }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name}-${selectedBranch}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-500 mt-1">Project ID: {project.id}</p>
        </div>
        <div className="flex gap-2">
           <label className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
             <GitBranch size={14} />
             <select value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)} className="bg-transparent outline-none">
               {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
             </select>
           </label>
           <button onClick={downloadProject} className="flex items-center gap-2 px-3 py-1.5 bg-xitlab-info text-white rounded text-sm font-medium hover:bg-blue-700">
             <Download size={14} />
             <span>Code</span>
           </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm">
            <img src={state.currentUser.avatarUrl} className="w-6 h-6 rounded-full" />
            <span className="font-medium text-blue-600">Last Commit</span>
            <span className="text-gray-500">Update README.md</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded">
             <History size={12} />
             <span>a1b2c3d</span>
          </div>
        </div>
        <div>
          {project.files.map((file, idx) => (
            <FileTreeItem key={idx} item={file} onSelectFile={setSelectedFile} selectedFile={previewFile} />
          ))}
        </div>
      </div>

      {previewFile && (
        <div className="border border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-sm flex items-center gap-2">
            <FileText size={16} /> {previewFile.name}
          </div>
          <div className="p-8 prose max-w-none">
            {previewFile.name.endsWith('.md') ? (
              <ReactMarkdown>{previewFile.content}</ReactMarkdown>
            ) : (
              <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100"><code>{previewFile.content}</code></pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
