import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Database, Copy, Trash2 } from 'lucide-react';

export default function Registry() {
  const { projectId } = useParams();
  const { state, updateState } = useStore();
  const images = state.registry.filter(i => i.projectId === parseInt(projectId));
  const [copiedId, setCopiedId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (!pendingDelete) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && setPendingDelete(null);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pendingDelete]);

  const copyPullCommand = async (image) => {
    await navigator.clipboard?.writeText(`docker pull registry.gitlab-mock.com/${image.name}`);
    setCopiedId(image.id);
  };

  const deleteImage = (id) => {
    updateState(prev => ({
      registry: prev.registry.filter(i => i.id !== id)
    }));
    setPendingDelete(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Container Registry</h1>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Image Repository</th>
              <th className="px-6 py-3 font-medium">Tags</th>
              <th className="px-6 py-3 font-medium">Size</th>
              <th className="px-6 py-3 font-medium">Last Updated</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {images.map(image => (
              <tr key={image.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <Database size={16} className="text-gray-400" />
                    {image.name}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                     <div className="bg-gray-100 px-2 py-1 rounded border border-gray-200 font-mono text-xs text-gray-600 flex items-center gap-2">
                        docker pull registry.gitlab-mock.com/{image.name}
                        <button onClick={() => copyPullCommand(image)} className="text-gray-400 hover:text-gray-600" title="Copy pull command"><Copy size={12} /></button>
                     </div>
                     {copiedId === image.id && <span className="text-xs text-green-600">Copied</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {image.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{image.size}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(image.updatedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setPendingDelete(image)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                    title="Delete image"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {images.length === 0 && (
          <div className="p-8 text-center text-gray-500">No images found in registry.</div>
        )}
      </div>
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">Delete container image?</h2>
            <p className="mt-2 text-sm text-gray-600">This removes {pendingDelete.name} from the local registry for this sandbox session.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setPendingDelete(null)} className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
              <button onClick={() => deleteImage(pendingDelete.id)} className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete image</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
